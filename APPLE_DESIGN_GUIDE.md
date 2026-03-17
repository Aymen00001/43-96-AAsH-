# Apple Design System Implementation Guide

## Overview
Your frontend has been redesigned to match Apple's premium, minimalist design aesthetic. This guide will help you maintain consistency as you develop new components and features.

## Color Palette  

### Primary Colors
- **Background**: `#ffffff` (Apple white)
- **Text Primary**: `#1d1d1f` (Apple black/dark gray)
- **Text Secondary**: `#86868b` (Apple medium gray)
- **Text Tertiary**: `#a1a1a6` (Apple light gray)
- **Accent Blue**: `#0071e3` (Apple blue)

### Apple Gray Scale
Used for subtle UI elements and dividers:
- `apple-50`: `#f9f9f9` (Almost white)
- `apple-100`: `#f3f3f3` (Very light gray)
- `apple-200`: `#efefef` (light gray)
- `apple-300`: `#e5e5e7` (Dividers)
- `apple-500`: `#a1a1a6` (Secondary text)
- `apple-600`: `#767680` (Tertiary text)
- `apple-900`: `#1d1d1f` (Primary text)

> Access these in Tailwind using `bg-apple-{50-900}`, `text-apple-{50-900}`

## Typography

### Font Family
The system uses Apple's SF Pro Display font stack (falls back to system fonts):
```
-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif
```

### Font Sizes & Weights
- **Headings (H1)**: `text-5xl font-semibold` - Large, impactful titles
- **Headings (H2)**: `text-2xl font-semibold` - Section titles  
- **Body**: `text-base` - Standard text (16px)
- **Small**: `text-sm` - Secondary information
- **Caption**: `text-xs` - Tertiary information, labels

### Letter Spacing
- Headings: `-0.022em` (tighter spacing for sophistication)
- Body: Default (natural)

## Component Styles

### Buttons

#### Primary Button (Most Used)
```jsx
<button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                   text-white font-medium rounded-lg 
                   transition-colors duration-200 ease-out">
  Action
</button>
```

#### Secondary Button
```jsx
<button className="px-6 py-2.5 bg-apple-200 text-apple-900 hover:bg-apple-300
                   font-medium rounded-lg
                   transition-colors duration-200 ease-out">
  Action
</button>
```

#### Ghost Button (No background)
```jsx
<button className="px-6 py-2.5 text-apple-900 hover:bg-apple-100
                   font-medium rounded-lg
                   transition-colors duration-200 ease-out">
  Action
</button>
```

#### Icon Button
```jsx
<button className="p-2 rounded-lg hover:bg-apple-100
                   transition-colors duration-200
                   text-apple-700">
  <Icon size={20} />
</button>
```

**Key Principles:**
- Use `ease-out` for transitions (feels more responsive)
- Hover/active states provide clear feedback
- Padding: `py-2.5` for standard, `py-3` for large
- Border radius: `rounded-lg` (12px) or `rounded-base` (12px)
- Never use fully saturated colors - use blue-600, not pure blue

### Cards

```jsx
<div className="bg-white rounded-xl shadow-base 
                border border-apple-200 p-6
                transition-shadow duration-200">
  {content}
</div>
```

**Card Variants:**
- **Standard**: Default shadow and border
- **Hover**: `hover:shadow-md hover:border-apple-300` (interactive)
- **Flat**: Remove border for borderless card
- **Elevated**: Use `shadow-lg` for important content

### Form Controls

```jsx
<input 
  className="w-full px-4 py-2.5 rounded-lg
             bg-white border border-apple-300
             text-apple-900 placeholder-apple-500
             focus:outline-none focus:ring-2 focus:ring-blue-600 
             focus:border-transparent
             transition-all duration-200" 
/>
```

**Key Features:**
- Generous padding (`py-2.5`)
- Clear focus state with ring
- Subtle border color (not pure gray)
- Smooth transitions

### Navigation Items

```jsx
<button className="px-4 py-3 rounded-lg text-apple-700 
                   hover:bg-apple-100
                   font-medium
                   transition-colors duration-200">
  Menu Item
</button>
```

**Active State:**
```jsx
<button className="px-4 py-3 rounded-lg bg-blue-100 text-blue-600 
                   font-semibold
                   transition-colors duration-200">
  Active Item
</button>
```

## Shadows & Depth

Apple uses subtle, layered shadows for depth:

- **xs**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` - Minimal elevation
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` - Subtle 
- **base**: `0 1px 3px 0 rgba(0, 0, 0, 0.08)` - Standard cards
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` - Elevated content
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.12)` - Important elements
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.15)` - Modals, dropdowns

**Usage:**
- Never use `shadow-2xl` or higher (too dramatic)
- Use `shadow-base` for cards
- Use `shadow-md` for hover states
- Shadows should be barely noticeable

## Spacing

Apple uses generous whitespace:

- `xs: 0.5rem` (8px) - Tight spacing
- `sm: 1rem` (16px) - Standard spacing
- `md: 1.5rem` (24px) - Component sections
- `lg: 2rem` (32px) - Major sections
- `xl: 2.5rem` (40px) - Large gaps

**Usage:** 
- Cards: `p-6` padding
- Sections: `mb-8` between major sections
- Components: `gap-4` between items

## Border Radius

- `rounded-lg` (12px) - Default for buttons, inputs, cards
- `rounded-base` (12px) - Same as lg, explicit choice
- `rounded-xl` (16px) - Cards, larger components
- `rounded-full` (9999px) - Badges, avatars

Don't mix radius sizes in related elements.

## Animations & Transitions

### Duration
- `duration-200` - Most interactive elements (default)
- `duration-300` - Page transitions
- `duration-400` - Modal animations

### Easing
- `ease-out` - User interactions (buttons, hovers)
- `ease-in-out` - Complex animations
- Never use `ease-in` (feels sluggish)

### Framer Motion
Prefer these patterns:

```jsx
// Simple fade & scale entrance
variants={{
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
}}

// Staggered children
variants={{
  container: { transition: { staggerChildren: 0.05 } },
  item: { opacity: 0, y: 12 }
}}
```

## Component Examples

### Navigation Bar
```jsx
<nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md 
                border-b border-apple-200 shadow-xs">
  {/* content */}
</nav>
```

### Input Group with Label
```jsx
<div className="space-y-2">
  <label className="text-label">Label Text</label>
  <input className="input-primary" />
</div>
```

### Badge
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 text-xs font-medium 
                 bg-blue-100 text-blue-600">
  Badge
</span>
```

### Divider
```jsx
<div className="divider" /> <!-- h-px bg-apple-200 -->
```

## Text Utility Classes

- `.text-label` - Form labels (14px, medium)
- `.text-small` - Secondary text (14px, lighter)
- `.text-caption` - Captions (12px, uppercase)

## Dark Mode

The system supports dark mode with CSS variables:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --apple-bg: #000000;
    --apple-text-primary: #f5f5f7;
    --apple-border: #424245;
  }
}
```

Component classes automatically support dark mode with `dark:` prefixes.

## Dos & Don'ts

### ✅ Do
- Use generous whitespace
- Keep designs minimal and clean  
- Use consistent shadows (subtle)
- Follow the color palette
- Use the system font family
- Honor focus states for accessibility
- Test interactions on actual devices

### ❌ Don't
- Use neon or highly saturated colors
- Add excessive shadows or borders
- Use more than 2 font sizes in a section
- Make buttons too small (min `py-2.5`)
- Forget focus states (accessibility)
- Use color as the only way to convey information
- Make animations faster than `duration-200`

## Implementation Checklist

When creating new components:

- [ ] Use `rounded-lg` or `rounded-xl` for corners
- [ ] Include proper focus states
- [ ] Use Apple colors from palette
- [ ] Add smooth transitions (`duration-200`)
- [ ] Implement hover/active states
- [ ] Test with Tailwind utility classes
- [ ] Ensure sufficient contrast for text
- [ ] Use proper shadow for depth
- [ ] Mobile responsive design
- [ ] Keyboard accessible (inputs, buttons)

## Resources

- [Apple Design System](https://developer.apple.com/design/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)

## Notes

This design system is fully implemented using:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons (already integrated)
- **San Francisco font stack** for typography

All color values, spacing, and animations follow Apple's design principles for a premium, professional appearance.
