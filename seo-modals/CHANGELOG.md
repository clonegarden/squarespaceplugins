# SEO Modals — Changelog

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
