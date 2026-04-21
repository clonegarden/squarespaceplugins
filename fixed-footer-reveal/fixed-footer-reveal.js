/**
 * ============================================================
 * FIXED FOOTER REVEAL — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   The footer slides up from the bottom as the user scrolls
 *   near the bottom of the page. It's fixed/sticky and "reveals"
 *   behind the main content. Body gets padding-bottom so the
 *   footer is fully visible when revealed.
 *
 * USAGE:
 *   Works automatically with footer, .footer, or [data-anavo-footer].
 *   No HTML changes required.
 *
 * PARAMETERS:
 *   selector       footer CSS selector        default: footer,.footer,[data-anavo-footer]
 *   triggerOffset  px from bottom to trigger  default: 200
 *   transition     CSS transition duration    default: 0.5s
 *   easing         CSS easing function        default: cubic-bezier(0.19,1,0.22,1)
 *   domain         license check hostname
 *   supabaseUrl    Supabase project URL
 *   supabaseKey    Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'FixedFooterReveal';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="fixed-footer-reveal"]');
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
    domain:        p('domain',        window.location.hostname),
    supabaseUrl:   p('supabaseUrl',   ''),
    supabaseKey:   p('supabaseKey',   ''),
    selector:      p('selector',      'footer,.footer,[data-anavo-footer]'),
    triggerOffset: parseInt(p('triggerOffset', '200'), 10),
    transition:    p('transition',    '0.5s'),
    easing:        p('easing',        'cubic-bezier(0.19,1,0.22,1)')
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
          _licenseNotice();
        }
      })
      .catch(function () {});
    } catch (e) {}
  }

  function _licenseNotice() {
    var nid = 'anavo-ffr-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get FixedFooterReveal license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. MAIN LOGIC
  // ─────────────────────────────────────────────────────────────────

  var _footer    = null;
  var _revealed  = false;
  var _raf       = null;

  function setupFooter(footer) {
    var h = footer.offsetHeight;

    // Fix footer to bottom of viewport, hidden below
    footer.style.setProperty('position', 'fixed', 'important');
    footer.style.setProperty('bottom',   '0', 'important');
    footer.style.setProperty('left',     '0', 'important');
    footer.style.setProperty('width',    '100%', 'important');
    footer.style.setProperty('z-index',  '100', 'important');
    footer.style.setProperty(
      'transition',
      'transform ' + CFG.transition + ' ' + CFG.easing,
      'important'
    );
    footer.style.setProperty('transform', 'translateY(100%)', 'important');

    // Reserve space at bottom of body
    document.body.style.setProperty('padding-bottom', h + 'px', 'important');

    return h;
  }

  function onScroll(footer, footerH) {
    var scrolled  = window.scrollY || window.pageYOffset;
    var docH      = document.documentElement.scrollHeight || document.body.scrollHeight;
    var viewH     = window.innerHeight;
    var nearBottom = (scrolled + viewH) >= (docH - CFG.triggerOffset);

    if (nearBottom && !_revealed) {
      _revealed = true;
      footer.style.setProperty('transform', 'translateY(0)', 'important');
    } else if (!nearBottom && _revealed) {
      _revealed = false;
      footer.style.setProperty('transform', 'translateY(100%)', 'important');
    }
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

    // Try each selector in priority order
    var selectors = CFG.selector.split(',');
    var footer = null;
    for (var i = 0; i < selectors.length; i++) {
      footer = document.querySelector(selectors[i].trim());
      if (footer) break;
    }

    if (!footer) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] Footer "' + CFG.selector + '" not found after 5s.');
      return;
    }

    checkLicense();
    _footer = footer;
    var footerH = setupFooter(footer);

    window.addEventListener('scroll', function () {
      if (_raf) return;
      _raf = requestAnimationFrame(function () {
        _raf = null;
        onScroll(footer, footerH);
      });
    }, { passive: true });

    // Also check on resize (footer height may change)
    window.addEventListener('resize', function () {
      footerH = footer.offsetHeight;
      document.body.style.setProperty('padding-bottom', footerH + 'px', 'important');
      onScroll(footer, footerH);
    });

    onScroll(footer, footerH);
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
