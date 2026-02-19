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
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/space-invaders/space-invaders.min.js"></script>
 *
 * CUSTOMIZATION:
 * Add URL parameters: ?autoStart=true&difficulty=hard&bgColor=000000
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
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
    const src = currentScript.src;
    let params;
    try {
      const url = new URL(src);
      params = new URLSearchParams(url.search);
    } catch (_e) {
      params = new URLSearchParams('');
    }

    let customTechs = null;
    const rawCustomTechs = params.get('customTechs');
    if (rawCustomTechs) {
      try {
        customTechs = JSON.parse(decodeURIComponent(rawCustomTechs));
      } catch (_e) {
        console.warn('⚠️ Space Invaders: invalid customTechs JSON, using defaults');
      }
    }

    return {
      autoStart: params.get('autoStart') === 'true',
      shooterIcon: params.get('shooterIcon') || '▲',
      invaderImage: params.get('invaderImage') || '',
      bgColor: params.get('bgColor') || 'transparent',
      fontColor: params.get('fontColor') || 'white',
      difficulty: params.get('difficulty') || 'medium',
      showTechTable: params.get('showTechTable') !== 'false',
      showPrompt: params.get('showPrompt') !== 'false',
      customTechs: customTechs,
    };
  }

  const config = getScriptParams();
  console.log('⚙️ Space Invaders Config:', config);

  // ========================================
  // DEFAULT TECH STACK
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
  ];

  const TECH_STACK = config.customTechs || DEFAULT_TECHS;

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

      #anavo-si-close:hover {
        opacity: 1;
      }

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
        color: ${config.bgColor === 'transparent' ? '#000' : '#' + config.bgColor.replace('#', '')};
        border: none;
        padding: 14px 36px;
        font-size: 16px;
        font-family: 'Syne Mono', monospace;
        cursor: pointer;
        margin-right: 12px;
        transition: transform 0.15s;
      }

      #anavo-si-prompt-start:hover {
        transform: scale(1.05);
      }

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

      #anavo-si-prompt-skip:hover {
        opacity: 1;
      }

      #anavo-si-tech-table {
        margin-top: 28px;
        width: 100%;
        max-width: 480px;
      }

      #anavo-si-tech-table h3 {
        font-size: 13px;
        margin-bottom: 10px;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: ${config.fontColor};
      }

      .anavo-si-badges {
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
      }

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
      }

      @media (prefers-reduced-motion: reduce) {
        .anavo-si-badge, #anavo-si-prompt-start, #anavo-si-prompt-skip {
          transition: none;
        }
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

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'anavo-si-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close game');
    closeBtn.addEventListener('click', skipGame);
    overlayEl.appendChild(closeBtn);

    document.body.appendChild(overlayEl);
  }

  function buildTechBadges(containerId) {
    const wrapper = document.createElement('div');
    wrapper.id = containerId || 'anavo-si-tech-table';

    const title = document.createElement('h3');
    title.textContent = 'Tech Badges';
    wrapper.appendChild(title);

    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'anavo-si-badges';

    TECH_STACK.forEach(tech => {
      const badge = document.createElement('span');
      badge.className = 'anavo-si-badge';
      badge.id = `anavo-si-badge-${tech.name.replace(/[^a-z0-9]/gi, '_')}`;
      badge.setAttribute('aria-label', `${tech.name} badge - ${tech.pointsNeeded} points needed`);
      badge.textContent = `${tech.icon} ${tech.name}`;
      badgesDiv.appendChild(badge);
    });

    wrapper.appendChild(badgesDiv);
    return wrapper;
  }

  function showPromptScreen() {
    if (!overlayEl) createOverlay();

    // Clear overlay content (except close button)
    Array.from(overlayEl.children).forEach(child => {
      if (child.id !== 'anavo-si-close') overlayEl.removeChild(child);
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

    btnRow.appendChild(startBtn);
    btnRow.appendChild(skipBtn);
    prompt.appendChild(btnRow);

    if (config.showTechTable) {
      prompt.appendChild(buildTechBadges('anavo-si-tech-table'));
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

    const title = document.createElement('h2');
    title.textContent = gameOverFlag ? '💀 Game Over' : '🏆 Wave Cleared!';
    container.appendChild(title);

    const scoreP = document.createElement('p');
    scoreP.textContent = `Score: ${score}`;
    container.appendChild(scoreP);

    const badgesP = document.createElement('p');
    badgesP.textContent = `Badges unlocked: ${earnedBadges.size} / ${TECH_STACK.length}`;
    container.appendChild(badgesP);

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
    earnedBadges = new Set();
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
  }

  function gameLoop() {
    if (!gameRunning) return;

    const cw = canvasEl.width;
    const ch = canvasEl.height;

    // Clear
    ctx.clearRect(0, 0, cw, ch);

    frameCount++;

    // Move shooter toward mouse
    const targetX = Math.max(shooter.w / 2, Math.min(cw - shooter.w / 2, mouseX));
    shooter.x += (targetX - shooter.x) * 0.2;

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
      // Wave cleared
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

    // Invader reaches bottom = game over
    if (aliveInvaders.some(inv => inv.y >= ch - shooter.h - 10)) {
      gameOverFlag = true;
      showGameOverScreen();
      return;
    }

    // Auto shoot
    if (isShooting && frameCount % 18 === 0) {
      shootBullet();
    }

    // Invader fires
    if (frameCount % diffSettings.fireRate === 0) {
      invaderShoot();
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
        }
      });
    });

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
      }
    });

    // Update explosions
    updateExplosions();

    // Draw
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
    if (rect) {
      mouseX = e.clientX - rect.left;
    } else {
      mouseX = e.clientX;
    }
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
    if (rect) {
      mouseX = touch.clientX - rect.left;
    } else {
      mouseX = touch.clientX;
    }
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
  // SCROLL DETECTION (auto-hide)
  // ========================================

  let scrollTimeout = null;

  function onScroll() {
    if (!gameRunning) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // no action on scroll during gameplay - keep game visible
    }, 300);
  }

  // ========================================
  // PUBLIC API
  // ========================================

  function startGame() {
    if (gameRunning) return;

    if (!overlayEl) createOverlay();

    // Clear prompt, show canvas
    Array.from(overlayEl.children).forEach(child => {
      if (child.id !== 'anavo-si-close') overlayEl.removeChild(child);
    });

    // HUD
    const hud = document.createElement('div');
    hud.id = 'anavo-si-hud';
    overlayEl.appendChild(hud);

    // Canvas
    const canvas = createCanvas();
    overlayEl.appendChild(canvas);

    // Re-add close button on top
    overlayEl.appendChild(overlayEl.querySelector('#anavo-si-close'));

    overlayEl.style.display = 'flex';

    // Preload custom invader image if set
    if (config.invaderImage && !window._anavoInvaderImg) {
      window._anavoInvaderImg = new Image();
      window._anavoInvaderImg.src = config.invaderImage;
    }

    initGame();
    attachInputListeners();

    gameRunning = true;
    gameLoop();
  }

  function skipGame() {
    stopGameLoop();
    detachInputListeners();
    if (overlayEl) {
      overlayEl.style.display = 'none';
    }
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
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
    }
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
    getScore: () => score,
    getBadges: () => Array.from(earnedBadges),
  };

  // ========================================
  // INIT
  // ========================================

  async function init() {
    // Scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // License check (non-blocking)
    loadLicensing().catch(() => {});

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

    console.log(`✅ Space Invaders Plugin v${PLUGIN_VERSION} - Ready`);
  }

  init();
})();
