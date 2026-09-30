# Changelog — Burger Menu Pro

## [1.0.0] - 2026-09-30

### ✨ Added

- Forced native burger menu at all widths or below `breakpoint` (matchMedia, no resize polling)
- Open animations: `slideDown`, `fade`, `curtain`, `slideRight`, `circle` (origin = burger centre, radius = farthest corner), with `duration` and `easing`
- Staggered nav items (`stagger`, `itemDelay`); sub-folder navigation left native
- `moveSocials` / `moveCta`: null-guarded, reversible move of `.header-menu-actions` and `.header-menu-cta` into the nav column
- Style params: `menuBg`, `menuTextColor`, `itemFontSize`, `itemSpacing`, `align`, `logoCenter` (true row-centre, measured)
- Escape to close, focus management, `prefers-reduced-motion`, editor-mode neutrality, `destroy()` teardown
- No FOUC trap: header is never hidden waiting for JS; a 240ms CSS reveal that always ends visible
- Licensing: async, non-blocking via `_shared/licensing.min.js`

[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/burger-menu-pro-v1.0.0
