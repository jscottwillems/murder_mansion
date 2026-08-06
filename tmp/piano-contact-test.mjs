import fs from 'node:fs'
import { chromium } from '/Users/josh/.codex/skills/develop-web-game/node_modules/playwright/index.mjs'

const outputDir = 'output/piano-contact-targeted'
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
await page.addInitScript(() => {
  window.__pianoPlayCount = 0
  const originalPlay = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () {
    if (this.dataset.pianoContactCue === 'true') window.__pianoPlayCount += 1
    return originalPlay.call(this).catch(() => undefined)
  }
})
await page.goto('http://127.0.0.1:3005', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  const game = window.murderMansionGame
  game.setPhase('setup')
  game.startCase()
  game.px = 13.7
  game.pz = -3.05
  game.playerRoom = 'ballroom'
  game.sim.playerRoom = 'ballroom'
  game.world.focusRoom('ballroom')
  game.audio.setRoomAmbience('ballroom')
  window.advanceTime(300)
})

await page.keyboard.down('d')
await page.evaluate(() => window.advanceTime(100))
const firstContact = await page.evaluate(() => ({
  plays: window.__pianoPlayCount,
  state: JSON.parse(window.render_game_to_text()),
}))

await page.keyboard.up('d')
await page.evaluate(() => window.advanceTime(100))
await page.keyboard.down('d')
await page.evaluate(() => window.advanceTime(1800))
const heldContact = await page.evaluate(() => ({
  plays: window.__pianoPlayCount,
  state: JSON.parse(window.render_game_to_text()),
}))

await page.keyboard.up('d')
await page.evaluate(() => window.advanceTime(100))
await page.keyboard.down('d')
await page.evaluate(() => window.advanceTime(100))
await page.keyboard.up('d')
await page.evaluate(() => window.advanceTime(100))
const freshContact = await page.evaluate(() => ({
  plays: window.__pianoPlayCount,
  state: JSON.parse(window.render_game_to_text()),
  pianoMedia: {
    loop: window.murderMansionGame.audio.pianoCue.loop,
    src: window.murderMansionGame.audio.pianoCue.src,
  },
}))

await page.screenshot({ path: `${outputDir}/ballroom-piano-contact.png`, fullPage: true })
fs.writeFileSync(`${outputDir}/metadata.json`, JSON.stringify({
  firstContact,
  heldContact,
  freshContact,
  consoleErrors,
  pageErrors,
}, null, 2))
await browser.close()
