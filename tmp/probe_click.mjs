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

// 在「整顆 button 最外層 div」掛 capture click 計數器(只計數不干擾), 取多顆驗證
let setup = await page.evaluate(() => {
    let btns = [...document.querySelectorAll('[role="button"]')]
    btns.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)
    window.__clk = []
    btns.forEach((b, i) => {
        b.addEventListener('click', () => { window.__clk[i] = (window.__clk[i] || 0) + 1 }, true)
    })
    let b0 = btns[0]
    let r = b0.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height, n: btns.length }
})
console.log('btn0:', JSON.stringify(setup))

async function clickAt(px, py, label) {
    await page.evaluate(() => { window.__clk = [] })
    await page.mouse.click(px, py)
    await page.waitForTimeout(300)
    let clk = await page.evaluate(() => window.__clk[0] || 0)
    console.log(`[${label}] click@(${Math.round(px)},${Math.round(py)}) -> btn0 @click fired: ${clk}`)
    // 點完若有 modal 彈出, 按 Esc 關閉避免干擾下一輪
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(200)
}

let cx = setup.x + setup.w / 2, cy = setup.y + setup.h / 2
await clickAt(setup.x + 1, cy, 'leftEdge-padding(x+1)')
await clickAt(setup.x + setup.w - 1, cy, 'rightEdge-padding')
await clickAt(cx, setup.y + 1, 'topEdge-padding')
await clickAt(cx, cy, 'center-icon')

await browser.close()
