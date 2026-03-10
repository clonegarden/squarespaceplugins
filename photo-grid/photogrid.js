/**
 * =======================================
 * PHOTO GRID - Squarespace Plugin
 * =======================================
 * @version 1.2.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * Builds an auto-calculated justified collage grid for all images/videos
 * inside a target Squarespace section. Supports edit-mode UI controls,
 * masonry layout, and custom ordering.
 *
 * INSTALLATION:
 * Paste in Settings → Advanced → Code Injection → Footer:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js"></script>
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.2.0';
  const PLUGIN_NAME = 'PhotoGrid';
  const STYLE_ID = 'anavo-photogrid-styles';
  const DEFAULT_IMG_WIDTH = 400;
  const DEFAULT_IMG_HEIGHT = 300;

  console.log('\uD83D\uDDBC\uFE0F ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' - Loading...');

  // ========================================
  // 1. SCRIPT PARAMETER PARSING
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  /**
   * Premade grid presets (1-indexed for URL params).
   * premadegrid=1 → Classic, premadegrid=2 → Compact, etc.
   */
  const PREMADE_GRIDS = [
    { name: 'Classic', rowHeight: 300, gutter: 4, layout: 'justified' },
    { name: 'Compact', rowHeight: 200, gutter: 2, layout: 'justified' },
    { name: 'Wide', rowHeight: 420, gutter: 8, layout: 'justified' },
    { name: 'Masonry', rowHeight: 280, gutter: 6, layout: 'masonry', columns: 3 },
    { name: 'Tight', rowHeight: 180, gutter: 1, layout: 'justified' },
  ];

  function getScriptParams() {
    try {
      const src = currentScript.src;
      const url = new URL(src, window.location.href);
      const p = url.searchParams;

      // Premade preset (1-based index)
      const premadegridIndex = parseInt(p.get('premadegrid') || '0', 10);
      const preset =
        premadegridIndex >= 1 && premadegridIndex <= PREMADE_GRIDS.length
          ? PREMADE_GRIDS[premadegridIndex - 1]
          : null;

      // Custom order (comma-separated 0-based indices)
      const orderParam = p.get('order');
      const order = orderParam
        ? orderParam
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n))
        : null;

      // Layout resolution: explicit param > preset > default
      const layoutParam = p.get('layout') || (preset ? preset.layout : 'justified');
      const uneven = p.get('uneven') === 'true' || layoutParam === 'masonry';

      return {
        rowHeight: parseInt(p.get('rowHeight') || (preset ? preset.rowHeight : '300'), 10),
        minRowHeight: parseInt(p.get('minRowHeight') || '100', 10),
        maxRowHeight: parseInt(p.get('maxRowHeight') || '600', 10),
        gutter: parseInt(p.get('gutter') || (preset ? preset.gutter : '4'), 10),
        layout: uneven ? 'masonry' : layoutParam,
        uneven,
        columns: parseInt(
          p.get('columns') || (preset && preset.columns ? preset.columns : '3'),
          10
        ),
        targetId: p.get('targetId') || 'photogrid',
        targetTag: p.get('targetTag') || 'div',
        targetIndex: parseInt(p.get('targetIndex') || '1', 10),
        premadegrid: premadegridIndex || null,
        order,
        gridWidth: p.get('gridWidth') || '100%',
        gridMaxWidth: p.get('gridMaxWidth') || 'none',
        debug: p.get('debug') === 'true',
      };
    } catch (_e) {
      return {
        rowHeight: 300,
        minRowHeight: 100,
        maxRowHeight: 600,
        gutter: 4,
        layout: 'justified',
        uneven: false,
        columns: 3,
        targetId: 'photogrid',
        targetTag: 'div',
        targetIndex: 1,
        premadegrid: null,
        order: null,
        gridWidth: '100%',
        gridMaxWidth: 'none',
        debug: false,
      };
    }
  }

  const cfg = getScriptParams();

  function dbg() {
    if (cfg.debug) {
      const args = Array.prototype.slice.call(arguments);
      args.unshift('[' + PLUGIN_NAME + ']');
      console.log.apply(console, args);
    }
  }

  dbg('v' + PLUGIN_VERSION + ' config:', cfg);

  // ========================================
  // 2. REDUCED MOTION
  // ========================================

  const reducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // 3. LICENSING (non-blocking)
  // ========================================

  let _licensed = false;

  async function loadLicensing(container) {
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
        showUI: true,
      });

      const result = await lm.init();
      _licensed = result.licensed === true || lm.isLicensed === true;

      if (!_licensed && container) {
        insertWatermark(container);
      }
    } catch (_e) {
      console.warn('\u26A0\uFE0F ' + PLUGIN_NAME + ': license check failed');
    }
  }

  function insertWatermark(container) {
    if (container.querySelector('.anavo-pg-watermark')) return;
    const wm = document.createElement('div');
    wm.className = 'anavo-pg-watermark';
    wm.style.cssText =
      'position:absolute;bottom:8px;right:10px;font-size:11px;font-family:system-ui,sans-serif;' +
      'color:rgba(255,255,255,0.9);text-shadow:0 1px 3px rgba(0,0,0,0.6);' +
      'pointer-events:none;z-index:10;background:rgba(0,0,0,0.45);padding:2px 7px;border-radius:3px;';
    wm.textContent = '\u26A0\uFE0F Unlicensed \u2013 anavo.tech';
    container.appendChild(wm);
  }

  // ========================================
  // 4. CSS INJECTION
  // ========================================

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '/* Photo Grid v' +
      PLUGIN_VERSION +
      ' \u2013 Anavo Tech */\n' +
      '.anavo-pg-container{position:relative;width:100%;box-sizing:border-box;line-height:0;font-size:0;}' +
      '.anavo-pg-row{display:flex;flex-direction:row;align-items:stretch;width:100%;box-sizing:border-box;}' +
      '.anavo-pg-item{position:relative;overflow:hidden;flex-shrink:0;box-sizing:border-box;display:block;}' +
      '.anavo-pg-item img,.anavo-pg-item video{width:100%;height:100%;object-fit:cover;display:block;line-height:0;font-size:0;' +
      (reducedMotion ? '' : 'transition:transform 0.3s ease;') +
      '}' +
      (reducedMotion
        ? ''
        : '.anavo-pg-item:hover img,.anavo-pg-item:hover video{transform:scale(1.03);}') +
      '.anavo-pg-container.anavo-pg-masonry{display:flex;flex-direction:row;align-items:flex-start;}' +
      '.anavo-pg-masonry-col{flex:1;display:flex;flex-direction:column;box-sizing:border-box;}' +
      '.anavo-pg-masonry .anavo-pg-item{width:100%;height:auto;}' +
      '.anavo-pg-masonry .anavo-pg-item img,.anavo-pg-masonry .anavo-pg-item video{width:100%;height:auto;object-fit:cover;}' +
      '.anavo-pg-iframe-wrap{position:relative;width:100%;padding-bottom:56.25%;height:0;}' +
      '.anavo-pg-iframe-wrap iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0;}' +
      '.anavo-pg-edit-panel{position:fixed;bottom:24px;right:24px;background:rgba(18,18,18,0.93);color:#fff;' +
      'border-radius:12px;padding:14px 18px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
      'font-size:13px;min-width:250px;box-shadow:0 8px 32px rgba(0,0,0,0.45);line-height:1.4;' +
      (reducedMotion ? '' : 'backdrop-filter:blur(8px);') +
      '}' +
      '.anavo-pg-edit-panel h4{margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;' +
      'letter-spacing:0.08em;color:rgba(255,255,255,0.55);}' +
      '.anavo-pg-panel-row{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;}' +
      '.anavo-pg-btn{background:rgba(255,255,255,0.11);color:#fff;border:1px solid rgba(255,255,255,0.14);' +
      'border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;white-space:nowrap;' +
      (reducedMotion ? '' : 'transition:background 0.15s ease;') +
      '}' +
      '.anavo-pg-btn:hover{background:rgba(255,255,255,0.2);}' +
      '.anavo-pg-btn.active{background:#3b82f6;border-color:#3b82f6;}' +
      '.anavo-pg-url-label{font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:4px;}' +
      '.anavo-pg-url-box{width:100%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.13);' +
      'border-radius:6px;padding:6px 8px;font-size:11px;color:#93c5fd;font-family:monospace;' +
      'word-break:break-all;cursor:text;margin-top:2px;box-sizing:border-box;user-select:all;}' +
      '.anavo-pg-copy-btn{background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:5px 12px;' +
      'font-size:12px;cursor:pointer;width:100%;margin-top:6px;' +
      (reducedMotion ? '' : 'transition:opacity 0.15s;') +
      '}' +
      '.anavo-pg-copy-btn:hover{opacity:0.82;}';
    document.head.appendChild(style);
  }

  // ========================================
  // 5. TARGET SECTION DETECTION
  // ========================================

  function findTargetSection() {
    // Priority 1: section containing a heading with text "Photo Album" (case-insensitive)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];
      if (h.textContent.trim().toLowerCase() === 'photo album') {
        const section = h.closest(
          'section, [data-section-id], .page-section, article, [class*="Section"]'
        );
        if (section) {
          dbg('Found target via "Photo Album" heading:', section);
          return section;
        }
      }
    }

    // Priority 2: element with configured targetId (default: "photogrid")
    const byId = document.getElementById(cfg.targetId);
    if (byId) {
      // Walk up to the nearest Squarespace section — the images are siblings
      // of the code block, not children of the #photogrid div
      const parentSection = byId.closest(
        'section, [data-section-id], .page-section, article, [class*="Section"]'
      );
      if (parentSection) {
        dbg('Found target via ID "' + cfg.targetId + '", resolved to parent section:', parentSection);
        return parentSection;
      }
      // Fallback: use the element itself (for non-Squarespace contexts)
      dbg('Found target via ID "' + cfg.targetId + '" (no parent section found, using element directly):', byId);
      return byId;
    }

    // Priority 3: targetTag + targetIndex (1-based)
    const els = document.getElementsByTagName(cfg.targetTag);
    const idx = cfg.targetIndex - 1;
    if (els.length > idx) {
      const el = els[idx];
      // Walk up to the nearest Squarespace section if the matched element is not already one
      const parentSection = el.closest(
        'section, [data-section-id], .page-section, article, [class*="Section"]'
      );
      if (parentSection) {
        dbg('Found target via tag "' + cfg.targetTag + '" index ' + cfg.targetIndex + ', resolved to parent section:', parentSection);
        return parentSection;
      }
      dbg('Found target via tag "' + cfg.targetTag + '" index ' + cfg.targetIndex);
      return el;
    }

    return null;
  }

  // ========================================
  // 6. MEDIA SOURCING
  // ========================================

  /** Get best image src from an img element (prefers high-res / Squarespace data-src). */
  function getBestImageSrc(img) {
    if (img.dataset && img.dataset.src) return img.dataset.src;

    // Parse srcset and pick the widest entry
    if (img.srcset) {
      const entries = img.srcset.split(',').map(function (s) {
        const parts = s.trim().split(/\s+/);
        return { url: parts[0], w: parseInt(parts[1] || '0', 10) };
      });
      entries.sort(function (a, b) {
        return b.w - a.w;
      });
      if (entries.length && entries[0].url) return entries[0].url;
    }

    return img.src || '';
  }

  /** Get native dimensions of an image from Squarespace data attributes or intrinsic size. */
  function getImageDimensions(img) {
    const dw =
      parseInt(img.dataset && img.dataset.imageWidth, 10) ||
      parseInt(img.getAttribute('data-image-width'), 10) ||
      0;
    const dh =
      parseInt(img.dataset && img.dataset.imageHeight, 10) ||
      parseInt(img.getAttribute('data-image-height'), 10) ||
      0;
    if (dw > 0 && dh > 0) return { width: dw, height: dh };

    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      return { width: img.naturalWidth, height: img.naturalHeight };
    }

    const aw = parseInt(img.getAttribute('width') || '0', 10);
    const ah = parseInt(img.getAttribute('height') || '0', 10);
    if (aw > 0 && ah > 0) return { width: aw, height: ah };

    return { width: DEFAULT_IMG_WIDTH, height: DEFAULT_IMG_HEIGHT }; // fallback 4:3
  }

  /**
   * Collect all images and videos from supported Squarespace block types
   * (Image block, Gallery block, Video block) within the target section.
   */
  function collectMedia(section) {
    const items = [];
    const seenBlocks = new Set();

    // ---- Image blocks (data-block-type="5") ----
    const imageBlocks = section.querySelectorAll(
      '.sqs-block-image, [data-block-type="5"], .image-block'
    );
    imageBlocks.forEach(function (block) {
      if (seenBlocks.has(block)) return;
      seenBlocks.add(block);
      const img = block.querySelector('img');
      if (!img) return;
      const src = getBestImageSrc(img);
      if (!src) return;
      const dims = getImageDimensions(img);
      items.push({
        type: 'image',
        src: src,
        width: dims.width,
        height: dims.height,
        alt: img.alt || '',
        blockEl: block,
      });
    });

    // ---- Gallery blocks (data-block-type="25") ----
    const galleryBlocks = section.querySelectorAll(
      '.sqs-block-gallery, [data-block-type="25"], .gallery-block'
    );
    galleryBlocks.forEach(function (block) {
      if (seenBlocks.has(block)) return;
      seenBlocks.add(block);
      const imgs = block.querySelectorAll('img');
      imgs.forEach(function (img) {
        const src = getBestImageSrc(img);
        if (!src) return;
        const dims = getImageDimensions(img);
        items.push({
          type: 'image',
          src: src,
          width: dims.width,
          height: dims.height,
          alt: img.alt || '',
          blockEl: block,
        });
      });
    });

    // ---- Video blocks (data-block-type="32", "51", "13", "54", "55") ----
    const videoBlocks = section.querySelectorAll(
      '.sqs-block-video, [data-block-type="32"], [data-block-type="51"], [data-block-type="52"], [data-block-type="13"], [data-block-type="54"], [data-block-type="55"], .video-block, .sqs-native-video, .sqs-block-video-native, .sqs-video-wrapper'
    );
    videoBlocks.forEach(function (block) {
      if (seenBlocks.has(block)) return;
      seenBlocks.add(block);

      // Native HTML5 video element
      const vid = block.querySelector('video');
      if (vid) {
        const src =
          vid.src ||
          (vid.dataset && vid.dataset.src) ||
          (vid.querySelector('source') ? vid.querySelector('source').src : '');
        const w = parseInt(vid.getAttribute('width') || '0', 10) || vid.videoWidth || 1280;
        const h = parseInt(vid.getAttribute('height') || '0', 10) || vid.videoHeight || 720;
        const poster = vid.getAttribute('poster') || '';
        items.push({
          type: 'video',
          src: src,
          poster: poster,
          width: w,
          height: h,
          blockEl: block,
        });
        return;
      }

      // Iframe embed (YouTube / Vimeo)
      const iframe = block.querySelector('iframe');
      if (iframe) {
        items.push({
          type: 'iframe',
          src: iframe.src || (iframe.dataset && iframe.dataset.src) || '',
          width: 1280,
          height: 720,
          blockEl: block,
        });
        return;
      }

      // Squarespace intrinsic video data attribute
      const videoWrapper = block.querySelector('[data-type="video"]');
      if (videoWrapper) {
        const videoSrc = (videoWrapper.dataset && videoWrapper.dataset.src) || '';
        items.push({
          type: 'video',
          src: videoSrc,
          width: 1280,
          height: 720,
          blockEl: block,
        });
        return;
      }

      // Squarespace Native Video via data-config-video JSON attribute
      // SQS 7.1 stores the video URL inside a JSON blob on .sqs-native-video elements
      var nativeVideoEl = block.querySelector('.sqs-native-video[data-config-video]');
      if (nativeVideoEl) {
        try {
          var videoConfig = JSON.parse(nativeVideoEl.getAttribute('data-config-video'));
          var alexandriaUrl = videoConfig.alexandriaUrl || '';

          if (alexandriaUrl) {
            // Validate hostname exactly to prevent substring spoofing
            var isValidCdnUrl = false;
            try {
              isValidCdnUrl = new URL(alexandriaUrl.replace('{variant}', 'playlist.m3u8')).hostname === 'video.squarespace-cdn.com';
            } catch (_urlErr) { /* malformed URL — skip */ }

            if (isValidCdnUrl) {
              // Replace {variant} placeholder with HLS playlist path
              var hlsUrl = alexandriaUrl.replace('{variant}', 'playlist.m3u8');

              // Extract aspect ratio for proper dimensions (0.5625 = 9/16 height/width, i.e. default 16:9 landscape)
              var aspectRatio = videoConfig.aspectRatio || 0.5625;
              var videoWidth = 1280;
              var videoHeight = Math.round(videoWidth * aspectRatio);

              // Try to get poster/thumbnail
              var posterSrc = '';
              var thumbnailAttr = nativeVideoEl.getAttribute('data-config-thumbnail');
              if (thumbnailAttr && thumbnailAttr !== 'null') {
                try {
                  var thumbConfig = JSON.parse(thumbnailAttr);
                  posterSrc = thumbConfig.url || thumbConfig.src || '';
                } catch (_thumbErr) {
                  posterSrc = thumbnailAttr; // might be a plain URL string
                }
              }
              // Also check for an img inside the wrapper as poster fallback
              if (!posterSrc) {
                var posterImg = nativeVideoEl.querySelector('img');
                if (posterImg) posterSrc = getBestImageSrc(posterImg);
              }

              items.push({
                type: 'video',
                src: hlsUrl,
                poster: posterSrc,
                width: videoWidth,
                height: videoHeight,
                isHLS: true,
                blockEl: block,
              });
            }
          }
        } catch (_jsonErr) {
          // JSON parse failed — skip this video
          if (cfg.debug) {
            console.warn('[PhotoGrid] Failed to parse data-config-video JSON:', _jsonErr);
          }
        }
        return; // handled this block
      }
    });

    // FALLBACK: If no items found via block-type selectors,
    // try finding any images in the section (handles Squarespace 7.1 lazy-loading)
    if (items.length === 0) {
      dbg('Block-type selectors found nothing, trying fallback image detection...');

      // Try Squarespace fluid image wrappers
      var fluidImages = section.querySelectorAll(
        '[data-src], .sqs-image img, .intrinsic img, img[data-src]'
      );
      fluidImages.forEach(function (el) {
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        var src = '';

        if (img) {
          src = getBestImageSrc(img);
        }
        if (!src && el.dataset && el.dataset.src) {
          src = el.dataset.src;
        }
        if (!src) return;

        var dims = img ? getImageDimensions(img) : { width: DEFAULT_IMG_WIDTH, height: DEFAULT_IMG_HEIGHT };

        // Also try to get dimensions from parent wrapper
        if (dims.width === DEFAULT_IMG_WIDTH && dims.height === DEFAULT_IMG_HEIGHT) {
          var wrapper = el.closest('[data-image-dimensions]');
          if (wrapper && wrapper.dataset.imageDimensions) {
            var parts = wrapper.dataset.imageDimensions.split('x');
            if (parts.length === 2) {
              dims = {
                width: parseInt(parts[0], 10) || DEFAULT_IMG_WIDTH,
                height: parseInt(parts[1], 10) || DEFAULT_IMG_HEIGHT,
              };
            }
          }
        }

        var blockEl =
          el.closest('.sqs-block, .sqs-image, [class*="block"]') || el.parentElement;
        if (seenBlocks.has(blockEl)) return;
        seenBlocks.add(blockEl);

        items.push({
          type: 'image',
          src: src,
          width: dims.width,
          height: dims.height,
          alt: (img && img.alt) || '',
          blockEl: blockEl,
        });
      });

      // Last resort: find any <img> in the section
      if (items.length === 0) {
        var allImgs = section.querySelectorAll('img');
        allImgs.forEach(function (img) {
          var src = getBestImageSrc(img);
          if (!src) return;
          var dims = getImageDimensions(img);
          var blockEl = img.closest('.sqs-block, [class*="block"]') || img.parentElement;
          if (seenBlocks.has(blockEl)) return;
          seenBlocks.add(blockEl);
          items.push({
            type: 'image',
            src: src,
            width: dims.width,
            height: dims.height,
            alt: img.alt || '',
            blockEl: blockEl,
          });
        });
      }

      dbg('Fallback image detection found', items.length, 'items');
    }

    // ---- Squarespace Native Video (HLS) detection ----
    // SQS 7.1 stores video URLs in data attributes; the <video> element may not exist yet.
    var nativeVideoWrappers = section.querySelectorAll(
      '[data-src*="video.squarespace-cdn"], [data-video-url*="video.squarespace-cdn"], .sqs-native-video[data-config-video], .sqs-video-wrapper'
    );
    nativeVideoWrappers.forEach(function (wrapper) {
      var blockEl = wrapper.closest('.sqs-block, [class*="block"]') || wrapper;
      if (seenBlocks.has(blockEl)) return;
      seenBlocks.add(blockEl);

      // Extract video CDN base URL from data attributes
      var videoBaseUrl =
        wrapper.getAttribute('data-src') ||
        wrapper.getAttribute('data-video-url') ||
        '';

      // Try data-config-video JSON attribute (Squarespace native video)
      var parsedConfigVideo = null;
      if (!videoBaseUrl) {
        var configVideoAttr = wrapper.getAttribute('data-config-video');
        if (configVideoAttr) {
          try {
            parsedConfigVideo = JSON.parse(configVideoAttr);
            videoBaseUrl = (parsedConfigVideo.alexandriaUrl || '').replace('{variant}', 'playlist.m3u8');
          } catch (_e) { /* JSON parse failed — skip */ }
        }
      }

      // Look inside for any element that holds the URL
      if (!videoBaseUrl) {
        var inner = wrapper.querySelector('[data-src*="video.squarespace-cdn"]');
        if (inner) videoBaseUrl = inner.getAttribute('data-src') || '';
      }
      if (!videoBaseUrl) {
        var innerConfig = wrapper.querySelector('[data-config-video]');
        if (innerConfig) {
          try {
            var innerVideoConfig = JSON.parse(innerConfig.getAttribute('data-config-video'));
            videoBaseUrl = (innerVideoConfig.alexandriaUrl || '').replace('{variant}', 'playlist.m3u8');
            if (!parsedConfigVideo) parsedConfigVideo = innerVideoConfig;
          } catch (_e) { /* JSON parse failed — skip */ }
        }
      }

      // Ensure HLS playlist suffix — verify hostname exactly to avoid substring spoofing
      var isSqsCdn = false;
      if (videoBaseUrl) {
        try {
          var parsedVideoUrl = new URL(videoBaseUrl);
          isSqsCdn = parsedVideoUrl.hostname === 'video.squarespace-cdn.com';
        } catch (_e) {
          // Relative or malformed URL — skip suffix check
        }
      }
      // For non-alexandriaUrl sources that still need the playlist suffix
      if (isSqsCdn && !videoBaseUrl.endsWith('playlist.m3u8')) {
        videoBaseUrl = videoBaseUrl.replace(/\/?$/, '/playlist.m3u8');
      }

      // Get poster/thumbnail
      var posterSrc = '';
      var thumbnailAttr = wrapper.getAttribute('data-config-thumbnail');
      if (thumbnailAttr && thumbnailAttr !== 'null') {
        try {
          var thumbData = JSON.parse(thumbnailAttr);
          posterSrc = thumbData.url || thumbData.src || '';
        } catch (_e) {
          posterSrc = thumbnailAttr;
        }
      }
      if (!posterSrc) {
        var poster = wrapper.querySelector('img');
        posterSrc = poster ? getBestImageSrc(poster) : '';
      }

      // Extract aspect ratio if available (0.5625 = 9/16 height/width, i.e. default 16:9 landscape)
      var hlsItemAspectRatio = 0.5625;
      if (parsedConfigVideo && parsedConfigVideo.aspectRatio) {
        hlsItemAspectRatio = parsedConfigVideo.aspectRatio;
      }
      var w = 1280;
      var h = Math.round(w * hlsItemAspectRatio);

      if (videoBaseUrl || posterSrc) {
        items.push({
          type: 'video',
          src: videoBaseUrl,
          poster: posterSrc,
          width: w,
          height: h,
          isHLS: isSqsCdn || videoBaseUrl.endsWith('.m3u8'),
          blockEl: blockEl,
        });
      }
    });

    // Always scan for bare <video> elements — runs regardless of whether images were found,
    // so videos in mixed image+video sections are never skipped. seenBlocks prevents duplicates.
    var allVideos = section.querySelectorAll('video');
    allVideos.forEach(function (vid) {
      var src =
        vid.src ||
        (vid.dataset && vid.dataset.src) ||
        (vid.querySelector('source') ? vid.querySelector('source').src : '');
      var poster = vid.getAttribute('poster') || '';
      // Collect the item even when src is empty (Squarespace native videos lazy-inject the src);
      // use the poster as a visual placeholder until the video source becomes available.
      if (!src && !poster) return;
      var w = parseInt(vid.getAttribute('width') || '0', 10) || vid.videoWidth || 1280;
      var h = parseInt(vid.getAttribute('height') || '0', 10) || vid.videoHeight || 720;
      var blockEl =
        vid.closest('.sqs-block, .sqs-native-video, [class*="block"]') || vid.parentElement;
      if (seenBlocks.has(blockEl)) return;
      seenBlocks.add(blockEl);
      items.push({
        type: 'video',
        src: src,
        poster: poster,
        width: w,
        height: h,
        blockEl: blockEl,
      });
    });

    // Always scan for bare <iframe> embeds (YouTube/Vimeo) — same reasoning as above.
    var allIframes = section.querySelectorAll(
      'iframe[src*="youtube"], iframe[src*="vimeo"], iframe[data-src*="youtube"], iframe[data-src*="vimeo"]'
    );
    allIframes.forEach(function (iframe) {
      var src = iframe.src || (iframe.dataset && iframe.dataset.src) || '';
      if (!src) return;
      var blockEl = iframe.closest('.sqs-block, [class*="block"]') || iframe.parentElement;
      if (seenBlocks.has(blockEl)) return;
      seenBlocks.add(blockEl);
      items.push({
        type: 'iframe',
        src: src,
        width: 1280,
        height: 720,
        blockEl: blockEl,
      });
    });

    dbg('Collected', items.length, 'media items');
    return items;
  }

  /** Re-order items according to an array of 0-based indices. Unlisted items are appended. */
  function applyOrder(items, order) {
    if (!order || !order.length) return items;
    const result = [];
    const used = new Array(items.length).fill(false);
    order.forEach(function (idx) {
      if (idx >= 0 && idx < items.length && !used[idx]) {
        result.push(items[idx]);
        used[idx] = true;
      }
    });
    items.forEach(function (item, i) {
      if (!used[i]) result.push(item);
    });
    return result;
  }

  // ========================================
  // 7. JUSTIFIED GRID LAYOUT
  // ========================================

  /**
   * Compute justified rows.
   * Returns an array of rows; each row is an array of items with
   * finalWidth and finalHeight set.
   */
  function computeJustifiedRows(items, containerWidth, rowHeight, gutter, minRowHeight, maxRowHeight) {
    const rows = [];
    let currentRow = [];
    let currentRatioSum = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const ratio = item.width / item.height || 1;
      const projectedWidth =
        (currentRatioSum + ratio) * rowHeight + currentRow.length * gutter;

      if (projectedWidth > containerWidth && currentRow.length > 0) {
        rows.push({ items: currentRow, ratioSum: currentRatioSum, isLast: false });
        currentRow = [Object.assign({}, item, { ratio: ratio })];
        currentRatioSum = ratio;
      } else {
        currentRow.push(Object.assign({}, item, { ratio: ratio }));
        currentRatioSum += ratio;
      }
    }

    if (currentRow.length > 0) {
      rows.push({ items: currentRow, ratioSum: currentRatioSum, isLast: true });
    }

    return rows.map(function (row, _rowIdx) {
      const n = row.items.length;
      const gutterTotal = (n - 1) * gutter;
      let finalRowHeight;

      if (row.isLast && n <= 2 && rows.length > 1) {
        // Don't over-stretch a short last row
        finalRowHeight = rowHeight;
      } else {
        const totalRatioWidth = row.ratioSum * rowHeight;
        const scale = (containerWidth - gutterTotal) / totalRatioWidth;
        finalRowHeight = Math.round(rowHeight * scale);
        finalRowHeight = Math.max(minRowHeight, Math.min(maxRowHeight, finalRowHeight));
      }

      return row.items.map(function (item) {
        return Object.assign({}, item, {
          finalWidth: Math.round(item.ratio * finalRowHeight),
          finalHeight: finalRowHeight,
        });
      });
    });
  }

  function renderJustifiedGrid(container, items, containerWidth) {
    container.innerHTML = '';
    container.classList.remove('anavo-pg-masonry');

    const rows = computeJustifiedRows(
      items,
      containerWidth,
      cfg.rowHeight,
      cfg.gutter,
      cfg.minRowHeight,
      cfg.maxRowHeight
    );

    rows.forEach(function (rowItems) {
      const rowEl = document.createElement('div');
      rowEl.className = 'anavo-pg-row';
      rowEl.style.marginBottom = cfg.gutter + 'px';

      rowItems.forEach(function (item, idx) {
        const itemEl = buildItemElement(item);
        itemEl.style.width = item.finalWidth + 'px';
        itemEl.style.height = item.finalHeight + 'px';
        if (idx < rowItems.length - 1) {
          itemEl.style.marginRight = cfg.gutter + 'px';
        }
        rowEl.appendChild(itemEl);
      });

      container.appendChild(rowEl);
    });
  }

  // ========================================
  // 8. MASONRY LAYOUT
  // ========================================

  function renderMasonryGrid(container, items, containerWidth) {
    container.innerHTML = '';
    container.classList.add('anavo-pg-masonry');
    container.style.gap = '0';

    const numCols = Math.max(1, cfg.columns);
    const colWidth = (containerWidth - (numCols - 1) * cfg.gutter) / numCols;
    const cols = [];

    for (let i = 0; i < numCols; i++) {
      const col = document.createElement('div');
      col.className = 'anavo-pg-masonry-col';
      // Add left gutter for columns after the first
      if (i > 0) col.style.marginLeft = cfg.gutter + 'px';
      container.appendChild(col);
      cols.push({ el: col, height: 0 });
    }

    items.forEach(function (item) {
      // Place item in shortest column
      let shortest = cols[0];
      for (let c = 1; c < cols.length; c++) {
        if (cols[c].height < shortest.height) shortest = cols[c];
      }

      const itemEl = buildItemElement(item);
      itemEl.style.marginBottom = cfg.gutter + 'px';
      shortest.el.appendChild(itemEl);

      const ratio = item.width / item.height || 1;
      shortest.height += colWidth / ratio + cfg.gutter;
    });
  }

  // ========================================
  // 9. BUILD ITEM ELEMENT
  // ========================================

  function buildItemElement(item) {
    const el = document.createElement('div');
    el.className = 'anavo-pg-item';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      el.appendChild(img);
    } else if (item.type === 'video') {
      if (item.isHLS) {
        // HLS video: try native playback (works in Safari), fall back to poster image
        var video = document.createElement('video');
        if (item.src) video.src = item.src;
        if (item.poster) video.poster = item.poster;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        // If the video fails to play for any reason (format not supported,
        // network error, etc.), show the poster image as a visual placeholder.
        video.addEventListener('error', function() {
          if (item.poster) {
            var fallbackImg = document.createElement('img');
            fallbackImg.src = item.poster;
            fallbackImg.alt = 'Video thumbnail';
            fallbackImg.loading = 'lazy';
            fallbackImg.decoding = 'async';
            el.replaceChild(fallbackImg, video);
          }
        });
        el.appendChild(video);
      } else {
        // Standard video (mp4, etc.)
        var video = document.createElement('video');
        if (item.src) video.src = item.src;
        if (item.poster) video.poster = item.poster;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        el.appendChild(video);
      }
    } else if (item.type === 'iframe') {
      const wrap = document.createElement('div');
      wrap.className = 'anavo-pg-iframe-wrap';

      const iframe = document.createElement('iframe');
      let src = item.src;
      // Add autoplay params for known video providers — use URL hostname for safe matching
      try {
        const parsedUrl = new URL(src, window.location.href);
        const host = parsedUrl.hostname;
        const isYouTube =
          host === 'www.youtube.com' ||
          host === 'youtube.com' ||
          host === 'youtu.be' ||
          host === 'www.youtube-nocookie.com' ||
          host === 'youtube-nocookie.com';
        const isVimeo =
          host === 'vimeo.com' ||
          host === 'www.vimeo.com' ||
          host === 'player.vimeo.com';
        if (isYouTube) {
          parsedUrl.searchParams.set('autoplay', '1');
          parsedUrl.searchParams.set('mute', '1');
          parsedUrl.searchParams.set('loop', '1');
          parsedUrl.searchParams.set('controls', '0');
          src = parsedUrl.toString();
        } else if (isVimeo) {
          parsedUrl.searchParams.set('autoplay', '1');
          parsedUrl.searchParams.set('muted', '1');
          parsedUrl.searchParams.set('loop', '1');
          parsedUrl.searchParams.set('background', '1');
          src = parsedUrl.toString();
        }
      } catch (_e) {
        // If URL parsing fails, use the src as-is
      }
      iframe.src = src;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('frameborder', '0');

      wrap.appendChild(iframe);
      el.appendChild(wrap);
    }

    return el;
  }

  // ========================================
  // 10. RENDER GRID (dispatcher)
  // ========================================

  function renderGrid(container, items) {
    const containerWidth =
      container.offsetWidth || container.getBoundingClientRect().width || 800;
    dbg('Render grid — containerWidth:', containerWidth, 'items:', items.length, 'layout:', cfg.layout);

    if (cfg.layout === 'masonry' || cfg.uneven) {
      renderMasonryGrid(container, items, containerWidth);
    } else {
      renderJustifiedGrid(container, items, containerWidth);
    }
  }

  // ========================================
  // 11. EDIT MODE DETECTION & UI
  // ========================================

  function isEditMode() {
    try {
      return (
        document.body.classList.contains('sqs-edit-mode') ||
        document.body.classList.contains('sqs-editing') ||
        document.documentElement.classList.contains('sqs-edit-mode') ||
        window.location.href.indexOf('/config') !== -1 ||
        window.location.search.indexOf('editMode') !== -1 ||
        window.top !== window.self
      );
    } catch (_e) {
      // window.top access may throw in sandboxed iframes
      return false;
    }
  }

  function buildScriptUrl(premadegridNum, orderArr) {
    const base =
      'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/photo-grid/photogrid.min.js';
    const params = [];
    if (premadegridNum) params.push('premadegrid=' + premadegridNum);
    if (orderArr && orderArr.length) params.push('order=' + orderArr.join(','));
    if (cfg.targetTag && cfg.targetTag !== 'div') params.push('targetTag=' + encodeURIComponent(cfg.targetTag));
    if (cfg.targetIndex && cfg.targetIndex !== 1) params.push('targetIndex=' + encodeURIComponent(cfg.targetIndex));
    if (cfg.targetId && cfg.targetId !== 'photogrid') params.push('targetId=' + encodeURIComponent(cfg.targetId));
    if (!premadegridNum) {
      // Only include layout/sizing params when not using a premade preset
      if (cfg.layout && cfg.layout !== 'justified') params.push('layout=' + cfg.layout);
      if (cfg.rowHeight && cfg.rowHeight !== 300) params.push('rowHeight=' + cfg.rowHeight);
      if (cfg.gutter && cfg.gutter !== 4) params.push('gutter=' + cfg.gutter);
      if (cfg.columns && cfg.columns !== 3) params.push('columns=' + cfg.columns);
    }
    if (cfg.gridWidth && cfg.gridWidth !== '100%') params.push('gridWidth=' + encodeURIComponent(cfg.gridWidth));
    if (cfg.gridMaxWidth && cfg.gridMaxWidth !== 'none') params.push('gridMaxWidth=' + encodeURIComponent(cfg.gridMaxWidth));
    return base + (params.length ? '?' + params.join('&') : '');
  }

  function createEditPanel(container, originalItems) {
    if (!isEditMode()) return;
    if (document.querySelector('.anavo-pg-edit-panel')) return;

    let currentPreset = cfg.premadegrid || 1;
    let currentOrder = originalItems.map(function (_, i) {
      return i;
    });

    // Apply initial order from cfg if present
    if (cfg.order && cfg.order.length) {
      currentOrder = cfg.order.slice();
    }

    const panel = document.createElement('div');
    panel.className = 'anavo-pg-edit-panel';
    panel.setAttribute('role', 'toolbar');
    panel.setAttribute('aria-label', 'Photo Grid Editor');

    const title = document.createElement('h4');
    title.textContent = '\uD83D\uDDBC\uFE0F Photo Grid';
    panel.appendChild(title);

    // ---- Preset buttons ----
    const presetsRow = document.createElement('div');
    presetsRow.className = 'anavo-pg-panel-row';

    PREMADE_GRIDS.forEach(function (preset, i) {
      const btn = document.createElement('button');
      btn.className = 'anavo-pg-btn' + (currentPreset === i + 1 ? ' active' : '');
      btn.textContent = preset.name;
      btn.type = 'button';
      btn.addEventListener('click', function () {
        currentPreset = i + 1;
        // Update active config inline
        cfg.rowHeight = preset.rowHeight;
        cfg.gutter = preset.gutter;
        cfg.layout = preset.layout;
        cfg.uneven = preset.layout === 'masonry';
        cfg.columns = preset.columns || 3;

        presetsRow.querySelectorAll('.anavo-pg-btn').forEach(function (b, bi) {
          b.classList.toggle('active', bi === i);
        });
        rerender();
      });
      presetsRow.appendChild(btn);
    });

    panel.appendChild(presetsRow);

    // ---- Action buttons ----
    const actionsRow = document.createElement('div');
    actionsRow.className = 'anavo-pg-panel-row';

    const shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'anavo-pg-btn';
    shuffleBtn.type = 'button';
    shuffleBtn.textContent = '\uD83D\uDD00 Shuffle';
    shuffleBtn.addEventListener('click', function () {
      // Fisher-Yates shuffle
      const arr = currentOrder.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
      currentOrder = arr;
      rerender();
    });

    const resetBtn = document.createElement('button');
    resetBtn.className = 'anavo-pg-btn';
    resetBtn.type = 'button';
    resetBtn.textContent = '\u21BA Reset';
    resetBtn.addEventListener('click', function () {
      currentOrder = originalItems.map(function (_, i) {
        return i;
      });
      rerender();
    });

    actionsRow.appendChild(shuffleBtn);
    actionsRow.appendChild(resetBtn);
    panel.appendChild(actionsRow);

    // ---- Script URL ----
    const urlLabel = document.createElement('div');
    urlLabel.className = 'anavo-pg-url-label';
    urlLabel.textContent = 'Script URL to reproduce this layout:';
    panel.appendChild(urlLabel);

    const urlBox = document.createElement('div');
    urlBox.className = 'anavo-pg-url-box';
    urlBox.setAttribute('contenteditable', 'false');
    urlBox.setAttribute('tabindex', '0');
    panel.appendChild(urlBox);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'anavo-pg-copy-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = '\uD83D\uDCCB Copy Script URL';
    copyBtn.addEventListener('click', function () {
      const url = urlBox.textContent;
      function fallbackCopy() {
        const range = document.createRange();
        range.selectNode(urlBox);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        try {
          document.execCommand('copy');
        } catch (_e) {
          /* ignore */
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () {
            copyBtn.textContent = '\u2705 Copied!';
            setTimeout(function () {
              copyBtn.textContent = '\uD83D\uDCCB Copy Script URL';
            }, 2000);
          },
          fallbackCopy
        );
      } else {
        fallbackCopy();
        copyBtn.textContent = '\u2705 Copied!';
        setTimeout(function () {
          copyBtn.textContent = '\uD83D\uDCCB Copy Script URL';
        }, 2000);
      }
    });
    panel.appendChild(copyBtn);

    function updateUrlBox() {
      const isDefault = currentOrder.every(function (v, i) {
        return v === i;
      });
      urlBox.textContent = buildScriptUrl(currentPreset, isDefault ? null : currentOrder);
    }

    function rerender() {
      const ordered = applyOrder(originalItems, currentOrder);
      renderGrid(container, ordered);
      updateUrlBox();
    }

    updateUrlBox();
    document.body.appendChild(panel);
  }

  // ========================================
  // 12. INIT
  // ========================================

  // Module-level state accessible to public API and resize handler
  let _container = null;
  let _orderedItems = [];

  async function init() {
    try {
      dbg('Initializing...');
      console.log('\uD83D\uDDBC\uFE0F ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' - Active');

      injectStyles();

      const section = findTargetSection();
      if (!section) {
        console.warn(
          '[' +
            PLUGIN_NAME +
            '] No target section found. Add a section with a "Photo Album" heading or a <div id="photogrid"> to your page.'
        );
        return;
      }

      dbg('Target section:', section);

      // Collect media from supported block types, with polling for lazy-loaded images
      let rawItems = [];
      let attempts = 0;
      const maxAttempts = 50; // 50 × 100ms = 5 seconds

      while (rawItems.length === 0 && attempts < maxAttempts) {
        rawItems = collectMedia(section);
        if (rawItems.length > 0) break;
        if (attempts === 0) {
          dbg('No media found on first try, waiting for Squarespace to render images...');
        }
        attempts++;
        await new Promise(function (r) {
          setTimeout(r, 100);
        });
      }

      if (rawItems.length === 0) {
        console.warn(
          '[' +
            PLUGIN_NAME +
            '] No supported media blocks found after ' +
            maxAttempts +
            ' attempts. Add Image, Gallery, or Video blocks to the target section.'
        );
        return;
      }
      dbg('Found', rawItems.length, 'items after', attempts, 'attempts');

      // Apply custom order
      _orderedItems = applyOrder(rawItems, cfg.order);

      // Clear section and build fresh grid container
      section.innerHTML = '';

      _container = document.createElement('div');
      _container.className = 'anavo-pg-container';
      _container.style.width = cfg.gridWidth;
      if (cfg.gridMaxWidth && cfg.gridMaxWidth !== 'none') {
        _container.style.maxWidth = cfg.gridMaxWidth;
        _container.style.margin = '0 auto';
      }
      section.appendChild(_container);

      // Initial render
      renderGrid(_container, _orderedItems);

      // Responsive: re-render on resize
      let resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          renderGrid(_container, _orderedItems);
        }, 150);
      });

      // Edit mode UI (slight delay so the page layout is settled)
      setTimeout(function () {
        createEditPanel(_container, rawItems);
      }, 600);

      // Licensing — non-blocking, after user has seen the grid
      setTimeout(function () {
        loadLicensing(_container);
      }, 2500);

      console.log(
        '\u2705 ' +
          PLUGIN_NAME +
          ' v' +
          PLUGIN_VERSION +
          ' Active! ' +
          _orderedItems.length +
          ' items in grid.'
      );
    } catch (err) {
      console.error('[' + PLUGIN_NAME + '] Initialization error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ========================================
  // PUBLIC API
  // ========================================

  window.PhotoGrid = {
    refresh: function () {
      if (_container && _orderedItems.length) {
        renderGrid(_container, _orderedItems);
      }
    },
    getVersion: function () {
      return PLUGIN_VERSION;
    },
  };
})();
