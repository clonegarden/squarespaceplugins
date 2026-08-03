# SEO Modals — Changelog

## [2.0.0] — 2026-08-03

Brought in line with the copy-paste widget standard every other client receives
(`01-SEO-Clients/WIDGETS-SHARED.md` v3, `/seo` §3.4–3.6).

### Changed — BREAKING
- **Namespace `anavo-seo-*` → `seo-anavo-*`** (191 identifiers) and globals are now
  `seoAnavoOpen / seoAnavoClose / seoAnavoFont / seoAnavoHC`. The bare `anavo-*`
  prefix collides with client-installed `anavo-*` plugins — that collision froze
  AB Social on 2026-07-16.
- Panels are **full-height right-hand drawers with an overlay**, not bottom-right cards.
- z-index: panel `2147483001`, overlay `2147483000`, triggers `2147482000` — above
  client sticky headers, which commonly sit at 99999.
- Style extraction is **WCAG-safe**: an extracted colour is only used if it clears a
  3.5 contrast ratio against the panel background, else safe ink. Fixes washed-out
  and white-on-white panel text on sites whose body text sits over a dark hero.
- Single 480px breakpoint, matching the standard.

### Added
- The three hardening rules: `.seo-anavo-panel[hidden]{display:none!important}`,
  idempotent `closePanel` teardown (always clears overlay + `body.overflow`),
  and a foreign-id guard so `openPanel` only ever drives our own panels.
- Dofollow `.secret-link` credit + keyboard hint in the panel footer.
- Per-type panel classes (`.seo-anavo-faq-panel` / `.seo-anavo-info-panel`).

### Not included, deliberately
- `speakable` and the rest of the schema stack stay in the **static pasted blocks**.
  JS-injected JSON-LD is unreliable for Google — `schema-engine.js` was killed for
  exactly this. The existing FAQ JSON-LD injection is left only for back-compat.

## [1.0.0] — 2026-03-24

### Added
- Initial release
- "+" Quick Info panel: page navigation (h2/h3), keyword tags, NAP contact
- "?" FAQ panel: `<details>/<summary>` accordion, FAQPage JSON-LD schema injection
- Auto domain detection → Anavo API config fetch (`api.anavo.tech`)
- Site style extraction: font, text color, bg, heading, accent → CSS vars
- Fade/viewport timing: buttons fade after 5s, reappear on 5s dwell on last section
- Keyboard shortcuts: `+`/`=` for Quick Info, `?` for FAQ, `Esc` to close
- Mutual exclusion: opening one panel closes the other
- URL parameter config: `apiBase`, `accentColor`, `fadeDelay`, `dwellTime`, `debug`
- Async licensing at +1.5s (non-blocking)
- Fully responsive: 800px tablet, 480px mobile breakpoints
- `!important` CSS throughout for Squarespace compatibility
- ARIA roles, focus management, `prefers-reduced-motion` support
