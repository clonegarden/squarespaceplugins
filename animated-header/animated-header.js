/**
 * =======================================
 * ANIMATED STICKY HEADER - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Menu sticky animado que inicia no footer e desliza
 * suavemente para o topo ao rolar a página.
 *
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'AnimatedHeader';

  console.log(`🎯 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // CONFIGURATION
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function getScriptParams() {
    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const params = url.searchParams;

      return {
        transitionDuration: parseInt(params.get('transitionDuration') || '400', 10),
        visibilityThreshold: parseFloat(params.get('visibilityThreshold') || '10'),
        scrollDuration: parseInt(params.get('scrollDuration') || '800', 10),
        section1Selector: params.get('section1Selector')
          ? decodeURIComponent(params.get('section1Selector'))
          : null,
        section2Selector: params.get('section2Selector')
          ? decodeURIComponent(params.get('section2Selector'))
          : null,
        menuHolderSelector: params.get('menuHolderSelector') || '#menuholder',
        headerSelector: params.get('headerSelector') || '#header',
      };
    } catch (_e) {
      return {
        transitionDuration: 400,
        visibilityThreshold: 10,
        scrollDuration: 800,
        section1Selector: null,
        section2Selector: null,
        menuHolderSelector: '#menuholder',
        headerSelector: '#header',
      };
    }
  }

  const config = getScriptParams();

  // ========================================
  // SECTION DETECTION
  // ========================================

  function detectSections() {
    // Priority 1: Custom selectors via URL params
    if (config.section1Selector && config.section2Selector) {
      const s1 = document.querySelector(config.section1Selector);
      const s2 = document.querySelector(config.section2Selector);
      if (s1 && s2) {
        return { section1: s1, section2: s2 };
      }
    }

    // Priority 2: Data attributes
    const roleEls = document.querySelectorAll('[data-anavo-role]');
    let section1 = null;
    let section2 = null;
    roleEls.forEach(el => {
      const role = el.getAttribute('data-anavo-role');
      if (role === 'header-section') section1 = el;
      if (role === 'home-section') section2 = el;
    });
    if (section1 && section2) {
      return { section1, section2 };
    }

    // Priority 3: Auto-detect first two <section data-section-id>
    const allSections = document.querySelectorAll('section[data-section-id]');
    return {
      section1: allSections[0] || null,
      section2: allSections[1] || null,
    };
  }

  // ========================================
  // WAIT FOR ELEMENTS
  // ========================================

  function waitForElements(selectors, callback) {
    const maxAttempts = 50;
    let attempts = 0;

    function attempt() {
      attempts++;
      const elements = selectors.map(sel => document.querySelector(sel));
      if (elements.every(el => el !== null)) {
        callback.apply(null, elements);
        return;
      }
      if (attempts >= maxAttempts) {
        console.error(`❌ ${PLUGIN_NAME}: Required elements not found:`, selectors);
        return;
      }
      setTimeout(attempt, 100);
    }

    attempt();
  }

  // ========================================
  // CSS INJECTION
  // ========================================

  function injectFadeCSS() {
    if (document.getElementById('anavo-animated-header-styles')) return;

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const transitionValue = prefersReducedMotion
      ? '0ms'
      : `${config.transitionDuration}ms`;

    const style = document.createElement('style');
    style.id = 'anavo-animated-header-styles';
    style.textContent = `
      /* ========================================
         ANIMATED STICKY HEADER v${PLUGIN_VERSION}
         ======================================== */

      body.header-transitioning ${config.menuHolderSelector},
      body.header-transitioning ${config.headerSelector} {
        opacity: 0 !important;
        transition: opacity ${transitionValue} ease !important;
        pointer-events: none !important;
      }

      body.header-positioned ${config.menuHolderSelector},
      body.header-positioned ${config.headerSelector} {
        opacity: 1 !important;
        transition: opacity ${transitionValue} ease !important;
        pointer-events: auto !important;
      }

      @media (prefers-reduced-motion: reduce) {
        body.header-transitioning ${config.menuHolderSelector},
        body.header-transitioning ${config.headerSelector},
        body.header-positioned ${config.menuHolderSelector},
        body.header-positioned ${config.headerSelector} {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // TRANSITION HELPERS
  // ========================================

  function startTransition() {
    document.body.classList.remove('header-positioned');
    document.body.classList.add('header-transitioning');
  }

  function endTransition() {
    document.body.classList.remove('header-transitioning');
    document.body.classList.add('header-positioned');
  }

  // ========================================
  // STICKY HEADER LOGIC
  // ========================================

  function initStickyHeader($menuHolder, $header, $firstSection) {
    let headerAtBottom = false;
    let scrollTimeout = null;

    function isInFirstSection() {
      const scroll = window.scrollY;
      const top = $firstSection.offsetTop;
      const bottom = top + $firstSection.offsetHeight;
      return scroll >= top && scroll < bottom;
    }

    function moveHeaderToBottom(instant) {
      if (headerAtBottom) return;
      if (!instant) startTransition();

      setTimeout(
        () => {
          $menuHolder.style.position = 'fixed';
          $menuHolder.style.bottom = '0';
          $menuHolder.style.top = '';
          $menuHolder.style.width = '100%';
          $menuHolder.style.zIndex = '9999';
          $menuHolder.style.left = '0';

          if (!$menuHolder.contains($header)) {
            $menuHolder.appendChild($header);
          }

          headerAtBottom = true;

          if (!instant) setTimeout(endTransition, 50);
        },
        instant ? 0 : config.transitionDuration
      );
    }

    function restoreHeader(instant) {
      if (!headerAtBottom) return;
      if (!instant) startTransition();

      setTimeout(
        () => {
          $menuHolder.style.position = '';
          $menuHolder.style.bottom = '';
          $menuHolder.style.top = '';
          $menuHolder.style.width = '';
          $menuHolder.style.zIndex = '';
          $menuHolder.style.left = '';

          const page = document.querySelector('#page');
          if (page) {
            document.body.insertBefore($header, page);
          } else {
            document.body.insertBefore($header, document.body.firstChild);
          }

          headerAtBottom = false;
          if (!instant) setTimeout(endTransition, 50);
        },
        instant ? 0 : config.transitionDuration
      );
    }

    function handleScroll() {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        if (isInFirstSection()) {
          if (!headerAtBottom) moveHeaderToBottom(false);
        } else {
          if (headerAtBottom) restoreHeader(false);
        }
      }, 16); // ~60fps debounce
    }

    // Set initial position instantly
    if (isInFirstSection()) {
      moveHeaderToBottom(true);
      endTransition();
    } else {
      endTransition();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    window.addEventListener('resize', () => {
      if (isInFirstSection()) {
        moveHeaderToBottom(true);
      } else {
        restoreHeader(true);
      }
    });
  }

  // ========================================
  // DYNAMIC HOME BUTTON
  // ========================================

  function initHomeButton($section2, $homeLinks) {
    if (!$section2 || $homeLinks.length === 0) return;

    let isScrollMode = false;
    let scrollCheckTimeout = null;

    function isSection2Visible() {
      const scroll = window.scrollY;
      const viewportH = window.innerHeight;
      const sectionTop = $section2.offsetTop;
      const sectionH = $section2.offsetHeight;

      // Calculate visible area of section2 within the viewport
      const visibleTop = Math.max(sectionTop, scroll);
      const visibleBottom = Math.min(sectionTop + sectionH, scroll + viewportH);
      const visiblePx = Math.max(0, visibleBottom - visibleTop);
      const visiblePercent = sectionH > 0 ? (visiblePx / sectionH) * 100 : 0;

      return visiblePercent >= config.visibilityThreshold;
    }

    function updateHomeLink() {
      const visible = isSection2Visible();
      if (visible && isScrollMode) {
        $homeLinks.forEach(a => a.setAttribute('href', '/'));
        isScrollMode = false;
      } else if (!visible && !isScrollMode) {
        $homeLinks.forEach(a => a.setAttribute('href', '#scroll-to-section-2'));
        isScrollMode = true;
      }
    }

    $homeLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        if (link.getAttribute('href') === '#scroll-to-section-2') {
          e.preventDefault();
          const targetY = $section2.offsetTop + $section2.offsetHeight;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      });
    });

    function onScroll() {
      if (scrollCheckTimeout) return;
      scrollCheckTimeout = setTimeout(() => {
        scrollCheckTimeout = null;
        updateHomeLink();
      }, 50);
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Set initial state
    updateHomeLink();
  }

  // ========================================
  // LICENSING (NON-BLOCKING)
  // ========================================

  async function loadLicensing() {
    try {
      if (!window.AnavoLicenseManager) {
        const script = document.createElement('script');
        script.src =
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const licenseManager = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
        licenseServer:
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
        showUI: true,
      });

      await licenseManager.init();

      if (!licenseManager.isLicensed) {
        const menuHolder = document.querySelector(config.menuHolderSelector);
        if (menuHolder) licenseManager.insertWatermark(menuHolder);
      }
    } catch (error) {
      console.warn('⚠️ License check failed:', error.message);
    }
  }

  // ========================================
  // MAIN INITIALIZATION
  // ========================================

  function runPlugin() {
    // Editor mode protection
    if (
      window.top !== window.self ||
      document.body.classList.contains('sqs-edit-mode') ||
      document.body.classList.contains('squarespace-editable') ||
      document.body.classList.contains('sqs-editing-mode')
    ) {
      document.body.classList.add('header-positioned');
      console.log(`ℹ️ ${PLUGIN_NAME}: Editor mode detected - plugin disabled`);
      return;
    }

    const { section1, section2 } = detectSections();

    if (!section1) {
      console.warn(`⚠️ ${PLUGIN_NAME}: Section 1 not found. Check selectors or add data-anavo-role attributes.`);
    }

    injectFadeCSS();

    waitForElements([config.menuHolderSelector, config.headerSelector], function (
      $menuHolder,
      $header
    ) {
      if (section1) {
        initStickyHeader($menuHolder, $header, section1);
      } else {
        endTransition();
      }

      const $homeLinks = Array.from(
        document.querySelectorAll(
          '.header-nav-item--homepage > a, .header-menu-nav-item--homepage > a'
        )
      );

      if ($homeLinks.length > 0 && section2) {
        initHomeButton(section2, $homeLinks);
      }

      // Load licensing non-blocking
      setTimeout(() => loadLicensing(), 1000);

      console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPlugin);
  } else {
    runPlugin();
  }
})();
