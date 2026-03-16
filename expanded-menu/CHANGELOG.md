# Changelog — Expanded Menu

All notable changes to the Expanded Menu plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.3.1] — 2026-03-16

### Fixed
- `mobileMode=default`: custom menu wrapper is now **physically removed from the DOM** on mobile (≤479px) instead of hidden via inline CSS. The previous approach set `display: none !important` on the wrapper via `style.cssText`, but the global stylesheet rule `div[class*="anavo-menu"] { display: block !important }` overrode it. Removing the node from the DOM is immune to all CSS specificity conflicts.
- `mobileMode=default`: desktop branch re-inserts the wrapper from `cachedMenuHTML` if it was removed while on mobile, then clears any residual inline styles.
- `mobileMode=default`: added `setTimeout(applyMobileDefaultMode, 500)` and `setTimeout(applyMobileDefaultMode, 1500)` after the initial call to handle Squarespace's late JS re-initialization that can restore header/nav elements after the plugin first runs.

---

## [2.3.0] — 2026-03-16

### Fixed
- `mobileMode=default`: replaced the broken CSS-only approach with a JS state snapshot + swap strategy
- Before any DOM changes, original `cssText` of all header/nav elements is captured in a `WeakMap`
- On mobile (≤479px): all header/nav elements are restored to their exact original Squarespace state; the custom menu wrapper is removed from the visual flow (`display: none; position: absolute; left: -9999px`)
- On desktop (≥480px): `forceHideSquarespaceHeader()` and `hideSquarespaceNav()` are called by the swap function; custom menu is shown
- A `matchMedia('(max-width: 479px)')` listener fires the swap function whenever the viewport crosses the 479px boundary, eliminating race conditions with `setTimeout` and Squarespace's own dynamic JS
- Removed CSS media query rules for `mobileMode=default` from `injectStyles()` (CSS cannot override Squarespace inline styles; JS swap is used instead)
- Mobile CSS for the custom menu (horizontal scroll layout) is no longer injected when `mobileMode=default`

---

## [2.2.1] — 2026-03-16

### Fixed
- `mobileMode=default`: custom menu now correctly hidden on mobile (≤479px) — the high-specificity CSS rule `html body div.anavo-menu-wrapper` overrides the general `div.anavo-menu-wrapper { display: block !important }` rule
- `mobileMode=default`: Squarespace MENU button is now fully clickable on mobile — `forceHideSquarespaceHeader()` and `hideSquarespaceNav()` no longer apply inline styles when `mobileMode=default`; CSS media queries handle all show/hide declaratively
- `mobileMode=default`: removed race-prone resize event listener; CSS media queries provide reliable responsive behaviour without JavaScript

---

## [2.2.0] — 2026-03-13

### Added
- `mobileMode=default` option — preserves the Squarespace native mobile menu on screens ≤479px
- When `mobileMode=default`: custom menu (`anavo-menu-wrapper`) is hidden on mobile via CSS media query
- When `mobileMode=default`: Squarespace header and nav are only hidden on desktop (>479px); they are restored on mobile
- Resize event listener (debounced) re-evaluates header/nav visibility when viewport crosses the 479px breakpoint

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

[2.3.1]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.3.1
[2.3.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.3.0
[2.2.1]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.2.1
[2.2.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.2.0
[2.1.5]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.1.5
[2.1.4]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.1.4
[2.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.0.0

### Fixed
- `mobileMode=default`: custom menu now correctly hidden on mobile (≤479px) — the high-specificity CSS rule `html body div.anavo-menu-wrapper` overrides the general `div.anavo-menu-wrapper { display: block !important }` rule
- `mobileMode=default`: Squarespace MENU button is now fully clickable on mobile — `forceHideSquarespaceHeader()` and `hideSquarespaceNav()` no longer apply inline styles when `mobileMode=default`; CSS media queries handle all show/hide declaratively
- `mobileMode=default`: removed race-prone resize event listener; CSS media queries provide reliable responsive behaviour without JavaScript

---

## [2.2.0] — 2026-03-13

### Added
- `mobileMode=default` option — preserves the Squarespace native mobile menu on screens ≤479px
- When `mobileMode=default`: custom menu (`anavo-menu-wrapper`) is hidden on mobile via CSS media query
- When `mobileMode=default`: Squarespace header and nav are only hidden on desktop (>479px); they are restored on mobile
- Resize event listener (debounced) re-evaluates header/nav visibility when viewport crosses the 479px breakpoint

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

[2.3.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.3.0
[2.2.1]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.2.1
[2.2.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.2.0
[2.1.5]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.1.5
[2.1.4]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.1.4
[2.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/expanded-menu-v2.0.0
