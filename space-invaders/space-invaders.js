/**
 * =======================================
 * SPACE INVADERS GAME PLUGIN - Squarespace
 * =======================================
 * @version 1.3.0
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

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.3.0';
  const PLUGIN_NAME = 'SpaceInvaders';
  console.log(`🎮 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

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
      fontColor: parseColor(params.get('fontColor'), '#ffffff'),
      accentColor: parseColor(params.get('accentColor'), '#ffffff'),
      difficulty: decodeParam('difficulty', 'medium'),

      showPrompt: params.get('showPrompt') !== 'false',
      showHUD: params.get('showHUD') !== 'false',
      showPortfolioPanel: params.get('showPortfolioPanel') !== 'false',

      promptTitle: decodeParam('promptTitle', 'PLAY TO UNLOCK OUR PORTFOLIO'),
      promptSubtitle: decodeParam(
        'promptSubtitle',
        'Shoot invaders • Unlock items • Explore our work'
      ),
      startButtonText: decodeParam('startButtonText', 'START GAME'),
      skipButtonText: decodeParam('skipButtonText', 'SKIP'),

      portfolioTitle: decodeParam('portfolioTitle', 'PORTFOLIO UNLOCKED'),
      scoreLabel: decodeParam('scoreLabel', 'SCORE'),
      itemLabel: decodeParam('itemLabel', 'ITEMS'),

      endTitle: decodeParam('endTitle', 'PORTFOLIO SUMMARY'),
      endSubtitle: decodeParam('endSubtitle', 'Unlocked items'),
      ctaText: decodeParam('ctaText', 'VIEW PORTFOLIO'),
      ctaLink: decodeParam('ctaLink', '/portfolio'),
      ctaTarget: decodeParam('ctaTarget', '_self'),

      mobileControls: params.get('mobileControls') !== 'false',
      controlSpeed: parseFloat(decodeParam('controlSpeed', '8')),

      items: parseJSON(params.get('items'), null),
    };
  }

  const config = getScriptParams();

  // ========================================
  // DEFAULT ITEMS
  // ========================================
  const defaultItems = [
    { name: 'React', icon: '⚛️', pointsNeeded: 5, subtitle: 'UI Library' },
    { name: 'Node.js', icon: '🟢', pointsNeeded: 10, subtitle: 'Backend Runtime' },
    { name: 'Python', icon: '🐍', pointsNeeded: 15, subtitle: 'Data & Automation' },
    { name: 'Vue', icon: '💚', pointsNeeded: 20, subtitle: 'Frontend Framework' },
    { name: 'TypeScript', icon: '🔷', pointsNeeded: 25, subtitle: 'Typed JS' },
    { name: 'JavaScript', icon: '💛', pointsNeeded: 30, subtitle: 'Core Language' },
    { name: 'PostgreSQL', icon: '🐘', pointsNeeded: 35, subtitle: 'SQL Database' },
    { name: 'AWS', icon: '☁️', pointsNeeded: 40, subtitle: 'Cloud Infrastructure' },
  ];

  const items = config.items || defaultItems;

  // ========================================
  // DIFFICULTY SETTINGS
  // ========================================
  const difficultySettings = {
    easy: { invaderSpeed: 0.35, bulletSpeed: 7, fireRate: 120, waveSize: 14 },
    medium: { invaderSpeed: 0.6, bulletSpeed: 6, fireRate: 90, waveSize: 18 },
    hard: { invaderSpeed: 0.9, bulletSpeed: 5, fireRate: 60, waveSize: 24 },
  };

  const difficulty = difficultySettings[config.difficulty] || difficultySettings.medium;

  // ========================================
  // STATE
  // ========================================
  let gameRunning = false;
  let score = 0;
  let earnedItems = new Set();
  let animationId = null;
  let overlayEl = null;
  let canvasEl = null;
  let ctx = null;

  let shooter = null;
  let invaders = [];
  let bullets = [];
  let wave = 0;
  let frameCount = 0;
  let invaderDir = 1;

  let mouseX = 0;
  let isShooting = false;
  let controlDirection = 0;

  // DOM references
  let promptEl, hudEl, scoreEl, badgeCountEl, badgeListEl;
  let portfolioPanelEl, portfolioListEl, portfolioProgressEl;
  let gameOverEl, gameOverScoreEl, gameOverListEl;
  let mobileControlsEl;

  function isMobileViewport() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  }

  // ========================================
  // STYLES
  // ========================================
  function injectStyles() {
    if (document.getElementById('anavo-space-invaders-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'anavo-space-invaders-styles';
    styles.textContent = `
      /* ANAVO SPACE INVADERS v${PLUGIN_VERSION} */

      #anavo-si-overlay {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999990;
        background: ${config.bgColor};
        pointer-events: none;
      }

      #anavo-si-overlay.active {
        display: flex;
        pointer-events: auto;
      }

      #anavo-si-overlay.playing {
        cursor: none;
      }

      #anavo-si-canvas {
        display: block;
        max-width: 100%;
        touch-action: none;
      }

      .anavo-si-prompt,
      .anavo-si-gameover {
        position: absolute;
        inset: auto;
        text-align: center;
        z-index: 999999;
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        padding: 50px 70px;
        border: 6px solid black;
        font-family: 'Syne Mono', monospace;
        color: #fff;
      }

      .anavo-si-prompt.hidden {
        display: none !important;
      }

      .anavo-si-prompt h2,
      .anavo-si-gameover h2 {
        font-size: 28px;
        margin: 0 0 20px 0;
        text-shadow: 3px 3px 0 black;
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .anavo-si-prompt p {
        color: #ccc;
        font-size: 16px;
        margin: 0 0 35px 0;
        text-shadow: 1px 1px 0 black;
      }

      .anavo-si-btn {
        background: white;
        color: black;
        border: 3px solid black;
        padding: 15px 40px;
        font-size: 18px;
        font-weight: bold;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        margin: 0 10px;
        text-transform: uppercase;
      }

      .anavo-si-btn.secondary {
        background: #333;
        color: white;
        border: 3px solid #666;
      }

      .anavo-si-hud {
        position: absolute;
        top: 140px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999994;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
        text-shadow: 2px 2px 0 black;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px 30px;
        border: 3px solid ${config.fontColor};
        min-width: 360px;
        text-align: center;
        display: none;
      }

      .anavo-si-hud-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-weight: bold;
      }

      .anavo-si-badges {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        min-height: 28px;
      }

      .anavo-si-badge-icon {
        font-size: 22px;
        animation: badgeSlideIn 0.3s ease-out;
      }

      @keyframes badgeSlideIn {
        from { transform: scale(0) rotate(-180deg); opacity: 0; }
        to { transform: scale(1) rotate(0); opacity: 1; }
      }

      .anavo-si-portfolio-panel {
        position: absolute;
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

      .anavo-si-portfolio-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .anavo-si-portfolio-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 8px 16px;
        font-size: 14px;
      }

      .anavo-si-portfolio-item {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255,255,255,0.06);
        padding: 6px 10px;
        border: 1px solid rgba(255,255,255,0.15);
      }

      .anavo-si-portfolio-item .icon {
        font-size: 18px;
      }

      .anavo-si-portfolio-item .name {
        font-weight: bold;
      }

      .anavo-si-portfolio-item .subtitle {
        font-size: 12px;
        opacity: 0.8;
      }

      .anavo-si-gameover {
        display: none;
      }

      .anavo-si-gameover.active {
        display: block;
      }

      .anavo-si-gameover .final-stats {
        color: #ccc;
        font-size: 16px;
        margin: 16px 0;
      }

      .anavo-si-gameover .badges-earned {
        display: grid;
        gap: 8px;
        margin: 20px 0;
        font-size: 15px;
      }

      .anavo-si-gameover .badge-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .anavo-si-gameover a.game-cta {
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
        position: absolute;
        bottom: 60px;
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
        .anavo-si-portfolio-panel {
          width: 92vw;
          padding: 12px 18px;
        }

        .anavo-si-portfolio-header {
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }

        .anavo-si-hud {
          top: 160px;
          min-width: 90%;
        }

        .si-mobile-controls {
          display: flex;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  // ========================================
  // DOM
  // ========================================
  function buildOverlay() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'anavo-si-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-label', 'Space Invaders Game');
    overlayEl.setAttribute('aria-modal', 'true');

    // Canvas
    canvasEl = document.createElement('canvas');
    canvasEl.id = 'anavo-si-canvas';
    overlayEl.appendChild(canvasEl);

    // Prompt
    if (config.showPrompt) {
      promptEl = document.createElement('div');
      promptEl.className = 'anavo-si-prompt';
      promptEl.innerHTML = `
        <h2>${config.promptTitle}</h2>
        <p>${config.promptSubtitle}</p>
        <button class="anavo-si-btn" id="anavo-si-start">${config.startButtonText}</button>
        <button class="anavo-si-btn secondary" id="anavo-si-skip">${config.skipButtonText}</button>
      `;
      overlayEl.appendChild(promptEl);
    }

    // Portfolio panel
    portfolioPanelEl = document.createElement('div');
    portfolioPanelEl.className = 'anavo-si-portfolio-panel';
    portfolioPanelEl.innerHTML = `
      <div class="anavo-si-portfolio-header">
        <span>${config.portfolioTitle}</span>
        <span><span id="anavo-si-portfolio-progress">0</span> / ${items.length} ${config.itemLabel}</span>
      </div>
      <div class="anavo-si-portfolio-items" id="anavo-si-portfolio-items"></div>
    `;
    overlayEl.appendChild(portfolioPanelEl);

    // HUD
    hudEl = document.createElement('div');
    hudEl.className = 'anavo-si-hud';
    hudEl.innerHTML = `
      <div class="anavo-si-hud-header">
        <span>${config.scoreLabel}: <span id="anavo-si-score">0</span></span>
        <span>${config.itemLabel}: <span id="anavo-si-count">0</span></span>
      </div>
      <div class="anavo-si-badges" id="anavo-si-badges"></div>
    `;
    overlayEl.appendChild(hudEl);

    // Mobile controls
    mobileControlsEl = document.createElement('div');
    mobileControlsEl.className = 'si-mobile-controls';
    mobileControlsEl.innerHTML = `
      <button class="si-control-button" data-dir="-1" aria-label="Move left">◀</button>
      <button class="si-control-button shoot" data-action="shoot" aria-label="Shoot">●</button>
      <button class="si-control-button" data-dir="1" aria-label="Move right">▶</button>
    `;
    overlayEl.appendChild(mobileControlsEl);

    // Game Over
    gameOverEl = document.createElement('div');
    gameOverEl.className = 'anavo-si-gameover';
    gameOverEl.innerHTML = `
      <h2>${config.endTitle}</h2>
      <div class="final-stats">
        <div>${config.scoreLabel}: <span id="anavo-si-final-score">0</span></div>
        <div>${config.endSubtitle}</div>
      </div>
      <div class="badges-earned" id="anavo-si-gameover-items"></div>
      ${
        config.ctaText && config.ctaLink
          ? `<a class="game-cta" href="${config.ctaLink}" target="${config.ctaTarget}">${config.ctaText}</a>`
          : ''
      }
      <div>
        <button class="anavo-si-btn" id="anavo-si-replay">PLAY AGAIN</button>
        <button class="anavo-si-btn secondary" id="anavo-si-close">CONTINUE</button>
      </div>
    `;
    overlayEl.appendChild(gameOverEl);

    document.body.appendChild(overlayEl);
  }

  function cacheDOM() {
    scoreEl = document.getElementById('anavo-si-score');
    badgeCountEl = document.getElementById('anavo-si-count');
    badgeListEl = document.getElementById('anavo-si-badges');

    portfolioProgressEl = document.getElementById('anavo-si-portfolio-progress');
    portfolioListEl = document.getElementById('anavo-si-portfolio-items');

    gameOverScoreEl = document.getElementById('anavo-si-final-score');
    gameOverListEl = document.getElementById('anavo-si-gameover-items');
  }

  // ========================================
  // GAME SETUP
  // ========================================
  function resizeCanvas() {
    const w = Math.min(window.innerWidth, 900);
    const h = Math.min(window.innerHeight * 0.85, 600);
    canvasEl.width = w;
    canvasEl.height = h;
  }

  function initGameState() {
    score = 0;
    earnedItems = new Set();
    invaders = [];
    bullets = [];
    wave = 0;
    frameCount = 0;
    invaderDir = 1;
    mouseX = canvasEl.width / 2;
    shooter = {
      x: canvasEl.width / 2,
      y: canvasEl.height - 36,
      w: 28,
      h: 28,
      speed: 6,
    };
  }

  // ========================================
  // GAME SPAWN
  // ========================================
  function spawnWave() {
    wave++;
    invaders = [];
    invaderDir = 1;

    const cols = Math.ceil(Math.sqrt(difficulty.waveSize));
    const rows = Math.ceil(difficulty.waveSize / cols);
    const spacingX = canvasEl.width / (cols + 1);
    const spacingY = 50;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (invaders.length >= difficulty.waveSize) break;
        invaders.push({
          x: spacingX * (c + 1),
          y: 60 + r * spacingY,
          w: 28,
          h: 28,
          alive: true,
        });
      }
    }
  }

  // ========================================
  // RENDER
  // ========================================
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
      if (window._anavoInvaderImg && window._anavoInvaderImg.complete) {
        ctx.drawImage(window._anavoInvaderImg, inv.x - inv.w / 2, inv.y - inv.h / 2, inv.w, inv.h);
      } else {
        ctx.fillStyle = config.fontColor;
        ctx.font = `${inv.w}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👾', inv.x, inv.y);
      }
      ctx.restore();
    });
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
  }

  // ========================================
  // COLLISIONS + UNLOCK
  // ========================================
  function checkCollisions() {
    invaders.forEach(inv => {
      if (!inv.alive) return;
      bullets.forEach(b => {
        if (
          Math.abs(b.x - inv.x) < inv.w / 2 + 3 &&
          Math.abs(b.y - inv.y) < inv.h / 2 + 3
        ) {
          inv.alive = false;
          b.y = -999;
          score += 1;
          updateHUD();
          checkItemUnlocks();
        }
      });
    });
  }

  function checkItemUnlocks() {
    items.forEach(item => {
      if (!earnedItems.has(item.name) && score >= item.pointsNeeded) {
        earnedItems.add(item.name);
        updateHUD();
        updatePortfolioPanel();
      }
    });
  }

  // ========================================
  // HUD + PORTFOLIO PANEL
  // ========================================
  function updateHUD() {
    if (scoreEl) scoreEl.textContent = score;
    if (badgeCountEl) badgeCountEl.textContent = earnedItems.size;

    if (badgeListEl) {
      badgeListEl.innerHTML = '';
      earnedItems.forEach(itemName => {
        const item = items.find(t => t.name === itemName);
        if (!item) return;
        const badge = document.createElement('span');
        badge.className = 'anavo-si-badge-icon';
        badge.textContent = item.icon;
        badge.title = item.name;
        badgeListEl.appendChild(badge);
      });
    }
  }

  function updatePortfolioPanel() {
    if (!portfolioProgressEl || !portfolioListEl) return;

    portfolioProgressEl.textContent = earnedItems.size;
    portfolioListEl.innerHTML = '';

    if (earnedItems.size === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No items unlocked yet.';
      empty.style.opacity = '0.7';
      portfolioListEl.appendChild(empty);
      return;
    }

    earnedItems.forEach(itemName => {
      const item = items.find(t => t.name === itemName);
      if (!item) return;

      const row = document.createElement('div');
      row.className = 'anavo-si-portfolio-item';

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
        portfolioListEl.appendChild(link);
      } else {
        portfolioListEl.appendChild(row);
      }
    });
  }

  // ========================================
  // LOOP
  // ========================================
  function gameLoop() {
    if (!gameRunning) return;

    const cw = canvasEl.width;
    const ch = canvasEl.height;
    ctx.clearRect(0, 0, cw, ch);

    frameCount++;

    // Shooter move
    const targetX = Math.max(shooter.w / 2, Math.min(cw - shooter.w / 2, mouseX));
    shooter.x += (targetX - shooter.x) * 0.2;

    if (controlDirection !== 0) {
      shooter.x += controlDirection * config.controlSpeed;
      shooter.x = Math.max(shooter.w / 2, Math.min(cw - shooter.w / 2, shooter.x));
      mouseX = shooter.x;
    }

    // Bullets
    bullets = bullets.filter(b => {
      b.y -= difficulty.bulletSpeed;
      return b.y > 0;
    });

    // Invaders
    const aliveInvaders = invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) {
      endGame();
      return;
    }

    let hitEdge = false;
    aliveInvaders.forEach(inv => {
      inv.x += difficulty.invaderSpeed * invaderDir;
      if (inv.x >= cw - inv.w / 2 || inv.x <= inv.w / 2) hitEdge = true;
    });

    if (hitEdge) {
      invaderDir *= -1;
      aliveInvaders.forEach(inv => {
        inv.y += 18;
      });
    }

    if (aliveInvaders.some(inv => inv.y >= ch - shooter.h - 10)) {
      endGame();
      return;
    }

    // Shooting
    if (isShooting && frameCount % 18 === 0) {
      shootBullet();
    }

    // Collisions
    checkCollisions();

    // Draw
    drawShooter();
    drawInvaders();
    drawBullets();

    animationId = requestAnimationFrame(gameLoop);
  }

  function shootBullet() {
    bullets.push({
      x: shooter.x,
      y: shooter.y - shooter.h / 2,
    });
  }

  // ========================================
  // CONTROLS
  // ========================================
  function bindControls() {
    canvasEl.addEventListener('mousemove', e => {
      const rect = canvasEl.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
    });

    canvasEl.addEventListener('mousedown', e => {
      if (e.button === 0) {
        isShooting = true;
        shootBullet();
      }
    });

    canvasEl.addEventListener('mouseup', () => {
      isShooting = false;
    });

    canvasEl.addEventListener(
      'touchstart',
      e => {
        if (!gameRunning) return;
        if (e.target.closest('.si-control-button')) return;
        const rect = canvasEl.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        isShooting = true;
        shootBullet();
        e.preventDefault();
      },
      { passive: false }
    );

    canvasEl.addEventListener(
      'touchmove',
      e => {
        const rect = canvasEl.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        e.preventDefault();
      },
      { passive: false }
    );

    canvasEl.addEventListener('touchend', () => {
      isShooting = false;
    });

    const buttons = mobileControlsEl.querySelectorAll('.si-control-button');
    buttons.forEach(btn => {
      const dir = parseInt(btn.getAttribute('data-dir'), 10);
      const action = btn.getAttribute('data-action');

      if (action === 'shoot') {
        const shootHandler = e => {
          e.preventDefault();
          if (gameRunning) shootBullet();
        };
        btn.addEventListener('touchstart', shootHandler, { passive: false });
        btn.addEventListener('click', shootHandler);
      } else {
        const startMove = e => {
          e.preventDefault();
          if (gameRunning) controlDirection = dir;
        };
        const stopMove = () => {
          controlDirection = 0;
        };
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
    if (!config.mobileControls) {
      mobileControlsEl.style.display = 'none';
      return;
    }
    if (isMobileViewport() && gameRunning) {
      mobileControlsEl.style.display = 'flex';
    } else {
      mobileControlsEl.style.display = 'none';
    }
  }

  // ========================================
  // GAME FLOW
  // ========================================
  function startGame() {
    if (promptEl) promptEl.classList.add('hidden');
    if (config.showHUD) hudEl.style.display = 'block';
    if (config.showPortfolioPanel) portfolioPanelEl.style.display = 'block';

    gameOverEl.classList.remove('active');
    overlayEl.classList.add('playing');

    initGameState();
    spawnWave();
    updateHUD();
    updatePortfolioPanel();

    gameRunning = true;
    updateControlsVisibility();
    gameLoop();
  }

  function endGame() {
    gameRunning = false;
    if (animationId) cancelAnimationFrame(animationId);

    overlayEl.classList.remove('playing');
    hudEl.style.display = 'none';
    portfolioPanelEl.style.display = 'none';

    if (gameOverScoreEl) gameOverScoreEl.textContent = score;

    if (gameOverListEl) {
      gameOverListEl.innerHTML = '';
      if (earnedItems.size === 0) {
        gameOverListEl.innerHTML = '<div style="color:#888;">None - Try again!</div>';
      } else {
        earnedItems.forEach(itemName => {
          const item = items.find(t => t.name === itemName);
          if (!item) return;
          const row = document.createElement('div');
          row.className = 'badge-item';
          row.innerHTML = `<span class="icon">${item.icon}</span><span>${item.name}${item.subtitle ? ` — ${item.subtitle}` : ''}</span>`;
          gameOverListEl.appendChild(row);
        });
      }
    }

    gameOverEl.classList.add('active');
    updateControlsVisibility();
  }

  function skipGame() {
    gameRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    overlayEl.classList.remove('active');
  }

  function resetGame() {
    gameOverEl.classList.remove('active');
    if (config.showPrompt && promptEl) {
      promptEl.classList.remove('hidden');
    } else {
      startGame();
    }
    overlayEl.classList.remove('playing');
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

      const licenseManager = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
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
    watermark.innerHTML = `⚠️ Unlicensed Version • <a href="https://anavotech.com/plugins/space-invaders">Get License</a>`;
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
  // INIT
  // ========================================
  function init() {
    injectStyles();
    buildOverlay();
    cacheDOM();

    ctx = canvasEl.getContext('2d');
    resizeCanvas();

    if (config.invaderImage && !window._anavoInvaderImg) {
      window._anavoInvaderImg = new Image();
      window._anavoInvaderImg.src = config.invaderImage;
    }

    overlayEl.classList.add('active');

    bindControls();
    updateControlsVisibility();

    if (config.showPrompt && promptEl) {
      document.getElementById('anavo-si-start')?.addEventListener('click', startGame);
      document.getElementById('anavo-si-skip')?.addEventListener('click', skipGame);
    }

    document.getElementById('anavo-si-replay')?.addEventListener('click', startGame);
    document.getElementById('anavo-si-close')?.addEventListener('click', skipGame);

    window.addEventListener('resize', resizeCanvas);

    if (config.autoStart) {
      startGame();
    }

    loadLicensing();
    console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} Active!`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
