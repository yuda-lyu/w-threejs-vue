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

let geo = await page.evaluate(() => {
    let bars = [...document.querySelectorAll('div.sb')].filter(d => {
        let p = d.parentElement
        return p && getComputedStyle(p).position === 'absolute'
    })
    let bar = bars[0]
    let br = bar.getBoundingClientRect()
    let cs = getComputedStyle(bar)
    let btns = [...document.querySelectorAll('[role="button"]')]
    btns.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)
    let r0 = btns[0].getBoundingClientRect()
    let shell = [...document.querySelectorAll('div')].find(d => {
        let s = getComputedStyle(d)
        return s.overflowY === 'scroll' && d.getAttribute('_class') === 'sb'
    })
    let content = shell ? shell.firstElementChild : null
    return {
        bar: { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height),
               opacity: cs.opacity, pointerEvents: cs.pointerEvents },
        btn0: { x: Math.round(r0.x), y: Math.round(r0.y), w: Math.round(r0.width), h: Math.round(r0.height) },
        shellH: shell ? shell.clientHeight : null,
        contentH: content ? content.offsetHeight : null,
    }
})
console.log('divBar:', JSON.stringify(geo.bar))
console.log('btn0  :', JSON.stringify(geo.btn0))
console.log('面板可視高=', geo.shellH, ' 內容高=', geo.contentH, ' 需要捲軸?', geo.contentH > geo.shellH)

let overlapX = geo.bar.x + 1
let testY = geo.btn0.y + geo.btn0.h / 2
console.log(`\n測試點 x=${overlapX}(divBar內) y=${Math.round(testY)} 仍在btn0寬內: ${overlapX <= geo.btn0.x + geo.btn0.w}`)

async function hitAt(px, py) {
    return await page.evaluate(([x, y]) => {
        let e = document.elementFromPoint(x, y)
        return e ? { tag: e.tagName, cls: (e.className||'').toString().slice(0,20),
                     isBar: e.classList && e.classList.contains('sb'),
                     inButton: !!(e.closest && e.closest('[role="button"]')),
                     cursor: getComputedStyle(e).cursor } : null
    }, [px, py])
}
console.log('修復前 hit:', JSON.stringify(await hitAt(overlapX, testY)))

await page.evaluate(() => {
    [...document.querySelectorAll('div.sb')].filter(d => {
        let p = d.parentElement
        return p && getComputedStyle(p).position === 'absolute'
    }).forEach(b => { b.style.pointerEvents = 'none' })
})
console.log('修復後 hit:', JSON.stringify(await hitAt(overlapX, testY)))

await page.evaluate(() => {
    let btns = [...document.querySelectorAll('[role="button"]')]
    btns.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)
    btns[0].addEventListener('click', () => { window.__clk = (window.__clk||0)+1 }, true)
    window.__clk = 0
})
await page.mouse.click(overlapX, testY)
await page.waitForTimeout(200)
console.log('修復後點該點 btn0 @click 觸發:', await page.evaluate(() => window.__clk || 0))

await browser.close()
