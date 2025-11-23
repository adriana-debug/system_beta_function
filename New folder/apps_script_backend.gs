// Google Apps Script for Employee Performance & Disciplinary Records System
// This script handles all CRUD operations for the coaching logs system including IR and NTE

// CONFIGURATION
const SPREADSHEET_ID = '1wMO2XX2xlp-2zERmzZxhdxHXooB10rBAKhI2MiPQ328'; // Replace with your Google Sheet ID
const SHEET_NAME = 'CoachingLogs'; // Main sheet name
const CAMPAIGNS_SHEET = 'Coding_System'; // Campaign coding system sheet

// Column mapping (0-based index) - UPDATED TO MATCH HTML
const COLUMNS = {
  DATE: 0,
  DOC_ID: 1,
  CAMPAIGN: 2,
  DOCUMENT_TYPE: 3,
  COACH: 4,
  EMPLOYEE: 5,
  EMPLOYEE_NUMBER: 6,
  POSITION: 7,
  DEPARTMENT: 8,
  SUBJECT: 9,
  DATE_OF_INCIDENT: 10,
  PLACE_OF_INCIDENT: 11,
  WITNESS_NAME: 12,
  WITNESS_POSITION: 13,
  PERFORMANCE: 14,
  COACHING_PROVIDED: 15,
  ACTION_PLAN: 16,
  ACKNOWLEDGE: 17,
  SIGNED_FORM: 18,
  EVIDENCE: 19,
  SIGNED_IMAGE: 20,
  SUPERVISOR_SIGNED_IMAGE: 21
};

// GET request handler is defined below and also handles delete when requested

// POST request handler - FIXED to handle delete requests properly
function doPost(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'deleteCoachingRecord') {
      // Delete can come as GET or POST parameter
      const rowIndex = e.parameter.rowIndex;
      if (!rowIndex) {
        throw new Error('Missing rowIndex parameter');
      }
      return deleteCoachingRecord(rowIndex);
    }
    
    if (!e.postData || !e.postData.contents) {
      throw new Error('No post data received');
    }
    
    const data = JSON.parse(e.postData.contents);
    
    if (action === 'addCoachingRecord') {
      return addCoachingRecord(data);
    } else if (action === 'updateCoachingRecord') {
      return updateCoachingRecord(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle both GET and POST for delete - FIXED
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getCoachingData') {
      return getCoachingData();
    } else if (action === 'getCampaigns') {
      return getCampaigns();
    } else if (action === 'deleteCoachingRecord') {
      // Handle delete from GET request
      const rowIndex = e.parameter.rowIndex;
      if (!rowIndex) {
        throw new Error('Missing rowIndex parameter');
      }
      return deleteCoachingRecord(rowIndex);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get campaigns from Coding_System sheet
function getCampaigns() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CAMPAIGNS_SHEET);
    
    if (!sheet) {
      throw new Error('Campaigns sheet not found: ' + CAMPAIGNS_SHEET);
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 2); // Campaign and Pseudo Name columns
    const values = dataRange.getValues();
    
    const campaigns = values.map(row => {
      return {
        CampaignName: row[0] || '',
        PseudoName: row[1] || ''
      };
    }).filter(campaign => campaign.CampaignName);
    
    return ContentService.createTextOutput(JSON.stringify(campaigns))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in getCampaigns: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get all coaching data from spreadsheet
function getCoachingData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 22);
    const values = dataRange.getValues();
    
    const coachingLogs = values.map((row, index) => {
      return {
        rowIndex: index + 2,
        Date: row[COLUMNS.DATE] ? formatDate(row[COLUMNS.DATE]) : '',
        DocID: row[COLUMNS.DOC_ID] || '',
        Campaign: row[COLUMNS.CAMPAIGN] || '',
        DocumentType: row[COLUMNS.DOCUMENT_TYPE] || '',
        Coach: row[COLUMNS.COACH] || '',
        Employee: row[COLUMNS.EMPLOYEE] || '',
        EmployeeNumber: row[COLUMNS.EMPLOYEE_NUMBER] || '',
        Position: row[COLUMNS.POSITION] || '',
        Department: row[COLUMNS.DEPARTMENT] || '',
        Subject: row[COLUMNS.SUBJECT] || '',
        DateOfIncident: row[COLUMNS.DATE_OF_INCIDENT] ? formatDate(row[COLUMNS.DATE_OF_INCIDENT]) : '',
        PlaceOfIncident: row[COLUMNS.PLACE_OF_INCIDENT] || '',
        WitnessName: row[COLUMNS.WITNESS_NAME] || '',
        WitnessPosition: row[COLUMNS.WITNESS_POSITION] || '',
        Performance: row[COLUMNS.PERFORMANCE] || '',
        CoachingProvided: row[COLUMNS.COACHING_PROVIDED] || '',
        ActionPlan: row[COLUMNS.ACTION_PLAN] || '',
        Acknowledge: row[COLUMNS.ACKNOWLEDGE] || '',
        SignedForm: row[COLUMNS.SIGNED_FORM] || '',
        Evidence: row[COLUMNS.EVIDENCE] || '',
        SignedImage: row[COLUMNS.SIGNED_IMAGE] || '',
        SupervisorSignedImage: row[COLUMNS.SUPERVISOR_SIGNED_IMAGE] || ''
      };
    }).filter(log => log.Date || log.Employee);
    
    return ContentService.createTextOutput(JSON.stringify(coachingLogs))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in getCoachingData: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to format dates consistently
function formatDate(dateValue) {
  try {
    if (!dateValue) return '';
    
    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) return '';
    
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch (error) {
    Logger.log('Error formatting date: ' + error.toString());
    return '';
  }
}

// Helper function to parse date from string
function parseDate(dateString) {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date;
  } catch (error) {
    Logger.log('Error parsing date: ' + error.toString());
    return '';
  }
}

// Generate next Doc ID by scanning existing Doc ID column values
function generateNextDocId(sheet, documentType, campaignName, dateObj) {
  try {
    const typePrefix = {
      'Coaching Log': 'CS',
      'Verbal Warning': 'VW',
      'Written Warning': 'WW',
      'Final Warning': 'FW',
      '4th Written Warning': '4W',
      '1 Day Suspension': '1S',
      '3 Day Suspension': '3S',
      'Dismissal': 'DM',
      'Incident Report': 'IR',
      'Notice to Explain': 'NTE'
    };

    const prefix = typePrefix[documentType] || 'DOC';

    // Find campaign pseudo name from CAMPAIGNS_SHEET
    let campaignCode = 'UNK';
    try {
      const cpSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CAMPAIGNS_SHEET);
      if (cpSheet) {
        const last = cpSheet.getLastRow();
        if (last > 1) {
          const vals = cpSheet.getRange(2, 1, last - 1, 2).getValues();
          for (let i = 0; i < vals.length; i++) {
            const name = vals[i][0] ? vals[i][0].toString().trim() : '';
            const pseudo = vals[i][1] ? vals[i][1].toString().trim() : '';
            const campaignInput = campaignName ? campaignName.toString().trim() : '';
            if (name && campaignInput && name.toLowerCase() === campaignInput.toLowerCase()) {
              campaignCode = pseudo || name.replace(/\s+/g, '');
              Logger.log('Campaign matched: ' + name + ' => ' + campaignCode);
              break;
            }
          }
        }
      }
    } catch (e) {
      Logger.log('Error in campaign lookup: ' + e.toString());
      campaignCode = campaignName ? campaignName.toString().replace(/\s+/g, '') : 'UNK';
    }

    // Format year/month
    const year = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yy');
    const month = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'MM');

    const pattern = '^DMI-' + prefix + '-' + campaignCode + '-' + year + month + '-(\\d+)$';
    const re = new RegExp(pattern);

    const lastRow = sheet.getLastRow();
    let maxSeq = 0;
    if (lastRow >= 2) {
      const docIdCol = COLUMNS.DOC_ID + 1; // 1-based
      const vals = sheet.getRange(2, docIdCol, lastRow - 1, 1).getValues();
      Logger.log('Scanning ' + vals.length + ' rows for pattern: ' + pattern);
      for (let i = 0; i < vals.length; i++) {
        const v = vals[i][0];
        const vStr = v ? String(v).trim() : '';
        if (vStr) {
          Logger.log('Row ' + (i + 2) + ' DocID raw: ' + v + ' => string: ' + vStr);
          const m = vStr.match(re);
          if (m && m[1]) {
            const n = parseInt(m[1], 10);
            Logger.log('  Match found! Sequence: ' + n);
            if (!isNaN(n) && n > maxSeq) maxSeq = n;
          } else {
            Logger.log('  No match for pattern');
          }
        }
      }
    }
    Logger.log('Final maxSeq: ' + maxSeq);

    const next = maxSeq + 1;
    const seqStr = ('0000' + next).slice(-4);
    const result = 'DMI-' + prefix + '-' + campaignCode + '-' + year + month + '-' + seqStr;
    Logger.log('Generated DocID: ' + result + ' (prefix=' + prefix + ', campaign=' + campaignCode + ', yymm=' + year + month + ', seq=' + seqStr + ')');
    return result;
  } catch (error) {
    Logger.log('Error generating DocID: ' + error.toString());
    return '';
  }
}

// Add new coaching record - FIXED with validation
function addCoachingRecord(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    // Validate required fields
    if (!data.Employee || !data.DocumentType || !data.Campaign) {
      throw new Error('Missing required fields: Employee, DocumentType, or Campaign');
    }
    
    // Ensure date object
    const dateObj = parseDate(data.Date) || new Date();

    // Generate DocID if not provided
    let docId = '';
    if (data.DocID && data.DocID.toString().trim()) {
      docId = data.DocID.toString().trim();
    } else {
      docId = generateNextDocId(sheet, data.DocumentType || '', data.Campaign || '', dateObj);
    }

    const newRow = [
      dateObj,
      docId,
      data.Campaign || '',
      data.DocumentType || '',
      data.Coach || '',
      data.Employee || '',
      data.EmployeeNumber || '',
      data.Position || '',
      data.Department || '',
      data.Subject || '',
      parseDate(data.DateOfIncident) || '',
      data.PlaceOfIncident || '',
      data.WitnessName || '',
      data.WitnessPosition || '',
      data.Performance || '',
      data.CoachingProvided || '',
      data.ActionPlan || '',
      data.Acknowledge || '',
      data.SignedForm || '',
      data.Evidence || '',
      data.SignedImage || '',
      data.SupervisorSignedImage || ''
    ];

    // Append the new row (now includes DocID column)
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Record added successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in addCoachingRecord: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Update existing coaching record - FIXED with validation
function updateCoachingRecord(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const rowIndex = parseInt(data.rowIndex);
    
    if (!rowIndex || rowIndex < 2) {
      throw new Error('Invalid row index: ' + data.rowIndex);
    }
    
    // Check if row exists
    if (rowIndex > sheet.getLastRow()) {
      throw new Error('Row does not exist');
    }
    
    // Preserve existing DocID if not provided
    const existingDocId = sheet.getRange(rowIndex, COLUMNS.DOC_ID + 1).getValue();
    const dateObj = parseDate(data.Date) || new Date();
    let docId = existingDocId || '';
    if (data.DocID && data.DocID.toString().trim()) {
      docId = data.DocID.toString().trim();
    }

    const updatedRow = [
      dateObj,
      docId,
      data.Campaign || '',
      data.DocumentType || '',
      data.Coach || '',
      data.Employee || '',
      data.EmployeeNumber || '',
      data.Position || '',
      data.Department || '',
      data.Subject || '',
      parseDate(data.DateOfIncident) || '',
      data.PlaceOfIncident || '',
      data.WitnessName || '',
      data.WitnessPosition || '',
      data.Performance || '',
      data.CoachingProvided || '',
      data.ActionPlan || '',
      data.Acknowledge || '',
      data.SignedForm || '',
      data.Evidence || '',
      data.SignedImage || '',
      data.SupervisorSignedImage || ''
    ];

    const range = sheet.getRange(rowIndex, 1, 1, 22);
    range.setValues([updatedRow]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Record updated successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in updateCoachingRecord: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Delete coaching record - FIXED with proper validation
function deleteCoachingRecord(rowIndex) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const row = parseInt(rowIndex);
    
    if (!row || row < 2) {
      throw new Error('Invalid row index: ' + rowIndex);
    }
    
    // Check if row exists before deleting
    if (row > sheet.getLastRow()) {
      throw new Error('Row does not exist');
    }
    
    sheet.deleteRow(row);
    
    Logger.log('Record deleted: Row ' + row);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Record deleted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in deleteCoachingRecord: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to create initial sheet structure (run once manually)
function setupSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    
    const headers = [
      'Date',
      'Doc ID',
      'Campaign',
      'Document Type',
      'Supervisor/Coach',
      'Employee Name',
      'Employee Number',
      'Position',
      'Department',
      'Subject',
      'Date of Incident',
      'Place of Incident',
      'Witness Name',
      'Witness Position',
      'Performance/Behavior Observed',
      'Coaching/Corrective Action Provided',
      'Action Plan/Expected Improvement',
      'Acknowledged',
      'Signed Form Link',
      'Evidence Link',
      'Employee Signature (Base64)',
      'Supervisor Signature (Base64)'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1e293b');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    headerRange.setWrap(true);
    
    // Set column widths (added Doc ID at column 2)
    sheet.setColumnWidth(1, 120);  // Date
    sheet.setColumnWidth(2, 160);  // Doc ID
    sheet.setColumnWidth(3, 150);  // Campaign
    sheet.setColumnWidth(4, 180);  // Document Type
    sheet.setColumnWidth(5, 150);  // Supervisor
    sheet.setColumnWidth(6, 150);  // Employee Name
    sheet.setColumnWidth(7, 120);  // Employee Number
    sheet.setColumnWidth(8, 120);  // Position
    sheet.setColumnWidth(9, 150);  // Department
    sheet.setColumnWidth(10, 200); // Subject
    sheet.setColumnWidth(11, 120); // Date of Incident
    sheet.setColumnWidth(12, 150); // Place of Incident
    sheet.setColumnWidth(13, 150); // Witness Name
    sheet.setColumnWidth(14, 150); // Witness Position
    sheet.setColumnWidth(15, 300); // Performance
    sheet.setColumnWidth(16, 300); // Coaching Provided
    sheet.setColumnWidth(17, 300); // Action Plan
    sheet.setColumnWidth(18, 100); // Acknowledged
    sheet.setColumnWidth(19, 150); // Signed Form Link
    sheet.setColumnWidth(20, 150); // Evidence Link
    sheet.setColumnWidth(21, 100); // Employee Signature
    sheet.setColumnWidth(22, 100); // Supervisor Signature
    
    sheet.setFrozenRows(1);
    
    sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('K2:K').setNumberFormat('yyyy-mm-dd');
    
    Logger.log('Sheet setup completed successfully');
    
  } catch (error) {
    Logger.log('Error in setupSheet: ' + error.toString());
    throw error;
  }
}

// Test function to verify connection
function testConnection() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log('ERROR: Sheet not found');
      return false;
    }
    Logger.log('SUCCESS: Connection verified');
    Logger.log('Sheet name: ' + sheet.getName());
    Logger.log('Last row: ' + sheet.getLastRow());
    return true;
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return false;
  }
}

// Migration helper: fill missing DocID values for existing rows
function fillMissingDocIds() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return {message: 'No data rows'};

    // Read full rows (we expect at least 22 columns now)
    const data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();

    for (let i = 0; i < data.length; i++) {
      const rowNum = i + 2;
      const docIdVal = data[i][COLUMNS.DOC_ID] || '';
      if (!docIdVal || String(docIdVal).trim() === '') {
        const dateVal = data[i][COLUMNS.DATE];
        const dateObj = dateVal instanceof Date ? dateVal : (parseDate(dateVal) || new Date());
        const documentType = data[i][COLUMNS.DOCUMENT_TYPE] || '';
        const campaignName = data[i][COLUMNS.CAMPAIGN] || '';
        const newDocId = generateNextDocId(sheet, documentType, campaignName, dateObj);
        if (newDocId) {
          sheet.getRange(rowNum, COLUMNS.DOC_ID + 1).setValue(newDocId);
        }
      }
    }

    return {success: true, message: 'Missing DocIDs filled'};
  } catch (error) {
    Logger.log('Error in fillMissingDocIds: ' + error.toString());
    throw error;
  }
}
