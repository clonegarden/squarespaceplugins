# Cookie Consent Banner

GDPR / LGPD compliant cookie consent bar for Squarespace. Stores consent in localStorage with configurable expiry. Optional Google Analytics blocking until consent is given.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)
![License](https://img.shields.io/badge/license-Commercial-green)

---

## Installation

Add to **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/cookie-banner/cookie-banner.min.js?privacyUrl=/privacy-policy&accentColor=%23003366"></script>
```

No target element needed — the banner injects itself.

---

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `message` | `We use cookies...` | Consent message text (URL-encoded) |
| `acceptText` | `Accept` | Accept button label |
| `declineText` | _(empty)_ | Decline button label — omit to hide decline button |
| `privacyUrl` | — | URL to privacy policy page |
| `privacyText` | `Privacy Policy` | Privacy policy link text |
| `position` | `bottom` | `bottom` \| `top` |
| `bgColor` | `#1a1a2e` | Banner background color |
| `textColor` | `#ffffff` | Text color |
| `accentColor` | `#4f8ef7` | Accept button + link color |
| `expiryDays` | `365` | Days before consent expires and banner reappears |
| `blockGA` | `false` | Block Google Analytics until accepted |
| `storageKey` | `anavo_cookie_consent` | localStorage key (change if multiple banners) |

---

## Examples

**Minimal (bottom, no decline):**
```html
<script src="...cookie-banner.min.js?privacyUrl=/privacy&accentColor=%23003366"></script>
```

**With Decline + GA blocking:**
```html
<script src="...cookie-banner.min.js?declineText=Decline&blockGA=true&privacyUrl=/privacy&position=bottom&bgColor=%23111&accentColor=%234f8ef7"></script>
```

**Top bar, branded:**
```html
<script src="...cookie-banner.min.js?position=top&bgColor=%23003366&accentColor=%23ffffff&acceptText=Got+it&message=We+use+cookies+to+improve+your+experience."></script>
```

---

## Compliance Notes

- **LGPD (Brazil):** Requires consent before tracking. Use `blockGA=true`.
- **GDPR (EU):** Requires opt-in consent for non-essential cookies. Use `blockGA=true` + `declineText=Decline`.
- **CCPA (California):** Opt-out model — decline button recommended.
- Consent is stored in `localStorage` with expiry timestamp, not in a cookie (no cookie needed to manage cookie consent).
