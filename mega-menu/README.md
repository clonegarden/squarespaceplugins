# Mega Menu v1.0.0

Full-width mega menu dropdown for Squarespace. Steals a native page section and transforms it into a header-triggered panel. Supports hover/click triggers, 5 animation modes, 4 presets, and full appearance control.

## 🚀 How It Works

1. **Build your content** — Design the mega menu layout as a normal Squarespace page section (columns, images, buttons, text blocks — anything the editor supports)
2. **Find the section ID** — Open the page in the Squarespace editor, right-click your section, and select *Inspect* to find `data-section-id="..."` on the `<section>` tag
3. **Paste in Code Injection** — Add the script tag to **Settings → Advanced → Code Injection → Footer** with your section ID
4. **Done** — The plugin hides the original section, injects a trigger link into your header nav, and shows it as a dropdown on hover or click

---

## 📦 Installation

Paste in **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mega-menu/mega-menu.min.js?sectionId=YOUR_SECTION_ID&triggerLabel=Services"></script>
```

---

## ⚡ Quick-Start Presets

### Default (white, shadow, slideDown)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mega-menu/mega-menu.min.js?sectionId=YOUR_ID&triggerLabel=Services"></script>
```

### Minimal (no shadow, no border, fadeIn, transparent overlay)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mega-menu/mega-menu.min.js?preset=minimal&sectionId=YOUR_ID&triggerLabel=Services"></script>
```

### Dark (dark background, light text)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mega-menu/mega-menu.min.js?preset=dark&sectionId=YOUR_ID&triggerLabel=Services"></script>
```

### Glassmorphism (semi-transparent, backdrop blur, fadeIn)
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mega-menu/mega-menu.min.js?preset=glassmorphism&sectionId=YOUR_ID&triggerLabel=Services"></script>
```

---

## 🎯 Targeting Modes

Choose **one** targeting parameter to tell the plugin which section to steal.

### By Section ID (Recommended)

Find `data-section-id` on your section element in browser DevTools:

```html
<script src="...mega-menu.min.js?sectionId=5f3a2b1c0d9e8f7a6b5c4d3e&triggerLabel=Services"></script>
```

### By Section Index (1-based)

Targets the Nth page section on the page:

```html
<!-- Steal the 3rd section on the page -->
<script src="...mega-menu.min.js?sectionIndex=3&triggerLabel=Products"></script>
```

### By Div ID

Targets a `<div id="...">` (or any element with that ID) and walks up to its parent section:

```html
<!-- A Code Block on your page has id="mega-services" -->
<script src="...mega-menu.min.js?divId=mega-services&triggerLabel=Services"></script>
```

---

## ⚙️ All Parameters

All parameters are appended as URL query strings to the script `src`.

### Targeting (choose one)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `sectionId` | — | Target by Squarespace `data-section-id` attribute |
| `sectionIndex` | — | Target the Nth page section (1-based) |
| `divId` | — | Target a `<div>` by id; walks up to parent section |

### Trigger

| Parameter | Default | Description |
|-----------|---------|-------------|
| `triggerLabel` | `Menu` | Text of the nav link that opens the mega menu |
| `triggerPosition` | `auto` | `auto` (replace matching nav link), `first`, `last`, `index:N` |
| `triggerIcon` | `▾` | Icon appended after the trigger label |

### Animation

| Parameter | Default | Description |
|-----------|---------|-------------|
| `animation` | `slideDown` | `slideDown`, `fadeIn`, `scaleY`, `clipReveal`, `none` |
| `animationDuration` | `350` | Duration in ms |
| `animationEasing` | `cubic-bezier(0.4, 0, 0.2, 1)` | CSS easing function |

### Appearance

| Parameter | Default | Description |
|-----------|---------|-------------|
| `bgColor` | `#ffffff` | Panel background color |
| `fontColor` | `#111111` | Panel text color |
| `overlayColor` | `rgba(0,0,0,0.35)` | Overlay color behind panel |
| `maxWidth` | `1400px` | Max width of the inner content container |
| `paddingX` | `40px` | Horizontal padding inside panel |
| `paddingY` | `40px` | Vertical padding inside panel |
| `borderBottom` | `1` | Border width below panel (px); `0` to disable |
| `borderColor` | `#e0e0e0` | Border color |
| `shadow` | `true` | Show box-shadow on panel |
| `blur` | `false` | Backdrop-filter blur on overlay |
| `zIndex` | `99998` | z-index of the mega menu layer |

### Behavior

| Parameter | Default | Description |
|-----------|---------|-------------|
| `trigger` | `hover` | `hover` or `click` |
| `closeOnOutsideClick` | `true` | Close when clicking outside the panel |
| `closeOnEsc` | `true` | Close on Escape key |
| `closeButton` | `true` | Show ✕ close button inside panel |
| `hoverDelay` | `200` | Delay before opening on hover (ms) |
| `hoverOutDelay` | `400` | Delay before closing on hover-out (ms) |
| `stickyAware` | `true` | Reposition panel below sticky header on scroll |
| `mobileBreakpoint` | `768` | Below this width the mega menu is disabled |

### General

| Parameter | Default | Description |
|-----------|---------|-------------|
| `preset` | `default` | `default`, `minimal`, `dark`, `glassmorphism` |
| `debug` | `false` | Verbose console logging |

---

## 💡 Examples

### Replace an existing "Services" nav link
```html
<script src="...mega-menu.min.js?sectionId=abc123&triggerLabel=Services&triggerPosition=auto"></script>
```

### Click-to-open, dark preset
```html
<script src="...mega-menu.min.js?preset=dark&sectionId=abc123&triggerLabel=Products&trigger=click&triggerPosition=first"></script>
```

### Glassmorphism with clip reveal animation
```html
<script src="...mega-menu.min.js?preset=glassmorphism&sectionId=abc123&triggerLabel=About&animation=clipReveal"></script>
```

### Insert as first nav item
```html
<script src="...mega-menu.min.js?sectionId=abc123&triggerLabel=Explore&triggerPosition=first"></script>
```

### Debug mode (shows verbose console logging)
```html
<script src="...mega-menu.min.js?sectionId=abc123&triggerLabel=Services&debug=true"></script>
```

---

## 🎬 Animation Modes

| Mode | Description |
|------|-------------|
| `slideDown` | Panel slides down from above while fading in (default) |
| `fadeIn` | Panel fades in without movement |
| `scaleY` | Panel scales vertically from the top edge |
| `clipReveal` | Panel reveals with a clip-path wipe from top to bottom |
| `none` | Instant show/hide with no animation |

> All animations are disabled automatically when the user has `prefers-reduced-motion` enabled.

---

## 📱 Mobile Behavior

Below `mobileBreakpoint` (default `768px`):
- The mega menu panel and overlay are hidden with `display: none !important`
- The trigger icon (▾) is hidden
- The native Squarespace burger menu is preserved and unaffected

To change the breakpoint:
```html
<script src="...mega-menu.min.js?sectionId=abc123&triggerLabel=Services&mobileBreakpoint=900"></script>
```

---

## 🔐 Licensing

This plugin requires an active Anavo Tech license.

1. **Purchase** a license at [anavo.tech/plugins](https://anavo.tech/plugins)
2. **Register** your Squarespace domain
3. **Install** using the provided code snippet

Licensed domains get full functionality. Unlicensed installs display a small watermark. Development on `localhost` always works without a license.

---

## 🛠️ Troubleshooting

**The mega menu trigger doesn't appear in my nav**
- Check that `triggerLabel` matches an existing nav item (case-insensitive) when using `triggerPosition=auto`
- Try `triggerPosition=last` to force-append the trigger
- Enable `debug=true` and check the browser console for messages

**My section content looks broken inside the panel**
- The plugin copies the section's `innerHTML`. If your section relies on Squarespace JavaScript hooks (e.g. image lazy-loading), those may not reinitialize. Try using standard `<img>` tags instead of lazy-loaded blocks.
- Enable `debug=true` to see if the section was found and stolen successfully

**The panel opens behind my header**
- Increase `zIndex` (default `99998`): `?zIndex=999999`
- Check if your header has a custom z-index set via CSS

**The panel doesn't position correctly below a sticky header**
- Ensure `stickyAware=true` (default)
- If your header uses JavaScript-based sticky behavior, the repositioning on scroll should handle it automatically

**The mega menu shows on mobile**
- Adjust `mobileBreakpoint` to match your site's breakpoint: `?mobileBreakpoint=900`

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Docs: [anavo.tech/plugins](https://anavo.tech/plugins)
