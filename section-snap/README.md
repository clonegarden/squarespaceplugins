# 🧲 Section Snap

Scroll-snaps a range of page sections — by default the hero and the section below it — then
releases the page so everything after that scrolls normally.

The point is the release. A plain `scroll-snap-type: mandatory` on the page never lets go: once
the visitor is past the last snap point, the browser is still obliged to land on one, so any
downward scroll jumps them to whatever element happens to be next in the snap list. Section Snap
turns snapping off the moment the last target is reached, and turns it back on when the visitor
scrolls back to the top.

---

## 🚀 Installation

**Settings → Advanced → Code Injection → Footer**

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/section-snap/section-snap.min.js"></script>
```

Version-pinned (recommended for production):
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@1.0.0/section-snap/section-snap.min.js"></script>
```

---

## ✨ Quick-Start Examples

### Hero → section 2, then free scroll (default)
```html
<script src="...section-snap.min.js"></script>
```

### Snap the first three sections
```html
<script src="...section-snap.min.js?from=1&to=3"></script>
```

### Keep snapping for the whole page, never release
```html
<script src="...section-snap.min.js?release=false"></script>
```

### Let the visitor scroll past with a firm gesture instead of forcing the landing
```html
<script src="...section-snap.min.js?mode=proximity"></script>
```

### Don't force the hero to full viewport height
```html
<script src="...section-snap.min.js?fullHeight=false"></script>
```

### Enable on tablets too
```html
<script src="...section-snap.min.js?minWidth=600"></script>
```

### Debug the section list and landing positions in the console
```html
<script src="...section-snap.min.js?debug=true"></script>
```

---

## 📋 Full Parameter Reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| `from` | `1` | First section to snap (1-based). |
| `to` | `2` | Last section to snap (1-based). Snap is released after this one. |
| `mode` | `mandatory` | `mandatory` forces the landing; `proximity` only snaps when the visitor stops near a section. |
| `fullHeight` | `true` | Give the first snapped section a `100svh` minimum height. Set `false` if your hero is already sized. |
| `center` | `false` | Vertically center the content of the first snapped section. |
| `offset` | `0px` | Extra `scroll-margin-top` on each snapped section. Any CSS length. |
| `minWidth` | `768` | Minimum viewport width, in px, for snapping to run at all. |
| `release` | `true` | Turn snapping off once the last target is reached. |
| `reArm` | `true` | Turn snapping back on when the visitor returns to the top. |
| `smooth` | `false` | Set `scroll-behavior: smooth` on the scroll container. Off by default — on `<html>` it retimes every anchor link on the site. |
| `selector` | `.page-section` | Section selector. Change it for non-standard themes. |
| `container` | *(none)* | Selector for a custom scroll container. Defaults to the page itself. |
| `debug` | `false` | Log the resolved sections, landing positions, and arm/release transitions. |

---

## 🎯 Excluding a Section

Sections inside `<header>` or `<footer>` are never counted. To drop one more — a spacer or a
divider block that shouldn't count toward `from`/`to` — add `data-anavo-section-snap-ignore` to it
in **Section → Advanced → HTML attributes**. Ignored sections are removed from the list before
`from` and `to` are resolved, so the numbering stays intuitive.

Sections the plugin does tag get `data-anavo-section-snap="point"`, which is useful for
inspecting the result in devtools.

---

## 🧱 When It Turns Itself Off

Snapping is skipped entirely, and the page behaves as if the plugin weren't there, when:

- the viewport is narrower than `minWidth`;
- the visitor has `prefers-reduced-motion: reduce` set;
- the page is open in the Squarespace editor;
- the page is too short for the last target to reach the top of the viewport. Without this check,
  `mandatory` would rubber-band the visitor back to the hero on every scroll attempt.

---

## ⚠️ Why Not Just Use CSS

The `nth-of-type` snippet that circulates in Squarespace forums looks like this:

```css
.page-section:nth-of-type(1) { scroll-snap-align: start; }
.page-section:nth-of-type(2) { scroll-snap-align: start; }
```

`:nth-of-type` counts within each parent. The footer is its own `<footer class="sections">`
element, and the first `.page-section` inside it is that footer's `nth-of-type(1)` — so it gets
tagged as a snap point as well. With `mandatory` and no snap point between section 2 and the
footer, scrolling down from section 2 teleports the visitor to the bottom of the page.

Section Snap resolves sections in JavaScript and excludes anything inside `<header>` or
`<footer>`, so only the sections you asked for are ever tagged. It also handles:

- **Fixed headers.** Themes with a fixed header set `scroll-padding-top` on the scroll container,
  which insets the snapport. The landing position is `offsetTop − scrollPaddingTop −
  scrollMarginTop`, not `offsetTop`, so arrival detection works on those themes instead of
  leaving snap armed forever.
- **`scroll-snap-stop`.** Applied to destinations only. On the origin section it makes the browser
  refuse to release short wheel gestures.

---

## 🧩 Compatibility

- Squarespace 7.1 and 7.0.
- All modern browsers. Browsers without CSS scroll snap simply scroll normally.
- Namespaced under `anavo-section-snap-`; no collisions with other Anavo plugins.

---

## 📄 License

Commercial plugin. Requires a valid license key from [Anavo Tech](https://anavo.tech).
