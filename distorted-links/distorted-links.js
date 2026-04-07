/**
 * ============================================================
 * DISTORTED LINKS PLUGIN — Anavo Tech
 * ============================================================
 * @plugin   DistortedLinks
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   SVG filter distortion on link hover. When the user hovers
 *   a matched <a> element, an animated SVG filter (feTurbulence
 *   + feDisplacementMap) is applied via rAF-driven interpolation.
 *   Two effect modes available:
 *     • turbulence  — baseFrequency decays from 0.09 → 0 (jittery → smooth)
 *     • displacement — feDisplacementMap scale spikes to 60, then decays
 *   An optional decorative underline element is injected per link.
 *   Inspired by Codrops DistortedMenuLinkEffects.
 *
 * USAGE:
 *   1. Add the `data-anavo-distort` attribute to any <a> element:
 *        <a href="/page" data-anavo-distort>Hover me</a>
 *      Or configure a custom `selector` param to match existing elements.
 *
 *   2. Paste in Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/distorted-links/distorted-links.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &effect=turbulence
 *          &showLine=true
 *          &lineWidth=2
 *        "></script>
 *
 * PARAMETERS (URL query string):
 * ┌─────────────┬─────────────────────────────────────────────┬─────────────────────────┐
 * │ Param        │ Description                                 │ Default                 │
 * ├─────────────┼─────────────────────────────────────────────┼─────────────────────────┤
 * │ domain       │ Hostname for license check                  │ location.hostname       │
 * │ supabaseUrl  │ Supabase project URL                        │ (empty)                 │
 * │ supabaseKey  │ Supabase anon key                           │ (empty)                 │
 * │ selector     │ CSS selector for links to enhance           │ [data-anavo-distort]    │
 * │ effect       │ turbulence | displacement                   │ turbulence              │
 * │ lineWidth    │ Deco line thickness in px                   │ 2                       │
 * │ showLine     │ Show decorative underline line              │ true                    │
 * │ showText     │ Apply filter to text span too (for future)  │ false                   │
 * │ color        │ Override link color (CSS color value)       │ inherit                 │
 * │ target       │ Mount point selector (for poll guard)       │ [data-anavo-distorted-links] │
 * └─────────────┴─────────────────────────────────────────────┴─────────────────────────┘
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID      = 'DistortedLinks';
  var VERSION        = '1.0.0';
  var FILTER_ID_1    = 'anavo-dl-f1';
  var FILTER_ID_2    = 'anavo-dl-f2';
  var _BYPASS        = ['anavo.tech', 'www.anavo.tech', 'pluginstore.anavo.tech', 'clonegarden.github.io', 'localhost', '127.0.0.1'];

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="distorted-links"]');
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
    selector:    p('selector',    '[data-anavo-distort]'),
    effect:      p('effect',      'turbulence'),
    lineWidth:   parseInt(p('lineWidth', '2'), 10) || 2,
    showLine:    p('showLine',    'true')  !== 'false',
    showText:    p('showText',    'false') === 'true',
    color:       p('color',       'inherit'),
    target:      p('target',      '[data-anavo-distorted-links]')
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || {};
  if (window.AnavoPluginState[PLUGIN_ID]) {
    return; // already running
  }
  window.AnavoPluginState[PLUGIN_ID] = { version: VERSION, active: true };

  // ─────────────────────────────────────────────────────────────────
  // 3. LICENSE CHECK — Supabase REST (non-blocking)
  // ─────────────────────────────────────────────────────────────────

  function checkLicense() {
    try {
      var host = (CFG.domain || window.location.hostname).toLowerCase().replace(/^www\./, '');
      if (_BYPASS.indexOf(host) > -1) return;
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
        cache:  'no-cache',
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
    if (document.getElementById('anavo-dl-license-notice')) return;
    var el = document.createElement('div');
    el.id = 'anavo-dl-license-notice';
    el.setAttribute('style',
      'position:fixed!important;bottom:20px!important;right:20px!important;' +
      'background:rgba(0,0,0,0.9)!important;color:#fff!important;' +
      'padding:12px 18px!important;border-radius:6px!important;' +
      'font-family:system-ui,sans-serif!important;font-size:12px!important;' +
      'z-index:999999!important;pointer-events:auto!important;line-height:1.6!important'
    );
    el.innerHTML =
      '<strong style="display:block;margin-bottom:4px">Unlicensed Plugin</strong>' +
      '<a href="https://anavo.tech/plugins" target="_blank" rel="noopener" ' +
      'style="color:#ffd700;text-decoration:none">Get DistortedLinks license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. SVG FILTERS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectSVGFilters() {
    if (document.getElementById('anavo-dl-svg-filters')) return;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'anavo-dl-svg-filters';
    svg.setAttribute('class', 'anavo-dl-svg-filters');
    svg.setAttribute('style', 'position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;pointer-events:none!important');
    svg.setAttribute('aria-hidden', 'true');

    svg.innerHTML =
      '<defs>' +
        // Effect 1: turbulence-decay
        '<filter id="' + FILTER_ID_1 + '">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="3" result="warp"/>' +
          '<feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="30" in="SourceGraphic" in2="warp"/>' +
        '</filter>' +
        // Effect 2: displacement-pulse
        '<filter id="' + FILTER_ID_2 + '">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.15 0.02" numOctaves="3" result="warp"/>' +
          '<feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="0" in="SourceGraphic" in2="warp"/>' +
        '</filter>' +
      '</defs>';

    document.body.insertBefore(svg, document.body.firstChild);
  }

  // Cache references to SVG filter primitives after injection
  var _filterRefs = {};

  function getFilterRefs() {
    if (_filterRefs.ready) return _filterRefs;
    var f1 = document.getElementById(FILTER_ID_1);
    var f2 = document.getElementById(FILTER_ID_2);
    if (!f1 || !f2) return null;

    _filterRefs.f1Turbulence    = f1.querySelector('feTurbulence');
    _filterRefs.f1Displacement  = f1.querySelector('feDisplacementMap');
    _filterRefs.f2Turbulence    = f2.querySelector('feTurbulence');
    _filterRefs.f2Displacement  = f2.querySelector('feDisplacementMap');
    _filterRefs.ready = true;
    return _filterRefs;
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('anavo-dl-styles')) return;

    var lw = CFG.lineWidth + 'px';
    var linkColor = CFG.color !== 'inherit' ? CFG.color : 'inherit';

    var css =
      // Link wrapper — must be position:relative for deco positioning
      '.anavo-distort-link {' +
        'position:relative!important;' +
        'display:inline-block!important;' +
        'text-decoration:none!important;' +
        'overflow:visible!important;' +
        (linkColor !== 'inherit' ? 'color:' + linkColor + '!important;' : '') +
        'cursor:pointer!important;' +
      '}' +

      // Text span — inherits all typographic styles
      '.anavo-dl-text {' +
        'display:inline!important;' +
        'pointer-events:none!important;' +
      '}' +

      // Decorative underline
      '.anavo-dl-deco {' +
        'display:block!important;' +
        'position:absolute!important;' +
        'bottom:0!important;' +
        'left:0!important;' +
        'width:100%!important;' +
        'height:' + lw + '!important;' +
        'background:currentColor!important;' +
        'transform-origin:left center!important;' +
        'pointer-events:none!important;' +
      '}' +

      // Hidden deco when showLine is false
      (!CFG.showLine ?
        '.anavo-dl-deco { display:none!important; }' : '') +

      // Hidden SVG filter container
      '.anavo-dl-svg-filters {' +
        'position:absolute!important;' +
        'width:0!important;' +
        'height:0!important;' +
        'overflow:hidden!important;' +
        'pointer-events:none!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-dl-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. DOM TRANSFORMATION
  // ─────────────────────────────────────────────────────────────────

  function transformLink(el) {
    // Only process <a> elements
    if (el.tagName.toLowerCase() !== 'a') return;
    // Skip already processed
    if (el.getAttribute('data-anavo-dl-done') === 'true') return;

    // Extract current text content (preserve it)
    var originalHTML = el.innerHTML;

    // Wrap content in .anavo-dl-text span
    var textSpan = document.createElement('span');
    textSpan.className = 'anavo-dl-text';
    textSpan.innerHTML = originalHTML;

    // Create decorative underline
    var decoSpan = document.createElement('span');
    decoSpan.className = 'anavo-dl-deco';
    decoSpan.setAttribute('aria-hidden', 'true');

    // Rebuild inner DOM
    el.innerHTML = '';
    el.appendChild(textSpan);
    el.appendChild(decoSpan);

    // Ensure the link has the correct class for CSS targeting
    if (!el.classList.contains('anavo-distort-link')) {
      el.classList.add('anavo-distort-link');
    }

    // Attach animation listeners (desktop only)
    if (window.innerWidth > 800) {
      attachAnimation(el);
    }

    el.setAttribute('data-anavo-dl-done', 'true');
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. rAF ANIMATION ENGINE
  // ─────────────────────────────────────────────────────────────────

  /**
   * Each animated element gets its own animation state object.
   * We store it on the element to allow enter/leave to coordinate.
   */
  function attachAnimation(el) {
    var state = {
      rafId:  null,
      active: false,
      phase:  'idle' // 'in' | 'out' | 'idle'
    };
    el._anavoDLState = state;

    el.addEventListener('mouseenter', function () {
      // Cancel any running decay on leave
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
      state.active = true;
      state.phase  = 'in';

      if (CFG.effect === 'displacement') {
        runDisplacementPulse(el, state);
      } else {
        runTurbulenceDecay(el, state);
      }
    });

    el.addEventListener('mouseleave', function () {
      state.active = false;
      state.phase  = 'out';
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
      // Clear filter immediately on leave
      el.style.filter = 'none';
    });
  }

  // ── Effect 1: Turbulence Decay ─────────────────────────────────

  function runTurbulenceDecay(el, state) {
    var refs = getFilterRefs();
    if (!refs) return;

    var turbulence = 0.09;
    el.style.filter = 'url(#' + FILTER_ID_1 + ')';

    function tick() {
      if (!state.active) {
        el.style.filter = 'none';
        return;
      }

      turbulence *= 0.88;

      if (turbulence < 0.001) {
        refs.f1Turbulence.setAttribute('baseFrequency', '0');
        el.style.filter = 'none';
        state.rafId = null;
        state.phase = 'idle';
        return;
      }

      refs.f1Turbulence.setAttribute('baseFrequency', turbulence.toFixed(5));
      state.rafId = requestAnimationFrame(tick);
    }

    state.rafId = requestAnimationFrame(tick);
  }

  // ── Effect 2: Displacement Pulse ──────────────────────────────

  function runDisplacementPulse(el, state) {
    var refs = getFilterRefs();
    if (!refs) return;

    var scale        = 0;
    var peakReached  = false;
    var PEAK_THRESHOLD = 50;
    var TARGET_SCALE   = 60;

    el.style.filter = 'url(#' + FILTER_ID_2 + ')';

    function tick() {
      if (!state.active) {
        refs.f2Displacement.setAttribute('scale', '0');
        el.style.filter = 'none';
        return;
      }

      if (!peakReached) {
        // Attack phase: fast rise toward TARGET_SCALE
        scale += (TARGET_SCALE - scale) * 0.3;
        if (scale >= PEAK_THRESHOLD) {
          peakReached = true;
        }
      } else {
        // Decay phase: exponential falloff
        scale *= 0.85;
        if (scale < 0.5) {
          refs.f2Displacement.setAttribute('scale', '0');
          el.style.filter = 'none';
          state.rafId = null;
          state.phase = 'idle';
          return;
        }
      }

      refs.f2Displacement.setAttribute('scale', scale.toFixed(3));
      state.rafId = requestAnimationFrame(tick);
    }

    state.rafId = requestAnimationFrame(tick);
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. SCAN + PROCESS LINKS
  // ─────────────────────────────────────────────────────────────────

  function scanLinks() {
    var matches = document.querySelectorAll(CFG.selector);
    for (var i = 0; i < matches.length; i++) {
      transformLink(matches[i]);
    }
  }

  // Re-scan every 500ms for 5s to catch dynamic Squarespace content
  function startReScan() {
    var attempts  = 0;
    var MAX       = 10;   // 10 × 500ms = 5s
    var interval  = setInterval(function () {
      scanLinks();
      attempts++;
      if (attempts >= MAX) clearInterval(interval);
    }, 500);
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. POLL FOR TARGET MOUNT POINT (100ms × 50 = 5s)
  // ─────────────────────────────────────────────────────────────────

  function init() {
    injectSVGFilters();
    injectStyles();
    checkLicense();
    scanLinks();
    startReScan();
  }

  var _pollCount = 0;
  var _MAX_POLLS = 50;

  function pollForTarget() {
    // If no specific target is set, init immediately
    if (!CFG.target || CFG.target === '[data-anavo-distorted-links]') {
      var targetEl = document.querySelector(CFG.target);
      if (targetEl) {
        init();
        return;
      }
      // No explicit target container needed — just init if body is ready
      if (document.body) {
        init();
        return;
      }
    } else {
      if (document.querySelector(CFG.target)) {
        init();
        return;
      }
    }

    _pollCount++;
    if (_pollCount < _MAX_POLLS) {
      setTimeout(pollForTarget, 100);
    } else {
      // Fallback: init anyway if body exists
      if (document.body) init();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. BOOTSTRAP
  // ─────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pollForTarget);
  } else {
    pollForTarget();
  }

})();
