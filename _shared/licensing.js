/**
 * =======================================+
 * ANAVO TECH - UNIVERSAL LICENSING SYSTEM
 * =======================================+
 * Used by ALL Anavo Tech Squarespace plugins
 * @version 1.3.0
 * @author Anavo Tech
 * @copyright 2026 Anavo Tech. All rights reserved.
 *
 * CDN: https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js
 *
 * CHANGELOG v1.3.0:
 * - ✅ NEW: Database license check via dbLicenseServer option
 * - ✅ NEW: Fallback chain — static JSON first, then DB API
 * - ✅ NEW: sessionStorage cache to avoid redundant DB calls
 *
 * CHANGELOG v1.2.0:
 * - ✅ FIX: Plugin licenses now checked BEFORE global whitelist
 * - ✅ FIX: Removed isDevelopment() early return from init()
 * - ✅ FIX: Licensed domains on *.squarespace.com now work correctly
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
      this.licenseServer = options.licenseServer || 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json';
      this.dbLicenseServer = options.dbLicenseServer || 'https://api.anavo.tech/api/licenses/check';
      this.checkInterval = options.checkInterval || 3600000; // 1 hour
      this.showUI = options.showUI !== false;
      this.cachedLicense = null;
      this.isLicensed = false;
      this.licenseType = null;

      // 🔓 BYPASS DOMAINS - No license check needed
      this.bypassDomains = [
        'shallot-cone-9wym.squarespace.com',
        'anavo.tech',
        'www.anavo.tech',
        'pluginstore.anavo.tech',
        'clonegarden.github.io'
      ];
    }

    async init() {
      console.log(`🔐 ${this.pluginName} v${this.version} - Checking license...`);

      if (this.isBypassDomain()) {
        console.log('🔓 Bypass domain - Full access granted');
        this.isLicensed = true;
        this.licenseType = 'bypass';
        return { licensed: true, type: 'bypass' };
      }

      const result = await this.checkLicense();

      if (result.licensed) {
        console.log(`✅ License verified - ${result.type} license`);
        this.setupPeriodicCheck();
      } else {
        console.warn('⚠️ No valid license - Running in limited mode');
        if (this.showUI) this.showLicenseNotice();
      }

      return result;
    }

    isBypassDomain() {
      const hostname = window.location.hostname.toLowerCase();
      return this.bypassDomains.some(domain =>
        hostname === domain.toLowerCase() ||
        hostname.endsWith('.' + domain.toLowerCase())
      );
    }

    isDevelopment() {
      const hostname = window.location.hostname.toLowerCase();
      const devPatterns = ['localhost', '127.0.0.1', '.local', '.sqsp.com', '.squarespace.com', 'staging-'];
      return devPatterns.some(pattern => {
        if (pattern.startsWith('.')) return hostname.endsWith(pattern) || hostname.includes(pattern);
        return hostname === pattern || hostname.startsWith(pattern);
      });
    }

    // ========================================
    // FALLBACK CHAIN: static JSON → DB API
    // ========================================

    async checkLicense() {
      // 1. Check sessionStorage cache first
      const cached = this._getCached();
      if (cached) {
        this.isLicensed = cached.licensed;
        this.licenseType = cached.type;
        return cached;
      }

      // 2. Try static licenses.json
      const staticResult = await this._checkStatic();
      if (staticResult.licensed) {
        this._setCache(staticResult);
        return staticResult;
      }

      // 3. If static missed (type 'none' or 'development'), try DB
      if (staticResult.type === 'none' || staticResult.type === 'development') {
        const dbResult = await this._checkDb();
        this._setCache(dbResult);
        return dbResult;
      }

      // 4. Static returned expired or offline — trust it
      this._setCache(staticResult);
      return staticResult;
    }

    async _checkStatic() {
      try {
        const response = await fetch(this.licenseServer, {
          method: 'GET',
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Static license server unavailable');
        const data = await response.json();
        this.cachedLicense = data;
        return this.validateDomain(data);
      } catch (error) {
        console.warn('Static license check failed:', error.message);
        return { licensed: false, type: 'offline' };
      }
    }

    async _checkDb() {
      try {
        const domain = window.location.hostname.toLowerCase().replace(/^www\./, '');
        const url = `${this.dbLicenseServer}?domain=${encodeURIComponent(domain)}&plugin=${encodeURIComponent(this.pluginName)}`;

        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`DB license check failed: HTTP ${response.status}`);

        const result = await response.json();

        this.isLicensed = result.licensed;
        this.licenseType = result.type;

        return {
          licensed:  result.licensed  || false,
          type:      result.type      || 'none',
          features:  result.features  || [],
          source:    'db'
        };
      } catch (error) {
        console.warn('DB license check failed:', error.message);
        return { licensed: false, type: 'offline' };
      }
    }

    // ========================================
    // SESSION CACHE (avoids repeated DB calls)
    // ========================================

    _cacheKey() {
      return `anavo_lic_${this.pluginName}`;
    }

    _getCached() {
      try {
        const raw = sessionStorage.getItem(this._cacheKey());
        if (!raw) return null;
        const { result, ts } = JSON.parse(raw);
        if (Date.now() - ts > 3600000) return null; // 1hr TTL
        return result;
      } catch (_) { return null; }
    }

    _setCache(result) {
      try {
        sessionStorage.setItem(this._cacheKey(), JSON.stringify({ result, ts: Date.now() }));
      } catch (_) {}
    }

    // ========================================
    // VALIDATE (static JSON shape)
    // ========================================

    validateDomain(licenseData) {
      const currentDomain = window.location.hostname.toLowerCase();
      const pluginLicense = licenseData.licenses[this.pluginName];

      if (pluginLicense) {
        if (this.matchesDomain(currentDomain, pluginLicense.allowed_domains)) {
          if (pluginLicense.expires) {
            if (new Date(pluginLicense.expires) < new Date()) {
              return { licensed: false, type: 'expired' };
            }
          }
          this.isLicensed = true;
          this.licenseType = pluginLicense.license_type;
          return {
            licensed: true,
            type:     pluginLicense.license_type,
            features: pluginLicense.features,
            source:   'static'
          };
        }
      }

      if (this.matchesDomain(currentDomain, licenseData.global_whitelist)) {
        this.isLicensed = false;
        this.licenseType = 'development';
        return { licensed: false, type: 'development', source: 'static' };
      }

      return { licensed: false, type: 'none', source: 'static' };
    }

    matchesDomain(current, allowedList) {
      if (!allowedList) return false;
      return allowedList.some(pattern => {
        if (pattern === current) return true;
        if (pattern.startsWith('*.')) {
          const base = pattern.slice(2);
          return current.endsWith(base) || current === base;
        }
        if (pattern.includes('*')) {
          return new RegExp('^' + pattern.replace(/\*/g, '.*') + '$').test(current);
        }
        return false;
      });
    }

    setupPeriodicCheck() {
      setInterval(() => {
        if (this.isBypassDomain()) return;
        // Clear cache so next check hits the server
        try { sessionStorage.removeItem(this._cacheKey()); } catch (_) {}
        this.checkLicense().then(result => {
          if (!result.licensed && this.isLicensed) {
            console.warn('⚠️ License status changed');
            window.location.reload();
          }
        });
      }, this.checkInterval);
    }

    showLicenseNotice() {
      if (document.getElementById('anavo-license-notice')) return;
      const notice = document.createElement('div');
      notice.id = 'anavo-license-notice';
      notice.innerHTML = `
        <div style="position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.9);color:#fff;padding:15px 20px;border-radius:8px;font-family:system-ui,sans-serif;font-size:13px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:300px">
          <div style="font-weight:700;margin-bottom:8px">⚠️ Unlicensed Plugin</div>
          <div style="margin-bottom:12px;line-height:1.4">
            The <strong>${this.pluginName}</strong> plugin requires a license.
          </div>
          <a href="https://anavo.tech/plugins" target="_blank" style="display:inline-block;background:#fff;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:600;font-size:12px">
            Get License →
          </a>
        </div>`;
      document.body.appendChild(notice);
    }

    createWatermark() {
      const w = document.createElement('div');
      w.className = 'anavo-watermark';
      w.style.cssText = 'position:relative;width:100%;text-align:center;padding:20px;background:#fff3cd;border:2px dashed #ffc107;border-radius:8px;margin:20px 0;font-family:system-ui,sans-serif;box-sizing:border-box';
      w.innerHTML = `<strong style="color:#856404">⚠️ Unlicensed Version</strong><br><span style="font-size:14px;color:#856404">Purchase a license to remove this notice.</span>`;
      return w;
    }

    insertWatermark(container) {
      const el = typeof container === 'string' ? document.getElementById(container) : container;
      if (el && !this.isLicensed) el.insertBefore(this.createWatermark(), el.firstChild);
    }

    hasFeature(featureName) {
      if (this.isBypassDomain()) return true;
      if (!this.isLicensed) return false;
      if (!this.cachedLicense) return true; // DB path: assume all features if licensed
      const pl = this.cachedLicense.licenses?.[this.pluginName];
      if (!pl || !pl.features) return true;
      return pl.features.includes(featureName);
    }

    getStatus() {
      return {
        licensed:   this.isLicensed,
        type:       this.licenseType,
        pluginName: this.pluginName,
        version:    this.version,
        features:   this.cachedLicense?.licenses?.[this.pluginName]?.features || []
      };
    }
  }

  window.AnavoLicenseManager = AnavoLicenseManager;

})(window);
