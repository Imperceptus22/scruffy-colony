from pathlib import Path

from PIL import Image

# Reading order in each print master is left to right, first the top row, then the bottom.
ROWS = [
    "portal bionic turkimp housing bounty explorers",
    "voidPower pierce heirloom herbalist headstart scry",
    "voidPower2 mapLoot skeletimp mapHealth headstart2 daily",
    "hyperspeed blacksmith turkimp2 magimp headstart3 mapBattery",
    "hyperspeed2 blacksmith2 skeletimp2 quickGen magmaFlow explorers2",
    "voidPower3 blacksmith3 heirloom2 liquification maz scry2",
    "magmamancer mapLoot2 nature kerfluffle stillRowing patience",
    "voidSpecial healthStrength nature2 liquification2 stillRowing2 amalg",
    "voidSpecial2 bionic2 fluffyExp fluffyAbility overkill crit",
    "voidMastery healthStrength2 mesmer liquification3 stillMagmamancer angelic",
]
SOURCE = Path(__file__).resolve().parent
DESTINATION = SOURCE.parents[1] / "app/src/main/assets/game/mobile-assets/mastery-fieldguide"


def export():
    assert len({key for row in ROWS for key in row.split()}) == 60
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for tier, row in enumerate(ROWS, 1):
        with Image.open(SOURCE / f"tier-{tier:02}.png") as sheet:
            width, height = sheet.size
            for index, key in enumerate(row.split()):
                y, x = divmod(index, 3)
                bounds = (round(x * width / 3), round(y * height / 2),
                          round((x + 1) * width / 3), round((y + 1) * height / 2))
                tile = sheet.crop(bounds).resize((480, 480), Image.Resampling.LANCZOS)
                tile.save(DESTINATION / f"{key}.webp", quality=85, method=6)


if __name__ == "__main__":
    export()
