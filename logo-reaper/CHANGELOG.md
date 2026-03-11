# Changelog — Logo Reaper

All notable changes to the Logo Reaper plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

[1.2.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.2.0
[1.1.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.1.0
[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/logo-reaper-v1.0.0
