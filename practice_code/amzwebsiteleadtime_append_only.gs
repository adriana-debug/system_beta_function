/**
 * Append-only variant: preserves historical rows and only updates the mutable window (today + yesterday).
 * Initial run populates the full lookback window; later runs only upsert today/yesterday.
 */
// Fallback shims if shared helpers are not present in this project.
var getResolvedConfig = (typeof getResolvedConfig !== 'undefined') ? getResolvedConfig : function() {
  return {
    timezone: (typeof CENTRAL_TIMEZONE !== 'undefined') ? CENTRAL_TIMEZONE : 'America/Chicago',
    customerName: (typeof CUSTOMER_NAME !== 'undefined') ? CUSTOMER_NAME : '',
    websiteUrl: (typeof YOUR_WEBSITE_URL !== 'undefined') ? YOUR_WEBSITE_URL : '',
    wooKey: (typeof YOUR_CONSUMER_KEY !== 'undefined') ? YOUR_CONSUMER_KEY : '',
    wooSecret: (typeof YOUR_CONSUMER_SECRET !== 'undefined') ? YOUR_CONSUMER_SECRET : '',
    daysToCheck: (typeof DAYS_TO_CHECK !== 'undefined') ? DAYS_TO_CHECK : 30,
    amazonChannelIds: (typeof AMAZON_CHANNEL_IDS !== 'undefined') ? AMAZON_CHANNEL_IDS : [],
    spreadsheetId: (typeof SPREADSHEET_ID !== 'undefined') ? SPREADSHEET_ID : ''
  };
};

var validateConfig = (typeof validateConfig !== 'undefined') ? validateConfig : function() {
  const cfg = getResolvedConfig();
  const missing = [];
  if (!cfg.websiteUrl) missing.push('YOUR_WEBSITE_URL');
  if (!cfg.wooKey) missing.push('YOUR_CONSUMER_KEY');
  if (!cfg.wooSecret) missing.push('YOUR_CONSUMER_SECRET');
  if (!cfg.spreadsheetId) missing.push('SPREADSHEET_ID');
  if (missing.length) throw new Error('Missing configuration: ' + missing.join(', '));
  return cfg;
};

var fetchWithRetry = (typeof fetchWithRetry !== 'undefined') ? fetchWithRetry : function(url, opts) {
  const maxAttempts = 3;
  let lastErr;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return UrlFetchApp.fetch(url, opts || {});
    } catch (err) {
      lastErr = err;
      Utilities.sleep(500 * (i + 1));
    }
  }
  throw lastErr;
};

// Parse WooCommerce order responses defensively; the API can occasionally prepend HTML/PHP notices.
var parseOrdersResponse = function(resp, page) {
  const body = resp.getContentText();
  if (!body || !String(body).trim()) return [];
  const coerceArray = (val) => Array.isArray(val) ? val : (val && Array.isArray(val.data) ? val.data : []);
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
        // fall through to throw with context
      }
    }
    const snippet = trimmed.slice(0, 500);
    throw new Error(`Failed to parse completed orders JSON on page ${page}: ${err.message}. Body snippet: ${snippet}`);
  }
};

// Fetch a WooCommerce orders page with lightweight retry on HTTP 5xx, and parse safely.
var fetchOrdersPage = function(url, page) {
  let lastResp = null;
  const attempts = 3;
  for (let i = 0; i < attempts; i++) {
    lastResp = fetchWithRetry(url, { muteHttpExceptions: true });
    const code = lastResp.getResponseCode();
    if (code === 200) {
      return { ok: true, resp: lastResp, orders: parseOrdersResponse(lastResp, page) };
    }
    if (code >= 500) {
      Utilities.sleep(300 * (i + 1));
      continue;
    }
    break; // 4xx and other codes: do not spin.
  }
  return {
    ok: false,
    status: lastResp ? lastResp.getResponseCode() : null,
    body: lastResp ? lastResp.getContentText() : ''
  };
};

var formatDurationLocal = function(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  return `${hours}h ${minutes}m ${seconds}s`;
};

var getRecipientsFromDistro = (typeof getRecipientsFromDistro !== 'undefined') ? getRecipientsFromDistro : function(ss) {
  const sheet = ss.getSheetByName('email_distro') || ss.getSheetByName('Distro');
  if (!sheet) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues(); // column A below header
  return values
    .map((r) => String(r[0] || '').trim())
    .filter((v) => v && v.indexOf('@') !== -1);
};

var buildSenderName = (typeof buildSenderName !== 'undefined') ? buildSenderName : function(customerName, suffix) {
  const base = String(customerName || '').trim();
  const suff = String(suffix || '').trim();
  if (!suff) return base;
  const regex = new RegExp(`\\b${suff}$`, 'i');
  if (regex.test(base)) return base;
  return `${base} ${suff}`.trim();
};

function syncAmzWebsiteFulfillmentLeadTimesAppendOnly() {
  validateConfig();
  const cfg = getResolvedConfig();
  const lookbackDays = Math.max(Number(cfg.daysToCheck) || 30, 7);
  const mutableDayCount = 2; // today + yesterday (CST)
  const sheetName = 'Website + Amazon Fulfillment Lead Time (append-only)';

  const allowedChannels = Array.from(new Set([0].concat(cfg.amazonChannelIds || [])));

  // Build API date filter (lookback).
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lookbackDays);
  const apiDateFilter = startDate.toISOString();

  // Fetch and aggregate completed orders.
  const dailyAgg = {};
  const skippedPages = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${cfg.websiteUrl}/wp-json/wc/v3/orders?consumer_key=${cfg.wooKey}&consumer_secret=${cfg.wooSecret}&per_page=50&page=${page}&modified_after=${apiDateFilter}&status=completed`;
    const pageResult = fetchOrdersPage(url, page);
    if (!pageResult.ok) {
      const snippet = String(pageResult.body || '').trim().slice(0, 400);
      skippedPages.push({ page, status: pageResult.status || 'n/a' });
      console.log(`Skipped page ${page} (HTTP ${pageResult.status || 'n/a'}). Body snippet: ${snippet}`);
      page++;
      continue;
    }
    if (page === 1) {
      totalPages = parseInt(pageResult.resp.getHeaders()['x-wp-totalpages'], 10) || 1;
    }

    const orders = pageResult.orders || [];
    for (const order of orders) {
      const channelId = Number(order.customer_id || 0);
      if (!allowedChannels.includes(channelId)) continue;
      const created = order.date_created_gmt || order.date_created;
      const completed = order.date_completed_gmt || order.date_completed;
      if (!created || !completed) continue;
      const createdDate = new Date(created);
      const completedDate = new Date(completed);
      const leadMs = completedDate - createdDate;
      if (isNaN(leadMs) || leadMs < 0) continue;

      const key = dayKey(completedDate);
      if (!dailyAgg[key]) dailyAgg[key] = { count: 0, totalDays: 0 };
      dailyAgg[key].count += 1;
      dailyAgg[key].totalDays += leadMs / (1000 * 60 * 60 * 24); // days
    }
    page++;
  }

  const mutableKeys = buildMutableKeys(mutableDayCount);
  const mutableSet = new Set(mutableKeys);
  if (skippedPages.length) {
    const summary = skippedPages.map((p) => `${p.page} (${p.status})`).join(', ');
    console.log(`Skipped WooCommerce order pages due to HTTP errors: ${summary}`);
  }

  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  const header = ['Date (completed, CST)', 'Count', 'Avg lead (days)', 'Avg lead (duration)'];
  const lastRow = sheet.getLastRow();
  const hasData = lastRow > 0;
  const existingValues = hasData ? sheet.getRange(1, 1, lastRow, Math.min(4, sheet.getLastColumn())).getValues() : [];

  // Map existing rows (keep historical values).
  const existingMap = {};
  const finalRows = [];
  const headerRow = header;
  if (existingValues.length > 0) {
    // Ensure header is in place; if not, treat as empty.
    const headerLooksGood = (existingValues[0] || []).slice(0, header.length).join('') === header.join('');
    if (!headerLooksGood) existingValues.length = 0;
  }

  if (existingValues.length > 1) {
    for (let i = 1; i < existingValues.length; i++) {
      const row = existingValues[i];
      const key = normalizeDateKey(row[0]);
      if (!key) continue;
      existingMap[key] = {
        label: row[0],
        count: row[1],
        avgDays: row[2],
        avgFmt: row[3]
      };
      finalRows.push([row[0], row[1], row[2], row[3]]);
    }
  }

  const aggKeysDesc = Object.keys(dailyAgg).sort((a, b) => new Date(b) - new Date(a));
  const sheetIsEmpty = existingValues.length === 0;

  if (sheetIsEmpty) {
    // First run: populate all data in descending date order.
    const rows = aggKeysDesc.map((key) => buildRowFromAgg(key, dailyAgg[key]));
    writeRows(sheet, headerRow, rows);
    console.log(`Append-only lead-time sheet initialized with ${rows.length} rows.`);
    return { rowsWritten: rows.length, mutableUpdated: rows.length };
  }

  // Update mutable days in-place; preserve others.
  const updatedKeys = new Set();
  for (let i = 0; i < finalRows.length; i++) {
    const key = normalizeDateKey(finalRows[i][0]);
    if (!mutableSet.has(key)) continue;
    const agg = dailyAgg[key];
    if (!agg) continue;
    finalRows[i] = buildRowFromAgg(key, agg);
    updatedKeys.add(key);
  }

  // Append any mutable-day rows that are missing (e.g., new dates).
  for (const key of aggKeysDesc) {
    if (!mutableSet.has(key)) continue;
    if (existingMap[key]) continue;
    finalRows.unshift(buildRowFromAgg(key, dailyAgg[key])); // keep newest near top
    updatedKeys.add(key);
  }

  // Sort final rows descending by date.
  finalRows.sort((a, b) => {
    const da = parseDateValue(a[0]) || new Date(stripWeekendSuffix(a[0]));
    const db = parseDateValue(b[0]) || new Date(stripWeekendSuffix(b[0]));
    return db - da;
  });

  writeRows(sheet, headerRow, finalRows);
  console.log(`Append-only lead-time sheet refreshed. Updated keys: ${Array.from(updatedKeys).join(', ') || 'none'}.`);
  return { rowsWritten: finalRows.length, mutableUpdated: updatedKeys.size, mutableKeys };
}

// Helpers
function dayKey(d) {
  return Utilities.formatDate(d, CENTRAL_TIMEZONE, 'yyyy-MM-dd');
}

function weekendLabel(key) {
  const d = new Date(key);
  const day = Utilities.formatDate(d, CENTRAL_TIMEZONE, 'EEE');
  const base = Utilities.formatDate(d, CENTRAL_TIMEZONE, 'MM/dd/yyyy');
  if (day === 'Sat' || day === 'Sun') return `${base} (${day})`;
  return base;
}

function normalizeDateKey(val) {
  const clean = stripWeekendSuffix(val);
  const d = new Date(clean);
  if (isNaN(d.getTime())) return null;
  return Utilities.formatDate(d, CENTRAL_TIMEZONE, 'yyyy-MM-dd');
}

function stripWeekendSuffix(val) {
  const str = String(val || '').trim();
  return str.replace(/\s*\(.*\)\s*$/, '');
}

function parseDateValue(val) {
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  const str = String(val || '').trim();
  const clean = stripWeekendSuffix(str);
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d;
  const alt = new Date(str);
  return isNaN(alt.getTime()) ? null : alt;
}

function buildRowFromAgg(key, agg) {
  const avgDays = agg.count ? (agg.totalDays / agg.count) : 0;
  const avgMs = avgDays * 24 * 60 * 60 * 1000;
  return [weekendLabel(key), agg.count, Number(avgDays.toFixed(2)), formatDurationLocal(avgMs)];
}

function buildMutableKeys(days) {
  const keys = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(dayKey(d));
  }
  return keys;
}

function writeRows(sheet, header, rows) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
    // Weekend highlighting.
    const backgrounds = rows.map((row) => {
      const isWeekend = String(row[0] || '').includes('(Sat') || String(row[0] || '').includes('(Sun');
      const bg = isWeekend ? '#fff8e1' : '#ffffff';
      return [bg, bg, bg, bg];
    });
    sheet.getRange(2, 1, rows.length, header.length).setBackgrounds(backgrounds);
  }
}

/**
 * Email sender for append-only sheet. Does not recompute history; optionally syncs today/yesterday first.
 */
function emailAmzWebsiteFulfillmentLeadTimesAppendOnly(runSync = true) {
  const cfg = getResolvedConfig();
  if (runSync) {
    syncAmzWebsiteFulfillmentLeadTimesAppendOnly();
  }
  const summary = loadAmzWebsiteLeadTimeAppendOnlyFromSheet(cfg);
  if (!summary || !summary.dailyRows.length) {
    console.log('No lead-time data to email (append-only sheet).');
    return;
  }

  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheetUrl = ss.getUrl();
  const distro = getRecipientsFromDistro(ss);
  const recipients = (distro || []).filter((r) => r && String(r).trim());
  if (!recipients.length) {
    console.log('No recipients found (Distro sheet). Skipping append-only email send.');
    return;
  }

  const daily = summary.dailyRows.slice(0, 7);
  const priorDaily = summary.dailyRows.slice(7, 14);
  const summarizeWindow = (rows) => {
    let count = 0;
    let totalDays = 0;
    for (const r of rows) {
      const c = Number(r[1]) || 0;
      const avgDays = Number(r[2]) || 0;
      count += c;
      totalDays += c * avgDays;
    }
    const avgDays = count ? totalDays / count : null;
    return { count, avgDays };
  };
  const recentWindow = summarizeWindow(daily);
  const priorWindow = summarizeWindow(priorDaily);
  const trendPct = (priorWindow.avgDays !== null && priorWindow.avgDays !== 0)
    ? ((recentWindow.avgDays - priorWindow.avgDays) / priorWindow.avgDays) * 100
    : null;
  const trendDescriptor = trendPct === null
    ? ''
    : (trendPct > 0 ? 'slower' : trendPct < 0 ? 'faster' : 'flat');
  const trendText = trendPct === null
    ? 'Trend vs prior 7d: n/a'
    : `Trend vs prior 7d: ${(trendPct >= 0 ? '+' : '')}${trendPct.toFixed(1)}% (${trendDescriptor})`;
  const trendColor = trendDescriptor === 'faster' ? '#15803d' : trendDescriptor === 'slower' ? '#b45309' : '#0f172a';
  const priorAvgText = priorWindow.avgDays !== null
    ? `${priorWindow.avgDays.toFixed(2)}d (${formatDurationLocal(priorWindow.avgDays * 24 * 60 * 60 * 1000)})`
    : 'n/a';
  const targetDays = 2;
  const actionLine = recentWindow.avgDays !== null && recentWindow.avgDays > targetDays
    ? `Action: Above target (${targetDays}d). Review bottlenecks today.`
    : '';
  const weekendHighlightRows = daily.map((row) => {
    const parsedDate = parseDateValue(row[0]) || parseDateValue(stripWeekendSuffix(row[0]));
    const displayDate = parsedDate
      ? Utilities.formatDate(parsedDate, CENTRAL_TIMEZONE, 'MM/dd/yyyy')
      : String(row[0] || '');
    const isWeekend = parsedDate
      ? (['Sat', 'Sun'].includes(Utilities.formatDate(parsedDate, CENTRAL_TIMEZONE, 'EEE')))
      : (String(row[0] || '').includes('(Sat') || String(row[0] || '').includes('(Sun'));
    const bg = isWeekend ? '#fff8e1' : '#f8fafc';
    return `
      <tr style="background:${bg};">
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${displayDate}</td>
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${row[1]}</td>
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${row[2]}</td>
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${row[3]}</td>
      </tr>
    `;
  }).join('');

  const chicagoNow = Utilities.formatDate(new Date(), 'America/Chicago', 'MM/dd/yyyy HH:mm');
  const body = `
  <html>
    <body style="font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 10px;">
      <h3 style="margin: 0 0 6px 0;">Website + Amazon Order Count and Lead Time - Daily & 7-Day Avg</h3>
      <p style="margin: 0 0 10px 0; color: #475569;">As of ${chicagoNow} (America/Chicago)</p>

      <div style="margin: 0 0 10px 0; padding: 10px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px;">
        <div style="font-weight:700; color:#0f172a; margin:0 0 6px 0;">Summary</div>
        <div style="margin:0 0 4px 0; color:#0f172a;">
          <strong>Last 7 days:</strong> ${summary.rollingCount} orders; avg ${summary.rollingAvgDays.toFixed(2)}d (${formatDurationLocal(summary.rollingAvgMs)}).
        </div>
        <div style="margin:0 0 4px 0; color:#0f172a;">
          <strong>Prior 7 days:</strong> ${priorWindow.count} orders; avg ${priorAvgText}.
        </div>
        <div style="margin:0 0 4px 0; color:${trendColor}; font-weight:700;">${trendText}</div>
        ${actionLine ? `<div style="margin:0; color:#b45309; font-weight:700;">${actionLine}</div>` : ''}
      </div>

      <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 0 0 12px 0; width: 100%; font-size: 12px;">
        <thead>
          <tr style="background:#eef2f7; color:#0f172a;">
            <th align="left" style="border:1px solid #d0d7de; padding:8px 10px; font-weight:700;">Metric</th>
            <th align="left" style="border:1px solid #d0d7de; padding:8px 10px; font-weight:700;">Count</th>
            <th align="left" style="border:1px solid #d0d7de; padding:8px 10px; font-weight:700;">Avg lead (days)</th>
            <th align="left" style="border:1px solid #d0d7de; padding:8px 10px; font-weight:700;">Avg lead (duration)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-weight:700; font-size:13px;">Last ${summary.rollDays} days</td>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-size:18px;">${summary.rollingCount}</td>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-size:18px; color:#2563eb;">${summary.rollingAvgDays.toFixed(2)}</td>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-size:18px; color:#2563eb;">${formatDurationLocal(summary.rollingAvgMs)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin: 8px 0 6px 0; font-weight:700;">Daily completions & avg lead</div>
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background:#eef2f7; color:#0f172a;">
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Date (completed, CST)</th>
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Count</th>
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Avg lead (days)</th>
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Avg lead (duration)</th>
          </tr>
        </thead>
        <tbody>${weekendHighlightRows}</tbody>
      </table>

      <p style="margin: 4px 0 0 0; color:#475569; font-size:12px;">
        Full details: <a href="${sheetUrl}" target="_blank" style="color:#2563eb; font-weight:600;">${summary.sheetName}</a> (append-only tab).
      </p>
    </body>
  </html>
  `;

  MailApp.sendEmail({
    to: recipients.join(','),
    subject: 'Website + Amazon Order Count and Lead Time - Daily & 7-Day Avg',
    htmlBody: body,
    name: buildSenderName(cfg.customerName, 'Reports')
  });

  console.log('Append-only lead-time email sent.');
}

function loadAmzWebsiteLeadTimeAppendOnlyFromSheet(cfg) {
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheetName = 'Website + Amazon Fulfillment Lead Time (append-only)';
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  if (!data.length || data.length < 2) return null; // header only

  const dailyRows = [];
  for (let r = 1; r < data.length; r++) {
    const dateLabel = data[r][0];
    const count = Number(data[r][1]) || 0;
    const avgDays = Number(data[r][2]) || 0;
    const avgFmt = data[r][3];
    const key = normalizeDateKey(dateLabel);
    if (!key) continue;
    dailyRows.push([dateLabel, count, avgDays, avgFmt]);
  }

  dailyRows.sort((a, b) => new Date(stripWeekendSuffix(b[0])) - new Date(stripWeekendSuffix(a[0])));

  const rollDays = 7;
  const windowRows = dailyRows.slice(0, rollDays);
  let rollingCount = 0;
  let rollingTotalDays = 0;
  for (const r of windowRows) {
    const c = Number(r[1]) || 0;
    const avg = Number(r[2]) || 0;
    rollingCount += c;
    rollingTotalDays += c * avg;
  }
  const rollingAvgDays = rollingCount ? (rollingTotalDays / rollingCount) : 0;
  const rollingAvgMs = rollingAvgDays * 24 * 60 * 60 * 1000;

  return { rollingCount, rollingAvgDays, rollingAvgMs, dailyRows, rollDays, sheetName };
}
