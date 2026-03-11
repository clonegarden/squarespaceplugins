# Changelog — Tabbed Content

All notable changes to the Tabbed Content plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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

[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/tabbed-content-v1.0.0
