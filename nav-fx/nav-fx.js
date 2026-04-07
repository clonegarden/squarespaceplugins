;(function () {
  'use strict';

  // ============================================================
  // NAV-FX PLUGIN — Anavo Tech
  // ============================================================
  // @version  1.0.0
  // @plugin   NavFx
  // @author   Anavo Tech
  // @license  Commercial
  //
  // USAGE:
  //   <script src="nav-fx.js?selector=.header-nav-item+a&style=3d
  //     &accent1=%23ff1744&accent2=%234dd0e1"></script>
  // ============================================================

  var PLUGIN_ID      = 'NavFx';
  var PLUGIN_VERSION = '1.0.0';
  var STYLE_TAG_ID   = 'anavo-nfx-styles';
  var DONE_ATTR      = 'data-anavo-nfx-done';
  var LINK_CLASS     = 'anavo-nfx-link';

  var BYPASS_DOMAINS = ['anavo.tech', 'www.anavo.tech', 'pluginstore.anavo.tech', 'clonegarden.github.io', 'localhost', '127.0.0.1'];

  // ============================================================
  // 1. IDEMPOTENCY GUARD
  // ============================================================
  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  if (window.AnavoPluginState.plugins[PLUGIN_ID]) {
    return; // already running
  }
  window.AnavoPluginState.plugins[PLUGIN_ID] = {
    version: PLUGIN_VERSION,
    status: 'initializing'
  };

  // ============================================================
  // 2. CAPTURE SCRIPT ELEMENT + PARSE PARAMS
  // ============================================================
  var scriptEl = document.currentScript || (function () {
    var scripts = document.querySelectorAll('script[src*="nav-fx"]');
    return scripts[scripts.length - 1];
  })();

  var params = new URL(scriptEl.src).searchParams;

  var CFG = {
    domain       : params.get('domain')        || location.hostname,
    supabaseUrl  : params.get('supabaseUrl')   || '',
    supabaseKey  : params.get('supabaseKey')   || '',
    selector     : params.get('selector')      || '[data-anavo-navfx]',
    style        : params.get('style')         || '3d',
    accent1      : params.get('accent1')       || '#ff1744',
    accent2      : params.get('accent2')       || '#4dd0e1',
    offset1      : parseInt(params.get('offset1'), 10) || 12,
    offset2      : parseInt(params.get('offset2'), 10) || 24,
    strokeColor  : params.get('strokeColor')   || '#ffffff',
    glowColor    : params.get('glowColor')     || '#d83bff',
    fontSize     : params.get('fontSize')      || 'inherit',
    fontWeight   : params.get('fontWeight')    || '900',
    letterSpacing: params.get('letterSpacing') || 'normal',
    target       : params.get('target')        || '[data-anavo-nav-fx]'
  };

  // ============================================================
  // 3. MOBILE DETECTION (skip effect on ≤800px)
  // ============================================================
  function isMobile() {
    return window.innerWidth <= 800;
  }

  // ============================================================
  // 4. CSS INJECTION
  // ============================================================
  function injectStyles() {
    var existing = document.getElementById(STYLE_TAG_ID);
    if (existing) { existing.remove(); }

    var vars = [
      ':root {',
      '  --anavo-nfx-accent1: '  + CFG.accent1      + ' !important;',
      '  --anavo-nfx-accent2: '  + CFG.accent2      + ' !important;',
      '  --anavo-nfx-stroke: '   + CFG.strokeColor  + ' !important;',
      '  --anavo-nfx-glow: '     + CFG.glowColor    + ' !important;',
      '  --anavo-nfx-offset1: '  + CFG.offset1 + 'px !important;',
      '  --anavo-nfx-offset2: '  + CFG.offset2 + 'px !important;',
      '}'
    ].join('\n');

    var base = [
      /* Base positioning required by both modes */
      '.anavo-nfx-link {',
      '  position: relative !important;',
      '  display: inline-block !important;',
      '  font-size: '     + CFG.fontSize      + ' !important;',
      '  font-weight: '   + CFG.fontWeight    + ' !important;',
      '  letter-spacing: ' + CFG.letterSpacing + ' !important;',
      '  cursor: pointer !important;',
      '  text-decoration: none !important;',
      '}'
    ].join('\n');

    var modeCSS = '';

    if (CFG.style === '3d') {
      modeCSS = [
        /* 3D outline default state */
        '.anavo-nfx-link {',
        '  color: transparent !important;',
        '  -webkit-text-stroke: 1px var(--anavo-nfx-stroke) !important;',
        '  transition: color 0.25s, -webkit-text-stroke 0.25s !important;',
        '}',

        /* Pseudo-elements — base (no offset) */
        '.anavo-nfx-link::before,',
        '.anavo-nfx-link::after {',
        '  content: attr(data-text) !important;',
        '  position: absolute !important;',
        '  top: 0 !important;',
        '  left: 0 !important;',
        '  z-index: 1 !important;',
        '  -webkit-text-stroke: 1px transparent !important;',
        '  transform: translate(0, 0) !important;',
        '  transition: transform 0.5s, color 0.5s !important;',
        '  pointer-events: none !important;',
        '}',

        /* Hover — fill main text */
        '.anavo-nfx-link:hover {',
        '  color: var(--anavo-nfx-stroke) !important;',
        '  -webkit-text-stroke: 1px transparent !important;',
        '  transition: color 0.25s, -webkit-text-stroke 0.25s !important;',
        '}',

        /* Hover — first shadow layer */
        '.anavo-nfx-link:hover::before {',
        '  transform: translate(var(--anavo-nfx-offset1), calc(-1 * var(--anavo-nfx-offset1))) !important;',
        '  color: var(--anavo-nfx-accent1) !important;',
        '  -webkit-text-stroke: 1px transparent !important;',
        '}',

        /* Hover — second shadow layer */
        '.anavo-nfx-link:hover::after {',
        '  transform: translate(var(--anavo-nfx-offset2), calc(-1 * var(--anavo-nfx-offset2))) !important;',
        '  color: var(--anavo-nfx-accent2) !important;',
        '  -webkit-text-stroke: 1px transparent !important;',
        '}'
      ].join('\n');
    } else {
      // style === 'glow'
      modeCSS = [
        /* Glow default state */
        '.anavo-nfx-link {',
        '  color: #ffffff !important;',
        '  transition: color 0.5s !important;',
        '  transition-delay: 0.5s !important;',
        '}',

        /* Glow ::before base state — bloom element */
        '.anavo-nfx-link::before {',
        '  content: attr(data-text) !important;',
        '  position: absolute !important;',
        '  top: 50% !important;',
        '  left: 50% !important;',
        '  transform: translate(-50%, -50%) !important;',
        '  font-size: 0.35em !important;',
        '  color: var(--anavo-nfx-glow) !important;',
        '  text-shadow: 0 0 10px var(--anavo-nfx-glow), 0 0 30px var(--anavo-nfx-glow), 0 0 80px var(--anavo-nfx-glow) !important;',
        '  font-weight: 500 !important;',
        '  letter-spacing: 40px !important;',
        '  white-space: nowrap !important;',
        '  text-align: center !important;',
        '  opacity: 0 !important;',
        '  transition: opacity 0.5s, letter-spacing 0.5s !important;',
        '  pointer-events: none !important;',
        '}',

        /* Glow hover — fade main text */
        '.anavo-nfx-link:hover {',
        '  color: rgba(255,255,255,0.08) !important;',
        '  transition-delay: 0.5s !important;',
        '}',

        /* Glow hover — bloom expands */
        '.anavo-nfx-link:hover::before {',
        '  opacity: 1 !important;',
        '  letter-spacing: 6px !important;',
        '  transition-delay: 0.5s !important;',
        '}'
      ].join('\n');
    }

    var el = document.createElement('style');
    el.id = STYLE_TAG_ID;
    el.textContent = vars + '\n\n' + base + '\n\n' + modeCSS;
    document.head.appendChild(el);
  }

  // ============================================================
  // 5. ELEMENT ENHANCEMENT
  // ============================================================
  function enhanceElements() {
    if (isMobile()) { return; }

    var elements = document.querySelectorAll(CFG.selector);
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.getAttribute(DONE_ATTR)) { continue; }

      var text = (el.textContent || '').trim();
      if (!text) { continue; }

      el.setAttribute('data-text', text);
      el.classList.add(LINK_CLASS);
      el.setAttribute(DONE_ATTR, '1');
    }
  }

  // ============================================================
  // 6. DYNAMIC CONTENT RESCAN (500ms × 10)
  // ============================================================
  function startRescan() {
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      enhanceElements();
      if (attempts >= 10) {
        clearInterval(interval);
      }
    }, 500);
  }

  // ============================================================
  // 7. LICENSE CHECK (NON-BLOCKING, SUPABASE REST)
  // ============================================================
  function checkLicense() {
    // Bypass for dev/internal domains
    var hostname = CFG.domain;
    for (var i = 0; i < BYPASS_DOMAINS.length; i++) {
      if (hostname === BYPASS_DOMAINS[i] || hostname.indexOf('.' + BYPASS_DOMAINS[i]) !== -1) {
        return;
      }
    }

    if (!CFG.supabaseUrl || !CFG.supabaseKey) {
      // No Supabase config — warn but continue
      console.warn('[Anavo NavFx] License check skipped: supabaseUrl/supabaseKey not provided.');
      return;
    }

    var url = CFG.supabaseUrl.replace(/\/$/, '') +
      '/rest/v1/licenses?select=active,plugin&domain=eq.' + encodeURIComponent(hostname) +
      '&plugin=eq.' + encodeURIComponent(PLUGIN_ID) + '&limit=1';

    fetch(url, {
      method : 'GET',
      headers: {
        'apikey'       : CFG.supabaseKey,
        'Authorization': 'Bearer ' + CFG.supabaseKey,
        'Accept'       : 'application/json'
      }
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!Array.isArray(data) || data.length === 0 || !data[0].active) {
        console.warn('[Anavo NavFx] Unlicensed — running in evaluation mode.');
        window.AnavoPluginState.plugins[PLUGIN_ID].licensed = false;
      } else {
        window.AnavoPluginState.plugins[PLUGIN_ID].licensed = true;
      }
    })
    .catch(function () {
      // Never block on license failure
    });
  }

  // ============================================================
  // 8. WAIT FOR TARGET MOUNT POINT (100ms × 50)
  // ============================================================
  function waitAndMount(attempts) {
    var targets = document.querySelectorAll(CFG.target);
    if (targets.length) {
      run();
      return;
    }
    // Fallback: if no explicit [data-anavo-nav-fx] but selector matches directly,
    // also proceed after all attempts so the selector-based enhancement still works.
    if (attempts >= 50) {
      run();
      return;
    }
    setTimeout(function () { waitAndMount(attempts + 1); }, 100);
  }

  // ============================================================
  // 9. MAIN RUN
  // ============================================================
  function run() {
    if (isMobile()) {
      // On mobile: scan but don't apply effect — leave elements clean
      window.AnavoPluginState.plugins[PLUGIN_ID].status = 'mobile-skipped';
      return;
    }

    injectStyles();
    enhanceElements();
    startRescan();

    window.AnavoPluginState.plugins[PLUGIN_ID].status  = 'active';
    window.AnavoPluginState.plugins[PLUGIN_ID].config  = CFG;
  }

  // ============================================================
  // 10. INIT
  // ============================================================
  function init() {
    try {
      checkLicense(); // non-blocking, fire-and-forget
      waitAndMount(0);
    } catch (e) {
      console.error('[Anavo NavFx] Init error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
