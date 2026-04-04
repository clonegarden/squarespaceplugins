# ✍️ Handwriting Text SVG

Animate your text as an inline SVG with a "handwriting reveal" effect — it looks like an invisible pen writes the text in real time.

## 🚀 Installation

Paste in **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/handwriting-text-svg/handwriting-text-svg.min.js?text=Hello%20World"></script>
```

No extra HTML required. The plugin inserts itself automatically at the position you configure.

---

## 🎨 Presets

Two built-in visual styles are available via the `preset` parameter:

| Preset | Stroke Width | Style |
|--------|-------------|-------|
| `ink` (default) | 2px | Thin line with subtle ink-texture filter — feels like a fine pen or fountain ink |
| `marker` | 6px | Thick, bold stroke — feels like a broad marker or brush |

```html
<!-- Fine ink style -->
<script src="...handwriting-text-svg.min.js?text=Hello&preset=ink"></script>

<!-- Thick marker style -->
<script src="...handwriting-text-svg.min.js?text=Hello&preset=marker"></script>
```

---

## ⚙️ Parameters

All configuration is done via URL query parameters on the `<script>` `src`.

### Targeting

| Parameter | Default | Description |
|-----------|---------|-------------|
| `position` | `first-section` | Where to insert: `first-section` \| `after-header` \| `before-footer` |
| `targetId` | — | ID of a custom HTML element to insert into (overrides `position`) |

### Layout

| Parameter | Default | Description |
|-----------|---------|-------------|
| `width` | `900` | SVG width in px |
| `height` | `200` | SVG height in px |
| `padding` | `20` | Horizontal padding inside the SVG |
| `align` | `center` | Text alignment: `left` \| `center` \| `right` |

### Typography

| Parameter | Default | Description |
|-----------|---------|-------------|
| `text` | `Hello` | Text to render (URL-encoded) |
| `fontFamily` | `Georgia, serif` | Font family (URL-encoded) |
| `fontSize` | `80` | Font size in px |
| `fontWeight` | `400` | Font weight |
| `letterSpacing` | `0` | Letter spacing in em units |

### Color & Stroke

| Parameter | Default | Description |
|-----------|---------|-------------|
| `fillColor` | preset value | Fill color (hex without `#`, or full value like `#111`) |
| `strokeColor` | preset value | Stroke color |
| `strokeWidth` | preset value | Stroke width in px |
| `linecap` | `round` | `round` \| `butt` \| `square` |
| `linejoin` | `round` | `round` \| `miter` \| `bevel` |

### Animation

| Parameter | Default | Description |
|-----------|---------|-------------|
| `duration` | `2.5` | Draw duration in seconds |
| `delay` | `0` | Delay before animation starts in seconds |
| `easing` | `ease` | CSS easing function |
| `fillReveal` | `true` | Reveal fill color after stroke completes |
| `fillRevealMs` | `120` | Extra delay (ms) between stroke end and fill reveal |
| `repeat` | `false` | Loop the animation indefinitely |
| `repeatDelay` | `1.5` | Seconds between loop iterations |
| `reducedMotion` | `true` | Respect `prefers-reduced-motion` (skip animation, show final state) |

### Debug

| Parameter | Default | Description |
|-----------|---------|-------------|
| `debug` | `false` | Enable verbose console logging |

---

## 💡 Examples

### Ink preset, centered

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/handwriting-text-svg/handwriting-text-svg.min.js?text=Welcome&preset=ink&fontFamily=Georgia%2C%20serif&fontSize=90&duration=3"></script>
```

### Marker preset, left-aligned, repeated

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/handwriting-text-svg/handwriting-text-svg.min.js?text=Creative%20Studio&preset=marker&align=left&repeat=true&repeatDelay=2"></script>
```

### Custom target element

Add a Code Block in Squarespace:
```html
<div id="my-handwriting"></div>
```

Then point the script at it:
```html
<script src="...handwriting-text-svg.min.js?text=Hello&targetId=my-handwriting"></script>
```

### Before footer, no fill reveal

```html
<script src="...handwriting-text-svg.min.js?text=Thank%20You&position=before-footer&fillReveal=false&strokeColor=888888"></script>
```

---

## ♿ Accessibility

- The SVG has `role="img"` and `aria-label` set to the text value.
- When `reducedMotion=true` (default) and the visitor's OS has **Reduce Motion** enabled, the animation is skipped and the final text is shown immediately.

---

## 🔒 Licensing

This is a commercial plugin. A valid license is required for production use.

- Purchase at [anavo.tech/plugins](https://anavo.tech/plugins)
- Without a license, a small watermark is displayed in the plugin container.

---

## 🛠️ Troubleshooting

**Text is cut off or overflowing**
Increase `width` or decrease `fontSize`. The SVG uses `overflow: visible`, but the wrapper is bounded by the page column width.

**Animation doesn't play**
Check that your browser supports CSS transitions on SVG elements (all modern browsers do). Also verify the `delay` value is not larger than expected.

**Font not rendering as expected**
Squarespace loads Google Fonts automatically based on your site's font settings. Pass `fontFamily` as a URL-encoded string matching the font you have loaded (e.g., `fontFamily=Playfair%20Display%2C%20serif`).

**Animation plays but text is invisible**
Check `fillColor` and `strokeColor` values — they should be valid hex or rgb values.

---

## 📬 Support

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Full Docs: [GitHub Repository](https://github.com/clonegarden/squarespaceplugins/tree/main/handwriting-text-svg)

---

Made with ❤️ by Anavo Tech
