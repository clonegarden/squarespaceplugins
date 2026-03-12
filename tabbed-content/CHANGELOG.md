# Changelog — Tabbed Content

All notable changes to the Tabbed Content plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.2.0] — 2026-03-12

### Fixed

#### Concrete / Browser tab style — folder-tab CSS pattern corrected
- **Removed** `border-bottom` from `.anavo-tc-tablist` — the full-width bottom line on the tab bar no longer exists, so gaps between tabs and the space after the last tab are now visually open (show the page background)
- **Added** `border: 1px solid [tabBorderColor]` to `.anavo-tc-panels` — the content panel's top border now creates the horizontal line that runs between tabs and after the last tab, giving the correct folder-tab appearance
- **Active tab** continues to use `border-bottom-color: bgColor` + `margin-bottom: -1px` to seamlessly merge with the content panel below (no visible bottom border on the active tab)
- **Inactive tabs** retain a full rectangular border (top + left + right + bottom) so they look like closed folder tabs
- `browser` style receives the same fix (also had the full-width tablist line issue)

---

## [1.1.0] — 2026-03-11

### Added

#### New URL Parameters
- `tabStyle` — visual mode for the tab bar: `concrete` (default, file-folder style with full rectangular borders), `browser` (rounded top corners), `minimal` (underline on active tab only)
- `tabGap` — gap between tabs in px (default `8`)
- `tabFontColor` — font color for inactive tabs (defaults to `inactiveColor`)
- `tabFontFamily` — font family specifically for tabs (defaults to `fontFamily`)
- `borderColor` — general border color alias for `sectionBorderColor`
- `photoSize` — image column width in % (alias for `imageWidth`)
- `titleFontSize` — heading font size in px (alias for `headingSize`)
- `titleFontColor` — font color for the content title (defaults to `activeColor`)
- `titleFontFamily` — font family for the content title (defaults to `contentFont`)
- `descFontSize` — description body font size in px (alias for `bodySize`)
- `descFontColor` — font color for description text (defaults to `inactiveColor`)
- `descFontFamily` — font family for description text (defaults to `contentFont`)
- `imagePadding` — padding around the image inside `.anavo-tc-image-wrap` in px (default `16`)

### Changed

#### Visual Redesign — File Organizer Style (concrete)
- **Tab bar:** full rectangular border on all 4 sides for inactive tabs (concrete style)
- **Tab bar:** `border-bottom` line runs across the full width of the tablist; active tab uses `margin-bottom: -1px` to overlap and "break" the line, creating the file-folder illusion
- **Tab bar:** tabs always use horizontal scroll (`flex-wrap: nowrap; overflow-x: auto`) with hidden scrollbar
- **Tab bar:** gap is now configurable via `tabGap` (default `8px`)
- **Active tab:** `border-bottom-color` set to `bgColor` — hides bottom border so tab appears to open into the panel
- **Browser style:** like concrete but with `border-radius: 6px 6px 0 0` (rounded tops)
- **Minimal style:** no borders; active tab has `border-bottom: 2px solid activeColor`
- **Presets updated:** `default` → `concrete`, `minimal` → `minimal`, `elegant` → `concrete`, `bold` → `browser`
- **Image wrap:** added `padding: {imagePadding}px` and `box-sizing: border-box` for breathing room around image
- **Heading color:** uses `titleFontColor` (falls back to `activeColor`)
- **Heading font:** uses `titleFontFamily` (falls back to `contentFont`)
- **Body color:** uses `descFontColor` (falls back to `inactiveColor`)
- **Body font:** uses `descFontFamily` (falls back to `contentFont`)
- **Tab color:** uses `tabFontColor` (falls back to `inactiveColor`)
- **Tab font:** uses `tabFontFamily` (falls back to `fontFamily`)
- **Mobile tab bar:** gap scales down based on `tabGap`; tab padding more compact

---

## [1.0.0] — 2026-03-11

### Added

#### Core Plugin
- IIFE (self-contained) plugin architecture matching existing repo conventions
- `document.currentScript` + `new URL(src)` + `URLSearchParams` configuration parsing
- `fixColor()` helper for hex colors without leading `#`
- Style injection via `document.createElement('style')` with unique style tag ID
- Async, non-blocking licensing via `_shared/licensing.min.js` (delayed 1.5s)
- `AnavoLicenseManager` integration with plugin name `TabbedContent`
- `DOMContentLoaded` check with fallback for already-loaded documents
- Console logging: `📁 TabbedContent v1.0.0 - Loading...` and `✅ TabbedContent v1.0.0 Active!`

#### Targeting (4 modes)
- `?sectionIndex=N` — target Nth page section (1-based)
- `?sectionId=X` — target section by Squarespace `data-section-id`
- `?divId=X` — target a `<div>` wrapper by id
- `?ulId=X` — target a `<ul>` directly by id

#### Auto-extraction
- Squarespace Summary Block items (`.summary-item`, `.summary-title`, `.summary-thumbnail img`, `.summary-excerpt`)
- Squarespace 7.1 List Section items (`.user-items-list-item-container`, `.list-item`)
- Custom `<ul><li>` with data attributes (`data-image`, `data-title`, `data-subtitle`, `data-link`, `data-body`)
- Heading groups within a section (`<h2>`/`<h3>` + following `<p>` and `<img>`)

#### Tabbed UI
- Tab bar with `role="tablist"` and tab buttons with `role="tab"`, `aria-selected`, `aria-controls`, `tabindex`
- Content panels with `role="tabpanel"`, `aria-labelledby`, `hidden` attribute for inactive panels
- Active tab switching on **hover** AND **click**
- Image column + content column two-column layout
- Image placeholder (📷 emoji) when no image is provided
- Heading, subtitle, body text, and optional link in content column

#### URL Parameters (30+)
- **Targeting:** `sectionIndex`, `sectionId`, `divId`, `ulId`
- **Presets:** `preset` = `default` / `minimal` / `elegant` / `bold`
- **Appearance:** `bgColor`, `activeColor`, `inactiveColor`, `fontFamily`, `contentFont`
- **Tab Bar:** `tabAlign`, `tabFontSize`, `tabTransform`, `tabLetterSpacing`, `tabBorder`, `tabBorderColor`
- **Content Panel:** `contentPadding`, `imagePosition`, `imageWidth`, `imageAspect`, `headingTag`, `headingSize`, `subtitleSize`, `bodySize`
- **Animation:** `animationType`, `animationSpeed`
- **Section:** `sectionBorder`, `sectionBorderColor`, `sectionRadius`
- **Debug:** `debug`

#### Presets
- `default` — warm beige (`#FAF5EF`), border separators, serif headings
- `minimal` — white background, no borders, clean sans-serif
- `elegant` — Cormorant Garamond font, warm beige, border separators (matches reference screenshot)
- `bold` — dark mode (`#1a1a1a`), white active color, dark borders

#### Animations
- `fade` — opacity fade-in on panel switch
- `slide` — slide-in from right with opacity fade
- `none` — instant switch, no animation
- `prefers-reduced-motion` respected — animations disabled when user preference is set

#### Keyboard Navigation (ARIA pattern)
- `ArrowRight` / `ArrowDown` — next tab
- `ArrowLeft` / `ArrowUp` — previous tab
- `Home` — first tab
- `End` — last tab
- Focus management follows ARIA Authoring Practices Guide tablist pattern

#### Responsive Design
- Desktop: side-by-side image + content columns
- Tablet (`≤900px`): smaller padding and font sizes
- Mobile (`≤768px`): stacked layout, horizontal-scroll tab bar
- Small mobile (`≤480px`): compact padding, smaller tab font

#### Files
- `tabbed-content.js` — full source
- `README.md` — complete documentation
- `CHANGELOG.md` — this file
- `examples/basic.html` — self-contained demo with 7 photography service items

---

[1.2.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/tabbed-content-v1.2.0
[1.1.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/tabbed-content-v1.1.0
[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/tabbed-content-v1.0.0
