import * as THREE from 'three'
import type { RoomId } from './types'

const TEXTURE_WIDTH = 128
const TEXTURE_HEIGHT = 64
const textureCache = new Map<RoomId, THREE.CanvasTexture>()

type WallPainter = (ctx: CanvasRenderingContext2D) => void

function fill(ctx: CanvasRenderingContext2D, color: string, x = 0, y = 0, w = TEXTURE_WIDTH, h = TEXTURE_HEIGHT) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function line(ctx: CanvasRenderingContext2D, color: string, width: number, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function flecks(ctx: CanvasRenderingContext2D, colors: readonly string[], count: number, seed: number) {
  // A tiny integer generator keeps every wall identical between runs.
  let state = seed >>> 0
  for (let i = 0; i < count; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const x = state % TEXTURE_WIDTH
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const y = state % TEXTURE_HEIGHT
    fill(ctx, colors[i % colors.length], x, y, i % 5 === 0 ? 2 : 1, 1)
  }
}

const paintStudy: WallPainter = (ctx) => {
  fill(ctx, '#76624c')
  flecks(ctx, ['#846f58', '#66523f'], 90, 11)
  fill(ctx, '#30231d', 0, 35, 128, 29)
  for (let x = 0; x < 128; x += 16) {
    fill(ctx, '#5b3d29', x + 2, 38, 12, 22)
    line(ctx, '#8c6440', 1, x + 3, 39, x + 13, 39)
    line(ctx, '#241813', 2, x, 35, x, 64)
  }
  fill(ctx, '#ad8653', 0, 33, 128, 3)
  fill(ctx, '#493321', 0, 61, 128, 3)
}

const paintGallery: WallPainter = (ctx) => {
  fill(ctx, '#79808b')
  flecks(ctx, ['#8b929c', '#656d78'], 75, 22)
  for (const y of [13, 48]) {
    fill(ctx, '#4d463b', 0, y, 128, 1)
    fill(ctx, '#b79a55', 0, y + 1, 128, 2)
    fill(ctx, '#6f5935', 0, y + 3, 128, 1)
  }
  for (let x = 8; x < 128; x += 32) {
    line(ctx, '#b79a55', 2, x, 15, x, 47)
  }
}

const paintConservatory: WallPainter = (ctx) => {
  fill(ctx, '#29483e')
  for (let x = 0; x < 128; x += 16) {
    fill(ctx, x % 32 === 0 ? '#51776d' : '#456b61', x + 2, 2, 12, 45)
    line(ctx, '#91aea0', 1, x + 4, 3, x + 4, 45)
    for (let y = 6 + (x % 5); y < 44; y += 11) fill(ctx, '#b0c4b3', x + 9, y, 1, 5)
  }
  for (let y = 0; y < 48; y += 16) fill(ctx, '#1c332d', 0, y, 128, 2)
  fill(ctx, '#596153', 0, 48, 128, 16)
  flecks(ctx, ['#707667', '#414b42'], 48, 33)
}

const paintKitchen: WallPainter = (ctx) => {
  fill(ctx, '#a7a39a')
  for (let y = 0; y < 64; y += 12) {
    fill(ctx, '#56585a', 0, y, 128, 2)
    const offset = (y / 12) % 2 ? 10 : 0
    for (let x = offset; x < 128; x += 20) fill(ctx, '#66676a', x, y, 2, 12)
  }
  flecks(ctx, ['#bbb6aa', '#898980'], 45, 44)
  fill(ctx, '#424345', 0, 60, 128, 4)
}

const paintDining: WallPainter = (ctx) => {
  fill(ctx, '#5b2932')
  for (let x = 0; x < 128; x += 24) {
    fill(ctx, '#713842', x + 2, 6, 20, 50)
    line(ctx, '#a4655d', 1, x + 5, 10, x + 19, 10)
    line(ctx, '#3b1c25', 2, x + 2, 55, x + 22, 55)
    line(ctx, '#351a21', 2, x, 0, x, 64)
  }
  fill(ctx, '#b28b5b', 0, 31, 128, 3)
  fill(ctx, '#422029', 0, 61, 128, 3)
}

const paintBallroom: WallPainter = (ctx) => {
  fill(ctx, '#8b7898')
  flecks(ctx, ['#9e8aab', '#746581'], 55, 55)
  for (let x = 2; x < 128; x += 32) {
    ctx.strokeStyle = '#c3a66e'
    ctx.lineWidth = 2
    ctx.strokeRect(x, 8, 28, 46)
    ctx.strokeStyle = '#66536f'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 4, 12, 20, 38)
    fill(ctx, '#d0b77f', x + 13, 6, 4, 4)
  }
  fill(ctx, '#4f4058', 0, 59, 128, 5)
}

const paintCellar: WallPainter = (ctx) => {
  fill(ctx, '#4b4943')
  for (let y = 0; y < 64; y += 10) {
    fill(ctx, '#292a28', 0, y, 128, 2)
    const offset = (y / 10) % 2 ? 9 : 0
    for (let x = offset; x < 128; x += 18) {
      fill(ctx, '#292a28', x, y, 2, 10)
      fill(ctx, (x + y) % 4 ? '#555249' : '#625c4d', x + 2, y + 2, 15, 7)
    }
  }
  flecks(ctx, ['#777062', '#343531', '#6a5d48'], 95, 66)
  fill(ctx, '#252624', 0, 61, 128, 3)
}

const paintLibrary: WallPainter = (ctx) => {
  fill(ctx, '#33251d')
  for (let x = 0; x < 128; x += 32) {
    fill(ctx, '#704a2f', x + 2, 1, 28, 61)
    fill(ctx, '#251b17', x + 5, 7, 22, 45)
    for (let shelf = 13; shelf < 52; shelf += 13) {
      fill(ctx, '#9a6b3c', x + 4, shelf, 24, 3)
      for (let book = 0; book < 5; book += 1) {
        const colors = ['#6f2930', '#334b4a', '#75602d', '#49345d']
        fill(ctx, colors[(book + shelf) % colors.length], x + 6 + book * 4, shelf - 8, 3, 8)
      }
    }
    fill(ctx, '#a17647', x, 0, 2, 64)
  }
}

const paintSuite: WallPainter = (ctx) => {
  fill(ctx, '#8d626b')
  flecks(ctx, ['#a57980', '#79515c'], 60, 77)
  for (let x = 4; x < 128; x += 16) {
    for (let y = 6; y < 58; y += 16) {
      fill(ctx, '#bd8d91', x, y, 3, 3)
      fill(ctx, '#6c4653', x + 3, y + 3, 2, 2)
      fill(ctx, '#b9878e', x - 2, y + 4, 2, 2)
      line(ctx, '#5f4950', 1, x + 1, y + 5, x + 1, y + 10)
    }
  }
  fill(ctx, '#c1a374', 0, 55, 128, 2)
  fill(ctx, '#554047', 0, 61, 128, 3)
}

const PAINTERS: Record<RoomId, WallPainter> = {
  study: paintStudy,
  gallery: paintGallery,
  conservatory: paintConservatory,
  kitchen: paintKitchen,
  dining: paintDining,
  ballroom: paintBallroom,
  cellar: paintCellar,
  library: paintLibrary,
  suite: paintSuite,
}

/** Returns one shared, repeating pixel-art wall texture per room. */
export function getWallTexture(room: RoomId): THREE.CanvasTexture {
  const cached = textureCache.get(room)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_WIDTH
  canvas.height = TEXTURE_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Unable to create wall texture canvas')

  ctx.imageSmoothingEnabled = false
  PAINTERS[room](ctx)

  const texture = new THREE.CanvasTexture(canvas)
  texture.name = `wall-${room}`
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  textureCache.set(room, texture)
  return texture
}

/** Disposes generated GPU textures, primarily for renderer teardown or hot reload. */
export function disposeWallTextures() {
  for (const texture of textureCache.values()) texture.dispose()
  textureCache.clear()
}

