# Complete Applicant Intake System - Setup Guide

## 📋 System Overview
A full-featured applicant tracking system built with Google Apps Script that includes:
- ✅ Job application submission form
- ✅ Automated data storage in Google Sheets
- ✅ Resume/CV file uploads to Google Drive
- ✅ Application status tracking
- ✅ Dark mode UI
- ✅ Data table with filtering and export

## 🚀 Setup Instructions

### Step 1: Create Your Google Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Applicant Intake System"
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### Step 2: Open Apps Script Editor
1. In your spreadsheet, go to **Extensions** → **Apps Script**
2. Delete any default code in the editor

### Step 3: Create the Backend File (Code.gs)
1. In the Apps Script editor, ensure you're in **Code.gs**
2. Paste the complete backend code (from your first document)
3. **IMPORTANT**: Replace the `SHEET_ID` value on line 4:
   ```javascript
   const SHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID_HERE';
   ```

### Step 4: Create the Frontend File (Index.html)
1. In the Apps Script editor, click the **+** button next to Files
2. Select **HTML** file
3. Name it `Index`
4. Delete the default content
5. Paste the complete HTML code (from your second document)

### Step 5: Deploy as Web App
1. Click the **Deploy** button (top right) → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure settings:
   - **Description**: "Applicant Intake Portal v1.0"
   - **Execute as**: Me
   - **Who has access**: Anyone (or "Anyone with Google account" if you want to restrict)
5. Click **Deploy**
6. **Authorize** the app when prompted
7. Copy the **Web app URL** - this is your live application!

### Step 6: Test Your System
1. Open the Web app URL
2. Fill out the application form
3. Upload a test resume
4. Submit the application
5. Switch to the "Application Data Table" tab
6. Verify the data appears

## 📊 What Gets Created

### Google Sheet Columns (29 total):
1. Timestamp
2. First Name
3. Last Name
4. Email
5. Phone Number
6. Position
7. Source
8. Date Applied
9. Account
10. Final Interview
11. Client Interview
12. Status
13. Comment
14. NickName
15. Age
16. Civil Status
17. Address
18. Travel Time
19. Vehicle
20. Salary Expectation
21. Part-time Schedule
22. Student
23. Any Medical Condition
24. BPO Experience
25. Chat Background
26. Calls Background
27. Sales Background
28. Resume URL
29. ID

### Google Drive Folder:
- A folder named **"Applicant Resumes"** will be automatically created
- All uploaded resumes are stored here with public view access

## 🔧 Customization Options

### Add More Form Fields
To add fields to the HTML form, add this inside a fieldset:
```html
<div>
    <label for="phoneNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Phone Number
    </label>
    <input type="tel" id="phoneNumber" name="PhoneNumber" 
        class="w-full p-3 border border-gray-300 dark:border-border-dark rounded-lg">
</div>
```

Then update the form submission to include the new field:
```javascript
const formData = {
    // ... existing fields
    PhoneNumber: document.getElementById('phoneNumber').value,
};
```

### Modify Position Options
In the HTML file, find the position dropdown and edit:
```html
<select id="position" name="Position" required>
    <option value="">Select Position...</option>
    <option value="Your Position 1">Your Position 1</option>
    <option value="Your Position 2">Your Position 2</option>
</select>
```

### Change Status Options
Modify the `getStatusClass()` function in the HTML to add custom statuses:
```javascript
const statusMap = {
    'New Applicant': 'bg-primary-applicant/10 text-primary-applicant',
    'Your Custom Status': 'bg-purple-100 text-purple-800',
    // Add more...
};
```

## 🔐 Security & Permissions

### Access Control Options:
1. **Anyone**: Public access, no Google login required
2. **Anyone with Google account**: Requires Google login
3. **Specific users**: Only designated email addresses

To change access:
1. Go to **Deploy** → **Manage deployments**
2. Click the pencil icon to edit
3. Change "Who has access"
4. Click **Deploy**

## 🐛 Troubleshooting

### "Script function not found" error
- Make sure you saved both Code.gs and Index.html
- Redeploy the web app

### Data not appearing in sheet
- Check the SHEET_ID is correct
- Verify the sheet name is "Applicants"
- Check the Apps Script execution log (View → Logs)

### File upload not working
- Ensure your Google Drive has available storage
- Check that the script has Drive permissions

### Dark mode not working
- Clear your browser cache
- Try in an incognito window

## 📱 Features

### For Applicants:
- Clean, professional application form
- Resume upload capability
- Mobile-responsive design
- Dark mode support

### For Administrators:
- View all applications in a table
- Update application status
- Delete applications
- Export data to CSV
- Direct links to uploaded resumes
- Real-time data sync

## 🎨 UI Customization

### Change Primary Color:
In the HTML `<script>` section, modify:
```javascript
colors: {
    'primary-applicant': '#4285F4', // Change this hex code
}
```

### Change Accent Color:
```javascript
'brand-accent': '#CBEB33', // Your brand color
```

## 📞 Support

If you encounter issues:
1. Check the Apps Script execution logs
2. Verify all permissions are granted
3. Ensure the spreadsheet ID is correct
4. Check the browser console for JavaScript errors

## 🎉 Your System is Ready!

Share the Web app URL with applicants and start collecting applications. All data is automatically stored in your Google Sheet with uploaded resumes saved to Google Drive.

**Pro Tip**: Bookmark your Web app URL for easy access to the admin panel!