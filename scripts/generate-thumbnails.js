#!/usr/bin/env node
/**
 * generate-thumbnails.js
 * Generates 400×300px plugin thumbnails with Anavo tech/videogame aesthetic.
 * Uses Puppeteer to render an HTML canvas per plugin and screenshot it.
 *
 * Usage:
 *   node scripts/generate-thumbnails.js              → all plugins
 *   node scripts/generate-thumbnails.js marquee-menu → single plugin
 *
 * Output: thumbnails/{plugin-id}.png
 */

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const OUT_DIR = path.join(__dirname, '..', 'thumbnails');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// ─── Plugin catalogue ─────────────────────────────────────────────────────────
// Each entry defines what the thumbnail mock UI element looks like.
// icon: an SVG path or symbol (emoji as fallback for rare cases)
// mockType: 'nav' | 'image' | 'text' | 'ui' | 'seo' | 'anim' | 'ecom'
// accent: override per-plugin accent colour (default: electric blue)
// lines: up to 3 mock UI lines shown as glowing bars

const PLUGINS = [
  // ─ Navigation ─────────────────────────────────────────────────────────────
  { id: 'header-pro',      name: 'Header Pro',           category: 'Navigation', mockType: 'nav',   accent: '#00d4ff', lines: ['LOGO','NAV LINKS ——————','STICKY · PRO'] },
  { id: 'mega-menu',       name: 'Mega Menu',            category: 'Navigation', mockType: 'nav',   accent: '#00d4ff', lines: ['[ MENU ▼ ]','┌──────────────┐','│ col1  col2  │'] },
  { id: 'animated-header', name: 'Animated Header',      category: 'Navigation', mockType: 'nav',   accent: '#7c3aff', lines: ['━━━ HEADER ━━━','◈  ANIMATE IN','SCROLL → MORPH'] },
  { id: 'floating-header', name: 'Floating Header',      category: 'Navigation', mockType: 'nav',   accent: '#00d4ff', lines: ['▓▓▓▓▓▓▓▓▓▓▓▓▓▓','  SCROLLS DOWN','░ STAYS FIXED ░'] },
  { id: 'expanded-menu',   name: 'Expanded Menu',        category: 'Navigation', mockType: 'nav',   accent: '#00ff88', lines: ['☰  BURGER','▒ FULLSCREEN ▒','◄ SLIDE  IN ►'] },
  { id: 'magic-menu',      name: 'Magic Menu',           category: 'Navigation', mockType: 'nav',   accent: '#ff00ff', lines: ['HOME   WORK','  ↓ HOVER ↓  ','▓ IMAGE REVEAL'] },
  { id: 'marquee-menu',    name: 'Marquee Menu',         category: 'Navigation', mockType: 'nav',   accent: '#00d4ff', lines: ['ABOUT  WORK  CONTACT','  ↕ HOVER ↕  ','◀ TEXT SCROLLS ▶'] },
  { id: 'nav-fx',          name: 'Nav FX',               category: 'Navigation', mockType: 'nav',   accent: '#ff4400', lines: ['HOME   WORK','  3D · GLOW  ','WORK   ABOUT'] },
  { id: 'scroll-loop-menu',name: 'Scroll Loop Menu',     category: 'Navigation', mockType: 'nav',   accent: '#00ff88', lines: ['HOME','◀━━━━━━━━━━━▶','↕ SCROLL LOOP'] },

  // ─ Media ──────────────────────────────────────────────────────────────────
  { id: 'photo-grid',         name: 'Photo Grid',          category: 'Media', mockType: 'image', accent: '#00d4ff', lines: ['▓▓ ▓▓ ▓▓','▓▓ ▓▓ ▓▓','CSS MASONRY'] },
  { id: 'before-after-slider',name: 'Before / After',      category: 'Media', mockType: 'image', accent: '#00ff88', lines: ['▓▓▓▓ ◄╋► ░░░░','BEFORE  AFTER','DRAG TO COMPARE'] },
  { id: 'image-grid-motion',  name: 'Image Grid Motion',   category: 'Media', mockType: 'image', accent: '#7c3aff', lines: ['▓▓▓ ▓▓▓ ▓▓▓','  ↕ HOVER ↕  ','MOTION + DEPTH'] },
  { id: 'image-tilt',         name: 'Image Tilt',          category: 'Media', mockType: 'image', accent: '#ff4400', lines: ['  ▓▓▓▓▓▓▓  ','◄ CURSOR TILT ►','3D PERSPECTIVE'] },
  { id: 'image-trail',        name: 'Image Trail',         category: 'Media', mockType: 'image', accent: '#00d4ff', lines: ['· · ▓▓ · · ·','CURSOR TRAIL','▓▓ IMAGES FOLLOW'] },

  // ─ Animation ──────────────────────────────────────────────────────────────
  { id: 'space-invaders',   name: 'Space Invaders',      category: 'Animation', mockType: 'anim', accent: '#00ff88', lines: ['▓ ▓ ▓ ▓ ▓ ▓','  SHOOT EM UP','LOAD SCREEN FX'] },
  { id: 'logo-reaper',      name: 'Logo Reaper',         category: 'Animation', mockType: 'anim', accent: '#ff4400', lines: ['▓  ▓  ▓  ▓  ▓','STAMP · EXPLODE','DEAD LOGO PILE'] },
  { id: 'ascii-animation',  name: 'ASCII Animation',     category: 'Animation', mockType: 'anim', accent: '#00ff88', lines: ['░▒▓█▓▒░░▒▓█▓','  A S C I I  ','▒▒ TRANSFORMS'] },
  { id: 'chandelier',       name: 'Chandelier',          category: 'Animation', mockType: 'anim', accent: '#7c3aff', lines: ['  ╲ ╲╲ ╲╲╲  ','  ╲ CURSOR  ╲','  ◉ FOLLOWS  '] },
  { id: 'shopifyanomaly',   name: 'Shopify Anomaly',     category: 'Animation', mockType: 'anim', accent: '#ff00ff', lines: ['▓▓▓▓▓▓▓▓▓▓▓','GLITCH  EFFECT','HOVER DISTORT'] },

  // ─ Marketing ──────────────────────────────────────────────────────────────
  { id: 'quotation-builder',         name: 'Quotation Builder',  category: 'Marketing', mockType: 'ui',   accent: '#00d4ff', lines: ['STEP 1 ━━━ 3','[ CHOOSE PLAN ]','$ DYNAMIC PRICE'] },
  { id: 'countdown-timer',           name: 'Simple Countdown',   category: 'Marketing', mockType: 'ui',   accent: '#ff4400', lines: ['23 : 14 : 08','HOURS MIN  SEC','⚡ LAUNCH TIMER'] },
  { id: 'testimonial-carousel-slider',name:'Testimonial Carousel',category:'Marketing', mockType: 'ui',   accent: '#00ff88', lines: ['❝ REVIEW TEXT ❞','◄ ●●○○○○ ►','AUTO · SLIDE'] },
  { id: 'whatsapp-cta',              name: 'WhatsApp CTA',       category: 'Marketing', mockType: 'ui',   accent: '#00ff88', lines: ['●  ONLINE','[ CHAT WITH US ]','⊕ FLOATING BTN'] },

  // ─ UI ─────────────────────────────────────────────────────────────────────
  { id: 'rotating-text',    name: 'Rotating Text',       category: 'UI',    mockType: 'text', accent: '#7c3aff', lines: ['We are a ▓▓▓','  Studio  ','◆ Agency ◆'] },
  { id: 'tabbed-content',   name: 'Tabbed Content',      category: 'UI',    mockType: 'ui',   accent: '#00d4ff', lines: ['[TAB1][TAB2][TAB3]','━━━━━━━━━━━━━','▒▒▒ CONTENT ▒▒▒'] },
  { id: 'timeline',         name: 'Timeline',            category: 'UI',    mockType: 'ui',   accent: '#ff4400', lines: ['2020 ●━━━━━━','2022 ●━━━━','2024 ●'] },
  { id: 'distorted-links',  name: 'Distorted Links',     category: 'UI',    mockType: 'text', accent: '#ff00ff', lines: ['A B O U T','↕ HOVER ↕  ','▓ GLITCH FX ▓'] },
  { id: 'mouse-target-focus',name:'Mouse Target Focus',  category: 'UI',    mockType: 'ui',   accent: '#00d4ff', lines: ['◯  CURSOR','◯ → ◎ FOCUS','TARGET TRACKED'] },
  { id: 'particles-button', name: 'Particles Button',    category: 'UI',    mockType: 'ui',   accent: '#7c3aff', lines: ['  [ CLICK ME ]  ','·  ✦ · ✦ · ✦','BURST ON CLICK'] },
  { id: 'split-hover',      name: 'Split Hover',         category: 'UI',    mockType: 'image',accent: '#ff00ff', lines: ['▓▓▓▓▓ ░░░░░','  ◄ HOVER ►  ','SPLIT REVEAL'] },

  // ─ SEO ────────────────────────────────────────────────────────────────────
  { id: 'seo-modals',       name: 'SEO Modals',          category: 'SEO',   mockType: 'seo',  accent: '#00d4ff', lines: ['TITLE ████ 60','DESC  ████ 155','◉ SCHEMA OK'] },
  { id: 'alt-engine',       name: 'Alt Engine',          category: 'SEO',   mockType: 'seo',  accent: '#00ff88', lines: ['IMG: ▓▓▓▓.jpg','ALT: "hero..."','◉ AUTO-TAGGED'] },

  // ─ Compliance ─────────────────────────────────────────────────────────────
  { id: 'cookie-banner',    name: 'Cookie Banner',       category: 'Compliance', mockType: 'ui', accent: '#ff4400', lines: ['🍪 WE USE COOKIES','[ACCEPT] [DECLINE]','GDPR · LGPD'] },
];

// ─── HTML template ────────────────────────────────────────────────────────────
function buildHTML(plugin) {
  const { name, category, accent, lines } = plugin;
  const dim = accent + '22'; // dim version for grid

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 400px; height: 300px; overflow: hidden;
    background: #07070d;
    font-family: 'Courier New', 'Consolas', monospace;
  }

  /* ── scanline overlay ── */
  body::after {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
    z-index: 10;
  }

  /* ── dot grid ── */
  .grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, ${dim} 1px, transparent 1px);
    background-size: 20px 20px;
  }

  /* ── corner decorations ── */
  .corner {
    position: absolute;
    width: 18px; height: 18px;
    border-color: ${accent};
    border-style: solid;
    opacity: 0.6;
  }
  .corner.tl { top: 14px; left: 14px; border-width: 2px 0 0 2px; }
  .corner.tr { top: 14px; right: 14px; border-width: 2px 2px 0 0; }
  .corner.bl { bottom: 14px; left: 14px; border-width: 0 0 2px 2px; }
  .corner.br { bottom: 14px; right: 14px; border-width: 0 2px 2px 0; }

  /* ── category badge ── */
  .badge {
    position: absolute;
    top: 18px; right: 24px;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${accent};
    opacity: 0.7;
    border: 1px solid ${accent}55;
    padding: 2px 7px;
    border-radius: 2px;
  }

  /* ── center mock UI ── */
  .mock {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -58%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 280px;
  }

  .mock-line {
    font-size: 12px;
    letter-spacing: 0.12em;
    color: ${accent};
    text-shadow: 0 0 10px ${accent}88, 0 0 20px ${accent}44;
    white-space: nowrap;
    opacity: 0.9;
  }
  .mock-line:nth-child(2) { opacity: 0.65; font-size: 11px; }
  .mock-line:nth-child(3) { opacity: 0.4;  font-size: 10px; }

  /* ── horizontal rule ── */
  .rule {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, 10px);
    width: 200px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${accent}66, transparent);
  }

  /* ── plugin name ── */
  .name {
    position: absolute;
    bottom: 38px; left: 0; right: 0;
    text-align: center;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #ffffff;
    text-shadow: 0 0 18px ${accent}88;
    text-transform: uppercase;
  }

  /* ── Anavo wordmark ── */
  .brand {
    position: absolute;
    bottom: 18px; left: 0; right: 0;
    text-align: center;
    font-size: 9px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #ffffff44;
  }
  .brand span {
    color: ${accent}99;
  }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="badge">${category}</div>

  <div class="mock">
    ${lines.map((l, i) => `<div class="mock-line">${l}</div>`).join('\n    ')}
  </div>
  <div class="rule"></div>

  <div class="name">${name}</div>
  <div class="brand"><span>ANAVO</span> TECH</div>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const target = process.argv[2]; // optional: single plugin id
  const list   = target ? PLUGINS.filter(p => p.id === target) : PLUGINS;

  if (list.length === 0) {
    console.error(`Plugin not found: ${target}`);
    process.exit(1);
  }

  console.log(`\n🎮 Anavo Thumbnail Generator — ${list.length} plugin(s)\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 300, deviceScaleFactor: 2 }); // 2x = 800×600 retina

  let done = 0;
  for (const plugin of list) {
    const html = buildHTML(plugin);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Small pause so CSS renders (scanlines, glow etc)
    await new Promise(r => setTimeout(r, 80));

    const outPath = path.join(OUT_DIR, `${plugin.id}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    done++;
    console.log(`  ✓  [${String(done).padStart(2, '0')}/${list.length}]  ${plugin.id}.png`);
  }

  await browser.close();
  console.log(`\n✅ Done — thumbnails saved to: thumbnails/\n`);
}

run().catch(err => { console.error(err); process.exit(1); });
