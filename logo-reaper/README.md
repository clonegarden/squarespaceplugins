# Logo Reaper Plugin

Animated marquee of company logos that enter from the right. When a logo reaches the trigger position it receives a random **stamp word** + a **particle explosion**, then falls into a dead-logo pile stacked in the left corner of the block. Loops infinitely.

![Version](https://img.shields.io/badge/version-1.3.0-blue)
![License](https://img.shields.io/badge/license-Commercial-red)

---

## ✨ Features

- 🎬 **Continuous logo marquee** – logos scroll right-to-left, infinitely
- 💀 **Death sequence** – stamp overlay + particle burst at trigger position, then falls into pile
- 📦 **Dead-logo pile** – logos stack in the bottom-left corner of the block
- 🖼️ **SVG + raster logos** – use any `<img src="…">` compatible URL
- ↔️ **Constant spacing** – configurable gap between logos; logos never overlap (even with mixed aspect ratios)
- 🖱️ **Click-to-kill** – optionally allow clicking a logo to trigger death immediately
- ⏸️ **Pause on hover** – optional; respects `prefers-reduced-motion`
- 🔧 **Zero dependencies** – pure Vanilla JS, compatible with Squarespace 7.0 / 7.1
- 🔐 **Non-blocking licensing** – renders immediately; license checked in background

---

## 🚀 Quick Start

Paste into **Settings → Advanced → Code Injection → Footer** (or any Squarespace code block):

```html
<script src="https://cdn.jsdelivr.net/gh/clonegarden/squarespaceplugins@latest/logo-reaper/logo-reaper.min.js?logos=%5B%22https%3A%2F%2Fexample.com%2Flogo1.svg%22%2C%22https%3A%2F%2Fexample.com%2Flogo2.svg%22%5D&height=220&selector=%23logo-section"></script>