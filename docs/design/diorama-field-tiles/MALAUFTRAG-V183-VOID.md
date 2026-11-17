# Void-Feldkacheln malen – Auftrag für das Bildwerkzeug (V-183)

Stand 25.10.2026. Issue: [V-183](https://github.com/Imperceptus22/trimps-mobile/issues/279). Void-Karten zeigen im Diorama-Stil noch das Originalraster (einfarbig dunkelviolett, Symbole als Glyphen). Ziel ist eine dritte Tafel C im Stil von Tafel A und B.

## Was es im Void-Raster gibt (Originalcode, `upstream/trimps`)
- Jede Zelle einer Void-Karte trägt zusätzlich `voidCell` (`main.js`, Rasteraufbau). Farben im Original: offen #33095b, besiegt #8114ff, Overkill #845def.
- ♣-Symbol: sehr wahrscheinlich `icomoon icon-leaf2` = gemischte Beute „Food/Wood/Metal“ (`config.js`, `mapUnlocks.Any`). Dafür gibt es in Tafel B schon den Korb (B1), aber auf Gras.
- Diamant: Edelsteine (`*diamond`), in Tafel A als A8 auf Gras.
- Orange Zellen: vermutlich saisonal `mapPumpkimp`. Sie bekommen keine eigene Kachel, sondern wie in normalen Karten die goldene Eckmarke per CSS.
- Die Void-Bodenkachel B11 aus Tafel B ist die Stilvorlage für den Boden.
- Seltene Symbole ohne eigene Kachel bleiben wie bisher Glyphen auf dem Void-Boden. Das aktuelle Feld bekommt seinen Leuchtrahmen per CSS.

## Ablauf
Vollständige Fassung mit Farbwerten und einem Auswahlbild der Vorlagen (`referenz-auswahl.png`) liegt in Google Drive unter `<drive>/Trimps Mobile/Malauftrag V-183 Void/PROMPT.md`. Diese Fassung ist maßgeblich.

1. In ChatGPT (Bildwerkzeug) ausführen.
2. Als Stilvorlagen anhängen: `source/tafel-b.png` (enthält den Void-Boden B11 und den Korb B1) und `source/tafel-a.png` (Edelstein A8, Steinplatte mit Häkchen A11, Overkill-Stein A12).
3. Den Prompt unten verwenden. Ergebnis als PNG unverändert ablegen unter `docs/design/diorama-field-tiles/source/tafel-c-void.png`. Prompt, Datum und Werkzeug in `source/PROMPTS.md` ergänzen.
4. Zuschnitt, Freistellung, Einbau, Rechteeintrag und Emulatorbelege übernimmt danach die Claude-Sitzung.

## Prompt (zum Kopieren)
> Create ONE square image, 2048×2048 px, containing a 4×4 grid of 16 separate game field tiles on a flat plain dark brown background (#2b1a0e), with at least 32 px of empty background between tiles and around the edge. Match the attached tile sheets exactly in style, size, proportion and lighting: hand-painted cozy fantasy diorama, slightly top-down 3/4 view, rounded square ground top with a clearly visible earth edge (about 10 % of the tile height) at the bottom, soft light from the upper left, crisp fine detail, raised ground, small contact shadows, gentle ambient occlusion at the edges. All tiles show the same VOID ground as the purple-black void tile in the attached sheet (row 3, tile 3): dark purple-black cracked stone with faint violet veins; the earth edge underneath is dark violet-brown instead of warm brown. Keep the void tiles readable on a dark screen: the ground is dark but not pitch black, with visible stone texture and subtle violet highlights. No outlines, no text, no letters, no numbers, no symbols, no UI frames, no strong glow or bloom. All tiles identical in size and proportion, about 1.12:1 (width:height). Any object is centred, about 55 % of the tile width, painted into the ground with a contact shadow, and never extends beyond the tile.
> Row 1: (1) plain void ground, no object; (2) plain void ground variant with a few small dark pebbles, no object; (3) plain void ground variant with a slightly different vein pattern, no object; (4) plain void ground variant with two or three tiny violet crystal shards, no object.
> Row 2: (5) one clear blue faceted gem lying on void ground (same gem as in the reference sheet); (6) a small woven basket holding a loaf, a log and an iron ingot together, standing on void ground (same basket as in the reference sheet); (7) a cleared dark violet-grey stone slab with a recessed check-mark carved into it, same size as the other tiles, like the light check-mark slab in the reference but in void colours (beaten cell); (8) cracked, broken violet-grey stone ground, shattered, no object (overkill).
> Row 3: (9) a small withered dark tree with a few violet leaves on void ground (wood); (10) a woven basket of red apples on void ground (food); (11) a cluster of blue-grey ore rocks with a faint metallic sheen on void ground (metal); (12) a closed purple leather book with a gold leaf emblem on void ground (upgrade).
> Row 4: (13) plain void ground variant with a faint swirl in the veins, no object; (14) plain void ground variant with a small crack across one corner, no object; (15) plain void ground variant with a few tiny dark mushrooms, no object; (16) plain void ground variant with small loose stones, no object.
> Keep colours and lighting consistent across all 16 tiles so they sit side by side in one grid.

## Abnahme der Tafel
- 16 Kacheln, gleich groß, klar getrennt, keine Schrift oder Symbole.
- Void-Boden deutlich als Void erkennbar und auf dem dunklen Bildschirm noch lesbar.
- Edelstein, Korb und Häkchenplatte sofort als dieselben Motive wie in Tafel A und B erkennbar.

## Offen
- Ob ♣ wirklich `icon-leaf2` ist, wird beim Einbau im Emulator bestätigt (Vermutung aus dem Originalcode).
- Ob die grüne Zelle im Handy-Screenshot eine besiegte Void-Zelle oder ein anderer Zustand ist, wird beim Einbau geklärt. Die Häkchenplatte (7) ist dafür vorgesehen.

## Rechte
Wie bei Tafel A und B: projektbezogene KI-Ausgabe nach eigener Vorgabe. Eintrag in `docs/THIRD_PARTY_NOTICES.md` und `docs/legal/asset-inventory.csv` beim Einbau.
