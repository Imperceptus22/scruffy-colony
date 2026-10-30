# V-183 Void-Tafel – Nachbesserungsauftrag für das Bildwerkzeug

Stand 25.10.2026. Nutzerentscheidung: erst nachbessern, dann einbauen. Zwei Punkte: gleiche Kachelhöhen und Kiesel am Erdrand variieren. Alles andere an `tafel-c-void.png` ist geprüft und bleibt unverändert.

## Messbefund der jetzigen Fassung (2048 × 2048 px)
| Reihe | Höhe der Kachel | Breite | Seitenverhältnis |
|---|---|---|---|
| 1 (Kachel 1–4) | 395–397 px | 445–453 px | 1,12–1,14 |
| 2 (Kachel 5–8) | 422–424 px | 442–453 px | 1,05–1,07 |
| 3 (Kachel 9–12) | 426 px | 445–454 px | 1,05–1,07 |
| 4 (Kachel 13–16) | 410 px | 443–454 px | 1,08–1,11 |

Ziel ist für alle 16 Kacheln das Maß von Reihe 1: etwa 448 × 400 px, Seitenverhältnis 1,12 wie im bestehenden Kachelsatz.

Außerdem sitzen auf allen 16 Kacheln zwei gleiche helle Kiesel an derselben Stelle im vorderen Erdrand (etwa bei einem Viertel und drei Vierteln der Breite). Im Spielraster mit 10 × 9 Feldern ergibt das ein gleichförmiges Punktmuster.

## Ablauf
1. In einer Sitzung mit Bildwerkzeug (z. B. Codex mit dem integrierten Bildwerkzeug) als **Bearbeitung** ausführen, nicht als Neuerzeugung.
2. Eingabebild: `<projects>\Repositories\Trimps Mobile\output\design\void-v183-2026-10-25\tafel-c-void.png`. Zweite Vorlage nur zur Kontrolle der Proportion: `referenz-auswahl.png` aus demselben Ordner.
3. Ergebnis unverändert ablegen als `tafel-c-void-v2.png` im selben Ordner; die alte Fassung nicht überschreiben. Werkzeug, Datum, Prompt, Zahl der Versuche und Auswahlgrund in `prompt.txt` ergänzen.
4. Ist die Ausgabe kleiner als 2048 × 2048, wie bisher ohne Beschnitt auf 2048 × 2048 skalieren und auf einfarbiges #2b1a0e setzen. Das in `prompt.txt` vermerken.
5. Danach misst die Claude-Sitzung erneut und baut erst nach Ihrer Freigabe ein.

## Prompt (zum Kopieren)
> Edit the attached tile atlas. Keep EVERYTHING the same – same 16 tiles in the same 4×4 positions, same objects, colours, lighting, style, void ground texture, background #2b1a0e and spacing – and change only these two things:
>
> 1. EQUAL TILE HEIGHT. All 16 tiles must have exactly the same outer size and shape as the tiles in the top row: about 448 px wide and 400 px high (width:height about 1.12:1), the same rounded corners and the same earth edge thickness of about 10 % of the tile height. The tiles in rows 2, 3 and 4 are currently too tall (rows 2 and 3 about 7 % taller, row 4 about 3 % taller). Make them as low as row 1 by reducing the ground top and the earth edge to the row 1 proportions; do not squash or distort the objects on them. Keep every tile centred in its 512 × 512 cell, with at least 32 px of flat background between tiles and around the canvas edge, nothing cropped.
>
> 2. VARIED PEBBLES IN THE EARTH EDGE. Every tile currently shows the same two light pebbles at the same two spots in its front earth edge. Make the earth edge of every tile different: each tile gets between zero and four small, darker, low-contrast pebbles at different positions and in different sizes, sitting in the dark violet-brown soil. Some tiles have no pebble at all. No bright or near-white pebbles, no repeated pattern from tile to tile.
>
> Do not change anything else. No text, no letters, no numbers and no new symbols (the carved check-mark on row 2 tile 3 and the gold leaf emblem on the book stay as they are). Flat solid background #2b1a0e with no gradient, vignette or halo. Output one square image, 2048 × 2048 px.

## Abnahme
- Alle 16 Kacheln gleich hoch, Abweichung höchstens ±4 px (1 %), Seitenverhältnis 1,10–1,14.
- Erdrand ohne wiederkehrendes Kieselmuster; auch in 40 px Spielgröße kein gleichförmiges Punktraster.
- Motive, Farben, Void-Boden und Hintergrund unverändert gegenüber `tafel-c-void.png`. Mindestabstände weiter mindestens 32 px.
- Höchstens drei Bearbeitungsversuche; den besten wählen und den Grund festhalten.
