/**
 * ============================================================
 * SCROLL LOOP MENU PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Full-screen overlay menu that loops infinitely when
 *   scrolled. Items are right-aligned, large typography.
 *   Hover: item slides right, turns italic, shows accent line.
 *   On mobile: normal scroll, no loop.
 *   Inspired by Codrops / ScrollLoopMenu. Zero dependencies.
 *
 * USAGE:
 *   1. Add a Code Block anywhere on your Squarespace page:
 *        <div data-anavo-scroll-loop-menu></div>
 *
 *   2. To open the menu, add this attribute to any element
 *      (button, link, nav item):
 *        data-anavo-slm-trigger
 *
 *      OR the plugin can render its own trigger button
 *      (set showTrigger=true in params).
 *
 *   3. Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/scroll-loop-menu/scroll-loop-menu.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &items=Photography|Weddings|Editorial|About|Contact
 *          &links=%2Fphotography|%2Fweddings|%2Feditorial|%2Fabout|%2Fcontact
 *          &bgColor=%23111111
 *          &textColor=%23f0ede8
 *          &hoverColor=%23c0092b
 *        "></script>
 *
 * PARAMETERS (URL query string):
 *   domain           your site domain (license check)
 *   supabaseUrl      Supabase project URL
 *   supabaseKey      Supabase anon key
 *   items            pipe-separated menu item labels
 *   links            pipe-separated URLs (matches items order)
 *   bgColor          overlay background          default: #111111
 *   textColor        item text color             default: #f0ede8
 *   hoverColor       item hover color            default: #c0092b
 *   fontSize         item font size              default: 9.5vh
 *   fontFamily       font family                 default: inherit
 *   fontWeight       font weight                 default: 300
 *   itemOffset       right margin offset         default: 25vw
 *   transitionMs     overlay fade duration (ms)  default: 600
 *   showTrigger      render built-in open btn    default: false
 *   triggerLabel     built-in button label       default: Menu
 *   triggerPosition  top-right|top-left|         default: top-right
 *                    bottom-right|bottom-left
 *   triggerColor     built-in button text color  default: #111111
 *   triggerSelector  CSS selector for custom     default: [data-anavo-slm-trigger]
 *                    open trigger element(s)
 *   target           mount point selector        default: [data-anavo-scroll-loop-menu]
 * ============================================================
 */
(function () {
  'use strict';

  var PLUGIN_ID      = 'ScrollLoopMenu';
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
    domain:          _param('domain',          location.hostname),
    supabaseUrl:     _param('supabaseUrl',     ''),
    supabaseKey:     _param('supabaseKey',     ''),
    items:           _param('items',           'Photography|Weddings|Editorial|About|Contact'),
    links:           _param('links',           ''),
    bgColor:         _param('bgColor',         '#111111'),
    textColor:       _param('textColor',       '#f0ede8'),
    hoverColor:      _param('hoverColor',      '#c0092b'),
    fontSize:        _param('fontSize',        '9.5vh'),
    fontFamily:      _param('fontFamily',      'inherit'),
    fontWeight:      _param('fontWeight',      '300'),
    itemOffset:      _param('itemOffset',      '25vw'),
    transitionMs:    _param('transitionMs',    '600'),
    showTrigger:     _param('showTrigger',     'false'),
    triggerLabel:    _param('triggerLabel',    'Menu'),
    triggerPosition: _param('triggerPosition', 'top-right'),
    triggerColor:    _param('triggerColor',    '#111111'),
    triggerSelector: _param('triggerSelector', '[data-anavo-slm-trigger]'),
    target:          _param('target',          '[data-anavo-scroll-loop-menu]'),
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
    n.style.cssText = [
      'position:fixed', 'bottom:12px', 'left:12px', 'z-index:99999',
      'background:#111', 'color:#fff', 'font-size:11px',
      'padding:6px 10px', 'border-radius:4px',
      'font-family:monospace', 'opacity:0.85', 'pointer-events:none'
    ].join(';');
    n.textContent = 'Anavo Plugin: ' + PLUGIN_ID + ' — unlicensed. Visit anavo.tech/plugins';
    document.body.appendChild(n);
  }

  /* ── State ──────────────────────────────────────────────── */
  var _overlay     = null;
  var _navEl       = null;
  var _rafId       = null;
  var _isOpen      = false;
  var _itemEls     = [];
  var _clonesHeight = 0;
  var _scrollHeight = 0;

  /* ── Styles ─────────────────────────────────────────────── */
  function _injectStyles() {
    if (document.getElementById('anavo-slm-styles')) return;

    var tp = CFG.triggerPosition;
    var tPos = '';
    if (tp === 'top-right')     tPos = 'top:1.5rem;right:2rem;';
    else if (tp === 'top-left') tPos = 'top:1.5rem;left:2rem;';
    else if (tp === 'bottom-right') tPos = 'bottom:1.5rem;right:2rem;';
    else if (tp === 'bottom-left')  tPos = 'bottom:1.5rem;left:2rem;';

    var css = [
      /* overlay */
      '.anavo-slm-overlay{',
      '  position:fixed!important;top:0!important;left:0!important;',
      '  width:100vw!important;height:100vh!important;',
      '  z-index:10000!important;',
      '  background:' + CFG.bgColor + '!important;',
      '  opacity:0!important;pointer-events:none!important;',
      '  transition:opacity ' + CFG.transitionMs + 'ms ease!important;',
      '  overflow:hidden!important;',
      '}',
      '.anavo-slm-overlay.anavo-slm-visible{',
      '  opacity:1!important;pointer-events:auto!important;',
      '}',

      /* close button */
      '.anavo-slm-close{',
      '  position:absolute!important;top:2rem!important;right:2.5rem!important;',
      '  z-index:10001!important;background:none!important;border:none!important;',
      '  cursor:pointer!important;color:' + CFG.textColor + '!important;',
      '  font-size:1.6rem!important;font-family:' + CFG.fontFamily + '!important;',
      '  opacity:0.55!important;transition:opacity 0.2s!important;',
      '  padding:0!important;line-height:1!important;',
      '}',
      '.anavo-slm-close:hover{opacity:1!important;}',

      /* nav */
      '.anavo-slm-nav{',
      '  width:100vw!important;height:100vh!important;',
      '  overflow:auto!important;-webkit-overflow-scrolling:touch!important;',
      '  scrollbar-width:none!important;',
      '  display:flex!important;flex-direction:column!important;',
      '  align-items:flex-end!important;text-align:right!important;',
      '  -webkit-user-select:none!important;user-select:none!important;',
      '}',
      '.anavo-slm-nav::-webkit-scrollbar{display:none!important;}',

      /* item */
      '.anavo-slm-item{flex:none!important;margin-right:' + CFG.itemOffset + '!important;padding:0!important;}',

      /* inner */
      '.anavo-slm-item-inner{',
      '  white-space:nowrap!important;position:relative!important;',
      '  cursor:pointer!important;',
      '  font-size:' + CFG.fontSize + '!important;',
      '  font-family:' + CFG.fontFamily + '!important;',
      '  font-weight:' + CFG.fontWeight + '!important;',
      '  padding:1vh 0!important;display:block!important;',
      '  color:' + CFG.textColor + '!important;',
      '  text-decoration:none!important;',
      '  transition:transform 0.2s,color 0.2s!important;',
      '}',
      '.anavo-slm-item-inner:hover{',
      '  font-style:italic!important;',
      '  transform:translate3d(2rem,0,0)!important;',
      '  color:' + CFG.hoverColor + '!important;',
      '}',

      /* decorative line */
      '.anavo-slm-item-inner::before{',
      '  content:""!important;top:55%!important;',
      '  width:3.5rem!important;height:1px!important;',
      '  background:currentColor!important;position:absolute!important;',
      '  right:calc(100% + 2rem)!important;',
      '  opacity:0!important;pointer-events:none!important;',
      '  transition:opacity 0.2s!important;',
      '}',
      '.anavo-slm-item-inner:hover::before{opacity:1!important;}',

      /* hover hit-area pseudo */
      '.anavo-slm-item-inner:hover::after{',
      '  content:""!important;position:absolute!important;',
      '  top:0!important;left:-5.5rem!important;right:0!important;height:100%!important;',
      '}',

      /* built-in trigger button */
      '.anavo-slm-trigger{',
      '  position:fixed!important;' + tPos,
      '  z-index:9999!important;background:none!important;border:none!important;',
      '  cursor:pointer!important;',
      '  color:' + CFG.triggerColor + '!important;',
      '  font-size:1rem!important;font-family:' + CFG.fontFamily + '!important;',
      '  font-weight:600!important;letter-spacing:0.12em!important;',
      '  text-transform:uppercase!important;padding:0!important;',
      '  transition:opacity 0.2s!important;',
      '}',
      '.anavo-slm-trigger:hover{opacity:0.6!important;}',

      /* mobile */
      '@media (max-width:800px){',
      '  .anavo-slm-nav{',
      '    height:auto!important;overflow:visible!important;',
      '    padding:5rem 0 4rem!important;',
      '  }',
      '  .anavo-slm-overlay{overflow-y:auto!important;}',
      '  .anavo-slm-item{margin-right:4rem!important;}',
      '  .anavo-slm-item-inner{font-size:12vw!important;padding:0.5rem 0!important;}',
      '}',
    ].join('\n');

    var s = document.createElement('style');
    s.id = 'anavo-slm-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ── Build overlay ──────────────────────────────────────── */
  function _buildOverlay() {
    var items = CFG.items.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    var links = CFG.links
      ? CFG.links.split('|').map(function (s) { return s.trim(); })
      : [];

    _overlay = document.createElement('div');
    _overlay.className = 'anavo-slm-overlay';
    _overlay.setAttribute('role', 'dialog');
    _overlay.setAttribute('aria-modal', 'true');
    _overlay.setAttribute('aria-label', 'Navigation menu');

    /* close button */
    var closeBtn = document.createElement('button');
    closeBtn.className = 'anavo-slm-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', _close);
    _overlay.appendChild(closeBtn);

    /* nav */
    _navEl = document.createElement('nav');
    _navEl.className = 'anavo-slm-nav';

    items.forEach(function (text, i) {
      var href = (links[i] && links[i] !== '') ? links[i] : null;
      var item = document.createElement('div');
      item.className = 'anavo-slm-item';
      var inner = href
        ? document.createElement('a')
        : document.createElement('span');
      inner.className = 'anavo-slm-item-inner';
      inner.textContent = text;
      if (href) {
        inner.href = href;
        inner.addEventListener('click', function () { _close(); });
      }
      item.appendChild(inner);
      _navEl.appendChild(item);
    });

    _overlay.appendChild(_navEl);
    document.body.appendChild(_overlay);
    _itemEls = Array.from(_navEl.querySelectorAll('.anavo-slm-item'));
  }

  /* ── Optional built-in trigger ──────────────────────────── */
  function _buildTrigger() {
    if (CFG.showTrigger !== 'true') return;
    var btn = document.createElement('button');
    btn.className = 'anavo-slm-trigger';
    btn.setAttribute('aria-label', 'Open menu');
    btn.textContent = CFG.triggerLabel;
    btn.addEventListener('click', _open);
    document.body.appendChild(btn);
  }

  /* ── Delegate external triggers ────────────────────────── */
  function _bindTriggers() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest
        ? e.target.closest(CFG.triggerSelector)
        : null;
      if (trigger && !_overlay.contains(trigger)) {
        e.preventDefault();
        _open();
      }
    });
  }

  /* ── Scroll loop ────────────────────────────────────────── */
  function _isMobile() {
    return window.innerWidth <= 800;
  }

  function _cloneItems() {
    /* remove existing clones */
    _navEl.querySelectorAll('.anavo-slm-clone').forEach(function (c) {
      _navEl.removeChild(c);
    });

    if (_isMobile()) {
      _clonesHeight = 0;
      return;
    }

    var itemHeight = _itemEls[0] ? _itemEls[0].offsetHeight : 60;
    var fitIn = Math.ceil(window.innerHeight / itemHeight);
    var totalClones = 0;

    _itemEls
      .filter(function (_, i) { return i < fitIn; })
      .forEach(function (target) {
        var clone = target.cloneNode(true);
        clone.classList.add('anavo-slm-clone');
        /* re-bind click on cloned links */
        var a = clone.querySelector('a.anavo-slm-item-inner');
        if (a) { a.addEventListener('click', function () { _close(); }); }
        _navEl.appendChild(clone);
        totalClones++;
      });

    _clonesHeight = totalClones * itemHeight;
    _scrollHeight = _navEl.scrollHeight;
  }

  function _initScroll() {
    if (_isMobile()) return;
    if (_navEl.scrollTop <= 0) { _navEl.scrollTop = 1; }
  }

  function _scrollUpdate() {
    if (_isMobile()) return;
    var pos = _navEl.scrollTop;
    var sh  = _navEl.scrollHeight;

    if (_clonesHeight + pos >= sh) {
      _navEl.scrollTop = 1;
    } else if (pos <= 0) {
      _navEl.scrollTop = sh - _clonesHeight;
    }
  }

  function _loop() {
    if (!_isOpen) return;
    _scrollUpdate();
    _rafId = requestAnimationFrame(_loop);
  }

  /* ── Open / Close ───────────────────────────────────────── */
  function _open() {
    if (_isOpen) return;
    _isOpen = true;
    _overlay.classList.add('anavo-slm-visible');
    document.body.style.overflow = 'hidden';

    setTimeout(function () {
      _cloneItems();
      _initScroll();
      _rafId = requestAnimationFrame(_loop);
      /* focus close button for a11y */
      var closeBtn = _overlay.querySelector('.anavo-slm-close');
      if (closeBtn) { closeBtn.focus(); }
    }, 50);
  }

  function _close() {
    if (!_isOpen) return;
    _isOpen = false;
    _overlay.classList.remove('anavo-slm-visible');
    cancelAnimationFrame(_rafId);
    _rafId = null;
    document.body.style.overflow = '';
  }

  /* ── Keyboard ───────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && _isOpen) { _close(); }
  });

  /* ── Resize ─────────────────────────────────────────────── */
  window.addEventListener('resize', function () {
    if (_isOpen && !_isMobile()) {
      _cloneItems();
      _initScroll();
    }
  });

  /* ── Init ───────────────────────────────────────────────── */
  function _init() {
    if (window.AnavoPluginState && window.AnavoPluginState[PLUGIN_ID]) return;
    window.AnavoPluginState = window.AnavoPluginState || {};
    window.AnavoPluginState[PLUGIN_ID] = { version: PLUGIN_VERSION };

    _injectStyles();
    _buildOverlay();
    _buildTrigger();
    _bindTriggers();
  }

  /* Poll for mount point */
  var _attempts = 0;
  var _poll = setInterval(function () {
    _attempts++;
    if (document.querySelector(CFG.target) || _attempts >= 50) {
      clearInterval(_poll);
      _init();
    }
  }, 100);

})();
