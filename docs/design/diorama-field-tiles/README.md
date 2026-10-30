# Diorama field tiles

> Hinweis (27.10.2026): Die hier genannten Nachweis-Skripte wurden mit V-211 aus `tools/` entfernt; sie liegen in der Git-Historie (`git log --diff-filter=D -- tools/`). Gepflegte Werkzeuge: [tools/README.md](../../../tools/README.md).

## Current state: painted tiles (4.28)

User decision, 25 October 2026: the field tiles are repainted with an image tool (`NEU-MALEN-AUFTRAG.md`). The concept cuts F01–F10 described further below were only the style references; the app now ships 32 painted tiles. The sections after this one record the earlier concept cut.

- **Source:** two unchanged image-tool boards, `source/tafel-a.png` (attempt A4) and `source/tafel-b.png` (attempt B3), each 1254 × 1254 px with 16 tiles. Prompts, references, attempts and the per-tile self check are in `source/PROMPTS.md`. SHA-256 is recorded there and checked by `tests/mobile-diorama-field-tiles.test.cjs`.
- **Cut:** `cut-painted-tiles.cjs`, output `painted-crops.json`. The board ground is 28–30 luminance, the cast shadow below each tile 20–26, the earth edge from about 40. Each tile is found as one of the 16 largest areas brighter than 36 on its board (no fixed quarters), ordered row by row. A pixel belongs to the tile when it lies between the outermost tile pixels of both its row and its column (the tiles are convex rounded squares), so dark surfaces such as void and depths stay whole. The outline gets a one-pixel soft edge; the cast shadow is dropped, contact shadows on the tile stay. No scaling: each tile ships at its painted size (A about 224 × 222 px, B about 259 × 210 px) as WebP quality 90, alpha quality 100, with a lossless copy in `painted/`.
- **Proportions:** board A tiles are about 1.0:1, board B about 1.2–1.28:1 (the brief asked 1.12:1). The app draws them with `contain` in square cells, so B tiles (map ground) sit with a slightly larger gap above and below; nothing is stretched.
- **Mapping** (CSS in `mobile-diorama-page-battle.css`, one `--dio-field` per cell):

| Tiles | Used for |
| --- | --- |
| F01, F02, F03, F11 (A1–A4) | meadow, four variants along each row, shifted by two on every other row |
| F04 tree, F05 food, F06 ore, F07 gems, F08 book, F09 gift | `glyphicon-tree-deciduous`, `glyphicon-apple`, `icon-cubes`, `icon-diamond`, `glyphicon-book`, `glyphicon-gift` |
| F10 cleared, F12 overkill | `cellColorBeaten`, `cellColorOverkill` (exact base classes) |
| F13 fragments, F14 worker, F15 plans, F16 unique map | `glyphicon-th`, `glyphicon-user`, `glyphicon-question-sign`, `glyphicon-th-large` |
| F17 mixed loot, F18 blueprint | `icon-leaf2`, `glyphicon-home` |
| F21/F29 mountain, F22/F30 forest, F25/F31 garden, F26/F32 farmland | map ground of Mountain, Forest, Plentiful (Gardens), Farmlands on a checkerboard |
| F19/F20 sand + F23 shore | Sea maps (shore on every fifth cell, shifted per row) |
| F24 depths | Depths maps (F27 void is a working copy only, superseded by the void board below) |
| F28 clover | joins the meadow on maps of other locations |

- The map biome comes from the original location of the running map: `mobile-diorama.js` writes it as `#mapGrid[data-biome]` (nothing paints it in Previous graphics).
- Cell states are unchanged from the rules below: only exact original base states get a tile, orange seasonal cells show their normal tile with the gold corner, snow and every other state keep their original colours, Darkness and Liquimp grids keep theirs (Liquimp zones 60–80 carry the joined class `gridOverlayGreenGradientNliquid`, matched by `[class*="liquid"]`). Seasonal overkill cells (`cellColorOverkill Pumpkimp`) show broken stone with the gold corner like seasonal beaten cells. The old terrain rules T02/T03 of the combat page are replaced; T01 and the T04–T09 markers remain for cells without a painted tile.
- **Known deviations, accepted with the boards:** A5 tree reads as a conifer; A11 cleared slab has a raised stone frame; A12 overkill shows broken stone without clear scorch marks; A16 unique map is partly rolled; B8 depths crystals and B11 void veins are bright; several objects are larger than the requested 55 % of the tile width; resolution 1254 instead of 2048 px (enough: a cell is about 92 device px).
- Comparisons: `vergleich-gemalt-vorher-nachher.jpg` (concept, 4.23 before, after; browser audit `battle-live`, 411 px) and `vergleich-gemalt-biome.jpg` (map grid of the `map` fixture with its real Sea biome, then each biome by attribute for the record).
- Device check (emulator BoxMerker_API36, Debug 4.28 as a separate test package, isolated Development slot, real system font 100 % and 130 %): `native-gemalt-api36-welt.jpg`, `native-gemalt-api36-welt-130.jpg` (world grid, `combat` fixture) and `native-gemalt-api36-karte-sea.jpg` (map grid of the `map` fixture; its real location Sea reaches `#mapGrid[data-biome]`, sand with shore tiles). No overflow, no page errors; both passes returned to the original save.

User-selected direction, 25 October 2026: the combat grid uses tiles cut directly from the approved combat concept. Terrain and marker are painted together there, with one light direction and earth edges. Tiles the concept does not contain are painted later as one shared sheet by an image tool (see below) and cut here. The tiles were not composed from T01–T09, and the grid is not one image.

## Void board (V-183, 4.68)

Void Maps add `voidCell` after the state class of every cell (`main.js`), so the base-state tiles never reached them and the grid stayed flat violet with glyphs. User decision, 25 October 2026: a third board in the same style, with a dark void ground; after the review the user asked for one correction round (equal tile heights, varied pebbles in the earth edge), then released version 2 for integration and asked for the heights to be evened out when cutting.

- **Source:** `source/tafel-c-void.png` (correction attempt 3 of 3, SHA-256 `1d91e89c…4da3540e`). Brief `MALAUFTRAG-V183-VOID.md` (the full prompt with the reference sheet lay in Google Drive, "<drive>/Trimps Mobile/Malauftrag V-183 Void"), correction brief `NACHBESSERUNG-V183-VOID.md`, both prompts and the attempts in `source/PROMPTS.md`. The tool rendered 1254 × 1254 px; the whole board was scaled to 2048 × 2048 px without cropping and set on flat #2b1a0e.
- **Measured before the cut** (2048 px board, outline with contact shadow): tile heights 404 / 416–417 / 421 / 408 px per row (limit was ±4 px), widths 460–466 px, ratio 1.09–1.15, horizontal gaps 31–33 px. Motifs, colours and positions match version 1; the void ground is slightly lighter and more violet, the repeated light pebbles in the earth edge are gone.
- **Cut:** `cut-painted-tiles.cjs --board c-void`. The slab has black stone joints, so the tile search bridges seams of up to 12 px (`BRIDGE`) and traces the outline from the undilated bright pixels. Every tile is then resampled to one common size, 283 × 252 px plus the 2 px margin (`NORMALIZE`, about the 1254 px render scale), which changes the vertical scale by at most about 4 %. Boards A and B are untouched (same crops and files).
- **Mapping** (CSS in `mobile-diorama-page-battle.css`, own variable `--dio-void`, so normal ground and marker tiles never reach a void cell):

| Tiles | Used for |
| --- | --- |
| F33 void-a, F34 void-b (pebbles), F35 void-c, F36 void-d (crystals), F45 void-e (swirl), F46 void-f (crack), F47 void-g (mushrooms), F48 void-h (stones) | void ground, four variants along each row, the other four on every other row |
| F37 gems, F38 mixed loot, F41 tree, F42 food, F43 ore, F44 book | `icon-diamond`, `icon-leaf2` (the ♣ of Void Maps), `glyphicon-tree-deciduous`, `glyphicon-apple`, `icon-cubes`, `glyphicon-book` |
| F39 cleared, F40 overkill | `cellColorBeaten`, `cellColorOverkill` (collected marker transparent) |

- **Cell states:** only exact void base states (`battleCell cellColor{NotBeaten,Current,Beaten,Overkill} voidCell`, optionally with `mapPumpkimp` before `voidCell`). The current cell keeps its glow outline; current and seasonal cells get the light void ink for their glyph (the original inks are black, made for the yellow and orange fills), seasonal cells keep the gold corner; snow (`CorruptSnow`) and every other extra class keep their original colours. With the snow option on (after Presimpt), the original gives every void map cell `CorruptSnow`, so those players keep the original void map. Markers without a void tile (fragments, unique map, blueprint and others) stay as glyphs on the void ground.
- **Proof:** `tools/void-field-tiles-proof.cjs` (a running Void Map from the `map` fixture through the original `createVoidMap`, `selectMap` and `MobileMapMenu.start`, with beaten, overkill, current and seasonal cells), browser 412 px / 100 % and 360 px / 130 %, before and after; emulator BoxMerker_API36.
- **Known deviations, accepted:** heights evened out by resampling instead of a painted fix; source scaled up from 1254 px (the shipped tiles are below that scale again); the swirl on F45 reads slightly like a spiral; the tree leaves are bright magenta rather than dark.

## World mutations board (V-193, 4.88)

In the world grid the original builder adds the mutation after the state class (`main.js`: `className.push(cell.mutation)`), so Magma (red), Corruption (violet) and Healthy cells never reached the base-state tiles and stayed flat fills, beaten ones flat green. User decision, 26 October 2026: a fourth board in the same style, painted on the user's behalf with the integrated image tool (brief `MALAUFTRAG-V193-SONDERFELDER.md`).

- **Source:** `source/tafel-d-sonderfelder.png` (attempt 3 of 3, 1254 × 1254 px, SHA-256 `2cabd2ea…4916098f`), prompts and handover in `source/PROMPTS.md`.
- **Cut:** `cut-painted-tiles.cjs --board d-sonderfelder`, same threshold as boards A and B (the board ground measures luminance 28–31), shipped at painted size (252–260 × 223–241 px, above the 92 device px of a cell).
- **Mapping** (CSS in `mobile-diorama-page-battle.css`, world grid `#grid` only, own variable `--dio-mut`):

| Tiles | Used for |
| --- | --- |
| F49–F52 magma-a…d | Magma ground, four variants along each row, shifted by two on every other row |
| F53–F56 corruption-a…d | Corruption ground, likewise |
| F57, F58 healthy-a/b | Healthy ground, alternating |
| F59/F60 magma-cleared-a/b, F61 corruption-cleared, F62 healthy-cleared | `cellColorBeaten` with the mutation (slab with magma crack, violet vein, green shoots) |
| F63 magma-overkill, F64 corruption-overkill, F12 overkill | `cellColorOverkill` with Magma, Corruption, Healthy (the board has no healthy overkill tile) |

- **Cell states:** only exact mutation base states (`battleCell cellColor{NotBeaten,Current,Beaten,Overkill} {Magma,Corruption,Healthy}`, optionally with the world season class `Pumpkimp`). Markers have no mutation tiles: they stay as their marker art or glyph on the special ground, magma and corruption in their original light inks, healthy in a dark ink; beaten and overkill cells hide their collected marker. The current cell keeps its glowing outline, seasonal cells the gold corner. Snow (`TrimpmasSnow` on mutation cells, `HotSnow`, `CorruptSnow`, `HealthySnow` on plain cells next to them; user decision 25 October 2026), empowerment, spire cells and Previous graphics keep their original colours.
- **Proof:** `tools/mutation-field-tiles-proof.cjs` (combat fixture, mutations drawn by the original `drawGrid`, states from `swapClass`), browser 412 px / 100 % and 360 px / 130 %, before and after: `vergleich-sonderfelder-vorher-nachher.jpg`; emulator BoxMerker_API36: `native-sonderfelder-api36.jpg`.
- **Known deviations:** listed by the user in the handover of 26 October 2026 ("noch nicht vollständig abnahmefähig"), which hands the board over with the order to cut and build it in; no further correction round was requested: 1254 instead of 2048 px; the board ground has a faint brown gradient instead of flat #2b1a0e (no effect on the cut); the golden shimmer of the healthy meadow is weak; rows 3–4 are about 13 px taller than rows 1–2; the four recessed checks are the only symbols, as required.

## Source and cut

- Superseded in 4.28: `cut-field-tiles.cjs` now writes its WebP to `concept-cut/` only; the shipped tiles come from `cut-painted-tiles.cjs`.
- Source: `docs/design/diorama/reference-combat.png` (approved concept, 1706×3688, SHA-256 `26449949fbf5abe34ea0c6ca0fd1e978e0ca5d969aa57eed67c60556ff5c0348`).
- The painted 10×10 grid is a slight trapezoid. Row joints were measured at y 1318, 1452, 1586, 1724, 1862, 2002, 2142, 2282, 2423, 2570 and 2716. Column joints were measured in the top and bottom rows; the rows in between are interpolated. The values are in `cut-field-tiles.cjs`.
- Resolution, measured: one shipped tile is 145–153 px wide and 132–155 px tall. In the app a cell is about 35 CSS px wide at 411 px screen width, which is about 92 device pixels at 2.625 dpr (1080×2340). The cut tiles therefore ship at their original size with about 1.6× headroom, without upscaling.
- `cut-field-tiles.cjs` is deterministic. For each tile it traces the painted edges inside its grid box: the dark wood joint has luminance 25–38, the thin earth edge 45–75, and the threshold is 42. It then sets alpha behind a rounded rectangle (radius 14 px) and also makes joint-dark pixels in the corners transparent. Output: lossless working copies `F*.png` here and WebP quality 90 with alpha quality 100 in `app/src/main/assets/game/mobile-assets/diorama-field/`. `crops.json` records every crop rectangle; it is the script's output (`node cut-field-tiles.cjs > crops.json`). If an edge is not found within 14 px, the script stops with an error instead of guessing.
- The beaten stone block (concept cell row 9, column 0) sits on the grid frame next to the glowing current cell. Its box is set by hand (x 55–207, y 2577–2731, radius 20) so the glow of the neighbouring cell is not included.

| Tile | Concept cell (row, column) | Used for (original class) |
| --- | --- | --- |
| F01-grass-a, F02-grass-b, F03-grass-c | 0/7, 1/5, 1/6 | Cell without marker, three variants alternating along the rows |
| F04-tree | 0/6 | `glyphicon-tree-deciduous` (wood) |
| F05-food | 0/4 | `glyphicon-apple` (food) |
| F06-ore | 0/2 | `icon-cubes` (metal) |
| F07-gems | 0/5 | `icon-diamond` (gems) |
| F08-book | 0/9 | `glyphicon-book` (upgrade) |
| F09-gift | 8/5 | `glyphicon-gift` (Battle Territory Bonus, housing `fiveTrimpMax`) |
| F10-cleared | 9/0 | `cellColorBeaten` |

SHA-256 of the working copies: F01 `d476216098d7a9c2…`, F02 `a5a9be58f1eeb1d1…`, F03 `9f321a40b1d7828f…`, F04 `9cf1cb11127b4f45…`, F05 `002b1e7646a96bde…`, F06 `ebd04dc2b3a7f59a…`, F07 `e0c2809d8767bbcc…`, F08 `8c84b4c0974e86d7…`, F09 `4528bd44ca184d6e…`, F10 `5fb573e01d35dc46…` (full values via `sha256sum`). Shipped WebP: F01 `582b512fe6e5431c…`, F02 `3206809413cb86e5…`, F03 `f0b9b1f4887bc663…`, F04 `1d311e5ed8af40fc…`, F05 `e5d905a6a61b63b4…`, F06 `f7ef5330f7c18cea…`, F07 `6f3735304103d5a7…`, F08 `45a6548969d3934a…`, F09 `e133039e76351345…`, F10 `afa3009ee8f0655e…`.

## Cell states

- A tile appears only when a cell's class is exactly an original base state: `battleCell cellColorNotBeaten`, `cellColorCurrent` or `cellColorBeaten`.
- Orange seasonal cells may additionally carry the original season class `mapPumpkimp` (maps) or `Pumpkimp` (world, visual mutation). User decision on 25 October 2026 ("die orange eingefärbten saisonalen Zellen nicht mehr"): in Diorama they no longer get the orange season fill. They show the normal concept tile, and the season is marked by a small gold corner (2 px hairline top right, no fill colour). The DOM and the marker stay unchanged. Comparison: `vergleich-saisonal-vorher-nachher.jpg`.
- Snow cells (`TrimpmasSnow`, white rather than orange; confirmed by the user on 25 October 2026: snow cells stay original), empowerment, season plus mutation (`CorruptSnow`, `HotSnow`, `HealthySnow`) and every other original state class keep their original colour. World mutation cells (Magma, Corruption, Healthy) have their own board D since 4.88, see above.
- Grids coloured through a container class keep their original look: the Darkness map (`#mapGrid.blackMap`) and Liquimp zones (`#grid.liquid`).
- The current cell keeps its glow outline as a CSS layer. Beaten and overkill cells keep the existing dimming.
- Beaten cells show the painted check (F10, drawn with `contain` so the square stone block keeps its proportions). Their collected marker stays in the DOM but is transparent, as in the concept.
- A marker is hidden only on a cell that actually shows its painted tile (`:has()`), so without tile support the glyph stays visible.
- The marker element stays in place, only transparent. Its name and the original handlers are unchanged.
- Markers without their own tile stay as glyphs on the grass tile.

## Comparison

`vergleich-konzept-vorher-nachher.jpg`: concept grid, before (4.13, T01–T09 with separate markers), after (F01–F10). Taken with the browser audit, view `battle-live`, 411 px.

## Missing types (not in the concept)

| # | Type | Original source | Today |
| --- | --- | --- | --- |
| 1 | Worker/job unlock | `glyphicon-user` (worldUnlocks, e.g. new jobs) | T09 marker on grass |
| 2 | Equipment plans | `glyphicon-question-sign` (Shield, Boots, … "You found plans") | Original glyph |
| 3 | Unique map found | `glyphicon-th-large` (The Block and other unique maps) | Original glyph |
| 13 | Map fragments | `glyphicon-th` (every 10th world cell) | T06 ore marker on grass (old mapping; fragments need their own art) |
| 14 | Mixed map loot | `*leaf2` (food, wood and metal) | Original glyph |
| 15 | Building blueprints | `home` (Nursery and other blueprints) | Original glyph |
| 4 | Overkill terrain | `cellColorOverkill` | T03 stone |
| 5–11 | Map ground per biome | Map biomes Mountain, Forest, Sea, Depths, Gardens, Farmlands, Void (map grid) | Grass tiles |
| 12 | Cleared sand without marker | reserve for map cells without loot | – |

Rare special icons (challenges, exotic imps, `glyphicon-heart`, `-flag`, `-oil` and others) stay as glyphs on the terrain tile. Broken Planet books (`brokenUpgrade`, originally purple) use the standard F08 book, as they already used T07 before.

## Image prompt for the missing tiles

Attach as style references: `F01-grass-a.png`, `F04-tree.png`, `F05-food.png`, `F09-gift.png`, `F10-cleared.png` and `docs/design/diorama/reference-combat.png`. Then use:

> Create ONE square image, at least 1024×1024 px (ideally 2048×2048), containing a 4×4 grid of 16 separate game field tiles on a flat, plain dark brown background (#2b1a0e). Leave at least 24 px of empty background between tiles and around the edge. Every tile must match the attached reference tiles exactly in style: hand-painted cozy fantasy diorama, slightly top-down 3/4 view, rounded square grass top with a thin brown earth edge visible at the bottom, soft light from the upper left, warm saturated colours, fine detail, no outlines, no text, no labels, no numbers, no UI frames. Tile proportions about 1.12:1 (width:height), all tiles the same size. The object on each tile is centred, delicate and about 55 % of the tile width, painted together with the ground (contact shadow on the ground), never extending beyond the tile.
> Row 1: (1) grass tile with a small carved wooden figure of a little furry worker holding a tool; (2) grass tile with a rolled parchment blueprint tied with a red ribbon and a small hammer; (3) grass tile with a folded treasure map with a red X, partly unrolled; (4) cracked grey stone ground tile, scorched and broken, no object.
> Row 2: (5) rocky mountain ground tile, grey stones and sparse grass; (6) dense forest-floor tile, moss, fallen leaves, small ferns; (7) shallow sea shore tile, wet sand with clear blue water on one corner, shells; (8) dark depths tile, damp dark stone with faint glowing blue crystals in cracks.
> Row 3: (9) garden tile, neat flower beds with colourful blossoms; (10) farmland tile, tilled soil rows with small green sprouts; (11) void tile, dark purple-black ground with faint violet glowing veins; (12) plain sandy cleared ground tile with a few pebbles, no object.
> Row 4: (13) grass tile with a small pile of torn, glowing parchment map fragments; (14) grass tile with a small woven basket holding a loaf, a log and an iron ingot together; (15) grass tile with a rolled building blueprint and a tiny wooden house model; (16) one more plain grass tile like the reference with slightly different small flowers and pebbles, no object.
> Keep the colours and lighting consistent across all 16 tiles so they sit side by side in one grid.

After generation: put the image in `docs/design/diorama-field-tiles/source/` (historic; done in 4.28 with `cut-painted-tiles.cjs`, see the top of this file). The cut, the mapping to the original classes and a new comparison image are done here.

## Device check

`native-api36-zone300.png`: emulator BoxMerker_API36 (1080×2340, 2.625 dpr), debug APK 4.18, isolated development slot (`masteries`, zone 300). A cell measured 35.2 CSS px, which is 92 device pixels. The red and purple special cells keep their original state colours, and the unlock marker (T09) and other rare markers stay as symbols. Afterwards the emulator was returned to slot 1.

`native-api36-beaten.png` and `browser-beaten-current.jpg`: the first 12 cells were switched to beaten with the original `swapClass('cellColor','cellColorBeaten', cell)`, and in the browser one cell to current. Base cells show only the painted check, the current cell keeps its glow, and beaten special cells take their original beaten colour (green).
