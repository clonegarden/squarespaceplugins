/**
 * =======================================
 * ASCII ANIMATION PLUGIN - Squarespace
 * =======================================
 * @version 1.2.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/ascii-animation/ascii-animation.min.js"></script>
 *
 * PARAMETERS:
 * ?characters=YOURTEXT          - Main text to display (default: ANAVOTECH)
 * ?explodeText=SECONDARY        - Text shown on explosion (default: DESIGNCREATEINNOVATE)
 * ?secondaryText=TEXT           - Secondary explosion text (default: TECHNOLOGYANDART)
 * ?tertiaryText=TEXT            - Tertiary explosion text (default: CREATIONINNOVATIONART)
 * ?position=first-section       - Where to insert (first-section, before-footer, after-header)
 * ?targetId=custom-id           - Custom container ID
 * ?bgColor=000000               - Background color (hex without #, or 'transparent')
 * ?fontColor=ffffff             - Text color (hex without #)
 * ?height=100vh                 - Container height (default: 100vh)
 * ?fontSize=16                  - Base font size (default: 16px)
 * ?enableRain=true              - Click-to-rain effect (default: true)
 * ?enableExplosion=true         - Hover explosion effect (default: true)
 * ?pulseAmount=30               - Pulse intensity on hover (default: 30)
 * ?animationSpeed=1             - Animation speed multiplier (default: 1)
 * ?colorWave=false              - Enable color wave effect (default: false)
 * ?waveMode=rainbow             - Color wave mode: rainbow, gradient, pulse (default: rainbow)
 * ?waveColors=ff0000,00ff00     - Custom colors for gradient/pulse (comma-separated hex, no #)
 * ?reveal=false                 - Enable reveal sequence (default: false)
 * ?revealDelay=5                - Seconds before reveal triggers (default: 5)
 * ?revealDuration=4             - Seconds the text stays visible (default: 4)
 * ?revealTrigger=timer          - Trigger mode: timer, click, scroll, hover (default: timer)
 * ?revealRepeat=false           - Cycle the reveal indefinitely (default: false)
 * ?revealTitle=TEXT             - Override title text (URL-encoded, default: characters + explodeText)
 * ?revealSubtitle=TEXT          - Override subtitle text (URL-encoded, default: secondaryText · tertiaryText)
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.2.0';
  console.log(`🎨 ASCII Animation Plugin v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // CONFIGURATION
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    return {
      characters: params.get('characters') || 'ANAVOTECH',
      explodeText: params.get('explodeText') || 'DESIGNCREATEINNOVATE',
      secondaryText: params.get('secondaryText') || 'TECHNOLOGYANDART',
      tertiaryText: params.get('tertiaryText') || 'CREATIONINNOVATIONART',
      position: params.get('position') || 'first-section',
      targetId: params.get('targetId') || null,
      bgColor: params.get('bgColor') || 'transparent',
      fontColor: params.get('fontColor') || '#000000',
      height: params.get('height') || '100vh',
      fontSize: params.get('fontSize') || '16',
      enableRain: params.get('enableRain') !== 'false',
      enableExplosion: params.get('enableExplosion') !== 'false',
      pulseAmount: params.get('pulseAmount') || '30',
      animationSpeed: params.get('animationSpeed') || '1',
      colorWave: params.get('colorWave') === 'true',
      waveMode: params.get('waveMode') || 'rainbow',
      waveColors: params.get('waveColors') ?
        decodeURIComponent(params.get('waveColors')).split(',').map(c => c.trim()) :
        null,
      // Reveal sequence
      reveal: params.get('reveal') === 'true',
      revealDelay: parseFloat(params.get('revealDelay') || '5'),
      revealDuration: parseFloat(params.get('revealDuration') || '4'),
      revealTrigger: params.get('revealTrigger') || 'timer',
      revealRepeat: params.get('revealRepeat') === 'true',
      revealTitle: params.get('revealTitle') ? decodeURIComponent(params.get('revealTitle')) : null,
      revealSubtitle: params.get('revealSubtitle') ? decodeURIComponent(params.get('revealSubtitle')) : null,
    };
  }

  const config = getScriptParams();
  console.log('⚙️ ASCII Animation Config:', config);

  // ========================================
  // CIRCLE CONFIGURATION
  // ========================================

  function generateCircles() {
    const speedMultiplier = parseFloat(config.animationSpeed);

    return [
      {
        numLetters: 8,
        radius: 430,
        characters: config.characters,
        explodeCharacters: config.explodeText,
        speed: 0.2 * speedMultiplier,
        opacity: 0.0625,
      },
      {
        numLetters: 8,
        radius: 400,
        characters: config.characters,
        explodeCharacters: config.secondaryText,
        speed: -0.25 * speedMultiplier,
        opacity: 0.0625,
      },
      {
        numLetters: 8,
        radius: 370,
        characters: config.characters,
        explodeCharacters: config.tertiaryText,
        speed: 0.28 * speedMultiplier,
        opacity: 0.0625,
      },
      {
        numLetters: 8,
        radius: 340,
        characters: config.characters,
        explodeCharacters: config.explodeText,
        speed: 0.3 * speedMultiplier,
        opacity: 0.125,
      },
      {
        numLetters: 8,
        radius: 310,
        characters: config.characters,
        explodeCharacters: config.secondaryText,
        speed: -0.35 * speedMultiplier,
        opacity: 0.125,
      },
      {
        numLetters: 8,
        radius: 280,
        characters: config.characters,
        explodeCharacters: config.tertiaryText,
        speed: 0.4 * speedMultiplier,
        opacity: 0.125,
      },
      {
        numLetters: 8,
        radius: 250,
        characters: config.characters,
        explodeCharacters: config.characters,
        speed: -0.45 * speedMultiplier,
        opacity: 0.125,
      },
      {
        numLetters: Math.min(config.tertiaryText.length, 22),
        radius: 220,
        characters: config.tertiaryText,
        explodeCharacters: config.characters,
        speed: 0.5 * speedMultiplier,
        opacity: 0.25,
      },
      {
        numLetters: 8,
        radius: 180,
        characters: config.characters,
        explodeCharacters: config.explodeText,
        speed: 0.6 * speedMultiplier,
        opacity: 0.25,
      },
      {
        numLetters: 8,
        radius: 145,
        characters: config.characters,
        explodeCharacters: config.secondaryText,
        speed: -0.5 * speedMultiplier,
        opacity: 0.25,
      },
      {
        numLetters: 8,
        radius: 110,
        characters: config.characters,
        explodeCharacters: config.tertiaryText,
        speed: 0.8 * speedMultiplier,
        opacity: 0.25,
      },
      {
        numLetters: 8,
        radius: 75,
        characters: config.characters,
        explodeCharacters: config.explodeText,
        speed: -0.9 * speedMultiplier,
        opacity: 0.25,
      },
      {
        numLetters: 8,
        radius: 45,
        characters: config.characters,
        explodeCharacters: config.secondaryText,
        speed: 1.1 * speedMultiplier,
        opacity: 0.25,
      },
      {
        numLetters: 8,
        radius: 15,
        characters: config.characters,
        explodeCharacters: config.tertiaryText,
        speed: -1.3 * speedMultiplier,
        opacity: 0.25,
      },
    ];
  }

  // ========================================
  // COLOR WAVE LOGIC
  // ========================================

  function getColorForCircle(circleIndex, totalCircles, time) {
    if (!config.colorWave) {
      return config.fontColor;
    }

    const t = time * 0.001; // Convert to seconds

    switch (config.waveMode) {
      case 'rainbow': {
        const hue = ((circleIndex / totalCircles) * 360 + t * 30) % 360;
        return `hsl(${hue}, 70%, 60%)`;
      }

      case 'gradient': {
        const colors = config.waveColors || ['#ff0000', '#00ff00', '#0000ff'];
        const position = circleIndex / (totalCircles - 1);
        const scaledPos = position * (colors.length - 1);
        const index = Math.floor(scaledPos);
        const nextIndex = Math.min(index + 1, colors.length - 1);
        const blend = scaledPos - index;

        return blendHexColors(colors[index], colors[nextIndex], blend);
      }

      case 'pulse': {
        const baseColor = config.waveColors ? config.waveColors[0] : '#3b82f6';
        const intensity = 0.5 + Math.sin(t * 2) * 0.5; // 0.0 - 1.0

        const rgb = hexToRgb(baseColor);
        const r = Math.floor(rgb.r * intensity);
        const g = Math.floor(rgb.g * intensity);
        const b = Math.floor(rgb.b * intensity);

        return `rgb(${r}, ${g}, ${b})`;
      }

      default:
        return config.fontColor;
    }
  }

  function blendHexColors(hex1, hex2, blend) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    const r = Math.floor(rgb1.r + (rgb2.r - rgb1.r) * blend);
    const g = Math.floor(rgb1.g + (rgb2.g - rgb1.g) * blend);
    const b = Math.floor(rgb1.b + (rgb2.b - rgb1.b) * blend);

    return `rgb(${r}, ${g}, ${b})`;
  }

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
  }

  // ========================================
  // STYLES INJECTION
  // ========================================

  function injectStyles() {
    if (document.getElementById('anavo-ascii-animation-styles')) {
      console.log('⚠️ Styles already injected');
      return;
    }

    const styles = document.createElement('style');
    styles.id = 'anavo-ascii-animation-styles';
    styles.textContent = `
      /* ANAVO ASCII ANIMATION v${PLUGIN_VERSION} */

      #anavo-ascii-section {
        position: relative;
        width: 100%;
        height: ${config.height};
        overflow: visible !important;
        background: ${config.bgColor};
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #anavo-ascii-animation {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 1000px;
        height: 1000px;
        z-index: 1;
        transition: transform 0.8s ease;
      }

      #anavo-ascii-animation span {
        color: ${config.fontColor};
        font-size: ${config.fontSize}px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        #anavo-ascii-animation {
          width: 90vw;
          height: 90vw;
          max-width: 600px;
          max-height: 600px;
        }

        #anavo-ascii-animation span {
          font-size: ${Math.max(parseInt(config.fontSize) - 4, 12)}px;
        }
      }

      @media (max-width: 480px) {
        #anavo-ascii-section {
          height: ${config.height === '100vh' ? '80vh' : config.height};
        }

        #anavo-ascii-animation {
          width: 95vw;
          height: 95vw;
          max-width: 400px;
          max-height: 400px;
        }

        #anavo-ascii-animation span {
          font-size: ${Math.max(parseInt(config.fontSize) - 6, 10)}px;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ ASCII Animation styles injected');
  }

  // ========================================
  // HTML STRUCTURE CREATION
  // ========================================

  function createContainer() {
    const section = document.createElement('div');
    section.id = 'anavo-ascii-section';
    section.setAttribute('data-anavo-plugin', 'ascii-animation');
    section.setAttribute('data-version', PLUGIN_VERSION);

    const animation = document.createElement('div');
    animation.id = 'anavo-ascii-animation';

    section.appendChild(animation);

    console.log('✅ ASCII Animation container created');
    return section;
  }

  // ========================================
  // INSERTION POINT FINDER
  // ========================================

  function findInsertionPoint() {
    // Priority 1: Custom target ID
    if (config.targetId) {
      const custom = document.getElementById(config.targetId);
      if (custom) {
        console.log(`📍 Inserting into custom target: #${config.targetId}`);
        return { element: custom, position: 'prepend' };
      }
    }

    // Priority 2: Position parameter
    switch (config.position) {
      case 'first-section': {
        const firstSection = document.querySelector(
          '.page-section:first-of-type, section:first-of-type, main > div:first-child'
        );
        if (firstSection) {
          console.log('📍 Inserting before first section');
          return { element: firstSection, position: 'before' };
        }
        break;
      }

      case 'before-footer': {
        const footer = document.querySelector(
          'footer, .footer, [data-nc-group="footer"]'
        );
        if (footer) {
          console.log('📍 Inserting before footer');
          return { element: footer, position: 'before' };
        }
        break;
      }

      case 'after-header': {
        const header = document.querySelector(
          'header, .header, [data-nc-group="header"]'
        );
        if (header) {
          console.log('📍 Inserting after header');
          return { element: header, position: 'after' };
        }
        break;
      }
    }

    // Fallback: Beginning of body
    console.log('📍 Inserting at beginning of body (fallback)');
    return { element: document.body, position: 'prepend' };
  }

  function insertContainer(container) {
    const { element, position } = findInsertionPoint();

    switch (position) {
      case 'before':
        element.parentNode.insertBefore(container, element);
        break;
      case 'after':
        element.parentNode.insertBefore(container, element.nextSibling);
        break;
      case 'prepend':
        element.insertBefore(container, element.firstChild);
        break;
      default:
        element.appendChild(container);
    }

    console.log('✅ ASCII Animation container inserted');
  }

  // ========================================
  // ANIMATION LOGIC
  // ========================================

  function initAnimation(container) {
    const animationDiv = container.querySelector('#anavo-ascii-animation');
    if (!animationDiv) {
      console.error('❌ Animation container not found');
      return;
    }

    const circles = generateCircles();
    const pulseAmount = parseInt(config.pulseAmount);

    const allLetters = [];
    let isExploding = false;
    let explosionProgress = 0;
    let isRaining = false;
    let rainLetters = [];
    let mouseX = 0;
    let mouseY = 0;
    let isMouseOverContainer = false;

    // Create letter elements
    circles.forEach((circle, circleIndex) => {
      for (let i = 0; i < circle.numLetters; i++) {
        const letter = document.createElement('span');
        letter.textContent = circle.characters[i % circle.characters.length];
        letter.style.position = 'absolute';
        letter.style.fontFamily = '"Syne Mono", monospace';
        letter.style.fontSize = `${config.fontSize}px`;
        letter.style.opacity = circle.opacity;
        letter.style.transition = 'all 0.3s ease';
        animationDiv.appendChild(letter);

        allLetters.push({
          element: letter,
          circleIndex,
          letterIndex: i,
          baseAngle: (i / circle.numLetters) * Math.PI * 2,
          baseOpacity: circle.opacity,
        });
      }
    });

    // Mouse tracking
    if (config.enableExplosion) {
      animationDiv.addEventListener('mouseenter', () => {
        isMouseOverContainer = true;
      });

      animationDiv.addEventListener('mousemove', e => {
        isMouseOverContainer = true;
        const rect = animationDiv.getBoundingClientRect();
        mouseX = e.clientX - rect.left - rect.width / 2;
        mouseY = e.clientY - rect.top - rect.height / 2;
      });

      animationDiv.addEventListener('mouseleave', () => {
        isMouseOverContainer = false;
        mouseX = 0;
        mouseY = 0;
        isExploding = false;
        explosionProgress = 0;
      });
    }

    // Click to start rain
    if (config.enableRain && config.revealTrigger !== 'click') {
      animationDiv.addEventListener('click', () => {
        if (!isRaining) {
          startRainAnimation();
        }
      });
    }

    function startRainAnimation() {
      isRaining = true;
      isExploding = false;
      explosionProgress = 0;

      rainLetters = allLetters.map(({ element, baseOpacity }) => {
        const rect = animationDiv.getBoundingClientRect();
        const startX = Math.random() * rect.width;
        const startY = -50;
        const sizeVariation = 0.8 + Math.random() * 0.4;
        const baseFontSize = parseInt(config.fontSize);
        const fontSize = baseFontSize * sizeVariation;
        const fallSpeed = 1 + Math.random() * 2;
        const delay = Math.random() * 100;

        element.style.transition = 'none';
        element.style.left = startX + 'px';
        element.style.top = startY + 'px';
        element.style.fontSize = fontSize + 'px';
        element.style.transform = 'none';
        element.style.opacity = baseOpacity;

        return {
          element,
          x: startX,
          y: startY,
          fallSpeed,
          delay,
          baseOpacity,
          currentDelay: delay,
        };
      });
    }

    function updateRain() {
      const rect = animationDiv.getBoundingClientRect();
      const containerHeight = rect.height;
      let allFallen = true;

      rainLetters.forEach(drop => {
        if (drop.currentDelay > 0) {
          drop.currentDelay--;
          return;
        }

        drop.y += drop.fallSpeed;
        const progress = drop.y / containerHeight;
        const opacity = drop.baseOpacity * (1 - progress);

        drop.element.style.top = drop.y + 'px';
        drop.element.style.opacity = Math.max(0, opacity);

        if (drop.y < containerHeight + 50) {
          allFallen = false;
        }
      });

      if (allFallen) {
        isRaining = false;
        resetToCircles();
      }
    }

    function resetToCircles() {
      allLetters.forEach(({ element, baseOpacity }) => {
        element.style.transition = 'all 0.5s ease';
        element.style.fontSize = `${config.fontSize}px`;
        element.style.opacity = baseOpacity;
      });
      rainLetters = [];
    }

    // ========================================
    // REVEAL SEQUENCE STATE MACHINE
    // ========================================

    // Phases: 'idle' | 'explode-out' | 'form-text' | 'hold' | 'glitch-exit' | 'explode-back'
    let revealPhase = 'idle';
    let revealPhaseStart = 0;
    let revealTriggered = false;
    let revealOverlay = null;

    // Phase durations (ms)
    const REVEAL_EXPLODE_OUT_MS  = 800;
    const REVEAL_FORM_TEXT_MS    = 1000;
    const REVEAL_GLITCH_EXIT_MS  = 600;
    const REVEAL_EXPLODE_BACK_MS = 1000;

    // Build title / subtitle text
    const revealTitleText    = config.revealTitle    || (config.characters + '\n' + config.explodeText);
    const revealSubtitleText = config.revealSubtitle || (config.secondaryText + ' \u00b7 ' + config.tertiaryText);

    function createRevealOverlay() {
      if (revealOverlay) return;

      revealOverlay = document.createElement('div');
      revealOverlay.id = 'anavo-reveal-overlay';
      revealOverlay.style.cssText = [
        'position:absolute',
        'top:50%',
        'left:50%',
        'transform:translate(-50%,-50%)',
        'text-align:center',
        'z-index:10',
        'opacity:0',
        'pointer-events:none',
        'font-family:"Syne Mono",monospace',
      ].join(';');

      const titleEl = document.createElement('div');
      titleEl.className = 'anavo-reveal-title';
      titleEl.innerHTML = revealTitleText.replace(/\n/g, '<br>');
      titleEl.style.cssText = [
        'font-size:' + (parseInt(config.fontSize) * 3) + 'px',
        'font-weight:900',
        'color:' + config.fontColor,
        'opacity:0.95',
        'line-height:1.1',
        'letter-spacing:0.05em',
        'margin-bottom:16px',
        'white-space:nowrap',
      ].join(';');

      const subtitleEl = document.createElement('div');
      subtitleEl.className = 'anavo-reveal-subtitle';
      subtitleEl.textContent = revealSubtitleText;
      subtitleEl.style.cssText = [
        'font-size:' + (parseInt(config.fontSize) * 1.8) + 'px',
        'font-weight:500',
        'color:' + config.fontColor,
        'opacity:0.7',
        'letter-spacing:0.08em',
        'white-space:nowrap',
      ].join(';');

      revealOverlay.appendChild(titleEl);
      revealOverlay.appendChild(subtitleEl);
      animationDiv.appendChild(revealOverlay);
    }

    function injectRevealStyles() {
      if (document.getElementById('anavo-reveal-glitch-styles')) return;
      const style = document.createElement('style');
      style.id = 'anavo-reveal-glitch-styles';
      style.textContent = `
        @keyframes anavo-reveal-tremble {
          0%,100% { transform: translate(-50%,-50%) translate(0,0); }
          10%      { transform: translate(-50%,-50%) translate(-3px,2px); }
          20%      { transform: translate(-50%,-50%) translate(3px,-1px); }
          30%      { transform: translate(-50%,-50%) translate(-2px,-3px); }
          40%      { transform: translate(-50%,-50%) translate(2px,3px); }
          50%      { transform: translate(-50%,-50%) translate(-4px,1px); }
          60%      { transform: translate(-50%,-50%) translate(4px,-2px); }
          70%      { transform: translate(-50%,-50%) translate(-1px,4px); }
          80%      { transform: translate(-50%,-50%) translate(1px,-4px); }
          90%      { transform: translate(-50%,-50%) translate(-3px,-1px); }
        }
        @keyframes anavo-reveal-glitch-clip {
          0%   { clip-path: inset(0 0 95% 0); }
          10%  { clip-path: inset(40% 0 30% 0); }
          20%  { clip-path: inset(80% 0 5% 0); }
          30%  { clip-path: inset(10% 0 70% 0); }
          40%  { clip-path: inset(50% 0 20% 0); }
          50%  { clip-path: inset(0 0 60% 0); }
          60%  { clip-path: inset(70% 0 10% 0); }
          70%  { clip-path: inset(20% 0 50% 0); }
          80%  { clip-path: inset(90% 0 0 0); }
          90%  { clip-path: inset(5% 0 85% 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        #anavo-reveal-overlay.glitching {
          animation: anavo-reveal-tremble 0.1s steps(2) infinite,
                     anavo-reveal-glitch-clip 0.15s steps(3) infinite;
        }
      `;
      document.head.appendChild(style);
    }

    function triggerReveal() {
      if (revealPhase !== 'idle') return;
      if (revealTriggered && !config.revealRepeat) return;
      revealTriggered = true;
      isExploding = false;
      isRaining = false;
      explosionProgress = 0;
      revealPhase = 'explode-out';
      revealPhaseStart = Date.now();
      console.log('🎬 Reveal sequence triggered');
    }

    function updateReveal() {
      const now = Date.now();
      const elapsed = now - revealPhaseStart;

      switch (revealPhase) {

        // ---- Phase 2: Letters fly outward ----
        case 'explode-out': {
          const progress = Math.min(elapsed / REVEAL_EXPLODE_OUT_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

          allLetters.forEach(({ element, circleIndex, baseAngle, baseOpacity }) => {
            const circle = circles[circleIndex];
            const explosionRadius = circle.radius + eased * 500;
            const angle = baseAngle + (now / 1000) * circle.speed * 0.3;
            const x = Math.cos(angle) * explosionRadius;
            const y = Math.sin(angle) * explosionRadius;

            element.style.left = 'calc(50% + ' + x + 'px)';
            element.style.top  = 'calc(50% + ' + y + 'px)';
            element.style.opacity = baseOpacity * (1 - eased * 0.8);
            element.style.transform = 'translate(-50%,-50%) scale(' + (1 + eased) + ') rotate(' + (eased * 180) + 'deg)';
          });

          if (progress >= 1) {
            revealPhase = 'form-text';
            revealPhaseStart = now;
          }
          break;
        }

        // ---- Phase 3: Letters converge to center, overlay fades in ----
        case 'form-text': {
          const progress = Math.min(elapsed / REVEAL_FORM_TEXT_MS, 1);
          const eased = progress * progress * (3 - 2 * progress); // smoothstep

          allLetters.forEach(({ element, baseOpacity }, index) => {
            // Use a stable small offset based on index instead of Math.random()
            const seed = index * 2.399963;
            const targetX = Math.cos(seed) * 20;
            const targetY = Math.sin(seed) * 15;

            element.style.left = 'calc(50% + ' + (targetX * (1 - eased)) + 'px)';
            element.style.top  = 'calc(50% + ' + (targetY * (1 - eased)) + 'px)';
            element.style.opacity = baseOpacity * 0.2 * eased;
            element.style.transform = 'translate(-50%,-50%) scale(' + (0.5 + eased * 0.5) + ')';
          });

          if (revealOverlay) {
            revealOverlay.style.opacity = eased;
          }

          if (progress >= 1) {
            revealPhase = 'hold';
            revealPhaseStart = now;
            allLetters.forEach(({ element }) => {
              element.style.opacity = '0';
            });
          }
          break;
        }

        // ---- Phase 4: Text holds ----
        case 'hold': {
          if (elapsed >= config.revealDuration * 1000) {
            revealPhase = 'glitch-exit';
            revealPhaseStart = now;
            if (revealOverlay) revealOverlay.classList.add('glitching');
          }
          break;
        }

        // ---- Phase 5: Glitch and fade ----
        case 'glitch-exit': {
          const progress = Math.min(elapsed / REVEAL_GLITCH_EXIT_MS, 1);

          if (revealOverlay) {
            revealOverlay.style.opacity = 1 - progress;
          }

          allLetters.forEach(({ element, baseOpacity }, index) => {
            const seed = index * 2.399963;
            const jitterX = Math.cos(seed * progress * 7) * 100 * progress;
            const jitterY = Math.sin(seed * progress * 5) * 100 * progress;
            element.style.left = 'calc(50% + ' + jitterX + 'px)';
            element.style.top  = 'calc(50% + ' + jitterY + 'px)';
            element.style.opacity = baseOpacity * progress * 0.5;
            element.style.transform = 'translate(-50%,-50%) rotate(' + (Math.cos(seed) * 30) + 'deg)';
          });

          if (progress >= 1) {
            revealPhase = 'explode-back';
            revealPhaseStart = now;
            if (revealOverlay) {
              revealOverlay.classList.remove('glitching');
              revealOverlay.style.opacity = '0';
            }
          }
          break;
        }

        // ---- Phase 6: Letters reform into circles ----
        case 'explode-back': {
          const progress = Math.min(elapsed / REVEAL_EXPLODE_BACK_MS, 1);
          const eased = progress * progress * (3 - 2 * progress); // smoothstep

          allLetters.forEach(({ element, circleIndex, letterIndex, baseAngle, baseOpacity }) => {
            const circle = circles[circleIndex];
            const angle = (letterIndex / circle.numLetters) * Math.PI * 2 +
              (now / 1000) * circle.speed;
            const currentRadius = circle.radius * eased;
            const x = Math.cos(angle) * currentRadius;
            const y = Math.sin(angle) * currentRadius;

            element.style.left = 'calc(50% + ' + x + 'px)';
            element.style.top  = 'calc(50% + ' + y + 'px)';
            element.style.opacity = baseOpacity * eased;
            element.style.transform = 'translate(-50%,-50%) scale(' + (0.5 + eased * 0.5) + ') rotate(' + ((1 - eased) * 180) + 'deg)';
            element.textContent = circle.characters[letterIndex % circle.characters.length];
          });

          if (progress >= 1) {
            revealPhase = 'idle';
            console.log('🎬 Reveal sequence complete');

            if (config.revealRepeat && config.revealTrigger === 'timer') {
              setTimeout(triggerReveal, config.revealDelay * 1000);
            }
          }
          break;
        }
      }
    }

    // Setup reveal triggers (only when reveal is enabled)
    if (config.reveal) {
      createRevealOverlay();
      injectRevealStyles();

      switch (config.revealTrigger) {
        case 'timer':
          setTimeout(triggerReveal, config.revealDelay * 1000);
          break;

        case 'click':
          animationDiv.addEventListener('click', function () {
            if (revealPhase === 'idle') triggerReveal();
          });
          break;

        case 'scroll': {
          let scrollTriggered = false;
          window.addEventListener('scroll', function () {
            if (scrollTriggered || revealPhase !== 'idle') return;
            const rect = animationDiv.getBoundingClientRect();
            const viewportH = window.innerHeight;
            if (rect.top < viewportH * 0.4 && rect.bottom > viewportH * 0.6) {
              scrollTriggered = true;
              triggerReveal();
            }
          }, { passive: true });
          break;
        }

        case 'hover':
          animationDiv.addEventListener('mouseenter', function () {
            if (revealPhase === 'idle') triggerReveal();
          });
          break;
      }
    }

    function animate() {
      // Reveal sequence takes priority over all other animation states
      if (config.reveal && revealPhase !== 'idle') {
        updateReveal();
        requestAnimationFrame(animate);
        return;
      }

      if (isRaining) {
        updateRain();
      } else {
        const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        const thirdCircleRadius = 110;

        if (
          config.enableExplosion &&
          isMouseOverContainer &&
          distance < thirdCircleRadius &&
          !isExploding
        ) {
          isExploding = true;
          explosionProgress = 0;
        }

        if (isExploding) {
          explosionProgress += 0.05;
          if (explosionProgress > 1) explosionProgress = 1;
        } else if (explosionProgress > 0) {
          explosionProgress -= 0.05;
          if (explosionProgress < 0) explosionProgress = 0;
        }

        allLetters.forEach(({ element, circleIndex, letterIndex, baseAngle, baseOpacity }) => {
          const circle = circles[circleIndex];

          // Apply color wave
          if (config.colorWave) {
            element.style.color = getColorForCircle(circleIndex, circles.length, Date.now());
          }

          if (explosionProgress > 0.3) {
            const explodeText = circle.explodeCharacters;
            element.textContent = explodeText[letterIndex % explodeText.length];
          } else {
            element.textContent = circle.characters[letterIndex % circle.characters.length];
          }

          if (isExploding || explosionProgress > 0) {
            const explosionRadius = circle.radius + explosionProgress * 350;
            const angle = baseAngle + (Date.now() / 1000) * circle.speed;
            const x = Math.cos(angle) * explosionRadius;
            const y = Math.sin(angle) * explosionRadius;

            element.style.left = `calc(50% + ${x}px)`;
            element.style.top = `calc(50% + ${y}px)`;
            element.style.opacity = baseOpacity * (1 - explosionProgress * 0.7);
            element.style.transform = `translate(-50%, -50%) scale(${1 + explosionProgress * 2}) rotate(${explosionProgress * 360}deg)`;
          } else {
            const radius = circle.radius - Math.min(distance / 3, pulseAmount);
            const angle =
              (letterIndex / circle.numLetters) * Math.PI * 2 +
              (Date.now() / 1000) * circle.speed;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            element.style.left = `calc(50% + ${x}px)`;
            element.style.top = `calc(50% + ${y}px)`;
            element.style.opacity = baseOpacity;
            element.style.transform = `translate(-50%, -50%) scale(${1 + distance / 1000})`;
          }
        });
      }

      requestAnimationFrame(animate);
    }

    animate();
    console.log('✅ ASCII Animation initialized');
  }

  // ========================================
  // LICENSING
  // ========================================

  async function loadLicensing() {
    try {
      if (window.AnavoLicenseManager) return null;

      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const licenseManager = new window.AnavoLicenseManager('ASCIIAnimation', PLUGIN_VERSION, {
        licenseServer:
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
        showUI: true,
      });

      await licenseManager.init();

      if (!licenseManager.isLicensed) {
        const section = document.getElementById('anavo-ascii-section');
        if (section) licenseManager.insertWatermark(section);
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
      console.log('🔧 Starting ASCII Animation initialization...');

      // Inject styles
      injectStyles();

      // Create and insert container
      const container = createContainer();
      insertContainer(container);

      // Initialize animation
      initAnimation(container);

      console.log(`✅ ASCII Animation Plugin v${PLUGIN_VERSION} Active!`);
      console.log(`   Characters: ${config.characters}`);
      console.log(`   Position: ${config.position}`);
      console.log(`   Rain enabled: ${config.enableRain}`);
      console.log(`   Explosion enabled: ${config.enableExplosion}`);

      // Load licensing in background
      loadLicensing();
    } catch (error) {
      console.error('❌ ASCII Animation initialization failed:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  // Auto-start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
