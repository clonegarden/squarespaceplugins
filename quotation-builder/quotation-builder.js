/**
 * Anavo Quotation Builder v2.1.1
 * Interactive step-by-step quotation calculator for booking-style services.
 * Step types: single choice, multiple choice, quantity × price.
 * Floating editor panel in Squarespace edit mode — saves config to Anavo API.
 * Submit → saves to DB + triggers email notification + shows summary with CTA.
 *
 * Usage (Code Block):
 *   <div id="anavo-quotation"></div>
 *   <script src="...quotation-builder.min.js?preset=makeup-artist&accentColor=%231a3a5c"></script>
 *
 * Script URL parameters:
 *   target        CSS selector for container   default: #anavo-quotation
 *   configId      Saved config ID from editor  default: (uses a built-in preset)
 *   preset        Built-in profession template default: photographer
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
    preset:      params.get('preset')      || 'photographer',
    apiBase:     params.get('api')         || 'https://api.anavo.tech',
    domain:      params.get('domain')      || window.location.hostname,
    accentColor: params.get('accentColor') || '#1a3a5c',
    currency:    params.get('currency')    || '$',
    ctaText:     params.get('ctaText')     || 'Book Now',
    ctaUrl:      params.get('ctaUrl')      || '/contact',
  };

  // How many steps a config may hold. Fewer than two is not a wizard; more
  // than eight and completion rates fall off a cliff.
  var MIN_STEPS = 2;
  var MAX_STEPS = 8;

  // ─── Editable copy ────────────────────────────────────────────────────────
  // Everything a prospect reads as the owner's own words. UI furniture
  // (field labels, navigation, progress numbering) stays fixed so support
  // stays predictable — see docs/quotation-builder-customization.md §5.

  var DEFAULT_COPY = {
    contactTitle:    'Almost there!',
    contactSub:      'Where should we send your quote?',
    summaryTitle:    'Your Quote is Ready!',
    summarySub:      'Hi {name}, here\'s your personalized estimate.',
    disclaimer:      'Final price confirmed at booking'
  };

  // ─── Profession presets ───────────────────────────────────────────────────
  // Scope rule: professions that quote *like* a photographer — a booked
  // engagement priced by type, duration/headcount and add-ons. Anything priced
  // per square metre, per subscription or per legal case is deliberately out.
  //
  // Prices are starter placeholders. The editor panel expects the owner to
  // overwrite them, and that is the first thing it shows.

  /** Single choice step. */
  function S(title, description, required, options) {
    return { title: title, description: description, type: 'select', required: required, options: options };
  }
  /** Multiple choice step — never required, it is always an "extras" step. */
  function M(title, description, options) {
    return { title: title, description: description, type: 'multiselect', required: false, options: options };
  }
  /** Quantity × price step. */
  function Q(title, description, required, unitLabel, unitPrice, min, max, def) {
    return {
      title: title, description: description, type: 'quantity', required: required,
      unitLabel: unitLabel, unitPrice: unitPrice, min: min, max: max, default: def
    };
  }

  var PRESETS = {
    photographer: {
      label: 'Photographer',
      name: 'Photography Quote',
      steps: [
        S('Event Type', 'What kind of event are you planning?', true, [
          ['Wedding', 2500], ['Engagement Session', 800], ['Corporate Event', 1200],
          ['Portrait Session', 400], ['Quinceañera / Sweet 16', 1800]
        ]),
        Q('Coverage Duration', 'How many hours of coverage do you need?', true, 'hour', 200, 1, 16, 4),
        Q('Photographers', 'How many photographers should we bring?', true, 'photographer', 350, 1, 4, 1),
        S('Videography', 'Would you like video coverage?', false, [
          ['No video', 0], ['Highlight Reel', 900], ['Full Film + Reel', 1800], ['Cinematic Package', 2800]
        ]),
        M('Add-ons', 'Enhance your package with extras.', [
          ['Drone Coverage', 450], ['Same-day Slideshow', 600], ['Premium Photo Album', 750],
          ['Canvas / Wall Art', 300], ['Live Photo Booth', 500]
        ]),
        S('Delivery Timeline', 'When do you need your files delivered?', true, [
          ['Standard (6–8 weeks)', 0], ['Rush (2–3 weeks)', 350], ['Express (5–7 days)', 700]
        ])
      ]
    },

    videographer: {
      label: 'Videographer',
      name: 'Video Production Quote',
      steps: [
        S('Project Type', 'What are we filming?', true, [
          ['Wedding Film', 3200], ['Brand / Commercial', 2800], ['Event Coverage', 1500],
          ['Music Video', 2200], ['Documentary Short', 2600]
        ]),
        Q('Shoot Days', 'How many days of filming?', true, 'day', 900, 1, 10, 1),
        Q('Crew Size', 'How many people on set?', true, 'crew member', 400, 1, 8, 2),
        S('Deliverables', 'What should the final cut look like?', true, [
          ['Highlight (2–3 min)', 0], ['Feature Cut (8–12 min)', 1200],
          ['Full Film + Highlight', 2400], ['Multi-cam Full Event', 3000]
        ]),
        M('Add-ons', 'Optional extras.', [
          ['Drone / Aerial', 550], ['Second Camera Angle', 700], ['Licensed Music Track', 250],
          ['Raw Footage Delivery', 400], ['Same-week Teaser', 600]
        ]),
        S('Turnaround', 'When do you need the final cut?', true, [
          ['Standard (8–10 weeks)', 0], ['Priority (4 weeks)', 800], ['Rush (10 days)', 1600]
        ])
      ]
    },

    'wedding-planner': {
      label: 'Wedding Planner',
      name: 'Wedding Planning Quote',
      steps: [
        S('Service Level', 'How much of the planning should we handle?', true, [
          ['Day-of Coordination', 1800], ['Partial Planning', 4500],
          ['Full Planning', 9000], ['Luxury / Destination', 15000]
        ]),
        Q('Guest Count', 'How many guests are you expecting?', true, 'guest', 12, 10, 400, 100),
        Q('Planning Months', 'How long until the wedding?', true, 'month', 250, 1, 24, 12),
        S('Extra Events', 'Anything beyond the wedding day?', false, [
          ['Wedding day only', 0], ['+ Rehearsal Dinner', 900],
          ['+ Welcome Party', 1400], ['Full Weekend (3 events)', 2800]
        ]),
        M('Add-ons', 'Optional services.', [
          ['Vendor Sourcing', 1200], ['Design & Styling Concept', 1600], ['RSVP Management', 700],
          ['Honeymoon Planning', 900], ['On-site Assistant', 600]
        ])
      ]
    },

    'makeup-artist': {
      label: 'Makeup Artist',
      name: 'Makeup Quote',
      steps: [
        S('Occasion', 'What is the makeup for?', true, [
          ['Bridal', 350], ['Bridal Party', 180], ['Photoshoot / Editorial', 250],
          ['Evening Event', 150], ['Special Effects', 400]
        ]),
        Q('People', 'How many people need makeup?', true, 'person', 120, 1, 15, 1),
        S('Trial Session', 'Would you like a trial beforehand?', false, [
          ['No trial', 0], ['One trial', 150], ['Two trials', 280]
        ]),
        S('Travel', 'Where are we working?', true, [
          ['At my studio', 0], ['On location — local', 80], ['On location — over 50km', 200]
        ]),
        M('Add-ons', 'Optional extras.', [
          ['Airbrush Finish', 90], ['Lashes', 45], ['Touch-up Kit', 60],
          ['All-day Standby', 350], ['Early Start (before 6am)', 120]
        ])
      ]
    },

    'hair-stylist': {
      label: 'Hair Stylist',
      name: 'Hair Styling Quote',
      steps: [
        S('Occasion', 'What is the styling for?', true, [
          ['Bridal', 300], ['Bridal Party', 150], ['Photoshoot / Editorial', 220],
          ['Evening Event', 130], ['Costume / Period Styling', 350]
        ]),
        Q('People', 'How many people need styling?', true, 'person', 100, 1, 15, 1),
        S('Trial', 'Would you like a trial beforehand?', false, [
          ['No trial', 0], ['One trial', 130], ['Two trials', 240]
        ]),
        S('Travel', 'Where are we working?', true, [
          ['At my salon', 0], ['On location — local', 80], ['On location — over 50km', 200]
        ]),
        M('Add-ons', 'Optional extras.', [
          ['Hair Extensions Fitting', 150], ['Veil / Accessory Placement', 60],
          ['All-day Standby', 320], ['Early Start (before 6am)', 120], ['Second Look Change', 110]
        ])
      ]
    },

    'dj-live-music': {
      label: 'DJ / Live Music',
      name: 'Music Quote',
      steps: [
        S('Event Type', 'What are we playing?', true, [
          ['Wedding Reception', 1400], ['Corporate Party', 1100], ['Birthday / Private', 800],
          ['Club Night', 900], ['Festival Set', 1600]
        ]),
        Q('Performance Hours', 'How long should we play?', true, 'hour', 150, 1, 10, 4),
        S('Setup Size', 'How big is the room?', true, [
          ['Small (under 50 guests)', 0], ['Medium (50–150)', 350],
          ['Large (150–300)', 750], ['Very Large (300+)', 1400]
        ]),
        M('Extras', 'Production add-ons.', [
          ['Dance Floor Lighting', 400], ['Uplighting Package', 350], ['Wireless Mic for Speeches', 120],
          ['Fog / Haze Machine', 180], ['Live Saxophone', 600]
        ]),
        S('Travel', 'Where is the venue?', true, [
          ['Local (under 30km)', 0], ['Regional (30–100km)', 180], ['Long distance (100km+)', 450]
        ])
      ]
    },

    'event-venue': {
      label: 'Event Venue',
      name: 'Venue Hire Quote',
      steps: [
        S('Event Type', 'What are you hosting?', true, [
          ['Wedding', 4500], ['Corporate Event', 3200], ['Private Party', 2200],
          ['Conference', 3800], ['Photoshoot / Film', 1200]
        ]),
        Q('Guest Count', 'How many guests?', true, 'guest', 35, 10, 400, 100),
        Q('Hours of Hire', 'How long do you need the space?', true, 'hour', 250, 2, 14, 6),
        S('Catering', 'How would you like food handled?', true, [
          ['Venue only — no catering', 0], ['Canapés & Drinks', 1800],
          ['Seated Dinner', 4200], ['Full Day Catering', 6500]
        ]),
        M('Extras', 'Optional additions.', [
          ['AV & Projection', 700], ['Dedicated Event Manager', 900], ['Extended Bar Licence', 600],
          ['Ceremony Setup', 850], ['Overnight Suite', 400]
        ])
      ]
    },

    caterer: {
      label: 'Caterer',
      name: 'Catering Quote',
      steps: [
        S('Event Type', 'What is the occasion?', true, [
          ['Wedding', 1500], ['Corporate Lunch', 600], ['Private Dinner', 500],
          ['Cocktail Reception', 900], ['Festival / Large Scale', 2500]
        ]),
        Q('Guests', 'How many people are we feeding?', true, 'guest', 55, 10, 500, 80),
        S('Menu Tier', 'What level of menu?', true, [
          ['Classic', 0], ['Premium', 1200], ['Signature Tasting', 2800], ['Fully Bespoke', 4500]
        ]),
        S('Service Style', 'How should it be served?', true, [
          ['Buffet', 0], ['Family Style', 600], ['Plated Service', 1400], ['Food Stations', 1100]
        ]),
        M('Add-ons', 'Optional extras.', [
          ['Bar Service', 1200], ['Dessert Table', 650], ['Late-night Snacks', 550],
          ['Dietary Menus', 400], ['Waiting Staff', 900]
        ])
      ]
    },

    florist: {
      label: 'Florist',
      name: 'Floral Quote',
      steps: [
        S('Event Type', 'What is the occasion?', true, [
          ['Wedding', 1800], ['Corporate Event', 900], ['Private Party', 600],
          ['Funeral / Memorial', 700], ['Installation / Window', 1400]
        ]),
        Q('Arrangements', 'How many arrangements do you need?', true, 'arrangement', 95, 1, 60, 10),
        S('Flower Tier', 'What level of blooms?', true, [
          ['Seasonal', 0], ['Premium', 700], ['Luxury / Imported', 1800]
        ]),
        S('Setup', 'Who installs on the day?', true, [
          ['Collection only', 0], ['Delivery & drop-off', 180], ['Full on-site styling', 850]
        ]),
        M('Add-ons', 'Optional extras.', [
          ['Bridal Bouquet', 280], ['Buttonholes (set of 6)', 150], ['Arch / Installation', 1200],
          ['Table Runners', 420], ['Same-day Teardown', 350]
        ])
      ]
    },

    'private-chef': {
      label: 'Private Chef',
      name: 'Private Chef Quote',
      steps: [
        S('Occasion', 'What are we cooking for?', true, [
          ['Dinner Party', 600], ['Anniversary / Romantic', 500], ['Family Celebration', 750],
          ['Corporate Entertaining', 1100], ['Holiday / Villa Stay', 1800]
        ]),
        Q('Guests', 'How many people at the table?', true, 'guest', 85, 2, 30, 8),
        S('Courses', 'How many courses?', true, [
          ['Three courses', 0], ['Four courses', 300], ['Five courses', 650], ['Tasting menu (7+)', 1300]
        ]),
        S('Service Style', 'How formal?', true, [
          ['Relaxed / family style', 0], ['Plated service', 400], ['Fine dining with front of house', 1000]
        ]),
        M('Add-ons', 'Optional extras.', [
          ['Wine Pairing', 750], ['Canapés on Arrival', 380], ['Dessert Course Upgrade', 260],
          ['Kitchen Assistant', 450], ['Full Cleanup', 200]
        ])
      ]
    },

    'tattoo-artist': {
      label: 'Tattoo Artist',
      name: 'Tattoo Quote',
      steps: [
        S('Placement', 'Where on the body?', true, [
          ['Forearm', 250], ['Upper Arm / Shoulder', 350], ['Back', 600],
          ['Chest / Ribs', 550], ['Leg', 400], ['Hand / Neck', 450]
        ]),
        S('Size', 'How large is the piece?', true, [
          ['Small (under 5cm)', 0], ['Medium (5–15cm)', 250],
          ['Large (15–30cm)', 700], ['Full panel (30cm+)', 1500]
        ]),
        S('Detail Level', 'How intricate is the design?', true, [
          ['Linework / Minimal', 0], ['Shaded Blackwork', 300],
          ['Full Colour', 600], ['Photorealism', 1200]
        ]),
        Q('Sessions', 'How many sessions do you expect?', true, 'session', 400, 1, 12, 1),
        M('Add-ons', 'Optional extras.', [
          ['Custom Design Consultation', 150], ['Cover-up Work', 350],
          ['Touch-up Session', 180], ['Numbing Cream', 40], ['Aftercare Kit', 35]
        ])
      ]
    },

    'personal-trainer': {
      label: 'Personal Trainer',
      name: 'Training Quote',
      steps: [
        S('Goal', 'What are you training for?', true, [
          ['General Fitness', 0], ['Weight Loss', 80], ['Strength / Muscle', 120],
          ['Event Preparation', 200], ['Rehabilitation', 250]
        ]),
        Q('Sessions per Week', 'How often will we train?', true, 'session', 220, 1, 7, 2),
        Q('Programme Length', 'How many months?', true, 'month', 90, 1, 12, 3),
        // Prices only ever add. The API clamps a negative price to zero, so a
        // discount-shaped option would quietly disagree with the emailed total.
        S('Format', 'How would you like to train?', true, [
          ['Online coaching', 0], ['Small group (2–4)', 200], ['Hybrid', 350], ['In-person 1:1', 500]
        ]),
        M('Add-ons', 'Optional extras.', [
          ['Nutrition Plan', 300], ['Weekly Check-ins', 200], ['Body Composition Scans', 150],
          ['Custom App Programming', 250], ['Recovery / Mobility Sessions', 280]
        ])
      ]
    },

    custom: {
      label: 'Start from scratch',
      name: 'My Quote',
      steps: [
        S('First Question', 'Replace this with your own question.', true, [
          ['First option', 100], ['Second option', 200]
        ]),
        S('Second Question', 'Every quote needs at least two steps.', false, [
          ['No thanks', 0], ['Yes please', 150]
        ])
      ]
    }
  };

  var PRESET_IDS = Object.keys(PRESETS);

  /**
   * Turn a preset into a live config. Ids are assigned here rather than being
   * written out in each preset, which keeps the templates readable and makes
   * every id shape identical to one the editor would produce.
   */
  function buildPreset(presetId) {
    // Normalise before use: an unknown id from the URL or a stale saved config
    // must not survive into `config.preset`, or it leaks back out through the
    // generated script tag and leaves the editor dropdown with no selection.
    var id = Object.prototype.hasOwnProperty.call(PRESETS, presetId) ? presetId : 'photographer';
    var preset = PRESETS[id];
    var steps = preset.steps.map(function (step, si) {
      var out = { id: 's' + (si + 1) };
      for (var k in step) { if (Object.prototype.hasOwnProperty.call(step, k)) out[k] = step[k]; }
      if (out.options) {
        out.options = step.options.map(function (opt, oi) {
          return { id: 'o' + (oi + 1), label: opt[0], price: opt[1] };
        });
      }
      return out;
    });

    return {
      preset:      id,
      name:        preset.name,
      currency:    CFG.currency,
      accentColor: CFG.accentColor,
      ctaText:     CFG.ctaText,
      ctaUrl:      CFG.ctaUrl,
      notifyEmail: '',
      emailLead:   false,
      copy:        Object.assign({}, DEFAULT_COPY, preset.copy || {}),
      steps:       steps
    };
  }

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
      '.anavo-qb-script-box.qb-stale{border-color:#f59e0b !important;color:#fde68a !important}',
      '.anavo-qb-stale-warn{font-size:11px !important;line-height:1.45 !important;color:#fde68a !important;background:rgba(245,158,11,.12) !important;border-left:2px solid #f59e0b !important;padding:7px 9px !important;border-radius:0 4px 4px 0 !important;margin-bottom:7px !important}',
      '.anavo-qb-copy-btn.qb-stale{background:#f59e0b !important;border-color:#f59e0b !important;color:#1c1917 !important;font-weight:600 !important}',
      '.anavo-qb-copy-btn{width:100% !important;padding:7px !important;background:rgba(255,255,255,.07) !important;border:1px solid rgba(255,255,255,.14) !important;color:#e2e8f0 !important;border-radius:4px !important;font-size:11px !important;cursor:pointer !important}',
      '.anavo-qb-ed-footer{padding:12px 16px !important;border-top:1px solid rgba(255,255,255,.09) !important;display:flex !important;gap:8px !important;flex-shrink:0 !important}',
      '.anavo-qb-save{flex:1 !important;padding:9px !important;background:' + accent + ' !important;color:#fff !important;border:none !important;border-radius:6px !important;font-size:13px !important;font-weight:700 !important;cursor:pointer !important;transition:filter .18s !important}',
      '.anavo-qb-save:hover:not(:disabled){filter:brightness(1.12) !important}',
      '.anavo-qb-save:disabled{opacity:.5 !important;cursor:default !important}',
      '.anavo-qb-mini{position:fixed !important;bottom:20px !important;right:20px !important;background:rgba(13,20,38,.92) !important;color:#e2e8f0 !important;border:1px solid rgba(255,255,255,.15) !important;border-radius:8px !important;padding:8px 14px !important;font-size:12px !important;font-weight:700 !important;cursor:pointer !important;z-index:99999 !important;display:none !important}',
      '.anavo-qb-req-row{display:flex !important;align-items:center !important;gap:6px !important;font-size:12px !important;color:#94a3b8 !important;margin-bottom:10px !important;cursor:pointer !important}',

      // Submit failure state
      '.anavo-qb-error{background:#fef2f2 !important;border:1px solid #fecaca !important;color:#b91c1c !important;border-radius:8px !important;padding:11px 14px !important;font-size:13px !important;margin:0 0 16px !important;line-height:1.45 !important}',

      // Editor: preset picker and upsell
      '.anavo-qb-ed-note{font-size:11px !important;color:#64748b !important;margin-top:5px !important;line-height:1.45 !important}',
      '.anavo-qb-upsell{background:rgba(255,255,255,.05) !important;border:1px solid rgba(255,255,255,.12) !important;border-radius:8px !important;padding:12px !important;margin-top:4px !important}',
      '.anavo-qb-upsell-hd{font-size:12px !important;font-weight:700 !important;color:#e2e8f0 !important;margin-bottom:5px !important}',
      '.anavo-qb-upsell-bd{font-size:11px !important;color:#94a3b8 !important;line-height:1.5 !important;margin-bottom:9px !important}',
      '.anavo-qb-upsell-cta{display:block !important;text-align:center !important;padding:8px !important;background:rgba(255,255,255,.09) !important;border:1px solid rgba(255,255,255,.16) !important;border-radius:6px !important;color:#e2e8f0 !important;font-size:11px !important;font-weight:700 !important;text-decoration:none !important}',
      '.anavo-qb-upsell-cta:hover{background:rgba(255,255,255,.14) !important}',
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
    // The API withholds email for submissions filled faster than a person can
    // fill them. Timed from first paint rather than from page load, so a
    // visitor who scrolls for a while is not counted as having "started".
    this.startedAt = Date.now();
    this.hp = '';              // honeypot — a real person never fills this
    this._render();
  }

  Widget.prototype._copy = function (key) {
    var copy = this.config.copy || {};
    return copy[key] != null && copy[key] !== '' ? copy[key] : DEFAULT_COPY[key];
  };

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
      '<div class="anavo-qb-step-title">' + esc(this._copy('contactTitle')) + '</div>' +
      '<div class="anavo-qb-step-desc">' + esc(this._copy('contactSub')) + '</div>';

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

    // Honeypot: off-screen rather than display:none, since some bots skip
    // hidden fields. Real people never see it; scripted fills always take it.
    var hp = document.createElement('div');
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
    var hpInp = document.createElement('input');
    hpInp.type = 'text'; hpInp.tabIndex = -1; hpInp.autocomplete = 'off';
    hpInp.name = 'company_website';
    hpInp.addEventListener('input', function () { self.hp = this.value; });
    hp.appendChild(hpInp);
    fields.appendChild(hp);

    parent.appendChild(fields);

    var err = document.createElement('div');
    err.className = 'anavo-qb-error';
    err.style.display = 'none';
    parent.appendChild(err);

    var nav = document.createElement('div');
    nav.className = 'anavo-qb-nav';

    var back = document.createElement('button');
    back.className = 'anavo-qb-btn anavo-qb-btn-back'; back.textContent = '← Back';
    back.addEventListener('click', function () { self.step--; self._render(); });

    var submit = document.createElement('button');
    submit.className = 'anavo-qb-btn anavo-qb-btn-primary'; submit.textContent = 'Get My Quote →';
    submit.addEventListener('click', function () {
      var name = self.contact.name.trim();
      var email = self.contact.email.trim();

      function fail(message) {
        err.textContent = message;
        err.style.display = 'block';
        submit.textContent = 'Get My Quote →';
        submit.disabled = false;
        back.disabled = false;
      }

      if (!name || !email) return fail('Please enter your name and email.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('That email address does not look right.');

      err.style.display = 'none';
      submit.textContent = 'Sending…'; submit.disabled = true;
      // Navigating back mid-request would detach these nodes, and `fail` would
      // then write the error into a element no longer in the document -- the
      // lead would see nothing at all.
      back.disabled = true;

      // The old build fired the request and showed the summary regardless, so
      // a failed submission looked identical to a successful one and the lead
      // was lost without anyone knowing. Wait for the result instead.
      self._submit(function (ok, message) {
        if (!ok) return fail(message || 'We could not send your quote. Please try again.');
        self.done = true;
        self._render();
      });
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
    note.textContent = this._copy('disclaimer');
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
      currency:   this.config.currency || CFG.currency,
      // Abuse signals the API needs to decide whether to email on this
      // domain's behalf. Without them a real lead is stored but the owner is
      // never notified, which is indistinguishable from the plugin being broken.
      hp:         this.hp,
      formMs:     Date.now() - this.startedAt
    };

    var settled = false;
    // One call, exactly once. Without this guard an exception thrown while
    // rendering the summary would propagate into the chain's failure handler
    // and report "we could not reach the server" for a submission the server
    // actually accepted.
    function finish(ok, message) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      onDone(ok, message);
    }

    // AbortController is absent on the older browsers this plugin still has to
    // run on, so it is a progressive enhancement rather than a requirement.
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
    if (ctrl) opts.signal = ctrl.signal;

    var timer = setTimeout(function () {
      if (settled) return;
      if (ctrl) ctrl.abort();
      // Deliberately not inviting a retry: without the abort landing, the
      // request may already have been stored and emailed, and a second attempt
      // would duplicate the lead and the owner's notification.
      finish(false, ctrl
        ? 'The request timed out. Please try again.'
        : 'This is taking longer than expected. Your request may already have gone through — please check your email before trying again.');
    }, 15000);

    fetch(CFG.apiBase + '/api/quotation/submit', opts)
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          return { ok: r.ok, data: d };
        });
      })
      .then(
        function (res) {
          if (res.ok && res.data && res.data.success) return finish(true);
          finish(false, (res.data && res.data.error) || 'We could not send your quote. Please try again.');
        },
        function () {
          finish(false, 'We could not reach the server. Please check your connection and try again.');
        }
      );
  };

  Widget.prototype._renderSummary = function () {
    var self = this;
    var config = this.config;
    var total = this._getTotal();
    var wrap = document.createElement('div');
    wrap.className = 'anavo-qb-summary';

    wrap.innerHTML =
      '<div class="anavo-qb-sum-title">' + esc(this._copy('summaryTitle')) + '</div>' +
      '<div class="anavo-qb-sum-sub">' +
        esc(this._copy('summarySub').replace(/\{name\}/g, this.contact.name)) +
      '</div>';

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

    // A saved config only reaches the live page once the owner replaces the
    // script tag by hand. Until then the page keeps serving whatever it loaded,
    // and nothing about a successful save says so.
    var scriptTagStale = false;

    function buildScriptTag(cfg) {
      var base = 'https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/quotation-builder/quotation-builder.min.js';
      var q = '?configId=' + encodeURIComponent(cfg.id || 'default') +
        '&preset=' + encodeURIComponent(cfg.preset || 'photographer') +
        '&accentColor=' + encodeURIComponent(cfg.accentColor || '#1a3a5c') +
        '&ctaText=' + encodeURIComponent(cfg.ctaText || 'Book Now') +
        '&ctaUrl=' + encodeURIComponent(cfg.ctaUrl || '/contact');
      return '<div id="anavo-quotation"></div>\n<script src="' + base + q + '"><\/script>';
    }

    function renderBody() {
      body.innerHTML = '';
      var cfg = configRef[0];

      // Preset picker — replaces every step, so it asks first.
      var preSec = document.createElement('div'); preSec.className = 'anavo-qb-ed-section';
      preSec.innerHTML = '<span class="anavo-qb-ed-lbl">Profession Template</span>';
      var preSel = document.createElement('select'); preSel.className = 'anavo-qb-type-sel';
      preSel.style.marginBottom = '0';
      PRESET_IDS.forEach(function (id) {
        var o = document.createElement('option');
        o.value = id; o.textContent = PRESETS[id].label;
        o.selected = cfg.preset === id;
        preSel.appendChild(o);
      });
      preSel.addEventListener('change', function () {
        var chosen = this.value;
        if (!window.confirm('Switch to the ' + PRESETS[chosen].label + ' template?\n\nThis replaces all steps and prices. Anything you edited yourself — quote name, wording, colour, notification email and CTA — is kept.')) {
          this.value = cfg.preset;
          return;
        }
        var fresh = buildPreset(chosen);
        var prev  = buildPreset(cfg.preset);
        // What is being swapped is the trade's step list. Anything the owner
        // typed themselves survives; anything still sitting at the previous
        // template's default gives way to the new one. Blindly keeping the old
        // values would carry "Photography Quote" onto a caterer, and blindly
        // replacing them would silently destroy hand-written wording that is
        // not regenerated into anything the owner would recognise as new.
        if (cfg.name !== prev.name) fresh.name = cfg.name;
        Object.keys(DEFAULT_COPY).forEach(function (k) {
          if (cfg.copy && cfg.copy[k] && cfg.copy[k] !== prev.copy[k]) fresh.copy[k] = cfg.copy[k];
        });
        fresh.id          = cfg.id;
        fresh.currency    = cfg.currency;
        fresh.accentColor = cfg.accentColor;
        fresh.ctaText     = cfg.ctaText;
        fresh.ctaUrl      = cfg.ctaUrl;
        fresh.notifyEmail = cfg.notifyEmail;
        fresh.emailLead   = cfg.emailLead;
        configRef[0] = fresh;
        renderBody();
      });
      preSec.appendChild(preSel);
      var preNote = document.createElement('div'); preNote.className = 'anavo-qb-ed-note';
      preNote.textContent = 'Prices are starter values — replace them with yours.';
      preSec.appendChild(preNote);
      body.appendChild(preSec);

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

      // Lead copy is opt-in: the recipient comes from the form, so it is the
      // one message a stranger could aim anywhere. Off unless asked for.
      var leadRow = document.createElement('label'); leadRow.className = 'anavo-qb-req-row';
      leadRow.style.marginTop = '4px';
      var leadChk = document.createElement('input'); leadChk.type = 'checkbox';
      leadChk.checked = cfg.emailLead === true;
      leadChk.addEventListener('change', function () { cfg.emailLead = this.checked; });
      leadRow.appendChild(leadChk);
      leadRow.appendChild(document.createTextNode(' Email the client a copy of their quote'));
      settSec.appendChild(leadRow);
      body.appendChild(settSec);

      // Wording
      var copySec = document.createElement('div'); copySec.className = 'anavo-qb-ed-section';
      copySec.innerHTML = '<span class="anavo-qb-ed-lbl">Wording</span>';
      if (!cfg.copy) cfg.copy = Object.assign({}, DEFAULT_COPY);

      function copyField(label, key, hint) {
        var wrap = document.createElement('div'); wrap.style.marginBottom = '8px';
        var lbl = document.createElement('label'); lbl.className = 'anavo-qb-ed-lbl'; lbl.textContent = label;
        var inp = document.createElement('input'); inp.className = 'anavo-qb-ed-inp';
        inp.value = cfg.copy[key] || '';
        inp.placeholder = DEFAULT_COPY[key];
        inp.addEventListener('input', function () { cfg.copy[key] = this.value; });
        wrap.appendChild(lbl); wrap.appendChild(inp);
        if (hint) {
          var h = document.createElement('div'); h.className = 'anavo-qb-ed-note'; h.textContent = hint;
          wrap.appendChild(h);
        }
        return wrap;
      }

      copySec.appendChild(copyField('Contact Step Heading', 'contactTitle'));
      copySec.appendChild(copyField('Contact Step Subheading', 'contactSub'));
      copySec.appendChild(copyField('Summary Heading', 'summaryTitle'));
      copySec.appendChild(copyField('Summary Subheading', 'summarySub', '{name} is replaced with the client\u2019s name.'));
      copySec.appendChild(copyField('Price Disclaimer', 'disclaimer'));
      body.appendChild(copySec);

      // Steps
      var stepsSec = document.createElement('div'); stepsSec.className = 'anavo-qb-ed-section';
      stepsSec.innerHTML = '<span class="anavo-qb-ed-lbl">Steps (' + cfg.steps.length + ' of ' + MAX_STEPS + ')</span>';

      cfg.steps.forEach(function (step, si) {
        var item = document.createElement('div'); item.className = 'anavo-qb-step-item';

        var hd = document.createElement('div'); hd.className = 'anavo-qb-step-hd';
        hd.innerHTML = '<span style="color:#475569;font-size:11px;flex-shrink:0">' + (si + 1) + '</span>' +
          '<span class="anavo-qb-step-nm">' + esc(step.title || 'Untitled') + '</span>' +
          '<span style="color:#475569;font-size:10px;flex-shrink:0">' + step.type + '</span>';

        var rmStep = document.createElement('button'); rmStep.className = 'anavo-qb-rm'; rmStep.textContent = '×';
        if (cfg.steps.length <= MIN_STEPS) {
          rmStep.disabled = true;
          rmStep.style.opacity = '.35';
          rmStep.style.cursor = 'default';
          rmStep.title = 'A quote needs at least ' + MIN_STEPS + ' steps';
        } else {
          rmStep.addEventListener('click', function (e) { e.stopPropagation(); cfg.steps.splice(si, 1); renderBody(); });
        }
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
      addStep.style.marginTop = '8px';
      if (cfg.steps.length >= MAX_STEPS) {
        addStep.textContent = 'Maximum ' + MAX_STEPS + ' steps';
        addStep.disabled = true;
        addStep.style.opacity = '.4';
        addStep.style.cursor = 'default';
      } else {
        addStep.textContent = '+ Add Step';
        addStep.addEventListener('click', function () {
          cfg.steps.push({ id: uid(), title: 'New Step', type: 'select', required: false, options: [] });
          renderBody();
        });
      }
      stepsSec.appendChild(addStep);

      if (cfg.steps.length >= MAX_STEPS) {
        var clampNote = document.createElement('div'); clampNote.className = 'anavo-qb-ed-note';
        clampNote.textContent = 'Quotes convert best at ' + MIN_STEPS + '–' + MAX_STEPS + ' steps. Need more? See Full Customization below.';
        stepsSec.appendChild(clampNote);
      }
      body.appendChild(stepsSec);

      // Full Customization upsell — shown where the limits are felt.
      var upSec = document.createElement('div'); upSec.className = 'anavo-qb-ed-section';
      var up = document.createElement('div'); up.className = 'anavo-qb-upsell';
      up.innerHTML =
        '<div class="anavo-qb-upsell-hd">Need it further customized?</div>' +
        '<div class="anavo-qb-upsell-bd">Custom steps, conditional pricing, CRM integration — built by our devs for <strong>USD 500</strong> or <strong>1500 credits</strong>.</div>';
      var upCta = document.createElement('a'); upCta.className = 'anavo-qb-upsell-cta';
      upCta.href = 'https://anavo.tech/plugins/quotation-builder/full-customization?domain=' + encodeURIComponent(CFG.domain);
      upCta.target = '_blank'; upCta.rel = 'noopener';
      upCta.textContent = 'Create an Order →';
      up.appendChild(upCta);
      upSec.appendChild(up);
      body.appendChild(upSec);

      // Script tag
      var scrSec = document.createElement('div'); scrSec.className = 'anavo-qb-ed-section';
      scrSec.innerHTML = '<span class="anavo-qb-ed-lbl">Script Tag (copy to SS footer)</span>';

      if (scriptTagStale) {
        var warn = document.createElement('div'); warn.className = 'anavo-qb-stale-warn';
        warn.textContent = 'Saved \u2014 but this page is still loading the old script tag. ' +
          'Copy the one below and replace it in your Code Block, or your visitors keep seeing the previous version.';
        scrSec.appendChild(warn);
      }

      var scrBox = document.createElement('div'); scrBox.className = 'anavo-qb-script-box';
      if (scriptTagStale) scrBox.classList.add('qb-stale');
      scrBox.textContent = buildScriptTag(cfg);
      var cpBtn = document.createElement('button'); cpBtn.className = 'anavo-qb-copy-btn';
      if (scriptTagStale) cpBtn.classList.add('qb-stale');
      cpBtn.textContent = '📋 Copy Script Tag';

      // Clearing the warning in place rather than through renderBody, which
      // would replace the button the confirmation timer is holding on to.
      function copied() {
        scriptTagStale = false;
        if (warn) { warn.parentNode.removeChild(warn); warn = null; }
        scrBox.classList.remove('qb-stale');
        cpBtn.classList.remove('qb-stale');
        cpBtn.textContent = '✓ Copied!';
        setTimeout(function () { cpBtn.textContent = '📋 Copy Script Tag'; }, 2000);
      }

      cpBtn.addEventListener('click', function () {
        (navigator.clipboard ? navigator.clipboard.writeText(scrBox.textContent) : Promise.reject())
          .then(copied)
          .catch(function () {
            var r = document.createRange(); r.selectNode(scrBox);
            window.getSelection().removeAllRanges(); window.getSelection().addRange(r);
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (_) {}
            // Only drop the warning on a copy that actually happened. A manual
            // selection the owner never copies must stay flagged.
            if (ok) copied();
          });
      });
      scrSec.appendChild(scrBox); scrSec.appendChild(cpBtn);
      body.appendChild(scrSec);
    }

    renderBody();
    panel.appendChild(body);

    // Footer
    var footer = document.createElement('div'); footer.className = 'anavo-qb-ed-footer';
    footer.style.flexDirection = 'column';
    var saveMsg = document.createElement('div');
    saveMsg.className = 'anavo-qb-ed-note';
    saveMsg.style.cssText = 'display:none;margin:0 0 8px;color:#fca5a5';
    var saveBtn = document.createElement('button'); saveBtn.className = 'anavo-qb-save'; saveBtn.textContent = 'Save & Preview';
    saveBtn.addEventListener('click', function () {
      var cfg = configRef[0];
      saveMsg.style.display = 'none';
      saveBtn.textContent = 'Saving…'; saveBtn.disabled = true;

      function failed(message) {
        saveMsg.textContent = message;
        saveMsg.style.display = 'block';
        saveBtn.textContent = 'Save & Preview';
        saveBtn.disabled = false;
      }

      fetch(CFG.apiBase + '/api/quotation/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: CFG.domain, config: cfg })
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, data: d }; });
        })
        .then(
          function (res) {
            // Saving requires an active license for this domain. Say so plainly —
            // "Error — retry" sends the customer nowhere.
            if (!res.ok) return failed(res.data.error || 'Could not save. Please try again.');

            var d = res.data;
            cfg.id = d.id || cfg.id;
            configRef[0] = cfg;
            // The live page loads whatever configId was in its script tag. A new
            // or changed id means that tag is now out of date.
            if (cfg.id && cfg.id !== CFG.configId) scriptTagStale = true;
            injectStyles(cfg.accentColor);
            var el = document.querySelector(CFG.target);
            if (el) widgetRef[0] = new Widget(el, cfg);
            renderBody();
            saveBtn.textContent = '✓ Saved!'; saveBtn.disabled = false;
            setTimeout(function () { saveBtn.textContent = 'Save & Preview'; }, 2500);
          },
          // Second argument, not a trailing .catch: a throw from the re-render
          // above must not be reported as a network failure after the config
          // was already saved.
          function () { failed('Could not reach the server. Check your connection and try again.'); }
        );
    });
    footer.appendChild(saveMsg);
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
        .then(function (d) { launch(normalizeConfig(d.config) || buildPreset(CFG.preset)); })
        .catch(function () { launch(buildPreset(CFG.preset)); });
    } else {
      launch(buildPreset(CFG.preset));
    }

    checkLicense();
    return true;
  }

  /**
   * A saved config predates the copy fields and the preset marker, so fill in
   * whatever is missing rather than letting `undefined` reach the UI.
   */
  function normalizeConfig(config) {
    if (!config || !Array.isArray(config.steps) || !config.steps.length) return null;
    config.copy = Object.assign({}, DEFAULT_COPY, config.copy || {});
    if (!Object.prototype.hasOwnProperty.call(PRESETS, config.preset)) config.preset = 'custom';
    if (config.emailLead !== true) config.emailLead = false;
    return config;
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
  window.AnavoPluginState.plugins['QuotationBuilder'] = { version: '2.1.1', config: CFG };

})();
