/**
 * ============================================================
 * LOADING SCREEN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Shows a branded loading overlay on page load. Has logo +
 *   animated progress bar that fills over ~duration ms, then
 *   fades out. Respects minDisplay so it never vanishes instantly.
 *
 * USAGE:
 *   Paste script tag as early as possible in Code Injection → HEADER
 *   for best effect (before the page renders).
 *
 * PARAMETERS:
 *   bg          overlay background colour   default: #07070d
 *   color       accent / bar colour         default: #00d4ff
 *   logo        URL (img) or text string    default: (empty)
 *   text        loading text                default: Loading...
 *   duration    progress anim ms            default: 1500
 *   barHeight   progress bar height         default: 3px
 *   minDisplay  minimum visible ms          default: 800
 *   domain      license check hostname
 *   supabaseUrl Supabase project URL
 *   supabaseKey Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'LoadingScreen';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="loading-screen"]');
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
    bg:          p('bg',          '#07070d'),
    color:       p('color',       '#00d4ff'),
    logo:        p('logo',        ''),
    text:        p('text',        'Loading...'),
    duration:    parseInt(p('duration',   '1500'), 10),
    barHeight:   p('barHeight',   '3px'),
    minDisplay:  parseInt(p('minDisplay', '800'),  10)
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
          // Note: license notice deferred until page load
        }
      })
      .catch(function () {});
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. INJECT OVERLAY (runs immediately, before DOM fully ready)
  // ─────────────────────────────────────────────────────────────────

  var _startTime = Date.now();
  var _overlay, _bar, _pageLoaded = false;

  function injectOverlay() {
    if (document.getElementById('anavo-ls-overlay')) return;

    // Build overlay
    _overlay = document.createElement('div');
    _overlay.id = 'anavo-ls-overlay';
    _overlay.setAttribute('style',
      'position:fixed!important;' +
      'inset:0!important;' +
      'background:' + CFG.bg + '!important;' +
      'z-index:2147483647!important;' +
      'display:flex!important;' +
      'flex-direction:column!important;' +
      'align-items:center!important;' +
      'justify-content:center!important;' +
      'gap:24px!important;' +
      'transition:opacity 0.5s ease!important;' +
      'font-family:system-ui,sans-serif!important;'
    );

    // Logo
    if (CFG.logo) {
      var logoEl;
      if (/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i.test(CFG.logo) || CFG.logo.indexOf('http') === 0) {
        logoEl = document.createElement('img');
        logoEl.src = CFG.logo;
        logoEl.setAttribute('style', 'max-width:180px!important;max-height:80px!important;object-fit:contain!important;');
      } else {
        logoEl = document.createElement('div');
        logoEl.textContent = CFG.logo;
        logoEl.setAttribute('style',
          'font-size:28px!important;font-weight:700!important;' +
          'color:#fff!important;letter-spacing:0.05em!important;'
        );
      }
      _overlay.appendChild(logoEl);
    }

    // Text
    if (CFG.text) {
      var textEl = document.createElement('div');
      textEl.textContent = CFG.text;
      textEl.setAttribute('style',
        'color:rgba(255,255,255,0.5)!important;' +
        'font-size:13px!important;' +
        'letter-spacing:0.15em!important;' +
        'text-transform:uppercase!important;'
      );
      _overlay.appendChild(textEl);
    }

    // Progress bar container
    var barWrap = document.createElement('div');
    barWrap.setAttribute('style',
      'position:absolute!important;' +
      'bottom:0!important;' +
      'left:0!important;' +
      'width:100%!important;' +
      'height:' + CFG.barHeight + '!important;' +
      'background:rgba(255,255,255,0.1)!important;'
    );

    _bar = document.createElement('div');
    _bar.setAttribute('style',
      'height:100%!important;' +
      'width:0%!important;' +
      'background:' + CFG.color + '!important;' +
      'transition:width ' + CFG.duration + 'ms cubic-bezier(0.4,0,0.2,1)!important;'
    );

    barWrap.appendChild(_bar);
    _overlay.appendChild(barWrap);

    // Insert as first child of body (or html if body not ready)
    var parent = document.body || document.documentElement;
    if (parent.firstChild) {
      parent.insertBefore(_overlay, parent.firstChild);
    } else {
      parent.appendChild(_overlay);
    }

    // Start bar animation on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        _bar.style.setProperty('width', '90%', 'important');
      });
    });
  }

  function dismiss() {
    if (!_overlay) return;
    var elapsed  = Date.now() - _startTime;
    var remaining = Math.max(0, CFG.minDisplay - elapsed);

    setTimeout(function () {
      // Complete the bar before fading
      _bar.style.setProperty('transition', 'width 0.3s ease', 'important');
      _bar.style.setProperty('width', '100%', 'important');

      setTimeout(function () {
        _overlay.style.setProperty('opacity', '0', 'important');
        setTimeout(function () {
          if (_overlay && _overlay.parentNode) {
            _overlay.parentNode.removeChild(_overlay);
          }
        }, 500);
      }, 300);
    }, remaining);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. INIT WITH DOM POLLING
  // ─────────────────────────────────────────────────────────────────

  var _attempts = 0;

  function init() {
    if (!document.body) {
      if (++_attempts < 50) { setTimeout(init, 100); }
      return;
    }

    injectOverlay();
    checkLicense();

    // Listen for page load
    if (document.readyState === 'complete') {
      dismiss();
    } else {
      window.addEventListener('load', dismiss);
      // Fallback: also dismiss after duration + buffer
      setTimeout(dismiss, CFG.duration + CFG.minDisplay + 500);
    }
  }

  // Start immediately — don't wait for DOMContentLoaded
  init();

})();
