# Einstellungen – mobiler Nutzen (V-37, #50)

Stand 15. Oktober 2026, App 0.98. Grundlage: die 65 Originaloptionen in `config.js → game.options.menu` (ohne die fünf Meldungsfilter Story/Loot/Unlocks/Combat/Notices des Logs), ihre Verbraucher in `main.js`, `updates.js`, `objects.js`, `playerSpire.js` und die mobilen Adapter.

Prüfstufen:

- **L** – zur Laufzeit in der lokalen Vorschau umgeschaltet und Wirkung bzw. Nicht-Wirkung gemessen.
- **Q** – Verbraucher im Quelltext nachvollzogen. Keine mobile Überschreibung bekannt, Laufzeit nicht einzeln geprüft.
- **B** – bedingt freigeschaltet (`lockUnless`); im Spiel nur sichtbar, wenn die Bedingung erfüllt ist.

## Entfernt (5)

Die Zeilen werden aus allen Einstellungsansichten und Suchtreffern entfernt. Beim Laden und Import setzt `mobileSettingDefaults()` für alle fünf einen festen, funktionierenden Wert (usePlayFab 0, tooltips 1, tooltipPosition 0, darkTheme 1, tinyButtons 0). Das Spielstandformat bleibt unverändert.

| Schlüssel | Wirkung mobil | Entscheidung |
| --- | --- | --- |
| usePlayFab | Keine: PlayFab wird nicht geladen, die App hat keine Internetberechtigung, `toggleSetting` setzt auf aus. | Entfernt, beim Laden immer 0. Kein Cloud-Versprechen. (L) |
| tooltips | Schaltet bei „aus“ die mobilen Info-Tasten ab (`tooltip()` wartet dann auf Shift): Info öffnet nichts. | Entfernt, beim Laden immer 1. (L) |
| tooltipPosition | Positioniert Hover-Tooltips am Mauszeiger; mobil liegt der Infodialog fest oben (`#tooltipDiv` mit `!important` in `mobile.css`). | Entfernt, wirkungslos; beim Laden immer 0. (Q) |
| darkTheme | Lädt `dark.css`/`gradient.css`; B2 überdeckt Hauptflächen, Dialoge und Originalfenster vollständig. | Entfernt, beim Laden immer Standard (1). (L) |
| tinyButtons | Klassen an `#buyHere`; die mobilen Kaufzeilen bleiben 14 px / 48 px (L). Bei „Small/Tiny“ schrumpft aber das Generatorfenster auf etwa 3,5 px Schrift (`style.css`, 0.85vw). | Entfernt, beim Laden immer „Large“ (0); ein früher gesetzter Wert wird zurückgenommen. |

Zusätzlich ausgeblendet seit V-141 (#228, 25.10.2026): `hotkeys` („Keyboard shortcuts“). Die Einstellungsoberfläche enthält keine Tastaturhinweise mehr; der gespeicherte Wert bleibt unverändert und wird nicht zurückgesetzt, die Tastaturverarbeitung des Originals bleibt erhalten. `ctrlGigas` heißt in der Anzeige „Gigastation only“ / „Rebuy Warpstations“ (`mobile-touch-texts.js`).

## Bereits ausgeblendet (2)

| Schlüssel | Grund |
| --- | --- |
| saveAndExit | Nur Desktop-Laufzeit `nw` (`lockUnless`); in der Android-WebView nie sichtbar. |
| richPresence | Discord, nur `nw`; nie sichtbar. |

## Behalten (58)

| Schlüssel | Wirkung / Begründung | Prüfung |
| --- | --- | --- |
| autoSave | Ruft minütlich `save()` auf, mobil über die gesicherte Speichertransaktion. Lebenszyklus-Speicherung bleibt zusätzlich. | Q |
| standardNotation | Zahlenformat aller Anzeigen. | Q (V-23) |
| showSRInfo | Screenreader-Hinweise. | B |
| queueAnimation | Bauwarteschlangen-Animation. | Q |
| barOutlines | Rand am Balkenende. | Q |
| menuFormatting | Formatierte Bestandszahlen. | Q |
| formatPerkLevels | Formatierte Perk-Level. | Q |
| smallPerks | Perk-Tasten im Portal (72 → 64 px Höhe). | L |
| progressBars | Fortschrittsbalken bzw. Leistungsmodus. | Q |
| generatorAnimation | Generator-Animation. | Q |
| confirmhole | Wormhole-Bestätigung. | Q |
| equipHighlight | Ausrüstungshervorhebung. | Q |
| lockOnUnlock | Sperre bei neuen Freischaltungen. | Q |
| achievementPopups | Erfolgsmeldungen. | Q |
| mapLoot | Kartenbeute-Priorität. | Q |
| repeatUntil | Kartenwiederholung. | Q |
| exitTo | Ziel nach Kartenende. | Q |
| repeatVoids | Void-Karten wiederholen. | Q |
| boneAlerts | Bone-Käufe bestätigen. | Q |
| showAlerts | Hinweis-Badges. | Q |
| showFullBreed | Nachwuchszeit-Anzeige. | Q |
| fadeIns | Einblendungen. | Q |
| romanNumerals | Römische Zahlen. | Q |
| extraStats | Zusätzliche Kartenwerte. | Q |
| useAverages | Durchschnittswerte. | Q |
| voidPopups | Heirloom-Meldungen. | Q |
| portalChallenge | Portal-Challenge-Bestätigung. | Q |
| detailedPerks | Ausführliche Perk-Infos. | Q |
| alwaysAbandon | Reiseverhalten in Karten. | Q |
| extraMapBtns | Zusätzliche Kartenaktionen. | B |
| GeneticistassistTarget | Geneticistassist-Ziel (Dialog). | B |
| liquification | Liquification. | B |
| overkillColor | Overkill-Farben. | B |
| forceQueue | Bauwarteschlange erzwingen. | B |
| mapsOnSpire | Karten an Spires. | B |
| mapAtZone | Karten nach Zone (Dialog). | Q (V-23) |
| timestamps | Zeitstempel im Log. | Q |
| gaFire | Geneticistassist-Entlassen. | B |
| masteryTab | Mastery-Hinweise. | B |
| bigPopups | Große Meldungen. | B |
| generatorStart | Generator-Startmodus. | Q (V-23) |
| showSnow | Schneeeffekt. | B |
| showHoliday | Saisonale Gegner. | Q |
| geneSend | Geneticist-Senden. | Q |
| fireForJobs | Für Berufe entlassen. | Q |
| ctrlGigas | Gigastation-Steuerung. | B |
| showHeirloomAnimations | Heirloom-Animationen. | B |
| hotkeys | Tastaturbefehle; mit Hardware-Tastatur nutzbar. Seit V-141 ausgeblendet, Wert bleibt erhalten. | Q |
| climbBw | Bionic Wonderland fortsetzen. | B |
| offlineProgress | Away-/Offline-Fortschrittswege (V-12). | Q, eigene Tests |
| archAutomator | Archaeology-Automatik. | B |
| hideCompleteAchieves | Abgeschlossene Erfolge ausblenden. | Q |
| sealedSpire | Spire-Anzeige. | B |
| sealedAutoBattle | Spire-Assault-Anzeige. | B |
| saveOnPause | Beim Pausieren speichern. | Q |
| pauseGame | Pause. | Q, eigene Tests |
| disablePause | Pausieren erlauben. | Q |
| deleteSave | Spielstand löschen mit Originalbestätigung („Reset“). | Q |

Mit **Q** markierte Optionen gelten nicht als einzeln zur Laufzeit geprüft. Fortschrittsabhängige Optionen wurden nicht wegen ihrer aktuellen Sperre entfernt.
