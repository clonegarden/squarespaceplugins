/**
 * =======================================
 * EXPANDED MENU PLUGIN - Squarespace
 * =======================================
 * @version 2.0.3
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * FIXED: Menu visibility issues
 * IMPROVED: Force menu to be visible at body level
 * =======================================
 */

(function() {
  'use strict';

  console.log('🚀 Expanded Menu Plugin v2.0.3 - Starting...');

  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    return {
      containerWidth: params.get('containerWidth') || '100%',
      menuSpacing: params.get('menuSpacing') || '60px',
      tabletSpacing: params.get('tabletSpacing') || '30px',
      mobileSpacing: params.get('mobileSpacing') || '20px',
      centerMenu: params.get('centerMenu') !== 'false',
      mobileMode: params.get('mobileMode') || 'custom'
    };
  }

  const config = getScriptParams();
  console.log('⚙️ Config:', config);

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
      /* Hide ALL Squarespace navigation */
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

    const styles = document.createElement('style');
    styles.id = 'anavo-expanded-menu-styles';
    styles.textContent = `
      /* ANAVO CUSTOM MENU v2.0.3 - FORCE VISIBILITY */
      
      /* CRITICAL: Force wrapper to be visible */
      div.anavo-menu-wrapper,
      div[class*="anavo-menu"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100% !important;
        height: auto !important;
        position: relative !important;
        z-index: 10000 !important;
        background: var(--white, #fff) !important;
        border-bottom: 1px solid var(--lightAccentColor, #e8e8e8) !important;
        overflow: visible !important;
        clip: auto !important;
        clip-path: none !important;
        transform: none !important;
      }

      /* Force custom menu to be visible */
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
        font-family: var(--heading-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) !important;
        min-height: 60px !important;
        box-sizing: border-box !important;
        ${centeringCSS}
      }

      /* Force menu items to be visible */
      div.anavo-menu-item {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        white-space: nowrap !important;
      }

      /* Force links to be visible */
      a.anavo-menu-link,
      span.anavo-menu-link {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
        padding: 8px 12px !important;
        color: var(--menuTextColor, #000) !important;
        text-decoration: none !important;
        font-weight: 500 !important;
        font-size: 1rem !important;
        letter-spacing: 0.05em !important;
        transition: opacity 0.2s ease !important;
        cursor: pointer !important;
      }

      a.anavo-menu-link:hover,
      span.anavo-menu-link:hover {
        opacity: 0.7 !important;
      }

      .anavo-menu-item--active .anavo-menu-link {
        font-weight: 700 !important;
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
      }

      .anavo-menu-folder:hover .anavo-menu-arrow {
        transform: rotate(180deg) !important;
      }

      .anavo-menu-dropdown {
        position: absolute !important;
        top: 100% !important;
        left: 0 !important;
        min-width: 200px !important;
        background: var(--white, #ffffff) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        border-radius: 4px !important;
        padding: 8px 0 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transform: translateY(-10px) !important;
        transition: opacity 0.2s, transform 0.2s, visibility 0.2s !important;
        z-index: 10001 !important;
      }

      .anavo-menu-folder:hover .anavo-menu-dropdown {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
      }

      .anavo-menu-dropdown-item {
        display: block !important;
        padding: 12px 20px !important;
        color: var(--menuTextColor, #000) !important;
        text-decoration: none !important;
        font-size: 0.95rem !important;
        transition: background 0.2s !important;
      }

      .anavo-menu-dropdown-item:hover {
        background: var(--lightAccentColor, #f5f5f5) !important;
      }

      /* RESPONSIVE BREAKPOINTS */

      @media (max-width: 800px) and (min-width: 480px) {
        nav.anavo-custom-menu {
          gap: ${config.tabletSpacing} !important;
          padding: 15px 1.5vw !important;
        }

        a.anavo-menu-link,
        span.anavo-menu-link {
          font-size: 0.95rem !important;
          padding: 6px 10px !important;
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
          font-size: 0.9rem !important;
          padding: 6px 8px !important;
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
          font-size: 0.85rem !important;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Injected custom styles with MAXIMUM specificity');
  }

  function insertCustomMenu(menuHTML) {
    // CRITICAL FIX: Insert at BODY level, NOT inside header
    // This prevents Squarespace's header CSS from hiding our menu
    
    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'anavo-menu-wrapper';
    menuWrapper.id = 'anavo-menu-' + Date.now();
    
    // Force inline styles for guaranteed visibility
    menuWrapper.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      position: relative !important;
      z-index: 10000 !important;
      background: white !important;
      border-bottom: 1px solid #e8e8e8 !important;
    `;
    
    menuWrapper.innerHTML = menuHTML;

    // Find the header to insert AFTER it (not inside it)
    const header = document.querySelector('.header') || 
                   document.querySelector('.Header') ||
                   document.querySelector('[data-nc-group="header"]') ||
                   document.querySelector('header');

    if (header && header.parentNode) {
      // Insert AFTER header (not inside)
      header.parentNode.insertBefore(menuWrapper, header.nextSibling);
      console.log('✅ Inserted menu AFTER header (outside header element)');
    } else {
      // Fallback: Insert at top of body
      document.body.insertBefore(menuWrapper, document.body.firstChild);
      console.log('✅ Inserted menu at top of body (fallback)');
    }

    // Verify insertion with detailed logging
    setTimeout(() => {
      const check = document.querySelector('.anavo-custom-menu');
      if (check) {
        console.log('✅ Menu verified in DOM');
        const rect = check.getBoundingClientRect();
        console.log(`📐 Menu dimensions:`, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          display: window.getComputedStyle(check).display,
          visibility: window.getComputedStyle(check).visibility,
          opacity: window.getComputedStyle(check).opacity
        });
        
        if (rect.width === 0 || rect.height === 0) {
          console.error('❌ Menu still has zero dimensions!');
          console.error('Computed styles:', window.getComputedStyle(check));
        } else {
          console.log('✅ Menu is visible with proper dimensions!');
        }
      } else {
        console.error('❌ Menu not found after insertion!');
      }
    }, 100);

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
        '2.0.3',
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

      console.log('✅ Expanded Menu Plugin v2.0.3 Active!');
      console.log('   Desktop Spacing:', config.menuSpacing);
      console.log('   Tablet Spacing:', config.tabletSpacing);
      console.log('   Mobile Spacing:', config.mobileSpacing);
      console.log('   Mobile Mode:', config.mobileMode);

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
