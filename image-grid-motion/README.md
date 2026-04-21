# Image Grid Motion — Anavo Tech Plugin

Full-viewport sparse image grid where each image independently follows the mouse with lerp smoothing. Stagger reveal from viewport center on load.

## Effect

- 10 images placed sparsely across a 50×50 CSS grid (110%×110% viewport, offset −5%)
- Each image moves with random amplitude (15–60px default) mapped to mouse position
- All motion lerped for smooth, independent parallax feel
- Stagger reveal on load: items closest to center appear first, then radiate outward
- Optional center title + subtitle overlay
- Custom SVG circle cursor
- Zero external dependencies — pure vanilla JS

## Setup

**Step 1** — Add a Code Block anywhere on your page:
```html
<div data-anavo-image-grid></div>
```

**Step 2** — Add to Settings → Advanced → Code Injection → FOOTER:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/image-grid-motion/image-grid-motion.js
  ?domain=yoursite.com
  &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
  &supabaseKey=YOUR_ANON_KEY
  &images=https%3A%2F%2Fyour-cdn.com%2Fphoto1.jpg|https%3A%2F%2Fyour-cdn.com%2Fphoto2.jpg|...
  &bgColor=%230c0c0c
  &title=YOUR+TITLE
  &subtitle=Your+subtitle+text
"></script>
```

> **Note:** Encode `#` as `%23`, `:` as `%3A`, `/` as `%2F` in URLs and colors. Separate image URLs with `|` (pipe).

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `domain` | hostname | Your site domain (for license check) |
| `supabaseUrl` | — | Supabase project URL |
| `supabaseKey` | — | Supabase anon key |
| `images` | — | Pipe-separated image URLs (up to 10) |
| `bgColor` | `#0c0c0c` | Background color |
| `amplitudeMin` | `15` | Minimum per-image motion range (px) |
| `amplitudeMax` | `60` | Maximum per-image motion range (px) |
| `lerpSpeed` | `0.07` | Mouse follow smoothness (0.01–0.3) |
| `itemOpacity` | `0.4` | Final opacity of each grid image |
| `revealDuration` | `1800` | Stagger intro animation duration (ms) |
| `title` | — | Center title text (optional) |
| `subtitle` | — | Center subtitle text (optional) |
| `titleColor` | `#ffffff` | Title color |
| `titleSize` | `10vw` | Title font size |
| `subtitleColor` | `rgba(255,255,255,0.5)` | Subtitle color |
| `subtitleSize` | `4.5vw` | Subtitle font size |
| `fontFamily` | `inherit` | Font for title/subtitle |
| `target` | `[data-anavo-image-grid]` | CSS selector for mount point |

## Grid Layout

Images are placed at 10 fixed positions across a 50-column × 50-row CSS grid:

| Position | Grid Area |
|----------|-----------|
| 1 | rows 10–26, cols 1–7 |
| 2 | rows 1–9, cols 18–27 |
| 3 | rows 1–14, cols 36–42 |
| 4 | rows 13–32, cols 11–18 |
| 5 | rows 17–32, cols 32–38 |
| 6 | rows 20–28, cols 46–51 |
| 7 | rows 43–51, cols 1–10 |
| 8 | rows 38–46, cols 14–22 |
| 9 | rows 40–51, cols 26–32 |
| 10 | rows 37–48, cols 39–47 |

## Licensing

License check queries `purchased_plugins` table in Supabase:
```
SELECT id FROM purchased_plugins WHERE plugin_id = 'ImageGridMotion' AND domain = '{host}'
```
Non-blocking — plugin always runs, shows notice if unlicensed.

Bypass domains (no check): `anavo.tech`, `localhost`, `127.0.0.1`
