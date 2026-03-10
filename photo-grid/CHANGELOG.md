# Changelog — Photo Grid

## [1.1.0] - 2026-03-10

### 🐛 Fixed

- **Video capture in mixed sections** — bare `<video>` and `<iframe>` fallback scanning now always runs after the primary block-type detection pass, regardless of whether images were already found. Previously, the fallback was gated behind `items.length === 0`, so videos were silently dropped in sections that also contained images.
- **Newer Squarespace video block selectors** — added `[data-block-type="54"]`, `[data-block-type="55"]`, `.sqs-block-video-native`, and `.sqs-video-wrapper` to the primary video block selector to cover newer Squarespace native video markup.
- **Native video with empty `src`** — Squarespace native videos (`sqs-native-video`) often have no `src` at collection time (the source is injected later via intersection observer). The plugin now collects these items using the `poster` attribute as a visual placeholder instead of silently discarding them.
- **`poster` attribute on rendered videos** — the collected `poster` value is now applied to the `<video>` element in `buildItemElement()`, so users see a thumbnail before the video loads or begins playing.

---

## [1.0.0] - 2026-03-04

### ✨ Added

- **Justified collage grid** — fixed row height, variable item widths; scales rows to fill container width exactly
- **Masonry layout** — column-based layout via `layout=masonry` or `uneven=true`; shortest-column placement
- **Target section detection** — priority order: (1) section with heading "Photo Album", (2) `div#photogrid`, (3) `targetTag` + `targetIndex` URL params
- **Media sourcing** — collects all **Image blocks** (`data-block-type="5"`), **Gallery blocks** (`data-block-type="25"`), and **Video blocks** (`data-block-type="32"`) from the target section
- **Squarespace dimension data** — reads `data-image-width` / `data-image-height` for accurate aspect ratios before images load
- **DOM cleanup** — original blocks removed; replaced by a single `.anavo-pg-container` element
- **Videos** — HTML5 video: `autoplay muted loop playsinline`; iframe embeds (YouTube/Vimeo) receive autoplay query params automatically
- **Layout parameters:** `rowHeight`, `minRowHeight`, `maxRowHeight`, `gutter`, `layout`, `uneven`, `columns`
- **Premade presets** (1–5): Classic, Compact, Wide, Masonry, Tight — via `premadegrid=<n>`
- **Custom order** — reorder items with `order=0,3,2,1` (0-based indices)
- **Responsive** — grid re-renders on `window.resize` (debounced 150 ms)
- **Edit-mode UI panel** — floating panel in Squarespace edit mode with:
  - Preset buttons (Classic / Compact / Wide / Masonry / Tight)
  - Shuffle and Reset order buttons
  - Copyable script URL that reproduces the current layout
- **Licensing** — async, non-blocking via `_shared/licensing.min.js`; watermark shown on unlicensed domains
- **Accessibility** — `prefers-reduced-motion` respected; hover scale transitions and backdrop-filter disabled when enabled
- **`debug` param** — verbose console logging for troubleshooting
- **Public API** — `window.PhotoGrid.refresh()` and `window.PhotoGrid.getVersion()`
- **Compatibility** — Squarespace 7.1 primary; best-effort 7.0 via multi-selector block detection

---

[1.1.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/photo-grid-v1.1.0
[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/photo-grid-v1.0.0
