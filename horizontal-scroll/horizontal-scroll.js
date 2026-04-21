/**
 * ============================================================
 * HORIZONTAL SCROLL — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   A container [data-anavo-hscroll] scrolls horizontally when
 *   the user scrolls vertically over it. The section "locks"
 *   vertical scroll while the user scrolls through the horizontal
 *   content, then releases. Like Apple's chip showcase page.
 *
 * USAGE:
 *   <div data-anavo-hscroll>
 *     <div class="anavo-hs-inner">
 *       <div class="anavo-hs-panel">Panel 1</div>
 *       <div class="anavo-hs-panel">Panel 2</div>
 *       <div class="anavo-hs-panel">Panel 3</div>
 *     </div>
 *   </div>
 *   Or just add children — the plugin wraps them automatically.
 *
 * PARAMETERS:
 *   selector    container selector        default: [data-anavo-hscroll]
 *   speed       scroll multiplier         default: 1
 *   easing      smooth easing on/off      default: true
 *   indicator   show progress bar         default: true
 *   domain      license check hostname
 *   supabaseUrl Supabase project URL
 *   supabaseKey Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'HorizontalScroll';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="horizontal-scroll"]');
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
    selector:    p('selector',    '[data-anavo-hscroll]'),
    speed:       parseFloat(p('speed',     '1')),
    easing:      p('easing',     'true'),
    indicator:   p('indicator',  'true')
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
    var nid = 'anavo-hs-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get HorizontalScroll license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('anavo-hs-styles')) return;
    var css =
      '.anavo-hs-section{' +
        'position:relative!important;' +
        'overflow:hidden!important;' +
        'width:100%!important;' +
      '}' +

      '.anavo-hs-sticky{' +
        'position:sticky!important;' +
        'top:0!important;' +
        'height:100vh!important;' +
        'overflow:hidden!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
      '}' +

      '.anavo-hs-track{' +
        'display:flex!important;' +
        'flex-wrap:nowrap!important;' +
        'will-change:transform!important;' +
        'height:100%!important;' +
        'align-items:center!important;' +
      '}' +

      '.anavo-hs-panel{' +
        'flex:0 0 100vw!important;' +
        'height:100%!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'padding:60px!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      '.anavo-hs-progress{' +
        'position:absolute!important;' +
        'bottom:0!important;' +
        'left:0!important;' +
        'width:100%!important;' +
        'height:3px!important;' +
        'background:rgba(255,255,255,0.15)!important;' +
        'z-index:10!important;' +
      '}' +

      '.anavo-hs-progress-bar{' +
        'height:100%!important;' +
        'background:#00d4ff!important;' +
        'width:0%!important;' +
        'transition:width 0.05s linear!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-hs-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. SETUP HORIZONTAL SCROLLER
  // ─────────────────────────────────────────────────────────────────

  function setupScroller(container) {
    if (container.getAttribute('data-anavo-hs-done') === 'true') return;
    container.setAttribute('data-anavo-hs-done', 'true');

    // Grab original children before rearranging
    var children = Array.prototype.slice.call(container.children);

    // Check if already has anavo-hs-panel children — if not, wrap each child
    var panels = container.querySelectorAll('.anavo-hs-panel');
    if (!panels.length) {
      children.forEach(function (child) {
        child.classList.add('anavo-hs-panel');
      });
      panels = container.querySelectorAll('.anavo-hs-panel');
    }

    var panelCount = panels.length;
    if (!panelCount) return;

    // Build structure: section > sticky > track > panels
    var section = document.createElement('div');
    section.className = 'anavo-hs-section';
    // Height = 100vh per panel — this creates the "scroll space"
    section.style.setProperty('height', (panelCount * 100) + 'vh', 'important');

    var sticky = document.createElement('div');
    sticky.className = 'anavo-hs-sticky';

    var track = document.createElement('div');
    track.className = 'anavo-hs-track';

    // Move panels into track
    panels.forEach(function (panel) {
      track.appendChild(panel);
    });

    sticky.appendChild(track);

    // Progress indicator
    var progressBar = null;
    if (CFG.indicator === 'true') {
      var progress = document.createElement('div');
      progress.className = 'anavo-hs-progress';
      progressBar = document.createElement('div');
      progressBar.className = 'anavo-hs-progress-bar';
      progress.appendChild(progressBar);
      sticky.appendChild(progress);
    }

    section.appendChild(sticky);

    // Replace container content
    container.innerHTML = '';
    container.appendChild(section);

    // Easing state
    var currentX  = 0;
    var targetX   = 0;
    var ease      = 0.1;
    var _raf      = null;

    function animate() {
      if (CFG.easing === 'true') {
        currentX += (targetX - currentX) * ease;
        if (Math.abs(targetX - currentX) < 0.5) currentX = targetX;
      } else {
        currentX = targetX;
      }

      track.style.setProperty(
        'transform',
        'translateX(' + (-currentX) + 'px)',
        'important'
      );

      var totalW = track.scrollWidth - window.innerWidth;
      if (progressBar && totalW > 0) {
        progressBar.style.setProperty(
          'width',
          Math.min(100, (currentX / totalW) * 100) + '%',
          'important'
        );
      }

      if (CFG.easing === 'true' && Math.abs(targetX - currentX) > 0.1) {
        _raf = requestAnimationFrame(animate);
      } else {
        _raf = null;
      }
    }

    function onScroll() {
      var rect    = section.getBoundingClientRect();
      var sectionTop    = rect.top;
      var sectionHeight = section.offsetHeight;
      var viewH   = window.innerHeight;

      // Progress: 0 when section top hits viewport top, 1 when section bottom leaves
      var scrollable = sectionHeight - viewH;
      var progress   = scrollable > 0
        ? Math.max(0, Math.min(1, -sectionTop / scrollable))
        : 0;

      var maxScrollX = track.scrollWidth - window.innerWidth;
      targetX = progress * maxScrollX * CFG.speed;
      targetX = Math.max(0, Math.min(maxScrollX, targetX));

      if (!_raf) {
        if (CFG.easing === 'true') {
          _raf = requestAnimationFrame(animate);
        } else {
          animate();
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
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

    // Skip on mobile/tablet (touch devices rely on native scroll)
    if (window.innerWidth <= 800) return;

    var containers = document.querySelectorAll(CFG.selector);
    if (!containers.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] Selector "' + CFG.selector + '" not found after 5s.');
      return;
    }

    injectStyles();
    checkLicense();
    containers.forEach(function (c) { setupScroller(c); });
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
