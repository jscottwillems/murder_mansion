import sharp from 'sharp'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const atlasPath = fileURLToPath(new URL('../public/assets/characters/correspondent-atlas-v3.png', import.meta.url))
const cellSize = 320
const walkBRow = 3
const rightColumn = 1
const leftColumn = 3

const source = execFileSync('git', [
  'show',
  'HEAD:public/assets/characters/correspondent-atlas-v3.png',
], { maxBuffer: 8 * 1024 * 1024 })
const decoded = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const pixels = Buffer.from(decoded.data)
const channels = decoded.info.channels
const width = decoded.info.width

for (let y = 0; y < cellSize; y += 1) {
  for (let x = 0; x < cellSize; x += 1) {
    const sourcePixel = (
      (walkBRow * cellSize + y) * width
      + leftColumn * cellSize
      + (cellSize - 1 - x)
    ) * channels
    const targetPixel = (
      (walkBRow * cellSize + y) * width
      + rightColumn * cellSize
      + x
    ) * channels
    decoded.data.copy(pixels, targetPixel, sourcePixel, sourcePixel + channels)
  }
}

await sharp(pixels, {
  raw: {
    width: decoded.info.width,
    height: decoded.info.height,
    channels,
  },
})
  .png()
  .toFile(fileURLToPath(new URL('../public/assets/characters/correspondent-atlas-v3.repaired.png', import.meta.url)))
