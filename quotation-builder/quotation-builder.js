/**
 * ========================================
 * QUOTATION BUILDER PLUGIN
 * ========================================
 * @version 1.1.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 * ========================================
 */

(function() {
  'use strict';

  console.log('🎨 Quotation Builder v1.1.0 by Anavo Tech');

  // ========================================
  // LOAD SHARED LICENSING MODULE
  // ========================================
  
  function loadLicensing() {
    return new Promise((resolve, reject) => {
      if (window.AnavoLicenseManager) {
        console.log('✓ Licensing module already loaded');
        resolve();
        return;
      }

      console.log('📦 Loading licensing module...');

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespace-plugins@latest/_shared/licensing.min.js';
      script.async = false;
      
      script.onload = () => {
        console.log('✓ Licensing module loaded');
        resolve();
      };
      
      script.onerror = () => {
        console. error('❌ Failed to load licensing module');
        reject(new Error('Licensing module failed to load'));
      };

      document.head.appendChild(script);
    });
  }

  // ...  [CONFIG, THEME, etc.  - same as before] ...

  // ========================================
  // QUOTATION BUILDER CLASS
  // ========================================

  class QuotationBuilder {
    constructor(container, config, theme, licenseManager) {
      this.container = container;
      this.cfg = config;
      this.theme = theme;
      this.license = licenseManager;
      this.step = 0;
      this. choices = [];
      this.total = 0;
    }

    init() {
      console.log('✓ Building interface');
      
      // Insert watermark if unlicensed (plugin-specific container)
      if (!this.license.isLicensed) {
        this.license.insertWatermark(this.container);
      }
      
      this.injectStyles();
      this.render();
      console.log('✅ Quotation Builder ready! ');
    }

    // ... [rest of methods - same as before] ...
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  async function initialize() {
    try {
      await loadLicensing();
      
      // Initialize license manager
      const licenseManager = new window.AnavoLicenseManager('quotation-builder', '1.1.0', {
        showUI: true // Show floating notice
      });
      
      await licenseManager.init();
      
      // Initialize plugin
      let attempts = 0;
      const maxAttempts = 30;

      function tryInit() {
        attempts++;
        const container = document.getElementById('quotemachine');
        
        if (container) {
          console.log('✓ Found #quotemachine');
          window.qbInstance = new QuotationBuilder(container, CONFIG, THEME, licenseManager);
          window.qbInstance.init();
          return true;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(tryInit, 100);
        } else {
          console.error('❌ #quotemachine not found');
        }
        
        return false;
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
      } else {
        tryInit();
      }

    } catch (error) {
      console.error('❌ Plugin initialization failed:', error);
    }
  }

  initialize();

})();
