# Changelog - ASCII Animation Plugin

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-02-26

### ✨ Added

- **Color Wave System** — Animated color effects for circles
  - `colorWave` parameter (boolean, default: false)
  - `waveMode` parameter (rainbow | gradient | pulse, default: rainbow)
  - `waveColors` parameter (comma-separated hex colors, default: null)
- **Rainbow mode** — Automatic HSL rainbow across circles
- **Gradient mode** — Smooth interpolation between custom colors
- **Pulse mode** — Synchronized breathing effect

### 📖 Examples

```html
<!-- Rainbow wave -->
<script src="...?colorWave=true&waveMode=rainbow"></script>

<!-- Custom gradient -->
<script src="...?colorWave=true&waveMode=gradient&waveColors=ff0000,00ff00,0000ff"></script>

<!-- Blue pulse -->
<script src="...?colorWave=true&waveMode=pulse&waveColors=3b82f6"></script>
```

---

## [1.0.0] - 2026-02-19

### ✨ Initial Release

**Features:**
- Rotating circular text animation with 14 configurable circles
- Hover explosion effect (mouse near center)
- Click-to-rain animation effect
- Full parameter customization via URL
- Responsive design (desktop/tablet/mobile)
- Auto-insertion at configurable positions
- Commercial licensing integration
- Lightweight (~8KB minified)

**Parameters:**
- `characters` - Main text display
- `explodeText` - Explosion animation text
- `secondaryText` - Secondary explosion text
- `tertiaryText` - Tertiary explosion text
- `position` - Insertion position
- `targetId` - Custom container ID
- `bgColor` - Background color
- `fontColor` - Text color
- `height` - Container height
- `fontSize` - Base font size
- `enableRain` - Toggle rain effect
- `enableExplosion` - Toggle explosion effect
- `pulseAmount` - Hover pulse intensity
- `animationSpeed` - Speed multiplier

**Browser Support:**
- Chrome/Edge (latest) ✅
- Firefox (latest) ✅
- Safari 12+ ✅
- Mobile browsers ✅

**Performance:**
- 60 FPS animation
- requestAnimationFrame optimization
- Auto-pause when inactive

---

**License:** Commercial - Anavo Tech © 2026
