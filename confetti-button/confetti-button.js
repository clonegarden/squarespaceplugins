/**
 * ============================================================
 * CONFETTI BUTTON — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Any button [data-anavo-confetti] shoots confetti particles
 *   on click. Pure canvas, no external dependencies. Particles
 *   have random velocity, gravity, rotation, and colour.
 *
 * USAGE:
 *   <button data-anavo-confetti>Click me!</button>
 *
 * PARAMETERS:
 *   selector    target elements selector    default: [data-anavo-confetti]
 *   colors      comma-separated hex list    default: #ff4136,#0074d9,#2ecc40,#ffdc00,#ff69b4
 *   count       particle count             default: 80
 *   spread      horizontal spread px       default: 60
 *   duration    animation duration ms      default: 2000
 *   domain      license check hostname
 *   supabaseUrl Supabase project URL
 *   supabaseKey Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ConfettiButton';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="confetti-button"]');
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
    selector:    p('selector',    '[data-anavo-confetti]'),
    colors:      p('colors',      '#ff4136,#0074d9,#2ecc40,#ffdc00,#ff69b4'),
    count:       parseInt(p('count',    '80'),   10),
    spread:      parseInt(p('spread',   '60'),   10),
    duration:    parseInt(p('duration', '2000'), 10)
  };

  var COLORS = CFG.colors.split(',').map(function (c) { return c.trim(); });

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
    var nid = 'anavo-cb-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get ConfettiButton license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CONFETTI ENGINE
  // ─────────────────────────────────────────────────────────────────

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function fireConfetti(originX, originY) {
    var canvas   = document.createElement('canvas');
    var ctx      = canvas.getContext('2d');
    var W        = window.innerWidth;
    var H        = window.innerHeight;

    canvas.width  = W;
    canvas.height = H;
    canvas.setAttribute('style',
      'position:fixed!important;' +
      'inset:0!important;' +
      'pointer-events:none!important;' +
      'z-index:2147483646!important;'
    );
    document.body.appendChild(canvas);

    var particles = [];
    for (var i = 0; i < CFG.count; i++) {
      var angle = rand(-Math.PI, 0); // upward burst
      var speed = rand(3, 12);
      particles.push({
        x:    originX,
        y:    originY,
        vx:   Math.cos(angle) * speed + rand(-CFG.spread / 10, CFG.spread / 10),
        vy:   Math.sin(angle) * speed - rand(2, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w:    rand(6, 12),
        h:    rand(4, 8),
        rot:  rand(0, Math.PI * 2),
        rVel: rand(-0.2, 0.2),
        gravity: 0.35,
        alpha: 1,
        decay: rand(0.005, 0.015)
      });
    }

    var start  = null;
    var dur    = CFG.duration;

    function frame(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;

      ctx.clearRect(0, 0, W, H);

      var alive = false;
      for (var j = 0; j < particles.length; j++) {
        var part = particles[j];
        if (part.alpha <= 0) continue;
        alive = true;

        part.x   += part.vx;
        part.y   += part.vy;
        part.vy  += part.gravity;
        part.rot += part.rVel;
        part.alpha = Math.max(0, 1 - elapsed / dur);

        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.translate(part.x, part.y);
        ctx.rotate(part.rot);
        ctx.fillStyle = part.color;
        ctx.fillRect(-part.w / 2, -part.h / 2, part.w, part.h);
        ctx.restore();
      }

      if (alive && elapsed < dur + 500) {
        requestAnimationFrame(frame);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }

    requestAnimationFrame(frame);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. ATTACH TO BUTTONS
  // ─────────────────────────────────────────────────────────────────

  function attachButton(btn) {
    if (btn.getAttribute('data-anavo-cb-done') === 'true') return;
    btn.setAttribute('data-anavo-cb-done', 'true');

    btn.addEventListener('click', function (e) {
      var rect = btn.getBoundingClientRect();
      var ox   = rect.left + rect.width  / 2;
      var oy   = rect.top  + rect.height / 2;
      fireConfetti(ox, oy);
    });
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

    var btns = document.querySelectorAll(CFG.selector);
    if (!btns.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] No elements matching "' + CFG.selector + '" found.');
      return;
    }

    checkLicense();
    btns.forEach(function (btn) { attachButton(btn); });
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
