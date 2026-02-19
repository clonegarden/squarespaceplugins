/**
 * =======================================
 * ASCII ANIMATION PLUGIN - Squarespace
 * =======================================
 * @version 1.0.0
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
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
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
    if (config.enableRain) {
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

    function animate() {
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
