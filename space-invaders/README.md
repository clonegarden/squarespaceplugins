# Space Invaders Game Plugin

Interactive Space Invaders game overlay for Squarespace sites. Perfect for tech portfolios, developer showcases, and gamified user experiences.

![Version](https://img.shields.io/badge/version-2.5.1-blue)
![License](https://img.shields.io/badge/license-Commercial-red)

---

## ✨ Features

- 🎮 **Classic Space Invaders gameplay** - Shoot invaders, unlock items across multiple waves
- 🌊 **Multi-wave progression** - "Keep Playing?" prompt between waves; difficulty scales each wave
- 🏆 **Item unlock system** - Gamify your tech stack, portfolio, or any collection
- 🎨 **Fully customizable** - Colors, icons, difficulty, items - all configurable
- 📱 **Mobile responsive** - Mouse + click on desktop; touch + drag + on-screen buttons on mobile
- 🔧 **Zero dependencies** - Pure vanilla JavaScript
- ⚡ **Lightweight** - ~15KB minified
- 🔐 **Commercial licensing** with activation

---

## 🚀 Quick Start

### Basic Installation

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js"></script>
```

Add this code to **Settings → Advanced → Code Injection → Footer**.

### Auto-Start Mode

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js?autoStart=true"></script>
```

---

## ⚙️ Customization

### URL Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `autoStart` | boolean | `false` | Start game immediately (no prompt) |
| `shooterIcon` | string | `▲` | Player icon (emoji/character) |
| `invaderImage` | URL | Anavo Logo | Custom invader image URL |
| `bgColor` | color | `transparent` | Game background color |
| `fontColor` | color | `white` | Text/UI color |
| `difficulty` | string | `medium` | `easy`, `medium`, `hard` |
| `showTechTable` | boolean | `true` | Show tech badges table |
| `showPrompt` | boolean | `true` | Show start game prompt |
| `customTechs` | JSON | See below | Custom tech stack |
| `postGameButton` | boolean | `false` | Show floating relaunch button after game ends |
| `postGameButtonText` | string | `Portfolio Game` | Text for floating relaunch button |

### Examples

**Custom colors:**
```html
<script src="...space-invaders.min.js?bgColor=000000&fontColor=00ff00"></script>
```

**Hard difficulty:**
```html
<script src="...space-invaders.min.js?difficulty=hard"></script>
```

**Custom shooter icon:**
```html
<script src="...space-invaders.min.js?shooterIcon=🚀"></script>
```

**Custom tech stack:**
```html
<script src="...space-invaders.min.js?customTechs=%5B%7B%22name%22%3A%22Rust%22%2C%22icon%22%3A%22🦀%22%2C%22pointsNeeded%22%3A5%7D%5D"></script>
```

**Hide tech table:**
```html
<script src="...space-invaders.min.js?showTechTable=false"></script>
```

---

## 🎮 JavaScript API

Control the game programmatically:

```javascript
// Start game
window.SpaceInvadersGame.start();

// Skip/close game (disables auto-triggers; leaves a floating relaunch button)
window.SpaceInvadersGame.skip();

// Reset and restart game
window.SpaceInvadersGame.reset();

// Cleanup (remove all plugin artifacts from DOM)
window.SpaceInvadersGame.cleanup();

// Get current score
const score = window.SpaceInvadersGame.getScore();

// Get earned items (array of item objects: { name, icon, subtitle, ... })
const items = window.SpaceInvadersGame.getItems();

// Alias: getBadges() returns the same earned items list
const badges = window.SpaceInvadersGame.getBadges();

// Get full game state
const state = window.SpaceInvadersGame.getState();
// Returns: { score, wave, earnedItems, running }
```

---

## 🎯 Use Cases

- **Developer Portfolios** - Engage visitors with interactive experience
- **Tech Company Websites** - Showcase tech stack with gamification
- **Product Launches** - Fun countdown/teaser experience
- **Easter Eggs** - Hidden game on specific pages
- **About Pages** - Interactive team/skills showcase

---

## 🎨 Default Tech Stack

The plugin includes 8 default tech badges:

| Badge | Icon | Points Required |
|-------|------|-----------------|
| React | ⚛️ | 1 |
| Node.js | 🟢 | 2 |
| Python | 🐍 | 3 |
| Vue | 💚 | 5 |
| TypeScript | 🔷 | 8 |
| AI/ML | 🤖 | 13 |
| PostgreSQL | 🐘 | 21 |
| AWS | ☁️ | 34 |

---

## 🎮 Controls

| Platform | Action | Control |
|----------|--------|---------|
| Desktop | Aim shooter | Move mouse |
| Desktop | Shoot | Click (hold to auto-fire) |
| Mobile | Aim shooter | Drag / touch-move |
| Mobile | Shoot | Tap canvas |
| Mobile | Move left/right | On-screen ◀ / ▶ buttons |
| Mobile | Fire | On-screen ● button |

---

## 🔐 Licensing

**Commercial License Required**

- ✅ 30-day free trial (with watermark)
- ✅ Individual License: $29/year (1 domain)
- ✅ Agency License: $99/year (10 domains)
- ✅ Enterprise: Custom pricing

[Purchase License →](https://anavotech.com/plugins/space-invaders)

### How it Works

- Development/localhost: Free, unlimited use
- Production: Requires active license
- Unlicensed: Shows watermark "Get License"

---

## 🛠️ Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/clonegarden/squarespaceplugins.git
cd squarespaceplugins

# Install dependencies
npm install

# Build Space Invaders
npm run build:space-invaders

# Watch for changes
npm run watch
```

### Project Structure

```
space-invaders/
├── space-invaders.js          ← Source code
├── space-invaders.min.js      ← Minified (auto-generated)
├── README.md                  ← This file
├── CHANGELOG.md               ← Version history
└── examples/
    └── basic.html             ← Usage example
```

---

## 📊 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS/Android)

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Issues: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Docs: [Full Documentation](https://anavotech.com/docs/space-invaders)

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full version history.

---

**Made with ❤️ by Anavo Tech**


---

## ✨ Features

- 🎮 **Classic Space Invaders gameplay** - Shoot invaders, collect badges
- 🏆 **Tech badge unlock system** - Gamify your tech stack
- 🎨 **Fully customizable** - Colors, icons, difficulty, tech stack
- 📱 **Mobile responsive** - Works on all devices
- ⌨️ **Keyboard controls** - Mouse movement + click to shoot
- 🔧 **Zero dependencies** - Pure vanilla JavaScript
- ⚡ **Lightweight** - ~15KB minified
- 🔐 **Commercial licensing** with activation

---

## 🚀 Quick Start

### Basic Installation

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js"></script>
```

Add this code to **Settings → Advanced → Code Injection → Footer**.

### Auto-Start Mode

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js?autoStart=true"></script>
```

---

## ⚙️ Customization

### URL Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `autoStart` | boolean | `false` | Start game immediately (no prompt) |
| `shooterIcon` | string | `▲` | Player icon (emoji/character) |
| `invaderImage` | URL | Anavo Logo | Custom invader image URL |
| `bgColor` | color | `transparent` | Game background color |
| `fontColor` | color | `white` | Text/UI color |
| `difficulty` | string | `medium` | `easy`, `medium`, `hard` |
| `showTechTable` | boolean | `true` | Show tech badges table |
| `showPrompt` | boolean | `true` | Show start game prompt |
| `customTechs` | JSON | See below | Custom tech stack |

### Examples

**Custom colors:**
```html
<script src="...space-invaders.min.js?bgColor=000000&fontColor=00ff00"></script>
```

**Hard difficulty:**
```html
<script src="...space-invaders.min.js?difficulty=hard"></script>
```

**Custom shooter icon:**
```html
<script src="...space-invaders.min.js?shooterIcon=🚀"></script>
```

**Custom tech stack:**
```html
<script src="...space-invaders.min.js?customTechs=%5B%7B%22name%22%3A%22Rust%22%2C%22icon%22%3A%22🦀%22%2C%22pointsNeeded%22%3A5%7D%5D"></script>
```

**Hide tech table:**
```html
<script src="...space-invaders.min.js?showTechTable=false"></script>
```

---

## 🎮 JavaScript API

Control the game programmatically:

```javascript
// Start game
window.SpaceInvadersGame.start();

// Skip/close game
window.SpaceInvadersGame.skip();

// Reset game
window.SpaceInvadersGame.reset();

// Cleanup (remove from DOM)
window.SpaceInvadersGame.cleanup();

// Get current score
const score = window.SpaceInvadersGame.getScore();

// Get earned badges
const badges = window.SpaceInvadersGame.getBadges();
```

---

## 🎯 Use Cases

- **Developer Portfolios** - Engage visitors with interactive experience
- **Tech Company Websites** - Showcase tech stack with gamification
- **Product Launches** - Fun countdown/teaser experience
- **Easter Eggs** - Hidden game on specific pages
- **About Pages** - Interactive team/skills showcase

---

## 🎨 Default Tech Stack

The plugin includes 8 default tech badges:

| Badge | Icon | Points Required |
|-------|------|-----------------|
| React | ⚛️ | 5 |
| Node.js | 🟢 | 10 |
| Python | 🐍 | 15 |
| Vue | 💚 | 20 |
| TypeScript | 🔷 | 25 |
| AI/ML | 🤖 | 30 |
| PostgreSQL | 🐘 | 35 |
| AWS | ☁️ | 40 |

---

## 🔐 Licensing

**Commercial License Required**

- ✅ 30-day free trial (with watermark)
- ✅ Individual License: $29/year (1 domain)
- ✅ Agency License: $99/year (10 domains)
- ✅ Enterprise: Custom pricing

[Purchase License →](https://anavotech.com/plugins/space-invaders)

### How it Works

- Development/localhost: Free, unlimited use
- Production: Requires active license
- Unlicensed: Shows watermark "Get License"

---

## 🛠️ Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/clonegarden/squarespaceplugins.git
cd squarespaceplugins

# Install dependencies
npm install

# Build Space Invaders
npm run build:space-invaders

# Watch for changes
npm run watch
```

### Project Structure

```
space-invaders/
├── space-invaders.js          ← Source code
├── space-invaders.min.js      ← Minified (auto-generated)
├── README.md                  ← This file
└── examples/
    └── basic.html             ← Usage example
```

---

## 📊 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS/Android)

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Issues: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Docs: [Full Documentation](https://anavotech.com/docs/space-invaders)

---

## 📝 Changelog

### v1.0.0 (2026-02-19)
- ✨ Initial release
- ✅ Full game mechanics
- ✅ Tech badge system
- ✅ Customization options
- ✅ Licensing system
- ✅ Mobile responsive

---

**Made with ❤️ by Anavo Tech**
