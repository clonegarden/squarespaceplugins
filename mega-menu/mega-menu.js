/**
 * =======================================
 * MEGA MENU - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Steals a Squarespace page section and transforms it into a full-width
 * dropdown mega menu panel triggered from the native header navigation.
 * Squarespace 7.1 primary; best-effort 7.0.
 *
 * INSTALLATION (Settings → Advanced → Code Injection → Footer):
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/mega-menu/mega-menu.min.js?sectionId=YOUR_SECTION_ID&triggerLabel=Services"></script>
 *
 * QUICK EXAMPLES:
 * Default preset:
 * <script src="...mega-menu.min.js?sectionId=abc123&triggerLabel=Services"></script>
 * Dark preset, click trigger:
 * <script src="...mega-menu.min.js?preset=dark&sectionId=abc123&triggerLabel=Services&trigger=click"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'MegaMenu';
  const STYLE_ID = 'anavo-mega-menu-styles';

  console.log(`🍔 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // 1. SQUARESPACE EDITOR DETECTION
  // ========================================

  function isEditorMode() {
    const cls = document.body ? document.body.className : '';
    if (
      cls.includes('sqs-edit-mode') ||
      cls.includes('squarespace-editable') ||
      cls.includes('squarespace-config') ||
      cls.includes('sqs-editing-mode')
    ) {
      return true;
    }
    if (window.location.pathname.includes('/config')) return true;
    if (
      window.Static &&
      window.Static.SQUARESPACE_CONTEXT &&
      window.Static.SQUARESPACE_CONTEXT.isEditing
    ) {
      return true;
    }
    return false;
  }

  // ========================================
  // 2. SCRIPT PARAMETER PARSING
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  // Helper: fix hex colors that may omit the leading #
  function fixColor(val, fallback) {
    if (!val) return fallback;
    const decoded = decodeURIComponent(val);
    if (decoded === 'transparent') return 'transparent';
    if (decoded.startsWith('rgba') || decoded.startsWith('rgb')) return decoded;
    if (decoded.startsWith('#')) return decoded;
    if (/^[0-9A-Fa-f]{3,8}$/.test(decoded)) return '#' + decoded;
    return decoded;
  }

  /** Parse URL params from the script src; gracefully return defaults on error. */
  function getScriptParams() {
    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const p = url.searchParams;

      const str = (key, fallback) =>
        p.get(key) !== null ? decodeURIComponent(p.get(key)) : fallback;
      const num = (key, fallback) => {
        const v = p.get(key);
        return v !== null ? parseFloat(v) : fallback;
      };
      const bool = (key, fallback) => {
        const v = p.get(key);
        if (v === null) return fallback;
        return v !== 'false' && v !== '0';
      };
      const color = (key, fallback) => fixColor(p.get(key), fallback);

      // ---- resolve preset defaults first ----
      const preset = str('preset', 'default');
      const pd = resolvePreset(preset);

      return {
        // Targeting
        sectionId: str('sectionId', null),
        sectionIndex: p.get('sectionIndex') !== null ? parseInt(p.get('sectionIndex'), 10) : null,
        divId: str('divId', null),

        // Trigger
        triggerLabel: str('triggerLabel', pd.triggerLabel),
        triggerPosition: str('triggerPosition', pd.triggerPosition),
        triggerIcon: str('triggerIcon', pd.triggerIcon),

        // Animation
        animation: str('animation', pd.animation),
        animationDuration: num('animationDuration', pd.animationDuration),
        animationEasing: str('animationEasing', pd.animationEasing),

        // Appearance
        bgColor: color('bgColor', pd.bgColor),
        fontColor: color('fontColor', pd.fontColor),
        overlayColor: color('overlayColor', pd.overlayColor),
        maxWidth: str('maxWidth', pd.maxWidth),
        paddingX: str('paddingX', pd.paddingX),
        paddingY: str('paddingY', pd.paddingY),
        borderBottom: num('borderBottom', pd.borderBottom),
        borderColor: color('borderColor', pd.borderColor),
        shadow: bool('shadow', pd.shadow),
        blur: bool('blur', pd.blur),
        zIndex: num('zIndex', pd.zIndex),

        // Behavior
        trigger: str('trigger', pd.trigger),
        closeOnOutsideClick: bool('closeOnOutsideClick', pd.closeOnOutsideClick),
        closeOnEsc: bool('closeOnEsc', pd.closeOnEsc),
        closeButton: bool('closeButton', pd.closeButton),
        hoverDelay: num('hoverDelay', pd.hoverDelay),
        hoverOutDelay: num('hoverOutDelay', pd.hoverOutDelay),
        stickyAware: bool('stickyAware', pd.stickyAware),
        mobileBreakpoint: num('mobileBreakpoint', pd.mobileBreakpoint),

        // General
        preset,
        debug: bool('debug', false),
      };
    } catch (_e) {
      return resolvePreset('default');
    }
  }

  // ========================================
  // 3. PRESETS
  // ========================================

  function resolvePreset(preset) {
    const defaults = {
      // Trigger
      triggerLabel: 'Menu',
      triggerPosition: 'auto',
      triggerIcon: '▾',

      // Animation
      animation: 'slideDown',
      animationDuration: 350,
      animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',

      // Appearance
      bgColor: '#ffffff',
      fontColor: '#111111',
      overlayColor: 'rgba(0,0,0,0.35)',
      maxWidth: '1400px',
      paddingX: '40px',
      paddingY: '40px',
      borderBottom: 1,
      borderColor: '#e0e0e0',
      shadow: true,
      blur: false,
      zIndex: 99998,

      // Behavior
      trigger: 'hover',
      closeOnOutsideClick: true,
      closeOnEsc: true,
      closeButton: true,
      hoverDelay: 200,
      hoverOutDelay: 400,
      stickyAware: true,
      mobileBreakpoint: 768,
    };

    const presets = {
      minimal: {
        shadow: false,
        borderBottom: 0,
        overlayColor: 'transparent',
        closeButton: false,
        animation: 'fadeIn',
        paddingX: '24px',
        paddingY: '24px',
      },
      dark: {
        bgColor: '#0a0a0f',
        fontColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.1)',
        overlayColor: 'rgba(0,0,0,0.65)',
      },
      glassmorphism: {
        bgColor: 'rgba(255,255,255,0.75)',
        blur: true,
        borderColor: 'rgba(255,255,255,0.4)',
        overlayColor: 'rgba(0,0,0,0.15)',
        animation: 'fadeIn',
      },
    };

    return Object.assign({}, defaults, presets[preset] || {});
  }

  const config = getScriptParams();

  function dbg(...args) {
    if (config.debug) console.log(`[${PLUGIN_NAME}]`, ...args);
  }

  dbg('Config:', config);

  // ========================================
  // 4. REDUCED-MOTION DETECTION
  // ========================================

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // 5. FIND SQUARESPACE HEADER
  // ========================================

  /**
   * Polls for the native Squarespace header element using multiple selectors.
   * Resolves with the header element or null after the given timeout.
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
          console.warn('[' + PLUGIN_NAME + '] Header not found after ' + timeoutMs + 'ms');
          resolve(null);
          return;
        }
        setTimeout(attempt, interval);
      }

      attempt();
    });
  }

  // ========================================
  // 6. FIND TARGET SECTION
  // ========================================

  /**
   * Supports three targeting modes:
   *   sectionId    — data-section-id attribute
   *   sectionIndex — 1-based index of page sections
   *   divId        — getElementById + walk up to parent section
   */
  function findTargetSection() {
    // sectionId — target by Squarespace data-section-id
    if (config.sectionId) {
      const el = document.querySelector(`[data-section-id="${config.sectionId}"]`);
      if (el) {
        dbg('Target found via sectionId:', el);
        return el;
      }
      console.warn(`[${PLUGIN_NAME}] sectionId "${config.sectionId}" not found`);
      return null;
    }

    // sectionIndex — target by 1-based index
    if (config.sectionIndex !== null) {
      const sections = document.querySelectorAll(
        'section[data-section-id], .page-section, [data-section-type]'
      );
      const idx = config.sectionIndex - 1;
      if (sections[idx]) {
        dbg('Target found via sectionIndex:', sections[idx]);
        return sections[idx];
      }
      console.warn(
        `[${PLUGIN_NAME}] sectionIndex ${config.sectionIndex} not found (found ${sections.length} sections)`
      );
      return null;
    }

    // divId — find div by id, walk up to parent section
    if (config.divId) {
      const el = document.getElementById(config.divId);
      if (el) {
        const section = el.closest(
          'section, [data-section-id], .page-section, article, [class*="Section"]'
        );
        if (section) {
          dbg('Target found via divId (parent section):', section);
          return section;
        }
        dbg('Target found via divId (element itself):', el);
        return el;
      }
      console.warn(`[${PLUGIN_NAME}] divId "${config.divId}" not found`);
      return null;
    }

    console.warn(
      `[${PLUGIN_NAME}] No targeting parameter provided. Use sectionId, sectionIndex, or divId.`
    );
    return null;
  }

  // ========================================
  // 7. SCROLL LOCK
  // ========================================

  var _savedScrollY = 0;

  function lockScroll() {
    if (config.overlayColor === 'transparent') return;
    _savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + _savedScrollY + 'px';
    document.body.style.width = '100%';
  }

  function unlockScroll() {
    if (config.overlayColor === 'transparent') return;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, _savedScrollY);
  }

  // ========================================
  // 8. STYLE INJECTION
  // ========================================

  function injectStyles() {
    // Remove existing before re-injecting (re-entrant safe)
    var existing = document.getElementById(STYLE_ID);
    if (existing) existing.remove();

    var dur = prefersReducedMotion ? 0 : config.animationDuration;
    var ease = config.animationEasing;
    var zi = config.zIndex;
    var shadowVal = config.shadow
      ? '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)'
      : 'none';
    var borderBottomVal =
      config.borderBottom > 0
        ? config.borderBottom + 'px solid ' + config.borderColor
        : 'none';
    var backdropFilter =
      config.blur ? 'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' : '';

    var css = `
/* ===== Anavo Mega Menu ===== */
#anavo-mm-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: ${config.overlayColor};
  z-index: ${zi};
  opacity: 0;
  transition: opacity ${prefersReducedMotion ? '0ms' : dur + 'ms'} ${ease};
}
#anavo-mm-overlay.anavo-mm-visible {
  opacity: 1;
}
${config.blur ? '#anavo-mm-overlay { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }' : ''}

#anavo-mm-panel {
  display: none;
  position: fixed;
  left: 0;
  right: 0;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: ${config.bgColor};
  color: ${config.fontColor};
  border-bottom: ${borderBottomVal};
  box-shadow: ${shadowVal};
  z-index: ${zi + 1};
  ${backdropFilter}
  /* animation initial states — set per animation type */
}
#anavo-mm-panel.anavo-mm-anim-slideDown {
  transform: translateY(-12px);
  opacity: 0;
  transition: ${prefersReducedMotion ? 'none' : `transform ${dur}ms ${ease}, opacity ${dur}ms ${ease}`};
}
#anavo-mm-panel.anavo-mm-anim-fadeIn {
  opacity: 0;
  transition: ${prefersReducedMotion ? 'none' : `opacity ${dur}ms ${ease}`};
}
#anavo-mm-panel.anavo-mm-anim-scaleY {
  transform-origin: top center;
  transform: scaleY(0);
  opacity: 0;
  transition: ${prefersReducedMotion ? 'none' : `transform ${dur}ms ${ease}, opacity ${dur}ms ${ease}`};
}
#anavo-mm-panel.anavo-mm-anim-clipReveal {
  clip-path: inset(0 0 100% 0);
  transition: ${prefersReducedMotion ? 'none' : `clip-path ${dur}ms ${ease}`};
}
#anavo-mm-panel.anavo-mm-open.anavo-mm-anim-slideDown {
  transform: translateY(0);
  opacity: 1;
}
#anavo-mm-panel.anavo-mm-open.anavo-mm-anim-fadeIn {
  opacity: 1;
}
#anavo-mm-panel.anavo-mm-open.anavo-mm-anim-scaleY {
  transform: scaleY(1);
  opacity: 1;
}
#anavo-mm-panel.anavo-mm-open.anavo-mm-anim-clipReveal {
  clip-path: inset(0 0 0% 0);
}
#anavo-mm-panel.anavo-mm-anim-none,
#anavo-mm-panel.anavo-mm-open.anavo-mm-anim-none {
  transition: none;
  transform: none;
  opacity: 1;
  clip-path: none;
}

#anavo-mm-inner {
  max-width: ${config.maxWidth};
  margin: 0 auto;
  padding: ${config.paddingY} ${config.paddingX};
  color: ${config.fontColor};
  position: relative;
}

/* Close button */
#anavo-mm-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: ${config.fontColor};
  opacity: 0.55;
  padding: 4px 8px;
  border-radius: 4px;
  transition: opacity 0.15s, background 0.15s;
  z-index: 1;
}
#anavo-mm-close:hover {
  opacity: 1;
  background: rgba(128,128,128,0.12);
}
#anavo-mm-close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Force Squarespace blocks visible inside panel */
#anavo-mm-panel .sqs-block,
#anavo-mm-panel .sqs-block-content,
#anavo-mm-panel .sqs-col,
#anavo-mm-panel .row,
#anavo-mm-panel .sqs-row {
  visibility: visible !important;
  opacity: 1 !important;
}
#anavo-mm-panel img {
  max-width: 100%;
  height: auto;
}

/* Trigger icon */
.anavo-mm-trigger-icon {
  display: inline-block;
  margin-left: 4px;
  transition: transform ${prefersReducedMotion ? '0ms' : '200ms'} ${ease};
  font-style: normal;
}
.anavo-mm-trigger-link[aria-expanded="true"] .anavo-mm-trigger-icon {
  transform: rotate(180deg);
}

/* Thin scrollbar */
#anavo-mm-panel::-webkit-scrollbar { width: 5px; }
#anavo-mm-panel::-webkit-scrollbar-track { background: transparent; }
#anavo-mm-panel::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 4px; }

/* Mobile: hide mega menu and trigger icon */
@media (max-width: ${config.mobileBreakpoint}px) {
  #anavo-mm-panel,
  #anavo-mm-overlay { display: none !important; }
  .anavo-mm-trigger-icon { display: none; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  #anavo-mm-panel,
  #anavo-mm-overlay { transition: none !important; animation: none !important; }
}
`;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
    dbg('Styles injected');
  }

  // ========================================
  // 9. BUILD DOM (panel + overlay)
  // ========================================

  var panelEl = null;
  var overlayEl = null;
  var closeBtn = null;
  var triggerLinkEl = null;
  var isOpen = false;

  function buildDOM(stolenHTML) {
    // Overlay
    overlayEl = document.createElement('div');
    overlayEl.id = 'anavo-mm-overlay';
    overlayEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlayEl);

    // Panel
    panelEl = document.createElement('div');
    panelEl.id = 'anavo-mm-panel';
    panelEl.setAttribute('role', 'region');
    panelEl.setAttribute('aria-label', 'Mega Menu');
    panelEl.setAttribute('aria-hidden', 'true');

    // Apply animation class
    var animClass = 'anavo-mm-anim-' + (prefersReducedMotion ? 'none' : config.animation);
    panelEl.classList.add(animClass);

    // Close button
    if (config.closeButton) {
      closeBtn = document.createElement('button');
      closeBtn.id = 'anavo-mm-close';
      closeBtn.setAttribute('aria-label', 'Close mega menu');
      closeBtn.textContent = '✕';
      panelEl.appendChild(closeBtn);
    }

    // Inner container
    var inner = document.createElement('div');
    inner.id = 'anavo-mm-inner';
    inner.innerHTML = stolenHTML;
    panelEl.appendChild(inner);

    document.body.appendChild(panelEl);
    dbg('DOM built');
  }

  // ========================================
  // 10. PANEL POSITIONING (sticky-aware)
  // ========================================

  function positionPanel(headerEl) {
    if (!panelEl || !headerEl) return;
    if (config.stickyAware) {
      var rect = headerEl.getBoundingClientRect();
      panelEl.style.top = rect.bottom + 'px';
    } else {
      panelEl.style.top = headerEl.offsetHeight + 'px';
    }
  }

  // ========================================
  // 11. OPEN / CLOSE
  // ========================================

  function openPanel(headerEl) {
    if (isOpen) return;
    isOpen = true;

    positionPanel(headerEl);

    // Show overlay
    overlayEl.style.display = 'block';
    // Force reflow so transition fires
    void overlayEl.offsetWidth;
    overlayEl.classList.add('anavo-mm-visible');

    // Show panel
    panelEl.style.display = 'block';
    void panelEl.offsetWidth;
    panelEl.classList.add('anavo-mm-open');
    panelEl.setAttribute('aria-hidden', 'false');

    if (triggerLinkEl) {
      triggerLinkEl.setAttribute('aria-expanded', 'true');
    }

    lockScroll();
    dbg('Panel opened');
  }

  function closePanel() {
    if (!isOpen) return;
    isOpen = false;

    overlayEl.classList.remove('anavo-mm-visible');
    panelEl.classList.remove('anavo-mm-open');
    panelEl.setAttribute('aria-hidden', 'true');

    if (triggerLinkEl) {
      triggerLinkEl.setAttribute('aria-expanded', 'false');
      triggerLinkEl.focus();
    }

    unlockScroll();

    // Hide after transition
    var dur = prefersReducedMotion ? 0 : config.animationDuration;
    setTimeout(function () {
      if (!isOpen) {
        panelEl.style.display = 'none';
        overlayEl.style.display = 'none';
      }
    }, dur);

    dbg('Panel closed');
  }

  // ========================================
  // 12. TRIGGER INJECTION
  // ========================================

  /**
   * Finds the nav list in the header and injects (or replaces) a trigger link.
   * triggerPosition modes: auto | first | last | index:N
   */
  function injectTrigger(headerEl) {
    // Find nav list
    var navList = null;
    var navSelectors = [
      '.header-nav-list',
      '.header-menu-nav-list',
      '[data-folder="root"]',
      '.header-nav',
      'nav ul',
      'nav',
    ];

    for (var i = 0; i < navSelectors.length; i++) {
      navList = headerEl.querySelector(navSelectors[i]);
      if (navList) {
        dbg('Nav list found via selector:', navSelectors[i]);
        break;
      }
    }

    if (!navList) {
      console.warn('[' + PLUGIN_NAME + '] Could not find nav list in header');
      return null;
    }

    // Build trigger <li> + <a>
    var li = document.createElement('li');
    li.className = 'anavo-mm-trigger-item header-nav-item';

    var a = document.createElement('a');
    a.href = '#';
    a.className = 'anavo-mm-trigger-link';
    a.setAttribute('aria-expanded', 'false');
    a.setAttribute('aria-haspopup', 'true');
    a.setAttribute('role', 'button');

    var labelSpan = document.createElement('span');
    labelSpan.textContent = config.triggerLabel;

    var iconSpan = document.createElement('span');
    iconSpan.className = 'anavo-mm-trigger-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = config.triggerIcon;

    a.appendChild(labelSpan);
    a.appendChild(iconSpan);
    li.appendChild(a);

    var pos = config.triggerPosition;

    if (pos === 'auto') {
      // Look for an existing nav link matching the trigger label text (case-insensitive)
      var items = navList.querySelectorAll('li');
      var matched = false;
      for (var j = 0; j < items.length; j++) {
        var itemLink = items[j].querySelector('a');
        if (
          itemLink &&
          itemLink.textContent.trim().toLowerCase() === config.triggerLabel.trim().toLowerCase()
        ) {
          // Replace (hijack) the existing nav item
          items[j].parentNode.replaceChild(li, items[j]);
          matched = true;
          dbg('Replaced existing nav link:', config.triggerLabel);
          break;
        }
      }
      if (!matched) {
        // Fallback: append to nav list
        navList.appendChild(li);
        dbg('No matching nav link found; trigger appended');
      }
    } else if (pos === 'first') {
      navList.insertBefore(li, navList.firstChild);
      dbg('Trigger inserted at first position');
    } else if (pos === 'last') {
      navList.appendChild(li);
      dbg('Trigger inserted at last position');
    } else if (pos.startsWith('index:')) {
      var idx = parseInt(pos.split(':')[1], 10) - 1;
      var children = navList.children;
      if (children[idx]) {
        navList.insertBefore(li, children[idx]);
      } else {
        navList.appendChild(li);
      }
      dbg('Trigger inserted at index:', idx + 1);
    } else {
      navList.appendChild(li);
    }

    return a;
  }

  // ========================================
  // 13. EVENT WIRING
  // ========================================

  function wireEvents(headerEl) {
    if (!triggerLinkEl) return;

    var openTimer = null;
    var closeTimer = null;

    function cancelTimers() {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    }

    // Prevent default navigation on trigger
    triggerLinkEl.addEventListener('click', function (e) {
      e.preventDefault();
      if (isOpen) {
        closePanel();
      } else {
        cancelTimers();
        openPanel(headerEl);
      }
    });

    if (config.trigger === 'hover') {
      // Trigger item hover
      var triggerItem = triggerLinkEl.closest('li');
      if (triggerItem) {
        triggerItem.addEventListener('mouseenter', function () {
          cancelTimers();
          openTimer = setTimeout(function () {
            openPanel(headerEl);
          }, config.hoverDelay);
        });
        triggerItem.addEventListener('mouseleave', function () {
          cancelTimers();
          closeTimer = setTimeout(function () {
            if (!panelEl.matches(':hover')) closePanel();
          }, config.hoverOutDelay);
        });
      }

      // Panel hover — keep open when hovering panel
      panelEl.addEventListener('mouseenter', function () {
        cancelTimers();
      });
      panelEl.addEventListener('mouseleave', function () {
        cancelTimers();
        closeTimer = setTimeout(function () {
          closePanel();
        }, config.hoverOutDelay);
      });
    }

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closePanel();
      });
    }

    // Outside click
    if (config.closeOnOutsideClick) {
      overlayEl.addEventListener('click', function () {
        closePanel();
      });
    }

    // Escape key
    if (config.closeOnEsc) {
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) {
          closePanel();
        }
      });
    }

    // Sticky-aware: reposition on scroll
    if (config.stickyAware) {
      window.addEventListener('scroll', function () {
        if (isOpen) positionPanel(headerEl);
      }, { passive: true });
    }

    // Reposition on resize
    window.addEventListener('resize', function () {
      if (isOpen) positionPanel(headerEl);
    }, { passive: true });

    dbg('Events wired');
  }

  // ========================================
  // 14. LICENSING
  // ========================================

  function loadLicensing() {
    try {
      if (window.AnavoLicenseManager) return;

      var script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

      script.onload = function () {
        try {
          var lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
            licenseServer:
              'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
            showUI: true,
          });
          lm.init().then(function () {
            if (!lm.isLicensed && panelEl) {
              lm.insertWatermark(panelEl);
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
  // 15. MAIN INITIALIZATION
  // ========================================

  async function init() {
    try {
      dbg('Initializing...');

      // Skip in Squarespace editor
      if (isEditorMode()) {
        dbg('Editor mode detected — skipping initialization');
        return;
      }

      // Inject styles early to avoid flash
      injectStyles();

      // Find target section
      const targetSection = findTargetSection();
      if (!targetSection) {
        console.warn('[' + PLUGIN_NAME + '] Target section not found — plugin inactive');
        return;
      }

      // Steal section content (copy innerHTML before hiding)
      const stolenHTML = targetSection.innerHTML;

      // Hide original section
      targetSection.style.setProperty('display', 'none', 'important');
      dbg('Section stolen and hidden:', targetSection);

      // Build panel DOM with stolen content
      buildDOM(stolenHTML);

      // Find header
      const headerEl = await waitForHeader(6000);
      if (!headerEl) {
        console.warn('[' + PLUGIN_NAME + '] Header not found — plugin inactive');
        return;
      }

      // Inject trigger into header nav
      triggerLinkEl = injectTrigger(headerEl);
      if (!triggerLinkEl) {
        console.warn('[' + PLUGIN_NAME + '] Trigger injection failed — plugin inactive');
        return;
      }

      // Wire all events
      wireEvents(headerEl);

      // Load licensing non-blocking
      setTimeout(loadLicensing, 1500);

      console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
      dbg('Initialization complete');
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
