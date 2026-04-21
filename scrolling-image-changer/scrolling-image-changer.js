/**
 * ============================================================
 * SCROLLING IMAGE CHANGER — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   As the user scrolls through page sections, the background
 *   image of a sticky container changes. Each section has a
 *   data-anavo-image="URL" attribute. The sticky container
 *   [data-anavo-image-changer] shows the image for the
 *   currently visible section.
 *
 * USAGE:
 *   1. Add a sticky image container on your page:
 *        <div data-anavo-image-changer></div>
 *   2. Add data-anavo-image to each scrollable section:
 *        <section data-anavo-image="https://example.com/img1.jpg">...</section>
 *   3. Paste script tag in Code Injection → FOOTER.
 *
 * PARAMETERS:
 *   transition    'fade' or 'slide'                default: fade
 *   duration      CSS transition duration          default: 0.5s
 *   selector      sections selector                default: [data-anavo-image]
 *   container     sticky panel selector            default: [data-anavo-image-changer]
 *   domain        license check hostname
 *   supabaseUrl   Supabase project URL
 *   supabaseKey   Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ScrollingImageChanger';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="scrolling-image-changer"]');
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
    transition:  p('transition',  'fade'),
    duration:    p('duration',    '0.5s'),
    selector:    p('selector',    '[data-anavo-image]'),
    container:   p('container',   '[data-anavo-image-changer]')
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
    var nid = 'anavo-sic-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get ScrollingImageChanger license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles(container) {
    if (document.getElementById('anavo-sic-styles')) return;

    var css =
      // The sticky container base styles
      '[data-anavo-image-changer]{' +
        'position:relative!important;' +
        'overflow:hidden!important;' +
        'background-size:cover!important;' +
        'background-position:center!important;' +
        'background-repeat:no-repeat!important;' +
      '}' +

      // Overlay layers for crossfade
      '.anavo-sic-layer{' +
        'position:absolute!important;' +
        'inset:0!important;' +
        'background-size:cover!important;' +
        'background-position:center!important;' +
        'background-repeat:no-repeat!important;' +
        'transition:opacity ' + CFG.duration + ' ease,transform ' + CFG.duration + ' ease!important;' +
      '}' +

      '.anavo-sic-layer.anavo-sic-active{' +
        'opacity:1!important;' +
        'transform:translateX(0)!important;' +
      '}' +

      '.anavo-sic-layer.anavo-sic-inactive{' +
        'opacity:0!important;' +
        'transform:' + (CFG.transition === 'slide' ? 'translateX(-100%)' : 'translateX(0)') + '!important;' +
      '}' +

      '.anavo-sic-layer.anavo-sic-next{' +
        'opacity:0!important;' +
        'transform:' + (CFG.transition === 'slide' ? 'translateX(100%)' : 'translateX(0)') + '!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-sic-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. MAIN LOGIC
  // ─────────────────────────────────────────────────────────────────

  var _currentUrl = null;
  var _layerA, _layerB, _useA = true;

  function setupLayers(container) {
    _layerA = document.createElement('div');
    _layerA.className = 'anavo-sic-layer anavo-sic-active';
    _layerB = document.createElement('div');
    _layerB.className = 'anavo-sic-layer anavo-sic-next';
    container.appendChild(_layerA);
    container.appendChild(_layerB);
  }

  function changeImage(url) {
    if (url === _currentUrl) return;
    _currentUrl = url;

    var incoming = _useA ? _layerA : _layerB;
    var outgoing = _useA ? _layerB : _layerA;

    incoming.style.backgroundImage = 'url(' + url + ')';
    // Reset incoming to "next" position before transition
    incoming.className = 'anavo-sic-layer anavo-sic-next';

    // Double rAF to allow browser to apply reset
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        incoming.className = 'anavo-sic-layer anavo-sic-active';
        outgoing.className = 'anavo-sic-layer anavo-sic-inactive';
        _useA = !_useA;
      });
    });
  }

  function setupObserver(sections, container) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var url = entry.target.getAttribute('data-anavo-image');
          if (url) changeImage(url);
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Set initial image from first section
    var first = sections[0];
    if (first) {
      var url = first.getAttribute('data-anavo-image');
      if (url) {
        _currentUrl = url;
        _layerA.style.backgroundImage = 'url(' + url + ')';
      }
    }
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

    var container = document.querySelector(CFG.container);
    var sections  = document.querySelectorAll(CFG.selector);

    if (!container || !sections.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] Container or sections not found.');
      return;
    }

    injectStyles(container);
    checkLicense();
    setupLayers(container);
    setupObserver(Array.prototype.slice.call(sections), container);
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
