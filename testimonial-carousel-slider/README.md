# Testimonial Carousel Slider

Polished testimonial carousel with smooth transitions, keyboard navigation, and responsive design for Squarespace 7.0 & 7.1.

## Installation

Paste this in **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/testimonial-carousel-slider/testimonial-carousel-slider.min.js"></script>
```

The plugin automatically inserts the carousel into any section that contains an `<h1>` or `<h2>` with the text **"Testimonials"** (case-insensitive), or into any element with `id="testimonials"`. If neither is found it inserts before the page footer.

## Customization

Add parameters to the script URL:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/testimonial-carousel-slider/testimonial-carousel-slider.min.js?accentColor=e63946&autoplay=true&interval=6000&testimonials=%5B%7B%22quote%22%3A%22Great+product!%22%2C%22name%22%3A%22Jane+Doe%22%2C%22title%22%3A%22CEO%22%2C%22rating%22%3A5%7D%5D"></script>
```

### Available Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `testimonials` | Built-in samples | URL-encoded JSON array of testimonial objects (see schema below) |
| `autoplay` | `true` | Auto-advance slides |
| `interval` | `5000` | Autoplay interval in milliseconds |
| `accentColor` | `0066cc` | Accent color for stars, buttons, and highlights (hex without `#`) |
| `bgColor` | `ffffff` | Card and section background (hex without `#`) |
| `textColor` | `333333` | Quote and author text color (hex without `#`) |
| `cardRadius` | `12` | Card corner radius in pixels |
| `maxWidth` | `800` | Maximum carousel width in pixels |
| `showStars` | `true` | Show star rating indicators |
| `showAvatars` | `true` | Show avatar images or initials |

### Testimonial Object Schema

Each item in the `testimonials` JSON array may include:

| Field | Required | Description |
|-------|----------|-------------|
| `quote` | ✅ | The testimonial text |
| `name` | ✅ | Author's full name |
| `title` | — | Author's job title |
| `company` | — | Author's company |
| `image` | — | URL of author's photo |
| `rating` | — | Star rating 1–5 |

### Encoding Testimonials

Use `encodeURIComponent(JSON.stringify(array))` in the browser console to generate the URL parameter value:

```js
encodeURIComponent(JSON.stringify([
  { quote: "Excellent service!", name: "Jane Doe", title: "CEO", company: "Acme", rating: 5 },
  { quote: "Highly recommended.", name: "John Smith", title: "Designer", rating: 4 }
]))
```

## Examples

### Dark Theme
```html
?bgColor=1a1a2e&textColor=e0e0e0&accentColor=e94560
```

### Slower Autoplay
```html
?autoplay=true&interval=8000
```

### No Stars or Avatars
```html
?showStars=false&showAvatars=false
```

### Wide Layout
```html
?maxWidth=1000&cardRadius=20
```

### Disable Autoplay
```html
?autoplay=false
```

## Features

- ✨ **Auto-insertion**: Finds your testimonials section automatically
- 🎠 **Smooth carousel**: CSS transform transitions with optional `prefers-reduced-motion` support
- 📱 **Fully responsive**: Adapts to desktop, tablet, and mobile
- ⌨️ **Keyboard navigation**: Arrow keys cycle through slides
- 👆 **Touch/swipe support**: Native swipe gestures on mobile
- ⭐ **Star ratings**: Visual 1–5 star display
- 🖼️ **Avatars**: Photo support with initial-letter fallback
- ♿ **Accessible**: ARIA roles, labels, and focus management
- 🔒 **Licensed**: Commercial license with domain validation
- ⚡ **Lightweight**: ~8KB minified, zero dependencies

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari 12+
- ✅ Mobile Safari
- ✅ Chrome Mobile

## License

Commercial - Purchase at [anavo.tech](https://anavo.tech/plugins)

## Support

- 📧 Email: hello@anavo.tech
- 📖 Documentation: [View Full Docs](https://github.com/clonegarden/squarespaceplugins/tree/main/testimonial-carousel-slider)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)

---

Made with ❤️ by Anavo Tech
