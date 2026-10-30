# Entwürfe zur UI-Feedbackrunde0.93

Aktueller Stand: **alle drei Entwürfe vom Nutzer am15.10. freigegeben; Umsetzung läuft**. [Übersicht](proposals.png), [HTML-Vorschau](proposals.html). Beispielzahlen sind illustrativ.

1. **Personal/Kolonie (#40/#42):** vorhandenes Feldstationsbild gemeinsam unter den fünf Reitern; Jobs und Workspaces in einer Zeile; zwei Jobkästchen je Zeile, Minus/Plus separat am Fuß, Info im Kopf. Keine Bauaufträge in Personal/Forschung/Verteidigung. Bestehende globale Mengenwahl und Originalfunktionen erhalten.
2. **Kartenkammer (#46/#47):** flaches Bild einer Kartenwerkbank; verfügbarer Fragmentbestand deutlich getrennt von Kosten. Vorlagen1–5 bleiben direkte Ladeaktionen, wie im Original. Sichtbar beschriftetes Speichern in den ausgewählten Platz und Werte-Zurücksetzen. Alle Karten recyceln wird bei den eigenen Karten gruppiert; originale Wirkung/Bestätigung bleibt erhalten. Spätere Optionen und Bestände bleiben erreichbar, auch wenn die frühe Vorschau sie nicht zeigt.
3. **App-Symbol (#41):** vertrautes Trimp-Gesicht mit petrolfarbenem Hintergrund, vorhandene spielinterne Figuren als Stil-/Identitätsreferenz. Groß und klein sowie unter runder Maske dargestellt. Als adaptives Android-Symbol mit separatem Hintergrund und unverändertem transparentem Vordergrund eingebunden.

Die neuen Bilder wurden mit dem integrierten Bildgenerierungswerkzeug erzeugt, nicht mit externen Grafikpaketen oder dem API-Fallback. Unveränderte Ausgaben in launcher-foreground.png und maps-workbench.png; vollständige Prompts und Referenzen in [prompts.json](prompts.json). Die Kartenillustration wird als50px hohe Fläche mit Fokus auf die Kartenwerkbank gezeigt, entsprechend dem bestehenden Koloniebild. Das App-Symbol hat einen echten transparenten Vordergrund; der petrolfarbene Hintergrund wird separat dargestellt.

AutoFight-Schwerter mit kleinem A war bereits ausgewählt und gehört zu AP1. Dessen Kampf-/Info-Korrekturen verwenden bestehende Oberflächenmuster; sie erfordern keine neue visuelle Variantenrunde. Alle drei neuen Entwürfe sind freigegeben.

Freigabe: Nutzer hat alle drei gezeigten Entwürfe am15.10. ausdrücklich zur Umsetzung ausgewählt. Das unveränderte Kartenbild liegt unter app/src/main/assets/game/mobile-assets/maps-workbench.png, der Symbolvordergrund unter app/src/main/res/drawable-nodpi/launcher_trimp.png. Android-inset20% übersetzt die gezeigte90%-Skalierung innerhalb der Launcher-Maske in deren108dp-Vordergrundfläche.
