# Scroll Loop Menu — Anavo Tech Plugin

Full-screen overlay menu that loops infinitely when scrolled. Large right-aligned typography, hover slide + italic effect, accent line. Mobile falls back to normal scroll.

## Effect

- Full-viewport overlay slides in on open (configurable fade transition)
- Menu items right-aligned, large font (`9.5vh` default)
- Hover: item slides right `2rem`, turns italic, accent color, decorative line appears left
- Scroll loops seamlessly — reaching the bottom snaps back to top (and vice versa)
- Mobile (`≤800px`): no loop, normal overflow scroll
- Esc key closes the menu

## Setup

**Step 1** — Add a Code Block anywhere on your page:
```html
<div data-anavo-scroll-loop-menu></div>
```

**Step 2** — Add your open trigger. Either:

**Option A** — Add `data-anavo-slm-trigger` to any existing element (button, nav link, etc.):
```html
<button data-anavo-slm-trigger>Menu</button>
```

**Option B** — Let the plugin render a built-in button (`showTrigger=true`).

**Step 3** — Add to Settings → Advanced → Code Injection → FOOTER:
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/scroll-loop-menu/scroll-loop-menu.js
  ?domain=yoursite.com
  &supabaseUrl=https%3A%2F%2FXXXX.supabase.co
  &supabaseKey=YOUR_ANON_KEY
  &items=Photography|Weddings|Editorial|About|Contact
  &links=%2Fphotography|%2Fweddings|%2Feditorial|%2Fabout|%2Fcontact
  &bgColor=%23111111
  &textColor=%23f0ede8
  &hoverColor=%23c0092b
"></script>
```

> **Note:** Encode `#` as `%23`, `/` as `%2F`, `:` as `%3A`. Separate items with `|` (pipe).

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `domain` | hostname | Your site domain (for license check) |
| `supabaseUrl` | — | Supabase project URL |
| `supabaseKey` | — | Supabase anon key |
| `items` | `Photography\|Weddings\|Editorial\|About\|Contact` | Pipe-separated menu item labels |
| `links` | — | Pipe-separated URLs (matches items order) |
| `bgColor` | `#111111` | Overlay background color |
| `textColor` | `#f0ede8` | Item text color |
| `hoverColor` | `#c0092b` | Item hover color |
| `fontSize` | `9.5vh` | Item font size |
| `fontFamily` | `inherit` | Font family |
| `fontWeight` | `300` | Font weight |
| `itemOffset` | `25vw` | Right-side margin for items |
| `transitionMs` | `600` | Overlay open/close fade (ms) |
| `showTrigger` | `false` | Render a built-in open button |
| `triggerLabel` | `Menu` | Built-in button label |
| `triggerPosition` | `top-right` | `top-right`, `top-left`, `bottom-right`, `bottom-left` |
| `triggerColor` | `#111111` | Built-in button text color |
| `triggerSelector` | `[data-anavo-slm-trigger]` | CSS selector for custom open trigger(s) |
| `target` | `[data-anavo-scroll-loop-menu]` | CSS selector for mount point |

## Licensing

License check queries `purchased_plugins` table in Supabase:
```
SELECT id FROM purchased_plugins WHERE plugin_id = 'ScrollLoopMenu' AND domain = '{host}'
```
Non-blocking — plugin always runs, shows notice if unlicensed.

Bypass domains (no check): `anavo.tech`, `localhost`, `127.0.0.1`
