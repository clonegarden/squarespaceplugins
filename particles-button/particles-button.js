/**
 * ============================================================
 * PARTICLES BUTTON PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   On click, a burst of particles explodes outward from the
 *   click position using the Web Animations API. No GSAP, no
 *   canvas, no external dependencies. Each particle is a DOM
 *   element that animates to a random position and removes
 *   itself. Supports confetti, dots, lines, and emoji types.
 *
 * USAGE:
 *   1. Add data-anavo-pop to any button or element:
 *        <a class="btn" data-anavo-pop>Click me</a>
 *
 *      Per-element type override:
 *        <a data-anavo-pop data-pop-type="emoji">Click me</a>
 *
 *   2. Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/particles-button/particles-button.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &type=confetti
 *          &count=30
 *          &spread=150
 *        "></script>
 *
 * PARAMETERS (URL query string — encode # as %23):
 *   domain        license check hostname                default: location.hostname
 *   supabaseUrl   Supabase project URL
 *   supabaseKey   Supabase anon key
 *   selector      CSS selector for buttons to enhance   default: [data-anavo-pop]
 *   type          confetti | dots | lines | emoji       default: confetti
 *   count         particles per click                   default: 30
 *   spread        max distance px particles travel      default: 150
 *   duration      base animation duration ms            default: 800
 *   emojis        pipe-separated emoji chars            default: ❤|🧡|💛|💚|💙|💜|⭐|✨
 *   sizeMin       min particle size px                  default: 6
 *   sizeMax       max particle size px                  default: 20
 *   target        CSS selector for mount point          default: [data-anavo-particles-button]
 * ============================================================
 */
;(function () {
  'use strict';

  var PLUGIN_ID      = 'ParticlesButton';
  var PLUGIN_VERSION = '1.0.0';
  var BYPASS_DOMAINS = ['anavo.tech', 'www.anavo.tech', 'pluginstore.anavo.tech', 'clonegarden.github.io', 'localhost', '127.0.0.1'];

  /* ── Idempotency guard ──────────────────────────────────── */
  window.AnavoPluginState = window.AnavoPluginState || {};
  if (window.AnavoPluginState[PLUGIN_ID]) { return; }
  window.AnavoPluginState[PLUGIN_ID] = { version: PLUGIN_VERSION };

  /* ── Param parsing ─────────────────────────────────────── */
  var _src  = (document.currentScript && document.currentScript.src) || '';
  var _qIdx = _src.indexOf('?');
  var _qs   = _qIdx !== -1 ? _src.slice(_qIdx + 1) : '';

  function _param(key, def) {
    var m = _qs.match(new RegExp('(?:^|&)' + key + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : def;
  }

  var CFG = {
    domain:      _param('domain',      location.hostname),
    supabaseUrl: _param('supabaseUrl', ''),
    supabaseKey: _param('supabaseKey', ''),
    selector:    _param('selector',    '[data-anavo-pop]'),
    type:        _param('type',        'confetti'),
    count:       parseInt(_param('count',    '30'),  10),
    spread:      parseInt(_param('spread',   '150'), 10),
    duration:    parseInt(_param('duration', '800'), 10),
    emojis:      _param('emojis',      '❤|🧡|💛|💚|💙|💜|⭐|✨'),
    sizeMin:     parseInt(_param('sizeMin',  '6'),   10),
    sizeMax:     parseInt(_param('sizeMax',  '20'),  10),
    target:      _param('target',      '[data-anavo-particles-button]'),
  };

  /* ── License check (non-blocking, Supabase REST) ───────── */
  var _host = CFG.domain.replace(/^www\./, '');

  if (BYPASS_DOMAINS.indexOf(_host) === -1 && CFG.supabaseUrl && CFG.supabaseKey) {
    var _licenseEndpoint = CFG.supabaseUrl + '/rest/v1/purchased_plugins'
      + '?plugin_id=eq.' + encodeURIComponent(PLUGIN_ID)
      + '&domain=eq.'    + encodeURIComponent(_host)
      + '&select=id&limit=1';

    fetch(_licenseEndpoint, {
      headers: {
        'apikey':        CFG.supabaseKey,
        'Authorization': 'Bearer ' + CFG.supabaseKey
      }
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!Array.isArray(data) || data.length === 0) { _showNotice(); }
    })
    .catch(function () { /* non-blocking */ });
  }

  function _showNotice() {
    var n = document.createElement('div');
    n.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:99999;background:#111;color:#fff;font-size:11px;padding:6px 10px;border-radius:4px;font-family:monospace;opacity:0.85;pointer-events:none;';
    n.textContent = 'Anavo Plugin: ' + PLUGIN_ID + ' — unlicensed. Visit anavo.tech/plugins';
    document.body.appendChild(n);
  }

  /* ── Utility ────────────────────────────────────────────── */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ── CSS injection ──────────────────────────────────────── */
  function _injectStyles() {
    var existing = document.getElementById('anavo-pb-styles');
    if (existing) { existing.remove(); }

    var style = document.createElement('style');
    style.id = 'anavo-pb-styles';
    style.textContent = [
      '.anavo-pb-particle {',
      '  position: fixed !important;',
      '  top: 0 !important;',
      '  left: 0 !important;',
      '  pointer-events: none !important;',
      '  z-index: 99998 !important;',
      '  display: block !important;',
      '  line-height: 1 !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Particle creation ──────────────────────────────────── */
  function _createParticle(x, y, type) {
    var el = document.createElement('div');
    el.className = 'anavo-pb-particle';

    var spread    = CFG.spread;
    var destX     = (Math.random() - 0.5) * spread * 2;
    var destY     = (Math.random() - 0.5) * spread * 2;
    var rotation  = Math.random() * 520;
    var delay     = Math.random() * 200;
    var duration  = Math.random() * CFG.duration + (CFG.duration * 0.5);

    switch (type) {
      case 'dots': {
        var dotSize  = randInt(Math.max(1, Math.floor(CFG.sizeMin / 2)), Math.max(2, Math.floor(CFG.sizeMax / 2)));
        var dotColor = 'hsl(' + Math.random() * 360 + ',80%,60%)';
        el.style.cssText = [
          'width:'        + dotSize + 'px !important',
          'height:'       + dotSize + 'px !important',
          'border-radius: 50% !important',
          'background:'   + dotColor + ' !important',
          'box-shadow: 0 0 ' + dotSize + 'px ' + dotColor + ' !important'
        ].join(';');
        break;
      }

      case 'lines': {
        var lineColor = 'hsl(' + Math.random() * 360 + ',70%,55%)';
        rotation += 1000;
        el.style.cssText = [
          'width:'      + randInt(20, 60) + 'px !important',
          'height: 2px !important',
          'background:' + lineColor + ' !important',
          'border-radius: 1px !important'
        ].join(';');
        break;
      }

      case 'emoji': {
        var emojiList = CFG.emojis.split('|');
        el.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
        el.style.cssText = [
          'font-size: ' + randInt(CFG.sizeMin, CFG.sizeMax) + 'px !important',
          'width: auto !important',
          'height: auto !important',
          'background: transparent !important'
        ].join(';');
        break;
      }

      case 'confetti':
      default: {
        var confSize = randInt(CFG.sizeMin, CFG.sizeMax);
        var confH    = Math.round(confSize * (0.4 + Math.random() * 0.6));
        el.style.cssText = [
          'width:'        + confSize + 'px !important',
          'height:'       + confH    + 'px !important',
          'background: hsl(' + Math.random() * 360 + ',80%,60%) !important',
          'border-radius:' + (Math.random() > 0.5 ? '2px' : '50%') + ' !important'
        ].join(';');
        break;
      }
    }

    document.body.appendChild(el);

    var keyframes = [
      {
        transform: 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px) rotate(0deg)',
        opacity:   1
      },
      {
        transform: 'translate(-50%,-50%) translate(' + (x + destX) + 'px,' + (y + destY) + 'px) rotate(' + rotation + 'deg)',
        opacity:   0
      }
    ];

    var animation = el.animate(keyframes, {
      duration: duration,
      easing:   'cubic-bezier(0, .9, .57, 1)',
      delay:    delay,
      fill:     'forwards'
    });

    animation.onfinish = function () { el.remove(); };
  }

  /* ── Burst ──────────────────────────────────────────────── */
  function _burst(x, y, type) {
    for (var i = 0; i < CFG.count; i++) {
      _createParticle(x, y, type);
    }
  }

  /* ── Click delegation ───────────────────────────────────── */
  function _onDocClick(e) {
    var btn = e.target.closest(CFG.selector);
    if (!btn) { return; }

    var x = e.clientX;
    var y = e.clientY;

    /* Keyboard activation fallback: clientX/Y are 0 */
    if (x === 0 && y === 0) {
      var rect = btn.getBoundingClientRect();
      x = Math.round(rect.left + rect.width  / 2);
      y = Math.round(rect.top  + rect.height / 2);
    }

    /* Per-element type override via data-pop-type */
    var type = btn.getAttribute('data-pop-type') || CFG.type;

    _burst(x, y, type);
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    /* Web Animations API check */
    if (typeof document.body.animate !== 'function') {
      return; /* silently skip if not supported */
    }

    _injectStyles();
    document.addEventListener('click', _onDocClick, false);

    window.AnavoPluginState[PLUGIN_ID].config = CFG;
  }

  /* ── Poll for target (Squarespace async DOM) ────────────── */
  function waitAndMount(attempts) {
    var targets = document.querySelectorAll(CFG.target);
    if (targets.length) {
      init();
      return;
    }
    /* Also init if selector elements are present (no explicit target needed) */
    var selectorTargets = document.querySelectorAll(CFG.selector);
    if (selectorTargets.length) {
      init();
      return;
    }
    if (attempts < 50) {
      setTimeout(function () { waitAndMount(attempts + 1); }, 100);
    }
  }

  /* ── Bootstrap ──────────────────────────────────────────── */
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { waitAndMount(0); });
    } else {
      waitAndMount(0);
    }
  } catch (err) {
    /* silent fail — never break host page */
  }

})();
