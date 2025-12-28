# QUICK SETUP GUIDE
## Google Sheets + Apps Script Integration for Schedule Dashboard

This guide will help you connect your schedule dashboard to Google Sheets in under 30 minutes.

---

## STEP 1: Create Google Sheet (5 minutes)

### 1.1 Create New Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create new spreadsheet
3. Name it "Schedule Dashboard Data"

### 1.2 Create Sheet 1: Employees
1. Rename "Sheet1" to "Employees"
2. Add these headers in Row 1:
   ```
   A: ID | B: Name | C: Initials | D: Role | E: Hours/Week
   ```
3. Add your employees:
   ```
   1 | Josh Reymill | JR | Agent | 40
   2 | Cynthia P. | CP | Agent | 35
   3 | Backup 1 | B1 | Team Lead | 0
   4 | Backup 2 | B2 | Team Lead | 0
   5 | Project Mgr. | PM | Management | 0
   ```

### 1.3 Create Sheet 2: Shifts
1. Create new sheet (+ button at bottom)
2. Name it "Shifts"
3. Add these headers in Row 1:
   ```
   A: ShiftID | B: EmployeeID | C: Day | D: StartTime | E: EndTime | F: ShiftType | G: Status
   ```
4. Add shifts (example for Josh):
   ```
   1 | 1 | Monday | 19:00 | 04:00 | AGENT | Active
   2 | 1 | Tuesday | 19:00 | 04:00 | AGENT | Active
   3 | 1 | Wednesday | 19:00 | 04:00 | AGENT | Active
   4 | 1 | Thursday | 19:00 | 04:00 | AGENT | Active
   5 | 1 | Friday | 19:00 | 04:00 | AGENT | Active
   ```
5. Continue for Cynthia (ID 2) with 4AM-1PM shifts
6. Add ON-CALL BACKUP shifts for Backup 1 and Backup 2 (all days)

### 1.4 Create Sheet 3: Schedule_Metadata
1. Create new sheet named "Schedule_Metadata"
2. Add these headers:
   ```
   A: Key | B: Value
   ```
3. Add metadata:
   ```
   WeekStart | 2024-05-22
   WeekEnd | 2024-05-28
   Timezone | Manila (GMT+8)
   LastUpdated | 2024-05-25 10:00:00
   ```

### 1.5 Get Sheet ID
1. Look at URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
2. Copy the SHEET_ID (between `/d/` and `/edit`)
3. Save it - you'll need it soon!

---

## STEP 2: Deploy Apps Script (10 minutes)

### 2.1 Open Script Editor
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code

### 2.2 Add Backend Code
1. Copy entire contents of `Code.gs` file
2. Paste into Apps Script editor
3. Find line 18: `const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';`
4. Replace with your actual Sheet ID from Step 1.5
5. Click **Save** (💾 icon) or Ctrl+S

### 2.3 Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in:
   - Description: "Schedule API v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to [Project Name] (unsafe)**
9. Click **Allow**
10. **COPY THE DEPLOYMENT URL** - it looks like:
    ```
    https://script.google.com/macros/s/ABC123.../exec
    ```
11. Save this URL - you'll need it for Step 3!

---

## STEP 3: Update Frontend Code (5 minutes)

### 3.1 Update API Configuration
1. Open `schedule-api.js`
2. Find line 14:
   ```javascript
   const SCRIPT_URL = 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE';
   ```
3. Replace with your actual deployment URL from Step 2.3

### 3.2 Add Scripts to HTML
1. Open your `kb6_updated.html` file
2. Before the closing `</body>` tag, add:
   ```html
   <!-- Schedule API Integration -->
   <script src="schedule-api.js"></script>
   <script src="schedule-renderer.js"></script>
   
   <!-- Initialize Schedule -->
   <script>
     document.addEventListener('DOMContentLoaded', async () => {
       try {
         await scheduleRenderer.init();
         console.log('Schedule loaded successfully!');
       } catch (error) {
         console.error('Failed to load schedule:', error);
       }
     });
   </script>
   ```

### 3.3 Add Required HTML Elements
Make sure your HTML has these element IDs:
```html
<!-- In schedule section -->
<div id="schedule-grid"></div>
<div id="schedule-loader" class="hidden">Loading...</div>

<!-- In KPI section -->
<span id="kpi-total-hours">0</span>
<span id="kpi-coverage-rate">0%</span>
<span id="kpi-active-employees">0</span>
<span id="kpi-backup-count">0</span>
```

---

## STEP 4: Test Connection (5 minutes)

### 4.1 Open Dashboard
1. Open your HTML file in browser
2. Open browser console (F12 or Ctrl+Shift+I)
3. Look for: "Schedule loaded successfully!"

### 4.2 Verify Data Display
✅ Employee names appear in schedule grid
✅ Shifts show correct times (7PM-4AM, 4AM-1PM)
✅ KPI cards show correct numbers
✅ No error messages in console

### 4.3 Test Editing (if implemented)
1. Click on a shift cell
2. Modal should open (if you've added shift-modal.js)
3. Changes should save to Google Sheets

---

## STEP 5: Enable CRUD Features (Optional - 10 minutes)

### 5.1 Add Shift Modal HTML
Add this modal to your HTML (before `</body>`):
```html
<!-- Shift Edit Modal -->
<div id="shift-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-2xl p-8 max-w-md w-full">
    <h2 id="modal-title" class="text-2xl font-bold mb-6">Edit Shift</h2>
    
    <form id="shift-form" onsubmit="handleShiftSubmit(event)">
      <div class="space-y-4">
        <!-- Employee Select -->
        <div>
          <label class="block text-sm font-semibold mb-2">Employee</label>
          <select id="modal-employee-select" class="w-full p-3 border border-slate-200 rounded-lg">
            <!-- Will be populated by JavaScript -->
          </select>
        </div>
        
        <!-- Day Select -->
        <div>
          <label class="block text-sm font-semibold mb-2">Day</label>
          <select id="modal-day-select" class="w-full p-3 border border-slate-200 rounded-lg">
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
            <option>Sunday</option>
          </select>
        </div>
        
        <!-- Time Inputs -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-2">Start Time</label>
            <input type="time" id="modal-start-time" class="w-full p-3 border border-slate-200 rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">End Time</label>
            <input type="time" id="modal-end-time" class="w-full p-3 border border-slate-200 rounded-lg">
          </div>
        </div>
        
        <!-- Shift Type -->
        <div>
          <label class="block text-sm font-semibold mb-2">Shift Type</label>
          <select id="modal-shift-type" class="w-full p-3 border border-slate-200 rounded-lg">
            <option value="AGENT">Agent</option>
            <option value="ON-CALL BACKUP">On-Call Backup</option>
            <option value="STRATEGY">Strategy</option>
            <option value="OFF">Off</option>
          </select>
        </div>
      </div>
      
      <!-- Buttons -->
      <div class="flex gap-3 mt-6">
        <button type="button" onclick="closeShiftModal()" class="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-300">
          Cancel
        </button>
        <button type="submit" id="modal-submit-btn" class="flex-1 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800">
          Save Shift
        </button>
      </div>
    </form>
  </div>
</div>
```

### 5.2 Add Modal Functions
```html
<script>
function closeShiftModal() {
  document.getElementById('shift-modal').classList.add('hidden');
}

async function handleShiftSubmit(event) {
  event.preventDefault();
  
  const shiftData = {
    employeeId: parseInt(document.getElementById('modal-employee-select').value),
    day: document.getElementById('modal-day-select').value,
    startTime: document.getElementById('modal-start-time').value,
    endTime: document.getElementById('modal-end-time').value,
    shiftType: document.getElementById('modal-shift-type').value
  };
  
  try {
    const result = await scheduleAPI.addShift(shiftData);
    if (result.success) {
      alert('Shift saved successfully!');
      closeShiftModal();
      await scheduleRenderer.refresh();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Failed to save shift: ' + error.message);
  }
}
</script>
```

---

## TROUBLESHOOTING

### Issue: "Schedule failed to load"
**Solution:**
1. Check browser console for error details
2. Verify SCRIPT_URL in schedule-api.js is correct
3. Make sure Apps Script is deployed as Web App
4. Check "Who has access" is set to "Anyone"

### Issue: "Permission denied"
**Solution:**
1. Re-deploy Apps Script
2. Re-authorize when prompted
3. Make sure you clicked "Allow" for all permissions

### Issue: "Data not updating"
**Solution:**
1. Clear cache: Ctrl+Shift+R
2. Check LastUpdated timestamp in Sheet
3. Verify Apps Script logs: View → Logs in Apps Script editor

### Issue: "Shifts not appearing"
**Solution:**
1. Check Shifts sheet has "Active" in Status column (Column G)
2. Verify EmployeeID matches ID in Employees sheet
3. Check day spelling (case-sensitive: "Monday" not "monday")

---

## TESTING CHECKLIST

After setup, verify:
- [ ] Dashboard loads without errors
- [ ] Employee names display correctly
- [ ] Shifts show Manila timezone (7PM-4AM, 4AM-1PM)
- [ ] KPI cards show correct totals
- [ ] Coverage rate calculates to 100%
- [ ] Click refresh button updates data
- [ ] Edit shift in Google Sheets → Dashboard updates within 2 minutes
- [ ] Click shift cell opens modal (if implemented)
- [ ] Save shift → Appears in Google Sheet

---

## NEXT STEPS

Once basic integration works:
1. ✅ Test editing shifts from dashboard
2. ✅ Add more employees
3. ✅ Customize shift types
4. ✅ Add shift templates
5. ✅ Setup automated backups
6. ✅ Configure access permissions

---

## MAINTENANCE

### Daily
- No action required (auto-syncs)

### Weekly
- Verify backup via Google Drive version history

### Monthly  
- Review Apps Script logs for errors
- Update metadata (WeekStart/WeekEnd)

---

## SUPPORT

- Apps Script Documentation: https://developers.google.com/apps-script
- Google Sheets API: https://developers.google.com/sheets/api
- Issues? Check browser console (F12) for detailed errors

---

## ESTIMATED TIME
- ⏱️ Setup: 30 minutes
- ⏱️ Testing: 10 minutes
- ⏱️ Full CRUD: +15 minutes
- **Total: ~55 minutes**

Good luck! 🚀
