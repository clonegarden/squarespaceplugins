# ASCII Animation Plugin

Animated rotating text circles with explosion and rain effects for Squarespace.

## Installation

Paste this in **Settings → Advanced → Code Injection → Header**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/ascii-animation/ascii-animation.min.js"></script>
```

## Customization

Add parameters to the script URL:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/ascii-animation/ascii-animation.min.js?characters=ANAVOTECH&bgColor=000000&fontColor=ffffff"></script>
```

### Available Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `characters` | ANAVOTECH | Main text to display |
| `explodeText` | DESIGNCREATEINNOVATE | Text shown on hover explosion |
| `secondaryText` | TECHNOLOGYANDART | Secondary explosion text |
| `tertiaryText` | CREATIONINNOVATIONART | Tertiary explosion text |
| `position` | first-section | Where to insert (first-section, before-footer, after-header) |
| `targetId` | null | Custom container ID to insert into |
| `bgColor` | transparent | Background color (hex without # or 'transparent') |
| `fontColor` | 000000 | Text color (hex without #) |
| `height` | 100vh | Container height |
| `fontSize` | 16 | Base font size (px) |
| `enableRain` | true | Click-to-rain animation |
| `enableExplosion` | true | Hover explosion effect |
| `pulseAmount` | 30 | Pulse intensity on hover |
| `animationSpeed` | 1 | Animation speed multiplier |

## Examples

### Custom Branding
```html
?characters=MYBRAND&explodeText=CREATIVESTUDIO
```

### Dark Mode
```html
?bgColor=000000&fontColor=ffffff
```

### Half Screen
```html
?height=50vh&position=before-footer
```

### Faster Animation
```html
?animationSpeed=1.5&pulseAmount=50
```

### Specific Position
```html
?targetId=my-custom-section
```

## Features

- ✨ **Rotating Circles**: Multiple concentric circles of animated text
- 🎯 **Hover Explosion**: Center hover triggers explosion animation
- 🌧️ **Click Rain**: Click to trigger rain effect
- 📱 **Fully Responsive**: Auto-scales on mobile/tablet
- 🎨 **Customizable**: 12+ parameters for full control
- ⚡ **Lightweight**: ~8KB minified
- 🔒 **Licensed**: Commercial license included

## Interactive Effects

### Explosion (Hover Center)
Move your mouse to the center of the animation to trigger an explosion effect where letters fly outward and change text.

### Rain (Click Anywhere)
Click anywhere on the animation to trigger a rain effect where letters fall from top to bottom.

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari 12+
- ✅ Mobile Safari
- ✅ Chrome Mobile

## Performance

- Runs at 60 FPS on modern devices
- Uses `requestAnimationFrame` for smooth animation
- Auto-pauses when tab is not active

## License

Commercial - Purchase at [anavo.tech](https://anavo.tech/plugins)

## Support

- 📧 Email: hello@anavo.tech
- 📖 Documentation: [View Full Docs](https://github.com/clonegarden/squarespaceplugins/tree/main/ascii-animation)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)

---

Made with ❤️ by Anavo Tech
