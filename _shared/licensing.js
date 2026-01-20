/**
 * ========================================
 * ANAVO TECH - PLUGIN LICENSING SYSTEM
 * ========================================
 * Shared licensing module for all plugins
 * @version 1.0.1
 * @author Anavo Tech
 * @copyright 2026 Anavo Tech.  All rights reserved.
 * 
 * CHANGELOG v1.0.1:
 * - Added bypass for specific development domains
 * ========================================
 */

class AnavoLicenseManager {
  constructor(pluginName, version) {
    this.pluginName = pluginName;
    this.version = version;
    this.licenseServer = 'https://anavotech.com/api/licenses. json';
    this.checkInterval = 3600000; // 1 hour
    this.cachedLicense = null;
    this.isLicensed = false;
    this.licenseType = null;
    
    // 🔓 BYPASS DOMAINS - Skip license check completely
    this.bypassDomains = [
      'shallot-cone-9wym.squarespace.com',
      'anavo.tech',
      'www.anavo.tech'
    ];
  }

  async init() {
    console.log(`🔐 ${this.pluginName} v${this.version} - Checking license...`);
    
    // Check bypass first (before dev check)
    if (this.isBypassDomain()) {
      console.log('🔓 Bypass domain detected - Full access granted');
      this.isLicensed = true;
      this.licenseType = 'bypass';
      return { licensed: true, type: 'bypass', message: 'Bypass domain - no license check needed' };
    }
    
    // Then check if development
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
      this.showLicenseNotice();
    }
    
    return result;
  }

  /**
   * Check if current domain is in bypass list
   * These domains skip ALL license checks
   */
  isBypassDomain() {
    const hostname = window.location.hostname. toLowerCase();
    return this.bypassDomains.some(domain => {
      return hostname === domain.toLowerCase() || 
             hostname.endsWith('.' + domain.toLowerCase());
    });
  }

  isDevelopment() {
    const hostname = window.location.hostname. toLowerCase();
    const devPatterns = [
      'localhost',
      '127.0.0.1',
      '. local',
      '.sqsp. com',
      '.squarespace. com',
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

      const data = await response. json();
      this.cachedLicense = data;
      return this.validateDomain(data);
      
    } catch (error) {
      console.error('License check failed:', error. message);
      return {
        licensed: false,
        type: 'offline',
        message: 'License server unreachable'
      };
    }
  }

  validateDomain(licenseData) {
    const currentDomain = window.location.hostname.toLowerCase();
    
    // Check global whitelist
    if (this.matchesDomain(currentDomain, licenseData. global_whitelist)) {
      this.isLicensed = false;
      this.licenseType = 'development';
      return { licensed: false, type: 'development' };
    }

    const pluginLicense = licenseData. licenses[this.pluginName];
    
    if (! pluginLicense) {
      return { licensed: false, type: 'none' };
    }

    if (this.matchesDomain(currentDomain, pluginLicense.allowed_domains)) {
      if (pluginLicense.expires) {
        const expiryDate = new Date(pluginLicense.expires);
        if (expiryDate < new Date()) {
          return { licensed: false, type: 'expired' };
        }
      }

      this.isLicensed = true;
      this.licenseType = pluginLicense.license_type;
      
      return {
        licensed: true,
        type: pluginLicense.license_type,
        features: pluginLicense.features
      };
    }

    return { licensed: false, type: 'invalid' };
  }

  matchesDomain(current, allowedList) {
    if (!allowedList) return false;
    return allowedList.some(pattern => {
      if (pattern === current) return true;
      if (pattern.startsWith('*. ')) {
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
      // Skip periodic check for bypass domains
      if (this. isBypassDomain()) {
        return;
      }
      
      this.checkLicense().then(result => {
        if (! result.licensed && this.isLicensed) {
          console.warn('⚠️ License status changed');
          window.location.reload();
        }
      });
    }, this.checkInterval);
  }

  showLicenseNotice() {
    const notice = document.createElement('div');
    notice.innerHTML = `
      <div style="position: fixed;bottom:20px;right:20px;background: rgba(0,0,0,0.9);color:#fff;padding:15px 20px;border-radius:8px;font-family:system-ui,sans-serif;font-size: 13px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:300px">
        <div style="font-weight:700;margin-bottom:8px">⚠️ Unlicensed Plugin</div>
        <div style="margin-bottom:12px;line-height:1.4">
          This ${this.pluginName} plugin requires a license. 
        </div>
        <a href="https://anavotech.com/plugins/${this.pluginName}" target="_blank" style="display:inline-block;background:#fff;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight: 600;font-size:12px">
          Get License →
        </a>
      </div>
    `;
    document.body.appendChild(notice);

    const container = document.getElementById('quotemachine');
    if (container) {
      const watermark = document.createElement('div');
      watermark.style.cssText = 'position:relative;width:100%;text-align:center;padding:20px;background:#fff3cd;border: 2px dashed #ffc107;border-radius:8px;margin: 20px 0;font-family:system-ui,sans-serif';
      watermark.innerHTML = `
        <strong style="color:#856404">⚠️ Unlicensed Version</strong><br>
        <span style="font-size:14px;color:#856404">
          Purchase a license to remove this notice.
        </span>
      `;
      container.insertBefore(watermark, container. firstChild);
    }
  }

  hasFeature(featureName) {
    // Bypass domains have all features
    if (this.isBypassDomain()) return true;
    
    if (! this.isLicensed) return false;
    if (! this.cachedLicense) return false;
    const pluginLicense = this.cachedLicense.licenses[this. pluginName];
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
}

// Export for use in plugins
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnavoLicenseManager;
}
