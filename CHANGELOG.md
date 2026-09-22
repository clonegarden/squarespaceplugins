# Changelog — squarespaceplugins

This is the repository-level changelog. It summarizes recent releases across all plugins and links to individual plugin changelogs.

---

## Recent Releases

### 2026-09-22

**Breaking — CSS namespace collisions fixed across 9 plugins.**

`magic-menu` and `marquee-menu` both injected `<style id="anavo-mm-styles">` and both styled
`.anavo-mm-item`. `marquee-menu` removes any existing `#anavo-mm-styles` before injecting its
own, so installing both plugins on one page deleted `magic-menu`'s entire stylesheet — the menu
rendered as unstyled markup. Script order is non-deterministic, so the failure was intermittent.
`mega-menu` squatted the same `anavo-mm-` namespace for its element ids.

Every abbreviated prefix that was shared by two or more plugins now uses the full plugin slug:

| Plugin | Old prefix | New prefix |
|--------|-----------|------------|
| [Magic Menu](magic-menu/) | `anavo-mm-` | `anavo-magic-menu-` |
| [Marquee Menu](marquee-menu/) | `anavo-mm-` | `anavo-marquee-menu-` |
| [Mega Menu](mega-menu/) | `anavo-mm-` | `anavo-mega-menu-` |
| [Tabbed Content](tabbed-content/) | `anavo-tc-` | `anavo-tabbed-content-` |
| [Testimonial Carousel Slider](testimonial-carousel-slider/) | `anavo-tc-` | `anavo-testimonial-carousel-` |
| [Logo Reaper](logo-reaper/) | `anavo-lr-` | `anavo-logo-reaper-` |
| [Letter Rain Transform](letter-rain-transform/) | `anavo-lr-` | `anavo-letter-rain-` |
| [Animated Logo Scroller](animated-logo-scroller/) | `anavo-als-`, `anavo-ls-` | `anavo-logo-scroller-` |
| [Loading Screen](loading-screen/) | `anavo-ls-` | `anavo-loading-screen-` |

All classes are generated at runtime by the plugin itself, so no user markup changes are
required. Sites with hand-written custom CSS targeting the old class names must update their
selectors.

Also in this release:

- `magic-menu` now removes its own stylesheet before re-injecting, matching every other plugin.
- `SEO/Threetwoone/seo-modal-dashboard.js` declared generic `--site-font`, `--site-text-color`,
  `--site-bg-color`, `--site-accent-color`, `--modal-font-size` and `--modal-contrast` on
  `:root`, where they could be overwritten by a Squarespace template or another plugin. All six
  are now prefixed `--onassis-`.
- Added `npm run check-collisions` (`scripts/check-collisions.js`) plus a GitHub Actions
  workflow, failing the build when two plugins use the same `anavo-*` identifier or assign the
  same DOM element id. Wired into `npm run validate`.
- Fixed `scripts/minify.js`, which used `replace('. js', '.min.js')` — the pattern never
  matched, so the script overwrote each plugin's **source file** with minified output instead of
  writing a `.min.js`. `scripts/build-all.js` had the same class of typo in its root path
  (`'. .'`) and ignore list (`'. git'`), and `package.json` in its lint ignore patterns.

### 2026-03-11

| Plugin | Version | Notes |
|--------|---------|-------|
| [Tabbed Content](tabbed-content/CHANGELOG.md) | **v1.1.0** | Visual redesign (file-organizer tabs), 11 new parameters |
| [Expanded Menu](expanded-menu/CHANGELOG.md) | v2.1.5 | CSS unit fixes, mobile bug fixes, `mobileWrap` parameter |

### 2026-03-01

| Plugin | Version | Notes |
|--------|---------|-------|
| [Floating Header](floating-header/CHANGELOG.md) | v1.0.8 | `fade` and `noTransition` parameters |
| [Simple Countdown Timer](simplecountdown/CHANGELOG.md) | v1.0.1 | Styling fixes |

### 2026-02-20

| Plugin | Version | Notes |
|--------|---------|-------|
| [Floating Header](floating-header/CHANGELOG.md) | v1.0.7 | `teleport` parameter |

### 2026-02-15

| Plugin | Version | Notes |
|--------|---------|-------|
| [Logo Reaper](logo-reaper/CHANGELOG.md) | v1.1.0 | Dead-logo pile animation, `height` + `speed` params |

### 2026-02-01

| Plugin | Version | Notes |
|--------|---------|-------|
| [Simple Countdown Timer](simplecountdown/CHANGELOG.md) | v1.0.0 | Initial release |

### 2026-01-20

| Plugin | Version | Notes |
|--------|---------|-------|
| [Logo Reaper](logo-reaper/CHANGELOG.md) | v1.0.0 | Initial release |
| [Quotation Builder](quotation-builder/README.md) | v1.0.0 | Initial release |

---

## All Plugins — Latest Versions

| Plugin | Latest | Changelog |
|--------|--------|-----------|
| Tabbed Content | v1.1.0 | [CHANGELOG](tabbed-content/CHANGELOG.md) |
| Header Pro | v1.x | [CHANGELOG](header-pro/CHANGELOG.md) |
| Testimonial Carousel Slider | v1.0.0 | [CHANGELOG](testimonial-carousel-slider/CHANGELOG.md) |
| Expanded Menu | v2.1.5 | [CHANGELOG](expanded-menu/CHANGELOG.md) |
| Floating Header | v1.0.8 | [CHANGELOG](floating-header/CHANGELOG.md) |
| Photo Grid | v1.3.0 | [CHANGELOG](photo-grid/CHANGELOG.md) |
| Logo Reaper | v1.2.0 | [CHANGELOG](logo-reaper/CHANGELOG.md) |
| Space Invaders | v2.x | [CHANGELOG](space-invaders/README.md) |
| ASCII Animation | v1.x | [CHANGELOG](ascii-animation/README.md) |
| Simple Countdown Timer | v1.0.1 | [CHANGELOG](simplecountdown/CHANGELOG.md) |
| Animated Header | v2.0.0 | [CHANGELOG](animated-header/README.md) |
| Quotation Builder | v1.0.0 | [CHANGELOG](quotation-builder/README.md) |
