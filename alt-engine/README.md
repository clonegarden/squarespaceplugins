# Alt Engine v1.0.0

Auto-injects keyword-rich `alt` attributes on all images using client config from the Anavo API. No UI, no CSS — pure SEO signal injection. Uses MutationObserver to catch lazy-loaded images.

---

## Installation

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/alt-engine/alt-engine.min.js"></script>
```

Add to **Settings → Advanced → Code Injection → FOOTER** in Squarespace.

---

## How It Works

1. Fetches `api.anavo.tech/api/seo/config?domain=X`
2. Builds `src_fragment → suggested_alt` lookup map from `client_images`
3. Scans all `<img>` tags — replaces empty/generic alts with DB suggestion or fallback
4. MutationObserver watches for lazy-loaded images (attributeFilter: `src`, `data-src`, `alt`)
5. Async licensing at +1.5s (non-blocking)

---

## Alt Selection Logic

| Priority | Condition | Result |
|----------|-----------|--------|
| 1 | Alt already good (≥20 chars, non-generic) | Leave untouched |
| 2 | `src` matches a DB `src_fragment` | Use `suggested_alt` from Supabase |
| 3 | Alt is generic/empty | Build fallback: filename + biz name + page keyword |
| 4 | Alt is short but non-generic | Leave untouched |

**Generic patterns detected:** empty, `image`, `photo`, `img`, `picture`, `untitled`, pure numbers, `DSC_*`, `IMG_*`, screenshot, bare extensions.

---

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `apiBase` | `https://api.anavo.tech` | Anavo API base URL |
| `debug`   | `false` | Enable console debug logs |

```html
<script src="...alt-engine.min.js?debug=true"></script>
```

---

## Anavo API — `client_images` shape

The plugin reads `client_images` from the `/api/seo/config` response:

```json
{
  "client_images": [
    { "src_fragment": "Sherri%2C+Wedding+Photography+49.jpg", "suggested_alt": "Sherri LaRocque fine art wedding photography California" },
    { "src_fragment": "carmel-beach", "suggested_alt": "Carmel Beach wedding photographer — Sherri LaRocque Photography" }
  ]
}
```

`src_fragment` is matched as a substring of the image `src` URL.

---

## Licensing

Commercial license required. Managed by Anavo License Manager.
Contact: [anavo.tech](https://anavo.tech)
