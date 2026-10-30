# Scruffy Colony – source code

This repository holds the complete corresponding source of the Android game **Scruffy Colony**, version 1.00 (versionCode 88). Each published version is one commit with a matching tag, for example `v1.00`. Pick the tag that matches the version of your installed app, as shown on its Google Play page or in Android's app info.

Scruffy Colony is an independent Android adaptation of [Trimps](https://trimps.github.io/) by Zach Hood / Greensatellite ([original source](https://github.com/Trimps/Trimps.github.io)). It is not an official release by the original developer. Website and support: [scruffycolony.de](https://scruffycolony.de).

## Licences

- The program is licensed under the GNU General Public License, version 3 or later (`COPYING`). The unchanged original licence text and all bundled licences are in `app/src/main/assets/game/license.txt` and `app/src/main/assets/game/licenses/`.
- Third-party components, artwork origins and their licences: `docs/THIRD_PARTY_NOTICES.md`, `docs/legal/asset-inventory.csv` and `docs/legal/runtime-dependencies.csv`.
- Library sources: `third-party-sources/` holds the unmodified source archives of the bundled libraries; `docs/legal/dependency-sources.json` lists their origin and SHA-256. Unminified Decimal.js 7.2.4 is in `docs/sources/`.

## Contents

- `app/`: Android wrapper (Kotlin), the bundled original game and the adapters in `app/src/main/assets/game/`.
- `artwork/`, `docs/design/` and `docs/design-concepts/`: the originals of the shipped project images, with prompts, crops and hashes. Images taken unchanged from the original game are in `app/` itself.
- `tools/`: generators for shipped data and images, plus the asset and version checks.
- `tests/fixtures/`: fixtures for the instrumented Android tests.

Internal planning documents of the developer are not part of this repository; some provenance notes may refer to them.

## Build

Use JDK 21 and Android SDK platform 36 / Build Tools 35.0.0. Set `JAVA_HOME` and `ANDROID_HOME`, then run on Linux or macOS:

```text
bash ./gradlew :app:assembleDebug :app:testDebugUnitTest
npm ci --ignore-scripts --no-audit --no-fund
node tools/check-assets.mjs
node tools/check-version.mjs
```

On Windows use `gradlew.bat`. The first build downloads Gradle and the dependencies; playing needs no internet connection.

- `assembleDebug` uses your local Android debug key. `assemblePreview` uses the test-only preview key in `app/signing/`, which is public on purpose; never use it for production.
- For a release build supply your own key with `TRIMPS_RELEASE_KEYSTORE` and `TRIMPS_RELEASE_PASSWORD` (alias `trimps-release`). Production keys are not included. A build signed with your key cannot update the version installed from Google Play.
- Google Play purchases only work in the version distributed through Google Play.
- Generated data and images are already included. To regenerate them, run the matching script in `tools/` or `docs/design/`. Image tools need `npm ci` for sharp; `build-development-saves.cjs` and `build-map-specials.cjs` also need Playwright with Chromium (`npm install playwright`).
