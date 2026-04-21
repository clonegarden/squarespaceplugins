/**
 * ============================================================
 * MARQUEE MENU PLUGIN — Anavo Tech
 * ============================================================
 * @version  1.0.0
 * @author   Anavo Tech
 * @license  Commercial — anavo.tech/plugins
 *
 * EFFECT:
 *   Hover reveals a scrolling marquee strip that slides in from
 *   the closest edge (top or bottom) of each menu item. On
 *   mouseenter, the marquee slides in from the detected edge;
 *   on mouseleave, it slides back out in the exit direction.
 *   The marquee strip scrolls horizontally containing the item
 *   label repeated, with optional images.
 *   Based on the Codrops MarqueeMenu concept — GSAP replaced
 *   with pure CSS transitions.
 *
 * USAGE:
 *   1. Add data-anavo-marquee to each nav/menu item element:
 *        <li data-anavo-marquee>Photography</li>
 *   2. Paste in Settings → Advanced → Code Injection → FOOTER:
 *        <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/marquee-menu/marquee-menu.js
 *          ?domain=yoursite.com
 *          &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
 *          &supabaseKey=YOUR_ANON_KEY
 *          &speed=20s
 *          &bgColor=%23111111
 *          &textColor=%23f0ede8
 *        "></script>
 *
 * PARAMETERS (URL query string, hex colors URL-encoded %23 for #):
 *   domain          license check hostname               default: location.hostname
 *   supabaseUrl     Supabase project URL
 *   supabaseKey     Supabase anon key
 *   selector        CSS selector for items to enhance    default: [data-anavo-marquee]
 *   marqueeText     pipe-separated text per item         default: item's own text content
 *                   e.g. "Photography•"|"Weddings•"
 *   speed           marquee scroll duration              default: 20s
 *   bgColor         marquee strip background             default: #111111
 *   textColor       marquee text color                   default: #f0ede8
 *   fontSize        marquee text size                    default: 1.1rem
 *   fontFamily      font family                          default: inherit
 *   fontWeight      font weight                          default: 400
 *   height          marquee strip height                 default: 3.5rem
 *   letterSpacing   letter spacing                       default: 0.1em
 *   separator       character between repeated text      default: •
 *   target          CSS selector for mount point         default: [data-anavo-marquee-menu]
 * ============================================================
 */

;(function () {
  'use strict';

  var PLUGIN_ID = 'MarqueeMenu';
  var VERSION   = '1.0.0';

  // ─────────────────────────────────────────────────────────────────
  // 1. SCRIPT REF + PARAM PARSING
  // ─────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var all = document.querySelectorAll('script[src*="marquee-menu"]');
    return all[all.length - 1];
  })();

  var params;
  try { params = new URL(scriptEl.src).searchParams; }
  catch (e) { params = new URLSearchParams(); }

  /** Get param, decode, fallback if absent/empty */
  function p(key, fallback) {
    var v = params.get(key);
    if (v === null || v === '') return fallback;
    try { return decodeURIComponent(v); } catch (e) { return v; }
  }

  var CFG = {
    domain:        p('domain',        window.location.hostname),
    supabaseUrl:   p('supabaseUrl',   ''),
    supabaseKey:   p('supabaseKey',   ''),
    selector:      p('selector',      '[data-anavo-marquee]'),
    marqueeText:   p('marqueeText',   ''),
    speed:         p('speed',         '20s'),
    bgColor:       p('bgColor',       '#111111'),
    textColor:     p('textColor',     '#f0ede8'),
    fontSize:      p('fontSize',      '1.1rem'),
    fontFamily:    p('fontFamily',    'inherit'),
    fontWeight:    p('fontWeight',    '400'),
    height:        p('height',        '3.5rem'),
    letterSpacing: p('letterSpacing', '0.1em'),
    separator:     p('separator',     '•'),
    target:        p('target',        '[data-anavo-marquee-menu]')
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. IDEMPOTENCY GUARD
  // ─────────────────────────────────────────────────────────────────

  window.AnavoPluginState = window.AnavoPluginState || {};
  if (window.AnavoPluginState[PLUGIN_ID]) return;
  window.AnavoPluginState[PLUGIN_ID] = { version: VERSION, active: true };

  // ─────────────────────────────────────────────────────────────────
  // 3. LICENSE CHECK — Supabase REST (non-blocking)
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
      .catch(function () {}); // never block UI on license failure
    } catch (e) {}
  }

  function _licenseNotice() {
    if (document.getElementById('anavo-mm-license-notice')) return;
    var el = document.createElement('div');
    el.id = 'anavo-mm-license-notice';
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
      'style="color:#ffd700;text-decoration:none">Get MarqueeMenu license \u2192</a>';
    document.body.appendChild(el);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. MOBILE DETECTION
  // ─────────────────────────────────────────────────────────────────

  function isMobile() {
    return window.innerWidth <= 800;
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. CSS INJECTION
  // ─────────────────────────────────────────────────────────────────

  function injectStyles() {
    var existing = document.getElementById('anavo-mm-styles');
    if (existing) existing.remove();

    var css =

      /* ── Keyframe for horizontal scroll ────────────────────────── */
      '@keyframes anavo-mm-scroll{' +
        'from{transform:translateX(0)!important;}' +
        'to{transform:translateX(-50%)!important;}' +
      '}' +

      /* ── Each enhanced item needs relative positioning ─────────── */
      '.anavo-mm-item{' +
        'position:relative!important;' +
        'overflow:hidden!important;' +
      '}' +

      /* ── Marquee overlay — full cover, hidden by translateY ─────── */
      '.anavo-mm-marquee{' +
        'position:absolute!important;' +
        'top:0!important;' +
        'left:0!important;' +
        'width:100%!important;' +
        'height:100%!important;' +
        'overflow:hidden!important;' +
        'pointer-events:none!important;' +
        'z-index:10000!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'background-color:' + CFG.bgColor + '!important;' +
        'box-sizing:border-box!important;' +
        /* No transition here — set by JS before animating */
      '}' +

      /* Transition class — added by JS after setting initial position */
      '.anavo-mm-marquee.anavo-mm-transitioning{' +
        'transition:transform 0.6s cubic-bezier(0.19,1,0.22,1)!important;' +
      '}' +

      /* ── Inner wrap — counter-translates to keep text stable ────── */
      '.anavo-mm-marquee-inner-wrap{' +
        'width:100%!important;' +
        'overflow:hidden!important;' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'height:' + CFG.height + '!important;' +
      '}' +

      /* Transition class for inner wrap */
      '.anavo-mm-marquee-inner-wrap.anavo-mm-transitioning{' +
        'transition:transform 0.6s cubic-bezier(0.19,1,0.22,1)!important;' +
      '}' +

      /* ── Scrolling track — doubled content for seamless loop ─────── */
      '.anavo-mm-marquee-inner{' +
        'display:flex!important;' +
        'align-items:center!important;' +
        'white-space:nowrap!important;' +
        'will-change:transform!important;' +
        'animation:anavo-mm-scroll ' + CFG.speed + ' linear infinite!important;' +
        'animation-play-state:running!important;' +
      '}' +

      /* ── Text spans inside the marquee ──────────────────────────── */
      '.anavo-mm-marquee-inner span{' +
        'display:inline-block!important;' +
        'padding:0 0.4em!important;' +
        'color:' + CFG.textColor + '!important;' +
        'font-size:' + CFG.fontSize + '!important;' +
        'font-family:' + CFG.fontFamily + '!important;' +
        'font-weight:' + CFG.fontWeight + '!important;' +
        'letter-spacing:' + CFG.letterSpacing + '!important;' +
        'line-height:1!important;' +
        'user-select:none!important;' +
      '}';

    var style = document.createElement('style');
    style.id = 'anavo-mm-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. CLOSEST EDGE DETECTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Determine whether the cursor is closer to the top or bottom edge
   * of the element.
   *
   * @param {number} mouseX  - cursor X relative to element left edge
   * @param {number} mouseY  - cursor Y relative to element top edge
   * @param {number} w       - element width
   * @param {number} h       - element height
   * @returns {'top'|'bottom'}
   */
  function closestEdge(mouseX, mouseY, w, h) {
    var topDist = (mouseX - w / 2) * (mouseX - w / 2) + (mouseY - 0)   * (mouseY - 0);
    var botDist = (mouseX - w / 2) * (mouseX - w / 2) + (mouseY - h)   * (mouseY - h);
    return topDist <= botDist ? 'top' : 'bottom';
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. DOM STRUCTURE BUILDER
  // ─────────────────────────────────────────────────────────────────

  /**
   * Build the marquee text string for a given item index.
   * If CFG.marqueeText is provided, use the pipe-split entry at that index.
   * Otherwise, fall back to the item element's trimmed text content.
   *
   * @param {Element} itemEl  - the matched element
   * @param {number}  index   - zero-based item index
   * @returns {string}
   */
  function getMarqueeText(itemEl, index) {
    if (CFG.marqueeText) {
      var parts = CFG.marqueeText.split('|');
      if (parts[index] && parts[index].trim() !== '') {
        return parts[index].trim();
      }
    }
    // Fall back to item's direct text — grab only text nodes to avoid
    // picking up child element content (e.g. nested links)
    var text = '';
    itemEl.childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    });
    text = text.trim();
    if (!text) {
      // If no direct text nodes, take full textContent as fallback
      text = (itemEl.textContent || '').trim();
    }
    return text + ' ' + CFG.separator + ' ';
  }

  /**
   * Inject the marquee overlay DOM into a single item element.
   *
   * @param {Element} itemEl   - the menu item to enhance
   * @param {number}  index    - zero-based index within matched set
   */
  function buildMarquee(itemEl, index) {
    // Mark item as a positioned container
    itemEl.classList.add('anavo-mm-item');

    var marqueeText = getMarqueeText(itemEl, index);

    // .anavo-mm-marquee
    var marqueeEl = document.createElement('div');
    marqueeEl.className = 'anavo-mm-marquee';
    marqueeEl.setAttribute('aria-hidden', 'true');

    // .anavo-mm-marquee-inner-wrap
    var innerWrapEl = document.createElement('div');
    innerWrapEl.className = 'anavo-mm-marquee-inner-wrap';

    // .anavo-mm-marquee-inner  — doubled content for seamless loop
    var innerEl = document.createElement('div');
    innerEl.className = 'anavo-mm-marquee-inner';

    var span1 = document.createElement('span');
    span1.textContent = marqueeText;
    var span2 = document.createElement('span');
    span2.textContent = marqueeText;

    innerEl.appendChild(span1);
    innerEl.appendChild(span2);
    innerWrapEl.appendChild(innerEl);
    marqueeEl.appendChild(innerWrapEl);
    itemEl.appendChild(marqueeEl);

    // Start fully hidden (no transition so it's instant)
    marqueeEl.style.transform    = 'translateY(101%)';
    innerWrapEl.style.transform  = 'translateY(-101%)';

    // Store references on the element for the event handlers
    itemEl._anavoMarquee         = marqueeEl;
    itemEl._anavoMarqueeInnerWrap = innerWrapEl;
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Attach mouseenter / mouseleave handlers to a single item.
   *
   * @param {Element} itemEl
   */
  function attachHandlers(itemEl) {
    var marqueeEl    = itemEl._anavoMarquee;
    var innerWrapEl  = itemEl._anavoMarqueeInnerWrap;

    itemEl.addEventListener('mouseenter', function (e) {
      if (isMobile()) return;

      var rect  = itemEl.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;
      var edge  = closestEdge(mouseX, mouseY, rect.width, rect.height);

      // Step 1: Remove transition class, snap to hidden off-screen position
      marqueeEl.classList.remove('anavo-mm-transitioning');
      innerWrapEl.classList.remove('anavo-mm-transitioning');

      if (edge === 'top') {
        marqueeEl.style.transform   = 'translateY(-101%)';
        innerWrapEl.style.transform = 'translateY(101%)';
      } else {
        marqueeEl.style.transform   = 'translateY(101%)';
        innerWrapEl.style.transform = 'translateY(-101%)';
      }

      // Step 2: On next frame, add transition and animate to 0%
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          marqueeEl.classList.add('anavo-mm-transitioning');
          innerWrapEl.classList.add('anavo-mm-transitioning');

          marqueeEl.style.transform   = 'translateY(0%)';
          innerWrapEl.style.transform = 'translateY(0%)';
        });
      });
    });

    itemEl.addEventListener('mouseleave', function (e) {
      if (isMobile()) return;

      var rect  = itemEl.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;
      var edge  = closestEdge(mouseX, mouseY, rect.width, rect.height);

      // Ensure transition class is present before animating out
      marqueeEl.classList.add('anavo-mm-transitioning');
      innerWrapEl.classList.add('anavo-mm-transitioning');

      if (edge === 'top') {
        marqueeEl.style.transform   = 'translateY(-101%)';
        innerWrapEl.style.transform = 'translateY(101%)';
      } else {
        marqueeEl.style.transform   = 'translateY(101%)';
        innerWrapEl.style.transform = 'translateY(-101%)';
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. MAIN INIT — processes all matched elements
  // ─────────────────────────────────────────────────────────────────

  function init() {
    if (isMobile()) return;

    injectStyles();
    checkLicense();

    var items = document.querySelectorAll(CFG.selector);
    if (!items.length) return;

    var index = 0;
    items.forEach(function (itemEl) {
      // Idempotency: skip already-processed elements
      if (itemEl.getAttribute('data-anavo-mm-done') === 'true') return;
      itemEl.setAttribute('data-anavo-mm-done', 'true');

      buildMarquee(itemEl, index);
      attachHandlers(itemEl);
      index++;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. POLL FOR TARGET / DOM READY
  // ─────────────────────────────────────────────────────────────────

  var _pollCount    = 0;
  var _pollMax      = 50;
  var _pollInterval = 100; // ms

  function poll() {
    var target = document.querySelector(CFG.target);
    var hasItems = document.querySelectorAll(CFG.selector).length > 0;

    if ((target || hasItems) && document.body) {
      init();
      return;
    }

    _pollCount++;
    if (_pollCount < _pollMax) {
      setTimeout(poll, _pollInterval);
    } else {
      console.warn('[Anavo ' + PLUGIN_ID + '] Target "' + CFG.target + '" not found after ' + (_pollMax * _pollInterval / 1000) + 's.');
    }
  }

  // Also handle window resize — disable/re-enable on mobile crossing
  var _resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      // If crossing into mobile, hide all marquees
      if (isMobile()) {
        var done = document.querySelectorAll('[data-anavo-mm-done="true"]');
        done.forEach(function (itemEl) {
          if (itemEl._anavoMarquee) {
            itemEl._anavoMarquee.classList.remove('anavo-mm-transitioning');
            itemEl._anavoMarquee.style.transform = 'translateY(101%)';
          }
          if (itemEl._anavoMarqueeInnerWrap) {
            itemEl._anavoMarqueeInnerWrap.classList.remove('anavo-mm-transitioning');
            itemEl._anavoMarqueeInnerWrap.style.transform = 'translateY(-101%)';
          }
        });
      }
    }, 200);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', poll);
  } else {
    poll();
  }

})();
