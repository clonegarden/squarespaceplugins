/**
 * ============================================================
 * MAGIC MENU PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Fixed bottom navigation bar (mobile app dock style).
 *   A glowing circle indicator slides smoothly between items
 *   as the active item changes. The active item's icon lifts
 *   upward and a label appears below it. The indicator circle
 *   has concave curved shoulders (CSS box-shadow trick) making
 *   it look like the icon pops through the bar.
 *   Based on the codingstella Magic Navigation Menu pattern,
 *   adapted to use inline Feather Icons SVGs (zero external
 *   dependencies).
 *
 * USAGE:
 *   1. Add a Code Block anywhere on your Squarespace page:
 *        <div data-anavo-magic-menu></div>
 *
 *   2. Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/magic-menu/magic-menu.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &items=Home%7CAbout%7CWork%7CContact
 *          &icons=home%7Cuser%7Cimage%7Cmail
 *          &links=%2F%7C%2Fabout%7C%2Fwork%7C%2Fcontact
 *          &colors=%23f44336%7C%23ffa117%7C%230fc70f%7C%232196f3
 *        "></script>
 *
 * PARAMETERS (URL query string — encode # as %23, | as %7C):
 *   domain          license hostname                         default: location.hostname
 *   supabaseUrl     Supabase project URL
 *   supabaseKey     Supabase anon key
 *   items           pipe-separated item labels               default: Home|About|Work|Contact
 *   icons           pipe-separated icon names (from set)     default: home|user|image|mail
 *   links           pipe-separated URLs                      default: #|#|#|#
 *   colors          pipe-separated per-item colors           default: #f44336|#ffa117|#0fc70f|#2196f3
 *   activeIndex     initially active item (0-based)          default: 0
 *   barColor        navigation bar background color          default: #ffffff
 *   barShadow       bar box-shadow                           default: 0 -4px 20px rgba(0,0,0,0.08)
 *   barRadius       bar border-radius                        default: 16px
 *   itemSize        width per item px                        default: 70
 *   barHeight       bar height px                            default: 60
 *   iconSize        SVG icon size px                         default: 24
 *   showLabels      show text labels below icons             default: true
 *   labelColor      label text color                        default: #555
 *   zIndex          z-index for the bar                      default: 9999
 *   bottomOffset    distance from bottom of viewport px     default: 0
 *   target          CSS selector for mount point             default: [data-anavo-magic-menu]
 * ============================================================
 */
(function () {
  'use strict';

  var PLUGIN_ID      = 'MagicMenu';
  var PLUGIN_VERSION = '1.0.0';
  var BYPASS_DOMAINS = ['anavo.tech', 'www.anavo.tech', 'pluginstore.anavo.tech', 'clonegarden.github.io', 'localhost', '127.0.0.1'];

  /* ── Idempotency guard ─────────────────────────────────── */
  window.AnavoPluginState = window.AnavoPluginState || {};
  if (window.AnavoPluginState['MagicMenu']) { return; }
  window.AnavoPluginState['MagicMenu'] = true;

  /* ── Param parsing ──────────────────────────────────────── */
  var _src  = (document.currentScript && document.currentScript.src) || '';
  var _qIdx = _src.indexOf('?');
  var _qs   = _qIdx !== -1 ? _src.slice(_qIdx + 1) : '';

  function _param(key, def) {
    var m = _qs.match(new RegExp('(?:^|&)' + key + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : def;
  }

  function _boolParam(key, def) {
    var v = _param(key, null);
    if (v === null) { return def; }
    return v !== 'false' && v !== '0';
  }

  var CFG = {
    domain:       _param('domain',       location.hostname),
    supabaseUrl:  _param('supabaseUrl',  ''),
    supabaseKey:  _param('supabaseKey',  ''),
    items:        _param('items',        'Home|About|Work|Contact').split('|'),
    icons:        _param('icons',        'home|user|image|mail').split('|'),
    links:        _param('links',        '#|#|#|#').split('|'),
    colors:       _param('colors',       '#f44336|#ffa117|#0fc70f|#2196f3').split('|'),
    activeIndex:  parseInt(_param('activeIndex', '0'), 10),
    barColor:     _param('barColor',     '#ffffff'),
    barShadow:    _param('barShadow',    '0 -4px 20px rgba(0,0,0,0.08)'),
    barRadius:    _param('barRadius',    '16px'),
    itemSize:     parseInt(_param('itemSize',  '70'), 10),
    barHeight:    parseInt(_param('barHeight', '60'), 10),
    iconSize:     parseInt(_param('iconSize',  '24'), 10),
    showLabels:   _boolParam('showLabels', true),
    labelColor:   _param('labelColor',   '#555'),
    zIndex:       parseInt(_param('zIndex',       '9999'), 10),
    bottomOffset: parseInt(_param('bottomOffset', '0'), 10),
    target:       _param('target',       '[data-anavo-magic-menu]'),
  };

  /* ── Feather Icons SVG path map (MIT license) ────────────── */
  var ICONS = {
    home:     '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    user:     '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    mail:     '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    grid:     '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    camera:   '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
    image:    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    star:     '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    heart:    '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
    phone:    '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72 12.05 12.05 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45 12.05 12.05 0 002.81.7A2 2 0 0122 16.92z"/>',
    bag:      '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
    map:      '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    info:     '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    search:   '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  };

  /* ── License check ──────────────────────────────────────── */
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
    n.style.cssText = 'position:fixed!important;bottom:12px!important;left:12px!important;z-index:99999!important;background:#111!important;color:#fff!important;font-size:11px!important;padding:6px 10px!important;border-radius:4px!important;font-family:monospace!important;opacity:0.85!important;pointer-events:none!important;';
    n.textContent = 'Anavo Plugin: ' + PLUGIN_ID + ' — unlicensed. Visit anavo.tech/plugins';
    document.body.appendChild(n);
  }

  /* ── Icon renderer ──────────────────────────────────────── */
  function _renderIcon(name) {
    var paths = ICONS[name] || '<circle cx="12" cy="12" r="3"/>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
         + 'stroke-linecap="round" stroke-linejoin="round" '
         + 'width="' + CFG.iconSize + '" height="' + CFG.iconSize + '">'
         + paths + '</svg>';
  }

  /* ── CSS injection ──────────────────────────────────────── */
  function _injectStyles() {
    var barBg   = CFG.barColor;
    var itemW   = CFG.itemSize;
    var barH    = CFG.barHeight;
    var icoSize = CFG.iconSize;
    /* indicator dimensions: 70px circle, top offset so it sits above bar */
    var indSize = 70;
    var indTop  = -35;

    var css = [
      /* ── nav container ── */
      '.anavo-mm-nav {',
      '  position: fixed !important;',
      '  bottom: ' + CFG.bottomOffset + 'px !important;',
      '  left: 50% !important;',
      '  transform: translateX(-50%) !important;',
      '  z-index: ' + CFG.zIndex + ' !important;',
      '  display: block !important;',
      '}',

      /* ── list ── */
      '.anavo-mm-list {',
      '  display: flex !important;',
      '  position: relative !important;',
      '  list-style: none !important;',
      '  margin: 0 !important;',
      '  padding: 0 !important;',
      '  height: ' + barH + 'px !important;',
      '  background: ' + barBg + ' !important;',
      '  border-radius: ' + CFG.barRadius + ' !important;',
      '  box-shadow: ' + CFG.barShadow + ' !important;',
      '  overflow: visible !important;',
      '}',

      /* ── item ── */
      '.anavo-mm-item {',
      '  position: relative !important;',
      '  width: ' + itemW + 'px !important;',
      '  flex-shrink: 0 !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  z-index: 1 !important;',
      '}',

      /* ── link ── */
      '.anavo-mm-link {',
      '  display: flex !important;',
      '  flex-direction: column !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  text-decoration: none !important;',
      '  gap: 2px !important;',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '  cursor: pointer !important;',
      '  -webkit-tap-highlight-color: transparent !important;',
      '}',

      /* ── icon wrapper ── */
      '.anavo-mm-icon {',
      '  position: relative !important;',
      '  display: flex !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  width: ' + (icoSize + 20) + 'px !important;',
      '  height: ' + (icoSize + 20) + 'px !important;',
      '  border-radius: 50% !important;',
      '  color: ' + CFG.labelColor + ' !important;',
      '  background: transparent !important;',
      '  transition: transform 0.5s cubic-bezier(0.23,1,0.32,1), background 0.5s, color 0.3s !important;',
      '  transform: translateY(0) !important;',
      '}',

      /* glow pseudo-element behind icon */
      '.anavo-mm-icon::before {',
      '  content: "" !important;',
      '  position: absolute !important;',
      '  top: 50% !important;',
      '  left: 50% !important;',
      '  transform: translate(-50%, -50%) !important;',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '  border-radius: 50% !important;',
      '  background: var(--item-color, #29fd53) !important;',
      '  filter: blur(10px) !important;',
      '  opacity: 0 !important;',
      '  transition: opacity 0.5s !important;',
      '  z-index: -1 !important;',
      '}',

      /* ── active icon state ── */
      '.anavo-mm-item.anavo-mm-active .anavo-mm-icon {',
      '  background: var(--item-color, #29fd53) !important;',
      '  color: #fff !important;',
      '  transform: translateY(-27px) !important;',
      '}',

      '.anavo-mm-item.anavo-mm-active .anavo-mm-icon::before {',
      '  opacity: 0.5 !important;',
      '}',

      /* ── label ── */
      '.anavo-mm-label {',
      '  font-size: 10px !important;',
      '  font-family: inherit !important;',
      '  font-weight: 500 !important;',
      '  color: ' + CFG.labelColor + ' !important;',
      '  letter-spacing: 0.02em !important;',
      '  opacity: 0 !important;',
      '  transform: translateY(4px) !important;',
      '  transition: opacity 0.4s, transform 0.4s !important;',
      '  white-space: nowrap !important;',
      '  pointer-events: none !important;',
      '  line-height: 1 !important;',
      '}',

      /* active label */
      '.anavo-mm-item.anavo-mm-active .anavo-mm-label {',
      '  opacity: 1 !important;',
      '  transform: translateY(0) !important;',
      '}',

      /* ── indicator circle ── */
      '.anavo-mm-indicator {',
      '  position: absolute !important;',
      '  top: ' + indTop + 'px !important;',
      '  width: ' + indSize + 'px !important;',
      '  height: ' + indSize + 'px !important;',
      '  background: ' + barBg + ' !important;',
      '  border-radius: 50% !important;',
      '  border: 6px solid ' + barBg + ' !important;',
      '  transition: transform 0.5s cubic-bezier(0.23,1,0.32,1) !important;',
      '  left: ' + Math.round((itemW - indSize) / 2) + 'px !important;',
      '  pointer-events: none !important;',
      '  z-index: 0 !important;',
      '}',

      /* concave left shoulder */
      '.anavo-mm-indicator::before {',
      '  content: "" !important;',
      '  position: absolute !important;',
      '  top: 50% !important;',
      '  left: -22px !important;',
      '  width: 20px !important;',
      '  height: 20px !important;',
      '  background: transparent !important;',
      '  border-top-right-radius: 20px !important;',
      '  box-shadow: 1px -10px 0 0 ' + barBg + ' !important;',
      '}',

      /* concave right shoulder */
      '.anavo-mm-indicator::after {',
      '  content: "" !important;',
      '  position: absolute !important;',
      '  top: 50% !important;',
      '  right: -22px !important;',
      '  width: 20px !important;',
      '  height: 20px !important;',
      '  background: transparent !important;',
      '  border-top-left-radius: 20px !important;',
      '  box-shadow: -1px -10px 0 0 ' + barBg + ' !important;',
      '}',
    ].join('\n');

    var style = document.createElement('style');
    style.id  = 'anavo-mm-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ── DOM builder ────────────────────────────────────────── */
  function _buildNav() {
    var count    = CFG.items.length;
    var totalW   = CFG.itemSize * count;
    var activeIdx = Math.min(Math.max(CFG.activeIndex, 0), count - 1);

    /* nav */
    var nav = document.createElement('nav');
    nav.className    = 'anavo-mm-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    /* ul */
    var ul = document.createElement('ul');
    ul.className   = 'anavo-mm-list';
    ul.style.cssText = 'width:' + totalW + 'px!important;';

    /* items */
    var liItems = [];

    for (var i = 0; i < count; i++) {
      var label = CFG.items[i]  || '';
      var icon  = CFG.icons[i]  || 'home';
      var link  = CFG.links[i]  || '#';
      var color = CFG.colors[i] || '#29fd53';

      var li = document.createElement('li');
      li.className = 'anavo-mm-item' + (i === activeIdx ? ' anavo-mm-active' : '');
      li.style.cssText = '--item-color:' + color + ';';

      var a = document.createElement('a');
      a.className = 'anavo-mm-link';
      a.href      = link;
      a.setAttribute('aria-label', label);

      var iconSpan = document.createElement('span');
      iconSpan.className   = 'anavo-mm-icon';
      iconSpan.innerHTML   = _renderIcon(icon);

      a.appendChild(iconSpan);

      if (CFG.showLabels) {
        var labelSpan = document.createElement('span');
        labelSpan.className   = 'anavo-mm-label';
        labelSpan.textContent = label;
        a.appendChild(labelSpan);
      }

      li.appendChild(a);
      ul.appendChild(li);
      liItems.push(li);
    }

    /* indicator */
    var indicator = document.createElement('div');
    indicator.className = 'anavo-mm-indicator';
    /* initial position */
    indicator.style.transform = 'translateX(' + (activeIdx * CFG.itemSize) + 'px)';
    ul.appendChild(indicator);

    nav.appendChild(ul);

    /* ── click handling ── */
    liItems.forEach(function (li, idx) {
      li.querySelector('.anavo-mm-link').addEventListener('click', function (e) {
        var href = CFG.links[idx] || '#';

        /* remove active from all */
        liItems.forEach(function (el) {
          el.classList.remove('anavo-mm-active');
        });

        /* activate this item */
        li.classList.add('anavo-mm-active');

        /* slide indicator */
        indicator.style.transform = 'translateX(' + (idx * CFG.itemSize) + 'px)';

        /* navigation: only prevent default if it's a hash link
           (let real links navigate naturally) */
        if (href === '#') {
          e.preventDefault();
        }
      });
    });

    return nav;
  }

  /* ── Mount ──────────────────────────────────────────────── */
  function _mount() {
    /* target just signals "this page should have the menu"
       the nav is appended directly to body */
    var target = document.querySelector(CFG.target);
    if (!target) { return; }

    _injectStyles();
    var nav = _buildNav();
    document.body.appendChild(nav);
  }

  /* ── Poll for target ────────────────────────────────────── */
  var _polls = 0;
  var _maxPolls = 50;
  var _pollInterval = 100;

  function _poll() {
    if (document.querySelector(CFG.target)) {
      _mount();
      return;
    }
    _polls++;
    if (_polls < _maxPolls) {
      setTimeout(_poll, _pollInterval);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _poll);
  } else {
    _poll();
  }

}());
