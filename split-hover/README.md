# Split Hover — Anavo Tech Plugin

Split-screen hero section with cursor-following photo and smooth background transitions.

## Effect

- A photo (30vw wide) follows the cursor with lerp smoothing
- Two nouns are centered, split by `/` (or any separator)
- Hovering the left half → `color1` background + `image1`
- Hovering the right half → `color2` background + `image2`
- Background and photo cross-fade smoothly (`transitionMs`)
- Mobile: cursor hidden, background split still works on touch

## Setup

**Step 1** — Add a Code Block anywhere on your page:
```html
<div data-anavo-split-hover></div>
```

**Step 2** — Add to Settings → Advanced → Code Injection → FOOTER:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/split-hover/split-hover.js
  ?domain=yoursite.com
  &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
  &supabaseKey=YOUR_ANON_KEY
  &noun1=FASHION
  &noun2=EDITORIAL
  &image1=https%3A%2F%2Fyour-cdn.com%2Fphoto1.jpg
  &image2=https%3A%2F%2Fyour-cdn.com%2Fphoto2.jpg
  &color1=%231a1a1a
  &color2=%23f5f0e8
"></script>
```

> **Note:** Encode `#` as `%23`, `/` as `%2F`, `:` as `%3A` in URLs and colors.

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `domain` | hostname | Your site domain (for license check) |
| `supabaseUrl` | — | Supabase project URL |
| `supabaseKey` | — | Supabase anon key |
| `noun1` | `FASHION` | Left word |
| `noun2` | `EDITORIAL` | Right word |
| `image1` | — | Photo URL for left side |
| `image2` | — | Photo URL for right side |
| `color1` | `#1a1a1a` | Background color, left side |
| `color2` | `#f5f0e8` | Background color, right side |
| `separator` | `/` | Divider character between nouns |
| `cursorSize` | `30vw` | Width of following photo |
| `aspectRatio` | `2/3` | CSS aspect-ratio of photo |
| `fontSize` | `7vw` | Noun font size |
| `fontColor` | `#ffffff` | Noun text color |
| `fontFamily` | `inherit` | Noun font family |
| `fontWeight` | `300` | Noun font weight |
| `letterSpacing` | `0.15em` | Noun letter spacing |
| `transitionMs` | `800` | Background + photo transition (ms) |
| `lerpSpeed` | `0.08` | Cursor follow smoothness (0.01–0.3) |
| `target` | `[data-anavo-split-hover]` | CSS selector for mount point |

## Licensing

License check queries `purchased_plugins` table in Supabase:
```
SELECT id FROM purchased_plugins WHERE plugin_id = 'SplitHover' AND domain = '{host}'
```
Non-blocking — plugin always runs, shows notice if unlicensed.

Bypass domains (no check): `anavo.tech`, `localhost`, `127.0.0.1`
