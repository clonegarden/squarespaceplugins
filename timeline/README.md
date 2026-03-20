# ⏳ Timeline

Transforms any Squarespace section into a rich, animated timeline widget. Supports **vertical**, **horizontal**, and **alternate (zigzag)** layouts. Data is auto-extracted from the section or supplied via a `?data=` URL parameter. All visual styles and animations are fully parameter-driven.

---

## 🚀 Installation

**Settings → Advanced → Code Injection → Footer**

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/timeline/timeline.min.js"></script>
```

The plugin auto-detects its target: it looks for `<div id="timeline">` first, then for any page section that contains an `<h1>` with the text **"timeline"** (case-insensitive).

---

## 🎯 Targeting

### Auto-detect (recommended)

Add a Code Block or page section containing either of these:

```html
<!-- Option A: a named div -->
<div id="timeline"></div>

<!-- Option B: any section with an H1 titled "timeline" -->
<h1>Timeline</h1>
```

The plugin scans the page and renders inside the **first matching element**.

### Manual targeting (URL parameters)

| Parameter | Description |
|-----------|-------------|
| `sectionIndex=N` | Target the Nth page section (1-based) |
| `sectionId=X` | Target section by Squarespace `data-section-id` |
| `divId=X` | Target any `<div>` wrapper by its `id` |

```html
<!-- Target the 3rd section -->
<script src="...timeline.min.js?sectionIndex=3"></script>

<!-- Target by Squarespace section ID -->
<script src="...timeline.min.js?sectionId=5f3ab12c..."></script>
```

---

## 📐 Layout Modes

| Mode | Description |
|------|-------------|
| `vertical` | Single column, vertical line on the left *(default)* |
| `horizontal` | Horizontal row with scrollable overflow on mobile |
| `alternate` | Zigzag — items alternate left/right of a centered line |

```html
<!-- Vertical (default) -->
<script src="...timeline.min.js"></script>

<!-- Horizontal -->
<script src="...timeline.min.js?layout=horizontal"></script>

<!-- Alternate / zigzag -->
<script src="...timeline.min.js?layout=alternate"></script>
```

---

## 📦 Data Sources

### 1. Inline JSON via `?data=`

The fastest way to get started. Pass a URL-encoded JSON array of item objects:

```html
<script src='...timeline.min.js?data=[
  {"year":"2019","title":"Founded","body":"The journey begins."},
  {"year":"2021","title":"First Product","body":"Launched to rave reviews.","image":"https://example.com/img.jpg"},
  {"year":"2023","title":"Series A","body":"Raised $5M to accelerate growth."}
]'></script>
```

Each item object supports:

| Key | Description |
|-----|-------------|
| `year` / `date` | Date or era label shown above the title |
| `title` | Main heading text |
| `body` / `description` / `content` | HTML or plain text body |
| `image` / `img` | Absolute URL of an image |
| `side` | `"left"` or `"right"` (alternate mode only — overrides auto-alternation) |

### 2. `.timeline-item` elements (Code Block)

Add a Code Block to your Squarespace section:

```html
<div id="timeline">
  <div class="timeline-item" data-year="2019" data-title="Founded">
    <p>The journey begins.</p>
  </div>
  <div class="timeline-item" data-year="2021" data-title="First Product">
    <p>Launched to rave reviews.</p>
    <img src="https://example.com/product.jpg" alt="Product launch">
  </div>
</div>
```

### 3. `<ul>` with data attributes

```html
<ul id="timeline" style="display:none">
  <li data-year="2019" data-title="Founded"
      data-body="<p>The journey begins.</p>"
      data-image="https://example.com/founding.jpg">
  </li>
  <li data-year="2021" data-title="First Product"
      data-body="<p>Launched to rave reviews.</p>">
  </li>
</ul>
```

### 4. Auto-parse (Squarespace blocks)

The plugin also auto-reads from:
- **Squarespace Summary Blocks** (`.summary-item`)
- **Squarespace 7.1 List Sections** (`.user-items-list-item-container`)
- **Heading groups** — any `<h2>` or `<h3>` followed by `<p>` / `<img>` siblings

---

## ✨ Presets

| Preset | Style | Best For |
|--------|-------|----------|
| `default` | Warm brown, serif, white cards | Photography, storytelling |
| `minimal` | Grey line, clean sans-serif, white cards | Tech, SaaS, modern brands |
| `elegant` | Gold line, Cormorant Garamond, cream cards | Luxury, weddings, fine art |
| `bold` | White line, white text, dark cards | Dark-mode sections, agencies |
| `dark` | Blue glow line, dark blue cards | Tech, portfolios |

```html
<script src="...timeline.min.js?preset=elegant"></script>
<script src="...timeline.min.js?preset=dark&layout=alternate"></script>
```

---

## 📋 Full Parameter Reference

### Targeting

| Parameter | Default | Description |
|-----------|---------|-------------|
| `sectionIndex` | — | Target Nth section (1-based) |
| `sectionId` | — | Target by `data-section-id` |
| `divId` | — | Target `<div>` by `id` |

### Layout

| Parameter | Default | Description |
|-----------|---------|-------------|
| `layout` | `vertical` | `vertical` / `horizontal` / `alternate` |
| `offset` | `60` | Side gap (px) for alternate mode |

### Data

| Parameter | Default | Description |
|-----------|---------|-------------|
| `data` | — | URL-encoded JSON array of timeline items |

### Appearance

| Parameter | Default | Description |
|-----------|---------|-------------|
| `preset` | `default` | Style preset |
| `lineColor` | `8B7355` | Line color hex |
| `lineWidth` | `3` | Line width in px |
| `lineStyle` | `solid` | `solid` / `dashed` / `dotted` |
| `dotColor` | `8B7355` | Dot fill color hex |
| `dotSize` | `16` | Dot diameter in px |
| `dotBorderColor` | *(cardBg)* | Dot border color hex |
| `glowColor` | *(lineColor)* | Glow tip color hex |
| `glowSize` | `8` | Glow spread radius in px |
| `bgColor` | `transparent` | Wrapper background |
| `cardBg` | `ffffff` | Card background hex |
| `accentColor` | `8B7355` | Title / heading color hex |
| `textColor` | `444444` | Body text color hex |
| `yearColor` | `8B7355` | Year label color hex |
| `cardRadius` | `8` | Card border-radius in px |
| `cardShadow` | `true` | Show card drop-shadow |
| `cardPadding` | `24` | Card padding in px |

### Typography

| Parameter | Default | Description |
|-----------|---------|-------------|
| `fontFamily` | *(preset)* | Font family for all text |
| `headingSize` | `22` | Title font size in px |
| `bodySize` | `15` | Body font size in px |
| `yearSize` | `13` | Year label font size in px |

### Spacing

| Parameter | Default | Description |
|-----------|---------|-------------|
| `itemGap` | `48` | Gap between timeline items in px |

### Animation

| Parameter | Default | Description |
|-----------|---------|-------------|
| `drawLine` | `true` | Animate the line drawing |
| `scrollSync` | `true` | Sync line draw to scroll position (`false` = one-time reveal) |
| `animationType` | `fade` | Item reveal: `fade` / `slide` / `none` |
| `animationSpeed` | `400` | Animation duration in ms |

### Debug

| Parameter | Default | Description |
|-----------|---------|-------------|
| `debug` | `false` | Enable verbose console logging |

---

## 💡 Examples

### Company History (vertical, default preset)

```html
<div id="timeline"></div>
<script src='...timeline.min.js?data=[
  {"year":"2015","title":"Founded","body":"Two friends, one idea."},
  {"year":"2017","title":"Seed Round","body":"Raised $1.2M."},
  {"year":"2019","title":"Product Launch","body":"10,000 customers in 90 days."},
  {"year":"2022","title":"Series A","body":"$12M to scale globally."}
]'></script>
```

### Elegant Zigzag (alternate, elegant preset)

```html
<section>
  <h1>Timeline</h1>
  <ul style="display:none">
    <li data-year="Spring 2020" data-title="The Beginning"
        data-body="<p>Started with a blank page and a vision.</p>"
        data-image="https://example.com/start.jpg"></li>
    <li data-year="Winter 2021" data-title="First Collection"
        data-body="<p>Debuted at London Fashion Week.</p>"
        data-image="https://example.com/collection.jpg"></li>
    <li data-year="Summer 2023" data-title="Global Expansion"
        data-body="<p>Now available in 40 countries.</p>"></li>
  </ul>
</section>
<script src="...timeline.min.js?layout=alternate&preset=elegant&animationType=slide"></script>
```

### Dark Horizontal (horizontal, dark preset)

```html
<script src='...timeline.min.js?layout=horizontal&preset=dark&drawLine=true&scrollSync=false&animationSpeed=600'></script>
```

### Custom Colors (vertical, no shadow, slide animation)

```html
<script src="...timeline.min.js?lineColor=2563eb&dotColor=2563eb&accentColor=1d4ed8&cardBg=f0f7ff&cardShadow=false&animationType=slide"></script>
```

---

## ⚙️ How It Works

1. The plugin reads its own `<script src="...">` URL to extract configuration parameters.
2. On `DOMContentLoaded` it scans the page for the target element (URL params → `#timeline` → H1 "timeline" section).
3. It auto-extracts timeline items from `.timeline-item` elements, `<ul>` data attributes, Squarespace blocks, or heading groups — or uses the `?data=` param directly.
4. CSS styles are injected once (idempotent).
5. The timeline widget is inserted as the next sibling of the original element; the original is hidden.
6. An `IntersectionObserver` reveals cards and dots as they enter the viewport.
7. The line fill is updated via a `scroll` listener (or a one-shot observer when `scrollSync=false`). A glowing dot tracks the tip of the drawn line.
8. A non-blocking licensing check runs 1.5 seconds after load.

---

## ♿ Accessibility

- All decorative elements (line, dot, glow) use `aria-hidden="true"`
- Cards are native `<div>` elements inside a semantic `<ul role="list">`
- `prefers-reduced-motion` is fully respected: all animations and the line draw are disabled; items and dots are instantly visible

---

## 📱 Responsive Behaviour

| Breakpoint | Vertical | Alternate | Horizontal |
|------------|----------|-----------|------------|
| Desktop (>900px) | Line at left, cards on right | Zigzag, centered line | Scroll row |
| Tablet (≤900px) | Unchanged | Narrower cards | Scroll row |
| Mobile (≤768px) | Line moves to 16px from left | Stacks to single column (line at left) | Compact cards |
| Small Mobile (≤480px) | Compact padding | Compact padding | Narrower cards |

---

## 🔧 Troubleshooting

**Q: Plugin says "No target found"**  
Add `?debug=true` to the script URL and check the console. Ensure your section has an `<h1>` with the exact text "timeline" or add `<div id="timeline">`.

**Q: "No timeline items found"**  
With `?debug=true` you'll see which extraction mode was attempted. Use `.timeline-item` elements, a `<ul>` with `data-year`/`data-title` on each `<li>`, or the `?data=` param.

**Q: Line animation is choppy**  
Use `?scrollSync=false` for a one-time smooth draw triggered on reveal instead of a per-scroll-frame update.

**Q: Alternate layout is lopsided on mobile**  
This is expected behaviour — the plugin stacks alternate items into a single column on mobile (≤768px) for readability.

**Q: Images aren't loading**  
Use full absolute URLs. If using Squarespace-hosted images, use the full `https://` path from the image settings.

---

## 🌐 Browser Support

- Chrome 80+
- Firefox 78+
- Safari 13.1+
- Edge 80+
- iOS Safari 13.4+
- Chrome for Android 80+

---

## 🔐 Licensing

This plugin requires a valid Anavo Tech license for use on production domains.

- **Trial / Development:** Works on `localhost` and `127.0.0.1` without a license
- **Production:** Purchase a license at [anavo.tech/plugins](https://anavo.tech/plugins)

---

## 🆘 Support

- 📧 Email: hello@anavo.tech
- 🐛 Bug Reports: [GitHub Issues](https://github.com/clonegarden/squarespaceplugins/issues)
- 📖 Knowledge Base: [anavo.tech](https://anavo.tech)
