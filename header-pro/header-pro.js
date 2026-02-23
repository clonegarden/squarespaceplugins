/**
 * =======================================
 * HEADER PRO - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Squarekicker-inspired header enhancement for Squarespace 7.1 (best-effort 7.0).
 * Skins and enhances the native header without replacing it.
 * Supports: centered layout, sticky/auto-hide, CTA button, dropdown modes,
 * glassy/blur/glitchy effects, configurable presets, and more.
 *
 * INSTALLATION (Settings → Advanced → Code Injection → Footer):
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/header-pro/header-pro.min.js"></script>
 *
 * QUICK EXAMPLES:
 * Minimal preset:
 * <script src="...header-pro.min.js?preset=minimal"></script>
 * Glassy preset with CTA:
 * <script src="...header-pro.min.js?preset=glassy&ctaEnabled=true&ctaText=Get+Started&ctaUrl=/contact"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'HeaderPro';
  const STYLE_ID = 'anavo-header-pro-styles';
  const CTA_ID = 'anavo-header-pro-cta';

  // ========================================
  // 1. SCRIPT PARAMETER PARSING
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  /** Parse URL params from the script src; gracefully return defaults on error. */
  function getScriptParams() {
    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const p = url.searchParams;

      // Helper: fix hex colors that may omit the leading #
      function fixColor(val, fallback) {
        if (!val) return fallback;
        const decoded = decodeURIComponent(val);
        if (decoded === 'transparent') return 'transparent';
        if (/^[0-9A-Fa-f]{6}$/.test(decoded)) return '#' + decoded;
        return decoded;
      }

      function str(key, fallback) {
        return p.get(key) !== null ? decodeURIComponent(p.get(key)) : fallback;
      }
      function num(key, fallback) {
        const v = p.get(key);
        return v !== null ? parseFloat(v) : fallback;
      }
      function bool(key, fallback) {
        const v = p.get(key);
        if (v === null) return fallback;
        return v !== 'false' && v !== '0';
      }
      function color(key, fallback) {
        return fixColor(p.get(key), fallback);
      }

      // ---- resolve preset defaults first ----
      const preset = str('preset', 'default');
      const presetDefaults = resolvePreset(preset);

      return {
        debug: bool('debug', false),
        preset,

        // Layout
        containerMaxWidth: str('containerMaxWidth', presetDefaults.containerMaxWidth),
        paddingX: str('paddingX', presetDefaults.paddingX),
        paddingY: str('paddingY', presetDefaults.paddingY),
        itemGap: str('itemGap', presetDefaults.itemGap),

        // Background
        bgMode: str('bgMode', presetDefaults.bgMode), // transparent | solid | blur
        bgColor: color('bgColor', presetDefaults.bgColor),
        bgOpacity: num('bgOpacity', presetDefaults.bgOpacity),
        blurPx: num('blurPx', presetDefaults.blurPx),

        // Border
        borderMode: str('borderMode', presetDefaults.borderMode), // none | bottom | top-bottom | all
        borderColor: color('borderColor', presetDefaults.borderColor),
        borderWidth: str('borderWidth', presetDefaults.borderWidth),
        radius: str('radius', presetDefaults.radius),

        // Typography
        navFontSize: str('navFontSize', presetDefaults.navFontSize),
        navLetterSpacing: str('navLetterSpacing', presetDefaults.navLetterSpacing),
        navTransform: str('navTransform', presetDefaults.navTransform), // none | uppercase | lowercase | capitalize
        navHoverOpacity: num('navHoverOpacity', presetDefaults.navHoverOpacity),

        // CTA Button
        ctaEnabled: bool('ctaEnabled', presetDefaults.ctaEnabled),
        ctaText: str('ctaText', presetDefaults.ctaText),
        ctaUrl: str('ctaUrl', presetDefaults.ctaUrl),
        ctaTarget: str('ctaTarget', '_self'),
        ctaStyle: str('ctaStyle', presetDefaults.ctaStyle), // underline | pill | outline | solid
        ctaBg: color('ctaBg', presetDefaults.ctaBg),
        ctaColor: color('ctaColor', presetDefaults.ctaColor),
        ctaBorderColor: color('ctaBorderColor', presetDefaults.ctaBorderColor),

        // Behavior
        sticky: bool('sticky', presetDefaults.sticky),
        stickyTop: str('stickyTop', '0px'),
        scrollShadow: bool('scrollShadow', presetDefaults.scrollShadow),
        shadowStrength: num('shadowStrength', presetDefaults.shadowStrength),
        autoHide: bool('autoHide', presetDefaults.autoHide),
        autoHideThreshold: num('autoHideThreshold', 5),
        revealOnTop: bool('revealOnTop', true),

        // Effects
        effect: str('effect', presetDefaults.effect), // none | glassyBlueLine | glitchy

        // Dropdowns
        dropdownMode: str('dropdownMode', 'native'), // native | list | mega
        dropdownTrigger: str('dropdownTrigger', 'hover'), // hover | click
        dropdownWidth: str('dropdownWidth', '220px'),
        dropdownColumns: num('dropdownColumns', 3),
        dropdownGap: str('dropdownGap', '12px'),
        dropdownBg: color('dropdownBg', presetDefaults.dropdownBg),
        dropdownText: color('dropdownText', presetDefaults.dropdownText),
        dropdownRadius: str('dropdownRadius', '8px'),
        dropdownShadow: str('dropdownShadow', '0 4px 24px rgba(0,0,0,0.12)'),

        // Extra
        zIndex: str('zIndex', '9999'),
        injectFontSmoothing: bool('injectFontSmoothing', true),
      };
    } catch (_e) {
      return resolvePreset('default');
    }
  }

  // ========================================
  // 2. PRESETS
  // ========================================

  function resolvePreset(preset) {
    const defaults = {
      containerMaxWidth: '1280px',
      paddingX: '32px',
      paddingY: '14px',
      itemGap: '32px',
      bgMode: 'transparent',
      bgColor: '#ffffff',
      bgOpacity: 1,
      blurPx: 12,
      borderMode: 'none',
      borderColor: 'rgba(0,0,0,0.1)',
      borderWidth: '1px',
      radius: '0px',
      navFontSize: null, // inherit from theme
      navLetterSpacing: null,
      navTransform: 'none',
      navHoverOpacity: 0.65,
      ctaEnabled: false,
      ctaText: 'Get Started',
      ctaUrl: '/contact',
      ctaStyle: 'solid',
      ctaBg: '#000000',
      ctaColor: '#ffffff',
      ctaBorderColor: '#000000',
      sticky: true,
      scrollShadow: false,
      shadowStrength: 0.1,
      autoHide: false,
      effect: 'none',
      dropdownBg: '#ffffff',
      dropdownText: '#111111',
    };

    const presets = {
      minimal: {
        bgMode: 'transparent',
        borderMode: 'none',
        paddingX: '24px',
        paddingY: '12px',
        itemGap: '28px',
        scrollShadow: false,
        effect: 'none',
        ctaEnabled: false,
      },
      glassy: {
        bgMode: 'blur',
        bgColor: 'rgba(255,255,255,0.65)',
        bgOpacity: 0.65,
        blurPx: 18,
        borderMode: 'bottom',
        borderColor: 'rgba(255,255,255,0.35)',
        scrollShadow: true,
        shadowStrength: 0.08,
        effect: 'glassyBlueLine',
        ctaEnabled: true,
        ctaStyle: 'pill',
        ctaBg: 'rgba(59,130,246,0.9)',
        ctaColor: '#ffffff',
        ctaBorderColor: 'transparent',
        dropdownBg: 'rgba(255,255,255,0.85)',
        radius: '0px',
      },
      tech: {
        bgMode: 'solid',
        bgColor: '#0a0a0f',
        bgOpacity: 1,
        borderMode: 'bottom',
        borderColor: 'rgba(59,130,246,0.5)',
        borderWidth: '1px',
        navTransform: 'uppercase',
        navLetterSpacing: '0.12em',
        effect: 'glitchy',
        ctaEnabled: true,
        ctaStyle: 'outline',
        ctaBg: 'transparent',
        ctaColor: '#3b82f6',
        ctaBorderColor: '#3b82f6',
        dropdownBg: '#111118',
        dropdownText: '#e5e7eb',
        scrollShadow: true,
        shadowStrength: 0.4,
      },
    };

    return Object.assign({}, defaults, presets[preset] || {});
  }

  const config = getScriptParams();

  function dbg(...args) {
    if (config.debug) console.log(`[${PLUGIN_NAME}]`, ...args);
  }

  dbg('v' + PLUGIN_VERSION + ' loading with config:', config);

  // ========================================
  // 3. REDUCED-MOTION DETECTION
  // ========================================

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // 4. FIND SQUARESPACE HEADER
  // ========================================

  /**
   * Tries multiple selectors to locate the native Squarespace header element.
   * Returns the found element or null after the given timeout.
   */
  function waitForHeader(timeoutMs) {
    timeoutMs = timeoutMs || 6000;
    return new Promise(function (resolve) {
      const selectors = [
        '[data-nc-group="header"]',
        'header.Header',
        'header#header',
        '#header',
        '.Header',
        'header[data-controller="Header"]',
        '.header-inner',
        '.header-display-desktop',
        'header',
      ];

      var elapsed = 0;
      var interval = 100;

      function attempt() {
        for (var i = 0; i < selectors.length; i++) {
          var el = document.querySelector(selectors[i]);
          if (el) {
            dbg('Header found via selector:', selectors[i]);
            resolve(el);
            return;
          }
        }
        elapsed += interval;
        if (elapsed >= timeoutMs) {
          console.warn('[' + PLUGIN_NAME + '] Header element not found after ' + timeoutMs + 'ms');
          resolve(null);
          return;
        }
        setTimeout(attempt, interval);
      }

      attempt();
    });
  }

  // ========================================
  // 5. STYLE INJECTION (re-entrant safe)
  // ========================================

  function buildBgCSS() {
    if (config.bgMode === 'blur') {
      return (
        'background: ' +
        config.bgColor +
        ' !important;' +
        'backdrop-filter: blur(' +
        config.blurPx +
        'px) !important;' +
        '-webkit-backdrop-filter: blur(' +
        config.blurPx +
        'px) !important;'
      );
    }
    if (config.bgMode === 'solid') {
      return 'background: ' + config.bgColor + ' !important;';
    }
    // transparent
    return 'background: transparent !important;';
  }

  function buildBorderCSS(side) {
    var val =
      config.borderWidth + ' solid ' + config.borderColor;
    if (side === 'top') return 'border-top: ' + val + ' !important;';
    if (side === 'bottom') return 'border-bottom: ' + val + ' !important;';
    return 'border: ' + val + ' !important;';
  }

  function buildBorderModeCSS() {
    switch (config.borderMode) {
      case 'bottom':
        return buildBorderCSS('bottom');
      case 'top-bottom':
        return buildBorderCSS('top') + '\n' + buildBorderCSS('bottom');
      case 'all':
        return buildBorderCSS('all');
      default:
        return 'border: none !important;';
    }
  }

  function buildShadowCSS(scrolled) {
    if (!config.scrollShadow) return 'box-shadow: none;';
    if (!scrolled) return 'box-shadow: none;';
    var s = config.shadowStrength;
    return (
      'box-shadow: 0 2px 16px rgba(0,0,0,' + s + '), 0 1px 4px rgba(0,0,0,' + s * 1.5 + ');'
    );
  }

  function buildGlassyBlueLineCSS() {
    if (prefersReducedMotion) {
      return (
        '\n.anavo-hp-header::after {' +
        'content:""; display:block; height:2px;' +
        'background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);' +
        'position:absolute; bottom:0; left:0; right:0;' +
        '}'
      );
    }
    return (
      '\n@keyframes anavo-hp-glow-move {' +
      '0%{background-position:0% 50%}' +
      '50%{background-position:100% 50%}' +
      '100%{background-position:0% 50%}' +
      '}' +
      '\n.anavo-hp-header::after {' +
      'content:""; display:block; height:2px;' +
      'background: linear-gradient(90deg,#3b82f6,#60a5fa,#a78bfa,#3b82f6);' +
      'background-size:300% 300%;' +
      'animation: anavo-hp-glow-move 4s ease infinite;' +
      'position:absolute; bottom:0; left:0; right:0;' +
      'border-radius:0 0 2px 2px;' +
      '}'
    );
  }

  function buildGlitchyCSS() {
    if (prefersReducedMotion) return '';
    return (
      '\n@keyframes anavo-hp-glitch1 {' +
      '0%,100%{clip-path:inset(0 0 98% 0);transform:translate(-2px,0)}' +
      '20%{clip-path:inset(30% 0 50% 0);transform:translate(2px,0)}' +
      '40%{clip-path:inset(60% 0 20% 0);transform:translate(-1px,0)}' +
      '60%{clip-path:inset(10% 0 80% 0);transform:translate(1px,0)}' +
      '80%{clip-path:inset(50% 0 30% 0);transform:translate(0,0)}' +
      '}' +
      '\n.anavo-hp-header:hover .anavo-hp-nav-link::before {' +
      'content:attr(data-text); position:absolute; left:0; top:0; width:100%;' +
      'color:#3b82f6; overflow:hidden;' +
      'animation:anavo-hp-glitch1 0.4s steps(2) 1;' +
      'pointer-events:none;' +
      '}'
    );
  }

  function buildCtaCSS() {
    if (!config.ctaEnabled) return '';

    var base =
      'display:inline-flex; align-items:center; justify-content:center;' +
      'text-decoration:none; cursor:pointer; white-space:nowrap;' +
      'font-size:inherit; font-weight:600;' +
      'padding:8px 20px; transition:opacity 0.2s, transform 0.15s;' +
      'line-height:1.2;';

    var styleVariants = {
      underline: 'background:transparent; color:' + config.ctaColor + '; text-decoration:underline; border:none; padding:8px 4px;',
      pill: 'background:' + config.ctaBg + '; color:' + config.ctaColor + '; border-radius:999px; border:none;',
      outline: 'background:transparent; color:' + config.ctaBg + '; border:2px solid ' + config.ctaBorderColor + '; border-radius:6px;',
      solid: 'background:' + config.ctaBg + '; color:' + config.ctaColor + '; border-radius:6px; border:none;',
    };

    var variant = styleVariants[config.ctaStyle] || styleVariants.solid;

    return (
      '\n#' + CTA_ID + ' {' + base + variant + '}' +
      '\n#' + CTA_ID + ':hover { opacity:0.85; transform:translateY(-1px); }' +
      '\n@media(max-width:767px){ #' + CTA_ID + '{ display:none !important; } }'
    );
  }

  function buildDropdownCSS() {
    if (config.dropdownMode === 'native') return '';

    var shared =
      '\n.anavo-hp-dropdown {' +
      'position:absolute; top:100%; left:50%; transform:translateX(-50%);' +
      'background:' + config.dropdownBg + ';' +
      'color:' + config.dropdownText + ';' +
      'border-radius:' + config.dropdownRadius + ';' +
      'box-shadow:' + config.dropdownShadow + ';' +
      'padding:8px 0; min-width:' + config.dropdownWidth + ';' +
      'z-index:' + (parseInt(config.zIndex, 10) + 1) + ';' +
      'opacity:0; visibility:hidden; pointer-events:none;' +
      'transition:opacity 0.18s, visibility 0.18s, transform 0.18s;' +
      'transform:translateX(-50%) translateY(6px);' +
      'list-style:none; margin:0;' +
      '}' +
      '\n.anavo-hp-folder-item { position:relative; }' +
      '\n.anavo-hp-folder-item.is-open > .anavo-hp-dropdown,' +
      '\n.anavo-hp-folder-item:focus-within > .anavo-hp-dropdown {' +
      'opacity:1; visibility:visible; pointer-events:auto;' +
      'transform:translateX(-50%) translateY(0);' +
      '}' +
      '\n.anavo-hp-dropdown a {' +
      'display:block; padding:9px 20px;' +
      'color:' + config.dropdownText + ';' +
      'text-decoration:none; white-space:nowrap;' +
      'transition:opacity 0.15s;' +
      '}' +
      '\n.anavo-hp-dropdown a:hover { opacity:0.7; }' +
      '\n@media(max-width:767px){.anavo-hp-dropdown{display:none!important;}}';

    if (config.dropdownMode === 'mega') {
      shared +=
        '\n.anavo-hp-dropdown.is-mega {' +
        'min-width:' + config.dropdownWidth + ';' +
        'display:grid; grid-template-columns:repeat(' + config.dropdownColumns + ',1fr);' +
        'gap:' + config.dropdownGap + '; padding:16px;' +
        '}';
    }

    // For click trigger, keep dropdown visible while open class present
    if (config.dropdownTrigger === 'hover') {
      shared +=
        '\n@media(min-width:768px){' +
        '.anavo-hp-folder-item:hover > .anavo-hp-dropdown {' +
        'opacity:1; visibility:visible; pointer-events:auto;' +
        'transform:translateX(-50%) translateY(0);' +
        '}}';
    }

    return shared;
  }

  function injectStyles(scrolled) {
    var existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();

    var fontSizeCSS = config.navFontSize ? 'font-size:' + config.navFontSize + ' !important;' : '';
    var letterSpacingCSS = config.navLetterSpacing
      ? 'letter-spacing:' + config.navLetterSpacing + ' !important;'
      : '';
    var navTransformCSS =
      config.navTransform && config.navTransform !== 'none'
        ? 'text-transform:' + config.navTransform + ' !important;'
        : '';

    var fontSmoothingCSS = config.injectFontSmoothing
      ? '-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;'
      : '';

    var borderRadius = config.radius !== '0px' ? 'border-radius:' + config.radius + ' !important;' : '';

    var transitionDuration = prefersReducedMotion ? '0ms' : '280ms';

    var css =
      '/* HeaderPro v' + PLUGIN_VERSION + ' */' +
      '\n.anavo-hp-header {' +
      'position:relative;' +
      buildBgCSS() +
      buildBorderModeCSS() +
      borderRadius +
      buildShadowCSS(scrolled) +
      'transition: box-shadow ' + transitionDuration + ' ease, background ' + transitionDuration + ' ease, transform ' + transitionDuration + ' ease;' +
      fontSmoothingCSS +
      '}' +
      '\n.anavo-hp-header.is-sticky {' +
      'position:sticky !important;' +
      'top:' + config.stickyTop + ' !important;' +
      'z-index:' + config.zIndex + ' !important;' +
      '}' +
      '\n.anavo-hp-header.is-hidden {' +
      'transform:translateY(-110%) !important;' +
      '}' +
      '\n.anavo-hp-inner {' +
      'max-width:' + config.containerMaxWidth + ';' +
      'margin:0 auto;' +
      'padding:' + config.paddingY + ' ' + config.paddingX + ';' +
      'display:flex; align-items:center; justify-content:center;' +
      '}' +
      '\n.anavo-hp-nav-list {' +
      'display:flex; align-items:center;' +
      'gap:' + config.itemGap + ';' +
      'list-style:none; margin:0; padding:0;' +
      '}' +
      '\n.anavo-hp-nav-link {' +
      'position:relative;' +
      fontSizeCSS + letterSpacingCSS + navTransformCSS +
      'text-decoration:none;' +
      'transition: opacity ' + transitionDuration + ' ease;' +
      '}' +
      '\n.anavo-hp-nav-link:hover { opacity:' + config.navHoverOpacity + '; }' +
      '\n.anavo-hp-nav-link[aria-current="page"] { opacity:1; }' +
      '\n@media(prefers-reduced-motion:reduce){' +
      '.anavo-hp-header,.anavo-hp-nav-link{transition:none!important;}' +
      '}';

    css += buildCtaCSS();
    css += buildDropdownCSS();

    if (config.effect === 'glassyBlueLine') {
      css += buildGlassyBlueLineCSS();
    } else if (config.effect === 'glitchy') {
      css += buildGlitchyCSS();
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
    dbg('Styles injected (scrolled=' + scrolled + ')');
  }

  // ========================================
  // 6. APPLY CLASS TO NATIVE HEADER
  // ========================================

  function applyHeaderClass(headerEl) {
    if (!headerEl) return;
    headerEl.classList.add('anavo-hp-header');
    if (config.sticky) headerEl.classList.add('is-sticky');
    dbg('Classes applied to header element');
  }

  // ========================================
  // 7. CTA BUTTON INJECTION
  // ========================================

  function injectCTA(headerEl) {
    if (!config.ctaEnabled || !headerEl) return;

    // Remove existing CTA if re-running
    var existing = document.getElementById(CTA_ID);
    if (existing) existing.remove();

    var cta = document.createElement('a');
    cta.id = CTA_ID;
    cta.href = config.ctaUrl;
    cta.textContent = config.ctaText;
    cta.target = config.ctaTarget;
    if (config.ctaTarget === '_blank') cta.rel = 'noopener noreferrer';
    cta.setAttribute('role', 'button');

    // Try to insert into the header actions area
    var actionsSelectors = [
      '.header-actions',
      '.header-display-desktop .header-actions',
      '.header-nav-wrapper .header-actions',
      '[data-nc-group="header"] .header-actions',
      '.header-burger-btn',
    ];

    var inserted = false;
    for (var i = 0; i < actionsSelectors.length; i++) {
      var actions = headerEl.querySelector(actionsSelectors[i]);
      if (actions) {
        actions.insertAdjacentElement('beforebegin', cta);
        inserted = true;
        dbg('CTA inserted before', actionsSelectors[i]);
        break;
      }
    }

    if (!inserted) {
      // Fallback: append to header element
      headerEl.appendChild(cta);
      dbg('CTA appended to header (fallback)');
    }
  }

  // ========================================
  // 8. DROPDOWN ENHANCEMENT
  // ========================================

  function enhanceDropdowns(headerEl) {
    if (config.dropdownMode === 'native' || !headerEl) return;

    // Find nav items that contain sub-menus (folders)
    var folderSelectors = [
      '.header-nav-folder',
      '.header-nav-item--folder',
      'li[data-folder]',
      '.header-nav-list > li',
    ];

    var folderItems = null;
    for (var si = 0; si < folderSelectors.length; si++) {
      folderItems = headerEl.querySelectorAll(folderSelectors[si]);
      if (folderItems && folderItems.length > 0) break;
    }

    if (!folderItems || folderItems.length === 0) {
      dbg('No folder/dropdown items found — dropdown enhancement skipped');
      return;
    }

    folderItems.forEach(function (item) {
      // Mark for styling
      item.classList.add('anavo-hp-folder-item');

      // Find existing sub-list (7.1 renders it as a nested ul/div)
      var subList =
        item.querySelector('.header-nav-folder-content') ||
        item.querySelector('ul') ||
        item.querySelector('[data-folder-content]');

      if (!subList) return;

      // Wrap in our custom dropdown shell
      subList.classList.add('anavo-hp-dropdown');
      if (config.dropdownMode === 'mega') subList.classList.add('is-mega');

      // Ensure all links are styled
      subList.querySelectorAll('a').forEach(function (a) {
        a.classList.add('anavo-hp-dropdown-link');
      });

      // Attach interaction
      if (config.dropdownTrigger === 'click') {
        var trigger = item.querySelector('a') || item;
        trigger.addEventListener('click', function (e) {
          var isOpen = item.classList.contains('is-open');
          // Close all other open dropdowns
          headerEl.querySelectorAll('.anavo-hp-folder-item.is-open').forEach(function (other) {
            if (other !== item) other.classList.remove('is-open');
          });
          if (isOpen) {
            item.classList.remove('is-open');
          } else {
            // Only prevent default if this item has sub-items and is a folder toggle
            if (subList) {
              e.preventDefault();
              item.classList.add('is-open');
            }
          }
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
          if (!item.contains(e.target)) item.classList.remove('is-open');
        });
      }
    });

    dbg('Dropdown enhancement applied (mode=' + config.dropdownMode + ', trigger=' + config.dropdownTrigger + ')');
  }

  // ========================================
  // 9. SCROLL BEHAVIOR (sticky / auto-hide)
  // ========================================

  function initScrollBehavior(headerEl) {
    if (!headerEl) return;
    if (!config.sticky && !config.scrollShadow && !config.autoHide) return;

    var lastScrollY = window.scrollY;
    var ticking = false;
    var hidden = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          var delta = scrollY - lastScrollY;

          // Scroll shadow update
          if (config.scrollShadow) {
            injectStyles(scrollY > 10);
            applyHeaderClass(headerEl);
          }

          // Auto-hide: hide on scroll down, show on scroll up
          if (config.autoHide && !prefersReducedMotion) {
            if (scrollY <= 0 && config.revealOnTop) {
              if (hidden) {
                headerEl.classList.remove('is-hidden');
                hidden = false;
              }
            } else if (delta > config.autoHideThreshold && !hidden) {
              headerEl.classList.add('is-hidden');
              hidden = true;
              dbg('Header auto-hidden');
            } else if (delta < -config.autoHideThreshold && hidden) {
              headerEl.classList.remove('is-hidden');
              hidden = false;
              dbg('Header revealed');
            }
          }

          lastScrollY = scrollY;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    dbg('Scroll behavior initialized');
  }

  // ========================================
  // 10. LICENSING (async, non-blocking)
  // ========================================

  function loadLicensing(headerEl) {
    try {
      if (window.AnavoLicenseManager) return;

      var script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

      script.onload = function () {
        try {
          var licenseManager = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
            licenseServer:
              'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
            showUI: true,
          });

          licenseManager.init().then(function () {
            if (!licenseManager.isLicensed && headerEl) {
              licenseManager.insertWatermark(headerEl);
            }
          });
        } catch (e) {
          console.warn('[' + PLUGIN_NAME + '] License init error:', e.message);
        }
      };

      script.onerror = function () {
        console.warn('[' + PLUGIN_NAME + '] Could not load licensing module');
      };

      document.head.appendChild(script);
    } catch (e) {
      console.warn('[' + PLUGIN_NAME + '] License load error:', e.message);
    }
  }

  // ========================================
  // 11. GLITCHY: DATA-TEXT ATTRIBUTE
  // ========================================

  function applyGlitchyAttributes(headerEl) {
    if (config.effect !== 'glitchy' || !headerEl || prefersReducedMotion) return;
    headerEl.querySelectorAll('.anavo-hp-nav-link').forEach(function (a) {
      a.setAttribute('data-text', a.textContent.trim());
    });
  }

  function markNavLinks(headerEl) {
    if (!headerEl) return;
    var navLinks = headerEl.querySelectorAll(
      '.header-nav-item a, .header-nav-list a, [data-folder] > a, nav a'
    );
    navLinks.forEach(function (a) {
      if (!a.closest('.anavo-hp-dropdown')) {
        a.classList.add('anavo-hp-nav-link');
      }
    });
    dbg('Nav links marked:', navLinks.length);
  }

  // ========================================
  // 12. MAIN INITIALIZATION
  // ========================================

  async function init() {
    try {
      dbg('Initializing...');
      console.log('\uD83D\uDE80 ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' - Loading...');

      // Inject styles early (before header found) so there is no flash
      injectStyles(false);

      const headerEl = await waitForHeader(6000);

      if (!headerEl) {
        console.warn('[' + PLUGIN_NAME + '] Header not found — plugin inactive');
        return;
      }

      applyHeaderClass(headerEl);
      markNavLinks(headerEl);
      injectCTA(headerEl);
      enhanceDropdowns(headerEl);
      applyGlitchyAttributes(headerEl);
      initScrollBehavior(headerEl);

      // Load licensing non-blocking
      setTimeout(function () {
        loadLicensing(headerEl);
      }, 1500);

      console.log('\u2705 ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' Active!');
      dbg('Config used:', config);
    } catch (err) {
      console.error('[' + PLUGIN_NAME + '] Initialization error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
