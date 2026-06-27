import { chromium } from 'playwright'

let browser = await chromium.launch({ headless: true })
let page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)

let counts = await page.evaluate(() => {
    return {
        roleButton: document.querySelectorAll('[role="button"]').length,
        tabindex0: document.querySelectorAll('[tabindex="0"]').length,
        svg: document.querySelectorAll('svg').length,
        bodyText: document.body.innerText.slice(0, 200),
        allDivs: document.querySelectorAll('div').length,
    }
})
console.log(JSON.stringify(counts, null, 2))
await page.screenshot({ path: 'tmp/page.png', fullPage: false })
console.log('shot saved')
await browser.close()
