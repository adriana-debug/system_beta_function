# Sidebar Business Rules - Strict Workspace-Aware Navigation

## Executive Summary

The sidebar navigation is now a **customizable workspace view** with strict business logic enforced. Each department (Operations, Executive, HR, IT) has its own unique menu structure that loads automatically when that workspace is selected.

## Strict Business Rules

### Rule 1: Sidebar MUST Change with Workspace
- When user selects a workspace from the header dropdown
- The sidebar menu items instantly update to match that workspace
- Implementation: Alpine.js `x-show="workspace === 'WorkspaceName'"`
- **Result:** Users only see menu items relevant to their department

### Rule 2: Universal "Overview" Dashboard
- All workspaces display "Overview" in the DASHBOARD section
- This serves as the default landing page for any workspace
- Provides consistent entry point across all departments
- Implementation: Always visible, not wrapped in workspace conditionals

### Rule 3: Workspace-Specific Menu Items
- Each workspace has exclusive menu items
- Menu items from one workspace are hidden when switching to another
- No overlap between workspace menus (except Overview and Settings)
- Implementation: Each menu group wrapped in `<div x-show="workspace === 'WorkspaceName'">`

### Rule 4: Settings Always Available
- Settings menu is universal and available in all workspaces
- Allows users to adjust preferences regardless of department
- Encourages consistent configuration across workspaces

## Sidebar Sections by Workspace

### UNIVERSAL (All Workspaces)
```
DASHBOARD
└── Overview

SYSTEM
└── Settings
```

### OPERATIONS WORKSPACE
**Best For:** BPO Managers, Team Leads, Operations Staff

```
DASHBOARD
└── Overview (Shared across all workspaces)

OPERATIONS
├── Tickets
│   ├── Open Tickets
│   ├── My Tickets
│   └── Resolved
├── Team
│   ├── Agents
│   └── Availability
├── SLA & Performance
└── Reports
    ├── Daily
    ├── Weekly
    └── Monthly

SYSTEM
└── Settings (Shared across all workspaces)
```

**Focus:** Day-to-day operations, ticket management, team coordination, performance tracking

### EXECUTIVE WORKSPACE
**Best For:** C-Level, Directors, Strategic Decision Makers

```
DASHBOARD
└── Overview (Shared across all workspaces)

EXECUTIVE
├── Strategic Reports
├── KPIs & Metrics
└── Budget Tracker

SYSTEM
└── Settings (Shared across all workspaces)
```

**Focus:** High-level metrics, strategic insights, financial tracking, business intelligence

### HR WORKSPACE
**Best For:** HR Managers, Recruiters, Employee Relations

```
DASHBOARD
└── Overview (Shared across all workspaces)

HUMAN RESOURCES
├── Employees
├── Payroll
└── Leave Management

SYSTEM
└── Settings (Shared across all workspaces)
```

**Focus:** Employee management, compensation, leave requests, HR operations

### IT WORKSPACE
**Best For:** IT Managers, System Administrators, DevOps

```
DASHBOARD
└── Overview (Shared across all workspaces)

IT OPERATIONS
├── Infrastructure
├── Systems Health
└── Security

SYSTEM
└── Settings (Shared across all workspaces)
```

**Focus:** System infrastructure, uptime monitoring, security, technical operations

## Implementation Details

### Code Structure (src/partials/sidebar.html)

```html
<!-- Universal Section -->
<div>
  <h3>DASHBOARD</h3>
  <li>Overview (Always visible)</li>
</div>

<!-- Operations-Specific Section -->
<div x-show="workspace === 'Operations'">
  <h3>OPERATIONS</h3>
  <li>Tickets</li>
  <li>Team</li>
  <li>SLA & Performance</li>
  <li>Reports</li>
</div>

<!-- Executive-Specific Section -->
<div x-show="workspace === 'Executive'">
  <h3>EXECUTIVE</h3>
  <li>Strategic Reports</li>
  <li>KPIs & Metrics</li>
  <li>Budget Tracker</li>
</div>

<!-- HR-Specific Section -->
<div x-show="workspace === 'HR'">
  <h3>HUMAN RESOURCES</h3>
  <li>Employees</li>
  <li>Payroll</li>
  <li>Leave Management</li>
</div>

<!-- IT-Specific Section -->
<div x-show="workspace === 'IT'">
  <h3>IT OPERATIONS</h3>
  <li>Infrastructure</li>
  <li>Systems Health</li>
  <li>Security</li>
</div>

<!-- Universal Section -->
<div>
  <h3>SYSTEM</h3>
  <li>Settings (Always visible)</li>
</div>
```

### Data Flow

```
User selects workspace in header
    ↓
Header dispatches 'workspace-changed' event
    ↓
Main page (index.html) receives event
    ↓
Sets workspace state variable
    ↓
Sidebar receives workspace value via Alpine.js
    ↓
Conditionally renders menu items based on x-show="workspace === 'X'"
    ↓
User sees workspace-specific sidebar menu
```

### State Persistence

```
Browser Load
    ↓
Check localStorage for workspace
    ↓
Set workspace to saved value (or default "Operations")
    ↓
Sidebar renders with saved workspace menu
    ↓
User can navigate immediately with correct menu
```

## User Experience Scenarios

### Scenario 1: First-Time User
1. Page loads
2. Sidebar shows "Operations" menu (default)
3. User sees Overview + Operations items

### Scenario 2: Switch from Operations to HR
1. User clicks header dropdown
2. Selects "HR"
3. Header dispatches event
4. Sidebar instantly changes to HR menu
5. Operations menu items disappear
6. HR menu items appear (Employees, Payroll, Leave)
7. Selection saved to localStorage

### Scenario 3: Page Reload After Workspace Change
1. User was on HR workspace
2. User closes browser or reloads page
3. Page loads with localStorage value: workspace = "HR"
4. Sidebar automatically shows HR menu
5. User sees exactly what they left

### Scenario 4: Multi-Workspace User
1. Morning: Uses "Operations" menu to manage tickets
2. Afternoon: Clicks dropdown → switches to "Executive"
3. Sidebar changes to Executive menu
4. Next session: localStorage remembers "Executive"
5. Sidebar loads Executive menu by default

## Benefits of This Approach

✅ **Reduced Cognitive Load:** Users only see relevant menu items  
✅ **Improved Navigation:** Cleaner interface for each department  
✅ **Business Alignment:** Menu structure matches job responsibilities  
✅ **Consistency:** All users see same menu structure for their workspace  
✅ **Persistence:** Settings remembered across sessions  
✅ **Flexibility:** Users can easily switch departments  
✅ **Scalability:** New workspaces can be added by following pattern  
✅ **Mobile-Friendly:** Sidebar collapses automatically; switching is always accessible

## Technical Architecture

**Framework:** Alpine.js 3.14  
**State Management:** localStorage + Alpine.js reactivity  
**Conditional Rendering:** x-show directive (performance optimized)  
**Communication:** Custom events (workspace-changed)  
**Styling:** Tailwind CSS (brand-500 highlight for active items)  

## Future Extensibility

To add a new workspace:
1. Add workspace name to array in header switcher
2. Create new `<div x-show="workspace === 'NewWorkspace'>` in sidebar
3. Add unique menu items for that workspace
4. Create corresponding content view in main area
5. Add placeholder dashboard component

Pattern is fully extensible and maintainable.

---

**Status:** ✅ FULLY IMPLEMENTED & FUNCTIONAL  
**Business Rules:** ✅ ALL ENFORCED  
**Testing:** Workspace switching, sidebar updates, persistence verified  
