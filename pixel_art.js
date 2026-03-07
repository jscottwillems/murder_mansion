(function () {
  function createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hexToRgb(hex) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!match) return null;
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16),
    };
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("")}`;
  }

  function mix(hexA, hexB, amount) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    if (!a || !b) return hexA;
    return rgbToHex(
      a.r + (b.r - a.r) * amount,
      a.g + (b.g - a.g) * amount,
      a.b + (b.b - a.b) * amount,
    );
  }

  function shade(hex, amount) {
    return amount >= 0 ? mix(hex, "#ffffff", amount) : mix(hex, "#000000", -amount);
  }

  function rgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(255,255,255,${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  function panel(ctx, x, y, w, h, palette) {
    const fill = palette.fill || "#10151f";
    const light = palette.light || shade(fill, 0.22);
    const dark = palette.dark || shade(fill, -0.22);
    const outline = palette.outline || shade(fill, 0.35);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = light;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = dark;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
    ctx.strokeStyle = outline;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function checker(ctx, x, y, w, h, size, colors, seed) {
    const step = Math.max(1, size);
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        const idx = (Math.floor((px + seed) / step) + Math.floor((py + seed) / step)) & 1;
        ctx.fillStyle = colors[idx];
        ctx.fillRect(x + px, y + py, step, step);
      }
    }
  }

  function stripes(ctx, x, y, w, h, gap, colors, vertical) {
    const step = Math.max(1, gap);
    for (let offset = 0; offset < (vertical ? w : h); offset += step) {
      ctx.fillStyle = colors[Math.floor(offset / step) % colors.length];
      if (vertical) {
        ctx.fillRect(x + offset, y, Math.min(step, w - offset), h);
      } else {
        ctx.fillRect(x, y + offset, w, Math.min(step, h - offset));
      }
    }
  }

  function dither(ctx, x, y, w, h, colors, spacing, seed) {
    const step = Math.max(1, spacing);
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colors[1];
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        if (((px / step) + (py / step) + seed) % 2 === 0) {
          ctx.fillRect(x + px, y + py, 1, 1);
        }
      }
    }
  }

  function sprinkle(ctx, x, y, w, h, color, density, seed) {
    const chance = clamp(density, 0, 1);
    let index = seed | 0;
    ctx.fillStyle = color;
    for (let py = 0; py < h; py += 2) {
      for (let px = 0; px < w; px += 2) {
        index = (index * 1664525 + 1013904223) >>> 0;
        if ((index & 1023) / 1023 < chance) {
          ctx.fillRect(x + px, y + py, 1, 1);
        }
      }
    }
  }

  function shadow(ctx, cx, cy, rx, ry, color) {
    ctx.fillStyle = color || "rgba(0,0,0,0.28)";
    for (let y = -ry; y <= ry; y++) {
      const span = Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)));
      const width = Math.max(1, Math.round(span * rx));
      ctx.fillRect(cx - width, cy + y, width * 2, 1);
    }
  }

  function sprite(ctx, rows, palette, x, y, scale, options) {
    const step = Math.max(1, scale || 1);
    const flipX = !!(options && options.flipX);
    for (let row = 0; row < rows.length; row++) {
      const line = rows[row];
      for (let col = 0; col < line.length; col++) {
        const code = line[col];
        if (code === "." || code === " ") continue;
        const color = palette[code];
        if (!color) continue;
        const drawX = flipX ? (line.length - col - 1) : col;
        ctx.fillStyle = color;
        ctx.fillRect(x + drawX * step, y + row * step, step, step);
      }
    }
  }

  window.PixelArt = {
    createCanvas,
    hexToRgb,
    rgbToHex,
    mix,
    shade,
    rgba,
    panel,
    checker,
    stripes,
    dither,
    sprinkle,
    shadow,
    sprite,
  };
})();
