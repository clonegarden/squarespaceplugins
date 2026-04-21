/**
 * ============================================================
 * HIGHLIGHT ON SCROLL — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Any <mark> or [data-anavo-highlight] element animates a
 *   coloured highlight sweeping across when it scrolls into view.
 *   The highlight is a CSS pseudo-element that transitions
 *   background-size from 0% to 100%.
 *
 * USAGE:
 *   <p>This is <mark>important text</mark> worth reading.</p>
 *   Or: <span data-anavo-highlight>highlighted phrase</span>
 *
 * PARAMETERS:
 *   color       highlight colour           default: #ffdd00
 *   opacity     highlight opacity          default: 0.4
 *   height      highlight height           default: 0.35em
 *   duration    animation duration         default: 0.6s
 *   delay       animation delay            default: 0.1s
 *   offset      rootMargin vertical offset default: -80px
 *   once        trigger once only          default: true
 *   selector    elements to highlight      default: mark,[data-anavo-highlight]
 *   domain      license check hostname
 *   supabaseUrl Supabase project URL
 *   supabaseKey Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'HighlightOnScroll';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="highlight-on-scroll"]');
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
    color:       p('color',       '#ffdd00'),
    opacity:     p('opacity',     '0.4'),
    height:      p('height',      '0.35em'),
    duration:    p('duration',    '0.6s'),
    delay:       p('delay',       '0.1s'),
    offset:      p('offset',      '-80px'),
    once:        p('once',        'true'),
    selector:    p('selector',    'mark,[data-anavo-highlight]')
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
    var nid = 'anavo-hos-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get HighlightOnScroll license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('anavo-hos-styles')) return;

    // Build rgba colour with configured opacity
    var r = 255, g = 221, b = 0;
    var hex = CFG.color.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.slice(0,2), 16);
      g = parseInt(hex.slice(2,4), 16);
      b = parseInt(hex.slice(4,6), 16);
    }
    var rgba = 'rgba(' + r + ',' + g + ',' + b + ',' + CFG.opacity + ')';

    var css =
      // Reset default mark styles and set up the highlight mechanism
      '.anavo-hl-target{' +
        'background:none!important;' +
        'background-image:linear-gradient(' + rgba + ',' + rgba + ')!important;' +
        'background-size:0% ' + CFG.height + '!important;' +
        'background-repeat:no-repeat!important;' +
        'background-position:left bottom!important;' +
        'transition:background-size ' + CFG.duration + ' ease ' + CFG.delay + '!important;' +
        'display:inline!important;' +
        'padding-bottom:0.05em!important;' +
      '}' +

      '.anavo-hl-target.anavo-hl-active{' +
        'background-size:100% ' + CFG.height + '!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-hos-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. MAIN LOGIC — IntersectionObserver
  // ─────────────────────────────────────────────────────────────────

  function setupObserver(elements) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('anavo-hl-active');
          if (CFG.once === 'true') observer.unobserve(el);
        } else if (CFG.once !== 'true') {
          el.classList.remove('anavo-hl-active');
        }
      });
    }, {
      rootMargin: CFG.offset + ' 0px',
      threshold:  0.1
    });

    elements.forEach(function (el) {
      el.classList.add('anavo-hl-target');
      observer.observe(el);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. INIT WITH DOM POLLING
  // ─────────────────────────────────────────────────────────────────

  var _attempts = 0;

  function init() {
    if (!document.body) {
      if (++_attempts < 50) { setTimeout(init, 100); }
      return;
    }

    var elements = document.querySelectorAll(CFG.selector);
    if (!elements.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] No elements found matching "' + CFG.selector + '".');
      return;
    }

    injectStyles();
    checkLicense();
    setupObserver(Array.prototype.slice.call(elements));
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
