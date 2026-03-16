# Logo Reaper Plugin

Animated marquee of company logos that enter from the right. When a logo reaches the trigger position it receives a random **stamp word** + a **particle explosion**, then falls into a dead-logo pile stacked in the left corner of the block. Loops infinitely.

![Version](https://img.shields.io/badge/version-1.3.0-blue)
![License](https://img.shields.io/badge/license-Commercial-red)

---

## ✨ Features

- 🎬 **Continuous logo marquee** – logos scroll right-to-left, infinitely
- 💀 **Death sequence** – stamp overlay + particle burst at trigger position, then falls into pile
- 📦 **Dead-logo pile** – logos stack in the bottom-left corner of the block
- 🖼️ **SVG + raster logos** – use any `<img src="…">` compatible URL
- ↔️ **Constant spacing** – configurable gap between logos; logos never overlap
- 🖱️ **Click-to-kill** – optionally allow clicking a logo to trigger death immediately
- ⏸️ **Pause on hover** – optional; respects `prefers-reduced-motion`
- 🔧 **Zero dependencies** – pure Vanilla JS, compatible with Squarespace 7.0 / 7.1
- 🔐 **Non-blocking licensing** – renders immediately; license checked in background

---

## 🚀 Quick Start

Paste into **Settings → Advanced → Code Injection → Footer** (or any Squarespace code block):

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js?logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%2C%22https%3A%2F%2Fexample.com%2Flogo2.svg%22%5D&height=220&selector=%23logo-section"></script>
```

The `logos` parameter is a **URL-encoded JSON array** of image URLs.

---

## ⚙️ Parameters

All parameters are passed as query-string values on the `<script>` `src` URL.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | string | `body` | CSS selector of the element to mount the plugin into. Use `body` to prepend to `<body>`, or pass a specific selector like `#logos`. |
| `height` | number | `220` | Height of the plugin block in pixels. |
| `logos` | JSON (URL-encoded) | `[]` | Array of logo image URLs. Supports SVG, PNG, WebP, etc. |
| `logoH` | number | `64` | Height of each logo image in pixels. Width is set to `auto` so logos keep their natural proportions. Also accepts legacy `logoSize` for backward compatibility. |
| `speed` | number | `80` | Lane scroll speed in px/s. |
| `spawnEvery` | number | `2000` | Milliseconds between logo spawns. |
| `maxLive` | number | `5` | Maximum number of logos alive in the lane simultaneously. |
| `centerZonePx` | number | `60` | Pixel tolerance around the trigger point that activates the death sequence. |
| `triggerX` | number | `50` | Horizontal trigger position as a **percent of stage width** (default `50` = center). The death sequence fires when a logo's center crosses this point. |
| `words` | string | `REJECTED,DEAD,GONE,REKT,GG,LOSER,CRUSHED,BURIED` | Comma-separated list of stamp words chosen at random on death. |
| `particles` | number | `20` | Number of explosion particles per death. |
| `pileMax` | number | `8` | Maximum dead logos kept in the pile; oldest are removed when cap is reached. |
| `pauseOnHover` | boolean | `true` | Pause the marquee when the mouse is over the plugin block. |
| `bgColor` | color | `f5f5f5` | Background colour of the plugin block. Accepts: bare 6-digit hex (e.g. `1a1a2e`), hex with `#` (e.g. `%231a1a2e`), `transparent`, `rgb(…)`, or `rgba(…)`. |
| `stampColor` | hex | `cc0000` | Colour of the stamp text and border (hex without `#`). |
| `stampEnabled` | boolean | `true` | Show the stamp overlay on death. Set to `false` to disable stamps entirely. |
| `stampX` | number | `50` | Horizontal position of the stamp as a **percent of logo width** (default `50` = center). |
| `stampY` | number | `45` | Vertical position of the stamp as a **percent of logo height** (default `45` = near center). |
| `stampRotate` | number | `-12` | Rotation of the stamp in degrees (negative = counter-clockwise). |
| `stampScale` | number | `1` | Final scale of the stamp after its pop animation. |
| `gapPx` | number | *(see below)* | Minimum edge-to-edge gap (in pixels) between live logos. When set, takes priority over `gapScale`. Logos will never overlap; a new logo only spawns when the rightmost live logo has cleared `stageWidth − gapPx`. |
| `gapScale` | number | `0.35` | Fallback gap expressed as a fraction of `logoH` (e.g. `0.35` → gap = `Math.round(logoH × 0.35)`). Used only when `gapPx` is **not** specified. |
| `clickToKill` | boolean | `false` | When `true`, clicking a live logo immediately triggers the death sequence (stamp + explosion + pile). Automatic trigger-position death remains active regardless of this setting. |
| `debug` | boolean | `false` | Enable debug mode. When `true`: prints `[LogoReaper]` prefixed logs (config, triggerX in px, spawn/death events) and shows a visible red vertical guide line at the `triggerX` position inside the stage. Stays aligned on resize via `ResizeObserver` (with graceful fallback). Has no effect and no overhead when `false`. |

### Encoding the `logos` array

```javascript
const logos = [
  'https://example.com/logo-acme.svg',
  'https://example.com/logo-globex.svg',
];
const param = encodeURIComponent(JSON.stringify(logos));
// Use param as the value of ?logos=
```

---

## 🧩 Examples

### Basic install

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js
  ?selector=%23partner-logos
  &height=200
  &logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%2C%22https%3A%2F%2Fexample.com%2Flogo2.svg%22%5D
  &speed=100
  &words=REJECTED%2CREKT%2CCRUSHED
  &bgColor=111111
  &stampColor=ff3300
"></script>
```

Add `<div id="partner-logos"></div>` wherever you want the block to appear in your Squarespace page.

### Dark background with custom stamp position

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js
  ?selector=%23partner-logos
  &height=240
  &logoH=80
  &bgColor=1a1a2e
  &stampColor=e94560
  &stampX=50
  &stampY=40
  &stampRotate=-15
  &stampScale=1.1
  &logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%5D
"></script>
```

### Transparent background, trigger shifted left, stamps disabled

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js
  ?selector=%23partner-logos
  &height=180
  &bgColor=transparent
  &stampEnabled=false
  &triggerX=40
  &logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%5D
"></script>
```

### RGBA semi-transparent background

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js
  ?selector=%23partner-logos
  &height=220
  &bgColor=rgba(0%2C0%2C0%2C0.5)
  &logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%5D
"></script>
```

### Constant spacing – fixed gap

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js
  ?selector=%23partner-logos
  &height=220
  &logoH=72
  &gapPx=28
  &logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%2C%22https%3A%2F%2Fexample.com%2Flogo2.svg%22%5D
"></script>
```

### Constant spacing – proportional gap

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js
  ?selector=%23partner-logos
  &height=220
  &logoH=72
  &gapScale=0.4
  &logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%2C%22https%3A%2F%2Fexample.com%2Flogo2.svg%22%5D
"></script>
```

### Click-to-kill

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js
  ?selector=%23partner-logos
  &height=220
  &logoH=72
  &gapPx=28
  &clickToKill=true
  &logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%2C%22https%3A%2F%2Fexample.com%2Flogo2.svg%22%5D
"></script>
```

Add `<div id="partner-logos"></div>` and instruct users to click any logo to trigger the death sequence instantly.

---

## 🔌 JavaScript API

```javascript
// Pause the marquee
window.LogoReaper.pause();

// Resume the marquee
window.LogoReaper.resume();

// Remove plugin from DOM and stop all animations
window.LogoReaper.destroy();

// Get plugin version
window.LogoReaper.getVersion(); // '1.3.0'
```

---

## 🔐 Licensing

**Commercial License Required for production use.**

- ✅ Development / localhost: free, full access (license check returns development whitelist)
- ✅ Licensed domain: full features, no watermark
- ⚠️ Unlicensed production domain: reduced limits (`maxLive`, `pileMax`, `particles`) and a small watermark badge inside the plugin block

Licensing is **non-blocking** – the plugin renders immediately and checks the license in the background. If unlicensed, a subtle watermark is injected inside the plugin root (not a modal or page overlay).

[Purchase License →](https://anavotech.com/plugins/logo-reaper)

---

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/clonegarden/squarespaceplugins.git
cd squarespaceplugins

# Install dependencies
npm install

# Build Logo Reaper
npm run build:logo-reaper

# Build all plugins
npm run build:all

# Watch for changes
npm run watch
```

### Project Structure

```
logo-reaper/
├── logo-reaper.js          ← Source code
├── logo-reaper.min.js      ← Minified (auto-generated by build)
├── README.md               ← This file
└── examples/
    └── basic.html          ← Live demo
```

---

## 📊 Browser Support

- ✅ Chrome / Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile (iOS / Android) – touch hover triggers pause on first tap if `pauseOnHover=true`

---

## ♿ Accessibility

The plugin respects the `prefers-reduced-motion` media query:
- Stamp animation is replaced with an instant reveal
- Particle count is reduced
- Pile fall-in animation is skipped

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Issues: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Docs: [Full Documentation](https://anavotech.com/docs/logo-reaper)

---

## 📝 Changelog

### v1.3.0 (2026-03-16)
- ✨ `gapPx` parameter – fixed minimum edge-to-edge gap (px) between live logos; logos never overlap
- ✨ `gapScale` parameter – proportional gap as a fraction of `logoH` (default `0.35`); used when `gapPx` is not set
- ✨ `clickToKill` parameter – when `true`, clicking a live logo immediately triggers the death sequence (stamp + explosion + pile); automatic trigger-position death remains active
- 🐛 Logo widths are updated after image load to ensure accurate gap calculation

### v1.2.0 (2026-03-04)
- ✨ `debug` parameter – enable debug mode via `?debug=true`
  - Prints `[LogoReaper]`-prefixed console logs: parsed config at init, `triggerX` in px, spawn events, and kill/death events
  - Renders a 1px red vertical guide line at the exact `triggerX` pixel position inside the stage
  - Guide line stays aligned on window resize and on container width changes via `ResizeObserver` (graceful fallback if unavailable)
  - No visual or logging overhead when `debug=false` (default)

### v1.1.0 (2026-03-02)
- ✨ `logoH` parameter – controls logo height in pixels; width auto-scales to natural aspect ratio (accepts legacy `logoSize` for backward compatibility)
- ✨ `bgColor` – now accepts `transparent`, bare 6-digit hex, `#`-prefixed hex, `rgb(…)`, and `rgba(…)` (matches other plugins in the repo)
- ✨ `stampEnabled` – disable stamp overlay entirely
- ✨ `stampX` / `stampY` – position stamp as percent of logo dimensions
- ✨ `stampRotate` / `stampScale` – control stamp rotation (degrees) and final scale
- ✨ `triggerX` – move the death-trigger point horizontally as percent of stage width
- ♿ Stamp reduced-motion path uses `stampRotate` / `stampScale` values

### v1.0.0 (2026-02-24)
- ✨ Initial release
- ✅ Continuous marquee lane with configurable speed and spawn rate
- ✅ Center-zone death trigger with stamp + particle explosion
- ✅ Dead-logo pile with stacking/falling animation
- ✅ Pause on hover
- ✅ prefers-reduced-motion support
- ✅ Non-blocking licensing with watermark for unlicensed builds

---

**Made with ❤️ by Anavo Tech**
