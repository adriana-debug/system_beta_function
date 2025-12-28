/**
 * SCHEDULE RENDERER
 * 
 * Renders schedule data from Google Sheets to the dashboard UI
 * Handles automatic updates and real-time display
 * 
 * USAGE:
 * 1. Include after schedule-api.js
 * 2. Initialize: const renderer = new ScheduleRenderer(scheduleAPI);
 * 3. Call init(): await renderer.init();
 */

class ScheduleRenderer {
  constructor(apiClient) {
    this.api = apiClient;
    this.scheduleData = null;
    this.autoRefreshInterval = null;
    this.currentWeek = this.getCurrentWeek();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize renderer and load schedule
   */
  async init() {
    try {
      console.log('Initializing schedule renderer...');
      
      // Show loading state
      this.showLoading();
      
      // Fetch initial data
      await this.loadSchedule();
      
      // Render all components
      this.renderAll();
      
      // Hide loading
      this.hideLoading();
      
      // Setup auto-refresh (every 2 minutes)
      this.startAutoRefresh(120000);
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('Schedule renderer initialized successfully');
      
    } catch (error) {
      console.error('Error initializing schedule:', error);
      this.showError('Failed to load schedule. Please refresh the page.');
      this.hideLoading();
    }
  }

  /**
   * Load schedule data from API
   */
  async loadSchedule() {
    this.scheduleData = await this.api.getSchedule();
    console.log('Schedule data loaded:', this.scheduleData);
  }

  /**
   * Refresh schedule data and re-render
   */
  async refresh(silent = false) {
    try {
      if (!silent) {
        this.showRefreshIndicator();
      }
      
      await this.loadSchedule();
      this.renderAll();
      
      if (!silent) {
        this.hideRefreshIndicator();
        this.showNotification('success', 'Schedule updated');
      }
      
    } catch (error) {
      console.error('Error refreshing schedule:', error);
      if (!silent) {
        this.showNotification('error', 'Failed to refresh schedule');
      }
    }
  }

  // ==========================================================================
  // RENDERING METHODS
  // ==========================================================================

  /**
   * Render all components
   */
  renderAll() {
    if (!this.scheduleData) {
      console.warn('No schedule data to render');
      return;
    }

    this.renderHeader();
    this.renderScheduleGrid();
    this.renderKPIs();
    this.updateLastUpdated();
  }

  /**
   * Render schedule header with week information
   */
  renderHeader() {
    const metadata = this.scheduleData.metadata || {};
    const weekStart = metadata.WeekStart || this.currentWeek.start;
    const weekEnd = metadata.WeekEnd || this.currentWeek.end;
    
    const headerElement = document.getElementById('schedule-week-range');
    if (headerElement) {
      headerElement.textContent = `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
    }

    const timezoneElement = document.getElementById('schedule-timezone');
    if (timezoneElement) {
      timezoneElement.innerHTML = '<span class="font-semibold text-slate-700">Manila Time (GMT+8)</span> <span class="text-slate-400">/ EST (GMT-5)</span>';
    }
  }

  /**
   * Render employee schedule grid
   */
  renderScheduleGrid() {
    const { employees, shifts } = this.scheduleData;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create shift lookup map
    const shiftMap = this.createShiftMap(shifts);
    
    // Build HTML
    let html = '';
    
    employees.forEach(employee => {
      html += this.renderEmployeeRow(employee, days, shiftMap);
    });
    
    // Insert into DOM
    const gridElement = document.getElementById('schedule-grid');
    if (gridElement) {
      gridElement.innerHTML = html;
    }

    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * Render single employee row
   */
  renderEmployeeRow(employee, days, shiftMap) {
    const roleColor = this.getRoleColor(employee.role);
    
    let html = `
      <div class="grid grid-cols-8 border-b border-slate-100 hover:bg-slate-50 transition-colors" 
           data-employee-id="${employee.id}">
        <!-- Employee Info -->
        <div class="p-4 border-r border-slate-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full ${roleColor} flex items-center justify-center text-white font-bold text-sm">
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
      const isToday = this.isToday(day);
      
      html += `
        <div class="p-2 border-r border-slate-100 flex items-center justify-center ${isToday ? 'bg-blue-50' : ''}" 
             data-day="${day}" 
             data-employee-id="${employee.id}"
             onclick="handleCellClick(${employee.id}, '${day}', ${shift ? shift.shiftId : null})">
          ${this.renderShiftCell(shift, employee.role)}
        </div>
      `;
    });
    
    html += `</div>`;
    return html;
  }

  /**
   * Render individual shift cell
   */
  renderShiftCell(shift, role) {
    if (!shift || shift.shiftType === 'OFF') {
      return `<div class="bg-slate-100 text-slate-400 px-3 py-2 rounded text-xs font-semibold text-center w-full cursor-pointer hover:bg-slate-200 transition-colors">OFF</div>`;
    }
    
    if (shift.shiftType === 'ON-CALL BACKUP') {
      return `
        <div class="bg-slate-100 text-slate-600 px-3 py-2 rounded text-xs font-semibold text-center w-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors shift-cell" 
             data-shift-id="${shift.shiftId}">
          <div class="font-bold">ON-CALL</div>
          <div class="text-[10px] opacity-70 mt-1">BACKUP</div>
        </div>
      `;
    }
    
    const color = this.getShiftColor(shift.shiftType, role);
    
    return `
      <div class="${color} text-white px-3 py-2 rounded text-xs font-semibold text-center w-full cursor-pointer hover:opacity-90 transition-opacity shift-cell" 
           data-shift-id="${shift.shiftId}">
        <div class="font-bold">${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}</div>
        <div class="text-[10px] opacity-90 mt-1">${shift.shiftType}</div>
      </div>
    `;
  }

  /**
   * Render KPI cards
   */
  renderKPIs() {
    const { coverage, statistics } = this.scheduleData;
    
    // Total Hours
    this.updateElement('kpi-total-hours', statistics.totalHours.toFixed(1));
    this.updateElement('kpi-total-hours-label', 'Per week');
    
    // Coverage Rate
    this.updateElement('kpi-coverage-rate', `${coverage.rate}%`);
    const coverageClass = coverage.isFullyCovered ? 'text-emerald-600' : 'text-orange-500';
    const coverageElement = document.getElementById('kpi-coverage-rate');
    if (coverageElement) {
      coverageElement.className = `text-3xl font-bold ${coverageClass}`;
    }
    this.updateElement('kpi-coverage-status', coverage.isFullyCovered ? 'All shifts covered' : `${coverage.activeShifts}/${coverage.totalRequired} shifts`);
    
    // Active Employees
    this.updateElement('kpi-active-employees', statistics.totalEmployees);
    const roleBreakdown = Object.entries(statistics.byRole)
      .map(([role, count]) => `${count} ${this.getRoleShortName(role)}`)
      .join(', ');
    this.updateElement('kpi-employee-breakdown', roleBreakdown);
    
    // Backup Coverage
    this.updateElement('kpi-backup-count', statistics.backupCoverage);
    this.updateElement('kpi-backup-label', 'Team leads on-call');
  }

  /**
   * Update last updated timestamp
   */
  updateLastUpdated() {
    const lastUpdated = this.scheduleData.lastUpdated;
    const element = document.getElementById('last-updated-time');
    
    if (element && lastUpdated) {
      const date = new Date(lastUpdated);
      element.textContent = this.formatDateTime(date);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Create shift lookup map for O(1) access
   */
  createShiftMap(shifts) {
    const map = {};
    shifts.forEach(shift => {
      const key = `${shift.employeeId}-${shift.day}`;
      map[key] = shift;
    });
    return map;
  }

  /**
   * Get role-based background color
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
   * Get shift type color
   */
  getShiftColor(shiftType, role) {
    if (shiftType === 'AGENT') {
      return role === 'Agent' ? 'bg-cyan-500' : 'bg-indigo-500';
    }
    if (shiftType === 'STRATEGY') return 'bg-purple-500';
    return 'bg-slate-500';
  }

  /**
   * Get short role name for display
   */
  getRoleShortName(role) {
    const shortNames = {
      'Agent': 'Agents',
      'Team Lead': 'TL',
      'Management': 'PM'
    };
    return shortNames[role] || role;
  }

  /**
   * Format time (19:00 → 7PM)
   */
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    
    return `${displayHour}${ampm}`;
  }

  /**
   * Format date (YYYY-MM-DD → May 22)
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  /**
   * Format date and time
   */
  formatDateTime(date) {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleString('en-US', options);
  }

  /**
   * Get current week range
   */
  getCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // Make Sunday = 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  }

  /**
   * Check if day is today
   */
  isToday(dayName) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    return dayName === todayName;
  }

  /**
   * Update element text content safely
   */
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  // ==========================================================================
  // AUTO-REFRESH
  // ==========================================================================

  /**
   * Start automatic refresh
   */
  startAutoRefresh(intervalMs = 120000) {
    this.stopAutoRefresh(); // Clear any existing interval
    
    this.autoRefreshInterval = setInterval(() => {
      console.log('Auto-refreshing schedule...');
      this.refresh(true); // Silent refresh
    }, intervalMs);
    
    console.log(`Auto-refresh started (every ${intervalMs/1000} seconds)`);
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
      console.log('Auto-refresh stopped');
    }
  }

  // ==========================================================================
  // UI STATE MANAGEMENT
  // ==========================================================================

  /**
   * Show loading spinner
   */
  showLoading() {
    const loader = document.getElementById('schedule-loader');
    if (loader) {
      loader.classList.remove('hidden');
    }
  }

  /**
   * Hide loading spinner
   */
  hideLoading() {
    const loader = document.getElementById('schedule-loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }

  /**
   * Show refresh indicator
   */
  showRefreshIndicator() {
    const indicator = document.getElementById('refresh-indicator');
    if (indicator) {
      indicator.classList.remove('hidden');
    }
  }

  /**
   * Hide refresh indicator
   */
  hideRefreshIndicator() {
    const indicator = document.getElementById('refresh-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
    }
  }

  /**
   * Show notification toast
   */
  showNotification(type, message) {
    const color = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const icon = type === 'success' ? '✓' : '✕';
    
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${color} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in`;
    toast.innerHTML = `
      <span class="text-lg font-bold">${icon}</span>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
      
      setTimeout(() => {
        errorDiv.classList.add('hidden');
      }, 5000);
    } else {
      this.showNotification('error', message);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Manual refresh button
    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    // Export button
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportSchedule());
    }
  }

  /**
   * Export schedule to CSV
   */
  exportSchedule() {
    const { employees, shifts } = this.scheduleData;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create CSV content
    let csv = 'Employee,Role,' + days.join(',') + '\n';
    
    employees.forEach(emp => {
      let row = `${emp.name},${emp.role}`;
      
      days.forEach(day => {
        const shift = shifts.find(s => s.employeeId === emp.id && s.day === day);
        if (shift && shift.shiftType !== 'OFF') {
          row += `,${shift.startTime}-${shift.endTime} (${shift.shiftType})`;
        } else {
          row += ',OFF';
        }
      });
      
      csv += row + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.showNotification('success', 'Schedule exported successfully');
  }
}

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

/**
 * Handle cell click for adding/editing shifts
 */
function handleCellClick(employeeId, day, shiftId) {
  if (shiftId) {
    // Edit existing shift
    if (typeof shiftModal !== 'undefined') {
      shiftModal.openEditModal(shiftId);
    }
  } else {
    // Add new shift
    if (typeof shiftModal !== 'undefined') {
      shiftModal.openAddModal(employeeId, day);
    }
  }
}

// ============================================================================
// INITIALIZE
// ============================================================================

// Create global instance
const scheduleRenderer = new ScheduleRenderer(scheduleAPI);

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScheduleRenderer, scheduleRenderer };
}
