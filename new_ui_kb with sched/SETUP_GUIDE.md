# 📊 Business Metrics Monitoring Solution - Setup Guide

Complete monitoring solution for Google Workspace business metrics and knowledge base with real-time alerts, performance tracking, and analytics dashboard.

## 🎯 Features

✅ **Real-time Business Metrics**
- Document count and storage tracking
- Active user monitoring
- Collaboration analytics
- Storage usage alerts

✅ **Knowledge Base Monitoring**
- Article views and search queries
- Response time tracking
- Weekly trends visualization
- Usage analytics

✅ **Performance Tracking**
- API response time monitoring
- Script execution tracking
- Success rate calculations
- Failed request alerts

✅ **Alert System**
- Email notifications for critical issues
- Customizable thresholds
- Alert history tracking
- Severity levels (info, warning, critical)

✅ **Comprehensive Logging**
- Activity logs
- Error tracking
- Performance logs
- Historical data retention

## 📋 Prerequisites

- Google Workspace account
- Google Apps Script access
- Basic knowledge of Apps Script deployment

## 🚀 Installation Steps

### Step 1: Create Google Apps Script Project

1. Go to https://script.google.com
2. Click **New Project**
3. Name it "Business Metrics Monitor"

### Step 2: Add the Code

1. **Delete the default Code.gs content**

2. **Create monitoring-backend.gs:**
   - Click the **+** next to Files
   - Select **Script**
   - Name it `Code`
   - Copy the entire content from `monitoring-backend.gs` and paste it

3. **Create the HTML Dashboard:**
   - Click the **+** next to Files
   - Select **HTML**
   - Name it `monitoring-solution`
   - Copy the entire content from `monitoring-solution.html` and paste it

### Step 3: Configure the Script

1. Open `Code.gs`
2. Update the CONFIG section at the top:

```javascript
const CONFIG = {
  ALERT_EMAIL: 'your-email@domain.com', // ⚠️ CHANGE THIS!
  STORAGE_THRESHOLD: 75,
  RESPONSE_TIME_THRESHOLD: 2000,
  UPTIME_CHECK_INTERVAL: 5,
  LOG_SHEET_NAME: 'MonitoringLogs',
  METRICS_SHEET_NAME: 'Metrics',
  ALERTS_SHEET_NAME: 'Alerts'
};
```

### Step 4: Set Up Triggers

1. In the Apps Script editor, run the function **setupTriggers()**:
   - Select `setupTriggers` from the function dropdown
   - Click **Run** (▶️)
   - Authorize the script when prompted
   - Grant necessary permissions

This will create automated triggers for:
- Metrics collection every 5 minutes
- Alert checking every 5 minutes
- Daily summary email at 9 AM

### Step 5: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Configure:
   - **Description:** Business Metrics Monitor
   - **Execute as:** Me
   - **Who has access:** Anyone with the link (or specific users)
4. Click **Deploy**
5. Copy the **Web app URL** - this is your dashboard URL

### Step 6: Test the Installation

1. Run the `testMonitoring()` function:
   - Select `testMonitoring` from dropdown
   - Click **Run**
   - Check the **Execution log** for results

2. Open your **Web app URL** to view the dashboard

3. Check your Google Drive for a new spreadsheet called "Monitoring Dashboard Data"

## 📊 Using the Dashboard

### Dashboard Components

**Status Bar:**
- System status indicator
- Uptime percentage
- Active alerts count

**Business Metrics Card:**
- Total documents
- Active users (24h)
- Collaborations
- Storage usage

**Knowledge Base Card:**
- Article count
- Daily views
- Search queries
- Response time
- Weekly views chart

**Active Alerts Card:**
- Current warnings
- Critical alerts
- Info notifications

**Performance Card:**
- API response time
- Script executions
- Failed requests
- Success rate

**Recent Logs:**
- Real-time activity log
- Error tracking
- System events

**Uptime Monitor:**
- Current uptime
- 30-day uptime %
- Last incident
- Resolution time

### Refreshing Data

The dashboard auto-refreshes every 30 seconds. You can also:
- Click "Refresh Alerts" to update alerts
- Click "Refresh Logs" to update logs

## ⚙️ Customization

### Adjust Alert Thresholds

Edit the CONFIG object in `Code.gs`:

```javascript
const CONFIG = {
  STORAGE_THRESHOLD: 80,        // Alert at 80% storage
  RESPONSE_TIME_THRESHOLD: 3000, // Alert at 3 seconds
  // ... other settings
};
```

### Add Custom Metrics

Add your own metric collection function:

```javascript
function getCustomMetrics() {
  // Your custom logic here
  return {
    customValue: 123,
    customRate: 45.6
  };
}
```

Then add it to `getCurrentMetrics()`:

```javascript
function getCurrentMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    business: getBusinessMetrics(),
    knowledgeBase: getKnowledgeBaseMetrics(),
    performance: getPerformanceMetrics(),
    uptime: getUptimeMetrics(),
    custom: getCustomMetrics() // Add this line
  };
  // ...
}
```

### Customize Email Alerts

Edit the `sendAlertEmail()` function to change email format:

```javascript
function sendAlertEmail(alerts) {
  const subject = `Your Custom Subject`;
  let body = 'Your custom email body...';
  // ... customize as needed
}
```

## 🔗 Integration Options

### Connect to Google Sheets Knowledge Base

If you have a Google Sheets knowledge base:

```javascript
function getKnowledgeBaseMetrics() {
  const kbSheet = SpreadsheetApp.openById('YOUR_KB_SHEET_ID');
  const data = kbSheet.getDataRange().getValues();
  
  return {
    totalArticles: data.length - 1, // Excluding header
    // ... other metrics from your sheet
  };
}
```

### Connect to Google Forms

Track form submissions:

```javascript
function getFormMetrics() {
  const form = FormApp.openById('YOUR_FORM_ID');
  const responses = form.getResponses();
  
  return {
    totalResponses: responses.length,
    todayResponses: getResponsesToday(responses)
  };
}
```

### Connect to Google Analytics (via API)

Requires additional setup with Analytics API.

## 📈 Advanced Features

### Custom Dashboards

Create multiple dashboards by copying the HTML file and customizing it:

1. Duplicate `monitoring-solution.html`
2. Rename to `custom-dashboard.html`
3. Modify the layout and metrics displayed
4. Update `doGet()` to serve different dashboards based on URL parameters

### Scheduled Reports

Add weekly or monthly report functions:

```javascript
function sendWeeklyReport() {
  // Aggregate weekly data
  // Send comprehensive report
}

// Set up trigger
ScriptApp.newTrigger('sendWeeklyReport')
  .timeBased()
  .onWeekDay(ScriptApp.WeekDay.MONDAY)
  .atHour(9)
  .create();
```

### Data Export

Export metrics to CSV:

```javascript
function exportMetricsToCSV() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.METRICS_SHEET_NAME);
  
  // Convert to CSV and email or save to Drive
}
```

## 🛠️ Troubleshooting

### Common Issues

**Dashboard shows "Loading..." forever:**
- Check if the script is deployed as a web app
- Verify permissions are granted
- Check browser console for errors

**Triggers not running:**
- Run `setupTriggers()` again
- Check Apps Script Triggers page (clock icon)
- Verify script has necessary permissions

**Emails not sending:**
- Verify email address in CONFIG
- Check quota limits (MailApp has daily limits)
- Check spam folder

**Metrics not collecting:**
- Run `testMonitoring()` to check for errors
- View Execution log for error messages
- Check spreadsheet permissions

### View Logs

To check execution logs:
1. Go to Apps Script editor
2. Click **Executions** (clock icon)
3. Review recent executions

### Reset Data

To start fresh:
1. Delete the "Monitoring Dashboard Data" spreadsheet
2. Run `testMonitoring()` to create new one

## 📊 Data Storage

All data is stored in a Google Spreadsheet with three sheets:

1. **MonitoringLogs** - Activity and error logs
2. **Metrics** - Historical metrics data
3. **Alerts** - Alert history

The script automatically:
- Creates the spreadsheet on first run
- Limits logs to last 1000 entries
- Stores spreadsheet ID in script properties

## 🔒 Security Best Practices

1. **Limit access** to the web app to specific users
2. **Regularly review** Apps Script permissions
3. **Use script properties** for sensitive data (not hardcoded)
4. **Enable 2FA** on your Google account
5. **Monitor execution logs** for suspicious activity

## 📚 Next Steps

1. **Customize metrics** to match your business needs
2. **Set up additional alerts** for critical thresholds
3. **Create custom reports** for stakeholders
4. **Integrate with other tools** (Slack, Teams, etc.)
5. **Build mobile access** using the web app URL

## 💡 Tips for Production Use

- Test thoroughly before deploying to production
- Set up backup triggers in case primary ones fail
- Monitor your Apps Script quota usage
- Keep the dashboard URL private if using sensitive data
- Document any customizations you make
- Version control your code using clasp or Git

## 🆘 Support

For issues or questions:
- Check the execution logs in Apps Script
- Review Google Apps Script documentation
- Test individual functions using `testMonitoring()`
- Check the spreadsheet for data integrity

## 📝 License

This monitoring solution is provided as-is for use with Google Workspace. Customize and adapt as needed for your organization.

---

**Created with ❤️ for efficient business monitoring**

Last Updated: December 2025
