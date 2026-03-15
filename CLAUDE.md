# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Big Boom Coffee Company — digital menu board system for two in-store TVs.
GitHub: https://github.com/swatts93/Big-Boom-Coffee-Menu

## Architecture

Pure static HTML/CSS/JS — no build step, no npm, no bundler.

| File | Role |
|------|------|
| `landscape.html` | 3-column menu display for the horizontal TV (1920×1080) |
| `portrait.html` | Rotating single-section display for the vertical TV (1080×1920) |
| `admin.html` | Password-protected menu editor; writes to Firebase Realtime Database |
| `js/config.js` | Firebase credentials + `ADMIN_PASSWORD` + `SECTION_ROTATION_SECONDS` |
| `js/menu-data.js` | `DEFAULT_MENU` object (fallback when Firebase isn't configured) + `normalizeMenu()` / `toArray()` helpers |
| `css/style.css` | Shared CSS variables (brand colors) and base resets |

**Real-time flow:** `admin.html` writes to Firebase → Firebase pushes to `landscape.html` and `portrait.html` via `.on('value', …)` listeners. Both display pages fall back to `DEFAULT_MENU` if Firebase is unconfigured.

**Firebase array quirk:** Firebase Realtime Database converts JS arrays to `{0: …, 1: …}` objects. `toArray()` in `menu-data.js` normalizes them back. Always call `normalizeMenu()` on data read from Firebase before rendering.

## Brand colors (from Logo.jpeg)

```
--orange:    #d4712a   (sunburst accent — primary)
--sage:      #8a9560   (logo background — secondary)
--rust:      #a84b28   (arc text)
--brown-dk:  #1a0e05   (page background)
--cream:     #f2e4c6   (primary text)
```

## Menu data structure

Each item in `DEFAULT_MENU.sections[n].items` can have:
- `id` (string slug, required)
- `name` (string, required)
- `price` (string like `"6.49"`) — for single-price items
- `sizes` (array of `{label, price}`) — for coffee-style multi-size items
- `description` (string) — shown in portrait view
- `note` (string) — modifier text, e.g. `"Hot or Iced"`
- `subCategory` (string) — renders a divider label, e.g. `"Bakery"`
- `badge` (string) — small pill label, e.g. `"Coming Soon!"`
- `special` (bool) — renders as a highlighted card (used for LIT TEA)
- `soldOut` (bool) — dims the item and adds SOLD OUT label
- `hidden` (bool) — item kept in DB but not rendered on displays

## TV display specs

- Landscape TV: 1920×1080 CSS pixels, 3-column layout (Coffee / Breakfast / Lunch)
- Portrait TV: 1080×1920 CSS pixels, one section at a time with auto-rotation
- Font sizes are tuned for 55"+ screens at ~10ft viewing distance

## Toast POS

The owner uses Toast POS at `https://bigboomcoffeecompany.toast.site/menu`.
That site returns 403 to automated requests. Toast has an official developer API
(`https://developer.toasttab.com`) that could enable auto-sync — see `SETUP.md`.
