/**
 * =======================================
 * FLOATING HEADER - Squarespace Plugin
 * =======================================
 * @version 1.0.3
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * FIXED v1.0.3:
 * - Auto-adjusts first section to min-height: 90vh
 * - Enhanced editor mode detection
 * - Prevents execution in Squarespace editor
 * - Better console warnings
 * 
 * FIXED v1.0.2:
 * - Abort if in Squarespace editor mode
 * - Wait indefinitely for Squarespace to load (like expanded-menu)
 * - Better element detection with more selectors
 * - Console warnings for editor mode
 * - Works in PREVIEW and PUBLISHED mode only
 * 
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/floating-header/floating-header.min.js"></script>
 * =======================================
 */

(function() {
  'use strict';

  const PLUGIN_VERSION = '1.0.3';
  const PLUGIN_NAME = 'FloatingHeader';
  
  console.log(`🎈 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // EDITOR MODE DETECTION (ENHANCED)
  // ========================================

  function isEditorMode() {
    // Check body classes (most reliable)
    const bodyClasses = document.body.className;
    
    if (bodyClasses.includes('squarespace-editable') || 
        bodyClasses.includes('sqs-edit-mode') ||
        bodyClasses.includes('squarespace-config') ||
        bodyClasses.includes('sqs-editing-mode')) {
      return true;
    }

    // Check if in iframe (editor uses iframes)
    if (window.self !== window.top) {
      return true;
    }

    // Check URL parameters (editor sometimes uses ?edit=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true' || urlParams.get('sqs-edit-mode')) {
      return true;
    }

    // Check for Squarespace editor objects
    if (window.Static && window.Static.SQUARESPACE_CONTEXT && 
        window.Static.SQUARESPACE_CONTEXT.isEditing) {
      return true;
    }

    return false;
  }

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
      adjustSectionHeight: params.get('adjustSectionHeight') !== 'false', // ✅ NOVO
      sectionMinHeight: params.get('sectionMinHeight') || '90vh',          // ✅ NOVO
      
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
  // ELEMENT DETECTION (IMPROVED)
  // ========================================

  /**
   * ✅ VERSÃO MELHORADA - Aguarda INFINITAMENTE (como expanded-menu)
   */
  function waitForHeader() {
    return new Promise((resolve) => {
      const selectors = [
        'header.Header',                    // 7.1 primary
        'header#header',                    // 7.0 primary
        '.sqs-announcement-bar-dropzone + header',  // After announcement
        'header[data-controller="Header"]', // 7.1 alternative
        '.header-inner',                    // Header inner
        '[data-nc-group="header"]',        // Alternative
        'header',                           // Last resort
        // Mais específicos:
        '.header-announcement-bar-wrapper + header',
        '.header-display-desktop',
        '.header-display-mobile'
      ];

      let attempts = 0;
      const maxAttempts = 100; // 100 tentativas = 10 segundos

      function attempt() {
        attempts++;

        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && el.offsetHeight > 0) {
            if (config.debug) console.log(`✓ Header found after ${attempts} attempts:`, selector);
            resolve(el);
            return;
          }
        }

        if (attempts >= maxAttempts) {
          console.error('❌ Header not found after 10 seconds');
          resolve(null);
          return;
        }

        // Tenta novamente em 100ms
        setTimeout(attempt, 100);
      }

      attempt();
    });
  }

  /**
   * Encontra primeira seção (melhorado)
   */
  function waitForFirstSection() {
    return new Promise((resolve) => {
      const selectors = [
        '.page-section:first-of-type',               // Primary
        'section.page-section:first-of-type',        // Explicit
        'section[data-section-id]:first-of-type',    // With ID
        '#page > .page-section:first-child',         // Direct child
        '#page section:first-child',                 // Nested
        'main > section:first-child',                // Alternative
        // Mais específicos:
        '[data-section-type]:first-of-type',
        '.page-section[data-section-id]',
        '.sections .section:first-child'
      ];

      let attempts = 0;
      const maxAttempts = 100;

      function attempt() {
        attempts++;

        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) {
            if (config.debug) console.log(`✓ First section found after ${attempts} attempts:`, selector);
            resolve(el);
            return;
          }
        }

        if (attempts >= maxAttempts) {
          console.error('❌ First section not found after 10 seconds');
          resolve(null);
          return;
        }

        setTimeout(attempt, 100);
      }

      attempt();
    });
  }

  // ========================================
  // ✅ NOVA FUNÇÃO: AJUSTAR ALTURA DA SEÇÃO
  // ========================================

  function adjustFirstSectionHeight(section) {
    if (!config.adjustSectionHeight) {
      if (config.debug) console.log('⏭️ Section height adjustment disabled');
      return;
    }

    // Aplica min-height para garantir que menu seja visível
    section.style.minHeight = config.sectionMinHeight;
    section.style.boxSizing = 'border-box';

    // Garante que conteúdo interno não force overflow
    section.style.display = 'flex';
    section.style.flexDirection = 'column';
    section.style.justifyContent = 'center';

    if (config.debug) {
      console.log(`📐 Adjusted first section height to ${config.sectionMinHeight}`);
    }
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

      // ✅ CHECK 1: Detecta modo editor (PRIMEIRA VERIFICAÇÃO)
      if (isEditorMode()) {
        console.warn('⚠️⚠️⚠️ SQUARESPACE EDITOR MODE DETECTED ⚠️⚠️⚠️');
        console.warn('');
        console.warn('📝 This plugin is DISABLED in editor mode to prevent design conflicts.');
        console.warn('');
        console.warn('✅ To test the plugin:');
        console.warn('   1. Click "Preview" button in Squarespace editor');
        console.warn('   2. Or click "Save & Exit" to test on live site');
        console.warn('');
        return; // ABORT IMEDIATAMENTE!
      }

      // ✅ CHECK 2: Aguarda elementos (retry infinito)
      console.log('⏳ Waiting for Squarespace to load...');
      
      const header = await waitForHeader();
      const firstSection = await waitForFirstSection();

      // ✅ VALIDAÇÃO
      if (!header) {
        console.error('❌ Header not found - aborting');
        console.error('💡 Try enabling debug mode: ?debug=true');
        return;
      }

      if (!firstSection) {
        console.error('❌ First section not found - aborting');
        console.error('💡 Check if page has .page-section elements');
        return;
      }

      console.log('✓ Header found:', header);
      console.log('✓ First section found:', firstSection);

      // ✅ NOVO: Ajusta altura da primeira seção
      adjustFirstSectionHeight(firstSection);

      // Injeta CSS*

