/**
 * ============================================================
 * TOOLTIPS — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Any element with data-anavo-tooltip="Text" or title attribute
 *   gets a styled, auto-positioned tooltip on hover.
 *   Tooltip intelligently avoids viewport edges (top/bottom/left/right).
 *
 * USAGE:
 *   <span data-anavo-tooltip="This is a tooltip">Hover me</span>
 *   <a href="#" title="Link description">Learn more</a>
 *
 * PARAMETERS:
 *   selector      target elements              default: [data-anavo-tooltip],[title]
 *   bg            tooltip background           default: rgba(0,0,0,0.9)
 *   color         tooltip text colour          default: #ffffff
 *   fontSize      font size                    default: 13px
 *   padding       inner padding                default: 8px 12px
 *   borderRadius  tooltip corner radius        default: 6px
 *   delay         show delay ms                default: 200
 *   arrow         show directional arrow       default: true
 *   maxWidth      max tooltip width            default: 260px
 *   domain        license check hostname
 *   supabaseUrl   Supabase project URL
 *   supabaseKey   Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'Tooltips';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="tooltips"]');
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
    selector:     p('selector',     '[data-anavo-tooltip],[title]'),
    bg:           p('bg',           'rgba(0,0,0,0.9)'),
    color:        p('color',        '#ffffff'),
    fontSize:     p('fontSize',     '13px'),
    padding:      p('padding',      '8px 12px'),
    borderRadius: p('borderRadius', '6px'),
    delay:        parseInt(p('delay', '200'), 10),
    arrow:        p('arrow',        'true'),
    maxWidth:     p('maxWidth',     '260px')
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
    var nid = 'anavo-tt-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get Tooltips license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. SINGLETON TOOLTIP ELEMENT
  // ─────────────────────────────────────────────────────────────────

  var _tip       = null;
  var _arrowEl   = null;
  var _showTimer = null;

  function injectStyles() {
    if (document.getElementById('anavo-tt-styles')) return;
    var css =
      '#anavo-tt{' +
        'position:fixed!important;' +
        'z-index:2147483645!important;' +
        'pointer-events:none!important;' +
        'background:' + CFG.bg + '!important;' +
        'color:' + CFG.color + '!important;' +
        'font-size:' + CFG.fontSize + '!important;' +
        'padding:' + CFG.padding + '!important;' +
        'border-radius:' + CFG.borderRadius + '!important;' +
        'max-width:' + CFG.maxWidth + '!important;' +
        'line-height:1.5!important;' +
        'font-family:system-ui,sans-serif!important;' +
        'white-space:normal!important;' +
        'word-break:break-word!important;' +
        'opacity:0!important;' +
        'transform:translateY(4px)!important;' +
        'transition:opacity 0.18s ease,transform 0.18s ease!important;' +
        'box-shadow:0 4px 20px rgba(0,0,0,0.3)!important;' +
      '}' +
      '#anavo-tt.anavo-tt-show{' +
        'opacity:1!important;' +
        'transform:translateY(0)!important;' +
      '}' +
      '#anavo-tt-arrow{' +
        'position:fixed!important;' +
        'z-index:2147483644!important;' +
        'pointer-events:none!important;' +
        'width:0!important;' +
        'height:0!important;' +
        'opacity:0!important;' +
        'transition:opacity 0.18s ease!important;' +
      '}' +
      '#anavo-tt-arrow.anavo-tt-show{' +
        'opacity:1!important;' +
      '}';
    var style = document.createElement('style');
    style.id = 'anavo-tt-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function createTip() {
    if (document.getElementById('anavo-tt')) return;
    _tip = document.createElement('div');
    _tip.id = 'anavo-tt';
    _tip.setAttribute('role', 'tooltip');
    document.body.appendChild(_tip);

    if (CFG.arrow === 'true') {
      _arrowEl = document.createElement('div');
      _arrowEl.id = 'anavo-tt-arrow';
      document.body.appendChild(_arrowEl);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. POSITIONING LOGIC
  // ─────────────────────────────────────────────────────────────────

  var ARROW_SIZE = 6;
  var MARGIN     = 8;

  function positionTip(rect) {
    var tipW = _tip.offsetWidth;
    var tipH = _tip.offsetHeight;
    var vW   = window.innerWidth;
    var vH   = window.innerHeight;

    // Preferred: above center
    var positions = [
      { placement: 'top',    left: rect.left + rect.width / 2 - tipW / 2,  top: rect.top  - tipH - ARROW_SIZE - MARGIN },
      { placement: 'bottom', left: rect.left + rect.width / 2 - tipW / 2,  top: rect.bottom + ARROW_SIZE + MARGIN },
      { placement: 'right',  left: rect.right + ARROW_SIZE + MARGIN,        top: rect.top  + rect.height / 2 - tipH / 2 },
      { placement: 'left',   left: rect.left  - tipW - ARROW_SIZE - MARGIN, top: rect.top  + rect.height / 2 - tipH / 2 }
    ];

    var chosen = positions[0]; // fallback: top
    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      var fits = pos.left >= MARGIN &&
                 pos.top  >= MARGIN &&
                 pos.left + tipW <= vW - MARGIN &&
                 pos.top  + tipH <= vH - MARGIN;
      if (fits) { chosen = pos; break; }
    }

    // Clamp to viewport
    chosen.left = Math.max(MARGIN, Math.min(vW - tipW - MARGIN, chosen.left));
    chosen.top  = Math.max(MARGIN, Math.min(vH - tipH - MARGIN, chosen.top));

    _tip.style.setProperty('left', chosen.left + 'px', 'important');
    _tip.style.setProperty('top',  chosen.top  + 'px', 'important');

    // Arrow
    if (_arrowEl) {
      var aLeft, aTop, aBorder;
      var ac = CFG.bg.indexOf('rgba') > -1
        ? CFG.bg
        : CFG.bg;

      _arrowEl.style.cssText = '';

      if (chosen.placement === 'top') {
        // Arrow at bottom of tooltip, pointing down
        aLeft = chosen.left + tipW / 2 - ARROW_SIZE;
        aTop  = chosen.top  + tipH;
        _arrowEl.setAttribute('style',
          'position:fixed!important;z-index:2147483644!important;pointer-events:none!important;' +
          'left:' + aLeft + 'px!important;top:' + aTop + 'px!important;' +
          'border-left:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-right:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-top:' + ARROW_SIZE + 'px solid ' + CFG.bg + '!important;' +
          'width:0!important;height:0!important;opacity:0!important;transition:opacity 0.18s ease!important;'
        );
      } else if (chosen.placement === 'bottom') {
        aLeft = chosen.left + tipW / 2 - ARROW_SIZE;
        aTop  = chosen.top  - ARROW_SIZE;
        _arrowEl.setAttribute('style',
          'position:fixed!important;z-index:2147483644!important;pointer-events:none!important;' +
          'left:' + aLeft + 'px!important;top:' + aTop + 'px!important;' +
          'border-left:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-right:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-bottom:' + ARROW_SIZE + 'px solid ' + CFG.bg + '!important;' +
          'width:0!important;height:0!important;opacity:0!important;transition:opacity 0.18s ease!important;'
        );
      } else if (chosen.placement === 'right') {
        aLeft = chosen.left - ARROW_SIZE;
        aTop  = chosen.top + tipH / 2 - ARROW_SIZE;
        _arrowEl.setAttribute('style',
          'position:fixed!important;z-index:2147483644!important;pointer-events:none!important;' +
          'left:' + aLeft + 'px!important;top:' + aTop + 'px!important;' +
          'border-top:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-bottom:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-right:' + ARROW_SIZE + 'px solid ' + CFG.bg + '!important;' +
          'width:0!important;height:0!important;opacity:0!important;transition:opacity 0.18s ease!important;'
        );
      } else {
        aLeft = chosen.left + tipW;
        aTop  = chosen.top + tipH / 2 - ARROW_SIZE;
        _arrowEl.setAttribute('style',
          'position:fixed!important;z-index:2147483644!important;pointer-events:none!important;' +
          'left:' + aLeft + 'px!important;top:' + aTop + 'px!important;' +
          'border-top:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-bottom:' + ARROW_SIZE + 'px solid transparent!important;' +
          'border-left:' + ARROW_SIZE + 'px solid ' + CFG.bg + '!important;' +
          'width:0!important;height:0!important;opacity:0!important;transition:opacity 0.18s ease!important;'
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. SHOW / HIDE
  // ─────────────────────────────────────────────────────────────────

  function showTip(text, target) {
    clearTimeout(_showTimer);
    _showTimer = setTimeout(function () {
      _tip.textContent = text;
      _tip.classList.remove('anavo-tt-show');

      // Briefly make visible off-screen to measure
      _tip.style.setProperty('visibility', 'hidden', 'important');
      _tip.style.setProperty('opacity', '0', 'important');
      _tip.style.setProperty('left', '-9999px', 'important');
      _tip.style.setProperty('top',  '-9999px', 'important');

      requestAnimationFrame(function () {
        var rect = target.getBoundingClientRect();
        positionTip(rect);
        _tip.style.removeProperty('visibility');
        _tip.classList.add('anavo-tt-show');
        if (_arrowEl) _arrowEl.classList.add('anavo-tt-show');
      });
    }, CFG.delay);
  }

  function hideTip() {
    clearTimeout(_showTimer);
    _tip.classList.remove('anavo-tt-show');
    if (_arrowEl) _arrowEl.classList.remove('anavo-tt-show');
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. ATTACH TO ELEMENTS
  // ─────────────────────────────────────────────────────────────────

  function attachTooltip(el) {
    if (el.getAttribute('data-anavo-tt-done') === 'true') return;
    el.setAttribute('data-anavo-tt-done', 'true');

    // Prefer data-anavo-tooltip over title
    var isTitle = !el.hasAttribute('data-anavo-tooltip') && el.hasAttribute('title');
    var text = el.getAttribute('data-anavo-tooltip') || el.getAttribute('title') || '';
    if (!text) return;

    // Strip title on hover to prevent browser native tooltip
    if (isTitle) {
      el.addEventListener('mouseenter', function () {
        el.setAttribute('data-anavo-title-bak', el.getAttribute('title'));
        el.removeAttribute('title');
        showTip(text, el);
      });
      el.addEventListener('mouseleave', function () {
        var bak = el.getAttribute('data-anavo-title-bak');
        if (bak) el.setAttribute('title', bak);
        hideTip();
      });
    } else {
      el.addEventListener('mouseenter', function () { showTip(text, el); });
      el.addEventListener('mouseleave', hideTip);
    }

    el.addEventListener('focus',   function () { showTip(text, el); });
    el.addEventListener('blur',    hideTip);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideTip();
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. INIT WITH DOM POLLING
  // ─────────────────────────────────────────────────────────────────

  var _attempts = 0;

  function init() {
    if (!document.body) {
      if (++_attempts < 50) { setTimeout(init, 100); }
      return;
    }

    var elements = document.querySelectorAll(CFG.selector);
    if (!elements.length) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] No elements matching "' + CFG.selector + '".');
      return;
    }

    injectStyles();
    createTip();
    checkLicense();

    elements.forEach(function (el) { attachTooltip(el); });

    // Handle dynamically added elements via MutationObserver
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          var newEls = node.querySelectorAll
            ? node.querySelectorAll(CFG.selector)
            : [];
          newEls.forEach(function (el) { attachTooltip(el); });
          if (node.matches && node.matches(CFG.selector)) attachTooltip(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
