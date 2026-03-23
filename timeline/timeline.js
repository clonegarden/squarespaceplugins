/**
 * =======================================
 * TIMELINE - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Auto-renders inside any section with <h1>timeline</h1> (case-insensitive)
 * or a <div id="timeline">. Data can be supplied via ?data=JSON or
 * auto-extracted from the target section.
 *
 * INSTALLATION (Settings → Advanced → Code Injection → Footer):
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/timeline/timeline.min.js"></script>
 *
 * QUICK EXAMPLES:
 * Vertical (default):
 * <script src="...timeline.min.js"></script>
 * Horizontal:
 * <script src="...timeline.min.js?layout=horizontal"></script>
 * Alternate (zigzag):
 * <script src="...timeline.min.js?layout=alternate&preset=elegant"></script>
 * With inline JSON data:
 * <script src='...timeline.min.js?data=[{"year":"2020","title":"Founded","body":"Started the journey."}]'></script>
 *
 * TARGETING PARAMETERS (choose one):
 * ?sectionIndex=N   - Target the Nth page section (1-based)
 * ?sectionId=X      - Target section by Squarespace data-section-id
 * ?divId=X          - Target a <div> wrapper by id
 * (auto)            - Detects <div id="timeline"> or any section with <h1>timeline</h1>
 *
 * LAYOUT:
 * ?layout=vertical    - Single column, line on left (default)
 * ?layout=horizontal  - Horizontal scrollable row
 * ?layout=alternate   - Zigzag (items alternate left/right of center line)
 * ?offset=60          - Side offset in px for alternate layout (default: 60)
 *
 * DATA:
 * ?data=[...]         - URL-encoded JSON array of timeline item objects
 *   Each item: { year, title, body, image, side }
 * (auto)              - Auto-parsed from .timeline-item, <ul data-*>, Summary Blocks, or h2/h3 groups
 *
 * APPEARANCE:
 * ?preset=default     - Style preset: default / minimal / elegant / bold / dark
 * ?lineColor=8B7355   - Line color hex
 * ?lineWidth=3        - Line width in px
 * ?lineStyle=solid    - Line style: solid / dashed / dotted
 * ?dotColor=8B7355    - Dot fill color hex
 * ?dotSize=16         - Dot diameter in px
 * ?dotBorderColor=    - Dot border color (defaults to cardBg)
 * ?glowColor=         - Glow color hex (defaults to lineColor)
 * ?glowSize=8         - Glow spread radius in px
 * ?bgColor=           - Wrapper background color
 * ?cardBg=ffffff      - Card background color hex
 * ?accentColor=       - Title / heading color hex
 * ?textColor=444444   - Body text color hex
 * ?yearColor=         - Year label color hex
 * ?cardRadius=8       - Card border-radius in px
 * ?cardShadow=true    - Show card drop-shadow
 * ?cardPadding=24     - Card padding in px
 *
 * TYPOGRAPHY:
 * ?fontFamily=        - Font family for all text
 * ?headingSize=22     - Title font size in px
 * ?bodySize=15        - Body font size in px
 * ?yearSize=13        - Year label font size in px
 *
 * SPACING:
 * ?itemGap=48         - Gap between items in px
 *
 * ANIMATION:
 * ?drawLine=true      - Animate the line drawing on scroll (default: true)
 * ?scrollSync=true    - Sync line draw to scroll position (false = one-time draw on reveal)
 * ?animationType=fade - Item reveal type: fade / slide / none
 * ?animationSpeed=400 - Animation duration in ms
 *
 * MISC:
 * ?debug=false        - Enable verbose console logging
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'Timeline';

  console.log(`⏳ ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

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

  // ========================================
  // PRESETS
  // ========================================

  const PRESETS = {
    default: {
      lineColor: '#8B7355',
      dotColor: '#8B7355',
      accentColor: '#8B7355',
      bgColor: 'transparent',
      cardBg: '#ffffff',
      textColor: '#444444',
      yearColor: '#8B7355',
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
    minimal: {
      lineColor: '#cccccc',
      dotColor: '#333333',
      accentColor: '#333333',
      bgColor: 'transparent',
      cardBg: '#ffffff',
      textColor: '#444444',
      yearColor: '#999999',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    elegant: {
      lineColor: '#C9A96E',
      dotColor: '#C9A96E',
      accentColor: '#8B6914',
      bgColor: 'transparent',
      cardBg: '#FFFDF8',
      textColor: '#2c2416',
      yearColor: '#C9A96E',
      fontFamily: '"Cormorant Garamond", "Cormorant", Georgia, serif',
    },
    bold: {
      lineColor: '#ffffff',
      dotColor: '#ffffff',
      accentColor: '#f0f0f0',
      bgColor: 'transparent',
      cardBg: '#2a2a2a',
      textColor: '#dddddd',
      yearColor: '#aaaaaa',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
    },
    dark: {
      lineColor: '#4a9eff',
      dotColor: '#4a9eff',
      accentColor: '#4a9eff',
      bgColor: 'transparent',
      cardBg: '#1a2332',
      textColor: '#c8d8e8',
      yearColor: '#4a9eff',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
    },
  };

  // ========================================
  // CONFIGURATION
  // ========================================

  function getScriptParams() {
    const url = new URL(currentScript.src);
    const params = new URLSearchParams(url.search);

    const presetName = params.get('preset') || 'default';
    const preset = PRESETS[presetName] || PRESETS.default;

    const getBool = (key, def) => {
      const v = params.get(key);
      return v === null ? def : v !== 'false';
    };

    const getInt = (key, def) => {
      const v = params.get(key);
      return v !== null ? parseInt(v, 10) : def;
    };

    const getColor = (key, fallback) => {
      const v = params.get(key);
      return v ? fixColor(v) : fixColor(fallback.replace('#', ''));
    };

    let data = null;
    const rawData = params.get('data');
    if (rawData) {
      try {
        data = JSON.parse(decodeURIComponent(rawData));
      } catch (_e) {
        console.warn(`[${PLUGIN_NAME}] Invalid ?data JSON — will auto-parse section.`);
      }
    }

    return {
      // Targeting
      sectionIndex: params.get('sectionIndex') !== null ? getInt('sectionIndex', null) : null,
      sectionId: params.get('sectionId') || null,
      divId: params.get('divId') || null,

      // Layout
      layout: params.get('layout') || 'vertical',
      offset: getInt('offset', 60),

      // Data
      data,

      // Preset
      preset: presetName,

      // Line
      lineColor: getColor('lineColor', preset.lineColor),
      lineWidth: getInt('lineWidth', 3),
      lineStyle: params.get('lineStyle') || 'solid',

      // Dot
      dotColor: getColor('dotColor', preset.dotColor),
      dotSize: getInt('dotSize', 16),
      dotBorderColor: params.get('dotBorderColor') ? fixColor(params.get('dotBorderColor')) : null,

      // Glow
      glowColor: params.get('glowColor') ? fixColor(params.get('glowColor')) : null,
      glowSize: getInt('glowSize', 8),

      // Colors
      bgColor: getColor('bgColor', preset.bgColor),
      cardBg: getColor('cardBg', preset.cardBg),
      accentColor: getColor('accentColor', preset.accentColor),
      textColor: getColor('textColor', preset.textColor),
      yearColor: getColor('yearColor', preset.yearColor),

      // Card
      cardRadius: getInt('cardRadius', 8),
      cardShadow: getBool('cardShadow', true),
      cardPadding: getInt('cardPadding', 24),

      // Typography
      fontFamily: params.get('fontFamily') || preset.fontFamily,
      headingSize: getInt('headingSize', 22),
      bodySize: getInt('bodySize', 15),
      yearSize: getInt('yearSize', 13),

      // Spacing
      itemGap: getInt('itemGap', 48),

      // Animation
      drawLine: getBool('drawLine', true),
      scrollSync: getBool('scrollSync', true),
      animationType: params.get('animationType') || 'fade',
      animationSpeed: getInt('animationSpeed', 400),

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
    // 1. divId param
    if (config.divId) {
      const el = document.getElementById(config.divId);
      if (el) {
        dbg('Target via divId:', el);
        return el;
      }
      console.warn(`[${PLUGIN_NAME}] divId "${config.divId}" not found`);
      return null;
    }

    // 2. sectionId param
    if (config.sectionId) {
      const el = document.querySelector(`[data-section-id="${config.sectionId}"]`);
      if (el) {
        dbg('Target via sectionId:', el);
        return el;
      }
      console.warn(`[${PLUGIN_NAME}] sectionId "${config.sectionId}" not found`);
      return null;
    }

    // 3. sectionIndex param
    if (config.sectionIndex !== null) {
      const sections = document.querySelectorAll(
        'section[data-section-id], .page-section, [data-section-type]'
      );
      const el = sections[config.sectionIndex - 1];
      if (el) {
        dbg('Target via sectionIndex:', el);
        return el;
      }
      console.warn(
        `[${PLUGIN_NAME}] sectionIndex ${config.sectionIndex} not found (${sections.length} sections found)`
      );
      return null;
    }

    // 4. Auto-detect: <div id="timeline"> has highest priority
    const byId = document.getElementById('timeline');
    if (byId) {
      dbg('Target via #timeline element');
      return byId;
    }

    // 5. Auto-detect: first section containing <h1>timeline</h1>
    const allSections = document.querySelectorAll(
      'section[data-section-id], [data-section-type], .page-section, section'
    );
    for (const section of allSections) {
      const h1s = section.querySelectorAll('h1');
      for (const h1 of h1s) {
        if (h1.textContent.trim().toLowerCase() === 'timeline') {
          dbg('Target via H1 "timeline":', section);
          return section;
        }
      }
    }

    console.warn(
      `[${PLUGIN_NAME}] No target found. Add <div id="timeline">, ` +
        'an <h1>timeline</h1> in a section, or use ?divId / ?sectionId / ?sectionIndex params.'
    );
    return null;
  }

  // ========================================
  // DATA EXTRACTION
  // ========================================

  function extractItems(target) {
    // 0. Use ?data param if provided
    if (config.data && Array.isArray(config.data)) {
      dbg('Using ?data param:', config.data.length, 'items');
      return config.data.map((item, i) => ({
        year: String(item.year || item.date || ''),
        title: String(item.title || `Item ${i + 1}`),
        body: String(item.body || item.description || item.content || ''),
        image: String(item.image || item.img || ''),
        side: item.side || null,
      }));
    }

    const items = [];

    // 1. .timeline-item elements (explicit markup)
    const tlItems = target.querySelectorAll('.timeline-item');
    if (tlItems.length) {
      dbg('Extracting from .timeline-item elements');
      tlItems.forEach((el, i) => {
        const yearEl = el.querySelector('[data-year], .timeline-year, time');
        const titleEl = el.querySelector('[data-title], .timeline-title, h2, h3, h4');
        const bodyEl = el.querySelector('[data-body], .timeline-body, p');
        const imgEl = el.querySelector('img');
        items.push({
          year: el.dataset.year || (yearEl ? yearEl.textContent.trim() : ''),
          title: el.dataset.title || (titleEl ? titleEl.textContent.trim() : `Item ${i + 1}`),
          body: el.dataset.body || (bodyEl ? bodyEl.innerHTML : ''),
          image: el.dataset.image || (imgEl ? imgEl.dataset.src || imgEl.src : ''),
          side: el.dataset.side || null,
        });
      });
      return items;
    }

    // 2. <ul><li> with data-year / data-title attributes
    const ul = target.querySelector('ul');
    if (ul) {
      const lis = ul.querySelectorAll('li');
      if (lis.length && (lis[0].dataset.year || lis[0].dataset.title)) {
        dbg('Extracting from <ul><li> data attributes');
        lis.forEach((li, i) => {
          const imgEl = li.querySelector('img');
          const pEl = li.querySelector('p');
          items.push({
            year: li.dataset.year || li.dataset.date || '',
            title: li.dataset.title || `Item ${i + 1}`,
            body: li.dataset.body || (pEl ? pEl.innerHTML : ''),
            image: li.dataset.image || (imgEl ? imgEl.dataset.src || imgEl.src : ''),
            side: li.dataset.side || null,
          });
        });
        return items;
      }
    }

    // 3. Squarespace Summary Block items
    const summaryItems = target.querySelectorAll('.summary-item');
    if (summaryItems.length) {
      dbg('Extracting from Squarespace Summary Block');
      summaryItems.forEach((item, i) => {
        const titleEl = item.querySelector('.summary-title, .summary-title-link');
        const imgEl = item.querySelector('img');
        const excerptEl = item.querySelector(
          '.summary-excerpt, .summary-excerpt-block-wrapper'
        );
        const metaEl = item.querySelector('.summary-metadata-item--date, time');
        items.push({
          year: metaEl ? metaEl.textContent.trim() : '',
          title: titleEl ? titleEl.textContent.trim() : `Item ${i + 1}`,
          body: excerptEl ? excerptEl.innerHTML : '',
          image: imgEl ? imgEl.dataset.src || imgEl.src : '',
          side: null,
        });
      });
      return items;
    }

    // 4. Squarespace 7.1 List Section items
    const listItems = target.querySelectorAll(
      '.user-items-list-item-container, .list-item'
    );
    if (listItems.length) {
      dbg('Extracting from Squarespace 7.1 List Section');
      listItems.forEach((item, i) => {
        const titleEl = item.querySelector('h1, h2, h3, .list-item-content__title');
        const imgEl = item.querySelector('img');
        const bodyEl = item.querySelector('p, .list-item-content__description');
        items.push({
          year: '',
          title: titleEl ? titleEl.textContent.trim() : `Item ${i + 1}`,
          body: bodyEl ? bodyEl.innerHTML : '',
          image: imgEl ? imgEl.dataset.src || imgEl.src : '',
          side: null,
        });
      });
      return items;
    }

    // 5. Heading groups: h2 / h3 followed by p / img siblings
    const headings = target.querySelectorAll('h2, h3');
    if (headings.length) {
      dbg('Extracting from h2/h3 heading groups');
      headings.forEach(h => {
        let body = '';
        let image = '';
        let year = '';
        let next = h.nextElementSibling;
        while (next && !['H1', 'H2', 'H3'].includes(next.tagName)) {
          if (next.tagName === 'IMG') {
            image = next.src || next.dataset.src || '';
          } else if (next.tagName === 'TIME') {
            year = next.textContent.trim();
          } else {
            body += next.outerHTML;
          }
          next = next.nextElementSibling;
        }
        items.push({ year, title: h.textContent.trim(), body, image, side: null });
      });
      return items;
    }

    return items;
  }

  // ========================================
  // STYLES INJECTION
  // ========================================

  function injectStyles() {
    const styleId = 'anavo-timeline-styles';
    if (document.getElementById(styleId)) return;

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = prefersReducedMotion ? 0 : config.animationSpeed;

    const glowColor = config.glowColor || config.lineColor;
    const dotBorderColor = config.dotBorderColor || config.cardBg;
    const cardShadow = config.cardShadow
      ? '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
      : 'none';

    // ---- Vertical layout geometry ----
    // Line center from wrapper-left edge in vertical mode
    const vertLineX = 24;
    const dotR = Math.round(config.dotSize / 2);
    const vertLC = vertLineX + Math.round(config.lineWidth / 2);
    const cardGap = 12;
    // Padding-left on items list so cards clear the line + dot
    const vertPadLeft = vertLC + dotR + cardGap;
    // Dot's left offset relative to the item (li) — positions dot on the line
    const vertDotLeft = -(config.dotSize + cardGap);

    // ---- Alternate layout geometry ----
    // Gap between the center line and the nearest edge of each card
    const altGap = 20;

    // ---- Horizontal layout geometry ----
    const horizPadTop = dotR + 24 + config.lineWidth;
    const horizLineTop = dotR + 24;

    // ---- Animation initial transforms ----
    const fadeInitial = 'translateY(12px)';
    const slideInitialLeft = 'translateX(-20px)';
    const slideInitialRight = 'translateX(20px)';
    const slideInitialDown = 'translateY(20px)';
    const cardInit =
      config.animationType === 'slide' ? slideInitialLeft : fadeInitial;

    const glowCSS = config.drawLine && !prefersReducedMotion
      ? `
@keyframes anavo-tl-glow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 ${config.glowSize}px ${glowColor}, 0 0 ${config.glowSize * 2}px ${glowColor}66;
  }
  50% {
    opacity: 0.6;
    transform: scale(1.4);
    box-shadow: 0 0 ${config.glowSize * 2}px ${glowColor}, 0 0 ${config.glowSize * 3}px ${glowColor}44;
  }
}
.anavo-tl-line-glow {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${glowColor};
  animation: anavo-tl-glow 1.6s ease-in-out infinite;
  pointer-events: none;
  z-index: 3;
}`
      : '.anavo-tl-line-glow { display: none !important; }';

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `/* =============================================
   ANAVO TIMELINE v${PLUGIN_VERSION}
   ============================================= */

.anavo-tl-wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background: ${config.bgColor};
  font-family: ${config.fontFamily};
  padding: 16px 0 32px;
}

/* ---- LINE ---- */
.anavo-tl-line-track {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.anavo-tl-line-fill {
  position: absolute;
  top: 0;
  left: 0;
  background: ${config.lineColor};
  pointer-events: none;
  transition: ${config.drawLine && !prefersReducedMotion ? 'height 0.15s linear, width 0.15s linear' : 'none'};
  will-change: height, width;
}

${glowCSS}

/* ---- VERTICAL LAYOUT ---- */
.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-line-track {
  left: ${vertLineX}px;
  top: 0;
  bottom: 0;
  width: ${config.lineWidth}px;
  height: 100%;
  background: ${config.lineColor}22;
  overflow: visible;
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-line-fill {
  width: 100%;
  height: 0;
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-line-glow {
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-items {
  list-style: none;
  margin: 0;
  padding: 0 0 0 ${vertPadLeft}px;
  display: flex;
  flex-direction: column;
  gap: ${config.itemGap}px;
  position: relative;
  z-index: 1;
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-item {
  position: relative;
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-dot {
  left: ${vertDotLeft}px;
  top: ${config.cardPadding}px;
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-card {
  transform: ${cardInit};
}

/* ---- ALTERNATE LAYOUT ---- */
.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-line-track {
  left: calc(50% - ${Math.round(config.lineWidth / 2)}px);
  top: 0;
  bottom: 0;
  width: ${config.lineWidth}px;
  height: 100%;
  background: ${config.lineColor}22;
  overflow: visible;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-line-fill {
  width: 100%;
  height: 0;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-line-glow {
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${config.itemGap}px;
  position: relative;
  z-index: 1;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item {
  position: relative;
  width: calc(50% - ${altGap + dotR + Math.round(config.lineWidth / 2)}px);
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--left {
  align-self: flex-start;
  margin-right: auto;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--right {
  align-self: flex-end;
  margin-left: auto;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--left .anavo-tl-dot {
  right: -${altGap + config.dotSize}px;
  left: auto;
  top: ${config.cardPadding}px;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--right .anavo-tl-dot {
  left: -${altGap + config.dotSize}px;
  right: auto;
  top: ${config.cardPadding}px;
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--left .anavo-tl-card {
  transform: ${config.animationType === 'slide' ? slideInitialLeft : fadeInitial};
}

.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--right .anavo-tl-card {
  transform: ${config.animationType === 'slide' ? slideInitialRight : fadeInitial};
}

/* ---- HORIZONTAL LAYOUT ---- */
.anavo-tl-wrapper[data-layout="horizontal"] {
  overflow-x: auto;
  overflow-y: visible;
  scrollbar-width: thin;
  scrollbar-color: ${config.lineColor}44 transparent;
}

.anavo-tl-wrapper[data-layout="horizontal"]::-webkit-scrollbar {
  height: 4px;
}

.anavo-tl-wrapper[data-layout="horizontal"]::-webkit-scrollbar-track {
  background: transparent;
}

.anavo-tl-wrapper[data-layout="horizontal"]::-webkit-scrollbar-thumb {
  background: ${config.lineColor}44;
  border-radius: 2px;
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-line-track {
  top: ${horizLineTop}px;
  left: 0;
  right: 0;
  width: 100%;
  height: ${config.lineWidth}px;
  background: ${config.lineColor}22;
  position: absolute;
  overflow: visible;
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-line-fill {
  height: 100%;
  width: 0;
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-line-glow {
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  left: auto;
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-items {
  list-style: none;
  margin: 0;
  padding: ${horizPadTop}px 24px 8px;
  display: inline-flex;
  flex-direction: row;
  gap: ${config.itemGap}px;
  min-width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-item {
  flex: 0 0 280px;
  position: relative;
  min-width: 180px;
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-dot {
  top: -${altGap + config.dotSize}px;
  left: 50%;
  transform: translateX(-50%) scale(0.6);
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-dot.is-visible {
  transform: translateX(-50%) scale(1);
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-dot:hover {
  transform: translateX(-50%) scale(1.15);
  box-shadow: 0 0 0 4px ${config.dotColor}33;
}

.anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-card {
  transform: ${config.animationType === 'slide' ? slideInitialDown : fadeInitial};
}

/* ---- DOT (shared) ---- */
.anavo-tl-dot {
  position: absolute;
  width: ${config.dotSize}px;
  height: ${config.dotSize}px;
  border-radius: 50%;
  background: ${config.dotColor};
  border: 3px solid ${dotBorderColor};
  box-sizing: border-box;
  z-index: 2;
  transform: scale(0.6);
  transition: transform ${speed}ms ease, box-shadow ${speed}ms ease;
  will-change: transform;
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-dot.is-visible,
.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-dot.is-visible {
  transform: scale(1);
}

.anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-dot:hover,
.anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-dot:hover {
  box-shadow: 0 0 0 4px ${config.dotColor}33;
  transform: scale(1.15);
}

/* ---- CARD (shared) ---- */
.anavo-tl-card {
  background: ${config.cardBg};
  border-radius: ${config.cardRadius}px;
  padding: ${config.cardPadding}px;
  box-shadow: ${cardShadow};
  box-sizing: border-box;
  opacity: 0;
  transition: opacity ${speed}ms ease, transform ${speed}ms ease;
  will-change: opacity, transform;
}

.anavo-tl-card.is-visible {
  opacity: 1 !important;
  transform: none !important;
}

/* ---- YEAR ---- */
.anavo-tl-year {
  font-size: ${config.yearSize}px;
  font-family: ${config.fontFamily};
  color: ${config.yearColor};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 8px;
  display: block;
}

/* ---- TITLE ---- */
.anavo-tl-title {
  font-size: ${config.headingSize}px;
  font-family: ${config.fontFamily};
  color: ${config.accentColor};
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 12px;
}

/* ---- BODY ---- */
.anavo-tl-body {
  font-size: ${config.bodySize}px;
  font-family: ${config.fontFamily};
  color: ${config.textColor};
  line-height: 1.75;
  margin: 0;
}

.anavo-tl-body p {
  margin: 0 0 0.75em;
}

.anavo-tl-body p:last-child {
  margin-bottom: 0;
}

/* ---- IMAGE ---- */
.anavo-tl-img {
  width: 100%;
  height: auto;
  border-radius: ${Math.max(config.cardRadius - 4, 4)}px;
  display: block;
  margin-bottom: 16px;
  object-fit: cover;
}

/* ---- Responsive: Tablet ---- */
@media (max-width: 900px) {
  .anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item {
    width: calc(50% - ${Math.round(altGap / 2) + dotR + Math.round(config.lineWidth / 2)}px);
  }
  .anavo-tl-card {
    padding: ${Math.round(config.cardPadding * 0.85)}px;
  }
  .anavo-tl-title {
    font-size: ${Math.round(config.headingSize * 0.9)}px;
  }
}

/* ---- Responsive: Mobile ---- */
@media (max-width: 768px) {
  /* Vertical: shrink left margin */
  .anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-line-track {
    left: 16px;
  }
  .anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-items {
    padding-left: 44px;
  }
  .anavo-tl-wrapper[data-layout="vertical"] .anavo-tl-dot {
    left: -28px;
  }

  /* Alternate: stack all items on right of a left-side line */
  .anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-line-track {
    left: 16px;
  }
  .anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--left,
  .anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--right {
    width: calc(100% - 44px);
    align-self: flex-start !important;
    margin: 0 0 0 44px !important;
  }
  .anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--left .anavo-tl-dot,
  .anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--right .anavo-tl-dot {
    left: -28px !important;
    right: auto !important;
  }
  /* Slide animation: all items slide from left on mobile */
  .anavo-tl-wrapper[data-layout="alternate"] .anavo-tl-item--right .anavo-tl-card {
    transform: ${config.animationType === 'slide' ? slideInitialLeft : fadeInitial};
  }

  /* Horizontal: compact */
  .anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-item {
    flex: 0 0 220px;
  }

  .anavo-tl-card {
    padding: ${Math.round(config.cardPadding * 0.75)}px;
  }
  .anavo-tl-title {
    font-size: ${Math.round(config.headingSize * 0.85)}px;
  }
  .anavo-tl-body {
    font-size: ${Math.max(config.bodySize - 1, 13)}px;
  }
}

/* ---- Responsive: Small Mobile ---- */
@media (max-width: 480px) {
  .anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-item {
    flex: 0 0 180px;
    min-width: 160px;
  }
  .anavo-tl-card {
    padding: ${Math.round(config.cardPadding * 0.6)}px;
  }
}

/* ---- Reduced Motion ---- */
@media (prefers-reduced-motion: reduce) {
  .anavo-tl-dot {
    transition: none !important;
    transform: scale(1) !important;
  }
  .anavo-tl-wrapper[data-layout="horizontal"] .anavo-tl-dot {
    transform: translateX(-50%) scale(1) !important;
  }
  .anavo-tl-card {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .anavo-tl-line-fill {
    transition: none !important;
  }
  .anavo-tl-line-glow {
    animation: none !important;
    display: none !important;
  }
}
`;

    document.head.appendChild(style);
    dbg('Styles injected');
  }

  // ========================================
  // BUILD UI
  // ========================================

  function buildUI(items) {
    const wrapper = document.createElement('div');
    wrapper.className = 'anavo-tl-wrapper';
    wrapper.dataset.layout = config.layout;

    // Line track
    const lineTrack = document.createElement('div');
    lineTrack.className = 'anavo-tl-line-track';
    lineTrack.setAttribute('aria-hidden', 'true');

    const lineFill = document.createElement('div');
    lineFill.className = 'anavo-tl-line-fill';
    lineTrack.appendChild(lineFill);

    const lineGlow = document.createElement('div');
    lineGlow.className = 'anavo-tl-line-glow';
    lineGlow.setAttribute('aria-hidden', 'true');
    lineTrack.appendChild(lineGlow);

    wrapper.appendChild(lineTrack);

    // Items list
    const itemsList = document.createElement('ul');
    itemsList.className = 'anavo-tl-items';
    itemsList.setAttribute('role', 'list');

    let sideToggle = 'left';

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'anavo-tl-item';

      if (config.layout === 'alternate') {
        const side = item.side || sideToggle;
        li.classList.add(`anavo-tl-item--${side}`);
        sideToggle = sideToggle === 'left' ? 'right' : 'left';
      }

      // Dot
      const dot = document.createElement('div');
      dot.className = 'anavo-tl-dot';
      dot.setAttribute('aria-hidden', 'true');
      li.appendChild(dot);

      // Card
      const card = document.createElement('div');
      card.className = 'anavo-tl-card';

      if (item.image) {
        const img = document.createElement('img');
        img.className = 'anavo-tl-img';
        img.src = item.image;
        img.alt = item.title || '';
        img.loading = 'lazy';
        card.appendChild(img);
      }

      if (item.year) {
        const year = document.createElement('span');
        year.className = 'anavo-tl-year';
        year.textContent = item.year;
        card.appendChild(year);
      }

      if (item.title) {
        const title = document.createElement('h3');
        title.className = 'anavo-tl-title';
        title.textContent = item.title;
        card.appendChild(title);
      }

      if (item.body) {
        const body = document.createElement('div');
        body.className = 'anavo-tl-body';
        body.innerHTML = item.body;
        card.appendChild(body);
      }

      li.appendChild(card);
      itemsList.appendChild(li);
    });

    wrapper.appendChild(itemsList);

    return { wrapper, lineFill, lineGlow };
  }

  // ========================================
  // ANIMATIONS
  // ========================================

  function initAnimations(wrapper, lineFill, lineGlow) {
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cards = wrapper.querySelectorAll('.anavo-tl-card');
    const dots = wrapper.querySelectorAll('.anavo-tl-dot');

    // --- Reveal cards and dots on scroll via IntersectionObserver ---
    if (prefersReducedMotion || config.animationType === 'none') {
      cards.forEach(c => c.classList.add('is-visible'));
      dots.forEach(d => d.classList.add('is-visible'));
    } else if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -32px 0px' }
      );
      cards.forEach(c => revealObserver.observe(c));
      dots.forEach(d => revealObserver.observe(d));
    } else {
      // Fallback for browsers without IntersectionObserver
      cards.forEach(c => c.classList.add('is-visible'));
      dots.forEach(d => d.classList.add('is-visible'));
    }

    // --- Line draw ---
    if (!config.drawLine || prefersReducedMotion) {
      // No animation: show full line immediately
      if (config.layout === 'horizontal') {
        lineFill.style.width = '100%';
        lineGlow.style.right = '0';
      } else {
        lineFill.style.height = '100%';
        lineGlow.style.top = '100%';
      }
      return;
    }

    const isVertical = config.layout === 'vertical' || config.layout === 'alternate';

    function updateLine() {
      const rect = wrapper.getBoundingClientRect();
      const wrapperTop = rect.top + window.scrollY;
      const wrapperHeight = rect.height;
      const viewBottom = window.scrollY + window.innerHeight;

      // Progress: 0 when viewport bottom is at wrapper top, 1 when it is at wrapper bottom
      const rawProgress =
        (viewBottom - wrapperTop) / (wrapperHeight + window.innerHeight * 0.5);
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      const pct = (progress * 100).toFixed(1) + '%';

      if (isVertical) {
        lineFill.style.height = pct;
        lineGlow.style.top = pct;
        lineGlow.style.bottom = 'auto';
      } else {
        // Horizontal: fill width based on scroll within wrapper
        const scrollEl = wrapper;
        const scrollRatio =
          scrollEl.scrollLeft /
          Math.max(scrollEl.scrollWidth - scrollEl.clientWidth, 1);
        // Blend scroll ratio with viewport progress so line starts drawing even before scroll
        const blended = Math.max(scrollRatio, progress * 0.4);
        const hPct = (Math.min(blended, 1) * 100).toFixed(1) + '%';
        lineFill.style.width = hPct;
        lineGlow.style.left = hPct;
        lineGlow.style.right = 'auto';
      }
    }

    if (config.scrollSync) {
      // Sync to scroll position
      window.addEventListener('scroll', updateLine, { passive: true });
      if (config.layout === 'horizontal') {
        wrapper.addEventListener('scroll', updateLine, { passive: true });
      }
      updateLine(); // initial render
    } else {
      // One-time draw triggered by IntersectionObserver
      if ('IntersectionObserver' in window) {
        const drawDuration = config.animationSpeed * 4;
        const lineObserver = new IntersectionObserver(
          entries => {
            if (entries[0].isIntersecting) {
              if (isVertical) {
                lineFill.style.transition = `height ${drawDuration}ms ease`;
                lineFill.style.height = '100%';
                lineGlow.style.transition = `top ${drawDuration}ms ease`;
                lineGlow.style.top = '100%';
              } else {
                lineFill.style.transition = `width ${drawDuration}ms ease`;
                lineFill.style.width = '100%';
                lineGlow.style.transition = `left ${drawDuration}ms ease`;
                lineGlow.style.left = '100%';
              }
              lineObserver.unobserve(wrapper);
            }
          },
          { threshold: 0.1 }
        );
        lineObserver.observe(wrapper);
      } else {
        // Fallback
        if (isVertical) {
          lineFill.style.height = '100%';
        } else {
          lineFill.style.width = '100%';
        }
      }
    }
  }

  // ========================================
  // LICENSING
  // ========================================

  function loadLicensing() {
    setTimeout(() => {
      try {
        if (window.AnavoLicenseManager) return;

        const licScript = document.createElement('script');
        const base = currentScript.src.replace(/[^/]+$/, '');
        licScript.src = base + '../_shared/licensing.min.js';

        licScript.onload = function () {
          try {
            const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
              licenseServer:
                'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
              showUI: true,
            });
            lm.init().then(function () {
              if (!lm.isLicensed) {
                const w = document.querySelector('.anavo-tl-wrapper');
                if (w) lm.insertWatermark(w);
              }
            });
          } catch (e) {
            console.warn(`[${PLUGIN_NAME}] License init error:`, e.message);
          }
        };

        licScript.onerror = function () {
          console.warn(`[${PLUGIN_NAME}] Could not load licensing module`);
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
        console.warn(
          `[${PLUGIN_NAME}] No timeline items found. ` +
            'Add .timeline-item elements, a <ul> with data-year/data-title on each <li>, ' +
            'or use ?data=JSON.'
        );
        return;
      }

      dbg(`Extracted ${items.length} items`);

      injectStyles();

      const { wrapper, lineFill, lineGlow } = buildUI(items);

      // Hide original element and insert the timeline widget after it
      target.style.display = 'none';
      target.parentNode.insertBefore(wrapper, target.nextSibling);

      // Kick off animations after layout settles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initAnimations(wrapper, lineFill, lineGlow);
        });
      });

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
