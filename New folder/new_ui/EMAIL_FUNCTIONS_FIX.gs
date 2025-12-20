// REPLACE THE FOLLOWING FUNCTIONS IN Code.gs (lines 560-650)
// Copy this entire block and replace the email functions section

// Send email with attachment - creates formatted text summary instead of PDF
function sendEmailWithAttachment(recipient, subject, body, rowData) {
  try {
    Logger.log('Sending email with attachment to: ' + recipient);
    
    // Build a nicely formatted summary text
    let summary = 'COACHING RECORD DETAILS\n';
    summary += '='.repeat(50) + '\n\n';
    
    for (let key in rowData) {
      if (rowData.hasOwnProperty(key)) {
        summary += key + ': ' + (rowData[key] || 'N/A') + '\n';
      }
    }
    
    summary += '\n' + '='.repeat(50) + '\n';
    summary += 'MESSAGE:\n';
    summary += body;
    
    // Enhanced email body with summary
    const enhancedBody = body + '\n\n' + '---\n' + summary;
    
    // Send email
    GmailApp.sendEmail(recipient, subject, enhancedBody);
    
    Logger.log('Email with summary sent successfully to: ' + recipient);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    Logger.log('Error in sendEmailWithAttachment: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// Simple send email without attachment
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
      // Send with formatted summary instead of PDF
      result = sendEmailWithAttachment(recipient, subject, body, rowData);
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
