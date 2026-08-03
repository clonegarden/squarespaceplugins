/**
 * =======================================
 * SEO MODALS - Squarespace Plugin
 * =======================================
 * @version 2.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Onassis Signature System: "+" Quick Info + "?" FAQ modals for every page.
 *
 * v2.0.0 — BREAKING: brought in line with the copy-paste widget standard
 * (01-SEO-Clients/WIDGETS-SHARED.md v3, /seo skill §3.4-3.6):
 *   - namespace is now seo-anavo-* / seoAnavo*, never bare anavo-* (which
 *     collides with client-installed anavo-* plugins and froze AB Social)
 *   - panels are full-height right-hand drawers with an overlay, not cards
 *   - z-index 2147483001 / 2147483000 / 2147482000, above sticky headers
 *   - the three hardening rules: [hidden] honoured, idempotent teardown,
 *     foreign-id guard on open
 *   - WCAG-safe style extraction (no more washed-out or white-on-white text)
 *   - dofollow .secret-link credit in the panel footer
 * Schema stays OUT of scope on purpose: FAQ JSON-LD is still injected here for
 * back-compat, but speakable and the rest belong in the static pasted blocks,
 * because JS-injected JSON-LD is unreliable for Google.
 * Reads client config from Anavo API (api.anavo.tech) based on current domain.
 * Auto-extracts site fonts and colors for seamless style matching.
 *
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/seo-modals/seo-modals.min.js"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '2.0.0';
  const PLUGIN_NAME = 'SeoModals';

  console.log(`📊 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // 1. PARSE PARAMETERS
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function fixColor(color) {
    if (!color) return null;
    color = decodeURIComponent(color);
    if (color.toLowerCase() === 'transparent') return 'transparent';
    if (color.startsWith('rgba(') || color.startsWith('rgb(')) return color;
    if (/^[0-9A-Fa-f]{6}$/.test(color)) return '#' + color;
    if (color.startsWith('#')) return color;
    return color;
  }

  function dbg(msg, data) {
    if (config && config.debug) {
      console.log(`[${PLUGIN_NAME}] ${msg}`, data !== undefined ? data : '');
    }
  }

  function getScriptParams() {
    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const p = url.searchParams;
      return {
        apiBase:    p.get('apiBase')    || 'https://api.anavo.tech',
        accentColor: fixColor(p.get('accentColor')) || null,
        debug:      p.get('debug') === 'true',
        fadeDelay:  parseInt(p.get('fadeDelay')  || '5000', 10),
        dwellTime:  parseInt(p.get('dwellTime')  || '5000', 10),
      };
    } catch (_e) {
      return {
        apiBase:    'https://api.anavo.tech',
        accentColor: null,
        debug:      false,
        fadeDelay:  5000,
        dwellTime:  5000,
      };
    }
  }

  const config = getScriptParams();

  // ========================================
  // 2. STYLE EXTRACTION
  // ========================================

  // WCAG-safe extraction (WIDGETS-SHARED v3 behaviour).
  // A colour lifted off the page is only trusted if it actually contrasts with
  // the panel background. Copying body.color blindly is what produced washed-out
  // and white-on-white panel text on sites whose body text sits over a dark hero.
  function extractSiteStyles() {
    try {
      const body   = document.body;
      const h1     = document.querySelector('h1') || body;
      const bs     = getComputedStyle(body);
      const h1s    = getComputedStyle(h1);
      const root   = document.documentElement;

      function toRGB(s) {
        const m = (s || '').match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(',').map(parseFloat);
        if (p.length >= 4 && p[3] === 0) return null; // fully transparent
        return { r: p[0], g: p[1], b: p[2] };
      }
      function lum(c) {
        const a = [c.r, c.g, c.b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
      }
      function ratio(x, y) {
        const L1 = lum(x), L2 = lum(y);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      }
      function rgbStr(c) { return `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`; }

      const bg      = toRGB(bs.backgroundColor) || { r: 255, g: 255, b: 255 };
      const safeInk = lum(bg) > 0.45 ? { r: 44, g: 40, b: 37 } : { r: 245, g: 242, b: 238 };
      const safeColor = candidate => {
        const c = toRGB(candidate);
        return (!c || ratio(c, bg) < 3.5) ? safeInk : c;
      };

      const font    = bs.fontFamily || 'sans-serif';
      const text    = rgbStr(safeColor(bs.color));
      const heading = rgbStr(safeColor(h1s.color || bs.color));
      const accent  = config.accentColor || heading;

      root.style.setProperty('--onassis-font',    font);
      root.style.setProperty('--onassis-bg',      rgbStr(bg));
      root.style.setProperty('--onassis-text',    text);
      root.style.setProperty('--onassis-heading', heading);
      root.style.setProperty('--onassis-accent',  accent);

      dbg('Styles extracted', { font, text, bg: rgbStr(bg), heading, accent });
    } catch (e) {
      dbg('Style extraction failed', e.message);
    }
  }

  // ========================================
  // 3. SUPABASE CONFIG FETCH
  // ========================================

  async function fetchClientConfig() {
    const domain = window.location.hostname.replace(/^www\./, '');
    const url = `${config.apiBase}/api/seo/config?domain=${encodeURIComponent(domain)}`;

    dbg('Fetching config from', url);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      dbg('Config received', data);
      return data;
    } catch (e) {
      dbg('Config fetch failed', e.message);
      return null;
    }
  }

  // Derive page key from pathname
  function getPageKey() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === '') return 'home';
    return path.replace(/^\//, '').split('/')[0] || 'home';
  }

  // ========================================
  // 4. CSS INJECTION
  // ========================================

  function injectStyles() {
    if (document.getElementById('seo-anavo-styles')) return;

    const css = `
/* ============================
   ANAVO SEO MODALS v${PLUGIN_VERSION}
   ============================ */

/* --- Trigger Buttons --- */
.seo-anavo-triggers {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  z-index: 2147482000 !important;
  transition: opacity 0.4s ease !important;
}
.seo-anavo-triggers.seo-anavo-faded {
  opacity: 0 !important;
  pointer-events: none !important;
}
.seo-anavo-trigger-btn {
  width: 42px !important;
  height: 42px !important;
  border-radius: 50% !important;
  border: 2px solid var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  background: var(--onassis-bg, #ffffff) !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  font-family: var(--onassis-font, sans-serif) !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background 0.2s, color 0.2s, transform 0.2s !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
}
.seo-anavo-trigger-btn:hover {
  background: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  color: var(--onassis-bg, #ffffff) !important;
  transform: scale(1.08) !important;
}

/* --- Overlay --- */
.seo-anavo-panel-overlay {
  display: none !important;
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0,0,0,0.4) !important;
  backdrop-filter: blur(2px) !important;
  z-index: 2147483000 !important;
}
.seo-anavo-panel-overlay.seo-anavo-open { display: block !important; }

/* --- Panels: sidebar drawer, matching WIDGETS-SHARED v3 --- */
/* HARDENING #1: honour the "hidden" attribute even though we set display:flex */
.seo-anavo-panel[hidden] { display: none !important; }
.seo-anavo-panel {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  width: 360px !important;
  max-width: 100vw !important;
  height: 100dvh !important;
  background: var(--onassis-bg, #ffffff) !important;
  color: var(--onassis-text, #1a1a1a) !important;
  font-family: var(--onassis-font, sans-serif) !important;
  box-shadow: -8px 0 24px rgba(0,0,0,0.12) !important;
  z-index: 2147483001 !important;
  transform: translateX(100%) !important;
  transition: transform 0.25s ease !important;
  display: flex !important;
  flex-direction: column !important;
}
.seo-anavo-panel.seo-anavo-open {
  transform: translateX(0) !important;
}

/* --- Panel Header --- */
.seo-anavo-panel-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 14px 16px 10px !important;
  border-bottom: 1px solid rgba(0,0,0,0.1) !important;
  position: sticky !important;
  top: 0 !important;
  background: var(--onassis-bg, #ffffff) !important;
  z-index: 1 !important;
}
.seo-anavo-panel-title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  margin: 0 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}
.seo-anavo-close-btn {
  background: none !important;
  border: none !important;
  font-size: 18px !important;
  line-height: 1 !important;
  cursor: pointer !important;
  color: var(--onassis-text, #1a1a1a) !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  transition: background 0.15s !important;
}
.seo-anavo-close-btn:hover {
  background: rgba(0,0,0,0.08) !important;
}

/* --- Panel Body --- */
.seo-anavo-panel-body {
  padding: 12px 16px 16px !important;
  flex: 1 !important;
  overflow-y: auto !important;
}

/* --- Info Panel Sections --- */
.seo-anavo-section {
  margin-bottom: 14px !important;
}
.seo-anavo-section-title {
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  margin: 0 0 6px !important;
  padding-bottom: 4px !important;
  border-bottom: 1px solid rgba(0,0,0,0.08) !important;
}
.seo-anavo-nav-list {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
.seo-anavo-nav-list li a {
  color: var(--onassis-text, #1a1a1a) !important;
  text-decoration: none !important;
  font-size: 13px !important;
  display: block !important;
  padding: 3px 0 !important;
  transition: color 0.15s !important;
}
.seo-anavo-nav-list li a:hover {
  color: var(--onassis-accent, var(--onassis-heading, #1a1a1a)) !important;
}
.seo-anavo-summary {
  font-size: 13px !important;
  line-height: 1.6 !important;
  color: var(--onassis-text, #1a1a1a) !important;
  margin: 0 !important;
  opacity: 0.85 !important;
}
.seo-anavo-contact p {
  font-size: 13px !important;
  margin: 3px 0 !important;
  color: var(--onassis-text, #1a1a1a) !important;
}
.seo-anavo-contact a {
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  text-decoration: none !important;
}

/* --- FAQ Panel --- */
.seo-anavo-faq-item {
  border-bottom: 1px solid rgba(0,0,0,0.08) !important;
}
.seo-anavo-faq-item:last-child {
  border-bottom: none !important;
}
.seo-anavo-faq-item summary {
  font-size: 13px !important;
  font-weight: 600 !important;
  padding: 10px 0 !important;
  cursor: pointer !important;
  list-style: none !important;
  color: var(--onassis-text, #1a1a1a) !important;
  display: flex !important;
  align-items: flex-start !important;
  gap: 8px !important;
  line-height: 1.4 !important;
}
.seo-anavo-faq-item summary::-webkit-details-marker { display: none !important; }
.seo-anavo-faq-item summary::before {
  content: '+' !important;
  flex-shrink: 0 !important;
  font-size: 16px !important;
  line-height: 1.2 !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  transition: transform 0.2s !important;
}
.seo-anavo-faq-item[open] summary::before {
  content: '−' !important;
}
.seo-anavo-faq-answer {
  font-size: 13px !important;
  line-height: 1.6 !important;
  padding: 0 0 10px 24px !important;
  color: var(--onassis-text, #1a1a1a) !important;
  opacity: 0.85 !important;
}

/* --- Panel Footer --- */
.seo-anavo-panel-footer {
  padding: 12px 16px !important;
  font-size: 11px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 8px !important;
  color: var(--onassis-text, #1a1a1a) !important;
  opacity: 0.6 !important;
  letter-spacing: 0.04em !important;
  border-top: 1px solid rgba(0,0,0,0.07) !important;
}
.seo-anavo-keyboard-hint {
  font-family: 'Inconsolata', 'Courier New', monospace !important;
}
/* Credit link — dofollow, visible, low-key */
.secret-link {
  color: inherit !important;
  text-decoration: none !important;
  cursor: default !important;
}

/* --- Accessibility Controls --- */
.seo-anavo-a11y-bar {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 8px 16px !important;
  border-top: 1px solid rgba(0,0,0,0.07) !important;
  background: var(--onassis-bg, #ffffff) !important;
}
.seo-anavo-a11y-label {
  font-size: 10px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  opacity: 0.5 !important;
  color: var(--onassis-text, #1a1a1a) !important;
  margin-right: 2px !important;
  flex-shrink: 0 !important;
}
.seo-anavo-a11y-btn {
  background: none !important;
  border: 1px solid rgba(0,0,0,0.2) !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  color: var(--onassis-text, #1a1a1a) !important;
  padding: 2px 7px !important;
  font-family: var(--onassis-font, sans-serif) !important;
  font-size: 11px !important;
  line-height: 1.6 !important;
  transition: background 0.15s, color 0.15s !important;
}
.seo-anavo-a11y-btn:hover,
.seo-anavo-a11y-btn.seo-anavo-active {
  background: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  color: var(--onassis-bg, #ffffff) !important;
  border-color: transparent !important;
}
.seo-anavo-a11y-divider {
  width: 1px !important;
  height: 16px !important;
  background: rgba(0,0,0,0.15) !important;
  margin: 0 2px !important;
}
/* Font size — target each text element explicitly */
.seo-anavo-font-125 .seo-anavo-nav-list li a,
.seo-anavo-font-125 .seo-anavo-summary,
.seo-anavo-font-125 .seo-anavo-contact p,
.seo-anavo-font-125 .seo-anavo-faq-item summary,
.seo-anavo-font-125 .seo-anavo-faq-answer { font-size: 16px !important; }
.seo-anavo-font-125 .seo-anavo-section-title { font-size: 13px !important; }

.seo-anavo-font-150 .seo-anavo-nav-list li a,
.seo-anavo-font-150 .seo-anavo-summary,
.seo-anavo-font-150 .seo-anavo-contact p,
.seo-anavo-font-150 .seo-anavo-faq-item summary,
.seo-anavo-font-150 .seo-anavo-faq-answer { font-size: 19px !important; }
.seo-anavo-font-150 .seo-anavo-section-title { font-size: 15px !important; }
/* High contrast scoped to panel */
.seo-anavo-high-contrast {
  background: #000000 !important;
  color: #ffffff !important;
  border-color: #ffffff !important;
}
.seo-anavo-high-contrast .seo-anavo-panel-title,
.seo-anavo-high-contrast .seo-anavo-section-title,
.seo-anavo-high-contrast .seo-anavo-summary,
.seo-anavo-high-contrast .seo-anavo-contact p,
.seo-anavo-high-contrast .seo-anavo-nav-list li a,
.seo-anavo-high-contrast .seo-anavo-panel-footer,
.seo-anavo-high-contrast .seo-anavo-a11y-label {
  color: #ffffff !important;
}
.seo-anavo-high-contrast .seo-anavo-panel-header,
.seo-anavo-high-contrast .seo-anavo-a11y-bar {
  background: #000000 !important;
}
.seo-anavo-high-contrast .seo-anavo-close-btn,
.seo-anavo-high-contrast .seo-anavo-a11y-btn {
  color: #ffffff !important;
  border-color: rgba(255,255,255,0.4) !important;
}
.seo-anavo-high-contrast .seo-anavo-a11y-btn:hover,
.seo-anavo-high-contrast .seo-anavo-a11y-btn.seo-anavo-active {
  background: #ffffff !important;
  color: #000000 !important;
}

/* --- Accessibility --- */
.seo-anavo-panel:focus { outline: none !important; }
.seo-anavo-trigger-btn:focus-visible,
.seo-anavo-close-btn:focus-visible,
.seo-anavo-a11y-btn:focus-visible,
.seo-anavo-nav-list li a:focus-visible,
.seo-anavo-faq-item summary:focus-visible {
  outline: 2px solid var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  outline-offset: 2px !important;
}
@media (prefers-reduced-motion: reduce) {
  .seo-anavo-triggers, .seo-anavo-trigger-btn, .seo-anavo-panel { transition: none !important; }
}
@media (prefers-color-scheme: dark) {
  .seo-anavo-panel {
    background: #1a1a1a !important;
    color: #f0f0f0 !important;
    border-color: rgba(255,255,255,0.2) !important;
  }
  .seo-anavo-panel-header, .seo-anavo-a11y-bar { background: #1a1a1a !important; }
  .seo-anavo-panel-title, .seo-anavo-section-title { color: #f0f0f0 !important; }
  .seo-anavo-nav-list li a, .seo-anavo-summary,
  .seo-anavo-contact p, .seo-anavo-panel-footer,
  .seo-anavo-faq-item summary, .seo-anavo-faq-answer { color: #f0f0f0 !important; }
  .seo-anavo-close-btn, .seo-anavo-a11y-btn, .seo-anavo-a11y-label { color: #f0f0f0 !important; }
  .seo-anavo-a11y-btn { border-color: rgba(255,255,255,0.3) !important; }
  .seo-anavo-trigger-btn {
    background: #1a1a1a !important;
    color: #f0f0f0 !important;
    border-color: rgba(255,255,255,0.4) !important;
  }
}

/* --- Responsive --- */
@media (max-width: 480px) {
  .seo-anavo-panel { width: 100vw !important; }
  .seo-anavo-triggers {
    right: 16px !important;
    bottom: 16px !important;
  }
}
`;

    const style = document.createElement('style');
    style.id = 'seo-anavo-styles';
    style.textContent = css;
    document.head.appendChild(style);
    dbg('Styles injected');
  }

  // ========================================
  // 5. DOM BUILDERS
  // ========================================

  function buildTriggers() {
    const wrap = document.createElement('div');
    wrap.className = 'seo-anavo-triggers';
    wrap.id = 'seo-anavo-triggers';
    wrap.setAttribute('aria-label', 'Page tools');
    wrap.innerHTML = `
      <button class="seo-anavo-trigger-btn" id="seo-anavo-faq-btn"
        aria-label="Frequently Asked Questions — press ?"
        title="FAQ (press ?)">?</button>
      <button class="seo-anavo-trigger-btn" id="seo-anavo-info-btn"
        aria-label="Quick Info — press +"
        title="Quick Info (press +)">+</button>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  function buildPanel(type, titleText, bodyHtml, options = {}) {
    const panel = document.createElement('div');
    // Both the generic class and the per-type class, so the shared selectors
    // (.seo-anavo-faq-panel / .seo-anavo-info-panel) resolve exactly as they do
    // in the pasted WIDGETS-SHARED blocks.
    panel.className = `seo-anavo-panel seo-anavo-${type}-panel`;
    panel.id = `seo-anavo-${type}-panel`;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', `seo-anavo-${type}-title`);
    panel.setAttribute('tabindex', '-1');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('hidden', '');

    const a11yBar = options.accessibility ? `
      <div class="seo-anavo-a11y-bar" role="toolbar" aria-label="Accessibility controls">
        <span class="seo-anavo-a11y-label">Text</span>
        <button class="seo-anavo-a11y-btn seo-anavo-active" data-font="100" aria-label="Normal font size" aria-pressed="true">A</button>
        <button class="seo-anavo-a11y-btn" data-font="125" aria-label="Large font size" aria-pressed="false">A+</button>
        <button class="seo-anavo-a11y-btn" data-font="150" aria-label="Extra large font size" aria-pressed="false">A++</button>
        <div class="seo-anavo-a11y-divider" aria-hidden="true"></div>
        <button class="seo-anavo-a11y-btn" data-contrast="toggle" aria-label="Toggle high contrast" aria-pressed="false">◐</button>
      </div>` : '';

    panel.innerHTML = `
      <div class="seo-anavo-panel-header">
        <h2 class="seo-anavo-panel-title" id="seo-anavo-${type}-title">${titleText}</h2>
        <button class="seo-anavo-close-btn" aria-label="Close panel">&times;</button>
      </div>
      <div class="seo-anavo-panel-body">${bodyHtml}</div>
      ${a11yBar}
      <div class="seo-anavo-panel-footer">
        <span class="seo-anavo-keyboard-hint">${type === 'faq' ? '?' : '+'} to open · Esc to close</span>
        <a href="https://www.onassiswebmedia.com" class="secret-link"><span class="seo-anavo-credit">Built by Onassis Web Media</span></a>
      </div>
    `;

    document.body.appendChild(panel);
    panel.querySelector('.seo-anavo-close-btn').addEventListener('click', () => closePanel(type));

    if (options.accessibility) bindA11yControls(panel);

    return panel;
  }

  function bindA11yControls(panel) {
    // Font size buttons
    panel.querySelectorAll('[data-font]').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.font;
        panel.classList.remove('seo-anavo-font-125', 'seo-anavo-font-150');
        if (size !== '100') panel.classList.add(`seo-anavo-font-${size}`);
        panel.querySelectorAll('[data-font]').forEach(b => {
          b.classList.remove('seo-anavo-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('seo-anavo-active');
        btn.setAttribute('aria-pressed', 'true');
      });
    });

    // High contrast toggle
    const contrastBtn = panel.querySelector('[data-contrast]');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => {
        const on = panel.classList.toggle('seo-anavo-high-contrast');
        contrastBtn.classList.toggle('seo-anavo-active', on);
        contrastBtn.setAttribute('aria-pressed', String(on));
      });
    }
  }

  function buildInfoBody(pageData, nap) {
    // Page navigation from headings
    const headings = Array.from(document.querySelectorAll('h2, h3')).slice(0, 8);
    let navHtml = '';
    if (headings.length) {
      const items = headings.map(h => {
        const id = h.id || h.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        if (!h.id) h.id = id;
        return `<li><a href="#${id}">${h.textContent.trim()}</a></li>`;
      }).join('');
      navHtml = `
        <div class="seo-anavo-section">
          <p class="seo-anavo-section-title">On This Page</p>
          <ul class="seo-anavo-nav-list">${items}</ul>
        </div>`;
    }

    // Summary (keyword-rich descriptive text — replaces raw tag list)
    const summary = pageData && pageData.summary ? pageData.summary : null;
    let summaryHtml = '';
    if (summary) {
      summaryHtml = `
        <div class="seo-anavo-section">
          <p class="seo-anavo-summary">${summary}</p>
        </div>`;
    }

    // Contact / NAP
    let contactHtml = '';
    if (nap) {
      const parts = [];
      if (nap.phone)   parts.push(`<p>📞 <a href="tel:${nap.phone}">${nap.phone}</a></p>`);
      if (nap.email)   parts.push(`<p>✉️ <a href="mailto:${nap.email}">${nap.email}</a></p>`);
      if (nap.address) {
        const addr = typeof nap.address === 'object'
          ? [nap.address.city, nap.address.state, nap.address.country].filter(Boolean).join(', ')
          : nap.address;
        if (addr) parts.push(`<p>📍 ${addr}</p>`);
      }
      if (parts.length) {
        contactHtml = `
          <div class="seo-anavo-section">
            <p class="seo-anavo-section-title">Contact</p>
            <div class="seo-anavo-contact">${parts.join('')}</div>
          </div>`;
      }
    }

    return navHtml + summaryHtml + contactHtml ||
      '<p style="font-size:13px;opacity:0.7">No additional info for this page.</p>';
  }

  function buildFaqBody(faqItems) {
    if (!faqItems || !faqItems.length) {
      return '<p style="font-size:13px;opacity:0.7">No FAQs available for this page.</p>';
    }
    return faqItems.map(item => `
      <details class="seo-anavo-faq-item">
        <summary>${item.question || item.q || ''}</summary>
        <div class="seo-anavo-faq-answer">${item.answer || item.a || ''}</div>
      </details>
    `).join('');
  }

  // ========================================
  // 6. PANEL STATE
  // ========================================

  let _anyOpen      = false;
  let _initialDone  = false;
  let _initialTimer = null;
  let _triggerWrap  = null;

  // aria-live region for screen reader announcements
  function getOrCreateLiveRegion() {
    let el = document.getElementById('seo-anavo-live');
    if (!el) {
      el = document.createElement('div');
      el.id = 'seo-anavo-live';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
      document.body.appendChild(el);
    }
    return el;
  }

  function announce(msg) {
    const el = getOrCreateLiveRegion();
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 50);
  }

  // Focus trap — keep Tab inside open panel
  function trapFocus(panel) {
    const focusable = panel.querySelectorAll(
      'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (!panel.classList.contains('seo-anavo-open')) {
        panel.removeEventListener('keydown', handler);
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
    panel.addEventListener('keydown', handler);
  }

  // Overlay behind the drawer — created lazily, clicking it closes.
  function ensureOverlay() {
    let o = document.querySelector('.seo-anavo-panel-overlay');
    if (!o) {
      o = document.createElement('div');
      o.className = 'seo-anavo-panel-overlay';
      o.addEventListener('click', () => { closePanel('info'); closePanel('faq'); });
      document.body.appendChild(o);
    }
    return o;
  }

  function openPanel(type) {
    const panel = document.getElementById(`seo-anavo-${type}-panel`);
    // HARDENING #3: only ever drive OUR panels. A foreign element that happens
    // to share the id can't get hold of the modal machinery.
    if (!panel || !panel.classList.contains('seo-anavo-panel')) return;

    // close the other panel silently
    const other = type === 'info' ? 'faq' : 'info';
    const otherPanel = document.getElementById(`seo-anavo-${other}-panel`);
    if (otherPanel) {
      otherPanel.classList.remove('seo-anavo-open');
      otherPanel.setAttribute('aria-hidden', 'true');
      otherPanel.setAttribute('hidden', '');
    }

    ensureOverlay().classList.add('seo-anavo-open');
    panel.removeAttribute('hidden');
    panel.setAttribute('aria-hidden', 'false');
    // next frame, so the transform transition actually runs
    requestAnimationFrame(() => panel.classList.add('seo-anavo-open'));
    document.body.style.overflow = 'hidden';
    _anyOpen = true;

    if (_triggerWrap) _triggerWrap.classList.remove('seo-anavo-faded');
    if (_initialTimer) { clearTimeout(_initialTimer); _initialTimer = null; }

    // Focus first focusable element inside panel
    const firstFocusable = panel.querySelector('a[href],button:not([disabled])');
    if (firstFocusable) firstFocusable.focus();
    else panel.focus();

    trapFocus(panel);

    const label = panel.querySelector('.seo-anavo-panel-title');
    if (label) announce(label.textContent + ' opened');

    dbg(`Panel opened: ${type}`);
  }

  // HARDENING #2: fully idempotent teardown. Always drops the overlay and
  // restores scroll, so a panel can never leave the page locked or frozen,
  // even if called twice or out of order.
  function closePanel(type) {
    const panel = document.getElementById(`seo-anavo-${type}-panel`);
    if (!panel) return;
    panel.classList.remove('seo-anavo-open');
    panel.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!panel.classList.contains('seo-anavo-open')) panel.setAttribute('hidden', '');
    }, 280);

    const other = type === 'info' ? 'faq' : 'info';
    const otherPanel = document.getElementById(`seo-anavo-${other}-panel`);
    _anyOpen = !!(otherPanel && otherPanel.classList.contains('seo-anavo-open'));

    if (!_anyOpen) {
      const o = document.querySelector('.seo-anavo-panel-overlay');
      if (o) o.classList.remove('seo-anavo-open');
      document.body.style.overflow = '';
    }

    if (!_anyOpen && _initialDone && _triggerWrap) {
      _triggerWrap.classList.add('seo-anavo-faded');
    }

    announce('Panel closed');
    // Return focus to trigger button
    const btn = document.getElementById(`seo-anavo-${type === 'info' ? 'info' : 'faq'}-btn`);
    if (btn) btn.focus();

    dbg(`Panel closed: ${type}`);
  }

  // ========================================
  // 7. FADE / VIEWPORT TIMING
  // ========================================

  function initFadeBehavior() {
    if (!_triggerWrap) return;

    // Initial: show for fadeDelay ms, then fade
    _initialTimer = setTimeout(() => {
      if (!_anyOpen) {
        _triggerWrap.classList.add('seo-anavo-faded');
        _initialDone = true;
        dbg('Triggers faded after initial delay');
        initDwellObserver();
      }
    }, config.fadeDelay);
  }

  function initDwellObserver() {
    // Reappear after dwellTime ms of scroll inactivity — works anywhere including footer
    let dwellTimer = null;

    function onScrollIdle() {
      if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; }
      dwellTimer = setTimeout(() => {
        if (!_anyOpen && _triggerWrap) {
          _triggerWrap.classList.remove('seo-anavo-faded');
          dbg('Triggers reappeared after scroll idle');
          setTimeout(() => {
            if (!_anyOpen && _triggerWrap) {
              _triggerWrap.classList.add('seo-anavo-faded');
            }
          }, config.fadeDelay);
        }
      }, config.dwellTime);
    }

    window.addEventListener('scroll', onScrollIdle, { passive: true });
    dbg('Scroll-idle dwell observer active');
  }

  // ========================================
  // 8. KEYBOARD BINDINGS
  // ========================================

  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Don't fire when typing in inputs
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        const panel = document.getElementById('seo-anavo-info-panel');
        if (panel && panel.classList.contains('seo-anavo-open')) closePanel('info');
        else openPanel('info');
      }
      if (e.key === '?') {
        e.preventDefault();
        const panel = document.getElementById('seo-anavo-faq-panel');
        if (panel && panel.classList.contains('seo-anavo-open')) closePanel('faq');
        else openPanel('faq');
      }
      if (e.key === 'Escape') {
        closePanel('info');
        closePanel('faq');
      }
    });
    dbg('Keyboard bindings registered');
  }

  // ========================================
  // 9. FAQ JSON-LD SCHEMA INJECTION
  // ========================================

  function injectFaqSchema(faqItems) {
    if (!faqItems || !faqItems.length) return;
    const existing = document.getElementById('seo-anavo-faq-schema');
    if (existing) existing.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqItems.map(item => ({
        '@type': 'Question',
        'name': item.question || item.q || '',
        'acceptedAnswer': { '@type': 'Answer', 'text': item.answer || item.a || '' }
      }))
    };

    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'seo-anavo-faq-schema';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
    dbg('FAQ schema injected', faqItems.length + ' items');
  }

  // ========================================
  // 10. LICENSING
  // ========================================

  async function loadLicensing() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const script = document.createElement('script');
      const _d = new Date();
      const _v = `${_d.getFullYear()}${String(_d.getMonth()+1).padStart(2,'0')}${String(_d.getDate()).padStart(2,'0')}`;
      script.src = `https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js?v=${_v}`;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
        licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
        showUI: true,
      });

      await lm.init();

      if (!lm.isLicensed) {
        const triggers = document.getElementById('seo-anavo-triggers');
        if (triggers) lm.insertWatermark(triggers);
      }
    } catch (e) {
      console.warn(`⚠️ ${PLUGIN_NAME}: License check failed`, e.message);
    }
  }

  // ========================================
  // 11. MAIN INIT
  // ========================================

  async function init() {
    console.log(`🔧 ${PLUGIN_NAME}: Starting initialization...`);

    // Extract site styles first
    extractSiteStyles();

    // Inject CSS
    injectStyles();

    // Fetch client config from Anavo API
    const clientConfig = await fetchClientConfig();

    const pageKey = getPageKey();
    const pageData = clientConfig && clientConfig.client_pages
      ? (clientConfig.client_pages[pageKey] || clientConfig.client_pages['home'] || null)
      : null;
    const nap     = clientConfig ? clientConfig.nap     : null;
    const faqItems = pageData    ? pageData.faq         : null;

    dbg('Page key', pageKey);
    dbg('Page data', pageData);

    // Inject FAQ JSON-LD schema
    injectFaqSchema(faqItems);

    // Build trigger buttons
    _triggerWrap = buildTriggers();

    // Build Info panel
    const infoBody = buildInfoBody(pageData, nap);
    const infoTitle = (pageData && pageData.title) || document.title || 'Quick Info';
    buildPanel('info', infoTitle, infoBody, { accessibility: true });

    // Build FAQ panel
    const faqBody = buildFaqBody(faqItems);
    buildPanel('faq', 'Frequently Asked Questions', faqBody);

    // Wire trigger buttons
    document.getElementById('seo-anavo-info-btn').addEventListener('click', () => {
      const panel = document.getElementById('seo-anavo-info-panel');
      if (panel && panel.classList.contains('seo-anavo-open')) closePanel('info');
      else openPanel('info');
    });
    document.getElementById('seo-anavo-faq-btn').addEventListener('click', () => {
      const panel = document.getElementById('seo-anavo-faq-panel');
      if (panel && panel.classList.contains('seo-anavo-open')) closePanel('faq');
      else openPanel('faq');
    });

    // Keyboard + fade behavior
    bindKeyboard();
    initFadeBehavior();

    // Async licensing (non-blocking)
    loadLicensing();

    console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Namespaced globals — seoAnavo*, NOT anavo* (collision-proof), same surface
  // the pasted WIDGETS-SHARED blocks expose so per-page HTML can drive the
  // plugin's panels interchangeably.
  window.seoAnavoOpen  = function (id) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el || !el.classList.contains('seo-anavo-panel')) return;
    openPanel(el.classList.contains('seo-anavo-faq-panel') ? 'faq' : 'info');
  };
  window.seoAnavoClose = function () { closePanel('info'); closePanel('faq'); };
  window.seoAnavoFont  = function (scale) {
    document.querySelectorAll('.seo-anavo-panel').forEach(p => {
      p.classList.remove('seo-anavo-font-125', 'seo-anavo-font-150');
      if (scale === 125 || scale === '125') p.classList.add('seo-anavo-font-125');
      if (scale === 150 || scale === '150') p.classList.add('seo-anavo-font-150');
    });
  };
  window.seoAnavoHC = function () {
    document.querySelectorAll('.seo-anavo-panel').forEach(p => p.classList.toggle('seo-anavo-high-contrast'));
  };

})();
