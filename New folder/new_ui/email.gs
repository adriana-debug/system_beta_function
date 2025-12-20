
// IMPORTANT: Replace this with your actual spreadsheet ID
const SPREADSHEET_ID = '1KSlAcRmyc4foDF7TsVV5UwK6Loh2jL5aDNJu9kqPBbs';
const SHEET_NAME = 'Sheet1';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Email Sender with PDF')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Get data from spreadsheet
function getSpreadsheetData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return { success: false, message: 'No data found' };
    }
    
    // Return data as array of objects
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return { success: true, data: rows, headers: headers };
  } catch (error) {
    return { success: false, message: 'Error loading data: ' + error.toString() };
  }
}

// Send email with PDF
function sendEmailWithPDF(recipient, subject, body, rowData) {
  try {
    // Create a temporary Google Doc to generate PDF
    const doc = DocumentApp.create('Temp_Email_Document');
    const docBody = doc.getBody();
    
    // Add content to the document
    docBody.appendParagraph('Email Details').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    docBody.appendParagraph(''); // Empty line
    
    // Add row data to PDF
    for (let key in rowData) {
      if (rowData.hasOwnProperty(key)) {
        docBody.appendParagraph(key + ': ' + rowData[key]);
      }
    }
    
    docBody.appendParagraph(''); // Empty line
    docBody.appendParagraph('Message:').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    docBody.appendParagraph(body);
    
    doc.saveAndClose();
    
    // Convert to PDF
    const docFile = DriveApp.getFileById(doc.getId());
    const pdfBlob = docFile.getAs('application/pdf');
    pdfBlob.setName('Document_' + new Date().getTime() + '.pdf');
    
    // Send email with PDF attachment
    GmailApp.sendEmail(recipient, subject, body, {
      attachments: [pdfBlob]
    });
    
    // Clean up - delete temporary document
    DriveApp.getFileById(doc.getId()).setTrashed(true);
    
    return { success: true, message: 'Email sent successfully with PDF!' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// Simple send email without PDF
function sendEmail(recipient, subject, body) {
  try {
    GmailApp.sendEmail(recipient, subject, body);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

function testPermissions() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Success! Sheet name: ' + ss.getName());
}





function testAllPermissions() {
  // Test Spreadsheet
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Spreadsheet OK: ' + ss.getName());
  
  // Test Document creation
  const doc = DocumentApp.create('Test Doc');
  Logger.log('Document OK: ' + doc.getId());
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  
  // Test Gmail
  Logger.log('Gmail OK');
  
  Logger.log('All permissions granted!');
}
