# Workspace Sidebar - Visual Implementation Guide

## System Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐   │
│  │    HEADER        │  │                                     │   │
│  │ [Operations ▼]   │  │  Juan Dela Cruz   │  JD Badge     │   │
│  │ (Workspace       │  │  demo@dmi.com     │  Profile      │   │
│  │  Switcher)       │  │                    │               │   │
│  └──────────────────┘  └─────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐   │
│  │    SIDEBAR       │  │      MAIN CONTENT AREA              │   │
│  │  (Workspace      │  │   (Workspace-Specific Views)        │   │
│  │   Menu View)     │  │                                     │   │
│  │                  │  │                                     │   │
│  │  📊 DASHBOARD    │  │  ┌─────────────────────────────┐    │   │
│  │  └─ Overview     │  │  │ Operations Dashboard        │    │   │
│  │                  │  │  ├─────────────────────────────┤    │   │
│  │  🚀 OPERATIONS   │  │  │ Metrics • Charts • Reports  │    │   │
│  │  ├─ Tickets      │  │  │ SLA • Performance • Agents  │    │   │
│  │  ├─ Team         │  │  └─────────────────────────────┘    │   │
│  │  ├─ SLA & Perf   │  │                                     │   │
│  │  └─ Reports      │  │  OR                                 │   │
│  │                  │  │                                     │   │
│  │  ⚙️ SYSTEM       │  │  ┌─────────────────────────────┐    │   │
│  │  └─ Settings     │  │  │ Executive Dashboard         │    │   │
│  │                  │  │  ├─────────────────────────────┤    │   │
│  │  (Switches when  │  │  │ Strategic Reports • KPIs    │    │   │
│  │   workspace      │  │  │ Budget • Metrics            │    │   │
│  │   changes)       │  │  └─────────────────────────────┘    │   │
│  │                  │  │                                     │   │
│  └──────────────────┘  └─────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Workspace Switching Flow

### Single Click Trigger Multiple Changes

```
                       USER CLICKS DROPDOWN
                              ↓
                    SELECT "HR" FROM LIST
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
   HEADER UPDATES                            EVENT DISPATCHED
   ┌──────────────┐                        workspace-changed
   │ [HR ▼]       │                         (detail: "HR")
   └──────────────┘                                │
                                                   ▼
                        MAIN PAGE RECEIVES EVENT
                        Sets workspace = "HR"
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            SIDEBAR UPDATES            CONTENT UPDATES
        HR MENU ITEMS VISIBLE      HR DASHBOARD VISIBLE
        ┌──────────────────┐      ┌────────────────────┐
        │ DASHBOARD        │      │ HR Dashboard       │
        │ └─ Overview      │      ├────────────────────┤
        │ HUMAN RESOURCES  │      │ Employees          │
        │ ├─ Employees     │      │ Payroll            │
        │ ├─ Payroll       │      │ Leave Management   │
        │ └─ Leave Mgmt    │      │                    │
        │ SYSTEM           │      │ Coming Soon...     │
        │ └─ Settings      │      └────────────────────┘
        └──────────────────┘
```

## Workspace State Management

```
BROWSER MEMORY (localStorage)
┌─────────────────────────────┐
│ workspace: "Operations"     │
│ darkMode: false             │
│ ...other settings...        │
└─────────────────────────────┘
           ▲
           │ save on change
           │
┌─────────────────────────────────────────┐
│     ALPINE.JS STATE (Main Page)         │
├─────────────────────────────────────────┤
│  workspace: "Operations"   ← Watches    │
│  page: "dashboard"                      │
│  darkMode: false                        │
│  sidebarToggle: false                   │
│  scrollTop: false                       │
│  ...                                    │
└─────────────────────────────────────────┘
       ▲                    ▼
       │ event listener    broadcasts to
       │                   sidebar & content
   workspace-changed       (via x-show)
      event
```

## Sidebar Components Per Workspace

### OPERATIONS SIDEBAR

```
┌────────────────────────┐
│  DASHBOARD             │ ← Universal
│  └─ Overview           │   (All workspaces)
│                        │
│  OPERATIONS            │ ← Operations Only
│  ├─ Tickets            │   (Hidden in other workspaces)
│  │  ├─ Open Tickets    │
│  │  ├─ My Tickets      │
│  │  └─ Resolved        │
│  ├─ Team               │
│  │  ├─ Agents          │
│  │  └─ Availability    │
│  ├─ SLA & Performance  │
│  └─ Reports            │
│     ├─ Daily           │
│     ├─ Weekly          │
│     └─ Monthly         │
│                        │
│  SYSTEM                │ ← Universal
│  └─ Settings           │   (All workspaces)
└────────────────────────┘
```

### EXECUTIVE SIDEBAR

```
┌────────────────────────┐
│  DASHBOARD             │ ← Universal
│  └─ Overview           │   (All workspaces)
│                        │
│  EXECUTIVE             │ ← Executive Only
│  ├─ Strategic Reports  │   (Hidden in other workspaces)
│  ├─ KPIs & Metrics     │
│  └─ Budget Tracker     │
│                        │
│  SYSTEM                │ ← Universal
│  └─ Settings           │   (All workspaces)
└────────────────────────┘
```

### HR SIDEBAR

```
┌────────────────────────┐
│  DASHBOARD             │ ← Universal
│  └─ Overview           │   (All workspaces)
│                        │
│  HUMAN RESOURCES       │ ← HR Only
│  ├─ Employees          │   (Hidden in other workspaces)
│  ├─ Payroll            │
│  └─ Leave Management   │
│                        │
│  SYSTEM                │ ← Universal
│  └─ Settings           │   (All workspaces)
└────────────────────────┘
```

### IT SIDEBAR

```
┌────────────────────────┐
│  DASHBOARD             │ ← Universal
│  └─ Overview           │   (All workspaces)
│                        │
│  IT OPERATIONS         │ ← IT Only
│  ├─ Infrastructure     │   (Hidden in other workspaces)
│  ├─ Systems Health     │
│  └─ Security           │
│                        │
│  SYSTEM                │ ← Universal
│  └─ Settings           │   (All workspaces)
└────────────────────────┘
```

## Code Implementation Pattern

### How Conditional Rendering Works

```html
<!-- Item is visible in ALL workspaces -->
<div>
  <h3>DASHBOARD</h3>
  <li>Overview</li>
</div>

<!-- Item ONLY visible when workspace === 'Operations' -->
<div x-show="workspace === 'Operations'">
  <h3>OPERATIONS</h3>
  <li>Tickets</li>
</div>

<!-- Item ONLY visible when workspace === 'Executive' -->
<div x-show="workspace === 'Executive'">
  <h3>EXECUTIVE</h3>
  <li>Strategic Reports</li>
</div>

<!-- Item ONLY visible when workspace === 'HR' -->
<div x-show="workspace === 'HR'">
  <h3>HUMAN RESOURCES</h3>
  <li>Employees</li>
</div>

<!-- Item ONLY visible when workspace === 'IT' -->
<div x-show="workspace === 'IT'">
  <h3>IT OPERATIONS</h3>
  <li>Infrastructure</li>
</div>

<!-- Item is visible in ALL workspaces -->
<div>
  <h3>SYSTEM</h3>
  <li>Settings</li>
</div>
```

**Performance:** x-show uses CSS display property (doesn't destroy/recreate DOM)

## User Journey - Multiple Workspaces

```
SESSION 1:              SESSION 2:              SESSION 3:
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Load Page    │       │ Load Page    │       │ Load Page    │
│ Default:     │       │ Last Used:   │       │ Last Used:   │
│ Operations   │       │ HR           │       │ Operations   │
│              │       │              │       │              │
│ Workspace:   │       │ Workspace:   │       │ Workspace:   │
│ Operations   │       │ HR           │       │ Operations   │
│              │       │              │       │              │
│ User clicks: │       │ User clicks: │       │ (stays same) │
│ HR (switch)  │       │ Executive    │       │              │
│              │       │ (switch)     │       │              │
│ Exit page    │       │ Exit page    │       │ Exit page    │
└──────────────┘       └──────────────┘       └──────────────┘
        │                     │                       │
        └─ Save: HR ─────────┘                       │
             │                                        │
             └─ Save: Executive ────────────────────┐
                                                    │
                                    Remember: Operations
                                    Load same workspace
```

## Key Implementation Details

### Files Modified

1. **src/partials/sidebar.html**
   - Lines 60-201: Operations workspace section
   - Lines 202-264: Executive workspace section
   - Lines 265-326: HR workspace section
   - Lines 327-389: IT workspace section
   - Each wrapped in `<div x-show="workspace === 'WorkspaceName'">`

2. **src/index.html**
   - Body element: `workspace: localStorage.getItem('workspace') || 'Operations'`
   - Watcher: Persists workspace changes
   - Event listener: Receives workspace-changed events

3. **src/partials/header.html**
   - selectWorkspace() method: Dispatches custom event
   - Dropdown: Shows current workspace selection

### Business Logic Enforcement

✅ **Constraint 1:** Sidebar conditionals based on workspace  
✅ **Constraint 2:** Overview visible everywhere  
✅ **Constraint 3:** Workspace-specific items hidden in other workspaces  
✅ **Constraint 4:** Settings always available  
✅ **Constraint 5:** Workspace persists across sessions  

---

**Status:** ✅ FULLY IMPLEMENTED  
**Workspace Awareness:** ✅ STRICT BUSINESS RULES ENFORCED  
**Dev Server:** ✅ RUNNING AT localhost:3000
