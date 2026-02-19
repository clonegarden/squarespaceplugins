/**
 * =======================================
 * FLOATING HEADER - Squarespace Plugin
 * =======================================
 * @version 1.0.1
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * FIXED v1.0.1:
 * - Aguarda Squarespace carregar DOM completamente
 * - MutationObserver detecta header tardio
 * - Mais seletores para 7.0 e 7.1
 * - Debug melhorado
 * =======================================
 */

(function() {
  'use strict';

  const PLUGIN_VERSION = '1.0.1';
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
      
      // Behavior
      transitionSpeed: parseInt(params.get('transitionSpeed') || '600'),
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
  // ELEMENT DETECTION (ENHANCED)
  // ========================================

  /**
   * ✅ VERSÃO MELHORADA - Aguarda elementos aparecerem
   */
  function waitForElement(selectors, timeout = 5000) {
    return new Promise((resolve) => {
      // Tenta encontrar imediatamente
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.offsetHeight > 0) {
          if (config.debug) console.log('✓ Found immediately:', selector);
          resolve(el);
          return;
        }
      }

      // Se não encontrou, observa mudanças no DOM
      const observer = new MutationObserver((mutations, obs) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.offsetHeight > 0) {
            if (config.debug) console.log('✓ Found via observer:', selector);
            obs.disconnect();
            resolve(el);
            return;
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout após 5s
      setTimeout(() => {
        observer.disconnect();
        console.error('❌ Element not found after timeout');
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Encontra header Squarespace (7.0 e 7.1)
   */
  async function findHeader() {
    const selectors = [
      'header.Header',                    // 7.1 primary
      'header#header',                    // 7.0 primary
      '.sqs-announcement-bar-dropzone + header',  // After announcement
      'header[data-controller="Header"]', // 7.1 alternative
      '.header',                          // 7.0 alternative
      '[data-nc-group="header"]',        // Alternative
      'header'                            // Last resort
    ];

    return await waitForElement(selectors);
  }

  /**
   * Encontra primeira seção
   */
  async function findFirstSection() {
    const selectors = [
      '.page-section:first-of-type',               // Primary
      'section.page-section:first-of-type',        // Explicit
      'section[data-section-id]:first-of-type',    // With ID
      '#page > .page-section:first-child',         // Direct child
      '#page section:first-child',                 // Nested
      'main > section:first-child'                 // Alternative
    ];

    return await waitForElement(selectors);
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

      /* Wrapper container */
      .anavo-floating-header-wrapper {
        width: 100% !important;
        z-index: ${config.zIndex} !important;
        transition: all ${config.transitionSpeed}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        left: 0 !important;
        right: 0 !important;
      }

      /* Header overrides */
      .anavo-floating-header-wrapper header,
      .anavo-floating-header-wrapper .Header,
      .anavo-floating-header-wrapper .header {
        ${bgColorCSS}
        ${fontColorCSS}
        transition: all ${config.transitionSpeed}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: static !important;
        margin: 0 !important;
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

      /* Hide original header position */
      body > header:not(.anavo-floating-header-wrapper *),
      body > .Header:not(.anavo-floating-header-wrapper *) {
        display: none !important;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .anavo-floating-header-wrapper {
          width: 100% !important;
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
      this.isSticky = false;
      this.scrollTimeout = null;

      this.sectionBottom = 0;
      this.headerHeight = 0;
    }

    init() {
      // Criar wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'anavo-floating-header-wrapper';
      
      // Inserir wrapper ANTES do header original
      this.originalHeader.parentNode.insertBefore(this.wrapper, this.originalHeader);
      
      // Mover header para dentro do wrapper
      this.wrapper.appendChild(this.originalHeader);

      // Calcular dimensões
      this.updateDimensions();

      // Posição inicial
      if (config.startAtBottom) {
        this.positionAtBottom();
      } else {
        this.positionAtTop();
      }

      // Monitor scroll e resize
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      window.addEventListener('resize', () => this.updateDimensions());

      if (config.debug) console.log('✅ Controller initialized');
    }

    updateDimensions() {
      // Força recalcular layout
      const rect = this.firstSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Bottom absoluto da seção 1 (relativo ao documento)
      this.sectionBottom = scrollTop + rect.top + rect.height;
      this.headerHeight = this.wrapper.offsetHeight || 60;

      if (config.debug) {
        console.log('📐 Dimensions updated:', {
          sectionBottom: this.sectionBottom,
          headerHeight: this.headerHeight,
          scrollTop: scrollTop
        });
      }
    }

    positionAtBottom() {
      // Position: absolute no BOTTOM da seção 1
      this.wrapper.style.position = 'absolute';
      this.wrapper.style.top = `${this.sectionBottom - this.headerHeight}px`;
      this.wrapper.style.bottom = 'auto';
      
      this.isSticky = false;

      if (config.debug) console.log('📍 Positioned at BOTTOM of section 1');
    }

    positionAtTop() {
      // Position: fixed no TOPO (sticky)
      this.wrapper.style.position = 'fixed';
      this.wrapper.style.top = '0px';
      this.wrapper.style.bottom = 'auto';
      
      this.isSticky = true;

      if (config.debug) console.log('📍 Positioned at TOP (sticky)');
    }

    handleScroll() {
      clearTimeout(this.scrollTimeout);
      
      this.scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Trigger: quando scroll passa do bottom da seção 1
        const triggerPoint = this.sectionBottom - this.headerHeight;

        if (scrollTop >= triggerPoint && !this.isSticky) {
          // Passou da seção 1 → sticky no topo
          this.positionAtTop();
        } else if (scrollTop < triggerPoint && this.isSticky) {
          // Voltou pra seção 1 → volta pro bottom
          this.positionAtBottom();
        }
      }, 10);
    }
  }

  // ========================================
  // LICENSING (OPCIONAL)
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

      // ✅ PASSO 1: AGUARDA elementos aparecerem
      console.log('⏳ Waiting for Squarespace to load...');
      
      const header = await findHeader();
      const firstSection = await findFirstSection();

      // ✅ VALIDAÇÃO RIGOROSA
      if (!header) {
        console.error('❌ Header not found - aborting');
        console.error('💡 Try adding ?debug=true to see detection logs');
        return;
      }

      if (!firstSection) {
        console.error('❌ First section not found - aborting');
        console.error('💡 Check if page has .page-section elements');
        return;
      }

      console.log('✓ Header found:', header);
      console.log('✓ First section found:', firstSection);

      // PASSO 2: Injeta CSS
      injectStyles();

      // PASSO 3: Aguarda DOM estável
      await new Promise(resolve => setTimeout(resolve, 100));

      // PASSO 4: Inicializa controller
      const controller = new FloatingHeaderController(header, firstSection);
      controller.init();

      console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
      console.log('   Start Position:', config.startAtBottom ? 'Bottom of Section 1' : 'Top (Sticky)');

      // PASSO 5: Licensing em background
      setTimeout(() => loadLicensing(), 1000);

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  // ========================================
  // AUTO-START (AGUARDA SQUARESPACE)
  // ========================================
  
  // Aguarda Squarespace carregar TUDO
  if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
      // Aguarda 2 segundos após load (Squarespace carrega assíncrono)
      setTimeout(init, 2000);
    });
  } else {
    // Se já carregou, aguarda 2s mesmo assim
    setTimeout(init, 2000);
  }

})();
