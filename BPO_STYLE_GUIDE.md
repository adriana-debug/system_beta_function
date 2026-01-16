# BPO CRM Design System & Style Guide
**Version 1.0** | Created: January 16, 2026

---

## Executive Summary

This document outlines the complete design system for a scalable, enterprise-grade BPO (Business Process Outsourcing) CRM application. It replaces all ecommerce, product, and generic content with BPO-specific workflows and components. The system enforces strict consistency across UI/UX, accessibility, and responsive design while supporting enterprise BPO operations including ticket management, client accounts, SLA tracking, and agent performance metrics.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette & Semantics](#color-palette--semantics)
3. [Typography System](#typography-system)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [BPO-Specific Modules](#bpo-specific-modules)
7. [Accessibility Standards](#accessibility-standards)
8. [Responsive Design](#responsive-design)
9. [States & Interactions](#states--interactions)
10. [Migration Guide](#migration-guide)

---

## Design Principles

### 1. **Enterprise First**
- Build for scalability, performance, and data-driven decision-making
- Support high-volume data entry, filtering, and reporting
- Prioritize clarity over aesthetics

### 2. **BPO-Centric Workflows**
- Design for ticket-driven interactions
- Support multi-level escalations and SLA management
- Enable quick context switching between clients, agents, and cases

### 3. **Accessibility by Default (WCAG AA+)**
- All components support keyboard navigation
- Color contrast ratios ≥ 4.5:1 for text, ≥ 3:1 for UI components
- ARIA labels on all interactive elements
- Focus indicators visible and consistent (4px focus ring)

### 4. **Responsive & Mobile-First**
- Works seamlessly on mobile, tablet, and desktop
- Touch-friendly targets (min 44x44px)
- Adaptive layouts with progressive enhancement

### 5. **Consistency & Predictability**
- Standardized component library
- Semantic color usage (no random colors)
- Predictable interaction patterns

---

## Color Palette & Semantics

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary 500 | #1a3b32 | Primary actions, links, focus states |
| Primary 50-100 | #f0f6f4 - #d9e8e4 | Backgrounds, hover states |
| Primary 700-900 | #132722 - #0a1512 | Dark mode, emphasis |

**Usage Rules:**
- Use Primary 500 (Dark Teal) for CTAs: "Create Ticket", "Assign", "Resolve"
- Use Primary 50 for subtle backgrounds
- Never use primary for error/warning messages

### Status Colors

| Status | Color | Light BG | Dark BG | Hex |
|--------|-------|----------|---------|-----|
| **Open** | Primary Teal | #f0f6f4 | #0f1f1a | #1a3b32 |
| **Pending** | Accent Yellow | #fffef3 | #b0c638 | #e4f47c |
| **Resolved** | Success Green | #ecfdf3 | #054f31 | #12b76a |
| **Escalated** | Error Red | #fef3f2 | #55160c | #f04438 |
| **On Hold** | Info Blue | #f0f9ff | #0b4a6f | #0ba5ec |

**BPO-Specific Status Applications:**

```html
<!-- Ticket Status Badge -->
<span class="badge badge--status-open">Open</span>
<span class="badge badge--status-pending">Pending Customer Response</span>
<span class="badge badge--status-resolved">Resolved</span>
<span class="badge badge--status-escalated">Escalated</span>
<span class="badge badge--status-on-hold">On Hold - SLA Critical</span>
```

### Priority Colors

| Priority | Color | Icon |
|----------|-------|------|
| **Critical** | #f04438 (Error Red) | 🔴 Double Circle |
| **High** | #e4f47c (Accent Yellow) | 🟡 Circle |
| **Medium** | #1a3b32 (Primary Teal) | 🟢 Circle |
| **Low** | #12b76a (Success Green) | 🟢 Circle |

### Neutral Colors

| Level | Gray | Usage |
|-------|------|-------|
| **25** | #fafafa | Slightly elevated backgrounds |
| **50** | #f3f4f6 | Default container background (Light Gray) |
| **100** | #e8e9ec | Hover states on neutral elements |
| **200** | #d9dbe1 | Borders, dividers |
| **300** | #c4c7d0 | Secondary borders |
| **500** | #6b7280 | Secondary text |
| **700** | #364152 | Primary text (light mode) |
| **800-900** | #243140 - #1a1a1a | Emphasis, headings (Dark Charcoal) |

---

## Typography System

### Font Family
- **Primary:** Outfit (100-900 weights)
- **Monospace:** Monaco / Courier New (code blocks, reference numbers)

### Type Scale

#### Display (Page Titles & Heroes)
```css
/* Display 2XL: 72px / 90px line-height */
font-size: 72px;
font-weight: 700;
letter-spacing: -0.02em;
```

#### Headings

```css
/* Heading XL (Dashboard Titles): 28px / 36px */
font-size: 28px;
font-weight: 700;
line-height: 36px;

/* Heading LG (Section Headers): 24px / 32px */
font-size: 24px;
font-weight: 600;
line-height: 32px;

/* Heading MD (Card Titles): 20px / 28px */
font-size: 20px;
font-weight: 600;
line-height: 28px;

/* Heading SM (Subsections): 18px / 26px */
font-size: 18px;
font-weight: 600;
line-height: 26px;
```

#### Body Text

```css
/* Body LG (Primary Content): 16px / 24px */
font-size: 16px;
font-weight: 400;
line-height: 24px;

/* Body MD (Standard): 14px / 20px */
font-size: 14px;
font-weight: 400;
line-height: 20px;

/* Body SM (Secondary, Metadata): 12px / 18px */
font-size: 12px;
font-weight: 400;
line-height: 18px;
```

#### Labels & Captions

```css
/* Label LG (Form Labels): 14px / 20px, Weight 600 */
font-size: 14px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0.02em;

/* Label MD (Badges, Tags): 12px / 18px */
font-size: 12px;
font-weight: 600;
line-height: 18px;
letter-spacing: 0.02em;
```

### Typography Rules for BPO Context

```
CORRECT ✅
├─ "Create Support Ticket" (action button)
├─ "Ticket #12345" (reference in label font)
├─ "Client: Acme Corp" (contextual label)
└─ "SLA Response: 2h 15m" (metric in body)

INCORRECT ❌
├─ "Add to Cart" (ecommerce)
├─ "Browse Products" (product context)
├─ "Check Out" (payment context)
└─ "Sale: 50% Off" (promotional)
```

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Micro-spacing (icon-text gaps) |
| **sm** | 8px | Small gaps, padding in small elements |
| **md** | 12px | Medium padding, margins |
| **lg** | 16px | Standard padding, margins |
| **xl** | 20px | Large gaps |
| **2xl** | 24px | Large padding, section spacing |
| **3xl** | 32px | Major section breaks |
| **4xl** | 40px | Page-level spacing |

### Layout Grid

```css
/* Desktop: 12-column grid, 1280px max-width */
.container {
  max-width: 1280px;
  padding: 0 32px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Tablet: 1024px max-width, 16px padding */
@media (max-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 0 24px;
  }
}

/* Mobile: Full width, 16px padding */
@media (max-width: 640px) {
  .container {
    padding: 0 16px;
    gap: 16px;
  }
}
```

### Common Layout Patterns

#### Dashboard Metrics (KPI Cards)
```
┌──────────────────────────────────────────┐
│  [Icon] Tickets Opened Today             │
│         142                    ↑ 15.3%   │
└──────────────────────────────────────────┘
```
- Grid: 2-4 columns (responsive)
- Card height: auto (144px typical)
- Icon size: 48px
- Padding: 24px (desktop), 16px (mobile)

#### Ticket List View
```
┌───────────────────────────────────────────────────┐
│ Search [        ]  Filter  Sort  Bulk Actions      │
├───────────────────────────────────────────────────┤
│ [☐] #12345 │ Critical │ Acme Corp │ Sarah │ 2h 15│
│ [☐] #12344 │ High     │ Beta LLC  │ Juan  │ 5h 4 │
│ [☐] #12343 │ Medium   │ Acme Corp │ Sarah │ 12h  │
└───────────────────────────────────────────────────┘
```
- Min column widths: 80px
- Row height: 52px
- Responsive: Horizontal scroll on mobile

---

## Components

### Buttons

#### Button States

```html
<!-- Primary Button -->
<button class="btn btn--primary">
  Create Ticket
</button>

<!-- Primary Button - Hover -->
<button class="btn btn--primary" data-state="hover">
  Create Ticket
</button>

<!-- Primary Button - Disabled -->
<button class="btn btn--primary" disabled>
  Create Ticket
</button>

<!-- Secondary Button (Outline) -->
<button class="btn btn--secondary">
  Cancel
</button>

<!-- Tertiary Button (Ghost) -->
<button class="btn btn--tertiary">
  Learn More
</button>

<!-- Danger Button (Delete, Escalate) -->
<button class="btn btn--danger">
  Delete Ticket
</button>

<!-- Icon Button (Compact) -->
<button class="btn btn--icon" aria-label="Close">
  <svg><!-- icon --></svg>
</button>
```

#### Button Specifications

| Variant | Background | Text Color | Border | Hover | Focus | Min Width |
|---------|------------|-----------|--------|-------|-------|-----------|
| **Primary** | #1a3b32 | White | None | #16312a | +4px focus ring | 64px |
| **Secondary** | White | #1a1a1a | 1px #d9dbe1 | #f3f4f6 | +4px focus ring | 64px |
| **Tertiary** | Transparent | #1a3b32 | None | #f3f4f6 | +4px focus ring | 64px |
| **Accent** | #e4f47c | #1a1a1a | None | #d8e86a | +4px focus ring | 64px |
| **Danger** | #f04438 | White | None | #d92d20 | +4px focus ring | 64px |
| **Disabled** | #f3f4f6 | #9599a8 | None | None | None | 64px |

#### Button Sizes

| Size | Height | Padding | Font | Icon Size |
|------|--------|---------|------|-----------|
| **SM** | 32px | 8px 14px | 12px | 16px |
| **MD** | 36px | 10px 16px | 14px | 18px |
| **LG** | 40px | 12px 20px | 14px | 20px |

#### Button Usage Rules

```
CORRECT ✅
├─ "Create Ticket"
├─ "Assign to Me"
├─ "Resolve Ticket"
├─ "Escalate Now"
├─ "View Details"
└─ "Download Report"

INCORRECT ❌
├─ "Add to Bag" (ecommerce)
├─ "Go Shopping" (retail)
├─ "View Cart" (ecommerce)
├─ "Checkout" (payment)
├─ "Add to Wishlist" (wishlist)
└─ "Apply Coupon" (discounts)
```

### Input Fields

#### Input States

```html
<!-- Default -->
<input type="text" placeholder="Enter ticket number">

<!-- Focused -->
<input type="text" placeholder="Enter ticket number" autofocus>

<!-- Filled -->
<input type="text" value="TKT-12345">

<!-- Error -->
<input type="text" aria-invalid="true" class="input--error">
<span class="error-message">Ticket number must be 6 characters</span>

<!-- Disabled -->
<input type="text" disabled>

<!-- Success (Form submitted) -->
<input type="text" class="input--success" disabled value="TKT-12345">
```

#### Input Specifications

| State | Border Color | Text Color | Background | Shadow | Icon |
|-------|--------------|-----------|-----------|--------|------|
| **Default** | #d9dbe1 | #1a1a1a | White | None | Gray |
| **Focused** | #1a3b32 | #1a1a1a | White | 4px focus ring | Primary |
| **Error** | #f04438 | #1a1a1a | #fef3f2 | Error focus ring | Error icon |
| **Disabled** | #e8e9ec | #9599a8 | #f3f4f6 | None | Disabled |
| **Success** | #12b76a | #1a1a1a | #ecfdf3 | Success focus ring | Success icon |

#### Form Labels

```html
<!-- Required Field -->
<label for="ticket_subject" class="label">
  Ticket Subject
  <span class="label__required" aria-label="required">*</span>
</label>
<input id="ticket_subject" type="text" required>

<!-- Help Text -->
<label for="ticket_category" class="label">
  Category
</label>
<input id="ticket_category" type="text">
<span class="help-text">Select from billing, technical, or general support</span>

<!-- Error State -->
<label for="ticket_priority" class="label">
  Priority Level
</label>
<input id="ticket_priority" type="text" aria-invalid="true">
<span class="error-message" role="alert">Priority level is required</span>
```

### Badges & Tags

#### Ticket Status Badges

```html
<!-- Open -->
<span class="badge badge--open">Open</span>

<!-- Pending -->
<span class="badge badge--pending">Pending Response</span>

<!-- Resolved -->
<span class="badge badge--resolved">Resolved</span>

<!-- Escalated -->
<span class="badge badge--escalated">Escalated</span>

<!-- On Hold -->
<span class="badge badge--on-hold">On Hold</span>
```

#### Priority Badges

```html
<span class="badge badge--priority-critical">Critical</span>
<span class="badge badge--priority-high">High</span>
<span class="badge badge--priority-medium">Medium</span>
<span class="badge badge--priority-low">Low</span>
```

#### Agent Status Badges

```html
<span class="badge badge--agent-available">Available</span>
<span class="badge badge--agent-busy">Busy</span>
<span class="badge badge--agent-on-break">On Break</span>
<span class="badge badge--agent-offline">Offline</span>
```

### Tables

#### Table Structure

```html
<div class="table-container">
  <table class="table">
    <!-- Sticky Header -->
    <thead class="table__head">
      <tr class="table__header-row">
        <th class="table__header-cell">
          <input type="checkbox" class="table__checkbox" aria-label="Select all">
        </th>
        <th class="table__header-cell">Ticket ID</th>
        <th class="table__header-cell">Client</th>
        <th class="table__header-cell">Subject</th>
        <th class="table__header-cell">Status</th>
        <th class="table__header-cell">SLA</th>
        <th class="table__header-cell">Assigned</th>
        <th class="table__header-cell"></th>
      </tr>
    </thead>
    
    <!-- Table Body -->
    <tbody class="table__body">
      <tr class="table__row">
        <td class="table__cell">
          <input type="checkbox" class="table__checkbox">
        </td>
        <td class="table__cell table__cell--monospace">#12345</td>
        <td class="table__cell">Acme Corp</td>
        <td class="table__cell">Payment not processed</td>
        <td class="table__cell">
          <span class="badge badge--escalated">Escalated</span>
        </td>
        <td class="table__cell">
          <span class="sla-indicator sla-indicator--critical">2h 15m</span>
        </td>
        <td class="table__cell">Juan Dela Cruz</td>
        <td class="table__cell table__cell--actions">
          <button class="btn btn--icon" aria-label="View">View</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Table Specifications

- Min column width: 80px
- Row height: 52px
- Header font weight: 600
- Header text: Gray 500 (upper case, 12px)
- Row hover: Gray 50 background
- Responsive: Enable horizontal scroll on < 1024px
- Sticky header on scroll
- Empty state: Centered message, 60px icon

### Modals & Dialogs

#### Modal Structure

```html
<div class="modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <!-- Backdrop -->
  <div class="modal__backdrop"></div>
  
  <!-- Modal Box -->
  <div class="modal__content">
    <!-- Header -->
    <div class="modal__header">
      <h2 id="modal-title" class="modal__title">
        Create New Ticket
      </h2>
      <button 
        class="modal__close-btn" 
        aria-label="Close dialog"
        @click="closeModal"
      >
        <svg><!-- X icon --></svg>
      </button>
    </div>
    
    <!-- Body -->
    <div class="modal__body">
      <form class="modal__form">
        <!-- Form fields -->
      </form>
    </div>
    
    <!-- Footer -->
    <div class="modal__footer">
      <button class="btn btn--secondary">Cancel</button>
      <button class="btn btn--primary">Create Ticket</button>
    </div>
  </div>
</div>
```

#### Modal Sizes

| Size | Width | Max Height | Usage |
|------|-------|-----------|-------|
| **SM** | 380px | 85vh | Confirmations, alerts |
| **MD** | 520px | 85vh | Standard forms |
| **LG** | 800px | 85vh | Complex forms, edits |

### Cards

#### Card Structure

```html
<div class="card">
  <!-- Card Header (Optional) -->
  <div class="card__header">
    <h3 class="card__title">Ticket Overview</h3>
    <div class="card__actions">
      <button class="btn btn--icon">Actions</button>
    </div>
  </div>
  
  <!-- Card Body -->
  <div class="card__body">
    <p>Content goes here</p>
  </div>
  
  <!-- Card Footer (Optional) -->
  <div class="card__footer">
    <button class="btn btn--secondary">Cancel</button>
    <button class="btn btn--primary">Save</button>
  </div>
</div>
```

#### Card Specifications

- Border radius: 16px
- Border: 1px Gray 200
- Padding: 24px (desktop), 16px (mobile)
- Background: White (#ffffff)
- Shadow: sm (default), md (hover on interactive)
- Min height: None (content-driven)

---

## BPO-Specific Modules

### 1. Dashboard - KPI Overview

**Purpose:** Quick view of daily operations metrics

**Components:**
- Ticket volume gauge (open, pending, resolved)
- SLA compliance percentage
- Agent availability status
- Response time average
- Customer satisfaction score

**Layout:** 2x2 or 1x4 grid of metric cards

```html
<div class="dashboard__metrics grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Tickets Opened Today -->
  <div class="card card--metric">
    <div class="card__icon-wrapper">
      <svg class="card__icon"><!-- ticket icon --></svg>
    </div>
    <div class="card__content">
      <p class="card__label">Tickets Opened Today</p>
      <p class="card__value">142</p>
      <p class="card__trend trend--positive">↑ 15.3%</p>
    </div>
  </div>
</div>
```

### 2. Ticket Management Interface

**Purpose:** Core BPO workflow for ticket lifecycle

**Sections:**
- Ticket list (sortable, filterable)
- Quick actions (assign, resolve, escalate)
- Ticket details panel
- Activity timeline
- SLA indicator with countdown

**Key Metrics:** Response time, resolution time, SLA compliance

```html
<div class="ticket-manager">
  <!-- Toolbar -->
  <div class="ticket-manager__toolbar">
    <input type="search" placeholder="Search tickets..." class="search-input">
    <button class="btn btn--secondary">Filter</button>
    <button class="btn btn--secondary">Sort</button>
    <button class="btn btn--primary">New Ticket</button>
  </div>
  
  <!-- Ticket List -->
  <table class="table">
    <!-- Table content -->
  </table>
  
  <!-- Ticket Detail -->
  <aside class="ticket-detail">
    <h2>Ticket Details</h2>
    <!-- Details content -->
  </aside>
</div>
```

### 3. Client Accounts & Contacts

**Purpose:** Manage customer information and relationships

**Tabs:**
- Overview (company details, contract info)
- Contacts (primary, secondary, technical)
- Tickets history (last 10, filters)
- SLA & Service levels
- Billing & Payments

```html
<div class="client-profile">
  <div class="client-profile__header">
    <h1>Acme Corporation</h1>
    <span class="badge badge--active">Active Account</span>
  </div>
  
  <div class="tabs">
    <button class="tabs__tab tabs__tab--active">Overview</button>
    <button class="tabs__tab">Contacts</button>
    <button class="tabs__tab">Tickets</button>
    <button class="tabs__tab">SLA</button>
  </div>
  
  <div class="tabs__content">
    <!-- Tab-specific content -->
  </div>
</div>
```

### 4. Agent & Team Management

**Purpose:** Track agent availability, performance, and workload

**Sections:**
- Team roster (status: available, busy, on-break, offline)
- Current workload (tickets assigned)
- Performance metrics (AHT, FCR, CSAT)
- Shift schedule
- Availability heatmap

```html
<div class="agent-roster">
  <table class="table">
    <thead>
      <tr>
        <th>Agent Name</th>
        <th>Status</th>
        <th>Current Tickets</th>
        <th>AHT (avg)</th>
        <th>CSAT</th>
        <th>Shift</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Juan Dela Cruz</td>
        <td><span class="badge badge--agent-available">Available</span></td>
        <td>3</td>
        <td>8m 32s</td>
        <td>4.8/5.0</td>
        <td>9:00 - 17:00</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5. SLA Tracking & Metrics Dashboard

**Purpose:** Monitor Service Level Agreements and compliance

**Metrics:**
- First response time (target, current, % compliance)
- Resolution time (target, current, % compliance)
- Ticket status breakdown
- Escalation rate
- Breached SLAs (alerts)

**Visualization:** Progress bars, gauges, line charts

```html
<div class="sla-dashboard">
  <div class="sla-card">
    <h3>First Response Time</h3>
    <p class="sla-card__target">Target: 30 min</p>
    <div class="progress">
      <div class="progress__bar" style="width: 85%"></div>
    </div>
    <p class="sla-card__compliance sla-card__compliance--compliant">
      85% Compliant
    </p>
  </div>
</div>
```

### 6. Reports & Analytics

**Purpose:** Business intelligence and performance analysis

**Report Types:**
- Ticket resolution trends
- Agent performance ranking
- Customer satisfaction trends
- SLA compliance over time
- Revenue impact analysis

**Export:** CSV, PDF, Email schedule

### 7. Knowledge Base & SOP References

**Purpose:** Self-service documentation for agents and customers

**Structure:**
- Categorized articles
- Search & tagging
- Embed in ticket context
- Related articles
- FAQ section

### 8. Notifications & Alerts

**Types:**
- SLA breached (error badge)
- Ticket assigned (info)
- Escalation required (warning)
- Customer response received (neutral)
- Agent availability change (neutral)

---

## Accessibility Standards

### WCAG AA+ Compliance Checklist

#### Color & Contrast
- [ ] All text ≥ 14px has contrast ratio ≥ 4.5:1
- [ ] UI components ≥ 3:1 contrast ratio
- [ ] Do not rely on color alone for information (use icons + labels)
- [ ] Color-blind safe palette (avoid red-green only combinations)

#### Keyboard Navigation
- [ ] All interactive elements reachable via Tab key
- [ ] Logical tab order (reading order left→right, top→bottom)
- [ ] Enter/Space triggers buttons
- [ ] Arrow keys navigate menus and tables
- [ ] Escape closes modals, dropdowns
- [ ] Focus indicator visible on all elements (4px ring)

#### Screen Readers
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- [ ] ARIA labels on icon-only buttons: `aria-label="Close"`
- [ ] Form fields have associated labels
- [ ] Error messages linked to inputs: `aria-describedby`
- [ ] Table headers associated: `<th scope="col">`
- [ ] Live regions for dynamic updates: `aria-live="polite"`

#### Focus Management
- [ ] Focus never lost or trapped
- [ ] Focus visible after action (e.g., form submit)
- [ ] Skip links available for keyboard users
- [ ] Modal traps focus until closed

#### Forms
- [ ] All inputs labeled (visible or hidden)
- [ ] Error messages appear near field
- [ ] Required fields marked with `*` AND `aria-required="true"`
- [ ] Help text associated: `aria-describedby`
- [ ] Placeholder ≠ label (placeholder disappears)

### Accessibility HTML Patterns

#### Button
```html
<!-- Icon Button (CORRECT) -->
<button 
  class="btn btn--icon" 
  aria-label="Close ticket"
  type="button"
>
  <svg aria-hidden="true"><!-- icon --></svg>
</button>

<!-- Button (INCORRECT) -->
<div onclick="submitForm()" class="btn">Close</div>
```

#### Form Field
```html
<!-- Correct -->
<div class="form-group">
  <label for="ticket_priority" class="label">
    Priority Level <span aria-label="required">*</span>
  </label>
  <select 
    id="ticket_priority" 
    aria-required="true"
    aria-describedby="priority-help"
  >
    <option value="">Select priority...</option>
    <option value="critical">Critical</option>
  </select>
  <span id="priority-help" class="help-text">
    Set ticket urgency level
  </span>
</div>

<!-- Incorrect -->
<select class="input">
  <option>Priority</option>
</select>
```

#### Table with Selection
```html
<table class="table" role="table" aria-label="Ticket list">
  <thead>
    <tr>
      <th scope="col">
        <input 
          type="checkbox" 
          aria-label="Select all tickets"
        >
      </th>
      <th scope="col">Ticket ID</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <input 
          type="checkbox" 
          aria-label="Select ticket #12345"
        >
      </td>
      <td>#12345</td>
      <td>Open</td>
    </tr>
  </tbody>
</table>
```

#### Error Message
```html
<div class="form-group">
  <label for="agent_email">Email Address</label>
  <input 
    id="agent_email" 
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
  >
  <span 
    id="email-error" 
    class="error-message" 
    role="alert"
  >
    Please enter a valid email address
  </span>
</div>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Target | Grid | Font Scale |
|-----------|-------|--------|------|-----------|
| **Mobile** | < 640px | Phones | 1-2 col | 0.875x |
| **Small** | 640px | Small tablets | 2-3 col | 0.95x |
| **Tablet** | 768px | Tablets | 3-6 col | 1x |
| **Desktop** | 1024px | Small desktops | 8-12 col | 1x |
| **Large** | 1280px | Large desktops | 12 col | 1.1x |
| **XL** | 1536px | 4K displays | 12 col | 1.1x |

### Mobile-First Strategy

```css
/* Base (Mobile) */
.component {
  grid-template-columns: 1fr;
  padding: 16px;
  font-size: 14px;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    grid-template-columns: repeat(2, 1fr);
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    grid-template-columns: repeat(4, 1fr);
    padding: 32px;
  }
}
```

### Touch & Mouse Targets

- **Mobile:** Minimum 44x44px touch targets
- **Desktop:** Minimum 32x32px (44x44px for buttons)
- **Spacing:** 8px minimum between clickable elements

### Responsive Tables

On mobile (< 768px):
- Enable horizontal scroll
- Sticky first column (ID/Ticket number)
- Show critical columns only (ID, Status, Assigned)
- Use "more" menu for secondary actions

```html
<div class="table-responsive">
  <table class="table table--responsive">
    <thead>
      <tr>
        <th class="table__cell--sticky">ID</th>
        <th>Status</th>
        <th>Assigned</th>
        <th></th>
      </tr>
    </thead>
  </table>
</div>
```

---

## States & Interactions

### Component States Matrix

#### Button States
```
┌──────────────┬──────────┬─────────┬──────────┬──────────┐
│ State        │ BG Color │ Text    │ Cursor   │ Feedback │
├──────────────┼──────────┼─────────┼──────────┼──────────┤
│ Default      │ Primary  │ White   │ pointer  │ None     │
│ Hover        │ 600      │ White   │ pointer  │ Darken   │
│ Active       │ 700      │ White   │ pointer  │ Depress  │
│ Focus        │ Primary  │ White   │ pointer  │ 4px ring │
│ Disabled     │ Gray 100 │ Gray 4  │ not-ok   │ None     │
│ Loading      │ Primary  │ White   │ wait     │ Spinner  │
└──────────────┴──────────┴─────────┴──────────┴──────────┘
```

#### Form Field States
```
┌──────────────┬──────────┬─────────┬──────────────┐
│ State        │ Border   │ Icon    │ Message      │
├──────────────┼──────────┼─────────┼──────────────┤
│ Default      │ Gray 300 │ None    │ Help text    │
│ Focus        │ Primary  │ None    │ Help text    │
│ Filled       │ Gray 300 │ None    │ Help text    │
│ Error        │ Error    │ ❌      │ Error msg    │
│ Success      │ Success  │ ✓       │ Success msg  │
│ Disabled     │ Gray 200 │ None    │ Help text    │
│ Loading      │ Gray 300 │ ⟳      │ "Loading..." │
└──────────────┴──────────┴─────────┴──────────────┘
```

### Empty States

**Design Pattern:**
```
┌─────────────────────────────────────┐
│                                     │
│           [📋 Icon]                 │
│                                     │
│     No Tickets Assigned Today       │
│                                     │
│  When a ticket is assigned to you,  │
│     it will appear here.            │
│                                     │
│   [+ Create New Ticket]             │
│                                     │
└─────────────────────────────────────┘
```

**HTML:**
```html
<div class="empty-state">
  <div class="empty-state__icon">
    <svg><!-- icon --></svg>
  </div>
  <h3 class="empty-state__title">No Tickets Assigned Today</h3>
  <p class="empty-state__description">
    When a ticket is assigned to you, it will appear here.
  </p>
  <button class="btn btn--primary">
    Create New Ticket
  </button>
</div>
```

### Loading States

**Pattern 1: Skeleton Screen**
```html
<div class="skeleton">
  <div class="skeleton__line skeleton__line--lg"></div>
  <div class="skeleton__line skeleton__line--sm"></div>
  <div class="skeleton__line skeleton__line--md"></div>
</div>
```

**Pattern 2: Spinner with Label**
```html
<div class="loading-state">
  <div class="spinner" role="status" aria-label="Loading">
    <svg class="spinner__icon"><!-- spinner --></svg>
  </div>
  <p class="loading-state__text">Fetching tickets...</p>
</div>
```

### Error States

**Inline Field Error:**
```html
<div class="form-group form-group--error">
  <label for="ticket_email">Email</label>
  <input 
    id="ticket_email" 
    type="email" 
    value="invalid-email"
    aria-invalid="true"
    aria-describedby="email-error"
  >
  <span id="email-error" class="error-message" role="alert">
    ❌ Enter a valid email address
  </span>
</div>
```

**Page-Level Error:**
```html
<div class="alert alert--error" role="alert">
  <svg class="alert__icon"><!-- error icon --></svg>
  <div class="alert__content">
    <h3 class="alert__title">Failed to Load Tickets</h3>
    <p class="alert__message">Please check your connection and try again.</p>
  </div>
  <button class="btn btn--secondary" onclick="retry()">
    Retry
  </button>
</div>
```

### Success States

```html
<div class="alert alert--success" role="alert">
  <svg class="alert__icon"><!-- checkmark icon --></svg>
  <div class="alert__content">
    <h3 class="alert__title">Ticket Created Successfully</h3>
    <p class="alert__message">Ticket #TKT-12345 has been assigned to Sarah Johnson.</p>
  </div>
</div>
```

### Transition & Motion

- **Fast (150ms):** Hover effects, state changes
- **Base (200ms):** Modal entrance, alert appearance
- **Slow (300ms):** Page transitions, complex animations
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1) (standard)

---

## Migration Guide

### Step 1: Remove E-Commerce Content

**Files to Delete/Replace:**
- `src/product/` - Delete entire folder
- `src/pricing-tables.html` - Replace with SLA pricing
- `src/cart.html` - Delete
- `src/checkout.html` - Delete
- `src/partials/watchlist.html` - Delete
- All product-related images in `src/images/product/` - Delete

**Update Navigation:**
- Remove "Products", "Shop", "Pricing Tables" from sidebar
- Remove cart/checkout links from header

### Step 2: Update Dashboard (index.html)

Replace current ecommerce metrics with BPO KPIs:

```html
<!-- OLD: Customers, Orders, Revenue -->
<!-- NEW: Tickets Opened, SLA Compliance, Agent Availability -->

<!-- Update metric labels -->
- "Customers" → "Open Tickets"
- "Orders" → "Resolved Today"
- "Products" → "SLA Compliance"
- "Revenue" → "Average Response Time"
```

### Step 3: Replace Tables

**From:** Product table with price, category, status (Delivered/Shipped)

**To:** Ticket table with ID, Client, Subject, Status (Open/Pending/Resolved), SLA Countdown, Assigned Agent

### Step 4: Update Sidebar Navigation

```html
<!-- OLD STRUCTURE -->
Dashboard > eCommerce
Pages > Pricing Tables

<!-- NEW STRUCTURE -->
Dashboard > Overview
Tickets > My Queue, All Tickets, Escalated
Clients > Client List, Contacts
Team > Roster, Performance
Reports > SLA Dashboard, Analytics
Settings > General, Users, SLA Levels
```

### Step 5: Update Forms

Replace product-related forms with BPO forms:

```html
<!-- Create Ticket Form -->
- Subject (text input)
- Category (select)
- Priority (radio or select)
- Description (textarea)
- Assign To (agent select)
- SLA Level (select)

<!-- Create Client Form -->
- Company Name (text)
- Contact Email (email)
- Primary Contact (text)
- SLA Agreement (select)
- Account Manager (select)
```

### Step 6: Update Badges & Colors

Replace product status badges:

```
OLD → NEW
Delivered → Resolved
Shipped → In Progress / Pending
Pending → Escalated
Active → Open
```

### Step 7: Accessibility Pass

Run through accessibility checklist:
- [ ] All buttons have descriptive labels
- [ ] All form fields have labels
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Step 8: Testing Checklist

- [ ] Responsive on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] All buttons functional
- [ ] Forms submit correctly
- [ ] Tables responsive with horizontal scroll
- [ ] Modals keyboard accessible (Esc closes, Tab trapped)
- [ ] Empty/loading/error states display
- [ ] Dark mode works
- [ ] Touch targets ≥ 44px
- [ ] No console errors

---

## Component Library Quick Reference

### Import Patterns

```html
<!-- Primary Button -->
<button class="btn btn--primary btn--md">Action</button>

<!-- Table -->
<table class="table table--striped">
  <thead>
    <tr><th>Column</th></tr>
  </thead>
  <tbody><tr><td>Data</td></tr></tbody>
</table>

<!-- Modal -->
<div class="modal" role="dialog" aria-modal="true">
  <div class="modal__content">
    <div class="modal__body"><!-- Content --></div>
  </div>
</div>

<!-- Alert -->
<div class="alert alert--warning" role="alert">
  <p>Warning message</p>
</div>

<!-- Empty State -->
<div class="empty-state">
  <svg class="empty-state__icon"><!-- icon --></svg>
  <h3 class="empty-state__title">Title</h3>
  <p class="empty-state__description">Description</p>
</div>
```

---

## Conclusion

This design system establishes a foundation for scalable, accessible, and consistent BPO CRM applications. Adherence to these standards ensures a professional experience for agents, managers, and clients while maintaining WCAG AA+ compliance and enterprise-grade reliability.

**For questions or contributions:** Refer to design-tokens.json for definitive color, spacing, and typography values.

**Last Updated:** January 16, 2026
