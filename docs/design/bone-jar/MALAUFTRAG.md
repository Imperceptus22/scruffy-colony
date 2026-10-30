# Malauftrag Knochenkrug (Bone Jar), 28.10.2026

**Stand 28.10.2026:** Bilder geliefert und eingebaut (A: `R10-bone-jar-0/1/2.webp`, C: `S13-bone-jar.webp`; Quellen, Prompts und Sidecars unter `artwork/diorama/source-package/assets/`, Herkunft in `assets/plates/PROVENANCE.json` und `docs/legal/asset-inventory.csv`). Gestalterische Abnahme und Szenenposition stimmt der Nutzer per Screenshot ab ([Nachweise](../../evidence/v201-bone-jar-art/README.md)); bis dahin `approved: false`.

Freigabe des Nutzers am 28.10.2026: Darstellung A + B + C + Hinweis. B (Füllring an der Knochen-Plakette) und der einmalige Hinweis sind ohne neue Grafik umgesetzt. A (Krug-Karte im Reiter „Get bones“) und C (Krug in der Kolonie-Szene) brauchen die gemalten Bilder aus diesem Auftrag. Bis dahin zeigt die Karte das vorhandene Knochenbündel (`R09-Bones.webp`), mit Füllbalken und Füllstufe als Attribut (`data-stage` 0/1/2).

Kopierbarer Auftrag für ChatGPT mit Rückmeldung an Claude: [CHATGPT-AUFTRAG.md](CHATGPT-AUFTRAG.md).

Stil und Ablauf wie bei `artwork/diorama/source-package` (Prompt und JSON je Bild, Referenzbilder dort).
- Ausgabe: transparente PNGs, die wie die übrigen Diorama-Bilder als WebP unter `app/src/main/assets/game/mobile-assets/diorama/` landen.
- Rechte: eigene Grafik, Herkunft in `assets/plates/PROVENANCE.json` bzw. `docs/legal/asset-inventory.csv` nachtragen.

## A – Krug in drei Füllstufen (`R10-bone-jar-0/1/2.webp`)

Prompt (je Stufe gleich, nur der Inhalt wechselt):

Use case: stylized-concept
Asset type: transparent single object, small mobile game shop icon for Scruffy Colony.
Input images: the diorama lighting/material reference and the resource atlas (R09-Bones) as style reference. Match their miniature handcrafted 3D diorama rendering, warm upper-left light, dark teal/brown shadowing, tactile clay, wood, rope and ivory bone.
Primary request: one rustic glazed clay jar with a wooden lid tied with rope, the same jar in three states.
- Stage 0: lid closed, a few pale bones at the bottom seen through a small chipped opening.
- Stage 1: lid slightly lifted, the jar about half full of small pale bones.
- Stage 2 (full): lid tipped open, bones heaped above the rim, a soft warm amber glow from inside; still calm, no sparkles or burst.
Composition: square canvas, the jar centered, about 70 % of the canvas, three-quarter view as in R09, generous transparent margin, identical position, size and angle in all three stages.
Text: none. Constraints: transparent background with real alpha; no labels, numbers, UI, frame or watermark; no coins, no money symbols, no gift box. The price and the word Buy stay with the card, so the picture need not hide that opening is a purchase.

## C – Krug in der Kolonie-Szene (`S13-bone-jar.webp`, Szenenobjekt)

Prompt: the stage-2 jar from A as a small scene prop on the ground, slightly smaller and with a soft contact shadow, the same light as the colony scenes (`H01-resources-workstations`). Transparent canvas, no ground plane beyond the contact shadow.

Platz (Vorschlag): Seite Resources, unten rechts in der Szene.
- Das Szenenbild wird nicht verändert; der Krug liegt als eigenes Bild darüber.
- Er ist sichtbar, wenn der Krug im Shop angeboten wird. Sein Bild wechselt mit der Stufe: Stufe 0 und 1 zeigen dafür A verkleinert.
- Ein Tipp öffnet den Bone Trader.
- Die genaue Position wird nach Eingang der Bilder per Screenshot abgestimmt.

## Abnahme
- Alle drei Stufen auf Pergament (Classic) und Holz (Diorama), bei 360/411 px und 130 % Schrift. Der volle Krug muss auch ohne Farbe als voll erkennbar sein (Knochen über dem Rand).
- Szene: Der Krug verdeckt keine Bedienelemente und keine Figur.
