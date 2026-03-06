# BlackPiston Garage — Design Reference

## Brand Identity

| Element | Value |
|---------|-------|
| **Primary Color** | Orange `#F97316` (Tailwind `orange-500`) |
| **Secondary** | Deep black `#0A0A0B` |
| **Accent Gradient** | `from-orange-500 to-orange-600` |
| **Background** | Near-black `#0F0F10` |
| **Surface** | `#1A1A1D` / `#252528` |
| **Text Primary** | `#FAFAFA` |
| **Text Muted** | `#A1A1AA` |
| **Brand Font** | Outfit (headings), Inter (body) |

---

## Design Principles

### 1. Dark-First, Premium Feel
- Deep dark backgrounds with subtle texture/grain
- Orange accents used sparingly for CTAs and highlights
- Glass-morphism on overlays and modals (`backdrop-blur-xl`, semi-transparent backgrounds)

### 2. Card-Based Layouts
- Rounded corners (`border-radius: 12px–16px`)
- Subtle border with `border-border/50`
- Hover: scale(1.02), elevated shadow, border color shift to orange
- Skeleton loading states with shimmer animation

### 3. Visual Hierarchy
- Large bold headings (48–64px hero, 32–40px sections)
- Section labels as uppercase, letter-spaced, small text
- Consistent spacing scale: 4px base → 8, 12, 16, 24, 32, 48, 64

### 4. Microinteractions
- Card hover: `scale(1.02)` with `transition-transform duration-300`
- Image hover: inner zoom `scale(1.1)` with overflow hidden
- Button hover: gradient shift or opacity change
- Add-to-cart: brief pulse or check animation
- Page transitions: fade-in with `animate-in` classes
- Skeleton loaders: pulse shimmer during data fetch

---

## Component Patterns

### ProductCard
- Image container with 4:3 or 1:1 aspect ratio, overflow hidden
- Price with strikethrough for offers, discount badge top-left
- Star rating with count
- Hover reveals "Add to Cart" button with slide-up animation
- Skeleton variant with animated pulse blocks

### ProductDetail
- Image gallery: large main image + thumbnail strip below
- Zoom on hover (CSS transform scale within overflow container)
- Sticky add-to-cart bar on scroll (mobile)
- Specifications in two-column grid
- Reviews section with avatar, star display, date

### Admin Tables
- Clean header row with sort indicators
- Alternating row backgrounds (subtle)
- Action buttons in last column with icon + tooltip
- Pagination bar at bottom
- Search/filter bar above table

### Admin Forms
- Two-column layout for wide screens, stack on mobile
- Inline validation with red border + error message
- Image upload area with drag-and-drop, preview thumbnails
- Toast notifications on success/error

---

## Spacing & Layout Tokens

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;

--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;

--shadow-card: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4);
--shadow-card-hover: 0 10px 25px rgba(249,115,22,0.15), 0 4px 10px rgba(0,0,0,0.3);
```

---

## Typography Scale

| Use | Size | Weight | Font |
|-----|------|--------|------|
| Hero heading | 48–64px | 800 | Outfit |
| Section heading | 32–40px | 700 | Outfit |
| Card title | 18–24px | 600 | Inter |
| Body text | 14–16px | 400 | Inter |
| Caption/label | 12px | 500 | Inter |
| Button text | 14px | 600 | Inter |

---

## Accessibility Checklist

- [x] Color contrast: orange on dark ≥ 4.5:1 (WCAG AA)
- [x] Focus outlines: `ring-2 ring-orange-500 ring-offset-2 ring-offset-background`
- [x] Keyboard navigation: Tab through all interactive elements
- [x] `aria-label` on icon-only buttons
- [x] `aria-describedby` for form validation errors
- [x] Skip-to-main-content link
- [x] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`
- [x] Image alt text on all product images
- [x] Reduced motion support: `@media (prefers-reduced-motion: reduce)`
