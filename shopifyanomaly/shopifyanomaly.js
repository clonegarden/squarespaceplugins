/*!
 * Shopify Anomaly (Auto Fade On Scroll Squarespace-like)
 * Designed for Shopify themes (incl. Pipeline) with minimal assumptions.
 *
 * What it does:
 * - Injects CSS for fade/slide animation
 * - Automatically finds "content-like" elements inside <main> and reveals them on scroll
 * - Avoids common interactive/theme chrome areas (header, drawers, modals, etc.)
 * - Handles Shopify theme editor section reload events
 *
 * Controls (optional, set BEFORE this script loads):
 *   window.SFOS = {
 *     distancePx: 14,
 *     durationMs: 700,
 *     easing: "cubic-bezier(.2,.8,.2,1)",
 *     threshold: 0.12,
 *     rootMargin: "0px 0px -10% 0px",
 *     // If true, will animate more aggressively (not recommended)
 *     aggressive: false
 *   };
 */

(() => {
  const USER = (window.SFOS && typeof window.SFOS === "object") ? window.SFOS : {};

  const CONFIG = {
    styleTagId: "sfos-auto-fade-styles",
    baseClass: "sfos-fade",
    visibleClass: "sfos-visible",

    distancePx: Number.isFinite(USER.distancePx) ? USER.distancePx : 14,
    durationMs: Number.isFinite(USER.durationMs) ? USER.durationMs : 700,
    easing: typeof USER.easing === "string" ? USER.easing : "cubic-bezier(.2,.8,.2,1)",

    threshold: Number.isFinite(USER.threshold) ? USER.threshold : 0.12,
    rootMargin: typeof USER.rootMargin === "string" ? USER.rootMargin : "0px 0px -10% 0px",

    aggressive: !!USER.aggressive,
  };

  const EXCLUDE_CLOSEST_SELECTORS = [
    // Global theme chrome / nav
    "header", "[data-header]", ".site-header", ".header",
    "nav", ".nav", ".navigation",

    // Common overlays/drawers/modals
    "[role='dialog']", ".modal", ".drawer", ".slideout", ".popup", ".overlay",

    // Predictive search, cart, etc.
    ".predictive-search", ".search-drawer", ".cart-drawer", ".mini-cart",

    // Shopify admin/theme editor helpers
    ".shopify-section--header", ".shopify-section-group-header-group",
    "#shopify-section-header", "#shopify-section-announcement-bar",

    // Sliders (often should not animate each slide item automatically)
    ".flickity-enabled", ".swiper", ".splide", ".slick-slider"
  ];

  // Things we almost never want to animate as independent items
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "META", "LINK",
    "SVG", "PATH", "G", "DEFS", "CLIPPATH",
  ]);

  // "Content-like" targets
  const BASE_TARGET_SELECTORS = [
    // Section-ish wrappers / blocks
    "section",
    ".shopify-section",
    ".shopify-section > *", // often a section wrapper div

    // Typical content nodes
    "h1","h2","h3","h4","h5","h6",
    "p","li","blockquote",

    "img","picture","video",
    "figure","figcaption",

    "a.btn","button",".btn",
    "form",

    // Common card-ish patterns
    ".card",".product-card",".collection-item",".grid__item",
  ];

  // More aggressive: also target generic containers inside main content
  const AGGRESSIVE_SELECTORS = [
    "main div",
    "main article",
    "main .rte > *",
  ];

  function injectStylesOnce() {
    if (document.getElementById(CONFIG.styleTagId)) return;

    const css = `
/* Injected by Shopify Auto Fade On Scroll */
.${CONFIG.baseClass}{
  opacity:0;
  transform:translateY(var(--sfos-distance, ${CONFIG.distancePx}px));
  transition:
    opacity var(--sfos-duration, ${CONFIG.durationMs}ms) ${CONFIG.easing},
    transform var(--sfos-duration, ${CONFIG.durationMs}ms) ${CONFIG.easing};
  transition-delay: var(--sfos-delay, 0ms);
  will-change: opacity, transform;
}
.${CONFIG.baseClass}.${CONFIG.visibleClass}{
  opacity:1;
  transform:translateY(0);
}
@media (prefers-reduced-motion: reduce){
  .${CONFIG.baseClass}{
    opacity:1 !important;
    transform:none !important;
    transition:none !important;
  }
}
`;

    const style = document.createElement("style");
    style.id = CONFIG.styleTagId;
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function isExcluded(el) {
    if (!el || el.nodeType !== 1) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.closest(EXCLUDE_CLOSEST_SELECTORS.join(","))) return true;
    return false;
  }

  function isMeaningful(el) {
    // Avoid animating empty wrappers
    const rect = el.getBoundingClientRect();
    if ((rect.width * rect.height) < 600) return false; // tiny items (tweak if needed)

    // If element has no text and no media children, likely a wrapper
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    const hasText = text.length >= 8; // small threshold to catch short headings too
    const hasMedia = !!el.querySelector("img, picture, video, svg");
    const hasButton = !!el.querySelector("a, button, input, select, textarea");

    return hasText || hasMedia || hasButton;
  }

  function dedupeByContainment(elements) {
    // If we animate a parent container, don't animate lots of its children too.
    // Prefer the "outermost meaningful" nodes.
    const sorted = elements
      .filter(Boolean)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_CONTAINED_BY) ? -1 : 1);

    const result = [];
    for (const el of sorted) {
      if (result.some(r => r.contains(el))) continue;
      result.push(el);
    }
    return result;
  }

  function getMainRoot() {
    return document.querySelector("main") || document.body;
  }

  function collectTargets(root = document) {
    const main = root.querySelector?.("main") || getMainRoot();

    const selectors = CONFIG.aggressive
      ? BASE_TARGET_SELECTORS.concat(AGGRESSIVE_SELECTORS)
      : BASE_TARGET_SELECTORS;

    const candidates = Array.from(main.querySelectorAll(selectors.join(",")));

    const filtered = candidates
      .filter(el => !isExcluded(el))
      .filter(el => !el.classList.contains(CONFIG.baseClass))
      .filter(el => isMeaningful(el));

    return dedupeByContainment(filtered);
  }

  let io;

  function ensureObserver() {
    if (io) return io;

    if (!("IntersectionObserver" in window)) {
      io = null;
      return null;
    }

    io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          el.classList.add(CONFIG.visibleClass);
          obs.unobserve(el);
        }
      },
      { threshold: CONFIG.threshold, rootMargin: CONFIG.rootMargin }
    );

    return io;
  }

  function init(root = document) {
    injectStylesOnce();

    const targets = collectTargets(root);
    if (!targets.length) return;

    const observer = ensureObserver();

    for (const el of targets) {
      el.classList.add(CONFIG.baseClass);

      if (!observer) {
        el.classList.add(CONFIG.visibleClass);
        continue;
      }
      observer.observe(el);
    }

    // Optional simple stagger within each section: very light touch
    // (applies only if multiple targets share same closest section wrapper)
    const bySection = new Map();
    for (const el of targets) {
      const section = el.closest(".shopify-section, section") || getMainRoot();
      if (!bySection.has(section)) bySection.set(section, []);
      bySection.get(section).push(el);
    }
    for (const [, els] of bySection.entries()) {
      els.slice(0, 12).forEach((el, idx) => {
        // Only set if author didn't already set a delay
        if (!el.style.getPropertyValue("--sfos-delay")) {
          el.style.setProperty("--sfos-delay", `${idx * 80}ms`);
        }
      });
    }
  }

  // Init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(document), { once: true });
  } else {
    init(document);
  }

  // Shopify theme editor: when a section reloads, init that section
  document.addEventListener("shopify:section:load", (event) => {
    if (event?.target) init(event.target);
  });

  // Public hook (useful if Pipeline does AJAX navigation somewhere)
  window.ShopifyAutoFadeOnScrollInit = () => init(document);
})();
