/**
 * =======================================
 * BURGER MENU PRO - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Forces the native Squarespace 7.1 burger menu at every width (or below a
 * breakpoint) and animates the native overlay menu when it opens: slide, fade,
 * curtain, or a circle that grows out of the burger. Nav items rise in with a
 * stagger, and the menu's social icons and CTA button are moved into the nav
 * column so they animate with it.
 *
 * It only restyles and re-parents the native menu. It never hides the header
 * waiting for JavaScript: if this script fails to load, the site keeps its
 * normal header.
 *
 * INSTALLATION (Settings → Advanced → Code Injection → Footer):
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/burger-menu-pro/burger-menu-pro.min.js"></script>
 *
 * QUICK EXAMPLES:
 * Burger below 1024px only, circle reveal:
 * <script src="...burger-menu-pro.min.js?breakpoint=1024&animation=circle"></script>
 * Dark curtain, left-aligned items:
 * <script src="...burger-menu-pro.min.js?animation=curtain&menuBg=%23111111&menuTextColor=%23ffffff&align=left"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'BurgerMenuPro';
  const STYLE_ID = 'anavo-burger-menu-pro-styles';

  // Classes on <html> (it exists even if the script is placed in the Header injection)
  const CLS_ON = 'anavo-burger-menu-pro-on';
  const CLS_REVEAL = 'anavo-burger-menu-pro-reveal';
  const CLS_LOGO_CENTER = 'anavo-burger-menu-pro-logo-center';
  const CLS_ANIM_PREFIX = 'anavo-burger-menu-pro-anim-';
  const CLS_ALIGN_PREFIX = 'anavo-burger-menu-pro-align-';

  // Data attributes on native nodes (removed again on teardown)
  const ATTR_ITEM = 'data-anavo-burger-menu-pro-item';
  const ATTR_MOVED = 'data-anavo-burger-menu-pro-moved';
  const ATTR_WATERMARK = 'data-anavo-burger-menu-pro-watermark';

  // CSS custom properties written inline on native nodes
  const VAR_I = '--anavo-burger-menu-pro-i';
  const VAR_CX = '--anavo-burger-menu-pro-cx';
  const VAR_CY = '--anavo-burger-menu-pro-cy';
  const VAR_R = '--anavo-burger-menu-pro-r';
  const VAR_PL = '--anavo-burger-menu-pro-pl';
  const VAR_PR = '--anavo-burger-menu-pro-pr';

  const ANIMATIONS = ['slideDown', 'fade', 'curtain', 'slideRight', 'circle'];
  const ALIGNS = ['native', 'center', 'left', 'right'];

  // ========================================
  // 1. SCRIPT PARAMETER PARSING
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.querySelectorAll('script[src*="burger-menu-pro"]');
      return scripts[scripts.length - 1] || null;
    })();

  /** Strip characters that could break out of a CSS declaration. */
  function cssSafe(val) {
    return String(val).replace(/[;{}<>"'\\]/g, '').trim();
  }

  function getScriptParams() {
    const defaults = {
      debug: false,
      breakpoint: 0,
      animation: 'slideDown',
      duration: 700,
      easing: 'cubic-bezier(.8,0,.55,.94)',
      stagger: 60,
      itemDelay: 300,
      moveSocials: true,
      moveCta: true,
      menuBg: '',
      menuTextColor: '',
      itemFontSize: '',
      itemSpacing: '',
      align: 'native',
      logoCenter: true,
    };

    try {
      const src = currentScript && currentScript.src;
      if (!src) return defaults;
      const p = new URL(src, window.location.href).searchParams;

      const str = (key, fallback) => (p.get(key) !== null ? p.get(key) : fallback);
      const num = (key, fallback, min, max) => {
        const v = parseFloat(p.get(key));
        if (!isFinite(v)) return fallback;
        return Math.min(max, Math.max(min, v));
      };
      const bool = (key, fallback) => {
        const v = p.get(key);
        if (v === null) return fallback;
        return v !== 'false' && v !== '0';
      };
      const color = key => {
        const v = p.get(key);
        if (!v) return '';
        const c = cssSafe(v);
        if (/^[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i.test(c)) return '#' + c;
        return c;
      };
      const length = key => {
        const v = p.get(key);
        if (!v) return '';
        const c = cssSafe(v);
        return /^-?\d*\.?\d+$/.test(c) ? c + 'px' : c;
      };
      const oneOf = (key, list, fallback) => {
        const v = p.get(key);
        if (!v) return fallback;
        const hit = list.filter(x => x.toLowerCase() === v.toLowerCase())[0];
        return hit || fallback;
      };

      return {
        debug: bool('debug', defaults.debug),
        breakpoint: num('breakpoint', defaults.breakpoint, 0, 10000),
        animation: oneOf('animation', ANIMATIONS, defaults.animation),
        duration: num('duration', defaults.duration, 0, 5000),
        easing: cssSafe(str('easing', defaults.easing)) || defaults.easing,
        stagger: num('stagger', defaults.stagger, 0, 1000),
        itemDelay: num('itemDelay', defaults.itemDelay, 0, 5000),
        moveSocials: bool('moveSocials', defaults.moveSocials),
        moveCta: bool('moveCta', defaults.moveCta),
        menuBg: color('menuBg'),
        menuTextColor: color('menuTextColor'),
        itemFontSize: length('itemFontSize'),
        itemSpacing: length('itemSpacing'),
        align: oneOf('align', ALIGNS, defaults.align),
        logoCenter: bool('logoCenter', defaults.logoCenter),
      };
    } catch (_e) {
      return defaults;
    }
  }

  const config = getScriptParams();

  function dbg(...args) {
    if (config.debug) console.log('[' + PLUGIN_NAME + ']', ...args);
  }

  // ========================================
  // 2. EDITOR-MODE DETECTION
  // ========================================

  function isEditMode() {
    try {
      const cls = (document.body && document.body.className) || '';
      if (
        cls.indexOf('sqs-edit-mode') > -1 ||
        cls.indexOf('squarespace-editable') > -1 ||
        cls.indexOf('squarespace-config') > -1 ||
        cls.indexOf('sqs-editing-mode') > -1
      ) {
        return true;
      }
      if (window.location.pathname.indexOf('/config') === 0) return true;
      if (window.Static && window.Static.SQUARESPACE_CONTEXT && window.Static.SQUARESPACE_CONTEXT.isEditing) {
        return true;
      }
    } catch (_e) {
      // fall through
    }
    return false;
  }

  // ========================================
  // 3. STYLES (re-entrant: own id is removed before re-adding)
  // ========================================

  function buildCSS() {
    const H = 'html.' + CLS_ON;
    const OPEN = H + ' body.header--menu-open';
    const D = config.duration + 'ms';
    const E = config.easing;
    const itemDur = Math.round(Math.max(250, Math.min(600, config.duration * 0.75))) + 'ms';
    const items =
      '.header-menu [' + ATTR_ITEM + '], .header-menu [' + ATTR_MOVED + ']';
    const scoped = sel =>
      sel
        .split(',')
        .map(s => H + ' ' + s.trim())
        .join(', ');
    const scopedOpen = sel =>
      sel
        .split(',')
        .map(s => OPEN + ' ' + s.trim())
        .join(', ');

    let css = '/* ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' */\n';

    // --- Forced burger: desktop nav out, burger in, menu allowed to show ---
    css +=
      H + ' .header-display-desktop .header-nav { display: none !important; }\n' +
      H + ' .header-display-desktop .header-burger { display: flex !important; }\n' +
      OPEN + ' .header-menu { visibility: visible !important; pointer-events: auto !important; }\n';

    // --- Self-expiring reveal guard: ends visible even if nothing else runs ---
    css +=
      '@keyframes anavo-burger-menu-pro-reveal { from { opacity: 0; } to { opacity: 1; } }\n' +
      'html.' + CLS_ON + '.' + CLS_REVEAL + ' .header-display-desktop, ' +
      'html.' + CLS_ON + '.' + CLS_REVEAL + ' .header-display-mobile' +
      ' { animation: anavo-burger-menu-pro-reveal 240ms ease-out both !important; }\n';

    // --- Logo centering (offset measured in JS so it is centred on the whole row) ---
    const LC = 'html.' + CLS_ON + '.' + CLS_LOGO_CENTER;
    css +=
      LC + ' .header-title-nav-wrapper { flex: 1 1 auto !important; justify-content: center !important;' +
      ' box-sizing: border-box !important; padding-left: var(' + VAR_PL + ', 0px) !important;' +
      ' padding-right: var(' + VAR_PR + ', 0px) !important; }\n' +
      LC + ' .header-title { flex: 1 1 100% !important; display: flex !important;' +
      ' justify-content: center !important; text-align: center !important; max-width: 100% !important; }\n' +
      LC + ' .header-actions { flex: 0 0 auto !important; }\n';

    // --- Panel animation ---
    const closedBy = {
      slideDown: 'transform: translate3d(0, -100%, 0) !important; opacity: 1 !important;',
      slideRight: 'transform: translate3d(-100%, 0, 0) !important; opacity: 1 !important;',
      fade: 'transform: none !important; opacity: 0 !important;',
      curtain:
        'opacity: 1 !important; -webkit-clip-path: inset(0 0 100% 0) !important; clip-path: inset(0 0 100% 0) !important;',
      circle:
        'opacity: 1 !important;' +
        ' -webkit-clip-path: circle(0px at var(' + VAR_CX + ', 100%) var(' + VAR_CY + ', 0px)) !important;' +
        ' clip-path: circle(0px at var(' + VAR_CX + ', 100%) var(' + VAR_CY + ', 0px)) !important;',
    };
    const openBy = {
      slideDown: 'transform: translate3d(0, 0, 0) !important;',
      slideRight: 'transform: translate3d(0, 0, 0) !important;',
      fade: 'opacity: 1 !important;',
      curtain: '-webkit-clip-path: inset(0 0 0 0) !important; clip-path: inset(0 0 0 0) !important;',
      circle:
        '-webkit-clip-path: circle(var(' + VAR_R + ', 150vmax) at var(' + VAR_CX + ', 100%) var(' + VAR_CY + ', 0px)) !important;' +
        ' clip-path: circle(var(' + VAR_R + ', 150vmax) at var(' + VAR_CX + ', 100%) var(' + VAR_CY + ', 0px)) !important;',
    };
    const props = ['opacity', 'transform', 'clip-path', '-webkit-clip-path'];
    const tr = visDelay =>
      props.map(p => p + ' ' + D + ' ' + E + ' 0s').join(', ') + ', visibility 0s linear ' + visDelay;

    css +=
      H + ' .header-menu { ' + closedBy[config.animation] +
      ' transition: ' + tr(D) + ' !important; will-change: transform, opacity, clip-path; }\n' +
      OPEN + ' .header-menu { ' + openBy[config.animation] +
      ' transition: ' + tr('0s') + ' !important; }\n';

    // --- Staggered items (root folder only; sub-folders keep native sliding) ---
    css +=
      scoped(items) + ' { opacity: 0 !important; transform: translate3d(0, 24px, 0) !important;' +
      ' transition: opacity 180ms ease 0s, transform 180ms ease 0s !important; }\n' +
      scopedOpen(items) + ' { opacity: 1 !important; transform: translate3d(0, 0, 0) !important;' +
      ' transition: opacity ' + itemDur + ' ease-out calc(' + config.itemDelay + 'ms + var(' + VAR_I + ', 0) * ' + config.stagger + 'ms),' +
      ' transform ' + itemDur + ' cubic-bezier(.2,.7,.2,1) calc(' + config.itemDelay + 'ms + var(' + VAR_I + ', 0) * ' + config.stagger + 'ms) !important; }\n' +
      H + ' .header-menu [' + ATTR_MOVED + '] { flex-shrink: 0 !important; margin-top: 1.5em !important; }\n' +
      H + ' .header-menu [' + ATTR_WATERMARK + '] { flex-shrink: 0 !important; }\n';

    // --- Style params ---
    if (config.menuBg) {
      css +=
        H + ' .header-menu { background: ' + config.menuBg + ' !important; }\n' +
        H + ' .header-menu .header-menu-bg { background: transparent !important; }\n';
    }
    if (config.menuTextColor) {
      const c = config.menuTextColor;
      css +=
        scoped('.header-menu .header-menu-nav-item a, .header-menu .header-menu-nav-item-content, .header-menu .header-menu-controls-control, .header-menu .header-menu-actions a') +
        ' { color: ' + c + ' !important; }\n' +
        H + ' .header-menu .header-menu-actions svg { fill: ' + c + ' !important; }\n' +
        H + ' .header-menu .chevron { border-color: ' + c + ' !important; }\n';
    }
    if (config.itemFontSize) {
      css +=
        H + ' .header-menu .header-menu-nav-item a { font-size: ' + config.itemFontSize + ' !important;' +
        ' line-height: 1.2 !important; }\n';
    }
    if (config.itemSpacing) {
      css +=
        H + ' .header-menu .header-menu-nav-item { margin-top: 0 !important; margin-bottom: 0 !important;' +
        ' padding-top: calc(' + config.itemSpacing + ' / 2) !important;' +
        ' padding-bottom: calc(' + config.itemSpacing + ' / 2) !important; }\n';
    }
    if (config.align !== 'native') {
      const justify = { center: 'center', left: 'flex-start', right: 'flex-end' }[config.align];
      const A = 'html.' + CLS_ON + '.' + CLS_ALIGN_PREFIX + config.align;
      css +=
        A + ' .header-menu .header-menu-nav-item { text-align: ' + config.align + ' !important; }\n' +
        A + ' .header-menu .header-menu-nav-item-content { justify-content: ' + justify + ' !important; }\n' +
        A + ' .header-menu [' + ATTR_MOVED + '] { justify-content: ' + justify + ' !important;' +
        ' align-self: ' + (config.align === 'center' ? 'center' : justify) + ' !important;' +
        ' text-align: ' + config.align + ' !important; }\n';
    }

    // --- Reduced motion: everything instant ---
    css +=
      '@media (prefers-reduced-motion: reduce) {\n' +
      '  ' + H + ' .header-menu, ' + OPEN + ' .header-menu, ' + scoped(items) + ', ' + scopedOpen(items) +
      ' { transition-duration: 0s !important; transition-delay: 0s !important; }\n' +
      '  html.' + CLS_ON + '.' + CLS_REVEAL + ' .header-display-desktop, html.' + CLS_ON + '.' + CLS_REVEAL +
      ' .header-display-mobile { animation: none !important; }\n' +
      '}\n';

    return css;
  }

  function injectStyles() {
    const existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = buildCSS();
    (document.head || document.documentElement).appendChild(style);
  }

  // ========================================
  // 4. NATIVE DOM HELPERS
  // ========================================

  function getMenu() {
    return document.querySelector('.header-menu');
  }

  function isOpen() {
    return !!(document.body && document.body.classList.contains('header--menu-open'));
  }

  function isRendered(el) {
    return !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  }

  function visibleBurger() {
    const btns = document.querySelectorAll('.header-burger-btn');
    for (let i = 0; i < btns.length; i++) {
      if (isRendered(btns[i])) return btns[i];
    }
    return btns[0] || null;
  }

  function rootFolderContent(menu) {
    if (!menu) return null;
    return (
      menu.querySelector('.header-menu-nav-folder[data-folder="root"] > .header-menu-nav-folder-content') ||
      menu.querySelector('.header-menu-nav-folder-content')
    );
  }

  // ========================================
  // 5. STATE
  // ========================================

  const state = {
    active: false,
    bound: false,
    destroyed: false,
    wasOpen: false,
    moved: [], // { node, placeholder }
    lastBurger: null,
    mql: null,
    bodyObserver: null,
    resizeObserver: null,
    revealTimer: null,
    listeners: [],
  };

  function listen(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    state.listeners.push(function () {
      target.removeEventListener(type, fn, opts);
    });
  }

  // ========================================
  // 6. MOVE SOCIALS / CTA INTO THE MENU (reversible)
  // ========================================

  function moveOne(node, target) {
    if (!node || !target || !node.parentNode) return;
    if (target.contains(node)) return; // already there (natively or by us)
    for (let i = 0; i < state.moved.length; i++) if (state.moved[i].node === node) return;
    const placeholder = document.createComment(' anavo-burger-menu-pro-origin ');
    node.parentNode.insertBefore(placeholder, node);
    target.appendChild(node);
    node.setAttribute(ATTR_MOVED, '');
    state.moved.push({ node: node, placeholder: placeholder });
  }

  function moveNodes() {
    const menu = getMenu();
    const target = rootFolderContent(menu);
    if (!menu || !target) return;
    if (config.moveSocials) moveOne(menu.querySelector('.header-menu-actions'), target);
    if (config.moveCta) moveOne(menu.querySelector('.header-menu-cta'), target);
    if (state.moved.length) dbg('Moved into menu:', state.moved.length, 'node(s)');
  }

  function restoreNodes() {
    for (let i = state.moved.length - 1; i >= 0; i--) {
      const m = state.moved[i];
      try {
        m.node.removeAttribute(ATTR_MOVED);
        m.node.style.removeProperty(VAR_I);
        if (m.placeholder.parentNode) m.placeholder.parentNode.insertBefore(m.node, m.placeholder);
        if (m.placeholder.parentNode) m.placeholder.parentNode.removeChild(m.placeholder);
      } catch (_e) {
        // node was removed by Squarespace; nothing to restore
      }
    }
    state.moved = [];
  }

  // ========================================
  // 7. ITEM INDEXING (stagger)
  // ========================================

  function indexItems() {
    const content = rootFolderContent(getMenu());
    if (!content) return;
    let i = 0;
    const nodes = content.querySelectorAll('.header-menu-nav-item, [' + ATTR_MOVED + ']');
    for (let k = 0; k < nodes.length; k++) {
      const n = nodes[k];
      if (!n.hasAttribute(ATTR_MOVED)) n.setAttribute(ATTR_ITEM, '');
      n.style.setProperty(VAR_I, String(i++));
    }
  }

  function unindexItems() {
    const nodes = document.querySelectorAll('[' + ATTR_ITEM + ']');
    for (let k = 0; k < nodes.length; k++) {
      nodes[k].removeAttribute(ATTR_ITEM);
      nodes[k].style.removeProperty(VAR_I);
    }
  }

  // ========================================
  // 8. CIRCLE ORIGIN (centre of the burger, radius to farthest corner)
  // ========================================

  function setOrigin(btn) {
    const menu = getMenu();
    const burger = btn || visibleBurger();
    if (!menu || !burger) return;
    const m = menu.getBoundingClientRect();
    const b = burger.getBoundingClientRect();
    const w = m.width || window.innerWidth;
    const h = m.height || window.innerHeight;
    const cx = b.left + b.width / 2 - m.left;
    const cy = b.top + b.height / 2 - m.top;
    const r = Math.ceil(
      Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy))
    ) + 2;
    menu.style.setProperty(VAR_CX, Math.round(cx) + 'px');
    menu.style.setProperty(VAR_CY, Math.round(cy) + 'px');
    menu.style.setProperty(VAR_R, r + 'px');
  }

  function clearOrigin() {
    const menu = getMenu();
    if (!menu) return;
    menu.style.removeProperty(VAR_CX);
    menu.style.removeProperty(VAR_CY);
    menu.style.removeProperty(VAR_R);
  }

  // ========================================
  // 9. LOGO CENTERING (true centre of the header row)
  // ========================================

  function measureLogo() {
    if (!config.logoCenter || !state.active) return;
    const displays = document.querySelectorAll('.header-display-desktop, .header-display-mobile');
    for (let i = 0; i < displays.length; i++) {
      const d = displays[i];
      const wrap = d.querySelector('.header-title-nav-wrapper');
      if (!wrap) continue;
      const r = d.getBoundingClientRect();
      if (!r.width) continue; // this display is not the one currently shown
      const wr = wrap.getBoundingClientRect();
      // Content box must be centred on the row: pad the wrapper on one side.
      let p = r.left + r.right - wr.left - wr.right;
      p = Math.max(-wr.width / 2, Math.min(wr.width / 2, p));
      d.style.setProperty(VAR_PL, Math.max(0, Math.round(p)) + 'px');
      d.style.setProperty(VAR_PR, Math.max(0, Math.round(-p)) + 'px');
    }
  }

  function clearLogo() {
    const displays = document.querySelectorAll('.header-display-desktop, .header-display-mobile');
    for (let i = 0; i < displays.length; i++) {
      displays[i].style.removeProperty(VAR_PL);
      displays[i].style.removeProperty(VAR_PR);
    }
  }

  // ========================================
  // 10. ACTIVATE / DEACTIVATE
  // ========================================

  function shouldBeActive() {
    if (state.destroyed || isEditMode()) return false;
    return !state.mql || state.mql.matches;
  }

  function setHtmlClasses(on) {
    const cl = document.documentElement.classList;
    const extra = [CLS_ANIM_PREFIX + config.animation, CLS_ALIGN_PREFIX + config.align];
    if (config.logoCenter) extra.push(CLS_LOGO_CENTER);
    if (on) {
      cl.add(CLS_ON);
      extra.forEach(c => cl.add(c));
    } else {
      cl.remove(CLS_ON, CLS_REVEAL);
      extra.forEach(c => cl.remove(c));
    }
  }

  function reveal() {
    const cl = document.documentElement.classList;
    cl.add(CLS_REVEAL);
    clearTimeout(state.revealTimer);
    state.revealTimer = setTimeout(function () {
      cl.remove(CLS_REVEAL);
    }, 400);
  }

  function activate() {
    if (!state.active) {
      state.active = true;
      setHtmlClasses(true);
      reveal();
      dbg('Active');
    }
    if (state.bound) {
      moveNodes();
      indexItems();
      setOrigin();
      measureLogo();
    }
  }

  function closeMenuNatively() {
    if (!isOpen()) return;
    const btn = visibleBurger();
    if (btn) btn.click();
  }

  function deactivate() {
    if (state.active && isOpen()) closeMenuNatively();
    state.active = false;
    setHtmlClasses(false);
    restoreNodes();
    unindexItems();
    clearOrigin();
    clearLogo();
    dbg('Inactive');
  }

  function apply() {
    try {
      if (shouldBeActive()) activate();
      else if (state.active) deactivate();
    } catch (e) {
      dbg('apply error', e);
    }
  }

  // ========================================
  // 11. OPEN / CLOSE UX (focus, Escape)
  // ========================================

  function focusables(root) {
    if (!root) return [];
    const list = root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(list, el => el.getClientRects().length > 0);
  }

  function onOpen() {
    if (!state.active) return;
    state.lastBurger = visibleBurger();
    indexItems();
    const menu = getMenu();
    // Visibility flips to visible on the first frame of the transition, so focus after it.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!isOpen()) return;
        const first = focusables(rootFolderContent(menu))[0] || focusables(menu)[0];
        if (first && !(menu && menu.contains(document.activeElement))) {
          try {
            first.focus({ preventScroll: true });
          } catch (_e) {
            first.focus();
          }
        }
      });
    });
  }

  function onClose() {
    const menu = getMenu();
    const ae = document.activeElement;
    const focusLost = !ae || ae === document.body || (menu && menu.contains(ae));
    const target = visibleBurger() || state.lastBurger;
    if (focusLost && target) {
      try {
        target.focus({ preventScroll: true });
      } catch (_e) {
        target.focus();
      }
    }
  }

  function onBodyClassChange() {
    if (isEditMode()) {
      if (state.active) deactivate();
      return;
    }
    if (!state.active && shouldBeActive()) activate();
    const open = isOpen();
    if (open === state.wasOpen) return;
    state.wasOpen = open;
    if (open) onOpen();
    else onClose();
  }

  function onKeydown(e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    if (!state.active || !isOpen()) return;
    // Squarespace may already close the menu on Escape; only step in if it did not.
    setTimeout(function () {
      if (state.active && isOpen()) closeMenuNatively();
    }, 0);
  }

  function onPointerOrClick(e) {
    const btn = e.target && e.target.closest && e.target.closest('.header-burger-btn');
    if (btn && state.active) setOrigin(btn);
  }

  // ========================================
  // 12. BINDING (after the header exists)
  // ========================================

  function bind() {
    if (state.bound || state.destroyed) return;
    state.bound = true;

    // Capture phase: runs before Squarespace's own burger handler flips the class,
    // so the circle origin is already correct when the transition starts.
    listen(document, 'pointerdown', onPointerOrClick, true);
    listen(document, 'click', onPointerOrClick, true);
    listen(document, 'keydown', onKeydown, false);

    if (state.mql) {
      if (state.mql.addEventListener) listen(state.mql, 'change', apply);
      else if (state.mql.addListener) {
        const mql = state.mql;
        mql.addListener(apply);
        state.listeners.push(function () {
          mql.removeListener(apply);
        });
      }
    }

    state.wasOpen = isOpen();
    state.bodyObserver = new MutationObserver(onBodyClassChange);
    state.bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const onLayout = function () {
      if (!state.active) return;
      measureLogo();
      if (!isOpen()) setOrigin();
    };
    if (window.ResizeObserver) {
      state.resizeObserver = new ResizeObserver(onLayout);
      document
        .querySelectorAll('.header-display-desktop, .header-display-mobile, .header-actions, .header-burger')
        .forEach(el => state.resizeObserver.observe(el));
    }
    listen(window, 'resize', onLayout, { passive: true });
    listen(window, 'load', onLayout);

    apply();
  }

  function waitForHeader(attempt) {
    if (state.destroyed) return;
    if (document.querySelector('.header-menu') && document.querySelector('.header-burger-btn')) {
      bind();
      return;
    }
    if (attempt < 50) {
      setTimeout(function () {
        waitForHeader(attempt + 1);
      }, 100);
    } else {
      console.warn('[' + PLUGIN_NAME + '] Squarespace 7.1 header/menu not found — plugin inactive');
      deactivate();
    }
  }

  // ========================================
  // 13. TEARDOWN
  // ========================================

  function destroy() {
    try {
      state.destroyed = true;
      deactivate();
      state.listeners.forEach(off => off());
      state.listeners = [];
      if (state.bodyObserver) state.bodyObserver.disconnect();
      if (state.resizeObserver) state.resizeObserver.disconnect();
      clearTimeout(state.revealTimer);
      const wm = document.querySelectorAll('[' + ATTR_WATERMARK + ']');
      for (let i = 0; i < wm.length; i++) wm[i].remove();
      const style = document.getElementById(STYLE_ID);
      if (style) style.remove();
      dbg('Destroyed');
    } catch (_e) {
      // silent
    }
  }

  // ========================================
  // 14. LICENSING (async, non-blocking)
  // ========================================

  function loadLicensing() {
    try {
      const run = function () {
        try {
          const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
            licenseServer:
              'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
            showUI: true,
          });
          lm.init().then(function () {
            if (lm.isLicensed || state.destroyed) return;
            const content = rootFolderContent(getMenu());
            if (!content) return;
            const holder = document.createElement('div');
            holder.setAttribute(ATTR_WATERMARK, '');
            content.appendChild(holder);
            lm.insertWatermark(holder);
          });
        } catch (e) {
          console.warn('[' + PLUGIN_NAME + '] License init error:', e.message);
        }
      };

      if (window.AnavoLicenseManager) {
        run();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
      script.onload = run;
      script.onerror = function () {
        console.warn('[' + PLUGIN_NAME + '] Could not load licensing module');
      };
      document.head.appendChild(script);
    } catch (e) {
      console.warn('[' + PLUGIN_NAME + '] License load error:', e.message);
    }
  }

  // ========================================
  // 15. INIT
  // ========================================

  function register() {
    window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
    window.AnavoPluginState.plugins = window.AnavoPluginState.plugins || {};
    window.AnavoPluginState.plugins[PLUGIN_NAME] = {
      version: PLUGIN_VERSION,
      config: config,
      destroy: destroy,
      refresh: function () {
        injectStyles();
        apply();
      },
      isActive: function () {
        return state.active;
      },
    };
  }

  function init() {
    try {
      console.log('\uD83C\uDF54 ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' - Loading...');

      // Loaded twice (e.g. pasted in Header and Footer)? The newest copy wins.
      const prev =
        window.AnavoPluginState &&
        window.AnavoPluginState.plugins &&
        window.AnavoPluginState.plugins[PLUGIN_NAME];
      if (prev && typeof prev.destroy === 'function') prev.destroy();

      register();

      if (isEditMode()) {
        console.log('[' + PLUGIN_NAME + '] Squarespace editor detected — staying neutral');
        return;
      }

      if (config.breakpoint > 0 && window.matchMedia) {
        state.mql = window.matchMedia('(max-width: ' + (config.breakpoint - 0.02) + 'px)');
      }

      injectStyles();
      // Classes go on <html> right away, before the header is even parsed,
      // so the swap from nav to burger happens in the same frame as our CSS.
      apply();

      const start = function () {
        if (isEditMode()) {
          deactivate();
          return;
        }
        waitForHeader(0);
        setTimeout(loadLicensing, 1500);
        console.log('\u2705 ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' Active!');
        dbg('Config:', config);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
      } else {
        start();
      }
    } catch (err) {
      console.warn('[' + PLUGIN_NAME + '] Initialization error:', err && err.message);
    }
  }

  init();
})();
