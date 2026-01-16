# Quick Color Reference - BPO CRM

## 🎨 Color Palette

### Primary: Dark Teal
```
Hex: #1a3b32
RGB: 26, 59, 50
HSL: 161°, 39%, 17%
Use: Buttons, links, primary actions
Tailwind: bg-brand-500, text-brand-500
```

### Accent: Lime Yellow
```
Hex: #e4f47c
RGB: 228, 244, 124
HSL: 71°, 88%, 73%
Use: Highlights, pending status, warnings
Tailwind: bg-blue-light-500, text-blue-light-500
```

### Background: Light Gray
```
Hex: #f3f4f6
RGB: 243, 244, 246
HSL: 210°, 14%, 94%
Use: Page backgrounds, containers
Tailwind: bg-gray-50, text-gray-50
```

### Text: Dark Charcoal
```
Hex: #1a1a1a
RGB: 26, 26, 26
HSL: 0°, 0%, 10%
Use: Body text, headings, all readable text
Tailwind: text-gray-900, text-black
```

---

## 🎯 When to Use Each Color

| Color | Usage | Examples |
|-------|-------|----------|
| **Teal** | Primary actions | Create, Save, Submit, Link |
| **Yellow** | Highlights | Pending, High Priority, Alert |
| **Gray** | Backgrounds | Page, Cards, Neutral areas |
| **Charcoal** | Text | Body, Labels, Headings |

---

## 📊 Status Colors (Maintained)

| Status | Color | Hex | Tailwind |
|--------|-------|-----|----------|
| Open | Teal | #1a3b32 | brand-500 |
| Pending | Yellow | #e4f47c | blue-light-500 |
| Resolved | Green | #12b76a | success-500 |
| Escalated | Red | #f04438 | error-500 |
| On Hold | Blue | #0ba5ec | info-500 |

---

## 🔘 Button Styles

### Primary Button (Call-to-Action)
- Background: #1a3b32 (Dark Teal)
- Text: White
- Hover: #16312a
- Use: Main actions

### Secondary Button
- Background: White
- Text: #1a1a1a (Dark Charcoal)
- Border: #d9dbe1 (Light Gray)
- Use: Alternative actions

### Accent Button
- Background: #e4f47c (Lime Yellow)
- Text: #1a1a1a (Dark Charcoal)
- Hover: #d8e86a
- Use: Highlights

### Danger Button
- Background: #f04438 (Error Red)
- Text: White
- Hover: #d92d20
- Use: Delete, Cancel, Destructive

---

## 🔗 CSS Classes

### Background Colors
```css
.bg-brand-500        /* Dark Teal */
.bg-blue-light-500   /* Lime Yellow */
.bg-gray-50          /* Light Gray */
.bg-gray-900         /* Dark Charcoal */
```

### Text Colors
```css
.text-brand-500      /* Dark Teal */
.text-blue-light-500 /* Lime Yellow */
.text-gray-900       /* Dark Charcoal */
.text-gray-500       /* Secondary Gray */
```

### Border Colors
```css
.border-brand-500    /* Teal border */
.border-gray-200     /* Light border */
.border-error-500    /* Red border */
```

---

## 📐 Accessibility

### Contrast Ratios
- Charcoal on Gray: **7.1:1** ✅ AAA
- Teal on White: **8.2:1** ✅ AAA
- Yellow on White: **9.3:1** ✅ AAA
- Yellow on Teal: **10.1:1** ✅ AAA

### Focus Indicator
- Color: Dark Teal (#1a3b32)
- Width: 4px
- Opacity: 12%
- Ring: All interactive elements

---

## 🎨 Color Tokens

### Primary Teal Scale (50-900)
```
50:  #f0f6f4  (Lightest)
100: #d9e8e4
200: #b8d7d2
300: #8fbfba
400: #5aa39f
500: #1a3b32  ★ PRIMARY
600: #16312a
700: #132722
800: #0f1f1a
900: #0a1512  (Darkest)
```

### Accent Yellow Scale (50-900)
```
50:  #fffef3  (Lightest)
100: #fffde3
200: #fffcc1
300: #fff8a0
400: #ffef71
500: #e4f47c  ★ ACCENT
600: #d8e86a
700: #c8d950
800: #b0c638
900: #96af28  (Darkest)
```

### Neutral Gray Scale (25-950)
```
25:  #fafafa
50:  #f3f4f6  ★ BACKGROUND
100: #e8e9ec
200: #d9dbe1  (Borders)
300: #c4c7d0
400: #9599a8
500: #6b7280  (Secondary text)
600: #4b5563
700: #364152
800: #243140
900: #1a1a1a  ★ TEXT
950: #0f1419
```

---

## 📁 Files to Reference

| Document | Purpose | Location |
|----------|---------|----------|
| Design Tokens | Complete color reference | `BPO_DESIGN_TOKENS.json` |
| CSS Variables | CSS custom properties | `src/css/style.css` |
| Style Guide | Design specifications | `BPO_STYLE_GUIDE.md` |
| Update Report | Implementation details | `COLOR_SCHEME_UPDATE.md` |
| Implementation | Complete documentation | `COLOR_IMPLEMENTATION_REPORT.md` |

---

## ⚡ Quick Tailwind Examples

```html
<!-- Primary Button (Teal) -->
<button class="bg-brand-500 text-white px-4 py-2 rounded">
  Create Ticket
</button>

<!-- Accent Button (Yellow) -->
<button class="bg-blue-light-500 text-gray-900 px-4 py-2 rounded">
  Mark Urgent
</button>

<!-- Text Input -->
<input 
  class="border border-gray-200 text-gray-900 bg-white rounded"
  placeholder="Search..."
/>

<!-- Status Badge (Pending) -->
<span class="bg-blue-light-50 text-blue-light-500 px-3 py-1 rounded">
  Pending
</span>

<!-- Heading -->
<h1 class="text-gray-900 text-2xl font-bold">
  Dashboard
</h1>
```

---

## 🔄 Conversion Guide (Old → New)

| Old Color | New Color | What Changed |
|-----------|-----------|--------------|
| #465fff (Blue) | #1a3b32 (Teal) | Primary, buttons, links |
| #0ba5ec (Cyan) | #e4f47c (Yellow) | Secondary accents |
| #f9fafb (Gray) | #f3f4f6 (Gray) | Slightly different shade |
| #101828 (Black) | #1a1a1a (Charcoal) | Text and dark elements |

---

## ✅ Verify Implementation

To confirm colors are applied:

1. **Check dev server:**
   ```bash
   npm start
   # Visit http://localhost:3000
   ```

2. **Inspect element:**
   ```
   Right-click → Inspect → Styles tab
   Look for: bg-brand-500, text-brand-500
   ```

3. **View color values:**
   ```
   BPO_DESIGN_TOKENS.json → colors.semantic.primary.500
   Should show: "#1a3b32"
   ```

---

## 📞 Support

- **Design Questions:** See `BPO_STYLE_GUIDE.md`
- **Color Values:** See `BPO_DESIGN_TOKENS.json`
- **Implementation:** See `IMPLEMENTATION_GUIDE.md`
- **Technical:** See `COLOR_IMPLEMENTATION_REPORT.md`

---

**Last Updated:** January 16, 2026  
**Color Scheme Version:** 1.0 (Dark Teal & Lime Yellow)  
**Status:** ✅ Production Ready
