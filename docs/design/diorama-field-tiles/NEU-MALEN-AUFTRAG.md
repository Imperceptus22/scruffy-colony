# Feldkacheln neu malen – Auftrag für das Bildwerkzeug

Stand 25.10.2026. Nutzerentscheidung: „Feldkacheln mit einem Bildwerkzeug neu malen lassen.“ Die Kacheln, die aus dem Konzept ausgeschnitten wurden (F01–F10, PR #232), dienen nur als Stilvorlage und werden ersetzt. Schnee-Zellen bleiben original. Orange Saisonzellen bekommen wie bisher die normale Kachel mit goldener Eckmarke (CSS).

## Ablauf
1. Diesen Auftrag in einer Sitzung mit Bildwerkzeug ausführen, zum Beispiel in Codex mit dem integrierten Bildwerkzeug, wie bei den bisherigen Diorama-Grafiken.
2. Als Stilvorlagen anhängen: `docs/design/diorama/reference-combat.png` und `F01-grass-a.png`, `F04-tree.png`, `F05-food.png`, `F09-gift.png`, `F10-cleared.png` aus diesem Ordner.
3. Zwei Tafeln erzeugen (A und B unten), jeweils als PNG unverändert ablegen unter `docs/design/diorama-field-tiles/source/tafel-a.png` und `tafel-b.png`. Den genauen Prompt mit Datum und Werkzeugname dazu in `source/PROMPTS.md` festhalten.
4. Zuschnitt, Freistellung, Einbau, Herkunfts- und Rechteeintrag, Vergleichsbilder und Emulatorbelege übernimmt danach die Claude-Sitzung auf `next/feat/diorama-field-tiles`.

## Gemeinsame Vorgaben (für beide Tafeln)
> ONE square image, 2048×2048 px, containing a 4×4 grid of 16 separate game field tiles on a flat plain dark brown background (#2b1a0e), at least 32 px of empty background between tiles and around the edge. Match the attached references exactly in style: hand-painted cozy fantasy diorama, slightly top-down 3/4 view, rounded square ground top with a clearly visible brown earth edge (about 10 % of the tile height) at the bottom, soft light from the upper left on every tile, warm saturated colours, crisp fine detail, more depth and volume than the references (raised soil, small contact shadows, gentle ambient occlusion at the edges). No outlines, no text, no letters, no numbers, no UI frames, no glow. All tiles identical in size and proportion, about 1.12:1 (width:height). The object on each tile is centred, delicate, about 55 % of the tile width, painted into the ground with a contact shadow and never extends beyond the tile.

## Tafel A – bekannte Typen (ersetzt F01–F10)
> Row 1: (1) plain meadow grass with a few tiny white flowers; (2) plain meadow grass with small pebbles; (3) meadow grass with a small bare earth patch; (4) meadow grass with tiny yellow flowers.
> Row 2: (5) a small leafy tree with visible trunk and roots (wood); (6) a woven basket full of red apples with two leaves (food); (7) a cluster of blue-grey ore rocks with a faint metallic sheen (metal); (8) one clear blue faceted gem on sandy ground (gems).
> Row 3: (9) a closed purple leather book with a gold leaf emblem (upgrade); (10) a gold wrapped gift box with a red ribbon bow (territory bonus); (11) a cleared light stone slab with a recessed check-mark carved into it, same size as the other tiles (beaten cell); (12) cracked, scorched grey stone ground, broken, no object (overkill).
> Row 4: (13) a small pile of torn parchment map fragments (map fragments); (14) a small carved wooden figure of a little furry worker holding a tool (new job); (15) a rolled parchment blueprint tied with a red ribbon and a small hammer (equipment plans); (16) a folded treasure map with a red X, partly unrolled (unique map).

## Tafel B – Karten und Reserve
> Row 1: (1) a small woven basket holding a loaf, a log and an iron ingot together (mixed loot); (2) a rolled building blueprint with a tiny wooden house model (building blueprint); (3) plain sandy cleared ground with a few pebbles, no object; (4) plain sandy ground with a small tuft of grass, no object.
> Row 2: (5) rocky mountain ground, grey stones and sparse grass; (6) forest floor, moss, fallen leaves, small ferns; (7) shallow sea shore, wet sand with clear blue water on one corner, shells; (8) dark depths ground, damp dark stone with faint blue crystals in cracks.
> Row 3: (9) garden ground with neat colourful flower beds; (10) farmland with tilled soil rows and small green sprouts; (11) void ground, dark purple-black with faint violet veins; (12) plain meadow grass variant with clover, no object.
> Row 4: (13) rocky mountain ground variant, no object; (14) forest floor variant, no object; (15) garden ground variant, no object; (16) farmland variant, no object.

## Rechte
Projektbezogene KI-Ausgabe nach eigener Vorgabe wie die übrigen Diorama-Grafiken. Eintrag in `docs/THIRD_PARTY_NOTICES.md` und `docs/legal/asset-inventory.csv` mit Werkzeug, Datum, Prompt, Original und SHA-256. Für eigene schutzfähige Beiträge gilt GPL-3.0-or-later; ausschließliche Rechte an KI-Motiven werden nicht zugesichert.
