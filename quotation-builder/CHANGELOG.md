# Changelog — Quotation Builder

## [2.2.0] — 2026-10-06
### Added
- Every colour, font, interface style, button shape and starting price can now
  be set from the store's Customize dialog and arrives as a script-tag
  parameter. Appearance comes from the tag, content from the saved config —
  where they overlap, an explicitly supplied parameter wins and an absent one
  falls back to the config, so sites already installed keep their look.
- `prices` parameter: a compact `s{step}o{option}` / `s{step}u` encoding that
  overrides only the starting prices the owner actually changed.
- `presets.json`, generated from the plugin source by `npm run export-presets`,
  so the store can list templates and their prices without parsing the widget.
  `npm run validate` fails if it is out of date.
- 109 CSS rules now resolve through `--aqb-*` custom properties on `:root`.
### Changed
- Template selection moved out of the in-page editor panel and into the store.
  An existing config saved as `custom` is relabelled `photographer` and keeps
  its own steps.
- "Start from scratch" is gone. An empty builder with no questions is not
  something an owner finishes alone, so it is replaced by two packages we
  fulfil by hand — Basic (USD 200) and Advanced (USD 500) — linked from the
  two upsell cards in the editor.

## [2.1.1] — 2026-10-05
### Fixed
- Saving a config no longer looks finished when it isn't. The live page keeps
  serving whatever script tag it loaded until the owner replaces it by hand, so
  a save that produces a new `configId` now flags the script tag block until the
  tag is actually copied.

## [2.1.0] — 2026-10-05
### Added
- 13 profession presets (photographer, videographer, wedding planner, makeup
  artist, hair stylist, DJ / live music, event venue, caterer, florist, private
  chef, tattoo artist, personal trainer, start from scratch), selected with the
  `preset` script parameter
- Editable wording: contact and summary headings, subheadings and the price
  disclaimer
- Opt-in copy of the quote to the lead (`emailLead`)
- Honeypot field and form timing on submit, so the API can withhold email from
  automated submissions
- Full Customization upsell block in the editor
### Changed
- Steps are clamped to between 2 and 8
- A failed save shows the actual reason, including an inactive license, instead
  of a generic retry message
### Fixed
- An unknown preset id is normalised before it is stored, so it cannot leak into
  the generated script tag and leave the editor dropdown unselected
- Switching preset keeps a quote name and wording the owner edited, comparing
  against the outgoing preset's defaults rather than keeping or replacing all
- A submit that times out is aborted, so a retry cannot duplicate the lead
- A failure handler no longer runs after a successful submit

## [1.0.0] — 2026-01-20
### Added
- Initial release
- Interactive step-by-step quotation calculator
- Real-time price updates
- 3-box responsive layout (previous question, current question, summary sidebar)
- PDF export functionality
- Contact form integration via session storage
- Full theme customization (colors, fonts, spacing)
- Mobile responsive design
- Licensing system
