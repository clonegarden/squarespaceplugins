/**
 * =======================================
 * EXPANDED MENU PLUGIN - Squarespace
 * =======================================
 * @version 2.2.5
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * FIXED v2.1.4:
 * - Forces header hiding via JavaScript
 * - Removes all Squarespace header space
 * - Perfect sticky positioning
 * 
 * CRITICAL FIX: Uses inline styles to override Squarespace
 * =======================================
 */

(function() {
  'use strict';

  console.log('🚀 Expanded Menu Plugin v2.1.4 - Starting...');

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

  // NEW: Force hide Squarespace header via JavaScript
  function forceHideSquarespaceHeader() {
    const headers = document.querySelectorAll('.header, .Header, header, [data-nc-group="header"]');
    
    headers.forEach(header => {
      header.style.cssText = `
        display: none !important;
        visibility: hidden !important;
        height: 5 !important;
        min-height: 5 !important;
        max-height: 5 !important;
        padding: 0 !important;
        margin: 0 !important;
        position: absolute !important;
        top: -5px !important;
        left: 0px !important;
        pointer-events: none !important;
        overflow: hidden !important;
      `;
    });

    // Remove body padding from Squarespace
    document.body.style.paddingTop = '0';
    document.body.style.marginTop = '0';

    // Remove first section padding
    const firstSection = document.querySelector('#page .page-section:first-child, .page-section:first-child');
    if (firstSection) {
      firstSection.style.paddingTop = '0';
      firstSection.style.marginTop = '0';
    }

    // Remove #page margins
    const page = document.querySelector('#page');
    if (page) {
      page.style.paddingTop = '0';
      page.style.marginTop = '0';
    }

    console.log('✅ Forced header hiding via inline styles');
  }

  function waitForSquarespaceNav() {
    return new Promise((resolve) => {
      const selectors = [
        '.header-nav-list',
        '.header-menu-nav-list',
        '[data-folder="root"] .header-nav-list',
        '.header-nav-wrapper .header-nav-list'
      ];

      function checkNav() {
        for (const selector of selectors) {
          const nav = document.querySelector(selector);
          if (nav && nav.children.length > 0) {
            console.log('✅ Found Squarespace navigation:', selector);
            resolve(nav);
            return true;
          }
        }
        return false;
      }

      if (checkNav()) return;

      let attempts = 0;
      const maxAttempts = 50;
      const interval = setInterval(() => {
        attempts++;
        
        if (checkNav()) {
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.error('❌ Squarespace navigation not found after 5 seconds');
          resolve(null);
        }
      }, 100);
    });
  }

  function extractMenuItems(navList) {
    if (!navList) {
      console.error('❌ Cannot extract menu items - nav list is null');
      return [];
    }

    const menuItems = [];
    const items = navList.querySelectorAll('.header-nav-item');
    
    console.log(`📋 Found ${items.length} menu items`);

    items.forEach((item, index) => {
      const link = item.querySelector('a');
      if (!link) {
        console.warn(`⚠️ Item ${index} has no link, skipping`);
        return;
      }

      const menuItem = {
        text: link.textContent.trim(),
        href: link.getAttribute('href') || '#',
        target: link.getAttribute('target') || '_self',
        isFolder: item.classList.contains('header-nav-item--folder'),
        isActive: item.classList.contains('header-nav-item--active'),
        children: []
      };

      if (menuItem.isFolder) {
        const folderContent = item.querySelector('.header-nav-folder-content');
        if (folderContent) {
          const folderItems = folderContent.querySelectorAll('.header-nav-folder-item a');
          folderItems.forEach(folderLink => {
            menuItem.children.push({
              text: folderLink.textContent.trim(),
              href: folderLink.getAttribute('href') || '#',
              target: folderLink.getAttribute('target') || '_self'
            });
          });
          console.log(`  📁 Folder "${menuItem.text}" has ${menuItem.children.length} children`);
        }
      }

      menuItems.push(menuItem);
      console.log(`  ✓ ${index + 1}. ${menuItem.text} ${menuItem.isActive ? '(active)' : ''}`);
    });

    return menuItems;
  }

  function buildCustomMenu(menuItems) {
    if (!menuItems || menuItems.length === 0) {
      console.error('❌ No menu items to build');
      return '<nav class="anavo-custom-menu"><p style="color:red;font-size:20px;padding:20px;">No menu items found</p></nav>';
    }

    const menuHTML = menuItems.map((item, index) => {
      if (item.isFolder && item.children.length > 0) {
        const childrenHTML = item.children.map(child => 
          `<a href="${child.href}" target="${child.target}" class="anavo-menu-dropdown-item">
            ${child.text}
          </a>`
        ).join('');

        return `
          <div class="anavo-menu-item anavo-menu-folder" data-folder-index="${index}">
            <span class="anavo-menu-link anavo-menu-folder-toggle">
              ${item.text}
              <svg class="anavo-menu-arrow" width="10" height="6" viewBox="0 0 10 6">
                <path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5"/>
              </svg>
            </span>
            <div class="anavo-menu-dropdown">
              ${childrenHTML}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="anavo-menu-item ${item.isActive ? 'anavo-menu-item--active' : ''}">
            <a href="${item.href}" target="${item.target}" class="anavo-menu-link">
              ${item.text}
            </a>
          </div>
        `;
      }
    }).join('');

    console.log('✅ Built custom menu HTML');
    return `<nav class="anavo-custom-menu" role="navigation">${menuHTML}</nav>`;
  }

  function hideSquarespaceNav() {
    const hideCSS = `
      .header-nav,
      .header-nav-wrapper,
      .header-nav-list,
      .header-display-desktop,
      .header-menu,
      .header-menu-bg,
      .header-menu-nav-wrapper,
      .header-burger,
      [data-nc-element="header-nav"] {
        display: none !important;
        visibility: hidden !important;
      }
    `;

    const style = document.createElement('style');
    style.id = 'anavo-hide-squarespace-nav';
    style.textContent = hideCSS;
    document.head.appendChild(style);

    console.log('✅ Hid Squarespace navigation');
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
      /* ANAVO CUSTOM MENU v2.1.4 - STICKY + NO HEADER SPACE */
      
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

      @media (max-width: 479px) {
        nav.anavo-custom-menu {
          gap: ${config.mobileSpacing} !important;
          padding: 12px 1vw !important;
          flex-wrap: wrap !important;
        }

        a.anavo-menu-link,
        span.anavo-menu-link {
          font-size: ${Math.max(parseInt(config.fontSize) - 4, 12)}px !important;
          padding: 6px 8px !important;
          padding-bottom: 8px !important;
        }

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


/* FORÇA ITENS COMPACTOS NO MOBILE - RESET TOTAL */

  /* Reset completo do menu */
  html body nav.anavo-custom-menu {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    align-items: center !important;
    gap: 15px !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: 12px 15px !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  
  /* Esconde scrollbar */
  html body nav.anavo-custom-menu::-webkit-scrollbar {
    display: none !important;
  }
  
  /* FORÇA ITENS A TER APENAS TAMANHO DO CONTEÚDO */
  html body div.anavo-menu-item {
    flex: 0 0 auto !important;        /* NÃO cresce, NÃO encolhe */
    flex-grow: 0 !important;
    flex-shrink: 0 !important;
    flex-basis: auto !important;
    width: auto !important;           /* Apenas largura do conteúdo */
    min-width: 0 !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* FORÇA LINKS COMPACTOS */
  html body a.anavo-menu-link,
  html body span.anavo-menu-link {
    display: inline-block !important;
    width: auto !important;           /* Apenas largura do texto */
    min-width: 0 !important;
    max-width: none !important;
    padding: 8px 12px !important;     /* Padding compacto */
    margin: 0 !important;
    font-size: 14px !important;
    white-space: nowrap !important;
    box-sizing: border-box !important;
  }

        
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Injected custom styles');
  }

  function insertCustomMenu(menuHTML) {
    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'anavo-menu-wrapper';
    menuWrapper.id = 'anavo-menu-' + Date.now();
    
    let inlineStyles = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      z-index: 99999 !important;
    `;

    if (config.stickyMenu) {
      inlineStyles += `
        position: fixed !important;
        top: ${config.stickyTop}px !important;
        left: 0 !important;
        right: 0 !important;
      `;
    } else {
      inlineStyles += `position: relative !important;\n`;
    }

    if (config.bgColor !== null) {
      inlineStyles += `background: ${config.bgColor} !important;\n`;
      inlineStyles += `background-color: ${config.bgColor} !important;\n`;
    } else {
      inlineStyles += `background: var(--white, #fff) !important;\n`;
      inlineStyles += `background-color: var(--white, #fff) !important;\n`;
    }

    if (config.showSectionBorder) {
      const borderColorValue = config.sectionBorderColor || 'var(--lightAccentColor, #e8e8e8)';
      inlineStyles += `border-bottom: ${config.sectionBorderWidth}px solid ${borderColorValue} !important;\n`;
    }
    
    menuWrapper.style.cssText = inlineStyles;
    menuWrapper.innerHTML = menuHTML;

    document.body.insertBefore(menuWrapper, document.body.firstChild);
    console.log('✅ Inserted menu at top of body');

    // CRITICAL: Add padding to body for sticky menu
    if (config.stickyMenu) {
      setTimeout(() => {
        const menuHeight = menuWrapper.offsetHeight;
        document.body.style.paddingTop = menuHeight + 'px';
        console.log(`✅ Added body padding: ${menuHeight}px`);
      }, 100);
    }

    setTimeout(() => {
      const check = document.querySelector('.anavo-custom-menu');
      if (check) {
        console.log('✅ Menu verified in DOM');
        const rect = check.getBoundingClientRect();
        const wrapper = check.closest('.anavo-menu-wrapper');
        const computedBg = wrapper ? window.getComputedStyle(wrapper).backgroundColor : 'N/A';
        
        console.log(`📐 Menu dimensions:`, {
          width: rect.width,
          height: rect.height,
          position: window.getComputedStyle(wrapper).position,
          top: window.getComputedStyle(wrapper).top,
          zIndex: window.getComputedStyle(wrapper).zIndex,
          wrapperBackgroundColor: computedBg
        });
      }
    }, 150);

    initializeMobileFolders();
  }

  function initializeMobileFolders() {
    const folders = document.querySelectorAll('.anavo-menu-folder');

    folders.forEach(folder => {
      const toggle = folder.querySelector('.anavo-menu-folder-toggle');
      
      if (!toggle) return;

      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 800) {
          e.preventDefault();
          folder.classList.toggle('anavo-folder-open');
          
          folders.forEach(otherFolder => {
            if (otherFolder !== folder) {
              otherFolder.classList.remove('anavo-folder-open');
            }
          });
        }
      });
    });

    console.log(`✅ Initialized ${folders.length} folder toggles`);
  }

  function enableBurgerMode() {
    const hideStyle = document.getElementById('anavo-hide-squarespace-nav');
    if (hideStyle) hideStyle.remove();

    const burgerCSS = `
      @media (max-width: 800px) {
        .anavo-menu-wrapper {
          display: none !important;
        }

        .header-burger,
        .header-menu {
          display: block !important;
          visibility: visible !important;
        }
      }
    `;

    const style = document.createElement('style');
    style.id = 'anavo-burger-mode';
    style.textContent = burgerCSS;
    document.head.appendChild(style);

    console.log('✅ Burger mode enabled');
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
        '2.1.4',
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

      // CRITICAL: Hide header FIRST, before everything else
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

      // Force hide header again after DOM settled
      setTimeout(forceHideSquarespaceHeader, 500);
      setTimeout(forceHideSquarespaceHeader, 1000);

      console.log('✅ Expanded Menu Plugin v2.1.4 Active!');
      console.log('   Sticky Menu:', config.stickyMenu ? 'Enabled' : 'Disabled');

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
