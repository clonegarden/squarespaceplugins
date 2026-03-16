# Photo Grid v1.4.0

A Squarespace plugin that builds an **auto-calculated justified collage grid** from all Image, Gallery, and Video blocks inside a target section. Features edit-mode UI controls, masonry layout, custom ordering, and responsive design.

## 🚀 Installation

Paste in **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js"></script>
```

No other setup required. Add a section heading titled **"Photo Album"** (exact text, case-insensitive) to the page and fill it with Image, Gallery, or Video blocks — the plugin finds and converts them automatically.

---

## ⚡ Quick-Start

### Default justified grid (auto-detected "Photo Album" section)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js"></script>
```

### Premade preset — Classic
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?premadegrid=1"></script>
```

### Masonry layout, 3 columns, 8 px gutter
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?layout=masonry&columns=3&gutter=8"></script>
```

### Custom item order (0-based indices)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?order=0,3,2,1"></script>
```

### Preset + custom order
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?premadegrid=2&order=0,3,1,4"></script>
```

### Override the width of specific items (height scales proportionally)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?itemWidths=0:600,3:400"></script>
```

### Force specific items to display full / no-crop (contain mode)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?itemContain=0,2,5"></script>
```

### Combined: premade preset + custom order + width override + contain mode
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?premadegrid=1&order=2,0,3,1,4&itemWidths=0:600&itemContain=3,4"></script>
```

---

## ⚙️ All Parameters

All parameters are appended as URL query strings to the script `src`.

### Target Section

| Parameter | Default | Description |
|-----------|---------|-------------|
| _(auto)_ | — | Any section containing a heading with text **"Photo Album"** (priority 1) |
| `targetId` | `photogrid` | ID of a fallback element when no "Photo Album" heading exists (priority 2) |
| `targetTag` | `div` | Element tag name for index-based fallback (priority 3) |
| `targetIndex` | `1` | 1-based index of the element matched by `targetTag` (priority 3) |

### Layout

| Parameter | Default | Description |
|-----------|---------|-------------|
| `layout` | `justified` | Grid layout: `justified` (collage) or `masonry` |
| `uneven` | `false` | Shorthand to enable masonry (`true` = masonry) |
| `rowHeight` | `300` | Target row height in pixels (justified mode) |
| `minRowHeight` | `100` | Minimum row height in pixels (justified mode) |
| `maxRowHeight` | `600` | Maximum row height in pixels (justified mode) |
| `gutter` | `4` | Gap between grid items in pixels |
| `columns` | `3` | Number of columns (masonry mode only) |

### Ordering

| Parameter | Default | Description |
|-----------|---------|-------------|
| `order` | _(natural)_ | Comma-separated 0-based indices to reorder **all** items (images, videos, iframes), e.g. `order=0,3,2,1`. Videos and iframes receive sequential indices after images. |
| `premadegrid` | — | Number 1–5: load a premade preset (see table below) |
| `itemWidths` | — | Per-item width overrides: `index:widthPx` pairs separated by commas, e.g. `itemWidths=0:600,3:400`. Height adjusts proportionally from the item's native aspect ratio. |
| `itemContain` | — | Comma-separated indices to display in full without cropping, e.g. `itemContain=0,2,5`. Uses `object-fit: contain` instead of `cover` (letterboxed with black background). |

### Premade Grid Presets

| Number | Name | Row Height | Gutter | Layout |
|--------|------|-----------|--------|--------|
| `1` | Classic | 300 px | 4 px | justified |
| `2` | Compact | 200 px | 2 px | justified |
| `3` | Wide | 420 px | 8 px | justified |
| `4` | Masonry | 280 px | 6 px | masonry (3 cols) |
| `5` | Tight | 180 px | 1 px | justified |

### Debug

| Parameter | Default | Description |
|-----------|---------|-------------|
| `debug` | `false` | Print verbose logs to the browser console |

---

## 🎯 How It Works

1. **Section detection** — The plugin searches for a section containing a heading with the text "Photo Album" (exact match, case-insensitive). If none is found it looks for `div#photogrid`, then falls back to URL params.
2. **Media collection** — All **Image blocks**, **Gallery blocks**, and **Video blocks** inside the section are collected. Native image dimensions (from Squarespace `data-image-width` / `data-image-height`) are used for perfect aspect-ratio-based layout.
3. **DOM cleanup** — The original blocks are removed from the DOM and replaced with the Photo Grid container.
4. **Grid rendering** — Items are arranged in justified rows (fixed height, variable widths) or masonry columns. Images are cropped with `object-fit: cover` — never upscaled.
5. **Responsive** — The grid re-renders on window resize.
6. **Edit mode** — A floating UI panel appears in Squarespace edit mode with preset buttons, shuffle/reset controls, and a copyable script URL. The panel also includes:
   - **▬ Minimize** — collapses the panel into a small 🖼️ floating icon near the Squarespace desktop/mobile view toggle buttons. Click the icon to restore the full panel.
   - **🔌 Toggle Plugin Off** — hides the grid and restores the original Squarespace blocks so you can add or remove images and videos using the native editor. Click **⚡ Turn Plugin On** to re-collect media (picking up any changes you made) and re-render the grid.

---

## 🛠️ Edit-Mode Features

When viewed inside the Squarespace editor, a floating **Photo Grid** panel appears in the bottom-right corner.

### ▬ Minimize
Click the minimize button (▬) in the panel header to collapse the panel into a small 🖼️ icon fixed near the Squarespace desktop/mobile view toggle buttons (top-right area). Click the icon at any time to restore the full panel. This keeps your workspace uncluttered while still letting you quickly reopen the editor.

### 🔌 Toggle Plugin Off / ⚡ Turn Plugin On
Use this button to temporarily disable the Photo Grid plugin while staying in Squarespace edit mode:

1. **Click "🔌 Toggle Plugin Off"** — the grid is hidden and the original Squarespace blocks are restored in their native form. You can now use the Squarespace editor normally to add, remove, or rearrange images and videos in the section. All other panel controls are disabled while the plugin is off.
2. **Click "⚡ Turn Plugin On"** — the plugin re-scans the section for media (picking up any blocks you added or removed), rebuilds the grid with the updated items, and re-enables all panel controls.

> **Note:** When you toggle the plugin back on, the new set of images/videos is used to re-render the grid. Use the Preset buttons, Shuffle, Reset, and Copy Script URL to finalize your layout.

---



### Full-width collage, 6 px gutter, taller rows
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?rowHeight=380&gutter=6"></script>
```

### Masonry, 4 columns, no gutter
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?layout=masonry&columns=4&gutter=0"></script>
```

### Target a specific section by ID
```html
<!-- Add id="my-gallery" to a Code Block in your section -->
<div id="my-gallery"></div>
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?targetId=my-gallery"></script>
```

### Debug mode
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js?debug=true"></script>
```

---

## 🖼️ Live Demo

See [examples/basic.html](examples/basic.html) for a self-contained demo with simulated Squarespace blocks.

---

## 🔐 Licensing

This is a **commercially licensed** plugin. Purchase a license at [anavo.tech/plugins](https://anavo.tech/plugins).

- ✅ Licensed domains: full functionality
- ❌ Unlicensed domains: a small watermark is shown in the grid
- 🔧 `localhost` and staging: always works for development

Licensing is **fully async and non-blocking** — the grid renders immediately; the license check runs in the background.

---

## 🆘 Troubleshooting

**Q: The grid doesn't appear.**  
A: Enable debug mode (`?debug=true`) and check the browser console. Ensure your section has a heading with the exact text "Photo Album" (or use `targetId`). The plugin should print `✅ Photo Grid v1.4.0 Active!`.

**Q: Images appear stretched or cropped unexpectedly.**  
A: The plugin uses `object-fit: cover` to fill each cell. The `rowHeight` / `maxRowHeight` params control how tall rows are — adjust them to your preference.

**Q: Videos don't autoplay.**  
A: Browsers require videos to be `muted` before autoplay is permitted. The plugin sets `autoplay muted loop playsinline` automatically. If videos still don't play, your browser may have stricter autoplay policies.

**Q: The edit-mode panel doesn't appear.**  
A: The panel only shows when Squarespace edit mode is detected (body class `sqs-edit-mode`, URL containing `/config`, or the page is inside an iframe). Make sure you're viewing the page inside the Squarespace editor.

**Q: Works on 7.1 but not 7.0?**  
A: Squarespace 7.0 uses slightly different block class names. The plugin tries multiple selectors (`.sqs-block-image`, `[data-block-type="5"]`, `.image-block`, etc.) for compatibility. If blocks are still not found, use `debug=true` and open the console to inspect which selectors your theme uses.

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)

---

**Made with ❤️ by Anavo Tech**
