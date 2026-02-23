# Header Pro v1.0.0

A Squarekicker-inspired header enhancement plugin for Squarespace 7.1 (best-effort 7.0 compatibility). Skins and enhances the **native** Squarespace header without replacing it — preserving the mobile burger menu, editor mode, and all native behaviour.

## 🚀 Installation

Paste in **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js"></script>
```

No custom HTML injection required. The plugin finds your existing header automatically.

---

## ⚡ Quick-Start Presets

### Minimal (clean & transparent)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?preset=minimal"></script>
```

### Glassy (frosted glass + animated blue line)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?preset=glassy&ctaEnabled=true&ctaText=Get+Started&ctaUrl=/contact"></script>
```

### Tech (dark + electric blue + glitch hover effect)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?preset=tech&ctaEnabled=true&ctaText=Book+a+Call&ctaUrl=/book"></script>
```

---

## ⚙️ All Parameters

All parameters are appended as URL query strings to the script `src`.

### General

| Parameter | Default | Description |
|-----------|---------|-------------|
| `preset` | `default` | Base preset: `default`, `minimal`, `glassy`, `tech` |
| `debug` | `false` | Enable verbose console logging |
| `zIndex` | `9999` | CSS z-index for the header |
| `injectFontSmoothing` | `true` | Inject `-webkit-font-smoothing: antialiased` |

### Layout

| Parameter | Default | Description |
|-----------|---------|-------------|
| `containerMaxWidth` | `1280px` | Max width of the header inner container |
| `paddingX` | `32px` | Horizontal padding |
| `paddingY` | `14px` | Vertical padding |
| `itemGap` | `32px` | Gap between nav items |

### Background

| Parameter | Default | Description |
|-----------|---------|-------------|
| `bgMode` | `transparent` | `transparent`, `solid`, or `blur` |
| `bgColor` | `#ffffff` | Background color (used in `solid`/`blur` modes) |
| `bgOpacity` | `1` | Opacity multiplier (0–1) |
| `blurPx` | `12` | Blur radius in pixels (for `blur` mode) |

### Border

| Parameter | Default | Description |
|-----------|---------|-------------|
| `borderMode` | `none` | `none`, `bottom`, `top-bottom`, or `all` |
| `borderColor` | `rgba(0,0,0,0.1)` | Border color |
| `borderWidth` | `1px` | Border width |
| `radius` | `0px` | Border radius |

### Typography

| Parameter | Default | Description |
|-----------|---------|-------------|
| `navFontSize` | _(inherit)_ | Font size (e.g. `15px`) |
| `navLetterSpacing` | _(inherit)_ | Letter spacing (e.g. `0.05em`) |
| `navTransform` | `none` | Text transform: `none`, `uppercase`, `lowercase`, `capitalize` |
| `navHoverOpacity` | `0.65` | Link opacity on hover (0–1) |

### CTA Button

| Parameter | Default | Description |
|-----------|---------|-------------|
| `ctaEnabled` | `false` | Show the CTA button |
| `ctaText` | `Get Started` | Button label |
| `ctaUrl` | `/contact` | Button href |
| `ctaTarget` | `_self` | Link target (`_self` or `_blank`) |
| `ctaStyle` | `solid` | Button style: `underline`, `pill`, `outline`, `solid` |
| `ctaBg` | `#000000` | Button background color |
| `ctaColor` | `#ffffff` | Button text color |
| `ctaBorderColor` | `#000000` | Button border color (used in `outline` style) |

> **Note:** CTA is visible on desktop and automatically hidden on mobile (< 768 px) to avoid breaking the burger menu.

### Sticky & Auto-Hide Behavior

| Parameter | Default | Description |
|-----------|---------|-------------|
| `sticky` | `true` | Make header sticky (`position: sticky`) |
| `stickyTop` | `0px` | Top offset when sticky |
| `scrollShadow` | `false` | Add box-shadow when page is scrolled |
| `shadowStrength` | `0.1` | Shadow opacity (0–1) |
| `autoHide` | `false` | Hide header on scroll down, reveal on scroll up |
| `autoHideThreshold` | `5` | Minimum scroll delta (px) to trigger hide/show |
| `revealOnTop` | `true` | Always show header when scrolled to the very top |

### Effects

| Parameter | Values | Description |
|-----------|--------|-------------|
| `effect` | `none` _(default)_, `glassyBlueLine`, `glitchy` | Visual effect |

- **`glassyBlueLine`** — animated gradient line accent along the bottom edge (CSS only, GPU-accelerated).
- **`glitchy`** — subtle glitch effect triggered on nav-link hover (lightweight CSS animation, hover-only).
- Both effects are automatically disabled when `prefers-reduced-motion: reduce` is detected.

### Dropdowns

| Parameter | Default | Description |
|-----------|---------|-------------|
| `dropdownMode` | `native` | `native` (do nothing), `list`, or `mega` |
| `dropdownTrigger` | `hover` | `hover` or `click` |
| `dropdownWidth` | `220px` | Min-width of dropdown panel |
| `dropdownColumns` | `3` | Grid columns for `mega` mode |
| `dropdownGap` | `12px` | Grid gap for `mega` mode |
| `dropdownBg` | `#ffffff` | Dropdown background color |
| `dropdownText` | `#111111` | Dropdown text color |
| `dropdownRadius` | `8px` | Dropdown border radius |
| `dropdownShadow` | `0 4px 24px rgba(0,0,0,0.12)` | Dropdown box-shadow |

> **Note:** Custom dropdown overlays are automatically disabled on mobile (< 768 px) to preserve the native burger menu.

---

## 💡 Examples

### Basic — no parameters
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js"></script>
```

### Solid white background + scroll shadow + auto-hide
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?bgMode=solid&bgColor=ffffff&scrollShadow=true&autoHide=true"></script>
```

### Glassmorphism header with pill CTA
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?bgMode=blur&bgColor=rgba(255,255,255,0.7)&blurPx=16&borderMode=bottom&ctaEnabled=true&ctaStyle=pill&ctaBg=3b82f6&ctaColor=ffffff&ctaText=Book+Now&ctaUrl=/book"></script>
```

### Tech dark header with mega dropdowns
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?preset=tech&dropdownMode=mega&dropdownColumns=4&dropdownTrigger=hover"></script>
```

### Debug mode (shows console logs)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?debug=true"></script>
```

---

## 🎨 Live Demo

See [examples/basic.html](examples/basic.html) for a self-contained demo that simulates a Squarespace page context.

---

## 🔐 Licensing

This is a **commercially licensed** plugin. Purchase a license at [anavo.tech/plugins](https://anavo.tech/plugins).

- ✅ Licensed domains: full functionality
- ❌ Unlicensed domains: watermark is shown
- 🔧 `localhost` and staging: always works for development

Licensing is **fully async and non-blocking** — styles are applied immediately; the license check happens in the background.

---

## 🆘 Troubleshooting

**Q: The header doesn't seem to change.**
A: Enable debug mode (`?debug=true`) and check the browser console. The plugin should print `✅ Header Pro v1.0.0 Active!`. Also verify you pasted the script in the **Footer** injection area.

**Q: CTA button doesn't appear.**
A: Make sure `ctaEnabled=true` is set. The CTA is hidden on mobile by default — check on a desktop viewport.

**Q: Dropdown enhancement isn't working.**
A: The plugin detects native Squarespace folder items. If your nav doesn't contain folders, dropdown enhancement is silently skipped. Check the console with `debug=true`.

**Q: The animated effects are not playing.**
A: Your browser or OS may have `prefers-reduced-motion` enabled. The plugin respects this setting and disables animations automatically.

**Q: Works on 7.1 but not 7.0?**
A: Squarespace 7.0 themes use different header selectors. The plugin tries multiple selectors (`#header`, `header`, `.Header`, `[data-nc-group="header"]`) for best-effort compatibility. If your 7.0 theme uses a very custom header structure, you may need to add a CSS override.

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)

---

**Made with ❤️ by Anavo Tech**
