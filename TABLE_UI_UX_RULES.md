# Table Design Rules - Based on UI/UX Tokens

## Overview

Tables in this BPO CRM system follow strict UI/UX token-based design rules to ensure consistency, accessibility, and optimal user experience across all workspaces.

---

## Core Design Tokens Applied to Tables

### 1. **Color Tokens**

#### Header Row
```css
Background:   var(--color-gray-50)      /* Light Gray #f3f4f6 */
Text Color:   var(--color-gray-500)     /* Medium Gray #6b7280 */
Border:       var(--color-gray-200)     /* Border Gray #d9dbe1 */
Font Weight:  600
Font Size:    var(--font-size-body-sm)  /* 12px */
Letter Case:  UPPERCASE
```

#### Data Rows
```css
Text Color:   var(--color-gray-700)     /* Dark Gray #364152 */
Background:   var(--color-white)        /* #ffffff */
Border:       var(--color-gray-200)     /* #d9dbe1 */
Font Size:    var(--font-size-body-md)  /* 14px */
Font Weight:  400
```

#### Row Hover State
```css
Background:   var(--color-gray-50)      /* Light Gray #f3f4f6 */
Transition:   var(--transition-base)    /* 200ms ease-in-out */
Cursor:       pointer
```

#### Status Badges (Inside Table)
```css
Open:         Color: #1a3b32 (Primary Teal)
              Background: #f0f6f4 (Primary 50)
              
Pending:      Color: #e4f47c (Accent Yellow)
              Background: #fffef3 (Secondary 50)
              
Resolved:     Color: #12b76a (Success Green)
              Background: #ecfdf3 (Success 50)
              
Escalated:    Color: #f04438 (Error Red)
              Background: #fef3f2 (Error 50)
              
On Hold:      Color: #0ba5ec (Info Blue)
              Background: #f0f9ff (Info 50)
```

### 2. **Spacing Tokens**

| Component | Token | Value | Usage |
|-----------|-------|-------|-------|
| **Cell Padding Horizontal** | lg | 16px | Left/Right padding in cells |
| **Cell Padding Vertical** | md | 12px | Top/Bottom padding in cells |
| **Row Height** | - | 52px | Standard row height |
| **Gutter/Gap** | - | 0px | No gap between cells (use borders) |
| **Table to Content** | 2xl | 24px | Spacing below/above table |

**Responsive Adjustments:**
```css
/* Desktop (1024px+) */
Cell Padding: 16px 16px (lg)
Row Height: 52px
Max Table Height: calc(100vh - 300px) /* Allow vertical scrolling */

/* Tablet (768px - 1023px) */
Cell Padding: 12px 12px (md)
Row Height: 48px
Max Table Height: calc(100vh - 250px)

/* Mobile (< 768px) */
Cell Padding: 8px 8px (sm)
Row Height: 44px
Max Table Height: calc(100vh - 200px)
Font Size: Reduced proportionally
```

### 3. **Typography Tokens**

#### Header Row
```css
Font Family:    var(--font-outfit)
Font Size:      12px (theme-xs)
Font Weight:    600
Line Height:    18px
Letter Spacing: 0.02em (uppercase effect)
Text Transform: UPPERCASE
Color:          Gray 500 (#6b7280)
```

#### Data Cells
```css
Font Family:    var(--font-outfit)
Font Size:      14px (body-md)
Font Weight:    400
Line Height:    20px
Color:          Gray 700 (#364152) - Light Mode
                Gray 300 (#c4c7d0) - Dark Mode
```

#### Emphasis (Column Headers, Important Data)
```css
Font Weight:    600 (semibold)
Color:          Gray 900 (#1a1a1a) - Light Mode
```

### 4. **Border & Shadow Tokens**

#### Borders
```css
Table Outer Border:    1px solid var(--color-gray-200)   /* #d9dbe1 */
Row Separator:         1px solid var(--color-gray-200)   /* #d9dbe1 */
Header Separator:      1px solid var(--color-gray-200)   /* #d9dbe1 */
Focus Border:          1px solid var(--color-brand-500)  /* #1a3b32 (on cell focus) */
```

#### Shadows
```css
Table Container:       var(--shadow-sm)
                       0px 1px 3px rgba(16, 24, 40, 0.1)
                       
On Hover (Interactive):
                       var(--shadow-md)
                       0px 4px 8px -2px rgba(16, 24, 40, 0.1)
```

### 5. **Border Radius Tokens**

```css
Table Container:       var(--border-radius-lg)  /* 8px */
Cell Border Radius:    0px (no rounding per cell)
```

### 6. **Motion Tokens**

```css
Row Hover Effect:      var(--transition-base)
                       Duration: 200ms
                       Easing: cubic-bezier(0.4, 0, 0.2, 1)

Status Badge Pulse:    var(--transition-fast)
                       Duration: 150ms
```

---

## Table Structure Rules

### Minimum Column Widths
```
Checkbox Column:       40px
Icon Column:           48px
ID/Reference:          80px
Name/Text:             120px
Status Badge:          100px
Email:                 120px
Date/Time:             100px
Actions:               100px (minimum for buttons)
```

### Row Height Standards
```
Standard Data Row:     52px (including borders)
Header Row:            48px (less padding, fixed)
Empty State Row:       120px (icon + message)
Loading Row:           52px (with skeleton)
```

---

## Component Examples Applying Tokens

### Example 1: Employee Directory Table (HR Workspace)

```html
<div class="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
  <!-- Shadow: var(--shadow-sm) -->
  <!-- Border Radius: var(--border-radius-lg) = 8px -->
  <!-- Border Color: var(--color-gray-200) = #d9dbe1 -->
  
  <table class="w-full">
    <!-- HEADER ROW - Spacing Token: lg (16px) -->
    <!-- Typography Tokens: 600 weight, 12px, UPPERCASE -->
    <!-- Color Tokens: Gray 500 text, Gray 50 background -->
    <thead>
      <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
        <!-- Cell padding: px-6 py-3 (lg horizontal, md vertical) -->
        <th class="px-6 py-3 text-left text-theme-sm font-semibold text-gray-900 dark:text-white">
          Name
        </th>
        <th class="px-6 py-3 text-left text-theme-sm font-semibold text-gray-900 dark:text-white">
          Email
        </th>
        <th class="px-6 py-3 text-left text-theme-sm font-semibold text-gray-900 dark:text-white">
          Position
        </th>
        <th class="px-6 py-3 text-left text-theme-sm font-semibold text-gray-900 dark:text-white">
          Status
        </th>
        <th class="px-6 py-3 text-center text-theme-sm font-semibold text-gray-900 dark:text-white">
          Actions
        </th>
      </tr>
    </thead>
    
    <!-- DATA ROWS - Spacing Token: lg (16px) -->
    <!-- Typography Tokens: 400 weight, 14px, normal case -->
    <!-- Color Tokens: Gray 700 text -->
    <tbody>
      <!-- Row Height: 52px (includes padding 4 + border 1 = 52px total) -->
      <!-- Hover: background-color Gray 50, transition 200ms -->
      <tr class="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
        <!-- Cell padding: px-6 py-4 (lg horizontal, md vertical) -->
        <td class="px-6 py-4 text-theme-sm font-medium text-gray-900 dark:text-white">
          Juan Dela Cruz
        </td>
        <td class="px-6 py-4 text-theme-sm text-gray-600 dark:text-gray-400">
          demo@dmi.com
        </td>
        <td class="px-6 py-4 text-theme-sm text-gray-600 dark:text-gray-400">
          Operations Manager
        </td>
        
        <!-- Status Badge using Status Color Tokens -->
        <td class="px-6 py-4 text-theme-sm">
          <span class="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-theme-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Active
            <!-- Background: Resolved status light = #ecfdf3 -->
            <!-- Text Color: Resolved status main = #12b76a -->
            <!-- Font: Label MD (12px, 600 weight) -->
          </span>
        </td>
        
        <!-- Action Button -->
        <td class="px-6 py-4 text-center text-theme-sm">
          <button class="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-theme-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            View
            <!-- Button Size: SM/MD -->
            <!-- Button Variant: Secondary -->
            <!-- Button Hover: Transition 200ms, Shadow md -->
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Token Mapping in Example:

| Element | Token Used | Value | CSS Class |
|---------|-----------|-------|-----------|
| Table Border | color-gray-200 | #d9dbe1 | border-gray-200 |
| Table BG | white | #ffffff | bg-white |
| Header BG | color-gray-50 | #f3f4f6 | bg-gray-50 |
| Header Text | text-theme-sm | 12px | text-theme-sm |
| Header Weight | semibold | 600 | font-semibold |
| Cell Padding H | lg | 16px | px-6 |
| Cell Padding V | md | 12px | py-4 |
| Cell Text | text-theme-sm | 14px | text-theme-sm |
| Cell Text Color | gray-600 | #4b5563 | text-gray-600 |
| Row Hover | transition-base | 200ms ease | transition-colors |
| Hover BG | gray-50 | #f3f4f6 | hover:bg-gray-50 |
| Status Badge | green-100 | #d1fadf | bg-green-100 |
| Status Text | green-800 | #05603a | text-green-800 |
| Focus Ring | brand-500 | #1a3b32 | focus:ring-brand-500 |
| Dark Mode | gray-800 | #243140 | dark:bg-gray-800 |

---

## Strict Business Rules for Tables

### Rule 1: Header Consistency
- All headers MUST use `text-theme-sm` (12px)
- All headers MUST use `font-semibold` (weight 600)
- All headers MUST be UPPERCASE
- All headers MUST have Gray 50 background
- All headers MUST have consistent spacing: `px-6 py-3`

### Rule 2: Cell Consistency
- All data cells MUST use `text-theme-sm` (14px) minimum
- All cells MUST have `px-6 py-4` spacing (lg/md tokens)
- All cells MUST use Gray 700/600 text color
- All cells MUST maintain 52px row height
- All cells MUST align text LEFT (except currency/numbers which are RIGHT)

### Rule 3: Row Hover Effects
- ALL rows MUST have hover state
- Hover MUST show `hover:bg-gray-50`
- Hover MUST have `transition-colors` animation
- Hover state transition MUST be `200ms`
- Hover MUST NOT be applied to header row

### Rule 4: Status Badges
- Status badges MUST use semantic color tokens
- Badge background MUST be the status light color (50 shade)
- Badge text MUST be the status main color (500 shade)
- Badge MUST use `text-theme-xs` (12px) with `font-medium`
- Badge padding MUST be `px-2.5 py-0.5`
- Badge border-radius MUST be `rounded-full`

### Rule 5: Borders & Spacing
- Table outer border MUST be `border border-gray-200`
- Row separators MUST be `border-b border-gray-200`
- Last row MUST have border-bottom (for definition)
- Table container MUST have `rounded-lg` (8px)
- Table wrapper MUST have `overflow-y-auto` with invisible scrollbar
- Table wrapper MUST have `overflow-x-hidden` to prevent horizontal scroll
- Table MUST have `max-height` constraint to enable vertical scrolling

### Rule 6: Dark Mode
- ALL elements MUST have `dark:` variants
- Dark text MUST use `dark:text-white` or `dark:text-gray-300/400`
- Dark backgrounds MUST use `dark:bg-gray-800/900`
- Dark borders MUST use `dark:border-gray-800`
- Dark mode must NOT break contrast ratios

### Rule 7: Accessibility
- All interactive cells MUST be keyboard navigable
- All action buttons MUST have proper `aria-label`
- Table MUST have `role="table"` if not semantic
- Headers MUST have `scope="col"`
- Sorted column MUST show sort indicator (↑ or ↓)

### Rule 8: Scrolling & Responsiveness
- Tables MUST have vertical scrolling enabled with `max-height` constraint
- Tables MUST have `overflow-y-auto` for vertical scrolling
- Tables MUST have `overflow-x-hidden` to prevent horizontal scrolling
- Scrollbar MUST be invisible (using custom CSS) but scrolling functionality preserved
- All columns MUST fit within viewport width without horizontal scroll
- On tablet (640px - 1024px), reduce padding to `md` (12px)
- On mobile (< 768px), reduce padding to `sm` (8px) and adjust font sizes
- Tables MUST have fixed/flexible column widths to prevent overflow

---

## Status Badge Color Mapping

```css
/* Open Tickets */
.badge--status-open {
  background: var(--color-status-open-light)    /* #f0f6f4 */
  color: var(--color-status-open-main)          /* #1a3b32 */
}

/* Pending Tickets */
.badge--status-pending {
  background: var(--color-status-pending-light) /* #fffef3 */
  color: var(--color-status-pending-main)       /* #e4f47c */
}

/* Resolved Tickets */
.badge--status-resolved {
  background: var(--color-status-resolved-light) /* #ecfdf3 */
  color: var(--color-status-resolved-main)      /* #12b76a */
}

/* Escalated Tickets */
.badge--status-escalated {
  background: var(--color-status-escalated-light) /* #fef3f2 */
  color: var(--color-status-escalated-main)    /* #f04438 */
}

/* On Hold */
.badge--status-on-hold {
  background: var(--color-status-on-hold-light) /* #f0f9ff */
  color: var(--color-status-on-hold-main)      /* #0ba5ec */
}
```

---

## Implementation Checklist

When creating a new table, verify:

- [ ] Header row uses `bg-gray-50` with `text-theme-sm` and `font-semibold`
- [ ] Data rows use `text-theme-sm` with consistent `px-6 py-4` padding
- [ ] Row height is 52px (including padding and border)
- [ ] Hover state shows `hover:bg-gray-50` with `transition-colors`
- [ ] All status badges use correct color tokens (light BG + main text)
- [ ] Border color is `border-gray-200` throughout
- [ ] Table wrapper has `rounded-lg`, `overflow-y-auto`, and `overflow-x-hidden`
- [ ] Table has `max-height` constraint for vertical scrolling
- [ ] Scrollbar is invisible using custom CSS
- [ ] All columns fit within viewport without horizontal scroll
- [ ] Dark mode variants applied to all elements (`dark:` classes)
- [ ] Accessibility attributes present (`role`, `scope`, `aria-label`)
- [ ] Responsive breakpoints applied for mobile/tablet
- [ ] Last row has bottom border (not hidden)
- [ ] All cells align properly (text LEFT, numbers/currency RIGHT)
- [ ] Focus ring is `focus:ring-brand-500` on interactive elements
- [ ] Empty state message is present (if applicable)
- [ ] Loading skeleton follows same row height and structure

---

## Typography Scale Applied to Tables

```
Header:    12px (text-theme-sm), 600 weight, UPPERCASE
Cell Text: 14px (text-theme-sm), 400 weight, Normal case
Badge:     12px (text-theme-xs), 600 weight (labels)
Metadata:  12px (text-theme-sm), 400 weight, Gray 500 color
```

---

## Motion & Transition Rules

| Interaction | Duration | Easing | Effect |
|-------------|----------|--------|--------|
| Row Hover | 200ms | ease-in-out | Background fade |
| Cell Focus | 150ms | ease-in-out | Focus ring + border |
| Badge Pulse | 200ms | ease-in-out | Subtle scale (1.0 → 1.02 → 1.0) |
| Sort Indicator | 200ms | ease-in-out | Rotate 0° → 180° |

---

## Summary

Tables in this BPO CRM system are designed with strict adherence to:

1. **Color Tokens** - Semantic colors for consistency
2. **Spacing Tokens** - 52px rows, 16px horizontal padding, 12px vertical
3. **Typography Tokens** - 12px headers, 14px body text
4. **Motion Tokens** - 200ms transitions, ease-in-out easing
5. **Accessibility Rules** - WCAG AA+ compliance
6. **Responsive Design** - Mobile-first with horizontal scroll fallback
7. **Dark Mode** - Full dark mode support with proper contrast

All tables MUST follow these rules to maintain visual consistency and user experience across the entire BPO CRM application.
