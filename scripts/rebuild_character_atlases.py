"""Build consistently registered v2 character atlases from authored sheets."""

from pathlib import Path
from statistics import median
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/characters"
CELL = 320
BASELINE = 294
STANDING_HEIGHT = 270


def alpha_bbox(cell):
    return cell.getchannel("A").getbbox()


def paste_registered(out, pose, column, row, scale, target_height=None):
    bbox = alpha_bbox(pose)
    if not bbox:
        return
    if target_height is not None:
        scale = target_height / (bbox[3] - bbox[1])
    resized = pose.resize(
        (max(1, round(pose.width * scale)), max(1, round(pose.height * scale))),
        Image.Resampling.LANCZOS,
    )
    resized_bbox = alpha_bbox(resized)
    if not resized_bbox:
        return
    x = column * CELL + round((CELL - resized.width) / 2)
    y = row * CELL + BASELINE - resized_bbox[3]
    out.alpha_composite(resized, (x, y))


def rebuild(path):
    image = Image.open(path).convert("RGBA")
    rows = 4 if path.stem == "detective-atlas" else 5
    source_cell_w = image.width // 4
    source_cell_h = image.height // rows
    poses = [[image.crop((col * source_cell_w, row * source_cell_h,
                          (col + 1) * source_cell_w, (row + 1) * source_cell_h))
              for col in range(4)] for row in range(rows)]
    if path.stem == "detective-atlas":
        # The first two action cells are unused by the snapped directional
        # renderer. Re-author them as registered passing poses: feet together,
        # one facing each side, for a readable A/pass/B/pass walk cycle.
        poses[3][0] = poses[0][1].copy()
        poses[3][1] = poses[0][1].transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    idle_heights = [bbox[3] - bbox[1] for pose in poses[0]
                    if (bbox := alpha_bbox(pose))]
    movement_scale = STANDING_HEIGHT / median(idle_heights)
    out = Image.new("RGBA", (CELL * 4, CELL * rows), (0, 0, 0, 0))

    for row in range(rows):
        for col in range(4):
            target_height = None
            scale = movement_scale
            if path.stem == "detective-atlas" and row == 3:
                # Passing/notebook poses use standing scale; the crouch is
                # intentionally shorter and is never enlarged to fill a cell.
                target_height = round(STANDING_HEIGHT * 0.72) if col == 2 else STANDING_HEIGHT
            elif row >= 3:
                # Death, outline, and portrait cells retain authored framing.
                scale = CELL / source_cell_w
            paste_registered(out, poses[row][col], col, row, scale, target_height)

    destination = path.with_name(f"{path.stem}-v2.png")
    out.save(destination, optimize=True)
    print(destination.relative_to(ROOT))


for atlas in sorted(SOURCE.glob("*-atlas.png")):
    if not atlas.stem.endswith("-v2"):
        rebuild(atlas)
