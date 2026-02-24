/**
 * =======================================
 * SPACE INVADERS GAME PLUGIN - Squarespace
 * =======================================
 * @version 2.1.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Interactive Space Invaders game overlay for Squarespace sites.
 * Gamified portfolio presentation for tech stacks, awards, products, etc.
 *
 * ITEM SYSTEM: Unlocks items based on score thresholds.
 *
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js"></script>
 *
 * CUSTOMIZATION:
 * Add URL parameters: ?autoStart=true&difficulty=hard&bgColor=000000
 * =======================================
 */

(function() {
  'use strict';

  const PLUGIN_VERSION = '1.1.0';
  console.log(`🎮 Space Invaders Plugin v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // GET URL PARAMETERS
  // ========================================
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function getScriptParams() {
    const src = currentScript?.src || '';
    const url = new URL(src, window.location.href);
    const params = new URLSearchParams(url.search);

    function parseJSON(str, fallback) {
      try {
        return JSON.parse(decodeURIComponent(str));
      } catch (_e) {
        return fallback;
      }
    }

    function decodeParam(key, fallback) {
      const val = params.get(key);
      return val !== null ? decodeURIComponent(val) : fallback;
    }

    function parseColor(val, fallback) {
      if (!val) return fallback;
      const decoded = decodeURIComponent(val);
      if (decoded.toLowerCase() === 'transparent') return 'transparent';
      if (decoded.startsWith('rgba(') || decoded.startsWith('rgb(') || decoded.startsWith('#')) {
        return decoded;
      }
      if (/^[0-9A-Fa-f]{6}$/.test(decoded)) return `#${decoded}`;
      return decoded;
    }

    return {
      autoStart: params.get('autoStart') === 'true',
      shooterIcon: decodeParam('shooterIcon', '▲'),
      invaderImage: decodeParam(
        'invaderImage',
        'https://images.squarespace-cdn.com/content/v1/6931f12ce64c6418b6bc54b7/44374135-dee7-4a80-b72b-4c6810f225ee/Anavo+Tech%2C+Full+Stack+Developer%403x.png'
      ),
      bgColor: parseColor(params.get('bgColor'), 'transparent'),
      fontColor: parseColor(params.get('fontColor'), 'white'),
      difficulty: decodeParam('difficulty', 'medium'),
      showPrompt: params.get('showPrompt') !== 'false',
      showHUD: params.get('showHUD') !== 'false',
      showPortfolioPanel: params.get('showPortfolioPanel') !== 'false',

      promptTitle: decodeParam('promptTitle', 'WANT TO PLAY A GAME?'),
      promptSubtitle: decodeParam('promptSubtitle', 'Shoot invaders • Unlock items • Have fun!'),
      startButtonText: decodeParam('startButtonText', 'START GAME'),
      skipButtonText: decodeParam('skipButtonText', 'SKIP'),

      portfolioTitle: decodeParam('portfolioTitle', 'PORTFOLIO UNLOCKED'),
      scoreLabel: decodeParam('scoreLabel', 'SCORE'),
      itemLabel: decodeParam('itemLabel', 'ITEMS'),

      endTitle: decodeParam('endTitle', 'MISSION COMPLETE!'),
      endSubtitle: decodeParam('endSubtitle', 'Items Unlocked:'),
      ctaText: decodeParam('ctaText', 'VIEW PORTFOLIO'),
      ctaLink: decodeParam('ctaLink', '/portfolio'),
      ctaTarget: decodeParam('ctaTarget', '_self'),

      mobileControls: params.get('mobileControls') !== 'false',
      controlSpeed: parseFloat(decodeParam('controlSpeed', '8')),

      items: parseJSON(params.get('items'), null)
    };
  }

  const config = getScriptParams();

  // ========================================
  // DEFAULT ITEMS (10 BADGES)
  // ========================================
  const defaultItems = [
    { name: 'React', icon: '⚛️', pointsNeeded: 10, subtitle: 'UI Library' },
    { name: 'Node.js', icon: '🟢', pointsNeeded: 20, subtitle: 'Backend Runtime' },
    { name: 'Python', icon: '🐍', pointsNeeded: 30, subtitle: 'Data & Automation' },
    { name: 'Vue', icon: '💚', pointsNeeded: 40, subtitle: 'Frontend Framework' },
    { name: 'TypeScript', icon: '🔷', pointsNeeded: 50, subtitle: 'Typed JS' },
    { name: 'AI/ML', icon: '🤖', pointsNeeded: 60, subtitle: 'Intelligent Systems' },
    { name: 'PostgreSQL', icon: '🐘', pointsNeeded: 70, subtitle: 'SQL Database' },
    { name: 'AWS', icon: '☁️', pointsNeeded: 80, subtitle: 'Cloud Infrastructure' },
    { name: 'Docker', icon: '🐳', pointsNeeded: 90, subtitle: 'Containers' },
    { name: 'Firebase', icon: '🔥', pointsNeeded: 100, subtitle: 'Realtime Backend' }
  ];

  const items = config.items || defaultItems;

  // ========================================
  // DIFFICULTY SETTINGS
  // ========================================
  const difficultySettings = {
    easy: { speed: 0.3, spawnDelay: 80 },
    medium: { speed: 0.5, spawnDelay: 50 },
    hard: { speed: 0.8, spawnDelay: 30 }
  };

  const difficulty = difficultySettings[config.difficulty] || difficultySettings.medium;

  // ========================================
  // INJECT CSS STYLES
  // ========================================
  function injectStyles() {
    if (document.getElementById('anavo-space-invaders-styles')) return;

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
        display: none;
        pointer-events: none;
        background: ${config.bgColor};
      }
      
      #space-invaders-game.active {
        display: block !important;
        pointer-events: auto !important;
      }
      
      #space-invaders-game.playing {
        cursor: none !important;
      }
      
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
        font-size: 20px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        z-index: 999998 !important;
        animation: badgeEarned 1s ease-out forwards;
        pointer-events: none;
        box-shadow: 0 0 0 2px white, 0 0 0 4px black;
        text-align: center;
      }
      
      @keyframes badgeEarned {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
      }
      
      .game-hud {
        position: fixed !important;
        top: 140px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999994;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
        text-shadow: 2px 2px 0 black;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px 30px;
        border-radius: 0;
        border: 3px solid ${config.fontColor};
        min-width: 400px;
        text-align: center;
        display: none;
      }
      
      .game-hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: bold;
      }
      
      .game-hud-badges {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        min-height: 30px;
      }
      
      .badge-icon {
        font-size: 24px;
        animation: badgeSlideIn 0.3s ease-out;
      }
      
      @keyframes badgeSlideIn {
        from { transform: scale(0) rotate(-180deg); opacity: 0; }
        to { transform: scale(1) rotate(0); opacity: 1; }
      }
      
      .portfolio-panel {
        position: fixed !important;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999994;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
        text-shadow: 2px 2px 0 black;
        background: rgba(0, 0, 0, 0.85);
        padding: 16px 26px;
        border: 3px solid ${config.fontColor};
        width: min(740px, 92vw);
        display: none;
      }

      .portfolio-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .portfolio-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 8px 16px;
        font-size: 14px;
      }

      .portfolio-item {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255,255,255,0.06);
        padding: 6px 10px;
        border: 1px solid rgba(255,255,255,0.15);
      }

      .portfolio-item .icon { font-size: 18px; }
      .portfolio-item .name { font-weight: bold; }
      .portfolio-item .subtitle { font-size: 12px; opacity: 0.8; }
      
      .game-prompt {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        text-align: center;
        z-index: 999999 !important;
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        padding: 50px 70px;
        border-radius: 0;
        pointer-events: auto !important;
        border: 6px solid black;
      }
      
      .game-prompt.hidden { display: none !important; }
      
      .game-prompt h2 {
        color: white;
        font-family: 'Syne Mono', monospace;
        font-size: 32px;
        margin: 0 0 20px 0;
        text-shadow: 3px 3px 0 black;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      
      .game-prompt p {
        color: #ccc;
        font-family: 'Syne Mono', monospace;
        font-size: 16px;
        margin: 0 0 35px 0;
        text-shadow: 1px 1px 0 black;
      }
      
      .game-prompt button,
      .game-over button {
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
        margin: 10px;
        text-transform: uppercase;
      }
      
      .game-prompt button.secondary,
      .game-over button.secondary {
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
      
      .game-over.active { display: block !important; }
      
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

      .game-over .badges-earned {
        display: grid;
        gap: 8px;
        margin: 20px 0;
        font-size: 16px;
      }

      .game-over .badge-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .game-over .game-cta {
        display: inline-block;
        margin: 10px 0 20px;
        background: white;
        color: black;
        border: 3px solid black;
        padding: 12px 28px;
        font-size: 16px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        text-transform: uppercase;
        text-decoration: none;
      }

      .si-mobile-controls {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999996;
        display: none;
        gap: 14px;
        pointer-events: auto;
      }

      .si-control-button {
        width: 64px;
        height: 64px;
        border-radius: 0;
        border: 3px solid ${config.fontColor};
        background: rgba(0,0,0,0.85);
        color: ${config.fontColor};
        font-size: 24px;
        font-family: 'Syne Mono', monospace;
        font-weight: bold;
        cursor: pointer;
      }

      .si-control-button.shoot {
        width: 72px;
        height: 72px;
        font-size: 28px;
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

        .si-mobile-controls {
          display: flex;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Styles injected');
  }

  // ========================================
  // INJECT HTML STRUCTURE
  // ========================================
  function injectHTML() {
    if (document.getElementById('space-invaders-game')) return;

    const html = `
      <div id="space-invaders-game">
        <div id="shooter">${config.shooterIcon}</div>
        
        ${config.showPrompt ? `
        <div class="game-prompt" id="gamePrompt">
          <h2>${config.promptTitle}</h2>
          <p>${config.promptSubtitle}</p>
          <button onclick="window.SpaceInvadersGame.start()">${config.startButtonText}</button>
          <button class="secondary" onclick="window.SpaceInvadersGame.skip()">${config.skipButtonText}</button>
        </div>
        ` : ''}
        
        <div class="portfolio-panel" id="portfolioPanel">
          <div class="portfolio-panel-header">
            <span>${config.portfolioTitle}</span>
            <span><span id="portfolioProgress">0</span> / ${items.length} ${config.itemLabel}</span>
          </div>
          <div class="portfolio-items" id="portfolioItems"></div>
        </div>

        <div class="game-hud" id="gameHUD">
          <div class="game-hud-header">
            <span>${config.scoreLabel}: <span id="gameScore">0</span></span>
            <span>${config.itemLabel}: <span id="badgeCount">0</span></span>
          </div>
          <div class="game-hud-badges" id="badgesList"></div>
        </div>

        <div class="si-mobile-controls" id="mobileControls">
          <button class="si-control-button" data-dir="-1" aria-label="Move left">◀</button>
          <button class="si-control-button shoot" data-action="shoot" aria-label="Shoot">●</button>
          <button class="si-control-button" data-dir="1" aria-label="Move right">▶</button>
        </div>
        
        <div class="game-over" id="gameOver">
          <h2>${config.endTitle}</h2>
          <div class="final-stats">
            <div>${config.scoreLabel}: <span id="finalScore">0</span></div>
            <div>${config.endSubtitle}</div>
          </div>
          <div class="badges-earned" id="badgesEarned"></div>
          ${config.ctaText && config.ctaLink ? `<a class="game-cta" href="${config.ctaLink}" target="${config.ctaTarget}">${config.ctaText}</a>` : ''}
          <button onclick="window.SpaceInvadersGame.reset()">PLAY AGAIN</button>
          <button class="secondary" onclick="window.SpaceInvadersGame.skip()">CONTINUE</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    console.log('✅ HTML injected');
  }

  // ========================================
  // GAME LOGIC
  // ========================================
  let gameActive = false;
  let score = 0;
  let invaders = [];
  let bullets = [];
  let earnedItems = new Set();
  let gameContainer, gameHUD, gamePrompt, gameOver, shooter, badgesList, badgeCount;
  let portfolioPanel, portfolioItems, portfolioProgress;
  let mobileControls;
  let animationFrameId = null;
  let mouseX = window.innerWidth / 2;
  let controlDirection = 0;

  function initGame() {
    gameContainer = document.getElementById('space-invaders-game');
    gameHUD = document.getElementById('gameHUD');
    gamePrompt = document.getElementById('gamePrompt');
    gameOver = document.getElementById('gameOver');
    shooter = document.getElementById('shooter');
    badgesList = document.getElementById('badgesList');
    badgeCount = document.getElementById('badgeCount');

    portfolioPanel = document.getElementById('portfolioPanel');
    portfolioItems = document.getElementById('portfolioItems');
    portfolioProgress = document.getElementById('portfolioProgress');

    mobileControls = document.getElementById('mobileControls');

    if (!gameContainer) return;

    gameContainer.classList.add('active');
    shooter.style.left = mouseX + 'px';

    document.addEventListener('mousemove', (e) => {
      if (gameActive) {
        mouseX = e.clientX;
        shooter.style.left = mouseX + 'px';
      }
    });

    document.addEventListener('click', (e) => {
      if (gameActive && (!gamePrompt || gamePrompt.classList.contains('hidden'))) {
        shootBullet(mouseX);
      }
    });

    document.addEventListener('touchstart', (e) => {
      if (!gameActive) return;
      if (e.target.closest('.si-control-button')) return;
      if (!gamePrompt || gamePrompt.classList.contains('hidden')) {
        e.preventDefault();
        shootBullet(mouseX);
      }
    }, { passive: false });

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 100 && gameActive) {
        cleanupGame();
      }
    });

    initMobileControls();

    if (config.autoStart) {
      startGame();
    }
  }

  function initMobileControls() {
    if (!mobileControls || !config.mobileControls) return;

    const buttons = mobileControls.querySelectorAll('.si-control-button');
    buttons.forEach(btn => {
      const dir = parseInt(btn.getAttribute('data-dir'), 10);
      const action = btn.getAttribute('data-action');

      if (action === 'shoot') {
        const shootHandler = e => {
          e.preventDefault();
          if (gameActive) shootBullet(mouseX);
        };
        btn.addEventListener('touchstart', shootHandler, { passive: false });
        btn.addEventListener('click', shootHandler);
      } else {
        const startMove = e => {
          e.preventDefault();
          if (gameActive) controlDirection = dir;
        };
        const stopMove = () => { controlDirection = 0; };

        btn.addEventListener('touchstart', startMove, { passive: false });
        btn.addEventListener('mousedown', startMove);
        btn.addEventListener('touchend', stopMove);
        btn.addEventListener('touchcancel', stopMove);
        btn.addEventListener('mouseup', stopMove);
        btn.addEventListener('mouseleave', stopMove);
      }
    });
  }

  function updateControlsVisibility() {
    if (!mobileControls) return;
    if (!config.mobileControls) {
      mobileControls.style.display = 'none';
      return;
    }
    if (window.innerWidth <= 768 && gameActive) {
      mobileControls.style.display = 'flex';
    } else {
      mobileControls.style.display = 'none';
    }
  }

  function startGame() {
    if (gamePrompt) gamePrompt.classList.add('hidden');

    if (gameHUD && config.showHUD) gameHUD.style.display = 'block';
    if (portfolioPanel && config.showPortfolioPanel) portfolioPanel.style.display = 'block';
    if (shooter) shooter.style.display = 'block';

    gameContainer.classList.add('playing');

    gameActive = true;
    score = 0;
    earnedItems.clear();
    bullets = [];
    invaders = [];

    updateHUD();
    updatePortfolioPanel();
    updateControlsVisibility();

    spawnWave();
    startGameLoop();
  }

  function skipGame() {
    cleanupGame();
  }

  function resetGame() {
    if (gameOver) gameOver.classList.remove('active');
    if (gamePrompt) gamePrompt.classList.remove('hidden');

    gameContainer.classList.remove('playing');

    invaders.forEach(inv => inv.element.remove());
    bullets.forEach(b => b.element.remove());
    invaders = [];
    bullets = [];

    gameActive = false;
    if (shooter) shooter.style.display = 'none';
    if (gameHUD) gameHUD.style.display = 'none';
    if (portfolioPanel) portfolioPanel.style.display = 'none';
    updateControlsVisibility();
  }

  function cleanupGame() {
    gameActive = false;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    if (gameContainer) {
      gameContainer.classList.remove('active');
      gameContainer.classList.remove('playing');
    }

    invaders.forEach(inv => inv.element.remove());
    bullets.forEach(b => b.element.remove());
    invaders = [];
    bullets = [];
    updateControlsVisibility();
  }

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
    }
  }

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

    document.body.appendChild(invader);
    invaders.push(invaderData);
  }

  function shootBullet(x) {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = x + 'px';
    bullet.style.bottom = '70px';

    const bulletData = {
      element: bullet,
      x: x,
      y: window.innerHeight - 70,
      speed: 8
    };

    document.body.appendChild(bullet);
    bullets.push(bulletData);
  }

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
    });
  }

  function destroyInvader(invaderData) {
    createFragmentExplosion(invaderData.x + 25, invaderData.y + 25);
    invaderData.element.remove();
    invaders = invaders.filter(inv => inv !== invaderData);

    score++;
    updateHUD();
    checkItemUnlock();

    if (invaders.length === 0) {
      endGame();
    }
  }

  function createFragmentExplosion(x, y) {
    const fragmentCount = 20;

    for (let i = 0; i < fragmentCount; i++) {
      const fragment = document.createElement('div');
      fragment.className = 'fragment';
      fragment.style.left = x + 'px';
      fragment.style.top = y + 'px';

      const angle = (i / fragmentCount) * Math.PI * 2;
      const velocity = 3 + Math.random() * 5;
      const gravity = 0.3;

      let vx = Math.cos(angle) * velocity;
      let vy = Math.sin(angle) * velocity;
      let px = x;
      let py = y;
      let life = 60;

      document.body.appendChild(fragment);

      const fragmentInterval = setInterval(() => {
        vy += gravity;
        px += vx;
        py += vy;
        life--;

        fragment.style.left = px + 'px';
        fragment.style.top = py + 'px';
        fragment.style.opacity = life / 60;

        if (life <= 0 || py > window.innerHeight) {
          clearInterval(fragmentInterval);
          fragment.remove();
        }
      }, 16);
    }
  }

  function updateHUD() {
    if (document.getElementById('gameScore')) {
      document.getElementById('gameScore').textContent = score;
    }
    
    if (badgeCount) {
      badgeCount.textContent = earnedItems.size;
    }
    
    if (badgesList) {
      badgesList.innerHTML = '';
      earnedItems.forEach(itemName => {
        const item = items.find(t => t.name === itemName);
        if (item) {
          const badgeIcon = document.createElement('span');
          badgeIcon.className = 'badge-icon';
          badgeIcon.textContent = item.icon;
          badgeIcon.title = item.name;
          badgesList.appendChild(badgeIcon);
        }
      });
    }
  }

  function updatePortfolioPanel() {
    if (!portfolioProgress || !portfolioItems) return;

    portfolioProgress.textContent = earnedItems.size;
    portfolioItems.innerHTML = '';

    if (earnedItems.size === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No items unlocked yet.';
      empty.style.opacity = '0.7';
      portfolioItems.appendChild(empty);
      return;
    }

    earnedItems.forEach(itemName => {
      const item = items.find(t => t.name === itemName);
      if (!item) return;

      const row = document.createElement('div');
      row.className = 'portfolio-item';

      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = item.icon;

      const textWrap = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = item.name;

      const subtitle = document.createElement('div');
      subtitle.className = 'subtitle';
      subtitle.textContent = item.subtitle || '';

      textWrap.appendChild(name);
      if (item.subtitle) textWrap.appendChild(subtitle);

      row.appendChild(icon);
      row.appendChild(textWrap);

      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_self';
        link.style.color = 'inherit';
        link.style.textDecoration = 'none';
        link.appendChild(row);
        portfolioItems.appendChild(link);
      } else {
        portfolioItems.appendChild(row);
      }
    });
  }

  function checkItemUnlock() {
    items.forEach(item => {
      if (score >= item.pointsNeeded && !earnedItems.has(item.name)) {
        earnedItems.add(item.name);
        showBadgeEarned(item);
        updateHUD();
        updatePortfolioPanel();
      }
    });
  }

  function showBadgeEarned(item) {
    const notification = document.createElement('div');
    notification.className = 'tech-badge-earned';
    notification.innerHTML = `${item.icon} ${item.name}${item.subtitle ? `<div style="font-size:14px;opacity:0.8;margin-top:4px;">${item.subtitle}</div>` : ''}`;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 1000);
  }

  function endGame() {
    gameActive = false;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    gameContainer.classList.remove('playing');

    if (gameHUD) gameHUD.style.display = 'none';
    if (portfolioPanel) portfolioPanel.style.display = 'none';
    if (shooter) shooter.style.display = 'none';

    if (document.getElementById('finalScore')) {
      document.getElementById('finalScore').textContent = score;
    }

    const badgesEarnedContainer = document.getElementById('badgesEarned');
    if (badgesEarnedContainer) {
      badgesEarnedContainer.innerHTML = '';

      if (earnedItems.size === 0) {
        badgesEarnedContainer.innerHTML = '<div style="color: #888;">None - Try again!</div>';
      } else {
        earnedItems.forEach(itemName => {
          const item = items.find(t => t.name === itemName);
          if (!item) return;
          const row = document.createElement('div');
          row.className = 'badge-item';
          row.innerHTML = `<span class="icon">${item.icon}</span><span>${item.name}${item.subtitle ? ` — ${item.subtitle}` : ''}</span>`;
          badgesEarnedContainer.appendChild(row);
        });
      }
    }

    if (gameOver) gameOver.classList.add('active');
    updateControlsVisibility();
  }

  function startGameLoop() {
    function gameLoop() {
      if (!gameActive) return;

      if (controlDirection !== 0) {
        mouseX += controlDirection * config.controlSpeed;
        mouseX = Math.max(20, Math.min(window.innerWidth - 20, mouseX));
        shooter.style.left = mouseX + 'px';
      }

      let shouldMoveDown = false;

      invaders.forEach(inv => {
        inv.x += inv.direction * inv.speed;

        if (inv.x >= window.innerWidth - 70 || inv.x <= 20) {
          shouldMoveDown = true;
        }
      });

      if (shouldMoveDown) {
        invaders.forEach(inv => {
          inv.direction *= -1;
          inv.y += 15;
          inv.speed += 0.05;

          if (inv.y > window.innerHeight - 150) {
            endGame();
          }
        });
      }

      invaders.forEach(inv => {
        inv.element.style.left = inv.x + 'px';
        inv.element.style.top = inv.y + 'px';
      });

      bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        bullet.element.style.bottom = (window.innerHeight - bullet.y) + 'px';

        if (bullet.y < 0) {
          bullet.element.remove();
          bullets.splice(index, 1);
        }
      });

      checkCollisions();

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();
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
        'SpaceInvaders',
        PLUGIN_VERSION,
        {
          licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: false
        }
      );

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
    cleanup: cleanupGame
  };

  // ========================================
  // INITIALIZATION
  // ========================================
  async function init() {
    console.log('🔧 Initializing Space Invaders...');

    injectStyles();
    injectHTML();
    initGame();

    loadLicensing();

    console.log(`✅ Space Invaders Plugin v${PLUGIN_VERSION} Active!`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
