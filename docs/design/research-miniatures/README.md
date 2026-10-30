# Forschungsminiaturen (V-172)

Stand 25.10.2026. Je Forschung eine gemalte Miniatur im Bildplatz der Pergamentkarte (Diorama). Jedes Motiv liegt auf einem Buch oder einer Schriftrolle und trägt unten rechts den goldenen Aufwärtspfeil, damit Forschung nie wie die normale Ausrüstung, das Gebäude oder der Job aussieht (Vorgabe des Nutzers). Nutzerfreigabe aller 59 Motive vor dem Einbau: 25.10.2026.

## Dateien
- `MALAUFTRAG.md` – Auftrag für das Bildwerkzeug.
- `source/tafel-a.png` … `tafel-d.png` – unveränderte Originalausgaben (1254 × 1254 px), `source/PROMPTS.md` – Prompts, Versuche, Motivprüfung, Prüfsummen.
- `cut-research-miniatures.py` – Zuschnitt nach Konturen, Freistellung (Schatten als halbtransparentes Schwarz, Leuchten weich, Kanten ohne dunklen Saum), gemeinsamer Maßstab, WebP 160 × 160 px. Aufruf: `python -I docs/design/research-miniatures/cut-research-miniatures.py docs/design/research-miniatures/source app/src/main/assets/game/mobile-assets/diorama-research docs/design/research-miniatures/crops.json` (numpy, Pillow mit WebP).
- `crops.json` – Zellen und Umrisse je Motiv in den Originalen.
- App: `mobile-assets/diorama-research/U-R*.webp`, Zuordnung in `mobile-diorama-research-art.css` (über die Original-Button-ID in der Karte, keine Code-Änderung am Spiel); den Bildplatz zeichnet `mobile-diorama-parchment.css`. Nur Diorama; Classic bleibt ohne Bild.

## Zuordnung
| Datei | Tafel | Original-ID | Anzeigename |
|---|---|---|---|
| `U-R01-Dagadder.webp` | A01 | `Dagadder` | Knifecraft |
| `U-R02-Megamace.webp` | A02 | `Megamace` | Bonkcraft |
| `U-R03-Polierarm.webp` | A03 | `Polierarm` | Longhaft |
| `U-R04-Axeidic.webp` | A04 | `Axeidic` | Chopcraft |
| `U-R05-Greatersword.webp` | A05 | `Greatersword` | Broadblade |
| `U-R06-Harmbalest.webp` | A06 | `Harmbalest` | Boltworks |
| `U-R07-Supershield.webp` | A07 | `Supershield` | Blocksmith |
| `U-R08-Shieldblock.webp` | A08 | `Shieldblock` | Shieldblock |
| `U-R09-Bootboost.webp` | A09 | `Bootboost` | Bootstitch |
| `U-R10-Hellishmet.webp` | A10 | `Hellishmet` | Hardcap |
| `U-R11-Pantastic.webp` | A11 | `Pantastic` | Toughstitch |
| `U-R12-Smoldershoulder.webp` | A12 | `Smoldershoulder` | Broadbrace |
| `U-R13-Bestplate.webp` | A13 | `Bestplate` | Chestforge |
| `U-R14-GambesOP.webp` | A14 | `GambesOP` | Quiltwork |
| `U-R15-equipment-optimization.webp` | A15 | `equipment-optimization` | Equipment Optimization (mobile Karte) |
| `U-R16-research.webp` | A16 | `research` | Ersatzbild für unbekannte Forschungen |
| `U-R17-Speedminer.webp` | B01 | `Speedminer` | Speedminer |
| `U-R18-Speedlumber.webp` | B02 | `Speedlumber` | Speedlumber |
| `U-R19-Speedfarming.webp` | B03 | `Speedfarming` | Speedfarming |
| `U-R20-Speedscience.webp` | B04 | `Speedscience` | Speedscience |
| `U-R21-Speedexplorer.webp` | B05 | `Speedexplorer` | Speedexplorer |
| `U-R22-Megaminer.webp` | B06 | `Megaminer` | Megaminer |
| `U-R23-Megalumber.webp` | B07 | `Megalumber` | Megalumber |
| `U-R24-Megafarming.webp` | B08 | `Megafarming` | Megafarming |
| `U-R25-Megascience.webp` | B09 | `Megascience` | Megascience |
| `U-R26-Efficiency.webp` | B10 | `Efficiency` | Efficiency |
| `U-R27-Potency.webp` | B11 | `Potency` | Potency |
| `U-R28-Coordination.webp` | B12 | `Coordination` | Coordination |
| `U-R29-TrainTacular.webp` | B13 | `TrainTacular` | TrainTacular |
| `U-R30-Bounty.webp` | B14 | `Bounty` | Bounty |
| `U-R31-Egg.webp` | B15 | `Egg` | Egg |
| `U-R32-Gymystic.webp` | B16 | `Gymystic` | Gymystic |
| `U-R33-Miners.webp` | C01 | `Miners` | Miners |
| `U-R34-Scientists.webp` | C02 | `Scientists` | Scientists |
| `U-R35-Trainers.webp` | C03 | `Trainers` | Trainers |
| `U-R36-Explorers.webp` | C04 | `Explorers` | Explorers |
| `U-R37-Magmamancers.webp` | C05 | `Magmamancers` | Magmamancers |
| `U-R38-UberHut.webp` | C06 | `UberHut` | UberHut |
| `U-R39-UberHouse.webp` | C07 | `UberHouse` | UberHouse |
| `U-R40-UberMansion.webp` | C08 | `UberMansion` | UberMansion |
| `U-R41-UberHotel.webp` | C09 | `UberHotel` | UberHotel |
| `U-R42-UberResort.webp` | C10 | `UberResort` | UberResort |
| `U-R43-Gigastation.webp` | C11 | `Gigastation` | Gigastation |
| `U-R44-Blockmaster.webp` | C12 | `Blockmaster` | Blockmaster |
| `U-R45-Trapstorm.webp` | C13 | `Trapstorm` | Trapstorm |
| `U-R46-Battle.webp` | C14 | `Battle` | Battle |
| `U-R47-Bloodlust.webp` | C15 | `Bloodlust` | Bloodlust |
| `U-R48-Prismatic.webp` | C16 | `Prismatic` | Prismatic |
| `U-R49-Prismalicious.webp` | D01 | `Prismalicious` | Prismalicious |
| `U-R50-Anger.webp` | D02 | `Anger` | Anger |
| `U-R51-Rage.webp` | D03 | `Rage` | Rage |
| `U-R52-Formations.webp` | D04 | `Formations` | Formations |
| `U-R53-Dominance.webp` | D05 | `Dominance` | Dominance |
| `U-R54-Barrier.webp` | D06 | `Barrier` | Barrier |
| `U-R55-attackRelic.webp` | D07 | `attackRelic` | Attack Relic |
| `U-R56-enemyAttackRelic.webp` | D08 | `enemyAttackRelic` | Enemy Attack Relic |
| `U-R57-radonRelic.webp` | D09 | `radonRelic` | Radon Relic |
| `U-R58-scienceRelic.webp` | D10 | `scienceRelic` | Resource Relic |
| `U-R59-breedRelic.webp` | D11 | `breedRelic` | Breed Relic |

## Bekannte Grenzen
- In 48 px schwer unterscheidbar: Dolch U-R01 und Großschwert U-R05, Prismatic U-R48 und Prismalicious U-R49, Speedscience U-R20 und Megascience U-R25, die Relikte U-R55/56/58/59 (Reliefs). Feine Details wie Nadel und Faden (U-R09) oder Baupläne verschwinden in Zielgröße.
- Originale nur 1254 × 1254 px statt 2048 × 2048 (siehe `source/PROMPTS.md`); für den 52-px-Bildplatz reicht das.
