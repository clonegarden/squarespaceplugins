# Rotating Text

Animated rotating words and phrases for Squarespace headings. Multiple animation types, per-word colors, typewriter effect, and more. Drop-in compatible with `sewebdesign/rotating-text`.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)
![License](https://img.shields.io/badge/license-Commercial-green)

---

## Installation

**Step 1 — Add words to your heading** (SS Code Block or Markdown Block):

```html
<h1>We build <span data-anavo-rotate='["beautiful","fast","smart"]'></span> websites.</h1>
```

**Step 2 — Add script to Footer** (Settings → Advanced → Code Injection → Footer):

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/rotating-text/rotating-text.min.js?animation=typewriter"></script>
```

---

## Animation Types

| Type | Description |
|------|-------------|
| `typewriter` | Types each character, then deletes (default) |
| `fade` | Cross-fades between words |
| `slideUp` | Slides in from below |
| `slideDown` | Slides in from above |
| `flip` | 3D flip on X axis |
| `zoom` | Zooms in from small |

---

## Per-Word Colors

Pass an array of objects instead of strings:

```html
<span data-anavo-rotate='[
  {"text": "beautiful", "color": "#f59e0b"},
  {"text": "fast",      "color": "#10b981"},
  {"text": "smart",     "color": "#3b82f6"}
]'></span>
```

---

## Script URL Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `animation` | `typewriter` | Animation type (see table above) |
| `speed` | `70` | Typewriter: ms per character typed |
| `deleteSpeed` | `40` | Typewriter: ms per character deleted |
| `pause` | `2000` | ms to hold each word before transitioning |
| `startDelay` | `500` | ms before first word starts |
| `loop` | `true` | Loop through words indefinitely |
| `cursor` | `true` | Show blinking cursor (typewriter only) |
| `cursorChar` | `\|` | Cursor character |
| `random` | `false` | Randomize word order |
| `pauseOnHover` | `true` | Pause rotation when user hovers |
| `color` | _(inherit)_ | Global fallback color for all words |
| `target` | `[data-anavo-rotate],[data-rotate]` | CSS selector for elements to rotate |

---

## Examples

**Typewriter (default):**
```html
<h2>I am a <span data-anavo-rotate='["developer","designer","strategist"]'></span>.</h2>
<script src="...rotating-text.min.js?animation=typewriter&speed=80&pause=2500"></script>
```

**Fade with colors:**
```html
<h1>Your <span data-anavo-rotate='[{"text":"brand","color":"#f59e0b"},{"text":"vision","color":"#3b82f6"}]'></span> deserves more.</h1>
<script src="...rotating-text.min.js?animation=fade&pause=2000"></script>
```

**Slide up, random order, no cursor:**
```html
<span data-anavo-rotate='["Results","Growth","Impact","Success"]'></span>
<script src="...rotating-text.min.js?animation=slideUp&random=true&cursor=false&pause=1800"></script>
```

---

## sewebdesign Drop-in Compatibility

This plugin automatically targets `[data-rotate]` in addition to `[data-anavo-rotate]`.
If you're migrating from `sewebdesign/rotating-text`, just swap the script tag — no HTML changes needed.

```html
<!-- Works with existing sewebdesign markup: -->
<span data-rotate='["word1","word2","word3"]'></span>

<!-- Swap this: -->
<link href="https://cdn.jsdelivr.net/gh/sewebdesign/rotating-text@1/rotating-text.min.css" rel="stylesheet">
<script defer src="https://cdn.jsdelivr.net/gh/sewebdesign/rotating-text@1/rotating-text.min.js"></script>

<!-- With this: -->
<script src="...rotating-text.min.js?animation=fade&pause=2000"></script>
```

---

## Multiple Instances

Each element with `data-anavo-rotate` runs independently with its own state.
All instances share the global script parameters.
