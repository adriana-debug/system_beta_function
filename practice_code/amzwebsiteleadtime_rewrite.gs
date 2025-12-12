/**
 * Website + Amazon-channel fulfillment lead-time summary, including channelId 0.
 * Counts completions per day, computes lead time from awaiting-shipment to completed,
 * and emails a KPI + daily table with weekend labels on dates.
 */
// Fallback helpers to run standalone.
var normalizeCustomerName = (typeof normalizeCustomerName !== 'undefined') ? normalizeCustomerName : function(name) {
  let base = (name || '').trim();
  if (!base) return '';
  while (/\s+(alerts|reports)\s*$/i.test(base)) {
    base = base.replace(/\s+(alerts|reports)\s*$/i, '').trim();
  }
  return base || (name || '').trim();
};
var buildSenderName = (typeof buildSenderName !== 'undefined') ? buildSenderName : function(customerName, suffix) {
  const base = normalizeCustomerName(customerName);
  const suffixPart = (suffix || '').trim();
  if (!suffixPart) return base;
  const suffixRegex = new RegExp(`\\b${suffixPart}$`, 'i');
  if (suffixRegex.test(base)) return base;
  return `${base} ${suffixPart}`.trim();
};

// Duration formatter that hides 0d prefix (e.g., "0d 15h 16m 1s" -> "15h 16m 1s").
var formatDuration = (typeof formatDuration !== 'undefined') ? formatDuration : function(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  return `${hours}h ${minutes}m ${seconds}s`;
};

function syncAmzWebsiteFulfillmentLeadTimes() {
  validateConfig();
  const cfg = getResolvedConfig();
  const lookbackDays = Math.max(Number(cfg.daysToCheck) || 30, 7);
  const rollDays = 7;
  const sheetName = 'Website + Amazon Fulfillment Lead Time';
  const allowedChannels = Array.from(new Set([0].concat(cfg.amazonChannelIds || [])));

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lookbackDays);
  const apiDateFilter = startDate.toISOString();

  const rows = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${cfg.websiteUrl}/wp-json/wc/v3/orders?consumer_key=${cfg.wooKey}&consumer_secret=${cfg.wooSecret}&per_page=50&page=${page}&modified_after=${apiDateFilter}&status=completed`;
    const resp = fetchWithRetry(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      const body = resp.getContentText();
      throw new Error(`Failed to fetch completed orders page ${page} (HTTP ${resp.getResponseCode()}) body=${body}`);
    }
    if (page === 1) {
      totalPages = parseInt(resp.getHeaders()["x-wp-totalpages"], 10) || 1;
    }

    const orders = JSON.parse(resp.getContentText()) || [];
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

      rows.push({
        created: createdDate,
        completed: completedDate,
        leadMs
      });
    }
    page++;
  }

  if (!rows.length) {
    console.log('No completed orders found for lead-time summary (website + Amazon).');
    return [];
  }

  const dayKey = (d) => Utilities.formatDate(d, CENTRAL_TIMEZONE, 'yyyy-MM-dd');
  const leadDays = (ms) => ms / (1000 * 60 * 60 * 24);
  const daily = {};
  const now = new Date();
  const rollStart = new Date(now);
  rollStart.setDate(rollStart.getDate() - rollDays + 1);

  for (const row of rows) {
    const key = dayKey(row.completed);
    const ld = leadDays(row.leadMs);
    if (!daily[key]) daily[key] = { count: 0, totalDays: 0 };
    daily[key].count += 1;
    daily[key].totalDays += ld;
  }

  const rollingRows = rows.filter((r) => r.completed >= rollStart);
  const rollingCount = rollingRows.length;
  const rollingAvgDays = rollingCount
    ? (rollingRows.reduce((sum, r) => sum + leadDays(r.leadMs), 0) / rollingCount)
    : 0;
  const rollingAvgMs = rollingAvgDays * 24 * 60 * 60 * 1000;

  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clearContents();

  // Summary table.
  const summaryHeader = [['Metric', 'Count', 'Avg lead (days)', 'Avg lead (d/h/m/s)']];
  const summaryData = [[`Last ${rollDays} days`, rollingCount, Number(rollingAvgDays.toFixed(2)), formatDuration(rollingAvgMs)]];
  sheet.getRange(1, 1, 1, summaryHeader[0].length).setValues(summaryHeader).setFontWeight('bold');
  sheet.getRange(2, 1, 1, summaryData[0].length).setValues(summaryData);

  // Daily aggregates (recent to oldest) with weekend label.
  sheet.getRange(4, 1, 1, 4).setValues([['Date (completed, CST)', 'Count', 'Avg lead (days)', 'Avg lead (d/h/m/s)']]).setFontWeight('bold');
  const weekendLabel = (dateStr) => {
    const d = new Date(dateStr);
    const day = Utilities.formatDate(d, CENTRAL_TIMEZONE, 'EEE');
    if (day === 'Sat' || day === 'Sun') {
      return `${Utilities.formatDate(d, CENTRAL_TIMEZONE, 'MM/dd/yyyy')} (${day})`;
    }
    return Utilities.formatDate(d, CENTRAL_TIMEZONE, 'MM/dd/yyyy');
  };
  const dailyRows = Object.keys(daily)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((date) => {
      const agg = daily[date];
      const avg = agg.count ? agg.totalDays / agg.count : 0;
      const avgMs = avg * 24 * 60 * 60 * 1000;
      return [weekendLabel(date), agg.count, Number(avg.toFixed(2)), formatDuration(avgMs)];
    });
  if (dailyRows.length) {
    sheet.getRange(5, 1, dailyRows.length, 4).setValues(dailyRows);
    const weekendBg = '#fff8e1';
    const weekdayBg = '#ffffff';
    const backgrounds = dailyRows.map((row) => {
      const isWeekend = String(row[0] || '').includes('(Sat') || String(row[0] || '').includes('(Sun');
      const bg = isWeekend ? weekendBg : weekdayBg;
      return [bg, bg, bg, bg];
    });
    sheet.getRange(5, 1, dailyRows.length, 4).setBackgrounds(backgrounds);
  }

  console.log(`Website + Amazon lead-time sheet updated: ${rollingCount} completions in last ${rollDays} days.`);
  return { rollingCount, rollingAvgDays, rollingAvgMs, dailyRows, rollDays, sheetName };
}

function emailAmzWebsiteFulfillmentLeadTimes(runSync = true) {
  const cfg = getResolvedConfig();
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheetUrl = ss.getUrl();
  const distro = ['adrian@makeafort.fun', 'adrian.a@dmibpo.com']; // Hardcoded duplicate to simulate multiple recipients.
  const summary = runSync ? syncAmzWebsiteFulfillmentLeadTimes() : loadAmzWebsiteLeadTimeFromSheet(cfg);
  if (!summary || !summary.dailyRows.length) {
    console.log('No lead-time data to email (website + Amazon).');
    return;
  }

  const daily = summary.dailyRows.slice(0, 7); // last 7 days, already sorted desc
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
    ? `${priorWindow.avgDays.toFixed(2)}d (${formatDuration(priorWindow.avgDays * 24 * 60 * 60 * 1000)})`
    : 'n/a';
  const targetDays = 2;
  const actionLine = recentWindow.avgDays !== null && recentWindow.avgDays > targetDays
    ? `Action: Above target (${targetDays}d). Review bottlenecks today.`
    : '';
  const weekendHighlightRows = daily.map((row) => {
    const isWeekend = String(row[0] || '').includes('(Sat') || String(row[0] || '').includes('(Sun');
    const bg = isWeekend ? '#fff8e1' : '#f8fafc'; // light yellow for weekend, light gray-blue otherwise
    return `
      <tr style="background:${bg};">
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${row[0]}</td>
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${row[1]}</td>
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${row[2]}</td>
        <td style="border:1px solid #d0d7de; padding:6px 8px;">${row[3]}</td>
      </tr>
    `;
  }).join('');

  const chicagoNow = Utilities.formatDate(new Date(), "America/Chicago", "MM/dd/yyyy HH:mm");
  const body = `
  <html>
    <body style="font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 10px;">
      <h3 style="margin: 0 0 6px 0;">Website + Amazon Fulfillment Lead Time</h3>
      <p style="margin: 0 0 10px 0; color: #475569;">As of ${chicagoNow} (America/Chicago)</p>

      <div style="margin: 0 0 10px 0; padding: 10px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px;">
        <div style="font-weight:700; color:#0f172a; margin:0 0 6px 0;">Summary</div>
        <div style="margin:0 0 4px 0; color:#0f172a;">
          <strong>Last 7 days:</strong> ${summary.rollingCount} orders; avg ${summary.rollingAvgDays.toFixed(2)}d (${formatDuration(summary.rollingAvgMs)}).
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
            <th align="left" style="border:1px solid #d0d7de; padding:8px 10px; font-weight:700;">Avg lead (d/h/m/s)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-weight:700; font-size:13px;">Last ${summary.rollDays} days</td>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-size:18px;">${summary.rollingCount}</td>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-size:18px; color:#2563eb;">${summary.rollingAvgDays.toFixed(2)}</td>
            <td style="border:1px solid #d0d7de; padding:12px 10px; font-size:18px; color:#2563eb;">${formatDuration(summary.rollingAvgMs)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin: 8px 0 6px 0; font-weight:700;">Daily completions & avg lead (dates show weekend labels)</div>
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background:#eef2f7; color:#0f172a;">
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Date (completed, CST)</th>
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Count</th>
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Avg lead (days)</th>
            <th align="left" style="border:1px solid #d0d7de; padding:6px 8px;">Avg lead (d/h/m/s)</th>
          </tr>
        </thead>
        <tbody>${weekendHighlightRows}</tbody>
      </table>

      <p style="margin: 10px 0 0 0; color:#475569; font-size:12px;">
        Lead time represents the duration from when an order had (status: awaiting-shipment) to when it is marked completed in WooCommerce, with data filtered for Amazon channel orders plus website channel 0.
      </p>
      <p style="margin: 4px 0 0 0; color:#475569; font-size:12px;">
        Counts and averages come from WooCommerce completion timestamps (CST bucketed by completion date) within the current lookback window and include Amazon channel IDs plus channel 0.
      </p>
      <div style="margin: 6px 0 0 0; color:#475569; font-size:12px;">
        <div style="font-weight:700; color:#0f172a;">Trend vs prior 7 days</div>
        <div style="margin:2px 0 0 0; font-family: monospace; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 8px; border-radius:4px;">
          ((latest_7d_avg_lead - prior_7d_avg_lead) / prior_7d_avg_lead) * 100
        </div>
        <div style="margin:4px 0 0 0;">Negative % = faster; positive % = slower; if no prior window data exists, trend shows n/a.</div>
      </div>
      <div style="margin: 6px 0 0 0; color:#475569; font-size:12px;">
        <div style="font-weight:700; color:#0f172a;">How averages are calculated</div>
        <div style="margin:2px 0 0 0; font-family: monospace; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 8px; border-radius:4px;">
          latest_7d_avg_lead = (sum of lead days over last 7d) / (orders in last 7d)
        </div>
        <div style="margin:4px 0 0 0; font-family: monospace; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 8px; border-radius:4px;">
          prior_7d_avg_lead = (sum of lead days over prior 7d) / (orders in prior 7d)
        </div>
      </div>
      <p style="margin: 6px 0 0 0; color:#475569; font-size:12px;">
        Full details: <a href="${sheetUrl}" target="_blank" style="color:#2563eb; font-weight:600;">${summary.sheetName || sheetName}</a> (sheet tab).
      </p>
    </body>
  </html>
  `;

  MailApp.sendEmail({
    to: distro.join(','),
    subject: 'Website + Amazon Order Lead Time - Daily & 7-Day Avg (awaiting-shipment -> completed)',
    htmlBody: body,
    name: buildSenderName(cfg.customerName, 'Reports')
  });

  console.log('Website/Amazon lead-time email sent.');
}

function loadAmzWebsiteLeadTimeFromSheet(cfg) {
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sheet = ss.getSheetByName('Website + Amazon Fulfillment Lead Time');
  if (!sheet) throw new Error('Missing sheet "Website + Amazon Fulfillment Lead Time"');

  const data = sheet.getDataRange().getValues();
  if (!data.length) return null;
  const rollingCount = Number(data[1]?.[1] || 0);
  const rollingAvgDays = Number(data[1]?.[2] || 0);
  const rollingAvgMs = rollingAvgDays * 24 * 60 * 60 * 1000;

  const weekendDisplay = (val) => {
    const tryDate = (v) => {
      if (v instanceof Date) return v;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };
    const d = tryDate(val);
    if (!d) return String(val || '');
    const day = Utilities.formatDate(d, CENTRAL_TIMEZONE, 'EEE');
    const base = Utilities.formatDate(d, CENTRAL_TIMEZONE, 'MM/dd/yyyy');
    if (day === 'Sat' || day === 'Sun') return `${base} (${day})`;
    return base;
  };

  const dailyRows = [];
  for (let r = 4; r < data.length; r++) {
    const date = weekendDisplay(data[r][0]);
    const count = data[r][1];
    const avgDays = data[r][2];
    const avgFmt = data[r][3];
    if (!date) break;
    dailyRows.push([date, count, avgDays, avgFmt]);
  }
  return { rollingCount, rollingAvgDays, rollingAvgMs, dailyRows, rollDays: 7, sheetName: 'Website + Amazon Fulfillment Lead Time' };
}
