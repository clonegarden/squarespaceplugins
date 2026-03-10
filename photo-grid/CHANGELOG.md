# Changelog — Photo Grid

## [1.2.1] - 2026-03-10

### Fixed
- **Video duplication** — Added `getCanonicalBlock()` helper that always resolves any element to its outermost `[data-block-type]` / `.sqs-block` ancestor. All detection passes in `collectMedia()` (image blocks, gallery blocks, video blocks, HLS scan, bare `<video>` scan, bare `<iframe>` scan, and both fallback image passes) now use this helper so `seenBlocks` is keyed on the same DOM node regardless of which inner element triggered detection. Previously the primary video block pass stored the inner `.sqs-native-video` node while the HLS pass stored the outer `.sqs-block` parent, causing `seenBlocks.has()` to miss the duplicate.
- **Source-based dedup safety net** — Added `isDuplicateVideoSrc()` helper that catches duplicates even when block-level deduplication fails (e.g. when `.closest()` resolves to different ancestors in unusual markup). It normalises away trailing `/playlist.m3u8` and trailing slashes before comparing, so two references to the same Squarespace CDN video are always treated as identical. Every `items.push()` for video and iframe items is guarded by this check.
- **`data-config-video` on block element itself** — The video block pass now also checks whether the `block` element itself (not just a descendant) carries the `data-config-video` attribute, covering the case where `.sqs-native-video` is the outermost matched node in the selector.

---

## [1.2.0] - 2026-03-10

### ✨ Added

- **`data-config-video` JSON parsing** — Squarespace 7.1 stores the native video URL inside a JSON blob in the `data-config-video` attribute on `.sqs-native-video` elements (e.g. `{"alexandriaUrl":"https://video.squarespace-cdn.com/.../{variant}",...}`). The plugin now parses this JSON, extracts `alexandriaUrl`, and replaces the `{variant}` placeholder with `playlist.m3u8` to produce a valid HLS URL. This covers the real-world case where the video block is matched but both `data-src` and `data-video-url` are absent.
- **`data-config-thumbnail` poster extraction** — the `data-config-thumbnail` attribute (also JSON) on `.sqs-native-video` elements is parsed to obtain a poster/thumbnail URL for browsers that cannot play HLS natively.
- **Aspect ratio from `data-config-video`** — the `aspectRatio` field in the video JSON is used to compute accurate item dimensions instead of falling back to a fixed 1280×720.
- **Squarespace Native Video (HLS) detection** — new dedicated scan for `video.squarespace-cdn.com` URLs stored in data attributes (`data-src`, `data-video-url`, `data-config-video`) on wrapper elements (`.sqs-native-video[data-config-video]`, `.sqs-video-wrapper`). These videos are never present as a `<video>` element in the DOM at page load time on Squarespace 7.1 sites, so the previous detection logic silently skipped them.
- **HLS video rendering** — HLS videos (`.m3u8`) use native `<video>` playback, which works in Safari. For other browsers that do not support HLS natively, an `error` event listener automatically replaces the `<video>` with the poster image as a visual placeholder.
- **Poster extraction for native videos** — the `getBestImageSrc()` helper is used to capture the poster/thumbnail `<img>` from native video wrappers, providing a visual placeholder in the grid across all browsers.
- **Automatic `playlist.m3u8` suffix** — when a Squarespace CDN base URL is detected without the required HLS playlist suffix, `playlist.m3u8` is appended automatically so the URL is immediately playable.

---

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

[1.2.1]: https://github.com/clonegarden/squarespaceplugins/releases/tag/photo-grid-v1.2.1
[1.2.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/photo-grid-v1.2.0
[1.1.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/photo-grid-v1.1.0
[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/photo-grid-v1.0.0
