/**
 * Anavo WhatsApp CTA Button v1.0.0
 * Floating action button for WhatsApp, phone, booking, or any URL.
 * Self-injects into page — no target element needed.
 *
 * Usage (Squarespace Footer Code):
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/whatsapp-cta/whatsapp-cta.min.js
 *   ?type=whatsapp
 *   &phone=15551234567
 *   &message=Hello%2C%20I%27d%20like%20more%20info
 *   &color=%2325D366
 *   &position=bottom-right
 * "></script>
 *
 * Types: whatsapp | phone | calendar | email | custom
 */
;(function () {
  'use strict';

  if (window.AnavoPluginState && window.AnavoPluginState.plugins['WhatsAppCTA']) return;

  // ─── Config ──────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="whatsapp-cta"]');
    return s[s.length - 1];
  })();

  var params = (scriptEl && scriptEl.src) ? new URL(scriptEl.src).searchParams : new URLSearchParams();

  var TYPE = params.get('type') || 'whatsapp';

  // Build URL based on type
  function buildUrl() {
    switch (TYPE) {
      case 'whatsapp': {
        var phone = (params.get('phone') || '').replace(/\D/g, '');
        var msg   = params.get('message') || '';
        return 'https://wa.me/' + phone + (msg ? '?text=' + encodeURIComponent(msg) : '');
      }
      case 'phone':
        return 'tel:' + (params.get('phone') || '');
      case 'email':
        return 'mailto:' + (params.get('email') || '');
      case 'calendar':
      case 'custom':
      default:
        return params.get('url') || '#';
    }
  }

  var DEFAULT_COLORS = { whatsapp: '#25D366', phone: '#4CAF50', calendar: '#1a3a5c', email: '#EA4335', custom: '#1a3a5c' };

  var CFG = {
    url:        buildUrl(),
    type:       TYPE,
    color:      params.get('color')      || DEFAULT_COLORS[TYPE] || '#25D366',
    position:   params.get('position')   || 'bottom-right',    // bottom-right | bottom-left
    label:      params.get('label')      || '',                 // optional tooltip label
    size:       parseInt(params.get('size') || '56', 10),
    pulse:      params.get('pulse')      !== 'false',
    mobileOnly: params.get('mobileOnly') === 'true',
    newTab:     params.get('newTab')     !== 'false',
    delay:      parseInt(params.get('delay') || '1000', 10),    // ms before appearing
    apiBase:    params.get('api')        || 'https://api.anavo.tech',
    domain:     params.get('domain')     || window.location.hostname,
  };

  // ─── Icons ───────────────────────────────────────────────────────────────────

  var ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    phone:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    email:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    custom:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
  };

  // ─── Styles ───────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById('anavo-whatsapp-cta-styles');
    if (ex) ex.remove();

    var size = CFG.size;
    var color = CFG.color;
    var isRight = CFG.position === 'bottom-right';
    var mq = CFG.mobileOnly ? '@media(min-width:801px){.anavo-cta-btn{display:none !important}}' : '';

    var css = [
      '@keyframes anavo-cta-pulse{0%,100%{box-shadow:0 0 0 0 ' + color + '55}50%{box-shadow:0 0 0 12px ' + color + '00}}',
      '.anavo-cta-btn{',
        'position:fixed !important;',
        'bottom:24px !important;',
        (isRight ? 'right:24px !important;' : 'left:24px !important;'),
        'width:' + size + 'px !important;',
        'height:' + size + 'px !important;',
        'border-radius:50% !important;',
        'background:' + color + ' !important;',
        'color:#fff !important;',
        'border:none !important;',
        'cursor:pointer !important;',
        'display:flex !important;',
        'align-items:center !important;',
        'justify-content:center !important;',
        'z-index:10000 !important;',
        'text-decoration:none !important;',
        'transition:transform .2s, opacity .3s !important;',
        'opacity:0 !important;',
        'box-shadow:0 4px 16px ' + color + '66 !important;',
      '}',
      '.anavo-cta-btn.anavo-cta-visible{opacity:1 !important}',
      '.anavo-cta-btn:hover{transform:scale(1.1) !important}',
      '.anavo-cta-btn svg{width:' + Math.round(size * 0.48) + 'px !important;height:' + Math.round(size * 0.48) + 'px !important}',
      CFG.pulse ? '.anavo-cta-btn{animation:anavo-cta-pulse 2s infinite !important}' : '',
      CFG.label ? [
        '.anavo-cta-label{',
          'position:absolute !important;',
          (isRight ? 'right:' + (size + 10) + 'px !important;' : 'left:' + (size + 10) + 'px !important;'),
          'background:rgba(0,0,0,.75) !important;',
          'color:#fff !important;',
          'font-size:13px !important;',
          'padding:5px 10px !important;',
          'border-radius:4px !important;',
          'white-space:nowrap !important;',
          'pointer-events:none !important;',
          'opacity:0 !important;',
          'transition:opacity .2s !important;',
        '}',
        '.anavo-cta-btn:hover .anavo-cta-label{opacity:1 !important}',
      ].join('') : '',
      mq,
    ].join('');

    var el = document.createElement('style');
    el.id = 'anavo-whatsapp-cta-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ─── Build Button ─────────────────────────────────────────────────────────────

  function buildButton() {
    var btn = document.createElement('a');
    btn.className = 'anavo-cta-btn';
    btn.href = CFG.url;
    if (CFG.newTab && !CFG.url.startsWith('tel:') && !CFG.url.startsWith('mailto:')) {
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
    }
    btn.setAttribute('aria-label', CFG.label || CFG.type);
    btn.innerHTML = (ICONS[CFG.type] || ICONS.custom) + (CFG.label ? '<span class="anavo-cta-label">' + CFG.label + '</span>' : '');
    document.body.appendChild(btn);

    setTimeout(function () { btn.classList.add('anavo-cta-visible'); }, CFG.delay);
  }

  // ─── License (non-blocking) ───────────────────────────────────────────────────

  function checkLicense() {
    fetch(CFG.apiBase + '/api/licenses/check?domain=' + encodeURIComponent(CFG.domain) + '&plugin=whatsapp-cta')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.licensed) console.warn('[Anavo WhatsApp CTA] Unlicensed'); })
      .catch(function () {});
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    try {
      injectStyles();
      buildButton();
      checkLicense();
    } catch (e) { /* silent */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  window.AnavoPluginState.plugins['WhatsAppCTA'] = { version: '1.0.0', config: CFG };

})();
