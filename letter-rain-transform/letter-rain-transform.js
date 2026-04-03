/**
 * =======================================
 * LETTER RAIN TRANSFORM - Squarespace Plugin
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/letter-rain-transform/letter-rain-transform.min.js?source=%23letter-rain-source&target=%23letter-rain-target&phrase=Hello+World"></script>
 *
 * PARAMETERS:
 * ?source       - CSS selector for source element (default: #letter-rain-source)
 * ?target       - CSS selector for target element (default: #letter-rain-target)
 * ?phrase       - URL-encoded new phrase to form at target (default: original text)
 * ?duration     - Animation duration in ms (default: 1200)
 * ?stagger      - Per-letter stagger delay in ms (default: 18)
 * ?fallDistance - Extra fall overshoot in px (default: 60)
 * ?easing       - CSS timing function (default: cubic-bezier(0.2, 0.8, 0.2, 1))
 * ?repeat       - Re-trigger on re-entry: true|false (default: false)
 * ?debug        - Verbose logging: true|false (default: false)
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  const PLUGIN_NAME = 'LetterRainTransform';

  console.log(`🌧️ ${PLUGIN_NAME} v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // SCRIPT REFERENCE
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  // ========================================
  // CONFIGURATION
  // ========================================

  function getScriptParams() {
    try {
      const src = currentScript.src;
      const url = new URL(src);
      const params = new URLSearchParams(url.search);

      const getBool = (key, def) => {
        const v = params.get(key);
        if (v === null) return def;
        return v !== 'false';
      };

      return {
        source:       params.get('source')       || '#letter-rain-source',
        target:       params.get('target')       || '#letter-rain-target',
        phrase:       params.get('phrase')       || null,
        duration:     parseInt(params.get('duration')     || '1200', 10),
        stagger:      parseInt(params.get('stagger')      || '18',   10),
        fallDistance: parseInt(params.get('fallDistance') || '60',   10),
        easing:       params.get('easing') || 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        repeat:       getBool('repeat', false),
        debug:        getBool('debug',  false),
      };
    } catch (e) {
      return {
        source:       '#letter-rain-source',
        target:       '#letter-rain-target',
        phrase:       null,
        duration:     1200,
        stagger:      18,
        fallDistance: 60,
        easing:       'cubic-bezier(0.2, 0.8, 0.2, 1)',
        repeat:       false,
        debug:        false,
      };
    }
  }

  const config = getScriptParams();

  function dbg(...args) {
    if (config.debug) console.log(`[${PLUGIN_NAME}]`, ...args);
  }

  dbg('v' + PLUGIN_VERSION + ' loading with config:', config);

  // ========================================
  // REDUCED MOTION
  // ========================================

  const reducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // LICENSING (non-blocking)
  // ========================================

  function loadLicensing(container) {
    setTimeout(function () {
      try {
        if (window.AnavoLicenseManager) return;

        const licScript = document.createElement('script');
        licScript.src =
          'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';

        licScript.onload = function () {
          try {
            const lm = new window.AnavoLicenseManager(PLUGIN_NAME, PLUGIN_VERSION, {
              licenseServer:
                'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
              showUI: true,
            });
            lm.init().then(function () {
              if (!lm.isLicensed && container) {
                lm.insertWatermark(container);
              }
            });
          } catch (e) {
            console.warn('[' + PLUGIN_NAME + '] License init error:', e.message);
          }
        };

        licScript.onerror = function () {
          console.warn('[' + PLUGIN_NAME + '] Could not load licensing module');
        };

        document.head.appendChild(licScript);
      } catch (e) {
        // licensing is non-blocking
      }
    }, 1500);
  }

  // ========================================
  // CSS INJECTION
  // ========================================

  function injectStyles() {
    const styleId = 'anavo-letter-rain-styles';
    if (document.getElementById(styleId)) return;

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = [
      '.anavo-lr-wrapper {',
      '  display: block;',
      '  position: relative;',
      '  box-sizing: border-box;',
      '}',
      '.anavo-lr-letter {',
      '  display: inline-block;',
      '  white-space: pre;',
      '}',
      '.anavo-lr-flying {',
      '  position: fixed;',
      '  pointer-events: none;',
      '  z-index: 9999;',
      '  display: inline-block;',
      '  white-space: pre;',
      '  will-change: transform, opacity;',
      '}',
      '.anavo-lr-target-letter {',
      '  display: inline-block;',
      '  white-space: pre;',
      '}',
    ].join('\n');
    document.head.appendChild(styles);
  }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Walk the DOM tree and collect all visible text content.
   * Preserves internal whitespace; ignores hidden nodes.
   */
  function extractText(el) {
    let text = '';
    const walk = function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const cs = window.getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
      }
    };
    walk(el);
    return text;
  }

  /** Copy key typography styles from a source element to a target element. */
  function copyTypographyStyles(source, target) {
    const cs = window.getComputedStyle(source);
    const props = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant',
      'lineHeight', 'letterSpacing', 'wordSpacing', 'textTransform',
      'textDecoration', 'color',
    ];
    for (let i = 0; i < props.length; i++) {
      try {
        target.style[props[i]] = cs[props[i]];
      } catch (_) {}
    }
  }

  /**
   * Copy key box and layout styles from source to target element.
   * Used to make the wrapper visually match the original element.
   */
  function copyBoxStyles(source, target) {
    const cs = window.getComputedStyle(source);
    const props = [
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'backgroundColor', 'background',
      'borderTopLeftRadius', 'borderTopRightRadius',
      'borderBottomLeftRadius', 'borderBottomRightRadius',
      'textAlign',
    ];
    for (let i = 0; i < props.length; i++) {
      try {
        target.style[props[i]] = cs[props[i]];
      } catch (_) {}
    }
  }

  // ========================================
  // MAIN INIT
  // ========================================

  function init() {
    const sourceEl = document.querySelector(config.source);
    if (!sourceEl) {
      console.warn('[' + PLUGIN_NAME + '] Source element not found: "' + config.source + '"');
      return;
    }

    // Idempotency: skip if already initialised
    if (sourceEl.getAttribute('data-anavo-lr-init') === 'true') {
      dbg('Already initialized, skipping.');
      return;
    }
    sourceEl.setAttribute('data-anavo-lr-init', 'true');

    injectStyles();

    // ---- Extract text ----
    const originalText = extractText(sourceEl).trim();
    if (!originalText) {
      console.warn('[' + PLUGIN_NAME + '] No text content found in source element.');
      return;
    }
    dbg('Original text (' + originalText.length + ' chars):', originalText);

    const newPhrase = (config.phrase !== null) ? config.phrase : originalText;
    dbg('New phrase (' + newPhrase.length + ' chars):', newPhrase);

    // ---- Capture source size before we hide it ----
    const sourceRect = sourceEl.getBoundingClientRect();
    const sourceCs   = window.getComputedStyle(sourceEl);

    // ---- Build wrapper ----
    const wrapper = document.createElement('div');
    wrapper.className = 'anavo-lr-wrapper';
    wrapper.style.width    = sourceRect.width  + 'px';
    wrapper.style.minHeight = sourceRect.height + 'px';
    copyBoxStyles(sourceEl, wrapper);

    // Respect the source element's line-height / text-align for reflowing letters
    wrapper.style.lineHeight = sourceCs.lineHeight;
    wrapper.style.textAlign  = sourceCs.textAlign;

    // ---- Create individual letter spans ----
    const letterSpans = [];
    const letters = originalText.split('');
    for (let i = 0; i < letters.length; i++) {
      const span = document.createElement('span');
      span.className = 'anavo-lr-letter';
      span.textContent = letters[i];
      copyTypographyStyles(sourceEl, span);
      wrapper.appendChild(span);
      letterSpans.push(span);
    }

    // ---- Insert wrapper before source; hide original ----
    sourceEl.parentNode.insertBefore(wrapper, sourceEl);
    sourceEl.style.display = 'none';

    dbg('Wrapper inserted with', letterSpans.length, 'letter spans.');

    // ---- IntersectionObserver scroll trigger ----
    let hasBeenVisible = false;
    let animating      = false;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          hasBeenVisible = true;
          return;
        }
        // Only trigger when scrolled ABOVE the viewport (bottom edge < 0)
        if (
          hasBeenVisible &&
          !animating &&
          entry.boundingClientRect.bottom < 0
        ) {
          animating = true;
          dbg('Trigger: wrapper scrolled past top of viewport.');
          triggerAnimation(wrapper, letterSpans, originalText, newPhrase, function () {
            animating = false;
            if (!config.repeat) {
              observer.disconnect();
            }
          });
        }
      });
    }, { threshold: 0 });

    observer.observe(wrapper);

    loadLicensing(wrapper);
    console.log('✅ ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' Active!');
  }

  // ========================================
  // ANIMATION
  // ========================================

  function triggerAnimation(wrapper, letterSpans, originalText, newPhrase, onComplete) {
    const targetEl = document.querySelector(config.target);
    if (!targetEl) {
      console.warn('[' + PLUGIN_NAME + '] Target element not found: "' + config.target + '"');
      if (onComplete) onComplete();
      return;
    }

    dbg('Starting letter rain animation…');

    // ---- Reduced-motion fast-path ----
    if (reducedMotion) {
      dbg('Reduced motion: swapping text instantly.');
      wrapper.style.display = 'none';
      targetEl.textContent = newPhrase;
      if (letterSpans.length > 0) copyTypographyStyles(letterSpans[0], targetEl);
      if (onComplete) onComplete();
      return;
    }

    // ---- Snapshot source letter positions (viewport-relative via fixed coords) ----
    const sourceRects = letterSpans.map(function (span) {
      return span.getBoundingClientRect();
    });

    // ---- Build target placeholder spans (hidden until letter arrives) ----
    targetEl.innerHTML = '';
    const phraseChars  = newPhrase.split('');
    const targetSpans  = phraseChars.map(function (ch) {
      const span = document.createElement('span');
      span.className   = 'anavo-lr-target-letter';
      span.textContent = ch;
      if (letterSpans.length > 0) copyTypographyStyles(letterSpans[0], span);
      span.style.opacity = '0';
      targetEl.appendChild(span);
      return span;
    });

    // Wait two frames so target spans are fully laid out before capturing rects
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {

        // ---- Snapshot target letter positions ----
        const targetRects = targetSpans.map(function (span) {
          return span.getBoundingClientRect();
        });

        const minLen = Math.min(originalText.length, newPhrase.length);

        // ---- Create fixed-position flying clones at source positions ----
        const flyingEls = [];
        for (let i = 0; i < originalText.length; i++) {
          const r   = sourceRects[i];
          const fly = document.createElement('span');
          fly.className   = 'anavo-lr-flying';
          fly.textContent = letterSpans[i].textContent;
          copyTypographyStyles(letterSpans[i], fly);
          fly.style.left    = r.left + 'px';
          fly.style.top     = r.top  + 'px';
          fly.style.opacity = '1';
          document.body.appendChild(fly);
          flyingEls.push(fly);
        }

        // Hide the in-flow letter spans (flying clones take over visually)
        wrapper.style.visibility = 'hidden';

        // ---- Animate each flying clone ----
        for (let i = 0; i < flyingEls.length; i++) {
          (function (idx) {
            const fly     = flyingEls[idx];
            const srcRect = sourceRects[idx];
            const delay   = idx * config.stagger;

            if (idx < minLen) {
              // ---------- Animate to target position (two-phase: overshoot + settle) ----
              const destRect = targetRects[idx];
              const dx = destRect.left - srcRect.left;
              const dy = destRect.top  - srcRect.top;

              // Phase 1: fall to overshoot point
              const phase1Duration = Math.round(config.duration * 0.72);
              const phase2Duration = config.duration - phase1Duration;

              setTimeout(function () {
                fly.style.transition =
                  'transform ' + phase1Duration + 'ms ' + config.easing +
                  ', opacity ' + phase1Duration + 'ms ease';
                fly.style.transform = 'translate(' + dx + 'px, ' + (dy + config.fallDistance) + 'px)';

                // Phase 2: settle to exact destination
                setTimeout(function () {
                  fly.style.transition =
                    'transform ' + phase2Duration + 'ms ease-out' +
                    ', opacity ' + phase2Duration + 'ms ease';
                  fly.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';

                  // Reveal the in-flow target span and discard the clone
                  setTimeout(function () {
                    targetSpans[idx].style.transition = 'opacity 80ms ease';
                    targetSpans[idx].style.opacity    = '1';
                    fly.remove();
                  }, phase2Duration);
                }, phase1Duration);
              }, delay);

            } else {
              // ---------- Extra source letter: fall and fade out ----
              setTimeout(function () {
                const fallDur = config.duration;
                fly.style.transition =
                  'transform ' + fallDur + 'ms ' + config.easing +
                  ', opacity ' + Math.round(fallDur * 0.6) + 'ms ease ' + Math.round(fallDur * 0.4) + 'ms';
                fly.style.transform = 'translate(0px, ' + (config.fallDistance + 220) + 'px)';
                fly.style.opacity   = '0';
                setTimeout(function () { fly.remove(); }, fallDur + 100);
              }, delay);
            }
          })(i);
        }

        // ---- Fade in extra target phrase letters (phrase longer than original) ----
        if (newPhrase.length > originalText.length) {
          const baseDelay = (minLen > 0 ? (minLen - 1) : 0) * config.stagger + config.duration;
          for (let i = minLen; i < newPhrase.length; i++) {
            (function (idx) {
              const extraDelay = baseDelay + (idx - minLen) * config.stagger * 2;
              setTimeout(function () {
                const fadeDur = Math.round(config.duration * 0.4);
                targetSpans[idx].style.transition = 'opacity ' + fadeDur + 'ms ease';
                targetSpans[idx].style.opacity    = '1';
              }, extraDelay);
            })(i);
          }
        }

        // ---- Clean up wrapper after all letters have landed ----
        const totalDuration =
          (originalText.length > 0 ? (originalText.length - 1) : 0) * config.stagger +
          config.duration + 200;

        setTimeout(function () {
          wrapper.style.display = 'none';
          dbg('Animation complete.');

          // Reset state for repeat
          if (config.repeat) {
            wrapper.style.display    = '';
            wrapper.style.visibility = 'visible';
            targetEl.innerHTML       = '';
            dbg('State reset for repeat trigger.');
          }

          if (onComplete) onComplete();
        }, totalDuration);

      });
    });
  }

  // ========================================
  // DOM READY
  // ========================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
