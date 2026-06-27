import { chromium } from 'playwright'

let browser = await chromium.launch({ headless: true })
let page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

try {
    await page.getByText('menu', { exact: true }).first().click({ timeout: 5000 })
} catch (e) { console.log('click menu failed:', e.message) }

// 等圖台 3D 載入 (輪詢 role=button 最多 30s)
let found = 0
for (let i = 0; i < 30; i++) {
    found = await page.evaluate(() => document.querySelectorAll('[role="button"]').length)
    if (found > 0) break
    await page.waitForTimeout(1000)
}
console.log('roleButton count:', found)

let info = await page.evaluate(() => {
    let btns = [...document.querySelectorAll('[role="button"]')]
    if (!btns.length) return { err: 'still no button' }

    function box(el) {
        let r = el.getBoundingClientRect()
        let cs = getComputedStyle(el)
        return {
            tag: el.tagName, cls: (el.className || '').toString().slice(0, 30),
            x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
            padding: cs.padding, cursor: cs.cursor, overflow: cs.overflow,
            display: cs.display, pointerEvents: cs.pointerEvents,
        }
    }
    // 取左側選單(x 最小那群)的第一顆
    btns.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x)
    let b0 = btns[0]

    let chain = [], cur = b0
    chain.push(box(cur))
    while (cur) {
        let next = cur.querySelector(':scope > *')
        if (!next) break
        chain.push(box(next))
        cur = next
    }

    let r = b0.getBoundingClientRect()
    let cx = r.x + r.width / 2, cy = r.y + r.height / 2
    function hit(px, py, label) {
        let e = document.elementFromPoint(px, py)
        if (!e) return { label, none: true }
        let cs = getComputedStyle(e)
        let path = []
        let p = e
        for (let i = 0; i < 4 && p; i++) { path.push(p.tagName + '.' + (p.className||'').toString().slice(0,18)); p = p.parentElement }
        return { label, px: Math.round(px), py: Math.round(py), tag: e.tagName,
            cursor: cs.cursor, pointerEvents: cs.pointerEvents,
            inButton: !!e.closest('[role="button"]'), path }
    }

    return {
        nBtns: btns.length,
        firstBtnHTML: b0.outerHTML.slice(0, 300),
        firstBtnBox: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        chain,
        hits: [
            hit(cx, cy, 'center(icon)'),
            hit(r.x + 2, cy, 'leftEdge'),
            hit(cx, r.y + 2, 'topEdge'),
            hit(r.x + r.width - 2, cy, 'rightEdge'),
            hit(cx, r.y + r.height - 2, 'bottomEdge'),
        ],
    }
})
console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: 'tmp/page_menu.png' })
await browser.close()
