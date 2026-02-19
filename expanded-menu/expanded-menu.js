/**
 * =======================================
 * EXPANDED MENU PLUGIN - Squarespace
 * =======================================
 * @version 2.1.5
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * CHANGELOG v2.1.5:
 * - Fixed: CSS units (5px not 5)
 * - Fixed: Mobile CSS now inside media query
 * - Fixed: mobileSpacing parameter now works
 * - Added: mobileWrap parameter (default: false)
 * - Fixed: Version consistency across file
 * 
 * FIXED v2.1.4:
 * - Forces header hiding via JavaScript (Subtle Approach)
 * - Removes all Squarespace header space
 * - Perfect sticky positioning
 * - Transparent background support
 * =======================================
 */

(function() {
  'use strict';

  const PLUGIN_VERSION = '2.1.5';
  console.log(`🚀 Expanded Menu Plugin v${PLUGIN_VERSION} - Starting...`);

  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    function fixHexColor(color) {
      if (!color) return null;
      color = decodeURIComponent(color);
      if (color.toLowerCase() === 'transparent') return 'transparent';
      if (/^[0-9A-Fa-f]{6}$/.test(color)) return '#' + color;
      if (color.startsWith('#')) return color;
      return color;
    }

    return {
      containerWidth: params.get('containerWidth') || '100%',
      menuSpacing: params.get('menuSpacing') || '60px',
      tabletSpacing: params.get('tabletSpacing') || '30px',
      mobileSpacing: params.get('mobileSpacing') || '20px',
      centerMenu: params.get('centerMenu') !== 'false',
      mobileMode: params.get('mobileMode') || 'custom',
      mobileWrap: params.get('mobileWrap') === 'true',  // ✅ NOVO: default false (horizontal)
      stickyMenu: params.get('stickyMenu') !== 'false',
      stickyTop: params.get('stickyTop') || '0',
      bgColor: fixHexColor(params.get('bgColor')),
      fontColor: fixHexColor(params.get('fontColor')),
      fontFamily: params.get('fontFamily') ? decodeURIComponent(params.get('fontFamily')) : null,
      fontSize: params.get('fontSize') || '16',
      fontWeight: params.get('fontWeight') || '500',
      hoverOpacity: params.get('hoverOpacity') || '0.7',
      itemBorderColor: fixHexColor(params.get('itemBorderColor')),
      itemBorderWidth: params.get('itemBorderWidth') || '1',
      sectionBorderColor: fixHexColor(params.get('sectionBorderColor')),
      sectionBorderWidth: params.get('sectionBorderWidth') || '1',
      showItemBorders: params.get('showItemBorders') !== 'false',
      showSectionBorder: params.get('showSectionBorder') !== 'false',
      dropdownBgColor: fixHexColor(params.get('dropdownBgColor')),
      dropdownShadow: params.get('dropdownShadow') !== 'false'
    };
  }

  const config = getScriptParams();
  console.log('⚙️ Config:', config);

  function forceHideSquarespaceHeader() {
    const headers = document.querySelectorAll('.header, .Header, header, [data-nc-group="header"]');
    
    headers.forEach(header => {
      header.style.cssText = `
        display: none !important;
        visibility: hidden !important;
        height: 5px !important;           /* ✅ CORRIGIDO: Adicionado "px" */
        min-height: 5px !important;        /* ✅ CORRIGIDO */
        max-height: 5px !important;        /* ✅ CORRIGIDO */
        padding: 0 !important;
        margin: 0 !important;
        position: fixed !important;
        top: -5px !important;
        left: 0 !important;
        pointer-events: none !important;
        overflow: hidden !important;
      `;
    });

    document.body.style.paddingTop = '0';
    document.body.style.marginTop = '0';

    const firstSection = document.querySelector('#page .page-section:first-child, .page-section:first-child');
    if (firstSection) {
      firstSection.style.paddingTop = '0';
      firstSection.style.marginTop = '0';
    }

    const page = document.querySelector('#page');
    if (page) {
      page.style.paddingTop = '0';
      page.style.marginTop = '0';
    }

    console.log('✅ Forced header hiding via inline styles (Subtle Approach)');
  }

  // ... [funções waitForSquarespaceNav, extractMenuItems, buildCustomMenu, hideSquarespaceNav - IGUAIS]

  function injectStyles() {
    if (document.getElementById('anavo-expanded-menu-styles')) {
      console.log('⚠️ Styles already injected');
      return;
    }

    const centeringCSS = config.centerMenu ? `
      .anavo-custom-menu {
        justify-content: center !important;
      }
    ` : '';

    const fontColor = config.fontColor || 'var(--menuTextColor, #000)';
    const fontFamily = config.fontFamily || 'var(--heading-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)';
    const itemBorderColor = config.itemBorderColor || 'var(--lightAccentColor, #e8e8e8)';
    const dropdownBgColor = config.dropdownBgColor || 'var(--white, #ffffff)';

    const itemBorderCSS = config.showItemBorders ?
      `border-bottom: ${config.itemBorderWidth}px solid ${itemBorderColor} !important;` : '';

    const dropdownShadowCSS = config.dropdownShadow ?
      `box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;` :
      `box-shadow: none !important;`;

    const stickyCSS = config.stickyMenu ? `
      position: fixed !important;
      top: ${config.stickyTop}px !important;
      left: 0 !important;
      right: 0 !important;
    ` : `
      position: relative !important;
    `;

    const styles = document.createElement('style');
    styles.id = 'anavo-expanded-menu-styles';
    styles.textContent = `
      /* ANAVO CUSTOM MENU v${PLUGIN_VERSION} - HORIZONTAL MOBILE MENU */
      
      div.anavo-menu-wrapper,
      div[class*="anavo-menu"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100% !important;
        height: auto !important;
        z-index: 99999 !important;
        ${stickyCSS}
        overflow: visible !important;
        clip: auto !important;
        clip-path: none !important;
        transform: none !important;
      }

      nav.anavo-custom-menu {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        align-items: center !important;
        gap: ${config.menuSpacing} !important;
        width: 100% !important;
        max-width: ${config.containerWidth} !important;
        margin: 0 auto !important;
        padding: 20px 2vw !important;
        font-family: ${fontFamily} !important;
        min-height: 60px !important;
        box-sizing: border-box !important;
        ${centeringCSS}
      }

      div.anavo-menu-item {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        white-space: nowrap !important;
      }

      a.anavo-menu-link,
      span.anavo-menu-link {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
        padding: 8px 12px !important;
        padding-bottom: 12px !important;
        color: ${fontColor} !important;
        text-decoration: none !important;
        font-weight: ${config.fontWeight} !important;
        font-size: ${config.fontSize}px !important;
        font-family: ${fontFamily} !important;
        letter-spacing: 0.05em !important;
        transition: opacity 0.2s ease !important;
        cursor: pointer !important;
        ${itemBorderCSS}
        text-align: center !important;
      }

      a.anavo-menu-link:hover,
      span.anavo-menu-link:hover {
        opacity: ${config.hoverOpacity} !important;
      }

      .anavo-menu-item--active .anavo-menu-link {
        font-weight: ${Math.min(parseInt(config.fontWeight) + 200, 900)} !important;
      }

      .anavo-menu-folder {
        position: relative !important;
      }

      .anavo-menu-folder-toggle {
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
      }

      .anavo-menu-arrow {
        transition: transform 0.2s ease !important;
        color: ${fontColor} !important;
      }

      .anavo-menu-folder:hover .anavo-menu-arrow {
        transform: rotate(180deg) !important;
      }

      .anavo-menu-dropdown {
        position: absolute !important;
        top: 100% !important;
        left: 0 !important;
        min-width: 200px !important;
        background: ${dropdownBgColor} !important;
        ${dropdownShadowCSS}
        border-radius: 4px !important;
        padding: 8px 0 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transform: translateY(-10px) !important;
        transition: opacity 0.2s, transform 0.2s, visibility 0.2s !important;
        z-index: 100000 !important;
      }

      .anavo-menu-folder:hover .anavo-menu-dropdown {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
      }

      .anavo-menu-dropdown-item {
        display: block !important;
        padding: 12px 20px !important;
        color: ${fontColor} !important;
        text-decoration: none !important;
        font-size: ${Math.max(parseInt(config.fontSize) - 2, 12)}px !important;
        font-family: ${fontFamily} !important;
        font-weight: ${config.fontWeight} !important;
        transition: opacity 0.2s !important;
      }

      .anavo-menu-dropdown-item:hover {
        opacity: ${config.hoverOpacity} !important;
      }

      /* TABLET */
      @media (max-width: 800px) and (min-width: 480px) {
        nav.anavo-custom-menu {
          gap: ${config.tabletSpacing} !important;
          padding: 15px 1.5vw !important;
        }

        a.anavo-menu-link,
        span.anavo-menu-link {
          font-size: ${Math.max(parseInt(config.fontSize) - 2, 14)}px !important;
          padding: 6px 10px !important;
          padding-bottom: 10px !important;
        }
      }

      /* ✅ MOBILE - CORRIGIDO: TODO CSS MOBILE AQUI DENTRO */
      @media (max-width: 479px) {
        /* Menu container - especificidade alta */
        html body nav.anavo-custom-menu {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: ${config.mobileWrap ? 'wrap' : 'nowrap'} !important;  /* ✅ USA PARÂMETRO */
          justify-content: flex-start !important;
          align-items: center !important;
          gap: ${config.mobileSpacing} !important;  /* ✅ USA PARÂMETRO */
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
          padding: 12px 15px !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* Esconde scrollbar */
        html body nav.anavo-custom-menu::-webkit-scrollbar {
          display: none !important;
        }
        
        /* Itens compactos */
        html body div.anavo-menu-item {
          flex: 0 0 auto !important;
          flex-grow: 0 !important;
          flex-shrink: 0 !important;
          flex-basis: auto !important;
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Links compactos */
        html body a.anavo-menu-link,
        html body span.anavo-menu-link {
          display: inline-block !important;
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;
          padding: 8px 12px !important;
          margin: 0 !important;
          font-size: ${Math.max(parseInt(config.fontSize) - 4, 12)}px !important;
          white-space: nowrap !important;
          box-sizing: border-box !important;
        }

        /* Dropdown no mobile */
        .anavo-menu-dropdown {
          position: static !important;
          box-shadow: none !important;
          background: transparent !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
          display: none !important;
          padding: 0 !important;
          margin-top: 8px !important;
        }

        .anavo-menu-folder.anavo-folder-open .anavo-menu-dropdown {
          display: block !important;
        }

        .anavo-menu-dropdown-item {
          padding: 8px 16px !important;
          font-size: ${Math.max(parseInt(config.fontSize) - 4, 12)}px !important;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Injected custom styles');
  }

  // ... [resto das funções - IGUAIS]

  async function loadLicensing() {
    try {
      if (window.AnavoLicenseManager) return null;

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const licenseManager = new window.AnavoLicenseManager(
        'ExpandedMenu',
        PLUGIN_VERSION,  // ✅ CORRIGIDO: Usa constante
        {
          licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: true
        }
      );

      await licenseManager.init();
      
      if (!licenseManager.isLicensed) {
        const header = document.querySelector('.header');
        if (header) licenseManager.insertWatermark(header);
      }

      return licenseManager;

    } catch (error) {
      console.warn('⚠️ License check failed:', error.message);
      return null;
    }
  }

  async function init() {
    try {
      console.log('🔧 Starting initialization...');

      forceHideSquarespaceHeader();

      const navList = await waitForSquarespaceNav();
      
      if (!navList) {
        console.error('❌ Failed to find Squarespace navigation - aborting');
        return;
      }

      const menuItems = extractMenuItems(navList);
      
      if (menuItems.length === 0) {
        console.error('❌ No menu items extracted - aborting');
        return;
      }

      const menuHTML = buildCustomMenu(menuItems);

      hideSquarespaceNav();
      injectStyles();
      insertCustomMenu(menuHTML);

      if (config.mobileMode === 'burger') {
        enableBurgerMode();
      }

      setTimeout(forceHideSquarespaceHeader, 500);
      setTimeout(forceHideSquarespaceHeader, 1000);

      console.log(`✅ Expanded Menu Plugin v${PLUGIN_VERSION} Active!`);
      console.log('   Sticky Menu:', config.stickyMenu ? 'Enabled' : 'Disabled');
      console.log('   Mobile Wrap:', config.mobileWrap ? 'Vertical' : 'Horizontal');

      loadLicensing();

    } catch (error) {
      console.error('❌ Plugin initialization failed:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
