/**
 * =======================================
 * FLOATING HEADER - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * DESCRIPTION:
 * Header starts fixed at bottom of first section,
 * smoothly floats up to sticky position on scroll.
 * 
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/floating-header/floating-header.min.js"></script>
 * 
 * CUSTOMIZATION:
 * <script src="...?fontSize=18&bgColor=000000&customLogo=https://example.com/logo.png"></script>
 * =======================================
 */

(function() {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'FloatingHeader';
  
  console.log(`🎈 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // CONFIGURATION
  // ========================================
  
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function getConfig() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    function fixColor(color) {
      if (!color) return null;
      color = decodeURIComponent(color);
      if (color.toLowerCase() === 'transparent') return 'transparent';
      if (/^[0-9A-Fa-f]{6}$/.test(color)) return '#' + color;
      return color.startsWith('#') ? color : color;
    }

    return {
      // Styling
      fontSize: params.get('fontSize') || null,
      fontFamily: params.get('fontFamily') ? decodeURIComponent(params.get('fontFamily')) : null,
      fontWeight: params.get('fontWeight') || null,
      fontColor: fixColor(params.get('fontColor')),
      bgColor: fixColor(params.get('bgColor')),
      
      // Logo
      customLogo: params.get('customLogo') ? decodeURIComponent(params.get('customLogo')) : null,
      logoWidth: params.get('logoWidth') || null,
      logoHeight: params.get('logoHeight') || null,
      
      // Behavior
      transitionSpeed: parseInt(params.get('transitionSpeed') || '600'),
      stickyTop: params.get('stickyTop') || '0',
      startAtBottom: params.get('startAtBottom') !== 'false',
      
      // Advanced
      zIndex: params.get('zIndex') || '9999',
      debug: params.get('debug') === 'true'
    };
  }

  const config = getConfig();
  
  if (config.debug) {
    console.log('⚙️ Configuration:', config);
  }

  // ========================================
  // ELEMENT DETECTION (UNIVERSAL)
  // ========================================

  /**
   * Encontra header Squarespace (7.0 e 7.1)
   */
  function findHeader() {
    const selectors = [
      'header.Header',
      '#header',
      '.header',
      '[data-nc-group="header"]',
      'header[data-controller="Header"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        if (config.debug) console.log('✓ Header found:', selector);
        return el;
      }
    }

    console.error('❌ No header found');
    return null;
  }

  /**
   * Encontra primeira seção (universal)
   */
  function findFirstSection() {
    const selectors = [
      'section[data-section-id]:first-of-type',
      '.page-section:first-of-type',
      '#page > section:first-child',
      'main > section:first-child',
      '[data-section-type]:first-of-type'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        if (config.debug) console.log('✓ First section found:', selector);
        return el;
      }
    }

    console.error('❌ No first section found');
    return null;
  }

  // ========================================
  // CSS INJECTION
  // ========================================

  function injectStyles() {
    if (document.getElementById('anavo-floating-header-styles')) {
      document.getElementById('anavo-floating-header-styles').remove();
    }

    const fontColorCSS = config.fontColor ? `color: ${config.fontColor} !important;` : '';
    const bgColorCSS = config.bgColor ? `background-color: ${config.bgColor} !important;` : '';
    const fontSizeCSS = config.fontSize ? `font-size: ${config.fontSize}px !important;` : '';
    const fontFamilyCSS = config.fontFamily ? `font-family: ${config.fontFamily} !important;` : '';
    const fontWeightCSS = config.fontWeight ? `font-weight: ${config.fontWeight} !important;` : '';

    const styles = document.createElement('style');
    styles.id = 'anavo-floating-header-styles';
    styles.textContent = `
      /* ========================================
         FLOATING HEADER v${PLUGIN_VERSION}
         ======================================== */

      /* Container wrapper */
      .anavo-floating-header-wrapper {
        position: relative !important;
        z-index: ${config.zIndex} !important;
        width: 100% !important;
        transition: all ${config.transitionSpeed}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Header modifications */
      .anavo-floating-header-wrapper header,
      .anavo-floating-header-wrapper .Header,
      .anavo-floating-header-wrapper .header {
        ${bgColorCSS}
        ${fontColorCSS}
        transition: all ${config.transitionSpeed}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Typography override */
      .anavo-floating-header-wrapper a,
      .anavo-floating-header-wrapper nav,
      .anavo-floating-header-wrapper .header-nav-item a {
        ${fontSizeCSS}
        ${fontFamilyCSS}
        ${fontWeightCSS}
        ${fontColorCSS}
      }

      /* Custom logo */
      ${config.customLogo ? `
        .anavo-floating-header-wrapper .header-title-logo img,
        .anavo-floating-header-wrapper .header-title-logo a {
          content: url(${config.customLogo}) !important;
          ${config.logoWidth ? `width: ${config.logoWidth}px !important;` : ''}
          ${config.logoHeight ? `height: ${config.logoHeight}px !important;` : ''}
          object-fit: contain !important;
        }
      ` : ''}

      /* Hide original header */
      body > header,
      body > .header,
      body > .Header,
      #header:not(.anavo-floating-header-wrapper *) {
        display: none !important;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .anavo-floating-header-wrapper a,
        .anavo-floating-header-wrapper nav {
          ${config.fontSize ? `font-size: ${Math.max(parseInt(config.fontSize) - 2, 12)}px !important;` : ''}
        }
      }
    `;

    document.head.appendChild(styles);
    if (config.debug) console.log('✅ Injected styles');
  }

  // ========================================
  // FLOATING LOGIC
  // ========================================

  class FloatingHeaderController {
    constructor(header, firstSection) {
      this.originalHeader = header;
      this.firstSection = firstSection;
      this.wrapper = null;
      this.isFloating = false;
      this.scrollTimeout = null;

      this.sectionBottom = 0;
      this.headerHeight = 0;
    }

    init() {
      // Criar wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'anavo-floating-header-wrapper';
      
      // Mover header para wrapper
      this.originalHeader.parentNode.insertBefore(this.wrapper, this.originalHeader);
      this.wrapper.appendChild(this.originalHeader);

      // Calcular dimensões
      this.updateDimensions();

      // Posição inicial
      if (config.startAtBottom) {
        this.positionAtBottom();
      } else {
        this.positionAtTop();
      }

      // Monitor scroll
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      window.addEventListener('resize', () => this.updateDimensions());

      if (config.debug) console.log('✅ Controller initialized');
    }

    updateDimensions() {
      const rect = this.firstSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      this.sectionBottom = scrollTop + rect.top + rect.height;
      this.headerHeight = this.originalHeader.offsetHeight;

      if (config.debug) {
        console.log('📐 Dimensions:', {
          sectionBottom: this.sectionBottom,
          headerHeight: this.headerHeight
        });
      }
    }

    positionAtBottom() {
      this.wrapper.style.position = 'absolute';
      this.wrapper.style.top = `${this.sectionBottom - this.headerHeight}px`;
      this.wrapper.style.left = '0';
      this.wrapper.style.right = '0';
      
      this.isFloating = false;

      if (config.debug) console.log('📍 Positioned at bottom');
    }

    positionAtTop() {
      this.wrapper.style.position = 'fixed';
      this.wrapper.style.top = `${config.stickyTop}px`;
      this.wrapper.style.left = '0';
      this.wrapper.style.right = '0';
      
      this.isFloating = true;

      if (config.debug) console.log('📍 Positioned at top (sticky)');
    }

    handleScroll() {
      clearTimeout(this.scrollTimeout);
      
      this.scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const triggerPoint = this.sectionBottom - this.headerHeight;

        if (scrollTop >= triggerPoint && !this.isFloating) {
          // Passou da seção 1 → sticky no topo
          this.positionAtTop();
        } else if (scrollTop < triggerPoint && this.isFloating) {
          // Voltou pra seção 1 → volta pro bottom
          this.positionAtBottom();
        }
      }, 10);
    }
  }

  // ========================================
  // LICENSING
  // ========================================

  async function loadLicensing() {
    try {
      if (window.AnavoLicenseManager) return null;

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const licenseManager = new window.AnavoLicenseManager(
        PLUGIN_NAME,
        PLUGIN_VERSION,
        {
          licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: true
        }
      );

      await licenseManager.init();
      
      if (!licenseManager.isLicensed) {
        const header = document.querySelector('header');
        if (header) licenseManager.insertWatermark(header);
      }

      return licenseManager;

    } catch (error) {
      console.warn('⚠️ License check failed:', error.message);
      return null;
    }
  }

  // ========================================
  // MAIN INITIALIZATION
  // ========================================

  async function init() {
    try {
      console.log('🔧 Initializing...');

      // Encontra elementos
      const header = findHeader();
      const firstSection = findFirstSection();

      if (!header || !firstSection) {
        console.error('❌ Required elements not found - aborting');
        return;
      }

      // Injeta CSS
      injectStyles();

      // Inicializa controller
      const controller = new FloatingHeaderController(header, firstSection);
      controller.init();

      console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
      console.log('   Start Position:', config.startAtBottom ? 'Bottom of Section 1' : 'Top (Sticky)');

      // Licensing em background
      loadLicensing();

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  // Auto-start
  if (document.readyState === 'loading') {
    window.addEventListener('load', () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }

})();
