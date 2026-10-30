# Synthetic development scenarios

Created with `tools/build-development-saves.cjs` from the controlled `tests/fixtures/map-5.10.1.txt` and bundled original builders/serialization. No personal saves. These are original-format UI fixtures, not records of earned progress or fully balanced endgame playthroughs.

- portal: U1 Z60, Portal/Perks and sample Helium.
- void: U1 Z145, original-generated Voidmap and Heirlooms.
- masteries: U1 Z300, Masteries and original-initialized player Spire/Core.
- universe2: U2 Z201, Radon, Mutator tree and sample seeds.

Each output was strictly validated and reloaded by the original engine. `MobileDevelopment.prepare()` refreshes only clock fields before the controller validates/loads into the isolated development slot. Normal save formats and mechanics are unchanged. No Development menu or scenario page is exposed in the app. The retained test-only helpers can seed the isolated slot in debug/preview proofs; native development writes remain disabled in release builds. An already active old test session keeps an explicit return to the normal save.
