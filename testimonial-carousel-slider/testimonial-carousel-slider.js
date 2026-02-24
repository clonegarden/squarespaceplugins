/**
 * =======================================
 * TESTIMONIAL CAROUSEL SLIDER - Squarespace
 * =======================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 *
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/testimonial-carousel-slider/testimonial-carousel-slider.min.js"></script>
 *
 * PARAMETERS:
 * ?testimonials=[...]         - URL-encoded JSON array of testimonial objects
 * ?autoplay=true              - Auto-advance slides (default: true)
 * ?interval=5000              - Autoplay interval in ms (default: 5000)
 * ?accentColor=0066cc         - Accent/star/button color hex (default: 0066cc)
 * ?bgColor=ffffff             - Card and section background hex (default: ffffff)
 * ?textColor=333333           - Quote and name text color hex (default: 333333)
 * ?cardRadius=12              - Card border-radius in px (default: 12)
 * ?maxWidth=800               - Max carousel width in px (default: 800)
 * ?showStars=true             - Show star ratings (default: true)
 * ?showAvatars=true           - Show avatar images/initials (default: true)
 * =======================================
 */

(function () {
  'use strict';

  const PLUGIN_VERSION = '1.0.0';
  console.log(`💬 Testimonial Carousel Slider v${PLUGIN_VERSION} - Loading...`);

  // ========================================
  // CONFIGURATION
  // ========================================

  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  function fixColor(color) {
    if (!color || color === 'transparent') return color;
    if (color.startsWith('#') || color.startsWith('rgb')) return color;
    return '#' + color;
  }

  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);

    let testimonials = null;
    const rawTestimonials = params.get('testimonials');
    if (rawTestimonials) {
      try {
        testimonials = JSON.parse(decodeURIComponent(rawTestimonials));
      } catch (_e) {
        console.warn('⚠️ Invalid testimonials JSON, using defaults');
      }
    }

    return {
      testimonials,
      autoplay: params.get('autoplay') !== 'false',
      interval: parseInt(params.get('interval') || '5000', 10),
      accentColor: fixColor(params.get('accentColor') || '0066cc'),
      bgColor: fixColor(params.get('bgColor') || 'ffffff'),
      textColor: fixColor(params.get('textColor') || '333333'),
      cardRadius: params.get('cardRadius') || '12',
      maxWidth: params.get('maxWidth') || '800',
      showStars: params.get('showStars') !== 'false',
      showAvatars: params.get('showAvatars') !== 'false',
    };
  }

  const config = getScriptParams();
  console.log('⚙️ Testimonial Carousel Config:', config);

  // ========================================
  // DEFAULT TESTIMONIALS
  // ========================================

  const DEFAULT_TESTIMONIALS = [
    {
      quote:
        'This plugin transformed our website. The smooth animations and clean design immediately impressed our visitors.',
      name: 'Sarah Johnson',
      title: 'Marketing Director',
      company: 'Acme Corp',
      rating: 5,
    },
    {
      quote:
        'Easy to install and completely customizable. The support team was incredibly responsive and helpful.',
      name: 'Michael Chen',
      title: 'Founder',
      company: 'TechStartup',
      rating: 5,
    },
    {
      quote:
        'Our conversion rate increased noticeably after adding testimonials. Highly recommend this plugin.',
      name: 'Emma Williams',
      title: 'E-commerce Manager',
      company: 'ShopBrands',
      rating: 5,
    },
  ];

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function createStars(rating) {
    const count = Math.min(Math.max(Math.round(rating), 0), 5);
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  function createInitial(name) {
    return (name || '?').charAt(0).toUpperCase();
  }

  // ========================================
  // STYLES INJECTION
  // ========================================

  function injectStyles() {
    if (document.getElementById('anavo-testimonial-carousel-styles')) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const transitionDuration = prefersReducedMotion ? '0ms' : '500ms';

    const styles = document.createElement('style');
    styles.id = 'anavo-testimonial-carousel-styles';
    styles.textContent = `
      /* ANAVO TESTIMONIAL CAROUSEL SLIDER v${PLUGIN_VERSION} */

      #anavo-testimonial-carousel-section {
        width: 100%;
        padding: 60px 20px;
        background: ${config.bgColor};
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      #anavo-testimonial-carousel-section .anavo-tc-inner {
        max-width: ${config.maxWidth}px;
        margin: 0 auto;
        position: relative;
      }

      #anavo-testimonial-carousel-section .anavo-tc-track-wrap {
        overflow: hidden;
        border-radius: ${config.cardRadius}px;
      }

      #anavo-testimonial-carousel-section .anavo-tc-track {
        display: flex;
        transition: transform ${transitionDuration} cubic-bezier(0.25, 0.46, 0.45, 0.94);
        will-change: transform;
      }

      #anavo-testimonial-carousel-section .anavo-tc-slide {
        min-width: 100%;
        background: ${config.bgColor};
        border-radius: ${config.cardRadius}px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        padding: 40px 48px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border: 1px solid rgba(0, 0, 0, 0.06);
      }

      #anavo-testimonial-carousel-section .anavo-tc-stars {
        color: ${config.accentColor};
        font-size: 22px;
        letter-spacing: 2px;
        margin-bottom: 20px;
        line-height: 1;
      }

      #anavo-testimonial-carousel-section .anavo-tc-quote {
        font-size: 18px;
        line-height: 1.7;
        color: ${config.textColor};
        margin: 0 0 28px;
        font-style: italic;
        position: relative;
      }

      #anavo-testimonial-carousel-section .anavo-tc-quote::before {
        content: '\\201C';
        font-size: 60px;
        color: ${config.accentColor};
        opacity: 0.2;
        position: absolute;
        top: -24px;
        left: -10px;
        font-style: normal;
        line-height: 1;
        pointer-events: none;
      }

      #anavo-testimonial-carousel-section .anavo-tc-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 3px solid ${config.accentColor};
        margin-bottom: 14px;
        background: ${config.accentColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        font-weight: 700;
        color: #fff;
        overflow: hidden;
        flex-shrink: 0;
      }

      #anavo-testimonial-carousel-section .anavo-tc-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        display: block;
      }

      #anavo-testimonial-carousel-section .anavo-tc-name {
        font-size: 17px;
        font-weight: 700;
        color: ${config.textColor};
        margin: 0 0 4px;
      }

      #anavo-testimonial-carousel-section .anavo-tc-meta {
        font-size: 14px;
        color: ${config.accentColor};
        margin: 0;
        font-weight: 500;
      }

      /* Navigation buttons */
      #anavo-testimonial-carousel-section .anavo-tc-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid ${config.accentColor};
        background: ${config.bgColor};
        color: ${config.accentColor};
        font-size: 22px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: background ${transitionDuration} ease, color ${transitionDuration} ease;
        line-height: 1;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }

      #anavo-testimonial-carousel-section .anavo-tc-btn:hover,
      #anavo-testimonial-carousel-section .anavo-tc-btn:focus {
        background: ${config.accentColor};
        color: ${config.bgColor};
        outline: none;
      }

      #anavo-testimonial-carousel-section .anavo-tc-btn:focus-visible {
        outline: 3px solid ${config.accentColor};
        outline-offset: 2px;
      }

      #anavo-testimonial-carousel-section .anavo-tc-btn-prev {
        left: -60px;
      }

      #anavo-testimonial-carousel-section .anavo-tc-btn-next {
        right: -60px;
      }

      /* Dot indicators */
      #anavo-testimonial-carousel-section .anavo-tc-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
      }

      #anavo-testimonial-carousel-section .anavo-tc-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
        border: none;
        cursor: pointer;
        padding: 0;
        transition: background ${transitionDuration} ease, transform ${transitionDuration} ease;
      }

      #anavo-testimonial-carousel-section .anavo-tc-dot.is-active {
        background: ${config.accentColor};
        transform: scale(1.4);
      }

      #anavo-testimonial-carousel-section .anavo-tc-dot:focus-visible {
        outline: 3px solid ${config.accentColor};
        outline-offset: 3px;
      }

      /* Responsive */
      @media (max-width: 900px) {
        #anavo-testimonial-carousel-section .anavo-tc-btn-prev {
          left: -22px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-btn-next {
          right: -22px;
        }
      }

      @media (max-width: 768px) {
        #anavo-testimonial-carousel-section .anavo-tc-slide {
          padding: 32px 56px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-quote {
          font-size: 16px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-btn-prev {
          left: 6px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-btn-next {
          right: 6px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-btn {
          width: 38px;
          height: 38px;
          font-size: 18px;
        }
      }

      @media (max-width: 480px) {
        #anavo-testimonial-carousel-section {
          padding: 40px 12px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-slide {
          padding: 28px 48px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-quote {
          font-size: 15px;
        }
        #anavo-testimonial-carousel-section .anavo-tc-btn {
          width: 34px;
          height: 34px;
          font-size: 16px;
        }
      }
    `;

    document.head.appendChild(styles);
    console.log('✅ Testimonial Carousel styles injected');
  }

  // ========================================
  // HTML STRUCTURE CREATION
  // ========================================

  function createCarousel(testimonials) {
    const section = document.createElement('div');
    section.id = 'anavo-testimonial-carousel-section';
    section.setAttribute('data-anavo-plugin', 'testimonial-carousel-slider');
    section.setAttribute('data-version', PLUGIN_VERSION);

    const inner = document.createElement('div');
    inner.className = 'anavo-tc-inner';

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'anavo-tc-btn anavo-tc-btn-prev';
    prevBtn.setAttribute('aria-label', 'Previous testimonial');
    prevBtn.type = 'button';
    prevBtn.innerHTML = '&#8249;';

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'anavo-tc-btn anavo-tc-btn-next';
    nextBtn.setAttribute('aria-label', 'Next testimonial');
    nextBtn.type = 'button';
    nextBtn.innerHTML = '&#8250;';

    // Track wrapper (clipping container)
    const trackWrap = document.createElement('div');
    trackWrap.className = 'anavo-tc-track-wrap';
    trackWrap.setAttribute('role', 'region');
    trackWrap.setAttribute('aria-label', 'Testimonials');

    const track = document.createElement('div');
    track.className = 'anavo-tc-track';

    testimonials.forEach((t, i) => {
      const slide = document.createElement('div');
      slide.className = 'anavo-tc-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-label', 'Testimonial ' + (i + 1) + ' of ' + testimonials.length);

      let html = '';

      if (config.showStars && t.rating) {
        const starLabel = escapeAttr(String(Math.round(t.rating))) + ' out of 5 stars';
        html +=
          '<div class="anavo-tc-stars" aria-label="' +
          starLabel +
          '">' +
          createStars(t.rating) +
          '</div>';
      }

      html += '<p class="anavo-tc-quote">' + escapeHtml(t.quote || '') + '</p>';

      if (config.showAvatars) {
        html += '<div class="anavo-tc-avatar" aria-hidden="true">';
        if (t.image) {
          html +=
            '<img src="' +
            escapeAttr(t.image) +
            '" alt="' +
            escapeAttr(t.name || '') +
            '" loading="lazy">';
        } else {
          html += escapeHtml(createInitial(t.name));
        }
        html += '</div>';
      }

      html += '<p class="anavo-tc-name">' + escapeHtml(t.name || '') + '</p>';

      const meta = [t.title, t.company].filter(Boolean).join(' · ');
      if (meta) {
        html += '<p class="anavo-tc-meta">' + escapeHtml(meta) + '</p>';
      }

      slide.innerHTML = html;
      track.appendChild(slide);
    });

    // Dot indicators
    const dots = document.createElement('div');
    dots.className = 'anavo-tc-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Testimonial navigation');

    testimonials.forEach(function (_t, i) {
      const dot = document.createElement('button');
      dot.className = 'anavo-tc-dot' + (i === 0 ? ' is-active' : '');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dots.appendChild(dot);
    });

    trackWrap.appendChild(track);
    inner.appendChild(prevBtn);
    inner.appendChild(trackWrap);
    inner.appendChild(nextBtn);
    inner.appendChild(dots);
    section.appendChild(inner);

    console.log('✅ Testimonial Carousel container created');
    return section;
  }

  // ========================================
  // INSERTION POINT FINDER
  // ========================================

  function findInsertionPoint() {
    // Priority 1: Element with id="testimonials"
    const byId = document.getElementById('testimonials');
    if (byId) {
      console.log('📍 Inserting into #testimonials element');
      return { element: byId, position: 'prepend' };
    }

    // Priority 2: Section/div containing H1 or H2 with "testimonials" text
    const headings = document.querySelectorAll('h1, h2');
    for (let i = 0; i < headings.length; i++) {
      if (headings[i].textContent.trim().toLowerCase() === 'testimonials') {
        const section =
          headings[i].closest('[data-section-id], .page-section, section') ||
          headings[i].parentElement;
        if (section) {
          console.log('📍 Inserting into section with testimonials heading');
          return { element: section, position: 'append' };
        }
      }
    }

    // Fallback: before footer
    const footer = document.querySelector('footer, .footer, [data-nc-group="footer"]');
    if (footer) {
      console.log('📍 Inserting before footer (fallback)');
      return { element: footer, position: 'before' };
    }

    // Last fallback: append to body
    console.log('📍 Inserting at end of body (fallback)');
    return { element: document.body, position: 'append' };
  }

  function insertCarousel(container) {
    const { element, position } = findInsertionPoint();

    switch (position) {
      case 'prepend':
        element.insertBefore(container, element.firstChild);
        break;
      case 'append':
        element.appendChild(container);
        break;
      case 'before':
        element.parentNode.insertBefore(container, element);
        break;
      default:
        document.body.appendChild(container);
    }

    console.log('✅ Testimonial Carousel inserted');
  }

  // ========================================
  // CAROUSEL LOGIC
  // ========================================

  function initCarousel(section, testimonials) {
    const track = section.querySelector('.anavo-tc-track');
    const prevBtn = section.querySelector('.anavo-tc-btn-prev');
    const nextBtn = section.querySelector('.anavo-tc-btn-next');
    const dotButtons = section.querySelectorAll('.anavo-tc-dot');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const total = testimonials.length;
    let current = 0;
    let autoplayTimer = null;

    function goTo(index) {
      current = (index + total) % total;

      if (prefersReducedMotion) {
        track.style.transition = 'none';
      }

      track.style.transform = 'translateX(-' + current * 100 + '%)';

      dotButtons.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function startAutoplay() {
      if (!config.autoplay || prefersReducedMotion || total <= 1) return;
      autoplayTimer = setInterval(next, config.interval);
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    nextBtn.addEventListener('click', function () {
      next();
      resetAutoplay();
    });

    prevBtn.addEventListener('click', function () {
      prev();
      resetAutoplay();
    });

    dotButtons.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
        resetAutoplay();
      });
    });

    // Keyboard navigation (arrow keys when focus is within the carousel)
    section.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        prev();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        next();
        resetAutoplay();
      }
    });

    // Touch/swipe support
    var touchStartX = 0;
    track.addEventListener(
      'touchstart',
      function (e) {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener(
      'touchend',
      function (e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? next() : prev();
          resetAutoplay();
        }
      },
      { passive: true }
    );

    // Pause autoplay on hover or focus-within, resume on leave
    section.addEventListener('mouseenter', function () {
      clearInterval(autoplayTimer);
    });
    section.addEventListener('mouseleave', startAutoplay);
    section.addEventListener('focusin', function () {
      clearInterval(autoplayTimer);
    });
    section.addEventListener('focusout', function (e) {
      if (!section.contains(e.relatedTarget)) {
        startAutoplay();
      }
    });

    startAutoplay();
    console.log('✅ Testimonial Carousel initialized with', total, 'slides');
  }

  // ========================================
  // LICENSING
  // ========================================

  async function loadLicensing() {
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

      const licenseManager = new window.AnavoLicenseManager(
        'TestimonialCarouselSlider',
        PLUGIN_VERSION,
        {
          licenseServer:
            'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: true,
        }
      );

      await licenseManager.init();

      if (!licenseManager.isLicensed) {
        const section = document.getElementById('anavo-testimonial-carousel-section');
        if (section) licenseManager.insertWatermark(section);
      }

      return licenseManager;
    } catch (error) {
      console.warn('⚠️ License check failed:', error.message);
      return null;
    }
  }

  // ========================================
  // MAIN INITIALIZATION
  // ========================================

  async function init() {
    try {
      console.log('🔧 Starting Testimonial Carousel initialization...');

      const testimonials =
        config.testimonials && config.testimonials.length
          ? config.testimonials
          : DEFAULT_TESTIMONIALS;

      // Inject styles
      injectStyles();

      // Create and insert carousel
      const section = createCarousel(testimonials);
      insertCarousel(section);

      // Initialize interactive behaviour
      initCarousel(section, testimonials);

      console.log(`✅ Testimonial Carousel Slider v${PLUGIN_VERSION} Active!`);
      console.log(`   Testimonials: ${testimonials.length}`);
      console.log(`   Autoplay: ${config.autoplay}`);
      console.log(`   Interval: ${config.interval}ms`);

      // Load licensing in background (non-blocking)
      loadLicensing();
    } catch (error) {
      console.error('❌ Testimonial Carousel initialization failed:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  // Auto-start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
