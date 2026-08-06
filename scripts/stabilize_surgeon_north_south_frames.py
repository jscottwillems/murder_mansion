"""Stabilize the surgeon's front/back locomotion silhouettes.

The generated atlas already shares a common height and foot baseline, but its
front/back cells vary enough in width to read as a scale pulse while walking
north or south. Normalize only those eight cells around their existing center;
side views, actions, portraits, height, and baseline remain untouched.
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ATLAS_PATH = ROOT / "public/assets/characters/surgeon-atlas-v3.png"
CELL = 320
TARGET_WIDTHS = {
    0: 140,  # front
    2: 130,  # back
}


def stabilize_cell(source: Image.Image, row: int, column: int, target_width: int) -> None:
    box = (column * CELL, row * CELL, (column + 1) * CELL, (row + 1) * CELL)
    cell = source.crop(box)
    bounds = cell.getchannel("A").getbbox()
    if not bounds:
        raise RuntimeError(f"empty surgeon atlas cell ({column}, {row})")

    left, top, right, bottom = bounds
    cutout = cell.crop(bounds)
    resized = cutout.resize((target_width, bottom - top), Image.Resampling.LANCZOS)
    source.paste((0, 0, 0, 0), box)
    x = column * CELL + round((CELL - target_width) / 2)
    y = row * CELL + top
    source.alpha_composite(resized, (x, y))


atlas = Image.open(ATLAS_PATH).convert("RGBA")
if atlas.size != (1280, 1920):
    raise RuntimeError(f"unexpected atlas size {atlas.size}")

for locomotion_row in range(4):
    for direction_column, width in TARGET_WIDTHS.items():
        stabilize_cell(atlas, locomotion_row, direction_column, width)

atlas.save(ATLAS_PATH, optimize=True)
print(ATLAS_PATH.relative_to(ROOT))
