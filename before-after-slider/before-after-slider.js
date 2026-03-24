/**
 * Anavo Before/After Slider v1.0.0
 * Drag-to-reveal image comparison. Touch + mouse support.
 *
 * Usage (Squarespace Code Block):
 * <div data-anavo-beforeafter
 *   data-before="https://...before.jpg"
 *   data-after="https://...after.jpg"
 *   data-before-label="Before"
 *   data-after-label="After"
 *   style="max-width:700px">
 * </div>
 *
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/before-after-slider/before-after-slider.min.js
 *   ?accentColor=%23ffffff
 *   ?startPosition=50
 * "></script>
 *
 * Or full URL-params mode (single instance):
 * ?before=URL&after=URL&target=%23my-div&beforeLabel=Before&afterLabel=After
 */
;(function () {
  'use strict';

  if (window.AnavoPluginState && window.AnavoPluginState.plugins['BeforeAfterSlider']) return;

  // ─── Config ──────────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="before-after-slider"]');
    return s[s.length - 1];
  })();

  var params = (scriptEl && scriptEl.src) ? new URL(scriptEl.src).searchParams : new URLSearchParams();

  var CFG = {
    target:        params.get('target')        || '[data-anavo-beforeafter]',
    // URL param fallbacks for single-instance use
    before:        params.get('before')        || '',
    after:         params.get('after')         || '',
    beforeLabel:   params.get('beforeLabel')   || 'Before',
    afterLabel:    params.get('afterLabel')    || 'After',
    startPosition: parseInt(params.get('startPosition') || '50', 10),
    accentColor:   params.get('accentColor')   || '#ffffff',
    handleColor:   params.get('handleColor')   || '#ffffff',
    labelBg:       params.get('labelBg')       || 'rgba(0,0,0,.45)',
    showLabels:    params.get('showLabels')    !== 'false',
    aspectRatio:   params.get('aspectRatio')   || '',           // e.g. '16/9' or '4/3' — overrides image natural ratio
    domain:        params.get('domain')        || window.location.hostname,
    apiBase:       params.get('api')           || 'https://api.anavo.tech',
  };

  // ─── Styles ───────────────────────────────────────────────────────────────────

  function injectStyles() {
    var ex = document.getElementById('anavo-bas-styles');
    if (ex) ex.remove();

    var css = [
      '.anavo-bas-wrap{position:relative !important;overflow:hidden !important;cursor:ew-resize !important;user-select:none !important;-webkit-user-select:none !important;touch-action:none !important}',
      '.anavo-bas-wrap img{position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;object-fit:cover !important;display:block !important;pointer-events:none !important}',
      '.anavo-bas-after{clip-path:none !important;position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important}',
      '.anavo-bas-after img{position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;object-fit:cover !important}',
      '.anavo-bas-divider{position:absolute !important;top:0 !important;bottom:0 !important;width:2px !important;background:' + CFG.accentColor + ' !important;z-index:3 !important;pointer-events:none !important}',
      '.anavo-bas-handle{position:absolute !important;top:50% !important;left:50% !important;transform:translate(-50%,-50%) !important;width:44px !important;height:44px !important;border-radius:50% !important;background:' + CFG.handleColor + ' !important;box-shadow:0 2px 12px rgba(0,0,0,.35) !important;display:flex !important;align-items:center !important;justify-content:center !important;z-index:4 !important;pointer-events:none !important}',
      '.anavo-bas-handle svg{width:20px !important;height:20px !important;flex-shrink:0 !important}',
      '.anavo-bas-label{position:absolute !important;bottom:14px !important;padding:4px 10px !important;background:' + CFG.labelBg + ' !important;color:#fff !important;font-size:13px !important;font-weight:600 !important;border-radius:3px !important;z-index:5 !important;letter-spacing:.04em !important;text-transform:uppercase !important;pointer-events:none !important;font-family:inherit !important}',
      '.anavo-bas-label-before{left:14px !important}',
      '.anavo-bas-label-after{right:14px !important}',
      '.anavo-bas-loading{display:flex !important;align-items:center !important;justify-content:center !important;min-height:200px !important;background:#f0f0f0 !important;color:#999 !important;font-size:14px !important}',
    ].join('');

    var el = document.createElement('style');
    el.id = 'anavo-bas-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ─── Handle SVG ──────────────────────────────────────────────────────────────

  var HANDLE_SVG = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M7 4L3 10L7 16" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M13 4L17 10L13 16" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  // ─── Build Slider ─────────────────────────────────────────────────────────────

  function buildSlider(container) {
    var beforeSrc  = container.getAttribute('data-before')        || CFG.before;
    var afterSrc   = container.getAttribute('data-after')         || CFG.after;
    var bLabel     = container.getAttribute('data-before-label')  || CFG.beforeLabel;
    var aLabel     = container.getAttribute('data-after-label')   || CFG.afterLabel;
    var startPos   = parseInt(container.getAttribute('data-start') || CFG.startPosition, 10);
    var ratio      = container.getAttribute('data-ratio')         || CFG.aspectRatio;

    if (!beforeSrc || !afterSrc) {
      container.innerHTML = '<div class="anavo-bas-loading">Before/After: missing image URLs.<br>Add data-before and data-after attributes.</div>';
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="anavo-bas-loading">Loading…</div>';
    container.style.display = 'block';

    // Preload images to get natural dimensions
    var imgBefore = new Image();
    var imgAfter  = new Image();
    var loaded    = 0;

    function onLoad() {
      loaded++;
      if (loaded < 2) return;
      render();
    }

    imgBefore.onload = imgAfter.onload = onLoad;
    imgBefore.onerror = imgAfter.onerror = function () { loaded++; if (loaded >= 2) render(); };
    imgBefore.src = beforeSrc;
    imgAfter.src  = afterSrc;

    function render() {
      // Aspect ratio
      var w = imgBefore.naturalWidth  || 16;
      var h = imgBefore.naturalHeight || 9;
      var paddingTop = ratio ? '' : ((h / w * 100).toFixed(2) + '%');

      container.innerHTML = '';
      container.className = (container.className || '') + ' anavo-bas-wrap';

      if (ratio) {
        container.style.aspectRatio = ratio;
      } else {
        container.style.paddingTop = paddingTop;
        container.style.height = '0';
      }

      // Before image (full width)
      var beforeImg = document.createElement('img');
      beforeImg.src = beforeSrc;
      beforeImg.alt = bLabel;
      beforeImg.draggable = false;
      container.appendChild(beforeImg);

      // After image (clipped)
      var afterDiv = document.createElement('div');
      afterDiv.className = 'anavo-bas-after';
      afterDiv.style.width = startPos + '%';
      var afterImg = document.createElement('img');
      afterImg.src = afterSrc;
      afterImg.alt = aLabel;
      afterImg.draggable = false;
      afterDiv.appendChild(afterImg);
      container.appendChild(afterDiv);

      // Divider
      var divider = document.createElement('div');
      divider.className = 'anavo-bas-divider';
      divider.style.left = startPos + '%';

      var handle = document.createElement('div');
      handle.className = 'anavo-bas-handle';
      handle.innerHTML = HANDLE_SVG;
      divider.appendChild(handle);
      container.appendChild(divider);

      // Labels
      if (CFG.showLabels) {
        var lb = document.createElement('div');
        lb.className = 'anavo-bas-label anavo-bas-label-before';
        lb.textContent = bLabel;
        container.appendChild(lb);

        var la = document.createElement('div');
        la.className = 'anavo-bas-label anavo-bas-label-after';
        la.textContent = aLabel;
        container.appendChild(la);
      }

      // Drag logic
      bindDrag(container, afterDiv, divider);
    }
  }

  // ─── Drag Interaction ─────────────────────────────────────────────────────────

  function bindDrag(container, afterDiv, divider) {
    var dragging = false;

    function getPercent(clientX) {
      var rect = container.getBoundingClientRect();
      var pct  = ((clientX - rect.left) / rect.width) * 100;
      return Math.max(1, Math.min(99, pct));
    }

    function move(pct) {
      afterDiv.style.width = pct + '%';
      divider.style.left   = pct + '%';
    }

    // Mouse
    container.addEventListener('mousedown', function (e) { dragging = true; move(getPercent(e.clientX)); e.preventDefault(); });
    document.addEventListener('mousemove', function (e) { if (dragging) move(getPercent(e.clientX)); });
    document.addEventListener('mouseup',   function ()  { dragging = false; });

    // Touch
    container.addEventListener('touchstart', function (e) { dragging = true; move(getPercent(e.touches[0].clientX)); }, { passive: true });
    container.addEventListener('touchmove',  function (e) { if (dragging) { move(getPercent(e.touches[0].clientX)); e.preventDefault(); } }, { passive: false });
    container.addEventListener('touchend',   function ()  { dragging = false; });
  }

  // ─── License (non-blocking) ───────────────────────────────────────────────────

  function checkLicense() {
    fetch(CFG.apiBase + '/api/licenses/check?domain=' + encodeURIComponent(CFG.domain) + '&plugin=before-after-slider')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.licensed) console.warn('[Anavo Before/After] Unlicensed'); })
      .catch(function () {});
  }

  // ─── Mount ────────────────────────────────────────────────────────────────────

  function mount() {
    try {
      injectStyles();
      document.querySelectorAll(CFG.target).forEach(buildSlider);
      checkLicense();
    } catch (e) { /* silent */ }
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
  window.AnavoPluginState.plugins['BeforeAfterSlider'] = { version: '1.0.0', config: CFG };

})();
