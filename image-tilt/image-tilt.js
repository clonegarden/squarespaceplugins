/**
 * ============================================================
 * IMAGE TILT PLUGIN — Anavo Tech
 * ============================================================
 * @plugin_id  ImageTilt
 * @version    1.0.0
 * @author     Anavo Tech
 * @license    Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Hover parallax tilt on images. When the mouse enters an
 *   image it is replaced by stacked semi-transparent
 *   background-image layers that each move with different
 *   amounts relative to the cursor, producing a depth / tilt
 *   parallax effect. On mouseleave all layers reset to center.
 *   Inspired by Codrops ImageTiltEffect (tiltfx.js).
 *   Zero external dependencies — pure vanilla JS.
 *
 * USAGE:
 *   1. Tag each image you want to tilt:
 *        <img src="photo.jpg" data-anavo-tilt />
 *      OR use a custom selector via the `selector` param.
 *
 *   2. Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/image-tilt/image-tilt.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &layers=3
 *          &opacity=0.7
 *          &rotateX=2
 *          &rotateY=2
 *          &translateX=10
 *          &translateY=10
 *          &translateZ=20
 *          &perspective=1000
 *        "></script>
 *
 * PARAMETERS (URL query string — encode # as %23):
 * ┌──────────────┬──────────────────────────────────────────────┬────────────────────┐
 * │ Parameter    │ Description                                  │ Default            │
 * ├──────────────┼──────────────────────────────────────────────┼────────────────────┤
 * │ domain       │ Hostname for license check                   │ location.hostname  │
 * │ supabaseUrl  │ Supabase project URL                         │ (required)         │
 * │ supabaseKey  │ Supabase anon key                            │ (required)         │
 * │ selector     │ CSS selector for <img> elements to tilt      │ [data-anavo-tilt]  │
 * │ target       │ CSS selector for mount-point poll            │ [data-anavo-image-tilt] │
 * │ layers       │ Number of front layer copies (1–8)           │ 3                  │
 * │ opacity      │ Opacity of each front layer                  │ 0.7                │
 * │ translateX   │ Max translateX in px                         │ 10                 │
 * │ translateY   │ Max translateY in px                         │ 10                 │
 * │ translateZ   │ Max translateZ in px                         │ 20                 │
 * │ rotateX      │ Max rotateX in degrees                       │ 2                  │
 * │ rotateY      │ Max rotateY in degrees                       │ 2                  │
 * │ perspective  │ CSS perspective in px                        │ 1000               │
 * │ resetOnLeave │ Reset transform on mouseleave                │ true               │
 * └──────────────┴──────────────────────────────────────────────┴────────────────────┘
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ImageTilt';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="image-tilt"]');
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

  var rawLayers = parseInt(p('layers', '3'), 10);

  var CFG = {
    domain:         p('domain',         window.location.hostname),
    supabaseUrl:    p('supabaseUrl',    ''),
    supabaseKey:    p('supabaseKey',    ''),
    selector:       p('selector',       '[data-anavo-tilt]'),
    target:         p('target',         '[data-anavo-image-tilt]'),
    layers:         Math.min(8, Math.max(1, isNaN(rawLayers) ? 3 : rawLayers)),
    opacity:        parseFloat(p('opacity',     '0.7')),
    translateX:     parseFloat(p('translateX',  '10')),
    translateY:     parseFloat(p('translateY',  '10')),
    translateZ:     parseFloat(p('translateZ',  '20')),
    rotateX:        parseFloat(p('rotateX',     '2')),
    rotateY:        parseFloat(p('rotateY',     '2')),
    perspective:    parseInt(p('perspective',   '1000'), 10),
    resetOnLeave:   p('resetOnLeave',   'true') !== 'false'
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  if (window.AnavoPluginState.plugins[PLUGIN_ID]) return;
  window.AnavoPluginState.plugins[PLUGIN_ID] = { version: VERSION, config: CFG };

  // ─────────────────────────────────────────────────────────────────
  // 3. LICENSE CHECK — Supabase REST (non-blocking)
  // ─────────────────────────────────────────────────────────────────

  var _BYPASS = ['anavo.tech', 'www.anavo.tech', 'localhost', '127.0.0.1'];

  function checkLicense() {
    try {
      var host = window.location.hostname.toLowerCase().replace(/^www\./, '');
      if (_BYPASS.indexOf(host) > -1) return;
      if (!CFG.supabaseUrl || !CFG.supabaseKey) {
        console.warn('[Anavo ' + PLUGIN_ID + '] supabaseUrl/supabaseKey not set — skipping license check.');
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
          console.warn('[Anavo ' + PLUGIN_ID + '] Unlicensed domain: ' + host);
          _showNotice();
        }
      })
      .catch(function () {});
    } catch (e) {}
  }

  function _showNotice() {
    if (document.getElementById('anavo-tilt-notice')) return;
    var el = document.createElement('div');
    el.id = 'anavo-tilt-notice';
    el.setAttribute('style',
      'position:fixed!important;' +
      'bottom:20px!important;' +
      'left:20px!important;' +
      'background:rgba(0,0,0,0.88)!important;' +
      'color:#fff!important;' +
      'padding:12px 18px!important;' +
      'border-radius:6px!important;' +
      'font-family:monospace,monospace!important;' +
      'font-size:12px!important;' +
      'z-index:999999!important;' +
      'pointer-events:auto!important;' +
      'line-height:1.6!important;' +
      'max-width:280px!important;' +
      'box-sizing:border-box!important;'
    );
    el.innerHTML =
      '<strong style="display:block;margin-bottom:4px;font-family:monospace">Anavo ImageTilt — Unlicensed</strong>' +
      '<a href="https://anavo.tech/plugins" target="_blank" rel="noopener" ' +
      'style="color:#ffd700;text-decoration:none;font-family:monospace">' +
      'Get a license → anavo.tech/plugins</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById('anavo-tilt-styles');
    if (ex) ex.remove();

    var css =
      /* ── Wrapper ──────────────────────────────────────────────── */
      '.anavo-tilt-wrap{' +
        'position:relative!important;' +
        'display:inline-block!important;' +
        'width:100%!important;' +
        'overflow:hidden!important;' +
        'cursor:none!important;' +
        'box-sizing:border-box!important;' +
        'vertical-align:top!important;' +
      '}' +

      /* ── Shared layer rules ────────────────────────────────────── */
      '.anavo-tilt-back,' +
      '.anavo-tilt-front{' +
        'position:absolute!important;' +
        'top:-5%!important;' +
        'left:-5%!important;' +
        'width:110%!important;' +
        'height:110%!important;' +
        'background-size:cover!important;' +
        'background-position:center center!important;' +
        'background-repeat:no-repeat!important;' +
        'will-change:transform!important;' +
        'transition:transform 0.3s ease!important;' +
        'pointer-events:none!important;' +
      '}' +

      /* ── Back layer — height anchor (no-move) ──────────────────── */
      '.anavo-tilt-back{' +
        'z-index:1!important;' +
        'opacity:1!important;' +
      '}' +

      /* ── Front layers — move on mousemove ──────────────────────── */
      '.anavo-tilt-front{' +
        'z-index:2!important;' +
      '}' +

      /* ── Height placeholder so the wrapper has intrinsic height ── */
      '.anavo-tilt-sizer{' +
        'display:block!important;' +
        'width:100%!important;' +
        'visibility:hidden!important;' +
        'pointer-events:none!important;' +
      '}';

    var tag = document.createElement('style');
    tag.id          = 'anavo-tilt-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. TILT MATH — compute per-layer transform string
  // ─────────────────────────────────────────────────────────────────

  /**
   * @param {number} i        layer index 0-based
   * @param {number} relX     cursor X relative to wrapper (px)
   * @param {number} relY     cursor Y relative to wrapper (px)
   * @param {number} w        wrapper width  (px)
   * @param {number} h        wrapper height (px)
   * @returns {string}        CSS transform value
   */
  function layerTransform(i, relX, relY, w, h) {
    var factor = (i + 1) / CFG.layers;

    var tx = 2 * (factor * CFG.translateX) / w * relX - (factor * CFG.translateX);
    var ty = 2 * (factor * CFG.translateY) / h * relY - (factor * CFG.translateY);
    var tz = 2 * (factor * CFG.translateZ) / h * relY - (factor * CFG.translateZ);
    var rx = 2 * (factor * CFG.rotateX)    / h * relY - (factor * CFG.rotateX);
    var ry = 2 * (factor * CFG.rotateY)    / w * relX - (factor * CFG.rotateY);

    return 'perspective(' + CFG.perspective + 'px) ' +
           'translate3d(' + tx + 'px,' + ty + 'px,' + tz + 'px) ' +
           'rotate3d(1,0,0,' + rx + 'deg) ' +
           'rotate3d(0,1,0,' + ry + 'deg)';
  }

  var _resetTransform =
    'perspective(' + CFG.perspective + 'px) ' +
    'translate3d(0,0,0) ' +
    'rotate3d(1,1,1,0deg)';

  // ─────────────────────────────────────────────────────────────────
  // 6. WRAP A SINGLE IMAGE
  // ─────────────────────────────────────────────────────────────────

  function wrapImage(img) {
    if (img.hasAttribute('data-anavo-tilt-done')) return;
    img.setAttribute('data-anavo-tilt-done', '1');

    var src    = img.src || img.getAttribute('src') || '';
    var alt    = img.getAttribute('alt') || '';
    var parent = img.parentNode;

    /* Detect containing <a> tag — we'll re-insert inside it if present */
    var anchor     = null;
    var anchorClone = null;
    if (parent && parent.tagName === 'A') {
      anchor = parent;
    }

    /* Build wrapper */
    var wrap = document.createElement('div');
    wrap.className = 'anavo-tilt-wrap';

    /* Height sizer — preserves aspect ratio using a transparent copy of the img */
    var sizer     = document.createElement('img');
    sizer.src     = src;
    sizer.alt     = alt;
    sizer.className = 'anavo-tilt-sizer';
    wrap.appendChild(sizer);

    /* Back layer — static, never moves */
    var back = document.createElement('div');
    back.className = 'anavo-tilt-back';
    back.style.setProperty('background-image', 'url(' + src + ')', 'important');
    wrap.appendChild(back);

    /* Front layers — one per CFG.layers, each moves progressively more */
    var fronts = [];
    for (var i = 0; i < CFG.layers; i++) {
      var front = document.createElement('div');
      front.className = 'anavo-tilt-front';
      front.style.setProperty('background-image', 'url(' + src + ')', 'important');
      front.style.setProperty('opacity', String(CFG.opacity), 'important');
      wrap.appendChild(front);
      fronts.push(front);
    }

    /* ── Mouse interaction ─────────────────────────────────────── */
    var rafId      = null;
    var pendingX   = 0;
    var pendingY   = 0;
    var isActive   = false;

    function applyTilt() {
      var rect = wrap.getBoundingClientRect();
      var relX = pendingX - rect.left;
      var relY = pendingY - rect.top;
      var w    = rect.width  || 1;
      var h    = rect.height || 1;

      for (var j = 0; j < fronts.length; j++) {
        fronts[j].style.setProperty(
          'transform',
          layerTransform(j, relX, relY, w, h),
          'important'
        );
      }
      rafId = null;
    }

    wrap.addEventListener('mousemove', function (e) {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(applyTilt);
      }
    });

    if (CFG.resetOnLeave) {
      wrap.addEventListener('mouseleave', function () {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        setTimeout(function () {
          for (var j = 0; j < fronts.length; j++) {
            fronts[j].style.setProperty('transform', _resetTransform, 'important');
          }
        }, 60);
      });
    }

    /* ── Insert wrapper into DOM ───────────────────────────────── */
    if (anchor) {
      /*
       * img is the direct child of an <a>. We want:
       *   <a href="..."><div class="anavo-tilt-wrap">...</div></a>
       * Replace img with wrap inside the anchor.
       */
      anchor.replaceChild(wrap, img);
    } else {
      parent.replaceChild(wrap, img);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. SCAN — find all unprocessed matching images
  // ─────────────────────────────────────────────────────────────────

  function scanImages() {
    try {
      var imgs = document.querySelectorAll(CFG.selector);
      for (var i = 0; i < imgs.length; i++) {
        var el = imgs[i];
        if (el.tagName !== 'IMG') continue;
        if (el.hasAttribute('data-anavo-tilt-done')) continue;
        wrapImage(el);
      }
    } catch (e) {
      console.warn('[Anavo ' + PLUGIN_ID + '] scanImages error:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. POLL — wait for target / handle dynamic images
  // ─────────────────────────────────────────────────────────────────

  var _pollCount = 0;
  var _pollMax   = 50;
  var _pollMs    = 100;

  function poll() {
    _pollCount++;

    /* Run the image scan on every tick — idempotency is handled by
       data-anavo-tilt-done, so re-scanning is always safe            */
    scanImages();

    if (_pollCount < _pollMax) {
      setTimeout(poll, _pollMs);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. RESIZE HANDLER — wraps are fluid (100% width) so no explicit
  //    recalc needed; getBoundingClientRect in applyTilt is always
  //    live. We do nothing extra here but keep the hook for future use.
  // ─────────────────────────────────────────────────────────────────

  window.addEventListener('resize', function () {
    /* Intentionally empty — getBoundingClientRect reads live dimensions
       on every mousemove frame, so no manual recalculation is needed. */
  });

  // ─────────────────────────────────────────────────────────────────
  // 10. INIT
  // ─────────────────────────────────────────────────────────────────

  function init() {
    try {
      injectStyles();
      checkLicense();
      poll();
    } catch (e) {
      console.warn('[Anavo ' + PLUGIN_ID + '] init error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
