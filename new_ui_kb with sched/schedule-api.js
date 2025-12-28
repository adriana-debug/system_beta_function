/**
 * SCHEDULE API CLIENT
 * 
 * Frontend JavaScript library for communicating with Google Apps Script backend
 * Handles all HTTP requests, caching, and error handling
 * 
 * USAGE:
 * 1. Update SCRIPT_URL with your deployed Apps Script URL
 * 2. Include this file in your HTML: <script src="schedule-api.js"></script>
 * 3. Initialize: const api = new ScheduleAPI(SCRIPT_URL);
 * 4. Use methods: await api.getSchedule();
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const SCRIPT_URL = 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE';

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ScheduleAPI {
  constructor(scriptURL) {
    this.scriptURL = scriptURL;
    this.cache = {
      schedule: null,
      lastFetch: null,
      cacheDuration: 60000 // 1 minute in milliseconds
    };
    this.requestQueue = [];
    this.isProcessing = false;
  }

  // ==========================================================================
  // READ OPERATIONS
  // ==========================================================================

  /**
   * Fetch complete schedule data
   * @param {boolean} forceRefresh - Skip cache and fetch fresh data
   * @returns {Promise<Object>} Schedule data with employees, shifts, metadata
   */
  async getSchedule(forceRefresh = false) {
    // Check cache first
    if (!forceRefresh && this.isCacheValid()) {
      console.log('Returning cached schedule data');
      return this.cache.schedule;
    }

    try {
      console.log('Fetching fresh schedule data from server');
      
      const response = await this.makeRequest('GET', { action: 'getSchedule' });
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Update cache
      this.cache.schedule = response;
      this.cache.lastFetch = Date.now();
      
      return response;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      
      // Return cached data if available, even if stale
      if (this.cache.schedule) {
        console.warn('Returning stale cached data due to fetch error');
        return this.cache.schedule;
      }
      
      throw error;
    }
  }

  /**
   * Get list of all employees
   * @returns {Promise<Array>} Array of employee objects
   */
  async getEmployees() {
    try {
      const response = await this.makeRequest('GET', { action: 'getEmployees' });
      return response.employees || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Get shifts for a specific day
   * @param {string} day - Day of week (e.g., 'Monday')
   * @returns {Promise<Array>} Array of shift objects
   */
  async getShifts(day = null) {
    try {
      const params = { action: 'getShifts' };
      if (day) params.day = day;
      
      const response = await this.makeRequest('GET', params);
      return response.shifts || [];
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
  }

  /**
   * Get metadata
   * @returns {Promise<Object>} Metadata object
   */
  async getMetadata() {
    try {
      const response = await this.makeRequest('GET', { action: 'getMetadata' });
      return response.metadata || {};
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  }

  // ==========================================================================
  // CREATE OPERATIONS
  // ==========================================================================

  /**
   * Add new shift
   * @param {Object} shiftData - Shift data object
   * @param {number} shiftData.employeeId - Employee ID
   * @param {string} shiftData.day - Day of week
   * @param {string} shiftData.startTime - Start time (HH:MM format)
   * @param {string} shiftData.endTime - End time (HH:MM format)
   * @param {string} shiftData.shiftType - Type of shift
   * @returns {Promise<Object>} Result with success status and new shift ID
   */
  async addShift(shiftData) {
    // Validate locally first
    const validation = this.validateShiftData(shiftData);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors.join(', ')
      };
    }

    try {
      const response = await this.makeRequest('POST', {
        action: 'addShift',
        shift: shiftData
      });

      if (response.success) {
        this.clearCache();
      }

      return response;
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  }

  /**
   * Add new employee
   * @param {Object} employeeData - Employee data
   * @param {string} employeeData.name - Employee name
   * @param {string} employeeData.role - Employee role
   * @param {string} employeeData.initials - Employee initials (optional)
   * @param {number} employeeData.hoursPerWeek - Hours per week (optional)
   * @returns {Promise<Object>} Result with success status and new employee ID
   */
  async addEmployee(employeeData) {
    try {
      const response = await this.makeRequest('POST', {
        action: 'addEmployee',
        employee: employeeData
      });

      if (response.success) {
        this.clearCache();
      }

      return response;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  // ==========================================================================
  // UPDATE OPERATIONS
  // ==========================================================================

  /**
   * Update existing shift
   * @param {number} shiftId - ID of shift to update
   * @param {Object} shiftData - Updated shift data (partial updates allowed)
   * @returns {Promise<Object>} Result with success status
   */
  async updateShift(shiftId, shiftData) {
    try {
      const response = await this.makeRequest('POST', {
        action: 'updateShift',
        shiftId: shiftId,
        shift: shiftData
      });

      if (response.success) {
        this.clearCache();
      }

      return response;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  }

  /**
   * Update employee information
   * @param {number} employeeId - ID of employee to update
   * @param {Object} employeeData - Updated employee data (partial updates allowed)
   * @returns {Promise<Object>} Result with success status
   */
  async updateEmployee(employeeId, employeeData) {
    try {
      const response = await this.makeRequest('POST', {
        action: 'updateEmployee',
        employeeId: employeeId,
        employee: employeeData
      });

      if (response.success) {
        this.clearCache();
      }

      return response;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Batch update multiple shifts
   * @param {Array} shiftsArray - Array of {shiftId, data} objects
   * @returns {Promise<Object>} Result with success status and details
   */
  async batchUpdateShifts(shiftsArray) {
    try {
      const response = await this.makeRequest('POST', {
        action: 'batchUpdateShifts',
        shifts: shiftsArray
      });

      if (response.success) {
        this.clearCache();
      }

      return response;
    } catch (error) {
      console.error('Error batch updating shifts:', error);
      throw error;
    }
  }

  // ==========================================================================
  // DELETE OPERATIONS
  // ==========================================================================

  /**
   * Delete shift (soft delete - marks as inactive)
   * @param {number} shiftId - ID of shift to delete
   * @returns {Promise<Object>} Result with success status
   */
  async deleteShift(shiftId) {
    try {
      const response = await this.makeRequest('POST', {
        action: 'deleteShift',
        shiftId: shiftId
      });

      if (response.success) {
        this.clearCache();
      }

      return response;
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Make HTTP request to Apps Script
   * @private
   */
  async makeRequest(method, data) {
    const requestOptions = {
      method: method,
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    };

    let url = this.scriptURL;

    if (method === 'GET') {
      // Build query string for GET requests
      const params = new URLSearchParams(data);
      url += '?' + params.toString();
    } else if (method === 'POST') {
      // Send data in body for POST requests
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Request failed:', error);
      throw new Error(`Failed to ${method} data: ${error.message}`);
    }
  }

  /**
   * Check if cached data is still valid
   * @private
   */
  isCacheValid() {
    if (!this.cache.schedule || !this.cache.lastFetch) {
      return false;
    }

    const age = Date.now() - this.cache.lastFetch;
    return age < this.cache.cacheDuration;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.schedule = null;
    this.cache.lastFetch = null;
    console.log('Cache cleared');
  }

  /**
   * Set cache duration
   * @param {number} milliseconds - Cache duration in milliseconds
   */
  setCacheDuration(milliseconds) {
    this.cache.cacheDuration = milliseconds;
  }

  /**
   * Validate shift data on frontend
   * @private
   */
  validateShiftData(shift) {
    const errors = [];

    if (!shift.employeeId) {
      errors.push('Employee is required');
    }

    if (!shift.day) {
      errors.push('Day is required');
    } else {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(shift.day)) {
        errors.push('Invalid day of week');
      }
    }

    if (!shift.startTime) {
      errors.push('Start time is required');
    } else if (!this.isValidTimeFormat(shift.startTime)) {
      errors.push('Invalid start time format (use HH:MM)');
    }

    if (!shift.endTime) {
      errors.push('End time is required');
    } else if (!this.isValidTimeFormat(shift.endTime)) {
      errors.push('Invalid end time format (use HH:MM)');
    }

    if (!shift.shiftType) {
      errors.push('Shift type is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate time format (HH:MM)
   * @private
   */
  isValidTimeFormat(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Get cache status information
   * @returns {Object} Cache status
   */
  getCacheStatus() {
    return {
      hasCache: !!this.cache.schedule,
      lastFetch: this.cache.lastFetch ? new Date(this.cache.lastFetch) : null,
      age: this.cache.lastFetch ? Date.now() - this.cache.lastFetch : null,
      isValid: this.isCacheValid()
    };
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Create global instance
const scheduleAPI = new ScheduleAPI(SCRIPT_URL);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScheduleAPI, scheduleAPI };
}
