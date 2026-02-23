# Changelog — Header Pro

## [1.0.0] - 2026-02-23

### ✨ Added

- **Visual skin:** centered container with `containerMaxWidth`, `paddingX`, `paddingY`, `itemGap`
- **Background modes:** `transparent`, `solid`, `blur` with `bgColor`, `bgOpacity`, `blurPx`
- **Border modes:** `none`, `bottom`, `top-bottom`, `all` with `borderColor`, `borderWidth`, `radius`
- **Typography controls:** `navFontSize`, `navLetterSpacing`, `navTransform`, `navHoverOpacity`
- **CTA button:** `ctaEnabled`, `ctaText`, `ctaUrl`, `ctaTarget`, `ctaStyle` (`underline`, `pill`, `outline`, `solid`), `ctaBg`, `ctaColor`, `ctaBorderColor`; visible on desktop, hidden on mobile
- **Sticky support:** `sticky`, `stickyTop`
- **Scroll shadow:** `scrollShadow`, `shadowStrength`
- **Auto-hide:** `autoHide`, `autoHideThreshold`, `revealOnTop`
- **Effects:**
  - `glassyBlueLine` — animated gradient glow line along the bottom edge
  - `glitchy` — hover-based CSS glitch effect on nav links
- **Dropdown modes:** `native` (no-op), `list`, `mega` with `dropdownTrigger` (`hover`/`click`)
- **Mega menu:** `dropdownColumns`, `dropdownGap`, `dropdownWidth`
- **Dropdown styling:** `dropdownBg`, `dropdownText`, `dropdownRadius`, `dropdownShadow`
- **Presets:** `default`, `minimal`, `glassy`, `tech`
- **Utilities:** `zIndex`, `injectFontSmoothing`, `debug`
- **Accessibility:** `prefers-reduced-motion` respected — all animations/transitions disabled
- **Licensing:** async, non-blocking via `_shared/licensing.min.js`
- **Compatibility:** Squarespace 7.1 primary; best-effort 7.0 via multi-selector header detection (`#header`, `header`, `.Header`, `[data-nc-group="header"]`, etc.)

---

[1.0.0]: https://github.com/clonegarden/squarespaceplugins/releases/tag/header-pro-v1.0.0
