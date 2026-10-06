// Renders the Lucky Clover Rally / Garketing brand assets (clover mark, game logo, favicon)
// from inline SVG with headless Chromium. Outputs PNGs to assets/brand/; webp conversion and
// copies into public/ are done by scripts/brand-assets.py.
// Usage: node scripts/brand-assets.mjs
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, 'assets/brand')
mkdirSync(out, { recursive: true })
const sora = readFileSync(resolve(root, 'public/fonts/Sora-VF.subset.woff2')).toString('base64')

export const NAVY = '#0B2A6B'
export const GREEN = '#12B76A'
// One heart-shaped leaf, tip at the centre, lobes pointing up (viewBox units, clover radius ~46).
const LEAF = 'M0,-3 C-4,-9 -22,-17 -22,-30 C-22,-41 -12,-46 -5,-41 C-2,-39 0,-36 0,-34 C0,-36 2,-39 5,-41 C12,-46 22,-41 22,-30 C22,-17 4,-9 0,-3 Z'
function clover(outline = 9, fill = GREEN) {
  const leaves = [45, 135, 225, 315].map(a => `<path d="${LEAF}" transform="rotate(${a})"/>`).join('')
  return `<g transform="scale(0.9)"><g stroke="#fff" stroke-width="${outline}" stroke-linejoin="round" fill="#fff">${leaves}</g><g fill="${fill}">${leaves}</g></g>`
}

const pages = {
  // 512 favicon / app icon: clover with white outline on transparent background.
  'favicon.png': { w: 512, h: 512, html: `<svg width="512" height="512" viewBox="-50 -50 100 100">${clover(8)}</svg>` },
  'clover.png': { w: 256, h: 256, html: `<svg width="256" height="256" viewBox="-50 -50 100 100">${clover(8)}</svg>` },
  // Game wordmark: "LUCKY CL☘VER" over a green "RALLY" plate, "by Garketing" lockup.
  'logo.png': {
    w: 1400, h: 460,
    html: `<div class="logo">
      <div class="l1">LUCKY CL<svg class="c" viewBox="-50 -50 100 100">${clover(9)}</svg>VER</div>
      <div class="l2">RALLY</div>
      <div class="l3">by G<svg class="c" viewBox="-50 -50 100 100">${clover(10)}</svg>rketing</div>
    </div>`,
    css: `.logo{width:1400px;height:460px;white-space:nowrap;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Sora;font-weight:800;color:${NAVY};filter:drop-shadow(0 8px 10px rgba(4,22,61,.42))}
      .l1{font-size:150px;letter-spacing:-3px;line-height:1;display:flex;align-items:center;-webkit-text-stroke:0;text-shadow:0 0 0 #fff;paint-order:stroke fill;-webkit-text-stroke:20px #fff}
      .l1 .c{width:136px;height:136px;margin:0 -2px;-webkit-text-stroke:0}
      .l2{margin-top:10px;background:${GREEN};color:#fff;border:9px solid #fff;border-radius:999px;font-size:78px;letter-spacing:28px;padding:4px 30px 6px 58px;line-height:1.15}
      .l3{margin-top:14px;font-size:46px;font-weight:700;display:flex;align-items:center;letter-spacing:1px;-webkit-text-stroke:8px #fff;paint-order:stroke fill}
      .l3 .c{width:46px;height:46px;margin:0 1px}`,
  },
}

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/chromium' })
const page = await browser.newPage()
for (const [name, p] of Object.entries(pages)) {
  await page.setViewportSize({ width: p.w, height: p.h })
  await page.setContent(`<!doctype html><style>@font-face{font-family:Sora;src:url(data:font/woff2;base64,${sora}) format('woff2');font-weight:100 800}html,body{margin:0;background:transparent}svg{display:block}${p.css ?? ''}</style>${p.html}`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: resolve(out, name), omitBackground: true, clip: { x: 0, y: 0, width: p.w, height: p.h } })
  console.log('wrote', name)
}
await browser.close()
