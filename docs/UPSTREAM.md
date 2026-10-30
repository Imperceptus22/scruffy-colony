# Originalquelle und ausgelieferte Kopie

Quelle: https://github.com/Trimps/Trimps.github.io, Commit `b9edb1dfee270ebf81bef8d934dc71276bf8d963`, Trimps 5.10.1.

`app/src/main/assets/game/` enthält die lokale Spielkopie. `upstream/trimps/` im ursprünglichen Arbeitsordner bleibt unverändert. `.git`, Editor-Dateien und PlayFab-SDK werden nicht mitgeliefert. Original-Copyrights bleiben erhalten. `docs/upstream-manifest.json` enthält die Originalprüfsummen; eigene Ergänzungen werden im Git-Diff dokumentiert.

Fuenf Originaldateien sind gezielt angepasst:

- `index.html`: PlayFab-Skript entfernt, Viewport und lokale mobile Ergänzungen geladen. Originalknoten/-IDs erhalten.
- `main.js`: originaler Export bleibt `saveOriginal`, validierter interner Loader `loadOriginal`; normale Save-/Import-Einstiege nutzen die mobile Transaktion. Timer starten erst nach Wiederherstellung, Time Warp lässt sich suspendieren. PlayFab-Funktionen gesperrt. Heirloom-Namen an HTML-Ausgaben escaped.
- `updates.js`: Maps werden mit DOM-Knoten und Funktionsreferenzen aufgebaut; keine importierte ID in Handlertext. Käufe erhalten separate Info-Tasten; originale Filterwechsel vermitteln die mobile Detailansicht, ohne neue Spielregeln. Willkommen/Donation zeigen keine Online- oder Zahlungsaktivierung. PlayFab-Einstellung gesperrt.
- `updates.html`: alte Dienstelogos entfernt (24.10.2026); urspruenglicher Aenderungstext und Textlinks erhalten.
- `lz-string.js`: begrenzte Base64-Dekomprimierung zusätzlich zum unveränderten Original-API.

Die fuenf Dateien der gemischten IcoMoon-Schrift und ihrer CSS-Zuordnung sind seit 0.11 ausgeschlossen. Seit 3.58 entfallen ausserdem zwei alte Hintergruende, Favicon und vier Dienstelogos; alle zwoelf Ausschluesse stehen mit Originalhash im Manifest. Alle anderen Originaldateien bleiben bytegenau erhalten und werden gegen das Manifest geprüft; `.gitattributes` erhält diese Bytes auch in Linux CI. Neue Dateien (`mobile-*`, `save-*`) enthalten nur Präsentation, sichere Validierung und Speicherung, kein zweites Spielmodell. Originalkosten und Offline-Algorithmen bleiben beim Original.

Speichern verwendet den vollständigen Originalexport, prüft ihn, schreibt localStorage mit Readback und bestätigt erst nach der atomaren nativen Sicherung Erfolg. Der Original-Save hatte keinen Rückgabewert. Die zusätzlichen Transaktionshelfer sind gezielt testbar. `mobile-ui.js` ist der Präsentationsadapter, der im Plan noch `mobile.js` hieß.
