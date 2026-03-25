# Quotation Builder

Interactive step-by-step price estimator for wedding, photography, videography, and venue businesses. Floating editor panel in Squarespace edit mode. Config saved to Anavo API — no code changes needed to update questions or prices.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Squarespace](https://img.shields.io/badge/Squarespace-7.0%20%7C%207.1-black)
![License](https://img.shields.io/badge/license-Commercial-green)

---

## Installation

**Step 1 — Add a Code Block** where you want the calculator:

```html
<div id="anavo-quotation"></div>
```

**Step 2 — Add script to Footer** (Settings → Advanced → Code Injection → Footer):

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/quotation-builder/quotation-builder.min.js?configId=YOUR_CONFIG_ID&accentColor=%231a3a5c"></script>
```

No `configId` needed on first install — the plugin loads with a built-in photography/wedding template. Use the editor panel to customize and save your config, then the script tag updates automatically.

---

## How It Works

1. Visitor clicks through steps (single choice, multi-choice, or quantity × price)
2. Running total updates live in the sidebar on every selection
3. Progress bar at top — visitor can click any visited step to jump back and change their answer
4. Final step collects name + email → submits to Anavo API
5. Summary screen shows full breakdown + CTA button (e.g. "Book Now")
6. Notification email fires to the address set in the editor

---

## Step Types

| Type | Description | Example |
|------|-------------|---------|
| `select` | Choose one option, adds its price | Event type → Wedding (+$2500) |
| `multiselect` | Choose multiple, sums prices | Add-ons → Drone + Album |
| `quantity` | Stepper × unit price | 3 photographers × $350/each |

---

## Script URL Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `configId` | _(template)_ | ID returned after saving in the editor |
| `accentColor` | `#1a3a5c` | Brand color (URL-encoded hex) |
| `currency` | `$` | Currency symbol |
| `ctaText` | `Book Now` | CTA button label on summary screen |
| `ctaUrl` | `/contact` | CTA button URL |
| `target` | `#anavo-quotation` | CSS selector for the container div |
| `api` | `https://api.anavo.tech` | API base URL |

---

## Editor Panel (Squarespace Edit Mode)

When you open your Squarespace editor, a floating **Quotation Builder** panel appears bottom-right. From the panel you can:

- Edit the **quote name**, currency, accent color, CTA, and notification email
- Add, reorder, and delete **steps**
- For each step: set title, description, type (single/multi/quantity), required toggle, and options with prices
- Click **Save & Preview** → config saves to Anavo API and the widget re-renders immediately
- Copy the updated **script tag** with the new `configId`

---

## Built-in Template (Wedding / Photography)

Default steps loaded when no `configId` is set:

| Step | Type | Example options |
|------|------|-----------------|
| Event Type | Single choice | Wedding, Engagement, Corporate, Portrait |
| Coverage Duration | Quantity | 1–16 hours × $200/hr |
| Photographers | Quantity | 1–4 photographers × $350/each |
| Videography | Single choice | None, Highlight Reel, Full Film, Cinematic |
| Add-ons | Multiple choice | Drone, Same-day Slideshow, Album, Photo Booth |
| Delivery Timeline | Single choice | Standard / Rush / Express |

---

## Backend (Anavo API)

Two endpoints power this plugin:

**`GET /api/quotation/config`** — loads saved config by domain + configId
**`POST /api/quotation/config`** — saves/updates config from the editor
**`POST /api/quotation/submit`** — saves completed quote + fires notification email

Run `migrations/quotation-builder-migration.sql` in Supabase before deploying.

### Email notifications

Set `notifyEmail` in the editor. Email requires these env vars in your Vercel project:

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=yourpassword
EMAIL_FROM=noreply@example.com
```

If not configured, submissions still save to the database — email is silently skipped.

---

## Examples

**Photography studio:**
```html
<div id="anavo-quotation"></div>
<script src="...quotation-builder.min.js?configId=photo-studio-abc123&accentColor=%23c8a26b&ctaText=Request+a+Quote&ctaUrl=/contact"></script>
```

**Wedding venue:**
```html
<div id="anavo-quotation"></div>
<script src="...quotation-builder.min.js?configId=venue-oak-hall-xyz&currency=%E2%82%AC&accentColor=%23003366&ctaText=Check+Availability&ctaUrl=/booking"></script>
```

**Videographer:**
```html
<div id="anavo-quotation"></div>
<script src="...quotation-builder.min.js?configId=video-studio-def&accentColor=%23e74c3c&ctaText=Book+Now"></script>
```
