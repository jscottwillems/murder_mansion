#!/usr/bin/env python3
"""Split paired Gallery artwork sheets into tightly cropped transparent sprites."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "imagegen-gallery-art"
OUTPUT = ROOT / "public" / "assets" / "decor" / "sprites" / "gallery"
PAIRS = {
    "north": ("art-north-manor.png", "art-north-coast.png"),
    "west": ("art-west-botanical.png", "art-west-hunt.png"),
    "east": ("art-east-portrait.png", "art-east-library.png"),
}


def crop_cell(cell: Image.Image, padding: int = 12) -> Image.Image:
    alpha = cell.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("Artwork cell has no opaque pixels")
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(cell.width, right + padding)
    bottom = min(cell.height, bottom + padding)
    return cell.crop((left, top, right, bottom))


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for wall, names in PAIRS.items():
        sheet = Image.open(SOURCE / f"{wall}-pair-alpha.png").convert("RGBA")
        midpoint = sheet.width // 2
        cells = (sheet.crop((0, 0, midpoint, sheet.height)), sheet.crop((midpoint, 0, sheet.width, sheet.height)))
        for cell, name in zip(cells, names, strict=True):
            sprite = crop_cell(cell)
            sprite.save(OUTPUT / name, optimize=True)
            print(f"{name}: {sprite.width}x{sprite.height}")


if __name__ == "__main__":
    main()
