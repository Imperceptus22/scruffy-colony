# Diorama night layer

User-selected direction, 25 October 2026: the Diorama style adopts the scruffycolony.de homepage language (night ground #0b171c, ivory text, bronze actions, gold hairlines, Crimson-style serif headings) while the combat screen keeps the approved concept materials (forest clearing, nailed parchment cards, wood signs, wooden grid frame). Previous graphics stays unchanged and selectable.

## header-strip

- Source: `docs/design/diorama/reference-combat.png` (approved concept, 1706×3688, SHA-256 `26449949fbf5abe34ea0c6ca0fd1e978e0ca5d969aa57eed67c60556ff5c0348`), crop x 0–1706, y 0–196.
- The painted "Zone 34" text was replaced by the adjacent plank (x 948–988, y 62–146) stretched horizontally to 264 px and feathered over 18 px at both ends; the plank grain runs horizontally, so the stretch keeps it continuous. Wordmark, leaf, divider, nails and More plate are unchanged pixels.
- `header-strip.png` here is the lossless working copy (SHA-256 `6ffd438ecaafc3739493d966c7f29784ba2d6eaf5e371b546536c1b4601c74aa`); the app ships `mobile-assets/diorama-night/header-strip.webp` (WebP quality 92).
- In the app the wordmark is decorative image content; the live zone number and a transparent, accessible More button sit on top.

## header-strip cut-out (alpha)

- 25 October 2026: the app strip no longer carries the concept forest. `cut-header-strip.cjs` keeps only the plank and the More plate of `header-strip.png` behind an alpha mask, so each page's scene runs up behind the header to the top edge.
- Plank: per-column edges traced from the warm wood tones (median-smoothed, 1 px soft edge); the leaf-covered left end (x 124–151) is rebuilt by mirroring the clean plank at x 152–179 and darkened over 12 px as a burnt end. More plate: chamfered rectangle x 1323–1655, y 31–180, corner 22 px.
- The app ships the result as `mobile-assets/diorama-night/header-strip.webp` (WebP quality 92, alpha quality 100, SHA-256 `05ba01c740368e30a714a3ecaca11ae92e00be537a5eb31165102d4508d1367f`). The script is deterministic; re-running it on the working copy reproduces the same PNG.
