# App-Fassungen der Gegnerbilder

> Stand V-212 (27.10.2026, Nutzerentscheidung): höchstens 400 px, verlustbehaftetes WebP Qualität 85 mit verlustfreiem Alphakanal, erzeugt mit `node tools/build-enemy-images.cjs` (sharp). Abschnitt „V-212“ unten; die übrigen Abschnitte beschreiben frühere Stände.

> Hinweis (27.10.2026): Die hier genannten Nachweis-Skripte wurden mit V-211 aus `tools/` entfernt; sie liegen in der Git-Historie (`git log --diff-filter=D -- tools/`). Gepflegte Werkzeuge: [tools/README.md](../../../tools/README.md).

Nutzerauftrag 24.10.2026: kleinere Bilder für die App, sichtbar gleiche Qualität, Originale im Quellenpaket; nach integration/next integrieren, **keine APK erstellen**.

Die 85 ursprünglichen PNGs liegen unverändert in `../enemy-originals/`. Die App verwendet ausschließlich die WebP-Fassungen unter `app/src/main/assets/game/mobile-assets/imp-family/`. Seit V-147 (#240, 25.10.2026) werden die App-Fassungen mit Lanczos (vormultipliziertes Alpha) auf höchstens 640 px Kantenlänge verkleinert; das Seitenverhältnis bleibt erhalten, Kodierung weiterhin verlustfreies WebP mit exakten RGBA-Werten und vorhandenen ICC-/EXIF-Daten. Angezeigt werden die Bilder mit höchstens etwa 120–150 CSS-px (rund 320–400 Gerätepixel bei DPR 2,625), 640 px reichen damit auch für DPR 4 bei 150 CSS-px. Die frühere Entscheidung für Originalauflösung und der verworfene 768-px-Versuch aus Oktober 2026 sind damit abgelöst.

`python tools/build-enemy-images.py` erzeugt die Dateien reproduzierbar mit Pillow/libwebp und prüft jede Dekodierung pixelgenau gegen die verkleinerte Fassung (`appRgbaSha256`); `originalRgbaSha256` belegt die Originalpixel. `manifest.json` enthält Versionen/Parameter, beide Pfade und Dateihashes, Abmessungen und Größen. Grundlage sind die vorhandenen 27 Bestandshashes und 58 Produktionshashes; kein Motiv wurde neu produziert oder verändert. Der historische Produktionspfad `app/.../imp-family/*.png` in früheren Designunterlagen bezeichnet den damaligen Stand. Aktuelle Originalablage ist `docs/design/enemy-originals/`; frühere Tabellen/Prompts bleiben historische Belege.

Das normale Quellenpaket aus `tools/package-sources.py` enthält alle versionierten PNG-Originale und den Encoder automatisch. Sie liegen außerhalb der Android-Assets und werden nicht mit der App ausgeliefert. Farbige Projektgrafiken und ihre Quellen-/Lizenzzuordnung bleiben unverändert; eigene schutzfähige Beiträge GPL-3.0-or-later, keine ausschließlichen Rechte an generierten Motiven zugesichert.

## Abnahme ohne APK

- Node-Test prüft alle 85 Original-SHA gegen die früheren Herkunftsbelege und alle WebP-Pfade/Hashes.
- Encoder prüft den vollständigen RGBA-Rundlauf, Abmessungen und Metadaten.
- `node tools/ui-round-proof.cjs enemy-image-optimization`: Browservergleich aller 85 Bilder auf hell/dunkel, Anzeigebox 120×96 und 150×120 CSS-px bei DPR1/2.625/4; sechs direkte Ansichtsvergleiche und bestehende Welt-/Kartennachweise. Mittlere RGB-Abweichung maximal0.75/255 und höchstens1% Pixel über8/255 als zusätzliche Renderergrenzen; die Kodierung selbst ist pixelidentisch.
- `node tools/ui-round-proof.cjs enemy-image-optimization --native --local-assets`: vorhandene Debug-Hülle: alle 59 Zielmotive laden und sechs repräsentative Gruppen direkt vergleichen; die echten neuen WebP-Dateien per CDP als Blob-URLs in einer reinen Darstellungsfixture einsetzen (Android AssetLoader umgeht die CDP-Netzwerkumleitung). Die originalgetreue Runtime-Zuordnung wird vor der Fixture geprüft, die tatsächlichen Dateipfade zusätzlich im Android-Asset-Merge. Kein neuer nativer Build/keine Installation; JSON kennzeichnet diesen begrenzten Nachweis ausdrücklich. Normale Saves bleiben unverändert.
- Android-Kompilierung, Asset-Merge aller Varianten, Unit-Tests und Lints ohne Paketierung. Zusammenführung nur mit frischem unabhängigem read-only Review und grünem quality-gate.
- PR-Marker `<!-- no-apk-build -->` aktiviert im quality-gate nur den Verzicht auf APK-Paketierung; Quellen-, Versions-, Node-/Python-/Website-/PHP-Tests und Android-Compile/Assets/Unit/Lint bleiben aktiv. Eine abschließende Kontrolle verbietet APK-Ausgaben. Standard-PRs behalten den bisherigen vollständigen Buildmodus.

Größen und finale Nachweise stehen im Manifest, in `docs/evidence/ui-round/enemy-image-optimization/` und im PR. Eine tatsächliche neue APK-Größe wird nicht behauptet, weil keine APK erstellt wurde.

Lokaler Abschluss: 161.585.671 → 109.363.094 Byte Gegnerbilder (32,32 % weniger). 283 Node- und 2 Python-Tests, Asset-/Versions-/Advisorprüfungen, Android-Compile/Unit/Lints und drei Asset-Merges grün. Browser: alle 85 Bilder verglichen; native vorhandene Debug-Hülle: 59 Bilder geladen und sechs Motive verglichen. Maximal mittlere RGB-Differenz 0,303/255, keine Pixel über8/255 auf hell/dunkel bei120/150CSSpx undDPR1/2.625/4. PNGs und WebP dekodieren im Encoder in exakt gleiche RGBA-Werte. Normale Saves unverändert, keine Browserfehler. Vorhandene drei APK-Dateien nach SHA und Änderungszeit unverändert, keine neue APK erstellt. Physischer Handytest offen; eine neu gebaute APK wurde ausdrücklich nicht geprüft.

## V-147: Verkleinerung auf 640 px (25.10.2026)

109.363.094 → 30.344.906 Byte für alle 85 Bilder (−72,3 %), Pillow 12.3.0 / libwebp 1.6.0. `tests/enemy-image-optimization.test.cjs` prüft Zielgröße, Seitenverhältnis, VP8L-Kopf, Hashes und unveränderte Originale. Browservergleich im Kampf (Diorama und Previous graphics, 412×915 bei DPR 2,625): `docs/evidence/feedback-4-28/V-147/`. Die obigen Messwerte des Abschnitts „Lokaler Abschluss“ beschreiben den früheren Stand in Originalauflösung.

## V-212: 400 px, Qualität 85 (27.10.2026)

Nutzerentscheidung anhand von `docs/evidence/v212-performance/vergleich-gegnerbilder.png`: 400 px / Q85. Angezeigt werden die Bilder mit etwa 88 CSS-px Höhe (rund 231 Gerätepixel bei DPR 2,625). `tools/build-enemy-images.cjs` verkleinert die unveränderten PNG-Originale mit Lanczos (vormultipliziertes Alpha) und kodiert verlustbehaftet mit Qualität 85, verlustfreiem Alphakanal, effort 6 und Smart Subsampling; Pillow wird nicht mehr gebraucht (`build-enemy-images.py` entfällt). `tests/enemy-image-optimization.test.cjs` prüft Originale, Zielgröße, Seitenverhältnis, VP8X-Kopf mit VP8- und ALPH-Block sowie Hashes. Größen stehen im Manifest.
