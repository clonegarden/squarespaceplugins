

(function() {
  'use strict';

  // Parse URL parameters from the script tag
  function getScriptParams() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);
    
    return {
      license: params.get('license') || '',
      accentColor: decodeURIComponent(params.get('accentColor') || '#2a284d'),
      textColor: decodeURIComponent(params.get('textColor') || '#762323'),
      fontSize: parseInt(params.get('fontSize') || '60'),
      showLabels: params.get('showLabels') !== 'false',
      targetDate: params.get('targetDate') || '', // Format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
      containerId: params.get('containerId') || 'anavo-countdown-timer'
    };
  }

  const config = getScriptParams();

  // Load the licensing system
  function loadLicensingScript() {
    return new Promise((resolve, reject) => {
      // Check if licensing is already loaded
      if (window.AnavoLicenseManager) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licensing.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Initialize the countdown timer
  async function init() {
    try {
      // Load licensing
      await loadLicensingScript();
      
   // Initialize license manager
const licenseManager = new window.AnavoLicenseManager(
  'SimpleCountdownTimer',
  '1.0.0',
  {
    // For testing: Use GitHub CDN
    licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
    // For production: Use your actual server
    // licenseServer: 'https://anavotech.com/api/licenses.json',
    showUI: true
  }
);

      const licenseStatus = await licenseManager.init();
      
      // Create the countdown timer
      createCountdownTimer(licenseManager);

    } catch (error) {
      console.error('Failed to initialize Simple Countdown Timer:', error);
      // Still create the timer but with watermark
      createCountdownTimer(null);
    }
  }

  function createCountdownTimer(licenseManager) {
    // Create container
    let container = document.getElementById(config.containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = config.containerId;
      // Insert at the end of body or where the script is
      const scripts = document.getElementsByTagName('script');
      const currentScript = scripts[scripts.length - 1];
      currentScript.parentNode.insertBefore(container, currentScript);
    }

    // Add watermark if not licensed
    if (licenseManager && !licenseManager.isLicensed) {
      licenseManager.insertWatermark(container);
    }

    // Inject styles
    injectStyles();

    // Create countdown HTML
    const countdownHTML = `
      <div class="anavo-countdown-container">
        <div class="anavo-countdown-wrapper">
          <div class="anavo-countdown-item">
            <span class="anavo-countdown-value" id="anavo-hours">00</span>
            ${config.showLabels ? '<span class="anavo-countdown-label">Hours</span>' : ''}
          </div>
          <div class="anavo-countdown-separator">:</div>
          <div class="anavo-countdown-item">
            <span class="anavo-countdown-value" id="anavo-minutes">00</span>
            ${config.showLabels ? '<span class="anavo-countdown-label">Minutes</span>' : ''}
          </div>
          <div class="anavo-countdown-separator">:</div>
          <div class="anavo-countdown-item">
            <span class="anavo-countdown-value" id="anavo-seconds">00</span>
            ${config.showLabels ? '<span class="anavo-countdown-label">Seconds</span>' : ''}
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', countdownHTML);

    // Start the countdown
    startCountdown();
  }

  function injectStyles() {
    if (document.getElementById('anavo-countdown-styles')) return;

    const styles = `
      <style id="anavo-countdown-styles">
        .anavo-countdown-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .anavo-countdown-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .anavo-countdown-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .anavo-countdown-value {
          font-size: ${config.fontSize}px;
          font-weight: 700;
          color: ${config.textColor};
          line-height: 1;
          min-width: ${config.fontSize * 1.2}px;
          text-align: center;
        }

        .anavo-countdown-label {
          font-size: ${config.fontSize * 0.25}px;
          font-weight: 500;
          color: ${config.accentColor};
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .anavo-countdown-separator {
          font-size: ${config.fontSize}px;
          font-weight: 700;
          color: ${config.textColor};
          line-height: 1;
          margin: 0 5px;
        }

        @media (max-width: 768px) {
          .anavo-countdown-value {
            font-size: ${config.fontSize * 0.6}px;
            min-width: ${config.fontSize * 0.72}px;
          }

          .anavo-countdown-label {
            font-size: ${config.fontSize * 0.18}px;
          }

          .anavo-countdown-separator {
            font-size: ${config.fontSize * 0.6}px;
          }

          .anavo-countdown-wrapper {
            gap: 5px;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  function startCountdown() {
    let targetDate;

    // If targetDate is provided, use it
    if (config.targetDate) {
      targetDate = new Date(config.targetDate).getTime();
    } else {
      // Default: count down 24 hours from now
      targetDate = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        // Countdown finished
        document.getElementById('anavo-hours').textContent = '00';
        document.getElementById('anavo-minutes').textContent = '00';
        document.getElementById('anavo-seconds').textContent = '00';
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.getElementById('anavo-hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('anavo-minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('anavo-seconds').textContent = String(seconds).padStart(2, '0');
    }

    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
