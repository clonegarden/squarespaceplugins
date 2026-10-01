/**
 * ============================================================
 * LIST HOVER REVEAL PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — plugins.anavo.tech
 *
 * EFFECT:
 *   Turns a native Squarespace List section (Simple layout) into a
 *   stack of full-width rows separated by lines. Each item's image is
 *   hidden until its row is active:
 *   - Desktop: hovering a row reveals its image, which follows the
 *     cursor with a smooth lerp and an optional tilt. Other rows dim,
 *     the title slides right and the button slides left.
 *   - Touch: the row crossing the middle of the screen becomes active
 *     and its image appears behind it (or tap-to-reveal). Near the very
 *     top/bottom of the page the trigger line slides, so every row still
 *     gets its turn.
 *   Each row becomes one link (the item's button URL), keyboard
 *   focusable; focusing it shows the image too.
 *
 * USAGE (Settings → Advanced → Code Injection → FOOTER):
 *   <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/list-hover-reveal/list-hover-reveal.min.js?sectionId=YOUR_SECTION_ID"></script>
 *
 *   Find the section id with the browser inspector: it is the
 *   data-section-id="…" attribute of the <section> around the list.
 *   Several ids can be comma-separated.
 *
 * PARAMETERS (URL query string — encode # as %23, % as %25):
 *   sectionId            — Squarespace section id(s), comma-separated
 *   target               — CSS selector of the section, the list, or an element
 *                          inside the section   default: [data-anavo-list-hover-reveal]
 *   imgWidth             — image width, desktop (% of the list)     default: 30%
 *   imgWidthMobile       — max image width, touch (% of screen)     default: 70%
 *   imgHeightMobile      — image height, touch (any CSS length)     default: min(60vw, 50svh)
 *   imgRatio             — image ratio, e.g. 3/4 · auto = the list's own setting
 *                                                                   default: auto
 *   imgPosition          — horizontal anchor of the image, % of the list width
 *                                                                   default: 50
 *   followX              — how far the image follows the cursor sideways, 0–1
 *                                                                   default: 0.3
 *   followEase           — follow smoothing, 0.01–1 (1 = no lag)   default: 0.15
 *   rotateOnMove         — tilt the image by horizontal speed      default: true
 *   rotateMax            — max tilt in degrees                      default: 6
 *   reveal               — fade | scale | clip | blur               default: fade
 *   revealDuration       — reveal duration in ms                    default: 300
 *   desktopLayer         — above | below the text (desktop)         default: above
 *   inactiveOpacity      — opacity of the non-active rows, 0–1      default: 0.3
 *   activeInset          — slide distance of title/button           default: 20px
 *   lineColor            — row divider color                        default: theme line color
 *   lineWidth            — row divider thickness                    default: 1px
 *   outerLines           — also draw a line above the first and below the last row
 *                                                                   default: false
 *   spaceBetween         — vertical padding of each row             default: 40px
 *   titleSizeMobile      — title font size ≤800px (empty = keep theme size)
 *   plainButton          — render the item button as plain text     default: true
 *   mobileMode           — centerline | tap | off                   default: centerline
 *   overlayOpacityMobile — veil over the image behind the active row, 0–1
 *                                                                   default: 0.5
 *   debug                — verbose console logging                  default: false
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'ListHoverReveal';
  var VERSION   = '1.0.0';
  var NS        = 'anavo-list-hover-reveal';
  var STYLE_ID  = 'anavo-list-hover-reveal-styles';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="list-hover-reveal"]');
    return all[all.length - 1] || null;
  })();

  var params;
  try { params = new URL(scriptEl.src).searchParams; }
  catch (e) { params = new URLSearchParams(); }

  /** Get a param; fallback when absent/empty. URLSearchParams already decodes. */
  function p(key, fallback) {
    var v = params.get(key);
    if (v === null) return fallback;
    v = String(v).trim();
    return v === '' ? fallback : v;
  }
  function pBool(key, fallback) {
    var v = p(key, null);
    if (v === null) return fallback;
    return v !== 'false' && v !== '0' && v !== 'no' && v !== 'off';
  }
  function pNum(key, fallback, min, max) {
    var n = parseFloat(p(key, ''));
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }
  function pOneOf(key, list, fallback) {
    var v = String(p(key, fallback)).toLowerCase();
    return list.indexOf(v) > -1 ? v : fallback;
  }
  /** A bare number gets a default unit: "30" → "30%", "20" → "20px". */
  function pLen(key, fallback, unit) {
    var v = p(key, fallback);
    if (/^-?\d*\.?\d+$/.test(v)) v = v + unit;
    return v;
  }
  function fixColor(c) {
    if (!c) return '';
    if (/^[0-9a-f]{3,8}$/i.test(c)) return '#' + c;
    return c;
  }

  var titleMobile = p('titleSizeMobile', '');
  if (/^\d*\.?\d+$/.test(titleMobile)) {
    titleMobile = titleMobile + (parseFloat(titleMobile) < 8 ? 'rem' : 'px');
  }

  var CFG = {
    domain:               p('domain', window.location.hostname),
    target:               p('target', '[data-anavo-list-hover-reveal]'),
    sectionId:            p('sectionId', ''),
    imgWidth:             pLen('imgWidth', '30%', '%'),
    imgWidthMobile:       pLen('imgWidthMobile', '70%', '%'),
    imgHeightMobile:      pLen('imgHeightMobile', 'min(60vw, 50svh)', 'px'),
    imgRatio:             p('imgRatio', 'auto'),
    imgPosition:          pNum('imgPosition', 50, 0, 100),
    followX:              pNum('followX', 0.3, 0, 1),
    followEase:           pNum('followEase', 0.15, 0.01, 1),
    rotateOnMove:         pBool('rotateOnMove', true),
    rotateMax:            pNum('rotateMax', 6, 0, 45),
    reveal:               pOneOf('reveal', ['fade', 'scale', 'clip', 'blur'], 'fade'),
    revealDuration:       pNum('revealDuration', 300, 0, 3000),
    desktopLayer:         pOneOf('desktopLayer', ['above', 'below'], 'above'),
    inactiveOpacity:      pNum('inactiveOpacity', 0.3, 0, 1),
    activeInset:          pLen('activeInset', '20px', 'px'),
    lineColor:            fixColor(p('lineColor', '')),
    lineWidth:            pLen('lineWidth', '1px', 'px'),
    outerLines:           pBool('outerLines', false),
    spaceBetween:         pLen('spaceBetween', '40px', 'px'),
    titleSizeMobile:      titleMobile,
    plainButton:          pBool('plainButton', true),
    mobileMode:           pOneOf('mobileMode', ['centerline', 'tap', 'off'], 'centerline'),
    overlayOpacityMobile: pNum('overlayOpacityMobile', 0.5, 0, 1),
    debug:                pBool('debug', false)
  };

  function dbg() {
    if (!CFG.debug) return;
    try { console.log.apply(console, ['[' + PLUGIN_ID + ']'].concat([].slice.call(arguments))); } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. ENVIRONMENT
  // ─────────────────────────────────────────────────────────────────

  /** Squarespace editor: skip, like the other Anavo plugins. */
  function isEditorMode() {
    try {
      var b = document.body;
      var cls = (b ? b.className : '') + ' ' + document.documentElement.className;
      if (/\b(sqs-edit-mode|sqs-edit-mode-active|sqs-editing|sqs-editing-mode|squarespace-editable|squarespace-config)\b/.test(cls)) return true;
      if (/[?&](edit=true|sqs-edit-mode|editMode)/.test(window.location.search)) return true;
      if (window.location.pathname.indexOf('/config') === 0) return true;
      var ctx = window.Static && window.Static.SQUARESPACE_CONTEXT;
      if (ctx && ctx.isEditing) return true;
      // Squarespace renders the editor preview inside an iframe. Only treat an
      // iframe as the editor when it is a Squarespace page (demos may be framed).
      if (ctx && window.self !== window.top) return true;
    } catch (e) {
      return true; // window.top access throws inside sandboxed frames
    }
    return false;
  }

  var mqHover  = safeMQ('(hover: hover) and (pointer: fine) and (min-width: 801px)');
  var mqReduce = safeMQ('(prefers-reduced-motion: reduce)');

  function safeMQ(q) {
    try { return window.matchMedia ? window.matchMedia(q) : null; } catch (e) { return null; }
  }
  function onMQ(mq, fn) {
    if (!mq) return;
    try {
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else if (mq.addListener) mq.addListener(fn);
    } catch (e) {}
  }
  function canHover() { return !!(mqHover && mqHover.matches); }
  function reducedMotion() { return !!(mqReduce && mqReduce.matches); }

  // ─────────────────────────────────────────────────────────────────
  // 3. CSS (static — every value comes from per-list CSS variables,
  //    so two script tags with different settings can share it)
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById(STYLE_ID);
    if (ex && ex.parentNode) ex.parentNode.removeChild(ex);

    var R   = '.' + NS;                       // root = .user-items-list
    var ROW = '.' + NS + '-row';
    var ON  = '.' + NS + '-active';
    var V   = function (name, fb) { return 'var(--' + NS + '-' + name + ',' + fb + ')'; };
    var dur = V('dur', '300ms');
    var ease = 'cubic-bezier(.22,.61,.36,1)';

    var css =
      /* ── Section + root ─────────────────────────────────────────── */
      '.' + NS + '-section{position:relative!important;z-index:2!important;}' +
      R + '{position:relative!important;isolation:isolate!important;overflow-x:clip!important;overflow-y:visible!important;}' +

      /* ── The list becomes a single column of rows ───────────────── */
      R + ' .' + NS + '-list{display:grid!important;grid-template-columns:minmax(0,1fr)!important;' +
        'gap:0!important;grid-gap:0!important;row-gap:0!important;column-gap:0!important;' +
        'position:relative!important;margin-left:auto!important;margin-right:auto!important;' +
        'list-style:none!important;}' +
      R + ' ' + ROW + '{display:block!important;position:relative!important;margin:0!important;' +
        'padding:0!important;width:auto!important;max-width:none!important;grid-column:auto!important;' +
        'grid-row:auto!important;transform:none!important;border:0 solid ' + V('line-color', 'var(--tweak-line-block-line-color,currentColor)') + '!important;' +
        'background:transparent!important;box-shadow:none!important;}' +
      R + ' ' + ROW + '+' + ROW + '{border-top-width:' + V('line-width', '1px') + '!important;}' +
      R + '.' + NS + '-outer-lines ' + ROW + ':first-child{border-top-width:' + V('line-width', '1px') + '!important;}' +
      R + '.' + NS + '-outer-lines ' + ROW + ':last-child{border-bottom-width:' + V('line-width', '1px') + '!important;}' +

      /* Native media is replaced by the stage */
      R + ' ' + ROW + ' .list-item-media{display:none!important;}' +

      /* ── Row content ───────────────────────────────────────────── */
      R + ' ' + ROW + ' .list-item-content{display:flex!important;flex-direction:row!important;' +
        'justify-content:space-between!important;align-items:' + V('align', 'center') + '!important;' +
        'gap:1rem 1.5rem!important;padding:' + V('space', '40px') + ' 0!important;margin:0!important;' +
        'opacity:1!important;transition:opacity .45s ease!important;background:transparent!important;}' +
      R + ' ' + ROW + ' .list-item-content__text-wrapper{display:flex!important;flex-direction:column!important;' +
        'align-items:flex-start!important;flex:1 1 auto!important;min-width:0!important;margin:0!important;}' +
      R + ' ' + ROW + ' .list-item-content__title{margin:0!important;text-align:left!important;max-width:100%!important;' +
        'translate:0 0!important;transition:translate .5s ' + ease + ',opacity .8s ease!important;}' +
      R + ' ' + ROW + ' .list-item-content__description{text-align:left!important;margin:.35em 0 0!important;max-width:100%!important;}' +
      R + ' ' + ROW + ' .list-item-content__button-wrapper{display:flex!important;flex:0 0 auto!important;margin:0 0 0 auto!important;}' +
      R + ' ' + ROW + ' .list-item-content__button-container{margin:0!important;max-width:none!important;text-align:right!important;' +
        'translate:0 0!important;transition:translate .5s ' + ease + ',opacity .8s ease!important;}' +
      R + '.' + NS + '-plain-button ' + ROW + ' .list-item-content__button{padding:0!important;border:0!important;' +
        'background:transparent!important;box-shadow:none!important;clip-path:none!important;min-height:0!important;' +
        'color:inherit!important;}' +
      R + '.' + NS + '-plain-button ' + ROW + ' .list-item-content__button:before,' +
      R + '.' + NS + '-plain-button ' + ROW + ' .list-item-content__button:after{display:none!important;}' +
      R + ' ' + ROW + '.' + NS + '-has-link .list-item-content__button{pointer-events:none!important;}' +

      /* Active row: title in, button in, others dimmed */
      R + ' ' + ROW + ON + ' .list-item-content__title{translate:' + V('inset', '20px') + ' 0!important;}' +
      R + ' ' + ROW + ON + ' .list-item-content__button-container{translate:calc(' + V('inset', '20px') + ' * -1) 0!important;}' +
      R + '.' + NS + '-has-active ' + ROW + ':not(' + ON + ') .list-item-content{opacity:' + V('dim', '0.3') + '!important;}' +

      /* ── Whole-row link ─────────────────────────────────────────── */
      R + ' .' + NS + '-link{position:absolute!important;inset:0!important;z-index:1!important;display:block!important;' +
        'background:transparent!important;border:0!important;margin:0!important;padding:0!important;' +
        'text-decoration:none!important;color:inherit!important;cursor:pointer!important;outline:none!important;}' +
      R + ' .' + NS + '-link:focus-visible{outline:2px solid currentColor!important;outline-offset:-2px!important;}' +
      R + ' .' + NS + '-sr{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;' +
        'clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;margin:-1px!important;padding:0!important;border:0!important;}' +

      /* ── Stage + image layers ───────────────────────────────────── */
      R + ' .' + NS + '-stage{position:absolute!important;pointer-events:none!important;z-index:2!important;' +
        'overflow:visible!important;margin:0!important;padding:0!important;contain:layout style!important;}' +
      R + '.' + NS + '-layer-below .' + NS + '-stage{z-index:-1!important;}' +
      R + ' .' + NS + '-layer{position:absolute!important;left:0!important;top:0!important;margin:0!important;' +
        'width:' + V('img-w', '30%') + '!important;height:auto!important;max-width:none!important;' +
        'transform:translate3d(' + V('x', '0px') + ',' + V('y', '0px') + ',0) translate(-50%,-50%) rotate(' + V('r', '0deg') + ')!important;' +
        'opacity:0!important;visibility:hidden!important;will-change:transform,opacity!important;' +
        'transition:opacity ' + dur + ' ease,visibility 0s linear ' + dur + ',filter ' + dur + ' ease,clip-path ' + dur + ' ' + ease + '!important;' +
        'backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;}' +
      R + ' .' + NS + '-layer img{display:block!important;width:100%!important;height:100%!important;max-width:none!important;' +
        'object-fit:cover!important;margin:0!important;padding:0!important;border:0!important;' +
        'transition:scale ' + dur + ' ' + ease + '!important;scale:1!important;}' +
      R + ' .' + NS + '-layer.' + NS + '-layer-on{opacity:1!important;visibility:visible!important;' +
        'transition:opacity ' + dur + ' ease,visibility 0s linear 0s,filter ' + dur + ' ease,clip-path ' + dur + ' ' + ease + '!important;}' +

      /* Reveal variants */
      R + '.' + NS + '-reveal-scale .' + NS + '-layer img{scale:.82!important;}' +
      R + '.' + NS + '-reveal-scale .' + NS + '-layer-on img{scale:1!important;}' +
      R + '.' + NS + '-reveal-clip .' + NS + '-layer{opacity:1!important;clip-path:inset(100% 0 0 0)!important;}' +
      R + '.' + NS + '-reveal-clip .' + NS + '-layer-on{clip-path:inset(0 0 0 0)!important;}' +
      R + '.' + NS + '-reveal-blur .' + NS + '-layer{filter:blur(18px)!important;}' +
      R + '.' + NS + '-reveal-blur .' + NS + '-layer-on{filter:blur(0)!important;}' +

      /* ── Touch layout: image fixed mid-screen, behind the rows ─── */
      R + '.' + NS + '-is-touch .' + NS + '-stage{position:fixed!important;left:0!important;top:0!important;' +
        'width:100%!important;height:100%!important;z-index:-1!important;contain:none!important;}' +
      R + '.' + NS + '-is-touch .' + NS + '-layer{left:50%!important;width:auto!important;' +
        'top:clamp(calc(' + V('img-h-m', 'min(60vw,50svh)') + ' / 2),' + V('line', '50%') + ',calc(100% - ' + V('img-h-m', 'min(60vw,50svh)') + ' / 2))!important;' +
        'height:' + V('img-h-m', 'min(60vw,50svh)') + '!important;max-width:' + V('img-w-m', '70%') + '!important;' +
        'transform:translate(-50%,-50%)!important;}' +
      R + '.' + NS + '-is-touch ' + ROW + ':before{content:""!important;position:absolute!important;inset:0!important;' +
        'z-index:-1!important;pointer-events:none!important;opacity:0!important;' +
        'background:' + V('veil-color', 'var(--siteBackgroundColor,#fff)') + '!important;transition:opacity .45s ease!important;}' +
      R + '.' + NS + '-is-touch ' + ROW + ON + ':before{opacity:' + V('veil', '0.5') + '!important;}' +
      R + '.' + NS + '-is-touch.' + NS + '-mode-off .' + NS + '-stage{display:none!important;}' +

      /* ── Reduced motion ─────────────────────────────────────────── */
      R + '.' + NS + '-reduced ' + ROW + ' .list-item-content__title,' +
      R + '.' + NS + '-reduced ' + ROW + ' .list-item-content__button-container{translate:0 0!important;transition:opacity .2s ease!important;}' +
      R + '.' + NS + '-reduced .' + NS + '-layer{clip-path:none!important;filter:none!important;}' +
      R + '.' + NS + '-reduced .' + NS + '-layer img{scale:1!important;transition:none!important;}' +

      /* ── Breakpoints ────────────────────────────────────────────── */
      '@media (max-width:800px){' +
        R + '.' + NS + '-title-m ' + ROW + ' .list-item-content__title{font-size:' + V('title-m', 'inherit') + '!important;}' +
      '}' +
      '@media (max-width:480px){' +
        R + ' ' + ROW + ' .list-item-content{flex-wrap:wrap!important;gap:.5rem 1rem!important;}' +
      '}';

    var tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = css;
    var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    if (head) head.appendChild(tag);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. TARGET RESOLUTION
  // ─────────────────────────────────────────────────────────────────

  function cssEscape(s) {
    try { if (window.CSS && CSS.escape) return CSS.escape(s); } catch (e) {}
    return String(s).replace(/["\\]/g, '\\$&');
  }

  function qsa(root, sel) {
    try { return root ? Array.prototype.slice.call(root.querySelectorAll(sel)) : []; }
    catch (e) { return []; }
  }

  /** Every .user-items-list the params point at (deduplicated). */
  function findLists() {
    var found = [];
    function add(list) { if (list && found.indexOf(list) < 0) found.push(list); }
    function fromEl(el) {
      if (!el || !el.nodeType) return;
      if (el.classList && el.classList.contains('user-items-list')) { add(el); return; }
      var inner = qsa(el, '.user-items-list');
      if (inner.length) { inner.forEach(add); return; }
      var up = el.closest ? el.closest('.user-items-list') : null;
      if (up) { add(up); return; }
      var section = el.closest ? el.closest('section, .page-section') : null;
      if (section) qsa(section, '.user-items-list').forEach(add);
    }

    if (CFG.sectionId) {
      CFG.sectionId.split(',').forEach(function (id) {
        id = id.trim();
        if (!id) return;
        qsa(document, 'section[data-section-id="' + cssEscape(id) + '"], .page-section[data-section-id="' + cssEscape(id) + '"]').forEach(fromEl);
      });
    }
    if (CFG.target) qsa(document, CFG.target).forEach(fromEl);
    return found;
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. HELPERS
  // ─────────────────────────────────────────────────────────────────

  function addClass(el, c) { if (el && el.classList) el.classList.add(c); }
  function removeClass(el, c) { if (el && el.classList) el.classList.remove(c); }
  function setVar(el, name, value) {
    if (!el || value === '' || value === null || value === undefined) return;
    try { el.style.setProperty('--' + NS + '-' + name, String(value)); } catch (e) {}
  }

  /** A button href worth turning into a row link. */
  function usableHref(a) {
    if (!a || !a.getAttribute) return '';
    var raw = (a.getAttribute('href') || '').trim();
    if (!raw || raw === '#' || /^javascript:/i.test(raw)) return '';
    return raw;
  }

  /** "3:4" · "3/4" · "0.75" → "3 / 4"-style CSS ratio, or ''. */
  function toRatio(v) {
    if (!v) return '';
    var m = String(v).match(/^\s*(\d*\.?\d+)\s*[:/x]\s*(\d*\.?\d+)\s*$/);
    if (m && parseFloat(m[1]) > 0 && parseFloat(m[2]) > 0) return m[1] + ' / ' + m[2];
    var n = parseFloat(v);
    return n > 0 ? String(n) : '';
  }

  function imageFor(li) {
    var img = li.querySelector('.list-item-media img, .list-item-media-inner img');
    if (!img) return null;
    var src = img.currentSrc || img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-image') || '';
    if (!src || /^data:/.test(src)) src = img.getAttribute('data-src') || img.getAttribute('data-image') || src;
    if (!src) return null;
    var srcset = img.getAttribute('srcset') || '';
    var base = img.getAttribute('data-src') || img.getAttribute('data-image') || '';
    if (!srcset && /squarespace-cdn\.com/.test(base) && base.indexOf('?') < 0) {
      srcset = [500, 750, 1000, 1500, 2500].map(function (w) { return base + '?format=' + w + 'w ' + w + 'w'; }).join(', ');
    }
    var inner = li.querySelector('.list-item-media-inner');
    var ratio = toRatio(CFG.imgRatio !== 'auto' ? CFG.imgRatio : '') ||
      toRatio(inner && inner.getAttribute('data-aspect-ratio')) ||
      toRatio((img.getAttribute('data-image-dimensions') || '').replace('x', ':')) ||
      (img.getAttribute('width') && img.getAttribute('height') ? toRatio(img.getAttribute('width') + ':' + img.getAttribute('height')) : '') ||
      '3 / 4';
    var focal = (img.getAttribute('data-image-focal-point') || '').split(',');
    var pos = focal.length === 2 && isFinite(focal[0]) && isFinite(focal[1])
      ? (parseFloat(focal[0]) * 100) + '% ' + (parseFloat(focal[1]) * 100) + '%' : '50% 50%';
    return { src: src, srcset: srcset, ratio: ratio, pos: pos, alt: img.getAttribute('alt') || '' };
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. ONE INSTANCE PER LIST
  // ─────────────────────────────────────────────────────────────────

  function mountList(root) {
    if (!root || root.getAttribute('data-' + NS + '-mounted')) return null;
    var ul = root.querySelector('.user-items-list-simple') || root.querySelector('ul.user-items-list-item-container');
    if (!ul) {
      console.warn('[Anavo ' + PLUGIN_ID + '] Only the "Simple" List layout is supported — skipped a list.');
      return null;
    }
    var lis = qsa(ul, ':scope > li.list-item, :scope > .list-item');
    if (!lis.length) lis = qsa(ul, '.list-item');
    if (!lis.length) return null;

    root.setAttribute('data-' + NS + '-mounted', VERSION);

    var inst = {
      root: root, ul: ul, rows: [], stage: null,
      section: root.closest ? root.closest('section, .page-section') : null,
      active: null, pointerIn: false, cx: 0, cy: 0,
      cur: { x: 0, y: 0, r: 0 }, tgt: { x: 0, y: 0 }, prevX: 0,
      raf: 0, ro: null, mode: '', centerlineBound: false
    };

    /* Classes + per-list settings as CSS variables */
    addClass(root, NS);
    addClass(inst.section, NS + '-section');
    addClass(ul, NS + '-list');
    addClass(root, NS + '-reveal-' + CFG.reveal);
    addClass(root, NS + '-mode-' + CFG.mobileMode);
    if (CFG.desktopLayer === 'below') addClass(root, NS + '-layer-below');
    if (CFG.outerLines) addClass(root, NS + '-outer-lines');
    if (CFG.plainButton) addClass(root, NS + '-plain-button');
    if (CFG.titleSizeMobile) addClass(root, NS + '-title-m');
    var va = ul.getAttribute('data-alignment-vertical');
    setVar(root, 'align', va === 'top' ? 'flex-start' : va === 'bottom' ? 'flex-end' : 'center');
    setVar(root, 'img-w', CFG.imgWidth);
    setVar(root, 'img-w-m', CFG.imgWidthMobile);
    setVar(root, 'img-h-m', CFG.imgHeightMobile);
    setVar(root, 'dur', CFG.revealDuration + 'ms');
    setVar(root, 'dim', CFG.inactiveOpacity);
    setVar(root, 'inset', CFG.activeInset);
    setVar(root, 'line-color', CFG.lineColor);
    setVar(root, 'line-width', CFG.lineWidth);
    setVar(root, 'space', CFG.spaceBetween);
    setVar(root, 'title-m', CFG.titleSizeMobile);
    setVar(root, 'veil', CFG.overlayOpacityMobile);

    /* Stage (sibling of the <ul>, so the list markup stays valid) */
    var stage = document.createElement('div');
    stage.className = NS + '-stage';
    stage.setAttribute('aria-hidden', 'true');
    inst.stage = stage;

    lis.forEach(function (li, i) {
      var row = { li: li, layer: null, link: null, index: i };
      addClass(li, NS + '-row');

      /* Image layer */
      var data = imageFor(li);
      if (data) {
        var layer = document.createElement('div');
        layer.className = NS + '-layer';
        layer.style.aspectRatio = data.ratio;
        var img = document.createElement('img');
        img.alt = '';
        img.decoding = 'async';
        img.src = data.src;
        if (data.srcset) {
          img.srcset = data.srcset;
          img.sizes = '(max-width: 800px) 80vw, 40vw';
        }
        img.style.objectPosition = data.pos;
        layer.appendChild(img);
        stage.appendChild(layer);
        row.layer = layer;
      }

      /* Whole-row link — only for a real URL, never for "#"/empty */
      var btn = li.querySelector('.list-item-content__button');
      var href = usableHref(btn);
      if (href) {
        var a = document.createElement('a');
        a.className = NS + '-link';
        a.href = href;
        if (btn.getAttribute('target')) a.target = btn.getAttribute('target');
        if (a.target === '_blank') a.rel = 'noopener';
        var titleEl = li.querySelector('.list-item-content__title');
        var label = [titleEl ? titleEl.textContent : '', btn.textContent || ''].map(function (s) {
          return String(s).replace(/\s+/g, ' ').trim();
        }).filter(Boolean).join(' — ');
        var sr = document.createElement('span');
        sr.className = NS + '-sr';
        sr.textContent = label || href;
        a.appendChild(sr);
        li.insertBefore(a, li.firstChild);
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-hidden', 'true');
        addClass(li, NS + '-has-link');
        row.link = a;
      }
      inst.rows.push(row);
    });

    root.insertBefore(stage, ul);
    layoutStage(inst);
    bindInstance(inst);
    applyMode(inst);
    dbg('mounted list with', inst.rows.length, 'rows', root);
    return inst;
  }

  /** Keep the stage exactly over the <ul> so % widths match the list. */
  function layoutStage(inst) {
    try {
      var ul = inst.ul, s = inst.stage;
      if (!ul || !s) return;
      s.style.left   = ul.offsetLeft + 'px';
      s.style.top    = ul.offsetTop + 'px';
      s.style.width  = ul.offsetWidth + 'px';
      s.style.height = ul.offsetHeight + 'px';
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. STATE
  // ─────────────────────────────────────────────────────────────────

  function setActive(inst, row) {
    if (inst.active === row) return;
    var wasVisible = !!inst.active;
    if (inst.active) {
      removeClass(inst.active.li, NS + '-active');
      removeClass(inst.active.layer, NS + '-layer-on');
    }
    inst.active = row || null;
    if (row) {
      addClass(row.li, NS + '-active');
      addClass(row.layer, NS + '-layer-on');
      addClass(inst.root, NS + '-has-active');
      if (!wasVisible) snap(inst);     // first reveal appears in place, no fly-in
      kick(inst);
    } else {
      removeClass(inst.root, NS + '-has-active');
    }
  }

  function snap(inst) {
    inst.cur.x = inst.prevX = inst.tgt.x;
    inst.cur.y = inst.tgt.y;
    inst.cur.r = 0;
    writeVars(inst);
  }

  function writeVars(inst) {
    var s = inst.stage;
    if (!s) return;
    s.style.setProperty('--' + NS + '-x', inst.cur.x.toFixed(2) + 'px');
    s.style.setProperty('--' + NS + '-y', inst.cur.y.toFixed(2) + 'px');
    s.style.setProperty('--' + NS + '-r', inst.cur.r.toFixed(3) + 'deg');
  }

  /** Target point for the image, in stage coordinates. */
  function aim(inst, row) {
    var sr = inst.stage.getBoundingClientRect();
    var anchor = sr.width * CFG.imgPosition / 100;
    if (reducedMotion() || !inst.pointerIn || !row) {
      // Keyboard focus or reduced motion: centre the image on the row
      var target = row || inst.active;
      if (!target) return;
      var rr = target.li.getBoundingClientRect();
      inst.tgt.x = anchor;
      inst.tgt.y = rr.top + rr.height / 2 - sr.top;
      return;
    }
    var lx = inst.cx - sr.left;
    inst.tgt.x = anchor + (lx - anchor) * CFG.followX;
    inst.tgt.y = inst.cy - sr.top;
  }

  function kick(inst) {
    if (inst.raf || inst.mode !== 'hover') return;
    inst.raf = requestAnimationFrame(function () { tick(inst); });
  }

  function tick(inst) {
    inst.raf = 0;
    try {
      if (inst.active) aim(inst, inst.pointerIn ? inst.active : null);
      var e = reducedMotion() ? 1 : CFG.followEase;
      inst.cur.x += (inst.tgt.x - inst.cur.x) * e;
      inst.cur.y += (inst.tgt.y - inst.cur.y) * e;
      var vx = inst.cur.x - inst.prevX;
      inst.prevX = inst.cur.x;
      var rt = 0;
      if (CFG.rotateOnMove && CFG.rotateMax > 0 && !reducedMotion()) {
        rt = Math.max(-CFG.rotateMax, Math.min(CFG.rotateMax, vx * 0.6));
      }
      inst.cur.r += (rt - inst.cur.r) * 0.12;
      writeVars(inst);
      var moving = Math.abs(inst.tgt.x - inst.cur.x) > 0.1 || Math.abs(inst.tgt.y - inst.cur.y) > 0.1 || Math.abs(inst.cur.r) > 0.02;
      if (inst.active || moving) kick(inst);
    } catch (err) { dbg('tick error', err); }
  }

  /** Row under a viewport point, by geometry (also correct while scrolling). */
  function rowAt(inst, x, y) {
    for (var i = 0; i < inst.rows.length; i++) {
      var r = inst.rows[i].li.getBoundingClientRect();
      if (y >= r.top && y < r.bottom && x >= r.left && x <= r.right) return inst.rows[i];
    }
    return null;
  }

  function pointerUpdate(inst) {
    if (inst.mode !== 'hover') return;
    var rr = inst.root.getBoundingClientRect();
    inst.pointerIn = inst.cx >= rr.left && inst.cx <= rr.right && inst.cy >= rr.top && inst.cy <= rr.bottom;
    var row = focusedRow(inst) || (inst.pointerIn ? rowAt(inst, inst.cx, inst.cy) : null);
    if (row) aim(inst, row);   // aim first, so a first reveal snaps to the cursor
    setActive(inst, row);
    if (row) kick(inst);
  }

  function focusedRow(inst) {
    var a = document.activeElement;
    if (!a || !a.classList || !a.classList.contains(NS + '-link')) return null;
    var fv = false;
    try { fv = a.matches(':focus-visible'); } catch (e) { fv = true; }
    if (!fv) return null;
    for (var i = 0; i < inst.rows.length; i++) if (inst.rows[i].link === a) return inst.rows[i];
    return null;
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. MODES — hover (desktop) · touch: centerline | tap | off
  // ─────────────────────────────────────────────────────────────────

  function applyMode(inst) {
    var mode = canHover() ? 'hover' : 'touch';
    if (mode === inst.mode) return;
    inst.mode = mode;
    setActive(inst, null);
    if (inst.raf) { cancelAnimationFrame(inst.raf); inst.raf = 0; }
    removeClass(inst.root, NS + '-is-hover');
    removeClass(inst.root, NS + '-is-touch');
    addClass(inst.root, NS + '-is-' + mode);
    if (reducedMotion()) addClass(inst.root, NS + '-reduced'); else removeClass(inst.root, NS + '-reduced');
    if (mode === 'touch' && CFG.mobileMode === 'centerline') startCenterline(inst);
    dbg('mode', mode, CFG.mobileMode);
  }

  /**
   * The trigger line sits mid-screen. A plain mid-screen line can never
   * reach the last rows of a list near the bottom of the page (or the first
   * rows of a list at the very top) — the page stops scrolling first. So in
   * the last/first stretch of scroll the line slides towards those rows,
   * and every row gets its turn.
   */
  function triggerLine(inst) {
    var vh = window.innerHeight, mid = vh / 2, line = mid;
    var se = document.scrollingElement || document.documentElement;
    var y = window.pageYOffset || se.scrollTop || 0;
    var max = Math.max(0, se.scrollHeight - vh);
    var rows = inst.rows;
    if (!rows.length) return mid;
    var first = rows[0].li.getBoundingClientRect();
    var last = rows[rows.length - 1].li.getBoundingClientRect();
    var firstAtTop = first.top + y + first.height / 2;                    // centre at scrollY = 0
    var lastAtBottom = last.top + last.height / 2 - (max - y);            // centre at max scroll
    var dTop = Math.min(mid, Math.max(0, mid - firstAtTop));
    var dBottom = Math.min(vh - mid - 1, Math.max(0, lastAtBottom - mid + 1));
    if (dTop > 0 && y < dTop) line = mid - (dTop - y);
    else if (dBottom > 0 && max - y < dBottom) line = mid + (dBottom - (max - y));
    return line;
  }

  function centerlineUpdate(inst) {
    if (inst.mode !== 'touch' || CFG.mobileMode !== 'centerline') return;
    var line = triggerLine(inst), hit = null;
    for (var i = 0; i < inst.rows.length; i++) {
      var r = inst.rows[i].li.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { hit = inst.rows[i]; break; }
    }
    if (inst.stage) inst.stage.style.setProperty('--' + NS + '-line', line.toFixed(1) + 'px');
    dbg('centerline', Math.round(line), hit ? hit.index : -1);
    setActive(inst, hit);
  }

  function startCenterline(inst) {
    var queued = false;
    var onScroll = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; try { centerlineUpdate(inst); } catch (e) {} });
    };
    if (!inst.centerlineBound) {
      inst.centerlineBound = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }
    onScroll();
  }

  function bindInstance(inst) {
    var root = inst.root;

    /* Desktop pointer: geometry-based hit test */
    root.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      inst.cx = e.clientX; inst.cy = e.clientY;
      pointerUpdate(inst);
    }, { passive: true });
    root.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch' || inst.mode !== 'hover') return;
      inst.pointerIn = false;
      setActive(inst, focusedRow(inst));
    }, { passive: true });

    /* Scrolling under a still cursor changes the row beneath it */
    var scrollQueued = false;
    window.addEventListener('scroll', function () {
      if (inst.mode !== 'hover' || !inst.pointerIn || scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(function () { scrollQueued = false; pointerUpdate(inst); });
    }, { passive: true });

    /* Keyboard: focus-visible on a row link reveals its image */
    inst.rows.forEach(function (row) {
      if (!row.link) return;
      row.link.addEventListener('focus', function () {
        var fr = focusedRow(inst);
        if (!fr) return;
        if (inst.mode === 'hover') { inst.pointerIn = false; aim(inst, fr); }
        setActive(inst, fr);
      });
      row.link.addEventListener('blur', function () {
        setTimeout(function () {
          if (focusedRow(inst)) return;
          if (inst.mode === 'hover' && inst.pointerIn) { pointerUpdate(inst); return; }
          if (inst.mode === 'hover' || CFG.mobileMode === 'tap') setActive(inst, null);
        }, 0);
      });
    });

    /* Tap mode: first tap reveals, second tap follows the link */
    root.addEventListener('click', function (e) {
      if (inst.mode !== 'touch' || CFG.mobileMode !== 'tap') return;
      var li = e.target && e.target.closest ? e.target.closest('.' + NS + '-row') : null;
      var row = null;
      for (var i = 0; i < inst.rows.length; i++) if (inst.rows[i].li === li) row = inst.rows[i];
      if (!row) return;
      if (inst.active !== row) {
        if (row.link || row.layer) e.preventDefault();
        setActive(inst, row);
      } else if (!row.link) {
        setActive(inst, null);
      }
    });
    document.addEventListener('click', function (e) {
      if (inst.mode !== 'touch' || CFG.mobileMode !== 'tap' || !inst.active) return;
      if (e.target && root.contains(e.target)) return;
      setActive(inst, null);
    }, { passive: true });

    /* Layout changes */
    var relayout = function () { layoutStage(inst); applyMode(inst); };
    if ('ResizeObserver' in window) {
      try { inst.ro = new ResizeObserver(function () { layoutStage(inst); }); inst.ro.observe(inst.ul); } catch (e) {}
    }
    window.addEventListener('resize', relayout, { passive: true });
    onMQ(mqHover, function () { applyMode(inst); });
    onMQ(mqReduce, function () { inst.mode = ''; applyMode(inst); });
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. LICENSING (shared manager, non-blocking)
  // ─────────────────────────────────────────────────────────────────

  function loadLicensing(firstRoot) {
    setTimeout(function () {
      try {
        var start = function () {
          try {
            var lm = new window.AnavoLicenseManager(PLUGIN_ID, VERSION, {
              licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
              showUI: true
            });
            lm.init().then(function () {
              if (!lm.isLicensed && firstRoot) lm.insertWatermark(firstRoot);
            }).catch(function () {});
          } catch (e) {
            console.warn('[' + PLUGIN_ID + '] License init error:', e && e.message);
          }
        };
        if (window.AnavoLicenseManager) { start(); return; }
        var src;
        try { src = new URL('../_shared/licensing.min.js', scriptEl.src).href; }
        catch (e) { src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js'; }
        var lic = document.createElement('script');
        lic.src = src;
        lic.onload = function () { if (window.AnavoLicenseManager) start(); };
        lic.onerror = function () { console.warn('[' + PLUGIN_ID + '] Could not load licensing module'); };
        (document.head || document.documentElement).appendChild(lic);
      } catch (e) { /* licensing is non-blocking */ }
    }, 1500);
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. BOOT
  // ─────────────────────────────────────────────────────────────────

  var instances = [];

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  window.AnavoPluginState.plugins = window.AnavoPluginState.plugins || {};
  window.AnavoPluginState.plugins[PLUGIN_ID] = { version: VERSION, config: CFG, instances: instances };

  function poll(attempts) {
    try {
      var lists = findLists();
      if (lists.length) { init(lists); return; }
    } catch (e) { dbg('poll error', e); }
    if (attempts < 50) { setTimeout(function () { poll(attempts + 1); }, 100); return; }
    console.warn('[Anavo ' + PLUGIN_ID + '] No List section found for ' +
      (CFG.sectionId ? 'sectionId="' + CFG.sectionId + '"' : 'target="' + CFG.target + '"') + ' — nothing to do.');
  }

  function init(lists) {
    try {
      injectStyles();
      lists.forEach(function (list) {
        try {
          var inst = mountList(list);
          if (inst) instances.push(inst);
        } catch (e) { dbg('mount error', e); }
      });
      if (!instances.length) return;
      console.log('✅ ' + PLUGIN_ID + ' v' + VERSION + ' Active! (' + instances.length + ' list' + (instances.length > 1 ? 's' : '') + ')');
      loadLicensing(instances[0].root);
    } catch (e) {
      console.warn('[Anavo ' + PLUGIN_ID + '] Init error:', e && e.message);
    }
  }

  function boot() {
    try {
      if (isEditorMode()) { dbg('Squarespace editor detected — skipped'); return; }
      poll(0);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
