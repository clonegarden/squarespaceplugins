/**
 * ========================================
 * EXPANDED MENU PLUGIN - Squarespace
 * ========================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 * ========================================
 */

(function() {
  'use strict';

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
      menuSpacing: params.get('menuSpacing') || '40px',  // Default in pixels
      centerMenu: params.get('centerMenu') !== 'false',
      centeringMethod: params.get('centeringMethod') || 'auto'
    };
  }

  const config = getScriptParams();

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

  function getCenteringCSS() {
    if (!config.centerMenu) return '';

    // Margin auto method (most reliable)
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

  function injectStyles() {
    if (document.getElementById('anavo-expanded-menu-styles')) return;

    const centeringCSS = getCenteringCSS();

    const styles = document.createElement('style');
    styles.id = 'anavo-expanded-menu-styles';
    styles.textContent = `
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
      
      /* Menu spacing using gap (proper method) */
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
      
      /* Responsive spacing */
      @media (max-width: 1200px) {
        .header-nav-list {
          gap: calc(${config.menuSpacing} * 0.7) !important;
        }
      }
      
      @media (max-width: 768px) {
        .header-nav-list {
          gap: calc(${config.menuSpacing} * 0.5) !important;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  async function init() {
    try {
      await loadLicensingScript();
      
      const licenseManager = new window.AnavoLicenseManager(
        'ExpandedMenu',
        '1.0.0',
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

      console.log('✅ Expanded Menu Plugin v1.0.0');
      console.log(`   Container: ${config.containerWidth}`);
      console.log(`   Spacing: ${config.menuSpacing}`);
      console.log(`   Centered: ${config.centerMenu}`);

    } catch (error) {
      console.error('Failed to initialize Expanded Menu Plugin:', error);
      injectStyles();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
