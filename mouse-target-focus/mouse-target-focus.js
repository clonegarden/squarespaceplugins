/**
 * =======================================
 * MOUSE TARGET FOCUS - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Renders an accessible cursor-following "target" overlay that visually
 * highlights the mouse position and pulses on clickable elements.
 *
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mouse-target-focus/mouse-target-focus.min.js"></script>
 *
 * PARAMETERS:
 * ?enabled=true            - Enable/disable the plugin (default: true)
 * ?shape=circle            - Shape: circle | circle-fill | square | crosshair | star (default: circle)
 * ?size=48                 - Size in px (default: 48)
 * ?strokeWidth=2           - Outline thickness in px (default: 2)
 * ?strokeColor=00ffcc      - Outline color hex without # (default: 00ffcc)
 * ?fillColor=00ffcc        - Fill color hex without # (default: 00ffcc)
 * ?fillOpacity=0.08        - Fill opacity 0..1 (default: 0.08)
 * ?zIndex=999999           - z-index (default: 999999)
 * ?followLag=0.15          - Smoothing factor 0..1, higher = more lag (default: 0.15)
 * ?pulseOnHover=true       - Pulse when hovering clickable elements (default: true)
 * ?pulseScale=1.15         - Scale factor for pulse animation (default: 1.15)
 * ?pulseDuration=260       - Pulse animation duration in ms (default: 260)
 * ?hoverStrokeColor=       - Optional stroke color override on hover
 * ?hoverFillOpacity=       - Optional fill opacity override on hover
 * ?toggleKey=              - Key to toggle the plugin (e.g. t) — default: off
 * ?toggleMod=alt           - Modifier: alt | ctrl | shift | meta | none (default: alt)
 * ?forceMobile=false       - Force enable on coarse-pointer (touch) devices (default: false)
 * ?debug=false             - Verbose console logging (default: false)
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'MouseTargetFocus';

  console.log(`🎯 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // IDEMPOTENCY GUARD
  // ========================================

  if (window.__anavoMTF) {
    console.log(`🎯 ${PLUGIN_NAME}: already initialised, skipping.`);
    return;
  }
  window.__anavoMTF = true;

  // ========================================
  // SCRIPT REFERENCE
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  // ========================================
  // HELPERS
  // ========================================

  function fixColor(color) {
    if (!color || color === 'transparent') return color;
    if (color.startsWith('#') || color.startsWith('rgb')) return color;
    return '#' + color;
  }

  function parseFloat2(val, fallback) {
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  }

  function parseInt2(val, fallback) {
    const n = parseInt(val, 10);
    return isNaN(n) ? fallback : n;
  }

  function parseBool(val, fallback) {
    if (val === null || val === undefined || val === '') return fallback;
    return val !== 'false' && val !== '0';
  }

  // ========================================
  // CONFIGURATION
  // ========================================

  function getScriptParams() {
    const src = currentScript.src || '';
    let params;
    try {
      params = new URLSearchParams(new URL(src).search);
    } catch (_e) {
      params = new URLSearchParams('');
    }

    const get = key => params.get(key);

    return {
      enabled: parseBool(get('enabled'), true),
      shape: get('shape') || 'circle',
      size: parseInt2(get('size'), 48),
      strokeWidth: parseInt2(get('strokeWidth'), 2),
      strokeColor: fixColor(get('strokeColor') || '00ffcc'),
      fillColor: fixColor(get('fillColor') || '00ffcc'),
      fillOpacity: parseFloat2(get('fillOpacity'), 0.08),
      zIndex: parseInt2(get('zIndex'), 999999),
      followLag: parseFloat2(get('followLag'), 0.15),
      pulseOnHover: parseBool(get('pulseOnHover'), true),
      pulseScale: parseFloat2(get('pulseScale'), 1.15),
      pulseDuration: parseInt2(get('pulseDuration'), 260),
      hoverStrokeColor: get('hoverStrokeColor') ? fixColor(get('hoverStrokeColor')) : null,
      hoverFillOpacity:
        get('hoverFillOpacity') !== null ? parseFloat2(get('hoverFillOpacity'), null) : null,
      toggleKey: get('toggleKey') || '',
      toggleMod: get('toggleMod') || 'alt',
      forceMobile: parseBool(get('forceMobile'), false),
      debug: parseBool(get('debug'), false),
    };
  }

  const cfg = getScriptParams();

  function dbg(...args) {
    if (cfg.debug) console.log(`[${PLUGIN_NAME}]`, ...args);
  }

  dbg('config:', cfg);

  // ========================================
  // REDUCED MOTION
  // ========================================

  const reducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    dbg('prefers-reduced-motion detected — pulsing disabled');
  }

  // ========================================
  // COARSE POINTER (TOUCH) DETECTION
  // ========================================

  const isCoarsePointer =
    window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  if (isCoarsePointer && !cfg.forceMobile) {
    dbg('Coarse pointer detected (touch device) — plugin disabled. Use ?forceMobile=true to override.');
    return;
  }

  // ========================================
  // EARLY EXIT IF DISABLED
  // ========================================

  if (!cfg.enabled) {
    dbg('Plugin disabled via ?enabled=false');
    return;
  }

  // ========================================
  // CSS INJECTION
  // ========================================

  function buildShapeCSS(shape, size, strokeColor, strokeWidth, fillColor, fillOpacity) {
    const half = size / 2;
    const r = half - strokeWidth / 2;

    switch (shape) {
      case 'circle-fill':
      case 'circle': {
        return `
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${strokeWidth}px solid ${strokeColor};
          background: ${shape === 'circle-fill' ? fillColor : 'transparent'};
          opacity: ${shape === 'circle-fill' ? 1 : 1};
        `;
      }
      case 'square': {
        return `
          width: ${size}px;
          height: ${size}px;
          border: ${strokeWidth}px solid ${strokeColor};
          background: transparent;
        `;
      }
      case 'crosshair': {
        // Rendered via CSS — the element itself is just a container;
        // actual lines are ::before and ::after pseudo-elements injected separately.
        return `
          width: ${size}px;
          height: ${size}px;
          background: transparent;
        `;
      }
      case 'star': {
        // Uses an SVG data-URI background
        const svgStar = buildStarSVG(size, strokeColor, strokeWidth, fillColor, fillOpacity);
        const encoded = encodeURIComponent(svgStar);
        return `
          width: ${size}px;
          height: ${size}px;
          background: url("data:image/svg+xml,${encoded}") no-repeat center center;
          background-size: contain;
        `;
      }
      default:
        return `width:${size}px;height:${size}px;border-radius:50%;border:${strokeWidth}px solid ${strokeColor};`;
    }
  }

  function buildStarSVG(size, stroke, strokeWidth, fill, fillOpacity) {
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - strokeWidth;
    const innerR = outerR * 0.4;
    const points = 5;
    const coords = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      coords.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    const d = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ') + ' Z';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><path d="${d}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/></svg>`;
  }

  function injectStyles() {
    const styleId = 'anavo-mouse-target-focus-styles';
    if (document.getElementById(styleId)) return;

    const { shape, size, strokeColor, strokeWidth, fillColor, fillOpacity, zIndex, pulseDuration, pulseScale } = cfg;

    const fillOpacityActual = (shape === 'circle-fill') ? fillOpacity : 0;

    const pulseDur = reducedMotion ? 0 : pulseDuration;
    const pulseScaleVal = reducedMotion ? 1 : pulseScale;

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
      #anavo-mouse-target-focus {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        will-change: transform;
        z-index: ${zIndex};
        transform: translate3d(-9999px, -9999px, 0);
        transition: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #anavo-mouse-target-focus .anavo-mtf-inner {
        position: relative;
        ${buildShapeCSS(shape, size, strokeColor, strokeWidth, fillColor, fillOpacity)}
        transition:
          transform ${pulseDur}ms cubic-bezier(0.34, 1.56, 0.64, 1),
          border-color ${pulseDur}ms ease,
          background-color ${pulseDur}ms ease,
          opacity ${pulseDur}ms ease;
        --mtf-stroke: ${strokeColor};
        --mtf-fill: ${fillColor};
        --mtf-fill-opacity: ${fillOpacityActual};
        box-sizing: border-box;
        overflow: visible;
      }

      ${shape === 'circle-fill' ? `
      #anavo-mouse-target-focus .anavo-mtf-inner {
        background-color: var(--mtf-fill);
        opacity: var(--mtf-fill-opacity, ${fillOpacity});
      }
      ` : ''}

      ${shape === 'crosshair' ? `
      #anavo-mouse-target-focus .anavo-mtf-inner::before,
      #anavo-mouse-target-focus .anavo-mtf-inner::after {
        content: '';
        position: absolute;
        background: ${strokeColor};
        pointer-events: none;
      }
      #anavo-mouse-target-focus .anavo-mtf-inner::before {
        top: 50%;
        left: 0;
        width: 100%;
        height: ${strokeWidth}px;
        transform: translateY(-50%);
      }
      #anavo-mouse-target-focus .anavo-mtf-inner::after {
        left: 50%;
        top: 0;
        height: 100%;
        width: ${strokeWidth}px;
        transform: translateX(-50%);
      }
      ` : ''}

      #anavo-mouse-target-focus.anavo-mtf-hovering .anavo-mtf-inner {
        transform: scale(${pulseScaleVal});
        ${cfg.hoverStrokeColor ? `border-color: ${cfg.hoverStrokeColor};` : ''}
        ${(cfg.hoverFillOpacity !== null && shape === 'circle-fill') ? `opacity: ${cfg.hoverFillOpacity};` : ''}
      }

      ${!reducedMotion ? `
      @keyframes anavo-mtf-ripple {
        0%   { transform: scale(1);              opacity: 0.6; }
        100% { transform: scale(${pulseScaleVal * 1.3}); opacity: 0; }
      }

      #anavo-mouse-target-focus .anavo-mtf-ripple {
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${size}px;
        height: ${size}px;
        margin-top: -${size / 2}px;
        margin-left: -${size / 2}px;
        border-radius: ${shape === 'square' ? '0' : '50%'};
        border: ${strokeWidth}px solid ${cfg.hoverStrokeColor || strokeColor};
        box-sizing: border-box;
        pointer-events: none;
        animation: anavo-mtf-ripple ${pulseDuration * 2}ms ease-out forwards;
      }
      ` : ''}

      #anavo-mouse-target-focus.anavo-mtf-hidden {
        opacity: 0;
        transition: opacity 200ms ease;
      }
    `;
    document.head.appendChild(styles);
  }

  // ========================================
  // DOM CREATION
  // ========================================

  let container = null;
  let inner = null;
  let isVisible = true;
  let isOverPage = false;

  function createTarget() {
    if (document.getElementById('anavo-mouse-target-focus')) {
      container = document.getElementById('anavo-mouse-target-focus');
      inner = container.querySelector('.anavo-mtf-inner');
      return;
    }

    container = document.createElement('div');
    container.id = 'anavo-mouse-target-focus';
    container.setAttribute('aria-hidden', 'true');
    container.setAttribute('role', 'presentation');

    inner = document.createElement('div');
    inner.className = 'anavo-mtf-inner';

    container.appendChild(inner);
    document.body.appendChild(container);
    dbg('Target element created');
  }

  // ========================================
  // MOUSE TRACKING (requestAnimationFrame)
  // ========================================

  let mouseX = -9999;
  let mouseY = -9999;
  let curX = -9999;
  let curY = -9999;
  let rafId = null;
  let lastFrameTime = 0;

  // lag: 0 = instant, 1 = never arrives
  const lag = Math.max(0, Math.min(0.99, cfg.followLag));

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animateFrame(ts) {
    rafId = requestAnimationFrame(animateFrame);

    const dt = ts - lastFrameTime;
    lastFrameTime = ts;

    // Clamp dt to avoid huge jumps after tab switch
    const clampedDt = Math.min(dt, 100);
    // Convert lag to a per-frame factor; higher lag = smaller factor per frame
    // At 60fps each frame ≈ 16ms; factor = 1 - lag * (16/clampedDt)
    const factor = lag === 0 ? 1 : 1 - Math.pow(lag, clampedDt / 16);

    const newX = lerp(curX, mouseX, factor);
    const newY = lerp(curY, mouseY, factor);

    if (Math.abs(newX - curX) > 0.05 || Math.abs(newY - curY) > 0.05) {
      curX = newX;
      curY = newY;
      if (container) {
        const half = cfg.size / 2;
        container.style.transform = `translate3d(${curX - half}px, ${curY - half}px, 0)`;
      }
    }
  }

  // ========================================
  // CLICKABLE DETECTION
  // ========================================

  const CLICKABLE_SELECTORS = [
    'a[href]',
    'button',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    '[role="button"]',
    '[onclick]',
    'label[for]',
    'select',
    '[tabindex]:not([tabindex="-1"])',
    // Squarespace-specific
    '.sqs-block-button-element',
    '.header-nav-item--folder',
    '.header-nav-item a',
    '.burger-inner',
    '[data-action]',
    '.product-item',
    '.portfolio-grid-item',
    '.blog-item',
  ].join(',');

  function isClickable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    // Walk up a few levels to check ancestors
    let node = el;
    for (let i = 0; i < 5; i++) {
      if (!node || node === document.body) break;
      if (node.matches && node.matches(CLICKABLE_SELECTORS)) return true;
      // Fallback: computed cursor style
      try {
        const cursor = window.getComputedStyle(node).cursor;
        if (cursor === 'pointer') return true;
      } catch (_e) {
        // ignore
      }
      node = node.parentElement;
    }
    return false;
  }

  // ========================================
  // HOVER STATE + RIPPLE
  // ========================================

  let hoverState = false;
  let rippleTimeout = null;

  function addRipple() {
    if (reducedMotion || !inner) return;
    // Remove existing ripples
    const existing = inner.querySelectorAll('.anavo-mtf-ripple');
    existing.forEach(r => r.remove());

    const ripple = document.createElement('div');
    ripple.className = 'anavo-mtf-ripple';
    inner.appendChild(ripple);

    // Remove after animation completes
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  function setHoverState(entering) {
    if (!container) return;
    if (entering === hoverState) return;
    hoverState = entering;

    if (entering) {
      container.classList.add('anavo-mtf-hovering');
      if (cfg.pulseOnHover && !reducedMotion) {
        addRipple();
        // Repeat ripple while hovering
        rippleTimeout = setInterval(addRipple, cfg.pulseDuration * 3);
      }
      dbg('hover: clickable element');
    } else {
      container.classList.remove('anavo-mtf-hovering');
      if (rippleTimeout) {
        clearInterval(rippleTimeout);
        rippleTimeout = null;
      }
      // Clean up ripples
      if (inner) {
        inner.querySelectorAll('.anavo-mtf-ripple').forEach(r => r.remove());
      }
    }
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isOverPage) {
      isOverPage = true;
      if (container) container.classList.remove('anavo-mtf-hidden');
    }

    if (cfg.pulseOnHover) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHoverState(isClickable(el));
    }
  }

  function onMouseLeave() {
    isOverPage = false;
    if (container) container.classList.add('anavo-mtf-hidden');
    setHoverState(false);
  }

  function onMouseOver(e) {
    if (cfg.pulseOnHover) {
      setHoverState(isClickable(e.target));
    }
  }

  function onMouseOut(e) {
    if (cfg.pulseOnHover && e.target && !isClickable(e.relatedTarget)) {
      setHoverState(false);
    }
  }

  // ========================================
  // KEYBOARD TOGGLE
  // ========================================

  function setupToggleKey() {
    if (!cfg.toggleKey) return;

    document.addEventListener('keydown', function (e) {
      const key = cfg.toggleKey.toLowerCase();
      const mod = cfg.toggleMod.toLowerCase();
      const keyMatch = e.key.toLowerCase() === key;
      const modMatch =
        mod === 'none' ? true :
        mod === 'alt' ? e.altKey :
        mod === 'ctrl' ? e.ctrlKey :
        mod === 'shift' ? e.shiftKey :
        mod === 'meta' ? e.metaKey : true;

      if (keyMatch && modMatch) {
        e.preventDefault();
        isVisible = !isVisible;
        if (container) {
          container.style.display = isVisible ? '' : 'none';
        }
        dbg('toggled:', isVisible ? 'visible' : 'hidden');
      }
    });
  }

  // ========================================
  // LICENSING
  // ========================================

  function loadLicensing() {
    setTimeout(() => {
      try {
        if (window.AnavoLicenseManager) return;

        const licScript = document.createElement('script');
        const base = currentScript.src.replace(/[^/]+$/, '');
        licScript.src = base + '../_shared/licensing.min.js';

        licScript.onload = function () {
          try {
            const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
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
            console.warn(`[${PLUGIN_NAME}] License init error:`, e.message);
          }
        };

        licScript.onerror = function () {
          console.warn(`[${PLUGIN_NAME}] Could not load licensing module`);
        };

        document.head.appendChild(licScript);
      } catch (_e) {
        // Licensing is non-blocking
      }
    }, 1500);
  }

  // ========================================
  // INIT
  // ========================================

  function init() {
    injectStyles();
    createTarget();
    setupToggleKey();

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });

    // Start RAF loop
    rafId = requestAnimationFrame(animateFrame);

    loadLicensing();

    console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
