/**
 * ============================================================
 * CHANDELIER PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Full-viewport canvas background. Glowing particles hang
 *   from anchor points at the top via colored lines. Mouse
 *   proximity pulls particles toward the cursor; on release
 *   they swing back to their resting positions with damping.
 *   Layers over existing page content (z-index configurable).
 *   Mobile: reduced particle count, touch support.
 *
 * USAGE:
 *   1. Add a Code Block anywhere on your Squarespace page:
 *        <div data-anavo-chandelier></div>
 *
 *   2. Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/chandelier/chandelier.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &particleCount=200
 *          &bgColor=%23191919
 *          &particleColor=255%2C255%2C255
 *          &lineColor=255%2C215%2C0
 *        "></script>
 *
 * PARAMETERS (URL query string — encode # as %23, , as %2C):
 *   domain            site domain (license check)        default: hostname
 *   supabaseUrl       Supabase project URL
 *   supabaseKey       Supabase anon key
 *   particleCount     particles on desktop               default: 200
 *   mobileCount       particles on mobile (≤800px)       default: 80
 *   bgColor           canvas background color            default: #191919
 *   bgOpacity         background opacity (0–1)           default: 1
 *   particleColor     RGB for particles e.g. 255,255,255 default: 255,255,255
 *   particleOpacityMin min particle opacity              default: 0.4
 *   particleOpacityMax max particle opacity              default: 1.0
 *   particleRadiusMin  min particle radius px            default: 2
 *   particleRadiusMax  max particle radius px            default: 5
 *   lineColor         RGB for anchor lines e.g. 255,215,0 default: 255,215,0
 *   lineOpacity       anchor line opacity                default: 0.25
 *   lineWidth         anchor line stroke width px        default: 1
 *   mouseRadius       cursor pull radius px              default: 150
 *   pullStrength      cursor pull force (0.01–0.1)       default: 0.03
 *   swingMin          min swing-back speed               default: 0.04
 *   swingMax          max swing-back speed               default: 0.12
 *   dropMin           min particle drop (% of height)   default: 0.1
 *   dropMax           max particle drop (% of height)   default: 0.75
 *   anchorY           anchor Y position px (0 = top)    default: 0
 *   zIndex            canvas z-index                    default: -1
 *   target            CSS selector for mount point       default: [data-anavo-chandelier]
 * ============================================================
 */
(function () {
  'use strict';

  var PLUGIN_ID      = 'Chandelier';
  var PLUGIN_VERSION = '1.0.0';
  var BYPASS_DOMAINS = ['anavo.tech', 'www.anavo.tech', 'pluginstore.anavo.tech', 'clonegarden.github.io', 'localhost', '127.0.0.1'];

  /* ── Param parsing ─────────────────────────────────────── */
  var _src  = (document.currentScript && document.currentScript.src) || '';
  var _qIdx = _src.indexOf('?');
  var _qs   = _qIdx !== -1 ? _src.slice(_qIdx + 1) : '';

  function _param(key, def) {
    var m = _qs.match(new RegExp('(?:^|&)' + key + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : def;
  }

  var CFG = {
    domain:            _param('domain',            location.hostname),
    supabaseUrl:       _param('supabaseUrl',       ''),
    supabaseKey:       _param('supabaseKey',       ''),
    particleCount:     parseInt(_param('particleCount',     '200'), 10),
    mobileCount:       parseInt(_param('mobileCount',       '80'),  10),
    bgColor:           _param('bgColor',           '#191919'),
    bgOpacity:         parseFloat(_param('bgOpacity',       '1')),
    particleColor:     _param('particleColor',     '255,255,255'),
    particleOpacityMin: parseFloat(_param('particleOpacityMin', '0.4')),
    particleOpacityMax: parseFloat(_param('particleOpacityMax', '1.0')),
    particleRadiusMin:  parseFloat(_param('particleRadiusMin',  '2')),
    particleRadiusMax:  parseFloat(_param('particleRadiusMax',  '5')),
    lineColor:         _param('lineColor',         '255,215,0'),
    lineOpacity:       parseFloat(_param('lineOpacity',     '0.25')),
    lineWidth:         parseFloat(_param('lineWidth',       '1')),
    mouseRadius:       parseFloat(_param('mouseRadius',     '150')),
    pullStrength:      parseFloat(_param('pullStrength',    '0.03')),
    swingMin:          parseFloat(_param('swingMin',        '0.04')),
    swingMax:          parseFloat(_param('swingMax',        '0.12')),
    dropMin:           parseFloat(_param('dropMin',         '0.1')),
    dropMax:           parseFloat(_param('dropMax',         '0.75')),
    anchorY:           parseFloat(_param('anchorY',         '0')),
    zIndex:            parseInt(_param('zIndex',            '-1'), 10),
    target:            _param('target',            '[data-anavo-chandelier]'),
  };

  /* ── License check ─────────────────────────────────────── */
  var host = CFG.domain.replace(/^www\./, '');

  if (BYPASS_DOMAINS.indexOf(host) === -1 && CFG.supabaseUrl && CFG.supabaseKey) {
    var _endpoint = CFG.supabaseUrl + '/rest/v1/purchased_plugins'
      + '?plugin_id=eq.' + encodeURIComponent(PLUGIN_ID)
      + '&domain=eq.'    + encodeURIComponent(host)
      + '&select=id&limit=1';

    fetch(_endpoint, {
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

  /* ── State ──────────────────────────────────────────────── */
  var _canvas   = null;
  var _ctx      = null;
  var _particles = [];
  var _mouse    = { x: null, y: null };
  var _rafId    = null;
  var _isMobile = false;

  /* ── Particle ───────────────────────────────────────────── */
  function Particle(ax) {
    this.ax    = ax;
    this.ay    = CFG.anchorY;
    this.x     = ax;
    this.baseY = (_randFloat(CFG.dropMin, CFG.dropMax)) * _canvas.height;
    this.y     = this.baseY;
    this.r     = _randFloat(CFG.particleRadiusMin, CFG.particleRadiusMax);
    this.o     = _randFloat(CFG.particleOpacityMin, CFG.particleOpacityMax);
    this.swing = _randFloat(CFG.swingMin, CFG.swingMax);
    /* glow: slightly larger, more transparent outer circle */
    this.glowR = this.r * 2.5;
    this.glowO = this.o * 0.15;
  }

  Particle.prototype.update = function () {
    if (_mouse.x !== null && _mouse.y !== null) {
      var dx   = _mouse.x - this.x;
      var dy   = _mouse.y - this.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CFG.mouseRadius) {
        /* pulled toward cursor — stronger pull when closer */
        var force = (1 - dist / CFG.mouseRadius) * CFG.pullStrength * 2;
        this.x += dx * (CFG.pullStrength + force);
        this.y += dy * (CFG.pullStrength + force);
        return;
      }
    }
    /* swing back to anchor/base with damping */
    this.x += (this.ax    - this.x) * this.swing;
    this.y += (this.baseY - this.y) * this.swing;
  };

  Particle.prototype.draw = function () {
    /* anchor line */
    _ctx.beginPath();
    _ctx.moveTo(this.ax, this.ay);
    _ctx.lineTo(this.x, this.y);
    _ctx.lineWidth   = CFG.lineWidth;
    _ctx.strokeStyle = 'rgba(' + CFG.lineColor + ',' + CFG.lineOpacity + ')';
    _ctx.stroke();

    /* outer glow */
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, this.glowR, 0, Math.PI * 2);
    _ctx.fillStyle = 'rgba(' + CFG.particleColor + ',' + this.glowO + ')';
    _ctx.fill();

    /* particle core */
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    _ctx.fillStyle = 'rgba(' + CFG.particleColor + ',' + this.o + ')';
    _ctx.fill();
  };

  /* ── Helpers ────────────────────────────────────────────── */
  function _randFloat(min, max) {
    return min + Math.random() * (max - min);
  }

  /* ── Init particles ─────────────────────────────────────── */
  function _initParticles() {
    _particles = [];
    var count = _isMobile ? CFG.mobileCount : CFG.particleCount;
    for (var i = 0; i < count; i++) {
      var ax = Math.random() * _canvas.width;
      _particles.push(new Particle(ax));
    }
  }

  /* ── Resize ─────────────────────────────────────────────── */
  function _resize() {
    _isMobile = window.innerWidth <= 800;
    _canvas.width  = window.innerWidth;
    _canvas.height = window.innerHeight;
    _initParticles();
  }

  /* ── Render loop ────────────────────────────────────────── */
  function _animate() {
    /* clear with bg color */
    _ctx.fillStyle = _hexToRgba(CFG.bgColor, CFG.bgOpacity);
    _ctx.fillRect(0, 0, _canvas.width, _canvas.height);

    for (var i = 0; i < _particles.length; i++) {
      _particles[i].update();
      _particles[i].draw();
    }

    _rafId = requestAnimationFrame(_animate);
  }

  /* ── Hex to rgba ────────────────────────────────────────── */
  function _hexToRgba(hex, alpha) {
    var h = hex.replace('#', '');
    if (h.length === 3) {
      h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    }
    var r = parseInt(h.slice(0,2), 16);
    var g = parseInt(h.slice(2,4), 16);
    var b = parseInt(h.slice(4,6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ── Build canvas ───────────────────────────────────────── */
  function _buildCanvas() {
    _canvas = document.createElement('canvas');
    _canvas.id = 'anavo-chandelier-canvas';
    _canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100vw',
      'height:100vh',
      'z-index:' + CFG.zIndex,
      'pointer-events:none',
      'display:block'
    ].join(';');

    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');
  }

  /* ── Mouse / touch ──────────────────────────────────────── */
  function _bindInput() {
    window.addEventListener('mousemove', function (e) {
      _mouse.x = e.clientX;
      _mouse.y = e.clientY;
    });

    /* reset on leave so particles relax */
    document.addEventListener('mouseleave', function () {
      _mouse.x = null;
      _mouse.y = null;
    });

    /* touch support */
    window.addEventListener('touchmove', function (e) {
      if (e.touches.length > 0) {
        _mouse.x = e.touches[0].clientX;
        _mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function () {
      _mouse.x = null;
      _mouse.y = null;
    });

    window.addEventListener('resize', _resize);
  }

  /* ── Init ───────────────────────────────────────────────── */
  function _init() {
    if (window.AnavoPluginState && window.AnavoPluginState[PLUGIN_ID]) return;
    window.AnavoPluginState = window.AnavoPluginState || {};
    window.AnavoPluginState[PLUGIN_ID] = { version: PLUGIN_VERSION };

    _buildCanvas();
    _bindInput();
    _resize();
    _animate();
  }

  /* ── Poll for mount point ───────────────────────────────── */
  var _attempts = 0;
  var _poll = setInterval(function () {
    _attempts++;
    if (document.querySelector(CFG.target) || _attempts >= 50) {
      clearInterval(_poll);
      _init();
    }
  }, 100);

})();
