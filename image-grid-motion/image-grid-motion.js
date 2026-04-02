/**
 * ============================================================
 * IMAGE GRID MOTION PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Full-viewport background grid of images that move
 *   independently when the mouse moves. Each image shifts
 *   by a random amplitude (lerped for smooth follow). An
 *   optional center title/subtitle sits on top.
 *   Inspired by Codrops / ImageGridMotionEffect (Demo 1).
 *   Zero external dependencies — pure vanilla JS.
 *
 * USAGE:
 *   1. Add a Code Block anywhere on your Squarespace page:
 *        <div data-anavo-image-grid></div>
 *
 *   2. Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/image-grid-motion/image-grid-motion.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &images=https%3A%2F%2Fimg1.jpg|https%3A%2F%2Fimg2.jpg|...
 *          &bgColor=%230c0c0c
 *          &title=Your+Title
 *          &subtitle=Your+Subtitle
 *        "></script>
 *
 * PARAMETERS (URL query string — encode # as %23, colors use %23):
 *   domain          your site domain (license check)
 *   supabaseUrl     Supabase project URL
 *   supabaseKey     Supabase anon key
 *   images          pipe-separated image URLs (up to 10)
 *   bgColor         background color          default: #0c0c0c
 *   amplitudeMin    min move range px         default: 15
 *   amplitudeMax    max move range px         default: 60
 *   lerpSpeed       cursor smoothness 0–1     default: 0.07
 *   itemOpacity     final grid item opacity   default: 0.4
 *   revealDuration  intro animation ms        default: 1800
 *   title           center title text         (optional)
 *   subtitle        center subtitle text      (optional)
 *   titleColor      title text color          default: #ffffff
 *   titleSize       title font size           default: 10vw
 *   subtitleColor   subtitle color            default: rgba(255,255,255,0.5)
 *   subtitleSize    subtitle font size        default: 4.5vw
 *   fontFamily      font for title            default: inherit
 *   target          CSS selector              default: [data-anavo-image-grid]
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ImageGridMotion';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="image-grid-motion"]');
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
    domain:          p('domain',         window.location.hostname),
    supabaseUrl:     p('supabaseUrl',    ''),
    supabaseKey:     p('supabaseKey',    ''),
    images:          p('images',         '').split('|').map(function(s){ return s.trim(); }).filter(Boolean),
    bgColor:         p('bgColor',        '#0c0c0c'),
    amplitudeMin:    parseInt(p('amplitudeMin',  '15'),  10),
    amplitudeMax:    parseInt(p('amplitudeMax',  '60'),  10),
    lerpSpeed:       parseFloat(p('lerpSpeed',   '0.07')),
    itemOpacity:     parseFloat(p('itemOpacity', '0.4')),
    revealDuration:  parseInt(p('revealDuration','1800'), 10),
    title:           p('title',          ''),
    subtitle:        p('subtitle',       ''),
    titleColor:      p('titleColor',     '#ffffff'),
    titleSize:       p('titleSize',      '10vw'),
    subtitleColor:   p('subtitleColor',  'rgba(255,255,255,0.45)'),
    subtitleSize:    p('subtitleSize',   '4.5vw'),
    fontFamily:      p('fontFamily',     'inherit'),
    target:          p('target',         '[data-anavo-image-grid]')
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. LICENSE CHECK — Supabase REST (non-blocking)
  // ─────────────────────────────────────────────────────────────────

  var _BYPASS = ['anavo.tech', 'www.anavo.tech', 'localhost', '127.0.0.1'];

  function checkLicense() {
    try {
      var host = window.location.hostname.toLowerCase().replace(/^www\./, '');
      if (_BYPASS.indexOf(host) > -1) return;
      if (!CFG.supabaseUrl || !CFG.supabaseKey) {
        console.warn('[Anavo ' + PLUGIN_ID + '] supabaseUrl/supabaseKey not set.');
        return;
      }
      var endpoint = CFG.supabaseUrl + '/rest/v1/purchased_plugins'
        + '?plugin_id=eq.' + encodeURIComponent(PLUGIN_ID)
        + '&domain=eq.'    + encodeURIComponent(host)
        + '&select=id&limit=1';
      fetch(endpoint, {
        method: 'GET', cache: 'no-cache',
        headers: {
          'apikey':        CFG.supabaseKey,
          'Authorization': 'Bearer ' + CFG.supabaseKey,
          'Accept':        'application/json'
        }
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('[Anavo ' + PLUGIN_ID + '] Unlicensed: ' + host);
          _licenseNotice();
        }
      })
      .catch(function () {});
    } catch (e) {}
  }

  function _licenseNotice() {
    if (document.getElementById('anavo-igm-notice')) return;
    var el = document.createElement('div');
    el.id = 'anavo-igm-notice';
    el.setAttribute('style',
      'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.9);color:#fff;' +
      'padding:12px 18px;border-radius:6px;font-family:system-ui,sans-serif;' +
      'font-size:12px;z-index:999999;pointer-events:auto;line-height:1.6'
    );
    el.innerHTML = '<strong style="display:block;margin-bottom:4px">⚠️ Unlicensed Plugin</strong>' +
      '<a href="https://anavo.tech/plugins" target="_blank" rel="noopener" ' +
      'style="color:#ffd700;text-decoration:none">Get ImageGridMotion license →</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  /*
   * Grid coordinate system: 50 columns × 50 rows (each unit = 2% of container).
   * Items are placed at sparse positions matching the original Codrops layout.
   * Container is 110% × 110% with -5% offset — allows items to move without
   * revealing the background edge.
   */

  function injectStyles() {
    var ex = document.getElementById('anavo-igm-styles');
    if (ex) ex.remove();

    var css =
      /* ── Wrapper ─────────────────────────────────────────────── */
      '.anavo-igm-wrap{' +
        'position:relative!important;' +
        'width:100%!important;' +
        'min-height:100vh!important;' +
        'overflow:hidden!important;' +
        'background-color:' + CFG.bgColor + '!important;' +
        'cursor:none!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      /* ── Grid ─────────────────────────────────────────────────── */
      /* Overshoots by 10% on each side — movement stays in-bounds   */
      '.anavo-igm-grid{' +
        'pointer-events:none!important;' +
        'position:absolute!important;' +
        'width:110%!important;' +
        'height:110%!important;' +
        'top:-5%!important;' +
        'left:-5%!important;' +
        'display:grid!important;' +
        'grid-template-columns:repeat(50,2%)!important;' +
        'grid-template-rows:repeat(50,2%)!important;' +
      '}' +

      /* ── Grid items ────────────────────────────────────────────── */
      '.anavo-igm-item{' +
        'position:relative!important;' +
        'overflow:hidden!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'will-change:transform!important;' +
        'opacity:0!important;' +                        /* start invisible */
        'transform:scale(0.7)!important;' +             /* start scaled down */
        'transition:opacity ' + CFG.revealDuration + 'ms cubic-bezier(0.16,1,0.3,1),' +
                   'transform ' + CFG.revealDuration + 'ms cubic-bezier(0.16,1,0.3,1)!important;' +
      '}' +

      /* Inner image — slightly larger for contained overflow during motion */
      '.anavo-igm-img{' +
        'position:absolute!important;' +
        'width:calc(100% + 60px)!important;' +
        'height:calc(100% + 60px)!important;' +
        'background-size:cover!important;' +
        'background-position:50% 50%!important;' +
        'background-repeat:no-repeat!important;' +
        'flex:none!important;' +
      '}' +

      /* ── Grid positions (sparse 50×50 layout) ────────────────── */
      /* Row-start / Col-start / Row-end / Col-end                   */
      '.anavo-igm-pos-1 {grid-area:10 / 1  / 26 / 7 !important;}' +
      '.anavo-igm-pos-2 {grid-area:1  / 18 / 9  / 27!important;}' +
      '.anavo-igm-pos-3 {grid-area:1  / 36 / 14 / 42!important;}' +
      '.anavo-igm-pos-4 {grid-area:13 / 11 / 32 / 18!important;}' +
      '.anavo-igm-pos-5 {grid-area:17 / 32 / 32 / 38!important;}' +
      '.anavo-igm-pos-6 {grid-area:20 / 46 / 28 / 51!important;}' +
      '.anavo-igm-pos-7 {grid-area:43 / 1  / 51 / 10!important;}' +
      '.anavo-igm-pos-8 {grid-area:38 / 14 / 46 / 22!important;}' +
      '.anavo-igm-pos-9 {grid-area:40 / 26 / 51 / 32!important;}' +
      '.anavo-igm-pos-10{grid-area:37 / 39 / 48 / 47!important;}' +

      /* ── Center content ─────────────────────────────────────────── */
      '.anavo-igm-content{' +
        'position:absolute!important;' +
        'inset:0!important;' +
        'display:flex!important;' +
        'flex-direction:column!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'z-index:10!important;' +
        'pointer-events:none!important;' +
        'user-select:none!important;' +
        'text-align:center!important;' +
      '}' +
      '.anavo-igm-title{' +
        'font-family:' + CFG.fontFamily + '!important;' +
        'font-size:' + CFG.titleSize + '!important;' +
        'font-weight:400!important;' +
        'color:' + CFG.titleColor + '!important;' +
        'margin:0!important;' +
        'line-height:1!important;' +
        'letter-spacing:-0.02em!important;' +
      '}' +
      '.anavo-igm-subtitle{' +
        'font-family:' + CFG.fontFamily + '!important;' +
        'font-size:' + CFG.subtitleSize + '!important;' +
        'font-weight:300!important;' +
        'color:' + CFG.subtitleColor + '!important;' +
        'margin:0.5em 0 0 0!important;' +
        'letter-spacing:0.08em!important;' +
        'text-transform:uppercase!important;' +
      '}' +

      /* ── Custom cursor ──────────────────────────────────────────── */
      '.anavo-igm-cursor{' +
        'display:none!important;' +
        'position:fixed!important;' +
        'top:0!important;left:0!important;' +
        'pointer-events:none!important;' +
        'z-index:9999!important;' +
        'transform:translate(-50%,-50%)!important;' +
        'will-change:left,top!important;' +
      '}' +
      /* Only show on fine-pointer (desktop) devices */
      '@media(any-pointer:fine){' +
        '.anavo-igm-cursor{display:block!important;}' +
        '.anavo-igm-wrap{cursor:none!important;}' +
      '}' +
      '@media(any-pointer:coarse){' +
        '.anavo-igm-wrap{cursor:auto!important;}' +
      '}' +

      /* ── Mobile: reduce amplitudes via CSS hint ─────────────────── */
      '@media(max-width:800px){' +
        '.anavo-igm-title{font-size:min(' + CFG.titleSize + ',14vw)!important;}' +
        '.anavo-igm-subtitle{font-size:min(' + CFG.subtitleSize + ',6vw)!important;}' +
      '}' +
      '@media(max-width:480px){' +
        '.anavo-igm-title{font-size:15vw!important;}' +
        '.anavo-igm-subtitle{font-size:7vw!important;}' +
      '}';

    var tag = document.createElement('style');
    tag.id = 'anavo-igm-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. HELPERS — math (no GSAP needed)
  // ─────────────────────────────────────────────────────────────────

  /** Map x from [a,b] → [c,d] */
  function mapRange(x, a, b, c, d) {
    return (x - a) * (d - c) / (b - a) + c;
  }

  /** Random integer in [min, max] */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  /** Escape HTML entities */
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. DOM CONSTRUCTION
  // ─────────────────────────────────────────────────────────────────

  var _wrapEl   = null;
  var _itemEls  = [];

  function buildDOM(mountEl) {
    /* ── Outer wrapper ── */
    _wrapEl = document.createElement('div');
    _wrapEl.className = 'anavo-igm-wrap';

    /* ── Grid ── */
    var gridEl = document.createElement('div');
    gridEl.className = 'anavo-igm-grid';
    gridEl.setAttribute('aria-hidden', 'true');

    var imgs  = CFG.images;
    var count = Math.min(imgs.length, 10);

    for (var i = 0; i < count; i++) {
      var item = document.createElement('div');
      item.className = 'anavo-igm-item anavo-igm-pos-' + (i + 1);
      item.dataset.idx = i;

      var imgDiv = document.createElement('div');
      imgDiv.className = 'anavo-igm-img';
      var url = safeUrl(imgs[i]);
      if (url) imgDiv.style.backgroundImage = 'url("' + url + '")';

      item.appendChild(imgDiv);
      gridEl.appendChild(item);
      _itemEls.push(item);
    }

    _wrapEl.appendChild(gridEl);

    /* ── Center content ── */
    if (CFG.title || CFG.subtitle) {
      var contentEl = document.createElement('div');
      contentEl.className = 'anavo-igm-content';
      if (CFG.title) {
        var titleEl = document.createElement('h2');
        titleEl.className = 'anavo-igm-title';
        titleEl.textContent = CFG.title;
        contentEl.appendChild(titleEl);
      }
      if (CFG.subtitle) {
        var subEl = document.createElement('p');
        subEl.className = 'anavo-igm-subtitle';
        subEl.textContent = CFG.subtitle;
        contentEl.appendChild(subEl);
      }
      _wrapEl.appendChild(contentEl);
    }

    /* ── Custom cursor (SVG circle) ── */
    var cursorEl = document.createElement('div');
    cursorEl.className = 'anavo-igm-cursor';
    cursorEl.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>' +
      '</svg>';
    document.body.appendChild(cursorEl);
    _cursorEl = cursorEl;

    /* ── Mount ── */
    mountEl.innerHTML = '';
    mountEl.style.cssText = 'margin:0!important;padding:0!important;max-width:none!important;width:100%!important;';
    mountEl.appendChild(_wrapEl);
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. REVEAL ANIMATION — stagger from center
  // ─────────────────────────────────────────────────────────────────

  function revealItems() {
    if (!_itemEls.length) return;

    /* Sort items by distance from viewport center for centripetal stagger */
    var cx = window.innerWidth  / 2;
    var cy = window.innerHeight / 2;
    var sorted = _itemEls.slice().sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var da = Math.hypot(ra.left + ra.width/2  - cx, ra.top + ra.height/2 - cy);
      var db = Math.hypot(rb.left + rb.width/2  - cx, rb.top + rb.height/2 - cy);
      return da - db; // closest to center first
    });

    var staggerMs = Math.round(CFG.revealDuration * 0.6 / Math.max(sorted.length - 1, 1));

    sorted.forEach(function (item, i) {
      setTimeout(function () {
        item.style.transform = 'scale(1) translate(0px,0px)';
        item.style.opacity   = String(CFG.itemOpacity);
      }, i * staggerMs);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. MOTION LOOP — per-item independent lerp
  // ─────────────────────────────────────────────────────────────────

  var _mouseX  = 0;
  var _mouseY  = 0;
  var _winW    = window.innerWidth;
  var _winH    = window.innerHeight;
  var _cursorEl = null;
  var _cursorLX = 0, _cursorLY = 0;

  /* Each item carries its own lerp state + random amplitude */
  var _itemStates = [];

  function initItemStates() {
    _itemEls.forEach(function () {
      _itemStates.push({
        tx: 0, ty: 0,
        xAmp: randInt(CFG.amplitudeMin, CFG.amplitudeMax),
        yAmp: randInt(CFG.amplitudeMin, CFG.amplitudeMax)
      });
    });
  }

  function startMotionLoop() {
    function tick() {
      var ls = CFG.lerpSpeed;

      /* Move each grid item */
      for (var i = 0; i < _itemEls.length; i++) {
        var s = _itemStates[i];
        var targetTx = mapRange(_mouseX, 0, _winW, -s.xAmp, s.xAmp);
        var targetTy = mapRange(_mouseY, 0, _winH, -s.yAmp, s.yAmp);

        s.tx += (targetTx - s.tx) * ls;
        s.ty += (targetTy - s.ty) * ls;

        /* Combine with reveal scale (use CSS var to avoid clobbering) */
        _itemEls[i].style.transform =
          'scale(1) translate(' + s.tx.toFixed(2) + 'px,' + s.ty.toFixed(2) + 'px)';
      }

      /* Move cursor */
      if (_cursorEl) {
        _cursorLX += (_mouseX - _cursorLX) * 0.15;
        _cursorLY += (_mouseY - _cursorLY) * 0.15;
        _cursorEl.style.left = _cursorLX.toFixed(2) + 'px';
        _cursorEl.style.top  = _cursorLY.toFixed(2) + 'px';
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. EVENT BINDING
  // ─────────────────────────────────────────────────────────────────

  function bindEvents() {
    window.addEventListener('mousemove', function (e) {
      _mouseX = e.clientX;
      _mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('resize', function () {
      _winW = window.innerWidth;
      _winH = window.innerHeight;
    }, { passive: true });

    /* Touch: translate touch X/Y to motion (no cursor on touch) */
    _wrapEl.addEventListener('touchmove', function (e) {
      if (!e.touches.length) return;
      _mouseX = e.touches[0].clientX;
      _mouseY = e.touches[0].clientY;
    }, { passive: true });
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. IMAGE PRELOAD (start reveal only when images are ready)
  // ─────────────────────────────────────────────────────────────────

  function preloadImages(urls, callback) {
    if (!urls.length) { callback(); return; }
    var loaded = 0;
    var total  = urls.length;
    var done   = function () { if (++loaded >= total) callback(); };
    urls.forEach(function (url) {
      var img = new Image();
      img.onload  = done;
      img.onerror = done; // don't block on 404
      img.src = url;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. POLL + INIT
  // ─────────────────────────────────────────────────────────────────

  function _poll(attempts) {
    var targets = document.querySelectorAll(CFG.target);
    if (targets.length) { _init(targets[0]); return; }
    if (attempts < 50) setTimeout(function () { _poll(attempts + 1); }, 100);
  }

  function _init(mountEl) {
    try {
      injectStyles();
      buildDOM(mountEl);
      bindEvents();
      initItemStates();

      /* Seed mouse to center so items start centered */
      _mouseX = _cursorLX = window.innerWidth  / 2;
      _mouseY = _cursorLY = window.innerHeight / 2;

      /* Wait for images, then reveal + start motion */
      preloadImages(CFG.images.slice(0, 10).map(safeUrl).filter(Boolean), function () {
        setTimeout(function () { revealItems(); }, 100);
        startMotionLoop();
      });

      checkLicense();
    } catch (e) {
      console.error('[Anavo ' + PLUGIN_ID + '] Init error:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 11. GLOBAL REGISTRATION
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  window.AnavoPluginState.plugins[PLUGIN_ID] = { version: VERSION, config: CFG };

  // ─────────────────────────────────────────────────────────────────
  // 12. BOOT
  // ─────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { _poll(0); });
  } else {
    _poll(0);
  }

})();
