/**
 * ============================================================
 * IMAGE HOTSPOTS — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Adds clickable/hoverable hotspot pins on an image. Each pin
 *   is a [data-anavo-hotspot] element inside [data-anavo-hotspots]
 *   with data-x, data-y (% from top-left), data-title, data-text.
 *   Shows a styled tooltip popup on hover or click.
 *
 * USAGE:
 *   <div data-anavo-hotspots style="position:relative">
 *     <img src="image.jpg" style="width:100%">
 *     <span data-anavo-hotspot data-x="30" data-y="45"
 *           data-title="Feature" data-text="Description here"></span>
 *   </div>
 *
 * PARAMETERS:
 *   pinColor      pin fill colour             default: #00d4ff
 *   tooltipBg     tooltip background          default: rgba(0,0,0,0.9)
 *   tooltipColor  tooltip text colour         default: #ffffff
 *   trigger       'hover' or 'click'          default: hover
 *   selector      container selector          default: [data-anavo-hotspots]
 *   domain        license check hostname
 *   supabaseUrl   Supabase project URL
 *   supabaseKey   Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ImageHotspots';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="image-hotspots"]');
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
    domain:       p('domain',       window.location.hostname),
    supabaseUrl:  p('supabaseUrl',  ''),
    supabaseKey:  p('supabaseKey',  ''),
    pinColor:     p('pinColor',     '#00d4ff'),
    tooltipBg:    p('tooltipBg',    'rgba(0,0,0,0.9)'),
    tooltipColor: p('tooltipColor', '#ffffff'),
    trigger:      p('trigger',      'hover'),
    selector:     p('selector',     '[data-anavo-hotspots]')
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
    var nid = 'anavo-ih-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get ImageHotspots license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('anavo-ih-styles')) return;

    var css =
      '@keyframes anavo-ih-pulse{' +
        '0%{box-shadow:0 0 0 0 ' + CFG.pinColor + '66;}' +
        '70%{box-shadow:0 0 0 10px transparent;}' +
        '100%{box-shadow:0 0 0 0 transparent;}' +
      '}' +

      '[data-anavo-hotspots]{' +
        'position:relative!important;' +
        'display:inline-block!important;' +
        'width:100%!important;' +
      '}' +

      '[data-anavo-hotspot]{' +
        'position:absolute!important;' +
        'width:20px!important;' +
        'height:20px!important;' +
        'border-radius:50%!important;' +
        'background:' + CFG.pinColor + '!important;' +
        'border:3px solid #fff!important;' +
        'box-shadow:0 2px 8px rgba(0,0,0,0.4)!important;' +
        'cursor:pointer!important;' +
        'transform:translate(-50%,-50%)!important;' +
        'animation:anavo-ih-pulse 2s ease-in-out infinite!important;' +
        'z-index:100!important;' +
        'transition:transform 0.2s ease!important;' +
      '}' +

      '[data-anavo-hotspot]:hover{' +
        'transform:translate(-50%,-50%) scale(1.3)!important;' +
        'animation-play-state:paused!important;' +
      '}' +

      '.anavo-ih-tooltip{' +
        'position:absolute!important;' +
        'background:' + CFG.tooltipBg + '!important;' +
        'color:' + CFG.tooltipColor + '!important;' +
        'padding:12px 16px!important;' +
        'border-radius:8px!important;' +
        'min-width:180px!important;' +
        'max-width:280px!important;' +
        'font-family:system-ui,sans-serif!important;' +
        'font-size:13px!important;' +
        'line-height:1.5!important;' +
        'z-index:1000!important;' +
        'pointer-events:none!important;' +
        'opacity:0!important;' +
        'transform:translateY(6px)!important;' +
        'transition:opacity 0.2s ease,transform 0.2s ease!important;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.3)!important;' +
        'white-space:normal!important;' +
      '}' +

      '.anavo-ih-tooltip.anavo-ih-visible{' +
        'opacity:1!important;' +
        'transform:translateY(0)!important;' +
      '}' +

      '.anavo-ih-tooltip-title{' +
        'font-weight:700!important;' +
        'font-size:14px!important;' +
        'margin-bottom:4px!important;' +
        'display:block!important;' +
      '}' +

      '.anavo-ih-tooltip::after{' +
        'content:""!important;' +
        'position:absolute!important;' +
        'bottom:-6px!important;' +
        'left:16px!important;' +
        'width:12px!important;' +
        'height:12px!important;' +
        'background:' + CFG.tooltipBg + '!important;' +
        'transform:rotate(45deg)!important;' +
        'z-index:-1!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-ih-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. BUILD + ATTACH HOTSPOTS
  // ─────────────────────────────────────────────────────────────────

  function positionTooltip(pin, tooltip) {
    // Default: above the pin
    var pinRect  = pin.getBoundingClientRect();
    var contRect = pin.parentElement.getBoundingClientRect();
    var left     = pinRect.left - contRect.left + pinRect.width / 2 - 16;
    var top      = pinRect.top  - contRect.top  - tooltip.offsetHeight - 14;

    // Flip below if not enough room above
    if (top < 0) {
      top = pinRect.top - contRect.top + pinRect.height + 8;
      tooltip.style.setProperty('--arrow-top', 'auto', 'important');
    }

    tooltip.style.setProperty('left', Math.max(0, left) + 'px', 'important');
    tooltip.style.setProperty('top',  top + 'px', 'important');
  }

  function processContainer(container) {
    if (container.getAttribute('data-anavo-ih-done') === 'true') return;
    container.setAttribute('data-anavo-ih-done', 'true');

    var pins = container.querySelectorAll('[data-anavo-hotspot]');
    pins.forEach(function (pin) {
      // Position pin
      var x = parseFloat(pin.getAttribute('data-x') || '50');
      var y = parseFloat(pin.getAttribute('data-y') || '50');
      pin.style.setProperty('left', x + '%', 'important');
      pin.style.setProperty('top',  y + '%', 'important');

      // Build tooltip
      var tooltip = document.createElement('div');
      tooltip.className = 'anavo-ih-tooltip';
      tooltip.setAttribute('role', 'tooltip');

      var title = pin.getAttribute('data-title') || '';
      var text  = pin.getAttribute('data-text')  || '';
      tooltip.innerHTML =
        (title ? '<span class="anavo-ih-tooltip-title">' + title + '</span>' : '') +
        (text  ? '<span>' + text + '</span>' : '');

      container.appendChild(tooltip);

      function showTooltip() {
        tooltip.classList.add('anavo-ih-visible');
        positionTooltip(pin, tooltip);
      }
      function hideTooltip() {
        tooltip.classList.remove('anavo-ih-visible');
      }

      if (CFG.trigger === 'click') {
        pin.addEventListener('click', function (e) {
          e.stopPropagation();
          var vis = tooltip.classList.contains('anavo-ih-visible');
          // Close all
          container.querySelectorAll('.anavo-ih-tooltip').forEach(function (t) {
            t.classList.remove('anavo-ih-visible');
          });
          if (!vis) showTooltip();
        });
        document.addEventListener('click', hideTooltip);
      } else {
        pin.addEventListener('mouseenter', showTooltip);
        pin.addEventListener('mouseleave', hideTooltip);
        pin.addEventListener('focus',      showTooltip);
        pin.addEventListener('blur',       hideTooltip);
      }

      pin.setAttribute('tabindex', '0');
      pin.setAttribute('role',     'button');
      pin.setAttribute('aria-label', title || 'Hotspot');
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

    var containers = document.querySelectorAll(CFG.selector);
    if (!containers.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] Selector "' + CFG.selector + '" not found after 5s.');
      return;
    }

    injectStyles();
    checkLicense();
    containers.forEach(function (c) { processContainer(c); });
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
