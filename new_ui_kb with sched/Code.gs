/**
 * SCHEDULE DASHBOARD - GOOGLE APPS SCRIPT BACKEND
 * 
 * This script provides a REST API for the schedule dashboard
 * Handles CRUD operations for shifts and employees
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete existing code and paste this entire file
 * 4. Update SPREADSHEET_ID below with your sheet ID
 * 5. Deploy as Web App (Deploy → New Deployment)
 * 6. Set "Execute as" to "Me" and "Access" to "Anyone"
 * 7. Copy the deployment URL and use it in your frontend
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your Sheet ID
const CACHE_DURATION = 300; // Cache duration in seconds (5 minutes)

// ============================================================================
// MAIN REQUEST HANDLERS
// ============================================================================

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
      case 'getMetadata':
        response = getMetadata();
        break;
      default:
        response = { 
          error: 'Invalid action',
          availableActions: ['getSchedule', 'getEmployees', 'getShifts', 'getMetadata']
        };
    }
    
    return createResponse(response);
  } catch(error) {
    Logger.log('GET Error: ' + error.toString());
    return createResponse({ 
      error: error.toString(),
      stack: error.stack
    });
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
      case 'batchUpdateShifts':
        response = batchUpdateShifts(data.shifts);
        break;
      default:
        response = { error: 'Invalid action' };
    }
    
    // Update last modified timestamp
    if (response.success) {
      updateMetadata('LastUpdated', new Date().toISOString());
      logOperation(action, data);
    }
    
    return createResponse(response);
  } catch(error) {
    Logger.log('POST Error: ' + error.toString());
    return createResponse({ 
      error: error.toString(),
      stack: error.stack
    });
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Add new shift to the schedule
 */
function addShift(shiftData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  
  // Validate shift data
  const validation = validateShift(shiftData);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.message
    };
  }
  
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
    'Active',
    new Date().toISOString() // Created timestamp
  ]);
  
  return {
    success: true,
    shiftId: newId,
    message: 'Shift added successfully'
  };
}

/**
 * Add new employee
 */
function addEmployee(employeeData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Employees');
  
  // Validate employee data
  if (!employeeData.name || !employeeData.role) {
    return {
      success: false,
      message: 'Name and role are required'
    };
  }
  
  // Generate new ID
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  // Generate initials if not provided
  const initials = employeeData.initials || generateInitials(employeeData.name);
  
  sheet.appendRow([
    newId,
    employeeData.name,
    initials,
    employeeData.role,
    employeeData.hoursPerWeek || 0,
    new Date().toISOString()
  ]);
  
  return {
    success: true,
    employeeId: newId,
    message: 'Employee added successfully'
  };
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get complete schedule with employees, shifts, metadata, and coverage
 */
function getFullSchedule() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('fullSchedule');
  
  if (cached) {
    return JSON.parse(cached);
  }
  
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
  
  // Calculate coverage and statistics
  const coverage = calculateCoverage(shifts);
  const statistics = calculateStatistics(employees, shifts);
  
  const result = {
    employees: employees,
    shifts: shifts,
    metadata: metadata,
    coverage: coverage,
    statistics: statistics,
    lastUpdated: metadata.LastUpdated || new Date().toISOString()
  };
  
  // Cache for 5 minutes
  cache.put('fullSchedule', JSON.stringify(result), CACHE_DURATION);
  
  return result;
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
  
  return { 
    success: true,
    employees: employees 
  };
}

/**
 * Get shifts for specific day or all shifts
 */
function getShifts(day) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  let shifts = data.slice(1)
    .filter(row => row[6] === 'Active')
    .map(row => ({
      shiftId: row[0],
      employeeId: row[1],
      day: row[2],
      startTime: row[3],
      endTime: row[4],
      shiftType: row[5]
    }));
  
  // Filter by day if specified
  if (day) {
    shifts = shifts.filter(s => s.day === day);
  }
  
  return { 
    success: true,
    shifts: shifts 
  };
}

/**
 * Get metadata
 */
function getMetadata() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Schedule_Metadata');
  const data = sheet.getDataRange().getValues();
  
  const metadata = {};
  data.slice(1).forEach(row => {
    metadata[row[0]] = row[1];
  });
  
  return {
    success: true,
    metadata: metadata
  };
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update existing shift
 */
function updateShift(shiftId, shiftData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  // Validate shift data
  const validation = validateShift(shiftData, shiftId);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.message
    };
  }
  
  // Find and update the shift
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == shiftId && data[i][6] === 'Active') {
      const row = i + 1;
      
      if (shiftData.employeeId !== undefined) 
        sheet.getRange(row, 2).setValue(shiftData.employeeId);
      if (shiftData.day !== undefined) 
        sheet.getRange(row, 3).setValue(shiftData.day);
      if (shiftData.startTime !== undefined) 
        sheet.getRange(row, 4).setValue(shiftData.startTime);
      if (shiftData.endTime !== undefined) 
        sheet.getRange(row, 5).setValue(shiftData.endTime);
      if (shiftData.shiftType !== undefined) 
        sheet.getRange(row, 6).setValue(shiftData.shiftType);
      
      // Clear cache
      CacheService.getScriptCache().remove('fullSchedule');
      
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
 * Update employee information
 */
function updateEmployee(employeeId, employeeData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Employees');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == employeeId) {
      const row = i + 1;
      
      if (employeeData.name !== undefined) 
        sheet.getRange(row, 2).setValue(employeeData.name);
      if (employeeData.initials !== undefined) 
        sheet.getRange(row, 3).setValue(employeeData.initials);
      if (employeeData.role !== undefined) 
        sheet.getRange(row, 4).setValue(employeeData.role);
      if (employeeData.hoursPerWeek !== undefined) 
        sheet.getRange(row, 5).setValue(employeeData.hoursPerWeek);
      
      // Clear cache
      CacheService.getScriptCache().remove('fullSchedule');
      
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

/**
 * Batch update multiple shifts
 */
function batchUpdateShifts(shiftsArray) {
  const results = [];
  
  shiftsArray.forEach(item => {
    const result = updateShift(item.shiftId, item.data);
    results.push({
      shiftId: item.shiftId,
      success: result.success,
      message: result.message
    });
  });
  
  const successCount = results.filter(r => r.success).length;
  
  return {
    success: true,
    message: `Updated ${successCount} of ${shiftsArray.length} shifts`,
    results: results
  };
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Soft delete shift (mark as inactive)
 */
function deleteShift(shiftId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == shiftId) {
      const row = i + 1;
      sheet.getRange(row, 7).setValue('Deleted');
      
      // Clear cache
      CacheService.getScriptCache().remove('fullSchedule');
      
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate shift data
 */
function validateShift(shift, excludeShiftId) {
  const errors = [];
  
  // Required fields
  if (!shift.employeeId) errors.push('Employee ID is required');
  if (!shift.day) errors.push('Day is required');
  if (!shift.startTime) errors.push('Start time is required');
  if (!shift.endTime) errors.push('End time is required');
  if (!shift.shiftType) errors.push('Shift type is required');
  
  if (errors.length > 0) {
    return {
      valid: false,
      message: errors.join(', ')
    };
  }
  
  // Check for overlapping shifts (same employee, same day)
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Shifts');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const existing = data[i];
    
    // Skip if this is the shift being updated
    if (excludeShiftId && existing[0] == excludeShiftId) {
      continue;
    }
    
    // Check for conflict
    if (existing[1] == shift.employeeId && 
        existing[2] == shift.day && 
        existing[6] === 'Active') {
      return {
        valid: false,
        message: 'Employee already has an active shift on ' + shift.day
      };
    }
  }
  
  return { valid: true };
}

/**
 * Calculate coverage statistics
 */
function calculateCoverage(shifts) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const requiredShiftsPerDay = 2; // Josh + Cynthia
  const totalRequiredShifts = days.length * requiredShiftsPerDay;
  
  const activeShifts = shifts.filter(s => 
    s.shiftType === 'AGENT' && s.status === 'Active'
  ).length;
  
  const coverageRate = Math.round((activeShifts / totalRequiredShifts) * 100);
  
  // Calculate by day
  const coverageByDay = {};
  days.forEach(day => {
    const dayShifts = shifts.filter(s => 
      s.day === day && s.shiftType === 'AGENT' && s.status === 'Active'
    );
    coverageByDay[day] = {
      covered: dayShifts.length,
      required: requiredShiftsPerDay,
      percentage: Math.round((dayShifts.length / requiredShiftsPerDay) * 100)
    };
  });
  
  return {
    rate: coverageRate,
    activeShifts: activeShifts,
    totalRequired: totalRequiredShifts,
    isFullyCovered: coverageRate === 100,
    byDay: coverageByDay
  };
}

/**
 * Calculate various statistics
 */
function calculateStatistics(employees, shifts) {
  const stats = {
    totalEmployees: employees.length,
    byRole: {},
    totalHours: 0,
    backupCoverage: 0
  };
  
  // Count by role
  employees.forEach(emp => {
    if (!stats.byRole[emp.role]) {
      stats.byRole[emp.role] = 0;
    }
    stats.byRole[emp.role]++;
    stats.totalHours += emp.hoursPerWeek;
  });
  
  // Count backup coverage
  const backupShifts = shifts.filter(s => s.shiftType === 'ON-CALL BACKUP');
  stats.backupCoverage = Math.round(backupShifts.length / 7); // Average per day
  
  return stats;
}

/**
 * Update metadata value
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
 * Generate initials from name
 */
function generateInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Log operation for audit trail
 */
function logOperation(operation, data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName('Logs');
    
    // Create logs sheet if it doesn't exist
    if (!logSheet) {
      logSheet = ss.insertSheet('Logs');
      logSheet.appendRow(['Timestamp', 'Operation', 'Data', 'User']);
    }
    
    logSheet.appendRow([
      new Date(),
      operation,
      JSON.stringify(data),
      Session.getActiveUser().getEmail()
    ]);
  } catch (error) {
    Logger.log('Logging error: ' + error.toString());
  }
}

/**
 * Create standardized response
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
