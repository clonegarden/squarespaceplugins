/**
 * ============================================================
 * DARK MODE TOGGLE — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Injects a floating toggle button (sun/moon) that adds or
 *   removes the data-anavo-dark attribute on <body>. CSS variables
 *   control bg/text colour. Preference is persisted in localStorage.
 *
 * USAGE:
 *   1. In your site CSS, define:
 *        body { background: var(--anavo-bg); color: var(--anavo-text); }
 *   2. Paste script tag in Code Injection → FOOTER.
 *
 * PARAMETERS:
 *   position      button corner: bottom-right|bottom-left|top-right|top-left   default: bottom-right
 *   lightBg       light mode background colour   default: #ffffff
 *   darkBg        dark mode background colour    default: #111111
 *   lightText     light mode text colour         default: #111111
 *   darkText      dark mode text colour          default: #f0ede8
 *   size          button size                    default: 48px
 *   domain        license check hostname
 *   supabaseUrl   Supabase project URL
 *   supabaseKey   Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'DarkModeToggle';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="dark-mode-toggle"]');
    return all[all.length - 1];
  })();

  var params;
  try { params = new URL(scriptEl.src).searchParams; }
  catch (e) { params = new URLSearchParams(); }

  function p(key, fallback) {
    var v = params.get(key);
    if (v === null || v === '') return fallback;
    try { return decodeURIComponent(v); } catch (e) { return v; }
  }

  var CFG = {
    domain:      p('domain',      window.location.hostname),
    supabaseUrl: p('supabaseUrl', ''),
    supabaseKey: p('supabaseKey', ''),
    position:    p('position',    'bottom-right'),
    lightBg:     p('lightBg',    '#ffffff'),
    darkBg:      p('darkBg',     '#111111'),
    lightText:   p('lightText',  '#111111'),
    darkText:    p('darkText',   '#f0ede8'),
    size:        p('size',       '48px')
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || {};
  if (window.AnavoPluginState[PLUGIN_ID]) return;
  window.AnavoPluginState[PLUGIN_ID] = { version: VERSION, active: true };

  // ─────────────────────────────────────────────────────────────────
  // 3. LICENSE CHECK
  // ─────────────────────────────────────────────────────────────────

  var BYPASS_DOMAINS = ['anavo.tech', 'www.anavo.tech', 'pluginstore.anavo.tech', 'clonegarden.github.io', 'localhost', '127.0.0.1'];

  function checkLicense() {
    try {
      var host = window.location.hostname.toLowerCase().replace(/^www\./, '');
      if (BYPASS_DOMAINS.indexOf(host) > -1) return;
      if (!CFG.supabaseUrl || !CFG.supabaseKey) {
        console.warn('[Anavo ' + PLUGIN_ID + '] supabaseUrl/supabaseKey not set — license check skipped.');
        return;
      }
      var endpoint = CFG.supabaseUrl + '/rest/v1/purchased_plugins'
        + '?plugin_id=eq.' + encodeURIComponent(PLUGIN_ID)
        + '&domain=eq.'    + encodeURIComponent(host)
        + '&select=id&limit=1';
      fetch(endpoint, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'apikey':        CFG.supabaseKey,
          'Authorization': 'Bearer ' + CFG.supabaseKey,
          'Accept':        'application/json'
        }
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('[Anavo ' + PLUGIN_ID + '] Domain not licensed: ' + host);
          _licenseNotice();
        }
      })
      .catch(function () {});
    } catch (e) {}
  }

  function _licenseNotice() {
    var nid = 'anavo-dmt-license-notice';
    if (document.getElementById(nid)) return;
    var el = document.createElement('div');
    el.id = nid;
    el.setAttribute('style',
      'position:fixed;bottom:20px;right:20px;' +
      'background:rgba(0,0,0,0.9);color:#fff;' +
      'padding:12px 18px;border-radius:6px;' +
      'font-family:system-ui,sans-serif;font-size:12px;' +
      'z-index:999999;pointer-events:auto;line-height:1.6'
    );
    el.innerHTML =
      '<strong style="display:block;margin-bottom:4px">\u26a0\ufe0f Unlicensed Plugin</strong>' +
      '<a href="https://anavo.tech/plugins" target="_blank" rel="noopener" ' +
      'style="color:#ffd700;text-decoration:none">Get DarkModeToggle license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. POSITION HELPER
  // ─────────────────────────────────────────────────────────────────

  function positionCSS() {
    var pos = CFG.position || 'bottom-right';
    var css = 'position:fixed!important;z-index:999998!important;';
    if (pos.indexOf('bottom') > -1) css += 'bottom:20px!important;';
    if (pos.indexOf('top')    > -1) css += 'top:20px!important;';
    if (pos.indexOf('right')  > -1) css += 'right:20px!important;';
    if (pos.indexOf('left')   > -1) css += 'left:20px!important;';
    return css;
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('anavo-dmt-styles')) return;
    var css =
      'body{' +
        'transition:background-color 0.4s ease,color 0.4s ease!important;' +
        'background-color:' + CFG.lightBg   + '!important;' +
        'color:'            + CFG.lightText + '!important;' +
      '}' +
      'body[data-anavo-dark]{' +
        'background-color:' + CFG.darkBg   + '!important;' +
        'color:'            + CFG.darkText + '!important;' +
      '}' +
      '#anavo-dmt-btn{' +
        positionCSS() +
        'width:'           + CFG.size + '!important;' +
        'height:'          + CFG.size + '!important;' +
        'border-radius:50%!important;' +
        'border:2px solid rgba(128,128,128,0.3)!important;' +
        'background:rgba(255,255,255,0.1)!important;' +
        'backdrop-filter:blur(8px)!important;' +
        '-webkit-backdrop-filter:blur(8px)!important;' +
        'cursor:pointer!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'font-size:20px!important;' +
        'line-height:1!important;' +
        'transition:transform 0.3s ease,box-shadow 0.3s ease!important;' +
        'box-shadow:0 2px 12px rgba(0,0,0,0.15)!important;' +
        'padding:0!important;' +
      '}' +
      '#anavo-dmt-btn:hover{' +
        'transform:scale(1.1)!important;' +
        'box-shadow:0 4px 20px rgba(0,0,0,0.25)!important;' +
      '}' +
      '#anavo-dmt-btn:active{' +
        'transform:scale(0.95)!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-dmt-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. THEME LOGIC
  // ─────────────────────────────────────────────────────────────────

  var STORAGE_KEY = 'anavo-theme';

  function isDark() {
    return document.body.hasAttribute('data-anavo-dark');
  }

  function applyTheme(dark) {
    if (dark) {
      document.body.setAttribute('data-anavo-dark', '');
    } else {
      document.body.removeAttribute('data-anavo-dark');
    }
    updateBtn();
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch (e) {}
  }

  function updateBtn() {
    var btn = document.getElementById('anavo-dmt-btn');
    if (!btn) return;
    btn.textContent = isDark() ? '\u2600\ufe0f' : '\uD83C\uDF19';
    btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title',      isDark() ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function restoreTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark') {
        document.body.setAttribute('data-anavo-dark', '');
      } else if (!saved) {
        // Respect OS preference if no saved choice
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.body.setAttribute('data-anavo-dark', '');
        }
      }
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. BUTTON INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectButton() {
    if (document.getElementById('anavo-dmt-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'anavo-dmt-btn';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('type', 'button');
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      applyTheme(!isDark());
    });

    updateBtn();
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. INIT WITH DOM POLLING
  // ─────────────────────────────────────────────────────────────────

  var _attempts = 0;

  function init() {
    if (!document.body) {
      if (++_attempts < 50) { setTimeout(init, 100); }
      return;
    }

    injectStyles();
    restoreTheme();
    injectButton();
    checkLicense();
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
