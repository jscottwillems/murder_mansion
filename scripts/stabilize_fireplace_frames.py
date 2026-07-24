from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp/imagegen-fireplace/grand-fireplace-alpha-original.png"
OUTPUT = ROOT / "public/assets/decor/sprites/study/grand-fireplace-animated.png"
FRAME_COUNT = 4


def fire_mask(frame: Image.Image) -> Image.Image:
    rgba = frame.convert("RGBA")
    mask = Image.new("L", rgba.size)
    source = rgba.load()
    target = mask.load()
    # Restrict variation to the firebox itself. Warm mantel wood, brass screen,
    # masonry, and hearth pixels remain locked to frame one.
    min_x = int(rgba.width * 0.27)
    max_x = int(rgba.width * 0.73)
    min_y = int(rgba.height * 0.40)
    max_y = int(rgba.height * 0.76)
    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            red, green, blue, alpha = source[x, y]
            is_fire = (
                alpha > 8
                and red > 115
                and red > green * 1.12
                and green > blue * 1.35
            )
            target[x, y] = alpha if is_fire else 0
    return mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.4))


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
    for fire_source in frames[1:]:
        composed = structural_base.copy()
        composed.paste(fire_source, (0, 0), fire_mask(fire_source))
        stabilized.append(composed)

    result = Image.new("RGBA", sheet.size)
    for index, frame in enumerate(stabilized):
        result.paste(frame, (index * frame_width, 0))
    result.save(OUTPUT)


if __name__ == "__main__":
    main()
