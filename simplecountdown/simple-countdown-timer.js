/**
 * ========================================
 * SIMPLE COUNTDOWN TIMER - Squarespace Plugin
 * ========================================
 * @version 1.0.1
 * @author Anavo Tech
 * @license Commercial - See LICENSE.md
 * 
 * USAGE:
 * 
 * Option 1 - Drop-in (auto-placement):
 * <script src="...simple-countdown-timer.min.js?targetDate=2026-12-31"></script>
 * 
 * Option 2 - Precise placement (advanced):
 * <div id="anavo-countdown-timer"></div>
 * <script src="...simple-countdown-timer.min.js?targetDate=2026-12-31"></script>
 * 
 * ========================================
 */

(function() {
  'use strict';

  // Get reference to current script IMMEDIATELY
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Parse URL parameters from the script tag
  function getScriptParams() {
    const src = currentScript.src;
    const url = new URL(src);
    const params = new URLSearchParams(url.search);
    
    return {
      license: params.get('license') || '',
      accentColor: decodeURIComponent(params.get('accentColor') || '#2a284d'),
      textColor: decodeURIComponent(params.get('textColor') || '#762323'),
      fontSize: parseInt(params.get('fontSize') || '60'),
      showLabels: params.get('showLabels') !== 'false',
      targetDate: params.get('targetDate') || '',
      containerId: params.get('containerId') || 'anavo-countdown-timer'
    };
  }

  const config = getScriptParams();

  // Load the licensing system
  function loadLicensingScript() {
    return new Promise((resolve, reject) => {
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
      await loadLicensingScript();
      
      const licenseManager = new window.AnavoLicenseManager(
        'SimpleCountdownTimer',
        '1.0.1',
        {
          licenseServer: 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/_shared/licenses.json',
          showUI: true
        }
      );

      await licenseManager.init();
      createCountdownTimer(licenseManager);

    } catch (error) {
      console.error('Failed to initialize Simple Countdown Timer:', error);
      createCountdownTimer(null);
    }
  }

  function createCountdownTimer(licenseManager) {
    let container;
    let isUserProvidedContainer = false;
    
    // HYBRID APPROACH: Check for user-provided div first
    // Look for common patterns users might use
    const possibleContainers = [
      document.getElementById(config.containerId),
      document.querySelector('.anavo-countdown-timer'),
      document.querySelector('[data-anavo-countdown]')
    ];
    
    // Find first existing container
    container = possibleContainers.find(el => el !== null);
    
    if (container) {
      // User provided a container - use it!
      isUserProvidedContainer = true;
      console.log('✅ Using user-provided container for countdown timer');
    } else {
      // No container found - create one (Squarekicker auto-insert method)
      container = document.createElement('div');
      container.id = config.containerId + '-' + Date.now();
      container.className = 'anavo-countdown-plugin-wrapper';
      
      // Insert RIGHT AFTER the script tag
      if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
        console.log('✅ Auto-created countdown container (drop-in mode)');
      } else {
        // Fallback: append to body
        document.body.appendChild(container);
      }
    }

    // Add watermark if not licensed
    if (licenseManager && !licenseManager.isLicensed) {
      licenseManager.insertWatermark(container);
    }

    // Inject styles
    injectStyles();

    // Generate unique IDs for this instance
    const instanceId = 'anavo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Create countdown HTML
    const countdownHTML = `
      <div class="anavo-countdown-container">
        <div class="anavo-countdown-wrapper">
          <div class="anavo-countdown-item">
            <span class="anavo-countdown-value" id="${instanceId}-hours">00</span>
            ${config.showLabels ? '<span class="anavo-countdown-label">Hours</span>' : ''}
          </div>
          <div class="anavo-countdown-separator">:</div>
          <div class="anavo-countdown-item">
            <span class="anavo-countdown-value" id="${instanceId}-minutes">00</span>
            ${config.showLabels ? '<span class="anavo-countdown-label">Minutes</span>' : ''}
          </div>
          <div class="anavo-countdown-separator">:</div>
          <div class="anavo-countdown-item">
            <span class="anavo-countdown-value" id="${instanceId}-seconds">00</span>
            ${config.showLabels ? '<span class="anavo-countdown-label">Seconds</span>' : ''}
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', countdownHTML);

    // Start the countdown with this instance's IDs
    startCountdown(instanceId);
  }

  function injectStyles() {
    if (document.getElementById('anavo-countdown-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'anavo-countdown-styles';
    styles.textContent = `
      /* Plugin wrapper - for auto-inserted containers */
      .anavo-countdown-plugin-wrapper {
        width: 100%;
        clear: both;
        display: block;
      }

      /* Main container */
      .anavo-countdown-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      /* Countdown wrapper */
      .anavo-countdown-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      /* Individual time unit */
      .anavo-countdown-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      /* Countdown numbers */
      .anavo-countdown-value {
        font-size: ${config.fontSize}px;
        font-weight: 700;
        color: ${config.textColor};
        line-height: 1;
        min-width: ${config.fontSize * 1.2}px;
        text-align: center;
        font-variant-numeric: tabular-nums;
      }

      /* Labels (Hours, Minutes, Seconds) */
      .anavo-countdown-label {
        font-size: ${config.fontSize * 0.25}px;
        font-weight: 500;
        color: ${config.accentColor};
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      /* Separator colons */
      .anavo-countdown-separator {
        font-size: ${config.fontSize}px;
        font-weight: 700;
        color: ${config.textColor};
        line-height: 1;
        margin: 0 5px;
      }

      /* Mobile responsive */
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

        .anavo-countdown-container {
          padding: 15px 10px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  function startCountdown(instanceId) {
    let targetDate;

    if (config.targetDate) {
      targetDate = new Date(config.targetDate).getTime();
    } else {
      // Default: 24 hours from now
      targetDate = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    const hoursEl = document.getElementById(`${instanceId}-hours`);
    const minutesEl = document.getElementById(`${instanceId}-minutes`);
    const secondsEl = document.getElementById(`${instanceId}-seconds`);

    if (!hoursEl || !minutesEl || !secondsEl) {
      console.error('Countdown elements not found');
      return;
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        // Countdown finished
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
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
