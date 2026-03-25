/**
 * Anavo Quotation Builder v2.0.0
 * Interactive step-by-step quotation calculator for wedding / photography / venue industry.
 * Step types: single choice, multiple choice, quantity × price.
 * Floating editor panel in Squarespace edit mode — saves config to Anavo API.
 * Submit → saves to DB + triggers email notification + shows summary with CTA.
 *
 * Usage (Code Block):
 *   <div id="anavo-quotation"></div>
 *   <script src="...quotation-builder.min.js?configId=YOUR_ID&accentColor=%231a3a5c"></script>
 *
 * Script URL parameters:
 *   target        CSS selector for container   default: #anavo-quotation
 *   configId      Saved config ID from editor  default: (uses built-in template)
 *   accentColor   Brand color                  default: #1a3a5c
 *   currency      Currency symbol              default: $
 *   ctaText       CTA button label             default: Book Now
 *   ctaUrl        CTA button URL               default: /contact
 *   api           API base URL                 default: https://api.anavo.tech
 *   domain        Override detected hostname
 */
;(function () {
  'use strict';

  if (window.AnavoPluginState && window.AnavoPluginState.plugins['QuotationBuilder']) return;

  // ─── Config ───────────────────────────────────────────────────────────────

  var scriptEl = document.currentScript || (function () {
    var s = document.querySelectorAll('script[src*="quotation-builder"]');
    return s[s.length - 1];
  })();

  var params = (scriptEl && scriptEl.src) ? new URL(scriptEl.src).searchParams : new URLSearchParams();

  var CFG = {
    target:      params.get('target')      || '#anavo-quotation',
    configId:    params.get('configId')    || '',
    apiBase:     params.get('api')         || 'https://api.anavo.tech',
    domain:      params.get('domain')      || window.location.hostname,
    accentColor: params.get('accentColor') || '#1a3a5c',
    currency:    params.get('currency')    || '$',
    ctaText:     params.get('ctaText')     || 'Book Now',
    ctaUrl:      params.get('ctaUrl')      || '/contact',
  };

  // ─── Default template (Wedding / Photography) ────────────────────────────

  var DEFAULT_CONFIG = {
    name: 'Photography Quote',
    currency: CFG.currency,
    accentColor: CFG.accentColor,
    ctaText: CFG.ctaText,
    ctaUrl: CFG.ctaUrl,
    notifyEmail: '',
    steps: [
      {
        id: 's1', title: 'Event Type',
        description: 'What kind of event are you planning?',
        type: 'select', required: true,
        options: [
          { id: 'o1', label: 'Wedding',                price: 2500 },
          { id: 'o2', label: 'Engagement Session',     price: 800  },
          { id: 'o3', label: 'Corporate Event',        price: 1200 },
          { id: 'o4', label: 'Portrait Session',       price: 400  },
          { id: 'o5', label: 'Quinceañera / Sweet 16', price: 1800 }
        ]
      },
      {
        id: 's2', title: 'Coverage Duration',
        description: 'How many hours of coverage do you need?',
        type: 'quantity', required: true,
        unitLabel: 'hour', unitPrice: 200, min: 1, max: 16, default: 4
      },
      {
        id: 's3', title: 'Photographers',
        description: 'How many photographers should we bring?',
        type: 'quantity', required: true,
        unitLabel: 'photographer', unitPrice: 350, min: 1, max: 4, default: 1
      },
      {
        id: 's4', title: 'Videography',
        description: 'Would you like video coverage?',
        type: 'select', required: false,
        options: [
          { id: 'o1', label: 'No video',           price: 0    },
          { id: 'o2', label: 'Highlight Reel',     price: 900  },
          { id: 'o3', label: 'Full Film + Reel',   price: 1800 },
          { id: 'o4', label: 'Cinematic Package',  price: 2800 }
        ]
      },
      {
        id: 's5', title: 'Add-ons',
        description: 'Enhance your package with extras.',
        type: 'multiselect', required: false,
        options: [
          { id: 'o1', label: 'Drone Coverage',      price: 450 },
          { id: 'o2', label: 'Same-day Slideshow',  price: 600 },
          { id: 'o3', label: 'Premium Photo Album', price: 750 },
          { id: 'o4', label: 'Canvas / Wall Art',   price: 300 },
          { id: 'o5', label: 'Live Photo Booth',    price: 500 }
        ]
      },
      {
        id: 's6', title: 'Delivery Timeline',
        description: 'When do you need your files delivered?',
        type: 'select', required: true,
        options: [
          { id: 'o1', label: 'Standard (6–8 weeks)', price: 0   },
          { id: 'o2', label: 'Rush (2–3 weeks)',      price: 350 },
          { id: 'o3', label: 'Express (5–7 days)',    price: 700 }
        ]
      }
    ]
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function fmt(amount, currency) {
    return (currency || '$') + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function uid() {
    return 's' + Math.random().toString(36).slice(2, 7);
  }

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ─── Styles ───────────────────────────────────────────────────────────────

  function injectStyles(accent) {
    var ex = document.getElementById('anavo-qb-styles');
    if (ex) ex.remove();
    accent = accent || CFG.accentColor;

    var css = [
      // Wrap
      '.anavo-qb-wrap{font-family:inherit !important;max-width:900px !important;margin:0 auto !important;box-sizing:border-box !important}',
      '.anavo-qb-inner{display:flex !important;gap:28px !important;align-items:flex-start !important}',
      '@media(max-width:700px){.anavo-qb-inner{flex-direction:column !important}}',

      // Progress bar
      '.anavo-qb-progress{display:flex !important;margin-bottom:32px !important;overflow-x:auto !important;padding-bottom:2px !important;gap:0 !important}',
      '.anavo-qb-prog-step{flex:1 !important;min-width:55px !important;text-align:center !important;padding:6px 4px 10px !important;border-bottom:3px solid #e2e8f0 !important;font-size:11px !important;color:#94a3b8 !important;transition:all .2s !important;white-space:nowrap !important;cursor:default !important;user-select:none !important}',
      '.anavo-qb-prog-step.qb-visited{border-bottom-color:' + accent + ' !important;color:' + accent + ' !important;cursor:pointer !important}',
      '.anavo-qb-prog-step.qb-active{border-bottom-color:' + accent + ' !important;color:' + accent + ' !important;font-weight:700 !important}',
      '.anavo-qb-prog-num{display:inline-flex !important;align-items:center !important;justify-content:center !important;width:22px !important;height:22px !important;border-radius:50% !important;background:#e2e8f0 !important;color:#64748b !important;font-size:11px !important;font-weight:700 !important;margin-bottom:4px !important;transition:all .2s !important}',
      '.anavo-qb-prog-step.qb-visited .anavo-qb-prog-num,.anavo-qb-prog-step.qb-active .anavo-qb-prog-num{background:' + accent + ' !important;color:#fff !important}',

      // Step panel
      '.anavo-qb-main{flex:1 !important;min-width:0 !important}',
      '.anavo-qb-step-title{font-size:22px !important;font-weight:700 !important;margin:0 0 6px !important;color:inherit !important}',
      '.anavo-qb-step-desc{font-size:14px !important;color:#64748b !important;margin:0 0 20px !important}',

      // Options
      '.anavo-qb-options{display:flex !important;flex-direction:column !important;gap:10px !important}',
      '.anavo-qb-option{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:13px 16px !important;border:2px solid #e2e8f0 !important;border-radius:10px !important;cursor:pointer !important;transition:border-color .18s,background .18s !important;background:#fff !important;gap:10px !important}',
      '.anavo-qb-option:hover{border-color:' + accent + ' !important;background:#f7f9ff !important}',
      '.anavo-qb-option.qb-sel{border-color:' + accent + ' !important;background:' + accent + '15 !important}',
      '.anavo-qb-opt-left{display:flex !important;align-items:center !important;gap:12px !important;flex:1 !important;min-width:0 !important}',
      '.anavo-qb-opt-check{width:20px !important;height:20px !important;border-radius:50% !important;border:2px solid #cbd5e1 !important;flex-shrink:0 !important;display:flex !important;align-items:center !important;justify-content:center !important;transition:all .15s !important}',
      '.anavo-qb-multi .anavo-qb-opt-check{border-radius:5px !important}',
      '.anavo-qb-option.qb-sel .anavo-qb-opt-check{border-color:' + accent + ' !important;background:' + accent + ' !important}',
      '.anavo-qb-opt-dot{width:8px !important;height:8px !important;border-radius:50% !important;background:#fff !important;opacity:0 !important;transition:opacity .12s !important}',
      '.anavo-qb-option.qb-sel .anavo-qb-opt-dot{opacity:1 !important}',
      '.anavo-qb-opt-label{font-size:15px !important;font-weight:500 !important;color:inherit !important}',
      '.anavo-qb-opt-price{font-size:14px !important;font-weight:700 !important;color:' + accent + ' !important;white-space:nowrap !important;flex-shrink:0 !important}',

      // Quantity
      '.anavo-qb-quantity{display:flex !important;align-items:center !important;gap:18px !important;padding:20px 0 !important;flex-wrap:wrap !important}',
      '.anavo-qb-qty-btn{width:42px !important;height:42px !important;border-radius:50% !important;border:2px solid ' + accent + ' !important;background:transparent !important;color:' + accent + ' !important;font-size:22px !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;transition:all .18s !important;line-height:1 !important;flex-shrink:0 !important}',
      '.anavo-qb-qty-btn:hover:not(:disabled){background:' + accent + ' !important;color:#fff !important}',
      '.anavo-qb-qty-btn:disabled{opacity:.3 !important;cursor:default !important}',
      '.anavo-qb-qty-val{font-size:30px !important;font-weight:800 !important;min-width:50px !important;text-align:center !important;color:inherit !important}',
      '.anavo-qb-qty-unit{font-size:14px !important;color:#64748b !important}',
      '.anavo-qb-qty-price{font-size:16px !important;font-weight:700 !important;color:' + accent + ' !important;margin-left:auto !important}',

      // Contact form
      '.anavo-qb-fields{display:flex !important;flex-direction:column !important;gap:16px !important}',
      '.anavo-qb-field{display:flex !important;flex-direction:column !important;gap:6px !important}',
      '.anavo-qb-field label{font-size:13px !important;font-weight:600 !important;color:#475569 !important}',
      '.anavo-qb-field input{padding:12px 14px !important;border:2px solid #e2e8f0 !important;border-radius:8px !important;font-size:15px !important;outline:none !important;transition:border-color .18s !important;width:100% !important;box-sizing:border-box !important;background:#fff !important;color:inherit !important}',
      '.anavo-qb-field input:focus{border-color:' + accent + ' !important}',

      // Nav
      '.anavo-qb-nav{display:flex !important;gap:12px !important;margin-top:28px !important;align-items:center !important;flex-wrap:wrap !important}',
      '.anavo-qb-btn{padding:12px 26px !important;border-radius:8px !important;border:none !important;font-size:15px !important;font-weight:600 !important;cursor:pointer !important;transition:filter .18s,border-color .18s !important;line-height:1.2 !important}',
      '.anavo-qb-btn-primary{background:' + accent + ' !important;color:#fff !important}',
      '.anavo-qb-btn-primary:hover{filter:brightness(1.12) !important}',
      '.anavo-qb-btn-back{background:transparent !important;color:#64748b !important;border:2px solid #e2e8f0 !important}',
      '.anavo-qb-btn-back:hover{border-color:#94a3b8 !important;color:#334155 !important}',
      '.anavo-qb-btn-skip{margin-left:auto !important;background:transparent !important;color:#94a3b8 !important;font-size:13px !important;padding:8px 0 !important;border:none !important;text-decoration:underline !important;cursor:pointer !important}',

      // Sidebar
      '.anavo-qb-sidebar{width:250px !important;flex-shrink:0 !important;position:sticky !important;top:24px !important}',
      '@media(max-width:700px){.anavo-qb-sidebar{width:100% !important;position:static !important}}',
      '.anavo-qb-total-box{background:#f8faff !important;border:1px solid #e2e8f0 !important;border-radius:12px !important;padding:20px !important}',
      '.anavo-qb-sidebar-ttl{font-size:11px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.07em !important;color:#94a3b8 !important;margin:0 0 16px !important}',
      '.anavo-qb-lines{list-style:none !important;margin:0 0 16px !important;padding:0 !important;display:flex !important;flex-direction:column !important;gap:9px !important}',
      '.anavo-qb-line{display:flex !important;justify-content:space-between !important;gap:8px !important;font-size:13px !important}',
      '.anavo-qb-line-lbl{color:#475569 !important;flex:1 !important;min-width:0 !important;overflow:hidden !important;text-overflow:ellipsis !important;white-space:nowrap !important}',
      '.anavo-qb-line-amt{font-weight:600 !important;color:#1e293b !important;white-space:nowrap !important}',
      '.anavo-qb-divider{border:none !important;border-top:1px solid #e2e8f0 !important;margin:0 0 14px !important}',
      '.anavo-qb-total-row{display:flex !important;justify-content:space-between !important;align-items:baseline !important;gap:8px !important}',
      '.anavo-qb-total-lbl{font-size:13px !important;font-weight:600 !important;color:#64748b !important}',
      '.anavo-qb-total-amt{font-size:26px !important;font-weight:800 !important;color:' + accent + ' !important}',
      '.anavo-qb-sidebar-note{font-size:11px !important;color:#94a3b8 !important;margin-top:10px !important;text-align:center !important}',

      // Summary
      '.anavo-qb-summary{max-width:580px !important;margin:0 auto !important}',
      '.anavo-qb-sum-title{font-size:26px !important;font-weight:800 !important;margin:0 0 6px !important;color:inherit !important}',
      '.anavo-qb-sum-sub{font-size:14px !important;color:#64748b !important;margin:0 0 28px !important}',
      '.anavo-qb-sum-table{width:100% !important;border-collapse:collapse !important;margin-bottom:0 !important}',
      '.anavo-qb-sum-table td{padding:11px 0 !important;border-bottom:1px solid #f1f5f9 !important;font-size:14px !important;vertical-align:top !important}',
      '.anavo-qb-sum-table td:last-child{text-align:right !important;font-weight:600 !important;color:' + accent + ' !important;padding-left:12px !important;white-space:nowrap !important}',
      '.anavo-qb-sum-total{display:flex !important;justify-content:space-between !important;align-items:baseline !important;padding:18px 0 28px !important;border-top:2px solid #1e293b !important;gap:12px !important}',
      '.anavo-qb-sum-total-lbl{font-size:16px !important;font-weight:700 !important}',
      '.anavo-qb-sum-total-amt{font-size:34px !important;font-weight:800 !important;color:' + accent + ' !important}',
      '.anavo-qb-cta{display:inline-block !important;padding:16px 38px !important;background:' + accent + ' !important;color:#fff !important;border-radius:10px !important;font-size:16px !important;font-weight:700 !important;text-decoration:none !important;border:none !important;cursor:pointer !important;transition:filter .18s !important}',
      '.anavo-qb-cta:hover{filter:brightness(1.12) !important}',
      '.anavo-qb-restart{background:transparent !important;color:#94a3b8 !important;border:none !important;font-size:13px !important;cursor:pointer !important;text-decoration:underline !important;padding:0 !important;margin-top:18px !important;display:block !important}',

      // Editor panel
      '.anavo-qb-editor{position:fixed !important;bottom:20px !important;right:20px !important;width:360px !important;max-height:82vh !important;background:rgba(13,20,38,.96) !important;color:#e2e8f0 !important;border-radius:12px !important;font-size:13px !important;z-index:99999 !important;box-shadow:0 8px 40px rgba(0,0,0,.5) !important;display:flex !important;flex-direction:column !important}',
      '.anavo-qb-ed-header{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:12px 16px !important;border-bottom:1px solid rgba(255,255,255,.1) !important;flex-shrink:0 !important}',
      '.anavo-qb-ed-title{font-weight:700 !important;font-size:11px !important;text-transform:uppercase !important;letter-spacing:.09em !important;color:#64748b !important}',
      '.anavo-qb-ed-min{background:transparent !important;border:none !important;color:#64748b !important;cursor:pointer !important;font-size:18px !important;padding:0 !important;line-height:1 !important}',
      '.anavo-qb-ed-min:hover{color:#e2e8f0 !important}',
      '.anavo-qb-ed-body{overflow-y:auto !important;flex:1 !important;padding:16px !important}',
      '.anavo-qb-ed-section{margin-bottom:20px !important}',
      '.anavo-qb-ed-lbl{display:block !important;font-size:10px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.07em !important;color:#475569 !important;margin-bottom:5px !important}',
      '.anavo-qb-ed-inp{width:100% !important;padding:7px 10px !important;background:rgba(255,255,255,.06) !important;border:1px solid rgba(255,255,255,.14) !important;border-radius:6px !important;color:#e2e8f0 !important;font-size:13px !important;box-sizing:border-box !important;outline:none !important}',
      '.anavo-qb-ed-inp:focus{border-color:' + accent + ' !important}',
      '.anavo-qb-step-item{background:rgba(255,255,255,.04) !important;border:1px solid rgba(255,255,255,.09) !important;border-radius:8px !important;margin-bottom:8px !important;overflow:hidden !important}',
      '.anavo-qb-step-hd{display:flex !important;align-items:center !important;padding:9px 12px !important;cursor:pointer !important;gap:8px !important;user-select:none !important}',
      '.anavo-qb-step-hd:hover{background:rgba(255,255,255,.05) !important}',
      '.anavo-qb-step-nm{flex:1 !important;font-weight:600 !important;font-size:13px !important;overflow:hidden !important;text-overflow:ellipsis !important;white-space:nowrap !important}',
      '.anavo-qb-step-bd{padding:12px !important;border-top:1px solid rgba(255,255,255,.08) !important;display:none !important}',
      '.anavo-qb-step-bd.qb-open{display:block !important}',
      '.anavo-qb-opt-row{display:flex !important;gap:6px !important;margin-bottom:6px !important;align-items:center !important}',
      '.anavo-qb-oi{flex:1 !important;padding:6px 8px !important;background:rgba(255,255,255,.06) !important;border:1px solid rgba(255,255,255,.1) !important;border-radius:4px !important;color:#e2e8f0 !important;font-size:12px !important;outline:none !important;min-width:0 !important}',
      '.anavo-qb-pi{width:76px !important;padding:6px 8px !important;background:rgba(255,255,255,.06) !important;border:1px solid rgba(255,255,255,.1) !important;border-radius:4px !important;color:#e2e8f0 !important;font-size:12px !important;outline:none !important;flex-shrink:0 !important}',
      '.anavo-qb-rm{background:transparent !important;border:none !important;color:#ef4444 !important;cursor:pointer !important;font-size:17px !important;padding:2px 4px !important;flex-shrink:0 !important;line-height:1 !important}',
      '.anavo-qb-add{background:transparent !important;border:1px dashed rgba(255,255,255,.18) !important;color:#64748b !important;border-radius:4px !important;padding:5px 0 !important;font-size:12px !important;cursor:pointer !important;width:100% !important;margin-top:4px !important}',
      '.anavo-qb-add:hover{color:#94a3b8 !important;border-color:rgba(255,255,255,.3) !important}',
      '.anavo-qb-type-sel{width:100% !important;padding:6px 8px !important;background:rgba(255,255,255,.06) !important;border:1px solid rgba(255,255,255,.1) !important;border-radius:4px !important;color:#e2e8f0 !important;font-size:12px !important;margin-bottom:8px !important;outline:none !important}',
      '.anavo-qb-qty-cfg{display:flex !important;gap:8px !important;flex-wrap:wrap !important;margin-bottom:8px !important}',
      '.anavo-qb-qty-cfg label{font-size:11px !important;color:#64748b !important;display:flex !important;flex-direction:column !important;gap:3px !important;flex:1 !important;min-width:60px !important}',
      '.anavo-qb-script-box{background:rgba(0,0,0,.35) !important;border:1px solid rgba(255,255,255,.1) !important;border-radius:6px !important;padding:10px !important;font-family:monospace !important;font-size:10px !important;word-break:break-all !important;color:#94a3b8 !important;max-height:90px !important;overflow-y:auto !important;white-space:pre-wrap !important;margin-bottom:6px !important}',
      '.anavo-qb-copy-btn{width:100% !important;padding:7px !important;background:rgba(255,255,255,.07) !important;border:1px solid rgba(255,255,255,.14) !important;color:#e2e8f0 !important;border-radius:4px !important;font-size:11px !important;cursor:pointer !important}',
      '.anavo-qb-ed-footer{padding:12px 16px !important;border-top:1px solid rgba(255,255,255,.09) !important;display:flex !important;gap:8px !important;flex-shrink:0 !important}',
      '.anavo-qb-save{flex:1 !important;padding:9px !important;background:' + accent + ' !important;color:#fff !important;border:none !important;border-radius:6px !important;font-size:13px !important;font-weight:700 !important;cursor:pointer !important;transition:filter .18s !important}',
      '.anavo-qb-save:hover:not(:disabled){filter:brightness(1.12) !important}',
      '.anavo-qb-save:disabled{opacity:.5 !important;cursor:default !important}',
      '.anavo-qb-mini{position:fixed !important;bottom:20px !important;right:20px !important;background:rgba(13,20,38,.92) !important;color:#e2e8f0 !important;border:1px solid rgba(255,255,255,.15) !important;border-radius:8px !important;padding:8px 14px !important;font-size:12px !important;font-weight:700 !important;cursor:pointer !important;z-index:99999 !important;display:none !important}',
      '.anavo-qb-req-row{display:flex !important;align-items:center !important;gap:6px !important;font-size:12px !important;color:#94a3b8 !important;margin-bottom:10px !important;cursor:pointer !important}',
    ].join('');

    var el = document.createElement('style');
    el.id = 'anavo-qb-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ─── Widget ───────────────────────────────────────────────────────────────

  function Widget(container, config) {
    this.container = container;
    this.config = config;
    this.step = 0;             // 0..steps.length = contact step
    this.visited = {};         // step index -> true
    this.visited[0] = true;
    this.sel = {};             // stepId -> { label, price, detail }
    this.contact = { name: '', email: '' };
    this.done = false;
    this._render();
  }

  Widget.prototype._totalSteps = function () {
    return this.config.steps.length; // contact is step index = totalSteps
  };

  Widget.prototype._getTotal = function () {
    var total = 0;
    var sel = this.sel;
    this.config.steps.forEach(function (s) {
      if (sel[s.id]) total += sel[s.id].price || 0;
    });
    return total;
  };

  Widget.prototype._render = function () {
    var self = this;
    this.container.innerHTML = '';
    this.container.className = 'anavo-qb-wrap';

    if (this.done) { this._renderSummary(); return; }

    // Progress bar
    var prog = document.createElement('div');
    prog.className = 'anavo-qb-progress';
    var total = this._totalSteps();

    this.config.steps.forEach(function (step, i) {
      prog.appendChild(self._progStep(i, i + 1, step.title, total));
    });
    prog.appendChild(self._progStep(total, total + 1, 'Your Info', total));
    this.container.appendChild(prog);

    // Inner layout
    var inner = document.createElement('div');
    inner.className = 'anavo-qb-inner';

    var main = document.createElement('div');
    main.className = 'anavo-qb-main';

    if (this.step === total) {
      this._renderContact(main);
    } else {
      this._renderStep(main, this.config.steps[this.step]);
    }

    inner.appendChild(main);
    inner.appendChild(this._buildSidebar());
    this.container.appendChild(inner);
  };

  Widget.prototype._progStep = function (idx, num, title, lastStepIdx) {
    var self = this;
    var el = document.createElement('div');
    var cls = 'anavo-qb-prog-step';
    if (idx === this.step) cls += ' qb-active';
    else if (this.visited[idx]) cls += ' qb-visited';
    el.className = cls;
    el.innerHTML = '<div class="anavo-qb-prog-num">' + num + '</div><div style="font-size:10px;margin-top:2px">' + esc(title) + '</div>';
    if (this.visited[idx]) {
      el.addEventListener('click', function () { self.step = idx; self._render(); });
    }
    return el;
  };

  Widget.prototype._renderStep = function (parent, step) {
    var self = this;

    parent.innerHTML = '<div class="anavo-qb-step-title">' + esc(step.title) + '</div>' +
      (step.description ? '<div class="anavo-qb-step-desc">' + esc(step.description) + '</div>' : '');

    if (step.type === 'select')       this._renderSelect(parent, step);
    else if (step.type === 'multiselect') this._renderMulti(parent, step);
    else if (step.type === 'quantity')    this._renderQty(parent, step);

    // Nav
    var nav = document.createElement('div');
    nav.className = 'anavo-qb-nav';

    if (this.step > 0) {
      var back = document.createElement('button');
      back.className = 'anavo-qb-btn anavo-qb-btn-back';
      back.textContent = '← Back';
      back.addEventListener('click', function () { self.step--; self._render(); });
      nav.appendChild(back);
    }

    var next = document.createElement('button');
    next.className = 'anavo-qb-btn anavo-qb-btn-primary';
    next.textContent = this.step === this._totalSteps() - 1 ? 'Continue →' : 'Next →';
    next.addEventListener('click', function () {
      self.step++;
      self.visited[self.step] = true;
      self._render();
    });
    nav.appendChild(next);

    if (!step.required) {
      var skip = document.createElement('button');
      skip.className = 'anavo-qb-btn-skip';
      skip.textContent = 'Skip this step';
      skip.addEventListener('click', function () {
        delete self.sel[step.id];
        self.step++;
        self.visited[self.step] = true;
        self._render();
      });
      nav.appendChild(skip);
    }

    parent.appendChild(nav);
  };

  Widget.prototype._renderSelect = function (parent, step) {
    var self = this;
    var cur = this.sel[step.id];
    var list = document.createElement('div');
    list.className = 'anavo-qb-options';

    step.options.forEach(function (opt) {
      var el = document.createElement('div');
      el.className = 'anavo-qb-option' + (cur && cur.optId === opt.id ? ' qb-sel' : '');
      el.innerHTML =
        '<div class="anavo-qb-opt-left">' +
        '<div class="anavo-qb-opt-check"><div class="anavo-qb-opt-dot"></div></div>' +
        '<span class="anavo-qb-opt-label">' + esc(opt.label) + '</span></div>' +
        '<span class="anavo-qb-opt-price">' + (opt.price === 0 ? 'Included' : '+' + fmt(opt.price, self.config.currency)) + '</span>';
      el.addEventListener('click', function () {
        self.sel[step.id] = { optId: opt.id, label: opt.label, price: opt.price };
        list.querySelectorAll('.anavo-qb-option').forEach(function (o) { o.classList.remove('qb-sel'); });
        el.classList.add('qb-sel');
        self._updateSidebar();
      });
      list.appendChild(el);
    });
    parent.appendChild(list);
  };

  Widget.prototype._renderMulti = function (parent, step) {
    var self = this;
    if (!this.sel[step.id]) this.sel[step.id] = { multi: {}, price: 0, label: '' };
    var store = this.sel[step.id];

    var list = document.createElement('div');
    list.className = 'anavo-qb-options anavo-qb-multi';

    step.options.forEach(function (opt) {
      var el = document.createElement('div');
      el.className = 'anavo-qb-option' + (store.multi[opt.id] ? ' qb-sel' : '');
      el.innerHTML =
        '<div class="anavo-qb-opt-left">' +
        '<div class="anavo-qb-opt-check"><div class="anavo-qb-opt-dot"></div></div>' +
        '<span class="anavo-qb-opt-label">' + esc(opt.label) + '</span></div>' +
        '<span class="anavo-qb-opt-price">+' + fmt(opt.price, self.config.currency) + '</span>';
      el.addEventListener('click', function () {
        if (store.multi[opt.id]) { delete store.multi[opt.id]; el.classList.remove('qb-sel'); }
        else { store.multi[opt.id] = { label: opt.label, price: opt.price }; el.classList.add('qb-sel'); }
        var total = 0; var labels = [];
        Object.keys(store.multi).forEach(function (k) { total += store.multi[k].price; labels.push(store.multi[k].label); });
        store.price = total;
        store.label = labels.join(', ') || '';
        self._updateSidebar();
      });
      list.appendChild(el);
    });
    parent.appendChild(list);
  };

  Widget.prototype._renderQty = function (parent, step) {
    var self = this;
    var cur = this.sel[step.id] ? this.sel[step.id].qty : (step.default || step.min || 1);

    var wrap = document.createElement('div');
    wrap.className = 'anavo-qb-quantity';

    var minusBtn = document.createElement('button');
    minusBtn.className = 'anavo-qb-qty-btn';
    minusBtn.textContent = '−';

    var valEl   = document.createElement('div'); valEl.className = 'anavo-qb-qty-val';
    var unitEl  = document.createElement('div'); unitEl.className = 'anavo-qb-qty-unit';
    var priceEl = document.createElement('div'); priceEl.className = 'anavo-qb-qty-price';
    var plusBtn = document.createElement('button');
    plusBtn.className = 'anavo-qb-qty-btn'; plusBtn.textContent = '+';

    function update(val) {
      cur = Math.max(step.min, Math.min(step.max, val));
      valEl.textContent = cur;
      unitEl.textContent = step.unitLabel + (cur !== 1 ? 's' : '');
      priceEl.textContent = fmt(cur * step.unitPrice, self.config.currency);
      minusBtn.disabled = cur <= step.min;
      plusBtn.disabled  = cur >= step.max;
      self.sel[step.id] = { qty: cur, price: cur * step.unitPrice, label: cur + ' ' + step.unitLabel + (cur !== 1 ? 's' : '') };
      self._updateSidebar();
    }

    update(cur);
    minusBtn.addEventListener('click', function () { update(cur - 1); });
    plusBtn.addEventListener('click',  function () { update(cur + 1); });

    wrap.appendChild(minusBtn); wrap.appendChild(valEl); wrap.appendChild(unitEl);
    wrap.appendChild(plusBtn);  wrap.appendChild(priceEl);
    parent.appendChild(wrap);
  };

  Widget.prototype._renderContact = function (parent) {
    var self = this;
    parent.innerHTML =
      '<div class="anavo-qb-step-title">Almost done!</div>' +
      '<div class="anavo-qb-step-desc">Enter your details to receive your personalized quote.</div>';

    var fields = document.createElement('div');
    fields.className = 'anavo-qb-fields';

    function field(label, type, key, placeholder) {
      var wrap = document.createElement('div'); wrap.className = 'anavo-qb-field';
      wrap.innerHTML = '<label>' + label + '</label>';
      var inp = document.createElement('input');
      inp.type = type; inp.placeholder = placeholder; inp.value = self.contact[key] || '';
      inp.addEventListener('input', function () { self.contact[key] = this.value; });
      wrap.appendChild(inp); return wrap;
    }

    fields.appendChild(field('Your Name', 'text', 'name', 'Jane Smith'));
    fields.appendChild(field('Email Address', 'email', 'email', 'jane@example.com'));
    parent.appendChild(fields);

    var nav = document.createElement('div');
    nav.className = 'anavo-qb-nav';

    var back = document.createElement('button');
    back.className = 'anavo-qb-btn anavo-qb-btn-back'; back.textContent = '← Back';
    back.addEventListener('click', function () { self.step--; self._render(); });

    var submit = document.createElement('button');
    submit.className = 'anavo-qb-btn anavo-qb-btn-primary'; submit.textContent = 'Get My Quote →';
    submit.addEventListener('click', function () {
      if (!self.contact.name.trim() || !self.contact.email.trim()) {
        alert('Please enter your name and email.'); return;
      }
      submit.textContent = 'Sending…'; submit.disabled = true;
      self._submit(function () { self.done = true; self._render(); });
    });

    nav.appendChild(back); nav.appendChild(submit);
    parent.appendChild(nav);
  };

  Widget.prototype._buildSidebar = function () {
    var self = this;
    var sidebar = document.createElement('div');
    sidebar.className = 'anavo-qb-sidebar';

    var box = document.createElement('div');
    box.className = 'anavo-qb-total-box';
    box.innerHTML = '<div class="anavo-qb-sidebar-ttl">Your Estimate</div>';

    var list = document.createElement('ul');
    list.className = 'anavo-qb-lines';

    var hasItems = false;
    this.config.steps.forEach(function (step) {
      var s = self.sel[step.id];
      if (s && s.price > 0) {
        hasItems = true;
        var li = document.createElement('li'); li.className = 'anavo-qb-line';
        li.innerHTML = '<span class="anavo-qb-line-lbl">' + esc(s.label || step.title) + '</span>' +
          '<span class="anavo-qb-line-amt">' + fmt(s.price, self.config.currency) + '</span>';
        list.appendChild(li);
      }
    });

    if (!hasItems) {
      var li = document.createElement('li'); li.className = 'anavo-qb-line';
      li.innerHTML = '<span class="anavo-qb-line-lbl" style="color:#94a3b8;font-style:italic">Make your selections</span>';
      list.appendChild(li);
    }

    box.appendChild(list);

    var hr = document.createElement('hr'); hr.className = 'anavo-qb-divider'; box.appendChild(hr);
    var total = this._getTotal();
    var row = document.createElement('div'); row.className = 'anavo-qb-total-row';
    row.innerHTML = '<span class="anavo-qb-total-lbl">Estimated Total</span>' +
      '<span class="anavo-qb-total-amt">' + fmt(total, this.config.currency) + '</span>';
    box.appendChild(row);

    var note = document.createElement('div'); note.className = 'anavo-qb-sidebar-note';
    note.textContent = 'Final price confirmed at booking';
    box.appendChild(note);

    sidebar.appendChild(box);
    return sidebar;
  };

  Widget.prototype._updateSidebar = function () {
    var old = this.container.querySelector('.anavo-qb-sidebar');
    if (!old) return;
    old.parentNode.replaceChild(this._buildSidebar(), old);
  };

  Widget.prototype._submit = function (onDone) {
    var payload = {
      domain:     CFG.domain,
      configId:   this.config.id || CFG.configId || 'default',
      configName: this.config.name,
      clientName: this.contact.name,
      clientEmail: this.contact.email,
      selections: this.sel,
      total:      this._getTotal(),
      currency:   this.config.currency || CFG.currency
    };

    fetch(CFG.apiBase + '/api/quotation/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () {});

    onDone();
  };

  Widget.prototype._renderSummary = function () {
    var self = this;
    var config = this.config;
    var total = this._getTotal();
    var wrap = document.createElement('div');
    wrap.className = 'anavo-qb-summary';

    wrap.innerHTML =
      '<div class="anavo-qb-sum-title">Your Quote is Ready!</div>' +
      '<div class="anavo-qb-sum-sub">Hi ' + esc(this.contact.name) + ', here\'s your personalized estimate.</div>';

    var table = document.createElement('table');
    table.className = 'anavo-qb-sum-table';
    config.steps.forEach(function (step) {
      var s = self.sel[step.id];
      if (s && (s.price > 0 || s.label)) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + esc(step.title) + '<br><small style="color:#64748b">' + esc(s.label || '') + '</small></td>' +
          '<td>' + fmt(s.price || 0, config.currency) + '</td>';
        table.appendChild(tr);
      }
    });
    wrap.appendChild(table);

    var totalRow = document.createElement('div'); totalRow.className = 'anavo-qb-sum-total';
    totalRow.innerHTML = '<span class="anavo-qb-sum-total-lbl">Estimated Total</span>' +
      '<span class="anavo-qb-sum-total-amt">' + fmt(total, config.currency) + '</span>';
    wrap.appendChild(totalRow);

    var cta = document.createElement('a'); cta.className = 'anavo-qb-cta';
    cta.href = config.ctaUrl || CFG.ctaUrl;
    cta.textContent = config.ctaText || CFG.ctaText;
    wrap.appendChild(cta);

    var restart = document.createElement('button'); restart.className = 'anavo-qb-restart';
    restart.textContent = 'Start over';
    restart.addEventListener('click', function () {
      self.step = 0; self.visited = { 0: true }; self.sel = {};
      self.contact = { name: '', email: '' }; self.done = false;
      self._render();
    });
    wrap.appendChild(restart);

    this.container.appendChild(wrap);
  };

  // ─── Edit Mode Panel ──────────────────────────────────────────────────────

  function isEditMode() {
    try {
      return (
        document.body.classList.contains('sqs-edit-mode') ||
        document.body.classList.contains('sqs-editing') ||
        document.documentElement.classList.contains('sqs-edit-mode') ||
        window.location.search.indexOf('editMode') !== -1 ||
        window.self !== window.top
      );
    } catch (_) { return false; }
  }

  function createEditorPanel(widgetRef, configRef) {
    if (!isEditMode()) return;
    if (document.querySelector('.anavo-qb-editor')) return;

    var panel = document.createElement('div');
    panel.className = 'anavo-qb-editor';

    // Header
    var header = document.createElement('div'); header.className = 'anavo-qb-ed-header';
    header.innerHTML = '<span class="anavo-qb-ed-title">Quotation Builder</span>';
    var minBtn = document.createElement('button');
    minBtn.className = 'anavo-qb-ed-min'; minBtn.textContent = '−'; minBtn.title = 'Minimize';
    header.appendChild(minBtn); panel.appendChild(header);

    // Mini restore button
    var mini = document.createElement('button'); mini.className = 'anavo-qb-mini';
    mini.textContent = '⚙ QB Editor'; mini.style.display = 'none';
    document.body.appendChild(mini);

    minBtn.addEventListener('click', function () { panel.style.display = 'none'; mini.style.display = 'block'; });
    mini.addEventListener('click',   function () { panel.style.display = 'flex'; mini.style.display = 'none'; });

    // Body
    var body = document.createElement('div'); body.className = 'anavo-qb-ed-body';

    function buildScriptTag(cfg) {
      var base = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/quotation-builder/quotation-builder.min.js';
      var q = '?configId=' + encodeURIComponent(cfg.id || 'default') +
        '&accentColor=' + encodeURIComponent(cfg.accentColor || '#1a3a5c') +
        '&ctaText=' + encodeURIComponent(cfg.ctaText || 'Book Now') +
        '&ctaUrl=' + encodeURIComponent(cfg.ctaUrl || '/contact');
      return '<div id="anavo-quotation"></div>\n<script src="' + base + q + '"><\/script>';
    }

    function renderBody() {
      body.innerHTML = '';
      var cfg = configRef[0];

      // Settings
      var settSec = document.createElement('div'); settSec.className = 'anavo-qb-ed-section';
      settSec.innerHTML = '<span class="anavo-qb-ed-lbl">Settings</span>';

      function settingField(label, key, type) {
        var wrap = document.createElement('div'); wrap.style.marginBottom = '8px';
        var lbl = document.createElement('label'); lbl.className = 'anavo-qb-ed-lbl'; lbl.textContent = label;
        var inp = document.createElement('input'); inp.className = 'anavo-qb-ed-inp';
        inp.type = type || 'text'; inp.value = cfg[key] || '';
        inp.addEventListener('input', function () { cfg[key] = this.value; });
        wrap.appendChild(lbl); wrap.appendChild(inp); return wrap;
      }

      settSec.appendChild(settingField('Quote Name', 'name'));
      settSec.appendChild(settingField('Currency Symbol', 'currency'));
      settSec.appendChild(settingField('Accent Color (#hex)', 'accentColor'));
      settSec.appendChild(settingField('Notification Email', 'notifyEmail', 'email'));
      settSec.appendChild(settingField('CTA Button Text', 'ctaText'));
      settSec.appendChild(settingField('CTA Button URL', 'ctaUrl'));
      body.appendChild(settSec);

      // Steps
      var stepsSec = document.createElement('div'); stepsSec.className = 'anavo-qb-ed-section';
      stepsSec.innerHTML = '<span class="anavo-qb-ed-lbl">Steps (' + cfg.steps.length + ')</span>';

      cfg.steps.forEach(function (step, si) {
        var item = document.createElement('div'); item.className = 'anavo-qb-step-item';

        var hd = document.createElement('div'); hd.className = 'anavo-qb-step-hd';
        hd.innerHTML = '<span style="color:#475569;font-size:11px;flex-shrink:0">' + (si + 1) + '</span>' +
          '<span class="anavo-qb-step-nm">' + esc(step.title || 'Untitled') + '</span>' +
          '<span style="color:#475569;font-size:10px;flex-shrink:0">' + step.type + '</span>';

        var rmStep = document.createElement('button'); rmStep.className = 'anavo-qb-rm'; rmStep.textContent = '×';
        rmStep.addEventListener('click', function (e) { e.stopPropagation(); cfg.steps.splice(si, 1); renderBody(); });
        hd.appendChild(rmStep);

        var bd = document.createElement('div'); bd.className = 'anavo-qb-step-bd';

        hd.addEventListener('click', function () { bd.classList.toggle('qb-open'); });

        // Title input
        var titleRow = document.createElement('div'); titleRow.style.marginBottom = '8px';
        var titleInp = document.createElement('input'); titleInp.className = 'anavo-qb-ed-inp';
        titleInp.placeholder = 'Step title'; titleInp.value = step.title || '';
        titleInp.style.width = '100%'; titleInp.style.boxSizing = 'border-box';
        titleInp.addEventListener('input', function () {
          step.title = this.value;
          hd.querySelector('.anavo-qb-step-nm').textContent = this.value || 'Untitled';
        });
        titleRow.appendChild(titleInp); bd.appendChild(titleRow);

        // Description input
        var descInp = document.createElement('input'); descInp.className = 'anavo-qb-ed-inp';
        descInp.placeholder = 'Description (optional)'; descInp.value = step.description || '';
        descInp.style.cssText = 'width:100%;box-sizing:border-box;margin-bottom:8px';
        descInp.addEventListener('input', function () { step.description = this.value; });
        bd.appendChild(descInp);

        // Type select
        var typeEl = document.createElement('select'); typeEl.className = 'anavo-qb-type-sel';
        [['select','Single Choice'],['multiselect','Multiple Choice'],['quantity','Quantity × Price']].forEach(function (t) {
          var o = document.createElement('option'); o.value = t[0]; o.textContent = t[1]; o.selected = step.type === t[0];
          typeEl.appendChild(o);
        });
        typeEl.addEventListener('change', function () {
          step.type = this.value;
          if (step.type === 'quantity') {
            step.unitLabel = step.unitLabel || 'unit'; step.unitPrice = step.unitPrice || 0;
            step.min = step.min || 1; step.max = step.max || 10; step.default = step.default || 1;
            delete step.options;
          } else {
            if (!step.options) step.options = [];
            delete step.unitLabel; delete step.unitPrice; delete step.min; delete step.max; delete step.default;
          }
          renderBody();
        });
        bd.appendChild(typeEl);

        // Required
        var reqRow = document.createElement('label'); reqRow.className = 'anavo-qb-req-row';
        var reqChk = document.createElement('input'); reqChk.type = 'checkbox'; reqChk.checked = !!step.required;
        reqChk.addEventListener('change', function () { step.required = this.checked; });
        reqRow.appendChild(reqChk); reqRow.appendChild(document.createTextNode(' Required'));
        bd.appendChild(reqRow);

        if (step.type === 'quantity') {
          var qcfg = document.createElement('div'); qcfg.className = 'anavo-qb-qty-cfg';
          [['Unit label','unitLabel','text'],['$/unit','unitPrice','number'],['Min','min','number'],['Max','max','number'],['Default','default','number']].forEach(function (f) {
            var lw = document.createElement('label'); lw.textContent = f[0];
            var inp = document.createElement('input'); inp.className = 'anavo-qb-oi';
            inp.type = f[2]; inp.value = step[f[1]] !== undefined ? step[f[1]] : '';
            inp.addEventListener('input', function () { step[f[1]] = f[2] === 'text' ? this.value : (parseFloat(this.value) || 0); });
            lw.appendChild(inp); qcfg.appendChild(lw);
          });
          bd.appendChild(qcfg);
        } else {
          var optsLbl = document.createElement('div');
          optsLbl.style.cssText = 'font-size:10px;color:#475569;margin-bottom:5px';
          optsLbl.textContent = 'Options — Label | Price';
          bd.appendChild(optsLbl);

          if (!step.options) step.options = [];
          step.options.forEach(function (opt, oi) {
            var row = document.createElement('div'); row.className = 'anavo-qb-opt-row';
            var li = document.createElement('input'); li.className = 'anavo-qb-oi'; li.placeholder = 'Label'; li.value = opt.label || '';
            li.addEventListener('input', function () { opt.label = this.value; });
            var pi = document.createElement('input'); pi.className = 'anavo-qb-pi'; pi.type = 'number'; pi.placeholder = '0'; pi.value = opt.price !== undefined ? opt.price : '';
            pi.addEventListener('input', function () { opt.price = parseFloat(this.value) || 0; });
            var rm = document.createElement('button'); rm.className = 'anavo-qb-rm'; rm.textContent = '×';
            rm.addEventListener('click', function () { step.options.splice(oi, 1); renderBody(); });
            row.appendChild(li); row.appendChild(pi); row.appendChild(rm);
            bd.appendChild(row);
          });

          var addOpt = document.createElement('button'); addOpt.className = 'anavo-qb-add'; addOpt.textContent = '+ Add Option';
          addOpt.addEventListener('click', function () { step.options.push({ id: uid(), label: '', price: 0 }); renderBody(); });
          bd.appendChild(addOpt);
        }

        item.appendChild(hd); item.appendChild(bd);
        stepsSec.appendChild(item);
      });

      var addStep = document.createElement('button'); addStep.className = 'anavo-qb-add';
      addStep.style.marginTop = '8px'; addStep.textContent = '+ Add Step';
      addStep.addEventListener('click', function () {
        cfg.steps.push({ id: uid(), title: 'New Step', type: 'select', required: false, options: [] });
        renderBody();
      });
      stepsSec.appendChild(addStep);
      body.appendChild(stepsSec);

      // Script tag
      var scrSec = document.createElement('div'); scrSec.className = 'anavo-qb-ed-section';
      scrSec.innerHTML = '<span class="anavo-qb-ed-lbl">Script Tag (copy to SS footer)</span>';
      var scrBox = document.createElement('div'); scrBox.className = 'anavo-qb-script-box';
      scrBox.textContent = buildScriptTag(cfg);
      var cpBtn = document.createElement('button'); cpBtn.className = 'anavo-qb-copy-btn'; cpBtn.textContent = '📋 Copy Script Tag';
      cpBtn.addEventListener('click', function () {
        (navigator.clipboard ? navigator.clipboard.writeText(scrBox.textContent) : Promise.reject())
          .then(function () { cpBtn.textContent = '✓ Copied!'; setTimeout(function () { cpBtn.textContent = '📋 Copy Script Tag'; }, 2000); })
          .catch(function () { var r = document.createRange(); r.selectNode(scrBox); window.getSelection().removeAllRanges(); window.getSelection().addRange(r); try { document.execCommand('copy'); } catch (_) {} });
      });
      scrSec.appendChild(scrBox); scrSec.appendChild(cpBtn);
      body.appendChild(scrSec);
    }

    renderBody();
    panel.appendChild(body);

    // Footer
    var footer = document.createElement('div'); footer.className = 'anavo-qb-ed-footer';
    var saveBtn = document.createElement('button'); saveBtn.className = 'anavo-qb-save'; saveBtn.textContent = 'Save & Preview';
    saveBtn.addEventListener('click', function () {
      var cfg = configRef[0];
      saveBtn.textContent = 'Saving…'; saveBtn.disabled = true;
      fetch(CFG.apiBase + '/api/quotation/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: CFG.domain, config: cfg })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          cfg.id = d.id || cfg.id;
          configRef[0] = cfg;
          injectStyles(cfg.accentColor);
          var el = document.querySelector(CFG.target);
          if (el) widgetRef[0] = new Widget(el, cfg);
          renderBody();
          saveBtn.textContent = '✓ Saved!'; saveBtn.disabled = false;
          setTimeout(function () { saveBtn.textContent = 'Save & Preview'; }, 2500);
        })
        .catch(function () { saveBtn.textContent = 'Error — retry'; saveBtn.disabled = false; });
    });
    footer.appendChild(saveBtn);
    panel.appendChild(footer);
    document.body.appendChild(panel);
  }

  // ─── Mount ────────────────────────────────────────────────────────────────

  function mount() {
    var container = document.querySelector(CFG.target);
    if (!container) return false;

    var configRef = [null];
    var widgetRef = [null];

    function launch(config) {
      injectStyles(config.accentColor || CFG.accentColor);
      widgetRef[0] = new Widget(container, config);
      configRef[0] = config;
      createEditorPanel(widgetRef, configRef);
    }

    if (CFG.configId) {
      fetch(CFG.apiBase + '/api/quotation/config?domain=' + encodeURIComponent(CFG.domain) + '&configId=' + encodeURIComponent(CFG.configId))
        .then(function (r) { return r.json(); })
        .then(function (d) { launch(d.config || DEFAULT_CONFIG); })
        .catch(function () { launch(DEFAULT_CONFIG); });
    } else {
      launch(DEFAULT_CONFIG);
    }

    checkLicense();
    return true;
  }

  function checkLicense() {
    fetch(CFG.apiBase + '/api/licenses/check?domain=' + encodeURIComponent(CFG.domain) + '&plugin=quotation-builder')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.licensed) console.warn('[Anavo QB] Unlicensed copy'); })
      .catch(function () {});
  }

  function waitAndMount(n) {
    if (document.querySelector(CFG.target)) { mount(); return; }
    if (n < 50) setTimeout(function () { waitAndMount(n + 1); }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitAndMount(0); });
  } else {
    waitAndMount(0);
  }

  window.AnavoPluginState = window.AnavoPluginState || { plugins: {} };
  window.AnavoPluginState.plugins['QuotationBuilder'] = { version: '2.0.0', config: CFG };

})();
