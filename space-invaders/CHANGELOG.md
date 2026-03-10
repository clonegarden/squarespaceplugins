# Changelog - Space Invaders Plugin

All notable changes to this project will be documented in this file.

## [2.5.1] - 2026-03-10

### Added
- 🌊 **Multi-wave gameplay** — game continues through unlimited waves; when a wave is cleared a "Keep Playing?" interstitial appears with Continue / End Game options
- 📊 `getScore()` — public API method returning the current score
- 🏆 `getItems()` / `getBadges()` — public API methods returning the list of earned item objects
- 🔍 `getState()` — public API method returning `{ score, wave, earnedItems, running }`
- 🎮 **Floating relaunch button** — clicking Skip or Close now permanently disables auto-triggers and inserts a floating button so the player can reopen the game at will
- ♿ Accessibility: wave-clear interstitial is focusable with `role="dialog"` and `aria-modal`; mobile control buttons have `aria-label` attributes
- 🎨 `prefers-reduced-motion` support — interstitial and game-over animations are disabled when the user prefers reduced motion

### Changed
- `skipGame()` — now permanently disables all auto-triggers (scroll, time, key) and inserts a floating relaunch button; game no longer auto-reprompts after skip
- `cleanupGame()` — now removes ALL injected DOM: overlay, styles, watermark, trigger button, post-game button, items overlay
- Wave counter now resets to 0 on `reset()` so the first wave is always Wave 1
- Difficulty speed multiplier is applied only when starting a new wave (no mid-wave acceleration)
- `maybeDisableTriggers()` now unconditionally removes scroll and keyboard trigger listeners

### Fixed
- Portfolio panel `#anavo-si-portfolio-progress` and `#anavo-si-portfolio-items` DOM IDs are present and update live
- Repeated init/start/skip/reset cycles no longer leak handlers or DOM elements
- Post-game floating button is inserted on skip regardless of the `postGameButton` config parameter

---

## [1.0.0] - 2026-02-19

### Added
- ✨ Initial release of Space Invaders game plugin
- 🎮 Classic Space Invaders gameplay mechanics
- 🏆 Tech badge unlock system (8 default badges)
- 🎨 Full customization via URL parameters
- 📱 Mobile responsive design
- 🖱️ Mouse + click controls; touch controls for mobile
- 🔐 Commercial licensing integration
- 📊 Score tracking system
- 💥 Fragment explosion effects
- 🎯 Collision detection
- 🌊 Wave spawning system
- 📋 Tech stack table display
- ⚙️ Difficulty settings (easy/medium/hard)
- 🚀 Auto-start mode
- 🎨 Custom shooter icons
- 🖼️ Custom invader images
- 🎨 Color customization (bg, font)
- 📜 Scroll detection (auto-hide on scroll)
- ♿ Accessibility features
- 🌐 Global JavaScript API

### Features
- Zero dependencies (pure vanilla JS)
- Lightweight (~15KB minified)
- Works with Squarespace 7.0 and 7.1
- Compatible with all modern browsers
- Development mode support (free on localhost)
- Watermark on unlicensed domains

---

**Format:** Based on [Keep a Changelog](https://keepachangelog.com/)
**Versioning:** [Semantic Versioning](https://semver.org/)
