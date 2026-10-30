# Freigegebene Gegnergrafiken - V-134 / #206

> Hinweis (27.10.2026): Die hier genannten Nachweis-Skripte wurden mit V-211 aus `tools/` entfernt; sie liegen in der Git-Historie (`git log --diff-filter=D -- tools/`). Gepflegte Werkzeuge: [tools/README.md](../../../tools/README.md).

Die sechs Tafeln wurden am 24.10.2026 mit allen 59 Motiven freigegeben. Die
unveränderten lokalen Referenzen wurden vor der Produktion versioniert. Die
historischen Statusangaben in `proposals.json` und `BESTAND-UND-VORSCHLAEGE.md`
geben ihren Entstehungszeitpunkt wieder; die spätere Freigabe steht in Issue #206.

Basis der Umsetzung: `4174b4985da0509001f8d90662028d19f835a169`. Zu diesem Zeitpunkt
war der separat freigegebene Turkimp aus #204 bereits integriert. Seine PNG-Datei
bleibt bytegleich; die abweichende individuelle Freigabe ist in
`../turkimp-2026-10-24/asset.json` dokumentiert. Daher umfasst dieses Paket **58 neu
produzierte Dateien plus den vorhandenen Turkimp**, also alle 59 Zielmodelle.
Die 26 weiteren Bestandsbilder bleiben ebenfalls bytegleich. Insgesamt erhalten
alle 85 ursprünglichen Gegner einen eigenen Bildpfad; Familien und interne
Schlüssel bleiben erhalten, einschließlich `Magimp` und `Hulking_Mutimp`.

## Herkunft und Prüfung

- `provenance.json`: Originalpfade, Prompts und SHA-256 der sechs Tafeln.
- `production-prompts.json`: Einzelproduktion mit eingebautem `image_gen`,
  vollständige Prompts, Referenzen und ursprüngliche Ausgabepfade. Alle Figuren
  sind eigenständige Produktionen; keine Tafel wurde als Produktionsatlas benutzt
  oder ausgeschnitten. Gezielte Korrekturen bewahren ihre verworfene Vorfassung
  unter `previousProduction`.
- Produktionsdateien: `app/src/main/assets/game/mobile-assets/imp-family/<Originalschlüssel>.png`.
  Sie sind die unveränderten Werkzeugausgaben mit echter Alpha-Transparenz.
- `preserved-assets.json`: SHA-256 der 27 bereits vorhandenen Einzeldateien.
- `asset-check.json`: Dateihashes, RGBA, Maße, Alpha-Extrema und Umrisse. Der rohe
  Alpha-Umriss wird zusätzlich zu Umrissen mit Alpha >2 und >16 gespeichert:
  niedrigdeckende Bildwerkzeugreste zählen nicht zur sichtbaren Silhouette.
  Alle neuen Motive haben bei Alpha >16 Rand; kein Randpixel hat mehr als
  16/255 Deckkraft. Robotrimp hat solche Hintergrundreste auch bei Alpha >2,
  während sein eigentlicher Umriss vollständig innerhalb der Datei liegt.
  Die Produktionsdateien werden hierfür nicht verändert.
- `mapping.json`: vorherige und endgültige Zuordnung aller Originalschlüssel.
- `contact-01.png` bis `contact-06.png` und `contact-all.png`: Kontaktübersichten
  für Motivtreue, Vollständigkeit, Silhouette und Unterscheidbarkeit.

Reproduzierbare technische Bildkontrolle mit Python/Pillow:
`python tools/check-remaining-enemy-art.py`. Sie erzeugt nur Prüfdaten und
Kontaktbögen. `node --test tests/remaining-enemy-art.test.cjs` schützt Schlüssel,
Zuordnung, Herkunftshashes, alle neuen Einzeldateien und unveränderte Bestände.
`tools/remaining-enemy-art-proof.cjs` prüft die reale Kampfansicht mit kontrollierter
Darstellungsfixture und exportiert `check(page, screenshot)` für denselben
Nachweis in einer Debug-WebView. Er ändert keine Gegner-Freischaltungen.
Browsernachweise liegen in `docs/evidence/remaining-enemy-art/`, die finalen
nativen Nachweise des zentralen Runners in `docs/evidence/ui-round/remaining-enemy-art/`.

Lokale Prüfung des Grafikpakets auf Basis `4174b49`: 269 Node-Tests bestanden, Assetprüfung und
Versionsprüfung grün. Die Bildprüfung bestätigt 59 Zielgrafiken (58 neu) und die
bytegleichen 27 Bestandsdateien. Alle sechs Kontaktbögen wurden visuell geprüft;
unerwünschte zusätzliche Flügel/Schwänze wurden in 14 gezielten Bildkorrekturen
entfernt. Der Browsernachweis lädt alle 59 Zielmotive, zeigt je ein Motiv der sechs
Gruppen bei 100/130 % Schrift und prüft Welt-/Kartenwechsel, fehlende Atlasmarker
und unveränderte Ressourcen/Imp-Freischaltungen während der Darstellung.
Fünf Originalausgaben haben eine maximale Alpha-Deckkraft von 254 statt 255;
Hintergründe enthalten vollständig transparente Pixel. Native Android-Prüfung und
unabhängiges Review erfolgen durch den Hauptchat vor Integration.

Die Optik und das Zubehör sind gestalterische Deutungen ohne neue Spielregeln.
Originalklon, Werte, Beute, Freischaltungen und Spielstandformat bleiben erhalten.
Eigene schutzfähige Projektbeiträge stehen unter GPL-3.0-or-later; es wird keine
ausschließliche Rechteposition an KI-Motiven oder Originalspielfiguren zugesagt.

## Zusammengeführter Android-Nachweis

Am korrigierten Grafikstand `8c1db24` sind im Hauptworktree 282 Node- und 2 Python-Tests, Asset-/Versions-/Advisorprüfung sowie der Android-Debug-Bau grün; der vorausgehende 3.91-Stand bestand zusätzlich Preview-Bau, Unit-Tests und Lint. Der native API36-Nachweis liegt unter `docs/evidence/ui-round/remaining-enemy-art/`: alle 59 Zielbilder geladen, sechs Gruppen bei 100/130 % Schrift, Welt-/Kartenwechsel, keine Atlasmarker oder horizontaler Überlauf. Normale Saves bleiben unverändert; Darstellungsprüfungen verändern keine Ressourcen oder Imp-Freischaltungen. Die drei Motivkorrekturen an Mantimp, Golimp und Slagimp wurden im selben unabhängigen Review nachgeprüft. Physischer Handytest bleibt offen.
