# Changelog — Mouse Target Focus

All notable changes to the Mouse Target Focus plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-04-03

### Added

#### Core Plugin
- IIFE (self-contained) plugin architecture matching existing repo conventions
- `document.currentScript` + `new URL(src)` + `URLSearchParams` configuration parsing
- `fixColor()` helper for bare hex colors (adds `#` prefix automatically)
- Style injection via `document.createElement('style')` with unique style tag ID `anavo-mouse-target-focus-styles`
- Async, non-blocking licensing via `_shared/licensing.min.js` (delayed 1.5 s)
- `AnavoLicenseManager` integration with plugin name `MouseTargetFocus`, watermark on unlicensed domains
- `DOMContentLoaded` check with fallback for already-loaded documents
- Console logging: `🎯 MouseTargetFocus v1.0.0 - Loading...` and `✅ MouseTargetFocus v1.0.0 Active!`
- `?debug=false` URL parameter with `dbg()` helper for verbose console output
- Idempotency guard (`window.__anavoMTF`) — safe to include the script multiple times

#### Cursor Tracking
- `requestAnimationFrame` loop with lerp smoothing controlled by `?followLag=0.15`
- `translate3d` transforms for GPU-accelerated positioning
- Target hidden (`anavo-mtf-hidden`) when cursor leaves the page

#### Shapes
- `circle` — outline circle (default)
- `circle-fill` — outline circle with configurable low-opacity fill
- `square` — outline square
- `crosshair` — CSS `::before`/`::after` cross lines
- `star` — 5-pointed star via inline SVG data-URI background

#### Appearance Parameters
- `size=48` — target size in px
- `strokeWidth=2` — outline thickness
- `strokeColor=00ffcc` — outline/stroke color (bare hex or full hex)
- `fillColor=00ffcc` — fill color for `circle-fill` / `star`
- `fillOpacity=0.08` — fill opacity
- `zIndex=999999` — stacking order

#### Hover Reaction
- Clickable element detection via `a[href]`, `button`, `input[type=button|submit|checkbox|radio]`, `[role=button]`, `[onclick]`, `label[for]`, `select`, `[tabindex]:not([-1])`, Squarespace-specific selectors, and `cursor: pointer` CSS fallback
- `pulseOnHover=true` — scale pulse animation on hover enter/exit
- `pulseScale=1.15` — scale factor
- `pulseDuration=260` — animation duration in ms
- `hoverStrokeColor` — optional stroke color override on hover
- `hoverFillOpacity` — optional fill opacity override on hover
- CSS ripple ring animation on hover enter (repeats while hovering)

#### Accessibility & Motion
- `aria-hidden="true"` and `role="presentation"` on the overlay element
- `pointer-events: none` — never blocks clicks, links, or form inputs
- `prefers-reduced-motion: reduce` fully respected — pulse and ripple animations disabled
- Coarse-pointer (touch) devices skipped by default; `?forceMobile=true` to override

#### Toggle
- `?toggleKey=` + `?toggleMod=alt|ctrl|shift|meta|none` — keyboard shortcut to show/hide the target
- `?enabled=false` — start disabled

#### Files
- `mouse-target-focus.js` — full unminified source
- `mouse-target-focus.min.js` — minified production build
- `README.md` — complete documentation with parameter table and examples
- `CHANGELOG.md` — this file
- `examples/basic.html` — self-contained demo page showcasing all shapes and options

---

[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/mouse-target-focus-v1.0.0
