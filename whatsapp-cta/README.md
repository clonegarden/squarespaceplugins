# WhatsApp CTA Button

Floating action button for Squarespace. Supports WhatsApp, phone, booking, email, or any custom URL. Self-injects — no target element needed.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)
![License](https://img.shields.io/badge/license-Commercial-green)

---

## Installation

Add to **Settings → Advanced → Code Injection → Footer**:

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/whatsapp-cta/whatsapp-cta.min.js?type=whatsapp&phone=15551234567"></script>
```

No target element needed — the button injects itself.

---

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `type` | `whatsapp` | `whatsapp` \| `phone` \| `calendar` \| `email` \| `custom` |
| `phone` | — | Phone number in international format, digits only (e.g. `15551234567`) |
| `message` | — | Pre-filled WhatsApp message (URL-encoded) |
| `url` | — | URL for `calendar` or `custom` type |
| `email` | — | Email address for `email` type |
| `color` | type default | Button background color (hex, URL-encoded) |
| `position` | `bottom-right` | `bottom-right` \| `bottom-left` |
| `label` | — | Tooltip label shown on hover |
| `size` | `56` | Button diameter in px |
| `pulse` | `true` | Pulse ring animation |
| `mobileOnly` | `false` | Show on mobile only |
| `newTab` | `true` | Open in new tab |
| `delay` | `1000` | ms before button appears |

---

## Examples

**WhatsApp:**
```html
<script src="...whatsapp-cta.min.js?type=whatsapp&phone=15551234567&message=Hello%2C%20I%27d%20like%20more%20info&position=bottom-right"></script>
```

**Booking (Setmore, Acuity, Calendly):**
```html
<script src="...whatsapp-cta.min.js?type=calendar&url=https://rachelonassis.setmore.com/&label=Book+Now&color=%231a3a5c&pulse=false"></script>
```

**Phone:**
```html
<script src="...whatsapp-cta.min.js?type=phone&phone=+15551234567&color=%234CAF50&label=Call+Us"></script>
```

**Custom (left side, no pulse):**
```html
<script src="...whatsapp-cta.min.js?type=custom&url=/contact&position=bottom-left&pulse=false&label=Get+a+Quote"></script>
```

---

## Default Colors per Type

| Type | Default Color |
|------|--------------|
| whatsapp | `#25D366` |
| phone | `#4CAF50` |
| calendar | `#1a3a5c` |
| email | `#EA4335` |
| custom | `#1a3a5c` |
