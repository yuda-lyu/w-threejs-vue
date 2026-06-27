import { chromium } from 'playwright'

let browser = await chromium.launch({ headless: true })
let page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
try { await page.getByText('menu', { exact: true }).first().click({ timeout: 5000 }) } catch (e) {}
for (let i = 0; i < 30; i++) {
    let n = await page.evaluate(() => document.querySelectorAll('[role="button"]').length)
    if (n > 0) break
    await page.waitForTimeout(1000)
}

let setup = await page.evaluate(() => {
    let btns = [...document.querySelectorAll('[role="button"]')]
    btns.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)
    let b0 = btns[0]
    b0.addEventListener('click', () => { window.__clk = (window.__clk || 0) + 1 }, true)
    let r = b0.getBoundingClientRect()
    // icon(I 或 svg)的 rect
    let iconEl = b0.querySelector('i, svg')
    let ir = iconEl ? iconEl.getBoundingClientRect() : null
    return {
        box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        icon: ir ? { x: Math.round(ir.x), y: Math.round(ir.y), w: Math.round(ir.width), h: Math.round(ir.height) } : null,
    }
})
console.log('button box:', JSON.stringify(setup.box), ' icon box:', JSON.stringify(setup.icon))

let cy = setup.box.y + setup.box.h / 2
let xs = []
for (let x = setup.box.x - 4; x <= setup.box.x + setup.box.w + 4; x++) xs.push(x)

let firing = []
for (let x of xs) {
    await page.evaluate(() => { window.__clk = 0 })
    await page.mouse.click(x, cy)
    await page.waitForTimeout(120)
    let clk = await page.evaluate(() => window.__clk || 0)
    firing.push({ x, fired: clk })
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(80)
}

let fired = firing.filter(f => f.fired > 0).map(f => f.x)
console.log('button x range:', setup.box.x, '~', setup.box.x + setup.box.w)
console.log('icon   x range:', setup.icon.x, '~', setup.icon.x + setup.icon.w)
console.log('click FIRED at x =', fired.length ? `${fired[0]} ~ ${fired[fired.length-1]}` : 'NONE')
console.log('detail:', firing.map(f => `${f.x}:${f.fired}`).join(' '))

await browser.close()
