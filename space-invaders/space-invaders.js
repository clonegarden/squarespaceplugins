/**
 * =======================================
 * SPACE INVADERS GAME PLUGIN - Squarespace
 * =======================================
 * @version 1.1.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 * 
 * GAMIFICATION SHOWCASE - Developer Tech Stack
 * Every 5 invaders destroyed = 1 technology badge unlocked
 * 
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js"></script>
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
  // ✅ 20 TECNOLOGIAS - A CADA 5 KILLS
  // ========================================
  const defaultTechStack = [
    { name: 'React', icon: '⚛️', pointsNeeded: 5 },
    { name: 'Node.js', icon: '🟢', pointsNeeded: 10 },
    { name: 'Python', icon: '🐍', pointsNeeded: 15 },
    { name: 'Vue', icon: '💚', pointsNeeded: 20 },
    { name: 'TypeScript', icon: '🔷', pointsNeeded: 25 },
    { name: 'JavaScript', icon: '💛', pointsNeeded: 30 },
    { name: 'PostgreSQL', icon: '🐘', pointsNeeded: 35 },
    { name: 'MongoDB', icon: '🍃', pointsNeeded: 40 },
    { name: 'AWS', icon: '☁️', pointsNeeded: 45 },
    { name: 'Docker', icon: '🐳', pointsNeeded: 50 },
    { name: 'Kubernetes', icon: '☸️', pointsNeeded: 55 },
    { name: 'Redis', icon: '🔴', pointsNeeded: 60 },
    { name: 'GraphQL', icon: '◐', pointsNeeded: 65 },
    { name: 'Next.js', icon: '▲', pointsNeeded: 70 },
    { name: 'Tailwind', icon: '🎨', pointsNeeded: 75 },
    { name: 'Git', icon: '🌿', pointsNeeded: 80 },
    { name: 'CI/CD', icon: '🔄', pointsNeeded: 85 },
    { name: 'REST API', icon: '🔌', pointsNeeded: 90 },
    { name: 'Serverless', icon: '⚡', pointsNeeded: 95 },
    { name: 'WebSockets', icon: '🔗', pointsNeeded: 100 }
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
      /* ANAVO SPACE INVADERS v${PLUGIN_VERSION} - GAMIFICATION SHOWCASE */
      
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 50px;
        border-radius: 12px;
        border: 4px solid white;
        font-size: 32px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        z-index: 999998 !important;
        animation: badgeEarned 1.5s ease-out forwards;
        pointer-events: none;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        text-align: center;
      }
      
      @keyframes badgeEarned {
        0% {
          transform: translate(-50%, -50%) scale(0) rotate(-180deg);
          opacity: 0;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
          opacity: 1;
        }
        75% {
          transform: translate(-50%, -50%) scale(0.95);
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0;
        }
      }
      
      /* ✅ HUD SIMPLES NO TOPO */
      .game-hud {
        position: fixed !important;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999994;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
        text-shadow: 2px 2px 4px black;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px 30px;
        border-radius: 8px;
        border: 2px solid ${config.fontColor};
        min-width: 400px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
      }
      
      /* ✅ TECH SHOWCASE - PAINEL LATERAL DIREITO */
      .tech-showcase {
        position: fixed !important;
        top: 120px;
        right: 20px;
        z-index: 999994;
        background: rgba(0, 0, 0, 0.9);
        border: 3px solid ${config.fontColor};
        border-radius: 12px;
        padding: 20px;
        max-width: 400px;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      }
      
      .tech-showcase h2 {
        color: ${config.fontColor};
        font-family: 'Syne Mono', monospace;
        font-size: 20px;
        margin: 0 0 20px 0;
        text-align: center;
        text-shadow: 2px 2px 4px black;
        border-bottom: 2px solid ${config.fontColor};
        padding-bottom: 12px;
      }
      
      .tech-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }
      
      .tech-card {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .tech-card.locked {
        opacity: 0.3;
        filter: grayscale(100%);
      }
      
      .tech-card.unlocked {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
        border-color: ${config.fontColor};
        animation: cardUnlock 0.5s ease-out;
      }
      
      @keyframes cardUnlock {
        0% {
          transform: scale(0.8) rotate(-5deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.1) rotate(5deg);
        }
        100% {
          transform: scale(1) rotate(0);
          opacity: 1;
        }
      }
      
      .tech-card-icon {
        font-size: 36px;
        margin-bottom: 8px;
        display: block;
      }
      
      .tech-card-name {
        color: ${config.fontColor};
        font-family: 'Syne Mono', monospace;
        font-size: 11px;
        font-weight: bold;
        text-shadow: 1px 1px 2px black;
      }
      
      .tech-card-lock {
        position: absolute;
        top: 5px;
        right: 5px;
        font-size: 14px;
        opacity: 0.6;
      }
      
      /* Scrollbar customizado */
      .tech-showcase {
        scrollbar-width: thin;
        scrollbar-color: ${config.fontColor} rgba(0,0,0,0.3);
      }
      
      .tech-showcase::-webkit-scrollbar {
        width: 8px;
      }
      
      .tech-showcase::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.3);
        border-radius: 4px;
      }
      
      .tech-showcase::-webkit-scrollbar-thumb {
        background: ${config.fontColor};
        border-radius: 4px;
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
        border-radius: 12px;
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
        border-radius: 8px;
        transition: all 0.2s;
        margin: 0 10px;
        text-transform: uppercase;
      }
      
      .game-prompt button:hover {
        background: #f0f0f0;
        transform: translateY(-2px);
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
        border-radius: 12px;
        border: 6px solid black;
        display: none;
        pointer-events: auto;
        max-width: 600px;
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
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 15px;
        margin: 30px 0;
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
      }
      
      .game-over .badge-final {
        font-size: 32px;
        padding: 10px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        border: 2px solid rgba(255,255,255,0.3);
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
        border-radius: 8px;
        transition: all 0.2s;
        margin: 10px;
        text-transform: uppercase;
      }
      
      .game-over button:hover {
        background: #f0f0f0;
        transform: translateY(-2px);
      }
      
      .game-over button.secondary {
        background: #333;
        color: white;
        border: 3px solid #666;
      }
      
      @media (max-width: 1200px) {
        .tech-showcase {
          right: 10px;
          max-width: 300px;
        }
        
        .tech-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @media (max-width: 768px) {
        .game-hud {
          min-width: 90%;
          padding: 12px 20px;
          font-size: 14px;
        }
        
        .tech-showcase {
          display: none !important;
        }
        
        .game-over .badges-earned {
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
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
          <h2>SHOWCASE YOUR TECH STACK</h2>
          <p>Destroy invaders • Unlock ${techStack.length} technologies • Show your skills!</p>
          <button onclick="window.SpaceInvadersGame.start()">START GAME</button>
          <button class="secondary" onclick="window.SpaceInvadersGame.skip()">SKIP</button>
        </div>
        ` : ''}
        
        <div class="game-hud" style="display: none;" id="gameHUD">
          SCORE: <span id="gameScore">0</span> │ TECHNOLOGIES: <span id="badgeCount">0</span>/${techStack.length}
        </div>
        
        <div class="tech-showcase" style="display: none;" id="techShowcase">
          <h2>🏆 TECH STACK</h2>
          <div class="tech-grid" id="techGrid"></div>
        </div>
        
        <div class="game-over" id="gameOver">
          <h2>TECH STACK COMPLETE!</h2>
          <div class="final-stats">
            <div>Final Score: <span id="finalScore">0</span></div>
            <div>Technologies Mastered: <span id="finalBadgeCount">0</span>/${techStack.length}</div>
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
  let gameContainer, gameHUD, gamePrompt, gameOver, shooter, techGrid, techShowcase, badgeCount;
  let animationFrameId = null;
  let mouseX = window.innerWidth / 2;

  function initGame() {
    gameContainer = document.getElementById('space-invaders-game');
    gameHUD = document.getElementById('gameHUD');
    gamePrompt = document.getElementById('gamePrompt');
    gameOver = document.getElementById('gameOver');
    shooter = document.getElementById('shooter');
    techGrid = document.getElementById('techGrid');
    techShowcase = document.getElementById('techShowcase');
    badgeCount = document.getElementById('badgeCount');

    if (!gameContainer) return;

    gameContainer.classList.add('active');

    // Inicializar tech grid
    renderTechGrid();

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

  function renderTechGrid() {
    if (!techGrid) return;
    
    techGrid.innerHTML = '';
    
    techStack.forEach((tech, index) => {
      const card = document.createElement('div');
      card.className = `tech-card ${earnedBadges.has(tech.name) ? 'unlocked' : 'locked'}`;
      card.id = `tech-card-${index}`;
      card.innerHTML = `
        <span class="tech-card-lock">${earnedBadges.has(tech.name) ? '✅' : '🔒'}</span>
        <span class="tech-card-icon">${tech.icon}</span>
        <div class="tech-card-name">${tech.name}</div>
      `;
      techGrid.appendChild(card);
    });
  }

  function startGame() {
    if (gamePrompt) gamePrompt.classList.add('hidden');

    if (gameHUD) gameHUD.style.display = 'block';
    if (techShowcase) techShowcase.style.display = 'block';
    if (shooter) shooter.style.display = 'block';

    gameContainer.classList.add('playing');

    gameActive = true;
    score = 0;
    earnedBadges.clear();
    bullets = [];
    invaders = [];

    updateHUD();
    renderTechGrid();

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
    if (techShowcase) techShowcase.style.display = 'none';
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

  function updateHUD() {
    if (document.getElementById('gameScore')) {
      document.getElementById('gameScore').textContent = score;
    }
    
    if (badgeCount) {
      badgeCount.textContent = earnedBadges.size;
    }
  }

  function checkBadgeUnlock() {
    techStack.forEach((tech, index) => {
      if (score >= tech.pointsNeeded && !earnedBadges.has(tech.name)) {
        earnedBadges.add(tech.name);
        showBadgeEarned(tech);
        updateTechCard(index);
        updateHUD();
      }
    });
  }

  function updateTechCard(index) {
    const card = document.getElementById(`tech-card-${index}`);
    if (card) {
      card.classList.remove('locked');
      card.classList.add('unlocked');
      const lock = card.querySelector('.tech-card-lock');
      if (lock) lock.textContent = '✅';
    }
  }

  function showBadgeEarned(tech) {
    const notification = document.createElement('div');
    notification.className = 'tech-badge-earned';
    notification.innerHTML = `
      <div>${tech.icon}</div>
      <div>${tech.name}</div>
      <div style="font-size: 18px; margin-top: 10px;">UNLOCKED!</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 1500);
  }

  function endGame() {
    gameActive = false;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    gameContainer.classList.remove('playing');

    if (gameHUD) gameHUD.style.display = 'none';
    if (techShowcase) techShowcase.style.display = 'none';
    if (shooter) shooter.style.display = 'none';

    if (document.getElementById('finalScore')) {
      document.getElementById('finalScore').textContent = score;
    }

    if (document.getElementById('finalBadgeCount')) {
      document.getElementById('finalBadgeCount').textContent = earnedBadges.size;
    }

    const badgesEarnedContainer = document.getElementById('badgesEarned');
    if (badgesEarnedContainer) {
      badgesEarnedContainer.innerHTML = '';

      if (earnedBadges.size === 0) {
        badgesEarnedContainer.innerHTML = '<div style="grid-column: 1/-1; color: #888;">No technologies unlocked - Try again!</div>';
      } else {
        earnedBadges.forEach(badgeName => {
          const tech = techStack.find(t => t.name === badgeName);
          const badge = document.createElement('div');
          badge.className = 'badge-final';
          badge.textContent = tech.icon;
          badge.title = tech.name;
          badgesEarnedContainer.appendChild(badge);
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
      ⚠️ Unlicensed Version • <a href="https://anavotech.com/plugins/space-invaders" target="_blank" style="color: white;">Get License</a>
    `;
    watermark.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px 20px;
      border: 2px solid black;
      font-family: 'Syne Mono', monospace;
      font-size: 12px;
      z-index: 999999;
      pointer-events: auto;
      border-radius: 8px;
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
    console.log(`   📊 ${techStack.length} technologies available`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
