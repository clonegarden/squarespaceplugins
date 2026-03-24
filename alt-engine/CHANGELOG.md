# Alt Engine — Changelog

## [1.0.0] — 2026-03-24

### Added
- Initial release as Anavo Plugin (ported from OnassisAltEngine IIFE)
- Auto-fetch client config from api.anavo.tech/api/seo/config
- src_fragment → suggested_alt lookup map from client_images
- GENERIC_PATTERNS list (14 patterns: DSC_, IMG_, screenshots, extensions, etc.)
- _isGoodAlt threshold: ≥20 chars and non-generic
- Fallback alt: readable Squarespace CDN filename + biz name + page keyword
- MutationObserver: childList + subtree + attributeFilter [src, data-src, alt]
- Async licensing at +1.5s via _shared/licensing.min.js (daily cache buster)
- URL parameter config: apiBase, debug
- Silent fail at every level — never throws to the page
