/**
 * =======================================
 * ANIMATED STICKY HEADER - Squarespace Plugin
 * =======================================
 * @version 2.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * BREAKING CHANGE: Reescrito do zero usando arquitetura Expanded Menu
 * Menu sticky que inicia no footer e sobe suavemente para o topo ao rolar.
 *
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/animated-header/animated-header.min.js"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '2.0.0';
  const PLUGIN_NAME = 'AnimatedHeader';

  console.log(`🎨 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // 1. PARSE PARAMETERS (igual Expanded Menu)
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function getScriptParams() {
    function fixHexColor(color) {
      if (!color) return null;
      color = decodeURIComponent(color);
      if (color.toLowerCase() === 'transparent') return 'transparent';
      if (color.startsWith('rgba(') || color.startsWith('rgb(')) return color;
      if (/^[0-9A-Fa-f]{6}$/.test(color)) return '#' + color;
      if (color.startsWith('#')) return color;
      return color;
    }

    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const params = url.searchParams;

      return {
        transitionDuration: parseInt(params.get('transitionDuration') || '400', 10),
        scrollDuration: parseInt(params.get('scrollDuration') || '800', 10),

        // Typography
        fontFamily: params.get('fontFamily') ? decodeURIComponent(params.get('fontFamily')) : null,
        fontColor: fixHexColor(params.get('fontColor')) || '#000',
        fontSize: params.get('fontSize') || '16',
        fontWeight: params.get('fontWeight') || '500',

        // Layout
        menuSpacing: params.get('menuSpacing') || '40px',
        hoverOpacity: params.get('hoverOpacity') || '0.7',

        // Background
        bgColor: fixHexColor(params.get('bgColor')) || 'transparent',
        bgEffect: params.get('bgEffect') || null, // 'blur'

        // Border
        showBorder: params.get('showBorder') === 'true',
        borderWidth: params.get('borderWidth') || '1',
        borderColor: fixHexColor(params.get('borderColor')) || '#000000',
        borderPosition: params.get('borderPosition') || 'bottom', // 'top', 'bottom', 'both'
      };
    } catch (_e) {
      return {
        transitionDuration: 400,
        scrollDuration: 800,
        fontFamily: null,
        fontColor: '#000',
        fontSize: '16',
        fontWeight: '500',
        menuSpacing: '40px',
        hoverOpacity: '0.7',
        bgColor: 'transparent',
        bgEffect: null,
        showBorder: false,
        borderWidth: '1',
        borderColor: '#000000',
        borderPosition: 'bottom',
      };
    }
  }

  const config = getScriptParams();

  // ========================================
  // 2. WAIT FOR SQUARESPACE NAV (igual Expanded Menu)
  // ========================================

  async function waitForSquarespaceNav(maxTries) {
    maxTries = maxTries || 20;
    const selectors = [
      '.header-nav-list',
      '.header-menu-nav-list',
      '[data-folder="root"]',
      '.header-menu-nav-wrapper nav',
      '.header-nav',
      'nav.header-nav',
    ];

    for (let i = 0; i < maxTries; i++) {
      for (let s = 0; s < selectors.length; s++) {
        const nav = document.querySelector(selectors[s]);
        if (nav) {
          console.log(`✅ Found nav: ${selectors[s]}`);
          return nav;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.error('❌ Could not find Squarespace navigation');
    return null;
  }

  // ========================================
  // 3. EXTRACT MENU ITEMS (igual Expanded Menu)
  // ========================================

  function extractMenuItems(navList) {
    const items = [];
    const links = navList.querySelectorAll('a');

    links.forEach(link => {
      const text = link.textContent.trim();
      const url = link.href;
      const isActive =
        link.classList.contains('active') || link.getAttribute('aria-current') === 'page';
      const isHome =
        link.classList.contains('header-nav-item--homepage') ||
        link.classList.contains('header-menu-nav-item--homepage');

      items.push({ text, url, isActive, isHome });
    });

    console.log(`✅ Extracted ${items.length} menu items`);
    return items;
  }

  // ========================================
  // 4. BUILD CUSTOM HEADER (com sticky animation)
  // ========================================

  function buildCustomHeader(menuItems) {
    const itemsHTML = menuItems
      .map(
        item => `
      <div class="anavo-sticky-item ${item.isActive ? 'active' : ''}">
        <a href="${item.url}"
           class="anavo-sticky-link ${item.isHome ? 'home-link' : ''}"
           ${item.isActive ? 'aria-current="page"' : ''}>
          ${item.text}
        </a>
      </div>
    `
      )
      .join('');

    return `
      <div class="anavo-sticky-wrapper" data-position="bottom">
        <nav class="anavo-sticky-nav">
          ${itemsHTML}
        </nav>
      </div>
    `;
  }

  // ========================================
  // 5. HIDE SQUARESPACE HEADER (igual Expanded Menu)
  // ========================================

  function hideSquarespaceHeader() {
    const headers = document.querySelectorAll(
      '.header, .Header, header, [data-nc-group="header"]'
    );

    headers.forEach(header => {
      header.style.cssText = `
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        pointer-events: none !important;
      `;
    });

    document.body.style.paddingTop = '0';
    document.body.style.marginTop = '0';

    const firstSection = document.querySelector('section[data-section-id]:first-child');
    if (firstSection) {
      firstSection.style.paddingTop = '0';
      firstSection.style.marginTop = '0';
    }

    console.log('✅ Squarespace header hidden');
  }

  // ========================================
  // 6. INJECT STYLES (sticky animation CSS)
  // ========================================

  function injectStyles() {
    if (document.getElementById('anavo-sticky-header-styles')) return;

    // Parse font family
    const fontFamily = config.fontFamily
      ? config.fontFamily
      : 'var(--heading-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)';

    // Parse background
    let bgCSS = '';
    if (config.bgColor === 'transparent') {
      bgCSS = 'background: transparent;';
      if (config.bgEffect === 'blur') {
        bgCSS += ' backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);';
      }
    } else if (config.bgColor) {
      bgCSS = `background: ${config.bgColor};`;
    }

    // Parse border
    let borderCSS = '';
    if (config.showBorder) {
      const borderStyle = `${config.borderWidth}px solid ${config.borderColor}`;
      switch (config.borderPosition) {
        case 'top':
          borderCSS = `border-top: ${borderStyle};`;
          break;
        case 'both':
          borderCSS = `border-top: ${borderStyle}; border-bottom: ${borderStyle};`;
          break;
        default:
          borderCSS = `border-bottom: ${borderStyle};`;
      }
    }

    const styles = document.createElement('style');
    styles.id = 'anavo-sticky-header-styles';
    styles.textContent = `
      /* ANAVO STICKY HEADER v${PLUGIN_VERSION} */

      .anavo-sticky-wrapper {
        position: fixed;
        width: 100%;
        z-index: 99999;
        transition: all ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        ${bgCSS}
        ${borderCSS}
      }

      /* BOTTOM POSITION (inicial) */
      .anavo-sticky-wrapper[data-position="bottom"] {
        bottom: 0;
        top: auto;
      }

      /* TOP POSITION (após scroll) */
      .anavo-sticky-wrapper[data-position="top"] {
        top: 0;
        bottom: auto;
      }

      /* FADE durante transição */
      .anavo-sticky-wrapper.transitioning {
        opacity: 0;
      }

      nav.anavo-sticky-nav {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: ${config.menuSpacing};
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
        font-family: ${fontFamily};
      }

      .anavo-sticky-item {
        display: flex;
      }

      a.anavo-sticky-link {
        color: ${config.fontColor};
        text-decoration: none;
        font-size: ${config.fontSize}px;
        font-weight: ${config.fontWeight};
        font-family: ${fontFamily};
        padding: 8px 16px;
        transition: opacity 0.2s;
        white-space: nowrap;
      }

      a.anavo-sticky-link:hover {
        opacity: ${config.hoverOpacity};
      }

      .anavo-sticky-item.active a {
        font-weight: ${Math.min(parseInt(config.fontWeight, 10) + 200, 900)};
      }

      /* MOBILE */
      @media (max-width: 768px) {
        nav.anavo-sticky-nav {
          gap: 20px;
          padding: 15px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          justify-content: flex-start;
        }

        nav.anavo-sticky-nav::-webkit-scrollbar {
          display: none;
        }

        a.anavo-sticky-link {
          font-size: ${Math.max(parseInt(config.fontSize, 10) - 2, 14)}px;
          padding: 6px 12px;
        }
      }

      /* ACCESSIBILITY */
      @media (prefers-reduced-motion: reduce) {
        .anavo-sticky-wrapper {
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Styles injected');
  }

  // ========================================
  // 7. INSERT CUSTOM HEADER
  // ========================================

  function insertCustomHeader(headerHTML) {
    const existing = document.querySelector('.anavo-sticky-wrapper');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    console.log('✅ Custom header inserted');
  }

  // ========================================
  // 8. STICKY ANIMATION LOGIC (core feature!)
  // ========================================

  function initStickyAnimation() {
    const $header = document.querySelector('.anavo-sticky-wrapper');
    const $section1 = document.querySelector('section[data-section-id]:first-child');

    if (!$header || !$section1) {
      console.error('❌ Missing elements for animation');
      return;
    }

    let isAtTop = false;

    function handleScroll() {
      const scrollY = window.scrollY;
      const section1Bottom = $section1.offsetTop + $section1.offsetHeight;

      if (scrollY > section1Bottom && !isAtTop) {
        $header.classList.add('transitioning');

        setTimeout(() => {
          $header.setAttribute('data-position', 'top');

          setTimeout(() => {
            $header.classList.remove('transitioning');
          }, 50);
        }, config.transitionDuration);

        isAtTop = true;
        console.log('→ Header moved to TOP');
      } else if (scrollY <= section1Bottom && isAtTop) {
        $header.classList.add('transitioning');

        setTimeout(() => {
          $header.setAttribute('data-position', 'bottom');

          setTimeout(() => {
            $header.classList.remove('transitioning');
          }, 50);
        }, config.transitionDuration);

        isAtTop = false;
        console.log('→ Header moved to BOTTOM');
      }
    }

    let scrollTimeout;
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 100);
      },
      { passive: true }
    );

    console.log('✅ Sticky animation initialized');
  }

  // ========================================
  // 9. DYNAMIC HOME BUTTON (extra feature)
  // ========================================

  function initDynamicHomeButton() {
    const $section2 = document.querySelector('section[data-section-id]:nth-child(2)');
    const $homeLinks = document.querySelectorAll('.anavo-sticky-link.home-link');

    if (!$section2 || $homeLinks.length === 0) {
      console.log('⚠️ Home button feature disabled (missing section 2 or home links)');
      return;
    }

    let isScrollMode = false;

    function isSection2Visible() {
      const scroll = window.scrollY;
      const viewportH = window.innerHeight;
      const viewportB = scroll + viewportH;
      const sectionTop = $section2.offsetTop;
      const sectionBot = sectionTop + $section2.offsetHeight;

      const visibleTop = Math.max(sectionTop, scroll);
      const visibleBot = Math.min(sectionBot, viewportB);
      const visibleH = Math.max(0, visibleBot - visibleTop);
      const percent = $section2.offsetHeight > 0 ? (visibleH / $section2.offsetHeight) * 100 : 0;

      return percent >= 10;
    }

    function updateHomeLink() {
      if (isSection2Visible()) {
        if (isScrollMode) {
          $homeLinks.forEach(a => a.setAttribute('href', '/'));
          isScrollMode = false;
        }
      } else {
        if (!isScrollMode) {
          $homeLinks.forEach(a => a.setAttribute('href', '#scroll-to-section-2'));
          isScrollMode = true;
        }
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

    let timeout;
    window.addEventListener(
      'scroll',
      function () {
        clearTimeout(timeout);
        timeout = setTimeout(updateHomeLink, 50);
      },
      { passive: true }
    );

    updateHomeLink();
    console.log('✅ Dynamic home button initialized');
  }

  // ========================================
  // 10. LICENSING (igual Expanded Menu)
  // ========================================

  async function loadLicensing() {
    try {
      if (window.AnavoLicenseManager) return null;

      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const licenseManager = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
        licenseServer:
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
        showUI: true,
      });

      await licenseManager.init();

      if (!licenseManager.isLicensed) {
        const header = document.querySelector('.anavo-sticky-wrapper');
        if (header) licenseManager.insertWatermark(header);
      }

      return licenseManager;
    } catch (error) {
      console.warn('⚠️ License check failed:', error.message);
      return null;
    }
  }

  // ========================================
  // 11. MAIN INIT
  // ========================================

  async function init() {
    try {
      console.log('🔧 Starting initialization...');

      const navList = await waitForSquarespaceNav();

      if (!navList) {
        console.error('❌ AnimatedHeader: Navigation not found');
        return;
      }

      const menuItems = extractMenuItems(navList);

      if (menuItems.length === 0) {
        console.error('❌ AnimatedHeader: No menu items found');
        return;
      }

      hideSquarespaceHeader();

      const headerHTML = buildCustomHeader(menuItems);

      injectStyles();

      insertCustomHeader(headerHTML);

      initStickyAnimation();

      initDynamicHomeButton();

      loadLicensing();

      console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
    } catch (error) {
      console.error('❌ AnimatedHeader initialization failed:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
