// Dev-only: renders close-ups of the Garketing billboards on the main track.
// Usage: node scripts/brand-check.mjs [url] [outDir]   (needs the dev server)
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
const url = process.argv[2] ?? 'http://localhost:3000/'
const out = process.argv[3] ?? '/tmp/lcr-brand'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto(url)
await page.waitForFunction(() => document.querySelector('[data-screen="title"].is-active'), null, { timeout: 60000 })
await page.keyboard.press('Enter')
await page.waitForTimeout(600)
await page.click('[data-mode="solo"]')
await page.click('[data-act="goSolo"]')
await page.waitForFunction(() => document.querySelector('[data-screen="hud"].is-active'), null, { timeout: 60000 })
await page.waitForTimeout(1500)
const shots = await page.evaluate(() => {
  const g = window.__game
  const s = g.app.session
  const scene = s.world.scene
  const boards = []
  scene.traverse(o => { if (o.isGroup && o.children.length === 2 && o.children[1].geometry?.parameters?.width === 12) boards.push(o) })
  const cam = s.cams[0].camera.clone()
  cam.aspect = 16 / 9
  cam.updateProjectionMatrix()
  const gl = g.app.renderer.gl
  const res = []
  for (const b of boards.slice(0, 4)) {
    const dir = { x: Math.sin(b.rotation.y), z: Math.cos(b.rotation.y) }
    cam.position.set(b.position.x + dir.x * 22, b.position.y + 1, b.position.z + dir.z * 22)
    cam.lookAt(b.position.x, b.position.y - 1.5, b.position.z)
    gl.render(scene, cam)
    res.push(gl.domElement.toDataURL('image/jpeg', 0.85))
  }
  return { count: boards.length, res }
})
console.log('boards', shots.count)
shots.res.forEach((d, i) => writeFileSync(`${out}/board-${i}.jpg`, Buffer.from(d.split(',')[1], 'base64')))
console.log('errors', errors.length, errors.slice(0, 5))
await browser.close()
