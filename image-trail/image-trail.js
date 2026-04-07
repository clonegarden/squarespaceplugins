/**
 * ============================================================
 * IMAGE TRAIL PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Cursor-following image trail. A set of stacked image copies
 *   follow the cursor with independent lerp speeds, creating a
 *   staggered depth trail. Optional 3D perspective rotation via
 *   rotateX/rotateY. The front (fastest) image cycles to the next
 *   URL whenever cumulative cursor travel exceeds cycleDistance px.
 *   Inspired by Codrops Sketch 009. Zero external dependencies.
 *
 * USAGE:
 *   1. Add a Code Block anywhere on your Squarespace page:
 *        <div data-anavo-image-trail></div>
 *
 *   2. Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/image-trail/image-trail.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &images=https%3A%2F%2Fimg1.jpg|https%3A%2F%2Fimg2.jpg|https%3A%2F%2Fimg3.jpg
 *          &trailCount=8
 *          &perspective=100
 *        "></script>
 *
 * PARAMETERS (URL query string — encode # as %23, | as %7C):
 *   domain          hostname for license check           default: location.hostname
 *   supabaseUrl     Supabase project URL
 *   supabaseKey     Supabase anon key
 *   images          pipe-separated image URLs (1–10)     REQUIRED
 *   imageWidth      CSS width of each trail image        default: 280px
 *   imageAspect     CSS aspect-ratio value               default: 2/3
 *   trailCount      stacked copies (1–12)                default: 8
 *   perspective     perspective px; 0 = disabled         default: 100
 *   xRange          translateX px max range              default: 150
 *   yRange          translateY px max range              default: 90
 *   rxRange         rotateX deg range (3D only)          default: 3
 *   ryRange         rotateY deg range (3D only)          default: 7
 *   lerpMin         lerp speed for slowest copy          default: 0.05
 *   lerpMax         lerp speed for fastest copy          default: 0.25
 *   opacityFade     stagger opacity back→front           default: true
 *   cycleDistance   px of cursor travel to cycle image   default: 120
 *   zIndex          overlay z-index                      default: 9000
 *   target          CSS selector for mount point         default: [data-anavo-image-trail]
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ImageTrail';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="image-trail"]');
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

  function pBool(key, fallback) {
    var v = params.get(key);
    if (v === null || v === '') return fallback;
    return v !== 'false';
  }

  var CFG = {
    domain:         p('domain',          window.location.hostname),
    supabaseUrl:    p('supabaseUrl',     ''),
    supabaseKey:    p('supabaseKey',     ''),
    images:         p('images', '').split('|').map(function (s) { return s.trim(); }).filter(Boolean),
    imageWidth:     p('imageWidth',      '280px'),
    imageAspect:    p('imageAspect',     '2/3'),
    trailCount:     Math.min(12, Math.max(1, parseInt(p('trailCount',  '8'),   10))),
    perspective:    parseInt(p('perspective', '100'), 10),
    xRange:         parseFloat(p('xRange',    '150')),
    yRange:         parseFloat(p('yRange',    '90')),
    rxRange:        parseFloat(p('rxRange',   '3')),
    ryRange:        parseFloat(p('ryRange',   '7')),
    lerpMin:        parseFloat(p('lerpMin',   '0.05')),
    lerpMax:        parseFloat(p('lerpMax',   '0.25')),
    opacityFade:    pBool('opacityFade', true),
    cycleDistance:  parseFloat(p('cycleDistance', '120')),
    zIndex:         parseInt(p('zIndex', '9000'), 10),
    target:         p('target', '[data-anavo-image-trail]')
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. MOBILE GUARD — skip on narrow viewports (touch/mobile)
  // ─────────────────────────────────────────────────────────────────

  if (window.innerWidth <= 800) return;

  // ─────────────────────────────────────────────────────────────────
  // 3. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  if (window.AnavoPluginState.plugins[PLUGIN_ID]) return;
  window.AnavoPluginState.plugins[PLUGIN_ID] = { version: VERSION, config: CFG };

  // ─────────────────────────────────────────────────────────────────
  // 4. LICENSE CHECK — Supabase REST (non-blocking)
  // ─────────────────────────────────────────────────────────────────

  var BYPASS_DOMAINS = ['anavo.tech', 'www.anavo.tech', 'pluginstore.anavo.tech', 'clonegarden.github.io', 'localhost', '127.0.0.1'];

  function checkLicense() {
    try {
      var host = window.location.hostname.toLowerCase().replace(/^www\./, '');
      if (BYPASS_DOMAINS.indexOf(host) > -1) return;
      if (!CFG.supabaseUrl || !CFG.supabaseKey) {
        console.warn('[Anavo ' + PLUGIN_ID + '] supabaseUrl/supabaseKey not configured.');
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
          console.warn('[Anavo ' + PLUGIN_ID + '] Unlicensed domain: ' + host);
          _showLicenseNotice();
        }
      })
      .catch(function () {});
    } catch (e) {}
  }

  function _showLicenseNotice() {
    if (document.getElementById('anavo-it-notice')) return;
    var el = document.createElement('div');
    el.id = 'anavo-it-notice';
    el.setAttribute('style',
      'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.88);color:#fff;' +
      'padding:12px 18px;border-radius:6px;font-family:system-ui,sans-serif;' +
      'font-size:12px;z-index:999999;pointer-events:auto;line-height:1.6'
    );
    el.innerHTML = '<strong style="display:block;margin-bottom:4px">Unlicensed Plugin</strong>' +
      '<a href="https://anavo.tech/plugins" target="_blank" rel="noopener" ' +
      'style="color:#ffd700;text-decoration:none">Get ImageTrail license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. MATH HELPERS
  // ─────────────────────────────────────────────────────────────────

  /** Linear interpolation */
  function lerp(a, b, n) {
    return (1 - n) * a + n * b;
  }

  /** Map x from [a,b] → [c,d] */
  function mapRange(x, a, b, c, d) {
    return (x - a) * (d - c) / (b - a) + c;
  }

  /** Clamp value to [min,max] */
  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  /** Sanitize http/https image URL */
  function safeUrl(u) {
    if (!u) return '';
    try {
      var parsed = new URL(u);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      return u.replace(/"/g, '%22').replace(/\)/g, '%29');
    } catch (e) { return ''; }
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById('anavo-it-styles');
    if (ex) ex.remove();

    var perspectiveStr = CFG.perspective > 0
      ? 'perspective(' + CFG.perspective + 'px) '
      : '';

    var css = [

      /* ── Full-viewport fixed container ── */
      '.anavo-it-container{',
        'position:fixed!important;',
        'top:0!important;',
        'left:0!important;',
        'width:100vw!important;',
        'height:100vh!important;',
        'pointer-events:none!important;',
        'z-index:' + CFG.zIndex + '!important;',
        'overflow:hidden!important;',
      '}',

      /* ── Wrap centered at cursor ── */
      '.anavo-it-wrap{',
        'position:absolute!important;',
        'width:' + CFG.imageWidth + '!important;',
        'aspect-ratio:' + CFG.imageAspect + '!important;',
        'top:50%!important;',
        'left:50%!important;',
        'transform:translate(-50%,-50%)!important;',
        'pointer-events:none!important;',
      '}',

      /* ── Individual trail images ── */
      '.anavo-it-img{',
        'position:absolute!important;',
        'top:0!important;',
        'left:0!important;',
        'width:100%!important;',
        'height:100%!important;',
        'object-fit:cover!important;',
        'will-change:transform,opacity!important;',
        'display:block!important;',
        'border:none!important;',
        'padding:0!important;',
        'margin:0!important;',
        'transform-style:preserve-3d!important;',
        'backface-visibility:hidden!important;',
      '}'

    ].join('');

    var tag = document.createElement('style');
    tag.id = 'anavo-it-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. DOM CONSTRUCTION
  // ─────────────────────────────────────────────────────────────────

  /*
   * DOM:
   *  .anavo-it-container (fixed, full viewport, pointer-events:none)
   *    .anavo-it-wrap    (absolute, sized to image, centered at 50%/50%)
   *      img.anavo-it-img.anavo-it-img--0   ← index 0 = slowest / least opaque
   *      img.anavo-it-img.anavo-it-img--1
   *      ...
   *      img.anavo-it-img.anavo-it-img--N   ← index N-1 = fastest / fully opaque
   *
   * The wrap does NOT move. Each img gets its own transform via rAF.
   */

  var _containerEl = null;
  var _imgEls      = [];   // ordered [0=slowest ... N-1=fastest]

  function buildDOM() {
    _containerEl = document.createElement('div');
    _containerEl.className = 'anavo-it-container';
    _containerEl.setAttribute('aria-hidden', 'true');

    var wrapEl = document.createElement('div');
    wrapEl.className = 'anavo-it-wrap';

    var imgs   = CFG.images;
    var imgLen = Math.min(10, imgs.length);
    if (imgLen === 0) {
      console.warn('[Anavo ' + PLUGIN_ID + '] No images provided.');
      return false;
    }

    for (var i = 0; i < CFG.trailCount; i++) {
      var imgEl = document.createElement('img');
      imgEl.className = 'anavo-it-img anavo-it-img--' + i;
      imgEl.setAttribute('draggable', 'false');
      imgEl.setAttribute('aria-hidden', 'true');

      /* Index 0 = back (slowest), index trailCount-1 = front (fastest)
         For single-image mode all copies use the same URL.
         For multi-image mode only the FRONT copy cycles; others always show images[0]. */
      var srcIdx = (imgLen > 1 && i === CFG.trailCount - 1) ? 0 : 0;
      var url = safeUrl(imgs[srcIdx]);
      if (url) imgEl.src = url;

      /* Opacity: index 0 is least opaque, last is fully opaque */
      if (CFG.opacityFade) {
        imgEl.style.cssText = 'opacity:' + (((i + 1) / CFG.trailCount).toFixed(4)) + '!important;';
      }

      wrapEl.appendChild(imgEl);
      _imgEls.push(imgEl);
    }

    _containerEl.appendChild(wrapEl);
    document.body.appendChild(_containerEl);
    return true;
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. TRAIL STATE + rAF LOOP
  // ─────────────────────────────────────────────────────────────────

  var _cursor    = { x: 0, y: 0 };
  var _winW      = window.innerWidth;
  var _winH      = window.innerHeight;
  var _rafId     = null;
  var _rafActive = false;

  /* Per-image interpolated state */
  var _states = [];  // [{ x, y, rx, ry }]

  /* Image cycling state */
  var _imgIndex       = 0;   // current front image index into CFG.images
  var _travelAccum    = 0;   // accumulated cursor distance since last cycle
  var _lastCursorX    = -1;
  var _lastCursorY    = -1;

  function initStates() {
    /* Seed all states to center of viewport (0,0 in lerp-space) */
    for (var i = 0; i < CFG.trailCount; i++) {
      _states.push({ x: 0, y: 0, rx: 0, ry: 0 });
    }
  }

  /** Compute lerp amount for trail element at index i (0=slowest, N-1=fastest) */
  function lerpAmt(i) {
    if (CFG.trailCount === 1) return CFG.lerpMax;
    return CFG.lerpMin + (CFG.lerpMax - CFG.lerpMin) * (i / (CFG.trailCount - 1));
  }

  function tick() {
    _rafId = requestAnimationFrame(tick);

    var cx   = _cursor.x;
    var cy   = _cursor.y;
    var use3d = CFG.perspective > 0;

    /* Target transform values mapped from cursor position */
    var targetX  = mapRange(cx, 0, _winW, -CFG.xRange,  CFG.xRange);
    var targetY  = mapRange(cy, 0, _winH, -CFG.yRange,  CFG.yRange);
    var targetRX = use3d ? mapRange(cy, 0, _winH, -CFG.rxRange, CFG.rxRange) : 0;
    var targetRY = use3d ? mapRange(cx, 0, _winW, -CFG.ryRange, CFG.ryRange) : 0;

    for (var i = 0; i < CFG.trailCount; i++) {
      var s   = _states[i];
      var amt = lerpAmt(i);

      s.x  = lerp(s.x,  targetX,  amt);
      s.y  = lerp(s.y,  targetY,  amt);

      if (use3d) {
        s.rx = lerp(s.rx, targetRX, amt);
        s.ry = lerp(s.ry, targetRY, amt);
      }

      var tx = s.x.toFixed(3);
      var ty = s.y.toFixed(3);

      var transform = 'translateX(' + tx + 'px) translateY(' + ty + 'px)';
      if (use3d) {
        transform += ' rotateX(' + s.rx.toFixed(3) + 'deg) rotateY(' + s.ry.toFixed(3) + 'deg)';
      }

      _imgEls[i].style.transform = transform;
    }
  }

  function startLoop() {
    if (_rafActive) return;
    _rafActive = true;
    _rafId = requestAnimationFrame(tick);
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. IMAGE CYCLING (front element only, multi-image mode)
  // ─────────────────────────────────────────────────────────────────

  function updateCycle(ex, ey) {
    /* Only cycle when we have multiple images */
    var imgLen = Math.min(10, CFG.images.length);
    if (imgLen < 2) return;

    /* First move: seed last position */
    if (_lastCursorX < 0) {
      _lastCursorX = ex;
      _lastCursorY = ey;
      return;
    }

    var dx = ex - _lastCursorX;
    var dy = ey - _lastCursorY;
    _travelAccum += Math.sqrt(dx * dx + dy * dy);
    _lastCursorX = ex;
    _lastCursorY = ey;

    if (_travelAccum >= CFG.cycleDistance) {
      _travelAccum = 0;
      _imgIndex = (_imgIndex + 1) % imgLen;
      /* Update front image (last element = fastest) */
      var frontEl = _imgEls[CFG.trailCount - 1];
      var url = safeUrl(CFG.images[_imgIndex]);
      if (url) frontEl.src = url;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. EVENT BINDING
  // ─────────────────────────────────────────────────────────────────

  function bindEvents() {
    window.addEventListener('mousemove', function (e) {
      _cursor.x = e.clientX;
      _cursor.y = e.clientY;
      updateCycle(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('resize', function () {
      _winW = window.innerWidth;
      _winH = window.innerHeight;

      /* Re-check mobile breakpoint — stop trail if window shrinks */
      if (_winW <= 800 && _rafId) {
        cancelAnimationFrame(_rafId);
        _rafActive = false;
        if (_containerEl) _containerEl.style.display = 'none';
      } else if (_winW > 800 && !_rafActive) {
        if (_containerEl) _containerEl.style.display = '';
        startLoop();
      }
    }, { passive: true });
  }

  // ─────────────────────────────────────────────────────────────────
  // 11. POLL FOR TARGET + INIT
  // ─────────────────────────────────────────────────────────────────

  function _poll(attempts) {
    var targets = document.querySelectorAll(CFG.target);
    if (targets.length) { _init(); return; }
    if (attempts < 50) setTimeout(function () { _poll(attempts + 1); }, 100);
    else {
      /* Target never appeared — init anyway (trail is body-level, not inside target) */
      _init();
    }
  }

  function _init() {
    try {
      /* Seed cursor to viewport center so trail starts centered */
      _cursor.x   = window.innerWidth  / 2;
      _cursor.y   = window.innerHeight / 2;
      _lastCursorX = -1;
      _lastCursorY = -1;

      injectStyles();

      if (!buildDOM()) return; // no images = abort

      initStates();
      bindEvents();
      startLoop();
      checkLicense();
    } catch (e) {
      console.error('[Anavo ' + PLUGIN_ID + '] Init error:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 12. BOOT
  // ─────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { _poll(0); });
  } else {
    _poll(0);
  }

})();
