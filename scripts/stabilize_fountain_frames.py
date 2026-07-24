from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/decor/sprites/conservatory/animated-fountain.png"
OUTPUT = ROOT / "public/assets/decor/sprites/conservatory/animated-fountain.png"
FRAME_COUNT = 4


def water_mask(frame: Image.Image) -> Image.Image:
    rgba = frame.convert("RGBA")
    mask = Image.new("L", rgba.size)
    source = rgba.load()
    target = mask.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = source[x, y]
            # The fountain water is deliberately cyan. Requiring both green
            # and blue to exceed red keeps limestone and brass out of the mask.
            is_water = (
                alpha > 8
                and green > red * 1.06
                and blue > red * 1.08
                and green + blue > 185
            )
            target[x, y] = alpha if is_water else 0
    # Fill the bright interiors of cyan-edged bubbles and retain antialiasing.
    return mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(0.55))


def main() -> None:
    sheet = Image.open(SOURCE).convert("RGBA")
    if sheet.width % FRAME_COUNT:
        raise ValueError(f"Sprite-sheet width {sheet.width} is not divisible by {FRAME_COUNT}")

    frame_width = sheet.width // FRAME_COUNT
    frames = [
        sheet.crop((index * frame_width, 0, (index + 1) * frame_width, sheet.height))
        for index in range(FRAME_COUNT)
    ]
    structural_base = frames[0]
    stabilized = [structural_base]
    for water_source in frames[1:]:
        composed = structural_base.copy()
        composed.paste(water_source, (0, 0), water_mask(water_source))
        stabilized.append(composed)

    result = Image.new("RGBA", sheet.size)
    for index, frame in enumerate(stabilized):
        result.paste(frame, (index * frame_width, 0))
    result.save(OUTPUT)


if __name__ == "__main__":
    main()
