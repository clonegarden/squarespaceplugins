# Floating Header - Squarespace Plugin

Professional header animation that starts at the bottom of your first section and smoothly floats to the top on scroll.

## ✨ Features

- **Smooth Animation**: Header floats from bottom to top with customizable speed
- **Universal Compatibility**: Works with ANY Squarespace header (7.0 & 7.1)
- **Zero Configuration**: Install and it just works
- **Customizable**: 15+ styling parameters
- **Custom Logo**: Use different logo than your Squarespace site
- **Mobile Responsive**: Adapts to all screen sizes
- **Lightweight**: ~5KB minified

## 📦 Installation

### Basic (Zero Config)

Add to **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/floating-header/floating-header.min.js"></script>
```

**That's it!** Header will automatically float from bottom of first section.

---

## ⚙️ Customization

### Styling Parameters

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/floating-header/floating-header.min.js?fontSize=18&bgColor=000000&fontColor=FFFFFF"></script>
```

| Parameter | Default | Description | Example |
|-----------|---------|-------------|---------|
| `fontSize` | Auto | Font size in px | `?fontSize=18` |
| `fontFamily` | Auto | Font family name | `?fontFamily=Helvetica` |
| `fontWeight` | Auto | Font weight (100-900) | `?fontWeight=600` |
| `fontColor` | Auto | Text color (hex without #) | `?fontColor=FFFFFF` |
| `bgColor` | Auto | Background color | `?bgColor=000000` |

### Logo Parameters

| Parameter | Default | Description | Example |
|-----------|---------|-------------|---------|
| `customLogo` | Site logo | URL of custom logo | `?customLogo=https://...` |
| `logoWidth` | Auto | Logo width in px | `?logoWidth=150` |
| `logoHeight` | Auto | Logo height in px | `?logoHeight=50` |

### Behavior Parameters

| Parameter | Default | Description | Example |
|-----------|---------|-------------|---------|
| `transitionSpeed` | `600` | Animation speed (ms) | `?transitionSpeed=800` |
| `stickyTop` | `0` | Top offset when sticky (px) | `?stickyTop=20` |
| `startAtBottom` | `true` | Start at bottom vs top | `?startAtBottom=false` |
| `zIndex` | `9999` | Z-index value | `?zIndex=10000` |
| `debug` | `false` | Enable console logging | `?debug=true` |

---

## 🎨 Examples

### Example 1: Dark Header with Custom Font

```html
<script src="...?bgColor=1a1a1a&fontColor=FFFFFF&fontFamily=Montserrat&fontSize=16"></script>
```

### Example 2: Transparent Header

```html
<script src="...?bgColor=transparent&fontColor=000000"></script>
```

### Example 3: Custom Logo

```html
<script src="...?customLogo=https://example.com/logo.png&logoWidth=200&logoHeight=60"></script>
```

### Example 4: Fast Animation

```html
<script src="...?transitionSpeed=300"></script>
```

### Example 5: Start Sticky (No Float)

```html
<script src="...?startAtBottom=false"></script>
```

---

## 🎯 How It Works

### Visual Flow

```
PAGE LOAD
┌─────────────────────────────────────┐
│  SECTION 1 (Hero/Banner)             │
│                                      │
│  [Your content here]                 │
│                                      │
│  ┌─────────────────────────────┐   │ ← Header at BOTTOM
│  │ LOGO  Home  About  Contact  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
             ⬇ User scrolls ⬇
┌─────────────────────────────────────┐
│ LOGO  Home  About  Contact          │ ← Header STICKY at TOP
├─────────────────────────────────────┤
│  SECTION 2                           │
│  [Content]                           │
└─────────────────────────────────────┘
```

### Technical Details

1. **Detects** first section automatically (no IDs needed)
2. **Wraps** existing Squarespace header
3. **Positions** at bottom of section 1 (absolute positioning)
4. **Monitors** scroll position
5. **Animates** to sticky top when user scrolls past section 1
6. **Reverses** animation when scrolling back up

---

## 🐛 Troubleshooting

### Header Not Appearing

1. Check browser console for errors
2. Enable debug mode: `?debug=true`
3. Verify header exists in Squarespace template

### Animation Not Smooth

1. Increase `transitionSpeed`: `?transitionSpeed=800`
2. Check for CSS conflicts
3. Disable other header-modifying plugins

### Logo Not Changing

1. Verify `customLogo` URL is accessible
2. Use full HTTPS URL (not relative path)
3. Check image file size (< 500KB recommended)

### Mobile Issues

1. Header automatically scales on mobile
2. Check mobile preview in Squarespace
3. Adjust `fontSize` if needed

---

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)
- ✅ Squarespace 7.0 & 7.1

---

## 🔐 Licensing

This plugin requires a commercial license from Anavo Tech.

- ✅ **Development**: Free on `localhost` and `*.squarespace.com`
- 💰 **Production**: Purchase at [anavo.tech/plugins](https://anavo.tech/plugins)

### License Tiers

| Tier | Price | Domains |
|------|-------|---------|
| Individual | $29/year | 1 domain |
| Agency | $79/year | 5 domains |
| Enterprise | $199/year | Unlimited |

---

## 🆘 Support

- 📧 **Email**: hello@anavo.tech
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📚 **Documentation**: [Full Docs](https://anavo.tech/docs/floating-header)

---

## 📄 License

Commercial - See [LICENSE.md](../LICENSE.md)

**© 2026 Anavo Tech. All rights reserved.**
