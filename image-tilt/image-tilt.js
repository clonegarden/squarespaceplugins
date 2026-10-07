/**
 * ============================================================
 * IMAGE TILT PLUGIN — Anavo Tech
 * ============================================================
 * @plugin_id  ImageTilt
 * @version    1.2.0
 * @author     Anavo Tech
 * @license    Commercial — plugins.anavo.tech
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
 *          ?layers=3
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
 * │ supabaseUrl  │ Ignored since v1.2.0 (shared licensing)      │ —                  │
 * │ supabaseKey  │ Ignored since v1.2.0 (shared licensing)      │ —                  │
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
 *
 * HOVER FX (v1.1.0 — all OPT-IN; with the defaults below nothing new is
 * added to the page and the plugin looks exactly like v1.0.0):
 * ┌─────────────────┬───────────────────────────────────────────────┬─────────────┐
 * │ Parameter       │ Description                                   │ Default     │
 * ├─────────────────┼───────────────────────────────────────────────┼─────────────┤
 * │ distort         │ Shape distortion: none | liquid | bulge |     │ none        │
 * │                 │ skew | wave                                   │             │
 * │                 │  liquid — SVG turbulence displacement, grows  │             │
 * │                 │           with cursor speed, noise pattern    │             │
 * │                 │           follows cursor position             │             │
 * │                 │  wave   — horizontal ripple displacement,     │             │
 * │                 │           speed-driven                        │             │
 * │                 │  bulge  — lens zoom anchored at the cursor    │             │
 * │                 │  skew   — elastic skew in the direction of    │             │
 * │                 │           movement                            │             │
 * │ distortStrength │ Distortion amount 0–100                       │ 30          │
 * │ distortScale    │ Noise frequency for liquid/wave 0.001–0.1     │ 0.012       │
 * │                 │ (higher = finer ripples)                      │             │
 * │ distortEase     │ Smoothing / ease-back factor 0.05–0.5         │ 0.12        │
 * │                 │ (lower = slower, more fluid)                  │             │
 * │ colorFx         │ Colour distortion: none | rgbSplit |          │ none        │
 * │                 │ hueShift | duotone | glitch                   │             │
 * │                 │  rgbSplit — chromatic aberration, R/B offset  │             │
 * │                 │             by cursor offset + velocity       │             │
 * │                 │  hueShift — hue rotates with cursor X         │             │
 * │                 │  duotone  — image shown in two colours, the   │             │
 * │                 │             original is revealed under cursor │             │
 * │                 │  glitch   — RGB slice jitter on fast moves    │             │
 * │ colorStrength   │ Colour effect amount 0–100                    │ 40          │
 * │ duotoneDark     │ Duotone shadow colour (encode # as %23)       │ #14213d     │
 * │ duotoneLight    │ Duotone highlight colour (encode # as %23)    │ #fca311     │
 * │ revealRadius    │ Duotone reveal circle radius in px 20–600     │ 110         │
 * └─────────────────┴───────────────────────────────────────────────┴─────────────┘
 *   Effects combine with the layered tilt and with each other
 *   (one distort + one colorFx). One shared requestAnimationFrame
 *   loop runs only while an image is hovered or easing back, and is
 *   paused for images that are off-screen. prefers-reduced-motion:
 *   reduce disables distort and the moving colour effects (duotone
 *   stays, without easing). Touch: effects follow the finger on
 *   touchmove via passive listeners — page scroll is never blocked.
 *   Example: ...image-tilt.js?distort=liquid&colorFx=rgbSplit&distortStrength=50
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ImageTilt';
  var VERSION   = '1.2.0';

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
    resetOnLeave:   p('resetOnLeave',   'true') !== 'false',

    /* ── v1.1.0 hover FX (opt-in) ─────────────────────────────── */
    distort:         pickMode(p('distort', 'none'), ['none', 'liquid', 'bulge', 'skew', 'wave']),
    distortStrength: clampNum(p('distortStrength', '30'),    0,     100,  30),
    distortScale:    clampNum(p('distortScale',    '0.012'), 0.001, 0.1,  0.012),
    distortEase:     clampNum(p('distortEase',     '0.12'),  0.05,  0.5,  0.12),
    colorFx:         pickMode(p('colorFx', 'none'), ['none', 'rgbSplit', 'hueShift', 'duotone', 'glitch']),
    colorStrength:   clampNum(p('colorStrength',   '40'),    0,     100,  40),
    duotoneDark:     hexToRgb(p('duotoneDark',  '#14213d'), [20, 33, 61]),
    duotoneLight:    hexToRgb(p('duotoneLight', '#fca311'), [252, 163, 17]),
    revealRadius:    clampNum(p('revealRadius',    '110'),   20,    600,  110)
  };

  function pickMode(v, list) {
    var low = String(v).toLowerCase();
    for (var i = 0; i < list.length; i++) {
      if (list[i].toLowerCase() === low) return list[i];
    }
    return 'none';
  }

  function clampNum(v, min, max, fallback) {
    var n = parseFloat(v);
    if (isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  /* '#abc' | 'abc' | '#aabbcc' | 'aabbcc' → [r,g,b] (0–255) */
  function hexToRgb(v, fallback) {
    var h = String(v).replace(/^#/, '').trim();
    if (/^[0-9a-f]{3}$/i.test(h)) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    if (!/^[0-9a-f]{6}$/i.test(h)) return fallback;
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  if (window.AnavoPluginState.plugins[PLUGIN_ID]) return;
  window.AnavoPluginState.plugins[PLUGIN_ID] = { version: VERSION, config: CFG };

  // ─────────────────────────────────────────────────────────────────
  // 3. LICENSE CHECK — shared AnavoLicenseManager (non-blocking)
  // ─────────────────────────────────────────────────────────────────
  // Same path as every other commercial plugin: _shared/licensing.min.js
  // checks this domain against api.anavo.tech (licenses table, plugin =
  // PLUGIN_ID), lets preview/dev hosts through and shows the shared
  // unlicensed notice. It never blocks the effect.
  // supabaseUrl / supabaseKey are still accepted for old snippets, but unused.

  var LICENSING_SRC = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
  var LICENSES_JSON = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json';

  function checkLicense() {
    try {
      var run = function () {
        try {
          var lm = new window.AnavoLicenseManager(PLUGIN_ID, VERSION, {
            licenseServer: LICENSES_JSON,
            showUI: true
          });
          lm.init();
        } catch (e) {
          console.warn('[Anavo ' + PLUGIN_ID + '] License init error:', e.message);
        }
      };
      if (window.AnavoLicenseManager) { run(); return; }
      var pending = document.querySelector('script[src="' + LICENSING_SRC + '"]');
      if (pending) { pending.addEventListener('load', run); return; }
      var s = document.createElement('script');
      s.src = LICENSING_SRC;
      s.async = true;
      s.onload = run;
      s.onerror = function () {
        console.warn('[Anavo ' + PLUGIN_ID + '] Could not load licensing module');
      };
      document.head.appendChild(s);
    } catch (e) {}
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

    /* v1.1.0 FX rules — only emitted when an effect is enabled, so the
       default stylesheet stays byte-identical to v1.0.0              */
    if (FX_ON) {
      css +=
        /* Stage — holds back + front layers so one filter covers all */
        '.anavo-image-tilt-stage{' +
          'position:absolute!important;' +
          'top:0!important;' +
          'left:0!important;' +
          'width:100%!important;' +
          'height:100%!important;' +
          'pointer-events:none!important;' +
          'transform-origin:50% 50%!important;' +
        '}' +

        /* Duotone reveal — original image, masked to a circle at the cursor */
        '.anavo-image-tilt-reveal{' +
          'position:absolute!important;' +
          'top:-5%!important;' +
          'left:-5%!important;' +
          'width:110%!important;' +
          'height:110%!important;' +
          'z-index:3!important;' +
          'background-size:cover!important;' +
          'background-position:center center!important;' +
          'background-repeat:no-repeat!important;' +
          'pointer-events:none!important;' +
          '-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 0,transparent 0)!important;' +
          'mask-image:radial-gradient(circle at 50% 50%,#000 0,transparent 0)!important;' +
        '}' +

        /* Filter defs — must not be display:none (Firefox drops the filter) */
        '.anavo-image-tilt-svg{' +
          'position:absolute!important;' +
          'width:0!important;' +
          'height:0!important;' +
          'overflow:hidden!important;' +
          'pointer-events:none!important;' +
        '}';
    }

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
  // 5b. HOVER FX ENGINE — shape + colour distortion (v1.1.0, opt-in)
  // ─────────────────────────────────────────────────────────────────

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function _mq(q) {
    try { return !!(window.matchMedia && window.matchMedia(q).matches); }
    catch (e) { return false; }
  }

  var REDUCED = _mq('(prefers-reduced-motion: reduce)');
  var SMALL   = _mq('(max-width: 480px)');

  /* Effective modes — reduced motion switches off everything that moves;
     duotone is a static recolour so it stays (reveal follows without easing) */
  var FX_DISTORT = REDUCED ? 'none' : CFG.distort;
  var FX_COLOR   = (REDUCED && CFG.colorFx !== 'duotone') ? 'none' : CFG.colorFx;
  var FX_ON      = FX_DISTORT !== 'none' || FX_COLOR !== 'none';

  /* ── Shared rAF scheduler — one loop drives every image ─────── */
  var _fxActive = [];
  var _fxAll    = [];
  var _fxRaf    = null;
  var _fxCount  = 0;
  var _fxIO     = null;

  function fxWake(inst) {
    if (inst.paused) return;
    if (_fxActive.indexOf(inst) < 0) _fxActive.push(inst);
    if (!_fxRaf) _fxRaf = requestAnimationFrame(fxTick);
  }

  function fxSleep(inst) {
    var i = _fxActive.indexOf(inst);
    if (i > -1) _fxActive.splice(i, 1);
    inst.lastT = 0;
  }

  function fxTick(now) {
    _fxRaf = null;
    for (var i = _fxActive.length - 1; i >= 0; i--) {
      var keep = false;
      try { keep = _fxActive[i].step(now); } catch (e) {}
      if (!keep) { _fxActive[i].lastT = 0; _fxActive.splice(i, 1); }
    }
    if (_fxActive.length) _fxRaf = requestAnimationFrame(fxTick);
  }

  /* Pause instances whose image is off-screen */
  function fxObserve(inst) {
    if (!('IntersectionObserver' in window)) return;
    if (!_fxIO) {
      _fxIO = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          for (var j = 0; j < _fxAll.length; j++) {
            if (_fxAll[j].wrap !== entries[i].target) continue;
            _fxAll[j].paused = !entries[i].isIntersecting;
            if (_fxAll[j].paused) fxSleep(_fxAll[j]); else fxWake(_fxAll[j]);
          }
        }
      });
    }
    _fxIO.observe(inst.wrap);
  }

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function r3(n) { return Math.round(n * 1000) / 1000; }
  function r5(n) { return Math.round(n * 100000) / 100000; }

  /**
   * Build the FX controller for one wrapped image.
   * @param {HTMLElement} wrap   .anavo-tilt-wrap
   * @param {HTMLElement} stage  .anavo-image-tilt-stage (holds the layers)
   * @param {string}      src    image URL
   */
  function createFx(wrap, stage, src) {
    var n      = ++_fxCount;
    var fid    = 'anavo-image-tilt-filter-' + n;
    var mul    = SMALL ? 0.6 : 1;
    var s      = CFG.distortStrength / 100 * mul;
    var c      = CFG.colorStrength   / 100 * mul;
    var ease   = REDUCED ? 1 : CFG.distortEase;
    var noise  = FX_DISTORT === 'liquid' || FX_DISTORT === 'wave';
    var xform  = FX_DISTORT === 'bulge'  || FX_DISTORT === 'skew';
    var split  = FX_COLOR === 'rgbSplit' || FX_COLOR === 'glitch';
    var persistent = FX_COLOR === 'duotone';
    var hasFilter  = noise || FX_COLOR !== 'none';
    var N      = {};          /* live filter primitives          */
    var cache  = {};          /* last written value, per key     */
    var reveal = null;

    function setA(key, el, attr, val) {
      if (cache[key] === val) return;
      cache[key] = val;
      el.setAttribute(attr, val);
    }

    function setS(key, el, prop, val) {
      if (cache[key] === val) return;
      cache[key] = val;
      if (val === '') el.style.removeProperty(prop);
      else el.style.setProperty(prop, val, 'important');
    }

    /* ── SVG filter chain: distort → recolour → channel split ─── */
    if (hasFilter) {
      var svg = svgEl('svg', {
        'class': 'anavo-image-tilt-svg', 'aria-hidden': 'true', focusable: 'false', width: '0', height: '0'
      });
      var f = svgEl('filter', {
        id: fid, x: '-10%', y: '-10%', width: '120%', height: '120%',
        'color-interpolation-filters': 'sRGB'
      }, svg);
      var prev = 'SourceGraphic';

      if (noise) {
        N.turb = svgEl('feTurbulence', {
          type: 'fractalNoise', baseFrequency: '0', numOctaves: FX_DISTORT === 'liquid' ? '2' : '1',
          seed: String(n), result: 'noise'
        }, f);
        N.disp = svgEl('feDisplacementMap', {
          'in': prev, in2: 'noise', scale: '0', xChannelSelector: 'R', yChannelSelector: 'G', result: 'warp'
        }, f);
        prev = 'warp';
      }

      if (FX_COLOR === 'duotone') {
        var d = CFG.duotoneDark, l = CFG.duotoneLight;
        svgEl('feColorMatrix', {
          'in': prev, type: 'matrix', result: 'gray',
          values: '.2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0'
        }, f);
        var ct = svgEl('feComponentTransfer', { 'in': 'gray', result: 'duo' }, f);
        svgEl('feFuncR', { type: 'table', tableValues: r3(d[0] / 255) + ' ' + r3(l[0] / 255) }, ct);
        svgEl('feFuncG', { type: 'table', tableValues: r3(d[1] / 255) + ' ' + r3(l[1] / 255) }, ct);
        svgEl('feFuncB', { type: 'table', tableValues: r3(d[2] / 255) + ' ' + r3(l[2] / 255) }, ct);
        prev = 'duo';
      }

      if (FX_COLOR === 'hueShift') {
        N.hue = svgEl('feColorMatrix', { 'in': prev, type: 'hueRotate', values: '0', result: 'hue' }, f);
        prev = 'hue';
      }

      if (FX_COLOR === 'glitch') {
        /* Horizontal bands (noise varies along Y only), quantised into
           slices; R drives the X shift, G pinned at .5 = no Y shift  */
        N.gTurb = svgEl('feTurbulence', {
          type: 'fractalNoise', baseFrequency: '0 0.045', numOctaves: '1', seed: String(n), result: 'bands'
        }, f);
        var gct = svgEl('feComponentTransfer', { 'in': 'bands', result: 'slices' }, f);
        N.gFunc = svgEl('feFuncR', { type: 'discrete', tableValues: '0.5' }, gct);
        svgEl('feFuncG', { type: 'discrete', tableValues: '0.5' }, gct);
        svgEl('feFuncA', { type: 'discrete', tableValues: '1' }, gct);
        N.gDisp = svgEl('feDisplacementMap', {
          'in': prev, in2: 'slices', scale: '0', xChannelSelector: 'R', yChannelSelector: 'G', result: 'sliced'
        }, f);
        prev = 'sliced';
      }

      if (split) {
        svgEl('feColorMatrix', { 'in': prev, type: 'matrix', result: 'r0',
          values: '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0' }, f);
        N.offR = svgEl('feOffset', { 'in': 'r0', dx: '0', dy: '0', result: 'r1' }, f);
        svgEl('feColorMatrix', { 'in': prev, type: 'matrix', result: 'g1',
          values: '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0' }, f);
        svgEl('feColorMatrix', { 'in': prev, type: 'matrix', result: 'b0',
          values: '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0' }, f);
        N.offB = svgEl('feOffset', { 'in': 'b0', dx: '0', dy: '0', result: 'b1' }, f);
        svgEl('feBlend', { 'in': 'r1', in2: 'g1', mode: 'screen', result: 'rg' }, f);
        svgEl('feBlend', { 'in': 'rg', in2: 'b1', mode: 'screen', result: 'rgb' }, f);
      }

      wrap.appendChild(svg);
    }

    if (FX_COLOR === 'duotone') {
      reveal = document.createElement('div');
      reveal.className = 'anavo-image-tilt-reveal';
      reveal.style.setProperty('background-image', 'url(' + src + ')', 'important');
      wrap.appendChild(reveal);
    }

    /* ── State ─────────────────────────────────────────────────── */
    var st = {
      hover: false,
      cx: 0, cy: 0,                 /* client coords of the pointer         */
      tx: 0, ty: 0,                 /* target cursor, normalised -1..1      */
      x: 0,  y: 0,                  /* smoothed cursor, normalised          */
      px: 0, py: 0, rx: 0, ry: 0,   /* cursor px in wrap: target / smoothed */
      w: 1,  h: 1,
      pres: 0,                      /* hover presence 0..1                  */
      e: 0,                         /* speed energy 0..1                    */
      vx: 0, vy: 0,                 /* signed smoothed velocity -1..1       */
      burstUntil: 0, lastBurst: 0, frame: 0,
      mvx: 0, mvy: 0, msp: 0, mt: 0 /* velocity from pointer events (px/ms) */
    };

    var inst = { wrap: wrap, paused: false, lastT: 0, step: step, st: st, filterId: hasFilter ? fid : null };

    function _now() {
      return (window.performance && performance.now) ? performance.now() : Date.now();
    }

    function feed(clientX, clientY) {
      var t = _now();
      if (st.hover && st.mt) {
        var edt = Math.max(4, Math.min(100, t - st.mt));
        var ddx = clientX - st.cx, ddy = clientY - st.cy;
        /* blend with the previous sample so jittery event timing doesn't spike */
        st.mvx = (st.mvx + ddx / edt) / 2;
        st.mvy = (st.mvy + ddy / edt) / 2;
        st.msp = Math.sqrt(st.mvx * st.mvx + st.mvy * st.mvy);
      } else {
        st.mvx = st.mvy = st.msp = 0;
      }
      st.mt = t;
      var rect = wrap.getBoundingClientRect();
      st.w  = rect.width  || 1;
      st.h  = rect.height || 1;
      st.cx = clientX;
      st.cy = clientY;
      st.px = Math.min(st.w, Math.max(0, clientX - rect.left));
      st.py = Math.min(st.h, Math.max(0, clientY - rect.top));
      st.tx = st.px / st.w * 2 - 1;
      st.ty = st.py / st.h * 2 - 1;
    }

    function enter(clientX, clientY) {
      feed(clientX, clientY);
      if (st.pres < 0.01) { st.rx = st.px; st.ry = st.py; }
      st.hover = true;
      fxWake(inst);
    }

    function move(clientX, clientY) {
      if (!st.hover) { enter(clientX, clientY); return; }
      feed(clientX, clientY);
      fxWake(inst);
    }

    function leave() {
      st.hover = false;
      fxWake(inst);
    }

    function step(now) {
      var dt = inst.lastT ? Math.min(100, Math.max(8, now - inst.lastT)) : 16;
      inst.lastT = now;
      st.frame++;

      /* pointer velocity from the events; counts as 0 once the pointer
         has been still for 60 ms, so the energy eases back to rest    */
      var fresh = st.hover && now - st.mt < 60;
      var sp  = fresh ? st.msp : 0;   /* px/ms */
      var vxT = fresh ? Math.max(-1, Math.min(1, st.mvx / 1.5)) : 0;
      var vyT = fresh ? Math.max(-1, Math.min(1, st.mvy / 1.5)) : 0;
      var eT  = Math.min(1, sp / 1.2);
      var pT  = st.hover ? 1 : 0;
      var xT  = st.hover ? st.tx : 0;
      var yT  = st.hover ? st.ty : 0;

      /* frame-rate independent lerp: distortEase is the per-frame factor at 60 fps */
      var k = ease >= 1 ? 1 : 1 - Math.pow(1 - ease, dt / 16.667);
      st.e    += (eT  - st.e)    * k;
      st.vx   += (vxT - st.vx)   * k;
      st.vy   += (vyT - st.vy)   * k;
      st.x    += (xT  - st.x)    * k;
      st.y    += (yT  - st.y)    * k;
      st.pres += (pT  - st.pres) * k;
      st.rx   += (st.px - st.rx) * k;
      st.ry   += (st.py - st.ry) * k;

      if (FX_COLOR === 'glitch' && st.hover && sp > 1.1 - c * 0.6 && now - st.lastBurst > 320) {
        st.lastBurst  = now;
        st.burstUntil = now + 140 + 180 * c;
      }
      var bursting = now < st.burstUntil;

      /* Keep looping while anything is still easing (a stationary
         cursor lets the speed energy decay back to 0 on its own)   */
      var busy = bursting || sp > 0 ||
        Math.abs(eT - st.e) > 0.002 || Math.abs(vxT - st.vx) > 0.002 || Math.abs(vyT - st.vy) > 0.002 ||
        Math.abs(xT - st.x) > 0.002 || Math.abs(yT - st.y) > 0.002 || Math.abs(pT - st.pres) > 0.002 ||
        Math.abs(st.px - st.rx) > 0.5 || Math.abs(st.py - st.ry) > 0.5;

      if (!busy) {   /* settle exactly on the targets, render, sleep */
        st.e = eT; st.vx = vxT; st.vy = vyT; st.x = xT; st.y = yT; st.pres = pT;
        st.rx = st.px; st.ry = st.py;
      }
      render(bursting);
      return busy;
    }

    function render(bursting) {
      var live = persistent || bursting || st.pres > 0.001 || st.e > 0.001;

      if (hasFilter) setS('filter', stage, 'filter', live ? 'url(#' + fid + ')' : '');

      /* Shape — noise displacement (speed = amount, position = pattern) */
      if (noise) {
        var fq = CFG.distortScale, bf;
        if (FX_DISTORT === 'liquid') {
          bf = r5(fq * (1 + 0.25 * st.x)) + ' ' + r5(fq * (1 + 0.25 * st.y));
          setA('scale', N.disp, 'scale', String(r3(s * 120 * st.e)));
        } else {
          bf = r5(fq * 0.08) + ' ' + r5(fq * 2 * (1 + 0.3 * st.y));
          setA('scale', N.disp, 'scale', String(r3(s * 90 * st.e)));
        }
        setA('bf', N.turb, 'baseFrequency', bf);
      }

      /* Shape — CSS transform on the stage */
      if (xform) {
        var t = '';
        if (FX_DISTORT === 'bulge') {
          var sc = 1 + s * 0.35 * st.pres + s * 0.2 * st.e;
          setS('origin', stage, 'transform-origin',
            r3((st.x + 1) * 50) + '% ' + r3((st.y + 1) * 50) + '%');
          if (sc > 1.0005) t = 'scale(' + r3(sc) + ')';
        } else {
          var kx = st.vx * s * 25, ky = st.vy * s * 12;
          /* scale up just enough that the skewed corners stay covered */
          var comp = 1 + Math.abs(Math.tan(kx * Math.PI / 180)) + Math.abs(Math.tan(ky * Math.PI / 180));
          if (Math.abs(kx) > 0.01 || Math.abs(ky) > 0.01) {
            t = 'skew(' + r3(kx) + 'deg,' + r3(ky) + 'deg) scale(' + r3(comp) + ')';
          }
        }
        setS('transform', stage, 'transform', t);
      }

      /* Colour */
      if (FX_COLOR === 'hueShift') {
        setA('hue', N.hue, 'values', String(r3(st.x * 180 * c * st.pres)));
      }

      if (FX_COLOR === 'rgbSplit') {
        var ox = c * (st.x * 10 + st.vx * 24) * st.pres;
        var oy = c * (st.y * 6  + st.vy * 14) * st.pres;
        setA('rdx', N.offR, 'dx', String(r3(ox)));  setA('rdy', N.offR, 'dy', String(r3(oy)));
        setA('bdx', N.offB, 'dx', String(r3(-ox))); setA('bdy', N.offB, 'dy', String(r3(-oy)));
      }

      if (FX_COLOR === 'glitch') {
        if (bursting) {
          if (st.frame % 2 === 0) {
            var tv = [];
            for (var i = 0; i < 9; i++) tv.push(Math.random() < 0.55 ? '0.5' : String(r3(Math.random())));
            setA('gtv',   N.gFunc, 'tableValues', tv.join(' '));
            setA('gseed', N.gTurb, 'seed', String(1 + Math.floor(Math.random() * 999)));
            setA('gs',    N.gDisp, 'scale', String(r3(c * 70)));
            var j = (Math.random() - 0.5) * c * 30;
            setA('rdx', N.offR, 'dx', String(r3(j)));
            setA('bdx', N.offB, 'dx', String(r3(-j)));
          }
        } else {
          setA('gs',  N.gDisp, 'scale', '0');
          setA('rdx', N.offR, 'dx', '0');
          setA('bdx', N.offB, 'dx', '0');
        }
      }

      if (reveal) {
        /* reveal layer is 110% and offset -5%, so shift the centre by 5% */
        var R  = r3(CFG.revealRadius * st.pres);
        var mx = r3(st.rx + st.w * 0.05), my = r3(st.ry + st.h * 0.05);
        var m  = R < 0.5 ? '' :
          'radial-gradient(circle at ' + mx + 'px ' + my + 'px,#000 0,#000 ' + r3(R * 0.7) + 'px,transparent ' + R + 'px)';
        setS('mask', reveal, 'mask-image', m);
        setS('wmask', reveal, '-webkit-mask-image', m);
      }
    }

    /* ── Input — mouse, plus passive touch (never blocks scroll) ── */
    wrap.addEventListener('mouseenter', function (e) { enter(e.clientX, e.clientY); });
    wrap.addEventListener('mousemove',  function (e) { move(e.clientX, e.clientY); });
    wrap.addEventListener('mouseleave', leave);

    var passive = { passive: true };
    wrap.addEventListener('touchstart', function (e) {
      var t = e.touches && e.touches[0];
      if (t) enter(t.clientX, t.clientY);
    }, passive);
    wrap.addEventListener('touchmove', function (e) {
      var t = e.touches && e.touches[0];
      if (t) move(t.clientX, t.clientY);
    }, passive);
    wrap.addEventListener('touchend',    leave, passive);
    wrap.addEventListener('touchcancel', leave, passive);

    _fxAll.push(inst);
    fxObserve(inst);
    render(false);   /* paint the resting state (duotone is visible at rest) */
    return inst;
  }

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

    /* v1.1.0 FX: layers live in a stage so one filter/transform covers
       them all. Without FX the layers go straight into the wrapper,
       exactly as in v1.0.0.                                          */
    var layerHost = wrap;
    var stage     = null;
    if (FX_ON) {
      stage = document.createElement('div');
      stage.className = 'anavo-image-tilt-stage';
      wrap.appendChild(stage);
      layerHost = stage;
    }

    /* Back layer — static, never moves */
    var back = document.createElement('div');
    back.className = 'anavo-tilt-back';
    back.style.setProperty('background-image', 'url(' + src + ')', 'important');
    layerHost.appendChild(back);

    /* Front layers — one per CFG.layers, each moves progressively more */
    var fronts = [];
    for (var i = 0; i < CFG.layers; i++) {
      var front = document.createElement('div');
      front.className = 'anavo-tilt-front';
      front.style.setProperty('background-image', 'url(' + src + ')', 'important');
      front.style.setProperty('opacity', String(CFG.opacity), 'important');
      layerHost.appendChild(front);
      fronts.push(front);
    }

    if (FX_ON) {
      try { createFx(wrap, stage, src); }
      catch (e) { console.warn('[Anavo ' + PLUGIN_ID + '] fx error:', e); }
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
