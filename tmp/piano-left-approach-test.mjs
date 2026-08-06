import fs from 'node:fs'
import { chromium } from '/Users/josh/.codex/skills/develop-web-game/node_modules/playwright/index.mjs'

const outputDir = 'output/piano-left-approach-targeted'
fs.mkdirSync(outputDir, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } })
const consoleErrors = []
const pageErrors = []
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('pageerror', error => pageErrors.push(String(error)))

await page.goto('http://127.0.0.1:3008', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  const game = window.murderMansionGame
  game.setPhase('setup')
  game.startCase()
  game.px = 13.5
  game.pz = -3.05
  game.playerRoom = 'ballroom'
  game.sim.playerRoom = 'ballroom'
  game.world.focusRoom('ballroom')
  window.advanceTime(300)
})

await page.keyboard.down('d')
await page.evaluate(() => window.advanceTime(1000))
await page.keyboard.up('d')
await page.evaluate(() => window.advanceTime(200))

const state = JSON.parse(await page.evaluate(() => window.render_game_to_text()))
await page.screenshot({ path: `${outputDir}/ballroom-piano-left-edge.png`, fullPage: true })
fs.writeFileSync(`${outputDir}/metadata.json`, JSON.stringify({
  player: state.player,
  pianoInteraction: state.pianoInteraction,
  expectedWestStop: 13 + 2.95 - 1.62 - 0.42,
  consoleErrors,
  pageErrors,
}, null, 2))
await browser.close()
