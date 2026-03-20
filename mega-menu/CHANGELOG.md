# Changelog — Mega Menu

## [1.0.0] - 2026-03-19

### ✨ Added
- Section stealing from `sectionId`, `sectionIndex`, or `divId`
- Trigger injection with `auto`-match, `first`, `last`, `index:N` positioning
- 5 animation modes: `slideDown`, `fadeIn`, `scaleY`, `clipReveal`, `none`
- 4 presets: `default`, `minimal`, `dark`, `glassmorphism`
- Hover and click trigger modes with configurable delays (`hoverDelay`, `hoverOutDelay`)
- Overlay with optional backdrop blur
- Scroll lock when overlay is active
- Sticky-aware positioning (repositions panel below header on scroll)
- Close button, Escape key, and outside-click to close
- Mobile auto-disable below `mobileBreakpoint` (default 768px)
- Full appearance control (`bgColor`, `fontColor`, `overlayColor`, `paddingX`, `paddingY`, `borderBottom`, `borderColor`, `shadow`, `blur`, `zIndex`, `maxWidth`)
- Accessibility: `aria-expanded`, `aria-haspopup`, `aria-hidden`, `role="region"`, focus return on close, `prefers-reduced-motion` support
- Squarespace editor detection — skips initialization in edit mode
- Licensing via `_shared/licensing.min.js` (non-blocking, 1.5s delay)
- Squarespace 7.1 primary; best-effort 7.0
