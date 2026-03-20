# squarespaceplugins
Squarespace Plugins by Anavo Tech

Professional, production-ready plugins for Squarespace 7.0 & 7.1 websites.

[![jsDelivr hits](https://data.jsdelivr.com/v1/package/gh/clonegarden/squarespaceplugins/badge)](https://www.jsdelivr.com/package/gh/clonegarden/squarespaceplugins)
[![License:  Commercial](https://img.shields.io/badge/License-Commercial-blue.svg)](LICENSE.md)
[![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)](https://squarespace.com)

---

## 🎨 Available Plugins

### Header Pro
Squarekicker-inspired header enhancement — centered layout, sticky/auto-hide, CTA button, dropdown modes (list/mega), glassy blur, animated blue-line glow, and glitch effect. Non-destructive: skins the native header without replacing it.

**Install (Settings → Advanced → Code Injection → Footer):**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js"></script>
```

**Presets:**
```html
<!-- Frosted glass + animated glow + CTA -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?preset=glassy&ctaEnabled=true&ctaText=Get+Started&ctaUrl=/contact"></script>

<!-- Dark tech + glitch hover + outline CTA -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js?preset=tech&ctaEnabled=true&ctaText=Book+a+Call&ctaUrl=/book"></script>
```

[📖 Documentation](header-pro/README.md) | [🎬 Live Demo](header-pro/examples/basic.html) | [📋 Changelog](header-pro/CHANGELOG.md)

---

### Mega Menu
Full-width mega menu dropdown that steals a Squarespace section and transforms it into a nav-triggered panel. Supports hover/click triggers, 5 animation modes, and 4 presets. **v1.0.0**

**Install (Settings → Advanced → Code Injection → Footer):**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mega-menu/mega-menu.min.js?sectionId=YOUR_ID&triggerLabel=Services"></script>
```

[📖 Documentation](mega-menu/README.md) | [📋 Changelog](mega-menu/CHANGELOG.md)

---

### Testimonial Carousel Slider
Polished testimonial carousel with smooth transitions, keyboard navigation, star ratings, and responsive design. Auto-inserts into any section with a "Testimonials" heading.

**Install (Settings → Advanced → Code Injection → Footer):**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/testimonial-carousel-slider/testimonial-carousel-slider.min.js"></script>
```

[📖 Documentation](testimonial-carousel-slider/README.md) | [🎬 Live Demo](testimonial-carousel-slider/examples/basic.html) | [📋 Changelog](testimonial-carousel-slider/CHANGELOG.md)

---

### Tabbed Content
Transforms Squarespace lists into a tabbed file-organizer layout with image + content panels. Auto-extracts from Summary Blocks, List Sections, or custom HTML.

**Install (Settings → Advanced → Code Injection → Footer):**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/tabbed-content/tabbed-content.min.js?sectionIndex=2"></script>
```

[📖 Documentation](tabbed-content/README.md) | [🎬 Live Demo](tabbed-content/examples/basic.html) | [📋 Changelog](tabbed-content/CHANGELOG.md)

---

### ASCII Animation
Animated rotating text circles with explosion and rain effects.

**Install:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/ascii-animation/ascii-animation.min.js?characters=ANAVOTECH"></script>
```

[📖 Documentation](ascii-animation/README.md)

---

### Quotation Builder
Interactive quotation calculator for service-based businesses.

**Install:**
```html
<div id="quotemachine"></div>
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/quotation-builder/quotation-builder.min.js"></script>
```

[📖 Documentation](quotation-builder/README.md) | [🎬 Live Demo](https://katoptron.institutomalleusdei.org/demos/quotation-builder)

---

### Space Invaders Game
Interactive Space Invaders game for tech portfolios and gamified experiences.

**Install:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js"></script>
```

[📖 Documentation](space-invaders/README.md) | [🎮 Live Demo](space-invaders/examples/basic.html)

---

### Animated Sticky Header
Menu sticky que inicia no footer e sobe smooth para o topo ao rolar. **v2.0.0 - Reescrito!**

**Install:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js"></script>
```

**Presets:**
```html
<!-- Glass Morphism (transparente com blur) -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=transparent&bgEffect=blur&fontColor=FFFFFF&showBorder=true&borderColor=FFFFFF&borderWidth=1"></script>

<!-- Header preto sólido com fonte customizada -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=000000&fontColor=FFFFFF&fontSize=18&fontFamily=Montserrat"></script>

<!-- Header branco com borda dupla -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=FFFFFF&fontColor=000000&showBorder=true&borderPosition=both&borderColor=CCCCCC&borderWidth=1"></script>

<!-- Semi-transparente overlay -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?bgColor=rgba(0,0,0,0.9)&fontColor=FFFFFF&showBorder=true&borderColor=FFFFFF&borderWidth=2"></script>
```

[📖 Documentation](animated-header/README.md) | [🎬 Demo](animated-header/examples/basic.html)

**v2.0.0 New Features:**
- ✨ Font family customizável (`fontFamily`)
- ✨ Background modes (sólido, transparente, blur via `bgEffect`)
- ✨ Bordas customizáveis (`showBorder`, `borderPosition`, `borderWidth`, `borderColor`)
- ✅ 100% compatível com todos os temas

---

### Expanded Menu
Full-width expanded navigation menu for Squarespace, replacing the native header with a custom multi-column layout. Supports mobile wrap, custom spacing, and full color/font control. **v2.1.5**

**Install:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/expanded-menu/expanded-menu.min.js"></script>
```

[📖 Documentation](expanded-menu/README.md) | [📋 Changelog](expanded-menu/CHANGELOG.md)

---

### Floating Header
A floating header that begins at the bottom of the page and smoothly slides to the top on scroll. Universal Squarespace 7.0 & 7.1 compatibility. **v1.0.8**

**Install:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/floating-header/floating-header.min.js"></script>
```

[📖 Documentation](floating-header/README.md) | [📋 Changelog](floating-header/CHANGELOG.md)

---

### Photo Grid
Dynamic photo grid/masonry layout for Squarespace image galleries. Fully responsive with configurable columns and spacing. **v1.3.0**

**Install:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js"></script>
```

[📖 Documentation](photo-grid/README.md) | [📋 Changelog](photo-grid/CHANGELOG.md)

---

### Logo Reaper
Animated continuous logo marquee with stamp and particle explosion effects. Logos enter from the right, receive a random stamp, then "die" into a pile in the left corner. **v1.2.0**

**Install:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js?logos=...&height=220"></script>
```

[📖 Documentation](logo-reaper/README.md) | [📋 Changelog](logo-reaper/CHANGELOG.md)

---

## 🔐 Licensing

These plugins are **commercially licensed** and require activation. 

### For Customers

1. **Purchase** a plugin license at Anavo Tech
2. **Register** your Squarespace domain
3. **Install** using the provided code snippet
4. **Activate** automatically on first load

### How Licensing Works

Plugins verify your domain against our license server:
- ✅ Licensed domains: Full functionality
- ❌ Unlicensed domains: Watermark + limited features
- 🔧 Development:  Works on localhost/staging

**Privacy:** We only check domain authorization.  No user data is collected.

---

## 📦 Installation

### Quick Start

All plugins follow the same pattern:

```html
<!-- 1. Add target div -->
<div id="plugin-container"></div>

<!-- 2. Load plugin from CDN -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/[plugin-name]/[plugin-name].min.js"></script>
```

### Version Pinning (Recommended for Production)

```html
<!-- Use specific version for stability -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@v1.0.0/quotation-builder/quotation-builder.min.js"></script>
```

### Customization

Add parameters to the script URL:

```html
<script src="... plugin-name.min.js?bgColor=ffffff&activeColor=2563eb&sectionBorder=false"></script>
```

See individual plugin documentation for available parameters.

---

## 🛠️ For Developers

### Repository Structure

```
/plugin-name/
  ├── plugin-name.js          ← Source code
  ├── plugin-name.min.js      ← Minified (production)
  ├── README.md               ← Plugin documentation
  ├── CHANGELOG.md            ← Version history
  └── examples/               ← Usage examples
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/clonegarden/squarespaceplugins.git
cd squarespaceplugins

# Install dependencies
npm install

# Build all plugins
npm run build

# Build specific plugin
npm run build:quotation-builder

# Watch for changes
npm run dev
```

### Creating a New Plugin

```bash
# Use our plugin template
npm run create-plugin my-new-plugin
```

See [Plugin Development Guide](docs/development.md) for details.

---

## 🌐 CDN Usage

### jsDelivr (Recommended)

**Latest version:**
```
https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/[plugin]/[plugin].min.js
```

**Specific version:**
```
https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@v1.0.0/[plugin]/[plugin].min.js
```

**Specific commit:**
```
https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@[commit-hash]/[plugin]/[plugin].min.js
```


---

## 📊 Analytics & Stats

- **Total Downloads:** [View on jsDelivr](https://www.jsdelivr.com/package/gh/clonegarden/squarespaceplugins)
- **GitHub Stars:** ![GitHub stars](https://img.shields.io/github/stars/clonegarden/squarespaceplugins?style=social)
- **Active Licenses:** View in [Plugin Manager]

---

## 🆘 Support

### Documentation
- [Installation Guide](docs/installation.md)
- [Customization Guide](docs/customization.md)
- [Licensing & Activation](docs/licensing.md)
- [Troubleshooting](docs/troubleshooting.md)

### Get Help
- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Knowledge Base: Anavo Tech

### Business Hours
- Monday-Tuesday-Thursday-Friday: 9AM-5PM EST
- Response time: Within 24 hours
- Emergency support: Available for enterprise licenses

---

## 🔄 Updates & Changelog

### Latest Release: v1.3.0 (2026-03-13)

**Tabbed Content v1.3.0**
- ✨ True folder-tab architecture — wrapper is now transparent (`background: transparent`, `overflow: visible`), allowing tabs to cleanly overlap the content panel border
- ✨ New `contentBgColor` parameter — explicit content panel background color, used for the active-tab border-masking trick
- ✨ Active tab z-index layering — tablist (`z-index: 2`), active tab (`z-index: 3`), content panel (`z-index: 1`) — correct stacking order by default
- ✨ Inactive tabs now have `background: transparent` — the page background shows through closed folder tabs
- 🔧 `sectionBorder` default changed to `false` for all presets except `minimal`
- 🔧 `tabGap` default changed from `8` to `6`
- ✅ Eliminates the need for `!important` CSS overrides in Squarespace — injected styles are architecturally correct by default

**Recent Releases:**
- Photo Grid v1.3.0 — Enhanced masonry grid with configurable columns
- Space Invaders v2.5.1 — Performance improvements and new game modes
- Logo Reaper v1.2.0 — New stamp effects and improved particle system

[View Full Changelog](CHANGELOG.md)

---

## 🏢 About Anavo Tech

We create professional tools for creative businesses. 

- 🌐 Website: [anavo.tech](https://anavo.tech)
- 📸 Instagram: [@anavotech](https://instagram.com/anavotech)

---

## ⚖️ License

**Commercial License** - See [LICENSE.md](LICENSE.md)

**TL;DR:**
- ✅ Use on unlimited client projects (with license)
- ✅ Modify for your needs
- ✅ Distribute to your clients
- ❌ Resell or redistribute as your own product
- ❌ Remove licensing/attribution

For custom licensing or white-label options, contact:  hello@anavo.tech

---

## 🙏 Credits

Built with ❤️ by the Anavo Tech team. 

**Technologies:**
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Variables
- jsDelivr CDN
- GitHub Actions (CI/CD)

**Inspired by:**
- Squarekicker
- Elfsight
- POWR

---

<p align="center">
  <strong>Made for Squarespace • Built by Professionals • Licensed for Success</strong>
</p>
