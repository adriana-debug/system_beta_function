# Schedule Dashboard - Google Sheets Integration Plan

## Overview
Connect the schedule dashboard to Google Sheets using Apps Script to enable real-time CRUD operations for shift management.

---

## Architecture Overview

```
Google Sheets (Data Source)
    ↓
Apps Script (Backend API)
    ↓
Web Dashboard (Frontend)
    ↓
User Interface
```

---

## Phase 1: Google Sheets Structure

### Sheet 1: Employees
| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| ID | Name | Initials | Role | Hours/Week |
| 1 | Josh Reymill | JR | Agent | 40 |
| 2 | Cynthia P. | CP | Agent | 35 |
| 3 | Backup 1 | B1 | Team Lead | 0 |
| 4 | Backup 2 | B2 | Team Lead | 0 |
| 5 | Project Mgr. | PM | Management | 0 |

### Sheet 2: Shifts
| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| ShiftID | EmployeeID | Day | StartTime | EndTime | ShiftType | Status |
| 1 | 1 | Monday | 19:00 | 04:00 | AGENT | Active |
| 2 | 1 | Tuesday | 19:00 | 04:00 | AGENT | Active |
| 3 | 2 | Monday | 04:00 | 13:00 | AGENT | Active |
| 4 | 3 | Monday | 00:00 | 23:59 | ON-CALL BACKUP | Active |

**Day Values**: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday

**ShiftType Values**: AGENT, ON-CALL BACKUP, STRATEGY, OFF

**Status Values**: Active, Inactive, Deleted

### Sheet 3: Schedule_Metadata
| Column A | Column B |
|----------|----------|
| Key | Value |
| WeekStart | 2024-05-22 |
| WeekEnd | 2024-05-28 |
| Timezone | Manila (GMT+8) |
| LastUpdated | 2024-05-25 10:30:00 |

---

## Phase 2: Apps Script API Endpoints

### File: Code.gs

```javascript
// CONFIGURATION
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'http://localhost:8000' // For testing
];

/**
 * Handle GET requests - Read operations
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    let response;
    
    switch(action) {
      case 'getSchedule':
        response = getFullSchedule();
        break;
      case 'getEmployees':
        response = getEmployees();
        break;
      case 'getShifts':
        const day = e.parameter.day;
        response = getShifts(day);
        break;
      default:
        response = { error: 'Invalid action' };
    }
    
    return createCORSResponse(response);
  } catch(error) {
    return createCORSResponse({ error: error.toString() });
  }
}

/**
 * Handle POST requests - Create, Update, Delete operations
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  try {
    let response;
    
    switch(action) {
      case 'addShift':
        response = addShift(data.shift);
        break;
      case 'updateShift':
        response = updateShift(data.shiftId, data.shift);
        break;
      case 'deleteShift':
        response = deleteShift(data.shiftId);
        break;
      case 'addEmployee':
        response = addEmployee(data.employee);
        break;
      case 'updateEmployee':
        response = updateEmployee(data.employeeId, data.employee);
        break;
      default:
        response = { error: 'Invalid action' };
    }
    
    // Update last modified timestamp
    updateMetadata('LastUpdated', new Date().toISOString());
    
    return createCORSResponse(response);
  } catch(error) {
    return createCORSResponse({ error: error.toString() });
  }
}

/**
 * CREATE - Add new shift
 */
function addShift(shiftData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  
  // Generate new ShiftID
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  // Append new row
  sheet.appendRow([
    newId,
    shiftData.employeeId,
    shiftData.day,
    shiftData.startTime,
    shiftData.endTime,
    shiftData.shiftType,
    'Active'
  ]);
  
  return {
    success: true,
    shiftId: newId,
    message: 'Shift added successfully'
  };
}

/**
 * READ - Get full schedule
 */
function getFullSchedule() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Get employees
  const employeeSheet = ss.getSheetByName('Employees');
  const employeeData = employeeSheet.getDataRange().getValues();
  const employees = employeeData.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    initials: row[2],
    role: row[3],
    hoursPerWeek: row[4]
  }));
  
  // Get shifts
  const shiftSheet = ss.getSheetByName('Shifts');
  const shiftData = shiftSheet.getDataRange().getValues();
  const shifts = shiftData.slice(1)
    .filter(row => row[6] === 'Active')
    .map(row => ({
      shiftId: row[0],
      employeeId: row[1],
      day: row[2],
      startTime: row[3],
      endTime: row[4],
      shiftType: row[5],
      status: row[6]
    }));
  
  // Get metadata
  const metaSheet = ss.getSheetByName('Schedule_Metadata');
  const metaData = metaSheet.getDataRange().getValues();
  const metadata = {};
  metaData.slice(1).forEach(row => {
    metadata[row[0]] = row[1];
  });
  
  // Calculate coverage
  const coverage = calculateCoverage(shifts);
  
  return {
    employees: employees,
    shifts: shifts,
    metadata: metadata,
    coverage: coverage,
    lastUpdated: metadata.LastUpdated || new Date().toISOString()
  };
}

/**
 * UPDATE - Update existing shift
 */
function updateShift(shiftId, shiftData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  // Find row with matching shiftId
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == shiftId) {
      const row = i + 1;
      
      // Update columns
      if (shiftData.employeeId !== undefined) sheet.getRange(row, 2).setValue(shiftData.employeeId);
      if (shiftData.day !== undefined) sheet.getRange(row, 3).setValue(shiftData.day);
      if (shiftData.startTime !== undefined) sheet.getRange(row, 4).setValue(shiftData.startTime);
      if (shiftData.endTime !== undefined) sheet.getRange(row, 5).setValue(shiftData.endTime);
      if (shiftData.shiftType !== undefined) sheet.getRange(row, 6).setValue(shiftData.shiftType);
      
      return {
        success: true,
        message: 'Shift updated successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Shift not found'
  };
}

/**
 * DELETE - Soft delete shift (mark as inactive)
 */
function deleteShift(shiftId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == shiftId) {
      const row = i + 1;
      sheet.getRange(row, 7).setValue('Deleted');
      
      return {
        success: true,
        message: 'Shift deleted successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Shift not found'
  };
}

/**
 * Calculate coverage percentage
 */
function calculateCoverage(shifts) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const requiredShiftsPerDay = 2; // Josh + Cynthia
  const totalRequiredShifts = days.length * requiredShiftsPerDay;
  
  const activeShifts = shifts.filter(s => 
    s.shiftType === 'AGENT' && s.status === 'Active'
  ).length;
  
  const coverageRate = Math.round((activeShifts / totalRequiredShifts) * 100);
  
  return {
    rate: coverageRate,
    activeShifts: activeShifts,
    totalRequired: totalRequiredShifts,
    isFullyCovered: coverageRate === 100
  };
}

/**
 * Get all employees
 */
function getEmployees() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Employees');
  const data = sheet.getDataRange().getValues();
  
  const employees = data.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    initials: row[2],
    role: row[3],
    hoursPerWeek: row[4]
  }));
  
  return { employees: employees };
}

/**
 * Get shifts for specific day
 */
function getShifts(day) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  const shifts = data.slice(1)
    .filter(row => row[2] === day && row[6] === 'Active')
    .map(row => ({
      shiftId: row[0],
      employeeId: row[1],
      day: row[2],
      startTime: row[3],
      endTime: row[4],
      shiftType: row[5]
    }));
  
  return { shifts: shifts };
}

/**
 * Update metadata
 */
function updateMetadata(key, value) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Schedule_Metadata');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  
  // If key doesn't exist, add it
  sheet.appendRow([key, value]);
}

/**
 * Create CORS-enabled response
 */
function createCORSResponse(data) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  return response;
}

/**
 * Add new employee
 */
function addEmployee(employeeData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Employees');
  
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  sheet.appendRow([
    newId,
    employeeData.name,
    employeeData.initials,
    employeeData.role,
    employeeData.hoursPerWeek || 0
  ]);
  
  return {
    success: true,
    employeeId: newId,
    message: 'Employee added successfully'
  };
}

/**
 * Update employee
 */
function updateEmployee(employeeId, employeeData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Employees');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == employeeId) {
      const row = i + 1;
      
      if (employeeData.name !== undefined) sheet.getRange(row, 2).setValue(employeeData.name);
      if (employeeData.initials !== undefined) sheet.getRange(row, 3).setValue(employeeData.initials);
      if (employeeData.role !== undefined) sheet.getRange(row, 4).setValue(employeeData.role);
      if (employeeData.hoursPerWeek !== undefined) sheet.getRange(row, 5).setValue(employeeData.hoursPerWeek);
      
      return {
        success: true,
        message: 'Employee updated successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Employee not found'
  };
}
```

---

## Phase 3: Frontend JavaScript Integration

### File: schedule-api.js

```javascript
/**
 * Schedule API Client
 * Handles all communication with Google Apps Script backend
 */

class ScheduleAPI {
  constructor(scriptURL) {
    this.scriptURL = scriptURL;
    this.cache = {
      schedule: null,
      lastFetch: null,
      cacheDuration: 60000 // 1 minute
    };
  }

  /**
   * Fetch full schedule from Google Sheets
   */
  async getSchedule(forceRefresh = false) {
    // Check cache
    if (!forceRefresh && this.cache.schedule && this.cache.lastFetch) {
      const timeSinceLastFetch = Date.now() - this.cache.lastFetch;
      if (timeSinceLastFetch < this.cacheDuration) {
        return this.cache.schedule;
      }
    }

    try {
      const response = await fetch(`${this.scriptURL}?action=getSchedule`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update cache
      this.cache.schedule = data;
      this.cache.lastFetch = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  /**
   * Add new shift
   */
  async addShift(shiftData) {
    try {
      const response = await fetch(this.scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'addShift',
          shift: shiftData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Clear cache to force refresh
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  }

  /**
   * Update existing shift
   */
  async updateShift(shiftId, shiftData) {
    try {
      const response = await fetch(this.scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'updateShift',
          shiftId: shiftId,
          shift: shiftData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  }

  /**
   * Delete shift
   */
  async deleteShift(shiftId) {
    try {
      const response = await fetch(this.scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'deleteShift',
          shiftId: shiftId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  }

  /**
   * Add new employee
   */
  async addEmployee(employeeData) {
    try {
      const response = await fetch(this.scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'addEmployee',
          employee: employeeData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.schedule = null;
    this.cache.lastFetch = null;
  }
}

// Initialize API client
const SCRIPT_URL = 'YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE';
const scheduleAPI = new ScheduleAPI(SCRIPT_URL);
```

### File: schedule-renderer.js

```javascript
/**
 * Schedule Renderer
 * Renders schedule data to the dashboard UI
 */

class ScheduleRenderer {
  constructor(apiClient) {
    this.api = apiClient;
    this.scheduleData = null;
  }

  /**
   * Initialize and render schedule
   */
  async init() {
    try {
      // Show loading state
      this.showLoading();
      
      // Fetch data
      this.scheduleData = await this.api.getSchedule();
      
      // Render
      this.renderSchedule();
      this.renderKPIs();
      
      // Hide loading
      this.hideLoading();
      
      // Setup auto-refresh every 5 minutes
      setInterval(() => this.refresh(), 300000);
      
    } catch (error) {
      console.error('Error initializing schedule:', error);
      this.showError('Failed to load schedule. Please refresh the page.');
    }
  }

  /**
   * Refresh schedule data
   */
  async refresh() {
    try {
      this.scheduleData = await this.api.getSchedule(true);
      this.renderSchedule();
      this.renderKPIs();
    } catch (error) {
      console.error('Error refreshing schedule:', error);
    }
  }

  /**
   * Render employee schedule grid
   */
  renderSchedule() {
    const { employees, shifts } = this.scheduleData;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Group shifts by employee and day
    const shiftMap = {};
    shifts.forEach(shift => {
      const key = `${shift.employeeId}-${shift.day}`;
      shiftMap[key] = shift;
    });
    
    // Build HTML for each employee row
    let html = '';
    
    employees.forEach(employee => {
      html += `
        <div class="grid grid-cols-8 border-b border-slate-100 hover:bg-slate-50 transition-colors" data-employee-id="${employee.id}">
          <div class="p-4 border-r border-slate-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full ${this.getRoleColor(employee.role)} flex items-center justify-center text-white font-bold text-sm">
              ${employee.initials}
            </div>
            <div>
              <p class="font-semibold text-slate-900 text-sm">${employee.name}</p>
              <p class="text-xs text-slate-500">${employee.hoursPerWeek} Hrs/week</p>
            </div>
          </div>
      `;
      
      // Render each day
      days.forEach((day, index) => {
        const shift = shiftMap[`${employee.id}-${day}`];
        const isToday = index === 3; // Thursday is "TODAY" in our example
        
        html += `
          <div class="p-2 border-r border-slate-100 flex items-center justify-center ${isToday ? 'bg-blue-50' : ''}" 
               data-day="${day}" 
               data-employee-id="${employee.id}">
            ${this.renderShiftCell(shift, employee.role)}
          </div>
        `;
      });
      
      html += `</div>`;
    });
    
    // Insert into DOM
    const scheduleGrid = document.getElementById('schedule-grid');
    if (scheduleGrid) {
      scheduleGrid.innerHTML = html;
    }
  }

  /**
   * Render individual shift cell
   */
  renderShiftCell(shift, role) {
    if (!shift || shift.shiftType === 'OFF') {
      return `<div class="bg-slate-100 text-slate-400 px-3 py-2 rounded text-xs font-semibold text-center w-full">OFF</div>`;
    }
    
    if (shift.shiftType === 'ON-CALL BACKUP') {
      return `
        <div class="bg-slate-100 text-slate-600 px-3 py-2 rounded text-xs font-semibold text-center w-full border border-slate-200 cursor-pointer shift-cell" data-shift-id="${shift.shiftId}">
          <div class="font-bold">ON-CALL</div>
          <div class="text-[10px] opacity-70 mt-1">BACKUP</div>
        </div>
      `;
    }
    
    const color = this.getShiftColor(shift.shiftType);
    
    return `
      <div class="${color} text-white px-3 py-2 rounded text-xs font-semibold text-center w-full cursor-pointer shift-cell" data-shift-id="${shift.shiftId}">
        <div class="font-bold">${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}</div>
        <div class="text-[10px] opacity-90 mt-1">${shift.shiftType}</div>
      </div>
    `;
  }

  /**
   * Render KPI cards with live data
   */
  renderKPIs() {
    const { coverage, employees, shifts } = this.scheduleData;
    
    // Calculate total hours
    const totalHours = employees.reduce((sum, emp) => sum + emp.hoursPerWeek, 0);
    
    // Count active employees by role
    const agentCount = employees.filter(e => e.role === 'Agent').length;
    const tlCount = employees.filter(e => e.role === 'Team Lead').length;
    const pmCount = employees.filter(e => e.role === 'Management').length;
    
    // Count backup coverage
    const backupCount = shifts.filter(s => s.shiftType === 'ON-CALL BACKUP').length / 7; // Per day
    
    document.getElementById('kpi-total-hours').textContent = totalHours.toFixed(1);
    document.getElementById('kpi-coverage-rate').textContent = `${coverage.rate}%`;
    document.getElementById('kpi-coverage-status').textContent = coverage.isFullyCovered ? 'All shifts covered' : `${coverage.activeShifts}/${coverage.totalRequired} shifts`;
    document.getElementById('kpi-active-employees').textContent = employees.length;
    document.getElementById('kpi-employee-breakdown').textContent = `${agentCount} Agents, ${tlCount} TL, ${pmCount} PM`;
    document.getElementById('kpi-backup-count').textContent = Math.round(backupCount);
  }

  /**
   * Helper: Get role-based color
   */
  getRoleColor(role) {
    const colors = {
      'Agent': 'bg-cyan-500',
      'Team Lead': 'bg-emerald-500',
      'Management': 'bg-purple-500'
    };
    return colors[role] || 'bg-slate-500';
  }

  /**
   * Helper: Get shift type color
   */
  getShiftColor(shiftType) {
    const colors = {
      'AGENT': 'bg-cyan-500',
      'STRATEGY': 'bg-purple-500'
    };
    return colors[shiftType] || 'bg-slate-500';
  }

  /**
   * Helper: Format time string
   */
  formatTime(timeStr) {
    // Convert "19:00" to "7PM"
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}${ampm}`;
  }

  /**
   * Show loading state
   */
  showLoading() {
    const loader = document.getElementById('schedule-loader');
    if (loader) loader.classList.remove('hidden');
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loader = document.getElementById('schedule-loader');
    if (loader) loader.classList.add('hidden');
  }

  /**
   * Show error message
   */
  showError(message) {
    // Implement error notification
    console.error(message);
  }
}

// Initialize renderer
const scheduleRenderer = new ScheduleRenderer(scheduleAPI);
```

---

## Phase 4: CRUD UI Components

### File: shift-modal.js

```javascript
/**
 * Shift Modal - Add/Edit Shift Interface
 */

class ShiftModal {
  constructor(apiClient, renderer) {
    this.api = apiClient;
    this.renderer = renderer;
    this.currentShiftId = null;
    this.isEditMode = false;
  }

  /**
   * Open modal for adding new shift
   */
  openAddModal(employeeId, day) {
    this.isEditMode = false;
    this.currentShiftId = null;
    
    // Pre-fill form
    document.getElementById('modal-employee-select').value = employeeId || '';
    document.getElementById('modal-day-select').value = day || 'Monday';
    document.getElementById('modal-start-time').value = '19:00';
    document.getElementById('modal-end-time').value = '04:00';
    document.getElementById('modal-shift-type').value = 'AGENT';
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'Add New Shift';
    document.getElementById('modal-submit-btn').textContent = 'Add Shift';
    
    // Show modal
    document.getElementById('shift-modal').classList.remove('hidden');
  }

  /**
   * Open modal for editing existing shift
   */
  async openEditModal(shiftId) {
    this.isEditMode = true;
    this.currentShiftId = shiftId;
    
    // Fetch shift details
    const scheduleData = await this.api.getSchedule();
    const shift = scheduleData.shifts.find(s => s.shiftId == shiftId);
    
    if (!shift) {
      alert('Shift not found');
      return;
    }
    
    // Fill form with existing data
    document.getElementById('modal-employee-select').value = shift.employeeId;
    document.getElementById('modal-day-select').value = shift.day;
    document.getElementById('modal-start-time').value = shift.startTime;
    document.getElementById('modal-end-time').value = shift.endTime;
    document.getElementById('modal-shift-type').value = shift.shiftType;
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'Edit Shift';
    document.getElementById('modal-submit-btn').textContent = 'Update Shift';
    
    // Show modal
    document.getElementById('shift-modal').classList.remove('hidden');
  }

  /**
   * Close modal
   */
  closeModal() {
    document.getElementById('shift-modal').classList.add('hidden');
    this.resetForm();
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    const shiftData = {
      employeeId: parseInt(document.getElementById('modal-employee-select').value),
      day: document.getElementById('modal-day-select').value,
      startTime: document.getElementById('modal-start-time').value,
      endTime: document.getElementById('modal-end-time').value,
      shiftType: document.getElementById('modal-shift-type').value
    };
    
    try {
      // Show loading
      this.showSubmitLoading();
      
      let result;
      if (this.isEditMode) {
        result = await this.api.updateShift(this.currentShiftId, shiftData);
      } else {
        result = await this.api.addShift(shiftData);
      }
      
      if (result.success) {
        // Success notification
        this.showNotification('success', result.message);
        
        // Refresh schedule
        await this.renderer.refresh();
        
        // Close modal
        this.closeModal();
      } else {
        this.showNotification('error', result.message);
      }
      
    } catch (error) {
      this.showNotification('error', 'An error occurred. Please try again.');
    } finally {
      this.hideSubmitLoading();
    }
  }

  /**
   * Handle shift deletion
   */
  async handleDelete(shiftId) {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return;
    }
    
    try {
      const result = await this.api.deleteShift(shiftId);
      
      if (result.success) {
        this.showNotification('success', 'Shift deleted successfully');
        await this.renderer.refresh();
        this.closeModal();
      } else {
        this.showNotification('error', result.message);
      }
    } catch (error) {
      this.showNotification('error', 'Failed to delete shift');
    }
  }

  /**
   * Reset form
   */
  resetForm() {
    document.getElementById('shift-form').reset();
    this.currentShiftId = null;
    this.isEditMode = false;
  }

  /**
   * Show submit button loading
   */
  showSubmitLoading() {
    const btn = document.getElementById('modal-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin">⏳</span> Saving...';
  }

  /**
   * Hide submit button loading
   */
  hideSubmitLoading() {
    const btn = document.getElementById('modal-submit-btn');
    btn.disabled = false;
    btn.textContent = this.isEditMode ? 'Update Shift' : 'Add Shift';
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    // Implement toast notification
    const color = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${color} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize shift modal
const shiftModal = new ShiftModal(scheduleAPI, scheduleRenderer);
```

---

## Phase 5: Deployment Steps

### Step 1: Setup Google Sheet
1. Create new Google Sheet
2. Create three sheets: "Employees", "Shifts", "Schedule_Metadata"
3. Add headers as specified in Phase 1
4. Populate with initial data

### Step 2: Deploy Apps Script
1. Open Google Sheet → Extensions → Apps Script
2. Create new script file "Code.gs"
3. Paste Apps Script code from Phase 2
4. Update `SPREADSHEET_ID` constant
5. Deploy as Web App:
   - Execute as: Me
   - Who has access: Anyone
6. Copy deployment URL

### Step 3: Update Frontend
1. Update `SCRIPT_URL` in schedule-api.js
2. Add script files to your HTML:
```html
<script src="schedule-api.js"></script>
<script src="schedule-renderer.js"></script>
<script src="shift-modal.js"></script>
```

### Step 4: Initialize on Page Load
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize schedule
  await scheduleRenderer.init();
  
  // Setup event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Click on shift cell to edit
  document.addEventListener('click', (e) => {
    const shiftCell = e.target.closest('.shift-cell');
    if (shiftCell) {
      const shiftId = shiftCell.dataset.shiftId;
      shiftModal.openEditModal(shiftId);
    }
  });
  
  // Add shift button
  document.getElementById('btn-add-shift').addEventListener('click', () => {
    shiftModal.openAddModal();
  });
}
```

---

## Phase 6: Auto-Sync & Real-time Updates

### Option A: Polling (Simple)
```javascript
// In schedule-renderer.js
setInterval(async () => {
  await this.refresh();
}, 60000); // Refresh every 60 seconds
```

### Option B: Web Sockets (Advanced)
- Use Google Cloud Pub/Sub
- Trigger on sheet changes
- Push updates to connected clients

### Option C: Service Worker (PWA)
```javascript
// service-worker.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-schedule') {
    event.waitUntil(syncSchedule());
  }
});
```

---

## Phase 7: Error Handling & Validation

### Frontend Validation
```javascript
function validateShiftData(data) {
  const errors = [];
  
  if (!data.employeeId) errors.push('Employee is required');
  if (!data.day) errors.push('Day is required');
  if (!data.startTime) errors.push('Start time is required');
  if (!data.endTime) errors.push('End time is required');
  
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(data.startTime)) {
    errors.push('Invalid start time format');
  }
  if (!timeRegex.test(data.endTime)) {
    errors.push('Invalid end time format');
  }
  
  return errors;
}
```

### Backend Validation (Apps Script)
```javascript
function validateShift(shift) {
  // Check for overlapping shifts
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const existing = data[i];
    
    // Same employee, same day
    if (existing[1] == shift.employeeId && 
        existing[2] == shift.day && 
        existing[6] === 'Active') {
      return {
        valid: false,
        message: 'Employee already has a shift on this day'
      };
    }
  }
  
  return { valid: true };
}
```

---

## Phase 8: Testing Checklist

- [ ] Test CREATE: Add new shift
- [ ] Test READ: Load schedule on page load
- [ ] Test UPDATE: Edit existing shift times
- [ ] Test DELETE: Remove shift
- [ ] Test coverage calculation updates automatically
- [ ] Test KPI cards update after CRUD operations
- [ ] Test error handling for network failures
- [ ] Test validation for invalid time formats
- [ ] Test concurrent edit conflicts
- [ ] Test with multiple browser tabs open
- [ ] Test auto-refresh functionality
- [ ] Test mobile responsiveness

---

## Phase 9: Performance Optimization

### Caching Strategy
```javascript
// Implement service worker caching
const CACHE_NAME = 'schedule-v1';
const urlsToCache = [
  '/schedule.html',
  '/schedule-api.js',
  '/schedule-renderer.js'
];
```

### Batch Operations
```javascript
// For bulk updates
async function batchUpdateShifts(shifts) {
  const promises = shifts.map(shift => 
    this.api.updateShift(shift.id, shift.data)
  );
  return await Promise.all(promises);
}
```

### Debounce Refresh
```javascript
const debouncedRefresh = debounce(() => {
  scheduleRenderer.refresh();
}, 500);
```

---

## Security Considerations

1. **Authentication**: Apps Script executes as sheet owner
2. **Authorization**: Limit who can access the web app
3. **Input Sanitization**: Validate all user inputs
4. **Rate Limiting**: Prevent API abuse
5. **HTTPS Only**: Ensure secure connections

---

## Maintenance & Monitoring

### Logging
```javascript
function logOperation(operation, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = ss.getSheetByName('Logs') || ss.insertSheet('Logs');
  
  logSheet.appendRow([
    new Date(),
    operation,
    JSON.stringify(data),
    Session.getActiveUser().getEmail()
  ]);
}
```

### Backup
- Enable version history in Google Sheets
- Export data weekly
- Keep backups in Google Drive

---

## Future Enhancements

1. **Shift Templates**: Save common shift patterns
2. **Conflict Detection**: Highlight scheduling conflicts
3. **Notifications**: Email alerts for shift changes
4. **Export**: Download schedule as PDF/CSV
5. **Analytics**: Track coverage trends over time
6. **Mobile App**: Native iOS/Android app
7. **Time Zone Support**: Multi-timezone scheduling
8. **Approval Workflow**: Manager review before publishing

---

## Support & Documentation

- Google Apps Script Reference: https://developers.google.com/apps-script
- Spreadsheet Service: https://developers.google.com/apps-script/reference/spreadsheet
- Web Apps Guide: https://developers.google.com/apps-script/guides/web
