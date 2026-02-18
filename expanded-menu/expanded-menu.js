/**
 * =======================================
 * EXPANDED MENU PLUGIN - Squarespace
 * =======================================
 * @version 2.0.1
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * COMPLETE REWRITE - Custom Menu Builder
 * - Extracts Squarespace navigation
 * - Builds custom responsive menu
 * - Works on Desktop (>800px), Tablet (480-800px), Mobile (<480px)
 * - Optional burger menu mode
 *
 * USAGE:
 * <script src=".../expanded-menu.min.js?menuSpacing=60px"></script>
 *
 * PARAMETERS:
 * - containerWidth: Max width (default: 100%)
 * - menuSpacing: Desktop spacing (default: 60px)
 * - tabletSpacing: Tablet spacing (default: 30px)
 * - mobileSpacing: Mobile spacing (default: 20px)
 * - centerMenu: Center menu (default: true)
 * - mobileMode: 'custom' or 'burger' (default: custom)
 * =======================================
 */

(function() {
  'use strict';

  console.log('🚀 Expanded Menu Plugin v2.0.1 - Starting...');

  // ========================================
  // 1. CONFIGURATION
  // ========================================
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

  // ========================================
  // 2. WAIT FOR SQUARESPACE NAVIGATION
  // ========================================
  function waitForSquarespaceNav() {
    return new Promise((resolve) => {
      // Try multiple selectors for 7.0 and 7.1
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

      // Check immediately
      if (checkNav()) return;

      // Check every 100ms for up to 5 seconds
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

  // ========================================
  // 3. EXTRACT MENU ITEMS
  // ========================================
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

      // Extract folder children
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

  // ========================================
  // 4. BUILD CUSTOM MENU HTML
  // ========================================
  function buildCustomMenu(menuItems) {
    if (!menuItems || menuItems.length === 0) {
      console.error('❌ No menu items to build');
      return '<nav class="anavo-custom-menu"><p style="color:red;">No menu items found</p></nav>';
    }

    const menuHTML = menuItems.map((item, index) => {
      if (item.isFolder && item.children.length > 0) {
        // Dropdown folder
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
        // Regular link
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

  // ========================================
  // 5. HIDE SQUARESPACE NAVIGATION
  // ========================================
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

  // ========================================
  // 6. INJECT CUSTOM MENU STYLES
  // ========================================
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
      /* ANAVO CUSTOM MENU v2.0.1 */
      
      .anavo-menu-wrapper {
        width: 100%;
        background: var(--white, #fff);
        border-bottom: 1px solid var(--lightAccentColor, #e8e8e8);
      }

      .anavo-custom-menu {
        display: flex;
        align-items: center;
        gap: ${config.menuSpacing};
        width: ${config.containerWidth};
        max-width: ${config.containerWidth};
        margin: 0 auto;
        padding: 20px 2vw;
        font-family: var(--heading-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        ${centeringCSS}
      }

      .anavo-menu-item {
        position: relative;
        white-space: nowrap;
      }

      .anavo-menu-link {
        display: inline-block;
        padding: 8px 12px;
        color: var(--menuTextColor, currentColor);
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        letter-spacing: 0.05em;
        transition: opacity 0.2s ease;
        cursor: pointer;
      }

      .anavo-menu-link:hover {
        opacity: 0.7;
      }

      .anavo-menu-item--active .anavo-menu-link {
        font-weight: 700;
      }

      .anavo-menu-folder {
        position: relative;
      }

      .anavo-menu-folder-toggle {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .anavo-menu-arrow {
        transition: transform 0.2s ease;
      }

      .anavo-menu-folder:hover .anavo-menu-arrow {
        transform: rotate(180deg);
      }

      .anavo-menu-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 200px;
        background: var(--white, #ffffff);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 4px;
        padding: 8px 0;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
        z-index: 1000;
      }

      .anavo-menu-folder:hover .anavo-menu-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .anavo-menu-dropdown-item {
        display: block;
        padding: 12px 20px;
        color: var(--menuTextColor, currentColor);
        text-decoration: none;
        font-size: 0.95rem;
        transition: background 0.2s;
      }

      .anavo-menu-dropdown-item:hover {
        background: var(--lightAccentColor, #f5f5f5);
      }

      /* RESPONSIVE BREAKPOINTS */

      /* Tablet (480-800px) */
      @media (max-width: 800px) and (min-width: 480px) {
        .anavo-custom-menu {
          gap: ${config.tabletSpacing};
          padding: 15px 1.5vw;
        }

        .anavo-menu-link {
          font-size: 0.95rem;
          padding: 6px 10px;
        }
      }

      /* Mobile (<480px) */
      @media (max-width: 479px) {
        .anavo-custom-menu {
          gap: ${config.mobileSpacing};
          padding: 12px 1vw;
          flex-wrap: wrap;
        }

        .anavo-menu-link {
          font-size: 0.9rem;
          padding: 6px 8px;
        }

        .anavo-menu-dropdown {
          position: static;
          box-shadow: none;
          background: transparent;
          opacity: 1;
          visibility: visible;
          transform: none;
          display: none;
          padding: 0;
          margin-top: 8px;
        }

        .anavo-menu-folder.anavo-folder-open .anavo-menu-dropdown {
          display: block;
        }

        .anavo-menu-dropdown-item {
          padding: 8px 16px;
          font-size: 0.85rem;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Injected custom styles');
  }

  // ========================================
  // 7. INSERT CUSTOM MENU
  // ========================================
  function insertCustomMenu(menuHTML) {
    // Find header - try multiple selectors
    const header = document.querySelector('.header') || 
                   document.querySelector('.Header') ||
                   document.querySelector('[data-nc-group="header"]') ||
                   document.querySelector('header');

    if (!header) {
      console.error('❌ Could not find header element');
      // Fallback: insert at top of body
      const fallbackWrapper = document.createElement('div');
      fallbackWrapper.className = 'anavo-menu-wrapper';
      fallbackWrapper.innerHTML = menuHTML;
      document.body.insertBefore(fallbackWrapper, document.body.firstChild);
      console.log('⚠️ Inserted menu at top of body (fallback)');
      return;
    }

    // Create wrapper
    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'anavo-menu-wrapper';
    menuWrapper.innerHTML = menuHTML;

    // Insert after logo/title or at beginning
    const titleLogo = header.querySelector('.header-title-logo') || 
                      header.querySelector('.header-title') ||
                      header.querySelector('.header-display-desktop');
    
    if (titleLogo && titleLogo.parentNode) {
      titleLogo.parentNode.insertBefore(menuWrapper, titleLogo.nextSibling);
      console.log('✅ Inserted menu after logo');
    } else {
      header.appendChild(menuWrapper);
      console.log('✅ Inserted menu at end of header');
    }

    // Add mobile folder toggles
    initializeMobileFolders();
  }

  // ========================================
  // 8. INITIALIZE MOBILE FOLDER TOGGLES
  // ========================================
  function initializeMobileFolders() {
    const folders = document.querySelectorAll('.anavo-menu-folder');

    folders.forEach(folder => {
      const toggle = folder.querySelector('.anavo-menu-folder-toggle');
      
      if (!toggle) return;

      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 800) {
          e.preventDefault();
          folder.classList.toggle('anavo-folder-open');
          
          // Close other folders
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

  // ========================================
  // 9. BURGER MODE (OPTIONAL)
  // ========================================
  function enableBurgerMode() {
    // Re-enable Squarespace burger on mobile
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

  // ========================================
  // 10. LOAD LICENSING
  // ========================================
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
        '2.0.1',
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

  // ========================================
  // 11. MAIN INITIALIZATION
  // ========================================
  async function init() {
    try {
      console.log('🔧 Starting initialization...');

      // Step 1: Wait for Squarespace navigation
      const navList = await waitForSquarespaceNav();
      
      if (!navList) {
        console.error('❌ Failed to find Squarespace navigation - aborting');
        return;
      }

      // Step 2: Extract menu items
      const menuItems = extractMenuItems(navList);
      
      if (menuItems.length === 0) {
        console.error('❌ No menu items extracted - aborting');
        return;
      }

      // Step 3: Build custom menu HTML
      const menuHTML = buildCustomMenu(menuItems);

      // Step 4: Hide Squarespace navigation
      hideSquarespaceNav();

      // Step 5: Inject custom styles
      injectStyles();

      // Step 6: Insert custom menu
      insertCustomMenu(menuHTML);

      // Step 7: Enable burger mode if requested
      if (config.mobileMode === 'burger') {
        enableBurgerMode();
      }

      console.log('✅ Expanded Menu Plugin v2.0.1 Active!');
      console.log('   Desktop Spacing:', config.menuSpacing);
      console.log('   Tablet Spacing:', config.tabletSpacing);
      console.log('   Mobile Spacing:', config.mobileSpacing);
      console.log('   Mobile Mode:', config.mobileMode);

      // Step 8: Load licensing (non-blocking)
      loadLicensing();

    } catch (error) {
      console.error('❌ Plugin initialization failed:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  // ========================================
  // 12. AUTO-INITIALIZE
  // ========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
