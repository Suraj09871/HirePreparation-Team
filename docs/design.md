# HirePrep Design System

This document outlines the core design system, CSS variables, and component styles for the HirePrep application, based on `css/style.css`.

## 1. Colors

The application relies on CSS custom properties for theming, supporting both light (default) and dark modes.

### Theme Variables

| Variable Name | Light Mode (Default) | Dark Mode (`[data-theme="dark"]`) | Description |
| --- | --- | --- | --- |
| `--primary` | `#f97316` (Orange) | Same | Main brand and accent color |
| `--primary-hover` | `#ea580c` | Same | Hover state for primary interactive elements |
| `--secondary` | `#1e293b` (Slate) | Same | Secondary brand color |
| `--bg-color` | `#ffffff` (White) | `#0f172a` (Deep Navy) | Main page background |
| `--bg-muted` | `#f8fafc` (Light Gray) | `#1e293b` (Dark Slate) | Secondary/muted backgrounds |
| `--card-bg` | `#ffffff` | `#1e293b` | Background for cards and containers |
| `--border-color`| `#e2e8f0` | `#334155` | Borders and dividers |
| `--text-main` | `#0f172a` | `#f8fafc` | Primary text color |
| `--text-muted` | `#64748b` | `#94a3b8` | Secondary/helper text |
| `--input-bg` | `#ffffff` | `#0f172a` | Form input backgrounds |

*Hero Gradient:*
- `--hero-bg-start`: `#2e4c6a`
- `--hero-bg-end`: `#1a2a40`

### Status & Semantic Colors
- **Success:** `#10b981` (Green - used in toasts)
- **Error:** `#ef4444` (Red - used in toasts)
- **Info:** `#3b82f6` (Blue - used in toasts)
- **Warning:** Amber/Yellow *(Recommended: Formalize specific hex value as `--warning`)*

### Unified Auth Tab Colors
- **Student Tab:** `#f97316` (Orange / `--primary`)
- **Recruiter Tab:** `#1e293b` (Slate)
- **Developer Tab:** `#7c3aed` (Purple)

---

## 2. Typography

- **Font Family:** `'Inter', sans-serif` (Google Fonts)
- **Base Styling:** Globally applied `border-box`. Body uses `--bg-color` and `--text-main` with a minimum height of `100vh`.

### Text Utilities
- `.text-sm`: `0.875rem`
- `.text-lg`: `1.125rem`
- `.text-3xl`: `1.875rem`
- `.md-text-4xl`: `2.25rem` (Applies at ≥768px)
- `.text-5xl`: `3rem`

### Color Utilities
- `.highlight`: `var(--primary)` color, font-weight `700`
- `.accent`: `var(--primary)` color
- `.text-white`: `#ffffff`
- `.text-white-70`: `rgba(255, 255, 255, 0.7)`
- `.text-muted`: `var(--text-muted)`

---

## 3. Layout & Structure

### Breakpoints
- **Mobile:** `< 768px` (Single column layouts, hamburger menu)
- **Tablet:** `≥ 768px` (Grid columns expand, `.md-text-4xl` activates)
- **Desktop:** `≥ 1024px`

### Layout Utilities
- `.container`: `max-width: 1200px`, `margin: 0 auto`, `padding: 0 1.5rem`
- `.w-full`: `width: 100%`
- `.hidden`: `display: none !important`
- `.text-center`: `text-align: center`
- `.justify-center`: `justify-content: center`
- `.relative`: `position: relative`
- `.z-10`: `z-index: 10`

---

## 4. Spacing & Borders

### Spacing Scale
Uses utility classes for consistent padding and margins:
- Commonly used values: `py-12` (`3rem`), `py-24` (`6rem`), `mt-4` (`1rem`)
- Standard card padding: `1.5rem` - `2rem`
- Implicit rem scale: `0.5`, `0.75`, `1`, `1.25`, `1.5`, `2`, `3`, `6` *(Recommended: Formalize into CSS variables e.g., `--space-sm`, `--space-md`)*

### Border Radius
- **Small (8px):** Buttons, inputs
- **Standard (12px):** Cards, feature cards, modals (12-16px)
- **Full/Pill (20px):** Badges, pills
- **Circle (50%):** Avatars

### Shadows
- Cards have a default box-shadow that enhances on hover, paired with a `translateY(-5px)` transform. *(Recommended: Formalize shadow values into `--shadow-sm`, `--shadow-md`, `--shadow-hover` variables)*

---

## 5. Components

### Navbar
- Sticky positioning at the top with flex layout.
- Contains logo, navigation links, user profile badge, and theme toggle (sun/moon).
- Collapses into a hamburger menu on screens `≤768px`.

### Buttons
- Base class: `.btn` (Padding: `0.75rem 1.5rem`, Border Radius: `8px`)
- `.btn-primary`: Orange background (`--primary`), white text, hover state (`--primary-hover`)
- `.btn-secondary`: Secondary brand styling
- `.btn-outline`: Bordered with a transparent background
- `.btn-dark`: Dark background variant

### Cards
- Classes: `.feature-card`, `.step-card`
- Background: `var(--card-bg)`
- Border: `1px solid var(--border-color)` with `12px` border radius
- Padding: `1.5rem` to `2rem`
- Hover state: `transform: translateY(-5px)` with enhanced shadow

### Forms & Inputs
- Full-width inputs with `0.75rem 1rem` padding.
- Border: 1px or 2px solid `var(--border-color)`, `8px` radius.
- Background: `var(--input-bg)`.
- Focus state: Border color transitions to `var(--primary)`.
- Labels: `font-weight: 500`, `margin-bottom: 0.5rem`.

### Modals
- Fixed overlay backdrop with a blur effect.
- `.modal-content` is centrally aligned.
- Max width ~`500px`.
- Background: `var(--card-bg)`, Border radius: `12px` - `16px`.

### Tables
- Full-width with `border-collapse`.
- Table headers use muted backgrounds.
- Alternating row hover effects.
- Cell padding: `0.75rem 1rem`.

### Badges
- Small inline displays.
- Padding: `0.25rem 0.75rem`.
- Border radius: `20px` (pill shape).
- Color variants mapped to status types.

### Alerts & Toast Notifications
- Class: `.toast-notification` (Fixed positioning).
- Animated slide-in from bottom using `cubic-bezier` timing.
- Auto-dismissing.
- Background colors mapped to status: `#10b981` (Success), `#ef4444` (Error), `#3b82f6` (Info).

### Loading States
- CSS spinner animations.
- Skeleton loading screens utilizing gradient pulses.

### Skill Bars
- Visual progress meters with a `1s ease-in-out` width transition animation.

---

## 6. Animations
- **Card Hover:** `transform: translateY(-5px)`
- **Toasts:** Slide-in from bottom (`cubic-bezier` transition)
- **Skill Bars:** Horizontal fill animation
- **Hero Section:** Floating elements
- **Stats:** Number counter animations
