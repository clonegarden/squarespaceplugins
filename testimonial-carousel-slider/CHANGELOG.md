# Changelog - Testimonial Carousel Slider

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-24

### ✨ Initial Release

**Features:**
- Polished testimonial carousel with smooth CSS-transform transitions
- Auto-insertion into sections with `<h1>` / `<h2>` "Testimonials" heading or `id="testimonials"`
- `prefers-reduced-motion` support (disables transitions and autoplay)
- Keyboard navigation with ArrowLeft / ArrowRight keys
- Touch/swipe gesture support for mobile
- Dot indicator navigation with ARIA tab roles
- Prev/Next button controls with hover and focus states
- Star rating display (1–5 stars)
- Avatar images with initial-letter fallback
- Autoplay with configurable interval and pause-on-hover/focus
- Graceful fallback to built-in sample testimonials when no data provided
- ID-guarded style injection (no duplicate injection)
- Commercial licensing via `_shared/licensing.min.js`
- Watermark shown when unlicensed

**Parameters:**
- `testimonials` - URL-encoded JSON array of testimonial objects
- `autoplay` - Enable/disable auto-advance
- `interval` - Autoplay delay in milliseconds
- `accentColor` - Accent color for stars, buttons, and highlights
- `bgColor` - Card and section background color
- `textColor` - Quote and author text color
- `cardRadius` - Card corner radius
- `maxWidth` - Maximum carousel width
- `showStars` - Toggle star rating display
- `showAvatars` - Toggle avatar display

**Browser Support:**
- Chrome/Edge (latest) ✅
- Firefox (latest) ✅
- Safari 12+ ✅
- Mobile browsers ✅

---

**License:** Commercial - Anavo Tech © 2026
