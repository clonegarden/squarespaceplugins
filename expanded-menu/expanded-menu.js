/**
 * ========================================
 * EXPANDED MENU PLUGIN - Squarespace
 * ========================================
 * @version 1.1.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 * 
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/expanded-menu/expanded-menu.min.js?menuSpacing=40px"></script>
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
      mobileSpacing: params.get('mobileSpacing') || '20px',  // NEW: Separate mobile spacing
      centerMenu: params.get('centerMenu') !== 'false',
      showOnMobile: params.get('showOnMobile') !== 'false'   // NEW: Control mobile visibility
    };
  }

  const config = getScriptParams();

  // ========================================
  // 3. LOAD LICENSING SYSTEM
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
  // 4. INTELLIGENT CENTERING SYSTEM
  // ========================================
  function getCenteringCSS() {
    if (!config.centerMenu) return '';

    return `
      .header-nav-wrapper {
        margin-left: auto !important;
        margin-right: auto !important;
        width: fit-content !important;
      }
      
      .header-nav-list {
        justify-content: center !important;
      }
    `;
  }

  // ========================================
  // 5. INJECT STYLES (WITH MOBILE FIX)
  // ========================================
  function injectStyles() {
    if (document.getElementById('anavo-expanded-menu-styles')) return;

    const centeringCSS = getCenteringCSS();

    const styles = document.createElement('style');
    styles.id = 'anavo-expanded-menu-styles';
    styles.textContent = `
      /* ========================================
       * EXPANDED MENU PLUGIN - Generated Styles
       * ======================================== */
      
      /* Expand header container */
      .header-inner,
      .header-layout-container,
      .header-display-desktop {
        max-width: ${config.containerWidth} !important;
        width: 100% !important;
        padding-left: 2vw !important;
        padding-right: 2vw !important;
      }
      
      /* Centering */
      ${centeringCSS}
      
      /* Menu spacing using gap */
      .header-nav-list {
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: ${config.menuSpacing} !important;
      }
      
      /* Remove default margins */
      .header-nav-item {
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      
      /* Prevent wrapping */
      .header-nav-item a {
        white-space: nowrap !important;
      }
      
      /* ========================================
       * MOBILE FIXES
       * ======================================== */
      
      /* Force desktop nav to show on mobile if enabled */
      ${config.showOnMobile ? `
      @media (max-width: 1024px) {
        .header-display-desktop {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Hide mobile burger menu */
        .header-burger {
          display: none !important;
        }
        
        /* Ensure nav is visible */
        .header-nav {
          display: flex !important;
        }
      }
      ` : ''}
      
      /* Tablet spacing */
      @media (max-width: 1024px) {
        .header-nav-list {
          gap: calc(${config.menuSpacing} * 0.6) !important;
        }
        
        .header-inner,
        .header-layout-container,
        .header-display-desktop {
          padding-left: 1.5vw !important;
          padding-right: 1.5vw !important;
        }
      }
      
      /* Mobile spacing - Use dedicated mobile spacing */
      @media (max-width: 768px) {
        .header-nav-list {
          gap: ${config.mobileSpacing} !important;
        }
        
        .header-inner,
        .header-layout-container,
        .header-display-desktop {
          padding-left: 1vw !important;
          padding-right: 1vw !important;
        }
        
        /* Reduce font size slightly on mobile for better fit */
        .header-nav-item a {
          font-size: 0.9em !important;
        }
      }
      
      /* Extra small mobile */
      @media (max-width: 480px) {
        .header-nav-list {
          gap: calc(${config.mobileSpacing} * 0.7) !important;
        }
        
        .header-nav-item a {
          font-size: 0.85em !important;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  // ========================================
  // 6. INITIALIZE PLUGIN
  // ========================================
  async function init() {
    try {
      await loadLicensingScript();
      
      const licenseManager = new window.AnavoLicenseManager(
        'ExpandedMenu',
        '1.1.0',
        {
          licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: true
        }
      );

      await licenseManager.init();

      if (!licenseManager.isLicensed) {
        const header = document.querySelector('.header');
        if (header) {
          licenseManager.insertWatermark(header);
        }
      }

      injectStyles();

      console.log('✅ Expanded Menu Plugin v1.1.0');
      console.log(`   Container: ${config.containerWidth}`);
      console.log(`   Desktop Spacing: ${config.menuSpacing}`);
      console.log(`   Mobile Spacing: ${config.mobileSpacing}`);
      console.log(`   Centered: ${config.centerMenu}`);
      console.log(`   Show on Mobile: ${config.showOnMobile}`);

    } catch (error) {
      console.error('Failed to initialize Expanded Menu Plugin:', error);
      injectStyles();
    }
  }

  // ========================================
  // 7. AUTO-INITIALIZE
  // ========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


