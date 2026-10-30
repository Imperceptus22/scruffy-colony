# Forschungsminiaturen V-172 – Originaltafeln und Generierungsprotokoll

Datum: 25.10.2026 (Europe/Berlin).

## Auftrag und Zuständigkeit

Nutzerauftrag: vier Forschungstafeln für die anschließende Claude-Sitzung malen und als Originalausgaben ablegen. Grundlage vollständig gelesen: `<home>/Desktop/MALAUFTRAG.md` („Forschungsminiaturen malen (V-172)“).

Nur diese vier PNGs und dieses Protokoll wurden für den Auftrag im Repository angelegt. Keine Änderungen an App-Code, ausgelieferten Assets, Version, Changelog, Rechteinventar oder Build. Kein Branchwechsel, Commit oder Push. Bei Beginn und letzter Prüfung war der Branch `next/feat/diorama-field-tiles`; bereits vorhandene lokale Änderungen bleiben bestehen.

Claude übernimmt Zuschnitt, Freistellung, quadratische Einzeldateien, WebP, Zuordnung der Reihe U-R01…, Herkunfts-/Rechteeinträge, Vergleichsbilder, Einbau und Emulatorbelege. **Jedes Einzelmotiv muss dem Nutzer vor dem Einbau gezeigt werden; dieser Wartepunkt bleibt offen.** Die Auswahl einer Rohfassung ist keine Nutzerfreigabe zum Einbau aller Details.

Die konkrete Liste für Tafel D (elf Motive, fünf Leerplätze) wurde gegenüber der allgemeinen Formulierung „16 Motive“ priorisiert und vor Generierung angekündigt: D12 und D13–D16 sind ausschließlich Hintergrund, ohne Buch, Zeichen oder Platzhalter.

## Werkzeug, Modell und Kosten

- Werkzeug: integriertes `image_gen.imagegen`, Toolkennung `image_gen__imagegen`.
- Bildmodell: **nicht verifiziert / vom Werkzeug nicht offengelegt**. Die Rückgabe enthält `image_url` und `output_hint`, keine Modellkennung. Kein Modellname wird aus API-Dokumentation oder Chatmodellnamen abgeleitet.
- Modus: neue Rasterbilder anhand der genannten eigenen Projektdateien als Stilreferenzen; kein CLI-/API-Fallback und keine zusätzlichen Bildquellen.
- Kostenbedingung: integrierte Bildgenerierung innerhalb des bestehenden Pro-Nutzungslimits. Vor Beginn meldete das Konto 8 % Verbrauch im gemeldeten Limitfenster, reguläre Nutzung erlaubt und keine Zusatzcredits. Keine Credits gekauft und keinen API-Schlüssel verwendet. Dokumentationsgrundlage aus derselben Sitzung: https://learn.chatgpt.com/docs/pricing (Bildgenerierung zählt zu den enthaltenen Nutzungslimits).
- Jeder Aufruf erhielt genau fünf lokale Referenzpfade und `transparent_background=false`.

## Ausgewählte Originalausgaben

| Datei | Tatsächliche Pixelgröße | Auswahl | SHA-256 |
| --- | --- | --- | --- |
| tafel-a.png | 1254 × 1254 | A2 | F2F09B60ADB99054E6EDC81B6AC63174E73419B64248494EDC5C2ABF97B93734 |
| tafel-b.png | 1254 × 1254 | B2 | 274A5B287FD752D384A6B8AD52612E96EE926E475EF1567F21B5CAFE7AC9FAD4 |
| tafel-c.png | 1254 × 1254 | C2 | 81EBD63EF5CA8C4B3E1427E414DAA7822276EE77235F4B2BD1797FB0D84BCB9C |
| tafel-d.png | 1254 × 1254 | D2 | 2A389B494FB0FFF0D0CD4C3E5F3214910CF02A8FC7748ED5FFC6A550F5468A3D |

Alle vier Originale wurden **bytegleich** in diesen Ordner kopiert. Kein Zuschnitt, keine Freistellung, Skalierung, Farbkorrektur, Nachzeichnung oder Neuspeicherung. **1254 × 1254 statt angeforderter 2048 × 2048** ist eine verbleibende Abweichung; die Bilder wurden nicht künstlich hochskaliert.

Ursprüngliche Werkzeugdateien:

- A2: `<home>/.codex/generated_images/01a17329-ee76-78b1-ad94-fd722e45504e/exec-61137572-3b92-418f-9c74-5b2443633379.png`
- B2: `<home>/.codex/generated_images/01a17329-ee76-78b1-ad94-fd722e45504e/exec-21811859-03a6-4185-91c9-e2fe12bc1183.png`
- C2: `<home>/.codex/generated_images/01a17329-ee76-78b1-ad94-fd722e45504e/exec-c0a77363-29fd-4ad0-ba36-be26f6be81b8.png`
- D2: `<home>/.codex/generated_images/01a17329-ee76-78b1-ad94-fd722e45504e/exec-af002c95-619f-472f-b396-169c427f6a80.png`

Verworfene Fassungen wurden nicht im Repository abgelegt.

## Verwendete Referenzdateien

Alle genannten Bilder wurden vor der jeweiligen Generierung visuell gelesen. Geteilte Referenzen wurden nur einmal gelesen; bei jedem Aufruf wurden die jeweiligen fünf Dateien tatsächlich angehängt.

### Tafel A

- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/E02-Battleaxe.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/E07-Greatsword.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/E12-Shield.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/E04-Breastplate.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/N06-research.webp`

### Tafel B

- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/R01-Food.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/R03-Metal.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/R04-Science.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/J03-Miner.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/N06-research.webp`

### Tafel C

- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/B10-Hut.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/B20-Warpstation.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/B18-Trap.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/J04-Scientist.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/N06-research.webp`

### Tafel D

- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/N01-combat.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/R06-Gems.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/R08-Radon.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/E12-Shield.webp`
- `<projects>/Repositories/Trimps Mobile/app/src/main/assets/game/mobile-assets/diorama/N06-research.webp`

## Versuche und Auswahlgründe

Insgesamt zehn Bildausgaben. A: zwei Versuche (eine Neuerzeugung); B: zwei (eine Neuerzeugung); C: vier (drei Neuerzeugungen); D: zwei (eine Neuerzeugung). Damit höchstens drei Neuerzeugungen je Tafel.

| Versuch | Ergebnis / Auswahlgrund |
| --- | --- |
| A1 | Alle 16 Ausrüstungstypen in richtiger Reihenfolge, offene Bücher und goldene Pfeile vorhanden. Außenränder und Zwischenräume zu knapp. Verworfen. |
| A2 | Größere Abstände, alle Motive, Buchunterlagen und deutliche Veredelung vorhanden. Ausgewählt. Hintergrund bleibt leicht schattiert. |
| B1 | Richtige 16 Motive und Upgradezeichen; B3 wirkte wie Spaten statt Hacke, Fellkreis B12 sehr nahe am Rand. Verworfen. |
| B2 | Erkennbare Hacke mit querstehender Klinge, Fellkreis innerhalb der Fläche, alle 16 Motive und Upgradezeichen. Ausgewählt. |
| C1 | Richtige Motivfolge, aber schriftähnliche Buchseiten, niedriger Portalbau statt Turm C11, Steinenden an Holzwand C12. Verworfen. |
| C2 | Turmform und rein hölzerne Blockwand korrigiert; Wissenschaftsbuch mit Diagrammen statt Handschrift. Alle 16 Motive richtig. Ausgewählt als beste inhaltliche Gesamtabwägung; einzelne horizontale Abstände unter 32 px bleiben dokumentiert. |
| C3 | Versuch, die Gruppen zu verkleinern: keine zuverlässige Verbesserung; neue schriftähnliche/letterartige Zeichen auf Tafel und Buchseiten. Verworfen. |
| C4 | Letzte Neuerzeugung mit vereinfachtem Prompt: ruhigere Buchseiten, jedoch C12 als senkrechte Bretter/Palisade statt gestapelter Holzblöcke und C15 mit zusätzlichem Tropfen; Größenreduktion weiter nicht zuverlässig. Gegenüber C2 verworfen. |
| D1 | Korrekte 11 belegten und 5 leeren Positionen, aber D1 loser Edelstein statt Schild; Banner/Reliefs teilweise ungenau. Verworfen. |
| D2 | Prismatischer Schild, separates Schwert neben Banner, gerissene Klaue und vertieftes Flaschenrelief; elf belegte und fünf vollständig leere Plätze korrekt. Ausgewählt. |

Nach den gezielten Korrekturen wurde die beste vorhandene Fassung gewählt. Weitere Versuche nur wegen der wiederkehrenden Hintergrund-/Auflösungsabweichung wurden nicht durchgeführt; C hat die drei erlaubten Neuerzeugungen ausgeschöpft.

## Selbstprüfung und verbleibende Abweichungen

### Anzahl, Reihenfolge und Upgrade-Erkennbarkeit

Alle ausgewählten Bilder wurden vollständig visuell geprüft. A/B/C zeigen jeweils vier Reihen mit vier getrennten Motiven; D vier, vier und drei Motive in den ersten drei Reihen, rechts in Reihe drei und in der gesamten vierten Reihe leer. Keine erkennbaren Überlappungen zwischen den eigentlichen Motivgruppen. Reihenfolge wie im Auftrag.

Auf allen **59 belegten Positionen** ist das goldene Aufwärts-Chevron unten rechts vorhanden. Alle besitzen eine sichtbare Buch- oder Schriftrollenunterlage; bei A liegt jedes Motiv auf einem offenen Buch, einschließlich des geschlossenen violetten Buchs bei A16. Die A-Motive unterscheiden sich durch diese Kombination und die goldene Veredelung sichtbar von den zuvor betrachteten normalen Ausrüstungsvorlagen.

Die Hauptbeleuchtung kommt durchgängig von oben links. Einzelne angeforderte Magie-, Lampen- und Glüheffekte bilden zusätzliche lokale Lichtakzente. Pfeile sind malerisch erzeugt und daher **nicht pixelidentisch** in Form, Größe und Versatz. Eine exakt wiederverwendete Zeichen-Grafik wurde hier nicht nachträglich aufgesetzt.

### Größe, Abstände und Hintergrund

- **Auflösung aller Tafeln:** 1254 × 1254, angefordert waren 2048 × 2048.
- **Hintergrund aller Tafeln:** dunkles Braun mit leichtem Verlauf und Schatten an den Motiven statt exakt flächigem #2b1a0e. Nicht ausschließlich über einen einzigen RGB-Wert freistellen.
- **C2:** vier horizontale Zwischenräume sind unter 32 px, ungefähr 23, 28, 30 und 28 px. Betroffen sind C5↔C6, C7↔C8, C14↔C15 und C15↔C16. Keine sichtbare Überlappung, aber die Mindestabstandsvorgabe ist dort nicht erfüllt. Bei Zuschnitt/Freistellung besonders beachten.
- **A2, B2, D2:** die Prüfung des helleren Vordergrunds ergab horizontale Zwischenräume von mindestens ungefähr 34, 39 beziehungsweise 32 px. Weiche dunkle Schattenfransen sind dabei nicht vollständig als Motivkontur erfasst; diese Angabe ist keine garantierte exakte Alpha-Konturvermessung.
- **Anordnung:** Die gemalten Gruppen sind nicht exakt auf die geometrischen Viertelschnitte des Gesamtbilds begrenzt. Claude sollte Motive nach ihren tatsächlichen Umrissen segmentieren und anschließend auf quadratische Einzelbilder setzen, nicht blind gleich große Viertel ausschneiden.
- **48-px-Lesbarkeit:** starke Hauptsilhouetten und große Upgradezeichen wurden visuell beurteilt. Ein tatsächlicher Zuschnitt samt 48×48-Vorschau oder App-Test wurde hier nicht erstellt, da diese Sitzung nur Originaltafeln liefert. Die Einzelmotivprüfung in Zielgröße bleibt bei Claude und dem Nutzer. Insbesondere feine Nadeln, Nieten, Schnitzereien, Reliefrisse und einzelne Gebäudeunterschiede können dort verloren gehen.

Die zusätzliche rechnerische Leerplatzprüfung verwendete eine Helligkeits-/Farbmaske auf den unveränderten PNGs (R>90 oder G>55 oder B>60, teilweise zweipixelweise abgetastet). Sie bestätigte belegte Felder A/B/C 1–16 und D 1–11 sowie leere D12–D16. Horizontale Vordergrundprojektionen wurden zur Abstandseinschätzung in vier Zeilenbändern benutzt. Es wurden dabei keine Bilddateien verändert.

Stichproben leerer Hintergrundpixel:

- A: `0,0=#2a1709`; `620,0=#2b1508`; `0,620=#291407`; `620,620=#2a1508`; `1253,1253=#2d1b0a`.
- B: `0,0=#2c190a`; `620,0=#2d1809`; `0,620=#2b1608`; `620,620=#2c1708`; `1253,1253=#2f1d0a`.
- C: `0,0=#2e1a0a`; `620,0=#2f1809`; `0,620=#2d1708`; `620,620=#2e1709`; `1253,1253=#301d0b`.
- D: `0,0=#2e1a0b`; `620,0=#2d1809`; `0,620=#2d1708`; `620,620=#2d1809`; `1253,1253=#2f1c0b`.

### Motivprüfung A – Ausrüstung

| Position | Selbstprüfung / verbleibende Hinweise |
| --- | --- |
| A1 | Goldbesäumter Dolch auf offenem Buch; Silhouette relativ lang und dem Schwert A5 ähnlich. In Zielgröße Unterscheidbarkeit prüfen. |
| A2 | Schwerer Streitkolben mit goldenen Spitzen auf offenem Buch. |
| A3 | Vollständige Stangenwaffe mit vergoldeter Spitze, diagonal auf offenem Buch. |
| A4 | Streitaxt mit Goldbesatz auf offenem Buch. |
| A5 | Großschwert mit goldenem Parierstück auf offenem Buch; ähnliches Grundmotiv wie A1. |
| A6 | Geladene hölzerne Armbrust mit sichtbarer Sehne/Bolzen und Messingbeschlägen auf Buch. |
| A7 | Runder Holzschild mit goldenem Buckel und Rand auf Buch. |
| A8 | Rundschild mit zusätzlicher Metallverstärkung, sichtbaren Nieten und Nietwerkzeug auf Buch. |
| A9 | Lederstiefel mit Goldnähten sowie Nadel und Faden auf Buch; Nadel/Faden sehr fein für 48 px. |
| A10 | Helm mit goldenem Kamm auf Buch. |
| A11 | Lederhose mit zwei Beinen und golden umnähten Flicken auf Buch. |
| A12 | Paar Schulterpanzer mit goldenen Randplatten auf Buch. |
| A13 | Metallbrustpanzer mit Goldbesatz und kleinem Hammer auf Buch. |
| A14 | Stoffartiger gesteppter Gambeson mit goldener Rautensteppung auf Buch, unterscheidbar vom Metallpanzer. |
| A15 | Gestell mit Schwert, Schild, Helm und goldenem Zahnrad auf Buch; relativ komplex für 48 px. |
| A16 | Geschlossenes violettes Buch mit goldenem Kolbenemblem auf zusätzlichem offenem Buch. |

### Motivprüfung B – Ressourcen, Tempo, Bevölkerung

| Position | Selbstprüfung / verbleibende Hinweise |
| --- | --- |
| B1 | Spitzhacke auf Erz mit goldenen Tempolinien. |
| B2 | Holzaxt im Holzscheit mit goldenen Tempolinien. |
| B3 | Hacke mit quer zum Stiel stehender Klinge, Weizengarbe und goldenen Tempolinien. |
| B4 | Wissenschaftskolben mit goldenen Tempolinien. |
| B5 | Kompass und Kartenrolle mit goldenen Tempolinien, keine lesbaren Richtungsbuchstaben. |
| B6 | Große goldene Spitzhacke auf Erzhaufen mit goldenem Stern. |
| B7 | Große Axt auf Holzstapel mit goldenem Stern. |
| B8 | Großer Erntekorb mit goldenem Stern. |
| B9 | Großer blubbernder Kolben mit goldenem Stern; zusätzlich Tempolinien. |
| B10 | Messingzahnrad mit Öltropfen. |
| B11 | Kleine Holzwiege mit warmer Decke. |
| B12 | Mehrere pelzige kleine Hände zu einem Kreis verbunden; keine vollständigen Figuren. |
| B13 | Trainingspuppe mit an einem Seil hängender Pfeife. |
| B14 | Münzsack mit Belohnungsschleife. |
| B15 | Großes gesprenkeltes Drachenei im Nest. |
| B16 | Hantel aus Holz/Bronze mit violettem magischem Zeichen-/Lichtakzent. |

Alle B-Motive haben zusätzlich die geforderte sichtbare Buch-/Rollenunterlage und das goldene Chevron. Kleine Licht-/Sternakzente sind vorhanden; einzelne davon sind kräftiger als ganz zurückhaltende Funken.

### Motivprüfung C – Jobs, Gebäude, Kampf

| Position | Selbstprüfung / verbleibende Hinweise |
| --- | --- |
| C1 | Bergmannshelm mit Lampe auf Spitzhacke; offenes Buch darunter. |
| C2 | Lupe auf offenem Notizbuch; einfache Kolben-/Kreisdiagramme und kurze Linien, keine lesbare Handschrift. |
| C3 | Trainerpfeife mit Strichlistentafel auf Buch; Strichliste ist bewusst angefordert. |
| C4 | Fernrohr auf teilweise gerollter Karte. |
| C5 | Magmakristall in Zange auf Buch; kräftiges inneres Orangeleuchten. Abstand zu C6 zu knapp. |
| C6 | Kleine strohgedeckte Hütte auf Bauplanrolle. |
| C7 | Kleines Haus mit Ziegeldach auf Bauplanrolle. Abstand zu C8 zu knapp. |
| C8 | Breites mehrteiliges Herrenhaus auf Bauplanrolle, anderes Dach/Silhouette als Hotel. |
| C9 | Höheres mehrstöckiges Hotel auf Bauplanrolle. |
| C10 | Kleines Resort mit Palme und Wasserbecken auf Bauplanrolle. |
| C11 | Schlanker Warpstation-Turm mit Türkiskugel und kleinem Portal auf Bauplanrolle. |
| C12 | Gestapelte Holzblöcke als Wand auf offenem Buch, ohne Steinenden. |
| C13 | Holzfalle mit mehreren Federn und kompakten Windlinien auf Rolle. |
| C14 | Zwei gekreuzte kurze Schwerter auf Buch. Abstand zu C15 zu knapp. |
| C15 | Roter Fangzahn mit einem hängenden Tropfen auf Buch. Abstand zu C16 zu knapp. |
| C16 | Schild mit prismatischen Regenbogenflächen auf Buch. |

Alle C-Motive tragen das goldene Chevron unten rechts. Zeichnungen und Baupläne sind feiner und kleinteiliger als bei 48 px vollständig erkennbar sein wird.

### Motivprüfung D – Formationen, Wut, Relikte

| Position | Selbstprüfung / verbleibende Hinweise |
| --- | --- |
| D1 | Eindeutiger Schildkörper mit goldenem Rand und prismatischen Regenbogenflächen auf Buch; kein loser Diamant mehr. |
| D2 | Rot glimmender Edelstein auf Buch. |
| D3 | Gesprungener feuriger roter Edelstein mit Flammen auf Buch. |
| D4 | Kleine Holzfiguren als Formation auf Kartenrolle. |
| D5 | Erhobenes Banner und separates Schwert auf Kartenrolle. |
| D6 | Hohe Holzbarriere mit befestigtem Rundschild auf Buch. |
| D7 | Altes Steinrelikt mit vertieftem Schwertmotiv auf Buch. |
| D8 | Altes Steinrelikt mit Krallenmotiv und Riss auf Buch; feiner Riss in Zielgröße prüfen. |
| D9 | Altes Steinrelikt mit grünem Radon-/Atomlicht auf Buch; lokales Leuchten deutlich. |
| D10 | Altes Steinrelikt mit vertieftem Kolbenumriss auf Buch, keine separate Glasflasche. |
| D11 | Altes Steinrelikt mit erkennbarem Wiegenrelief auf Buch. |
| D12 | Leer, nur Hintergrund. |
| D13–D16 | Ganze vierte Reihe leer, nur Hintergrund. |

Alle elf belegten D-Motive tragen das goldene Chevron; die fünf Leerplätze enthalten keines.

## Rechte und Herkunft für die anschließende Claude-Sitzung

Projektbezogene KI-Ausgabe nach eigener Vorgabe wie die übrigen Diorama-Grafiken. Ausschließlich die genannten Projektdateien als Referenzen. Keine fremden Marken oder weiteren Vorlagen.

Für eigene schutzfähige Beiträge gilt GPL-3.0-or-later; ausschließliche Rechte an KI-Motiven werden nicht zugesichert. Einträge in `<projects>/Repositories/Trimps Mobile/docs/THIRD_PARTY_NOTICES.md` und `<projects>/Repositories/Trimps Mobile/docs/legal/asset-inventory.csv` übernimmt nach Auftrag Claude zusammen mit den abgeleiteten Einzelassets. Die fehlende verifizierte Bildmodellkennung dabei ausdrücklich beibehalten.

## Vollständiger Prompt der abgelegten Tafel A (A2)

Unverändert an das integrierte Werkzeug übergeben; zusätzlich die fünf oben genannten Referenzpfade als `referenced_image_paths` und `transparent_background=false`.

```text
Use case: stylized-concept. Create ONE square PNG image, requested 2048×2048 pixels, with a strict 4×4 grid of separate SQUARE fantasy game UPGRADE / RESEARCH icons for Scruffy Colony. This is a sprite atlas, not a UI mockup. Square canvas, width equals height. Flat perfectly uniform solid dark brown #2b1a0e background (RGB 43,26,14), no gradient, vignette, scenery, tiles or frames.

LAYOUT: four aligned columns and four aligned rows. Each icon INCLUDING its book/scroll, object, chevron and shadow fits wholly within a square cell footprint about 18% of canvas width/height. Centers of columns and rows are at 15.5%,38.5%,61.5%,84.5% of the canvas. At least 32 actual empty background pixels between icon silhouettes and around the whole image edge, preferably 5% canvas width. Keep identical icon scale. No object ever overlaps another cell or extends outside its square footprint.

STYLE: Follow the five attached project-owned STYLE REFERENCE images: hand-painted cozy fantasy miniature diorama, slightly top-down 3/4 view, crisp fine detail, warm saturated colours, leather-bound books, parchment, bronze, wood and polished metal. Soft warm key light from UPPER LEFT on EVERY icon, soft contact shadows. Strong single central subject silhouette, readable at 48×48 pixels. Restrained details, no tiny clutter. Make subjects look IMPROVED compared with the ordinary reference items: gold-trimmed edges, golden rivets, polished shine.

UPGRADE LANGUAGE, MANDATORY FOR EVERY OCCUPIED CELL: Subject rests on or rises out of an OPEN LEATHER-BOUND BOOK or HALF-UNROLLED PARCHMENT SCROLL. The base is clearly visible. Every occupied icon carries ONE bright GOLDEN UPWARD-POINTING CHEVRON (one simple thick upside-down V / ^, no arrow shaft, not a plus, not a star) at the LOWER RIGHT of its own icon footprint, about 22% of icon width, with a thin dark bronze rim. IDENTICAL SIZE, SHAPE, ORIENTATION AND LOWER-RIGHT POSITION on all occupied icons. Chevron fits INSIDE the footprint, not in the gutter. It is the same visual upgrade sign on every icon and must remain clear at 48px. Tiny golden sparkles allowed, no large halo or glow. No labels, text, letters, numbers, watermark, outlines around the whole icon, UI frames or border boxes. Architectural drawing lines, plain tally strokes and nonalphabetic magic rune shapes only where requested; never render the parenthetical internal names as text.

The named attached images are ONLY style/material/subject references, never edit targets or complete compositions to copy. Use no other graphics, brands or outside visual sources.

TABLE A: exactly 16 occupied cells. WEAPONS AND ARMOUR MUST LOOK UNMISTAKABLY LIKE UPGRADES: each item lies diagonally or sideways ACROSS AN OPEN BOOK, visibly gilded/improved, with the strong golden lower-right chevron. Even the final closed book lies ON an open book. No plain standalone equipment icon.

EXACT ROW-MAJOR CONTENT, LEFT TO RIGHT:
ROW 1:
1. Short DAGGER with a gilded blade edge (Knifecraft / Dagadder).
2. Heavy MACE with golden spikes (Bonkcraft / Megamace).
3. Long POLEARM with a gilded spearhead, the entire shaft fits diagonally within its cell (Longhaft / Polierarm).
4. BATTLEAXE with a gold-trimmed blade (Chopcraft / Axeidic).
ROW 2:
5. GREATSWORD with a golden crossguard (Broadblade / Greatersword).
6. LOADED WOODEN ARBALEST, clear crossbow limbs, taut string and one loaded bolt, brass fittings (Boltworks / Harmbalest).
7. ROUND WOODEN SHIELD with golden boss and rim (Blocksmith / Supershield).
8. ROUND SHIELD with a SECOND REINFORCING PLATE visibly being riveted on; small rivet and riveting tool make the improvement clear, no human hand needed (Shieldblock).
ROW 3:
9. LEATHER BOOTS with GOLDEN STITCHING plus a NEEDLE WITH THREAD (Bootstitch / Bootboost).
10. HELMET with a GOLDEN CREST (Hardcap / Hellishmet).
11. LEATHER PANTS, identifiable two full trouser legs, with GOLDEN STITCHED PATCHES (Toughstitch / Pantastic).
12. Pair of SHOULDER GUARDS with GOLDEN EDGE PLATES (Broadbrace / Smoldershoulder).
ROW 4:
13. BREASTPLATE with golden trim and a SMALL HAMMER beside it (Chestforge / Bestplate).
14. QUILTED GAMBESON, a soft fabric padded jacket with sleeves, golden DIAMOND QUILTING lines, clearly different from metal breastplate (Quiltwork / GambesOP).
15. SMALL RACK holding a SWORD, a SHIELD and a HELMET, with a GOLDEN GEAR above them, all on an open book (Equipment Optimization).
16. CLOSED PURPLE RESEARCH BOOK with a GOLDEN FLASK emblem on its cover, resting on an OPEN BOOK (neutral research fallback).

Final check: sixteen different subjects in these exact positions, 4×4, every subject on an open book, all with ONE identical gold lower-right upward chevron, no text, no overlap, square image. Do not replace pants with gloves or gambeson with armour. Make the chevron compact so it does not hide the distinctive subject.
Attached style references, in order: E02-Battleaxe.webp, E07-Greatsword.webp, E12-Shield.webp, E04-Breastplate.webp, N06-research.webp.
CRITICAL SPACING OVERRIDE: Render a VERY SPACIOUS CONTACT SHEET, not an edge-to-edge composition. Shrink the ENTIRE icon including book and chevron to only SIXTEEN PERCENT (16%) of the whole canvas width AND height. Four column centers at 14%,38%,62%,86%, four row centers at 14%,38%,62%,86%. This leaves EIGHT PERCENT canvas-wide totally empty gutters between the square icon footprints and SIX PERCENT empty margins around the canvas. No long weapon, book corner, arrow, shadow or other pixel may enter those generous empty gutters or outer margins. If an icon is too large, reduce the whole icon, do not remove parts. Flat background ONLY, one exact colour #2b1a0e. No background shadows or gradients; contact shadows must be inside each icon footprint. Keep ONE identical gold chevron at lower right inside EVERY occupied footprint. The mandatory icon subjects and order stay exactly as specified above. Keep canvas SQUARE.
```

## Vollständiger Prompt der abgelegten Tafel B (B2)

Unverändert an das integrierte Werkzeug übergeben; zusätzlich die fünf oben genannten Referenzpfade als `referenced_image_paths` und `transparent_background=false`.

```text
Use case: stylized-concept. Create ONE square PNG image, requested 2048×2048 pixels, with a strict 4×4 grid of separate SQUARE fantasy game UPGRADE / RESEARCH icons for Scruffy Colony. This is a sprite atlas, not a UI mockup. Square canvas, width equals height. Flat perfectly uniform solid dark brown #2b1a0e background (RGB 43,26,14), no gradient, vignette, scenery, tiles or frames.

LAYOUT: four aligned columns and four aligned rows. Each icon INCLUDING its book/scroll, object, chevron and shadow fits wholly within a square cell footprint about 18% of canvas width/height. Centers of columns and rows are at 15.5%,38.5%,61.5%,84.5% of the canvas. At least 32 actual empty background pixels between icon silhouettes and around the whole image edge, preferably 5% canvas width. Keep identical icon scale. No object ever overlaps another cell or extends outside its square footprint.

STYLE: Follow the five attached project-owned STYLE REFERENCE images: hand-painted cozy fantasy miniature diorama, slightly top-down 3/4 view, crisp fine detail, warm saturated colours, leather-bound books, parchment, bronze, wood and polished metal. Soft warm key light from UPPER LEFT on EVERY icon, soft contact shadows. Strong single central subject silhouette, readable at 48×48 pixels. Restrained details, no tiny clutter. Make subjects look IMPROVED compared with the ordinary reference items: gold-trimmed edges, golden rivets, polished shine.

UPGRADE LANGUAGE, MANDATORY FOR EVERY OCCUPIED CELL: Subject rests on or rises out of an OPEN LEATHER-BOUND BOOK or HALF-UNROLLED PARCHMENT SCROLL. The base is clearly visible. Every occupied icon carries ONE bright GOLDEN UPWARD-POINTING CHEVRON (one simple thick upside-down V / ^, no arrow shaft, not a plus, not a star) at the LOWER RIGHT of its own icon footprint, about 22% of icon width, with a thin dark bronze rim. IDENTICAL SIZE, SHAPE, ORIENTATION AND LOWER-RIGHT POSITION on all occupied icons. Chevron fits INSIDE the footprint, not in the gutter. It is the same visual upgrade sign on every icon and must remain clear at 48px. Tiny golden sparkles allowed, no large halo or glow. No labels, text, letters, numbers, watermark, outlines around the whole icon, UI frames or border boxes. Architectural drawing lines, plain tally strokes and nonalphabetic magic rune shapes only where requested; never render the parenthetical internal names as text.

The named attached images are ONLY style/material/subject references, never edit targets or complete compositions to copy. Use no other graphics, brands or outside visual sources.

TABLE B: exactly 16 occupied cells. Every subject rises from an open book or half-unrolled parchment scroll and has the SAME GOLD LOWER-RIGHT UPWARD CHEVRON.

EXACT ROW-MAJOR CONTENT, LEFT TO RIGHT:
ROW 1:
1. PICKAXE on ORE with golden SPEED LINES (Speedminer).
2. LUMBER AXE embedded in a LOG with golden SPEED LINES (Speedlumber).
3. HOE with a WHEAT SHEAF and golden SPEED LINES (Speedfarming).
4. SCIENCE FLASK with golden SPEED LINES (Speedscience).
ROW 2:
5. COMPASS and MAP with golden SPEED LINES (Speedexplorer).
6. LARGE GOLDEN PICKAXE on a BIG ORE PILE with a GOLDEN STAR (Megaminer).
7. LARGE AXE on a STACK OF LOGS with a GOLDEN STAR (Megalumber).
8. LARGE BASKET OF CROPS with a GOLDEN STAR (Megafarming).
ROW 3:
9. LARGE BUBBLING FLASK with a GOLDEN STAR (Megascience).
10. BRASS GEAR turning smoothly with OIL DROPS (Efficiency).
11. SMALL WOODEN CRADLE with a WARM BLANKET (Potency).
12. SEVERAL SMALL FURRY HANDS joined together IN A CIRCLE, clearly furry little hands, not a circle of complete bodies (Coordination).
ROW 4:
13. TRAINING DUMMY with a WHISTLE ON A ROPE (TrainTacular).
14. SMALL SACK OF GOLD COINS with a REWARD RIBBON (Bounty).
15. LARGE SPECKLED DRAGON EGG in a NEST (Egg).
16. DUMBBELL made of WOOD AND BRONZE with a small subtle MYSTIC VIOLET RUNE GLOW, no large aura and no text (Gymystic).

Gold speed lines and stars are SMALL supplementary subject details and NEVER replace the mandatory lower-right upward chevron. Keep all bases visible. Final check: exactly 16 subjects in this exact 4×4 order, all have book/scroll and identical gold lower-right chevron, no writing, no overlap, whole canvas square.
Attached style references, in order: R01-Food.webp, R03-Metal.webp, R04-Science.webp, J03-Miner.webp, N06-research.webp.

CRITICAL SPACING OVERRIDE: Render a VERY SPACIOUS CONTACT SHEET, not an edge-to-edge composition. Shrink the ENTIRE icon including book and chevron to only SIXTEEN PERCENT (16%) of the whole canvas width AND height. Four column centers at 14%,38%,62%,86%, four row centers at 14%,38%,62%,86%. This leaves EIGHT PERCENT canvas-wide totally empty gutters between the square icon footprints and SIX PERCENT empty margins around the canvas. No long weapon, book corner, arrow, shadow or other pixel may enter those generous empty gutters or outer margins. If an icon is too large, reduce the whole icon, do not remove parts. Flat background ONLY, one exact colour #2b1a0e. No background shadows or gradients; contact shadows must be inside each icon footprint. Keep ONE identical gold chevron at lower right inside EVERY occupied footprint. The mandatory icon subjects and order stay exactly as specified above. Keep canvas SQUARE.
TARGETED CORRECTIONS: B3 must be a proper FARMING HOE: a SMALL NARROW METAL HOE BLADE mounted at a RIGHT ANGLE to the long wooden handle, clearly NOT a spade or shovel, beside a wheat sheaf. B12 furry hands must visibly join in a circular ring, all fur and golden sparkles contained at least 64 pixels inside the overall image edges. Shrink ALL icons another 10% to guarantee >=32px clear outer margin and gutters. Preserve all sixteen exact subjects, positions, visible books/scrolls, uniform lower-right gold chevrons. No letter-like marks on compass or maps. Absolutely solid #2b1a0e background, no vignette or lighting applied outside icons.
```

## Vollständiger Prompt der abgelegten Tafel C (C2)

Unverändert an das integrierte Werkzeug übergeben; zusätzlich die fünf oben genannten Referenzpfade als `referenced_image_paths` und `transparent_background=false`.

```text
Use case: stylized-concept. Create ONE square PNG image, requested 2048×2048 pixels, with a strict 4×4 grid of separate SQUARE fantasy game UPGRADE / RESEARCH icons for Scruffy Colony. This is a sprite atlas, not a UI mockup. Square canvas, width equals height. Flat perfectly uniform solid dark brown #2b1a0e background (RGB 43,26,14), no gradient, vignette, scenery, tiles or frames.

LAYOUT: four aligned columns and four aligned rows. Each icon INCLUDING its book/scroll, object, chevron and shadow fits wholly within a square cell footprint about 18% of canvas width/height. Centers of columns and rows are at 15.5%,38.5%,61.5%,84.5% of the canvas. At least 32 actual empty background pixels between icon silhouettes and around the whole image edge, preferably 5% canvas width. Keep identical icon scale. No object ever overlaps another cell or extends outside its square footprint.

STYLE: Follow the five attached project-owned STYLE REFERENCE images: hand-painted cozy fantasy miniature diorama, slightly top-down 3/4 view, crisp fine detail, warm saturated colours, leather-bound books, parchment, bronze, wood and polished metal. Soft warm key light from UPPER LEFT on EVERY icon, soft contact shadows. Strong single central subject silhouette, readable at 48×48 pixels. Restrained details, no tiny clutter. Make subjects look IMPROVED compared with the ordinary reference items: gold-trimmed edges, golden rivets, polished shine.

UPGRADE LANGUAGE, MANDATORY FOR EVERY OCCUPIED CELL: Subject rests on or rises out of an OPEN LEATHER-BOUND BOOK or HALF-UNROLLED PARCHMENT SCROLL. The base is clearly visible. Every occupied icon carries ONE bright GOLDEN UPWARD-POINTING CHEVRON (one simple thick upside-down V / ^, no arrow shaft, not a plus, not a star) at the LOWER RIGHT of its own icon footprint, about 22% of icon width, with a thin dark bronze rim. IDENTICAL SIZE, SHAPE, ORIENTATION AND LOWER-RIGHT POSITION on all occupied icons. Chevron fits INSIDE the footprint, not in the gutter. It is the same visual upgrade sign on every icon and must remain clear at 48px. Tiny golden sparkles allowed, no large halo or glow. No labels, text, letters, numbers, watermark, outlines around the whole icon, UI frames or border boxes. Architectural drawing lines, plain tally strokes and nonalphabetic magic rune shapes only where requested; never render the parenthetical internal names as text.

The named attached images are ONLY style/material/subject references, never edit targets or complete compositions to copy. Use no other graphics, brands or outside visual sources.

TABLE C: exactly 16 occupied cells. Every subject rises from an open leather book or half-unrolled parchment scroll; EVERY subject has the SAME GOLD LOWER-RIGHT UPWARD CHEVRON. Building blueprints are half-unrolled parchment scrolls with simple architectural line drawing and no writing.

EXACT ROW-MAJOR CONTENT, LEFT TO RIGHT:
ROW 1:
1. MINER'S HELMET with a LAMP resting ON A PICKAXE (Miners).
2. SCIENTIST'S MAGNIFIER on an OPEN NOTEBOOK (Scientists).
3. TRAINER'S WHISTLE with a TALLY BOARD, use only short plain tally strokes, no letters or numbers (Trainers).
4. EXPLORER'S SPYGLASS on a ROLLED MAP resting on a half-unrolled parchment base (Explorers).
ROW 2:
5. GLOWING MAGMA CRYSTAL held in TONGS, tiny restrained orange inner light, no large halo (Magmamancers).
6. LITTLE HUT on a BLUEPRINT scroll, one small primitive dwelling (UberHut).
7. LITTLE HOUSE on a BLUEPRINT scroll, clearly larger and more built than the hut (UberHouse).
8. LITTLE MANSION on a BLUEPRINT scroll, elegant multi-windowed residence (UberMansion).
ROW 3:
9. LITTLE HOTEL on a BLUEPRINT scroll, tall multistorey lodging building, NO sign or letters (UberHotel).
10. LITTLE RESORT with a PALM on a BLUEPRINT scroll (UberResort).
11. LITTLE WARP STATION TOWER on a BLUEPRINT scroll, fantasy wood/bronze structure matching reference (Gigastation).
12. STACK OF WOODEN BLOCKS forming a WALL, rises from open book (Blockmaster).
ROW 4:
13. WOODEN TRAP with SEVERAL SPRINGS and STORM WIND LINES, on parchment scroll (Trapstorm).
14. TWO CROSSED SHORT SWORDS on open book (Battle).
15. RED FANG with ONE DROP on open book (Bloodlust).
16. SHIELD shimmering with PRISMATIC RAINBOW COLOURS on open book, material sheen only, no large halo (Prismatic).

Final check: exactly sixteen distinct subjects in prescribed 4×4 order, keep little buildings different and identifiable at 48px, every icon has book/scroll and same compact gold lower-right chevron, no text, no overflow or overlap, square canvas.
Attached style references, in order: B10-Hut.webp, B20-Warpstation.webp, B18-Trap.webp, J04-Scientist.webp, N06-research.webp.

CRITICAL SPACING OVERRIDE: Render a VERY SPACIOUS CONTACT SHEET, not an edge-to-edge composition. Shrink the ENTIRE icon including book and chevron to only SIXTEEN PERCENT (16%) of the whole canvas width AND height. Four column centers at 14%,38%,62%,86%, four row centers at 14%,38%,62%,86%. This leaves EIGHT PERCENT canvas-wide totally empty gutters between the square icon footprints and SIX PERCENT empty margins around the canvas. No long weapon, book corner, arrow, shadow or other pixel may enter those generous empty gutters or outer margins. If an icon is too large, reduce the whole icon, do not remove parts. Flat background ONLY, one exact colour #2b1a0e. No background shadows or gradients; contact shadows must be inside each icon footprint. Keep ONE identical gold chevron at lower right inside EVERY occupied footprint. The mandatory icon subjects and order stay exactly as specified above. Keep canvas SQUARE.
TARGETED CORRECTIONS: Every page and scroll MUST be free of handwriting, cursive, pseudoletters, numbers or labels. C2 scientist notebook has ONLY simple scientific diagram shapes (circle, flask outline, lens ray diagram), absolutely NO lines resembling writing, and NO extra flask object beside the magnifier. C11 is a WARP STATION TOWER: clearly taller than wide, vertical bronze-and-stone tower with turquoise orb at the top and a SMALL portal inset below; retain the cozy style reference but do NOT simply reproduce the wide low portal building. C12 wall consists ENTIRELY of stacked WOODEN BLOCKS with visible wood grain, NO stone pillars or stone end blocks. Preserve all 16 positions and other subjects, generous clear empty gutters and margins >=32 actual pixels, same open-book/scroll and golden lower-right chevron on EVERY icon. Background plain solid #2b1a0e with no gradient. Overall image SQUARE.
```

## Vollständiger Prompt der abgelegten Tafel D (D2)

Unverändert an das integrierte Werkzeug übergeben; zusätzlich die fünf oben genannten Referenzpfade als `referenced_image_paths` und `transparent_background=false`.

```text
Use case: stylized-concept. Create ONE square PNG image, requested 2048×2048 pixels, with a strict 4×4 grid of separate SQUARE fantasy game UPGRADE / RESEARCH icons for Scruffy Colony. This is a sprite atlas, not a UI mockup. Square canvas, width equals height. Flat perfectly uniform solid dark brown #2b1a0e background (RGB 43,26,14), no gradient, vignette, scenery, tiles or frames.

LAYOUT: four aligned columns and four aligned rows. Each icon INCLUDING its book/scroll, object, chevron and shadow fits wholly within a square cell footprint about 18% of canvas width/height. Centers of columns and rows are at 15.5%,38.5%,61.5%,84.5% of the canvas. At least 32 actual empty background pixels between icon silhouettes and around the whole image edge, preferably 5% canvas width. Keep identical icon scale. No object ever overlaps another cell or extends outside its square footprint.

STYLE: Follow the five attached project-owned STYLE REFERENCE images: hand-painted cozy fantasy miniature diorama, slightly top-down 3/4 view, crisp fine detail, warm saturated colours, leather-bound books, parchment, bronze, wood and polished metal. Soft warm key light from UPPER LEFT on EVERY icon, soft contact shadows. Strong single central subject silhouette, readable at 48×48 pixels. Restrained details, no tiny clutter. Make subjects look IMPROVED compared with the ordinary reference items: gold-trimmed edges, golden rivets, polished shine.

UPGRADE LANGUAGE, MANDATORY FOR EVERY OCCUPIED CELL: Subject rests on or rises out of an OPEN LEATHER-BOUND BOOK or HALF-UNROLLED PARCHMENT SCROLL. The base is clearly visible. Every occupied icon carries ONE bright GOLDEN UPWARD-POINTING CHEVRON (one simple thick upside-down V / ^, no arrow shaft, not a plus, not a star) at the LOWER RIGHT of its own icon footprint, about 22% of icon width, with a thin dark bronze rim. IDENTICAL SIZE, SHAPE, ORIENTATION AND LOWER-RIGHT POSITION on all occupied icons. Chevron fits INSIDE the footprint, not in the gutter. It is the same visual upgrade sign on every icon and must remain clear at 48px. Tiny golden sparkles allowed, no large halo or glow. No labels, text, letters, numbers, watermark, outlines around the whole icon, UI frames or border boxes. Architectural drawing lines, plain tally strokes and nonalphabetic magic rune shapes only where requested; never render the parenthetical internal names as text.

The named attached images are ONLY style/material/subject references, never edit targets or complete compositions to copy. Use no other graphics, brands or outside visual sources.

TABLE D: 4×4 aligned layout with EXACTLY ELEVEN OCCUPIED CELLS and FIVE COMPLETELY EMPTY CELLS. This explicit empty-cell specification overrides the generic sixteen-icon statement. Row 1 has 4 icons, row 2 has 4 icons, row 3 has ONLY 3 icons, row 4 is TOTALLY EMPTY. DO NOT re-center the eleven icons or change their positions, keep the same 4×4 grid spacing as the other tables. Every occupied cell has an open book / half-unrolled scroll and identical GOLD LOWER-RIGHT UPWARD CHEVRON. Empty cells are just background, NO book, NO chevron, NO placeholder, NO border or faint silhouette.

EXACT ROW-MAJOR CONTENT, LEFT TO RIGHT:
ROW 1:
1. PRISMATIC GEM SHIELD with a STRONG RAINBOW SHEEN, on open book (Prismalicious).
2. SMOULDERING RED GEM, restrained inner warmth, on open book (Anger).
3. CRACKED FIERY RED GEM with small visible FLAMES, on open book (Rage).
4. SMALL WOODEN FIGURES arranged IN A FORMATION on a MAP SCROLL (Formations).
ROW 2:
5. RAISED BANNER with a SWORD on a MAP SCROLL (Dominance).
6. TALL WOODEN BARRIER WALL with a SHIELD ON IT, rising from open book (Barrier).
7. ANCIENT STONE RELIC with a SWORD CARVING, on open book (Attack Relic).
8. ANCIENT STONE RELIC with a CRACKED CLAW CARVING, on open book (Enemy Attack Relic).
ROW 3:
9. ANCIENT STONE RELIC with a small GREEN RADON GLOW, no large aura, on open book (Radon Relic).
10. ANCIENT STONE RELIC with a FLASK CARVING, on open book (Resource Relic).
11. ANCIENT STONE RELIC with a TINY CRADLE CARVING, clearly a rocking cradle shape, on open book (Breed Relic).
12. EMPTY BACKGROUND ONLY.
ROW 4:
13. EMPTY BACKGROUND ONLY.
14. EMPTY BACKGROUND ONLY.
15. EMPTY BACKGROUND ONLY.
16. EMPTY BACKGROUND ONLY.

Relics 7–11 are natural aged stone objects with clearly distinct carved motifs, not UI frames or text. The slight green rune-like light is allowed ONLY on relic 9. Every one of the ELEVEN occupied cells has ONE identical gold lower-right chevron; all FIVE empty cells must contain absolutely nothing. Final check: 4+4+3=11 visible icons, blank third-row rightmost position and blank full fourth row; keep ALL empty canvas area the same solid brown #2b1a0e. Whole output square.
Attached style references, in order: N01-combat.webp, R06-Gems.webp, R08-Radon.webp, E12-Shield.webp, N06-research.webp.

CRITICAL SPACING OVERRIDE: Render a VERY SPACIOUS CONTACT SHEET, not an edge-to-edge composition. Shrink the ENTIRE icon including book and chevron to only SIXTEEN PERCENT (16%) of the whole canvas width AND height. Four column centers at 14%,38%,62%,86%, four row centers at 14%,38%,62%,86%. This leaves EIGHT PERCENT canvas-wide totally empty gutters between the square icon footprints and SIX PERCENT empty margins around the canvas. No long weapon, book corner, arrow, shadow or other pixel may enter those generous empty gutters or outer margins. If an icon is too large, reduce the whole icon, do not remove parts. Flat background ONLY, one exact colour #2b1a0e. No background shadows or gradients; contact shadows must be inside each icon footprint. Keep ONE identical gold chevron at lower right inside EVERY occupied footprint. The mandatory icon subjects and order stay exactly as specified above. Keep canvas SQUARE.
REMINDER FOR TABLE D: eleven occupied icons ONLY, exact positions cells 1 through 11. Cell 12 AND all cells 13–16 stay EMPTY BROWN BACKGROUND without even an arrow. Entire lower quarter of square image is empty brown; do not crop it off or vertically recenter the occupied icons.
TARGETED CORRECTIONS: D1 MUST BE A SHIELD, NOT A LOOSE GEM. Give it an unmistakable shield-shaped body (broad upper shoulders, tapered pointed bottom), a golden metal shield rim and faceted rainbow/prismatic gem panels inset into the shield surface. It rests on an open book. Do not substitute the loose diamond from the gem reference. D5 is a raised banner AND a clearly visible separate sword alongside it on a map, not merely a sword picture on the fabric. D8 show a visibly CRACKED claw carving. D10 is a CARVING of a FLASK recessed INTO stone, not an actual glass bottle or a luminous drink; keep the stone motif readable. All book pages contain only sparse plain geometric diagrams, NO handwriting or pseudoletters. Preserve the exact 11 subjects and FIVE EMPTY CELLS, including full empty bottom row, identical gold lower-right chevrons on occupied cells only, clear >=32px gaps and edge margins. Flat #2b1a0e background, no vignette. Whole image square.
```

