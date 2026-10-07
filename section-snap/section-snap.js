/**
 * ============================================================
 * SECTION SNAP — Anavo Tech
 * ============================================================
 * @version  1.1.0
 * @author   Anavo Tech
 * @license  Commercial — plugins.anavo.tech
 *
 * EFFECT:
 *   Scroll-snaps a chosen RANGE of page sections (by default the
 *   first two), then releases the page so everything below scrolls
 *   normally. Built for the classic "hero locks, second section
 *   clicks into place, rest of the page is free" pattern.
 *
 * WHY THIS EXISTS:
 *   The hand-rolled version of this effect uses
 *   `.page-section:nth-of-type(n)`, which is scoped PER PARENT — so
 *   the footer's own first .page-section also matches and becomes a
 *   rogue snap target. Combined with `scroll-snap-type: mandatory`
 *   and no snap point in between, any downward scroll teleports the
 *   visitor to the footer. This plugin resolves sections in JS,
 *   ignores header/footer, and tags only the intended elements.
 *
 * PARAMETERS:
 *   from        first section to snap (1-based)     default: 1
 *   to          last section to snap (1-based)      default: 2
 *   mode        mandatory | proximity               default: mandatory
 *   fullHeight  force the `from` section to 100svh  default: true
 *   center      flex-center the `from` section      default: false
 *   offset      scroll-margin-top (sticky header)   default: 0px
 *   minWidth    disable below this viewport width   default: 768
 *   release     free the page after the last snap   default: true
 *   reArm       re-enable when back at the top      default: true
 *   smooth      scroll-behavior: smooth on <html>   default: false
 *   selector    section selector                    default: .page-section
 *   container   scope override (CSS selector)       default: auto
 *   debug       console diagnostics                 default: false
 *   domain      license check hostname
 *   supabaseUrl ignored since v1.1.0 (shared licensing)
 *   supabaseKey ignored since v1.1.0 (shared licensing)
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'SectionSnap';
  var VERSION   = '1.1.0';
  var NS        = 'anavo-section-snap';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="section-snap"]');
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
  function pBool(key, fallback) {
    var v = p(key, null);
    if (v === null) return fallback;
    return v === 'true' || v === '1';
  }
  function pInt(key, fallback) {
    var n = parseInt(p(key, ''), 10);
    return isNaN(n) ? fallback : n;
  }

  var CFG = {
    domain:      p('domain',      window.location.hostname),
    supabaseUrl: p('supabaseUrl', ''),
    supabaseKey: p('supabaseKey', ''),
    from:        Math.max(1, pInt('from', 1)),
    to:          Math.max(1, pInt('to', 2)),
    mode:        p('mode', 'mandatory') === 'proximity' ? 'proximity' : 'mandatory',
    fullHeight:  pBool('fullHeight', true),
    center:      pBool('center', false),
    offset:      p('offset', '0px'),
    minWidth:    pInt('minWidth', 768),
    release:     pBool('release', true),
    reArm:       pBool('reArm', true),
    // Off by default: `scroll-behavior:smooth` on <html> is global and would
    // retime every anchor link on the site. Snap itself is animated by the UA.
    smooth:      pBool('smooth', false),
    selector:    p('selector', '.page-section'),
    container:   p('container', ''),
    debug:       pBool('debug', false)
  };

  function log() {
    if (!CFG.debug) return;
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ['[Anavo ' + PLUGIN_ID + ']'].concat(args));
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || {};
  if (window.AnavoPluginState[PLUGIN_ID]) return;
  window.AnavoPluginState[PLUGIN_ID] = { version: VERSION, active: true };

  // ─────────────────────────────────────────────────────────────────
  // 3. LICENSE CHECK — shared AnavoLicenseManager (non-blocking)
  // ─────────────────────────────────────────────────────────────────
  // Same path as every other commercial plugin: _shared/licensing.min.js
  // checks this domain against api.anavo.tech (licenses table, plugin =
  // PLUGIN_ID), lets preview/dev hosts through and shows the shared
  // unlicensed notice. It never blocks the effect.
  // supabaseUrl / supabaseKey are still accepted for old snippets, but unused.

  var LICENSING_SRC = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
  var LICENSES_JSON = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json';

  function checkLicense() {
    try {
      var run = function () {
        try {
          var lm = new window.AnavoLicenseManager(PLUGIN_ID, VERSION, {
            licenseServer: LICENSES_JSON,
            showUI: true
          });
          lm.init();
        } catch (e) {
          console.warn('[Anavo ' + PLUGIN_ID + '] License init error:', e.message);
        }
      };
      if (window.AnavoLicenseManager) { run(); return; }
      var pending = document.querySelector('script[src="' + LICENSING_SRC + '"]');
      if (pending) { pending.addEventListener('load', run); return; }
      var s = document.createElement('script');
      s.src = LICENSING_SRC;
      s.async = true;
      s.onload = run;
      s.onerror = function () {
        console.warn('[Anavo ' + PLUGIN_ID + '] Could not load licensing module');
      };
      document.head.appendChild(s);
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  var STYLE_ID = 'anavo-section-snap-styles';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var css =
      // Snap is armed by a class on <html>, so releasing the page is a single
      // class toggle and never touches the sections' own layout.
      'html.' + NS + '-armed{' +
        'scroll-snap-type:y ' + CFG.mode + ';' +
        (CFG.smooth ? 'scroll-behavior:smooth;' : '') +
      '}' +

      // Snap targets are tagged in JS, never by :nth-of-type — that selector is
      // parent-relative and silently promotes the footer to a snap point.
      '.' + NS + '-point{' +
        'scroll-snap-align:start;' +
        'scroll-margin-top:' + CFG.offset + ';' +
      '}' +

      // snap-stop belongs on destinations only. On the origin section it makes
      // the browser refuse to release short wheel gestures.
      '.' + NS + '-point.' + NS + '-stop{' +
        'scroll-snap-stop:always;' +
      '}' +

      // Layout is applied unconditionally so arming/releasing causes no reflow.
      '.' + NS + '-full{' +
        'min-height:100vh;' +
        'min-height:100svh;' +
      '}' +

      '.' + NS + '-center{' +
        'display:flex;' +
        'flex-direction:column;' +
        'justify-content:center;' +
      '}' +

      '@media (prefers-reduced-motion:reduce){' +
        'html.' + NS + '-armed{scroll-snap-type:none;scroll-behavior:auto;}' +
      '}';

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. SECTION RESOLUTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Flat, document-ordered list of content sections. Anything inside a
   * <header> or <footer> is excluded — that is precisely the footer section
   * that :nth-of-type() would otherwise turn into a rogue snap target.
   */
  function collectSections() {
    var scope = document;
    if (CFG.container) {
      var custom = document.querySelector(CFG.container);
      if (custom) scope = custom;
      else log('container "' + CFG.container + '" not found, falling back to document');
    }

    var all = Array.prototype.slice.call(scope.querySelectorAll(CFG.selector));
    return all.filter(function (el) {
      return !el.closest('header, footer, [data-anavo-section-snap-ignore]');
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. MAIN LOGIC
  // ─────────────────────────────────────────────────────────────────

  var html    = document.documentElement;
  var points  = [];
  var lastPt  = null;
  var enabled = false;
  var TOL     = 2;
  // Returning to the top rarely lands on an exact 0 — browsers leave a few
  // pixels after programmatic scrolls and elastic overscroll. A 2px window
  // would leave the effect permanently disarmed.
  var REARM   = 24;

  function isEditor() {
    var b = document.body;
    return !!(b && (
      b.classList.contains('sqs-edit-mode') ||
      b.classList.contains('sqs-edit-mode-active') ||
      document.querySelector('.sqs-editing-overlay')
    ));
  }

  function offsetTop(el) {
    return el.getBoundingClientRect().top + window.pageYOffset;
  }

  function px(value) {
    var n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  /**
   * Themes with a fixed header set `scroll-padding-top` on the scroll
   * container, which insets the snapport. The scroll position a snap target
   * actually lands on is therefore offsetTop minus that inset — comparing a
   * raw `getBoundingClientRect().top` against 0 never matches, and the page
   * would stay armed forever.
   */
  function targetY(el) {
    var inset = px(getComputedStyle(html).scrollPaddingTop) +
                px(getComputedStyle(el).scrollMarginTop);
    return Math.max(0, offsetTop(el) - inset);
  }

  function maxScroll() {
    return html.scrollHeight - window.innerHeight;
  }

  /**
   * Snapping is only safe when the last target can actually be brought to the
   * top of the viewport. If the page is too short, `mandatory` has no reachable
   * snap point ahead and rubber-bands the visitor back to the hero.
   */
  function isFeasible() {
    if (!lastPt) return false;
    if (window.innerWidth < CFG.minWidth) return false;
    if (isEditor()) return false;
    return targetY(lastPt) <= maxScroll() + TOL;
  }

  function arm() {
    if (enabled) return;
    enabled = true;
    html.classList.add(NS + '-armed');
    log('armed');
  }

  function release() {
    if (!enabled) return;
    enabled = false;
    html.classList.remove(NS + '-armed');
    log('released');
  }

  function onScroll() {
    if (!lastPt) return;

    if (!isFeasible()) { release(); return; }

    var reachedLast = window.pageYOffset >= targetY(lastPt) - TOL;
    var atBottom    = window.pageYOffset >= maxScroll() - TOL;

    if (CFG.release && (reachedLast || atBottom)) {
      release();
      return;
    }
    if (CFG.reArm && window.pageYOffset <= targetY(points[0]) + REARM) arm();
  }

  function onResize() {
    if (!isFeasible()) { release(); return; }
    onScroll();
  }

  function setup(sections) {
    var from = Math.min(CFG.from, sections.length);
    var to   = Math.min(Math.max(CFG.to, from), sections.length);

    points = sections.slice(from - 1, to);
    if (points.length < 2) {
      console.warn('[Anavo ' + PLUGIN_ID + '] Need at least 2 sections in range ' +
        CFG.from + '–' + CFG.to + ' (found ' + points.length + ' of ' + sections.length + ').');
      return;
    }
    lastPt = points[points.length - 1];

    points.forEach(function (el, i) {
      el.classList.add(NS + '-point');
      if (i > 0) el.classList.add(NS + '-stop');
      el.setAttribute('data-anavo-section-snap', 'point');
    });

    var first = points[0];
    if (CFG.fullHeight) first.classList.add(NS + '-full');
    if (CFG.center)     first.classList.add(NS + '-center');

    log('sections:', sections.length, 'snap range:', from + '–' + to);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver) {
      new ResizeObserver(onResize).observe(document.body);
    }

    if (isFeasible() && window.pageYOffset <= targetY(points[0]) + REARM) arm();
    else log('not feasible on load — snap stays off');
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. INIT WITH DOM POLLING
  // ─────────────────────────────────────────────────────────────────

  var _attempts = 0;

  function init() {
    if (!document.body) {
      if (++_attempts < 50) { setTimeout(init, 100); }
      return;
    }

    var sections = collectSections();
    if (sections.length < 2) {
      if (++_attempts < 50) { setTimeout(init, 100); return; }
      console.warn('[Anavo ' + PLUGIN_ID + '] Fewer than 2 sections matched "' + CFG.selector + '".');
      return;
    }

    injectStyles();
    checkLicense();
    setup(sections);
  }

  'loading' === document.readyState
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
