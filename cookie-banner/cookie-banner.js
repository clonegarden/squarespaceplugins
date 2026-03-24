/**
 * Anavo Cookie Consent Banner v1.0.0
 * GDPR / LGPD compliant consent bar for Squarespace.
 * Self-injects into page — no target element needed.
 *
 * Usage (Squarespace Footer Code):
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/cookie-banner/cookie-banner.min.js
 *   ?message=We%20use%20cookies%20to%20improve%20your%20experience.
 *   &privacyUrl=%2Fprivacy-policy
 *   &position=bottom
 *   &accentColor=%23003366
 * "></script>
 */
;(function () {
  'use strict';

  if (window.AnavoPluginState && window.AnavoPluginState.plugins['CookieBanner']) return;

  // ─── Config ──────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="cookie-banner"]');
    return s[s.length - 1];
  })();

  var params = (scriptEl && scriptEl.src) ? new URL(scriptEl.src).searchParams : new URLSearchParams();

  var CFG = {
    message:      params.get('message')      || 'We use cookies to improve your experience on our site.',
    acceptText:   params.get('acceptText')   || 'Accept',
    declineText:  params.get('declineText')  || '',             // empty = no decline button
    privacyUrl:   params.get('privacyUrl')   || '',
    privacyText:  params.get('privacyText')  || 'Privacy Policy',
    position:     params.get('position')     || 'bottom',       // top | bottom
    bgColor:      params.get('bgColor')      || '#1a1a2e',
    textColor:    params.get('textColor')    || '#ffffff',
    accentColor:  params.get('accentColor')  || '#4f8ef7',
    expiryDays:   parseInt(params.get('expiryDays') || '365', 10),
    blockGA:      params.get('blockGA')      === 'true',
    storageKey:   params.get('storageKey')   || 'anavo_cookie_consent',
    domain:       params.get('domain')       || window.location.hostname,
    apiBase:      params.get('api')          || 'https://api.anavo.tech',
  };

  // ─── Storage helpers ──────────────────────────────────────────────────────────

  function getConsent() {
    try {
      var raw = localStorage.getItem(CFG.storageKey);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.expires && Date.now() > data.expires) { localStorage.removeItem(CFG.storageKey); return null; }
      return data.value; // 'accepted' | 'declined'
    } catch (e) { return null; }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CFG.storageKey, JSON.stringify({
        value: value,
        expires: Date.now() + (CFG.expiryDays * 86400000),
        domain: CFG.domain,
      }));
    } catch (e) {}
  }

  // ─── GA Blocking ─────────────────────────────────────────────────────────────

  function blockGoogleAnalytics() {
    if (!CFG.blockGA) return;
    // Override gtag/ga before they fire
    window['ga-disable-GA_MEASUREMENT_ID'] = true;
    if (!window.gtag) {
      window.gtag = function () { /* blocked */ };
    }
    if (!window.ga) {
      window.ga = function () { /* blocked */ };
    }
  }

  function unblockGoogleAnalytics() {
    // Remove overrides — GA will work on next page load
    delete window['ga-disable-GA_MEASUREMENT_ID'];
  }

  // ─── Styles ───────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById('anavo-cookie-banner-styles');
    if (ex) ex.remove();

    var isBottom = CFG.position !== 'top';

    var css = [
      '.anavo-cookie-bar{',
        'position:fixed !important;',
        (isBottom ? 'bottom:0 !important;' : 'top:0 !important;'),
        'left:0 !important;',
        'right:0 !important;',
        'z-index:99999 !important;',
        'background:' + CFG.bgColor + ' !important;',
        'color:' + CFG.textColor + ' !important;',
        'padding:14px 20px !important;',
        'display:flex !important;',
        'align-items:center !important;',
        'justify-content:space-between !important;',
        'gap:16px !important;',
        'flex-wrap:wrap !important;',
        'font-family:inherit !important;',
        'font-size:14px !important;',
        'line-height:1.5 !important;',
        'box-shadow:0 ' + (isBottom ? '-2px' : '2px') + ' 12px rgba(0,0,0,.3) !important;',
        'transform:translateY(' + (isBottom ? '100%' : '-100%') + ') !important;',
        'transition:transform .35s ease !important;',
      '}',
      '.anavo-cookie-bar.anavo-cookie-visible{transform:translateY(0) !important}',
      '.anavo-cookie-text{flex:1 !important;min-width:200px !important}',
      '.anavo-cookie-link{color:' + CFG.accentColor + ' !important;text-decoration:underline !important;margin-left:6px !important}',
      '.anavo-cookie-actions{display:flex !important;gap:10px !important;flex-shrink:0 !important}',
      '.anavo-cookie-accept,.anavo-cookie-decline{',
        'padding:8px 20px !important;',
        'border:none !important;',
        'border-radius:4px !important;',
        'font-size:14px !important;',
        'font-weight:600 !important;',
        'cursor:pointer !important;',
        'font-family:inherit !important;',
        'transition:opacity .15s !important;',
        'white-space:nowrap !important;',
      '}',
      '.anavo-cookie-accept{background:' + CFG.accentColor + ' !important;color:#fff !important}',
      '.anavo-cookie-accept:hover{opacity:.88 !important}',
      '.anavo-cookie-decline{background:transparent !important;color:' + CFG.textColor + ' !important;border:1px solid ' + CFG.textColor + '55 !important}',
      '.anavo-cookie-decline:hover{opacity:.75 !important}',
      '@media(max-width:480px){',
        '.anavo-cookie-bar{padding:12px 16px !important}',
        '.anavo-cookie-actions{width:100% !important}',
        '.anavo-cookie-accept,.anavo-cookie-decline{flex:1 !important;text-align:center !important}',
      '}',
    ].join('');

    var el = document.createElement('style');
    el.id = 'anavo-cookie-banner-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ─── Build Banner ─────────────────────────────────────────────────────────────

  function buildBanner() {
    var bar = document.createElement('div');
    bar.className = 'anavo-cookie-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');

    var privacyLink = CFG.privacyUrl
      ? ' <a class="anavo-cookie-link" href="' + CFG.privacyUrl + '">' + CFG.privacyText + '</a>'
      : '';

    var declineBtn = CFG.declineText
      ? '<button class="anavo-cookie-decline" id="anavo-cookie-decline">' + CFG.declineText + '</button>'
      : '';

    bar.innerHTML =
      '<div class="anavo-cookie-text">' + CFG.message + privacyLink + '</div>' +
      '<div class="anavo-cookie-actions">' +
        declineBtn +
        '<button class="anavo-cookie-accept" id="anavo-cookie-accept">' + CFG.acceptText + '</button>' +
      '</div>';

    document.body.appendChild(bar);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.classList.add('anavo-cookie-visible');
      });
    });

    // Accept
    bar.querySelector('#anavo-cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      unblockGoogleAnalytics();
      dismiss(bar);
    });

    // Decline (optional)
    var declineEl = bar.querySelector('#anavo-cookie-decline');
    if (declineEl) {
      declineEl.addEventListener('click', function () {
        setConsent('declined');
        dismiss(bar);
      });
    }
  }

  function dismiss(bar) {
    bar.style.transform = 'translateY(' + (CFG.position !== 'top' ? '100%' : '-100%') + ')';
    bar.style.transition = 'transform .3s ease';
    setTimeout(function () { bar.remove(); }, 350);
  }

  // ─── License (non-blocking) ───────────────────────────────────────────────────

  function checkLicense() {
    fetch(CFG.apiBase + '/api/licenses/check?domain=' + encodeURIComponent(CFG.domain) + '&plugin=cookie-banner')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.licensed) console.warn('[Anavo Cookie Banner] Unlicensed'); })
      .catch(function () {});
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    try {
      var consent = getConsent();
      if (consent === 'accepted') { unblockGoogleAnalytics(); return; }
      if (consent === 'declined') { blockGoogleAnalytics(); return; }

      // No consent stored — show banner
      if (CFG.blockGA) blockGoogleAnalytics();
      injectStyles();
      buildBanner();
      checkLicense();
    } catch (e) { /* silent */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  window.AnavoPluginState.plugins['CookieBanner'] = { version: '1.0.0', config: CFG };

})();
