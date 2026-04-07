/**
 * ============================================================
 * PRICING TABLE — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Transforms [data-anavo-pricing] container with child
 *   [data-anavo-plan] elements into a styled pricing table.
 *   Each plan has: data-name, data-price, data-period,
 *   data-features (pipe-separated), data-highlight (boolean),
 *   data-cta (button text), data-link.
 *
 * USAGE:
 *   <div data-anavo-pricing>
 *     <div data-anavo-plan
 *          data-name="Starter" data-price="$9" data-period="/mo"
 *          data-features="5 pages|SSL|Support" data-cta="Get Started"
 *          data-link="/checkout?plan=starter"></div>
 *     <div data-anavo-plan data-highlight="true"
 *          data-name="Pro" data-price="$29" data-period="/mo"
 *          data-features="Unlimited pages|SSL|Priority support|Analytics"
 *          data-cta="Start Free Trial" data-link="/checkout?plan=pro"></div>
 *   </div>
 *
 * PARAMETERS:
 *   selector        container selector          default: [data-anavo-pricing]
 *   accentColor     accent colour               default: #00d4ff
 *   bgColor         card background             default: #ffffff
 *   highlightBg     highlighted card bg         default: #07070d
 *   highlightColor  highlighted card text       default: #ffffff
 *   borderRadius    card border radius          default: 12px
 *   domain          license check hostname
 *   supabaseUrl     Supabase project URL
 *   supabaseKey     Supabase anon key
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'PricingTable';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="pricing-table"]');
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
    domain:         p('domain',         window.location.hostname),
    supabaseUrl:    p('supabaseUrl',    ''),
    supabaseKey:    p('supabaseKey',    ''),
    selector:       p('selector',       '[data-anavo-pricing]'),
    accentColor:    p('accentColor',    '#00d4ff'),
    bgColor:        p('bgColor',        '#ffffff'),
    highlightBg:    p('highlightBg',    '#07070d'),
    highlightColor: p('highlightColor', '#ffffff'),
    borderRadius:   p('borderRadius',   '12px')
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
    var nid = 'anavo-pt-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get PricingTable license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('anavo-pt-styles')) return;

    var css =
      '.anavo-pt-table{' +
        'display:flex!important;' +
        'flex-wrap:wrap!important;' +
        'gap:24px!important;' +
        'justify-content:center!important;' +
        'align-items:stretch!important;' +
        'padding:40px 20px!important;' +
        'font-family:system-ui,sans-serif!important;' +
      '}' +

      '.anavo-pt-card{' +
        'flex:1 1 260px!important;' +
        'max-width:320px!important;' +
        'background:' + CFG.bgColor + '!important;' +
        'border-radius:' + CFG.borderRadius + '!important;' +
        'padding:36px 28px!important;' +
        'display:flex!important;' +
        'flex-direction:column!important;' +
        'box-shadow:0 2px 24px rgba(0,0,0,0.08)!important;' +
        'border:2px solid transparent!important;' +
        'transition:transform 0.25s ease,box-shadow 0.25s ease,border-color 0.25s ease!important;' +
        'position:relative!important;' +
        'overflow:hidden!important;' +
      '}' +

      '.anavo-pt-card:hover{' +
        'transform:translateY(-4px)!important;' +
        'box-shadow:0 12px 40px rgba(0,0,0,0.16)!important;' +
        'border-color:' + CFG.accentColor + '!important;' +
      '}' +

      '.anavo-pt-card.anavo-pt-highlight{' +
        'background:' + CFG.highlightBg + '!important;' +
        'color:' + CFG.highlightColor + '!important;' +
        'border-color:' + CFG.accentColor + '!important;' +
        'transform:scale(1.04)!important;' +
        'box-shadow:0 8px 48px rgba(0,212,255,0.2)!important;' +
      '}' +

      '.anavo-pt-card.anavo-pt-highlight:hover{' +
        'transform:scale(1.04) translateY(-4px)!important;' +
      '}' +

      '.anavo-pt-badge{' +
        'position:absolute!important;' +
        'top:16px!important;' +
        'right:16px!important;' +
        'background:' + CFG.accentColor + '!important;' +
        'color:#000!important;' +
        'font-size:10px!important;' +
        'font-weight:800!important;' +
        'letter-spacing:0.1em!important;' +
        'text-transform:uppercase!important;' +
        'padding:4px 10px!important;' +
        'border-radius:20px!important;' +
      '}' +

      '.anavo-pt-name{' +
        'font-size:13px!important;' +
        'font-weight:700!important;' +
        'letter-spacing:0.12em!important;' +
        'text-transform:uppercase!important;' +
        'opacity:0.6!important;' +
        'margin-bottom:16px!important;' +
      '}' +

      '.anavo-pt-price-row{' +
        'display:flex!important;' +
        'align-items:baseline!important;' +
        'gap:4px!important;' +
        'margin-bottom:28px!important;' +
      '}' +

      '.anavo-pt-price{' +
        'font-size:48px!important;' +
        'font-weight:800!important;' +
        'line-height:1!important;' +
        'letter-spacing:-0.02em!important;' +
      '}' +

      '.anavo-pt-period{' +
        'font-size:14px!important;' +
        'opacity:0.55!important;' +
      '}' +

      '.anavo-pt-divider{' +
        'width:100%!important;' +
        'height:1px!important;' +
        'background:rgba(128,128,128,0.2)!important;' +
        'margin:0 0 24px!important;' +
      '}' +

      '.anavo-pt-features{' +
        'list-style:none!important;' +
        'padding:0!important;' +
        'margin:0 0 32px!important;' +
        'flex:1!important;' +
        'display:flex!important;' +
        'flex-direction:column!important;' +
        'gap:10px!important;' +
      '}' +

      '.anavo-pt-feature{' +
        'font-size:14px!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'gap:10px!important;' +
      '}' +

      '.anavo-pt-check{' +
        'width:18px!important;' +
        'height:18px!important;' +
        'flex-shrink:0!important;' +
        'border-radius:50%!important;' +
        'background:' + CFG.accentColor + '22!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'justify-content:center!important;' +
        'color:' + CFG.accentColor + '!important;' +
        'font-size:11px!important;' +
        'font-weight:700!important;' +
      '}' +

      '.anavo-pt-cta{' +
        'display:block!important;' +
        'text-align:center!important;' +
        'padding:14px 24px!important;' +
        'border-radius:8px!important;' +
        'font-size:14px!important;' +
        'font-weight:700!important;' +
        'letter-spacing:0.04em!important;' +
        'text-decoration:none!important;' +
        'transition:opacity 0.2s ease,transform 0.2s ease!important;' +
        'background:' + CFG.accentColor + '!important;' +
        'color:#000!important;' +
        'cursor:pointer!important;' +
        'border:none!important;' +
      '}' +

      '.anavo-pt-cta:hover{' +
        'opacity:0.85!important;' +
        'transform:translateY(-1px)!important;' +
      '}' +

      '.anavo-pt-highlight .anavo-pt-cta{' +
        'background:#fff!important;' +
        'color:#000!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-pt-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. BUILD PRICING TABLE
  // ─────────────────────────────────────────────────────────────────

  function buildTable(container) {
    if (container.getAttribute('data-anavo-pt-done') === 'true') return;
    container.setAttribute('data-anavo-pt-done', 'true');

    var planEls = container.querySelectorAll('[data-anavo-plan]');
    if (!planEls.length) return;

    var table = document.createElement('div');
    table.className = 'anavo-pt-table';
    table.setAttribute('role', 'list');

    planEls.forEach(function (planEl) {
      var name      = planEl.getAttribute('data-name')     || 'Plan';
      var price     = planEl.getAttribute('data-price')    || '';
      var period    = planEl.getAttribute('data-period')   || '';
      var featStr   = planEl.getAttribute('data-features') || '';
      var highlight = planEl.getAttribute('data-highlight') === 'true';
      var cta       = planEl.getAttribute('data-cta')      || 'Get Started';
      var link      = planEl.getAttribute('data-link')     || '#';
      var features  = featStr ? featStr.split('|').map(function (f) { return f.trim(); }) : [];

      var card = document.createElement('div');
      card.className = 'anavo-pt-card' + (highlight ? ' anavo-pt-highlight' : '');
      card.setAttribute('role', 'listitem');

      if (highlight) {
        var badge = document.createElement('div');
        badge.className = 'anavo-pt-badge';
        badge.textContent = 'Popular';
        card.appendChild(badge);
      }

      // Name
      var nameEl = document.createElement('div');
      nameEl.className = 'anavo-pt-name';
      nameEl.textContent = name;
      card.appendChild(nameEl);

      // Price row
      var priceRow = document.createElement('div');
      priceRow.className = 'anavo-pt-price-row';
      var priceEl = document.createElement('span');
      priceEl.className = 'anavo-pt-price';
      priceEl.textContent = price;
      var periodEl = document.createElement('span');
      periodEl.className = 'anavo-pt-period';
      periodEl.textContent = period;
      priceRow.appendChild(priceEl);
      priceRow.appendChild(periodEl);
      card.appendChild(priceRow);

      // Divider
      var divider = document.createElement('div');
      divider.className = 'anavo-pt-divider';
      card.appendChild(divider);

      // Features
      var featureList = document.createElement('ul');
      featureList.className = 'anavo-pt-features';
      features.forEach(function (feat) {
        var li = document.createElement('li');
        li.className = 'anavo-pt-feature';
        var check = document.createElement('span');
        check.className = 'anavo-pt-check';
        check.textContent = '\u2713';
        li.appendChild(check);
        var text = document.createElement('span');
        text.textContent = feat;
        li.appendChild(text);
        featureList.appendChild(li);
      });
      card.appendChild(featureList);

      // CTA
      var ctaEl = document.createElement('a');
      ctaEl.className = 'anavo-pt-cta';
      ctaEl.href = link;
      ctaEl.textContent = cta;
      card.appendChild(ctaEl);

      table.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(table);
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
    containers.forEach(function (c) { buildTable(c); });
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
