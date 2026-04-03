# Changelog — Floating Header

All notable changes to the Floating Header plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.9] — 2026-03-30

### Added
- `stickyBottom` parameter (default: `false`) — header sticks at the bottom of the viewport instead of the top
  - `stickyBottom=false`: current behavior — header sticks at top of viewport
  - `stickyBottom=true`: header sticks at bottom of viewport
  - Works with both `teleport=true` (fixed positioning) and `teleport=false` (sticky positioning)

---

## [1.0.8] — 2026-03-01

### Added
- `fade` parameter (default: `false`) — replaces slide animation with fade-out/fade-in during position switch
- `noTransition` parameter (default: `false`) — disables all transitions (overrides `fade`); instant position switch

---

## [1.0.7] — 2026-02-20

### Added
- `teleport` parameter (default: `true`)
  - `teleport=true`: existing behavior — header transitions from `absolute` to `fixed` on scroll
  - `teleport=false`: natural sticky mode — scrolls with page, sticks at top

---

## [1.0.6] — 2026-02-10

### Fixed
- **CRITICAL:** Wrapper is now hidden until positioned, eliminating flash-of-unstyled-content
- **CRITICAL:** Fixed sticky transition from `absolute` → `fixed` positioning
- **CRITICAL:** Removed 2-second delay; plugin now starts instantly
- **Improved:** Direct scroll handler (no debounce issues)
- **Improved:** Better debug logging

---

## [1.0.0] — 2026-02-19

### Added
- Floating header animation (bottom → top)
- Universal Squarespace 7.0 & 7.1 compatibility
- Auto-detection of header and first section
- 15+ customization parameters
- Custom logo support (`customLogo`, `logoWidth`, `logoHeight`)
- Smooth CSS transitions
- Mobile responsive design
- Commercial licensing integration
- Parameters: `fontSize`, `fontFamily`, `fontWeight`, `fontColor`, `bgColor`, `transitionSpeed`, `stickyTop`, `startAtBottom`, `zIndex`, `debug`

### Installation
- Zero-config installation
- CDN delivery via jsDelivr
- Auto-minification via GitHub Actions

---

[1.0.9]: https://github.com/clonegarden/squarespaceplugins/releases/tag/floating-header-v1.0.9
[1.0.8]: https://github.com/clonegarden/squarespaceplugins/releases/tag/floating-header-v1.0.8
[1.0.7]: https://github.com/clonegarden/squarespaceplugins/releases/tag/floating-header-v1.0.7
[1.0.6]: https://github.com/clonegarden/squarespaceplugins/releases/tag/floating-header-v1.0.6
[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/floating-header-v1.0.0
