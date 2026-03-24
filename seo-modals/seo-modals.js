/**
 * =======================================
 * SEO MODALS - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Onassis Signature System: "+" Quick Info + "?" FAQ modals for every page.
 * Reads client config from Anavo API (api.anavo.tech) based on current domain.
 * Auto-extracts site fonts and colors for seamless style matching.
 *
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/seo-modals/seo-modals.min.js"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
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

  function extractSiteStyles() {
    try {
      const body   = document.body;
      const h1     = document.querySelector('h1') || body;
      const anchor = document.querySelector('a')  || body;
      const bs     = getComputedStyle(body);
      const h1s    = getComputedStyle(h1);
      const as_    = getComputedStyle(anchor);

      const font    = bs.fontFamily || 'sans-serif';
      const text    = bs.color      || '#1a1a1a';
      const bg      = bs.backgroundColor || '#ffffff';
      const heading = h1s.color     || text;
      const accent  = config.accentColor || as_.color || heading;

      const root = document.documentElement;
      root.style.setProperty('--onassis-font',    font);
      root.style.setProperty('--onassis-text',    text);
      root.style.setProperty('--onassis-bg',      bg);
      root.style.setProperty('--onassis-heading', heading);
      root.style.setProperty('--onassis-accent',  accent);

      dbg('Styles extracted', { font, text, bg, heading, accent });
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
    if (document.getElementById('anavo-seo-styles')) return;

    const css = `
/* ============================
   ANAVO SEO MODALS v${PLUGIN_VERSION}
   ============================ */

/* --- Trigger Buttons --- */
.anavo-seo-triggers {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  z-index: 9999 !important;
  transition: opacity 0.4s ease !important;
}
.anavo-seo-triggers.anavo-seo-faded {
  opacity: 0 !important;
  pointer-events: none !important;
}
.anavo-seo-btn {
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
.anavo-seo-btn:hover {
  background: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  color: var(--onassis-bg, #ffffff) !important;
  transform: scale(1.08) !important;
}

/* --- Panels --- */
.anavo-seo-panel {
  position: fixed !important;
  bottom: 80px !important;
  right: 24px !important;
  width: 320px !important;
  max-height: 70vh !important;
  overflow-y: auto !important;
  background: var(--onassis-bg, #ffffff) !important;
  color: var(--onassis-text, #1a1a1a) !important;
  font-family: var(--onassis-font, sans-serif) !important;
  border: 1px solid var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
  z-index: 10000 !important;
  display: none !important;
  flex-direction: column !important;
}
.anavo-seo-panel.anavo-seo-open {
  display: flex !important;
}

/* --- Panel Header --- */
.anavo-seo-panel-header {
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
.anavo-seo-panel-title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  margin: 0 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}
.anavo-seo-close {
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
.anavo-seo-close:hover {
  background: rgba(0,0,0,0.08) !important;
}

/* --- Panel Body --- */
.anavo-seo-panel-body {
  padding: 12px 16px 16px !important;
  flex: 1 !important;
  overflow-y: auto !important;
}

/* --- Info Panel Sections --- */
.anavo-seo-section {
  margin-bottom: 14px !important;
}
.anavo-seo-section-title {
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  margin: 0 0 6px !important;
  padding-bottom: 4px !important;
  border-bottom: 1px solid rgba(0,0,0,0.08) !important;
}
.anavo-seo-nav-list {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
.anavo-seo-nav-list li a {
  color: var(--onassis-text, #1a1a1a) !important;
  text-decoration: none !important;
  font-size: 13px !important;
  display: block !important;
  padding: 3px 0 !important;
  transition: color 0.15s !important;
}
.anavo-seo-nav-list li a:hover {
  color: var(--onassis-accent, var(--onassis-heading, #1a1a1a)) !important;
}
.anavo-seo-tags {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
}
.anavo-seo-tag {
  font-size: 11px !important;
  padding: 3px 8px !important;
  border: 1px solid var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  border-radius: 20px !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  white-space: nowrap !important;
}
.anavo-seo-contact p {
  font-size: 13px !important;
  margin: 3px 0 !important;
  color: var(--onassis-text, #1a1a1a) !important;
}
.anavo-seo-contact a {
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  text-decoration: none !important;
}

/* --- FAQ Panel --- */
.anavo-seo-faq-item {
  border-bottom: 1px solid rgba(0,0,0,0.08) !important;
}
.anavo-seo-faq-item:last-child {
  border-bottom: none !important;
}
.anavo-seo-faq-item summary {
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
.anavo-seo-faq-item summary::-webkit-details-marker { display: none !important; }
.anavo-seo-faq-item summary::before {
  content: '+' !important;
  flex-shrink: 0 !important;
  font-size: 16px !important;
  line-height: 1.2 !important;
  color: var(--onassis-accent, var(--onassis-text, #1a1a1a)) !important;
  transition: transform 0.2s !important;
}
.anavo-seo-faq-item[open] summary::before {
  content: '−' !important;
}
.anavo-seo-faq-answer {
  font-size: 13px !important;
  line-height: 1.6 !important;
  padding: 0 0 10px 24px !important;
  color: var(--onassis-text, #1a1a1a) !important;
  opacity: 0.85 !important;
}

/* --- Panel Footer --- */
.anavo-seo-panel-footer {
  padding: 8px 16px !important;
  font-size: 10px !important;
  text-align: center !important;
  color: var(--onassis-text, #1a1a1a) !important;
  opacity: 0.45 !important;
  border-top: 1px solid rgba(0,0,0,0.07) !important;
}

/* --- Accessibility --- */
.anavo-seo-panel:focus { outline: 2px solid var(--onassis-accent, #000) !important; }
@media (prefers-reduced-motion: reduce) {
  .anavo-seo-triggers, .anavo-seo-btn { transition: none !important; }
}

/* --- Responsive --- */
@media (max-width: 800px) {
  .anavo-seo-panel {
    width: calc(100vw - 32px) !important;
    right: 16px !important;
    bottom: 72px !important;
    max-height: 60vh !important;
  }
  .anavo-seo-triggers {
    right: 16px !important;
    bottom: 16px !important;
  }
}
@media (max-width: 480px) {
  .anavo-seo-panel {
    width: calc(100vw - 24px) !important;
    right: 12px !important;
  }
  .anavo-seo-triggers {
    right: 12px !important;
    bottom: 12px !important;
  }
}
`;

    const style = document.createElement('style');
    style.id = 'anavo-seo-styles';
    style.textContent = css;
    document.head.appendChild(style);
    dbg('Styles injected');
  }

  // ========================================
  // 5. DOM BUILDERS
  // ========================================

  function buildTriggers() {
    const wrap = document.createElement('div');
    wrap.className = 'anavo-seo-triggers';
    wrap.id = 'anavo-seo-triggers';
    wrap.setAttribute('aria-label', 'Page tools');
    wrap.innerHTML = `
      <button class="anavo-seo-btn" id="anavo-seo-faq-btn"
        aria-label="Frequently Asked Questions — press ?"
        title="FAQ (press ?)">?</button>
      <button class="anavo-seo-btn" id="anavo-seo-info-btn"
        aria-label="Quick Info — press +"
        title="Quick Info (press +)">+</button>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  function buildPanel(type, titleText, bodyHtml) {
    const panel = document.createElement('div');
    panel.className = 'anavo-seo-panel';
    panel.id = `anavo-seo-${type}-panel`;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', `anavo-seo-${type}-title`);
    panel.setAttribute('tabindex', '-1');

    panel.innerHTML = `
      <div class="anavo-seo-panel-header">
        <h2 class="anavo-seo-panel-title" id="anavo-seo-${type}-title">${titleText}</h2>
        <button class="anavo-seo-close" aria-label="Close panel">&times;</button>
      </div>
      <div class="anavo-seo-panel-body">${bodyHtml}</div>
      <div class="anavo-seo-panel-footer">Powered by Onassis Web Media</div>
    `;

    document.body.appendChild(panel);
    panel.querySelector('.anavo-seo-close').addEventListener('click', () => closePanel(type));
    return panel;
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
        <div class="anavo-seo-section">
          <p class="anavo-seo-section-title">On This Page</p>
          <ul class="anavo-seo-nav-list">${items}</ul>
        </div>`;
    }

    // Keywords / topics
    const keywords = pageData && pageData.keywords ? pageData.keywords : [];
    let tagsHtml = '';
    if (keywords.length) {
      const tags = keywords.slice(0, 8).map(k => `<span class="anavo-seo-tag">${k}</span>`).join('');
      tagsHtml = `
        <div class="anavo-seo-section">
          <p class="anavo-seo-section-title">Topics</p>
          <div class="anavo-seo-tags">${tags}</div>
        </div>`;
    }

    // Contact / NAP
    let contactHtml = '';
    if (nap) {
      const parts = [];
      if (nap.phone)   parts.push(`<p>📞 <a href="tel:${nap.phone}">${nap.phone}</a></p>`);
      if (nap.email)   parts.push(`<p>✉️ <a href="mailto:${nap.email}">${nap.email}</a></p>`);
      if (nap.address) parts.push(`<p>📍 ${nap.address}</p>`);
      if (parts.length) {
        contactHtml = `
          <div class="anavo-seo-section">
            <p class="anavo-seo-section-title">Contact</p>
            <div class="anavo-seo-contact">${parts.join('')}</div>
          </div>`;
      }
    }

    return navHtml + tagsHtml + contactHtml ||
      '<p style="font-size:13px;opacity:0.7">No additional info for this page.</p>';
  }

  function buildFaqBody(faqItems) {
    if (!faqItems || !faqItems.length) {
      return '<p style="font-size:13px;opacity:0.7">No FAQs available for this page.</p>';
    }
    return faqItems.map(item => `
      <details class="anavo-seo-faq-item">
        <summary>${item.question}</summary>
        <div class="anavo-seo-faq-answer">${item.answer}</div>
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

  function openPanel(type) {
    const panel = document.getElementById(`anavo-seo-${type}-panel`);
    if (!panel) return;

    // close the other panel silently
    const other = type === 'info' ? 'faq' : 'info';
    const otherPanel = document.getElementById(`anavo-seo-${other}-panel`);
    if (otherPanel) otherPanel.classList.remove('anavo-seo-open');

    panel.classList.add('anavo-seo-open');
    _anyOpen = true;

    // ensure triggers visible
    if (_triggerWrap) _triggerWrap.classList.remove('anavo-seo-faded');
    if (_initialTimer) { clearTimeout(_initialTimer); _initialTimer = null; }

    panel.focus();
    dbg(`Panel opened: ${type}`);
  }

  function closePanel(type) {
    const panel = document.getElementById(`anavo-seo-${type}-panel`);
    if (!panel) return;
    panel.classList.remove('anavo-seo-open');

    const other = type === 'info' ? 'faq' : 'info';
    const otherPanel = document.getElementById(`anavo-seo-${other}-panel`);
    _anyOpen = !!(otherPanel && otherPanel.classList.contains('anavo-seo-open'));

    if (!_anyOpen && _initialDone && _triggerWrap) {
      _triggerWrap.classList.add('anavo-seo-faded');
    }
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
        _triggerWrap.classList.add('anavo-seo-faded');
        _initialDone = true;
        dbg('Triggers faded after initial delay');
        initDwellObserver();
      }
    }, config.fadeDelay);
  }

  function initDwellObserver() {
    // Watch last significant section — reappear after dwellTime ms on it
    const sections = document.querySelectorAll('section, .sqs-block, [data-section-id]');
    const lastSection = sections[sections.length - 1];
    if (!lastSection) return;

    let dwellTimer = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          dwellTimer = setTimeout(() => {
            if (!_anyOpen && _triggerWrap) {
              _triggerWrap.classList.remove('anavo-seo-faded');
              dbg('Triggers reappeared after dwell');
              // fade again after same delay
              setTimeout(() => {
                if (!_anyOpen && _triggerWrap) {
                  _triggerWrap.classList.add('anavo-seo-faded');
                }
              }, config.fadeDelay);
            }
          }, config.dwellTime);
        } else {
          if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; }
        }
      });
    }, { threshold: 0.3 });

    observer.observe(lastSection);
    dbg('Dwell observer attached to last section');
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
        const panel = document.getElementById('anavo-seo-info-panel');
        if (panel && panel.classList.contains('anavo-seo-open')) closePanel('info');
        else openPanel('info');
      }
      if (e.key === '?') {
        e.preventDefault();
        const panel = document.getElementById('anavo-seo-faq-panel');
        if (panel && panel.classList.contains('anavo-seo-open')) closePanel('faq');
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
    const existing = document.getElementById('anavo-seo-faq-schema');
    if (existing) existing.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqItems.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': item.answer }
      }))
    };

    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'anavo-seo-faq-schema';
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
        const triggers = document.getElementById('anavo-seo-triggers');
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
    buildPanel('info', infoTitle, infoBody);

    // Build FAQ panel
    const faqBody = buildFaqBody(faqItems);
    buildPanel('faq', 'Frequently Asked Questions', faqBody);

    // Wire trigger buttons
    document.getElementById('anavo-seo-info-btn').addEventListener('click', () => {
      const panel = document.getElementById('anavo-seo-info-panel');
      if (panel && panel.classList.contains('anavo-seo-open')) closePanel('info');
      else openPanel('info');
    });
    document.getElementById('anavo-seo-faq-btn').addEventListener('click', () => {
      const panel = document.getElementById('anavo-seo-faq-panel');
      if (panel && panel.classList.contains('anavo-seo-open')) closePanel('faq');
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

})();
