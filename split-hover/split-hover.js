/**
 * ============================================================
 * SPLIT HOVER PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   A full-viewport section with two nouns centered and split
 *   by a separator. A photo (30vw) follows the cursor with
 *   smooth lerp. When the cursor crosses to either half of the
 *   screen, the background slowly transitions to that side's
 *   color and the photo cross-fades to that side's image.
 *
 * USAGE:
 *   1. Add a Code Block to your page with:
 *        <div data-anavo-split-hover></div>
 *   2. Paste in Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/split-hover/split-hover.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &noun1=FASHION
 *          &noun2=EDITORIAL
 *          &image1=https%3A%2F%2Fyour-image-1.jpg
 *          &image2=https%3A%2F%2Fyour-image-2.jpg
 *          &color1=%231a1a1a
 *          &color2=%23f5f0e8
 *        "></script>
 *
 * PARAMETERS (URL query string, hex colors URL-encoded %23 for #):
 *   domain         — your site domain (for license check)
 *   supabaseUrl    — Supabase project URL (for license check)
 *   supabaseKey    — Supabase anon key (for license check)
 *   noun1          — left word          default: FASHION
 *   noun2          — right word         default: EDITORIAL
 *   image1         — photo URL, left side
 *   image2         — photo URL, right side
 *   color1         — bg color, left side  default: #1a1a1a
 *   color2         — bg color, right side default: #f5f0e8
 *   separator      — divider character   default: /
 *   cursorSize     — photo width         default: 30vw
 *   aspectRatio    — photo ratio (CSS)   default: 2/3
 *   fontSize       — noun font size      default: 7vw
 *   fontColor      — noun color          default: #ffffff
 *   fontFamily     — noun font           default: inherit
 *   fontWeight     — noun weight         default: 300
 *   letterSpacing  — noun spacing        default: 0.15em
 *   transitionMs   — color+image speed   default: 800
 *   lerpSpeed      — cursor smoothness 0–1 default: 0.08
 *   target         — CSS selector        default: [data-anavo-split-hover]
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'SplitHover';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="split-hover"]');
    return all[all.length - 1];
  })();

  var params;
  try { params = new URL(scriptEl.src).searchParams; }
  catch (e) { params = new URLSearchParams(); }

  /** Get param, decode, fallback if absent/empty */
  function p(key, fallback) {
    var v = params.get(key);
    if (v === null || v === '') return fallback;
    try { return decodeURIComponent(v); } catch (e) { return v; }
  }

  var CFG = {
    domain:        p('domain',        window.location.hostname),
    supabaseUrl:   p('supabaseUrl',   ''),
    supabaseKey:   p('supabaseKey',   ''),
    noun1:         p('noun1',         'FASHION'),
    noun2:         p('noun2',         'EDITORIAL'),
    image1:        p('image1',        ''),
    image2:        p('image2',        ''),
    color1:        p('color1',        '#1a1a1a'),
    color2:        p('color2',        '#f5f0e8'),
    separator:     p('separator',     '/'),
    cursorSize:    p('cursorSize',    '30vw'),
    aspectRatio:   p('aspectRatio',   '2/3'),
    fontSize:      p('fontSize',      '7vw'),
    fontColor:     p('fontColor',     '#ffffff'),
    fontFamily:    p('fontFamily',    'inherit'),
    fontWeight:    p('fontWeight',    '300'),
    letterSpacing: p('letterSpacing', '0.15em'),
    transitionMs:  parseInt(p('transitionMs', '800'), 10),
    lerpSpeed:     parseFloat(p('lerpSpeed',  '0.08')),
    target:        p('target',        '[data-anavo-split-hover]')
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
        console.warn('[Anavo ' + PLUGIN_ID + '] supabaseUrl/supabaseKey not set — license check skipped.');
        return;
      }

      // Query: SELECT id FROM purchased_plugins WHERE plugin_id = 'SplitHover' AND domain = 'host'
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
      .catch(function () {}); // never block UI on license failure
    } catch (e) {}
  }

  function _licenseNotice() {
    if (document.getElementById('anavo-sh-license-notice')) return;
    var el = document.createElement('div');
    el.id = 'anavo-sh-license-notice';
    el.setAttribute('style',
      'position:fixed;bottom:20px;right:20px;' +
      'background:rgba(0,0,0,0.9);color:#fff;' +
      'padding:12px 18px;border-radius:6px;' +
      'font-family:system-ui,sans-serif;font-size:12px;' +
      'z-index:999999;pointer-events:auto;line-height:1.6'
    );
    el.innerHTML =
      '<strong style="display:block;margin-bottom:4px">⚠️ Unlicensed Plugin</strong>' +
      '<a href="https://anavo.tech/plugins" target="_blank" rel="noopener" ' +
      'style="color:#ffd700;text-decoration:none">Get SplitHover license →</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById('anavo-split-hover-styles');
    if (ex) ex.remove();

    var t  = CFG.transitionMs + 'ms';
    var css =

      /* ── Wrapper (the section) ────────────────────────────────── */
      '.anavo-sh-wrap{' +
        'position:relative!important;' +
        'min-height:100vh!important;' +
        'width:100%!important;' +
        'overflow:hidden!important;' +
        'background-color:' + CFG.color1 + '!important;' +
        'transition:background-color ' + t + ' ease!important;' +
        'cursor:none!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'box-sizing:border-box!important;' +
      '}' +

      /* Right-side active state ─ toggled by JS */
      '.anavo-sh-wrap.anavo-sh-right{' +
        'background-color:' + CFG.color2 + '!important;' +
      '}' +

      /* ── Nouns row ────────────────────────────────────────────── */
      '.anavo-sh-nouns{' +
        'position:relative!important;' +
        'z-index:10!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'gap:0.4em!important;' +
        'pointer-events:none!important;' +
        'user-select:none!important;' +
      '}' +

      '.anavo-sh-noun{' +
        'font-size:' + CFG.fontSize + '!important;' +
        'font-weight:' + CFG.fontWeight + '!important;' +
        'font-family:' + CFG.fontFamily + '!important;' +
        'color:' + CFG.fontColor + '!important;' +
        'letter-spacing:' + CFG.letterSpacing + '!important;' +
        'text-transform:uppercase!important;' +
        'line-height:1!important;' +
        'white-space:nowrap!important;' +
      '}' +

      '.anavo-sh-sep{' +
        'font-size:' + CFG.fontSize + '!important;' +
        'font-weight:100!important;' +
        'font-family:' + CFG.fontFamily + '!important;' +
        'color:' + CFG.fontColor + '!important;' +
        'opacity:0.45!important;' +
        'line-height:1!important;' +
      '}' +

      /* ── Cursor-following photo ───────────────────────────────── */
      '.anavo-sh-cursor{' +
        'position:fixed!important;' +
        'top:0!important;' +
        'left:0!important;' +
        'width:' + CFG.cursorSize + '!important;' +
        'aspect-ratio:' + CFG.aspectRatio + '!important;' +
        'pointer-events:none!important;' +
        'z-index:9998!important;' +
        'transform:translate(-50%,-50%)!important;' +
        'will-change:left,top!important;' +
        'opacity:0!important;' +
        'transition:opacity 250ms ease!important;' +
        'overflow:hidden!important;' +
        'backface-visibility:hidden!important;' +
        '-webkit-backface-visibility:hidden!important;' +
      '}' +

      /* Visible state ─ toggled on mouseenter/leave */
      '.anavo-sh-cursor.anavo-sh-cursor-on{' +
        'opacity:1!important;' +
      '}' +

      /* Image layers inside cursor ─ cross-fade via opacity */
      '.anavo-sh-img{' +
        'position:absolute!important;' +
        'inset:0!important;' +
        'background-size:cover!important;' +
        'background-position:center center!important;' +
        'background-repeat:no-repeat!important;' +
        'transition:opacity ' + t + ' ease!important;' +
      '}' +

      /* ── Mobile ───────────────────────────────────────────────── */
      /* Cursor hidden; bg split still works via touchmove           */
      '@media(max-width:800px){' +
        '.anavo-sh-cursor{display:none!important;}' +
        '.anavo-sh-wrap{cursor:auto!important;}' +
      '}' +
      '@media(max-width:480px){' +
        '.anavo-sh-noun,.anavo-sh-sep{font-size:13vw!important;}' +
      '}';

    var tag = document.createElement('style');
    tag.id = 'anavo-split-hover-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. DOM CONSTRUCTION
  // ─────────────────────────────────────────────────────────────────

  /* Live references used by event handlers */
  var wrapEl   = null;
  var cursorEl = null;
  var img1El   = null;
  var img2El   = null;

  function buildDOM(mountEl) {
    /* ── Section wrapper ── */
    wrapEl = document.createElement('div');
    wrapEl.className = 'anavo-sh-wrap';
    wrapEl.setAttribute('role', 'img');
    wrapEl.setAttribute('aria-label',
      escHtml(CFG.noun1) + ' ' + escHtml(CFG.separator) + ' ' + escHtml(CFG.noun2)
    );

    /* ── Nouns ── */
    var nouns = document.createElement('div');
    nouns.className = 'anavo-sh-nouns';
    nouns.setAttribute('aria-hidden', 'true');
    nouns.innerHTML =
      '<span class="anavo-sh-noun">' + escHtml(CFG.noun1)      + '</span>' +
      '<span class="anavo-sh-sep">'  + escHtml(CFG.separator)  + '</span>' +
      '<span class="anavo-sh-noun">' + escHtml(CFG.noun2)      + '</span>';
    wrapEl.appendChild(nouns);

    /* ── Cursor photo (appended to body — position:fixed escapes any parent) ── */
    cursorEl = document.createElement('div');
    cursorEl.className = 'anavo-sh-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');

    img1El = document.createElement('div');
    img1El.className = 'anavo-sh-img';
    img1El.style.cssText = 'opacity:1;' + (CFG.image1 ? 'background-image:url("' + safeUrl(CFG.image1) + '")' : '');

    img2El = document.createElement('div');
    img2El.className = 'anavo-sh-img';
    img2El.style.cssText = 'opacity:0;' + (CFG.image2 ? 'background-image:url("' + safeUrl(CFG.image2) + '")' : '');

    cursorEl.appendChild(img1El);
    cursorEl.appendChild(img2El);
    document.body.appendChild(cursorEl);

    /* ── Mount into target ── */
    mountEl.innerHTML = '';
    mountEl.style.cssText = 'margin:0!important;padding:0!important;max-width:none!important;width:100%!important;';
    mountEl.appendChild(wrapEl);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. MOUSE / TOUCH TRACKING
  // ─────────────────────────────────────────────────────────────────

  var _mouseX     = 0;
  var _mouseY     = 0;
  var _lerpX      = 0;
  var _lerpY      = 0;
  var _inWrap     = false;
  var _state      = 0;   // 0 = left/noun1 · 1 = right/noun2
  var _rafId      = null;

  function bindEvents() {

    /* Mouse */
    document.addEventListener('mousemove', _onMove, { passive: true });
    wrapEl.addEventListener('mouseenter', _onEnter);
    wrapEl.addEventListener('mouseleave', _onLeave);

    /* Touch (background split only — cursor hidden on mobile) */
    wrapEl.addEventListener('touchmove', _onTouch, { passive: true });
    wrapEl.addEventListener('touchstart', _onTouch, { passive: true });
  }

  function _onMove(e) {
    _mouseX = e.clientX;
    _mouseY = e.clientY;
    if (_inWrap) _updateState(e.clientX);
  }

  function _onTouch(e) {
    if (!e.touches.length) return;
    _updateState(e.touches[0].clientX);
  }

  function _onEnter() {
    _inWrap = true;
    cursorEl.classList.add('anavo-sh-cursor-on');
    _kickRaf();
  }

  function _onLeave() {
    _inWrap = false;
    cursorEl.classList.remove('anavo-sh-cursor-on');
  }

  function _updateState(clientX) {
    var rect = wrapEl.getBoundingClientRect();
    var mid  = rect.left + rect.width * 0.5;
    var next = clientX >= mid ? 1 : 0;
    if (next !== _state) {
      _state = next;
      _applyState();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. STATE APPLICATION
  // ─────────────────────────────────────────────────────────────────

  function _applyState() {
    if (_state === 1) {
      /* Right → noun2 */
      wrapEl.classList.add('anavo-sh-right');
      img1El.style.opacity = '0';
      img2El.style.opacity = '1';
    } else {
      /* Left → noun1 */
      wrapEl.classList.remove('anavo-sh-right');
      img1El.style.opacity = '1';
      img2El.style.opacity = '0';
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. RAF — LERP CURSOR FOLLOW
  // ─────────────────────────────────────────────────────────────────

  function _kickRaf() {
    if (_rafId) return;
    _rafId = requestAnimationFrame(_tick);
  }

  function _tick() {
    var ls = CFG.lerpSpeed;
    _lerpX += (_mouseX - _lerpX) * ls;
    _lerpY += (_mouseY - _lerpY) * ls;

    /* Drive position via left/top (transform handles centering via CSS) */
    cursorEl.style.left = _lerpX.toFixed(2) + 'px';
    cursorEl.style.top  = _lerpY.toFixed(2) + 'px';

    _rafId = requestAnimationFrame(_tick);
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. HELPERS
  // ─────────────────────────────────────────────────────────────────

  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Allow only http/https image URLs to prevent CSS injection */
  function safeUrl(u) {
    if (!u) return '';
    try {
      var parsed = new URL(u);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
      return u.replace(/"/g, '%22').replace(/\)/g, '%29');
    } catch (e) { return ''; }
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. POLL FOR TARGET (Squarespace renders async)
  // ─────────────────────────────────────────────────────────────────

  function _poll(attempts) {
    var targets = document.querySelectorAll(CFG.target);
    if (targets.length) { _init(targets[0]); return; }
    if (attempts < 50) setTimeout(function () { _poll(attempts + 1); }, 100);
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. INIT
  // ─────────────────────────────────────────────────────────────────

  function _init(mountEl) {
    try {
      injectStyles();
      buildDOM(mountEl);
      bindEvents();

      /* Seed lerp to viewport center so first render is stable */
      _mouseX = _lerpX = window.innerWidth  / 2;
      _mouseY = _lerpY = window.innerHeight / 2;

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
