# Changelog — Timeline

All notable changes to the Timeline plugin are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-03-20

### Added

#### Core Plugin
- IIFE (self-contained) plugin architecture matching existing repo conventions
- `document.currentScript` + `new URL(src)` + `URLSearchParams` configuration parsing
- `fixColor()` helper for bare hex colors (adds `#` prefix automatically)
- Style injection via `document.createElement('style')` with unique style tag ID `anavo-timeline-styles`
- Async, non-blocking licensing via `_shared/licensing.min.js` (delayed 1.5 s)
- `AnavoLicenseManager` integration with plugin name `Timeline`, watermark on unlicensed domains
- `DOMContentLoaded` check with fallback for already-loaded documents
- Console logging: `⏳ Timeline v1.0.0 - Loading...` and `✅ Timeline v1.0.0 Active!`
- `?debug=false` URL parameter with `dbg()` helper for verbose console output

#### Target Detection (auto + manual)
- Auto-detect `<div id="timeline">` (highest priority)
- Auto-detect any page section containing `<h1>timeline</h1>` (case-insensitive trim)
- `?sectionIndex=N` — target Nth page section (1-based)
- `?sectionId=X` — target section by Squarespace `data-section-id`
- `?divId=X` — target any `<div>` by id

#### Data Extraction (5 modes, in priority order)
- `?data=[...]` — URL-encoded JSON array of item objects (`year`, `title`, `body`, `image`, `side`)
- `.timeline-item` elements with `data-year`, `data-title`, `data-body`, `data-image`, `data-side`
- `<ul><li>` elements with `data-year` / `data-title` data attributes
- Squarespace Summary Block items (`.summary-item`, `.summary-title`, `.summary-thumbnail img`)
- Squarespace 7.1 List Section items (`.user-items-list-item-container`, `.list-item`)
- Heading groups — `<h2>`/`<h3>` followed by `<p>` / `<img>` / `<time>` siblings

#### Layout Modes
- `?layout=vertical` — single column, vertical line on the left (default)
- `?layout=horizontal` — horizontal scrollable row, line across the top
- `?layout=alternate` — zigzag items alternate left/right of a centered line
- `?offset=60` — side gap (px) for alternate layout
- Mobile responsive: alternate stacks to single column (≤768px), horizontal remains scrollable

#### Animations
- Scroll-synced line draw (`?scrollSync=true`, default): line fill height/width tracks scroll progress
- One-shot line draw (`?scrollSync=false`): smooth draw triggered by `IntersectionObserver` on reveal
- Glow pulse at the tip of the drawn line (CSS keyframe `anavo-tl-glow`)
- Dot scale-in reveal via `IntersectionObserver` on each dot element
- Card reveal via `IntersectionObserver` with `fade` (default) or `slide` entry animation
- `?animationType=fade` / `slide` / `none`
- `?animationSpeed=400` — animation duration in ms
- `?drawLine=true/false` — disable line draw entirely

#### Accessibility
- Line, dots, and glow elements are `aria-hidden="true"`
- Items wrapped in `<ul role="list">` for semantic structure
- `prefers-reduced-motion` fully respected: all animations and line draw disabled, items immediately visible

#### URL Parameters (40+)
- **Targeting:** `sectionIndex`, `sectionId`, `divId`
- **Layout:** `layout`, `offset`
- **Data:** `data`
- **Preset:** `preset` = `default` / `minimal` / `elegant` / `bold` / `dark`
- **Line:** `lineColor`, `lineWidth`, `lineStyle`
- **Dot:** `dotColor`, `dotSize`, `dotBorderColor`
- **Glow:** `glowColor`, `glowSize`
- **Colors:** `bgColor`, `cardBg`, `accentColor`, `textColor`, `yearColor`
- **Card:** `cardRadius`, `cardShadow`, `cardPadding`
- **Typography:** `fontFamily`, `headingSize`, `bodySize`, `yearSize`
- **Spacing:** `itemGap`
- **Animation:** `drawLine`, `scrollSync`, `animationType`, `animationSpeed`
- **Debug:** `debug`

#### Presets
- `default` — warm brown (`#8B7355`), Georgia serif, white cards
- `minimal` — grey line, clean sans-serif, white cards
- `elegant` — gold line (`#C9A96E`), Cormorant Garamond, cream cards
- `bold` — white line, dark cards (`#2a2a2a`), Helvetica Neue
- `dark` — blue glow line (`#4a9eff`), dark-blue cards (`#1a2332`)

#### Files
- `timeline.js` — full unminified source
- `timeline.min.js` — minified production build
- `README.md` — complete documentation
- `CHANGELOG.md` — this file
- `examples/basic.html` — self-contained demo (all three layouts, three presets)

---

[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/timeline-v1.0.0
