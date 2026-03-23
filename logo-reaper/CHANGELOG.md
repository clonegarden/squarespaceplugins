# Changelog — Logo Reaper

All notable changes to the Logo Reaper plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.1] — 2026-03-23

### Fixed
- `clickToKill=true` now reliably triggers the death sequence when a logo is clicked.
  Previously, `pointer-events: none` on the `.anavo-lr-lane` container could prevent click events from reaching logo elements in certain Squarespace themes, even when `pointer-events: auto` was applied to individual logos.
  The fix introduces a transparent `.anavo-lr-hit-layer` overlay (a direct child of the root, above the lane) that intercepts clicks when `clickToKill` is enabled. A JavaScript bounding-rect hit-test identifies which live logo was clicked, so the lane itself never needs pointer-event changes.
- Added drag-vs-click detection (5 px pointer-movement threshold) to prevent accidental death triggers during scroll or drag gestures.

---

## [1.3.0] — 2026-03-16

### Added
- `gapPx` parameter — minimum edge-to-edge horizontal gap (px) between consecutive live logos. A new logo only spawns after the previous one has moved far enough from the right edge to maintain this gap. Default is `Math.round(logoH * 0.35)` (proportional to logo height).
- `clickToKill` parameter — when `true`, clicking a live logo wrapper immediately triggers the death sequence (stamp + particle explosion + pile). Double-trigger is prevented; clicking a logo that is already dying is a no-op.
- Logo widths are refreshed via `img.onload` after the image is rendered for more accurate gap calculations.

---

## [1.2.0] — 2026-03-11

### Added
- New stamp effect variety — expanded random stamp pool
- Improved particle explosion system with more particles and randomized trajectories
- Performance optimizations for large logo counts

---

## [1.1.0] — 2026-02-15

### Added
- Dead-logo pile animation — logos stack in the left corner after being "reaped"
- `height` parameter to control marquee track height
- `speed` parameter to control logo scroll speed

### Fixed
- Logo sizing consistency across different aspect ratios

---

## [1.0.0] — 2026-01-20

### Added
- Animated continuous logo marquee for Squarespace
- Logos enter from the right side of the screen
- On reaching the trigger position, each logo receives a random stamp + particle explosion
- After being "reaped", logos fall into a dead-logo pile stacked in the left corner
- `logos` parameter — comma-separated list of logo image URLs
- Commercial licensing integration via `AnavoLicenseManager`
- `debug` parameter for verbose console logging

---

[1.3.1]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.3.1
[1.3.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.3.0
[1.2.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.2.0
[1.1.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.1.0
[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.0.0
