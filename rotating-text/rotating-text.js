/**
 * Anavo Rotating Text v1.0.0
 * Animated rotating words/phrases. Multiple animation types. Color per word.
 * Drop-in replacement and superset of sewebdesign/rotating-text.
 *
 * Usage (Squarespace Code Block — inline):
 * <h1>We build <span data-anavo-rotate='["beautiful","fast","smart"]'></span> websites.</h1>
 *
 * Or with per-word colors (JSON array of objects):
 * <span data-anavo-rotate='[{"text":"beautiful","color":"#f59e0b"},{"text":"fast","color":"#10b981"}]'></span>
 *
 * Script (Squarespace Footer):
 * <script src="...rotating-text.min.js
 *   ?animation=typewriter
 *   &speed=80
 *   &pause=2000
 *   &cursor=true
 *   &target=%5Bdata-anavo-rotate%5D
 * "></script>
 *
 * Also supports legacy sewebdesign data-rotate attribute (drop-in compatible).
 *
 * Animation types: fade | slideUp | slideDown | typewriter | flip | zoom
 */
;(function () {
  'use strict';

  if (window.AnavoPluginState && window.AnavoPluginState.plugins['RotatingText']) return;

  // ─── Config ──────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="rotating-text"]');
    return s[s.length - 1];
  })();

  var params = (scriptEl && scriptEl.src) ? new URL(scriptEl.src).searchParams : new URLSearchParams();

  var CFG = {
    // Target both our attribute and sewebdesign legacy attribute
    target:      params.get('target')     || '[data-anavo-rotate],[data-rotate]',
    animation:   params.get('animation')  || 'typewriter',  // fade|slideUp|slideDown|typewriter|flip|zoom
    speed:       parseInt(params.get('speed')  || '70',   10), // typewriter: ms per character
    deleteSpeed: parseInt(params.get('deleteSpeed') || '40', 10),
    pause:       parseInt(params.get('pause')  || '2000', 10), // ms to hold each word
    startDelay:  parseInt(params.get('startDelay') || '500', 10),
    loop:        params.get('loop')       !== 'false',
    cursor:      params.get('cursor')     !== 'false',      // typewriter cursor
    cursorChar:  params.get('cursorChar') || '|',
    random:      params.get('random')     === 'true',
    pauseOnHover: params.get('pauseOnHover') !== 'false',
    // Global fallback color (per-word colors override this)
    color:       params.get('color')      || '',
    domain:      params.get('domain')     || window.location.hostname,
    apiBase:     params.get('api')        || 'https://api.anavo.tech',
  };

  // ─── Parse words from element ─────────────────────────────────────────────────

  function parseWords(el) {
    var raw = el.getAttribute('data-anavo-rotate') || el.getAttribute('data-rotate') || '[]';
    try {
      var parsed = JSON.parse(raw);
      return parsed.map(function (w) {
        if (typeof w === 'string') return { text: w, color: CFG.color || null };
        return { text: w.text || '', color: w.color || CFG.color || null };
      });
    } catch (e) { return []; }
  }

  // ─── Styles ───────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById('anavo-rotating-text-styles');
    if (ex) ex.remove();

    var css = [
      '@keyframes anavo-rt-fadeIn{from{opacity:0 !important}to{opacity:1 !important}}',
      '@keyframes anavo-rt-fadeOut{from{opacity:1 !important}to{opacity:0 !important}}',
      '@keyframes anavo-rt-slideUp{from{opacity:0 !important;transform:translateY(40%) !important}to{opacity:1 !important;transform:translateY(0) !important}}',
      '@keyframes anavo-rt-slideDown{from{opacity:0 !important;transform:translateY(-40%) !important}to{opacity:1 !important;transform:translateY(0) !important}}',
      '@keyframes anavo-rt-flip{from{opacity:0 !important;transform:rotateX(90deg) !important}to{opacity:1 !important;transform:rotateX(0deg) !important}}',
      '@keyframes anavo-rt-zoom{from{opacity:0 !important;transform:scale(.6) !important}to{opacity:1 !important;transform:scale(1) !important}}',
      '@keyframes anavo-rt-blink{0%,100%{opacity:1 !important}50%{opacity:0 !important}}',
      '.anavo-rt-wrap{display:inline !important;position:relative !important}',
      '.anavo-rt-word{display:inline !important;transition:color .3s !important}',
      '.anavo-rt-cursor{display:inline !important;opacity:1 !important;animation:anavo-rt-blink .7s step-end infinite !important;color:inherit !important;font-weight:300 !important}',
      '.anavo-rt-animate-fade{animation:anavo-rt-fadeIn .4s ease forwards !important}',
      '.anavo-rt-animate-slideUp{animation:anavo-rt-slideUp .4s ease forwards !important;display:inline-block !important;overflow:hidden !important}',
      '.anavo-rt-animate-slideDown{animation:anavo-rt-slideDown .4s ease forwards !important;display:inline-block !important;overflow:hidden !important}',
      '.anavo-rt-animate-flip{animation:anavo-rt-flip .4s ease forwards !important;display:inline-block !important}',
      '.anavo-rt-animate-zoom{animation:anavo-rt-zoom .35s ease forwards !important;display:inline-block !important}',
    ].join('');

    var el = document.createElement('style');
    el.id = 'anavo-rotating-text-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ─── Instance Builder ─────────────────────────────────────────────────────────

  function initInstance(el, words) {
    if (!words.length) return;

    var idx      = CFG.random ? Math.floor(Math.random() * words.length) : 0;
    var paused   = false;
    var destroyed = false;

    // Wrap element
    el.innerHTML = '';
    var span = document.createElement('span');
    span.className = 'anavo-rt-wrap';

    var wordEl = document.createElement('span');
    wordEl.className = 'anavo-rt-word';
    span.appendChild(wordEl);

    var cursorEl = null;
    if (CFG.cursor && CFG.animation === 'typewriter') {
      cursorEl = document.createElement('span');
      cursorEl.className = 'anavo-rt-cursor';
      cursorEl.textContent = CFG.cursorChar;
      span.appendChild(cursorEl);
    }

    el.appendChild(span);

    if (CFG.pauseOnHover) {
      el.addEventListener('mouseenter', function () { paused = true; });
      el.addEventListener('mouseleave', function () { paused = false; });
    }

    function nextIdx() {
      if (CFG.random) {
        var next;
        do { next = Math.floor(Math.random() * words.length); } while (next === idx && words.length > 1);
        return next;
      }
      return (idx + 1) % words.length;
    }

    function applyColor(color) {
      wordEl.style.color = color || '';
    }

    // ── Animation: typewriter ──────────────────────────────────────────────────
    if (CFG.animation === 'typewriter') {

      function typeWord(word, color, done) {
        var i = 0;
        applyColor(color);
        function step() {
          if (destroyed) return;
          if (paused) { setTimeout(step, 100); return; }
          if (i <= word.length) {
            wordEl.textContent = word.slice(0, i++);
            setTimeout(step, CFG.speed);
          } else {
            done();
          }
        }
        step();
      }

      function deleteWord(done) {
        var text = wordEl.textContent;
        var i = text.length;
        function step() {
          if (destroyed) return;
          if (paused) { setTimeout(step, 100); return; }
          if (i >= 0) {
            wordEl.textContent = text.slice(0, i--);
            setTimeout(step, CFG.deleteSpeed);
          } else {
            done();
          }
        }
        step();
      }

      function cycle() {
        if (destroyed) return;
        var w = words[idx];
        typeWord(w.text, w.color, function () {
          if (!CFG.loop && idx === words.length - 1) return; // stop at last word
          setTimeout(function () {
            if (paused) { var wait = setInterval(function(){ if(!paused){ clearInterval(wait); deleteWord(function(){ idx = nextIdx(); setTimeout(cycle, 200); }); } }, 100); }
            else { deleteWord(function () { idx = nextIdx(); setTimeout(cycle, 200); }); }
          }, CFG.pause);
        });
      }

      setTimeout(function () {
        var w = words[idx];
        typeWord(w.text, w.color, function () {
          setTimeout(function () { deleteWord(function () { idx = nextIdx(); setTimeout(cycle, 200); }); }, CFG.pause);
        });
      }, CFG.startDelay);

    // ── Animation: CSS-based (fade, slideUp, slideDown, flip, zoom) ────────────
    } else {

      function showWord() {
        if (destroyed) return;
        var w = words[idx];
        var animClass = 'anavo-rt-animate-' + CFG.animation;

        wordEl.textContent = w.text;
        applyColor(w.color);
        wordEl.classList.remove(animClass);

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            wordEl.classList.add(animClass);
          });
        });

        var holdTime = CFG.pause + 400;
        setTimeout(function () {
          if (paused) {
            var wait = setInterval(function () {
              if (!paused) { clearInterval(wait); advance(); }
            }, 100);
          } else {
            advance();
          }
        }, holdTime);
      }

      function advance() {
        if (destroyed) return;
        if (!CFG.loop && idx === words.length - 1) return;
        idx = nextIdx();
        showWord();
      }

      setTimeout(showWord, CFG.startDelay);
    }

    // Return destroy function
    return function () { destroyed = true; };
  }

  // ─── Mount ────────────────────────────────────────────────────────────────────

  function mount() {
    try {
      injectStyles();
      document.querySelectorAll(CFG.target).forEach(function (el) {
        var words = parseWords(el);
        if (words.length) initInstance(el, words);
      });
      checkLicense();
    } catch (e) { /* silent */ }
  }

  function checkLicense() {
    fetch(CFG.apiBase + '/api/licenses/check?domain=' + encodeURIComponent(CFG.domain) + '&plugin=rotating-text')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.licensed) console.warn('[Anavo Rotating Text] Unlicensed'); })
      .catch(function () {});
  }

  function waitAndMount(attempts) {
    if (document.querySelectorAll(CFG.target).length) { mount(); return; }
    if (attempts < 50) setTimeout(function () { waitAndMount(attempts + 1); }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitAndMount(0); });
  } else {
    waitAndMount(0);
  }

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  window.AnavoPluginState.plugins['RotatingText'] = { version: '1.0.0', config: CFG };

})();
