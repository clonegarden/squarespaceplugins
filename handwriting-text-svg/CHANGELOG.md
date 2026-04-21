# Changelog — Handwriting Text SVG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-04-04

### ✨ Initial Release

**Features:**
- Renders plain text as an inline `<svg>` element — no canvas, no external libraries
- Animates a stroke "writing reveal" via `stroke-dasharray` / `stroke-dashoffset` CSS transition
- Optional fill reveal after stroke completes (`fillReveal=true`)
- Two built-in visual presets:
  - `ink` — thin 2px stroke with subtle SVG turbulence/blur filter for an ink-on-paper feel
  - `marker` — thick 6px rounded stroke for a broad-marker or brush look
- Optional animation looping (`repeat=true`, `repeatDelay`)
- Respects `prefers-reduced-motion` — skips animation and shows final state immediately
- Flexible insertion targeting: `first-section`, `after-header`, `before-footer`, or custom `targetId`
- Squarekicker-style URL parameter configuration
- CSS injected once with a stable style-tag id guard (no duplication)
- `DOMContentLoaded`-safe initialization
- Anavo licensing integration via `_shared/licensing.min.js` — watermark shown if unlicensed
- Debug mode (`debug=true`) for verbose console output

**Parameters:**
- `text` — text to render (URL-encoded)
- `preset` — visual preset (`ink` | `marker`)
- `position` — insertion position (`first-section` | `after-header` | `before-footer`)
- `targetId` — override insertion target by element id
- `width`, `height`, `padding` — SVG dimensions
- `align` — text alignment (`left` | `center` | `right`)
- `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`
- `fillColor`, `strokeColor`, `strokeWidth`
- `linecap`, `linejoin`
- `duration`, `delay`, `easing`
- `fillReveal`, `fillRevealMs`
- `repeat`, `repeatDelay`
- `reducedMotion`
- `debug`

**Browser Support:**
- Chrome / Edge (latest) ✅
- Firefox (latest) ✅
- Safari 14+ ✅
- Mobile Safari / Chrome Mobile ✅

---

**License:** Commercial — Anavo Tech © 2026
