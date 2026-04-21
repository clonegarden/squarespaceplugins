# Changelog - ASCII Animation Plugin

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-03-27

### ✨ Added

- **Reveal Sequence** — A cinematic 6-phase animation that transforms rotating circles into large, readable text and then returns to normal:
  - Phase 1 `idle` — standard circles animation
  - Phase 2 `explode-out` (~0.8 s) — letters fly outward with ease-out cubic easing
  - Phase 3 `form-text` (~1.0 s) — letters converge to center; title/subtitle overlay fades in
  - Phase 4 `hold` (`revealDuration` s) — title and subtitle displayed large and centered
  - Phase 5 `glitch-exit` (~0.6 s) — overlay trembles/glitches with CSS keyframes while fading out
  - Phase 6 `explode-back` (~1.0 s) — letters reform into their original circular orbits

- **New parameters**:
  - `reveal` (boolean, default: `false`) — enable the reveal sequence
  - `revealDelay` (number, default: `5`) — seconds before the reveal triggers (timer mode)
  - `revealDuration` (number, default: `4`) — seconds the text stays fully visible
  - `revealTrigger` (string, default: `timer`) — trigger mode: `timer`, `click`, `scroll`, `hover`
  - `revealRepeat` (boolean, default: `false`) — cycle the reveal indefinitely
  - `revealTitle` (string, default: `null`) — override title text (URL-encoded)
  - `revealSubtitle` (string, default: `null`) — override subtitle text (URL-encoded)

- **Glitch CSS** — `@keyframes anavo-reveal-tremble` and `anavo-reveal-glitch-clip` injected as `<style id="anavo-reveal-glitch-styles">` (only when `reveal=true`)

- **Overlay element** — `#anavo-reveal-overlay` with `.anavo-reveal-title` and `.anavo-reveal-subtitle` children (only created when `reveal=true`)

### 📖 Examples

```html
<!-- Auto-reveal after 5 s, hold 4 s -->
<script src="...?reveal=true&revealDelay=5&revealDuration=4"></script>

<!-- Click to trigger, repeats -->
<script src="...?reveal=true&revealTrigger=click&revealRepeat=true"></script>

<!-- Scroll into view trigger -->
<script src="...?reveal=true&revealTrigger=scroll&revealDuration=5"></script>

<!-- Hover trigger -->
<script src="...?reveal=true&revealTrigger=hover&revealDuration=3"></script>

<!-- Custom title & subtitle -->
<script src="...?reveal=true&revealTitle=WELCOME%20TO%0AOUR%20STUDIO&revealSubtitle=Design%20%C2%B7%20Code%20%C2%B7%20Create"></script>

<!-- Dark looping cinematic -->
<script src="...?bgColor=1a1a2e&fontColor=e0e0e0&reveal=true&revealDelay=8&revealDuration=5&revealRepeat=true"></script>
```

---

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
