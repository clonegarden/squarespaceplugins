# 📁 Tabbed Content

Transforms Squarespace lists into a **tabbed file-organizer layout** with image + content panels. Auto-extracts from Summary Blocks, List Sections, or custom HTML lists.

Inspired by [nataliewalkerphoto.com/experience](https://www.nataliewalkerphoto.com/experience).

---

## 🚀 Installation

**Settings → Advanced → Code Injection → Footer**

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/tabbed-content/tabbed-content.min.js?sectionIndex=2"></script>
```

---

## 🎯 Targeting Modes

Pick **one** targeting parameter — the plugin will find the right element and extract tab data from it.

### 1. `sectionIndex` — Target by page section number (1-based)

```html
<script src="...tabbed-content.min.js?sectionIndex=3"></script>
```

The plugin targets the 3rd `<section>` on the page and extracts from Summary Block items, List Section items, or heading groups inside it.

### 2. `sectionId` — Target by Squarespace `data-section-id`

Right-click a section → Inspect Element → find `data-section-id="abc123"`:

```html
<script src="...tabbed-content.min.js?sectionId=abc123"></script>
```

### 3. `divId` — Target a `<div>` wrapper you create with a Code Block

Add a Code Block with:
```html
<div id="my-services">
  <!-- your Squarespace list will be inside the same section, or add HTML directly -->
</div>
```

Then:
```html
<script src="...tabbed-content.min.js?divId=my-services"></script>
```

### 4. `ulId` — Target a `<ul>` you build entirely in a Code Block

Add a Code Block with your own list (great for full control):

```html
<ul id="services-list" style="display:none">
  <li data-title="Elopements"
      data-subtitle="Intimate & Adventurous"
      data-image="https://example.com/elopement.jpg">
    <p>Your elopement deserves beautiful documentation...</p>
  </li>
  <li data-title="Weddings"
      data-subtitle="Timeless Celebration"
      data-image="https://example.com/wedding.jpg">
    <p>Every wedding is a unique love story...</p>
  </li>
</ul>
```

Then:
```html
<script src="...tabbed-content.min.js?ulId=services-list"></script>
```

---

## ✨ Quick-Start Presets

| Preset | Style | Tab Style | Best For |
|--------|-------|-----------|----------|
| `default` | Warm beige, serif, border separators | `concrete` | Photography, lifestyle |
| `minimal` | White, no borders, clean sans-serif | `minimal` | Tech, modern brands |
| `elegant` | Cormorant Garamond, warm tones | `concrete` | Luxury, weddings, fine art |
| `bold` | Dark mode, white active, bold type | `browser` | Creative agencies, portfolios |

```html
<!-- Elegant (matches reference site) -->
<script src="...tabbed-content.min.js?ulId=my-list&preset=elegant"></script>

<!-- Minimal -->
<script src="...tabbed-content.min.js?sectionIndex=2&preset=minimal"></script>

<!-- Bold / Dark Mode -->
<script src="...tabbed-content.min.js?sectionIndex=2&preset=bold"></script>
```

### Tab Style Options

| Style | Visual Effect | Default For |
|-------|--------------|-------------|
| `concrete` | Full rectangular border on all 4 sides; active tab opens into panel (no bottom border) | `default`, `elegant` |
| `browser` | Rounded top corners; active tab connects to content area | `bold` |
| `minimal` | No border; active tab has a 2px underline in `activeColor` | `minimal` |

```html
<!-- File-folder (concrete) style -->
<script src="...tabbed-content.min.js?sectionIndex=2&tabStyle=concrete"></script>

<!-- Browser tab style with custom gap -->
<script src="...tabbed-content.min.js?sectionIndex=2&tabStyle=browser&tabGap=12"></script>

<!-- Minimal underline style -->
<script src="...tabbed-content.min.js?sectionIndex=2&tabStyle=minimal"></script>
```

---

## 📋 Full Parameter Reference

### Targeting

| Parameter | Default | Description |
|-----------|---------|-------------|
| `sectionIndex` | — | Target Nth page section (1-based) |
| `sectionId` | — | Target by `data-section-id` attribute |
| `divId` | — | Target `<div>` wrapper by id |
| `ulId` | — | Target `<ul>` directly by id |

### Presets & Appearance

| Parameter | Default | Description |
|-----------|---------|-------------|
| `preset` | `default` | Style preset: `default` / `minimal` / `elegant` / `bold` |
| `bgColor` | `FAF5EF` | Background color fallback (hex without `#`) — used as `contentBgColor` when that param is not set |
| `contentBgColor` | *(bgColor)* | Content panel background color — also used for the active-tab border-masking trick |
| `activeColor` | `8B7355` | Active tab and heading color |
| `inactiveColor` | `999999` | Inactive tab and body text color |
| `fontFamily` | *(preset)* | Default tab bar font family |
| `contentFont` | *(preset)* | Default content panel font family |
| `borderColor` | *(sectionBorderColor)* | General border color for the wrapper |

### Tab Bar

| Parameter | Default | Description |
|-----------|---------|-------------|
| `tabStyle` | `concrete` | Visual style: `concrete` (file-folder, full border) / `browser` (rounded tops) / `minimal` (underline only) |
| `tabGap` | `6` | Gap between tabs in px |
| `tabAlign` | `left` | Tab alignment: `left` / `center` / `right` |
| `tabFontSize` | `14` | Tab font size in px |
| `tabFontColor` | *(inactiveColor)* | Font color for inactive tabs |
| `tabFontFamily` | *(fontFamily)* | Font family specifically for tabs |
| `tabTransform` | `uppercase` | CSS text-transform |
| `tabLetterSpacing` | `0.15em` | Tab letter spacing |
| `tabBorder` | `true` | Show borders on tabs (always on for `concrete`/`browser`) |
| `tabBorderColor` | `cccccc` | Tab border color hex |

### Content Panel

| Parameter | Default | Description |
|-----------|---------|-------------|
| `contentPadding` | `60` | Content column padding in px |
| `imagePosition` | `left` | Image side: `left` / `right` |
| `imageWidth` / `photoSize` | `45` | Image column width as `%` |
| `imageAspect` | `auto` | Image aspect: `auto` / `square` / `4:3` / `3:2` / `16:9` |
| `imagePadding` | `16` | Padding around the image in px |
| `headingTag` | `h2` | HTML tag for heading: `h2` / `h3` / `h4` |
| `headingSize` / `titleFontSize` | `28` | Heading font size in px |
| `titleFontColor` | *(activeColor)* | Font color for the content title |
| `titleFontFamily` | *(contentFont)* | Font family for the content title |
| `subtitleSize` | `13` | Subtitle font size in px |
| `bodySize` / `descFontSize` | `15` | Body text font size in px |
| `descFontColor` | *(inactiveColor)* | Font color for description text |
| `descFontFamily` | *(contentFont)* | Font family for description text |

### Animation

| Parameter | Default | Description |
|-----------|---------|-------------|
| `animationType` | `fade` | Panel transition: `fade` / `slide` / `none` |
| `animationSpeed` | `400` | Animation duration in ms |

### Mobile

| Parameter | Default | Description |
|-----------|---------|-------------|
| `mobileMode` | `tap` | Mobile behavior: `tap` (vertical stack + image tap/swipe), `stack` (vertical stack, no image interactivity), `scroll` (legacy horizontal carousel) |
| `mobileCounter` | `auto` | Mobile image counter: `auto` (show only when there are 5+ tabs and tab bar overflows), `always`, `never` |

### Section Border

| Parameter | Default | Description |
|-----------|---------|-------------|
| `sectionBorder` | `false` | Show outer border around component |
| `sectionBorderColor` | `cccccc` | Outer border color hex |
| `sectionRadius` | `0` | Outer border radius in px |

### Debug

| Parameter | Default | Description |
|-----------|---------|-------------|
| `debug` | `false` | Enable verbose console logging |

---

## 📱 Mobile Behavior

- On mobile (`≤768px`), default `mobileMode=tap` shows one panel at a time in a vertical stack (image on top, content below).
- The tab bar remains horizontally scrollable for overflow tabs.
- Tapping the panel image goes to the next tab (with wrap-around). Swiping left/right goes next/previous.
- Image tap/swipe advances tabs only; the optional Learn More button still handles `data-link` navigation.
- Counter pill (`2 / 7`) appears only when helpful by default (`mobileCounter=auto`): 5+ tabs and tablist overflow.

---

## 💡 Examples

### Photography Portfolio (Elegant, left image)
```html
<ul id="services" style="display:none">
  <li data-title="Elopements" data-subtitle="Intimate & Adventurous"
      data-image="https://example.com/elopements.jpg">
    <p>Your elopement story, beautifully documented.</p>
  </li>
  <li data-title="Weddings" data-subtitle="Timeless Celebration"
      data-image="https://example.com/weddings.jpg">
    <p>Every wedding is a unique love story.</p>
  </li>
</ul>
<script src="...tabbed-content.min.js?ulId=services&preset=elegant&imageAspect=3:2"></script>
```

### Dark Mode / Bold Preset
```html
<script src="...tabbed-content.min.js?sectionIndex=2&preset=bold&animationType=slide"></script>
```

### Centered Tabs, Right-Side Image
```html
<script src="...tabbed-content.min.js?ulId=my-list&tabAlign=center&imagePosition=right&imageWidth=50"></script>
```

### Minimal with Custom Colors
```html
<script src="...tabbed-content.min.js?sectionIndex=3&bgColor=ffffff&activeColor=2563eb&inactiveColor=6b7280&tabBorder=false&sectionBorder=false"></script>
```

---

## ⚙️ How It Works

1. The plugin reads its own `<script>` tag's `src` URL to extract configuration parameters.
2. On `DOMContentLoaded`, it locates the target element using your chosen targeting parameter.
3. It scans the target for recognizable item patterns (Summary Block, List Section, heading groups, or `<ul data-*>` items).
4. It builds the tabbed UI: a `role="tablist"` tab bar and `role="tabpanel"` content panels.
5. The original element is hidden (`display: none`), and the new UI is inserted as its next sibling.
6. Tab switching fires on **hover** and **click** (plus image tap/swipe on mobile when `mobileMode=tap`). Full keyboard navigation is supported.
7. A non-blocking licensing check runs 1.5 seconds after load.

---

## ♿ Accessibility

- Tab bar uses `role="tablist"` and each button uses `role="tab"` with `aria-selected` and `aria-controls`
- Each panel uses `role="tabpanel"` with `aria-labelledby` pointing to its tab
- Inactive panels use the `hidden` attribute (not just CSS display:none)
- Full keyboard navigation:
  - `Tab` — moves focus to the active tab
  - `ArrowRight` / `ArrowDown` — move to next tab
  - `ArrowLeft` / `ArrowUp` — move to previous tab
  - `Home` — jump to first tab
  - `End` — jump to last tab
- `prefers-reduced-motion` is respected — animations are disabled when user has this preference enabled
- Focus indicators are visible on all interactive elements

---

## 🔧 Troubleshooting

**Q: Tabs appear but no content shows**
Make sure your list items have `data-title` and `data-image` (or equivalent) attributes, and that the UL/section is in the DOM when the script runs.

**Q: Plugin says "No items could be extracted"**
Check the browser console with `?debug=true` added to the script URL. Verify your targeting parameter points to the correct element.

**Q: Images aren't loading**
Check image URLs. If you're using Squarespace-hosted images, they should work automatically. For `data-image` attributes, use full absolute URLs.

**Q: Tabs show but layout is broken on mobile**
The plugin is fully responsive. If you see layout issues, make sure the parent container doesn't have `overflow: hidden` or conflicting width constraints.

**Q: The original content is still visible**
The plugin sets `display: none` on the original element. If it's still visible, there may be a CSS specificity conflict — add `#your-element-id { display: none !important; }` to your Custom CSS.

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
