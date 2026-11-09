import assert from 'assert'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { PNG } from 'pngjs'
import launchBrowser from 'w-package-tools-e2e/src/launchBrowser.mjs'
import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


//規則帳本對應: sgud/rule/rulebook.md 之 R07(three渲染與生命週期於真瀏覽器之行為)
//本檔為語意斷言之煙霧測試(起頁, 真滑鼠拖曳/滾輪, 元件銷毀後釋放WebGL), 未使用pixel標準圖(不新增標準圖)
//測試中介資料(建置之UMD)置於test/_tmp/e2e-render-smoke/, 測完刪除; 不使用./tmp


let dirTest = path.dirname(fileURLToPath(import.meta.url))
let dirRoot = path.resolve(dirTest, '..')
let dirCase = path.join(dirTest, '_tmp', 'e2e-render-smoke')
let dirDist = path.join(dirCase, 'dist')
let fpDist = path.join(dirDist, 'w-threejs-vue.umd.js')
let fpVue = path.join(dirRoot, 'node_modules', 'vue', 'dist', 'vue.min.js')


//二進位STL立方體(邊長100, 中心於原點), 12個三角形, 供光影層次判讀
let makeCubeStl = () => {
    let s = 50
    let v = (x, y, z) => [x * s, y * s, z * s]
    //每個面: 法向 + 兩個三角形(逆時針)
    let faces = [
        { n: [1, 0, 0], q: [v(1, -1, -1), v(1, 1, -1), v(1, 1, 1), v(1, -1, 1)] },
        { n: [-1, 0, 0], q: [v(-1, -1, -1), v(-1, -1, 1), v(-1, 1, 1), v(-1, 1, -1)] },
        { n: [0, 1, 0], q: [v(-1, 1, -1), v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1)] },
        { n: [0, -1, 0], q: [v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1)] },
        { n: [0, 0, 1], q: [v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)] },
        { n: [0, 0, -1], q: [v(-1, -1, -1), v(-1, 1, -1), v(1, 1, -1), v(1, -1, -1)] },
    ]
    let tris = []
    for (let f of faces) {
        tris.push([f.n, f.q[0], f.q[1], f.q[2]])
        tris.push([f.n, f.q[0], f.q[2], f.q[3]])
    }
    let buf = Buffer.alloc(80 + 4 + 50 * tris.length)
    buf.writeUInt32LE(tris.length, 80)
    tris.forEach((t, i) => {
        let o = 84 + 50 * i
        let vals = [...t[0], ...t[1], ...t[2], ...t[3]]
        vals.forEach((x, j) => buf.writeFloatLE(x, o + 4 * j))
    })
    return buf
}


let htmlHarness = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<script src="/vue.min.js"></script>
<script src="/w-threejs-vue.umd.js"></script>
</head>
<body style="margin:0; padding:0; background:#fff;">
<div id="app" style="padding:20px;">
    <w-threejs-vue v-if="show" ref="thr" :opt="opt" @init="onEvt('init')" @error="onErr" @dispose="onEvt('dispose')"></w-threejs-vue>
</div>
<script>
window.__events = []
window.__errors = []
Vue.component('w-threejs-vue', window['w-threejs-vue'])
window.vm = new Vue({
    el: '#app',
    data: function() {
        return {
            show: true,
            opt: {
                width: 640,
                height: 480,
                items: [
                    { url: '/cube.stl', name: 'Cube', color: 'rgba(214, 92, 92, 1)' },
                ],
            },
        }
    },
    methods: {
        onEvt: function(name) {
            window.__events.push(name)
        },
        onErr: function(err) {
            window.__errors.push(String(err && err.message || err))
        },
    },
})
</script>
</body>
</html>
`


//統計截圖中顏色接近目標色(rgb距離<tol)之像素數
let countColor = (png, rgb, tol) => {
    let n = 0
    let d = png.data
    for (let i = 0; i < d.length; i += 4) {
        let dr = d[i] - rgb[0]
        let dg = d[i + 1] - rgb[1]
        let db = d[i + 2] - rgb[2]
        if (Math.sqrt(dr * dr + dg * dg + db * db) < tol) {
            n++
        }
    }
    return n
}

//統計兩張截圖中任一通道差>16之像素數
let countDiff = (a, b) => {
    assert.strictEqual(a.width, b.width)
    assert.strictEqual(a.height, b.height)
    let n = 0
    for (let i = 0; i < a.data.length; i += 4) {
        if (Math.abs(a.data[i] - b.data[i]) > 16 || Math.abs(a.data[i + 1] - b.data[i + 1]) > 16 || Math.abs(a.data[i + 2] - b.data[i + 2]) > 16) {
            n++
        }
    }
    return n
}


describe('e2e-render-smoke', function() {

    this.timeout(180000)

    let server = null
    let baseUrl = ''
    let browser = null
    let ctx = null
    let page = null
    let errs = []

    let shot = async() => {
        let box = await page.locator('canvas').first().boundingBox()
        let buf = await page.screenshot({ clip: { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.width), height: Math.ceil(box.height) } })
        return PNG.sync.read(buf)
    }

    //連續兩張相同視為畫面穩定(camera-controls有平滑過渡)
    let settle = async() => {
        let prev = null
        for (let i = 0; i < 30; i++) {
            let cur = await shot()
            if (prev && countDiff(prev, cur) === 0) {
                return cur
            }
            prev = cur
            await page.waitForTimeout(300)
        }
        throw new Error('畫面未穩定')
    }

    let open = async(dpr) => {
        errs = []
        ctx = await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: dpr })
        page = await ctx.newPage()
        page.on('pageerror', (e) => errs.push('[pageerror] ' + String(e && e.message || e)))
        page.on('console', (m) => {
            if (m.type() === 'error') {
                errs.push('[console.error] ' + m.text())
            }
        })
        await page.goto(`${baseUrl}/`, { waitUntil: 'load' })
        await page.waitForFunction(() => window.__events.includes('init'), null, { timeout: 60000 })
    }

    before(async function() {

        //建置UMD(同toolg/gDistRollupComps.mjs設定, 輸出至測試中介資料夾)
        fs.mkdirSync(dirCase, { recursive: true })
        await rollupFiles({
            fns: 'WThreejsVue.vue',
            fdSrc: path.join(dirRoot, 'src', 'components') + '/',
            fdTar: dirDist,
            format: 'umd',
            nameDistType: 'kebabCase',
            globals: {},
            external: [],
            bLog: false,
        })
        assert.ok(fs.existsSync(fpDist), 'UMD建置失敗')

        //server
        let stl = makeCubeStl()
        let umd = fs.readFileSync(fpDist)
        let vue = fs.readFileSync(fpVue)
        server = http.createServer((req, res) => {
            let u = req.url.split('?')[0]
            if (u === '/') {
                res.setHeader('content-type', 'text/html; charset=utf-8')
                res.end(htmlHarness)
            }
            else if (u === '/w-threejs-vue.umd.js') {
                res.setHeader('content-type', 'application/javascript')
                res.end(umd)
            }
            else if (u === '/vue.min.js') {
                res.setHeader('content-type', 'application/javascript')
                res.end(vue)
            }
            else if (u === '/cube.stl') {
                res.setHeader('content-type', 'application/octet-stream')
                res.end(stl)
            }
            else {
                res.statusCode = 404
                res.end('not found')
            }
        })
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
        baseUrl = `http://127.0.0.1:${server.address().port}`

        //browser: 確定性渲染旗標(launchBrowser)另加軟體WebGL旗標, 無頭
        browser = await launchBrowser({
            args: ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
        })

    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
            ctx = null
            page = null
        }
    })

    after(async function() {
        if (browser) {
            await browser.close()
        }
        if (server) {
            await new Promise((resolve) => server.close(resolve))
        }
        fs.rmSync(dirCase, { recursive: true, force: true })
        try {
            fs.rmdirSync(path.join(dirTest, '_tmp')) //空才刪
        }
        catch (err) {}
    })

    for (let dpr of [1, 2]) {

        describe(`deviceScaleFactor=${dpr}`, function() {

            it('起頁後觸發init, 無頁面錯誤; canvas尺寸等於opt(元件不隨devicePixelRatio縮放); 立方體以指定顏色呈現於深色背景', async function() {

                //spec: 元件依opt.width/height建立三維畫面, 載入items之STL並以color呈現
                await open(dpr)
                let info = await page.evaluate(() => {
                    let cv = document.querySelector('canvas')
                    let r = cv.getBoundingClientRect()
                    return { w: cv.width, h: cv.height, cssW: Math.round(r.width), cssH: Math.round(r.height), n: document.querySelectorAll('canvas').length }
                })
                assert.strictEqual(info.n, 1)
                assert.strictEqual(info.cssW, 640)
                assert.strictEqual(info.cssH, 480)
                assert.strictEqual(info.w, 640, 'canvas位元尺寸應等於opt.width(不乘devicePixelRatio)')
                assert.strictEqual(info.h, 480)

                let png = await settle()
                let nTotal = png.width * png.height
                let nRed = countColor(png, [214, 92, 92], 90) //受光面呈現mesh顏色附近(含明暗)
                let nBg = countColor(png, [34, 34, 34], 24) //預設背景(深色)
                assert.ok(nRed > 3000, `立方體色彩像素過少: ${nRed}`)
                assert.ok(nBg > nTotal * 0.3, `背景像素過少: ${nBg}`)
                assert.deepStrictEqual(errs, [])
                let errors = await page.evaluate(() => window.__errors)
                assert.deepStrictEqual(errors, [])

            })

            it('真滑鼠拖曳旋轉與滾輪縮放後畫面改變(camera-controls作用於三維畫布)', async function() {

                //spec: 使用者以滑鼠操作視角
                await open(dpr)
                let before = await settle()
                let box = await page.locator('canvas').first().boundingBox()
                let cx = box.x + box.width / 2
                let cy = box.y + box.height / 2

                await page.mouse.move(cx, cy)
                await page.mouse.down()
                await page.mouse.move(cx + 120, cy + 40, { steps: 12 })
                await page.mouse.up()
                let afterRotate = await settle()
                assert.ok(countDiff(before, afterRotate) > 2000, '拖曳後畫面應改變')

                await page.mouse.move(cx, cy)
                await page.mouse.wheel(0, -400)
                let afterZoom = await settle()
                assert.ok(countDiff(afterRotate, afterZoom) > 2000, '滾輪後畫面應改變')

                assert.deepStrictEqual(errs, [])

            })

            it('元件銷毀: canvas自DOM移除、WebGL context已釋放、無頁面錯誤; 再掛載可重新初始化', async function() {

                //spec: 元件銷毀時釋放renderer與WebGL資源(renderer.dispose與forceContextLoss), 再掛載不受舊實例影響
                //註: 銷毀時元件不會向父層發出dispose事件(beforeDestroy先置disposed, 事件處理器早退; 既有行為, 與three版本無關), 故以DOM狀態為同步點
                await open(dpr)
                await settle()

                //保留舊canvas之參照以檢查其context
                await page.evaluate(() => {
                    window.__oldCanvas = document.querySelector('canvas')
                })

                await page.evaluate(() => {
                    window.vm.show = false
                })
                await page.waitForFunction(() => document.querySelectorAll('canvas').length === 0, null, { timeout: 30000 })
                await page.waitForTimeout(1000) //觀察窗: 銷毀後之非同步釋放不應再拋錯(否定斷言)

                let st = await page.evaluate(() => {
                    let cv = window.__oldCanvas
                    let gl = cv.getContext('webgl2') || cv.getContext('webgl')
                    return { n: document.querySelectorAll('canvas').length, lost: gl ? gl.isContextLost() : null }
                })
                assert.strictEqual(st.n, 0, '銷毀後canvas應自DOM移除')
                assert.strictEqual(st.lost, true, '銷毀後WebGL context應已釋放')
                assert.deepStrictEqual(errs, [])

                //再掛載
                await page.evaluate(() => {
                    window.__events = []
                    window.vm.show = true
                })
                await page.waitForFunction(() => window.__events.includes('init'), null, { timeout: 60000 })
                let png = await settle()
                assert.ok(countColor(png, [214, 92, 92], 90) > 3000, '再掛載後立方體應顯示')
                assert.deepStrictEqual(errs, [])

            })

        })

    }

})
