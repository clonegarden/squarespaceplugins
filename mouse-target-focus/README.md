# 🎯 Mouse Target Focus

Adds a stylish, accessible cursor-following **target overlay** to any Squarespace site. The target pulses and reacts when hovering over links, buttons, and other interactive elements — great for presentations, accessibility demos, and interactive experiences.

---

## 🚀 Installation

**Settings → Advanced → Code Injection → Footer**

```html
<!-- Default circle, teal stroke -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mouse-target-focus/mouse-target-focus.min.js"></script>
```

Version-pinned (recommended for production):
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@1.0.0/mouse-target-focus/mouse-target-focus.min.js"></script>
```

---

## ✨ Quick-Start Examples

### Teal circle (default)
```html
<script src="...mouse-target-focus.min.js"></script>
```

### Filled circle, coral color
```html
<script src="...mouse-target-focus.min.js?shape=circle-fill&strokeColor=ff6b6b&fillColor=ff6b6b&fillOpacity=0.15"></script>
```

### Square, white outline
```html
<script src="...mouse-target-focus.min.js?shape=square&strokeColor=ffffff&size=40"></script>
```

### Crosshair, large
```html
<script src="...mouse-target-focus.min.js?shape=crosshair&size=64&strokeColor=ff0000&strokeWidth=1"></script>
```

### Star with glow-pulse on hover, orange
```html
<script src="...mouse-target-focus.min.js?shape=star&strokeColor=ff9900&fillColor=ff9900&fillOpacity=0.2&pulseScale=1.2"></script>
```

### With keyboard toggle (Alt+T to show/hide)
```html
<script src="...mouse-target-focus.min.js?toggleKey=t&toggleMod=alt"></script>
```

---

## 📋 Full Parameter Reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| `enabled` | `true` | Set to `false` to start disabled |
| `shape` | `circle` | Shape: `circle` \| `circle-fill` \| `square` \| `crosshair` \| `star` |
| `size` | `48` | Target size in px |
| `strokeWidth` | `2` | Outline thickness in px |
| `strokeColor` | `00ffcc` | Outline color (hex without `#`, or full hex like `%2300ffcc`) |
| `fillColor` | `00ffcc` | Fill color for `circle-fill` and `star` shapes |
| `fillOpacity` | `0.08` | Fill opacity (0–1) for `circle-fill` / `star` |
| `zIndex` | `999999` | CSS z-index for the overlay |
| `followLag` | `0.15` | Smoothing factor (0 = instant, closer to 1 = more lag) |
| `pulseOnHover` | `true` | Pulse when hovering interactive elements |
| `pulseScale` | `1.15` | Scale multiplier for pulse animation |
| `pulseDuration` | `260` | Pulse animation duration in ms |
| `hoverStrokeColor` | *(empty)* | Stroke color override on hover |
| `hoverFillOpacity` | *(empty)* | Fill opacity override on hover |
| `toggleKey` | *(empty)* | Key to toggle visibility (e.g. `t`) |
| `toggleMod` | `alt` | Modifier for toggle key: `alt` \| `ctrl` \| `shift` \| `meta` \| `none` |
| `forceMobile` | `false` | Enable on touch/coarse-pointer devices |
| `debug` | `false` | Enable verbose console logging |

---

## ⚙️ How It Works

1. The script reads its own `src` URL for configuration parameters.
2. A `fixed`-position `div#anavo-mouse-target-focus` is inserted at the end of `<body>`.
3. `mousemove` events feed into a `requestAnimationFrame` loop that **lerp-smooths** the target position toward the real cursor using the `followLag` factor.
4. `mouseover` / `mouseout` events detect when the cursor enters a **clickable element** (`a[href]`, `button`, `[role=button]`, `cursor: pointer`, and Squarespace-specific selectors).
5. On hover-enter, a CSS scale transform and optional ripple ring animation fires. On hover-exit, it returns to resting state.
6. Licensing is loaded asynchronously (1.5 s delay) and is non-blocking.

---

## ♿ Accessibility & Compatibility

- The overlay element carries `aria-hidden="true"` and `role="presentation"` — screen readers ignore it.
- `pointer-events: none` ensures the overlay **never blocks clicks, links, or form inputs**.
- `prefers-reduced-motion: reduce` is fully respected: pulse and ripple animations are disabled automatically.
- Touch/coarse-pointer devices are skipped by default (use `?forceMobile=true` to override).
- Safe to run multiple times (idempotent): duplicate DOM nodes and style tags are never created.
- Does not affect text selection, scrolling, or Squarespace editing UI.

---

## 🔧 Troubleshooting

**Q: The target disappears behind the site header**  
Increase `?zIndex=9999999` to a higher value.

**Q: The target feels laggy or floaty**  
Decrease `?followLag=0.05` (closer to 0 = snappier).

**Q: The target is too large / small**  
Adjust `?size=32` (or any px value).

**Q: No pulse on hover**  
Verify `?pulseOnHover=true` (default). Enable `?debug=true` to see hover detection in the console.

**Q: I want to hide it programmatically**  
The container element is `document.getElementById('anavo-mouse-target-focus')`. Set its `style.display = 'none'` or use the `?toggleKey` parameter.

**Q: Not showing on my touch-screen device**  
Touch / coarse-pointer devices are skipped by default. Add `?forceMobile=true` to force-enable.

---

## 🌐 Browser Support

- Chrome 80+
- Firefox 78+
- Safari 13.1+
- Edge 80+

---

## 🔐 Licensing

This plugin requires a valid Anavo Tech license for use on production domains.

- **Trial / Development:** Works on `localhost` and `127.0.0.1` without a license
- **Production:** Purchase a license at [anavo.tech/plugins](https://anavo.tech/plugins)

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Knowledge Base: [anavo.tech](https://anavo.tech)
