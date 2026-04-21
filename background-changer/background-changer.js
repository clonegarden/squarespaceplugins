/**
 * ============================================================
 * BACKGROUND CHANGER — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Each page section [data-anavo-bg] with data-bg-color or
 *   data-bg-image attribute triggers a smooth background change
 *   on the <body> or a target container as it scrolls into view.
 *
 * USAGE:
 *   <section data-anavo-bg data-bg-color="#1a0a2e">...</section>
 *   <section data-anavo-bg data-bg-image="https://example.com/img.jpg">...</section>
 *
 * PARAMETERS:
 *   target      element to apply bg to      default: body
 *   selector    trigger sections            default: [data-anavo-bg]
 *   transition  CSS transition duration     default: 0.6s
 *   threshold   IO threshold 0-1            default: 0.5
 *   domain      license check hostname
 *   supabaseUrl Supabase project URL
 *   supabaseKey Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'BackgroundChanger';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="background-changer"]');
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
    target:      p('target',      'body'),
    selector:    p('selector',    '[data-anavo-bg]'),
    transition:  p('transition',  '0.6s'),
    threshold:   parseFloat(p('threshold', '0.5'))
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
    var nid = 'anavo-bc-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get BackgroundChanger license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles(targetEl) {
    if (document.getElementById('anavo-bc-styles')) return;
    var css =
      '.anavo-bc-target{' +
        'transition:' +
          'background-color ' + CFG.transition + ' ease,' +
          'background-image '+ CFG.transition + ' ease!important;' +
        'background-size:cover!important;' +
        'background-position:center!important;' +
        'background-repeat:no-repeat!important;' +
      '}';
    var style = document.createElement('style');
    style.id = 'anavo-bc-styles';
    style.textContent = css;
    document.head.appendChild(style);
    targetEl.classList.add('anavo-bc-target');
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. APPLY BACKGROUND
  // ─────────────────────────────────────────────────────────────────

  function applyBg(targetEl, section) {
    var color = section.getAttribute('data-bg-color');
    var image = section.getAttribute('data-bg-image');

    if (color) {
      targetEl.style.setProperty('background-color', color, 'important');
    }
    if (image) {
      targetEl.style.setProperty('background-image', 'url(' + image + ')', 'important');
    } else {
      // Clear background image if section only has a color
      if (!image && color) {
        targetEl.style.setProperty('background-image', 'none', 'important');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. SETUP OBSERVER
  // ─────────────────────────────────────────────────────────────────

  function setupObserver(sections, targetEl) {
    var observer = new IntersectionObserver(function (entries) {
      // Find the most prominent intersecting section
      var best = null;
      var bestRatio = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= bestRatio) {
          bestRatio = entry.intersectionRatio;
          best = entry.target;
        }
      });
      if (best) applyBg(targetEl, best);
    }, { threshold: CFG.threshold });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Apply first section immediately
    if (sections.length) applyBg(targetEl, sections[0]);
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. INIT WITH DOM POLLING
  // ─────────────────────────────────────────────────────────────────

  var _attempts = 0;

  function init() {
    if (!document.body) {
      if (++_attempts < 50) { setTimeout(init, 100); }
      return;
    }

    var targetEl = document.querySelector(CFG.target) || document.body;
    var sections = document.querySelectorAll(CFG.selector);

    if (!sections.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] No sections found matching "' + CFG.selector + '".');
      return;
    }

    checkLicense();
    injectStyles(targetEl);
    setupObserver(Array.prototype.slice.call(sections), targetEl);
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
