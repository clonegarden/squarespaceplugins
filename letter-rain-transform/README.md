# 🌧️ Letter Rain Transform

Reads all text from a chosen element, replaces it with individually-animated letter spans, and — when the user scrolls past the text — triggers each letter to **fall like rain** into a target container where they rearrange into a new phrase.

Compatible with Squarespace 7.1 (best-effort 7.0). Works when pasted into **Settings → Advanced → Code Injection → Footer**.

---

## 🚀 Installation

**Settings → Advanced → Code Injection → Footer**

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/letter-rain-transform/letter-rain-transform.min.js?source=%23letter-rain-source&target=%23letter-rain-target&phrase=Hello+World"></script>
```

Add two elements somewhere on the page (e.g. via Code Blocks):

```html
<!-- Source: the text that will rain down -->
<div id="letter-rain-source">Your original headline here</div>

<!-- Target: where the letters land and form the new phrase -->
<div id="letter-rain-target"></div>
```

---

## 🎯 How It Works

1. On `DOMContentLoaded`, the plugin locates the **source** element and extracts all its visible text content.
2. It inserts a **wrapper div** — visually matching the original element's fonts, colours, and box size — containing one `<span>` per character.
3. An **IntersectionObserver** watches the wrapper. When the user scrolls down and the wrapper exits the viewport at the top, the animation fires.
4. Each letter span becomes a **fixed-position flying clone** that animates from its original screen position to a position inside the **target** container, where the letters rearrange to spell the new `phrase`.
5. Extra source letters (phrase shorter than original) fall and fade out; extra phrase letters (phrase longer than original) fade in at the target.

---

## 📋 Parameter Reference

### Targeting

| Parameter | Default | Description |
|-----------|---------|-------------|
| `source` | `#letter-rain-source` | CSS selector for the source element |
| `target` | `#letter-rain-target` | CSS selector for the destination element |
| `phrase` | *(original text)* | URL-encoded string the letters will form at the target |

### Animation

| Parameter | Default | Description |
|-----------|---------|-------------|
| `duration` | `1200` | Total animation duration per letter in ms |
| `stagger` | `18` | Delay between consecutive letters starting in ms |
| `fallDistance` | `60` | Extra overshoot in px before letters settle (spring effect) |
| `easing` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | CSS timing function for the fall phase |

### Behaviour

| Parameter | Default | Description |
|-----------|---------|-------------|
| `repeat` | `false` | Allow animation to re-trigger every time source scrolls past |
| `debug` | `false` | Verbose console logging |

---

## 💡 Examples

### Minimal — same phrase, pure visual effect

```html
<script src="...letter-rain-transform.min.js?source=%23my-heading&target=%23rain-landing"></script>
```

### New phrase with custom timing

```html
<script src="...letter-rain-transform.min.js?source=%23hero-text&target=%23tagline&phrase=We+build+the+future&duration=1500&stagger=25&fallDistance=80"></script>
```

### Repeating trigger

```html
<script src="...letter-rain-transform.min.js?source=%23rain-source&target=%23rain-target&phrase=Keep+scrolling&repeat=true"></script>
```

### Selector syntax

Use URL-encoding for `#` (`%23`) and other special characters in CSS selectors:

| Selector | Encoded value |
|----------|--------------|
| `#my-id` | `%23my-id` |
| `.my-class` | `.my-class` *(no encoding needed)* |
| `[data-foo]` | `%5Bdata-foo%5D` |

---

## ⚙️ Setup in Squarespace

1. In your page, add a **Code Block** where you want the source text to appear:

    ```html
    <div id="letter-rain-source">
      Scroll down to see the magic
    </div>
    ```

2. Further down the page, add another **Code Block** for the landing zone:

    ```html
    <div id="letter-rain-target" style="min-height:3em;"></div>
    ```

3. In **Settings → Advanced → Code Injection → Footer**, add:

    ```html
    <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/letter-rain-transform/letter-rain-transform.min.js?source=%23letter-rain-source&target=%23letter-rain-target&phrase=Every+word+has+a+destination"></script>
    ```

---

## ♿ Accessibility

- When `prefers-reduced-motion` is enabled, the plugin skips the animation and instantly swaps the text content.
- The source wrapper is `display: none` after animation; screen readers will only see the target phrase.

---

## 🔧 Troubleshooting

**Letters don't animate**
Check that `source` and `target` selectors match real elements on the page. Enable `?debug=true` to see verbose logs.

**Animation fires immediately on page load**
The plugin waits until the source element has first been *visible* before monitoring for a scroll-past event. If your source element starts above the fold (i.e., the page is opened mid-scroll), add `?repeat=false` (default) to avoid unintended triggers, or scroll back to the top before testing.

**Layout shifts when the wrapper is inserted**
The plugin captures the source element's bounding rect before replacing it, so the wrapper is sized to match. If you still see a shift, add an explicit `height` to the source element.

---

## 🌐 Browser Support

- Chrome 58+
- Firefox 55+
- Safari 12.1+
- Edge 79+
- iOS Safari 12.2+

*(Requires `IntersectionObserver`, `requestAnimationFrame`, and CSS transitions.)*

---

## 🔐 Licensing

This plugin requires a valid Anavo Tech license for use on production domains.

- **Trial / Development:** Works on `localhost` and `127.0.0.1` without a license.
- **Production:** Purchase a license at [anavo.tech/plugins](https://anavo.tech/plugins).

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Knowledge Base: [anavo.tech](https://anavo.tech)
