/**
 * NTE Web App - REST style endpoints for CRUD + preview
 * IMPORTANT: Replace SPREADSHEET_ID with your actual spreadsheet ID.
 */

const SPREADSHEET_ID = '1-a_L3bDJN7cA6HWzBmevFv4vqhVXvIVs-2gCSx31RgU'; // <-- UPDATE THIS LINE
const NTE_SHEET_NAME = 'NTE_Forms';


function doGet(e) {
  try {
    const action = (e.parameter.action || '').toString();

    if (action === 'getIRNTE') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'OK',
        data: _readAllRecords(NTE_SHEET_NAME)
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'preview' && e.parameter.id) {
      // returns JSON with pages array (two pages) for previewing
      const id = parseInt(e.parameter.id, 10);
      const row = _findRecordById(NTE_SHEET_NAME, id);
      if (!row) throw new Error('Record not found');
      
      // Pass the complete record to the preview builder
      const pages = _buildTwoPagePreview(row);
      
      const fileName = `NTE_${row.employeeName.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown'}_${row.id}`;
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'OK', documentName: fileName, pages })).setMimeType(ContentService.MimeType.JSON);
    }

    // Default: serve a helpful message
    return ContentService.createTextOutput(HtmlService.createTemplateFromFile('nte_log').evaluate().getContent());

  } catch (err) {
    Logger.log(`doGet Error: ${err.message}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Ensure postData is parsed correctly
    const postData = e.postData;
    if (!postData || postData.type !== 'application/json') {
      throw new Error('Invalid or missing JSON data in request.');
    }
    
    const body = JSON.parse(postData.contents);
    const action = (body.action || '').toString();

    if (action === 'createIRNTE') {
      const newId = _createRecord(NTE_SHEET_NAME, body.data || {});
      return ContentService.createTextOutput(JSON.stringify({ status: 'OK', id: newId })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'updateIRNTE') {
      const updated = _updateRecord(NTE_SHEET_NAME, body.data || {});
      return ContentService.createTextOutput(JSON.stringify({ status: 'OK', updated })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'deleteIRNTE') {
      const id = parseInt(body.id, 10);
      const deleted = _deleteRecord(NTE_SHEET_NAME, id);
      return ContentService.createTextOutput(JSON.stringify({ status: 'OK', deleted })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', error: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log(`doPost Error: ${err.message}`);
    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Accesses the specified sheet by name.
 * @param {string} sheetName The name of the sheet.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The sheet object.
 */
function _getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error(`Sheet '${sheetName}' not found in the spreadsheet ID: ${SPREADSHEET_ID}`);
  return sh;
}

/* ------------------------- Helpers: Spreadsheet CRUD ------------------------- */

/**
 * Reads all records from a sheet and maps them to camelCase objects.
 * @param {string} sheetName The name of the sheet.
 * @returns {Object[]} Array of records.
 */
function _readAllRecords(sheetName) {
  const sh = _getSheet(sheetName);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return []; // Only headers or empty sheet
  
  const headers = values.shift().map(h => String(h).trim());
  const out = values.map((row, idx) => {
    const obj = {};
    headers.forEach((h, i) => obj[_toCamel(h)] = row[i]);
    
    // Ensure ID is properly set from the 'ID' column
    const idColIndex = headers.indexOf('ID');
    if (idColIndex !== -1 && row[idColIndex]) {
      obj.id = Number(row[idColIndex]);
    } else {
      // Fallback: use row index if ID column is missing or empty (not recommended for production)
      obj.id = idx + 2; 
    }
    
    // Internal row index for sheet manipulation (1-based index)
    obj._rowIndex = idx + 2;
    return obj;
  });
  return out;
}

/**
 * Finds a single record by its ID.
 * @param {string} sheetName The name of the sheet.
 * @param {number} id The ID of the record.
 * @returns {Object | undefined} The found record or undefined.
 */
function _findRecordById(sheetName, id) {
  const all = _readAllRecords(sheetName);
  return all.find(r => Number(r.id) === Number(id));
}

/**
 * Creates a new record in the sheet.
 * @param {string} sheetName The name of the sheet.
 * @param {Object} data The data object to insert.
 * @returns {number} The ID of the newly created record.
 */
function _createRecord(sheetName, data) {
  const sh = _getSheet(sheetName);
  const headers = sh.getDataRange().getValues()[0].map(h => String(h).trim());
  
  // Calculate the next ID (max current ID + 1 or next row number)
  let nextId = sh.getLastRow() + 1;
  const idCol = headers.indexOf('ID');
  
  if (idCol >= 0) {
    const idValues = sh.getRange(2, idCol + 1, sh.getLastRow() - 1, 1).getValues().flat().filter(Number);
    if (idValues.length > 0) {
      nextId = Math.max(...idValues) + 1;
    }
  }

  // Prepare row following headers order
  const row = headers.map(h => {
    if (h === 'ID') return nextId;
    return data[_toCamel(h)] || '';
  });
  
  sh.appendRow(row);
  return nextId;
}

/**
 * Updates an existing record in the sheet.
 * @param {string} sheetName The name of the sheet.
 * @param {Object} data The data object containing the ID and updated fields.
 * @returns {boolean} True if updated.
 */
function _updateRecord(sheetName, data) {
  if (!data.id) throw new Error('Missing id for update');
  const id = Number(data.id);
  const sh = _getSheet(sheetName);
  const headers = sh.getDataRange().getValues()[0].map(h => String(h).trim());
  
  const idCol = headers.indexOf('ID');
  if (idCol < 0) throw new Error('Sheet missing required ID column.');
  
  // Find the row index by looking up the ID column values
  const idValues = sh.getRange(2, idCol + 1, sh.getLastRow() - 1, 1).getValues().flat();
  const idx = idValues.findIndex(v => Number(v) === id);
  
  if (idx < 0) throw new Error(`Record with ID ${id} not found.`);
  
  const rowIndex = idx + 2; // Data starts at row 2 (index 1)
  const existingRowValues = sh.getRange(rowIndex, 1, 1, headers.length).getValues()[0];

  // Build update values in header order, preserving existing values if not provided
  const updateRow = headers.map((h, i) => {
    const camelH = _toCamel(h);
    // If the data object has a value for this field, use it. Otherwise, use the existing value.
    if (typeof data[camelH] !== 'undefined' && data[camelH] !== null) {
      return data[camelH];
    }
    return existingRowValues[i];
  });
  
  sh.getRange(rowIndex, 1, 1, updateRow.length).setValues([updateRow]);
  return true;
}

/**
 * Deletes a record from the sheet.
 * @param {string} sheetName The name of the sheet.
 * @param {number} id The ID of the record to delete.
 * @returns {boolean} True if deleted.
 */
function _deleteRecord(sheetName, id) {
  const sh = _getSheet(sheetName);
  const headers = sh.getDataRange().getValues()[0].map(h => String(h).trim());
  const idCol = headers.indexOf('ID');
  
  if (idCol < 0) throw new Error('Sheet missing ID column');
  
  const idValues = sh.getRange(2, idCol + 1, sh.getLastRow() - 1, 1).getValues().flat();
  const idx = idValues.findIndex(v => Number(v) === Number(id));
  
  if (idx < 0) throw new Error('Record not found');
  
  sh.deleteRow(idx + 2);
  return true;
}

/**
 * Converts a string to camelCase.
 * @param {string} s The string to convert.
 * @returns {string} The camelCase string.
 */
function _toCamel(s) {
  return String(s || '').replace(/[^a-zA-Z0-9 ]+/g, '').split(' ').map((w, i) => i ? w.charAt(0).toUpperCase() + w.slice(1) : w.toLowerCase()).join('');
}

/* ------------------------- Preview Generator (HTML Builder) ------------------------- */

/**
 * Builds the two-page HTML preview (IR and NTE).
 * @param {Object} record The record data object.
 * @returns {string[]} An array containing two HTML strings.
 */
function _buildTwoPagePreview(record) {
  // Map and sanitize record data for template use
  const r = {
    id: record.id,
    employeeName: record.employeeName,
    employeeNumber: record.employeeNumber,
    dateIssued: record.dateIssued ? new Date(record.dateIssued).toLocaleDateString() : 'N/A',
    department: record.positionDepartment || record.department || 'N/A', 
    supervisor: record.supervisor,
    // Use narrationOfIncident for IR, and explanation for NTE. Fallback logic included.
    narration: record.narrationOfIncident,
    explanation: record.explanation,
    consequence: record.consequence,
    codeNumber: record.id,
    dateOfIncident: record.dateOfIncident ? new Date(record.dateOfIncident).toLocaleDateString() : 'N/A',
    placeOfIncident: record.placeOfIncident,
  };
  
  const irHtml = _renderIRPage(r);
  const nteHtml = _renderNTEPage(r);
  return [irHtml, nteHtml];
}

/**
 * Renders the Incident Report (IR) page HTML.
 * @param {Object} r The sanitized record data.
 * @returns {string} The complete HTML string for the IR page.
 */
function _renderIRPage(r) {
  // Minimal sanitized template for IR (page 1)
  const narration = _esc(r.narration || 'No narration provided.');
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:1in;}body{font-family:Arial, sans-serif;font-size:12px;color:#222;margin:0;padding:1rem}h1{text-align:center;border-bottom:2px solid #444;padding-bottom:6px;}table{width:100%;border-collapse:collapse}td{padding:6px;border:1px solid #bbb} .label{font-weight:700;background:#f5f5f5;width:25%}.incident-details{margin-top:10px}</style></head><body><h1>Incident Report (IR)</h1><table><tr><td class="label">Employee Name</td><td>${_esc(r.employeeName)}</td><td class="label">Employee No.</td><td>${_esc(r.employeeNumber)}</td></tr><tr><td class="label">Date Issued</td><td>${r.dateIssued}</td><td class="label">Supervisor</td><td>${_esc(r.supervisor)}</td></tr><tr><td class="label">Department</td><td colspan="3">${_esc(r.department)}</td></tr></table><div class="incident-details"><h2>Incident Details</h2><table><tr><td class="label">Date of Incident</td><td>${r.dateOfIncident}</td><td class="label">Place of Incident</td><td>${_esc(r.placeOfIncident || 'N/A')}</td></tr></table></div><h2>Narration of Incident</h2><div style="border:1px solid #ccc;padding:10px;min-height:180px;white-space:pre-wrap;text-align:justify">${narration}</div><div style="margin-top: 30px; border-top: 1px dashed #999; padding-top: 10px; font-size: 10px;">Submitted by: ${_esc(r.supervisor)}<br>Date: ${r.dateIssued}</div><footer style="margin-top:20px;font-size:11px;color:#666;">IR Code: ${_esc(r.codeNumber)} - Page 1 of 2</footer></body></html>`;
}

/**
 * Renders the Notice to Explain (NTE) page HTML.
 * @param {Object} r The sanitized record data.
 * @returns {string} The complete HTML string for the NTE page.
 */
function _renderNTEPage(r) {
  const explanation = _esc(r.explanation || r.narration || 'Employee is requested to provide a detailed explanation of the incident.');
  const consequence = _esc(r.consequence || 'The possible consequences may include disciplinary action up to and including termination, depending on the severity of the offense and the employee\'s prior record.');
  
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:1in;}body{font-family:Arial, sans-serif;font-size:12px;color:#222;margin:0;padding:1rem}h1{text-align:center;border-bottom:2px solid #444;padding-bottom:6px;}table{width:100%;border-collapse:collapse}td{padding:6px;border:1px solid #bbb} .label{font-weight:700;background:#f5f5f5;width:25%}.signature-block{margin-top:60px;display:flex;justify-content:space-between;font-size:11px;width:100%;}.signature-line{border-top:1px solid #000;padding-top:5px;width:45%;text-align:center;}</style></head><body><h1>Notice to Explain (NTE)</h1><table><tr><td class="label">Employee Name</td><td>${_esc(r.employeeName)}</td><td class="label">Employee No.</td><td>${_esc(r.employeeNumber)}</td></tr><tr><td class="label">Date Issued</td><td>${r.dateIssued}</td><td class="label">Supervisor</td><td>${_esc(r.supervisor)}</td></tr><tr><td class="label">Department</td><td colspan="3">${_esc(r.department)}</td></tr></table><h2>Alleged Violation Details / Required Explanation</h2><div style="border:1px solid #ccc;padding:10px;min-height:180px;white-space:pre-wrap;text-align:justify">${explanation}</div><h2>Possible Consequence (For Information)</h2><div style="border:1px solid #ccc;padding:10px;min-height:80px;white-space:pre-wrap;font-style:italic">${consequence}</div><p style="margin-top:20px;">You are required to submit your written explanation within 48 hours from receipt of this notice.</p><div class="signature-block"><div class="signature-line">Employee Signature over Printed Name / Date</div><div class="signature-line">Issuing Officer Signature over Printed Name / Date</div></div><footer style="margin-top:20px;font-size:11px;color:#666;">NTE Code: ${_esc(r.codeNumber)} - Page 2 of 2</footer></body></html>`;
}

/**
 * Escapes HTML special characters.
 * @param {any} v The value to escape.
 * @returns {string} The escaped string.
 */
function _esc(v) {
  if (v === null || typeof v === 'undefined') return '';
  // Convert date objects to string before replacing
  const str = String(v instanceof Date ? v.toISOString().split('T')[0] : v); 
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
