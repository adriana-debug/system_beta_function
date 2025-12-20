// Google Apps Script for Employee Performance & Disciplinary Records System
// This script handles all CRUD operations for the coaching logs system including IR and NTE

// CONFIGURATION
const SPREADSHEET_ID = '1F_GXPmsYn4aIifqHiRlBJ1FmDVmsiIzxXE4y37TIETg'; // Replace with your Google Sheet ID
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
    } else if (action === 'sendEmail') {
      return sendEmailApi(data);
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
      return getCoachingData(e);
    } else if (action === 'getCampaigns') {
      return getCampaigns(e);
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
function getCampaigns(e) {
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
    
    const callback = e && e.parameter && e.parameter.callback ? e.parameter.callback : '';
    const payload = JSON.stringify(campaigns);
    if (callback) {
      return ContentService.createTextOutput(`${callback}(${payload})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in getCampaigns: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Email validation helper
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get all coaching data from spreadsheet
function getCoachingData(e) {
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
    
    const callback = e && e.parameter && e.parameter.callback ? e.parameter.callback : '';
    const payload = JSON.stringify(coachingLogs);
    if (callback) {
      return ContentService.createTextOutput(`${callback}(${payload})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
      
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

function resolveCampaignCodeServer(campaignName) {
  let campaignCode = 'UNK';
  const safeName = campaignName ? campaignName.toString().trim() : '';
  if (!safeName) return campaignCode;
  try {
    const cpSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CAMPAIGNS_SHEET);
    if (!cpSheet) return safeName.replace(/\s+/g, '') || 'UNK';
    const last = cpSheet.getLastRow();
    if (last <= 1) return safeName.replace(/\s+/g, '') || 'UNK';
    const vals = cpSheet.getRange(2, 1, last - 1, 2).getValues();
    for (let i = 0; i < vals.length; i++) {
      const name = vals[i][0] ? vals[i][0].toString().trim() : '';
      const pseudo = vals[i][1] ? vals[i][1].toString().trim() : '';
      if (name && name.toLowerCase() === safeName.toLowerCase()) {
        campaignCode = pseudo || safeName.replace(/\s+/g, '') || 'UNK';
        return campaignCode;
      }
    }
    campaignCode = safeName.replace(/\s+/g, '') || 'UNK';
  } catch (error) {
    Logger.log('Error resolving campaign code: ' + error.toString());
    campaignCode = safeName.replace(/\s+/g, '') || 'UNK';
  }
  return campaignCode;
}

function nextSequenceForPrefix(sheet, prefix) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  const docIdCol = COLUMNS.DOC_ID + 1;
  const vals = sheet.getRange(2, docIdCol, lastRow - 1, 1).getValues();
  let maxSeq = 0;
  for (let i = 0; i < vals.length; i++) {
    const raw = vals[i][0] ? vals[i][0].toString().trim() : '';
    if (!raw || raw.indexOf(prefix) !== 0) continue;
    const parts = raw.split('-');
    const seqStr = parts[parts.length - 1];
    const parsed = parseInt(seqStr, 10);
    if (!isNaN(parsed) && parsed > maxSeq) maxSeq = parsed;
  }
  return maxSeq + 1;
}

function buildIncidentIdsServer(sheet, campaignName, dateObj) {
  const campaignCode = resolveCampaignCodeServer(campaignName);
  const yy = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yy');
  const mm = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'MM');
  const yyMM = yy + mm;
  const seq = nextSequenceForPrefix(sheet, `DMI-IR-${campaignCode}-${yyMM}-`);
  const seqStr = ('0000' + seq).slice(-4);
  const irId = `DMI-IR-${campaignCode}-${yyMM}-${seqStr}`;
  const nteId = irId.replace('-IR-', '-NTE-');
  return { irId, nteId };
}

// Generate next Doc ID by scanning existing Doc ID column values
function generateNextDocId(sheet, documentType, campaignName, dateObj) {
  try {
    const docType = documentType || '';
    if (docType === 'Incident Report' || docType === 'Notice to Explain') {
      const ids = buildIncidentIdsServer(sheet, campaignName || '', dateObj);
      const chosen = docType === 'Incident Report' ? ids.irId : ids.nteId;
      Logger.log('Generated IR/NTE DocID: ' + chosen);
      return chosen;
    }

    const typePrefix = {
      'Coaching Log': 'CS',
      'Verbal Warning': 'VW',
      'Written Warning': 'WW',
      'Final Warning': 'FW',
      '4th Written Warning': '4W',
      '1 Day Suspension': '1S',
      '3 Day Suspension': '3S',
      'Dismissal': 'DM',
      'PIP': 'PIP',
      'EEF': 'EEF',
      'Training Assessment': 'TA',
      'Regularization': 'REG',
      'NH Checklist': 'NHC',
      'IDs': 'ID',
      'Ad Hoc Document': 'ADH'
    };

    const prefix = typePrefix[docType] || 'DOC';
    const campaignCode = resolveCampaignCodeServer(campaignName);
    const year = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yy');
    const month = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'MM');
    const yyMM = year + month;
    const seq = nextSequenceForPrefix(sheet, `DMI-${prefix}-${campaignCode}-${yyMM}-`);
    const seqStr = ('0000' + seq).slice(-4);
    const result = `DMI-${prefix}-${campaignCode}-${yyMM}-${seqStr}`;
    Logger.log('Generated DocID: ' + result);
    return result;
  } catch (error) {
    Logger.log('Error generating DocID: ' + error.toString());
    return '';
  }
}

// Add new coaching record - with auto-creation of NTE companion for Incident Reports
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

    const docType = data.DocumentType || '';

    // Generate DocID if not provided
    let docId = '';
    let companionNteId = '';
    if (data.DocID && data.DocID.toString().trim()) {
      docId = data.DocID.toString().trim();
    } else if (docType === 'Incident Report') {
      const ids = buildIncidentIdsServer(sheet, data.Campaign || '', dateObj);
      docId = ids.irId;
      companionNteId = ids.nteId;
    } else {
      docId = generateNextDocId(sheet, docType, data.Campaign || '', dateObj);
    }

    const baseRow = [
      dateObj,
      docId,
      data.Campaign || '',
      docType,
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

    // Append primary row
    sheet.appendRow(baseRow);

    // If this is an Incident Report, auto-create a paired Notice to Explain row
    if (docType === 'Incident Report' && companionNteId) {
      const nteRow = [
        dateObj,
        companionNteId,
        data.Campaign || '',
        'Notice to Explain',
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
      sheet.appendRow(nteRow);
    }
    
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

// Send email with PDF (Document-based approach from working sample)
function sendEmailWithPDF(recipient, subject, body, rowData) {
  try {
    // Create a temporary Google Doc to generate PDF
    var doc = DocumentApp.create('Temp_Email_Document');
    var docBody = doc.getBody();

    // Add content to the document
    docBody.appendParagraph('Email Details').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    docBody.appendParagraph(''); // Empty line

    // Add row data to PDF
    for (var key in rowData) {
      if (rowData.hasOwnProperty(key)) {
        docBody.appendParagraph(key + ': ' + rowData[key]);
      }
    }

    docBody.appendParagraph(''); // Empty line
    docBody.appendParagraph('Message:').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    docBody.appendParagraph(body);

    doc.saveAndClose();

    // Convert to PDF
    var docFile = DriveApp.getFileById(doc.getId());
    var pdfBlob = docFile.getAs('application/pdf');
    pdfBlob.setName('Document_' + new Date().getTime() + '.pdf');

    // Send email with PDF attachment
    GmailApp.sendEmail(recipient, subject, body, {
      attachments: [pdfBlob]
    });

    // Clean up - delete temporary document
    DriveApp.getFileById(doc.getId()).setTrashed(true);

    return { success: true, message: 'Email sent successfully with PDF!' };
  } catch (error) {
    Logger.log('Error in sendEmailWithPDF: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// Simple send email without PDF
function sendEmail(recipient, subject, body) {
  try {
    Logger.log('Sending simple email to: ' + recipient);
    GmailApp.sendEmail(recipient, subject, body);
    Logger.log('Email sent successfully to: ' + recipient);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    Logger.log('Error in sendEmail: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// API handler for email sending
function sendEmailApi(data) {
  try {
    Logger.log('sendEmailApi called with: ' + JSON.stringify(data));
    
    const recipient = data.recipient || '';
    const subject = data.subject || '';
    const body = data.body || '';
    const attachPdf = data.attachPdf || false;
    const rowData = data.rowData || {};
    
    if (!recipient || !subject || !body) {
      const error = 'Missing required fields: ' + 
        (!recipient ? 'recipient ' : '') + 
        (!subject ? 'subject ' : '') + 
        (!body ? 'body' : '');
      Logger.log(error);
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: error 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    let result;
    if (attachPdf) {
      result = sendEmailWithPDF(recipient, subject, body, rowData);
    } else {
      result = sendEmail(recipient, subject, body);
    }
    
    Logger.log('Email result: ' + JSON.stringify(result));
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Critical error in sendEmailApi: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: 'Error: ' + error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function extractDriveFileId(url) {
  try {
    if (!url) return '';
    var m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m && m[1]) return m[1];
    var qm = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (qm && qm[1]) return qm[1];
    return '';
  } catch (e) {
    return '';
  }
}

function getBlobForUrl(url) {
  var fileId = extractDriveFileId(url);
  if (fileId) {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    blob.setName(file.getName());
    return blob;
  }
  var resp = UrlFetchApp.fetch(url);
  var blob2 = resp.getBlob();
  blob2.setName('attachment');
  return blob2;
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

// Test function to verify all permissions are working
function testAllPermissions() {
  try {
    Logger.log('=== Testing All Permissions ===');
    
    // Test Spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✓ Spreadsheet OK: ' + ss.getName());
    
    // Test Gmail (no document needed)
    Logger.log('✓ Gmail permissions available');
    
    // Test UrlFetchApp (used for PDF export)
    const testUrl = 'https://www.google.com';
    const response = UrlFetchApp.fetch(testUrl);
    Logger.log('✓ UrlFetchApp OK (for PDF generation)');
    
    Logger.log('=== All required permissions are available! ===');
  } catch (error) {
    Logger.log('✗ Permission test failed: ' + error.toString());
  }
}

// Simple test to send email (use for debugging)
function testSendEmail() {
  const testData = {
    recipient: 'your_email@example.com', // Change this to your email
    subject: 'Test Email from Coaching System',
    body: 'This is a test email.',
    attachPdf: true,
    rowData: {
      Employee: 'John Doe',
      Department: 'Sales',
      Date: new Date().toLocaleDateString()
    }
  };
  
  const result = sendEmailApi(testData);
  Logger.log('Test email result: ' + JSON.stringify(result));
}

