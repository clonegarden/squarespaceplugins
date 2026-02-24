* =======================================
 * SPACE INVADERS GAME PLUGIN - Squarespace
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * 
 * Interactive Space Invaders game overlay for Squarespace sites.
 * Perfect for tech portfolios, developer showcases, and gamified experiences.
 *
 * 
 * BADGE SYSTEM: Every 10 invaders destroyed = 1 tech badge unlocked
 * 
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js"></script>
 *
 * 
 * CUSTOMIZATION:
 * Add URL parameters: ?autoStart=true&difficulty=hard&bgColor=000000
 * =======================================
 */

(function () {
(function() {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  console.log(`🎮 Space Invaders Plugin v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // CONFIGURATION
  // GET URL PARAMETERS
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function getScriptParams() {
    const src = currentScript.src;
    let params;
    try {
      const url = new URL(src);
      params = new URLSearchParams(url.search);
    } catch (_e) {
      params = new URLSearchParams('');
    }
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    let customTechs = null;
    const rawCustomTechs = params.get('customTechs');
    if (rawCustomTechs) {
    function parseJSON(str, fallback) {
      try {
        customTechs = JSON.parse(decodeURIComponent(rawCustomTechs));
      } catch (_e) {
        console.warn('⚠️ Space Invaders: invalid customTechs JSON, using defaults');
        return JSON.parse(decodeURIComponent(str));
      } catch (e) {
        return fallback;
      }
    }

    return {
      autoStart: params.get('autoStart') === 'true',
      shooterIcon: params.get('shooterIcon') || '▲',
      invaderImage: params.get('invaderImage') || '',
      invaderImage: params.get('invaderImage') || 'https://images.squarespace-cdn.com/content/v1/6931f12ce64c6418b6bc54b7/44374135-dee7-4a80-b72b-4c6810f225ee/Anavo+Tech%2C+Full+Stack+Developer%403x.png',
      bgColor: params.get('bgColor') || 'transparent',
      fontColor: params.get('fontColor') || 'white',
      difficulty: params.get('difficulty') || 'medium',
      showTechTable: params.get('showTechTable') !== 'false',
      showPrompt: params.get('showPrompt') !== 'false',
      customTechs: customTechs,
      customTechs: parseJSON(params.get('customTechs'), null)
    };
  }

  const config = getScriptParams();
  console.log('⚙️ Space Invaders Config:', config);

  // ========================================
  // DEFAULT TECH STACK
  // ✅ TECH STACK - 10 BADGES (A CADA 10 KILLS)
  // ========================================

  const DEFAULT_TECHS = [
    { name: 'React', icon: '⚛️', pointsNeeded: 5 },
    { name: 'Node.js', icon: '🟢', pointsNeeded: 10 },
    { name: 'Python', icon: '🐍', pointsNeeded: 15 },
    { name: 'Vue', icon: '💚', pointsNeeded: 20 },
    { name: 'TypeScript', icon: '🔷', pointsNeeded: 25 },
    { name: 'AI/ML', icon: '🤖', pointsNeeded: 30 },
    { name: 'PostgreSQL', icon: '🐘', pointsNeeded: 35 },
    { name: 'AWS', icon: '☁️', pointsNeeded: 40 },
  const defaultTechStack = [
    { name: 'React', icon: '⚛️', pointsNeeded: 10 },
    { name: 'Node.js', icon: '🟢', pointsNeeded: 20 },
    { name: 'Python', icon: '🐍', pointsNeeded: 30 },
    { name: 'Vue', icon: '💚', pointsNeeded: 40 },
    { name: 'TypeScript', icon: '🔷', pointsNeeded: 50 },
    { name: 'AI/ML', icon: '🤖', pointsNeeded: 60 },
    { name: 'PostgreSQL', icon: '🐘', pointsNeeded: 70 },
    { name: 'AWS', icon: '☁️', pointsNeeded: 80 },
    { name: 'Docker', icon: '🐳', pointsNeeded: 90 },
    { name: 'Firebase', icon: '🔥', pointsNeeded: 100 }
  ];

  const TECH_STACK = config.customTechs || DEFAULT_TECHS;
  const techStack = config.customTechs || defaultTechStack;

  // ========================================
  // DIFFICULTY SETTINGS
  // ========================================

  const DIFFICULTY = {
    easy: { invaderSpeed: 0.4, bulletSpeed: 7, invaderBulletSpeed: 2, fireRate: 120, waveSize: 12 },
    medium: { invaderSpeed: 0.7, bulletSpeed: 6, invaderBulletSpeed: 3, fireRate: 80, waveSize: 18 },
    hard: { invaderSpeed: 1.1, bulletSpeed: 5, invaderBulletSpeed: 4, fireRate: 50, waveSize: 24 },
  const difficultySettings = {
    easy: { speed: 0.3, spawnDelay: 80 },
    medium: { speed: 0.5, spawnDelay: 50 },
    hard: { speed: 0.8, spawnDelay: 30 }
  };

  const diffSettings = DIFFICULTY[config.difficulty] || DIFFICULTY.medium;

  // ========================================
  // GAME STATE
  // ========================================

  let score = 0;
  let earnedBadges = new Set();
  let gameRunning = false;
  let gameOverFlag = false;
  let animationId = null;
  let overlayEl = null;
  let canvasEl = null;
  let ctx = null;

  // Game objects
  let shooter = null;
  let invaders = [];
  let bullets = [];
  let invaderBullets = [];
  let explosions = [];
  let wave = 0;
  let frameCount = 0;
  let invaderDir = 1;

  // Input
  let mouseX = 0;
  let isShooting = false;

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

      const licenseManager = new window.AnavoLicenseManager('SpaceInvaders', PLUGIN_VERSION, {
        licenseServer:
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
        showUI: false,
      });

      await licenseManager.init();

      if (!licenseManager.isLicensed) {
        showWatermark();
      }

      return licenseManager;
    } catch (error) {
      console.warn('⚠️ License check failed:', error.message);
      return null;
    }
  }

  function showWatermark() {
    const watermark = document.createElement('div');
    watermark.className = 'anavo-watermark-game';
    watermark.innerHTML = `⚠️ Unlicensed Version • <a href="https://anavotech.com/plugins/space-invaders" target="_blank" rel="noopener noreferrer">Get License</a>`;
    watermark.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px 20px;
      border: 2px solid black;
      font-family: 'Syne Mono', monospace;
      font-size: 12px;
      z-index: 999999;
      pointer-events: auto;
    `;
    document.body.appendChild(watermark);
  }
  const difficulty = difficultySettings[config.difficulty] || difficultySettings.medium;

  // ========================================
  // STYLES
  // INJECT CSS STYLES
  // ========================================

  function injectStyles() {
    if (document.getElementById('anavo-space-invaders-styles')) return;

    const style = document.createElement('style');
    style.id = 'anavo-space-invaders-styles';
    style.textContent = `
      #anavo-space-invaders-overlay {
        position: fixed;
    const styles = document.createElement('style');
    styles.id = 'anavo-space-invaders-styles';
    styles.textContent = `
      /* ANAVO SPACE INVADERS v${PLUGIN_VERSION} */
      
      #space-invaders-game {
        position: fixed !important;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999990;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Syne Mono', 'Courier New', monospace;
        background: ${config.bgColor === 'transparent' ? 'rgba(0,0,0,0.85)' : '#' + config.bgColor.replace('#', '')};
        color: ${config.fontColor};
        overflow: hidden;
      }

      #anavo-space-invaders-overlay * {
        box-sizing: border-box;
      }

      #anavo-si-canvas {
        display: block;
        cursor: none;
        touch-action: none;
        max-width: 100%;
      }

      #anavo-si-hud {
        position: absolute;
        top: 12px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        font-size: 14px;
        color: ${config.fontColor};
        display: none;
        pointer-events: none;
        z-index: 1;
      }

      #anavo-si-close {
        position: absolute;
        top: 10px;
        right: 16px;
        background: none;
        border: 1px solid ${config.fontColor};
        color: ${config.fontColor};
        font-size: 18px;
        width: 32px;
        height: 32px;
        cursor: pointer;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Syne Mono', monospace;
        opacity: 0.7;
        transition: opacity 0.2s;
        background: ${config.bgColor};
      }

      #anavo-si-close:hover {
        opacity: 1;
      
      #space-invaders-game.active {
        display: block !important;
        pointer-events: auto !important;
      }

      #anavo-si-prompt {
        text-align: center;
        padding: 40px 20px;
      
      #space-invaders-game.playing {
        cursor: none !important;
      }

      #anavo-si-prompt h2 {
        font-size: clamp(22px, 4vw, 36px);
        margin-bottom: 12px;
        font-family: 'Syne Mono', monospace;
      
      #shooter {
        position: fixed;
        bottom: 20px;
        width: 40px;
        height: 40px;
        font-size: 32px;
        pointer-events: none;
        z-index: 999995;
        transform: translateX(-50%);
        transition: left 0.05s linear;
        filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
        display: none;
        color: ${config.fontColor};
      }

      #anavo-si-prompt p {
        font-size: clamp(13px, 2vw, 16px);
        opacity: 0.8;
        margin-bottom: 24px;
        color: ${config.fontColor};
      
      .bullet {
        position: fixed;
        width: 12px;
        height: 12px;
        background: black;
        border: 2px solid ${config.fontColor};
        border-radius: 3px 3px 0 0;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
        pointer-events: none;
        z-index: 999992;
      }

      #anavo-si-prompt-start {
      
      .invader {
        position: fixed;
        width: 50px;
        height: 50px;
        background-image: url('${config.invaderImage}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        image-rendering: pixelated;
        z-index: 999991;
      }
      
      .fragment {
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${config.fontColor};
        color: ${config.bgColor === 'transparent' ? '#000' : '#' + config.bgColor.replace('#', '')};
        border: none;
        padding: 14px 36px;
        font-size: 16px;
        box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        pointer-events: none;
        z-index: 999993;
      }
      
      .tech-badge-earned {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        background: white;
        color: black;
        padding: 20px 40px;
        border-radius: 0;
        border: 4px solid black;
        font-size: 24px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        margin-right: 12px;
        transition: transform 0.15s;
        z-index: 999998 !important;
        animation: badgeEarned 1s ease-out forwards;
        pointer-events: none;
        box-shadow: 0 0 0 2px white, 0 0 0 4px black;
      }

      #anavo-si-prompt-start:hover {
        transform: scale(1.05);
      
      @keyframes badgeEarned {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0;
        }
      }

      #anavo-si-prompt-skip {
        background: none;
        color: ${config.fontColor};
        border: 1px solid ${config.fontColor};
        padding: 14px 36px;
        font-size: 16px;
      
      /* ✅ HUD CORRIGIDO - VISUAL MELHORADO */
      .game-hud {
        position: fixed !important;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999994;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.15s;
      }

      #anavo-si-prompt-skip:hover {
        opacity: 1;
      }

      #anavo-si-tech-table {
        margin-top: 28px;
        width: 100%;
        max-width: 480px;
        color: ${config.fontColor};
        text-shadow: 2px 2px 0 black;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px 30px;
        border-radius: 0;
        border: 3px solid ${config.fontColor};
        min-width: 400px;
        text-align: center;
      }

      #anavo-si-tech-table h3 {
        font-size: 13px;
      
      .game-hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: ${config.fontColor};
        font-size: 18px;
        font-weight: bold;
      }

      .anavo-si-badges {
      
      .game-hud-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }

      .anavo-si-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border: 1px solid ${config.fontColor};
        font-size: 12px;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
        opacity: 0.3;
        transition: opacity 0.3s, background 0.3s;
        border-radius: 3px;
      }

      .anavo-si-badge.unlocked {
        opacity: 1;
        background: rgba(255,255,255,0.1);
        gap: 10px;
        flex-wrap: wrap;
        min-height: 30px;
      }
      
      .badge-icon {
        font-size: 24px;
        animation: badgeSlideIn 0.3s ease-out;
      }
      
      @keyframes badgeSlideIn {
        from {
          transform: scale(0) rotate(-180deg);
          opacity: 0;
        }
        to {
          transform: scale(1) rotate(0);
          opacity: 1;
        }
      }

      #anavo-si-gameover {
      
      .game-prompt {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        text-align: center;
        padding: 40px 20px;
        animation: anavo-si-fadein 0.4s ease;
      }

      #anavo-si-gameover h2 {
        font-size: clamp(24px, 5vw, 42px);
        margin-bottom: 12px;
        z-index: 999999 !important;
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        padding: 50px 70px;
        border-radius: 0;
        pointer-events: auto !important;
        border: 6px solid black;
      }
      
      .game-prompt.hidden {
        display: none !important;
      }
      
      .game-prompt h2 {
        color: white;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
        font-size: 32px;
        margin: 0 0 20px 0;
        text-shadow: 3px 3px 0 black;
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      #anavo-si-gameover p {
      
      .game-prompt p {
        color: #ccc;
        font-family: 'Syne Mono', monospace;
        font-size: 16px;
        opacity: 0.8;
        margin-bottom: 8px;
        color: ${config.fontColor};
        margin: 0 0 35px 0;
        text-shadow: 1px 1px 0 black;
      }
      
      .game-prompt button {
        background: white;
        color: black;
        border: 3px solid black;
        padding: 15px 40px;
        font-size: 18px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        border-radius: 0;
        transition: all 0.1s;
        margin: 0 10px;
        text-transform: uppercase;
      }

      #anavo-si-gameover .anavo-si-badges {
        margin: 20px auto;
        max-width: 400px;
      
      .game-prompt button:hover {
        background: #f0f0f0;
      }
      
      .game-prompt button.secondary {
        background: #333;
        color: white;
        border: 3px solid #666;
      }
      
      .game-over {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        text-align: center;
        z-index: 999999 !important;
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        padding: 50px 70px;
        border-radius: 0;
        border: 6px solid black;
        display: none;
        pointer-events: auto;
      }
      
      .game-over.active {
        display: block !important;
      }
      
      .game-over h2 {
        color: white;
        font-family: 'Syne Mono', monospace;
        font-size: 36px;
        margin: 0 0 20px 0;
        text-shadow: 3px 3px 0 black;
        letter-spacing: 2px;
      }
      
      .game-over .final-stats {
        color: #ccc;
        font-family: 'Syne Mono', monospace;
        font-size: 18px;
        margin: 20px 0;
        text-shadow: 1px 1px 0 black;
      }

      #anavo-si-gameover-btns {
        margin-top: 24px;
      
      .game-over .badges-earned {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      #anavo-si-gameover-btns button {
        padding: 12px 28px;
        font-size: 15px;
        gap: 15px;
        margin: 30px 0;
        font-size: 32px;
      }
      
      .game-over button {
        background: white;
        color: black;
        border: 3px solid black;
        padding: 15px 40px;
        font-size: 18px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        transition: transform 0.15s;
      }

      #anavo-si-gameover-btns button:hover {
        transform: scale(1.05);
      }

      .anavo-si-btn-primary {
        background: ${config.fontColor};
        color: #000;
        border: none;
      }

      .anavo-si-btn-secondary {
        background: none;
        color: ${config.fontColor};
        border: 1px solid ${config.fontColor};
        opacity: 0.7;
      }

      @keyframes anavo-si-fadein {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 600px) {
        #anavo-si-hud { font-size: 12px; }
        .anavo-si-badge { font-size: 11px; padding: 4px 8px; }
        border-radius: 0;
        transition: all 0.1s;
        margin: 10px;
        text-transform: uppercase;
      }

      @media (prefers-reduced-motion: reduce) {
        .anavo-si-badge, #anavo-si-prompt-start, #anavo-si-prompt-skip {
          transition: none;
      
      .game-over button:hover {
        background: #f0f0f0;
      }
      
      .game-over button.secondary {
        background: #333;
        color: white;
        border: 3px solid #666;
      }
      
      @media (max-width: 768px) {
        .game-hud {
          min-width: 90%;
          padding: 12px 20px;
        }
        
        .game-hud-header {
          font-size: 14px;
          flex-direction: column;
          gap: 5px;
        }
        
        .badge-icon {
          font-size: 20px;
        }
      }
    `;
    document.head.appendChild(style);

    document.head.appendChild(styles);
    console.log('✅ Styles injected');
  }

  // ========================================
  // DOM CREATION
  // INJECT HTML STRUCTURE
  // ========================================
  function injectHTML() {
    if (document.getElementById('space-invaders-game')) return;

    const html = `
      <div id="space-invaders-game">
        <div id="shooter">${config.shooterIcon}</div>
        
        ${config.showPrompt ? `
        <div class="game-prompt" id="gamePrompt">
          <h2>WANT TO PLAY A GAME?</h2>
          <p>Shoot logo invaders • Collect tech badges • Have fun!</p>
          <button onclick="window.SpaceInvadersGame.start()">START GAME</button>
          <button class="secondary" onclick="window.SpaceInvadersGame.skip()">SKIP</button>
        </div>
        ` : ''}
        
        <div class="game-hud" style="display: none;" id="gameHUD">
          <div class="game-hud-header">
            <span>SCORE: <span id="gameScore">0</span></span>
            <span>TECHNOLOGIES CONQUERED: <span id="badgeCount">0</span></span>
          </div>
          <div class="game-hud-badges" id="badgesList"></div>
        </div>
        
        <div class="game-over" id="gameOver">
          <h2>MISSION COMPLETE!</h2>
          <div class="final-stats">
            <div>Final Score: <span id="finalScore">0</span></div>
            <div>Tech Badges Earned:</div>
          </div>
          <div class="badges-earned" id="badgesEarned"></div>
          <button onclick="window.SpaceInvadersGame.reset()">PLAY AGAIN</button>
          <button class="secondary" onclick="window.SpaceInvadersGame.skip()">CONTINUE</button>
        </div>
      </div>
    `;

  function createOverlay() {
    if (overlayEl) return;

    injectStyles();

    overlayEl = document.createElement('div');
    overlayEl.id = 'anavo-space-invaders-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-label', 'Space Invaders Game');
    overlayEl.setAttribute('aria-modal', 'true');

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'anavo-si-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close game');
    closeBtn.addEventListener('click', skipGame);
    overlayEl.appendChild(closeBtn);

    document.body.appendChild(overlayEl);
    document.body.insertAdjacentHTML('beforeend', html);
    console.log('✅ HTML injected');
  }

  function buildTechBadges(containerId) {
    const wrapper = document.createElement('div');
    wrapper.id = containerId || 'anavo-si-tech-table';

    const title = document.createElement('h3');
    title.textContent = 'Tech Badges';
    wrapper.appendChild(title);

    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'anavo-si-badges';
  // ========================================
  // GAME LOGIC
  // ========================================
  let gameActive = false;
  let score = 0;
  let invaders = [];
  let bullets = [];
  let earnedBadges = new Set();
  let gameContainer, gameHUD, gamePrompt, gameOver, shooter, badgesList, badgeCount;
  let animationFrameId = null;
  let mouseX = window.innerWidth / 2;

    TECH_STACK.forEach(tech => {
      const badge = document.createElement('span');
      badge.className = 'anavo-si-badge';
      badge.id = `anavo-si-badge-${tech.name.replace(/[^a-z0-9]/gi, '_')}`;
      badge.setAttribute('aria-label', `${tech.name} badge - ${tech.pointsNeeded} points needed`);
      badge.textContent = `${tech.icon} ${tech.name}`;
      badgesDiv.appendChild(badge);
    });
  function initGame() {
    gameContainer = document.getElementById('space-invaders-game');
    gameHUD = document.getElementById('gameHUD');
    gamePrompt = document.getElementById('gamePrompt');
    gameOver = document.getElementById('gameOver');
    shooter = document.getElementById('shooter');
    badgesList = document.getElementById('badgesList');
    badgeCount = document.getElementById('badgeCount');

    wrapper.appendChild(badgesDiv);
    return wrapper;
  }
    if (!gameContainer) return;

  function showPromptScreen() {
    if (!overlayEl) createOverlay();
    gameContainer.classList.add('active');

    // Clear overlay content (except close button)
    Array.from(overlayEl.children).forEach(child => {
      if (child.id !== 'anavo-si-close') overlayEl.removeChild(child);
    document.addEventListener('mousemove', (e) => {
      if (gameActive) {
        mouseX = e.clientX;
        shooter.style.left = mouseX + 'px';
      }
    });

    const prompt = document.createElement('div');
    prompt.id = 'anavo-si-prompt';

    prompt.innerHTML = `
      <h2>🎮 Space Invaders</h2>
      <p>Move your mouse to aim · Click to shoot · Unlock tech badges!</p>
    `;

    const btnRow = document.createElement('div');
    const startBtn = document.createElement('button');
    startBtn.id = 'anavo-si-prompt-start';
    startBtn.textContent = '🚀 Play Now';
    startBtn.addEventListener('click', startGame);

    const skipBtn = document.createElement('button');
    skipBtn.id = 'anavo-si-prompt-skip';
    skipBtn.textContent = 'Skip';
    skipBtn.addEventListener('click', skipGame);
    document.addEventListener('click', (e) => {
      if (gameActive && (!gamePrompt || gamePrompt.classList.contains('hidden'))) {
        shootBullet(mouseX);
      }
    });

    btnRow.appendChild(startBtn);
    btnRow.appendChild(skipBtn);
    prompt.appendChild(btnRow);
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 100 && gameActive) {
        cleanupGame();
      }
    });

    if (config.showTechTable) {
      prompt.appendChild(buildTechBadges('anavo-si-tech-table'));
    if (config.autoStart) {
      startGame();
    }

    overlayEl.appendChild(prompt);
    overlayEl.style.display = 'flex';

    // Re-append close button so it's on top
    overlayEl.appendChild(overlayEl.querySelector('#anavo-si-close'));
  }

  function showGameOverScreen() {
    stopGameLoop();

    if (!overlayEl) return;

    Array.from(overlayEl.children).forEach(child => {
      if (child.id !== 'anavo-si-close') overlayEl.removeChild(child);
    });

    const container = document.createElement('div');
    container.id = 'anavo-si-gameover';
  function startGame() {
    if (gamePrompt) gamePrompt.classList.add('hidden');

    const title = document.createElement('h2');
    title.textContent = gameOverFlag ? '💀 Game Over' : '🏆 Wave Cleared!';
    container.appendChild(title);
    if (gameHUD) gameHUD.style.display = 'block';
    if (shooter) shooter.style.display = 'block';

    const scoreP = document.createElement('p');
    scoreP.textContent = `Score: ${score}`;
    container.appendChild(scoreP);
    gameContainer.classList.add('playing');

    const badgesP = document.createElement('p');
    badgesP.textContent = `Badges unlocked: ${earnedBadges.size} / ${TECH_STACK.length}`;
    container.appendChild(badgesP);
    gameActive = true;
    score = 0;
    earnedBadges.clear();
    bullets = [];
    invaders = [];

    if (earnedBadges.size > 0) {
      const badgesDiv = document.createElement('div');
      badgesDiv.className = 'anavo-si-badges';
      earnedBadges.forEach(name => {
        const tech = TECH_STACK.find(t => t.name === name);
        if (tech) {
          const badge = document.createElement('span');
          badge.className = 'anavo-si-badge unlocked';
          badge.textContent = `${tech.icon} ${tech.name}`;
          badgesDiv.appendChild(badge);
        }
      });
      container.appendChild(badgesDiv);
    }
    updateHUD();

    const btnRow = document.createElement('div');
    btnRow.id = 'anavo-si-gameover-btns';
    spawnWave();
    startGameLoop();
  }

    const replayBtn = document.createElement('button');
    replayBtn.className = 'anavo-si-btn-primary';
    replayBtn.textContent = '🔄 Play Again';
    replayBtn.addEventListener('click', resetGame);
    btnRow.appendChild(replayBtn);
  function skipGame() {
    cleanupGame();
  }

    const closeBtn2 = document.createElement('button');
    closeBtn2.className = 'anavo-si-btn-secondary';
    closeBtn2.textContent = 'Close';
    closeBtn2.addEventListener('click', skipGame);
    btnRow.appendChild(closeBtn2);
  function resetGame() {
    if (gameOver) gameOver.classList.remove('active');
    if (gamePrompt) gamePrompt.classList.remove('hidden');

    container.appendChild(btnRow);
    overlayEl.appendChild(container);
    overlayEl.appendChild(overlayEl.querySelector('#anavo-si-close'));
  }
    gameContainer.classList.remove('playing');

  // ========================================
  // CANVAS & GAME LOGIC
  // ========================================
    invaders.forEach(inv => inv.element.remove());
    bullets.forEach(b => b.element.remove());
    invaders = [];
    bullets = [];

  function createCanvas() {
    const size = getCanvasSize();
    canvasEl = document.createElement('canvas');
    canvasEl.id = 'anavo-si-canvas';
    canvasEl.width = size.w;
    canvasEl.height = size.h;
    canvasEl.setAttribute('aria-hidden', 'true');
    ctx = canvasEl.getContext('2d');
    return canvasEl;
    gameActive = false;
    if (shooter) shooter.style.display = 'none';
  }

  function getCanvasSize() {
    return {
      w: Math.min(window.innerWidth, 900),
      h: Math.min(window.innerHeight * 0.85, 600),
    };
  }
  function cleanupGame() {
    gameActive = false;

  function spawnWave() {
    wave++;
    invaders = [];
    invaderDir = 1;
    const cols = Math.ceil(Math.sqrt(diffSettings.waveSize));
    const rows = Math.ceil(diffSettings.waveSize / cols);
    const spacingX = canvasEl.width / (cols + 1);
    const spacingY = 50;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (invaders.length >= diffSettings.waveSize) break;
        invaders.push({
          x: spacingX * (c + 1),
          y: 60 + r * spacingY,
          w: 28,
          h: 28,
          alive: true,
        });
      }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  }

  function initGame() {
    const size = getCanvasSize();
    if (canvasEl) {
      canvasEl.width = size.w;
      canvasEl.height = size.h;
    if (gameContainer) {
      gameContainer.classList.remove('active');
      gameContainer.classList.remove('playing');
    }

    score = 0;
    earnedBadges = new Set();
    invaders.forEach(inv => inv.element.remove());
    bullets.forEach(b => b.element.remove());
    invaders = [];
    bullets = [];
    invaderBullets = [];
    explosions = [];
    frameCount = 0;
    gameOverFlag = false;
    isShooting = false;
    mouseX = (canvasEl ? canvasEl.width : size.w) / 2;

    shooter = {
      x: size.w / 2,
      y: size.h - 36,
      w: 28,
      h: 28,
      speed: 6,
    };

    spawnWave();
  }

  function drawShooter() {
    ctx.save();
    ctx.fillStyle = config.fontColor;
    ctx.font = `${shooter.w}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.shooterIcon, shooter.x, shooter.y);
    ctx.restore();
  }

  function drawInvaders() {
    invaders.forEach(inv => {
      if (!inv.alive) return;
      ctx.save();
      if (config.invaderImage) {
        // Draw image invaders if image is loaded
        if (window._anavoInvaderImg && window._anavoInvaderImg.complete) {
          ctx.drawImage(window._anavoInvaderImg, inv.x - inv.w / 2, inv.y - inv.h / 2, inv.w, inv.h);
        } else {
          ctx.fillStyle = config.fontColor;
          ctx.font = `${inv.w}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👾', inv.x, inv.y);
        }
      } else {
        ctx.fillStyle = config.fontColor;
        ctx.font = `${inv.w}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👾', inv.x, inv.y);
  function spawnWave() {
    const rows = 3;
    const cols = 8;
    const spacing = 80;
    const startX = (window.innerWidth - (cols * spacing)) / 2;
    const startY = 100;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        setTimeout(() => {
          if (!gameActive) return;
          createInvader(startX + (col * spacing), startY + (row * 60));
        }, (row * cols + col) * difficulty.spawnDelay);
      }
      ctx.restore();
    });
    }
  }

  function drawBullets() {
    bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = config.fontColor;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  function createInvader(x, y) {
    const invader = document.createElement('div');
    invader.className = 'invader';
    invader.style.left = x + 'px';
    invader.style.top = y + 'px';

    const invaderData = {
      element: invader,
      x: x,
      y: y,
      width: 50,
      height: 50,
      direction: 1,
      speed: difficulty.speed
    };

    invaderBullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    document.body.appendChild(invader);
    invaders.push(invaderData);
  }

  function drawExplosions() {
    explosions.forEach(exp => {
      exp.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });
  }
  function shootBullet(x) {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = x + 'px';
    bullet.style.bottom = '70px';

  function drawHUD() {
    // Score
    ctx.save();
    ctx.fillStyle = config.fontColor;
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 12, 10);
    ctx.textAlign = 'right';
    ctx.fillText(`Wave: ${wave}`, canvasEl.width - 12, 10);
    ctx.restore();
  }
    const bulletData = {
      element: bullet,
      x: x,
      y: window.innerHeight - 70,
      speed: 8
    };

  function createExplosion(x, y) {
    const particles = [];
    const colors = [config.fontColor, '#ff6600', '#ffcc00', '#ff4444'];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 1.5 + Math.random() * 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 2,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    explosions.push({ particles, life: 30 });
    document.body.appendChild(bullet);
    bullets.push(bulletData);
  }

  function updateExplosions() {
    explosions = explosions.filter(exp => {
      exp.life--;
      exp.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 1 / 30;
  function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
      invaders.forEach((invader) => {
        const hit = (
          bullet.x > invader.x &&
          bullet.x < invader.x + invader.width &&
          bullet.y > invader.y &&
          bullet.y < invader.y + invader.height
        );

        if (hit) {
          destroyInvader(invader);
          bullet.element.remove();
          bullets.splice(bulletIndex, 1);
        }
      });
      return exp.life > 0;
    });
  }

  function shootBullet() {
    bullets.push({
      x: shooter.x,
      y: shooter.y - shooter.h / 2,
      vy: -diffSettings.bulletSpeed,
    });
  }
  function destroyInvader(invaderData) {
    createFragmentExplosion(invaderData.x + 25, invaderData.y + 25);
    invaderData.element.remove();
    invaders = invaders.filter(inv => inv !== invaderData);

  function invaderShoot() {
    const alive = invaders.filter(inv => inv.alive);
    if (alive.length === 0) return;
    const inv = alive[Math.floor(Math.random() * alive.length)];
    invaderBullets.push({
      x: inv.x,
      y: inv.y + inv.h / 2,
      vy: diffSettings.invaderBulletSpeed,
    });
  }
    score++;
    updateHUD();
    checkBadgeUnlock();

  function checkBadgeUnlocks() {
    TECH_STACK.forEach(tech => {
      if (!earnedBadges.has(tech.name) && score >= tech.pointsNeeded) {
        earnedBadges.add(tech.name);
        // Flash the badge if we're on the prompt screen (tech table visible)
        const badgeEl = document.getElementById(
          `anavo-si-badge-${tech.name.replace(/[^a-z0-9]/gi, '_')}`
        );
        if (badgeEl) badgeEl.classList.add('unlocked');
        console.log(`🏆 Badge unlocked: ${tech.icon} ${tech.name}`);
      }
    });
    if (invaders.length === 0) {
      endGame();
    }
  }

  function gameLoop() {
    if (!gameRunning) return;

    const cw = canvasEl.width;
    const ch = canvasEl.height;

    // Clear
    ctx.clearRect(0, 0, cw, ch);

    frameCount++;
  function createFragmentExplosion(x, y) {
    const fragmentCount = 20;

    // Move shooter toward mouse
    const targetX = Math.max(shooter.w / 2, Math.min(cw - shooter.w / 2, mouseX));
    shooter.x += (targetX - shooter.x) * 0.2;
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = document.createElement('div');
      fragment.className = 'fragment';
      fragment.style.left = x + 'px';
      fragment.style.top = y + 'px';

    // Move bullets
    bullets = bullets.filter(b => {
      b.y += b.vy;
      return b.y > 0;
    });

    invaderBullets = invaderBullets.filter(b => {
      b.y += b.vy;
      return b.y < ch;
    });
      const angle = (i / fragmentCount) * Math.PI * 2;
      const velocity = 3 + Math.random() * 5;
      const gravity = 0.3;

    // Invader movement
    const aliveInvaders = invaders.filter(inv => inv.alive);
      let vx = Math.cos(angle) * velocity;
      let vy = Math.sin(angle) * velocity;
      let px = x;
      let py = y;
      let life = 60;

    if (aliveInvaders.length === 0) {
      // Wave cleared
      gameOverFlag = false;
      showGameOverScreen();
      return;
    }
      document.body.appendChild(fragment);

    let hitEdge = false;
    aliveInvaders.forEach(inv => {
      inv.x += diffSettings.invaderSpeed * invaderDir * (1 + wave * 0.05);
      if (inv.x >= cw - inv.w / 2 || inv.x <= inv.w / 2) {
        hitEdge = true;
      }
    });
      const fragmentInterval = setInterval(() => {
        vy += gravity;
        px += vx;
        py += vy;
        life--;

    if (hitEdge) {
      invaderDir *= -1;
      aliveInvaders.forEach(inv => {
        inv.y += 18;
      });
    }
        fragment.style.left = px + 'px';
        fragment.style.top = py + 'px';
        fragment.style.opacity = life / 60;

    // Invader reaches bottom = game over
    if (aliveInvaders.some(inv => inv.y >= ch - shooter.h - 10)) {
      gameOverFlag = true;
      showGameOverScreen();
      return;
        if (life <= 0 || py > window.innerHeight) {
          clearInterval(fragmentInterval);
          fragment.remove();
        }
      }, 16);
    }
  }

    // Auto shoot
    if (isShooting && frameCount % 18 === 0) {
      shootBullet();
  // ✅ FUNÇÃO CORRIGIDA: Atualiza HUD com badges
  function updateHUD() {
    if (document.getElementById('gameScore')) {
      document.getElementById('gameScore').textContent = score;
    }

    // Invader fires
    if (frameCount % diffSettings.fireRate === 0) {
      invaderShoot();
    
    if (badgeCount) {
      badgeCount.textContent = earnedBadges.size;
    }

    // Bullet-invader collision
    bullets.forEach(b => {
      aliveInvaders.forEach(inv => {
        if (
          inv.alive &&
          Math.abs(b.x - inv.x) < inv.w / 2 + 3 &&
          Math.abs(b.y - inv.y) < inv.h / 2 + 3
        ) {
          inv.alive = false;
          b.y = -999; // remove bullet
          score += 1;
          createExplosion(inv.x, inv.y);
          checkBadgeUnlocks();
    
    if (badgesList) {
      badgesList.innerHTML = '';
      earnedBadges.forEach(badgeName => {
        const tech = techStack.find(t => t.name === badgeName);
        if (tech) {
          const badgeIcon = document.createElement('span');
          badgeIcon.className = 'badge-icon';
          badgeIcon.textContent = tech.icon;
          badgeIcon.title = tech.name;
          badgesList.appendChild(badgeIcon);
        }
      });
    });
    }
  }

    // Invader bullet hits shooter
    invaderBullets.forEach(b => {
      if (
        Math.abs(b.x - shooter.x) < shooter.w / 2 + 3 &&
        Math.abs(b.y - shooter.y) < shooter.h / 2 + 3
      ) {
        gameOverFlag = true;
        createExplosion(shooter.x, shooter.y);
        showGameOverScreen();
        return;
  // ✅ FUNÇÃO CORRIGIDA: Checa badges a cada 10 kills
  function checkBadgeUnlock() {
    techStack.forEach(tech => {
      if (score >= tech.pointsNeeded && !earnedBadges.has(tech.name)) {
        earnedBadges.add(tech.name);
        showBadgeEarned(tech);
        updateHUD();
      }
    });
  }

    // Update explosions
    updateExplosions();

    // Draw
    drawShooter();
    drawInvaders();
    drawBullets();
    drawExplosions();
    drawHUD();
  function showBadgeEarned(tech) {
    const notification = document.createElement('div');
    notification.className = 'tech-badge-earned';
    notification.innerHTML = `${tech.icon} ${tech.name} UNLOCKED!`;
    document.body.appendChild(notification);

    animationId = requestAnimationFrame(gameLoop);
    setTimeout(() => notification.remove(), 1000);
  }

  function stopGameLoop() {
    gameRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
  function endGame() {
    gameActive = false;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  }

  // ========================================
  // INPUT HANDLERS
  // ========================================
    gameContainer.classList.remove('playing');

  function onMouseMove(e) {
    const rect = canvasEl ? canvasEl.getBoundingClientRect() : null;
    if (rect) {
      mouseX = e.clientX - rect.left;
    } else {
      mouseX = e.clientX;
    }
  }
    if (gameHUD) gameHUD.style.display = 'none';
    if (shooter) shooter.style.display = 'none';

  function onMouseDown(e) {
    if (e.button === 0) {
      isShooting = true;
      shootBullet();
    if (document.getElementById('finalScore')) {
      document.getElementById('finalScore').textContent = score;
    }
  }

  function onMouseUp(e) {
    if (e.button === 0) {
      isShooting = false;
    }
  }
    const badgesEarnedContainer = document.getElementById('badgesEarned');
    if (badgesEarnedContainer) {
      badgesEarnedContainer.innerHTML = '';

  function onTouchMove(e) {
    e.preventDefault();
    const rect = canvasEl ? canvasEl.getBoundingClientRect() : null;
    const touch = e.touches[0];
    if (rect) {
      mouseX = touch.clientX - rect.left;
    } else {
      mouseX = touch.clientX;
      if (earnedBadges.size === 0) {
        badgesEarnedContainer.innerHTML = '<div style="color: #888;">None - Try again!</div>';
      } else {
        earnedBadges.forEach(badgeName => {
          const tech = techStack.find(t => t.name === badgeName);
          const icon = document.createElement('span');
          icon.textContent = tech.icon;
          icon.title = tech.name;
          badgesEarnedContainer.appendChild(icon);
        });
      }
    }
    isShooting = true;
  }

  function onTouchEnd() {
    isShooting = false;
    if (gameOver) gameOver.classList.add('active');
  }

  function attachInputListeners() {
    if (!canvasEl) return;
    canvasEl.addEventListener('mousemove', onMouseMove);
    canvasEl.addEventListener('mousedown', onMouseDown);
    canvasEl.addEventListener('mouseup', onMouseUp);
    canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
    canvasEl.addEventListener('touchend', onTouchEnd);
  }
  function startGameLoop() {
    function gameLoop() {
      if (!gameActive) return;

  function detachInputListeners() {
    if (!canvasEl) return;
    canvasEl.removeEventListener('mousemove', onMouseMove);
    canvasEl.removeEventListener('mousedown', onMouseDown);
    canvasEl.removeEventListener('mouseup', onMouseUp);
    canvasEl.removeEventListener('touchmove', onTouchMove);
    canvasEl.removeEventListener('touchend', onTouchEnd);
  }
      let shouldMoveDown = false;

  // ========================================
  // SCROLL DETECTION (auto-hide)
  // ========================================
      invaders.forEach(inv => {
        inv.x += inv.direction * inv.speed;

  let scrollTimeout = null;
        if (inv.x >= window.innerWidth - 70 || inv.x <= 20) {
          shouldMoveDown = true;
        }
      });

  function onScroll() {
    if (!gameRunning) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // no action on scroll during gameplay - keep game visible
    }, 300);
  }
      if (shouldMoveDown) {
        invaders.forEach(inv => {
          inv.direction *= -1;
          inv.y += 15;
          inv.speed += 0.05;

  // ========================================
  // PUBLIC API
  // ========================================
          if (inv.y > window.innerHeight - 150) {
            endGame();
          }
        });
      }

  function startGame() {
    if (gameRunning) return;
      invaders.forEach(inv => {
        inv.element.style.left = inv.x + 'px';
        inv.element.style.top = inv.y + 'px';
      });

    if (!overlayEl) createOverlay();
      bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        bullet.element.style.bottom = (window.innerHeight - bullet.y) + 'px';

    // Clear prompt, show canvas
    Array.from(overlayEl.children).forEach(child => {
      if (child.id !== 'anavo-si-close') overlayEl.removeChild(child);
    });
        if (bullet.y < 0) {
          bullet.element.remove();
          bullets.splice(index, 1);
        }
      });

    // HUD
    const hud = document.createElement('div');
    hud.id = 'anavo-si-hud';
    overlayEl.appendChild(hud);
      checkCollisions();

    // Canvas
    const canvas = createCanvas();
    overlayEl.appendChild(canvas);
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Re-add close button on top
    overlayEl.appendChild(overlayEl.querySelector('#anavo-si-close'));
    gameLoop();
  }

    overlayEl.style.display = 'flex';
  // ========================================
  // LICENSING
  // ========================================
  async function loadLicensing() {
    try {
      if (window.AnavoLicenseManager) return null;

    // Preload custom invader image if set
    if (config.invaderImage && !window._anavoInvaderImg) {
      window._anavoInvaderImg = new Image();
      window._anavoInvaderImg.src = config.invaderImage;
    }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

    initGame();
    attachInputListeners();
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

    gameRunning = true;
    gameLoop();
  }
      const licenseManager = new window.AnavoLicenseManager(
        'SpaceInvaders',
        PLUGIN_VERSION,
        {
          licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: false
        }
      );

  function skipGame() {
    stopGameLoop();
    detachInputListeners();
    if (overlayEl) {
      overlayEl.style.display = 'none';
    }
  }
      await licenseManager.init();

  function resetGame() {
    stopGameLoop();
    detachInputListeners();
    startGame();
  }
      if (!licenseManager.isLicensed) {
        showWatermark();
      }

  function cleanupGame() {
    stopGameLoop();
    detachInputListeners();
    if (overlayEl && overlayEl.parentNode) {
      overlayEl.parentNode.removeChild(overlayEl);
      overlayEl = null;
    }
    const styles = document.getElementById('anavo-space-invaders-styles');
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
      return licenseManager;

    } catch (error) {
      console.warn('⚠️ License check failed:', error.message);
      return null;
    }
    canvasEl = null;
    ctx = null;
  }

  function showWatermark() {
    const watermark = document.createElement('div');
    watermark.className = 'anavo-watermark-game';
    watermark.innerHTML = `
      ⚠️ Unlicensed Version • <a href="https://anavotech.com/plugins/space-invaders" target="_blank">Get License</a>
    `;
    watermark.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px 20px;
      border: 2px solid black;
      font-family: 'Syne Mono', monospace;
      font-size: 12px;
      z-index: 999999;
      pointer-events: auto;
    `;
    document.body.appendChild(watermark);
  }

  // ========================================
  // GLOBAL API
  // ========================================

  window.SpaceInvadersGame = {
    start: startGame,
    skip: skipGame,
    reset: resetGame,
    cleanup: cleanupGame,
    getScore: () => score,
    getBadges: () => Array.from(earnedBadges),
    cleanup: cleanupGame
  };

  // ========================================
  // INIT
  // INITIALIZATION
  // ========================================

  async function init() {
    // Scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });
    console.log('🔧 Initializing Space Invaders...');

    // License check (non-blocking)
    loadLicensing().catch(() => {});
    injectStyles();
    injectHTML();
    initGame();

    if (config.autoStart) {
      // Wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGame);
      } else {
        startGame();
      }
    } else if (config.showPrompt) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showPromptScreen);
      } else {
        showPromptScreen();
      }
    }
    loadLicensing();

    console.log(`✅ Space Invaders Plugin v${PLUGIN_VERSION} Active!`);
  }

    console.log(`✅ Space Invaders Plugin v${PLUGIN_VERSION} - Ready`);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  init();
})();
