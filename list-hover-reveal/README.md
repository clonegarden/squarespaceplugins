# List Hover Reveal — Anavo Tech Plugin

Turns a native Squarespace **List section** (Simple layout) into full-width rows. Hovering a row
reveals its image, which follows the cursor with a smooth, slightly tilted glide; the other rows
dim, the title slides in and the button slides out. On phones the row crossing the middle of the
screen becomes active and its image appears behind it.

## Setup

1. Add a List section (Simple layout) with an image, a title and a button per item.
2. Find the section id: inspect the page and copy `data-section-id="…"` from the `<section>`.
3. Paste in **Settings → Advanced → Code Injection → FOOTER**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/list-hover-reveal/list-hover-reveal.min.js?sectionId=YOUR_SECTION_ID"></script>
```

Several lists: `sectionId=ID1,ID2`. Custom markup: `target=<CSS selector>` (the section, the list
or anything inside the section). Default target: `[data-anavo-list-hover-reveal]`.

## Parameters

| Parameter | Default | Description |
|---|---|---|
| `sectionId` | — | Squarespace section id(s), comma-separated |
| `target` | `[data-anavo-list-hover-reveal]` | CSS selector of the section / list |
| `imgWidth` | `30%` | Image width on desktop (% of the list) |
| `imgWidthMobile` | `70%` | Max image width on touch (% of the screen) |
| `imgHeightMobile` | `min(60vw, 50svh)` | Image height on touch — any CSS length, never tied to the list height |
| `imgRatio` | `auto` | Image ratio (`3/4`, `16:9`…); `auto` = the list's own aspect-ratio setting |
| `imgPosition` | `50` | Horizontal anchor of the image, % of the list width |
| `followX` | `0.3` | How far the image follows the cursor sideways (0 = stays on the anchor, 1 = under the cursor) |
| `followEase` | `0.15` | Follow smoothing (0.01–1, 1 = no lag) |
| `rotateOnMove` | `true` | Tilt the image by horizontal speed |
| `rotateMax` | `6` | Max tilt, degrees |
| `reveal` | `fade` | `fade` · `scale` · `clip` · `blur` |
| `revealDuration` | `300` | Reveal duration, ms |
| `desktopLayer` | `above` | Image `above` or `below` the text on desktop |
| `inactiveOpacity` | `0.3` | Opacity of the other rows |
| `activeInset` | `20px` | Slide distance of the title / button |
| `lineColor` | theme line color | Divider color (`%23` for `#`) |
| `lineWidth` | `1px` | Divider thickness |
| `outerLines` | `false` | Also draw lines above the first and below the last row |
| `spaceBetween` | `40px` | Vertical padding of each row |
| `titleSizeMobile` | theme size | Title size at ≤800px |
| `plainButton` | `true` | Show the item button as plain text |
| `mobileMode` | `centerline` | `centerline` (scroll) · `tap` (1st tap reveals, 2nd opens) · `off` |
| `overlayOpacityMobile` | `0.5` | Veil between the image and the active row's text on touch |
| `debug` | `false` | Verbose console logging |

Bare numbers get a unit automatically (`imgWidth=40` → `40%`, `activeInset=30` → `30px`).

## Behaviour notes

- Each row becomes one link to its button URL (keyboard focusable; focus shows the image). Buttons
  with an empty or `#` URL never become links.
- Near the very top or bottom of the page, where a row can never reach the middle of the screen,
  the trigger line slides toward it so every row still activates.
- `prefers-reduced-motion`: no follow, no tilt, no slides — the image fades in centred on the row.
- Does nothing inside the Squarespace editor, and logs one warning if no list is found.
