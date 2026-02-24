# Logo Reaper Plugin

Animated marquee of company logos that enter from the right. When a logo reaches the center of the block it receives a random **stamp word** + a **particle explosion**, then falls into a dead-logo pile stacked in the left corner of the block. Loops infinitely.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Commercial-red)

---

## ✨ Features

- 🎬 **Continuous logo marquee** – logos scroll right-to-left, infinitely
- 💀 **Death sequence** – stamp overlay + particle burst at center, then falls into pile
- 📦 **Dead-logo pile** – logos stack in the bottom-left corner of the block
- 🖼️ **SVG + raster logos** – use any `<img src="…">` compatible URL
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
| `logoSize` | number | `64` | Width and height of each logo image in pixels. |
| `speed` | number | `80` | Lane scroll speed in px/s. |
| `spawnEvery` | number | `2000` | Milliseconds between logo spawns. |
| `maxLive` | number | `5` | Maximum number of logos alive in the lane simultaneously. |
| `centerZonePx` | number | `60` | Pixel tolerance around the stage center that triggers the death sequence. |
| `words` | string | `REJECTED,DEAD,GONE,REKT,GG,LOSER,CRUSHED,BURIED` | Comma-separated list of stamp words chosen at random on death. |
| `particles` | number | `20` | Number of explosion particles per death. |
| `pileMax` | number | `8` | Maximum dead logos kept in the pile; oldest are removed when cap is reached. |
| `pauseOnHover` | boolean | `true` | Pause the marquee when the mouse is over the plugin block. |
| `bgColor` | hex | `f5f5f5` | Background colour of the plugin block (hex without `#`). |
| `stampColor` | hex | `cc0000` | Colour of the stamp text and border (hex without `#`). |

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

## 🧩 Example

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
window.LogoReaper.getVersion(); // '1.0.0'
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
