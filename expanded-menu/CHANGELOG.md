# Changelog — Expanded Menu

All notable changes to the Expanded Menu plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.1.5] — 2026-03-11

### Fixed
- CSS units: `5px` was previously missing the `px` unit (written as bare `5`)
- Mobile CSS rules are now correctly scoped inside the `@media` query block
- `mobileSpacing` parameter now works correctly
- Version consistency across the file header, constant, and console log

### Added
- `mobileWrap` parameter (default: `false`) — enables wrapping of mobile menu items

---

## [2.1.4] — 2026-02-20

### Fixed
- Forces header hiding via JavaScript (subtle approach, avoids flash)
- Removes all Squarespace header space reservation
- Perfect sticky positioning behavior
- Transparent background support

---

## [2.0.0] — 2026-01-15

### Added
- Full rewrite of the expanded menu plugin
- Multi-column navigation layout support
- Custom font and color parameters
- Commercial licensing integration
- Squarespace 7.0 & 7.1 compatibility

---

[2.1.5]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.1.5
[2.1.4]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.1.4
[2.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.0.0
