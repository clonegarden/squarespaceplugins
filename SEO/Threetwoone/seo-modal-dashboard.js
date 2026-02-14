/**
 * ========================================
 * SEO MODAL DASHBOARD - Onassis Web Media
 * ========================================
 * @version 1.0.0
 * @author Anavo Tech
 * @license Commercial
 * 
 * USAGE:
 * <script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/SEO/Threetwoone/seo-modal-dashboard.min.js"></script>
 * 
 * This plugin injects SEO-optimized structured data, noscript fallbacks, 
 * and interactive modal system for Squarespace sites.
 * ========================================
 */

(function() {
  'use strict';

  console.log('🎨 SEO Modal Dashboard v1.0.0 - Loading...');

  /**
   * Inject JSON-LD Structured Data
   */
  function injectStructuredData() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = `
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.threeonetwobridal.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://www.threeonetwobridal.com/the-experience"
    }
  ]
}`;
    document.head.appendChild(script);
  }

  /**
   * Inject Noscript Fallback
   */
  function injectNoscriptFallback() {
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
  <div class="noscript-fallback">
    <article itemscope itemtype="https://schema.org/BeautySalon">
      <header class="noscript-header">
        <h1 itemprop="name">Three One Two Bridal - Luxury Bridal Hair & Makeup in Chicago</h1>
        <p itemprop="description">Award-winning bridal beauty services by Leila and Karina. Over 10 years creating stunning looks for Chicago weddings, rehearsal dinners, and destination events.</p>
      </header>

      <section class="noscript-section">
        <h2>Our Bridal Beauty Services</h2>

        <div class="service-item">
          <h3>Onsite Bridal Hair & Makeup</h3>
          <p>Personalized bridal hair and makeup services delivered directly to your venue. We create custom timelines, provide pre-wedding consultations, and ensure you feel confident and beautiful on your special day.</p>
          <ul>
            <li>Elegant updos and romantic hairstyles</li>
            <li>Natural glam and luxury makeup application</li>
            <li>High-end products for long-lasting results</li>
            <li>Photo-ready beauty that lasts all day</li>
          </ul>
        </div>

        <div class="service-item">
          <h3>Rehearsal Dinners & Look Changes</h3>
          <p>Look stunning for every wedding event. Our long-lasting formulations ensure you transition seamlessly from rehearsal dinner to ceremony to reception.</p>
        </div>

        <div class="service-item">
          <h3>Destination & Multi-Day Wedding Services</h3>
          <p>We travel nationwide and internationally for destination weddings. Multi-day availability ensures you have professional beauty services for every celebration.</p>
        </div>

        <div class="service-item">
          <h3>Touchups & Adjustments</h3>
          <p>Stay flawless from ceremony to last dance. Our touchup services keep your hair and makeup perfect throughout your wedding day.</p>
        </div>
      </section>

      <section class="noscript-section">
        <h2>Why Choose Three One Two Bridal</h2>
        <ul>
          <li><strong>10 Years of Excellence</strong> - Over a decade creating beautiful bridal looks in Chicago</li>
          <li><strong>Award-Winning Artists</strong> - Featured in publications and loved by cool-girl brides</li>
          <li><strong>Personalized Service</strong> - Agency-level attention for every bride</li>
          <li><strong>On-Site Convenience</strong> - We come to you on your wedding day</li>
          <li><strong>Destination Capability</strong> - Travel services for weddings anywhere</li>
          <li><strong>Founded by Best Friends</strong> - Leila and Karina built Three One Two together</li>
        </ul>
      </section>

      <section class="noscript-section" itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
        <h2>Contact Three One Two Bridal</h2>
        <address>
          <p><strong itemprop="name">Three One Two Bridal</strong></p>
          <p>Serving <span itemprop="addressLocality">Chicago</span>, <span itemprop="addressRegion">Illinois</span> and Destination Weddings Nationwide</p>
          <p>Phone: <a href="tel:+1-XXX-XXX-XXXX" itemprop="telephone">(XXX) XXX-XXXX</a></p>
          <p>Email: <a href="mailto:info@threeonetwobridal.com" itemprop="email">info@threeonetwobridal.com</a></p>
          <p>Instagram: <a href="https://www.instagram.com/threeonetwobridal" target="_blank">@threeonetwobridal</a></p>
        </address>
      </section>

      <section class="noscript-section">
        <h2>Service Areas</h2>
        <p>We proudly serve brides throughout Chicago and the surrounding areas including:</p>
        <ul>
          <li>Downtown Chicago</li>
          <li>River North</li>
          <li>Gold Coast</li>
          <li>Lincoln Park</li>
          <li>Lakeview</li>
          <li>West Loop</li>
          <li>Wicker Park</li>
          <li>North Shore Suburbs</li>
          <li>Western Suburbs</li>
          <li>Oak Park</li>
        </ul>
        <p><strong>Plus destination wedding services nationwide and internationally.</strong></p>
      </section>

      <section class="noscript-section">
        <h2>Book Your Bridal Beauty Consultation</h2>
        <p>Ready to create your perfect wedding day look? Schedule your consultation and trial with Three One Two Bridal today.</p>
        <p><a href="/book-us" class="noscript-cta">Book Your Consultation</a></p>
      </section>

      <nav class="noscript-nav">
        <h2>Quick Navigation</h2>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/the-experience">Services</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/portfolio">Portfolio</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/join-the-team">Join Our Team</a></li>
          <li><a href="/book-us">Book Now</a></li>
        </ul>
      </nav>
    </article>
  </div>

  <style>
    /* Noscript Fallback Styles */
    .noscript-fallback {
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    .noscript-header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #000;
    }

    .noscript-header h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #000;
      line-height: 1.2;
    }

    .noscript-header p {
      font-size: 1.1rem;
      color: #666;
    }

    .noscript-section {
      margin-bottom: 40px;
    }

    .noscript-section h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #000;
    }

    .noscript-section h3 {
      font-size: 1.3rem;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: #000;
    }

    .service-item {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .service-item ul {
      margin-top: 10px;
      padding-left: 20px;
    }

    .service-item li {
      margin: 8px 0;
    }

    .noscript-section ul {
      padding-left: 20px;
    }

    .noscript-section li {
      margin: 10px 0;
    }

    .noscript-section address {
      font-style: normal;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .noscript-section address p {
      margin: 10px 0;
    }

    .noscript-cta {
      display: inline-block;
      margin-top: 15px;
      padding: 15px 35px;
      background: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .noscript-cta:hover {
      background: #333;
    }

    .noscript-nav {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #ddd;
    }

    .noscript-nav ul {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .noscript-nav li {
      margin: 0;
    }

    .noscript-nav a {
      display: block;
      padding: 12px 20px;
      background: #f0f0f0;
      color: #000;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.2s ease;
    }

    .noscript-nav a:hover {
      background: #e0e0e0;
    }

    @media (max-width: 768px) {
      .noscript-fallback {
        padding: 15px;
      }

      .noscript-header h1 {
        font-size: 2rem;
      }

      .noscript-section h2 {
        font-size: 1.5rem;
      }

      .noscript-nav ul {
        grid-template-columns: 1fr;
      }
    }
  </style>
`;
    document.body.insertBefore(noscript, document.body.firstChild);
  }

  /**
   * Inject Modal Styles
   */
  function injectModalStyles() {
    if (document.getElementById('onassis-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'onassis-modal-styles';
    style.textContent = `
/* ============================================
   ONASSIS WEB MEDIA MODAL SYSTEM - GLOBAL STYLE
   ============================================ */

:root {
  /* Extract and match site colors */
  --site-font: 'creato-display-2ezfrg', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --site-text-color: #000;
  --site-bg-color: #fff;
  --site-accent-color: rgba(0, 0, 0, 0.8);

  /* Accessibility variables */
  --modal-font-size: 16px;
  --modal-contrast: normal;
}

/* Font size variations */
body.modal-font-large {
  --modal-font-size: 20px;
}

body.modal-font-xlarge {
  --modal-font-size: 24px;
}

/* High contrast mode */
body.modal-high-contrast .faq-modal .modal-content,
body.modal-high-contrast .quick-info-modal .modal-content {
  background: #000 !important;
  color: #fff !important;
}

body.modal-high-contrast .faq-modal a,
body.modal-high-contrast .quick-info-modal a {
  color: #FFD700 !important;
  text-decoration: underline !important;
}

/* ============================================
   FAQ MODAL STYLES
   ============================================ */

.faq-modal {
  display: none;
  position: fixed;
  z-index: 10000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-family: var(--site-font);
}

.faq-modal.active {
  display: flex;
}

.faq-modal .modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.faq-modal .modal-content {
  position: relative;
  background: var(--site-bg-color);
  color: var(--site-text-color);
  padding: 40px;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  z-index: 10001;
  animation: slideIn 0.3s ease;
  font-size: var(--modal-font-size);
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .faq-modal .modal-content {
    animation: none;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.faq-modal .close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 32px;
  font-weight: 300;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--site-text-color);
  opacity: 0.6;
  transition: opacity 0.2s;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.faq-modal .close-btn:hover,
.faq-modal .close-btn:focus {
  opacity: 1;
  outline: 2px solid var(--site-accent-color);
}

.faq-modal h2 {
  margin-top: 0;
  margin-bottom: 30px;
  font-size: calc(var(--modal-font-size) * 1.6);
  color: var(--site-text-color);
  padding-bottom: 15px;
  border-bottom: 2px solid var(--site-text-color);
}

.faq-modal h3 {
  font-size: calc(var(--modal-font-size) * 1.125);
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--site-text-color);
  font-weight: 600;
}

.faq-item {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.faq-item:last-of-type {
  border-bottom: none;
}

.faq-item p {
  line-height: 1.7;
  margin: 8px 0 0 0;
}

/* ============================================
   QUICK INFO MODAL STYLES
   ============================================ */

.quick-info-modal {
  display: none;
  position: fixed;
  z-index: 10000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-family: var(--site-font);
}

.quick-info-modal.active {
  display: flex;
}

.quick-info-modal .modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.quick-info-modal .modal-content {
  position: relative;
  background: var(--site-bg-color);
  color: var(--site-text-color);
  padding: 40px;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  z-index: 10001;
  animation: slideIn 0.3s ease;
  font-size: var(--modal-font-size);
}

@media (prefers-reduced-motion: reduce) {
  .quick-info-modal .modal-content {
    animation: none;
  }
}

.quick-info-modal .close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 32px;
  font-weight: 300;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--site-text-color);
  opacity: 0.6;
  transition: opacity 0.2s;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.quick-info-modal .close-btn:hover,
.quick-info-modal .close-btn:focus {
  opacity: 1;
  outline: 2px solid var(--site-accent-color);
}

/* Accessibility Controls */
.accessibility-controls {
  position: absolute;
  top: 15px;
  left: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.font-size-btn,
.contrast-btn {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.font-size-btn:hover,
.font-size-btn:focus,
.contrast-btn:hover,
.contrast-btn:focus {
  background: rgba(0, 0, 0, 0.2);
  outline: 2px solid var(--site-accent-color);
}

.font-size-btn.active {
  background: var(--site-text-color);
  color: var(--site-bg-color);
}

/* Modal Sections */
.modal-section {
  margin-bottom: 28px;
}

.modal-section:last-of-type {
  margin-bottom: 0;
}

.modal-section h2 {
  margin-top: 0;
  margin-bottom: 30px;
  font-size: calc(var(--modal-font-size) * 1.6);
  padding-bottom: 15px;
  border-bottom: 2px solid var(--site-text-color);
}

.modal-section h3 {
  font-size: calc(var(--modal-font-size) * 1.125);
  margin-top: 0;
  margin-bottom: 12px;
  font-weight: 600;
}

.modal-section address {
  font-style: normal;
  line-height: 1.7;
}

.modal-section address p,
.modal-section address ul {
  margin: 8px 0;
}

/* Lists */
.services-list,
.features-list,
.quick-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.services-list li,
.features-list li {
  margin: 10px 0;
  padding-left: 24px;
  position: relative;
  line-height: 1.6;
}

.services-list li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--site-text-color);
  font-weight: bold;
}

.features-list li:before {
  content: "•";
  position: absolute;
  left: 8px;
  color: var(--site-text-color);
}

/* Page Sections Navigation */
.page-sections ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.page-sections li {
  margin: 0;
}

/* Quick Nav */
.quick-nav {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-nav li {
  margin: 0;
}

/* Links */
.modal-content a {
  color: var(--site-text-color);
  text-decoration: none;
  transition: opacity 0.2s;
  border-bottom: 1px solid currentColor;
}

.modal-content a:hover,
.modal-content a:focus {
  opacity: 0.7;
  outline: 2px solid var(--site-accent-color);
}

/* Visual Guide / Image Grid */
.visual-guide {
  margin: 20px 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.image-grid figure {
  margin: 0;
}

.image-grid img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

.image-grid figcaption {
  font-size: calc(var(--modal-font-size) * 0.875);
  margin-top: 8px;
  text-align: center;
  font-style: italic;
  opacity: 0.8;
}

/* CTA Section */
.cta-section {
  background: rgba(0, 0, 0, 0.05);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 20px;
}

.cta-button {
  display: inline-block;
  margin-top: 12px;
  padding: 12px 30px;
  background: var(--site-text-color);
  color: var(--site-bg-color) !important;
  text-decoration: none !important;
  border: none !important;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.cta-button:hover,
.cta-button:focus {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  outline: 2px solid var(--site-accent-color);
}

/* Modal Footer */
.modal-footer {
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: calc(var(--modal-font-size) * 0.875);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyboard-hint {
  opacity: 0.7;
}

.keyboard-hint kbd {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  margin: 0 2px;
}

.powered-by {
  opacity: 0.6;
  font-size: 0.9em;
}

.powered-by a {
  border: none;
  opacity: 0.8;
}

.powered-by a:hover {
  opacity: 1;
}

/* Scrollbar Styling */
.modal-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.3) transparent;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.5);
}

/* ============================================
   SHORTCUT BUTTONS (FIXED POSITION)
   ============================================ */

.onassis-shortcuts {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut-btn {
  padding: 14px 20px;
  background: var(--site-text-color);
  color: var(--site-bg-color);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-family: var(--site-font);
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.shortcut-btn:hover,
.shortcut-btn:focus {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  opacity: 0.9;
  outline: 2px solid var(--site-accent-color);
}

.shortcut-btn .icon {
  font-size: 18px;
  font-weight: bold;
}

.shortcut-btn .label {
  font-size: 13px;
}

/* ============================================
   MOBILE RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .faq-modal .modal-content,
  .quick-info-modal .modal-content {
    padding: 30px 20px;
    max-width: 95%;
    max-height: 90vh;
  }

  .faq-modal h2,
  .quick-info-modal .modal-section h2 {
    font-size: calc(var(--modal-font-size) * 1.375);
    margin-bottom: 20px;
  }

  .faq-modal h3,
  .quick-info-modal .modal-section h3 {
    font-size: calc(var(--modal-font-size) * 1.0625);
  }

  .quick-nav,
  .page-sections ul {
    grid-template-columns: 1fr;
  }

  .close-btn {
    font-size: 28px !important;
  }

  .onassis-shortcuts {
    bottom: 15px;
    right: 15px;
  }

  .shortcut-btn {
    padding: 12px 16px;
    font-size: 13px;
    min-width: 100px;
  }

  .shortcut-btn .icon {
    font-size: 16px;
  }

  .shortcut-btn .label {
    font-size: 12px;
  }

  .accessibility-controls {
    top: 10px;
    left: 10px;
  }

  .font-size-btn,
  .contrast-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
}

/* ============================================
   DARK MODE SUPPORT (if site has dark mode)
   ============================================ */

@media (prefers-color-scheme: dark) {
  :root {
    --site-bg-color: #1a1a1a;
    --site-text-color: #fff;
  }
}
`;
    document.head.appendChild(style);
  }

  /**
   * Initialize Modal JavaScript
   */
  function initModalSystem() {
    /**
     * ONASSIS WEB MEDIA MODAL SYSTEM
     * "+" Quick Info Modal + "?" FAQ Modal
     * With Accessibility Features
     */

    // Detect current page
    function detectCurrentPage() {
      const path = window.location.pathname;

      if (path === '/' || path === '/home') return 'home';
      if (path.includes('/services')) return 'services';
      if (path.includes('/pricing')) return 'pricing';
      if (path.includes('/inquire')) return 'inquire';

      return 'home'; // default
    }

    // Initialize shortcut buttons
    function initShortcutButtons() {
      // Buttons are commented out in original code
      // Uncomment below if needed
      /*
      if (document.querySelector('.onassis-shortcuts')) return;

      const shortcuts = document.createElement('div');
      shortcuts.className = 'onassis-shortcuts';
      shortcuts.innerHTML = `
        <button id="quick-info-trigger" class="shortcut-btn" aria-label="Quick Info - Press +">
          <span class="icon">+</span>
          <span class="label">Quick Info</span>
        </button>
        <button id="faq-trigger" class="shortcut-btn" aria-label="FAQ - Press ?">
          <span class="icon">?</span>
          <span class="label">FAQ</span>
        </button>
      `;

      document.body.appendChild(shortcuts);

      const currentPage = detectCurrentPage();

      document.getElementById('quick-info-trigger').addEventListener('click', function() {
        const modal = document.getElementById(`quick-info-modal-${currentPage}`);
        if (modal) openModal(modal);
      });

      document.getElementById('faq-trigger').addEventListener('click', function() {
        const modal = document.getElementById(`faq-modal-${currentPage}`);
        if (modal) openModal(modal);
      });
      */
    }

    // Initialize a modal
    function initModal(modal, type) {
      const closeBtn = modal.querySelector('.close-btn');
      const overlay = modal.querySelector('.modal-overlay');

      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          closeModal(modal);
        });
      }

      if (overlay) {
        overlay.addEventListener('click', function() {
          closeModal(modal);
        });
      }

      modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal(modal);
        }
      });

      trapFocus(modal);
    }

    // Open modal
    function openModal(modal) {
      if (!modal) return;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const focusable = modal.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    // Close modal
    function closeModal(modal) {
      if (!modal) return;

      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      const currentPage = detectCurrentPage();
      if (modal.id.includes('quick-info')) {
        document.getElementById('quick-info-trigger')?.focus();
      } else if (modal.id.includes('faq')) {
        document.getElementById('faq-trigger')?.focus();
      }
    }

    // Keyboard shortcuts
    function initKeyboardShortcuts(quickInfoModal, faqModal) {
      document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }

        if ((e.key === '+' || e.key === '=') && quickInfoModal && !quickInfoModal.classList.contains('active')) {
          e.preventDefault();
          openModal(quickInfoModal);
        }

        if ((e.key === '?' || (e.shiftKey && e.key === '/')) && faqModal && !faqModal.classList.contains('active')) {
          e.preventDefault();
          openModal(faqModal);
        }

        if (e.key === 'Escape') {
          if (quickInfoModal && quickInfoModal.classList.contains('active')) {
            closeModal(quickInfoModal);
          }
          if (faqModal && faqModal.classList.contains('active')) {
            closeModal(faqModal);
          }
        }
      });
    }

    // Trap focus inside modal
    function trapFocus(modal) {
      modal.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab' || !modal.classList.contains('active')) return;

        const focusableElements = modal.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    }

    // Accessibility features
    function initAccessibility() {
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('font-size-btn')) {
          const size = e.target.getAttribute('data-size');

          document.body.classList.remove('modal-font-normal', 'modal-font-large', 'modal-font-xlarge');

          if (size !== 'normal') {
            document.body.classList.add(`modal-font-${size}`);
          }

          document.querySelectorAll('.font-size-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
        }
      });

      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('contrast-btn')) {
          document.body.classList.toggle('modal-high-contrast');
          e.target.classList.toggle('active');
        }
      });

      setTimeout(() => {
        const defaultBtn = document.querySelector('.font-size-btn[data-size="normal"]');
        if (defaultBtn) defaultBtn.classList.add('active');
      }, 100);
    }

    // Initialize everything
    const currentPage = detectCurrentPage();
    initShortcutButtons();

    const quickInfoModal = document.getElementById(`quick-info-modal-${currentPage}`);
    const faqModal = document.getElementById(`faq-modal-${currentPage}`);

    if (quickInfoModal) {
      initModal(quickInfoModal, 'quick-info');
    }

    if (faqModal) {
      initModal(faqModal, 'faq');
    }

    initKeyboardShortcuts(quickInfoModal, faqModal);
    initAccessibility();

    console.log('✅ Onassis Web Media Modal System initialized');
  }

  /**
   * Main initialization
   */
  function init() {
    // Inject structured data
    injectStructuredData();

    // Inject noscript fallback
    injectNoscriptFallback();

    // Inject modal styles
    injectModalStyles();

    // Initialize modal system
    initModalSystem();

    console.log('✅ SEO Modal Dashboard loaded successfully');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
