# Perky A – Umsetzung und Quellen

> Hinweis (27.10.2026): Die hier genannten Nachweis-Skripte wurden mit V-211 aus `tools/` entfernt; sie liegen in der Git-Historie (`git log --diff-filter=D -- tools/`). Gepflegte Werkzeuge: [tools/README.md](../../../tools/README.md).

## Freigegebene Gestaltung

Operate-Oberfläche für Spieler, die ihre Helium-Verteilung im Spiel berechnen und bewusst übernehmen möchten. Drei Ansichten aus `entwurf-A-screen1.png` bis `screen3.png`: Eingaben, Planvorschau, vorgemerkter Plan mit Originalbestätigung. Leinen/Petrol und vorhandene Typografie bleiben erhalten. Der Respec-Bereich ist der Einstieg; die beispielhafte Tabposition in den Entwürfen wird gemäß #142 konkretisiert. Bildzahlen sind illustrative Daten, keine Rechenergebnisse.

## Fixierte Quelle

- [Grimy / Perky](https://github.com/Grimy/Grimy.github.io/tree/f678ddc718ba4cede2b7a86fbb8bcb96951a329f), Commit `f678ddc718ba4cede2b7a86fbb8bcb96951a329f`.
- Unveränderte `src/perks.ts`, `src/trimps.ts` und `LICENSE.txt` unter `app/src/main/assets/game/vendor/perky/`. Lizenz: WTFPL. SHA256 je Datei und generiertem Bundle in `SOURCE.json`.
- `node tools/build-perky.cjs` erzeugt mit Node 24s eingebauter TypeScript-Transformation das lokal gekapselte `perky.js`; `--check` prüft die reproduzierbare Ausgabe. Keine neue Laufzeitbibliothek.
- Die Browser-Seitenanbindung aus dem Original wird nicht ausgeführt. Ein gekapselter Feldadapter stellt reine Eingaben bereit, ruft die unveränderten Funktionen `read_save`, `parse_inputs`, `parse_perks` und `optimize` auf und liefert Daten zurück. Berechnung läuft in einem Worker mit 15-Sekunden-Grenze; Abbrechen oder veränderte Eingaben beenden ihn.

## Abgleich mit Trimps 5.10.1

Alle 29 U1-Perks haben dieselben Basiskosten, additiven Inkremente beziehungsweise Wachstumsfaktoren. Originalgrenzen aus dem Spiel werden zusätzlich angewandt. Drei repräsentative Budgets/Zielzonen werden gegen die direkt aus den fixierten TypeScript-Quellen ausgeführte Originaloptimierung verglichen; Level stimmen überein. Die Summen der vorgeschlagenen Level werden separat gegen `getPortalUpgradePrice`/`getAdditivePrice` des Spiels geprüft.

Perky ist ein Modell und eine Empfehlung für gewählte Ziele, kein Beweis eines globalen Optimums. Presetregeln können Gewichte oder Zielzone ändern; die Vorschau zeigt tatsächlich verwendete Werte. Eingaben begrenzen die Zielzone auf 1–999, den numerisch unterstützten Bereich dieses lokalen Rechners. Die Originalpreisfunktion verarbeitet pro Import höchstens 1000 Leveländerungen je nichtadditivem Perk; der Rechner hält diese Änderungsgrenze ein, vorhandene höhere Level bleiben unterstützt. Additive Perks behalten ihre großen Originalbereiche. Ungültige/inkonsistente Grenzen und Ergebnisse werden zurückgewiesen. Feat-Budgets können die tatsächlich verfügbaren Mittel begrenzen, niemals erhöhen.

## Budget und Übernahme

Der Adapter liest das aktuelle Portal-/Mid-run-Respec-Budget und die bestehenden Vormerkungen. Der Gesamtplan umfasst aktuelle absolute Originalkosten plus tatsächlich verbleibende Kaufmittel. Aktuell im Lauf verdientes Helium wird bei Mid-run nicht als zusätzliches Budget angerechnet. Ohne Respec dürfen gespeicherte Level nicht sinken; Rücknahme noch nicht bestätigter Käufe bleibt innerhalb der Originalregeln.

Berechnung und Vorschau verändern keine gespeicherten oder temporären Perk-Level. Die Invalidierung berücksichtigt das gewählte Preset: aktuelle Bevölkerung nur bei Trapper, aktuelle Welt nur bei Spire, Fluffy-XP nur bei freigeschaltetem Capable. Unbenutzte normale Spielticks verhindern die Übernahme nicht; Budget, Perks/Vormerkungen, Freischaltungen, Grenzen, Respec und wirksame Modellwerte bleiben geschützt. `Use this plan` prüft den Spielkontext erneut, berechnet die tatsächlichen Änderungen mit der Originalpreisfunktion und ruft den bestehenden `importPerks()` auf. Unbekannte, gesperrte, zu hohe, negative, unvollständige oder nicht bezahlbare Ergebnisse werden vorher abgewiesen. Bei unerwartetem Importfehler wird die vorherige Vormerkung wiederhergestellt. Die anschließende ausdrückliche Bestätigung aktiviert die originale Schaltfläche; im Portal-Kontext öffnet sie die normale Neue-Run-Bestätigung. Kein automatisches Portal.

Universe 2 ist ausgeschlossen; Hypothermia und Offline-Nachberechnung bleiben geschützt. Die Lizenz ist offline unter More → App → About → Licenses & Source erreichbar. Keine neue INTERNET-Berechtigung oder Rechner-Netzverbindung.

## Gezielte Nachweise

Node-Regressionen in `tests/mobile-perky.test.cjs`; Browser-/Android-Ablauf in `tools/perky-proof.cjs` und `docs/evidence/ui-round/perky/`. Der Ablauf verwendet ausschließlich synthetische Originalspielstände im getrennten Entwicklungsspeicher. Die normalen Slots werden vor/nach dem Ablauf byteweise verglichen. Keine persönlichen Save-Exporte enthalten.
