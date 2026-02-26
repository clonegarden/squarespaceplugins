/**
 * =======================================
 * SPACE INVADERS GAME PLUGIN - Squarespace
 * =======================================
 * @version 2.5.1
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Interactive Space Invaders game overlay for Squarespace sites.
 * Gamified portfolio presentation for tech stacks, awards, products, etc.
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

  const PLUGIN_VERSION = '2.5.1';
  console.log(`🎮 Space Invaders Plugin v${PLUGIN_VERSION} - Loading...`);

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
      invaderImage: decodeParam('invaderImage', ''),
      bgColor: parseColor(params.get('bgColor'), 'transparent'),
      fontColor: parseColor(params.get('fontColor'), 'white'),
      difficulty: decodeParam('difficulty', 'medium'),
      showPrompt: params.get('showPrompt') !== 'false',

      // ✅ Portfolio / items
      items: parseJSON(params.get('items'), null),
      portfolioTitle: decodeParam('portfolioTitle', 'PORTFOLIO UNLOCKED'),
      itemLabel: decodeParam('itemLabel', 'ITEMS'),
      scoreLabel: decodeParam('scoreLabel', 'SCORE'),

      // ✅ CTA
      endTitle: decodeParam('endTitle', 'MISSION COMPLETE!'),
      endSubtitle: decodeParam('endSubtitle', 'Items Unlocked:'),
      ctaText: decodeParam('ctaText', 'VIEW PORTFOLIO'),
      ctaLink: decodeParam('ctaLink', '/portfolio'),
      ctaTarget: decodeParam('ctaTarget', '_self'),

      // ✅ Mobile controls
      mobileControls: params.get('mobileControls') !== 'false',
      controlSpeed: parseFloat(decodeParam('controlSpeed', '8')),

      // ✅ Global kills per unlock (used when item.pointsNeeded is missing)
      killsPerItem: parseInt(decodeParam('killsPerItem', '5'), 10),

      // ✅ Trigger system
      trigger: decodeParam('trigger', 'prompt'), // prompt | time | scroll | time+scroll | key | button
      triggerTime: parseFloat(decodeParam('triggerTime', '5')), // seconds
      triggerScroll: parseFloat(decodeParam('triggerScroll', '40')), // %
      triggerKey: decodeParam('triggerKey', '+'),
      triggerButtonText: decodeParam('triggerButtonText', 'PLAY GAME'),
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
    { name: 'AI/ML', icon: '🤖', pointsNeeded: 30, subtitle: 'Intelligent Systems' },
    { name: 'PostgreSQL', icon: '🐘', pointsNeeded: 35, subtitle: 'SQL Database' },
    { name: 'AWS', icon: '☁️', pointsNeeded: 40, subtitle: 'Cloud Infrastructure' },
  ];

  const items = config.items || defaultItems;

  // ========================================
  // DIFFICULTY SETTINGS
  // ========================================
  const DIFFICULTY = {
    easy: { invaderSpeed: 0.4, bulletSpeed: 7, invaderBulletSpeed: 2, fireRate: 120, waveSize: 12 },
    medium: { invaderSpeed: 0.7, bulletSpeed: 6, invaderBulletSpeed: 3, fireRate: 80, waveSize: 18 },
    hard: { invaderSpeed: 1.1, bulletSpeed: 5, invaderBulletSpeed: 4, fireRate: 50, waveSize: 24 },
  };

  const diffSettings = DIFFICULTY[config.difficulty] || DIFFICULTY.medium;

  // ========================================
  // GAME STATE
  // ========================================
  let score = 0;
  let earnedItems = new Set();
  let gameRunning = false;
  let gameOverFlag = false;
  let animationId = null;
  let overlayEl = null;
  let canvasEl = null;
  let ctx = null;

  let shooter = null;
  let invaders = [];
  let bullets = [];
  let invaderBullets = [];
  let explosions = [];
  let wave = 0;
  let frameCount = 0;
  let invaderDir = 1;

  let mouseX = 0;
  let isShooting = false;
  let controlDirection = 0;

  let triggerTimeReady = false;
  let triggerScrollReady = false;

  // UI refs
  let portfolioPanel, portfolioItems, portfolioProgress;
  let mobileControls;

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
  // STYLES
  // ========================================
  function injectStyles() {
    if (document.getElementById('anavo-space-invaders-styles')) return;

    const style = document.createElement('style');
    style.id = 'anavo-space-invaders-styles';
    style.textContent = `
      #anavo-space-invaders-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 999990;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Syne Mono', 'Courier New', monospace;
        background: ${config.bgColor === 'transparent' ? 'rgba(0,0,0,0.85)' : config.bgColor};
        color: ${config.fontColor};
        overflow: hidden;
      }

      #anavo-space-invaders-overlay * { box-sizing: border-box; }

      #anavo-si-canvas { display: block; cursor: none; touch-action: none; max-width: 100%; }

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
      }

      #anavo-si-close:hover { opacity: 1; }

      #anavo-si-prompt {
        text-align: center;
        padding: 40px 20px;
      }

      #anavo-si-prompt h2 {
        font-size: clamp(22px, 4vw, 36px);
        margin-bottom: 12px;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
      }

      #anavo-si-prompt p {
        font-size: clamp(13px, 2vw, 16px);
        opacity: 0.8;
        margin-bottom: 24px;
        color: ${config.fontColor};
      }

      #anavo-si-prompt-start {
        background: ${config.fontColor};
        color: #000;
        border: none;
        padding: 14px 36px;
        font-size: 16px;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        margin-right: 12px;
        transition: transform 0.15s;
      }

      #anavo-si-prompt-start:hover { transform: scale(1.05); }

      #anavo-si-prompt-skip {
        background: none;
        color: ${config.fontColor};
        border: 1px solid ${config.fontColor};
        padding: 14px 36px;
        font-size: 16px;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.15s;
      }

      #anavo-si-prompt-skip:hover { opacity: 1; }

      /* ✅ Portfolio panel */
      #anavo-si-portfolio {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: min(740px, 92vw);
        background: rgba(0,0,0,0.85);
        border: 2px solid ${config.fontColor};
        padding: 14px 18px;
        text-align: left;
        display: none;
        z-index: 2;
      }

      #anavo-si-portfolio-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 10px;
      }

      #anavo-si-portfolio-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 8px 12px;
        font-size: 13px;
      }

      .anavo-si-portfolio-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.05);
      }

      .anavo-si-portfolio-item .icon { font-size: 18px; }
      .anavo-si-portfolio-item .name { font-weight: bold; }
      .anavo-si-portfolio-item .subtitle { opacity: 0.75; font-size: 12px; }

      #anavo-si-gameover {
        text-align: center;
        padding: 40px 20px;
        animation: anavo-si-fadein 0.4s ease;
      }

      #anavo-si-gameover h2 {
        font-size: clamp(24px, 5vw, 42px);
        margin-bottom: 12px;
        font-family: 'Syne Mono', monospace;
        color: ${config.fontColor};
      }

      #anavo-si-gameover p {
        font-size: 16px;
        opacity: 0.8;
        margin-bottom: 8px;
        color: ${config.fontColor};
      }

      #anavo-si-gameover .anavo-si-badges {
        margin: 20px auto;
        max-width: 400px;
      }

      #anavo-si-gameover-btns {
        margin-top: 24px;
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      #anavo-si-gameover-btns button {
        padding: 12px 28px;
        font-size: 15px;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        transition: transform 0.15s;
      }

      #anavo-si-gameover-btns button:hover { transform: scale(1.05); }

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

      #anavo-si-cta {
        display: inline-block;
        margin: 10px 0 20px;
        background: ${config.fontColor};
        color: #000;
        text-decoration: none;
        padding: 10px 24px;
        border: none;
        font-family: 'Syne Mono', monospace;
      }

      /* ✅ Mobile Controls */
      #anavo-si-mobile-controls {
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        display: none;
        gap: 12px;
        z-index: 5;
      }

      .anavo-si-control-btn {
        width: 64px;
        height: 64px;
        border: 2px solid ${config.fontColor};
        background: rgba(0,0,0,0.8);
        color: ${config.fontColor};
        font-size: 22px;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
      }

      .anavo-si-control-btn.shoot { width: 72px; height: 72px; font-size: 26px; }

      /* ✅ Trigger button */
      #anavo-si-trigger-btn {
        position: fixed;
        right: 20px;
        bottom: 80px;
        z-index: 999999;
        padding: 12px 18px;
        border: 2px solid #000;
        background: ${config.fontColor};
        color: #000;
        font-family: 'Syne Mono', monospace;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }

      @media (max-width: 768px) {
        #anavo-si-mobile-controls { display: flex; }
      }

      @keyframes anavo-si-fadein {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // DOM CREATION
  // ========================================
  function createOverlay() {
    if (overlayEl) return;

    injectStyles();

    overlayEl = document.createElement('div');
    overlayEl.id = 'anavo-space-invaders-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-label', 'Space Invaders Game');
    overlayEl.setAttribute('aria-modal', 'true');

    const closeBtn = document.createElement('button');
    closeBtn.id = 'anavo-si-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close game');
    closeBtn.addEventListener('click', skipGame);
    overlayEl.appendChild(closeBtn);

    document.body.appendChild(overlayEl);
  }

  function buildPortfolioPanel() {
    const panel = document.createElement('div');
    panel.id = 'anavo-si-portfolio';

    panel.innerHTML = `
      <div id="anavo-si-portfolio-header">
        <span>${config.portfolioTitle}</span>
        <span><span id="anavo-si-portfolio-progress">0</span> / ${items.length} ${config.itemLabel}</span>
      </div>
      <div id="anavo-si-portfolio-items"></div>
    `;

    return panel;
  }

  function showPromptScreen() {
    if (!overlayEl) createOverlay();

    Array.from(overlayEl.children).forEach(child => {
      if (child.id !== 'anavo-si-close') overlayEl.removeChild(child);
    });

    const prompt = document.createElement('div');
    prompt.id = 'anavo-si-prompt';
    prompt.innerHTML = `
      <h2>🎮 Space Invaders</h2>
      <p>Move your mouse to aim · Click to shoot · Unlock items!</p>
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

    btnRow.appendChild(startBtn);
    btnRow.appendChild(skipBtn);
    prompt.appendChild(btnRow);

    overlayEl.appendChild(prompt);
    overlayEl.style.display = 'flex';
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

    const title = document.createElement('h2');
    title.textContent = gameOverFlag ? '💀 Game Over' : config.endTitle;
    container.appendChild(title);

    const scoreP = document.createElement('p');
    scoreP.textContent = `${config.scoreLabel}: ${score}`;
    container.appendChild(scoreP);

    const badgesP = document.createElement('p');
    badgesP.textContent = `${config.endSubtitle} ${earnedItems.size} / ${items.length}`;
    container.appendChild(badgesP);

    if (earnedItems.size > 0) {
      const badgesDiv = document.createElement('div');
      badgesDiv.className = 'anavo-si-badges';
      earnedItems.forEach(name => {
        const item = items.find(t => t.name === name);
        if (item) {
          const badge = document.createElement('span');
          badge.className = 'anavo-si-badge unlocked';
          badge.textContent = `${item.icon} ${item.name}`;
          badgesDiv.appendChild(badge);
        }
      });
      container.appendChild(badgesDiv);
    }

    if (config.ctaText && config.ctaLink) {
      const cta = document.createElement('a');
      cta.id = 'anavo-si-cta';
      cta.href = config.ctaLink;
      cta.target = config.ctaTarget;
      cta.textContent = config.ctaText;
      container.appendChild(cta);
    }

    const btnRow = document.createElement('div');
    btnRow.id = 'anavo-si-gameover-btns';

    const replayBtn = document.createElement('button');
    replayBtn.className = 'anavo-si-btn-primary';
    replayBtn.textContent = '🔄 Play Again';
    replayBtn.addEventListener('click', resetGame);
    btnRow.appendChild(replayBtn);

    const closeBtn2 = document.createElement('button');
    closeBtn2.className = 'anavo-si-btn-secondary';
    closeBtn2.textContent = 'Close';
    closeBtn2.addEventListener('click', skipGame);
    btnRow.appendChild(closeBtn2);

    container.appendChild(btnRow);
    overlayEl.appendChild(container);
    overlayEl.appendChild(overlayEl.querySelector('#anavo-si-close'));
  }

  // ========================================
  // CANVAS & GAME LOGIC
  // ========================================
  function createCanvas() {
    const size = getCanvasSize();
    canvasEl = document.createElement('canvas');
    canvasEl.id = 'anavo-si-canvas';
    canvasEl.width = size.w;
    canvasEl.height = size.h;
    canvasEl.setAttribute('aria-hidden', 'true');
    ctx = canvasEl.getContext('2d');
    return canvasEl;
  }

  function getCanvasSize() {
    return {
      w: Math.min(window.innerWidth, 900),
      h: Math.min(window.innerHeight * 0.85, 600),
    };
  }

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
    }
  }

  function initGame() {
    const size = getCanvasSize();
    if (canvasEl) {
      canvasEl.width = size.w;
      canvasEl.height = size.h;
    }

    score = 0;
    earnedItems = new Set();
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

    invaderBullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
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

  function drawHUD() {
    ctx.save();
    ctx.fillStyle = config.fontColor;
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${config.scoreLabel}: ${score}`, 12, 10);
    ctx.textAlign = 'right';
    ctx.fillText(`Wave: ${wave}`, canvasEl.width - 12, 10);
    ctx.restore();
  }

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
  }

  function updateExplosions() {
    explosions = explosions.filter(exp => {
      exp.life--;
      exp.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 1 / 30;
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

  function checkItemUnlocks() {
    items.forEach((item, index) => {
      const threshold =
        typeof item.pointsNeeded === 'number'
          ? item.pointsNeeded
          : config.killsPerItem * (index + 1);

      if (!earnedItems.has(item.name) && score >= threshold) {
        earnedItems.add(item.name);
        updatePortfolioPanel();
      }
    });
  }

  function updatePortfolioPanel() {
    if (!portfolioPanel) return;
    const progress = document.getElementById('anavo-si-portfolio-progress');
    const list = document.getElementById('anavo-si-portfolio-items');
    if (!progress || !list) return;

    progress.textContent = earnedItems.size;
    list.innerHTML = '';

    if (earnedItems.size === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No items unlocked yet.';
      empty.style.opacity = '0.7';
      list.appendChild(empty);
      return;
    }

    earnedItems.forEach(name => {
      const item = items.find(t => t.name === name);
      if (!item) return;

      const row = document.createElement('div');
      row.className = 'anavo-si-portfolio-item';

      row.innerHTML = `
        <span class="icon">${item.icon}</span>
        <div>
          <div class="name">${item.name}</div>
          ${item.subtitle ? `<div class="subtitle">${item.subtitle}</div>` : ''}
        </div>
      `;

      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_self';
        link.style.color = 'inherit';
        link.style.textDecoration = 'none';
        link.appendChild(row);
        list.appendChild(link);
      } else {
        list.appendChild(row);
      }
    });
  }

  function gameLoop() {
    if (!gameRunning) return;

    const cw = canvasEl.width;
    const ch = canvasEl.height;

    ctx.clearRect(0, 0, cw, ch);

    frameCount++;

    // Move shooter toward mouse
    const targetX = Math.max(shooter.w / 2, Math.min(cw - shooter.w / 2, mouseX));
    shooter.x += (targetX - shooter.x) * 0.2;

    if (controlDirection !== 0) {
      shooter.x += controlDirection * config.controlSpeed;
      shooter.x = Math.max(shooter.w / 2, Math.min(cw - shooter.w / 2, shooter.x));
      mouseX = shooter.x;
    }

    // Move bullets
    bullets = bullets.filter(b => {
      b.y += b.vy;
      return b.y > 0;
    });

    invaderBullets = invaderBullets.filter(b => {
      b.y += b.vy;
      return b.y < ch;
    });

    // Invader movement
    const aliveInvaders = invaders.filter(inv => inv.alive);

    if (aliveInvaders.length === 0) {
      gameOverFlag = false;
      showGameOverScreen();
      return;
    }

    let hitEdge = false;
    aliveInvaders.forEach(inv => {
      inv.x += diffSettings.invaderSpeed * invaderDir * (1 + wave * 0.05);
      if (inv.x >= cw - inv.w / 2 || inv.x <= inv.w / 2) {
        hitEdge = true;
      }
    });

    if (hitEdge) {
      invaderDir *= -1;
      aliveInvaders.forEach(inv => {
        inv.y += 18;
      });
    }

    if (aliveInvaders.some(inv => inv.y >= ch - shooter.h - 10)) {
      gameOverFlag = true;
      showGameOverScreen();
      return;
    }

    if (isShooting && frameCount % 18 === 0) {
      shootBullet();
    }

    if (frameCount % diffSettings.fireRate === 0) {
      invaderShoot();
    }

    bullets.forEach(b => {
      aliveInvaders.forEach(inv => {
        if (
          inv.alive &&
          Math.abs(b.x - inv.x) < inv.w / 2 + 3 &&
          Math.abs(b.y - inv.y) < inv.h / 2 + 3
        ) {
          inv.alive = false;
          b.y = -999;
          score += 1;
          createExplosion(inv.x, inv.y);
          checkItemUnlocks();
        }
      });
    });

    invaderBullets.forEach(b => {
      if (
        Math.abs(b.x - shooter.x) < shooter.w / 2 + 3 &&
        Math.abs(b.y - shooter.y) < shooter.h / 2 + 3
      ) {
        gameOverFlag = true;
        createExplosion(shooter.x, shooter.y);
        showGameOverScreen();
        return;
      }
    });

    updateExplosions();

    drawShooter();
    drawInvaders();
    drawBullets();
    drawExplosions();
    drawHUD();

    animationId = requestAnimationFrame(gameLoop);
  }

  function stopGameLoop() {
    gameRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // ========================================
  // INPUT HANDLERS
  // ========================================
  function onMouseMove(e) {
    const rect = canvasEl ? canvasEl.getBoundingClientRect() : null;
    mouseX = rect ? e.clientX - rect.left : e.clientX;
  }

  function onMouseDown(e) {
    if (e.button === 0) {
      isShooting = true;
      shootBullet();
    }
  }

  function onMouseUp(e) {
    if (e.button === 0) {
      isShooting = false;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    const rect = canvasEl ? canvasEl.getBoundingClientRect() : null;
    const touch = e.touches[0];
    mouseX = rect ? touch.clientX - rect.left : touch.clientX;
    isShooting = true;
  }

  function onTouchEnd() {
    isShooting = false;
  }

  function attachInputListeners() {
    if (!canvasEl) return;
    canvasEl.addEventListener('mousemove', onMouseMove);
    canvasEl.addEventListener('mousedown', onMouseDown);
    canvasEl.addEventListener('mouseup', onMouseUp);
    canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
    canvasEl.addEventListener('touchend', onTouchEnd);

    // Tap anywhere to shoot
    canvasEl.addEventListener(
      'touchstart',
      e => {
        if (!gameRunning) return;
        if (e.target.closest('.anavo-si-control-btn')) return;
        isShooting = true;
        shootBullet();
        e.preventDefault();
      },
      { passive: false }
    );
  }

  function detachInputListeners() {
    if (!canvasEl) return;
    canvasEl.removeEventListener('mousemove', onMouseMove);
    canvasEl.removeEventListener('mousedown', onMouseDown);
    canvasEl.removeEventListener('mouseup', onMouseUp);
    canvasEl.removeEventListener('touchmove', onTouchMove);
    canvasEl.removeEventListener('touchend', onTouchEnd);
  }

  // ========================================
  // MOBILE CONTROLS
  // ========================================
  function initMobileControls() {
    if (!mobileControls || !config.mobileControls) return;

    const buttons = mobileControls.querySelectorAll('.anavo-si-control-btn');
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

  // ========================================
  // TRIGGER SYSTEM
  // ========================================
  function triggerGame() {
    if (config.showPrompt) {
      showPromptScreen();
    } else {
      startGame();
    }
  }

  function insertTriggerButton() {
    if (document.getElementById('anavo-si-trigger-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'anavo-si-trigger-btn';
    btn.textContent = config.triggerButtonText;
    btn.addEventListener('click', triggerGame);
    document.body.appendChild(btn);
  }

  function checkScrollTrigger() {
    const doc = document.documentElement;
    const scrollTop = window.pageYOffset || doc.scrollTop;
    const scrollHeight = doc.scrollHeight - window.innerHeight;
    const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (percent >= config.triggerScroll) {
      triggerScrollReady = true;
      if (config.trigger === 'scroll') triggerGame();
      if (config.trigger === 'time+scroll' && triggerTimeReady) triggerGame();
    }
  }

  function setupTriggers() {
    if (config.trigger === 'time') {
      setTimeout(() => {
        triggerTimeReady = true;
        triggerGame();
      }, config.triggerTime * 1000);
    }

    if (config.trigger === 'scroll' || config.trigger === 'time+scroll') {
      window.addEventListener('scroll', checkScrollTrigger, { passive: true });
      checkScrollTrigger();
    }

    if (config.trigger === 'time+scroll') {
      setTimeout(() => {
        triggerTimeReady = true;
        if (triggerScrollReady) triggerGame();
      }, config.triggerTime * 1000);
    }

    if (config.trigger === 'key') {
      document.addEventListener('keydown', e => {
        if (e.key === config.triggerKey) triggerGame();
      });
    }

    if (config.trigger === 'button') {
      insertTriggerButton();
    }
  }

  // ========================================
  // PUBLIC API
  // ========================================
  function startGame() {
    if (gameRunning) return;

    if (!overlayEl) createOverlay();

    Array.from(overlayEl.children).forEach(child => {
      if (child.id !== 'anavo-si-close') overlayEl.removeChild(child);
    });

    const hud = document.createElement('div');
    hud.id = 'anavo-si-hud';
    overlayEl.appendChild(hud);

    portfolioPanel = buildPortfolioPanel();
    overlayEl.appendChild(portfolioPanel);
    portfolioPanel.style.display = 'block';

    const canvas = createCanvas();
    overlayEl.appendChild(canvas);

    mobileControls = document.createElement('div');
    mobileControls.id = 'anavo-si-mobile-controls';
    mobileControls.innerHTML = `
      <button class="anavo-si-control-btn" data-dir="-1">◀</button>
      <button class="anavo-si-control-btn shoot" data-action="shoot">●</button>
      <button class="anavo-si-control-btn" data-dir="1">▶</button>
    `;
    overlayEl.appendChild(mobileControls);

    overlayEl.appendChild(overlayEl.querySelector('#anavo-si-close'));
    overlayEl.style.display = 'flex';

    if (config.invaderImage && !window._anavoInvaderImg) {
      window._anavoInvaderImg = new Image();
      window._anavoInvaderImg.src = config.invaderImage;
    }

    initGame();
    attachInputListeners();
    initMobileControls();
    updatePortfolioPanel();

    gameRunning = true;
    gameLoop();
  }

  function skipGame() {
    stopGameLoop();
    detachInputListeners();
    if (overlayEl) overlayEl.style.display = 'none';
  }

  function resetGame() {
    stopGameLoop();
    detachInputListeners();
    startGame();
  }

  function cleanupGame() {
    stopGameLoop();
    detachInputListeners();
    if (overlayEl && overlayEl.parentNode) {
      overlayEl.parentNode.removeChild(overlayEl);
      overlayEl = null;
    }
    const styles = document.getElementById('anavo-space-invaders-styles');
    if (styles && styles.parentNode) styles.parentNode.removeChild(styles);
    canvasEl = null;
    ctx = null;
  }

  // ========================================
  // GLOBAL API
  // ========================================
  window.SpaceInvadersGame = {
    start: startGame,
    skip: skipGame,
    reset: resetGame,
    cleanup: cleanupGame,
  };

  // ========================================
  // INIT
  // ========================================
  async function init() {
    loadLicensing().catch(() => {});

    if (config.autoStart) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGame);
      } else {
        startGame();
      }
      return;
    }

    if (config.trigger && config.trigger !== 'prompt') {
      setupTriggers();
      return;
    }

    if (config.showPrompt) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showPromptScreen);
      } else {
        showPromptScreen();
      }
    }

    console.log(`✅ Space Invaders Plugin v${PLUGIN_VERSION} - Ready`);
  }

  init();
})();
