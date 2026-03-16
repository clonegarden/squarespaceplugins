/**
 * =======================================
 * LOGO REAPER - Squarespace Plugin
 * =======================================
 * @version 1.2.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Animates a continuous marquee of company logos entering from the right.
 * When a logo reaches the trigger position it receives a random stamp + particle explosion,
 * then falls into a dead-logo pile stacked in the left corner of the block.
 *
 * INSTALLATION:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js?logos=...&height=220"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.2.0';
  const PLUGIN_NAME = 'LogoReaper';

  console.log(`💀 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // PARSE SCRIPT URL PARAMETERS
  // ========================================
  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function getScriptParams() {
    function parseJSON(str, fallback) {
      try {
        return JSON.parse(decodeURIComponent(str));
      } catch (_e) {
        return fallback;
      }
    }

    function fixHexColor(color) {
      if (!color) return null;
      try {
        color = decodeURIComponent(color);
      } catch (_e) { /* use as-is */ }
      if (color.toLowerCase() === 'transparent') return 'transparent';
      if (/^[0-9A-Fa-f]{6}$/.test(color)) return '#' + color;
      if (color.startsWith('#')) return color;
      return color; // handles rgb(...), rgba(...)
    }

    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const p = url.searchParams;

      return {
        selector: p.get('selector') || 'body',
        height: parseInt(p.get('height') || '220', 10),
        speed: parseFloat(p.get('speed') || '80'),
        spawnEvery: parseInt(p.get('spawnEvery') || '2000', 10),
        maxLive: parseInt(p.get('maxLive') || '5', 10),
        centerZonePx: parseInt(p.get('centerZonePx') || '60', 10),
        particles: parseInt(p.get('particles') || '20', 10),
        pileMax: parseInt(p.get('pileMax') || '8', 10),
        words: p.get('words')
          ? decodeURIComponent(p.get('words')).split(',').map(w => w.trim()).filter(Boolean)
          : ['REJECTED', 'DEAD', 'GONE', 'REKT', 'GG', 'LOSER', 'CRUSHED', 'BURIED'],
        pauseOnHover: p.get('pauseOnHover') !== 'false',
        logos: parseJSON(
          p.get('logos'),
          [
            'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/demo-logo-1.svg',
            'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/demo-logo-2.svg',
          ]
        ),
        // logoH controls logo height in pixels; width is set to auto so logos keep natural proportions.
        // Accepts logoH or legacy logoSize for backward compatibility.
        logoH: parseInt(p.get('logoH') || p.get('logoSize') || '64', 10),
        bgColor: fixHexColor(p.get('bgColor')) || '#f5f5f5',
        stampColor: p.get('stampColor') ? '#' + p.get('stampColor').replace(/^#/, '') : '#cc0000',
        // Stamp positioning controls (percent of logo dimensions)
        stampEnabled: p.get('stampEnabled') !== 'false',
        stampX: parseFloat(p.get('stampX') || '50'),
        stampY: parseFloat(p.get('stampY') || '45'),
        stampRotate: parseFloat(p.get('stampRotate') || '-12'),
        stampScale: parseFloat(p.get('stampScale') || '1'),
        // Trigger position (percent of stage width)
        triggerX: parseFloat(p.get('triggerX') || '50'),
        // Debug mode – shows visual guide line and extra console logs
        debug: p.get('debug') === 'true',
      };
    } catch (_e) {
      return {
        selector: 'body',
        height: 220,
        speed: 80,
        spawnEvery: 2000,
        maxLive: 5,
        centerZonePx: 60,
        particles: 20,
        pileMax: 8,
        words: ['DONE', 'GOT IT', 'GONE', 'FINISHED', 'GG', 'OWND', 'CRUSHED', 'BURIED'],
        pauseOnHover: true,
        logos: [],
        logoH: 64,
        bgColor: '#f5f5f5',
        stampColor: '#cc0000',
        stampEnabled: true,
        stampX: 50,
        stampY: 45,
        stampRotate: -12,
        stampScale: 1,
        triggerX: 50,
        debug: false,
      };
    }
  }

  const cfg = getScriptParams();

  // Respect prefers-reduced-motion
  const reducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // LICENSING (non-blocking)
  // ========================================
  let _licensed = false;
  let _licenseChecked = false;

  // Effective limits – tightened for unlicensed
  function effectiveCfg() {
    if (_licensed) return cfg;
    return Object.assign({}, cfg, {
      pileMax: Math.min(cfg.pileMax, 4),
      particles: reducedMotion ? 0 : Math.min(cfg.particles, 8),
      maxLive: Math.min(cfg.maxLive, 3),
      words: ['UNLICENSED', 'DEMO', 'TRIAL'],
    });
  }

  async function loadLicensing(root) {
    try {
      if (!window.AnavoLicenseManager) {
        const script = document.createElement('script');
        script.src =
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
        licenseServer:
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
        showUI: false,
      });

      const result = await lm.init();
      _licensed = result.licensed === true || lm.isLicensed === true;
      _licenseChecked = true;

      if (!_licensed) {
        insertWatermark(root);
      }
    } catch (_e) {
      console.warn(`⚠️ ${PLUGIN_NAME}: license check failed`);
      _licenseChecked = true;
    }
  }

  function insertWatermark(root) {
    if (root.querySelector('.anavo-lr-watermark')) return;
    const wm = document.createElement('div');
    wm.className = 'anavo-lr-watermark';
    wm.style.cssText =
      'position:absolute;bottom:4px;right:6px;font-size:10px;font-family:system-ui,sans-serif;' +
      'color:rgba(0,0,0,0.4);pointer-events:none;z-index:10;';
    wm.textContent = '⚠️ Unlicensed – anavo.tech';
    root.appendChild(wm);
  }

  // ========================================
  // CSS INJECTION
  // ========================================
  function injectStyles() {
    if (document.getElementById('anavo-lr-styles')) return;
    const style = document.createElement('style');
    style.id = 'anavo-lr-styles';
    style.textContent = `
      /* Logo Reaper v${PLUGIN_VERSION} – Anavo Tech */
      .anavo-lr-root {
        position: relative;
        overflow: hidden;
        width: 100%;
        box-sizing: border-box;
        background: ${cfg.bgColor};
      }
      .anavo-lr-lane {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
      }
      .anavo-lr-logo {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        will-change: transform;
      }
      .anavo-lr-logo img {
        height: ${cfg.logoH}px;
        width: auto;
        display: block;
        pointer-events: none;
        user-select: none;
      }
      .anavo-lr-stamp {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) rotate(${cfg.stampRotate}deg) scale(0);
        font-family: 'Impact', 'Arial Black', sans-serif;
        font-size: 18px;
        font-weight: 900;
        color: ${cfg.stampColor};
        text-transform: uppercase;
        letter-spacing: 2px;
        border: 3px solid ${cfg.stampColor};
        padding: 2px 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        z-index: 5;
        text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
      }
      .anavo-lr-stamp.visible {
        animation: anavo-lr-stamp-pop 0.35s ease-out forwards;
      }
      @keyframes anavo-lr-stamp-pop {
        0%   { transform: translate(-50%, -50%) rotate(${cfg.stampRotate}deg) scale(0.2); opacity: 0; }
        60%  { transform: translate(-50%, -50%) rotate(${cfg.stampRotate}deg) scale(${cfg.stampScale * 1.15}); opacity: 1; }
        100% { transform: translate(-50%, -50%) rotate(${cfg.stampRotate}deg) scale(${cfg.stampScale});   opacity: 1; }
      }
      .anavo-lr-particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        z-index: 6;
      }
      .anavo-lr-pile {
        position: absolute;
        bottom: 0;
        left: 0;
        width: ${cfg.logoH * 2.2}px;
        min-height: ${cfg.logoH}px;
        pointer-events: none;
        z-index: 3;
      }
      .anavo-lr-dead {
        position: absolute;
        opacity: 0.7;
        filter: grayscale(80%) brightness(0.7);
        will-change: transform, opacity;
      }
      .anavo-lr-dead img {
        height: ${Math.round(cfg.logoH * 0.7)}px;
        width: auto;
        display: block;
        pointer-events: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // PLUGIN STATE
  // ========================================
  let root = null;
  let lane = null;
  let pile = null;
  let debugLine = null;
  let stageW = 0;
  let laneY = 0;
  let paused = false;
  let lastSpawn = 0;
  let logoIndex = 0;
  let liveLogos = [];   // { el, x, width, dead }
  let deadLogos = [];   // elements in pile
  let rafId = null;
  let lastTime = null;
  let pileStack = [];   // { bottom, left, rot } stacking state

  // ========================================
  // MOUNT
  // ========================================
  function mount() {
    // Find target container
    let target;
    if (cfg.selector === 'body') {
      target = document.body;
    } else {
      target = document.querySelector(cfg.selector);
    }
    if (!target) {
      console.warn(`${PLUGIN_NAME}: selector "${cfg.selector}" not found`);
      target = document.body;
    }

    // Create root block
    root = document.createElement('div');
    root.className = 'anavo-lr-root';
    root.style.height = cfg.height + 'px';

    lane = document.createElement('div');
    lane.className = 'anavo-lr-lane';
    root.appendChild(lane);

    pile = document.createElement('div');
    pile.className = 'anavo-lr-pile';
    root.appendChild(pile);

    if (cfg.selector === 'body') {
      target.insertBefore(root, target.firstChild);
    } else {
      target.appendChild(root);
    }

    stageW = root.offsetWidth;
    laneY = Math.floor((cfg.height - cfg.logoH) / 2);

    if (cfg.pauseOnHover) {
      root.addEventListener('mouseenter', () => { paused = true; });
      root.addEventListener('mouseleave', () => { paused = false; });
    }

    window.addEventListener('resize', onResize);

    // Debug: visual trigger guide line
    if (cfg.debug) {
      debugLine = document.createElement('div');
      debugLine.className = 'anavo-lr-debug-line';
      debugLine.style.cssText =
        'position:absolute;top:0;bottom:0;width:1px;' +
        'background:rgba(255,0,0,0.7);pointer-events:none;z-index:20;' +
        'left:' + cfg.triggerX + '%;';
      const label = document.createElement('span');
      label.style.cssText =
        'position:absolute;top:2px;left:3px;font-size:10px;font-family:monospace;' +
        'color:#ff4444;white-space:nowrap;line-height:1;';
      label.textContent = 'triggerX';
      debugLine.appendChild(label);
      root.appendChild(debugLine);

      // Update line position using absolute px so it's always accurate
      updateDebugLine();

      // ResizeObserver keeps line in sync with container width changes
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(updateDebugLine);
        ro.observe(root);
        // Store for cleanup
        root._lrResizeObserver = ro;
      }
    }

    // Start async licensing check without blocking
    loadLicensing(root);

    // Start loop
    rafId = requestAnimationFrame(loop);
  }

  function onResize() {
    if (root) stageW = root.offsetWidth;
    if (cfg.debug) updateDebugLine();
  }

  function updateDebugLine() {
    if (!debugLine || !root) return;
    stageW = root.offsetWidth;
    const px = stageW * (cfg.triggerX / 100);
    debugLine.style.left = px + 'px';
  }

  // ========================================
  // MAIN LOOP
  // ========================================
  function loop(ts) {
    rafId = requestAnimationFrame(loop);

    if (paused) {
      lastTime = ts;
      return;
    }

    const dt = lastTime === null ? 0 : Math.min(ts - lastTime, 100);
    lastTime = ts;

    const ec = effectiveCfg();

    // Spawn new logo?
    if (
      liveLogos.filter(l => !l.dead).length < ec.maxLive &&
      ts - lastSpawn > ec.spawnEvery
    ) {
      spawnLogo();
      lastSpawn = ts;
    }

    // Move logos
    const stageTrigger = stageW * (cfg.triggerX / 100);
    if (cfg.debug && !loop._triggerLogged) {
      console.log(`[LogoReaper] triggerX = ${cfg.triggerX}% → ${stageTrigger.toFixed(1)}px (stageW=${stageW}px)`);
      loop._triggerLogged = true;
    }
    const moveAmt = (ec.speed * dt) / 1000;

    for (let i = liveLogos.length - 1; i >= 0; i--) {
      const logo = liveLogos[i];
      if (logo.dead) continue;

      logo.x -= moveAmt;

      // Update position
      logo.el.style.left = logo.x + 'px';

      // Check center trigger
      const logoCenter = logo.x + logo.width / 2;
      if (!logo.triggered && Math.abs(logoCenter - stageTrigger) < ec.centerZonePx) {
        logo.triggered = true;
        triggerDeath(logo, ec);
      }

      // Remove if fully off left edge
      if (logo.x + logo.width < -10) {
        logo.el.remove();
        liveLogos.splice(i, 1);
      }
    }
  }

  // ========================================
  // SPAWN LOGO
  // ========================================
  function spawnLogo() {
    if (!cfg.logos || cfg.logos.length === 0) return;

    const url = cfg.logos[logoIndex % cfg.logos.length];
    logoIndex++;

    const wrapper = document.createElement('div');
    wrapper.className = 'anavo-lr-logo';
    wrapper.style.top = laneY + 'px';
    wrapper.style.left = stageW + 'px';
    wrapper.style.height = cfg.logoH + 'px';

    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.draggable = false;
    wrapper.appendChild(img);

    // Stamp element – only created when stampEnabled
    let stamp = null;
    if (cfg.stampEnabled) {
      stamp = document.createElement('div');
      stamp.className = 'anavo-lr-stamp';
      stamp.style.left = cfg.stampX + '%';
      stamp.style.top = cfg.stampY + '%';
      wrapper.appendChild(stamp);
    }

    lane.appendChild(wrapper);

    const logoData = {
      el: wrapper,
      stamp: stamp,
      x: stageW,
      width: wrapper.offsetWidth || cfg.logoH * 2,
      dead: false,
      triggered: false,
    };

    liveLogos.push(logoData);

    if (cfg.debug) {
      console.log(`[LogoReaper] Spawn: logo #${logoIndex} → ${url}`);
    }
  }

  // ========================================
  // DEATH SEQUENCE
  // ========================================
  function triggerDeath(logo, ec) {
    if (cfg.debug) {
      console.log(`[LogoReaper] Death triggered: logo at x=${logo.x.toFixed(1)}px, center=${(logo.x + logo.width / 2).toFixed(1)}px`);
    }

    // 1) Pick random stamp word and show stamp (if enabled)
    if (logo.stamp) {
      const word = ec.words[Math.floor(Math.random() * ec.words.length)];
      logo.stamp.textContent = word;

      if (!reducedMotion) {
        logo.stamp.classList.add('visible');
      } else {
        logo.stamp.style.cssText +=
          `;opacity:1;transform:translate(-50%,-50%) rotate(${cfg.stampRotate}deg) scale(${cfg.stampScale});`;
      }
    }

    // 2) Particle explosion
    if (!reducedMotion && ec.particles > 0) {
      const cx = logo.x + logo.width / 2;
      const cy = laneY + cfg.logoH / 2;
      spawnParticles(cx, cy, ec.particles);
    }

    // 3) After stamp animation, move to pile
    const delay = reducedMotion ? 100 : 420;
    setTimeout(() => {
      logo.dead = true;
      logo.el.remove();
      const src = logo.el.querySelector('img').src;
      if (cfg.debug) {
        console.log(`[LogoReaper] Moved to pile: ${src}`);
      }
      addToPile(src, ec);

      // Remove from liveLogos
      const idx = liveLogos.indexOf(logo);
      if (idx !== -1) liveLogos.splice(idx, 1);
    }, delay);
  }

  // ========================================
  // PARTICLES
  // ========================================
  const PARTICLE_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];

  function spawnParticles(cx, cy, count) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'anavo-lr-particle';
      const size = 4 + Math.random() * 6;
      p.style.cssText =
        `width:${size}px;height:${size}px;` +
        `background:${PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]};` +
        `left:${cx}px;top:${cy}px;`;
      lane.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 80; // upward bias
      const gravity = 200;
      const life = 0.5 + Math.random() * 0.4;

      let px = cx;
      let py = cy;
      let elapsed = 0;
      let last = null;

      function tick(ts) {
        if (last === null) last = ts;
        const dt = Math.min(ts - last, 50) / 1000;
        last = ts;
        elapsed += dt;

        if (elapsed >= life) {
          p.remove();
          return;
        }

        px += vx * dt;
        py += (vy + gravity * elapsed) * dt;
        const alpha = 1 - elapsed / life;
        p.style.transform = `translate(${px - cx}px, ${py - cy}px)`;
        p.style.opacity = alpha;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }

  // ========================================
  // PILE
  // ========================================
  function addToPile(src, ec) {
    // Cap pile
    while (deadLogos.length >= ec.pileMax) {
      const oldest = deadLogos.shift();
      if (oldest && oldest.parentNode) oldest.remove();
    }

    const dead = document.createElement('div');
    dead.className = 'anavo-lr-dead';

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    dead.appendChild(img);

    // Compute stacking position
    const deadSize = Math.round(cfg.logoH * 0.7);
    const stackIndex = deadLogos.length;
    const col = stackIndex % 2;
    const row = Math.floor(stackIndex / 2);
    const rot = (Math.random() - 0.5) * 30;
    const baseBottom = row * (deadSize * 0.6);
    const baseLeft = col * (deadSize * 0.8) + (Math.random() - 0.5) * 10;

    dead.style.cssText =
      `bottom:${baseBottom}px;left:${baseLeft}px;` +
      `transform:rotate(${rot}deg);opacity:0;`;

    pile.appendChild(dead);
    deadLogos.push(dead);

    // Animate fall-in
    if (!reducedMotion) {
      dead.animate(
        [
          { opacity: 0, transform: `translateY(-${cfg.height / 2}px) rotate(${rot - 15}deg)` },
          { opacity: 0.7, transform: `translateY(0) rotate(${rot}deg)` },
        ],
        { duration: 500, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' }
      );
    } else {
      dead.style.opacity = '0.7';
    }
  }

  // ========================================
  // INIT
  // ========================================
  function init() {
    console.log(`🔧 ${PLUGIN_NAME}: Initializing...`);
    if (cfg.debug) {
      console.log('[LogoReaper] Debug mode ON. Parsed config:', cfg);
    }
    injectStyles();
    mount();
    console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} active`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ========================================
  // PUBLIC API
  // ========================================
  window.LogoReaper = {
    pause: () => { paused = true; },
    resume: () => { paused = false; },
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      if (root) {
        if (root._lrResizeObserver) {
          root._lrResizeObserver.disconnect();
          root._lrResizeObserver = null;
        }
        if (root.parentNode) root.remove();
      }
      liveLogos = [];
      deadLogos = [];
    },
    getVersion: () => PLUGIN_VERSION,
  };
})();
