/**
 * =======================================
 * SPACE INVADERS GAME PLUGIN - Squarespace
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 * 
 * Interactive Space Invaders game overlay for Squarespace sites.
 * Perfect for tech portfolios, developer showcases, and gamified experiences.
 * 
 * BADGE SYSTEM: Every 10 invaders destroyed = 1 tech badge unlocked
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

  const PLUGIN_VERSION = '1.0.0';
  console.log(`🎮 Space Invaders Plugin v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // GET URL PARAMETERS
  // ========================================
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    function parseJSON(str, fallback) {
      try {
        return JSON.parse(decodeURIComponent(str));
      } catch (e) {
        return fallback;
      }
    }

    return {
      autoStart: params.get('autoStart') === 'true',
      shooterIcon: params.get('shooterIcon') || '▲',
      invaderImage: params.get('invaderImage') || 'https://images.squarespace-cdn.com/content/v1/6931f12ce64c6418b6bc54b7/44374135-dee7-4a80-b72b-4c6810f225ee/Anavo+Tech%2C+Full+Stack+Developer%403x.png',
      bgColor: params.get('bgColor') || 'transparent',
      fontColor: params.get('fontColor') || 'white',
      difficulty: params.get('difficulty') || 'medium',
      showPrompt: params.get('showPrompt') !== 'false',
      customTechs: parseJSON(params.get('customTechs'), null)
    };
  }

  const config = getScriptParams();

  // ========================================
  // ✅ TECH STACK - 10 BADGES (A CADA 10 KILLS)
  // ========================================
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

  const techStack = config.customTechs || defaultTechStack;

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
        font-size: 24px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        z-index: 999998 !important;
        animation: badgeEarned 1s ease-out forwards;
        pointer-events: none;
        box-shadow: 0 0 0 2px white, 0 0 0 4px black;
      }
      
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
      
      /* ✅ HUD CORRIGIDO - VISUAL MELHORADO */
      .game-hud {
        position: fixed !important;
        top: 20px;
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
        from {
          transform: scale(0) rotate(-180deg);
          opacity: 0;
        }
        to {
          transform: scale(1) rotate(0);
          opacity: 1;
        }
      }
      
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
      
      .game-prompt.hidden {
        display: none !important;
      }
      
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
      
      .game-over .badges-earned {
        display: flex;
        justify-content: center;
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
        border-radius: 0;
        transition: all 0.1s;
        margin: 10px;
        text-transform: uppercase;
      }
      
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
  let earnedBadges = new Set();
  let gameContainer, gameHUD, gamePrompt, gameOver, shooter, badgesList, badgeCount;
  let animationFrameId = null;
  let mouseX = window.innerWidth / 2;

  function initGame() {
    gameContainer = document.getElementById('space-invaders-game');
    gameHUD = document.getElementById('gameHUD');
    gamePrompt = document.getElementById('gamePrompt');
    gameOver = document.getElementById('gameOver');
    shooter = document.getElementById('shooter');
    badgesList = document.getElementById('badgesList');
    badgeCount = document.getElementById('badgeCount');

    if (!gameContainer) return;

    gameContainer.classList.add('active');

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

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 100 && gameActive) {
        cleanupGame();
      }
    });

    if (config.autoStart) {
      startGame();
    }
  }

  function startGame() {
    if (gamePrompt) gamePrompt.classList.add('hidden');

    if (gameHUD) gameHUD.style.display = 'block';
    if (shooter) shooter.style.display = 'block';

    gameContainer.classList.add('playing');

    gameActive = true;
    score = 0;
    earnedBadges.clear();
    bullets = [];
    invaders = [];

    updateHUD();

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
    checkBadgeUnlock();

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

  // ✅ FUNÇÃO CORRIGIDA: Atualiza HUD com badges
  function updateHUD() {
    if (document.getElementById('gameScore')) {
      document.getElementById('gameScore').textContent = score;
    }
    
    if (badgeCount) {
      badgeCount.textContent = earnedBadges.size;
    }
    
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
    }
  }

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

  function showBadgeEarned(tech) {
    const notification = document.createElement('div');
    notification.className = 'tech-badge-earned';
    notification.innerHTML = `${tech.icon} ${tech.name} UNLOCKED!`;
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
    if (shooter) shooter.style.display = 'none';

    if (document.getElementById('finalScore')) {
      document.getElementById('finalScore').textContent = score;
    }

    const badgesEarnedContainer = document.getElementById('badgesEarned');
    if (badgesEarnedContainer) {
      badgesEarnedContainer.innerHTML = '';

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

    if (gameOver) gameOver.classList.add('active');
  }

  function startGameLoop() {
    function gameLoop() {
      if (!gameActive) return;

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
