/**
 * =======================================
 * ALT ENGINE - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Auto-injects keyword-rich alt attributes on all images.
 * Reads client config from Anavo API based on current domain.
 * Uses MutationObserver for lazy-loaded images.
 * Silent fail on any error — never breaks the site.
 *
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/alt-engine/alt-engine.min.js"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME    = 'AltEngine';

  console.log(`📊 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // 1. PARSE PARAMETERS
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function getScriptParams() {
    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const p   = url.searchParams;
      return {
        apiBase: p.get('apiBase') || 'https://api.anavo.tech',
        debug:   p.get('debug') === 'true',
      };
    } catch (_e) {
      return { apiBase: 'https://api.anavo.tech', debug: false };
    }
  }

  const config = getScriptParams();

  function dbg(msg, data) {
    if (config.debug) {
      console.log(`[${PLUGIN_NAME}] ${msg}`, data !== undefined ? data : '');
    }
  }

  // ========================================
  // 2. ALT QUALITY RULES
  // ========================================

  const GENERIC_PATTERNS = [
    /^$/,
    /^image$/i,
    /^photo$/i,
    /^img$/i,
    /^picture$/i,
    /^untitled$/i,
    /^\d+$/,
    /^dsc_?\d+$/i,
    /^img_?\d+$/i,
    /^1e5a\d+$/i,
    /^screenshot/i,
    /^\.jpg$/i,
    /^\.png$/i,
    /^\.webp$/i,
    /^file/i
  ];

  function _isGeneric(alt) {
    if (!alt) return true;
    const lower = alt.trim().toLowerCase();
    return GENERIC_PATTERNS.some(p => p.test(lower));
  }

  function _isGoodAlt(alt) {
    if (!alt) return false;
    if (alt.length < 20) return false;
    if (_isGeneric(alt)) return false;
    return true;
  }

  // ========================================
  // 3. CONFIG FETCH
  // ========================================

  async function fetchClientConfig() {
    const domain = window.location.hostname.replace(/^www\./, '');
    const url    = `${config.apiBase}/api/seo/config?domain=${encodeURIComponent(domain)}`;
    dbg('Fetching config from', url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      dbg('Config received — images:', (data.client_images || []).length);
      return data;
    } catch (e) {
      dbg('Config fetch failed', e.message);
      return null;
    }
  }

  // ========================================
  // 4. LOOKUP MAP
  // ========================================

  let _pageAlts = {};
  let _bizName  = '';
  let _keywords = [];

  function _buildLookupMap(clientConfig) {
    _bizName  = (clientConfig.nap && clientConfig.nap.name) || '';
    _pageAlts = {};

    (clientConfig.client_images || []).forEach(img => {
      if (img.src_fragment && img.suggested_alt) {
        _pageAlts[img.src_fragment.toLowerCase()] = img.suggested_alt;
      }
    });

    // Keywords from current page for fallback enrichment
    const pageKey  = _getPageKey();
    const pages    = clientConfig.client_pages || {};
    const pageData = pages[pageKey] || pages['home'] || null;
    _keywords = (pageData && pageData.keywords) || [];

    dbg('Lookup map built', Object.keys(_pageAlts).length + ' entries');
    dbg('Keywords available', _keywords.length);
  }

  // ========================================
  // 5. IMAGE PROCESSING
  // ========================================

  function _getPageKey() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (!path || path === '/') return 'home';
    return path.replace(/^\//, '').split('/')[0] || 'home';
  }

  function _getPageName() {
    const path = window.location.pathname;
    const slug = path.split('/').filter(Boolean).pop() || 'home';
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  }

  function _extractFilename(src) {
    try {
      const parts = src.split('/');
      return decodeURIComponent(parts[parts.length - 1]).toLowerCase();
    } catch (e) { return ''; }
  }

  function _readableFromFilename(filename) {
    try {
      let name = filename.replace(/\.[^.]+$/, '');
      name = decodeURIComponent(name).replace(/\+/g, ' ').replace(/[_-]/g, ' ');
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch (e) { return ''; }
  }

  function _lookupAlt(src) {
    const srcLower = src.toLowerCase();
    const keys     = Object.keys(_pageAlts);

    for (let i = 0; i < keys.length; i++) {
      if (srcLower.indexOf(keys[i]) !== -1) return _pageAlts[keys[i]];
    }

    const filename = _extractFilename(src);
    if (filename && _pageAlts[filename]) return _pageAlts[filename];

    return null;
  }

  function _buildFallbackAlt(src) {
    const filename = _extractFilename(src);
    const pageName = _getPageName();
    const kw       = _keywords[0] || '';

    const readable = _readableFromFilename(filename);
    if (readable && readable.length > 15) {
      return readable + (_bizName ? ' \u2014 ' + _bizName : '');
    }

    const parts = [_bizName, kw, pageName].filter(Boolean);
    return parts.join(' \u2014 ') || 'Photography';
  }

  function _processImage(img) {
    try {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (!src || src.startsWith('data:')) return;

      const currentAlt = (img.getAttribute('alt') || '').trim();
      if (_isGoodAlt(currentAlt)) return;

      const suggested = _lookupAlt(src);
      if (suggested) {
        img.setAttribute('alt', suggested);
        dbg('Alt set from DB', { src, alt: suggested });
      } else if (_isGeneric(currentAlt)) {
        const fallback = _buildFallbackAlt(src);
        img.setAttribute('alt', fallback);
        dbg('Alt set from fallback', { src, alt: fallback });
      }
    } catch (e) { /* silent */ }
  }

  function _processAll() {
    document.querySelectorAll('img').forEach(_processImage);
    dbg('Initial scan complete');
  }

  // ========================================
  // 6. MUTATIONOBSERVER (lazy-loaded images)
  // ========================================

  function _observe() {
    if (!window.MutationObserver) return;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG') {
            _processImage(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(_processImage);
          }
        });
        if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG') {
          _processImage(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList:       true,
      subtree:         true,
      attributes:      true,
      attributeFilter: ['src', 'data-src', 'alt']
    });

    dbg('MutationObserver active');
  }

  // ========================================
  // 7. LICENSING (async, non-blocking, +1.5s)
  // ========================================

  async function loadLicensing() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const script = document.createElement('script');
      const _d = new Date();
      const _v = `${_d.getFullYear()}${String(_d.getMonth()+1).padStart(2,'0')}${String(_d.getDate()).padStart(2,'0')}`;
      script.src = `https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js?v=${_v}`;
      await new Promise((resolve, reject) => {
        script.onload  = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
        licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
        showUI: true,
      });

      await lm.init();
    } catch (e) {
      console.warn(`⚠️ ${PLUGIN_NAME}: License check failed`, e.message);
    }
  }

  // ========================================
  // 8. MAIN INIT
  // ========================================

  async function init() {
    try {
      const clientConfig = await fetchClientConfig();

      if (!clientConfig) {
        dbg('No client config — skipping alt injection');
        return;
      }

      _buildLookupMap(clientConfig);
      _processAll();
      _observe();

      loadLicensing();

      console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
    } catch (e) {
      console.warn(`⚠️ ${PLUGIN_NAME}: Init failed`, e.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
