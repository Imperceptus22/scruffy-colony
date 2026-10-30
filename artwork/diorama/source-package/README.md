# Diorama-Grafiken zur Motivfreigabe

24.10.2026 · Scruffy Colony · 89 Motive in 13 Ausgangsatlanten. Produktion durch drei ausdrücklich beauftragte Sub-Agenten und den Hauptchat. Kein Einbau in die App, kein Commit, keine Veröffentlichung und keine APK.

## Freigabe

Öffne index.html. Jedes Motiv hat eine stabile ID; ein Klick öffnet sein PNG. Du kannst im Chat beispielsweise „Alle freigeben außer B14 und J11“ schreiben. Bis dahin stehen alle Einträge in manifest.json und den Sidecars auf approved=false. Die Freigabeübersicht selbst ändert diesen Status nicht.

- B01–B21: alle 21 vorhandenen Gebäude-Illustrationen, abgeglichen gegen die SVG-Dateinamen von origin/integration/next.
- E01–E13: alle 13 Ausrüstungsgegenstände, ebenfalls gegen den Originalbestand abgeglichen.
- R01–R09: Food, Wood, Metal, Science, Fragments, Gems, Helium, Radon, Bones.
- J01–J11: Farmer, Lumberjack, Miner, Scientist, Trainer, Explorer, Geneticist, Magmamancer sowie Amalgamator, Meteorologist und Worshipper. Der Dragimp-Job verwendet weiterhin die vorhandene Monsterdarstellung.
- M01–M08: Random, Mountain, Forest, Sea, Depths, Gardens, Farmlands, Void. Void ist ein eigener Kartentyp, keine zusätzliche normale Biom-Auswahl.
- S01–S12: Kolonie, Bauwerkstatt, Rüstkammer, Arbeitslager, Forschung, Portal, Heirlooms, Mehr/Einstellungen, Player Spire, Spire Assault, Alchemie und Mutatoren.
- T01–T09: drei rechteckige Kampffeldmaterialien sowie Baum, Nahrung, Erz, Buch, Geschenk und Freischaltungsmarke. Statusfarben und Auswahl bleiben separate Zustände.
- U01–U06: Pergamentfläche, Petrol-, Bernstein- und inaktive Taste, Holzplanke und Rahmen des aktuellen Feldes.

## Geplante Wiederverwendung

Ressourcen/Bauen/Ausrüstung/Personal verwenden ihre Einzelmotive und die passenden Szenen. Die Forschungswerkbank kann auch Perks und Masteries tragen; der neutrale Schreibtisch passt zu Mehr, Speichern, Hilfe, Statistiken und Erfolgen. Die Heirlooms-Szene ist eine dekorative Objektvitrine; Requisiten darin bedeuten keine neuen Gegenstandstypen. Alchemie und Mutatoren erhalten eigene Hintergründe. Für weitere Dialoge werden die neutralen Materialplatten wiederverwendet, keine zusätzliche Illustration pro Meldung.

Bestehende Monster und die Kampfgruppe bleiben erhalten. Die vorhandenen Bedienicons, Texte, Zahlen, Kosten, Slider, Balken, Freischaltungen und Bestätigungen werden als echte UI dargestellt; sie werden nicht in die Bilder eingebrannt. Das Paket führt keine neue Währung, Platzierungsmechanik, Kampfregel oder Balance ein. Figuren und Kulissen versprechen keinen konkreten Ausbau-/Spielzustand.

## Technische Grenzen dieses Freigabestandes

Dies ist eine vollständige Motivsammlung für die beschriebenen Bereiche, keine als produktionsfertig abgenommene Android-Integration. Bei mehreren transparenten Atlanten sind farbige Freistellränder oder einzelne Pixel vorhanden, besonders bei Gebäude-Atlas 2 und den Rollenporträts. Echte Alpha-Kanäle sind vorhanden; daraus folgt keine saubere Kontur. Vor Einbau ist eine gezielte Randbereinigung mit erneuter Sichtprüfung nötig. Die Gallery bietet helle und dunkle Hintergründe, damit dies sichtbar bleibt.

Die einzelnen PNGs sind deterministische Ausschnitte der Ausgangsatlanten in nativer Pixelgröße, nicht künstlich hochskalierte Einzelgenerationen. Zellgrenzen, Figurenmaßstab, Abstände und Beschneidungen sind vor Verwendung in der App abschließend zu kalibrieren. Die großen Szenen können später als dekorative Banner ausgeschnitten werden; die jetzigen Quadrate bestimmen noch keinen endgültigen Bildschirmaufbau. Die UI-Materialien brauchen gemessene Skalierungs-/Inset-Grenzen und Zustände. Die Notizbücher auf dem Schreibtisch sind Requisiten und stellen keine zählbare Spielstandanzeige dar.

Nicht geprüft: Android-Laufzeit, Performance, Schriftvergrößerung, TalkBack, alle späten Freischaltungen und Sonderzustände. Keine Behauptung, dass das Gesamtbild als Bitmap die künftige UI ersetzen kann.

## Dateien und Provenienz

- assets/: alle 89 Einzelgrafiken, IDs, exakte Quellprompts und Einzelmetadaten.
- sheets/: acht beschriftete Gruppenübersichten.
- uebersicht.png: Gesamtübersicht mit allen 89 IDs.
- objects/, world/, special/, interface/: originale Ausgangsatlanten, Prompts und Agentenprovenienz, unabhängig von den Einzelzuschnitten.
- manifest.json: vollständige Zuordnung, Freigabe- und Produktionsstatus sowie native Quell-/Ausschnittgrößen.
- build-gallery.cjs: reproduzierbarer Zuschnitt und Übersichtsexport; prüft Anzahl, IDs, Bilddaten, Ausschnittgrenzen und Vollständigkeit der vorhandenen Gebäude/Ausrüstung.
- verify-gallery.cjs / verification.json: Nachweise der lokalen Galerieprüfung.

Alle Rastergenerationen wurden mit dem integrierten Bildgenerator erstellt; keine API-/CLI-Ersatzgenerierung. Die automatischen Zuschnitte/Übersichten exportieren vorhandene Bilddaten. Originalgenerationen unter generated_images bleiben erhalten. Vorhandene Dateien und App-Assets wurden nicht ersetzt.

