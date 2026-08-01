/**
 * =======================================+
 * ANAVO TECH - UNIVERSAL LICENSING SYSTEM
 * =======================================+
 * Used by ALL Anavo Tech Squarespace plugins
 * @version 1.6.0
 * @author Anavo Tech
 * @copyright 2026 Anavo Tech. All rights reserved.
 *
 * CDN: https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js
 *
 * CHANGELOG v1.6.0:
 * - ✅ CHANGE: the DB (api.anavo.tech) is now the source of truth and is checked
 *   first; licenses.json became the fallback. A grant from either source wins,
 *   and the unlicensed notice requires BOTH to answer and BOTH to say no.
 *
 * CHANGELOG v1.5.0:
 * - ✅ FIX: "Get License" now points to https://plugins.anavo.tech
 *   (the old anavo.tech/plugins path serves a Coming Soon placeholder)
 * - ✅ NEW: Hosts are normalized (case, port, trailing dot, leading www.) and a
 *   licensed apex domain now also covers its subdomains — no more misses from
 *   www./staging./m. variants. Non-exact matches are recorded for a future
 *   anti-abuse audit: see getFuzzyMatches() / window.AnavoLicenseAudit
 * - ✅ NEW: FAIL-OPEN. Only a confirmed server response saying "not licensed"
 *   shows the unlicensed notice. Any network failure (VPN, antivirus TLS proxy,
 *   ad blocker, DNS filter, offline) keeps the plugin fully enabled and shows a
 *   neutral connectivity notice instead of accusing a paying client.
 * - ✅ NEW: Last-known-good license cached in localStorage (30d) as offline fallback
 * - ✅ NEW: Both notices auto-dismiss after 5s
 * - ✅ FIX: Removed the window.location.reload() on license-status change — a flaky
 *   network could reload a live client site under its visitors
 *
 * CHANGELOG v1.4.0:
 * - ✅ FIX: global_whitelist hits now return licensed:true (type 'development')
 *   Previously they returned licensed:false, so a client visiting their own
 *   *.squarespace.com preview URL got the unlicensed notice + watermark.
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

  var STORE_URL = 'https://plugins.anavo.tech';
  var LKG_TTL   = 30 * 24 * 3600 * 1000; // 30 days

  class AnavoLicenseManager {
    constructor(pluginName, version, options = {}) {
      this.pluginName = pluginName;
      this.version = version;
      this.licenseServer = options.licenseServer || 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json';
      this.dbLicenseServer = options.dbLicenseServer || 'https://api.anavo.tech/api/licenses/check';
      this.checkInterval = options.checkInterval || 3600000; // 1 hour
      this.showUI = options.showUI !== false;
      this.storeUrl = options.storeUrl || STORE_URL;
      this.noticeTimeout = options.noticeTimeout || 5000; // auto-dismiss
      this.cachedLicense = null;
      this.isLicensed = false;
      this.licenseType = null;
      this.degradedReason = null;
      this.fuzzyMatches = [];

      // 🔓 BYPASS DOMAINS - No license check needed
      this.bypassDomains = [
        'shallot-cone-9wym.squarespace.com',
        'anavo.tech',
        'www.anavo.tech',
        'plugins.anavo.tech',
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
        if (result.type === 'grace') {
          console.warn(`⚠️ ${this.pluginName}: license unverifiable (${result.reason}) — running enabled`);
          if (this.showUI && result.reason !== 'offline') this.showConnectivityNotice(result.reason);
        } else {
          console.log(`✅ License verified - ${result.type} license`);
          this.setupPeriodicCheck();
        }
      } else {
        console.warn('⚠️ No valid license - Running in limited mode');
        if (this.showUI) this.showLicenseNotice();
      }

      return result;
    }

    // ========================================
    // HOST NORMALIZATION + MATCHING
    // ========================================

    _normalizeHost(host) {
      return String(host || '')
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        .split(':')[0]
        .replace(/\.$/, '')
        .replace(/^www\./, '');
    }

    isBypassDomain() {
      const host = this._normalizeHost(window.location.hostname);
      return this.bypassDomains.some(domain => {
        const d = this._normalizeHost(domain);
        return host === d || host.endsWith('.' + d);
      });
    }

    isDevelopment() {
      const hostname = window.location.hostname.toLowerCase();
      const devPatterns = ['localhost', '127.0.0.1', '.local', '.sqsp.com', '.squarespace.com', 'staging-'];
      return devPatterns.some(pattern => {
        if (pattern.startsWith('.')) return hostname.endsWith(pattern) || hostname.includes(pattern);
        return hostname === pattern || hostname.startsWith(pattern);
      });
    }

    /**
     * Records a match that was NOT a clean exact hit.
     * TODO: ship these to api.anavo.tech so we can review whether any domain is
     * riding someone else's license via a wildcard.
     */
    _recordFuzzy(host, pattern, kind) {
      const entry = { plugin: this.pluginName, host, pattern, kind, ts: Date.now() };
      this.fuzzyMatches.push(entry);
      window.AnavoLicenseAudit = window.AnavoLicenseAudit || [];
      window.AnavoLicenseAudit.push(entry);
      console.debug(`🔎 Anavo license: ${kind} match — ${host} via ${pattern}`);
    }

    getFuzzyMatches() {
      return this.fuzzyMatches.slice();
    }

    matchesDomain(current, allowedList) {
      if (!allowedList) return false;
      const host = this._normalizeHost(current);

      return allowedList.some(pattern => {
        const p = String(pattern || '').trim().toLowerCase();
        if (!p) return false;

        // Bare global wildcard
        if (p === '*') {
          this._recordFuzzy(host, p, 'global-wildcard');
          return true;
        }

        // *.example.com — apex and any subdomain
        if (p.startsWith('*.')) {
          const base = this._normalizeHost(p.slice(2));
          if (host === base) { this._recordFuzzy(host, p, 'wildcard-apex'); return true; }
          if (host.endsWith('.' + base)) { this._recordFuzzy(host, p, 'wildcard-sub'); return true; }
          return false;
        }

        // Embedded wildcard — escape regex metachars, then expand *
        if (p.indexOf('*') > -1) {
          const rx = new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
          if (rx.test(host)) { this._recordFuzzy(host, p, 'regex'); return true; }
          return false;
        }

        // Plain domain: exact after normalization, or a subdomain of it
        const base = this._normalizeHost(p);
        if (host === base) return true;
        if (host.endsWith('.' + base)) { this._recordFuzzy(host, p, 'subdomain'); return true; }
        return false;
      });
    }

    // ========================================
    // CHAIN: DB (source of truth) → licenses.json (fallback)
    //        → last-known-good → fail open
    //
    // A grant from EITHER source wins. The unlicensed notice needs both sources
    // to answer and both to say no — anything less is an unknown, not a verdict.
    // ========================================

    async checkLicense() {
      // 0. Never nag a visitor who is plainly offline
      if (window.navigator && window.navigator.onLine === false) {
        return this._failOpen('offline');
      }

      // 1. Check sessionStorage cache first
      const cached = this._getCached();
      if (cached) {
        this.isLicensed = cached.licensed;
        this.licenseType = cached.type;
        return cached;
      }

      // 2. The DB is the source of truth — every sale writes there.
      const dbResult = await this._checkDb();
      if (dbResult.licensed) {
        this._setCache(dbResult);
        this._setLastKnownGood(dbResult);
        return dbResult;
      }

      // 3. licenses.json is the fallback. It still carries the dev/preview
      //    whitelist and hand-issued licenses that predate the DB, so a DB miss
      //    is not the end of the story.
      const staticResult = await this._checkStatic();
      if (staticResult.licensed) {
        this._setCache(staticResult);
        this._setLastKnownGood(staticResult);
        return staticResult;
      }

      // 4. Neither granted. Did they actually ANSWER? An unreachable source is
      //    not a denial — a VPN, ad blocker or antivirus must never be able to
      //    turn a paying client into a pirate.
      const dbAnswered     = dbResult.type     !== 'offline';
      const staticAnswered = staticResult.type !== 'offline';

      if (!dbAnswered && !staticAnswered) return this._recover('network');
      if (!staticAnswered)                return this._recover('cdn-blocked');
      if (!dbAnswered)                    return this._recover('api-unreachable');

      // 5. Both answered, both said no. That is a verdict.
      const verdict = staticResult.type === 'expired' ? staticResult : dbResult;
      this._setCache(verdict);
      return verdict;
    }

    /** Try last-known-good before giving up; otherwise stay enabled. */
    _recover(reason) {
      const lkg = this._getLastKnownGood();
      if (lkg) {
        console.warn(`⚠️ ${this.pluginName}: using cached license (${reason})`);
        this.isLicensed = true;
        this.licenseType = lkg.type;
        return { licensed: true, type: lkg.type, features: lkg.features || [], source: 'lkg' };
      }
      return this._failOpen(reason);
    }

    _failOpen(reason) {
      this.isLicensed = true;
      this.licenseType = 'grace';
      this.degradedReason = reason;
      return { licensed: true, type: 'grace', reason: reason, source: 'fail-open' };
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
        const domain = this._normalizeHost(window.location.hostname);
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
    // LAST-KNOWN-GOOD (survives the browser session)
    // ========================================

    _lkgKey() {
      return `anavo_lkg_${this.pluginName}`;
    }

    _setLastKnownGood(result) {
      try {
        localStorage.setItem(this._lkgKey(), JSON.stringify({ result, ts: Date.now() }));
      } catch (_) {}
    }

    _getLastKnownGood() {
      try {
        const raw = localStorage.getItem(this._lkgKey());
        if (!raw) return null;
        const { result, ts } = JSON.parse(raw);
        if (Date.now() - ts > LKG_TTL) return null;
        return result && result.licensed ? result : null;
      } catch (_) { return null; }
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

      // Development / preview hosts (localhost, *.sqsp.com, *.squarespace.com).
      // Treated as licensed: a client opening their own Squarespace preview URL
      // must never see the unlicensed notice or the watermark.
      if (this.matchesDomain(currentDomain, licenseData.global_whitelist)) {
        this.isLicensed = true;
        this.licenseType = 'development';
        return { licensed: true, type: 'development', source: 'static' };
      }

      return { licensed: false, type: 'none', source: 'static' };
    }

    setupPeriodicCheck() {
      setInterval(() => {
        if (this.isBypassDomain()) return;
        // Clear cache so next check hits the server
        try { sessionStorage.removeItem(this._cacheKey()); } catch (_) {}
        this.checkLicense().then(result => {
          // No reload: a flaky network must never refresh a live client site.
          if (!result.licensed && this.isLicensed) {
            console.warn('⚠️ License status changed');
            this.isLicensed = false;
            if (this.showUI) this.showLicenseNotice();
          }
        });
      }, this.checkInterval);
    }

    // ========================================
    // UI
    // ========================================

    _shell(id, html) {
      if (document.getElementById(id)) return null;
      const notice = document.createElement('div');
      notice.id = id;
      notice.setAttribute('style',
        'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.9);color:#fff;' +
        'padding:15px 20px;border-radius:8px;font-family:system-ui,sans-serif;font-size:13px;' +
        'z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:300px;' +
        'opacity:1;transition:opacity .4s ease'
      );
      notice.innerHTML = html;
      document.body.appendChild(notice);
      this._autoDismiss(notice);
      return notice;
    }

    _autoDismiss(el) {
      if (!el || !this.noticeTimeout) return;
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
      }, this.noticeTimeout);
    }

    showLicenseNotice() {
      this._shell('anavo-license-notice',
        '<div style="font-weight:700;margin-bottom:8px">⚠️ Unlicensed Plugin</div>' +
        '<div style="margin-bottom:12px;line-height:1.4">The <strong>' + this.pluginName + '</strong> plugin requires a license.</div>' +
        '<a href="' + this.storeUrl + '" target="_blank" rel="noopener" style="display:inline-block;background:#fff;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:600;font-size:12px">Get License →</a>'
      );
    }

    /**
     * Shown when we could not REACH the license servers — never an accusation.
     * A VPN, corporate proxy, DNS filter, ad blocker or antivirus doing TLS
     * inspection is the usual cause. The plugin keeps working regardless.
     */
    showConnectivityNotice(reason) {
      const target = reason === 'api-unreachable' ? 'api.anavo.tech' : 'jsDelivr (CDN)';
      this._shell('anavo-connectivity-notice',
        '<div style="font-weight:700;margin-bottom:8px">⚠️ This plugin needs access to ' + target + ' to work</div>' +
        '<div style="line-height:1.4;opacity:.85">A VPN, ad blocker or antivirus may be blocking the request.</div>'
      );
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
        reason:     this.degradedReason,
        pluginName: this.pluginName,
        version:    this.version,
        fuzzy:      this.fuzzyMatches.length,
        features:   this.cachedLicense?.licenses?.[this.pluginName]?.features || []
      };
    }
  }

  window.AnavoLicenseManager = AnavoLicenseManager;

})(window);
