/**
 * =======================================
 * EXPANDED MENU PLUGIN - Squarespace
 * =======================================
 * @version 2.2.1
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * CHANGELOG v2.2.1:
 * - Fixed: mobileMode=default CSS specificity bug — custom menu now fully hidden on mobile
 * - Fixed: mobileMode=default no longer sets pointer-events via JS; CSS media queries handle all show/hide
 * - Fixed: Squarespace MENU button is now clickable on mobile when mobileMode=default
 *
 * CHANGELOG v2.2.0:
 * - Added: mobileMode=default preserves Squarespace native mobile menu on ≤479px
 * - Added: resize listener restores correct header/nav visibility on viewport change
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

  const PLUGIN_VERSION = '2.2.1';
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
    // When mobileMode=default, CSS media queries handle all show/hide declaratively
    if (config.mobileMode === 'default') {
      return;
    }

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

  function restoreSquarespaceHeader() {
    const headers = document.querySelectorAll('.header, .Header, header, [data-nc-group="header"]');
    headers.forEach(header => {
      header.style.cssText = '';
    });
    console.log('✅ Squarespace header restored (mobileMode=default, mobile viewport)');
  }

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

  function extractMenuItems(navList) {
    const items = [];

    const navItems = navList.querySelectorAll(
      'li.header-nav-item, li.header-menu-nav-item, li[class*="nav-item"]'
    );

    if (navItems.length > 0) {
      navItems.forEach(li => {
        const isFolder =
          li.classList.contains('header-nav-item--folder') ||
          li.classList.contains('header-menu-nav-item--folder') ||
          li.querySelector('.header-nav-folder-content, .header-nav-folder') !== null;

        if (isFolder) {
          const folderLink = li.querySelector('a, button');
          const folderText = folderLink ? folderLink.textContent.trim() : '';
          const children = [];
          const childLinks = li.querySelectorAll(
            '.header-nav-folder-content a, .header-nav-folder a, ul a'
          );
          childLinks.forEach(a => {
            children.push({
              text: a.textContent.trim(),
              url: a.href,
              isActive:
                a.classList.contains('active') || a.getAttribute('aria-current') === 'page',
            });
          });
          if (folderText && children.length > 0) {
            items.push({ text: folderText, isFolder: true, children });
          }
        } else {
          const link = li.querySelector('a');
          if (link) {
            const text = link.textContent.trim();
            const url = link.href;
            const isActive =
              link.classList.contains('active') ||
              link.getAttribute('aria-current') === 'page' ||
              li.classList.contains('header-nav-item--active') ||
              li.classList.contains('active');
            const isHome =
              link.classList.contains('header-nav-item--homepage') ||
              link.classList.contains('header-menu-nav-item--homepage') ||
              li.classList.contains('header-nav-item--homepage') ||
              li.classList.contains('header-menu-nav-item--homepage');
            if (text) {
              items.push({ text, url, isActive, isHome, isFolder: false });
            }
          }
        }
      });
    }

    if (items.length === 0) {
      const links = navList.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent.trim();
        const url = link.href;
        const isActive =
          link.classList.contains('active') || link.getAttribute('aria-current') === 'page';
        const isHome =
          link.classList.contains('header-nav-item--homepage') ||
          link.classList.contains('header-menu-nav-item--homepage');
        if (text) {
          items.push({ text, url, isActive, isHome, isFolder: false });
        }
      });
    }

    console.log(`✅ Extracted ${items.length} menu items`);
    return items;
  }

  function buildCustomMenu(menuItems) {
    const bgStyle = config.bgColor ? `background: ${config.bgColor};` : '';
    const sectionBorderColor = config.sectionBorderColor || 'var(--lightAccentColor, #e8e8e8)';
    const sectionBorderCSS = config.showSectionBorder
      ? `border-bottom: ${config.sectionBorderWidth}px solid ${sectionBorderColor};`
      : '';

    const itemsHTML = menuItems
      .map(item => {
        if (item.isFolder) {
          const childrenHTML = item.children
            .map(
              child =>
                `<a href="${child.url}" class="anavo-menu-dropdown-item${child.isActive ? ' anavo-menu-dropdown-item--active' : ''}">${child.text}</a>`
            )
            .join('');
          return `<div class="anavo-menu-item anavo-menu-folder">
            <div class="anavo-menu-folder-toggle">
              <span class="anavo-menu-link">${item.text}</span>
              <span class="anavo-menu-arrow">▾</span>
            </div>
            <div class="anavo-menu-dropdown">${childrenHTML}</div>
          </div>`;
        } else {
          return `<div class="anavo-menu-item${item.isActive ? ' anavo-menu-item--active' : ''}">
            <a href="${item.url}" class="anavo-menu-link"${item.isActive ? ' aria-current="page"' : ''}>${item.text}</a>
          </div>`;
        }
      })
      .join('');

    return `<div class="anavo-menu-wrapper" style="${bgStyle}${sectionBorderCSS}">
    <nav class="anavo-custom-menu" role="navigation" aria-label="Main navigation">
      ${itemsHTML}
    </nav>
  </div>`;
  }

  function hideSquarespaceNav() {
    // When mobileMode=default, CSS media queries handle all show/hide declaratively
    if (config.mobileMode === 'default') {
      return;
    }

    const navSelectors = [
      '.header-nav',
      '.header-menu-nav-wrapper',
      '.header-nav-wrapper',
      '[data-nc-element="navigation"]',
    ];
    navSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.cssText = 'display: none !important; visibility: hidden !important;';
      }
    });
    console.log('✅ Squarespace nav hidden');
  }

  function restoreSquarespaceNav() {
    const navSelectors = [
      '.header-nav',
      '.header-menu-nav-wrapper',
      '.header-nav-wrapper',
      '[data-nc-element="navigation"]',
    ];
    navSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.cssText = '';
      }
    });
    console.log('✅ Squarespace nav restored (mobileMode=default, mobile viewport)');
  }

  function insertCustomMenu(menuHTML) {
    const existing = document.querySelector('.anavo-menu-wrapper');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('afterbegin', menuHTML);
    console.log('✅ Custom menu inserted');
  }

  function enableBurgerMode() {
    const wrapper = document.querySelector('.anavo-menu-wrapper');
    if (!wrapper) return;

    const burgerStyles = document.createElement('style');
    burgerStyles.id = 'anavo-burger-styles';
    burgerStyles.textContent = `
      @media (max-width: 479px) {
        .anavo-burger-btn {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: none !important;
          border: none !important;
          cursor: pointer !important;
          padding: 10px !important;
          z-index: 100001 !important;
        }
        .anavo-burger-icon {
          display: flex !important;
          flex-direction: column !important;
          gap: 5px !important;
        }
        .anavo-burger-icon span {
          display: block !important;
          width: 24px !important;
          height: 2px !important;
          background: ${config.fontColor || '#000'} !important;
          transition: transform 0.2s, opacity 0.2s !important;
        }
        html body nav.anavo-custom-menu {
          display: none !important;
          flex-direction: column !important;
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          right: 0 !important;
          padding: 10px 0 !important;
          background: ${config.bgColor || '#fff'} !important;
        }
        html body nav.anavo-custom-menu.anavo-menu-open {
          display: flex !important;
        }
        .anavo-menu-wrapper {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          padding: 0 15px !important;
        }
      }
      @media (min-width: 480px) {
        .anavo-burger-btn {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(burgerStyles);

    const burgerBtn = document.createElement('button');
    burgerBtn.className = 'anavo-burger-btn';
    burgerBtn.setAttribute('aria-label', 'Toggle menu');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.innerHTML = `<span class="anavo-burger-icon"><span></span><span></span><span></span></span>`;

    const nav = wrapper.querySelector('nav.anavo-custom-menu');
    wrapper.insertBefore(burgerBtn, nav);

    burgerBtn.addEventListener('click', function() {
      const isOpen = nav.classList.toggle('anavo-menu-open');
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    console.log('✅ Burger mode enabled');
  }

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

      ${config.mobileMode === 'default' ? `
      /* mobileMode=default: CSS media queries handle all show/hide declaratively */

      /* MOBILE (≤479px): hide custom menu completely; keep Squarespace header visible & interactive */
      @media (max-width: 479px) {
        html body div.anavo-menu-wrapper,
        html body div[class*="anavo-menu"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        .header, .Header, header, [data-nc-group="header"] {
          display: block !important;
          visibility: visible !important;
          height: auto !important;
          min-height: initial !important;
          max-height: none !important;
          overflow: visible !important;
          pointer-events: auto !important;
          position: relative !important;
          top: auto !important;
        }
        .header-nav, .header-menu-nav-wrapper, .header-nav-wrapper, [data-nc-element="navigation"] {
          display: block !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }
      }

      /* DESKTOP (≥480px): hide Squarespace header/nav; show custom menu */
      @media (min-width: 480px) {
        .header, .Header, header, [data-nc-group="header"] {
          display: none !important;
          visibility: hidden !important;
          height: 5px !important;
          min-height: 5px !important;
          max-height: 5px !important;
          overflow: hidden !important;
          pointer-events: none !important;
          position: fixed !important;
          top: -5px !important;
        }
        .header-nav, .header-menu-nav-wrapper, .header-nav-wrapper, [data-nc-element="navigation"] {
          display: none !important;
          visibility: hidden !important;
        }
      }
      ` : ''}
    `;

    document.head.appendChild(styles);
    console.log('✅ Injected custom styles');
  }

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

      if (config.mobileMode !== 'default') {
        setTimeout(forceHideSquarespaceHeader, 500);
        setTimeout(forceHideSquarespaceHeader, 1000);
      }

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
