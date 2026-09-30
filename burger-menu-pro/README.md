# Burger Menu Pro

Forces the native Squarespace 7.1 burger menu at every width (or below a breakpoint) and animates the native overlay menu when it opens. Nav items rise in with a stagger, and the menu's social icons and CTA button are moved into the nav column so they animate with it. One script replaces a "forced mobile menu" plugin plus a "menu animation" plugin.

It restyles and re-parents the native menu; it never replaces it. Folder navigation, the native scroll lock and the native burger icon keep working. The header is never hidden while waiting for JavaScript, so if the script fails to load, the site keeps its normal header.

## Install

Settings → Advanced → Code Injection → **Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/burger-menu-pro/burger-menu-pro.min.js"></script>
```

Burger only below 1024px, circle reveal from the burger:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/burger-menu-pro/burger-menu-pro.min.js?breakpoint=1024&animation=circle"></script>
```

## Parameters

| Param | Default | Values |
|---|---|---|
| `breakpoint` | `0` | px. `0` = burger at every width; otherwise burger (and all plugin behaviour) only below this width |
| `animation` | `slideDown` | `slideDown`, `fade`, `curtain` (clip-path reveal top→bottom), `slideRight` (enters from the left edge), `circle` (grows from the burger) |
| `duration` | `700` | ms, panel animation |
| `easing` | `cubic-bezier(.8,0,.55,.94)` | any CSS timing function |
| `stagger` | `60` | ms between nav items |
| `itemDelay` | `300` | ms before the first item starts |
| `moveSocials` | `true` | move `.header-menu-actions` into the nav column |
| `moveCta` | `true` | move `.header-menu-cta` into the nav column |
| `menuBg` | native | color (`%23111111` or `111111`) |
| `menuTextColor` | native | color |
| `itemFontSize` | native | `28` (px) or any CSS length |
| `itemSpacing` | native | vertical space between items, `12` (px) or any CSS length |
| `align` | `native` | `native`, `center`, `left`, `right` |
| `logoCenter` | `true` | centre the logo on the full header row |
| `debug` | `false` | verbose console logging |

## Behaviour

- `matchMedia` listener for the breakpoint (no resize polling). Crossing the breakpoint closes an open menu, moves socials/CTA back to their original place and restores the native desktop nav.
- Escape closes the menu (only if Squarespace did not already). Focus moves to the first menu link on open and back to the burger on close.
- `prefers-reduced-motion: reduce` makes every transition instant.
- Sub-folder panels keep their native slide; only root-level items are staggered.
- Squarespace editor: the plugin stays neutral.
- `window.AnavoPluginState.plugins.BurgerMenuPro.destroy()` undoes everything (classes, moved nodes, styles, listeners).
