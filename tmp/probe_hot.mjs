import { chromium } from 'playwright'

let browser = await chromium.launch({ headless: true })
let page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

let info = await page.evaluate(() => {
    let btns = [...document.querySelectorAll('[role="button"]')]
    if (!btns.length) return { err: 'no role=button found' }

    function box(el) {
        if (!el) return null
        let r = el.getBoundingClientRect()
        let cs = getComputedStyle(el)
        return {
            tag: el.tagName, cls: (el.className || '').toString().slice(0, 40),
            x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
            padding: cs.padding, cursor: cs.cursor, overflow: cs.overflow,
            display: cs.display, pointerEvents: cs.pointerEvents,
        }
    }

    let chain = []
    let cur = btns[0]
    chain.push(box(cur))
    while (cur) {
        let next = cur.querySelector(':scope > *')
        if (!next) break
        chain.push(box(next))
        cur = next
    }

    let r = btns[0].getBoundingClientRect()
    let cx = r.x + r.width / 2, cy = r.y + r.height / 2
    function hit(px, py, label) {
        let e = document.elementFromPoint(px, py)
        if (!e) return { label, none: true }
        let cs = getComputedStyle(e)
        return {
            label, px: Math.round(px), py: Math.round(py),
            tag: e.tagName, cls: (e.className || '').toString().slice(0, 40),
            cursor: cs.cursor, pointerEvents: cs.pointerEvents,
            inButton: !!e.closest('[role="button"]'),
        }
    }

    return {
        nBtns: btns.length,
        firstBtnBox: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        chain,
        hits: [
            hit(cx, cy, 'center(icon)'),
            hit(r.x + 2, cy, 'leftEdge(padding)'),
            hit(cx, r.y + 2, 'topEdge(padding)'),
            hit(r.x + r.width - 2, cy, 'rightEdge(padding)'),
        ],
    }
})

console.log(JSON.stringify(info, null, 2))
await browser.close()
