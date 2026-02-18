/**
 * ========================================
 * EXPANDED MENU PLUGIN - Squarespace
 * ========================================
 * @version 1.2.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/expanded-menu/expanded-menu.min.js?menuSpacing=40px&mobileMode=burger"></script>
 *
 * PARAMETERS:
 * - license: License key (optional for testing)
 * - containerWidth: Max width of header (default: 100%)
 * - menuSpacing: Gap between menu items on desktop (default: 40px)
 * - mobileSpacing: Gap between menu items on mobile (default: 20px)
 * - centerMenu: Center the menu horizontally (default: true)
 * - mobileMode: 'burger' (keep native mobile menu) or 'expanded' (force desktop menu on mobile) (default: burger)
 * ========================================
 */

(function() {
  'use strict';

  // ========================================
  // 1. CAPTURE SCRIPT REFERENCE
  // ========================================
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // ========================================
  // 2. PARSE URL PARAMETERS
  // ========================================
  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    return {
      license: params.get('license') || '',
      containerWidth: params.get('containerWidth') || '100%',
      menuSpacing: params.get('menuSpacing') || '40px',
      mobileSpacing: params.get('mobileSpacing') || '20px',
      centerMenu: params.get('centerMenu') !== 'false', // true by default
      mobileMode: params.get('mobileMode') || 'burger' // 'burger' or 'expanded'
    };
  }

  const config = getScriptParams();

  console.log('🚀 Expanded Menu Plugin v1.2.0 - Initializing...');
  console.log('   Config:', config);

  // ========================================
  // 3. INTELLIGENT CENTERING SYSTEM (FIXED)
  // ========================================
  function getCenteringCSS() {
    if (!config.centerMenu) return '';

    return `
      /* Force flex layout on header for proper centering */
      .header,
      .header-announcement-bar-wrapper,
      .header-inner,
      .header-layout-branding-center-nav-center .header-layout-nav,
      .header-display-desktop {
        display: flex !important;
        justify-content: center !important;
      }

      /* Center nav wrapper */
      .header-nav-wrapper {
        margin-left: auto !important;
        margin-right: auto !important;
        width: fit-content !important;
      }

      /* Center nav items within the list */
      .header-nav-list {
        justify-content: center !important;
      }

      /* Ensure nav container doesn't force full width */
      .header-nav {
        flex-grow: 0 !important;
        flex-shrink: 0 !important;
      }
    `;
  }

  // ========================================
  // 4. MOBILE MODE CSS (NEW)
  // ========================================
  function getMobileModeCSS() {
    if (config.mobileMode !== 'expanded') {
      // Burger mode (default) - keep native Squarespace mobile menu
      return '';
    }

    // Expanded mode - force desktop nav on mobile
    return `
      /* ========================================
       * EXPANDED MODE - Force desktop nav on mobile
       * ======================================== */

      @media (max-width: 1024px) {
        /* Force desktop nav to show */
        .header-display-desktop {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Hide burger button */
        .header-burger {
          display: none !important;
        }

        /* Ensure desktop nav is visible */
        .header-nav,
        .header-nav-wrapper {
          display: flex !important;
          visibility: visible !important;
        }

        /* Hide ALL mobile menu elements (comprehensive list for 7.0 and 7.1) */
        .header-menu,
        .header-menu-bg,
        .header-menu-nav,
        .header-menu-nav-wrapper,
        .header-menu-nav-list,
        .header-menu-nav-item,
        .header-menu-nav-folder,
        .header-menu-nav-folder-content,
        .header-menu-cta,
        .header-menu-actions,
        .mobile-nav-toggle-label,
        [data-nc-element="mobile-menu"],
        [data-nc-group="mobile-menu"] {
          display: none !important;
          visibility: hidden !important;
        }

        /* Prevent body scroll lock when "menu is open" */
        body.mobile-nav-open,
        body[data-mobile-nav-open="true"] {
          overflow: auto !important;
        }
      }
    `;
  }

  // ========================================
  // 5. INJECT STYLES
  // ========================================
  function injectStyles() {
    // Remove existing styles if present (allow updates)
    const existingStyles = document.getElementById('anavo-expanded-menu-styles');
    if (existingStyles) {
      existingStyles.remove();
    }

    const centeringCSS = getCenteringCSS();
    const mobileModeCSS = getMobileModeCSS();

    const styles = document.createElement('style');
    styles.id = 'anavo-expanded-menu-styles';
    styles.textContent = `
      /* ========================================
       * EXPANDED MENU PLUGIN - Generated Styles
       * Version: 1.2.0
       * Mode: ${config.mobileMode}
       * ======================================== */

      /* Expand header container */
      .header-inner,
      .header-layout-container,
      .header-display-desktop,
      .header-layout-nav {
        max-width: ${config.containerWidth} !important;
        width: 100% !important;
        padding-left: 2vw !important;
        padding-right: 2vw !important;
      }

      /* Centering */
      ${centeringCSS}

      /* Menu spacing using gap (modern CSS) */
      .header-nav-list {
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: ${config.menuSpacing} !important;
      }

      /* Remove default margins that interfere with gap */
      .header-nav-item {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      /* Prevent text wrapping */
      .header-nav-item a {
        white-space: nowrap !important;
      }

      /* Mobile Mode */
      ${mobileModeCSS}

      /* ========================================
       * RESPONSIVE BREAKPOINTS
       * ======================================== */

      /* Tablet (1024px and below) */
      @media (max-width: 1024px) {
        .header-nav-list {
          gap: calc(${config.menuSpacing} * 0.6) !important;
        }

        .header-inner,
        .header-layout-container,
        .header-display-desktop,
        .header-layout-nav {
          padding-left: 1.5vw !important;
          padding-right: 1.5vw !important;
        }
      }

      /* Mobile (768px and below) - only if expanded mode */
      ${config.mobileMode === 'expanded' ? `
      @media (max-width: 768px) {
        .header-nav-list {
          gap: ${config.mobileSpacing} !important;
        }

        .header-inner,
        .header-layout-container,
        .header-display-desktop,
        .header-layout-nav {
          padding-left: 1vw !important;
          padding-right: 1vw !important;
        }

        /* Reduce font size for better fit */
        .header-nav-item a {
          font-size: 0.9em !important;
        }
      }

      /* Extra small mobile (480px and below) */
      @media (max-width: 480px) {
        .header-nav-list {
          gap: calc(${config.mobileSpacing} * 0.7) !important;
        }

        .header-nav-item a {
          font-size: 0.85em !important;
        }
      }
      ` : ''}
    `;

    document.head.appendChild(styles);
    console.log('✅ Styles injected successfully');
  }

  // ========================================
  // 6. LOAD LICENSING SYSTEM (NON-BLOCKING)
  // ========================================
  function loadLicensingScript() {
    return new Promise((resolve, reject) => {
      if (window.AnavoLicenseManager) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ========================================
  // 7. VALIDATE LICENSE (ASYNC, NON-BLOCKING)
  // ========================================
  async function validateLicense() {
    try {
      await loadLicensingScript();

      const licenseManager = new window.AnavoLicenseManager(
        'ExpandedMenu',
        '1.2.0',
        {
          licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: true
        }
      );

      await licenseManager.init();

      // Add watermark if unlicensed
      if (!licenseManager.isLicensed) {
        console.warn('⚠️ Running in unlicensed mode');
        const header = document.querySelector('.header');
        if (header) {
          licenseManager.insertWatermark(header);
        }
      } else {
        console.log('✅ License valid');
      }

    } catch (error) {
      console.warn('⚠️ License validation unavailable:', error.message);
      console.warn('   Plugin will continue in unlicensed mode');
      // Don't block execution - plugin works anyway
    }
  }

  // ========================================
  // 8. INITIALIZE PLUGIN
  // ========================================
  async function init() {
    try {
      // CRITICAL: Apply styles IMMEDIATELY (don't wait for licensing)
      injectStyles();

      console.log('✅ Expanded Menu Plugin v1.2.0 Active');
      console.log('   Container: ' + config.containerWidth);
      console.log('   Desktop Spacing: ' + config.menuSpacing);
      console.log('   Mobile Spacing: ' + config.mobileSpacing);
      console.log('   Centered: ' + config.centerMenu);
      console.log('   Mobile Mode: ' + config.mobileMode);

      // Validate license in background (non-blocking)
      validateLicense();

    } catch (error) {
      console.error('❌ Plugin initialization failed:', error);
      // Try to apply styles anyway
      try {
        injectStyles();
      } catch (styleError) {
        console.error('❌ Could not apply styles:', styleError);
      }
    }
  }

  // ========================================
  // 9. AUTO-INITIALIZE
  // ========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
