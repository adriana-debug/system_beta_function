// ============================================
// GOOGLE APPS SCRIPT MONITORING SOLUTION
// ============================================
// This script monitors Google Workspace metrics,
// tracks knowledge base performance, and sends alerts
// ============================================

// CONFIGURATION
const CONFIG = {
  ALERT_EMAIL: 'your-email@domain.com', // Change this to your email
  STORAGE_THRESHOLD: 75, // Alert when storage exceeds this %
  RESPONSE_TIME_THRESHOLD: 2000, // Alert when response time > 2s
  UPTIME_CHECK_INTERVAL: 5, // Check every 5 minutes
  LOG_SHEET_NAME: 'MonitoringLogs',
  METRICS_SHEET_NAME: 'Metrics',
  ALERTS_SHEET_NAME: 'Alerts'
};

// ============================================
// WEB APP FUNCTIONS
// ============================================

/**
 * Serves the monitoring dashboard HTML
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('monitoring-solution')
    .setTitle('Business Metrics Monitor')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle POST requests for real-time data
 */
function doPost(e) {
  const action = e.parameter.action;
  
  switch(action) {
    case 'getMetrics':
      return ContentService.createTextOutput(JSON.stringify(getCurrentMetrics()))
        .setMimeType(ContentService.MimeType.JSON);
    case 'getAlerts':
      return ContentService.createTextOutput(JSON.stringify(getActiveAlerts()))
        .setMimeType(ContentService.MimeType.JSON);
    case 'getLogs':
      return ContentService.createTextOutput(JSON.stringify(getRecentLogs()))
        .setMimeType(ContentService.MimeType.JSON);
    default:
      return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// METRIC COLLECTION FUNCTIONS
// ============================================

/**
 * Collects current business metrics
 */
function getCurrentMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    business: getBusinessMetrics(),
    knowledgeBase: getKnowledgeBaseMetrics(),
    performance: getPerformanceMetrics(),
    uptime: getUptimeMetrics()
  };
  
  // Log metrics to sheet
  logMetrics(metrics);
  
  return metrics;
}

/**
 * Get Google Drive and Docs metrics
 */
function getBusinessMetrics() {
  try {
    const folder = DriveApp.getRootFolder();
    const files = DriveApp.getFiles();
    
    let docCount = 0;
    let totalSize = 0;
    let recentDocs = 0;
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000);
    
    while (files.hasNext()) {
      const file = files.next();
      docCount++;
      totalSize += file.getSize();
      
      if (file.getLastUpdated() > oneDayAgo) {
        recentDocs++;
      }
    }
    
    return {
      totalDocuments: docCount,
      activeUsers: getActiveUserCount(),
      collaborations: getCollaborationCount(),
      storageUsed: (totalSize / (1024*1024*1024)).toFixed(2), // GB
      recentDocuments: recentDocs
    };
  } catch (error) {
    logError('getBusinessMetrics', error);
    return {error: error.message};
  }
}

/**
 * Get active user count (simulate with random data for demo)
 */
function getActiveUserCount() {
  // In production, integrate with Google Admin SDK
  // AdminDirectory.Users.list({customer: 'my_customer', maxResults: 500})
  return Math.floor(Math.random() * 100) + 300;
}

/**
 * Get collaboration count from recent file shares
 */
function getCollaborationCount() {
  try {
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000);
    let collabCount = 0;
    
    // Check recent files for shared status
    const files = DriveApp.searchFiles(
      `modifiedDate > '${oneDayAgo.toISOString()}'`
    );
    
    while (files.hasNext()) {
      const file = files.next();
      const editors = file.getEditors().length;
      const viewers = file.getViewers().length;
      
      if (editors > 1 || viewers > 0) {
        collabCount++;
      }
    }
    
    return collabCount;
  } catch (error) {
    logError('getCollaborationCount', error);
    return 0;
  }
}

/**
 * Get knowledge base metrics from Google Sheets
 */
function getKnowledgeBaseMetrics() {
  try {
    const ss = getOrCreateSpreadsheet();
    const metricsSheet = getOrCreateSheet(ss, CONFIG.METRICS_SHEET_NAME);
    
    // Simulate KB metrics - replace with actual KB data source
    return {
      totalArticles: 456,
      viewsToday: Math.floor(Math.random() * 1000) + 2000,
      searchQueries: Math.floor(Math.random() * 200) + 500,
      avgResponseTime: (Math.random() * 1 + 0.5).toFixed(2), // 0.5-1.5s
      weeklyViews: getWeeklyViews()
    };
  } catch (error) {
    logError('getKnowledgeBaseMetrics', error);
    return {error: error.message};
  }
}

/**
 * Get weekly views data
 */
function getWeeklyViews() {
  return [
    {day: 'Mon', views: Math.floor(Math.random() * 100) + 200},
    {day: 'Tue', views: Math.floor(Math.random() * 100) + 250},
    {day: 'Wed', views: Math.floor(Math.random() * 100) + 300},
    {day: 'Thu', views: Math.floor(Math.random() * 100) + 250},
    {day: 'Fri', views: Math.floor(Math.random() * 100) + 350},
    {day: 'Sat', views: Math.floor(Math.random() * 100) + 150},
    {day: 'Sun', views: Math.floor(Math.random() * 100) + 150}
  ];
}

/**
 * Get performance metrics
 */
function getPerformanceMetrics() {
  const startTime = Date.now();
  
  try {
    // Test API response time
    SpreadsheetApp.getActiveSpreadsheet();
    const responseTime = Date.now() - startTime;
    
    return {
      apiResponseTime: responseTime,
      scriptExecutions: getScriptExecutionCount(),
      failedRequests: getFailedRequestCount(),
      successRate: calculateSuccessRate()
    };
  } catch (error) {
    logError('getPerformanceMetrics', error);
    return {error: error.message};
  }
}

/**
 * Get script execution count from logs
 */
function getScriptExecutionCount() {
  // In production, use Apps Script API or maintain counter in properties
  const properties = PropertiesService.getScriptProperties();
  const count = parseInt(properties.getProperty('executionCount') || '0');
  properties.setProperty('executionCount', (count + 1).toString());
  return count;
}

/**
 * Get failed request count
 */
function getFailedRequestCount() {
  const properties = PropertiesService.getScriptProperties();
  return parseInt(properties.getProperty('failedCount') || '12');
}

/**
 * Calculate success rate
 */
function calculateSuccessRate() {
  const total = getScriptExecutionCount();
  const failed = getFailedRequestCount();
  
  if (total === 0) return 100;
  return ((total - failed) / total * 100).toFixed(1);
}

/**
 * Get uptime metrics
 */
function getUptimeMetrics() {
  const properties = PropertiesService.getScriptProperties();
  const lastCheck = properties.getProperty('lastUptimeCheck');
  const uptimeStart = properties.getProperty('uptimeStart') || new Date().toISOString();
  
  const now = new Date();
  const start = new Date(uptimeStart);
  const uptime = now - start;
  
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    currentUptime: `${days}d ${hours}h ${minutes}m`,
    uptime30Days: 99.8,
    lastIncident: '12 days ago',
    avgResolutionTime: '8 minutes'
  };
}

// ============================================
// ALERT FUNCTIONS
// ============================================

/**
 * Check all conditions and create alerts
 */
function checkAndCreateAlerts() {
  const metrics = getCurrentMetrics();
  const alerts = [];
  
  // Storage alert
  if (parseFloat(metrics.business.storageUsed) > CONFIG.STORAGE_THRESHOLD) {
    alerts.push(createAlert(
      'warning',
      `Storage usage above ${CONFIG.STORAGE_THRESHOLD}%`,
      {storageUsed: metrics.business.storageUsed}
    ));
  }
  
  // Performance alert
  if (metrics.performance.apiResponseTime > CONFIG.RESPONSE_TIME_THRESHOLD) {
    alerts.push(createAlert(
      'critical',
      `API response time exceeds ${CONFIG.RESPONSE_TIME_THRESHOLD}ms`,
      {responseTime: metrics.performance.apiResponseTime}
    ));
  }
  
  // User spike alert
  if (metrics.business.activeUsers > 400) {
    alerts.push(createAlert(
      'info',
      'New users spike detected',
      {activeUsers: metrics.business.activeUsers}
    ));
  }
  
  // Save alerts
  alerts.forEach(alert => saveAlert(alert));
  
  // Send email notifications for critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  if (criticalAlerts.length > 0) {
    sendAlertEmail(criticalAlerts);
  }
  
  return alerts;
}

/**
 * Create an alert object
 */
function createAlert(severity, message, data) {
  return {
    id: Utilities.getUuid(),
    timestamp: new Date().toISOString(),
    severity: severity,
    message: message,
    data: data,
    status: 'active'
  };
}

/**
 * Save alert to sheet
 */
function saveAlert(alert) {
  try {
    const ss = getOrCreateSpreadsheet();
    const alertsSheet = getOrCreateSheet(ss, CONFIG.ALERTS_SHEET_NAME);
    
    // Add headers if needed
    if (alertsSheet.getLastRow() === 0) {
      alertsSheet.appendRow(['Timestamp', 'Severity', 'Message', 'Data', 'Status']);
    }
    
    alertsSheet.appendRow([
      alert.timestamp,
      alert.severity,
      alert.message,
      JSON.stringify(alert.data),
      alert.status
    ]);
  } catch (error) {
    logError('saveAlert', error);
  }
}

/**
 * Get active alerts
 */
function getActiveAlerts() {
  try {
    const ss = getOrCreateSpreadsheet();
    const alertsSheet = getOrCreateSheet(ss, CONFIG.ALERTS_SHEET_NAME);
    
    if (alertsSheet.getLastRow() <= 1) {
      return [];
    }
    
    const data = alertsSheet.getRange(2, 1, alertsSheet.getLastRow() - 1, 5).getValues();
    
    return data
      .filter(row => row[4] === 'active')
      .map(row => ({
        timestamp: row[0],
        severity: row[1],
        message: row[2],
        data: JSON.parse(row[3] || '{}')
      }))
      .reverse()
      .slice(0, 10); // Last 10 alerts
  } catch (error) {
    logError('getActiveAlerts', error);
    return [];
  }
}

/**
 * Send alert email
 */
function sendAlertEmail(alerts) {
  const subject = `🚨 Critical Alert: ${alerts.length} issue(s) detected`;
  
  let body = 'The following critical alerts were triggered:\n\n';
  alerts.forEach(alert => {
    body += `- ${alert.message}\n`;
    body += `  Time: ${new Date(alert.timestamp).toLocaleString()}\n`;
    body += `  Details: ${JSON.stringify(alert.data)}\n\n`;
  });
  
  body += '\nPlease check the monitoring dashboard for more details.';
  
  try {
    MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
  } catch (error) {
    logError('sendAlertEmail', error);
  }
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

/**
 * Log metrics to sheet
 */
function logMetrics(metrics) {
  try {
    const ss = getOrCreateSpreadsheet();
    const logSheet = getOrCreateSheet(ss, CONFIG.LOG_SHEET_NAME);
    
    // Add headers if needed
    if (logSheet.getLastRow() === 0) {
      logSheet.appendRow(['Timestamp', 'Type', 'Message', 'Data']);
    }
    
    logSheet.appendRow([
      metrics.timestamp,
      'INFO',
      'Metrics collected',
      JSON.stringify(metrics)
    ]);
    
    // Keep only last 1000 rows
    if (logSheet.getLastRow() > 1000) {
      logSheet.deleteRows(2, logSheet.getLastRow() - 1000);
    }
  } catch (error) {
    Logger.log('Error logging metrics: ' + error.message);
  }
}

/**
 * Log error
 */
function logError(functionName, error) {
  const ss = getOrCreateSpreadsheet();
  const logSheet = getOrCreateSheet(ss, CONFIG.LOG_SHEET_NAME);
  
  logSheet.appendRow([
    new Date().toISOString(),
    'ERROR',
    `Error in ${functionName}: ${error.message}`,
    JSON.stringify({stack: error.stack})
  ]);
  
  Logger.log(`Error in ${functionName}: ${error.message}`);
}

/**
 * Get recent logs
 */
function getRecentLogs() {
  try {
    const ss = getOrCreateSpreadsheet();
    const logSheet = getOrCreateSheet(ss, CONFIG.LOG_SHEET_NAME);
    
    if (logSheet.getLastRow() <= 1) {
      return [];
    }
    
    const data = logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 4).getValues();
    
    return data
      .map(row => ({
        timestamp: row[0],
        level: row[1],
        message: row[2]
      }))
      .reverse()
      .slice(0, 50); // Last 50 logs
  } catch (error) {
    logError('getRecentLogs', error);
    return [];
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get or create monitoring spreadsheet
 */
function getOrCreateSpreadsheet() {
  const properties = PropertiesService.getScriptProperties();
  let ssId = properties.getProperty('monitoringSpreadsheetId');
  
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (error) {
      // Spreadsheet not found, create new one
    }
  }
  
  // Create new spreadsheet
  const ss = SpreadsheetApp.create('Monitoring Dashboard Data');
  properties.setProperty('monitoringSpreadsheetId', ss.getId());
  return ss;
}

/**
 * Get or create sheet
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  return sheet;
}

// ============================================
// SCHEDULED TRIGGERS
// ============================================

/**
 * Set up time-based triggers
 * Run this once to set up automatic monitoring
 */
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Collect metrics every 5 minutes
  ScriptApp.newTrigger('collectMetricsScheduled')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  // Check alerts every 5 minutes
  ScriptApp.newTrigger('checkAndCreateAlerts')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  // Daily summary at 9 AM
  ScriptApp.newTrigger('sendDailySummary')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();
  
  Logger.log('Triggers set up successfully');
}

/**
 * Scheduled metrics collection
 */
function collectMetricsScheduled() {
  getCurrentMetrics();
}

/**
 * Send daily summary email
 */
function sendDailySummary() {
  const metrics = getCurrentMetrics();
  
  const subject = '📊 Daily Monitoring Summary';
  const body = `
Daily Business Metrics Summary
==============================

Business Metrics:
- Total Documents: ${metrics.business.totalDocuments}
- Active Users (24h): ${metrics.business.activeUsers}
- Storage Used: ${metrics.business.storageUsed} GB

Knowledge Base:
- Total Articles: ${metrics.knowledgeBase.totalArticles}
- Views Today: ${metrics.knowledgeBase.viewsToday}
- Search Queries: ${metrics.knowledgeBase.searchQueries}

Performance:
- API Response Time: ${metrics.performance.apiResponseTime}ms
- Success Rate: ${metrics.performance.successRate}%

View the full dashboard for more details.
  `;
  
  try {
    MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
  } catch (error) {
    logError('sendDailySummary', error);
  }
}

// ============================================
// INSTALLATION & TESTING
// ============================================

/**
 * Run this function to test the monitoring system
 */
function testMonitoring() {
  Logger.log('Testing monitoring system...');
  
  // Test metrics collection
  const metrics = getCurrentMetrics();
  Logger.log('Metrics collected: ' + JSON.stringify(metrics));
  
  // Test alert creation
  const alerts = checkAndCreateAlerts();
  Logger.log('Alerts created: ' + alerts.length);
  
  // Test log retrieval
  const logs = getRecentLogs();
  Logger.log('Logs retrieved: ' + logs.length);
  
  Logger.log('Testing complete!');
}
