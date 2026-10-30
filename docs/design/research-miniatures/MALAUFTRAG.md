# Forschungsminiaturen malen (V-172) – Auftrag für das Bildwerkzeug

Stand 25.10.2026. Nutzerentscheidung zu V-172: Variante C, jede Forschung bekommt eine eigene gemalte Miniatur. Die Forschungsliste wird als Einzelkarten gezeigt (V-180), der Bildplatz bleibt auch bei 360 px / 130 % Schrift erhalten.

Zusatzvorgabe des Nutzers: Auf jedem Bild muss sofort erkennbar sein, dass es sich um ein **Upgrade** handelt, besonders bei Waffen und Rüstungen. Ein Bild darf nie wie das bloße Ausrüstungs-, Gebäude- oder Jobbild aussehen.

## Ablauf
1. Diesen Auftrag in einer Sitzung mit Bildwerkzeug ausführen, zum Beispiel in Codex mit dem integrierten Bildwerkzeug, wie bei den Feldkacheln (`docs/design/diorama-field-tiles/NEU-MALEN-AUFTRAG.md`).
2. Stilvorlagen (höchstens fünf je Aufruf), mit vollem Pfad unter `app/src/main/assets/game/mobile-assets/diorama/`:
   - Tafel A: `E02-Battleaxe.webp`, `E07-Greatsword.webp`, `E12-Shield.webp`, `E04-Breastplate.webp`, `N06-research.webp`
   - Tafel B: `R01-Food.webp`, `R03-Metal.webp`, `R04-Science.webp`, `J03-Miner.webp`, `N06-research.webp`
   - Tafel C: `B10-Hut.webp`, `B20-Warpstation.webp`, `B18-Trap.webp`, `J04-Scientist.webp`, `N06-research.webp`
   - Tafel D: `N01-combat.webp`, `R06-Gems.webp`, `R08-Radon.webp`, `E12-Shield.webp`, `N06-research.webp`
3. Vier Tafeln erzeugen und unverändert ablegen unter `docs/design/research-miniatures/source/tafel-a.png` bis `tafel-d.png`. Prompt, Datum, Werkzeug, Versuche und Auswahlgrund in `source/PROMPTS.md` festhalten (Form wie bei den Feldkacheln).
4. Zuschnitt, Freistellung, WebP, Einbau (neue Reihe `U-R01…`), Herkunfts- und Rechteeintrag, Vergleichsbilder und Emulatorbelege übernimmt danach eine Claude-Sitzung. Jedes Motiv wird dem Nutzer vor dem Einbau gezeigt (Wartepunkt).

## Gemeinsame Vorgaben (für alle Tafeln)
> ONE square image, 2048×2048 px, containing a 4×4 grid of 16 separate square game icons on a flat plain dark brown background (#2b1a0e), at least 32 px of empty background between icons and around the edge. Match the attached references exactly in style: hand-painted cozy fantasy diorama, slightly top-down 3/4 view, warm light from the upper left, warm saturated colours, wood, parchment and bronze materials, crisp fine detail, soft contact shadows. Every icon must read clearly at 48×48 px: one strong central silhouette, no tiny clutter. No outlines, no text, no letters, no numbers, no UI frames, no large glow.
>
> EVERY icon is an UPGRADE / RESEARCH icon and must look like one, never like a plain item: the subject rests on (or rises out of) an open leather-bound book or a half-unrolled parchment scroll, and every icon carries the same upgrade sign: a bright golden upward-pointing chevron arrow in the lower right corner of the icon (same size and position on all 16 icons, about 22 % of the icon width, with a thin dark bronze rim so it stays visible on any colour). Small golden sparkles around the subject are allowed. The subject must look improved compared to the plain reference: gilded edges, golden rivets, polished shine.

## Tafel A – Ausrüstung (Waffen und Rüstungen besonders deutlich)
Für Waffen und Rüstungen gilt zusätzlich: Der Gegenstand liegt quer über einem aufgeschlagenen Buch, ist sichtbar veredelt (goldene Kanten, neue Nieten, frischer Glanz) und das goldene Pfeilzeichen ist besonders kräftig. Er muss sich auf einen Blick vom normalen Ausrüstungsbild E01–E13 unterscheiden.
> Row 1: (1) a short dagger with gilded blade edge (Knifecraft / Dagadder); (2) a heavy mace with golden spikes (Bonkcraft / Megamace); (3) a long polearm with a gilded spearhead (Longhaft / Polierarm); (4) a battleaxe with a gold-trimmed blade (Chopcraft / Axeidic).
> Row 2: (5) a greatsword with a golden crossguard (Broadblade / Greatersword); (6) a loaded wooden arbalest with brass fittings (Boltworks / Harmbalest); (7) a round wooden shield with golden boss and rim (Blocksmith / Supershield); (8) a round shield with a second reinforcing plate being riveted on (Shieldblock).
> Row 3: (9) leather boots with golden stitching and a needle with thread (Bootstitch / Bootboost); (10) a helmet with a golden crest (Hardcap / Hellishmet); (11) leather pants with golden stitched patches (Toughstitch / Pantastic); (12) shoulder guards with golden edge plates (Broadbrace / Smoldershoulder).
> Row 4: (13) a breastplate with golden trim, a small hammer beside it (Chestforge / Bestplate); (14) a quilted gambeson with golden quilting lines (Quiltwork / GambesOP); (15) a small rack holding a sword, a shield and a helmet with a golden gear above them (Equipment Optimization); (16) a closed purple research book with a golden flask emblem (neutral research fallback).

## Tafel B – Ressourcen, Tempo und Bevölkerung
> Row 1: (1) a pickaxe on ore with golden speed lines (Speedminer); (2) a lumber axe in a log with golden speed lines (Speedlumber); (3) a hoe with a wheat sheaf and golden speed lines (Speedfarming); (4) a science flask with golden speed lines (Speedscience).
> Row 2: (5) a compass and map with golden speed lines (Speedexplorer); (6) a large golden pickaxe on a big ore pile with a golden star (Megaminer); (7) a large axe on a stack of logs with a golden star (Megalumber); (8) a large basket of crops with a golden star (Megafarming).
> Row 3: (9) a large bubbling flask with a golden star (Megascience); (10) a brass gear turning smoothly with oil drops (Efficiency); (11) a small wooden cradle with a warm blanket (Potency); (12) several small furry hands joined together in a circle (Coordination).
> Row 4: (13) a training dummy with a whistle on a rope (TrainTacular); (14) a small sack of gold coins with a reward ribbon (Bounty); (15) a large speckled dragon egg in a nest (Egg); (16) a dumbbell made of wood and bronze with a mystic violet rune glow (Gymystic).

## Tafel C – Jobs, Gebäude und Kampf
> Row 1: (1) a miner's helmet with a lamp on a pickaxe (Miners); (2) a scientist's magnifier on an open notebook (Scientists); (3) a trainer's whistle with a tally board (Trainers); (4) an explorer's spyglass on a rolled map (Explorers).
> Row 2: (5) a glowing magma crystal held in tongs (Magmamancers); (6) a little hut on a blueprint (UberHut); (7) a little house on a blueprint (UberHouse); (8) a little mansion on a blueprint (UberMansion).
> Row 3: (9) a little hotel on a blueprint (UberHotel); (10) a little resort with a palm on a blueprint (UberResort); (11) a little warp station tower on a blueprint (Gigastation); (12) a stack of wooden blocks forming a wall (Blockmaster).
> Row 4: (13) a wooden trap with several springs, storm wind lines (Trapstorm); (14) two crossed short swords (Battle); (15) a red fang with a drop (Bloodlust); (16) a shield shimmering with prismatic rainbow colours (Prismatic).

## Tafel D – Formationen, Wut und Relikte
> Row 1: (1) a prismatic gem shield with a stronger rainbow sheen (Prismalicious); (2) a smouldering red gem (Anger); (3) a cracked fiery red gem with flames (Rage); (4) small wooden figures arranged in a formation on a map (Formations).
> Row 2: (5) a raised banner with a sword on a map (Dominance); (6) a tall wooden barrier wall with a shield on it (Barrier); (7) an ancient stone relic with a sword carving (Attack Relic); (8) an ancient stone relic with a cracked claw carving (Enemy Attack Relic).
> Row 3: (9) an ancient stone relic with a green radon glow (Radon Relic); (10) an ancient stone relic with a flask carving (Resource Relic); (11) an ancient stone relic with a tiny cradle carving (Breed Relic); (12) empty background.
> Row 4: (13)–(16) empty background.

## Abnahme durch die Bildsitzung (Selbstprüfung je Versuch)
- 16 getrennte Motive in der richtigen Reihenfolge, nichts ragt über die Zelle hinaus.
- Goldenes Pfeilzeichen auf jedem Motiv, gleiche Größe und Lage.
- Tafel A: Jeder Gegenstand liegt auf einem Buch und wirkt sichtbar veredelt; nebeneinander mit E01–E13 klar als Upgrade zu unterscheiden.
- Höchstens drei Neuerzeugungen je Tafel; Auswahlgrund festhalten.

## Rechte
Projektbezogene KI-Ausgabe nach eigener Vorgabe wie die übrigen Diorama-Grafiken. Eintrag in `docs/THIRD_PARTY_NOTICES.md` und `docs/legal/asset-inventory.csv` mit Werkzeug, Datum, Prompt, Original und SHA-256. Für eigene schutzfähige Beiträge gilt GPL-3.0-or-later; ausschließliche Rechte an KI-Motiven werden nicht zugesichert.
