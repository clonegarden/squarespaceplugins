/**
 * =======================================
 * EXPANDED MENU PLUGIN - Squarespace
 * =======================================
 * @version 2.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * COMPLETE REWRITE:
 * - Removes ALL native Squarespace navigation
 * - Builds custom menu from scratch
 * - Responsive breakpoints: Desktop (>800px), Tablet (480-800px), Mobile (<480px)
 * - Optional burger menu mode
 *
 * USAGE:
 * <script src=".../expanded-menu.min.js?menuSpacing=60px&mobileMode=custom"></script>
 *
 * PARAMETERS:
 * - containerWidth: Max width of header (default: 100%)
 * - menuSpacing: Desktop spacing (default: 60px)
 * - tabletSpacing: Tablet spacing (default: 30px) - more than native but less than desktop
 * - mobileSpacing: Mobile spacing (default: 20px) - normal Squarespace spacing
 * - centerMenu: Center the menu (default: true)
 * - mobileMode: 'custom' (rebuild menu) or 'burger' (use native burger) (default: custom)
 * =======================================
 */

(function() {
  'use strict';

  // ========================================
  // 1. CAPTURE SCRIPT & PARSE PARAMETERS
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
      license: params.get('license') || '',
      containerWidth: params.get('containerWidth') || '100%',
      menuSpacing: params.get('menuSpacing') || '60px',
      tabletSpacing: params.get('tabletSpacing') || '30px',
      mobileSpacing: params.get('mobileSpacing') || '20px',
      centerMenu: params.get('centerMenu') !== 'false',
      mobileMode: params.get('mobileMode') || 'custom' // 'custom' or 'burger'
    };
  }

  const config = getScriptParams();

  console.log('🚀 Expanded Menu Plugin v2.0.0 - Custom Menu Builder');
  console.log('   Mode:', config.mobileMode);

  // ========================================
  // 2. EXTRACT MENU ITEMS FROM SQUARESPACE
  // ========================================
  function extractMenuItems() {
    const menuItems = [];
    
    // Find Squarespace's desktop navigation
    const navList = document.querySelector('.header-nav-list');
    
    if (!navList) {
      console.error('❌ Could not find Squarespace navigation');
      return menuItems;
    }

    // Extract each menu item
    const items = navList.querySelectorAll('.header-nav-item');
    
    items.forEach(item => {
      const link = item.querySelector('a');
      if (!link) return;

      const menuItem = {
        text: link.textContent.trim(),
        href: link.getAttribute('href'),
        target: link.getAttribute('target') || '_self',
        isFolder: item.classList.contains('header-nav-item--folder'),
        isActive: item.classList.contains('header-nav-item--active'),
        children: []
      };

      // Extract folder items if it's a dropdown
      if (menuItem.isFolder) {
        const folderContent = item.querySelector('.header-nav-folder-content');
        if (folderContent) {
          const folderItems = folderContent.querySelectorAll('.header-nav-folder-item a');
          folderItems.forEach(folderLink => {
            menuItem.children.push({
              text: folderLink.textContent.trim(),
              href: folderLink.getAttribute('href'),
              target: folderLink.getAttribute('target') || '_self'
            });
          });
        }
      }

      menuItems.push(menuItem);
    });

    console.log(`✅ Extracted ${menuItems.length} menu items`);
    return menuItems;
  }

  // ========================================
  // 3. BUILD CUSTOM MENU HTML
  // ========================================
  function buildCustomMenu(menuItems) {
    const menuHTML = menuItems.map((item, index) => {
      if (item.isFolder && item.children.length > 0) {
        // Build dropdown folder
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
        // Build regular link
        return `
          <div class="anavo-menu-item ${item.isActive ? 'anavo-menu-item--active' : ''}">
            <a href="${item.href}" target="${item.target}" class="anavo-menu-link">
              ${item.text}
            </a>
          </div>
        `;
      }
    }).join('');

    return `<nav class="anavo-custom-menu" role="navigation">${menuHTML}</nav>`;
  }

  // ========================================
  // 4. HIDE SQUARESPACE NAVIGATION
  // ========================================
  function hideSquarespaceNav() {
    const hideCSS = `
      /* Hide ALL Squarespace native navigation (7.0 & 7.1) */
      .header-nav,
      .header-nav-wrapper,
      .header-nav-list,
      .header-display-desktop,
      .header-menu,
      .header-menu-bg,
      .header-menu-nav,
      .header-menu-nav-wrapper,
      .header-burger,
      [data-nc-element="header-nav"],
      [data-nc-group="header-nav"] {
        display: none !important;
        visibility: hidden !important;
      }

      /* Prevent body scroll lock */
      body.mobile-nav-open,
      body[data-mobile-nav-open="true"] {
        overflow: auto !important;
      }
    `;

    const style = document.createElement('style');
    style.id = 'anavo-hide-squarespace-nav';
    style.textContent = hideCSS;
    document.head.appendChild(style);

    console.log('✅ Hid all Squarespace navigation');
  }

  // ========================================
  // 5. INJECT CUSTOM MENU STYLES
  // ========================================
  function injectStyles() {
    const existingStyles = document.getElementById('anavo-expanded-menu-styles');
    if (existingStyles) existingStyles.remove();

    const centeringCSS = config.centerMenu ? `
      .anavo-custom-menu {
        justify-content: center !important;
      }
    ` : '';

    const styles = document.createElement('style');
    styles.id = 'anavo-expanded-menu-styles';
    styles.textContent = `
      /* ========================================
       * ANAVO CUSTOM MENU - v2.0.0
       * ======================================== */

      /* Menu container */
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

      /* Menu item container */
      .anavo-menu-item {
        position: relative;
        white-space: nowrap;
      }

      /* Menu links */
      .anavo-menu-link {
        display: inline-block;
        padding: 8px 12px;
        color: var(--menuTextColor, currentColor);
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        letter-spacing: 0.05em;
        transition: color 0.2s ease, opacity 0.2s ease;
        cursor: pointer;
      }

      .anavo-menu-link:hover {
        opacity: 0.7;
      }

      /* Active state */
      .anavo-menu-item--active .anavo-menu-link {
        font-weight: 700;
      }

      /* Folder/Dropdown */
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

      /* Dropdown content */
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
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
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
        transition: background 0.2s ease;
      }

      .anavo-menu-dropdown-item:hover {
        background: var(--lightAccentColor, #f5f5f5);
      }

      /* ========================================
       * RESPONSIVE BREAKPOINTS
       * ======================================== */

      /* TABLET (480px - 800px) - Reduced spacing, centered */
      @media (max-width: 800px) and (min-width: 480px) {
        .anavo-custom-menu {
          gap: ${config.tabletSpacing};
          padding: 15px 1.5vw;
        }

        .anavo-menu-link {
          font-size: 0.95rem;
          padding: 6px 10px;
        }

        .anavo-menu-dropdown {
          min-width: 180px;
        }
      }

      /* MOBILE (<480px) - Normal Squarespace spacing */
      @media (max-width: 479px) {
        .anavo-custom-menu {
          gap: ${config.mobileSpacing};
          padding: 12px 1vw;
        }

        .anavo-menu-link {
          font-size: 0.9rem;
          padding: 6px 8px;
        }

        .anavo-menu-dropdown {
          min-width: 160px;
          font-size: 0.85rem;
        }

        .anavo-menu-dropdown-item {
          padding: 10px 16px;
        }
      }

      /* EXTRA SMALL MOBILE (<360px) */
      @media (max-width: 360px) {
        .anavo-custom-menu {
          gap: calc(${config.mobileSpacing} * 0.7);
        }

        .anavo-menu-link {
          font-size: 0.85rem;
          padding: 5px 6px;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Custom menu styles injected');
  }

  // ========================================
  // 6. INSERT CUSTOM MENU INTO HEADER
  // ========================================
  function insertCustomMenu(menuHTML) {
    // Find header container
    const header = document.querySelector('.header') || 
                   document.querySelector('.Header') ||
                   document.querySelector('[data-nc-group="header"]');

    if (!header) {
      console.error('❌ Could not find header element');
      return;
    }

    // Create wrapper for custom menu
    const menuWrapper = document.createElement('div');
    menuWrapper.className = 'anavo-menu-wrapper';
    menuWrapper.innerHTML = menuHTML;

    // Insert after header-title-logo or at beginning
    const titleLogo = header.querySelector('.header-title-logo') || 
                      header.querySelector('.header-title');
    
    if (titleLogo && titleLogo.parentNode) {
      titleLogo.parentNode.insertBefore(menuWrapper, titleLogo.nextSibling);
    } else {
      header.appendChild(menuWrapper);
    }

    console.log('✅ Custom menu inserted into header');

    // Add folder click handlers
    initializeFolderToggles();
  }

  // ========================================
  // 7. INITIALIZE FOLDER/DROPDOWN TOGGLES
  // ========================================
  function initializeFolderToggles() {
    const folders = document.querySelectorAll('.anavo-menu-folder');

    folders.forEach(folder => {
      const toggle = folder.querySelector('.anavo-menu-folder-toggle');
      const dropdown = folder.querySelector('.anavo-menu-dropdown');

      if (!toggle || !dropdown) return;

      // Mobile: Click to toggle
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

    // Add mobile toggle styles
    const mobileToggleCSS = `
      @media (max-width: 800px) {
        .anavo-menu-folder.anavo-folder-open .anavo-menu-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .anavo-menu-folder.anavo-folder-open .anavo-menu-arrow {
          transform: rotate(180deg);
        }
      }
    `;

    const style = document.createElement('style');
    style.textContent = mobileToggleCSS;
    document.head.appendChild(style);
  }

  // ========================================
  // 8. BURGER MODE (OPTIONAL)
  // ========================================
  function enableBurgerMode() {
    // Re-enable Squarespace's native burger menu
    const hideStyle = document.getElementById('anavo-hide-squarespace-nav');
    if (hideStyle) hideStyle.remove();

    // Hide custom menu on mobile
    const burgerCSS = `
      @media (max-width: 800px) {
        .anavo-custom-menu,
        .anavo-menu-wrapper {
          display: none !important;
        }

        /* Re-enable Squarespace burger menu */
        .header-burger,
        .header-menu,
        .header-menu-nav-wrapper {
          display: block !important;
          visibility: visible !important;
        }
      }
    `;

    const style = document.createElement('style');
    style.id = 'anavo-burger-mode';
    style.textContent = burgerCSS;
    document.head.appendChild(style);

    console.log('✅ Burger mode enabled for mobile');
  }

  // ========================================
  // 9. LOAD LICENSING (NON-BLOCKING)
  // ========================================
  async function validateLicense() {
    try {
      if (window.AnavoLicenseManager) return;

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const licenseManager = new window.AnavoLicenseManager(
        'ExpandedMenu',
        '2.0.0',
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

    } catch (error) {
      console.warn('⚠️ License validation unavailable:', error.message);
    }
  }

  // ========================================
  // 10. MAIN INITIALIZATION
  // ========================================
  async function init() {
    try {
      console.log('🔧 Building custom menu...');

      // Step 1: Extract menu items from Squarespace
      const menuItems = extractMenuItems();

      if (menuItems.length === 0) {
        console.error('❌ No menu items found');
        return;
      }

      // Step 2: Build custom menu HTML
      const menuHTML = buildCustomMenu(menuItems);

      // Step 3: Hide Squarespace navigation
      hideSquarespaceNav();

      // Step 4: Inject custom styles
      injectStyles();

      // Step 5: Insert custom menu
      insertCustomMenu(menuHTML);

      // Step 6: Enable burger mode if requested
      if (config.mobileMode === 'burger') {
        enableBurgerMode();
      }

      console.log('✅ Expanded Menu Plugin v2.0.0 Active');
      console.log('   Desktop Spacing:', config.menuSpacing);
      console.log('   Tablet Spacing:', config.tabletSpacing);
      console.log('   Mobile Spacing:', config.mobileSpacing);
      console.log('   Mobile Mode:', config.mobileMode);

      // Step 7: Validate license (non-blocking)
      validateLicense();

    } catch (error) {
      console.error('❌ Plugin initialization failed:', error);
    }
  }

  // ========================================
  // 11. AUTO-INITIALIZE
  // ========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
