
const CONFIG = {
  SPREADSHEET_ID: '18eGiDAmDD90kWubqJIUSwW80PNls4jhAwb6nCpkMpYw',
  SHEETS: {
    APPLICANTS: 'Applicants',
    SCREENINGS: 'Screenings',
    TESTS: 'Tests'
  }
};

/**
 * API ENTRY (GET)
 */
function doGet(e) {
  try {
    // API GET endpoints
    if (e && e.parameter && e.parameter.action === 'getApplicants') {
      return jsonResponse(getApplicants());
    }

    if (e && e.parameter && e.parameter.action) {
      return jsonResponse({ error: 'Invalid GET action' }, 400);
    }

    // No action: serve the UI file when accessed in a browser
    return HtmlService.createHtmlOutputFromFile('Index');
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

/**
 * API ENTRY (POST)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action;

    if (action === 'addApplicant') {
      addApplicant(data.payload);
      return jsonResponse({ success: true });
    }

    if (action === 'updateStatus') {
      updateStatus(data.payload);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Invalid POST action' }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

/**
 * Fetch all applicants
 */
function getApplicants() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ensureSheet(ss, CONFIG.SHEETS.APPLICANTS, ['applicant_id','full_name','email','created_at','status','evaluator','assessment_link']);
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return [];

    // Normalize headers to predictable keys (trim, lowercase, underscores)
    const rawHeaders = rows.shift();
    const headers = rawHeaders.map(h => String(h || '').trim());
    const keys = headers.map(h => h.toLowerCase().replace(/\s+/g, '_'));

    return rows.map(r => {
      const obj = {};
      keys.forEach((k, i) => {
        let val = r[i];
        // Convert Date objects to ISO-like string for client
        if (val instanceof Date) {
          try { val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'UTC', 'yyyy-MM-dd HH:mm'); } catch (e) { val = val.toString(); }
        }
        obj[k] = val;
      });
      return obj;
    });
  } catch (err) {
    return { error: 'Server error: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Simple health check for debugging from client
 */
function healthCheck() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    return { ok: true, sheets: ss.getSheets().map(s => s.getName()) };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

/**
 * Add applicant
 */
function addApplicant(app) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ensureSheet(ss, CONFIG.SHEETS.APPLICANTS, ['applicant_id','full_name','email','created_at','status','evaluator','assessment_link']);

  sheet.appendRow([
    Utilities.getUuid(),
    app.full_name,
    app.email,
    new Date(),
    'Not started',
    app.evaluator || 'Not assigned',
    app.assessment_link || ''
  ]);
}

/**
 * Update status
 */
function updateStatus({ applicant_id, status }) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEETS.APPLICANTS);
  if (!sheet) throw new Error('Applicants sheet not found');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === applicant_id) {
      // status column index is 5 (1-based), matching header 'status'
      sheet.getRange(i + 1, 5).setValue(status);
      return;
    }
  }
}

/**
 * Return runtime config to clients
 */
function getConfig() {
  return CONFIG;
}

/**
 * Ensure a sheet exists and has header row. Returns the sheet.
 */
function ensureSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const last = sheet.getLastRow();
  if (last === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

/**
 * JSON Response helper
 */
function jsonResponse(obj, code = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
