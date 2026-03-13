/**
 * =======================================
 * TABBED CONTENT - Squarespace Plugin
 * =======================================
 * @version 1.3.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/tabbed-content/tabbed-content.min.js?sectionIndex=2"></script>
 *
 * TARGETING PARAMETERS (choose one):
 * ?sectionIndex=N     - Target the Nth page section (1-based)
 * ?sectionId=X        - Target section by Squarespace data-section-id
 * ?divId=X            - Target a <div> wrapper by id
 * ?ulId=X             - Target a <ul> directly by id
 *
 * APPEARANCE PARAMETERS:
 * ?preset=elegant     - Preset style: default / minimal / elegant / bold
 * ?bgColor=FAF5EF     - Background color hex (used as fallback for contentBgColor)
 * ?contentBgColor=    - Content panel background color (defaults to bgColor); used for the active-tab masking trick
 * ?activeColor=8B7355 - Active tab color hex
 * ?inactiveColor=999999 - Inactive tab color hex
 * ?fontFamily=        - Tab bar font family (default)
 * ?contentFont=       - Content panel font family (default)
 * ?borderColor=       - General border color for the wrapper
 *
 * TAB BAR PARAMETERS:
 * ?tabStyle=concrete     - Tab visual style: concrete / browser / minimal (default: concrete)
 * ?tabGap=6              - Gap between tabs in px (default: 6)
 * ?tabAlign=center       - Tab alignment: left / center / right
 * ?tabFontSize=14        - Tab font size in px
 * ?tabFontColor=         - Tab font color (defaults to inactiveColor)
 * ?tabFontFamily=        - Tab font family (defaults to fontFamily)
 * ?tabTransform=uppercase - Tab text transform
 * ?tabLetterSpacing=0.15em - Tab letter spacing
 * ?tabBorder=true        - Show borders on tabs (always on for concrete/browser; controls underline for minimal)
 * ?tabBorderColor=cccccc - Tab border color hex
 *
 * CONTENT PANEL PARAMETERS:
 * ?contentPadding=60   - Content area padding in px
 * ?imagePosition=left  - Image position: left / right
 * ?imageWidth=45       - Image column width in % (also: photoSize)
 * ?photoSize=45        - Alias for imageWidth
 * ?imageAspect=auto    - Image aspect: auto / square / 4:3 / 3:2 / 16:9
 * ?imagePadding=16     - Padding around the image in px
 * ?headingTag=h2       - Heading tag: h2 / h3
 * ?headingSize=28      - Heading font size in px (also: titleFontSize)
 * ?titleFontSize=28    - Alias for headingSize
 * ?titleFontColor=     - Title font color (defaults to activeColor)
 * ?titleFontFamily=    - Title font family (defaults to contentFont)
 * ?subtitleSize=13     - Subtitle font size in px
 * ?bodySize=15         - Body text font size in px (also: descFontSize)
 * ?descFontSize=15     - Alias for bodySize
 * ?descFontColor=      - Description font color (defaults to inactiveColor)
 * ?descFontFamily=     - Description font family (defaults to contentFont)
 *
 * ANIMATION PARAMETERS:
 * ?animationType=fade - Animation: fade / slide / none
 * ?animationSpeed=400 - Animation duration in ms
 *
 * SECTION PARAMETERS:
 * ?sectionBorder=false     - Show outer border (default: false)
 * ?sectionBorderColor=cccccc - Outer border color hex
 * ?sectionRadius=0         - Outer border radius in px
 *
 * MISC PARAMETERS:
 * ?debug=false        - Enable verbose console logging
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.3.0';
  const PLUGIN_NAME = 'TabbedContent';

  console.log(`📁 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // SCRIPT REFERENCE
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  // ========================================
  // HELPERS
  // ========================================

  function fixColor(color) {
    if (!color || color === 'transparent') return color;
    if (color.startsWith('#') || color.startsWith('rgb')) return color;
    return '#' + color;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ========================================
  // PRESETS
  // ========================================

  const PRESETS = {
    default: {
      bgColor: '#FAF5EF',
      activeColor: '#8B7355',
      inactiveColor: '#999999',
      tabStyle: 'concrete',
      tabBorder: true,
      tabBorderColor: '#cccccc',
      sectionBorder: false,
      sectionBorderColor: '#cccccc',
      fontFamily: 'Georgia, "Times New Roman", serif',
      contentFont: 'Georgia, "Times New Roman", serif',
    },
    minimal: {
      bgColor: '#ffffff',
      activeColor: '#333333',
      inactiveColor: '#aaaaaa',
      tabStyle: 'minimal',
      tabBorder: false,
      tabBorderColor: '#eeeeee',
      sectionBorder: false,
      sectionBorderColor: '#eeeeee',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      contentFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    elegant: {
      bgColor: '#FAF5EF',
      activeColor: '#8B7355',
      inactiveColor: '#b0a090',
      tabStyle: 'concrete',
      tabBorder: true,
      tabBorderColor: '#d4c9b8',
      sectionBorder: false,
      sectionBorderColor: '#d4c9b8',
      fontFamily: '"Cormorant Garamond", "Cormorant", Georgia, serif',
      contentFont: '"Cormorant Garamond", "Cormorant", Georgia, serif',
    },
    bold: {
      bgColor: '#1a1a1a',
      activeColor: '#ffffff',
      inactiveColor: '#666666',
      tabStyle: 'browser',
      tabBorder: true,
      tabBorderColor: '#333333',
      sectionBorder: false,
      sectionBorderColor: '#333333',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      contentFont: '"Helvetica Neue", Arial, sans-serif',
    },
  };

  // ========================================
  // CONFIGURATION
  // ========================================

  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    const presetName = params.get('preset') || 'default';
    const preset = PRESETS[presetName] || PRESETS.default;

    const getBool = (key, def) => {
      const v = params.get(key);
      if (v === null) return def;
      return v !== 'false';
    };

    const bgColor = fixColor(params.get('bgColor') || preset.bgColor.replace('#', ''));

    return {
      // Targeting
      sectionIndex: params.get('sectionIndex') ? parseInt(params.get('sectionIndex'), 10) : null,
      sectionId: params.get('sectionId') || null,
      divId: params.get('divId') || null,
      ulId: params.get('ulId') || null,

      // Preset
      preset: presetName,

      // Appearance
      bgColor,
      contentBgColor: fixColor(params.get('contentBgColor') || '') || bgColor,
      activeColor: fixColor(params.get('activeColor') || preset.activeColor.replace('#', '')),
      inactiveColor: fixColor(params.get('inactiveColor') || preset.inactiveColor.replace('#', '')),
      fontFamily: params.get('fontFamily') || preset.fontFamily,
      contentFont: params.get('contentFont') || preset.contentFont,
      // Tab bar
      tabAlign: params.get('tabAlign') || 'left',
      tabStyle: params.get('tabStyle') || preset.tabStyle || 'concrete',
      tabGap: parseInt(params.get('tabGap') || '6', 10),
      tabFontSize: parseInt(params.get('tabFontSize') || '14', 10),
      tabFontColor: fixColor(params.get('tabFontColor') || '') || null,
      tabFontFamily: params.get('tabFontFamily') || null,
      tabTransform: params.get('tabTransform') || 'uppercase',
      tabLetterSpacing: params.get('tabLetterSpacing') || '0.15em',
      tabBorder: getBool('tabBorder', preset.tabBorder),
      tabBorderColor: fixColor(params.get('tabBorderColor') || preset.tabBorderColor.replace('#', '')),

      // Content panel
      contentPadding: parseInt(params.get('contentPadding') || '60', 10),
      imagePosition: params.get('imagePosition') || 'left',
      imageWidth: parseInt(
        params.get('photoSize') || params.get('imageWidth') || '45',
        10
      ),
      imageAspect: params.get('imageAspect') || 'auto',
      imagePadding: parseInt(params.get('imagePadding') || '16', 10),
      headingTag: params.get('headingTag') || 'h2',
      headingSize: parseInt(
        params.get('titleFontSize') || params.get('headingSize') || '28',
        10
      ),
      titleFontColor: fixColor(params.get('titleFontColor') || '') || null,
      titleFontFamily: params.get('titleFontFamily') || null,
      subtitleSize: parseInt(params.get('subtitleSize') || '13', 10),
      bodySize: parseInt(
        params.get('descFontSize') || params.get('bodySize') || '15',
        10
      ),
      descFontColor: fixColor(params.get('descFontColor') || '') || null,
      descFontFamily: params.get('descFontFamily') || null,

      // Animation
      animationType: params.get('animationType') || 'fade',
      animationSpeed: parseInt(params.get('animationSpeed') || '400', 10),

      // Section
      sectionBorder: getBool('sectionBorder', preset.sectionBorder),
      sectionBorderColor: fixColor(
        params.get('borderColor') ||
          params.get('sectionBorderColor') ||
          preset.sectionBorderColor.replace('#', '')
      ),
      sectionRadius: parseInt(params.get('sectionRadius') || '0', 10),

      // Debug
      debug: getBool('debug', false),
    };
  }

  const config = getScriptParams();

  function dbg(...args) {
    if (config.debug) console.log(`[${PLUGIN_NAME}]`, ...args);
  }

  dbg('Config:', config);

  // ========================================
  // TARGET RESOLUTION
  // ========================================

  function findTarget() {
    // ulId — target <ul> directly
    if (config.ulId) {
      const el = document.getElementById(config.ulId);
      if (el) {
        dbg('Target found via ulId:', el);
        return el;
      }
      console.warn(`[${PLUGIN_NAME}] ulId "${config.ulId}" not found`);
      return null;
    }

    // divId — target wrapper div
    if (config.divId) {
      const el = document.getElementById(config.divId);
      if (el) {
        dbg('Target found via divId:', el);
        return el;
      }
      console.warn(`[${PLUGIN_NAME}] divId "${config.divId}" not found`);
      return null;
    }

    // sectionId — target by data-section-id
    if (config.sectionId) {
      const el = document.querySelector(`[data-section-id="${config.sectionId}"]`);
      if (el) {
        dbg('Target found via sectionId:', el);
        return el;
      }
      console.warn(`[${PLUGIN_NAME}] sectionId "${config.sectionId}" not found`);
      return null;
    }

    // sectionIndex — target by index (1-based)
    if (config.sectionIndex !== null) {
      const sections = document.querySelectorAll(
        'section[data-section-id], .page-section, [data-section-type]'
      );
      const idx = config.sectionIndex - 1;
      if (sections[idx]) {
        dbg('Target found via sectionIndex:', sections[idx]);
        return sections[idx];
      }
      console.warn(`[${PLUGIN_NAME}] sectionIndex ${config.sectionIndex} not found (found ${sections.length} sections)`);
      return null;
    }

    console.warn(`[${PLUGIN_NAME}] No targeting parameter provided. Use sectionIndex, sectionId, divId, or ulId.`);
    return null;
  }

  // ========================================
  // DATA EXTRACTION
  // ========================================

  function extractItems(target) {
    const items = [];

    // Mode 1: Direct <ul> with data attributes
    if (target.tagName === 'UL') {
      dbg('Extracting from <ul> with data attributes');
      target.querySelectorAll('li').forEach((li, i) => {
        const title = li.dataset.title || li.querySelector('[data-title]')?.dataset.title || `Tab ${i + 1}`;
        const subtitle = li.dataset.subtitle || li.querySelector('[data-subtitle]')?.dataset.subtitle || '';
        const image = li.dataset.image || li.querySelector('[data-image]')?.dataset.image || li.querySelector('img')?.src || '';
        const link = li.dataset.link || li.querySelector('[data-link]')?.dataset.link || li.querySelector('a')?.href || '';
        const body = li.dataset.body || li.querySelector('[data-body]')?.dataset.body || li.querySelector('p')?.innerHTML || '';
        items.push({ title, subtitle, image, link, body });
      });
      return items;
    }

    // Mode 2: Squarespace Summary Block items
    const summaryItems = target.querySelectorAll('.summary-item');
    if (summaryItems.length) {
      dbg('Extracting from Summary Block items');
      summaryItems.forEach(item => {
        const titleEl = item.querySelector('.summary-title, .summary-title-link');
        const imgEl = item.querySelector('.summary-thumbnail img, .summary-item-thumbnail img, img');
        const excerptEl = item.querySelector('.summary-excerpt, .summary-excerpt-block-wrapper');
        const linkEl = item.querySelector('a');
        items.push({
          title: titleEl ? titleEl.textContent.trim() : '',
          subtitle: '',
          image: imgEl ? (imgEl.dataset.src || imgEl.src) : '',
          link: linkEl ? linkEl.href : '',
          body: excerptEl ? excerptEl.innerHTML : '',
        });
      });
      return items;
    }

    // Mode 3: Squarespace 7.1 List Section items
    const listItems = target.querySelectorAll('.user-items-list-item-container, .list-item');
    if (listItems.length) {
      dbg('Extracting from 7.1 List Section items');
      listItems.forEach(item => {
        const titleEl = item.querySelector('h1, h2, h3, .list-item-content__title');
        const imgEl = item.querySelector('img');
        const bodyEl = item.querySelector('p, .list-item-content__description');
        const linkEl = item.querySelector('a');
        items.push({
          title: titleEl ? titleEl.textContent.trim() : '',
          subtitle: '',
          image: imgEl ? (imgEl.dataset.src || imgEl.src) : '',
          link: linkEl ? linkEl.href : '',
          body: bodyEl ? bodyEl.innerHTML : '',
        });
      });
      return items;
    }

    // Mode 4: Heading groups within a section (h2/h3 + following p/img)
    const headings = target.querySelectorAll('h2, h3');
    if (headings.length) {
      dbg('Extracting from heading groups');
      headings.forEach(h => {
        let body = '';
        let image = '';
        let subtitle = '';
        let next = h.nextElementSibling;
        while (next && !['H2', 'H3'].includes(next.tagName)) {
          if (next.tagName === 'IMG') {
            image = next.src || next.dataset.src || '';
          } else if (next.tagName === 'P') {
            if (!subtitle) {
              subtitle = next.textContent.trim();
            } else {
              body += next.outerHTML;
            }
          } else {
            body += next.outerHTML;
          }
          next = next.nextElementSibling;
        }
        items.push({
          title: h.textContent.trim(),
          subtitle,
          image,
          link: '',
          body,
        });
      });
      return items;
    }

    dbg('No extractable items found in target');
    return items;
  }

  // ========================================
  // IMAGE ASPECT RATIO HELPERS
  // ========================================

  function getAspectPaddingTop(aspect) {
    switch (aspect) {
      case 'square': return '100%';
      case '4:3': return '75%';
      case '3:2': return '66.67%';
      case '16:9': return '56.25%';
      default: return null; // auto — don't fix
    }
  }

  // ========================================
  // STYLES INJECTION
  // ========================================

  function injectStyles() {
    const styleId = 'anavo-tabbed-content-styles';
    if (document.getElementById(styleId)) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = prefersReducedMotion ? 0 : config.animationSpeed;

    const imageFlexOrder = config.imagePosition === 'right' ? 2 : 1;
    const contentFlexOrder = config.imagePosition === 'right' ? 1 : 2;
    const aspectPaddingTop = getAspectPaddingTop(config.imageAspect);

    const imageWrapStyles = aspectPaddingTop
      ? `position: relative; padding-top: ${aspectPaddingTop};`
      : '';
    const imageInnerStyles = aspectPaddingTop
      ? `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;`
      : `width: 100%; height: auto; display: block; object-fit: cover;`;

    // ---- Tab style variables ----
    const isConcreteOrBrowser = config.tabStyle === 'concrete' || config.tabStyle === 'browser';
    const contentBgColor = config.contentBgColor;

    // Tablist alignment for concrete/browser (tabs sit at the bottom of the tablist)
    const tablistBorderLine = isConcreteOrBrowser
      ? `align-items: flex-end;`
      : '';

    // Tab border/background/radius per style
    let tabBorderCSS, activeTabBorderCSS;
    if (config.tabStyle === 'browser') {
      tabBorderCSS = `
  border: 1px solid ${config.tabBorderColor};
  border-radius: 6px 6px 0 0;
  margin-bottom: -1px;
  background: transparent;
  z-index: 2;`;
      activeTabBorderCSS = `
  border-bottom-color: ${contentBgColor};
  background: ${contentBgColor};
  z-index: 3;`;
    } else if (config.tabStyle === 'minimal') {
      tabBorderCSS = `
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;`;
      activeTabBorderCSS = `
  border-bottom-color: ${config.activeColor};`;
    } else {
      // concrete (default)
      tabBorderCSS = `
  border: 1px solid ${config.tabBorderColor};
  margin-bottom: -1px;
  background: transparent;
  z-index: 2;`;
      activeTabBorderCSS = `
  border-bottom-color: ${contentBgColor};
  background: ${contentBgColor};
  z-index: 3;`;
    }

    // Tab padding — concrete/browser are more compact
    const tabPadding = isConcreteOrBrowser ? '8px 16px' : '10px 16px';

    // Content panel border + background — concrete/browser use the panel's top border to create the folder-tab line
    const panelsBorderCSS = isConcreteOrBrowser
      ? `border: 1px solid ${config.tabBorderColor};
  background: ${contentBgColor};
  z-index: 1;`
      : '';

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
/* =============================================
   ANAVO TABBED CONTENT v${PLUGIN_VERSION}
   ============================================= */

.anavo-tc-wrapper {
  background: transparent;
  font-family: ${config.fontFamily};
  border: ${config.sectionBorder ? `1px solid ${config.sectionBorderColor}` : 'none'};
  border-radius: ${config.sectionRadius}px;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
}

/* ---- Tab Bar ---- */
.anavo-tc-tablist {
  display: flex;
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: ${config.tabGap}px;
  background: transparent;
  justify-content: ${config.tabAlign === 'center' ? 'center' : config.tabAlign === 'right' ? 'flex-end' : 'flex-start'};
  position: relative;
  z-index: 2;
  ${tablistBorderLine}
}

.anavo-tc-tablist::-webkit-scrollbar { display: none; }

.anavo-tc-tab {
  position: relative;
  padding: ${tabPadding};
  cursor: pointer;
  flex-shrink: 0;
  font-size: ${config.tabFontSize}px;
  font-family: ${config.tabFontFamily || config.fontFamily};
  font-weight: 400;
  text-transform: ${config.tabTransform};
  letter-spacing: ${config.tabLetterSpacing};
  color: ${config.tabFontColor || config.inactiveColor};
  outline: none;
  transition: color ${speed}ms ease;
  white-space: nowrap;
  -webkit-appearance: none;
  appearance: none;${tabBorderCSS}
}

.anavo-tc-tab[aria-selected="true"] {
  color: ${config.activeColor};
  font-weight: 700;${activeTabBorderCSS}
}

.anavo-tc-tab:focus-visible {
  outline: 2px solid ${config.activeColor};
  outline-offset: -2px;
}

/* ---- Panels ---- */
.anavo-tc-panels {
  position: relative;
  ${panelsBorderCSS}
}

.anavo-tc-panel {
  display: none;
}

.anavo-tc-panel.anavo-tc-panel--active {
  display: flex;
  flex-direction: ${config.imagePosition === 'right' ? 'row-reverse' : 'row'};
  align-items: stretch;
  min-height: 300px;
}

/* Fade animation */
${config.animationType === 'fade' ? `
@keyframes anavo-tc-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.anavo-tc-panel.anavo-tc-panel--active {
  animation: anavo-tc-fade-in ${speed}ms ease forwards;
}
` : ''}

/* Slide animation */
${config.animationType === 'slide' ? `
@keyframes anavo-tc-slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
.anavo-tc-panel.anavo-tc-panel--active {
  animation: anavo-tc-slide-in ${speed}ms ease forwards;
}
` : ''}

/* ---- Image Column ---- */
.anavo-tc-image-col {
  flex: 0 0 ${config.imageWidth}%;
  max-width: ${config.imageWidth}%;
  order: ${imageFlexOrder};
  overflow: hidden;
}

.anavo-tc-image-wrap {
  ${imageWrapStyles}
  width: 100%;
  height: 100%;
  padding: ${config.imagePadding}px;
  box-sizing: border-box;
}

.anavo-tc-image-wrap img {
  ${imageInnerStyles}
}

.anavo-tc-image-placeholder {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: ${config.activeColor}22;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${config.inactiveColor};
  font-size: 48px;
}

/* ---- Content Column ---- */
.anavo-tc-content-col {
  flex: 1;
  order: ${contentFlexOrder};
  padding: ${config.contentPadding}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: ${config.contentFont};
}

.anavo-tc-content-col .anavo-tc-heading {
  margin: 0 0 12px;
  font-size: ${config.headingSize}px;
  font-family: ${config.titleFontFamily || config.contentFont};
  color: ${config.titleFontColor || config.activeColor};
  font-weight: 600;
  line-height: 1.2;
}

.anavo-tc-content-col .anavo-tc-subtitle {
  margin: 0 0 20px;
  font-size: ${config.subtitleSize}px;
  font-family: ${config.contentFont};
  color: ${config.inactiveColor};
  text-transform: ${config.tabTransform};
  letter-spacing: ${config.tabLetterSpacing};
  font-weight: 400;
}

.anavo-tc-content-col .anavo-tc-body {
  font-size: ${config.bodySize}px;
  font-family: ${config.descFontFamily || config.contentFont};
  color: ${config.descFontColor || config.inactiveColor};
  line-height: 1.8;
  margin: 0;
}

.anavo-tc-content-col .anavo-tc-body p {
  margin: 0 0 1em;
}

.anavo-tc-content-col .anavo-tc-link {
  display: inline-block;
  margin-top: 24px;
  font-size: ${config.subtitleSize}px;
  font-family: ${config.contentFont};
  color: ${config.activeColor};
  text-transform: ${config.tabTransform};
  letter-spacing: ${config.tabLetterSpacing};
  text-decoration: none;
  border-bottom: 1px solid ${config.activeColor};
  padding-bottom: 2px;
  transition: opacity ${speed}ms ease;
}

.anavo-tc-content-col .anavo-tc-link:hover {
  opacity: 0.7;
}

/* ---- Responsive: Tablet ---- */
@media (max-width: 900px) {
  .anavo-tc-content-col {
    padding: ${Math.round(config.contentPadding * 0.65)}px;
  }
  .anavo-tc-content-col .anavo-tc-heading {
    font-size: ${Math.round(config.headingSize * 0.85)}px;
  }
}

/* ---- Responsive: Mobile ---- */
@media (max-width: 768px) {
  .anavo-tc-tablist {
    gap: ${Math.max(config.tabGap - 4, 2)}px;
  }
  .anavo-tc-tab {
    padding: 8px 14px;
    font-size: ${Math.max(config.tabFontSize - 1, 11)}px;
  }
  .anavo-tc-panel.anavo-tc-panel--active {
    flex-direction: column;
  }
  .anavo-tc-image-col {
    flex: 0 0 100%;
    max-width: 100%;
    order: 1;
  }
  .anavo-tc-image-wrap {
    padding-top: 60%;
    position: relative;
  }
  .anavo-tc-image-wrap img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .anavo-tc-content-col {
    order: 2;
    flex: 0 0 100%;
    max-width: 100%;
    padding: ${Math.round(config.contentPadding * 0.5)}px;
  }
}

/* ---- Responsive: Small Mobile ---- */
@media (max-width: 480px) {
  .anavo-tc-tab {
    padding: ${isConcreteOrBrowser ? '6px 12px' : '10px 12px'};
    font-size: ${Math.max(config.tabFontSize - 2, 10)}px;
    letter-spacing: 0.08em;
  }
  .anavo-tc-content-col {
    padding: 28px 20px;
  }
}

/* ---- Reduced Motion ---- */
@media (prefers-reduced-motion: reduce) {
  .anavo-tc-tab,
  .anavo-tc-link {
    transition: none !important;
  }
  .anavo-tc-panel.anavo-tc-panel--active {
    animation: none !important;
  }
}
`;
    document.head.appendChild(styles);
    dbg('Styles injected');
  }

  // ========================================
  // BUILD UI
  // ========================================

  function buildUI(items) {
    const uid = 'anavo-tc-' + Math.random().toString(36).slice(2, 8);

    const wrapper = document.createElement('div');
    wrapper.className = 'anavo-tc-wrapper';
    wrapper.setAttribute('id', uid);

    // Tab bar
    const tablist = document.createElement('div');
    tablist.className = 'anavo-tc-tablist';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Content tabs');

    // Panels container
    const panelsDiv = document.createElement('div');
    panelsDiv.className = 'anavo-tc-panels';

    items.forEach((item, i) => {
      const tabId = `${uid}-tab-${i}`;
      const panelId = `${uid}-panel-${i}`;

      // --- Tab button ---
      const btn = document.createElement('button');
      btn.className = 'anavo-tc-tab';
      btn.id = tabId;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      btn.textContent = escapeHtml(item.title);

      tablist.appendChild(btn);

      // --- Panel ---
      const panel = document.createElement('div');
      panel.className = 'anavo-tc-panel' + (i === 0 ? ' anavo-tc-panel--active' : '');
      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      if (i !== 0) panel.hidden = true;

      // Image column
      const imageCol = document.createElement('div');
      imageCol.className = 'anavo-tc-image-col';

      if (item.image) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'anavo-tc-image-wrap';
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = escapeHtml(item.title);
        img.loading = 'lazy';
        imgWrap.appendChild(img);
        imageCol.appendChild(imgWrap);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'anavo-tc-image-placeholder';
        placeholder.textContent = '📷';
        imageCol.appendChild(placeholder);
      }

      // Content column
      const contentCol = document.createElement('div');
      contentCol.className = 'anavo-tc-content-col';

      const HTag = ['h2', 'h3', 'h4'].includes(config.headingTag) ? config.headingTag : 'h2';
      const heading = document.createElement(HTag);
      heading.className = 'anavo-tc-heading';
      heading.textContent = item.title;
      contentCol.appendChild(heading);

      if (item.subtitle) {
        const subtitle = document.createElement('p');
        subtitle.className = 'anavo-tc-subtitle';
        subtitle.textContent = item.subtitle;
        contentCol.appendChild(subtitle);
      }

      if (item.body) {
        const body = document.createElement('div');
        body.className = 'anavo-tc-body';
        body.innerHTML = item.body;
        contentCol.appendChild(body);
      }

      if (item.link) {
        const link = document.createElement('a');
        link.className = 'anavo-tc-link';
        link.href = item.link;
        link.textContent = 'Learn More';
        contentCol.appendChild(link);
      }

      panel.appendChild(imageCol);
      panel.appendChild(contentCol);
      panelsDiv.appendChild(panel);
    });

    wrapper.appendChild(tablist);
    wrapper.appendChild(panelsDiv);

    return wrapper;
  }

  // ========================================
  // TAB ACTIVATION
  // ========================================

  function activateTab(wrapper, index) {
    const tabs = wrapper.querySelectorAll('.anavo-tc-tab');
    const panels = wrapper.querySelectorAll('.anavo-tc-panel');

    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });

    panels.forEach((panel, i) => {
      const active = i === index;
      if (active) {
        panel.removeAttribute('hidden');
        panel.classList.add('anavo-tc-panel--active');
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('anavo-tc-panel--active');
      }
    });
  }

  // ========================================
  // EVENTS
  // ========================================

  function initEvents(wrapper) {
    const tabs = wrapper.querySelectorAll('.anavo-tc-tab');

    tabs.forEach((tab, i) => {
      // Hover
      tab.addEventListener('mouseenter', () => activateTab(wrapper, i));

      // Click
      tab.addEventListener('click', () => {
        activateTab(wrapper, i);
        tab.focus();
      });

      // Keyboard navigation (ARIA pattern)
      tab.addEventListener('keydown', e => {
        const tabsArr = Array.from(tabs);
        let newIndex = i;

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            newIndex = (i + 1) % tabsArr.length;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            newIndex = (i - 1 + tabsArr.length) % tabsArr.length;
            break;
          case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            e.preventDefault();
            newIndex = tabsArr.length - 1;
            break;
          default:
            return;
        }

        activateTab(wrapper, newIndex);
        tabsArr[newIndex].focus();
      });
    });
  }

  // ========================================
  // LICENSING
  // ========================================

  function loadLicensing() {
    setTimeout(() => {
      try {
        const licScript = document.createElement('script');
        const base = currentScript.src.replace(/[^/]+$/, '');
        licScript.src = base + '../_shared/licensing.min.js';
        licScript.onload = () => {
          if (window.AnavoLicenseManager) {
            const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION);
            lm.init();
          }
        };
        document.head.appendChild(licScript);
      } catch (_e) {
        // licensing is non-blocking
      }
    }, 1500);
  }

  // ========================================
  // INIT
  // ========================================

  function init() {
    try {
      const target = findTarget();
      if (!target) return;

      const items = extractItems(target);
      if (!items.length) {
        console.warn(`[${PLUGIN_NAME}] No items could be extracted from the target element.`);
        return;
      }

      dbg(`Extracted ${items.length} items`);

      injectStyles();

      const ui = buildUI(items);
      initEvents(ui);

      // Hide original element and insert UI after it
      target.style.display = 'none';
      target.parentNode.insertBefore(ui, target.nextSibling);

      loadLicensing();

      console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
    } catch (err) {
      console.error(`[${PLUGIN_NAME}] Error:`, err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
