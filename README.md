# squarespaceplugins
Squarespace Plugins by Anavo Tech

Professional, production-ready plugins for Squarespace 7.0 & 7.1 websites.

[![jsDelivr hits](https://data.jsdelivr.com/v1/package/gh/clonegarden/squarespace-plugins/badge)](https://www.jsdelivr.com/package/gh/clonegarden/squarespace-plugins)
[![License:  Commercial](https://img.shields.io/badge/License-Commercial-blue.svg)](LICENSE.md)
[![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)](https://squarespace.com)

---

## 🎨 Available Plugins

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
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@latest/quotation-builder/quotation-builder.min.js"></script>
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

**Customize:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js?fontColor=ffffff&bgColor=rgba(0,0,0,0.8)&fontSize=18"></script>
```

[📖 Documentation](animated-header/README.md) | [🎬 Demo](animated-header/examples/basic.html)

**v2.0.0 Breaking Changes:**
- Reescrito com arquitetura Expanded Menu
- 100% compatível com todos os temas
- Não depende mais de `#menuholder`/`#header`

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
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@latest/[plugin-name]/[plugin-name].min.js"></script>
```

### Version Pinning (Recommended for Production)

```html
<!-- Use specific version for stability -->
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@v1.0.0/quotation-builder/quotation-builder. min.js"></script>
```

### Customization

Add parameters to the script URL:

```html
<script src="...  quotation-builder.min.js? font:Arial;bg:ffffff;primary: ff0000"></script>
```

See individual plugin documentation for available parameters.

---

## 🛠️ For Developers

### Repository Structure

```
/plugin-name/
  ├── plugin-name.js          ← Source code
  ├── plugin-name.min.js      ← Minified (production)
  ├── README. md               ← Plugin documentation
  ├── CHANGELOG.md            ← Version history
  └── examples/               ← Usage examples
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/clonegarden/squarespace-plugins.git
cd squarespace-plugins

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
https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@latest/[plugin]/[plugin].min.js
```

**Specific version:**
```
https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@v1.0.0/[plugin]/[plugin].min.js
```

**Specific commit:**
```
https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@[commit-hash]/[plugin]/[plugin]. min.js
```


---

## 📊 Analytics & Stats

- **Total Downloads:** [View on jsDelivr](https://www.jsdelivr.com/package/gh/clonegarden/squarespace-plugins)
- **GitHub Stars:** ![GitHub stars](https://img.shields.io/github/stars/clonegarden/squarespace-plugins? style=social)
- **Active Licenses:** View in [Plugin Manager]

---

## 🆘 Support

### Documentation
- [Installation Guide](docs/installation.md)
- [Customization Guide](docs/customization. md)
- [Licensing & Activation](docs/licensing.md)
- [Troubleshooting](docs/troubleshooting.md)

### Get Help
- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespace-plugins/issues)
- 📖 Knowledge Base: Anavo Tech

### Business Hours
- Monday-Tuesday-Thursday-Friday: 9AM-5PM EST
- Response time: Within 24 hours
- Emergency support: Available for enterprise licenses

---

## 🔄 Updates & Changelog

### Latest Release:  v1.0.0 (2026-01-20)

**Quotation Builder v1.0.0**
- ✨ Initial release
- ✅ Squarespace 7.0 & 7.1 compatible
- ✅ Mobile responsive
- ✅ PDF export functionality

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
