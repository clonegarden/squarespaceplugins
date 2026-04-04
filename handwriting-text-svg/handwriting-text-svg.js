/**
 * =======================================
 * HANDWRITING TEXT SVG - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * What it does:
 * - Renders plain text as an inline SVG and animates a "handwriting" reveal
 *   by drawing the stroke of the text as if written by an invisible pen
 *   (stroke-dasharray / stroke-dashoffset trick).
 * - Two built-in presets: ink (thin, subtle filter) and marker (thick, bold).
 *
 * INSTALL (Settings → Advanced → Code Injection → Footer):
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/handwriting-text-svg/handwriting-text-svg.min.js?text=Hello%20World&preset=ink"></script>
 *
 * PARAMETERS (URL query string on the <script> src):
 * ?text=Hello          - Text to render (URL-encoded). Default: "Hello"
 * ?preset=ink          - Visual preset: ink | marker. Default: ink
 * ?position=...        - Insertion position: first-section | after-header | before-footer
 * ?targetId=myId       - Override insertion — insert inside element with this id
 * ?width=900           - SVG width in px. Default: 900
 * ?height=200          - SVG height in px. Default: 200
 * ?padding=20          - Horizontal padding inside SVG. Default: 20
 * ?align=center        - Text alignment: left | center | right. Default: center
 * ?fontFamily=Georgia  - Font family (URL-encoded). Default: "Georgia, serif"
 * ?fontSize=80         - Font size in px. Default: 80
 * ?fontWeight=400      - Font weight. Default: 400
 * ?letterSpacing=0     - Letter spacing in em. Default: 0
 * ?fillColor=111111    - Fill color (hex without # or full value). Default: preset value
 * ?strokeColor=111111  - Stroke color. Default: preset value
 * ?strokeWidth=2       - Stroke width. Default: preset value
 * ?linecap=round       - Stroke linecap: round | butt | square. Default: round
 * ?linejoin=round      - Stroke linejoin: round | miter | bevel. Default: round
 * ?duration=2.5        - Draw animation duration in seconds. Default: 2.5
 * ?delay=0             - Delay before animation starts in seconds. Default: 0
 * ?easing=ease         - CSS easing. Default: ease
 * ?fillReveal=true     - Reveal fill color after stroke finishes. Default: true
 * ?fillRevealMs=120    - Extra ms delay between stroke end and fill reveal. Default: 120
 * ?repeat=false        - Loop the animation. Default: false
 * ?repeatDelay=1.5     - Seconds between loops. Default: 1.5
 * ?reducedMotion=true  - Respect prefers-reduced-motion. Default: true
 * ?debug=false         - Enable verbose console logging. Default: false
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'HandwritingTextSVG';

  console.log(`\u270D\uFE0F ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  // ========================================
  // PRESETS
  // ========================================

  const PRESETS = {
    ink: {
      fillColor: '#111111',
      strokeColor: '#111111',
      strokeWidth: 2,
      linecap: 'round',
      linejoin: 'round',
      inkFilter: true,
      filterBlur: 0.15,
    },
    marker: {
      fillColor: '#1a1a1a',
      strokeColor: '#1a1a1a',
      strokeWidth: 6,
      linecap: 'round',
      linejoin: 'round',
      inkFilter: false,
      filterBlur: 0,
    },
  };

  // ========================================
  // CONFIG PARSING
  // ========================================

  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    function p(name) {
      return params.get(name);
    }

    function pBool(name, fallback) {
      const v = p(name);
      if (v === null) return fallback;
      return v !== 'false' && v !== '0';
    }

    function pNum(name, fallback) {
      const v = p(name);
      if (v === null || v === '') return fallback;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    }

    function fixColor(color) {
      if (!color || color === 'transparent') return color;
      if (color.startsWith('#') || color.startsWith('rgb')) return color;
      return '#' + color;
    }

    const presetName = p('preset') || 'ink';
    const preset = PRESETS[presetName] || PRESETS.ink;

    return {
      debug: pBool('debug', false),
      text: p('text') ? decodeURIComponent(p('text')) : 'Hello',
      preset: presetName,
      position: p('position') || 'first-section',
      targetId: p('targetId') || null,

      width: pNum('width', 900),
      height: pNum('height', 200),
      padding: pNum('padding', 20),

      align: p('align') || 'center',
      fontFamily: p('fontFamily') ? decodeURIComponent(p('fontFamily')) : 'Georgia, serif',
      fontSize: pNum('fontSize', 80),
      fontWeight: p('fontWeight') || '400',
      letterSpacing: pNum('letterSpacing', 0),

      fillColor: fixColor(p('fillColor')) || preset.fillColor,
      strokeColor: fixColor(p('strokeColor')) || preset.strokeColor,
      strokeWidth: pNum('strokeWidth', preset.strokeWidth),
      linecap: p('linecap') || preset.linecap,
      linejoin: p('linejoin') || preset.linejoin,
      inkFilter: preset.inkFilter,
      filterBlur: preset.filterBlur,

      duration: pNum('duration', 2.5),
      delay: pNum('delay', 0),
      easing: p('easing') || 'ease',

      fillReveal: pBool('fillReveal', true),
      fillRevealMs: pNum('fillRevealMs', 120),

      repeat: pBool('repeat', false),
      repeatDelay: pNum('repeatDelay', 1.5),

      reducedMotion: pBool('reducedMotion', true),
    };
  }

  const config = getScriptParams();

  function dbg(...args) {
    if (config.debug) console.log(`[${PLUGIN_NAME}]`, ...args);
  }

  const prefersReducedMotion =
    config.reducedMotion &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var uidCounter = 0;
  function nextUid() {
    return 'anavo-hts-' + (++uidCounter);
  }

  // ========================================
  // STYLES
  // ========================================

  function injectStyles() {
    const styleId = 'anavo-handwriting-text-svg-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = [
      '.anavo-hts-wrapper {',
      '  width: 100%;',
      '  display: block;',
      '  box-sizing: border-box;',
      '}',
      '.anavo-hts-wrapper svg {',
      '  display: block;',
      '  max-width: 100%;',
      '  height: auto;',
      '  overflow: visible;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ========================================
  // INSERTION
  // ========================================

  function findInsertionPoint() {
    if (config.targetId) {
      const custom = document.getElementById(config.targetId);
      if (custom) {
        dbg('Inserting into custom target: #' + config.targetId);
        return { element: custom, position: 'prepend' };
      }
    }

    switch (config.position) {
      case 'first-section': {
        const firstSection = document.querySelector(
          '.page-section:first-of-type, section:first-of-type, main > div:first-child'
        );
        if (firstSection) {
          dbg('Inserting before first section');
          return { element: firstSection, position: 'before' };
        }
        break;
      }
      case 'before-footer': {
        const footer = document.querySelector('footer, .footer, [data-nc-group="footer"]');
        if (footer) {
          dbg('Inserting before footer');
          return { element: footer, position: 'before' };
        }
        break;
      }
      case 'after-header': {
        const header = document.querySelector('header, .header, [data-nc-group="header"]');
        if (header) {
          dbg('Inserting after header');
          return { element: header, position: 'after' };
        }
        break;
      }
    }

    dbg('Inserting at beginning of body (fallback)');
    return { element: document.body, position: 'prepend' };
  }

  function insertWrapper(wrapper) {
    const { element, position } = findInsertionPoint();
    switch (position) {
      case 'before':
        element.parentNode.insertBefore(wrapper, element);
        break;
      case 'after':
        element.parentNode.insertBefore(wrapper, element.nextSibling);
        break;
      case 'prepend':
        element.insertBefore(wrapper, element.firstChild);
        break;
      default:
        element.appendChild(wrapper);
    }
    dbg('Wrapper inserted');
  }

  // ========================================
  // SVG BUILD
  // ========================================

  function buildSvg() {
    var ns = 'http://www.w3.org/2000/svg';
    var uid = nextUid();

    var x =
      config.align === 'left'
        ? config.padding
        : config.align === 'right'
          ? config.width - config.padding
          : config.width / 2;

    var anchor =
      config.align === 'left' ? 'start' : config.align === 'right' ? 'end' : 'middle';

    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(config.width));
    svg.setAttribute('height', String(config.height));
    svg.setAttribute('viewBox', '0 0 ' + config.width + ' ' + config.height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', config.text);
    svg.setAttribute('data-plugin', PLUGIN_NAME);
    svg.setAttribute('data-version', PLUGIN_VERSION);

    var defs = document.createElementNS(ns, 'defs');

    // Ink filter — subtle turbulence displacement + slight blur for ink feel
    if (config.inkFilter) {
      var filter = document.createElementNS(ns, 'filter');
      filter.setAttribute('id', uid + '-ink');
      filter.setAttribute('x', '-5%');
      filter.setAttribute('y', '-5%');
      filter.setAttribute('width', '110%');
      filter.setAttribute('height', '110%');

      var feTurb = document.createElementNS(ns, 'feTurbulence');
      feTurb.setAttribute('type', 'fractalNoise');
      feTurb.setAttribute('baseFrequency', '0.65');
      feTurb.setAttribute('numOctaves', '3');
      feTurb.setAttribute('stitchTiles', 'stitch');

      var feDisp = document.createElementNS(ns, 'feDisplacementMap');
      feDisp.setAttribute('in', 'SourceGraphic');
      feDisp.setAttribute('scale', '1.2');
      feDisp.setAttribute('xChannelSelector', 'R');
      feDisp.setAttribute('yChannelSelector', 'G');

      var feBlur = document.createElementNS(ns, 'feGaussianBlur');
      feBlur.setAttribute('stdDeviation', String(config.filterBlur));

      filter.appendChild(feTurb);
      filter.appendChild(feDisp);
      filter.appendChild(feBlur);
      defs.appendChild(filter);
    }

    svg.appendChild(defs);

    // Shared text attributes
    var sharedAttrs = [
      ['x', String(x)],
      ['y', String(config.height / 2)],
      ['text-anchor', anchor],
      ['dominant-baseline', 'middle'],
      ['font-family', config.fontFamily],
      ['font-size', String(config.fontSize)],
      ['font-weight', String(config.fontWeight)],
    ];
    if (config.letterSpacing) {
      sharedAttrs.push(['letter-spacing', String(config.letterSpacing) + 'em']);
    }

    // Fill text element (shows the final colored text)
    var fillEl = document.createElementNS(ns, 'text');
    sharedAttrs.forEach(function (pair) {
      fillEl.setAttribute(pair[0], pair[1]);
    });
    fillEl.setAttribute('fill', config.fillColor);
    fillEl.setAttribute('stroke', 'none');
    fillEl.style.opacity = config.fillReveal ? '0' : '1';
    if (config.fillReveal) {
      fillEl.style.transition = 'opacity 320ms ease';
    }
    fillEl.textContent = config.text;

    // Stroke text element (animates the "writing" reveal)
    var strokeEl = document.createElementNS(ns, 'text');
    sharedAttrs.forEach(function (pair) {
      strokeEl.setAttribute(pair[0], pair[1]);
    });
    strokeEl.setAttribute('fill', 'none');
    strokeEl.setAttribute('stroke', config.strokeColor);
    strokeEl.setAttribute('stroke-width', String(config.strokeWidth));
    strokeEl.setAttribute('stroke-linecap', config.linecap);
    strokeEl.setAttribute('stroke-linejoin', config.linejoin);
    strokeEl.setAttribute('vector-effect', 'non-scaling-stroke');
    if (config.inkFilter) {
      strokeEl.setAttribute('filter', 'url(#' + uid + '-ink)');
    }
    strokeEl.textContent = config.text;

    // Fill renders first (behind), stroke draws on top
    svg.appendChild(fillEl);
    svg.appendChild(strokeEl);

    return { svg: svg, strokeEl: strokeEl, fillEl: fillEl };
  }

  // ========================================
  // ANIMATION
  // ========================================

  function runAnimation(strokeEl, fillEl) {
    if (prefersReducedMotion) {
      // Reduced motion: skip animation, show final state immediately
      strokeEl.style.opacity = '0';
      fillEl.style.opacity = '1';
      return;
    }

    var length = 0;
    try {
      length = strokeEl.getComputedTextLength();
    } catch (_e) {
      length = 1200;
    }
    length = Math.max(200, length);

    // Set up dash so the stroke starts invisible
    strokeEl.style.strokeDasharray = String(length);
    strokeEl.style.strokeDashoffset = String(length);
    strokeEl.style.opacity = '1';

    // Force reflow so the browser registers the initial dash state
    void strokeEl.getBoundingClientRect();

    var durationMs = Math.max(100, config.duration * 1000);
    var delayMs = Math.max(0, config.delay * 1000);

    // CSS transition: animate dashoffset from length → 0 (draw the stroke)
    strokeEl.style.transition =
      'stroke-dashoffset ' + durationMs + 'ms ' + config.easing + ' ' + delayMs + 'ms';

    requestAnimationFrame(function () {
      strokeEl.style.strokeDashoffset = '0';
    });

    // Reveal fill after stroke finishes
    if (config.fillReveal) {
      setTimeout(function () {
        fillEl.style.opacity = '1';
      }, delayMs + durationMs + Math.max(0, config.fillRevealMs));
    }

    // Fade out the stroke after fill appears (pen disappears)
    var fadeStart =
      delayMs +
      durationMs +
      (config.fillReveal ? Math.max(0, config.fillRevealMs) : 0) +
      280;
    setTimeout(function () {
      strokeEl.style.transition = 'opacity 260ms ease';
      strokeEl.style.opacity = '0';
    }, fadeStart);

    // Repeat / loop
    if (config.repeat) {
      var loopAt =
        delayMs +
        durationMs +
        (config.fillReveal ? Math.max(0, config.fillRevealMs) : 0) +
        config.repeatDelay * 1000 +
        600;
      setTimeout(function () {
        strokeEl.style.transition = 'none';
        strokeEl.style.opacity = '1';
        strokeEl.style.strokeDashoffset = String(length);
        if (config.fillReveal) fillEl.style.opacity = '0';
        void strokeEl.getBoundingClientRect();
        runAnimation(strokeEl, fillEl);
      }, loopAt);
    }
  }

  // ========================================
  // LICENSING
  // ========================================

  function loadLicensing(container) {
    setTimeout(function () {
      try {
        if (window.AnavoLicenseManager) return;

        var licScript = document.createElement('script');
        licScript.src =
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

        licScript.onload = function () {
          try {
            var lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
              licenseServer:
                'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
              showUI: true,
            });
            lm.init().then(function () {
              if (!lm.isLicensed && container) {
                lm.insertWatermark(container);
              }
            });
          } catch (e) {
            console.warn('[' + PLUGIN_NAME + '] License init error:', e.message);
          }
        };

        licScript.onerror = function () {
          console.warn('[' + PLUGIN_NAME + '] Could not load licensing module');
        };

        document.head.appendChild(licScript);
      } catch (_e) {
        // licensing is non-blocking
      }
    }, 1500);
  }

  // ========================================
  // MAIN INIT
  // ========================================

  function init() {
    try {
      dbg('Initializing...', config);

      injectStyles();

      var wrapper = document.createElement('div');
      wrapper.className = 'anavo-hts-wrapper';

      var built = buildSvg();
      wrapper.appendChild(built.svg);

      insertWrapper(wrapper);

      // Ensure SVG layout metrics are available before measuring
      try {
        built.strokeEl.getBBox();
      } catch (_e) {}

      runAnimation(built.strokeEl, built.fillEl);

      console.log('\u2705 ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' Active!');

      loadLicensing(wrapper);
    } catch (e) {
      console.error('\u274C ' + PLUGIN_NAME + ' init failed:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
