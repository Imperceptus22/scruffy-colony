# Auftrag an ChatGPT: Knochenkrug-Grafiken (mit Rückmeldung an Claude)

Den Block unten vollständig in ChatGPT einfügen und die fünf genannten Dateien anhängen. Die Pfade gelten für den Stand nach dem Merge in `integration/next`. Bis dahin liegen die neuen Dateien (Malauftrag, Beleg) im Arbeitsordner `<projects>\Repositories\Trimps Mobile\.claude\worktrees\v201-shop-packs\`.

```text
Auftrag: Grafiken für den „Bone Jar“ (Knochenkrug) im Android-Spiel Scruffy Colony

Du erstellst vier Bilder für das Spiel „Scruffy Colony“ (gemalter Miniatur-Diorama-Stil). Der Knochenkrug ist ein Tonkrug, der sich beim Spielen mit Knochen füllt; im Shop kann man ihn öffnen, wenn er voll ist. Es geht nur um die Bilder; Texte, Preise und Knöpfe macht die App selbst.

ANGEHÄNGTE DATEIEN (bitte alle ansehen, bevor du beginnst)
1. R09-Bones.webp – Stilreferenz: so sehen Spielobjekte aus (das Knochenbündel).
   Pfad: <projects>\Repositories\Trimps Mobile\app\src\main\assets\game\mobile-assets\diorama\R09-Bones.webp
2. resources.png – der ganze Ressourcen-Atlas, aus dem R09 stammt (Licht, Material, Maßstab).
   Pfad: <projects>\Repositories\Trimps Mobile\artwork\diorama\source-package\world\resources.png
3. H01-resources-workstations.webp – die Kolonie-Szene der Seite „Resources“, in die das Szenenobjekt passen muss.
   Pfad: <projects>\Repositories\Trimps Mobile\app\src\main\assets\game\mobile-assets\diorama\H01-resources-workstations.webp
4. evcard-diorama-411.png – Screenshot des Shop-Reiters „Get bones“ mit der Krug-Karte (heute noch mit Knochenbündel als Platzhalter).
   Pfad: <projects>\Repositories\Trimps Mobile\docs\evidence\v201-bone-jar\evcard-diorama-411.png
5. MALAUFTRAG.md – die verbindliche Beschreibung (Stufen, Szene, Abnahme).
   Pfad: <projects>\Repositories\Trimps Mobile\docs\design\bone-jar\MALAUFTRAG.md

ZU LIEFERN (PNG, RGBA mit echter Transparenz, 1024 × 1024 px)
- R10-bone-jar-0.png – Stufe 0 (fast leer): Krug mit geschlossenem, mit Seil verschnürtem Holzdeckel; durch eine kleine abgeplatzte Öffnung sieht man wenige helle Knochen am Boden.
- R10-bone-jar-1.png – Stufe 1 (halb voll): Deckel leicht angehoben, Krug etwa zur Hälfte mit kleinen hellen Knochen gefüllt.
- R10-bone-jar-2.png – Stufe 2 (voll): Deckel aufgeklappt, Knochen über den Rand gehäuft, sanftes warmes Bernsteinlicht aus dem Inneren; ruhig, ohne Funken oder Explosion.
- S13-bone-jar.png – Szenenobjekt: der volle Krug (Stufe 2) als kleines Objekt auf dem Boden der Kolonie-Szene (Datei 3), mit weichem Kontaktschatten, gleiches Licht wie die Szene, sonst transparent (kein Boden, kein Hintergrund).

STIL UND REGELN
- Gleicher Stil wie Datei 1 und 2: handgefertigte 3D-Miniatur, warmes Licht von oben links, dunkle petrol-/braune Schatten, fühlbare Materialien (glasierter Ton, Holz, Seil, elfenbeinfarbene Knochen). Keine flache Vektorgrafik.
- Alle drei Stufen: exakt derselbe Krug, gleiche Größe, gleiche Position, gleicher Blickwinkel (Dreiviertelansicht wie R09), mittig, etwa 70 % der Bildfläche, großzügiger transparenter Rand. Nur der Inhalt und der Deckel ändern sich.
- Die volle Stufe muss auch ohne Farbe als „voll“ erkennbar sein (Knochen über dem Rand).
- Keine Schrift, Zahlen, Münzen, Geldsymbole, Geschenkboxen, Rahmen, UI oder Wasserzeichen.
- Echter Alpha-Kanal, keine farbigen Freistellränder.

ABLAGE (durch mich, den Nutzer)
Ich speichere die vier PNG-Dateien unter:
<projects>\Repositories\Trimps Mobile\output\bone-jar\
Schreibe zu jedem Bild den exakt verwendeten Prompt in eine eigene Textdatei mit gleichem Namen und der Endung .prompt.txt (z. B. R10-bone-jar-0.png.prompt.txt), damit ich sie mit ablegen kann.

ZUM SCHLUSS: RÜCKMELDUNG AN CLAUDE
Wenn alle vier Bilder fertig sind, verfasse bitte einen kopierbaren Text (eine Textbox) für die Rückübergabe und Fertigmeldung an Claude Code, der im Repository <projects>\Repositories\Trimps Mobile arbeitet. Er muss enthalten:
- den Hinweis „Knochenkrug-Grafiken fertig für V-201 (Bone Jar), Darstellung A und C laut docs/design/bone-jar/MALAUFTRAG.md“;
- die Liste der vier Dateien mit Ablagepfad <projects>\Repositories\Trimps Mobile\output\bone-jar\, Pixelgröße und je einer Zeile, was das Bild zeigt, sowie die vier .prompt.txt-Dateien;
- welche Referenzdateien (1–5) verwendet wurden;
- bekannte Schwächen oder Abweichungen vom Auftrag (z. B. Ränder, Unterschiede zwischen den Stufen, Schatten) – ehrlich, auch wenn es keine gibt („keine bekannt“);
- einen Vorschlag für die Position des Szenenobjekts in H01 (z. B. „unten rechts, etwa 12 % der Szenenbreite“);
- den Auftrag an Claude: die Bilder nach artwork/diorama/source-package/assets/ übernehmen (PNG, .prompt.txt und eine .json wie bei R09-Bones.png.json), als WebP nach app/src/main/assets/game/mobile-assets/diorama/ (R10-bone-jar-0/1/2.webp, S13-bone-jar.webp) bringen, die Herkunft in assets/plates/PROVENANCE.json und docs/legal/asset-inventory.csv nachtragen, Darstellung A (Krug-Karte im Reiter Get bones, data-stage 0/1/2) und C (Szenenobjekt auf der Seite Resources) einbauen, Screenshots nach MALAUFTRAG.md (360/411 px, 130 % Schrift, Classic und Diorama) erstellen, unabhängiges Review einholen und einen PR nach integration/next anlegen; die Position des Szenenobjekts vor dem Merge mit mir per Screenshot abstimmen.
```
