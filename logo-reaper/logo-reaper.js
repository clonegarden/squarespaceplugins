/**
 * =======================================
 * LOGO REAPER - Squarespace Plugin
 * =======================================
 * @version 1.3.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Animated marquee of company logos that enter from the right.
 * When a logo reaches the trigger position it receives a random stamp word + a particle explosion,
 * then falls into a dead-logo pile stacked in the left corner of the block. Loops infinitely.
 *
 * v1.3.0:
 * - gapPx / gapScale: constant spacing; logos never overlap
 * - clickToKill: optional click-to-trigger death
 * - update logo width after image load for correct gap calc
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.3.0';
  const PLUGIN_NAME = 'LogoReaper';

  console.log(`💀 ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ============================================================
  // PARAM PARSING
  // ============================================================
  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function parseColor(val) {
    if (!val) return null;
    try {
      val = decodeURIComponent(val);
    } catch (_e) {}
    if (val.toLowerCase() === 'transparent') return 'transparent';
    if (/^[0-9A-Fa-f]{6}$/.test(val)) return '#' + val;
    if (val.startsWith('#')) return val;
    return val;
  }

  function parseJSON(val, fallback) {
    try {
      return JSON.parse(decodeURIComponent(val));
    } catch (_e) {
      return fallback;
    }
  }

  function getConfig() {
    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const p = url.searchParams;

      const words = p.get('words')
        ? decodeURIComponent(p.get('words'))
            .split(',')
            .map(w => w.trim())
            .filter(Boolean)
        : ['REJECTED', 'DEAD', 'GONE', 'REKT', 'GG', 'LOSER', 'CRUSHED', 'BURIED'];

      return {
        selector: p.get('selector') || 'body',
        height: parseInt(p.get('height') || '220', 10),
        speed: parseFloat(p.get('speed') || '80'),
        spawnEvery: parseInt(p.get('spawnEvery') || '2000', 10),
        maxLive: parseInt(p.get('maxLive') || '5', 10),
        centerZonePx: parseInt(p.get('centerZonePx') || '60', 10),
        particles: parseInt(p.get('particles') || '20', 10),
        pileMax: parseInt(p.get('pileMax') || '8', 10),
        words,
        pauseOnHover: p.get('pauseOnHover') !== 'false',
        logos: parseJSON(p.get('logos'), [
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/demo-logo-1.svg',
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/demo-logo-2.svg',
        ]),
        logoH: parseInt(p.get('logoH') || p.get('logoSize') || '64', 10),
        bgColor: parseColor(p.get('bgColor')) || '#f5f5f5',
        stampColor: p.get('stampColor')
          ? '#' + p.get('stampColor').replace(/^#/, '')
          : '#cc0000',
        stampEnabled: p.get('stampEnabled') !== 'false',
        stampX: parseFloat(p.get('stampX') || '50'),
        stampY: parseFloat(p.get('stampY') || '45'),
        stampRotate: parseFloat(p.get('stampRotate') || '-12'),
        stampScale: parseFloat(p.get('stampScale') || '1'),
        triggerX: parseFloat(p.get('triggerX') || '50'),

        // ✅ v1.3.0 spacing
        gapPx: p.has('gapPx') ? parseInt(p.get('gapPx'), 10) : null,
        gapScale: parseFloat(p.get('gapScale') || '0.35'),

        // ✅ v1.3.0 click-to-kill
        clickToKill: p.get('clickToKill') === 'true',

        // Debug
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
        gapPx: null,
        gapScale: 0.35,
        clickToKill: false,
        debug: false,
      };
    }
  }

  const cfg = getConfig();

  // ============================================================
  // REDUCED MOTION
  // ============================================================
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // LICENSING (async, non-blocking)
  // ============================================================
  let licenseReady = false;
  let isLicensed = false;

  function effectiveCfg() {
    // If unlicensed, keep it gentle/limited (demo mode)
    if (isLicensed) return cfg;

    return Object.assign({}, cfg, {
      pileMax: Math.min(cfg.pileMax, 4),
      particles: prefersReducedMotion ? 0 : Math.min(cfg.particles, 8),
      maxLive: Math.min(cfg.maxLive, 3),
      words: ['UNLICENSED', 'DEMO', 'TRIAL'],
    });
  }

  async function loadLicensing(rootEl) {
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
      isLicensed = result && (result.licensed === true || lm.isLicensed === true);
      licenseReady = true;

      if (!isLicensed) {
        if (!rootEl.querySelector('.anavo-lr-watermark')) {
          const wm = document.createElement('div');
          wm.className = 'anavo-lr-watermark';
          wm.style.cssText =
            'position:absolute;bottom:4px;right:6px;font-size:10px;font-family:system-ui,sans-serif;color:rgba(0,0,0,0.4);pointer-events:none;z-index:10;';
          wm.textContent = '⚠️ Unlicensed – anavo.tech';
          rootEl.appendChild(wm);
        }
      }
    } catch (_e) {
      console.warn(`⚠️ ${PLUGIN_NAME}: license check failed`);
      licenseReady = true;
    }
  }

  // ============================================================
  // DOM + STYLES
  // ============================================================
  let root = null;
  let lane = null;
  let pile = null;
  let debugLine = null;

  let stageW = 0;
  let laneTop = 0;

  let rafId = null;
  let lastTs = null;

  let paused = false;
  let lastSpawn = 0;
  let logoIndex = 0;

  let liveLogos = [];
  let deadLogos = [];

  const particleColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];

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
        ${cfg.clickToKill ? 'pointer-events: auto; cursor: pointer;' : ''}
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
        60%  { transform: translate(-50%, -50%) rotate(${cfg.stampRotate}deg) scale(${1.15 * cfg.stampScale}); opacity: 1; }
        100% { transform: translate(-50%, -50%) rotate(${cfg.stampRotate}deg) scale(${cfg.stampScale}); opacity: 1; }
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
        width: ${2.2 * cfg.logoH}px;
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
        height: ${Math.round(0.7 * cfg.logoH)}px;
        width: auto;
        display: block;
        pointer-events: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  function updateStageSize() {
    if (!root) return;
    stageW = root.offsetWidth;
    if (cfg.debug) updateDebugLine();
  }

  function updateDebugLine() {
    if (!debugLine || !root) return;
    const x = stageW * (cfg.triggerX / 100);
    debugLine.style.left = x + 'px';
  }

  // ============================================================
  // PARTICLES + DEATH
  // ============================================================
  function spawnParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'anavo-lr-particle';

      const size = 4 + 6 * Math.random();
      p.style.cssText = `width:${size}px;height:${size}px;background:${
        particleColors[Math.floor(Math.random() * particleColors.length)]
      };left:${x}px;top:${y}px;`;

      lane.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const power = 60 + 120 * Math.random();
      const vx = Math.cos(angle) * power;
      const vy = Math.sin(angle) * power - 80;

      const gravity = 200;
      const life = 0.5 + 0.4 * Math.random();

      let px = x;
      let py = y;
      let t = 0;
      let start = null;

      function anim(ts) {
        if (start === null) start = ts;
        const dt = Math.min(ts - start, 50) / 1000;
        start = ts;

        t += dt;
        if (t > life) {
          p.remove();
          return;
        }

        px += vx * dt;
        py += (vy + gravity * t) * dt;

        const alpha = 1 - t / life;
        p.style.transform = `translate(${px - x}px, ${py - y}px)`;
        p.style.opacity = alpha;

        requestAnimationFrame(anim);
      }

      requestAnimationFrame(anim);
    }
  }

  function moveToPile(src, ec) {
    while (deadLogos.length > ec.pileMax) {
      const old = deadLogos.shift();
      if (old && old.parentNode) old.remove();
    }

    const dead = document.createElement('div');
    dead.className = 'anavo-lr-dead';

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    dead.appendChild(img);

    const deadH = Math.round(0.7 * cfg.logoH);
    const idx = deadLogos.length;
    const col = idx % 2;
    const row = Math.floor(idx / 2);

    const rot = 30 * (Math.random() - 0.5);
    const bottom = row * (0.6 * deadH);
    const left = col * (0.8 * deadH) + 10 * (Math.random() - 0.5);

    dead.style.cssText = `bottom:${bottom}px;left:${left}px;transform:rotate(${rot}deg);opacity:0;`;

    pile.appendChild(dead);
    deadLogos.push(dead);

    if (prefersReducedMotion) {
      dead.style.opacity = '0.7';
    } else {
      dead.animate(
        [
          { opacity: 0, transform: `translateY(-${cfg.height / 2}px) rotate(${rot - 15}deg)` },
          { opacity: 0.7, transform: `translateY(0) rotate(${rot}deg)` },
        ],
        {
          duration: 500,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          fill: 'forwards',
        }
      );
    }
  }

  function triggerDeath(logo, ec) {
    if (cfg.debug) {
      console.log(
        `[LogoReaper] Death triggered: logo at x=${logo.x.toFixed(1)}px, center=${(
          logo.x +
          logo.width / 2
        ).toFixed(1)}px`
      );
    }

    if (logo.stamp) {
      const word = ec.words[Math.floor(Math.random() * ec.words.length)];
      logo.stamp.textContent = word;

      if (prefersReducedMotion) {
        logo.stamp.style.cssText += `;opacity:1;transform:translate(-50%,-50%) rotate(${cfg.stampRotate}deg) scale(${cfg.stampScale});`;
      } else {
        logo.stamp.classList.add('visible');
      }
    }

    if (!prefersReducedMotion && ec.particles > 0) {
      spawnParticles(logo.x + logo.width / 2, laneTop + cfg.logoH / 2, ec.particles);
    }

    setTimeout(
      () => {
        logo.dead = true;
        logo.el.remove();

        const src = logo.el.querySelector('img').src;
        if (cfg.debug) console.log(`[LogoReaper] Moved to pile: ${src}`);
        moveToPile(src, ec);

        const idx = liveLogos.indexOf(logo);
        if (idx !== -1) liveLogos.splice(idx, 1);
      },
      prefersReducedMotion ? 100 : 420
    );
  }

  // ============================================================
  // SPAWN
  // ============================================================
  function spawnLogo() {
    if (!cfg.logos || cfg.logos.length === 0) return;

    const src = cfg.logos[logoIndex % cfg.logos.length];
    logoIndex++;

    const wrapper = document.createElement('div');
    wrapper.className = 'anavo-lr-logo';
    wrapper.style.top = laneTop + 'px';
    wrapper.style.left = stageW + 'px';
    wrapper.style.height = cfg.logoH + 'px';

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    wrapper.appendChild(img);

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
      stamp,
      x: stageW,
      width: wrapper.offsetWidth || cfg.logoH * 2,
      dead: false,
      triggered: false,
    };

    // ✅ update width after image load
    img.addEventListener(
      'load',
      () => {
        logoData.width = wrapper.offsetWidth || cfg.logoH * 2;
      },
      { once: true }
    );

    // ✅ click-to-kill
    if (cfg.clickToKill) {
      wrapper.addEventListener('click', () => {
        if (logoData.dead || logoData.triggered) return;
        logoData.triggered = true;
        triggerDeath(logoData, effectiveCfg());
      });
    }

    liveLogos.push(logoData);

    if (cfg.debug) console.log(`[LogoReaper] Spawn: logo #${logoIndex} → ${src}`);
  }

  // ============================================================
  // MAIN LOOP
  // ============================================================
  function loop(ts) {
    rafId = requestAnimationFrame(loop);

    if (paused) {
      lastTs = ts;
      return;
    }

    const dtMs = lastTs === null ? 0 : Math.min(ts - lastTs, 100);
    lastTs = ts;

    const ec = effectiveCfg();
    const speedPx = (ec.speed * dtMs) / 1000;

    // ✅ effective gap (edge-to-edge)
    const gap = cfg.gapPx !== null ? cfg.gapPx : Math.round(cfg.logoH * cfg.gapScale);

    // spawn logic (no overlap)
    const aliveLogos = liveLogos.filter(l => !l.dead);
    if (aliveLogos.length < ec.maxLive && ts - lastSpawn > ec.spawnEvery) {
      let canSpawn = true;
      if (aliveLogos.length > 0) {
        const last = aliveLogos.reduce((max, l) => (l.x > max.x ? l : max), aliveLogos[0]);
        const lastRightEdge = last.x + last.width;
        canSpawn = lastRightEdge <= stageW - gap;
      }
      if (canSpawn) {
        spawnLogo();
        lastSpawn = ts;
      }
    }

    // trigger line X (px)
    const triggerPx = stageW * (cfg.triggerX / 100);
    if (cfg.debug && !loop._triggerLogged) {
      console.log(
        `[LogoReaper] triggerX = ${cfg.triggerX}% → ${triggerPx.toFixed(1)}px (stageW=${stageW}px)`
      );
      loop._triggerLogged = true;
    }

    // move logos
    for (let i = liveLogos.length - 1; i >= 0; i--) {
      const l = liveLogos[i];
      if (l.dead) continue;

      l.x -= speedPx;
      l.el.style.left = l.x + 'px';

      const center = l.x + l.width / 2;

      if (!l.triggered && Math.abs(center - triggerPx) < ec.centerZonePx) {
        l.triggered = true;
        triggerDeath(l, ec);
      }

      // remove when fully off-stage
      if (l.x + l.width < -10) {
        l.el.remove();
        liveLogos.splice(i, 1);
      }
    }
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    console.log(`🔧 ${PLUGIN_NAME}: Initializing...`);
    if (cfg.debug) console.log('[LogoReaper] Debug mode ON. Parsed config:', cfg);

    injectStyles();

    let mount = null;
    if (cfg.selector === 'body') {
      mount = document.body;
    } else {
      mount = document.querySelector(cfg.selector);
      if (!mount) {
        console.warn(`${PLUGIN_NAME}: selector "${cfg.selector}" not found`);
        mount = document.body;
      }
    }

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
      mount.insertBefore(root, mount.firstChild);
    } else {
      mount.appendChild(root);
    }

    stageW = root.offsetWidth;
    laneTop = Math.floor((cfg.height - cfg.logoH) / 2);

    if (cfg.pauseOnHover) {
      root.addEventListener('mouseenter', () => {
        paused = true;
      });
      root.addEventListener('mouseleave', () => {
        paused = false;
      });
    }

    window.addEventListener('resize', updateStageSize);

    if (cfg.debug) {
      debugLine = document.createElement('div');
      debugLine.className = 'anavo-lr-debug-line';
      debugLine.style.cssText =
        'position:absolute;top:0;bottom:0;width:1px;background:rgba(255,0,0,0.7);pointer-events:none;z-index:20;left:' +
        cfg.triggerX +
        '%;';
      const label = document.createElement('span');
      label.style.cssText =
        'position:absolute;top:2px;left:3px;font-size:10px;font-family:monospace;color:#ff4444;white-space:nowrap;line-height:1;';
      label.textContent = 'triggerX';
      debugLine.appendChild(label);
      root.appendChild(debugLine);

      updateDebugLine();

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(updateDebugLine);
        ro.observe(root);
        root._lrResizeObserver = ro;
      }
    }

    // async licensing
    loadLicensing(root);

    // start
    rafId = requestAnimationFrame(loop);

    console.log(`✅ ${PLUGIN_NAME} v${PLUGIN_VERSION} active`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.LogoReaper = {
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateStageSize);

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