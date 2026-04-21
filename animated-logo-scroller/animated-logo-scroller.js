/**
 * ============================================================
 * ANIMATED LOGO SCROLLER — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Finds all img elements inside [data-anavo-logo-scroller]
 *   and animates them in a seamless infinite horizontal marquee
 *   scroll. No GSAP — pure CSS animation. Duplicates the images
 *   for a seamless infinite loop.
 *
 * USAGE:
 *   1. Wrap your logos in a container:
 *        <div data-anavo-logo-scroller>
 *          <img src="logo1.png" alt="Brand 1">
 *          <img src="logo2.png" alt="Brand 2">
 *        </div>
 *   2. Paste in Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-logo-scroller/animated-logo-scroller.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &speed=30s
 *          &direction=left
 *        "></script>
 *
 * PARAMETERS:
 *   speed           scroll animation duration       default: 30s
 *   gap             space between logos             default: 60px
 *   direction       'left' or 'right'               default: left
 *   pauseOnHover    pause animation on hover        default: true
 *   selector        container CSS selector          default: [data-anavo-logo-scroller]
 *   domain          license check hostname
 *   supabaseUrl     Supabase project URL
 *   supabaseKey     Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'AnimatedLogoScroller';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="animated-logo-scroller"]');
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
    domain:       p('domain',       window.location.hostname),
    supabaseUrl:  p('supabaseUrl',  ''),
    supabaseKey:  p('supabaseKey',  ''),
    speed:        p('speed',        '30s'),
    gap:          p('gap',          '60px'),
    direction:    p('direction',    'left'),
    pauseOnHover: p('pauseOnHover', 'true'),
    selector:     p('selector',     '[data-anavo-logo-scroller]')
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || {};
  if (window.AnavoPluginState[PLUGIN_ID]) return;
  window.AnavoPluginState[PLUGIN_ID] = { version: VERSION, active: true };

  // ─────────────────────────────────────────────────────────────────
  // 3. LICENSE CHECK — Supabase REST (non-blocking)
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
    var nid = 'anavo-als-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get AnimatedLogoScroller license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('anavo-als-styles')) return;

    var toDir   = CFG.direction === 'right' ? 'translateX(50%)' : 'translateX(-50%)';
    var fromDir = 'translateX(0)';

    var css =
      '@keyframes anavo-ls-scroll{' +
        'from{transform:' + fromDir + '!important;}' +
        'to{transform:'   + toDir   + '!important;}' +
      '}' +

      '.anavo-ls-viewport{' +
        'overflow:hidden!important;' +
        'width:100%!important;' +
        'position:relative!important;' +
      '}' +

      '.anavo-ls-track{' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'width:max-content!important;' +
        'will-change:transform!important;' +
        'animation:anavo-ls-scroll ' + CFG.speed + ' linear infinite!important;' +
      '}' +

      '.anavo-ls-viewport:hover .anavo-ls-track.anavo-ls-pause{' +
        'animation-play-state:paused!important;' +
      '}' +

      '.anavo-ls-track img{' +
        'display:inline-block!important;' +
        'flex-shrink:0!important;' +
        'max-height:60px!important;' +
        'width:auto!important;' +
        'object-fit:contain!important;' +
        'margin:0 ' + CFG.gap + ' 0 0!important;' +
        'filter:grayscale(100%)!important;' +
        'opacity:0.6!important;' +
        'transition:filter 0.3s,opacity 0.3s!important;' +
      '}' +

      '.anavo-ls-track img:hover{' +
        'filter:grayscale(0%)!important;' +
        'opacity:1!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-als-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. MAIN LOGIC — build scroller
  // ─────────────────────────────────────────────────────────────────

  function buildScroller(container) {
    if (container.getAttribute('data-anavo-als-done') === 'true') return;
    container.setAttribute('data-anavo-als-done', 'true');

    // Gather all images from the original container
    var origImgs = container.querySelectorAll('img');
    if (!origImgs.length) return;

    // Create viewport wrapper
    var viewport = document.createElement('div');
    viewport.className = 'anavo-ls-viewport';

    // Create the scrolling track
    var track = document.createElement('div');
    track.className = 'anavo-ls-track' + (CFG.pauseOnHover === 'true' ? ' anavo-ls-pause' : '');

    // Clone images twice for seamless loop (original set + duplicate set)
    var allImgs = Array.prototype.slice.call(origImgs);
    allImgs.forEach(function (img) {
      var clone = img.cloneNode(true);
      track.appendChild(clone);
    });
    // Duplicate for seamless loop
    allImgs.forEach(function (img) {
      var clone = img.cloneNode(true);
      track.appendChild(clone);
    });

    viewport.appendChild(track);

    // Clear original content and replace with scroller
    container.innerHTML = '';
    container.appendChild(viewport);
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

    injectStyles();
    checkLicense();

    var containers = document.querySelectorAll(CFG.selector);
    if (!containers.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] Selector "' + CFG.selector + '" not found after 5s.');
      return;
    }

    containers.forEach(function (container) {
      buildScroller(container);
    });
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
