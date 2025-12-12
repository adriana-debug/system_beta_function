/**
 * AfterShip-first delivery tracking across channels.
 * Uses AfterShip movement recency (with auto-create on 404) to pick the latest tracking per order.
 * Entry point: emailAftershipLookupOrders (syncs + targeted email focused on stuck/delayed orders).
 */

// ---------------------------------------------------------------------------
// Local configuration (self-contained). Adjust values here as needed.
// Prefixed (AS_) to avoid clashing with other globals from Code.gs.
// ---------------------------------------------------------------------------
var AS_WEBSITE_URL = 'https://www.makeafort.fun';
var AS_WOO_KEY = 'ck_5665d29837492596ca23746282f4e53241c1ae4f';
var AS_WOO_SECRET = 'cs_ab4022d4285f6ca734ffec46e1b2ab1ae8cc6837';
var AS_AFTERSHIP_KEY = 'asat_e81ab4d68ce7461cbd897400754b1ed2';
var AS_CUSTOMER_NAME = 'Make A Fort Reports';
var AS_CHANNEL_IDS = [90, 85, 83, 91, 109, 89, 92, 116, 0, 113, 84];
var AS_DELIVERY_SHEET_NAME = 'Multi-Channel Delivery Tracking';
var AS_STALLED_LABEL_DAYS = 3;
var AS_WAREHOUSE_RECIPIENTS = [];
var AS_SPREADSHEET_ID = '1Dfl-MwrJ-CJ7CJ-OORVusXcqT_CAn9VgLjNZPQgVZBI';
var AS_CSR_SHEET_ID = '1EuHkU-3LwzPiljLZqUkSue17KKVCx6SrgOaWQIp4wLU';
var AS_CSR_SHEET_NAME = 'November';
var AS_DAYS_TO_CHECK = 30;
// Optional throttles (ms) for pacing Woo/AfterShip calls; 0 means use defaults in code.
var AS_AFTERSHIP_THROTTLE_MS = 0;
var AS_WOO_PAGE_THROTTLE_MS = 0;
// Window defaults for the windowed runner.
var AS_WINDOW_DAYS = 1; // smaller windows to reduce page count per slice
var AS_TOTAL_DAYS = 30; // total lookback span for windowed runner
var AS_MAX_PAGES_PER_WINDOW = 0; // 0 = no page cap per window (fetch all pages)
var AS_MAX_WINDOWS_PER_RUN = 3; // cap number of windows processed per execution

const AS_AFTERSHIP_LABEL_STUCK_HOURS = 48; // Flag labels with no movement after this many hours.

// Parse Woo order responses defensively (handles HTML/PHP notices around JSON).
function parseWooOrdersResponse(resp, page) {
  const body = resp.getContentText();
  const coerceArray = (val) => Array.isArray(val) ? val : (val && Array.isArray(val.data) ? val.data : []);
  if (!body || !String(body).trim()) return [];
  try {
    return coerceArray(JSON.parse(body));
  } catch (err) {
    const trimmed = String(body).trim();
    const start = trimmed.indexOf('[');
    const end = trimmed.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      try {
        return coerceArray(JSON.parse(candidate));
      } catch (err2) {
        // fall through
      }
    }
    console.warn(`Failed to parse Woo orders page ${page}: ${err.message}. Snippet: ${trimmed.slice(0, 400)}`);
    return [];
  }
}

// Parse AfterShip responses defensively (handles HTML/partial bodies).
function parseAftershipResponse(resp, carrierSlug, trackingNumber) {
  const body = resp.getContentText();
  if (!body || !String(body).trim()) return null;
  try {
    return JSON.parse(body);
  } catch (err) {
    const trimmed = String(body).trim();
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch (err2) {
        // fall through
      }
    }
    console.warn(`AfterShip parse failed for ${carrierSlug}/${trackingNumber}: ${err.message}. Snippet: ${trimmed.slice(0, 400)}`);
    return null;
  }
}

/**
 * Core runner for a single date window (internal; windowed runner calls this).
 */
function runDeliveryTrackingAftershipLookup(opts) {
  validateConfig();
  const cfg = getResolvedConfig();
  const deliverySheetName = (opts && opts.sheetName) ? opts.sheetName : cfg.deliverySheetName;
  const ignorePagingState = opts && opts.ignorePaging === true;
  const skipAuxSheets = opts && opts.skipAuxSheets === true;
  const aftershipThrottleMs = Math.max(0, Number(opts && opts.aftershipThrottleMs) || Number(cfg.aftershipThrottleMs) || 150);
  const pageThrottleMs = Math.max(0, Number(opts && opts.pageThrottleMs) || Number(cfg.pageThrottleMs) || 150);
  const hasCustomRange = opts && (typeof opts.fromDaysAgo !== 'undefined' || typeof opts.toDaysAgo !== 'undefined');
  const toDays = hasCustomRange ? Math.max(Number(opts.toDaysAgo) || 0, 0) : 0;
  const fromDays = hasCustomRange ? Math.max(Number(opts.fromDaysAgo) || cfg.daysToCheck || 7, toDays + 1) : Math.max(Number(cfg.daysToCheck) || 7, 1);
  const clearSheet = opts && opts.clearSheet === false ? false : true;
  const props = (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) ? PropertiesService.getScriptProperties() : null;
  const resumePageRaw = (props && !ignorePagingState) ? Number(props.getProperty('AFTERSHIP_NEXT_PAGE')) : 0;
  const resumePage = resumePageRaw && resumePageRaw > 1 ? resumePageRaw : 1;
  const maxPagesProp = (props && !ignorePagingState) ? Number(props.getProperty('AFTERSHIP_MAX_PAGES')) : 0;
  const maxPagesOpt = opts && typeof opts.maxPages !== 'undefined' ? Number(opts.maxPages) : 0;
  const maxPagesPerRun = maxPagesOpt > 0 ? maxPagesOpt : (maxPagesProp > 0 ? maxPagesProp : 0); // 0 = no cap
  const effectiveClear = clearSheet && resumePage === 1;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - fromDays);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - toDays);
  const modifiedAfter = startDate.toISOString();
  const modifiedBefore = endDate.toISOString();

  console.log(`AfterShip lookup sync start: window=${fromDays}-${toDays}d ago, site=${cfg.websiteUrl}, clearSheet=${effectiveClear}, resumePage=${resumePage}, maxPagesPerRun=${maxPagesPerRun || 'none'}`);

  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheet = ss.getSheetByName(deliverySheetName) || ss.insertSheet(deliverySheetName);
  const headers = getDeliveryHeaders();
  if (effectiveClear || sheet.getLastRow() === 0) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight("bold");
  } else if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight("bold");
  }

  const completedRows = [];
  const orderDetails = [];
  const missingTrackings = [];
  const autoCreateLog = [];
  const csrNotes = fetchCsrNotes(cfg);
  let page = resumePage;
  let totalPages = 1;
  let pagesFetched = 0;

  while (page <= totalPages && (!maxPagesPerRun || pagesFetched < maxPagesPerRun)) {
    const url = `${cfg.websiteUrl}/wp-json/wc/v3/orders?consumer_key=${cfg.wooKey}&consumer_secret=${cfg.wooSecret}&per_page=50&page=${page}&modified_after=${encodeURIComponent(modifiedAfter)}&modified_before=${encodeURIComponent(modifiedBefore)}&status=completed`;
    const resp = fetchWithRetry(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      const body = resp.getContentText();
      throw new Error(`Failed to fetch completed orders page ${page} (HTTP ${resp.getResponseCode()}) body=${body}`);
    }

    if (page === 1) {
      totalPages = parseInt(resp.getHeaders()["x-wp-totalpages"], 10) || 1;
    }

    const orders = parseWooOrdersResponse(resp, page) || [];
    console.log(`Fetched Woo page ${page}/${totalPages} (${orders.length} orders)`);
    for (const order of orders) {
      const channelId = Number(order.customer_id || 0);
      if (!cfg.amazonChannelIds.includes(channelId)) continue;

      const amazonOrderIdMeta = order.meta_data?.find((meta) => meta.key === "amzn_order_number");
      const amazonOrderId = amazonOrderIdMeta ? amazonOrderIdMeta.value : "";

      const trackingMeta = order.meta_data?.find((meta) => meta.key === "_wc_shipment_tracking_items");
      const trackingItems = (trackingMeta && Array.isArray(trackingMeta.value)) ? trackingMeta.value : [];
      if (!trackingItems.length) {
        console.warn(`Order ${order.id} missing tracking metadata or empty tracking items.`);
      }

      const resolvedTracking = resolveLatestTrackingWithAftership(trackingItems, order.id, amazonOrderId, cfg, autoCreateLog, aftershipThrottleMs);
      if (!resolvedTracking || !resolvedTracking.bestTracking) {
        missingTrackings.push({
          orderId: order.id,
          amazonOrderId,
          reason: !trackingItems.length
            ? 'No tracking items in WooCommerce'
            : 'No usable tracking after AfterShip lookup (missing carrier/number or invalid slug)'
        });
        continue;
      }

      const country = (order.shipping && order.shipping.country) || '';
      const stateCity = getStateOrCity(order.shipping);
      const { trackingNumber, carrier, trackingNotes, checkpoints, replacementTracking, originalTracking, originalStatus, statusTag } = resolvedTracking.bestTracking;
      const csrNote = csrNotes[String(order.id)] || csrNotes[String(amazonOrderId)] || null;
      const replacementFromNotes = csrNote?.replacementTracking || '';
      const originalFromNotes = csrNote?.originalTracking || '';
      const statusFromNotes = csrNote?.trackingStatus || '';
      const emailedFromNotes = csrNote?.emailedMessaged || '';
      const responseFromNotes = csrNote?.response || '';
      orderDetails.push({
        orderId: order.id,
        amazonOrderId,
        wooStatus: order.status || '',
        country,
        stateCity,
        trackings: resolvedTracking.candidates,
        csrNote
      });
      completedRows.push({
        orderId: order.id,
        amazonOrderId,
        wooStatus: order.status || '',
        trackingNumber,
        originalTracking: originalFromNotes || originalTracking || trackingNumber,
        replacementTracking: replacementFromNotes || replacementTracking || '',
        carrier,
        country,
        stateCity,
        trackingNotes,
        infoReceived: checkpoints.infoReceived,
        inTransit: checkpoints.inTransit,
        outForDelivery: checkpoints.outForDelivery,
        delivered: checkpoints.delivered,
        statusTag: statusFromNotes || statusTag || checkpoints.statusTag || '',
        originalStatus: originalStatus || checkpoints.statusTag || '',
        emailedMessaged: emailedFromNotes,
        response: responseFromNotes
      });
    }

    pagesFetched++;
    page++;
    maybeThrottle(pageThrottleMs);
  }

  const toDate = (val) => val ? new Date(val) : null;
  completedRows.sort((a, b) => {
    const aTs = toDate(a.inTransit) || toDate(a.infoReceived) || new Date(0);
    const bTs = toDate(b.inTransit) || toDate(b.infoReceived) || new Date(0);
    return aTs - bTs;
  });

  const undeliveredRows = completedRows.filter((row) => !row.delivered && String(row.statusTag || '').toLowerCase() !== 'delivered');
  if (undeliveredRows.length > 0) {
    const values = undeliveredRows.map((row) => [
      row.orderId,
      row.amazonOrderId,
      row.wooStatus,
      row.trackingNumber,
      row.carrier,
      row.country,
      row.stateCity,
      row.infoReceived,
      row.inTransit,
      row.outForDelivery,
      row.delivered,
      row.trackingNotes || ''
    ]);
    const startRow = Math.max(2, sheet.getLastRow() + 1);
    sheet.getRange(startRow, 1, values.length, headers[0].length).setValues(values);
  }

  console.log(`--- AfterShip lookup sheet updated with ${undeliveredRows.length} undelivered rows (total fetched ${completedRows.length}) ---`);
  if (props && !ignorePagingState) {
    if (page <= totalPages) {
      props.setProperty('AFTERSHIP_NEXT_PAGE', String(page));
      console.log(`Paused at page ${page}/${totalPages}; will resume next run. Set script property AFTERSHIP_MAX_PAGES to adjust cap (current ${maxPagesPerRun || 'none'}).`);
    } else {
      props.deleteProperty('AFTERSHIP_NEXT_PAGE');
    }
  } else if (props && ignorePagingState) {
    props.deleteProperty('AFTERSHIP_NEXT_PAGE');
  }
  if (!skipAuxSheets) {
    writeMissingAftershipSheet(ss, missingTrackings);
    writeAftershipAutoCreateSheet(ss, autoCreateLog);
  }
  return { rows: undeliveredRows, orderDetails, missingTrackings, autoCreateLog };
}

/**
 * Run windowed AfterShip lookups to avoid timeouts on large ranges.
 * Splits the lookback into windows (default 3 days) up to totalDays (default 30)
 * and writes each window to its own sheet, then merges all windows into a single 30d sheet.
 */
function syncDeliveryTrackingAftershipLookupWindowed(windowDaysOpt, totalDaysOpt) {
  validateConfig();
  const cfg = getResolvedConfig();
  const windowDays = Math.max(1, Number(windowDaysOpt) || Number(AS_WINDOW_DAYS) || 1);
  const totalDays = Math.max(windowDays, Number(totalDaysOpt) || Number(AS_TOTAL_DAYS) || 30);
  const maxWindows = Math.max(1, Number(AS_MAX_WINDOWS_PER_RUN) || 3);
  const props = (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) ? PropertiesService.getScriptProperties() : null;
  const cursorRaw = props ? Number(props.getProperty('AFTERSHIP_WINDOW_CURSOR') || 0) : 0;
  const startToDays = cursorRaw && cursorRaw > 0 ? cursorRaw : 0;
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const slices = [];
  const missingAll = [];
  const autoCreateAll = [];

  let windowsProcessed = 0;
  let nextCursor = 0;
  for (let toDays = startToDays; toDays < totalDays; toDays += windowDays) {
    if (windowsProcessed >= maxWindows) {
      nextCursor = toDays;
      break;
    }
    const fromDays = Math.min(totalDays, toDays + windowDays);
    const sliceName = `${cfg.deliverySheetName} (${fromDays}-${toDays}d)`;
    console.log(`Running AfterShip window ${fromDays}-${toDays}d into sheet "${sliceName}"`);
    const result = runDeliveryTrackingAftershipLookup({
      fromDaysAgo: fromDays,
      toDaysAgo: toDays,
      clearSheet: true,
      sheetName: sliceName,
      ignorePaging: true,
      skipAuxSheets: true,
      maxPages: Number(AS_MAX_PAGES_PER_WINDOW) || 0
    });
    const rows = (result && result.rows) ? result.rows : [];
    const missing = (result && result.missingTrackings) ? result.missingTrackings : [];
    const auto = (result && result.autoCreateLog) ? result.autoCreateLog : [];
    slices.push({ fromDays, toDays, sheetName: sliceName, rows });
    if (missing.length) missingAll.push.apply(missingAll, missing);
    if (auto.length) autoCreateAll.push.apply(autoCreateAll, auto);
    windowsProcessed++;
  }

  if (props) {
    if (nextCursor > 0 && nextCursor < totalDays) {
      props.setProperty('AFTERSHIP_WINDOW_CURSOR', String(nextCursor));
      console.log(`Paused windowed run at toDays=${nextCursor}; will resume next execution.`);
    } else {
      props.deleteProperty('AFTERSHIP_WINDOW_CURSOR');
      console.log('Windowed run completed full span; cursor reset.');
    }
  }

  const mergedName = `${cfg.deliverySheetName} (${totalDays}d merged)`;
  writeMergedAftershipSheet(ss, mergedName, slices, cfg.deliverySheetName);
  writeMissingAftershipSheet(ss, missingAll);
  writeAftershipAutoCreateSheet(ss, autoCreateAll);
  console.log(`Merged ${slices.length} windowed sheets into "${mergedName}"`);
  return { slices, mergedSheetName: mergedName };
}

/**                                                                                                                                             
 * Email completed orders (AfterShip lookup) that are not yet delivered.                                                                 
 */                                                                                                                                             
function emailAftershipLookupOrders(runSync = true) {                                                                                       
  const cfg = getResolvedConfig();
  const recipients = ['adrian@makeafort.fun']; // Hardcoded distro per request.
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  let syncResult = null;
  if (runSync) {
    syncResult = syncDeliveryTrackingAftershipLookupWindowed();
  }
  const mergedFromRun = syncResult && syncResult.mergedSheetName ? syncResult.mergedSheetName : null;
  const mergedNameGuess = `${cfg.deliverySheetName} (${AS_TOTAL_DAYS || 30}d merged)`;
  const mergedExists = ss.getSheetByName(mergedFromRun || mergedNameGuess);
  const targetSheet = mergedFromRun || (mergedExists ? mergedExists.getName() : cfg.deliverySheetName);

  let rows = loadUndeliveredFromSheet(cfg, targetSheet);
  if ((!rows || !rows.length) && targetSheet !== cfg.deliverySheetName) {
    rows = loadUndeliveredFromSheet(cfg, cfg.deliverySheetName);
  }
  if ((!rows || !rows.length) && syncResult && Array.isArray(syncResult.slices)) {
    rows = syncResult.slices.reduce((acc, s) => {
      if (s && Array.isArray(s.rows)) acc.push.apply(acc, s.rows);
      return acc;
    }, []);
  }
  const orderDetails = (syncResult && syncResult.slices) ? (syncResult.orderDetails || []) : [];
  const now = new Date();
  const stalledThresholdHours = AS_AFTERSHIP_LABEL_STUCK_HOURS;
  const stalledRows = computeStalledRows(rows, stalledThresholdHours, now);
  const aftershipIssues = buildAftershipIssues(orderDetails, now);
  const statusKpiHtml = buildStatusKpi(aftershipIssues.statusCounts);
  let stalledDisplay = [];
  const inTransitRows = rows.filter((row) => !row.delivered);
  console.log(`AfterShip email data: targetSheet=${targetSheet}, rows=${rows.length}, inTransit=${inTransitRows.length}`);
  if (!inTransitRows.length) {
    console.log("No completed orders pending delivery after AfterShip lookup.");
    const sheetUrl = ss.getUrl();
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: 'Completed orders in transit - AfterShip lookup sweep',
      htmlBody: `
        <html>
          <body style="font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 10px;">
            <h3 style="margin: 0 0 6px 0;">Completed Orders - AfterShip Sweep</h3>
            <p style="margin: 0 0 8px 0; color: #475569;">No undelivered orders found in the current windowed lookback.</p>
            <p style="margin: 0 0 8px 0; color: #475569;">Sheet: <a href="${sheetUrl}" target="_blank" style="color:#2563eb;">${targetSheet}</a></p>
            <p style="margin: 0; color:#94a3b8; font-size:12px;">If you expect results, rerun after the window cursor completes the full span or check the merged sheet data.</p>
          </body>
        </html>
      `,
      name: buildSenderName(cfg.customerName, 'Alerts')
    });
    return;
  }

  const sheetUrl = ss.getUrl();

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - cfg.daysToCheck);
  const rangeText = `${Utilities.formatDate(rangeStart, "America/Chicago", "MM/dd/yyyy")} to ${Utilities.formatDate(now, "America/Chicago", "MM/dd/yyyy")}`;
  const toDate = (val) => val ? new Date(val) : null;
  const agesMs = inTransitRows.map((row) => {
    const ts = toDate(row.inTransit) || toDate(row.infoReceived) || now;
    return now - ts;
  });
  const avgAgeMs = agesMs.length ? (agesMs.reduce((a, b) => a + b, 0) / agesMs.length) : 0;
  const maxAgeMs = agesMs.length ? Math.max.apply(null, agesMs) : 0;
  const carrierCounts = inTransitRows.reduce((acc, row) => {
    const carrier = row.carrier || 'unknown';
    acc[carrier] = (acc[carrier] || 0) + 1;
    return acc;
  }, {});
  const topCarriers = Object.entries(carrierCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([carrier, count]) => ({ carrier, count }));
  const carrierTotal = Object.values(carrierCounts).reduce((a, b) => a + b, 0);

  const topCarriersRows = topCarriers.map(({ carrier, count }) => `
    <tr>
      <td>${carrier}</td>
      <td>${count}</td>
    </tr>
  `).join('');
  const topCarriersFooter = `
    <tr style="background-color: #f8fafc; font-weight: 600;">
      <td>Total</td>
      <td>${carrierTotal}</td>
    </tr>
  `;

  const agedRows = inTransitRows
    .map((row) => {
      const ts = toDate(row.inTransit) || toDate(row.infoReceived) || now;
      const deltaMs = now - ts;
      const days = deltaMs / (1000 * 60 * 60 * 24);
      return { ...row, daysPending: days, daysPendingMs: deltaMs, lastMovement: ts, replacementTracking: row.replacementTracking || '' };
    })
    .filter((row) => row.daysPending >= 14)
    .sort((a, b) => b.daysPending - a.daysPending)
    .slice(0, 10);

  const agedOrderIds = new Set(agedRows.map((row) => row.orderId));
  const stalledEmailRows = stalledRows.filter((row) => !agedOrderIds.has(row.orderId));
  stalledDisplay = stalledEmailRows.slice(0, 10);

  const agedTableRows = agedRows.map((row) => `
    <tr>
      <td>${row.orderId || ''}</td>
      <td>${row.amazonOrderId || ''}</td>
      <td>${row.wooStatus || ''}</td>
      <td>${row.trackingNumber || ''}</td>
      <td>${row.replacementTracking || ''}</td>
      <td>${row.carrier || ''}</td>
      <td>${row.country || ''}</td>
      <td>${row.stateCity || ''}</td>
      <td>${row.infoReceived || ''}</td>
      <td>${formatDuration(row.daysPendingMs)}</td>
      <td>${row.lastMovement ? Utilities.formatDate(row.lastMovement, "UTC", "yyyy-MM-dd HH:mm") : ''}</td>
    </tr>
  `).join('');

  const chicagoNow = Utilities.formatDate(new Date(), "America/Chicago", "MM/dd/yyyy HH:mm");
  const body = `
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Completed Orders - AfterShip Lookup</title>
    </head>
    <body style="margin:0; padding:12px; background:#fafbfc; font-family: Arial, sans-serif; font-size: 14px; color: #0f172a;">
      <h3 style="margin: 0 0 2px 0; font-size: 17px; font-weight: 700; color: #0f172a;">Completed Orders - Pending Delivery (AfterShip sweep)</h3>
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569;">As of ${chicagoNow} (America/Chicago)</p>
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #334155; font-weight: 600;">Date range: ${rangeText} (last ${cfg.daysToCheck} days)</p>
      <p style="margin: 0 0 12px 0; font-size: 12px; color: #334155;">Latest tracking per order is selected by AfterShip movement (auto-creates trackings on 404) so stalled/delayed packages are surfaced even when Woo tracking changed.</p>

      ${aftershipIssues.summaryHtml || ''}
      ${aftershipIssues.issuesHtml || ''}

      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; table-layout: fixed; margin: 0 0 12px 0; font-size: 13px;">
        <tr style="background:#eef2f7; color:#0f172a;">
          <th style="border: 1px solid #d0d7de; padding: 8px 10px; text-align:left; font-weight: 600;">Total pending</th>
          <th style="border: 1px solid #d0d7de; padding: 8px 10px; text-align:left; font-weight: 600;">Avg since last move</th>
          <th style="border: 1px solid #d0d7de; padding: 8px 10px; text-align:left; font-weight: 600;">Oldest pending</th>
          <th style="border: 1px solid #d0d7de; padding: 8px 10px; text-align:left; font-weight: 600;">Top carrier</th>
          <th style="border: 1px solid #d0d7de; padding: 8px 10px; text-align:left; font-weight: 600;">Label-only stalled (Stuck)</th>
          <th style="border: 1px solid #d0d7de; padding: 8px 10px; text-align:left; font-weight: 600;">14+ day backlog</th>
        </tr>
        <tr>
          <td style="border: 1px solid #d0d7de; padding: 10px; font-size: 18px; font-weight: 700;">${inTransitRows.length}</td>
          <td style="border: 1px solid #d0d7de; padding: 10px; font-size: 18px; font-weight: 700; color: #2563eb;">${formatDuration(avgAgeMs)}</td>
          <td style="border: 1px solid #d0d7de; padding: 10px; font-size: 18px; font-weight: 700; color: #2563eb;">${formatDuration(maxAgeMs)}</td>
          <td style="border: 1px solid #d0d7de; padding: 10px; font-size: 18px; font-weight: 700;">${topCarriers.length ? `${topCarriers[0].carrier}: ${topCarriers[0].count}` : 'n/a'}</td>
          <td style="border: 1px solid #d0d7de; padding: 10px; font-size: 18px; font-weight: 700; color: ${stalledEmailRows.length ? '#b45309' : '#15803d'};">${stalledEmailRows.length ? `${stalledEmailRows.length} orders` : 'None'}</td>
          <td style="border: 1px solid #d0d7de; padding: 10px; font-size: 18px; font-weight: 700; color: ${agedRows.length ? '#b45309' : '#15803d'};">${agedRows.length ? `${agedRows.length} orders` : 'None'}</td>
        </tr>
      </table>

      ${statusKpiHtml}

      <div style="margin: 12px 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">Top carriers (by undelivered count)</div>
      ${topCarriers.length ? `
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin: 0 0 12px 0; font-size: 13px;">
        <thead>
          <tr style="background:#eef2f7; color:#0f172a;">
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Carrier</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Undelivered Count</th>
          </tr>
        </thead>
        <tbody>
          ${topCarriersRows}
          ${topCarriersFooter}
        </tbody>
      </table>
      ` : '<p style="margin:0 0 10px 0; color:#6b7280; font-size:12px;">No carrier data available.</p>'}

      <div style="margin: 12px 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">Label-created / InfoReceived only (${stalledEmailRows.length} at ${stalledThresholdHours}+ hours; showing up to 10)</div>
      ${stalledDisplay.length ? `
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin: 0 0 12px 0; font-size: 13px;">
        <thead>
          <tr style="background:#eef2f7; color:#0f172a;">
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Order ID</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Channel Order ID</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Woo Status</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Original Tracking</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Replacement / Reship</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Carrier</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Country</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">State/City</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Label Created</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Tracking Notes</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Age</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Last Movement (CST)</th>
          </tr>
        </thead>
        <tbody>
          ${stalledDisplay.map((row) => `
            <tr>
              <td>${row.orderId || ''}</td>
              <td>${row.amazonOrderId || ''}</td>
              <td>${row.wooStatus || ''}</td>
              <td>${row.trackingNumber || ''}</td>
              <td>${row.replacementTracking || ''}</td>
              <td>${row.carrier || ''}</td>
              <td>${row.country || ''}</td>
              <td>${row.stateCity || ''}</td>
              <td>${formatCstDate(row.infoReceived) || ''}</td>
              <td>${row.trackingNotes || ''}</td>
              <td>${formatDuration(row.stalledAgeMs)}</td>
              <td>${formatCstDateTime(row.lastMovement) || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : '<p style="margin:0 0 10px 0; color:#15803d; font-size:12px; font-weight:600;">No stalled label-only orders.</p>'}

      <div style="margin: 12px 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">Orders pending 14+ days (showing up to 10)</div>
      ${agedRows.length ? `
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin: 0 0 12px 0; font-size: 13px;">
        <thead>
          <tr style="background:#eef2f7; color:#0f172a;">
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Order ID</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Channel Order ID</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Woo Status</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Original Tracking</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Replacement / Reship</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Carrier</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Country</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">State/City</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Label Created</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Age</th>
            <th align="left" style="border: 1px solid #d0d7de; padding: 8px 10px; font-weight: 600;">Last Movement (CST)</th>
          </tr>
        </thead>
        <tbody>${agedTableRows}</tbody>
      </table>
  ` : '<p style="margin:0 0 10px 0; color:#15803d; font-size:12px; font-weight:600;">No orders pending 14+ days.</p>'}

      <p style="margin: 6px 0 0 0; font-size: 13px; color: #334155;">
        Full details: <a href="${sheetUrl}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">${cfg.deliverySheetName}</a>
      </p>
    </body>
  </html>
  `;

  MailApp.sendEmail({
    to: recipients.join(','),
    subject: 'Completed orders in transit - AfterShip lookup sweep',
    htmlBody: body,
    name: buildSenderName(cfg.customerName, 'Alerts')
  });

  console.log('In-transit delivery email sent (AfterShip lookup).');
  writeStalledSheet(ss, stalledRows, stalledThresholdHours);
}

/**
 * Resolve the newest tracking per order using AfterShip movement recency.
 */
function resolveLatestTrackingWithAftership(trackingItems, orderId, amazonOrderId, cfg, autoCreateLog, aftershipThrottleMs) {
  if (!Array.isArray(trackingItems) || !trackingItems.length) return null;
  const toDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const candidates = [];
  for (const item of trackingItems) {
    const trackingNumber = item.tracking_number;
    const carrier = item.custom_tracking_provider || item.tracking_provider || '';
    if (!trackingNumber || !carrier) continue;
    const carrierSlug = normalizeCarrierSlug(String(carrier).toLowerCase().replace(/\s+/g, ''));
    const trackingNotes = item.tracking_notes || item.tracking_note || item.notes || item.note || '';
    const checkpoints = fetchAftershipCheckpointsWithCreate(carrierSlug, trackingNumber, autoCreateLog, { orderId, amazonOrderId }, aftershipThrottleMs);
    const wooTs = toDate(item.date_shipped) || toDate(item.date_added);
    const latestCheckpointMs = getLatestCheckpointMs(checkpoints);
    const recencyScore = latestCheckpointMs || (wooTs ? wooTs.getTime() : 0);
    candidates.push({
      trackingNumber,
      carrier: carrierSlug,
      trackingNotes,
      checkpoints,
      wooTs,
      recencyScore,
      isCancelled: checkpoints.isCancelled
    });
  }

  if (!candidates.length) {
    console.warn(`Order ${orderId} had tracking items but none were usable after AfterShip lookup.`);
    return null;
  }

  candidates.sort((a, b) => {
    const recDiff = (b.recencyScore || 0) - (a.recencyScore || 0);
    if (recDiff !== 0) return recDiff;
    const cancelDiff = (a.isCancelled ? 1 : 0) - (b.isCancelled ? 1 : 0); // prefer active
    if (cancelDiff !== 0) return cancelDiff;
    return ((b.wooTs ? b.wooTs.getTime() : 0) - (a.wooTs ? a.wooTs.getTime() : 0));
  });

  const active = candidates.filter((c) => !c.isCancelled);
  const cancelled = candidates.filter((c) => c.isCancelled);
  const bestTracking = active[0] || candidates[0];
  const replacementCandidate = active[0] || null;
  const originalCandidate = cancelled[0] || candidates[0];

  bestTracking.replacementTracking = replacementCandidate && replacementCandidate.trackingNumber !== bestTracking.trackingNumber
    ? replacementCandidate.trackingNumber
    : '';
  bestTracking.originalTracking = originalCandidate ? originalCandidate.trackingNumber : bestTracking.trackingNumber;
  bestTracking.originalStatus = originalCandidate ? (originalCandidate.checkpoints?.statusTag || 'Cancelled') : (bestTracking.checkpoints?.statusTag || '');
  bestTracking.statusTag = bestTracking.checkpoints?.statusTag || '';

  return { bestTracking, candidates };
}

/**
 * Fetch AfterShip checkpoints; auto-create tracking on 404 and include latest movement timestamp.
 */
function fetchAftershipCheckpointsWithCreate(carrierSlug, trackingNumber, autoCreateLog, orderContext, throttleMs) {
  const { aftershipKey } = getResolvedConfig();
  maybeThrottle(throttleMs);
  const url = `https://api.aftership.com/v4/trackings/${carrierSlug}/${trackingNumber}`;
  const options = {
    method: 'get',
    headers: {
      'as-api-key': aftershipKey,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  const summary = { infoReceived: '', inTransit: '', outForDelivery: '', delivered: '', latestCheckpointMs: 0, statusTag: '', isCancelled: false };
  const logEntry = (result, httpCode) => {
    if (!Array.isArray(autoCreateLog)) return;
    autoCreateLog.push({
      attemptedAt: new Date(),
      orderId: orderContext?.orderId || '',
      amazonOrderId: orderContext?.amazonOrderId || '',
      carrier: carrierSlug,
      trackingNumber,
      createResult: result,
      httpCode: httpCode || ''
    });
  };
  let response = fetchWithRetry(url, options);
  if (response.getResponseCode() === 404) {
    console.warn(`AfterShip missing tracking ${carrierSlug}/${trackingNumber}. Attempting auto-create.`);
    const createUrl = 'https://api.aftership.com/v4/trackings';
    const createResp = fetchWithRetry(createUrl, {
      method: 'post',
      headers: {
        'as-api-key': aftershipKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        tracking: { slug: carrierSlug, tracking_number: trackingNumber }
      }),
      muteHttpExceptions: true
    });
    if (createResp.getResponseCode() >= 200 && createResp.getResponseCode() < 300) {
      logEntry('created', createResp.getResponseCode());
      Utilities.sleep(300);
      response = fetchWithRetry(url, options);
    } else {
      logEntry('failed', createResp.getResponseCode());
      console.warn(`Failed to auto-create AfterShip tracking ${carrierSlug}/${trackingNumber}. HTTP ${createResp.getResponseCode()}`);
      return summary;
    }
  }

  if (response.getResponseCode() !== 200) {
    console.warn(`Failed to fetch AfterShip data for ${trackingNumber} (${carrierSlug}). HTTP ${response.getResponseCode()}`);
    return summary;
  }

  const json = parseAftershipResponse(response, carrierSlug, trackingNumber);
  const trackingData = json?.data?.tracking;
  if (!trackingData || !Array.isArray(trackingData.checkpoints)) {
    console.warn(`AfterShip response missing tracking data for ${carrierSlug}/${trackingNumber}.`);
    return summary;
  }

  const statusTag = trackingData.tag || trackingData.status || '';
  summary.statusTag = statusTag;
  const lowered = (statusTag || '').toLowerCase();
  summary.isCancelled = lowered.includes('cancel') || lowered.includes('void') || lowered.includes('expired');

  for (const checkpoint of trackingData.checkpoints.slice().reverse()) {
    const checkpointDate = checkpoint.checkpoint_time ? new Date(checkpoint.checkpoint_time) : null;
    const checkpointTime = checkpointDate ? Utilities.formatDate(checkpointDate, "UTC", "yyyy-MM-dd HH:mm:ss") : '';
    const checkpointMs = checkpointDate ? checkpointDate.getTime() : 0;
    if (checkpointMs > summary.latestCheckpointMs) summary.latestCheckpointMs = checkpointMs;
    switch (checkpoint.tag) {
      case 'InfoReceived':
        if (!summary.infoReceived) summary.infoReceived = checkpointTime;
        break;
      case 'InTransit':
        if (!summary.inTransit) summary.inTransit = checkpointTime;
        break;
      case 'OutForDelivery':
        if (!summary.outForDelivery) summary.outForDelivery = checkpointTime;
        break;
      case 'Delivered':
        if (!summary.delivered) summary.delivered = checkpointTime;
        break;
      default:
        break;
    }
  }

  return summary;
}

function getLatestCheckpointMs(checkpoints) {
  if (!checkpoints) return 0;
  const dates = [checkpoints.delivered, checkpoints.outForDelivery, checkpoints.inTransit, checkpoints.infoReceived]
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter((ms) => !isNaN(ms));
  return dates.length ? Math.max.apply(null, dates) : (checkpoints.latestCheckpointMs || 0);
}

function isTrackingStuckLabel(checkpoints, now) {
  if (!checkpoints) return false;
  if (checkpoints.inTransit || checkpoints.outForDelivery || checkpoints.delivered) return false;
  if (!checkpoints.infoReceived) return false;
  const lastMs = getLatestCheckpointMs(checkpoints);
  const ageMs = now.getTime() - (lastMs || now.getTime());
  const hours = ageMs / (1000 * 60 * 60);
  return hours >= AS_AFTERSHIP_LABEL_STUCK_HOURS;
}

function computeStalledRows(rows, thresholdHours, now) {
  if (!Array.isArray(rows) || !rows.length) return [];
  const thresholdMs = (Number(thresholdHours) || 0) * 60 * 60 * 1000;
  const toDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  return rows
    .map((row) => {
      const infoReceived = toDate(row.infoReceived);
      const inTransit = toDate(row.inTransit);
      const outForDelivery = toDate(row.outForDelivery);
      const delivered = toDate(row.delivered);
      if (delivered || inTransit || outForDelivery) return null; // not label-only
      if (!infoReceived) return null; // no label timestamp to judge
      const ageMs = now.getTime() - infoReceived.getTime();
      if (isNaN(ageMs) || ageMs < thresholdMs) return null;
      return {
        ...row,
        stalledAgeMs: ageMs,
        lastMovement: infoReceived
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b.stalledAgeMs || 0) - (a.stalledAgeMs || 0));
}

function buildAftershipIssues(orderDetails, now) {
  if (!Array.isArray(orderDetails) || !orderDetails.length) {
    return { summaryHtml: '', issuesHtml: '', statusCounts: {} };
  }

  const stuckLabels = [];
  const stuckDetailed = [];
  const multipleLabels = [];
  const missingConsolidation = [];
  const consolidated = [];
  const cancelledWithReplacement = [];
  const statusCounts = {};

  for (const order of orderDetails) {
    const trackings = order.trackings || [];
    if (!trackings.length) continue;

    for (const t of trackings) {
      const status = t.checkpoints?.statusTag || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }

    const active = trackings.filter((t) => !t.checkpoints?.isCancelled);
    const cancelled = trackings.filter((t) => t.checkpoints?.isCancelled);
    const stuck = active.filter((t) => {
      if (String(t.checkpoints?.statusTag || '').toLowerCase() === 'delivered') return false;
      return isTrackingStuckLabel(t.checkpoints, now);
    });

    if (stuck.length) {
      stuckLabels.push({
        orderId: order.orderId,
        amazonOrderId: order.amazonOrderId,
        trackings: stuck.map((t) => t.trackingNumber),
        carrier: stuck.map((t) => t.carrier).join(', '),
        stateCity: order.stateCity,
        country: order.country
      });
      stuck.forEach((t) => {
        const infoReceived = t.checkpoints?.infoReceived || '';
        const lastMs = getLatestCheckpointMs(t.checkpoints);
        const lastMovement = lastMs ? new Date(lastMs) : (infoReceived ? new Date(infoReceived) : null);
        const ageMs = infoReceived ? (now.getTime() - new Date(infoReceived).getTime()) : (lastMs ? now.getTime() - lastMs : 0);
        stuckDetailed.push({
          orderId: order.orderId,
          amazonOrderId: order.amazonOrderId,
          wooStatus: order.wooStatus || '',
          originalTracking: t.trackingNumber || '',
          replacementTracking: t.replacementTracking || '',
          carrier: t.carrier || '',
          country: order.country || '',
          stateCity: order.stateCity || '',
          infoReceived: infoReceived || '',
          ageMs,
          lastMovement,
          statusTag: t.checkpoints?.statusTag || '',
          emailedMessaged: order.csrNote?.emailedMessaged || '',
          response: order.csrNote?.response || ''
        });
      });
    }

    if (trackings.length > 1) {
      multipleLabels.push({
        orderId: order.orderId,
        amazonOrderId: order.amazonOrderId,
        trackings: trackings.map((t) => `${t.trackingNumber} (${t.checkpoints?.statusTag || 'unknown'})`)
      });

      if (active.length > 1) {
        missingConsolidation.push({
          orderId: order.orderId,
          amazonOrderId: order.amazonOrderId,
          activeTrackings: active.map((t) => `${t.trackingNumber} (${t.checkpoints?.statusTag || 'unknown'})`)
        });
      } else if (active.length === 1 && cancelled.length) {
        consolidated.push({
          orderId: order.orderId,
          amazonOrderId: order.amazonOrderId,
          primary: `${active[0].trackingNumber} (${active[0].checkpoints?.statusTag || 'unknown'})`,
          cancelled: cancelled.map((t) => t.trackingNumber)
        });
      }
    }

    if (cancelled.length && active.length) {
      const newestActive = active.slice().sort((a, b) => (b.recencyScore || 0) - (a.recencyScore || 0))[0];
      cancelledWithReplacement.push({
        orderId: order.orderId,
        amazonOrderId: order.amazonOrderId,
        cancelled: cancelled.map((t) => t.trackingNumber),
        replacement: newestActive ? `${newestActive.trackingNumber} (${newestActive.checkpoints?.statusTag || 'unknown'})` : ''
      });
    }
  }

  const makeTable = (title, rows, headers, renderRow) => {
    if (!rows.length) return '';
    return `
      <div style="margin: 10px 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${title}</div>
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin: 0 0 10px 0; font-size: 13px;">
        <thead>
          <tr style="background:#eef2f7; color:#0f172a;">
            ${headers.map((h) => `<th align="left" style="border: 1px solid #d0d7de; padding: 6px 8px; font-weight: 600;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(renderRow).join('')}
        </tbody>
      </table>
    `;
  };

  const issuesHtml = [
    makeTable(`Stuck labels (no movement 48h+, showing up to 20)`, stuckDetailed.slice(0, 20), ['Order ID', 'Channel Order ID', 'Woo Status', 'Original Tracking', 'Replacement / Reship', 'Carrier', 'Country', 'State/City', 'Label Created', 'Age', 'Last Movement (CST)', 'AfterShip Status', 'Emailed / Messaged', 'Response'], (row) => `
      <tr>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.orderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.amazonOrderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.wooStatus || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.originalTracking || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.replacementTracking || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.carrier || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.country || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.stateCity || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${formatCstDate(row.infoReceived) || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${formatDuration(row.ageMs)}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${formatCstDateTime(row.lastMovement) || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.statusTag || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.emailedMessaged || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.response || ''}</td>
      </tr>
    `),
    makeTable('Stuck labels (no movement 48h+)', stuckLabels, ['Order ID', 'Channel Order ID', 'Tracking(s)', 'Carrier', 'Country', 'State/City'], (row) => `
      <tr>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.orderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.amazonOrderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.trackings.join(', ')}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.carrier}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.country || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.stateCity || ''}</td>
      </tr>
    `),
    makeTable('Multiple labels on an order', multipleLabels, ['Order ID', 'Channel Order ID', 'Trackings'], (row) => `
      <tr>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.orderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.amazonOrderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.trackings.join(', ')}</td>
      </tr>
    `),
    makeTable('Missing consolidation (multiple active labels)', missingConsolidation, ['Order ID', 'Channel Order ID', 'Active Trackings'], (row) => `
      <tr>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.orderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.amazonOrderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.activeTrackings.join(', ')}</td>
      </tr>
    `),
    makeTable('Cancelled tracking with replacement', cancelledWithReplacement, ['Order ID', 'Channel Order ID', 'Cancelled', 'Replacement'], (row) => `
      <tr>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.orderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.amazonOrderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.cancelled.join(', ')}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.replacement || ''}</td>
      </tr>
    `),
    makeTable('Consolidated (single active after cancellation)', consolidated, ['Order ID', 'Channel Order ID', 'Active', 'Cancelled'], (row) => `
      <tr>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.orderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.amazonOrderId || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.primary || ''}</td>
        <td style="border: 1px solid #d0d7de; padding: 6px 8px;">${row.cancelled.join(', ')}</td>
      </tr>
    `)
  ].filter(Boolean).join('');

  const statusSummary = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => `${status || 'unknown'}: ${count}`)
    .join(' | ');

  const summaryHtml = `
    <div style="margin: 0 0 10px 0; padding: 8px 10px; background: #eef2f7; border: 1px solid #d0d7de; font-size: 13px;">
      <div style="font-weight: 700; margin: 0 0 4px 0;">AfterShip issue sweep (stuck ${AS_AFTERSHIP_LABEL_STUCK_HOURS}h+, multiples, cancellations)</div>
      <div style="color: #0f172a;">Status mix: ${statusSummary || 'n/a'}.</div>
    </div>
  `;

  return { summaryHtml, issuesHtml, statusCounts };
}

function writeMissingAftershipSheet(ss, missingTrackings) {
  const name = 'Missing AfterShip';
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clearContents();
  const headers = [['Order ID', 'Channel Order ID', 'Reason']];
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight('bold');
  if (!Array.isArray(missingTrackings) || !missingTrackings.length) return;
  const rows = missingTrackings.map((m) => [m.orderId || '', m.amazonOrderId || '', m.reason || '']);
  sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
}

function writeAftershipAutoCreateSheet(ss, autoCreateLog) {
  const name = 'AfterShip Auto-Created';
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clearContents();
  const headers = [['Attempted (UTC)', 'Order ID', 'Channel Order ID', 'Carrier', 'Tracking Number', 'Create Result', 'HTTP Code']];
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight('bold');
  if (!Array.isArray(autoCreateLog) || !autoCreateLog.length) return;
  const rows = autoCreateLog.map((m) => [
    m.attemptedAt || '',
    m.orderId || '',
    m.amazonOrderId || '',
    m.carrier || '',
    m.trackingNumber || '',
    m.createResult || '',
    m.httpCode || ''
  ]);
  sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
}

function writeMergedAftershipSheet(ss, mergedSheetName, slices, baseSheetName) {
  const sheet = ss.getSheetByName(mergedSheetName) || ss.insertSheet(mergedSheetName);
  sheet.clearContents();
  const headers = getDeliveryHeaders();
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight('bold');
  if (!Array.isArray(slices) || !slices.length) return;
  const rows = [];
  const seenSheetNames = new Set();

  const pushRows = (sliceRows) => {
    sliceRows.forEach((row) => {
      rows.push([
        row.orderId || '',
        row.amazonOrderId || '',
        row.wooStatus || '',
        row.trackingNumber || '',
        row.carrier || '',
        row.country || '',
        row.stateCity || '',
        row.infoReceived || '',
        row.inTransit || '',
        row.outForDelivery || '',
        row.delivered || '',
        row.trackingNotes || ''
      ]);
    });
  };

  // Include current run slices.
  slices.forEach((slice) => {
    seenSheetNames.add(slice.sheetName);
    const sliceRows = Array.isArray(slice.rows) ? slice.rows : [];
    pushRows(sliceRows);
  });

  // Also include existing window sheets not processed in this run (so merged sheet covers full span across runs).
  const prefix = `${baseSheetName || ''} (`;
  const allSheets = ss.getSheets();
  for (const sh of allSheets) {
    const name = sh.getName();
    if (name === mergedSheetName) continue;
    if (!name.startsWith(prefix)) continue;
    if (seenSheetNames.has(name)) continue;
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow < 2) continue;
    const vals = sh.getRange(2, 1, lastRow - 1, Math.min(lastCol, headers[0].length)).getValues();
    vals.forEach((r) => {
      rows.push([
        r[0] || '',
        r[1] || '',
        r[2] || '',
        r[3] || '',
        r[4] || '',
        r[5] || '',
        r[6] || '',
        r[7] || '',
        r[8] || '',
        r[9] || '',
        r[10] || '',
        r[11] || ''
      ]);
    });
  }

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
  }
}

function writeStalledSheet(ss, stalledRows, stalledThresholdHours) {
  const name = 'Stalled Labels';
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clearContents();
  const headers = [['Order ID', 'Channel Order ID', 'Woo Status', 'Tracking', 'Replacement / Reship', 'Carrier', 'Country', 'State/City', 'Label Created (CST)', `Age (>=${stalledThresholdHours}h)`, 'Last Movement (CST)']];
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight('bold');
  if (!Array.isArray(stalledRows) || !stalledRows.length) return;
  const rows = stalledRows.map((row) => [
    row.orderId || '',
    row.amazonOrderId || '',
    row.wooStatus || '',
    row.trackingNumber || '',
    row.replacementTracking || '',
    row.carrier || '',
    row.country || '',
    row.stateCity || '',
    row.infoReceived || '',
    row.stalledAgeMs ? (row.stalledAgeMs / (1000 * 60 * 60)).toFixed(1) : '',
    row.lastMovement ? formatCstDateTime(row.lastMovement) : ''
  ]);
  sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);
  console.log(`Stalled label sheet updated with ${rows.length} rows (>=${stalledThresholdHours}h).`);
}

function loadUndeliveredFromSheet(cfg, sheetNameOverride) {
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheetName = sheetNameOverride || cfg.deliverySheetName;
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const rows = values.map((r) => ({
    orderId: r[0],
    amazonOrderId: r[1],
    wooStatus: r[2],
    trackingNumber: r[3],
    carrier: r[4],
    country: r[5],
    stateCity: r[6],
    infoReceived: r[7],
    inTransit: r[8],
    outForDelivery: r[9],
    delivered: r[10],
    trackingNotes: r[11]
  }));
  console.log(`Loaded ${rows.length} undelivered rows from sheet ${sheetName}.`);
  return rows;
}

function fetchCsrNotes(cfg) {
  const map = {};
  const sheetId = cfg.csrNotesSheetId;
  const sheetName = cfg.csrNotesSheetName;
  if (!sheetId || !sheetName) return map;
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return map;
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map((h) => String(h || '').trim().toLowerCase());
    const idx = (name) => headers.indexOf(name.toLowerCase());
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();
    for (const row of values) {
      const orderId = idx('order number') >= 0 ? row[idx('order number')] : '';
      if (!orderId) continue;
      const originalTracking = idx('original tracking number') >= 0 ? row[idx('original tracking number')] : (idx('tracking number') >= 0 ? row[idx('tracking number')] : '');
      const replacementTracking = idx('replacement / reship') >= 0 ? row[idx('replacement / reship')] : '';
      const trackingStatusIdx = idx('tracking status');
      let trackingStatus = trackingStatusIdx >= 0 ? row[trackingStatusIdx] : '';
      if (!trackingStatus) {
        const lastIdx = headers.lastIndexOf('tracking status');
        if (lastIdx >= 0 && lastIdx < row.length) trackingStatus = row[lastIdx];
      }
      map[String(orderId)] = {
        originalTracking: originalTracking || '',
        replacementTracking: replacementTracking || '',
        trackingStatus: trackingStatus || '',
        comment: idx('comment.') >= 0 ? row[idx('comment.')] : '',
        emailedMessaged: idx('emailed / messaged') >= 0 ? row[idx('emailed / messaged')] : '',
        response: idx('response') >= 0 ? row[idx('response')] : ''
      };
    }
  } catch (err) {
    console.warn(`Failed to read CSR notes sheet: ${err}`);
  }
  return map;
}

function getDeliveryHeaders() {
  return [["Order ID", "Channel Order ID", "Woo Status", "Tracking Number", "Carrier", "Country", "State/City", "Info Received (UTC)", "In Transit (UTC)", "Out for delivery (UTC)", "Delivered (UTC)", "Tracking Notes"]];
}

function buildStatusKpi(statusCounts) {
  const keys = ['Delivered', 'InfoReceived', 'InTransit', 'OutForDelivery', 'Exception', 'AvailableForPickup', 'AttemptFail'];
  const rows = keys.map((k) => {
    const val = statusCounts[k] || statusCounts[k.toLowerCase()] || 0;
    return `<td style="border: 1px solid #d0d7de; padding: 6px 8px; font-weight: 700;">${val}</td>`;
  }).join('');
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; table-layout: fixed; margin: 0 0 12px 0; font-size: 13px;">
      <tr style="background:#eef2f7; color:#0f172a;">
        ${keys.map((k) => `<th style="border: 1px solid #d0d7de; padding: 6px 8px; text-align:left; font-weight: 600;">${k}</th>`).join('')}
      </tr>
      <tr>
        ${rows}
      </tr>
    </table>
  `;
}

function getResolvedConfig() {
  const websiteUrl = AS_WEBSITE_URL;
  const wooKey = AS_WOO_KEY;
  const wooSecret = AS_WOO_SECRET;
  const aftershipKey = AS_AFTERSHIP_KEY;
  const spreadsheetId = AS_SPREADSHEET_ID;
  const deliverySheetName = AS_DELIVERY_SHEET_NAME;
  const daysToCheck = AS_DAYS_TO_CHECK || 7;
  const amazonChannelIds = AS_CHANNEL_IDS || [90, 85, 83, 91, 109, 89, 92, 116, 0, 113, 84];
  const rawCustomerName = AS_CUSTOMER_NAME || 'Make A Fort Reports';
  const customerName = normalizeCustomerName(rawCustomerName);
  const warehouseRecipients = AS_WAREHOUSE_RECIPIENTS || [];
  const stalledLabelDays = AS_STALLED_LABEL_DAYS || 3;
  const csrNotesSheetId = AS_CSR_SHEET_ID || '';
  const csrNotesSheetName = AS_CSR_SHEET_NAME || '';
  const aftershipThrottleMs = Number(AS_AFTERSHIP_THROTTLE_MS) || 0;
  const pageThrottleMs = Number(AS_WOO_PAGE_THROTTLE_MS) || 0;
  return { websiteUrl, wooKey, wooSecret, aftershipKey, spreadsheetId, deliverySheetName, daysToCheck, amazonChannelIds, customerName, warehouseRecipients, stalledLabelDays, csrNotesSheetId, csrNotesSheetName, aftershipThrottleMs, pageThrottleMs };
}

function formatDuration(ms) {
  const totalMs = Math.max(0, ms || 0);
  const totalSec = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes && parts.length < 2) parts.push(`${minutes}m`);
  if (!parts.length && seconds) parts.push(`${seconds}s`);
  if (!parts.length) parts.push('0s');
  return parts.slice(0, 2).join(' ');
}

function normalizeCarrierSlug(slug) {
  const map = {
    'dpd': 'dpd-uk',
    'dpduk': 'dpd-uk',
    'dpd-uk': 'dpd-uk',
    'dpdparcelnextday': 'dpd-uk',
    'dpd-parcelnextday': 'dpd-uk',
    'dpd-parceltwoday': 'dpd-uk',
    'ups': 'ups',
    'upsuk': 'ups',
    'upscanada': 'ups',
    'upsnetherlands': 'ups',
    'fedex': 'fedex',
    'fedexground': 'fedex',
    'loomisexpress': 'loomis_express',
    'canadapost': 'canada_post',
    'dhl': 'dhl_express',
    'dhlintrashipde': 'dhl_express',
    'dhlexpresscanada': 'dhl_express_canada',
    'purolator': 'purolator',
    'purolatorcourierltd': 'purolator',
    'purolator_ca': 'purolator',
    'yodel': 'yodel',
    'yodelxpress': 'yodel',
    'yodelxpresspod': 'yodel',
    'yodel-xpress24pod': 'yodel',
    'yodel-xpect24pod': 'yodel',
    'yodel-xpect24': 'yodel',
    'yodel-xpress': 'yodel',
    'usps': 'usps'
  };
  return map[slug] || slug;
}

function getStateOrCity(shipping) {
  if (!shipping) return '';
  const country = shipping.country || '';
  const state = shipping.state || '';
  const city = shipping.city || '';
  if ((country === 'US' || country === 'CA') && state) return state;
  if (city) return city;
  return state || '';
}

function getRecipientsFromDistro(ss) {
  const candidates = [];
  if (typeof DELIVERY_DISTRO_SHEET !== 'undefined' && DELIVERY_DISTRO_SHEET) {
    candidates.push(DELIVERY_DISTRO_SHEET);
  }
  candidates.push('email_distro', 'Distro');

  for (const name of candidates) {
    const sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() >= 1) {
      const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
      const emails = values.flat().filter((e) => e && String(e).includes('@'));
      if (emails.length) return emails;
    }
  }

  const warehouse = (typeof WAREHOUSE_RECIPIENTS !== 'undefined' && Array.isArray(WAREHOUSE_RECIPIENTS)) ? WAREHOUSE_RECIPIENTS : [];
  if (warehouse.length) {
    console.warn('Using WAREHOUSE_RECIPIENTS fallback; distro sheet not found or empty.');
    return warehouse;
  }

  throw new Error('No recipients found: add a distro sheet (email_distro/Distro) or set DELIVERY_DISTRO_SHEET/WAREHOUSE_RECIPIENTS.');
}

function normalizeCustomerName(name) {
  let base = (name || '').trim();
  if (!base) return '';
  while (/\s+(alerts|reports)\s*$/i.test(base)) {
    base = base.replace(/\s+(alerts|reports)\s*$/i, '').trim();
  }
  return base || (name || '').trim();
}

function buildSenderName(customerName, suffix) {
  const base = normalizeCustomerName(customerName);
  const suffixPart = (suffix || '').trim();
  if (!suffixPart) return base;
  const suffixRegex = new RegExp(`\\b${suffixPart}$`, 'i');
  if (suffixRegex.test(base)) return base;
  return `${base} ${suffixPart}`.trim();
}

function formatCstDateTime(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return String(val || '');
  return Utilities.formatDate(d, "America/Chicago", "MM/dd/yyyy HH:mm");
}

function formatCstDate(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return String(val || '');
  return Utilities.formatDate(d, "America/Chicago", "MM/dd/yyyy 'CST'");
}

function maybeThrottle(ms) {
  if (ms && ms > 0) Utilities.sleep(ms);
}

function fetchWithRetry(url, options) {
  const maxAttempts = 4;
  const backoffMs = 500;
  let lastResp;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = UrlFetchApp.fetch(url, options);
      const code = resp.getResponseCode();
      if (code >= 200 && code < 300) return resp;
      lastResp = resp;
      if (code === 429 || code >= 500) {
        Utilities.sleep(backoffMs * attempt);
        continue;
      }
      return resp;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      Utilities.sleep(backoffMs * attempt);
    }
  }
  return lastResp;
}

function validateConfig() {
  const cfg = getResolvedConfig();
  if (!cfg.wooKey || !cfg.wooSecret) {
    throw new Error('Missing WooCommerce credentials: set AS_WOO_KEY and AS_WOO_SECRET.');
  }
  if (!cfg.aftershipKey) {
    throw new Error('Missing AfterShip API key: set AS_AFTERSHIP_KEY.');
  }
}
