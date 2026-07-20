"""Normalize generated v3 locomotion cells to the detective's scale/baseline."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ATLAS_DIR = ROOT / "public/assets/characters"
CELL = 320
TARGET_HEIGHT = 270
BASELINE = 294


for path in sorted(ATLAS_DIR.glob("*-atlas-v3.png")):
    source = Image.open(path).convert("RGBA")
    if source.size != (1280, 1920):
        source = source.resize((1280, 1920), Image.Resampling.LANCZOS)
    output = source.copy()
    for row in range(4):
        for col in range(4):
            box = (col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL)
            pose = source.crop(box)
            bbox = pose.getchannel("A").getbbox()
            if not bbox:
                raise RuntimeError(f"{path.name}: empty cell ({col}, {row})")
            scale = TARGET_HEIGHT / (bbox[3] - bbox[1])
            resized = pose.resize((round(CELL * scale), round(CELL * scale)), Image.Resampling.LANCZOS)
            resized_bbox = resized.getchannel("A").getbbox()
            if not resized_bbox:
                raise RuntimeError(f"{path.name}: lost cell ({col}, {row})")
            output.paste((0, 0, 0, 0), box)
            x = col * CELL + round((CELL - resized.width) / 2)
            y = row * CELL + BASELINE - resized_bbox[3]
            output.alpha_composite(resized, (x, y))
    output.save(path, optimize=True)
    print(path.relative_to(ROOT))
