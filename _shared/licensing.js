/**
 * =======================================+
 * ANAVO TECH - UNIVERSAL LICENSING SYSTEM
 * =======================================+
 * Used by ALL Anavo Tech Squarespace plugins
 * @version 1.1.0
 * @author Anavo Tech
 * @copyright 2026 Anavo Tech.  All rights reserved.
 * 
 * CDN:  https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js
 * 
 * CHANGELOG v1.1.0:
 * - Made truly universal (no plugin-specific references)
 * - Separated license logic from UI rendering
 * - Plugins now handle their own watermarks
 * ========================================
 */

(function(window) {
  'use strict';

  class AnavoLicenseManager {
    constructor(pluginName, version, options = {}) {
      this.pluginName = pluginName;
      this.version = version;
      this.licenseServer = options.licenseServer || 'https://anavotech.com/api/licenses. json';
      this.checkInterval = options.checkInterval || 3600000; // 1 hour
      this.showUI = options.showUI !== false; // Default true
      this.cachedLicense = null;
      this.isLicensed = false;
      this. licenseType = null;
      
      // 🔓 BYPASS DOMAINS - No license check needed
      this.bypassDomains = [
        'shallot-cone-9wym.squarespace.com',
        'anavo. tech',
        'www.anavo.tech'
      ];
    }

    async init() {
      console.log(`🔐 ${this.pluginName} v${this.version} - Checking license...`);
      
      // Check bypass FIRST
      if (this.isBypassDomain()) {
        console.log('🔓 Bypass domain - Full access granted');
        this.isLicensed = true;
        this. licenseType = 'bypass';
        return { licensed: true, type: 'bypass' };
      }
      
      // Then check development
      if (this.isDevelopment()) {
        console.log('🔧 Development mode - Running with watermark');
        this.isLicensed = false;
        this.licenseType = 'development';
        return { licensed: false, type: 'development' };
      }

      // Finally check license server
      const result = await this.checkLicense();
      
      if (result.licensed) {
        console.log(`✅ License verified - ${result.type} license`);
        this.setupPeriodicCheck();
      } else {
        console.warn('⚠️ No valid license - Running in limited mode');
        
        // Only show UI if enabled
        if (this.showUI) {
          this.showLicenseNotice();
        }
      }
      
      return result;
    }

    isBypassDomain() {
      const hostname = window.location.hostname. toLowerCase();
      return this.bypassDomains.some(domain => {
        return hostname === domain. toLowerCase() || 
               hostname.endsWith('.' + domain.toLowerCase());
      });
    }

    isDevelopment() {
      const hostname = window.location.hostname. toLowerCase();
      const devPatterns = [
        'localhost',
        '127.0.0.1',
        '. local',
        '.sqsp.com',
        '.squarespace.com',
        'staging-'
      ];
      
      return devPatterns.some(pattern => {
        if (pattern.startsWith('. ')) {
          return hostname.endsWith(pattern) || hostname. includes(pattern);
        }
        return hostname === pattern || hostname.startsWith(pattern);
      });
    }

    async checkLicense() {
      try {
        const response = await fetch(this.licenseServer, {
          method: 'GET',
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('License server unavailable');

        const data = await response.json();
        this.cachedLicense = data;
        return this.validateDomain(data);
        
      } catch (error) {
        console.error('License check failed:', error. message);
        return { licensed:  false, type: 'offline' };
      }
    }

    validateDomain(licenseData) {
      const currentDomain = window.location.hostname.toLowerCase();
      
      // ✅ CHECK PLUGIN LICENSE FIRST
      const pluginLicense = licenseData.licenses[this.pluginName];
      
      if (pluginLicense) {
        // Plugin has a specific license entry - check if domain is allowed
        if (this.matchesDomain(currentDomain, pluginLicense.allowed_domains)) {
          // Check expiration
          if (pluginLicense.expires) {
            const expiryDate = new Date(pluginLicense.expires);
            if (expiryDate < new Date()) {
              return { licensed: false, type: 'expired' };
            }
          }

          // Valid license found!
          this.isLicensed = true;
          this.licenseType = pluginLicense.license_type;
          
          return {
            licensed: true,
            type: pluginLicense.license_type,
            features: pluginLicense.features
          };
        }
      }
      
      // ⚠️ THEN check global whitelist (for development mode)
      if (this.matchesDomain(currentDomain, licenseData.global_whitelist)) {
        this.isLicensed = false;
        this.licenseType = 'development';
        return { licensed: false, type: 'development' };
      }

      // No license found
      return { licensed: false, type: 'none' };
    }

    matchesDomain(current, allowedList) {
      if (!allowedList) return false;
      return allowedList.some(pattern => {
        if (pattern === current) return true;
        if (pattern.startsWith('*.')) {
          const baseDomain = pattern.slice(2);
          return current.endsWith(baseDomain) || current === baseDomain;
        }
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          return regex.test(current);
        }
        return false;
      });
    }

    setupPeriodicCheck() {
      setInterval(() => {
        if (this.isBypassDomain()) return;
        this.checkLicense().then(result => {
          if (! result.licensed && this.isLicensed) {
            console.warn('⚠️ License status changed');
            window.location.reload();
          }
        });
      }, this.checkInterval);
    }

    /**
     * Generic license notice (floating corner badge)
     * No plugin-specific container references
     */
    showLicenseNotice() {
      // Prevent duplicate notices
      if (document.getElementById('anavo-license-notice')) return;

      const notice = document.createElement('div');
      notice.id = 'anavo-license-notice';
      notice.innerHTML = `
        <div style="position: fixed;bottom:20px;right:20px;background: rgba(0,0,0,0.9);color:#fff;padding:15px 20px;border-radius:8px;font-family:system-ui,sans-serif;font-size:13px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:300px">
          <div style="font-weight:700;margin-bottom:8px">⚠️ Unlicensed Plugin</div>
          <div style="margin-bottom:12px;line-height:1.4">
            The <strong>${this.pluginName}</strong> plugin requires a license. 
          </div>
          <a href="https://anavotech.com/plugins/${this.pluginName}" target="_blank" style="display:inline-block;background:#fff;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight: 600;font-size:12px">
            Get License →
          </a>
        </div>
      `;
      document.body.appendChild(notice);
    }

    /**
     * Create a watermark element that plugins can insert
     * Returns DOM element - plugin decides where to put it
     */
    createWatermark() {
      const watermark = document.createElement('div');
      watermark.className = 'anavo-watermark';
      watermark.style.cssText = 'position:relative;width:100%;text-align:center;padding:20px;background:#fff3cd;border: 2px dashed #ffc107;border-radius:8px;margin: 20px 0;font-family:system-ui,sans-serif;box-sizing:border-box';
      watermark.innerHTML = `
        <strong style="color:#856404">⚠️ Unlicensed Version</strong><br>
        <span style="font-size:14px;color:#856404">
          Purchase a license to remove this notice.
        </span>
      `;
      return watermark;
    }

    /**
     * Insert watermark into specific container
     * @param {string|HTMLElement} container - Container ID or element
     */
    insertWatermark(container) {
      const element = typeof container === 'string' 
        ? document.getElementById(container) 
        : container;

      if (element && ! this.isLicensed) {
        const watermark = this.createWatermark();
        element.insertBefore(watermark, element. firstChild);
      }
    }

    hasFeature(featureName) {
      if (this.isBypassDomain()) return true;
      if (!this.isLicensed) return false;
      if (! this.cachedLicense) return false;
      const pluginLicense = this.cachedLicense.licenses[this.pluginName];
      if (!pluginLicense || !pluginLicense.features) return true;
      return pluginLicense.features.includes(featureName);
    }

    restrictFeature(featureName, callback) {
      if (this.hasFeature(featureName)) {
        callback();
      } else {
        alert(`This feature requires a licensed version.\n\nGet your license at: https://anavotech.com/plugins`);
      }
    }

    /**
     * Get license status object
     * Useful for plugins to customize their own UI
     */
    getStatus() {
      return {
        licensed: this.isLicensed,
        type: this. licenseType,
        pluginName: this.pluginName,
        version: this.version,
        features: this.cachedLicense?. licenses?.[this.pluginName]?.features || []
      };
    }
  }

  // Export to global scope
  window.AnavoLicenseManager = AnavoLicenseManager;

})(window);
