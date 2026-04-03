# Changelog — Letter Rain Transform

All notable changes to the Letter Rain Transform plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-04-03

### Added

#### Core Plugin
- IIFE (self-contained) plugin architecture matching existing repo conventions.
- `document.currentScript` + `new URL(src)` + `URLSearchParams` configuration parsing.
- Style injection via `document.createElement('style')` with unique style tag ID `anavo-letter-rain-styles`.
- Async, non-blocking licensing via `_shared/licensing.min.js` (delayed 1.5 s).
- `AnavoLicenseManager` integration with plugin name `LetterRainTransform`.
- `DOMContentLoaded` check with fallback for already-loaded documents.
- Console logging: `🌧️ LetterRainTransform v1.0.0 - Loading…` and `✅ LetterRainTransform v1.0.0 Active!`.
- Idempotency guard via `data-anavo-lr-init` attribute on the source element.
- `dbg()` helper gated on `?debug=true`.

#### Text Extraction & Wrapper
- Deep DOM walk (`extractText`) that collects visible text from all nested nodes while skipping `display:none` / `visibility:hidden` elements.
- Replacement wrapper div (`.anavo-lr-wrapper`) sized to match the original element's bounding rect, preventing layout shift.
- Key typography styles (`fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `fontVariant`, `lineHeight`, `letterSpacing`, `wordSpacing`, `textTransform`, `textDecoration`, `color`) copied from source to wrapper and per-letter spans via `copyTypographyStyles`.
- Key box/layout styles (`padding`, `margin`, `backgroundColor`, `borderRadius`, `textAlign`) copied from source to wrapper via `copyBoxStyles`.
- One `<span class="anavo-lr-letter">` per character with `white-space: pre` to preserve spaces.

#### Scroll Trigger
- `IntersectionObserver` with `threshold: 0` watching the wrapper element.
- Trigger fires only after the wrapper has first been *visible* in the viewport (`hasBeenVisible` guard), then scrolled fully above it (`boundingClientRect.bottom < 0`).
- `?repeat=false` (default): observer disconnects after first trigger.
- `?repeat=true`: observer stays active; state (wrapper visibility + target content) is reset after each animation cycle.

#### Animation
- Fixed-position flying clone (`<span class="anavo-lr-flying">`) per source letter, created at the letter's exact viewport position.
- Two-phase letter movement:
  - **Phase 1** (72 % of `duration`): letter falls to target position + `fallDistance` overshoot.
  - **Phase 2** (28 % of `duration`): letter eases back up to exact target position (spring/settle effect).
- Per-letter `stagger` delay (default 18 ms).
- Extra source letters (phrase shorter than original): fall `fallDistance + 220 px` downward and fade out.
- Extra phrase letters (phrase longer than original): fade in at the target after all shared letters have landed.
- `prefers-reduced-motion`: animation skipped; source hidden and target text swapped instantly.

#### Target Integration
- Target container populated with one `<span class="anavo-lr-target-letter">` per phrase character; spans start at `opacity: 0` and reveal when the matching flying clone arrives.
- Typography copied from source letters to target letter spans for visual continuity.

#### URL Parameters (9)
- `source` — CSS selector for source element (default `#letter-rain-source`)
- `target` — CSS selector for target element (default `#letter-rain-target`)
- `phrase` — URL-encoded destination phrase (default: original text)
- `duration` — animation duration per letter in ms (default `1200`)
- `stagger` — per-letter delay in ms (default `18`)
- `fallDistance` — overshoot distance in px (default `60`)
- `easing` — CSS timing function (default `cubic-bezier(0.2, 0.8, 0.2, 1)`)
- `repeat` — allow re-trigger (default `false`)
- `debug` — verbose logging (default `false`)

#### Files
- `letter-rain-transform.js` — full source
- `README.md` — complete documentation with install snippet and parameter reference
- `CHANGELOG.md` — this file
- `examples/basic.html` — self-contained demo (no server required)

---

[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/letter-rain-transform-v1.0.0
