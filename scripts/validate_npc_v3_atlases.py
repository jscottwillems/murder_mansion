"""Fail when a generated NPC v3 atlas violates the shared animation grid."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ATLAS_DIR = ROOT / "public/assets/characters"
ARCHETYPES = (
    "columnist", "surgeon", "curator", "magician", "correspondent",
    "accountant", "antiquarian", "chauffeur", "debutante", "vocalist",
)
EXPECTED_SIZE = (1280, 1920)
CELL = 320
EXPECTED_BASELINE = 294


def validate(name):
    path = ATLAS_DIR / f"{name}-atlas-v3.png"
    if not path.exists():
        raise AssertionError(f"missing {path.name}")
    image = Image.open(path).convert("RGBA")
    if image.size != EXPECTED_SIZE:
        raise AssertionError(f"{path.name}: {image.size}, expected {EXPECTED_SIZE}")
    if image.getchannel("A").getextrema() != (0, 255):
        raise AssertionError(f"{path.name}: expected transparent and opaque pixels")

    for row in range(4):
        for col in range(4):
            cell = image.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))
            bbox = cell.getchannel("A").getbbox()
            if not bbox:
                raise AssertionError(f"{path.name}: empty locomotion cell ({col}, {row})")
            height = bbox[3] - bbox[1]
            if not 250 <= height <= 285:
                raise AssertionError(f"{path.name}: cell ({col}, {row}) height {height}")
            if abs(bbox[3] - EXPECTED_BASELINE) > 7:
                raise AssertionError(f"{path.name}: cell ({col}, {row}) baseline {bbox[3]}")
    print(f"ok {path.name}")


for archetype in ARCHETYPES:
    validate(archetype)
