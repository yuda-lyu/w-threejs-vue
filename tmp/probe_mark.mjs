import { chromium } from 'playwright'

let browser = await chromium.launch({ headless: true })
let page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 3 })
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
try { await page.getByText('menu', { exact: true }).first().click({ timeout: 5000 }) } catch (e) {}
for (let i = 0; i < 30; i++) {
    let n = await page.evaluate(() => document.querySelectorAll('[role="button"]').length)
    if (n > 0) break
    await page.waitForTimeout(1000)
}

let clip = await page.evaluate(() => {
    let btns = [...document.querySelectorAll('[role="button"]')]
    btns.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)
    let b0 = btns[0]
    let r = b0.getBoundingClientRect()
    let iconEl = b0.querySelector('i, svg')
    let ir = iconEl.getBoundingClientRect()
    function mark(rect, color, label) {
        let d = document.createElement('div')
        d.style.cssText = `position:fixed; left:${rect.x}px; top:${rect.y}px; width:${rect.width}px; height:${rect.height}px; border:1px solid ${color}; box-sizing:border-box; z-index:99999; pointer-events:none;`
        let t = document.createElement('div')
        t.textContent = label
        t.style.cssText = `position:fixed; left:${rect.x}px; top:${rect.y - 12}px; font-size:8px; color:${color}; z-index:99999; white-space:nowrap;`
        document.body.appendChild(d); document.body.appendChild(t)
    }
    mark(r, 'lime', `button/hotzone ${Math.round(r.width)}px`)
    mark(ir, 'red', `icon ${Math.round(ir.width)}px`)
    return { x: r.x - 30, y: r.y - 20, width: 200, height: 90 }
})

await page.screenshot({ path: 'tmp/hotzone.png', clip })
console.log('marked shot saved')
await browser.close()
