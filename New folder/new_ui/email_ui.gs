
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    h2 {
      color: #333;
      margin-top: 0;
      margin-bottom: 20px;
    }
    
    .table-container {
      overflow-x: auto;
      margin-top: 20px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: #4CAF50;
      color: white;
      font-weight: bold;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    label {
      display: block;
      margin-top: 15px;
      margin-bottom: 5px;
      color: #555;
      font-weight: bold;
    }
    
    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: Arial, sans-serif;
    }
    
    textarea {
      resize: vertical;
      min-height: 100px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin: 5px;
      transition: background-color 0.3s;
    }
    
    .btn-primary {
      background-color: #4CAF50;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #45a049;
    }
    
    .btn-secondary {
      background-color: #2196F3;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #0b7dda;
    }
    
    .btn-small {
      padding: 6px 12px;
      font-size: 12px;
    }
    
    .btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .btn-group {
      margin-top: 20px;
    }
    
    .message {
      margin-top: 15px;
      padding: 12px;
      border-radius: 4px;
      display: none;
    }
    
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2>📊 Spreadsheet Data</h2>
      <button class="btn btn-secondary" onclick="loadSpreadsheetData()">🔄 Refresh Data</button>
      
      <div id="tableContainer">
        <div class="loading">Loading data...</div>
      </div>
    </div>
    
    <div class="card">
      <h2>✉️ Send Email</h2>
      
      <label for="recipient">To:</label>
      <input type="email" id="recipient" placeholder="recipient@example.com" required>
      
      <label for="subject">Subject:</label>
      <input type="text" id="subject" placeholder="Email subject" required>
      
      <label for="body">Message:</label>
      <textarea id="body" placeholder="Type your message here..." required></textarea>
      
      <div class="btn-group">
        <button class="btn btn-primary" onclick="handleSendEmail(false)">Send Email</button>
        <button class="btn btn-secondary" onclick="handleSendEmail(true)">Send Email with PDF</button>
      </div>
      
      <div id="message" class="message"></div>
    </div>
  </div>

  <script>
    let currentSelectedRow = null;
    
    window.onload = function() {
      loadSpreadsheetData();
    };
    
    function loadSpreadsheetData() {
      const container = document.getElementById('tableContainer');
      container.innerHTML = '<div class="loading">Loading data...</div>';
      
      google.script.run
        .withSuccessHandler(function(response) {
          if (response.success && response.data && response.data.length > 0) {
            displayTable(response.headers, response.data);
          } else {
            container.innerHTML = '<div class="no-data">No data found. Message: ' + (response.message || 'Unknown error') + '</div>';
          }
        })
        .withFailureHandler(function(error) {
          container.innerHTML = '<div class="error">Error loading data: ' + error + '</div>';
        })
        .getSpreadsheetData();
    }
    
    function displayTable(headers, data) {
      let html = '<div class="table-container"><table>';
      
      html += '<thead><tr>';
      headers.forEach(header => {
        html += '<th>' + escapeHtml(header) + '</th>';
      });
      html += '<th>Action</th></tr></thead>';
      
      html += '<tbody>';
      data.forEach((row, index) => {
        html += '<tr>';
        headers.forEach(header => {
          html += '<td>' + escapeHtml(String(row[header] || '')) + '</td>';
        });
        html += '<td><button class="btn btn-primary btn-small" onclick="selectRowForEmail(' + index + ')">Select for Email</button></td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      
      document.getElementById('tableContainer').innerHTML = html;
      window.spreadsheetData = data;
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function selectRowForEmail(index) {
      currentSelectedRow = window.spreadsheetData[index];
      
      if (currentSelectedRow['Email']) {
        document.getElementById('recipient').value = currentSelectedRow['Email'];
      }
      
      showMessage('Row selected! You can now send email with this data.', true);
      document.querySelector('.card:last-child').scrollIntoView({ behavior: 'smooth' });
    }
    
    function handleSendEmail(withPDF) {
      const recipient = document.getElementById('recipient').value;
      const subject = document.getElementById('subject').value;
      const body = document.getElementById('body').value;
      const buttons = document.querySelectorAll('.btn-group .btn');
      const messageDiv = document.getElementById('message');
      
      if (!recipient || !subject || !body) {
        showMessage('Please fill in all fields', false);
        return;
      }
      
      if (withPDF && !currentSelectedRow) {
        showMessage('Please select a row from the table first to send with PDF', false);
        return;
      }
      
      buttons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      });
      messageDiv.style.display = 'none';
      
      if (withPDF) {
        google.script.run
          .withSuccessHandler(handleEmailResponse)
          .withFailureHandler(handleEmailError)
          .sendEmailWithPDF(recipient, subject, body, currentSelectedRow);
      } else {
        google.script.run
          .withSuccessHandler(handleEmailResponse)
          .withFailureHandler(handleEmailError)
          .sendEmail(recipient, subject, body);
      }
    }
    
    function handleEmailResponse(response) {
      resetButtons();
      showMessage(response.message, response.success);
      
      if (response.success) {
        document.getElementById('recipient').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('body').value = '';
        currentSelectedRow = null;
      }
    }
    
    function handleEmailError(error) {
      resetButtons();
      showMessage('Failed to send email: ' + error, false);
    }
    
    function resetButtons() {
      const buttons = document.querySelectorAll('.btn-group .btn');
      buttons[0].disabled = false;
      buttons[0].textContent = 'Send Email';
      buttons[1].disabled = false;
      buttons[1].textContent = 'Send Email with PDF';
    }
    
    function showMessage(text, isSuccess) {
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = text;
      messageDiv.className = 'message ' + (isSuccess ? 'success' : 'error');
      messageDiv.style.display = 'block';
    }
  </script>
</body>
</html>