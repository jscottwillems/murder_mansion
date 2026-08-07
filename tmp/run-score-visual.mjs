import fs from 'node:fs'
import { chromium } from '/Users/josh/.codex/skills/develop-web-game/node_modules/playwright/index.mjs'

const outDir = 'output/run-score-targeted'
fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } })
const consoleErrors = []
const pageErrors = []
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
page.on('pageerror', error => pageErrors.push(String(error)))
await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  const game = window.murderMansionGame
  game.startCase()
  const sim = game.sim
  const killer = sim.byId(sim.killerId)
  game.evidence = killer.evidenceIds.slice(0, 2).map((evidenceId, index) => ({
    id: `visual-${index}`, evidenceId, label: evidenceId, description: '', candidateNames: [], source: 'QA', atMin: 0,
  }))
  for (const guest of sim.guests.slice(0, 3)) guest.revealedEvidenceIds = guest.evidenceIds.slice(0, 1)
  sim.guests.filter(guest => !guest.isKiller).slice(0, 3).forEach(guest => game.eliminatedGuestIds.add(guest.id))
  game.eliminatedGuestIds.add(killer.id)
  const statuses = Object.values(game.narrative.characters).flatMap(character => Object.keys(character.threadStatuses).map(id => [character, id]))
  statuses.slice(0, 8).forEach(([character, id]) => { character.threadStatuses[id] = 'resolved' })
  game.accuse(killer.id, 'seal')
})
await page.waitForTimeout(1200)
const scoreText = await page.locator('[data-run-score]').innerText()
const state = JSON.parse(await page.evaluate(() => window.render_game_to_text()))
await page.screenshot({ path: `${outDir}/end-score.png`, fullPage: true })
fs.writeFileSync(`${outDir}/meta.json`, JSON.stringify({ scoreText, runScore: state.runScore, consoleErrors, pageErrors }, null, 2))
await browser.close()
