# 🚀 SCHEDULE DASHBOARD - INTEGRATION REFERENCE

## 📦 Files You Need

### Backend (Google Apps Script)
- **Code.gs** → Paste into Google Apps Script editor

### Frontend (Your Web Server)
- **kb6_integrated.html** → Main dashboard HTML
- **schedule-api.js** → API client library
- **schedule-renderer.js** → UI renderer

---

## ⚡ 5-Minute Setup

### 1. Setup Google Sheet
```
Create 3 sheets:
├── Employees (ID, Name, Initials, Role, Hours/Week)
├── Shifts (ShiftID, EmployeeID, Day, StartTime, EndTime, ShiftType, Status)
└── Schedule_Metadata (Key, Value)
```

### 2. Deploy Apps Script
```
1. Extensions → Apps Script
2. Paste Code.gs
3. Update SPREADSHEET_ID (line 18)
4. Deploy → New deployment → Web app
5. Execute as: Me
6. Access: Anyone
7. Copy deployment URL
```

### 3. Update Frontend
```javascript
// In schedule-api.js (line 14)
const SCRIPT_URL = 'YOUR_DEPLOYMENT_URL_HERE';
```

### 4. Upload Files
```
Upload to your web server:
├── kb6_integrated.html
├── schedule-api.js
└── schedule-renderer.js
```

---

## 🔧 Configuration

### Apps Script Configuration
```javascript
// Code.gs - Line 18
const SPREADSHEET_ID = 'abc123...xyz'; // Your Sheet ID

// Line 19 - Cache duration
const CACHE_DURATION = 300; // 5 minutes
```

### Frontend Configuration
```javascript
// schedule-api.js - Line 14
const SCRIPT_URL = 'https://script.google.com/.../exec';

// schedule-api.js - Line 21 - Cache duration
cacheDuration: 60000 // 1 minute
```

### Auto-Refresh Settings
```javascript
// schedule-renderer.js - Line 47
this.startAutoRefresh(120000); // 2 minutes
```

---

## 📊 Google Sheets Structure

### Employees Sheet
| A | B | C | D | E |
|---|---|---|---|---|
| ID | Name | Initials | Role | Hours/Week |
| 1 | Josh Reymill | JR | Agent | 40 |
| 2 | Cynthia P. | CP | Agent | 35 |

### Shifts Sheet
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ShiftID | EmployeeID | Day | StartTime | EndTime | ShiftType | Status |
| 1 | 1 | Monday | 19:00 | 04:00 | AGENT | Active |
| 2 | 1 | Tuesday | 19:00 | 04:00 | AGENT | Active |

**Valid Days:** Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
**Valid ShiftTypes:** AGENT, ON-CALL BACKUP, STRATEGY, OFF
**Valid Status:** Active, Inactive, Deleted

### Schedule_Metadata Sheet
| A | B |
|---|---|
| Key | Value |
| WeekStart | 2024-05-22 |
| WeekEnd | 2024-05-28 |
| Timezone | Manila (GMT+8) |
| LastUpdated | 2024-05-25 10:00:00 |

---

## 🎯 API Endpoints

### GET Requests
```javascript
// Get full schedule
await scheduleAPI.getSchedule();

// Get employees only
await scheduleAPI.getEmployees();

// Get shifts for specific day
await scheduleAPI.getShifts('Monday');

// Get metadata
await scheduleAPI.getMetadata();
```

### POST Requests (CRUD)
```javascript
// Add shift
await scheduleAPI.addShift({
  employeeId: 1,
  day: 'Monday',
  startTime: '19:00',
  endTime: '04:00',
  shiftType: 'AGENT'
});

// Update shift
await scheduleAPI.updateShift(shiftId, {
  startTime: '20:00'
});

// Delete shift
await scheduleAPI.deleteShift(shiftId);

// Add employee
await scheduleAPI.addEmployee({
  name: 'New Employee',
  role: 'Agent',
  initials: 'NE',
  hoursPerWeek: 40
});
```

---

## 🔍 Debugging

### Check Browser Console
```javascript
// View current schedule data
console.log(scheduleRenderer.scheduleData);

// Check API cache status
console.log(scheduleAPI.getCacheStatus());

// Force refresh
await scheduleRenderer.refresh();
```

### Check Apps Script Logs
```
1. Open Apps Script editor
2. Click "Executions" (left sidebar)
3. View recent execution logs
4. Check for errors
```

### Common Issues

**Issue:** "Schedule failed to load"
```
✓ Check SCRIPT_URL in schedule-api.js
✓ Verify Apps Script is deployed as Web App
✓ Check browser console for detailed error
✓ Ensure "Who has access" is set to "Anyone"
```

**Issue:** "Data not updating"
```
✓ Clear browser cache (Ctrl+Shift+R)
✓ Check LastUpdated in metadata sheet
✓ Verify Status column is "Active" in Shifts sheet
```

**Issue:** "Permission denied"
```
✓ Re-deploy Apps Script
✓ Re-authorize when prompted
✓ Click "Advanced" → "Go to [Project] (unsafe)" → "Allow"
```

---

## 📝 HTML Element IDs

### Schedule Section
```html
<div id="schedule-grid">          <!-- Employee rows container -->
<div id="schedule-loader">         <!-- Loading spinner -->
<div id="error-message">           <!-- Error display -->
<div id="refresh-indicator">       <!-- Refresh animation -->
<h2 id="schedule-week-range">      <!-- Week range display -->
<span id="schedule-timezone">      <!-- Timezone info -->
```

### KPI Cards
```html
<span id="kpi-total-hours">        <!-- Total hours value -->
<span id="kpi-coverage-rate">      <!-- Coverage % -->
<span id="kpi-coverage-status">    <!-- Coverage status text -->
<span id="kpi-active-employees">   <!-- Employee count -->
<span id="kpi-employee-breakdown"> <!-- Role breakdown -->
<span id="kpi-backup-count">       <!-- Backup count -->
<span id="last-updated-time">      <!-- Last update timestamp -->
```

### Buttons
```html
<button id="btn-refresh">          <!-- Manual refresh -->
<button id="btn-export">           <!-- Export to CSV -->
<button id="btn-add-shift">        <!-- Add new shift -->
```

---

## 🎨 Customization

### Change Colors
```javascript
// In schedule-renderer.js

// Role colors (line ~181)
getRoleColor(role) {
  return {
    'Agent': 'bg-cyan-500',      // Change to your color
    'Team Lead': 'bg-emerald-500',
    'Management': 'bg-purple-500'
  }[role];
}

// Shift type colors (line ~192)
getShiftColor(shiftType, role) {
  // Customize shift colors here
}
```

### Change Auto-Refresh Interval
```javascript
// schedule-renderer.js - Line 47
this.startAutoRefresh(300000); // 5 minutes instead of 2
```

### Change Cache Duration
```javascript
// schedule-api.js - Line 21
cacheDuration: 300000 // 5 minutes instead of 1
```

---

## 📈 Performance Tips

1. **Enable Caching** - Already configured (1 min frontend, 5 min backend)
2. **Optimize Refresh** - Only refresh when needed, not on every click
3. **Batch Operations** - Use `batchUpdateShifts()` for multiple updates
4. **Lazy Loading** - Schedule grid loads after page is interactive

---

## 🔐 Security Notes

- Apps Script runs as YOU (the sheet owner)
- Anyone with the URL can read/write data
- To restrict access, change "Who has access" to "Anyone with Google account"
- Consider adding authentication for production use

---

## 🚀 Next Steps

1. ✅ Basic integration working
2. ⬜ Add shift modal for editing (shift-modal.js)
3. ⬜ Add employee management UI
4. ⬜ Add week navigation (prev/next)
5. ⬜ Add shift templates
6. ⬜ Add conflict detection
7. ⬜ Add email notifications
8. ⬜ Add PDF export

---

## 📞 Support

- **Documentation:** See IMPLEMENTATION_PLAN.md
- **Setup Guide:** See QUICK_SETUP_GUIDE.md
- **Google Docs:** https://developers.google.com/apps-script

---

**Last Updated:** December 2024
**Version:** 1.0
