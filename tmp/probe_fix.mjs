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

// 取第一顆 button 中心, 並把 divBar 容器人為移到覆蓋該中心(模擬使用者實機 divBar 與 button 重疊)
let target = await page.evaluate(() => {
    let btns = [...document.querySelectorAll('[role="button"]')]
    btns.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)
    let b0 = btns[0]
    b0.addEventListener('click', () => { window.__clk = (window.__clk||0)+1 }, true)
    let r = b0.getBoundingClientRect()

    // 找 divBar 容器(absolute, 內含 div.sb)
    let barWrap = [...document.querySelectorAll('div')].find(d => {
        let cs = getComputedStyle(d)
        return cs.position === 'absolute' && d.querySelector(':scope > div.sb')
    })
    // 人為左移使 divBar 蓋住 button 中心 x
    let cx = r.x + r.width / 2
    barWrap.style.right = 'auto'
    barWrap.style.left = (cx - 4) + 'px'   // 8px bar 置中於 button 中心
    return { cx: Math.round(cx), cy: Math.round(r.y + r.height / 2) }
})
console.log('button 中心:', JSON.stringify(target), '(divBar 已人為覆蓋此處)')

async function probe(label) {
    return await page.evaluate(([x, y, label]) => {
        let e = document.elementFromPoint(x, y)
        return { label, hitTag: e.tagName, isBar: e.classList.contains('sb'),
                 inButton: !!e.closest('[role="button"]'), cursor: getComputedStyle(e).cursor }
    }, [target.cx, target.cy, label])
}

// A) divBar pointer-events:auto (現況) -> 應擋住 button
await page.evaluate(() => {
    document.querySelectorAll('div.sb').forEach(b => b.style.pointerEvents = 'auto')
})
console.log('【現況 auto】', JSON.stringify(await probe('auto')))
await page.evaluate(() => window.__clk = 0)
await page.mouse.click(target.cx, target.cy)
await page.waitForTimeout(150)
console.log('   點擊 button 中心 -> @click 觸發:', await page.evaluate(() => window.__clk||0))

// B) divBar pointer-events:none (解法) -> 事件穿透到 button
await page.evaluate(() => {
    document.querySelectorAll('div.sb').forEach(b => b.style.pointerEvents = 'none')
})
await page.keyboard.press('Escape').catch(()=>{})
await page.waitForTimeout(150)
console.log('【解法 none】', JSON.stringify(await probe('none')))
await page.evaluate(() => window.__clk = 0)
await page.mouse.click(target.cx, target.cy)
await page.waitForTimeout(150)
console.log('   點擊 button 中心 -> @click 觸發:', await page.evaluate(() => window.__clk||0))

await browser.close()
