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
| `colorWave` | false | Enable animated color wave effect |
| `waveMode` | rainbow | Color wave mode: `rainbow`, `gradient`, `pulse` |
| `waveColors` | null | Custom colors (comma-separated hex, no #) |
| `reveal` | false | Enable the cinematic reveal sequence |
| `revealDelay` | 5 | Seconds before the reveal triggers (timer trigger only) |
| `revealDuration` | 4 | Seconds the text stays fully visible |
| `revealTrigger` | timer | What triggers the reveal: `timer`, `click`, `scroll`, `hover` |
| `revealRepeat` | false | Cycle the reveal indefinitely |
| `revealTitle` | null | Override title text (URL-encoded; defaults to `characters` + `explodeText`) |
| `revealSubtitle` | null | Override subtitle text (URL-encoded; defaults to `secondaryText · tertiaryText`) |

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

### Rainbow Wave
```html
?colorWave=true&waveMode=rainbow
```

### Custom Gradient Wave
```html
?colorWave=true&waveMode=gradient&waveColors=ff0000,ffff00,00ff00
```

### Pulse Effect
```html
?colorWave=true&waveMode=pulse&waveColors=3b82f6
```

### Dark Mode + Rainbow
```html
?bgColor=000000&colorWave=true&waveMode=rainbow
```

### Reveal — Auto-trigger after 5 s, hold 4 s
```html
?reveal=true&revealDelay=5&revealDuration=4
```

### Reveal — Click to trigger (replaces rain click)
```html
?reveal=true&revealTrigger=click&revealRepeat=true
```

### Reveal — Scroll into view
```html
?reveal=true&revealTrigger=scroll&revealDuration=5
```

### Reveal — Hover trigger
```html
?reveal=true&revealTrigger=hover&revealDuration=3
```

### Reveal — Custom title &amp; subtitle
```html
?reveal=true&revealTitle=WELCOME%20TO%0AOUR%20STUDIO&revealSubtitle=Design%20%C2%B7%20Code%20%C2%B7%20Create
```

### Reveal — Dark looping cinematic
```html
?bgColor=1a1a2e&fontColor=e0e0e0&reveal=true&revealDelay=8&revealDuration=5&revealRepeat=true
```

## Features

- ✨ **Rotating Circles**: Multiple concentric circles of animated text
- 🎯 **Hover Explosion**: Center hover triggers explosion animation
- 🌧️ **Click Rain**: Click to trigger rain effect
- 🎬 **Reveal Sequence**: Cinematic multi-phase text reveal (see below)
- 📱 **Fully Responsive**: Auto-scales on mobile/tablet
- 🎨 **Customizable**: 20+ parameters for full control
- ⚡ **Lightweight**: ~8KB minified
- 🔒 **Licensed**: Commercial license included

## Interactive Effects

### Explosion (Hover Center)
Move your mouse to the center of the animation to trigger an explosion effect where letters fly outward and change text.

### Rain (Click Anywhere)
Click anywhere on the animation to trigger a rain effect where letters fall from top to bottom.

### Reveal Sequence

The reveal sequence is a **6-phase cinematic animation** that transforms the rotating circles into large, readable text and then returns to normal:

| Phase | Duration | Description |
|-------|----------|-------------|
| `idle` | — | Normal rotating circle animation |
| `explode-out` | ~0.8 s | All letters fly outward with ease-out cubic easing |
| `form-text` | ~1.0 s | Letters converge to center; title/subtitle overlay fades in |
| `hold` | `revealDuration` s | Title and subtitle displayed, large and centered |
| `glitch-exit` | ~0.6 s | Overlay trembles and glitches while fading out |
| `explode-back` | ~1.0 s | Letters smoothly reform into their original circle orbits |

**Title** shows `characters` stacked over `explodeText` (or `revealTitle` override).  
**Subtitle** shows `secondaryText · tertiaryText` (or `revealSubtitle` override).

#### Trigger Modes

| `revealTrigger` | When it fires |
|-----------------|---------------|
| `timer` | Automatically after `revealDelay` seconds |
| `click` | On click (takes priority over the rain click) |
| `scroll` | When >60% of the container is visible in the viewport |
| `hover` | On `mouseenter` into the animation container |

> **Note:** When `reveal=false` (the default), there is zero performance overhead — no overlay is created and no extra event listeners are attached.

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
