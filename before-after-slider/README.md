# Before/After Slider

Drag-to-reveal image comparison slider. Touch + mouse support. Auto aspect ratio from image dimensions.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)
![License](https://img.shields.io/badge/license-Commercial-green)

---

## Installation

**Step 1 — Add a Code Block** where you want the slider:

```html
<div data-anavo-beforeafter
  data-before="https://your-domain.com/before.jpg"
  data-after="https://your-domain.com/after.jpg"
  data-before-label="Before"
  data-after-label="After"
  style="max-width: 700px; margin: 0 auto;">
</div>
```

**Step 2 — Add script to Footer** (Settings → Advanced → Code Injection → Footer):

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/before-after-slider/before-after-slider.min.js"></script>
```

---

## Data Attributes (on the div)

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-before` | Yes | URL of the "before" image |
| `data-after` | Yes | URL of the "after" image |
| `data-before-label` | No | Label on the before side (default: `Before`) |
| `data-after-label` | No | Label on the after side (default: `After`) |
| `data-start` | No | Initial divider position 0–100 (default: `50`) |
| `data-ratio` | No | Force aspect ratio e.g. `16/9` or `4/3` |

---

## Script URL Parameters (global defaults)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `target` | `[data-anavo-beforeafter]` | CSS selector for slider containers |
| `beforeLabel` | `Before` | Default before label |
| `afterLabel` | `After` | Default after label |
| `startPosition` | `50` | Default divider start position (0–100) |
| `accentColor` | `#ffffff` | Divider line color |
| `handleColor` | `#ffffff` | Handle circle color |
| `labelBg` | `rgba(0,0,0,.45)` | Label background |
| `showLabels` | `true` | Show/hide before+after labels |
| `aspectRatio` | _(auto)_ | Override aspect ratio for all sliders |

---

## Multiple Sliders on One Page

Each `data-anavo-beforeafter` div is an independent slider. Add as many as needed:

```html
<!-- Slider 1 -->
<div data-anavo-beforeafter data-before="URL1" data-after="URL2" style="max-width:600px"></div>

<!-- Slider 2 — starts at 30% -->
<div data-anavo-beforeafter data-before="URL3" data-after="URL4" data-start="30" style="max-width:600px"></div>
```

---

## Use Cases

- Fitness / body transformation
- Cosmetic / aesthetic procedures
- Property renovation / before-after remodels
- Photography editing comparisons
- Web design / redesign showcases
- Hair, makeup, skincare results

---

## Getting Image URLs from Squarespace

1. Upload images to **Media → Images**
2. Click on the image → **Copy image URL**
3. Paste into `data-before` / `data-after`
