# SEO Modals v1.0.0

**Onassis Signature System — "+" Quick Info + "?" FAQ modals for every Squarespace page.**

Reads client configuration from the Anavo API based on the current domain. Auto-extracts site fonts and colors for seamless style matching. No configuration required per install — just add the script tag.

---

## Installation

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/seo-modals/seo-modals.min.js"></script>
```

Add this to **Settings → Advanced → Code Injection → FOOTER** in Squarespace.

---

## How It Works

1. **Style extraction** — reads computed fonts and colors from the live site, sets CSS vars
2. **API fetch** — calls `api.anavo.tech/api/seo/config?domain=X` to get client config (pages, keywords, NAP, FAQs)
3. **Panel build** — creates "+" Quick Info panel (page nav, topics, contact) and "?" FAQ panel (`<details>/<summary>`)
4. **FAQ Schema** — injects `FAQPage` JSON-LD into `<head>` for current page
5. **Fade/viewport behavior** — buttons appear, fade after 5s, reappear on 5s dwell on last section
6. **Licensing** — async check at +1.5s (non-blocking)

---

## Parameters

Pass as URL query params on the script `src`:

| Parameter    | Default                       | Description                          |
|-------------|-------------------------------|--------------------------------------|
| `apiBase`   | `https://api.anavo.tech`      | Anavo API base URL                   |
| `accentColor` | *(extracted from site)*     | Override accent color (hex or rgb)   |
| `fadeDelay` | `5000`                        | ms before triggers fade out          |
| `dwellTime` | `5000`                        | ms of dwell on last section to reappear |
| `debug`     | `false`                       | Enable console debug logs            |

**Example:**
```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/seo-modals/seo-modals.min.js?fadeDelay=8000&debug=true"></script>
```

---

## Keyboard Shortcuts

| Key       | Action                    |
|-----------|---------------------------|
| `+` or `=` | Toggle Quick Info panel  |
| `?`       | Toggle FAQ panel          |
| `Esc`     | Close active panel        |

---

## Anavo API — Expected Config Shape

```json
{
  "nap": {
    "phone": "+1-XXX-XXX-XXXX",
    "email": "hello@example.com",
    "address": "City, State"
  },
  "client_pages": {
    "home": {
      "title": "Quick Info",
      "keywords": ["wedding photography", "Bay Area", "fine art"],
      "faq": [
        { "question": "What areas do you serve?", "answer": "..." },
        { "question": "What are your packages?",  "answer": "..." }
      ]
    },
    "services": { ... },
    "gallery":  { ... }
  }
}
```

Page keys are derived from the URL pathname (e.g., `/services` → `"services"`, `/` → `"home"`).

---

## CSS Variables

The plugin sets these on `:root` from the live site:

| Variable              | Source                                 |
|-----------------------|----------------------------------------|
| `--onassis-font`      | `document.body` computed `fontFamily`  |
| `--onassis-text`      | `document.body` computed `color`       |
| `--onassis-bg`        | `document.body` computed `backgroundColor` |
| `--onassis-heading`   | `h1` computed `color`                  |
| `--onassis-accent`    | `a` computed `color` (or override)     |

---

## Squarespace Notes

- Insert via **Settings → Advanced → Code Injection → FOOTER**
- CSS uses `!important` throughout for Squarespace override compatibility
- Modals use `z-index: 10000`, buttons use `z-index: 9999`
- Breakpoints: 800px (tablet), 480px (mobile)

---

## Licensing

Commercial license required. Managed by Anavo License Manager.
Contact: [anavo.tech](https://anavo.tech)
