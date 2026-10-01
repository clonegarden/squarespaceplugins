# Changelog — squarespaceplugins

This is the repository-level changelog. It summarizes recent releases across all plugins and links to individual plugin changelogs.

---

## Recent Releases

### 2026-09-30

**New — List Hover Reveal v1.0.0** (`list-hover-reveal/`). Hover-to-reveal rows for native List
sections: cursor-following image with rAF lerp and velocity tilt, four reveal styles, whole-row
links, keyboard focus, `prefers-reduced-motion`, and a touch mode whose image size is set by
`imgWidthMobile` / `imgHeightMobile` instead of being derived from the list height. Targeted by
`sectionId` or `target`. See [list-hover-reveal/README.md](list-hover-reveal/README.md).

---

### 2026-09-29

**New plugin — [Section Snap](section-snap/) v1.0.0.**

Scroll-snaps a configurable range of page sections — the hero and the one below it by
default — then releases the page so everything after it scrolls normally.

It exists because the hand-rolled version of this effect that circulates in Squarespace
forums relies on `.page-section:nth-of-type(n)`. That selector is scoped per parent, so the
footer's own first `.page-section` matches it too and becomes a snap target. Under
`scroll-snap-type: mandatory` there is then no snap point between the second section and the
footer, and any downward scroll teleports the visitor straight to the bottom of the page.

Section Snap resolves sections in JS and excludes anything inside `<header>` or `<footer>`,
so only the intended elements are ever tagged. It also handles the cases the snippet misses:

- Themes with a fixed header set `scroll-padding-top` on the scroll container, which insets
  the snapport. Arrival is detected against the real landing position, not a raw
  `getBoundingClientRect().top`.
- `scroll-snap-stop: always` is applied to destinations only. On the origin section it makes
  the browser refuse to release short wheel gestures.
- `scroll-behavior: smooth` is opt-in, because on `<html>` it retimes every anchor link on
  the site.
- Snap is skipped below `minWidth` (768px default), in the Squarespace editor, under
  `prefers-reduced-motion`, and on pages too short for the last target to reach the top —
  where `mandatory` would otherwise rubber-band the visitor back to the hero.

---

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
| Burger Menu Pro | v1.0.0 | [CHANGELOG](burger-menu-pro/CHANGELOG.md) |
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
