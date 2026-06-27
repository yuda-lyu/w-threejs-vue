import { chromium } from 'playwright'

let browser = await chromium.launch()
let page = await browser.newPage()

page.on('pageerror', (err) => {
    console.log('=== PAGEERROR ===')
    console.log('message:', err.message)
    console.log('stack:\n' + err.stack)
})
page.on('console', (msg) => {
    if (msg.type() === 'error') {
        console.log('=== CONSOLE.ERROR ===', msg.text())
        for (let f of msg.location ? [msg.location()] : []) console.log('loc:', f)
    }
})

await page.goto('http://localhost:8081/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('goto err', e.message))
await page.waitForTimeout(2000)
await browser.close()
console.log('done')
