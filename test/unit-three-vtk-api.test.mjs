import assert from 'assert'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import CameraControls from 'camera-controls'
import { createScene, disposeScene } from '../src/js/atScene.mjs'
import { createGroup, disposeGroup } from '../src/js/atGroup.mjs'
import { createLightAmbient, disposeLightAmbient } from '../src/js/atLightAmbient.mjs'
import { createLightDirection, disposeLightDirection } from '../src/js/atLightDirection.mjs'
import { createLightPoints, disposeLightPoints } from '../src/js/atLightPoints.mjs'
import { createHelperAxes, disposeHelperAxes } from '../src/js/atHelperAxes.mjs'
import { createHelperGrid, disposeHelperGrid } from '../src/js/atHelperGrid.mjs'
import { createLine, disposeLine } from '../src/js/atLine.mjs'
import addStl from '../src/js/addStl.mjs'
import {
    parseVtpArrayBuffer,
    vtkPolyDataToBufferGeometry,
    vtkCellArrayToIndices
} from '../src/js/vtkPolyDataToBufferGeometry.mjs'


//規則帳本對應: sgud/rule/rulebook.md 之 R01~R06(three與@kitware/vtk.js之版本相關規則)

//three之FileLoader於回報進度時使用瀏覽器全域ProgressEvent, Node無此全域, 測試環境補最小墊片(僅測試用, 不屬套件行為)
if (typeof globalThis.ProgressEvent === 'undefined') {
    globalThis.ProgressEvent = class ProgressEvent extends Event {
        constructor(type, init = {}) {
            super(type)
            this.lengthComputable = !!init.lengthComputable
            this.loaded = init.loaded || 0
            this.total = init.total || 0
        }
    }
}

let dirTest = path.dirname(fileURLToPath(import.meta.url))
let dirRoot = path.resolve(dirTest, '..')


let readJson = (fp) => {
    return JSON.parse(fs.readFileSync(fp, 'utf8'))
}

let parseVer = (s) => {
    let m = String(s).match(/(\d+)\.(\d+)\.(\d+)/)
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}


describe('unit-three-vtk-api', function() {

    describe('R01 套件宣告與已安裝版本一致', function() {

        let pkg = readJson(path.join(dirRoot, 'package.json'))

        let check = (name) => {
            //宣告為^x.y.z, 已安裝版本須同主版號(0.x視為同次版號)且不低於宣告
            let declared = parseVer(pkg.dependencies[name])
            let installed = parseVer(readJson(path.join(dirRoot, 'node_modules', ...name.split('/'), 'package.json')).version)
            assert.ok(pkg.dependencies[name].startsWith('^'), `${name} 須宣告為^範圍`)
            if (declared[0] === 0) {
                assert.strictEqual(installed[0], 0)
                assert.strictEqual(installed[1], declared[1], `${name} 已安裝 ${installed.join('.')} 與宣告 ${declared.join('.')} 次版號不同`)
            }
            else {
                assert.strictEqual(installed[0], declared[0], `${name} 已安裝 ${installed.join('.')} 與宣告 ${declared.join('.')} 主版號不同`)
            }
            let ge = installed[0] > declared[0] || (installed[0] === declared[0] && (installed[1] > declared[1] || (installed[1] === declared[1] && installed[2] >= declared[2])))
            assert.ok(ge, `${name} 已安裝版本低於宣告`)
            return installed
        }

        it('three已安裝版本符合宣告, 且THREE.REVISION等於其次版號', function() {
            let installed = check('three')
            assert.strictEqual(String(THREE.REVISION), String(installed[1]))
        })

        it('@kitware/vtk.js已安裝版本符合宣告', function() {
            check('@kitware/vtk.js')
        })

        it('宣告已達本輪升級目標: three ^0.187.0、@kitware/vtk.js ^38.0.4(主控已定1)', function() {
            let t = parseVer(pkg.dependencies.three)
            let v = parseVer(pkg.dependencies['@kitware/vtk.js'])
            assert.ok(t[0] === 0 && t[1] >= 187, `three宣告為${pkg.dependencies.three}, 應不低於^0.187.0`)
            assert.ok(v[0] > 38 || (v[0] === 38 && (v[1] > 0 || v[2] >= 4)), `@kitware/vtk.js宣告為${pkg.dependencies['@kitware/vtk.js']}, 應不低於^38.0.4`)
        })

    })

    describe('R02 程式碼不使用已移除或遷移指南要求處理之API', function() {

        //three(r186,r187遷移)與vtk.js(37,38遷移)已移除或行為改變之識別字; 啟用陰影/改pixelRatio/改render target者須回頭依遷移指南檢視並補測試
        let forbidden = [
            ['sRGBEncoding', /\bsRGBEncoding\b/],
            ['LinearEncoding', /\bLinearEncoding\b/],
            ['outputEncoding', /\boutputEncoding\b/],
            ['physicallyCorrectLights', /\bphysicallyCorrectLights\b/],
            ['THREE.Geometry', /\bTHREE\.Geometry\b/],
            ['THREE.Math', /\bTHREE\.Math\b/],
            ['Face3', /\bFace3\b/],
            ['THREE.Source(r187改名為TextureSource)', /\bTHREE\.Source\b/],
            ['PCFSoftShadowMap(r187移除)', /\bPCFSoftShadowMap\b/],
            ['shadowMap(未啟用陰影)', /\bshadowMap\b/],
            ['castShadow=true(未啟用陰影)', /\bcastShadow\s*=\s*true\b/],
            ['receiveShadow=true(未啟用陰影)', /\breceiveShadow\s*=\s*true\b/],
            ['setPixelRatio(r187僅setViewport/setScissor套用pixelRatio)', /\.setPixelRatio\s*\(/],
            ['setViewport', /\.setViewport\s*\(/],
            ['setScissor', /\.setScissor\s*\(/],
            ['WebGLRenderTarget(r186起viewport不再乘pixelRatio)', /\bWebGLRenderTarget\b/],
            ['setRenderTarget', /\.setRenderTarget\s*\(/],
            ['setModelTransformMatrix(vtk.js 37改column-major)', /\bsetModelTransformMatrix\b/],
            ['getColorTexture(vtk.js 38移除)', /\bgetColorTexture\b/],
            ['setAverageIPScalarRange(vtk.js 38移除)', /\bsetAverageIPScalarRange\b/],
            ['vtk-lite(vtk.js 38移除別名)', /vtk-lite/],
        ]

        let listFiles = () => {
            let fps = []
            for (let sub of ['src/js', 'src/components']) {
                let dir = path.join(dirRoot, sub)
                for (let fn of fs.readdirSync(dir)) {
                    if (/\.(mjs|js|vue)$/.test(fn)) {
                        fps.push(path.join(dir, fn))
                    }
                }
            }
            return fps
        }

        //去除註解後再掃, 註解內之歷史說明不計
        let stripComments = (s) => {
            return s
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
        }

        it('掃描檔數大於0(掃描範圍有效)', function() {
            assert.ok(listFiles().length >= 10)
        })

        for (let [label, re] of forbidden) {
            it(`src/js與src/components無 ${label}`, function() {
                let hits = []
                for (let fp of listFiles()) {
                    let code = stripComments(fs.readFileSync(fp, 'utf8'))
                    if (re.test(code)) {
                        hits.push(path.relative(dirRoot, fp))
                    }
                }
                assert.deepStrictEqual(hits, [])
            })
        }

        it('掃描規則可抓到正例(以含禁用識別字之字串驗證stripComments與規則有效)', function() {
            let sample = stripComments('let a = 1 //註解內sRGBEncoding不計\nrenderer.outputEncoding = THREE.sRGBEncoding\n/* PCFSoftShadowMap */')
            assert.ok(/\boutputEncoding\b/.test(sample))
            assert.ok(/\bsRGBEncoding\b/.test(sample))
            assert.ok(!/\bPCFSoftShadowMap\b/.test(sample))
        })

    })

    describe('R03 本套件呼叫之three與camera-controls生命週期API仍存在', function() {

        it('WebGLRenderer建構式存在(實例之dispose/forceContextLoss/setSize/render於e2e-render-smoke之真WebGL環境驗證)', function() {
            //WebGLRenderer之方法於建構時掛為實例屬性且需WebGL context, Node無WebGL, 故此處只確認類別存在, 實例行為見test/e2e-render-smoke.test.mjs R07
            assert.strictEqual(typeof THREE.WebGLRenderer, 'function')
        })

        it('THREE.Timer可update/getDelta/dispose', function() {
            let tm = new THREE.Timer()
            tm.update()
            assert.strictEqual(typeof tm.getDelta(), 'number')
            tm.dispose()
        })

        it('Raycaster, Fog, PerspectiveCamera, OrthographicCamera, MOUSE存在', function() {
            for (let k of ['Raycaster', 'Fog', 'PerspectiveCamera', 'OrthographicCamera', 'Color', 'Group']) {
                assert.strictEqual(typeof THREE[k], 'function', `THREE.${k}`)
            }
            assert.ok(THREE.MOUSE && 'ROTATE' in THREE.MOUSE && 'DOLLY' in THREE.MOUSE && 'PAN' in THREE.MOUSE)
        })

        it('CameraControls.install({THREE})可執行, CSS2DObject與STLLoader可由three/addons載入', function() {
            CameraControls.install({ THREE })
            assert.strictEqual(typeof CameraControls, 'function')
            assert.strictEqual(typeof CSS2DObject, 'function')
            assert.strictEqual(typeof STLLoader, 'function')
        })

    })

    describe('R04 場景元件建立與釋放(不需WebGL)', function() {

        it('createLightPoints: 位置/強度/衰減/可見性, disposeLightPoints後自場景移除', function() {
            let scene = createScene()
            let lps = createLightPoints(scene, {
                useLightPoint: true,
                lightPointPoss: [[1, 2, 3], [4, 5, 6]],
                lightPointColor: 'rgba(255, 0, 0, 1)',
                lightPointIntensity: 2.5,
                lightPointDistance: 100,
                lightPointDecay: 1.5,
            })
            assert.strictEqual(lps.length, 2)
            assert.strictEqual(scene.children.length, 2)
            assert.deepStrictEqual(lps[1].position.toArray(), [4, 5, 6])
            assert.strictEqual(lps[0].intensity, 2.5)
            assert.strictEqual(lps[0].distance, 100)
            assert.strictEqual(lps[0].decay, 1.5)
            assert.strictEqual(lps[0].color.getHex(), 0xff0000)
            assert.strictEqual(lps[0].visible, true)
            disposeLightPoints(scene, lps)
            assert.strictEqual(scene.children.length, 0)
        })

        it('createLightDirection: 位置/強度/顏色/可見性, dispose後自場景移除', function() {
            let scene = createScene()
            let ld = createLightDirection(scene, {
                useLightDirection: false,
                lightDirectionPos: [10, 20, 30],
                lightDirectionColor: '#00ff00',
                lightDirectionIntensity: 0.7,
            })
            assert.deepStrictEqual(ld.position.toArray(), [10, 20, 30])
            assert.strictEqual(ld.intensity, 0.7)
            assert.strictEqual(ld.color.getHex(), 0x00ff00)
            assert.strictEqual(ld.visible, false)
            assert.strictEqual(scene.children.length, 1)
            disposeLightDirection(scene, ld)
            assert.strictEqual(scene.children.length, 0)
        })

        it('createLightAmbient: 顏色/可見性, dispose後自場景移除', function() {
            let scene = createScene()
            let la = createLightAmbient(scene, { useLightAmbient: true, lightAmbientColor: '#0000ff' })
            assert.strictEqual(la.color.getHex(), 0x0000ff)
            assert.strictEqual(la.visible, true)
            disposeLightAmbient(scene, la)
            assert.strictEqual(scene.children.length, 0)
        })

        it('createHelperAxes: 軸長依helperAxesLengthRatio, dispose後自場景移除', function() {
            let scene = createScene()
            let ha = createHelperAxes(scene, { useHelperAxes: true, helperAxesLengthRatio: 100 })
            ha.geometry.computeBoundingBox()
            assert.deepStrictEqual(ha.geometry.boundingBox.max.toArray(), [100, 100, 100])
            assert.deepStrictEqual(ha.geometry.boundingBox.min.toArray(), [0, 0, 0])
            disposeHelperAxes(scene, ha)
            assert.strictEqual(scene.children.length, 0)
        })

        it('createHelperGrid: 範圍依helperGridLengthRatio, 已轉至XY平面並平移至helperGridPositionRatioZ, dispose後自場景移除', function() {
            let scene = createScene()
            let hg = createHelperGrid(scene, { useHelperGrid: true, helperGridLengthRatio: 200, helperGridDensity: 10, helperGridPositionRatioZ: -30 })
            hg.geometry.computeBoundingBox()
            let bb = hg.geometry.boundingBox
            assert.ok(Math.abs(bb.max.x - 100) < 1e-6 && Math.abs(bb.min.x + 100) < 1e-6)
            assert.ok(Math.abs(bb.max.y - 100) < 1e-6 && Math.abs(bb.min.y + 100) < 1e-6)
            assert.ok(Math.abs(bb.max.z + 30) < 1e-6 && Math.abs(bb.min.z + 30) < 1e-6)
            disposeHelperGrid(scene, hg)
            assert.strictEqual(scene.children.length, 0)
        })

        it('createLine: 端點座標/透明度, disposeLine後自場景移除', function() {
            let scene = createScene()
            let o = createLine(scene, 0, 0, 0, 1, 2, 3, { color: 'rgba(255, 0, 0, 0.5)', width: 2 })
            assert.deepStrictEqual(Array.from(o.geometry.getAttribute('position').array), [0, 0, 0, 1, 2, 3])
            assert.strictEqual(o.material.transparent, true)
            assert.strictEqual(o.material.opacity, 0.5)
            assert.strictEqual(o.material.color.getHex(), 0xff0000)
            assert.strictEqual(scene.children.length, 1)
            disposeLine(scene, o)
            assert.strictEqual(scene.children.length, 0)
        })

        it('disposeGroup: 釋放子mesh之geometry與material並自場景移除', function() {
            let scene = createScene()
            let group = createGroup(scene)
            let geometry = new THREE.BoxGeometry(1, 1, 1)
            let material = new THREE.MeshLambertMaterial({ color: 0xffffff })
            let nGeo = 0
            let nMat = 0
            geometry.addEventListener('dispose', () => nGeo++)
            material.addEventListener('dispose', () => nMat++)
            group.add(new THREE.Mesh(geometry, material))
            assert.strictEqual(scene.children.length, 1)
            disposeGroup(scene, group)
            assert.strictEqual(nGeo, 1)
            assert.strictEqual(nMat, 1)
            assert.strictEqual(scene.children.length, 0)
        })

        it('disposeScene: 釋放場景內mesh之geometry與material, 並呼叫光源dispose不拋錯', function() {
            let scene = createScene()
            let geometry = new THREE.BoxGeometry(1, 1, 1)
            let material = new THREE.MeshLambertMaterial({ color: 0xffffff })
            let nGeo = 0
            let nMat = 0
            geometry.addEventListener('dispose', () => nGeo++)
            material.addEventListener('dispose', () => nMat++)
            scene.add(new THREE.Mesh(geometry, material))
            createLightAmbient(scene, { useLightAmbient: true, lightAmbientColor: '#fff' })
            createLightDirection(scene, { useLightDirection: true, lightDirectionPos: [1, 1, 1], lightDirectionColor: '#fff', lightDirectionIntensity: 1 })
            createLightPoints(scene, { useLightPoint: true, lightPointPoss: [[0, 0, 0]], lightPointColor: '#fff', lightPointIntensity: 1, lightPointDistance: 0, lightPointDecay: 2 })
            disposeScene(scene)
            assert.strictEqual(nGeo, 1)
            assert.strictEqual(nMat, 1)
        })

    })

    describe('R05 STL載入: addStl(three STLLoader)', function() {

        //二進位STL: 80位元組標頭 + uint32三角形數 + 每三角形(法向3f + 頂點9f + uint16屬性)=50位元組; 兩個三角形組成XY平面上之2x3方形
        let makeStl = () => {
            let tris = [
                [[0, 0, 0], [2, 0, 0], [2, 3, 0]],
                [[0, 0, 0], [2, 3, 0], [0, 3, 0]],
            ]
            let buf = Buffer.alloc(80 + 4 + 50 * tris.length)
            buf.writeUInt32LE(tris.length, 80)
            tris.forEach((tri, i) => {
                let o = 84 + 50 * i
                let vals = [0, 0, 1, ...tri[0], ...tri[1], ...tri[2]]
                vals.forEach((v, j) => buf.writeFloatLE(v, o + 4 * j))
            })
            return buf
        }

        let server = null
        let url = ''

        before(async function() {
            let buf = makeStl()
            server = http.createServer((req, res) => {
                res.setHeader('content-type', 'application/octet-stream')
                res.end(buf)
            })
            await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
            url = `http://127.0.0.1:${server.address().port}/x.stl`
        })

        after(async function() {
            await new Promise((resolve) => server.close(resolve))
        })

        it('STLLoader.parse解析二進位STL: 6個頂點、包圍盒為2x3x0', function() {
            let geometry = new STLLoader().parse(makeStl().buffer.slice(0))
            assert.strictEqual(geometry.getAttribute('position').count, 6)
            geometry.computeBoundingBox()
            assert.deepStrictEqual(geometry.boundingBox.max.toArray(), [2, 3, 0])
            assert.deepStrictEqual(geometry.boundingBox.min.toArray(), [0, 0, 0])
        })

        it('addStl: 由URL載入, 回傳雙面MeshLambertMaterial之Mesh, 顏色依rgba字串, 補齊包圍盒', async function() {
            let evs = []
            let ev = { emit: (name, msg) => evs.push([name, msg]) }
            let mesh = await addStl(ev, url, { color: 'rgba(214, 92, 92, 0.9)' })
            assert.ok(mesh.isMesh)
            assert.strictEqual(mesh.material.isMeshLambertMaterial, true)
            assert.strictEqual(mesh.material.side, THREE.DoubleSide)
            assert.strictEqual(mesh.material.color.getHex(), 0xd65c5c)
            assert.strictEqual(mesh.material.transparent, false)
            assert.strictEqual(mesh.material.opacity, 1)
            assert.strictEqual(mesh.geometry.getAttribute('position').count, 6)
            assert.deepStrictEqual(mesh.geometry.boundingBox.max.toArray(), [2, 3, 0])
            assert.ok(mesh.geometry.boundingSphere.radius > 0)
            assert.ok(evs.every(([name]) => name === 'prog'))
        })

        it('addStl: opacity<1時transparent為true', async function() {
            let mesh = await addStl({ emit: () => {} }, url, { color: '#fff', opacity: 0.4 })
            assert.strictEqual(mesh.material.transparent, true)
            assert.strictEqual(mesh.material.opacity, 0.4)
        })

    })

    describe('R06 VTP載入: @kitware/vtk.js XMLPolyDataReader與TriangleFilter轉BufferGeometry', function() {

        //一個四邊形(0,1,2,3)與一個三角形(0,1,4), 點5個; 三角化後應得3個三角形(索引9個), 包圍盒為[0,0,0]~[1,1,1]
        let pts = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0.5, 0.5, 1]
        let conn = [0, 1, 2, 3, 0, 1, 4]
        let offs = [4, 7]

        let asciiVtp = `<?xml version="1.0"?>
<VTKFile type="PolyData" version="0.1" byte_order="LittleEndian">
  <PolyData>
    <Piece NumberOfPoints="5" NumberOfVerts="0" NumberOfLines="0" NumberOfStrips="0" NumberOfPolys="2">
      <Points>
        <DataArray type="Float32" NumberOfComponents="3" format="ascii">${pts.join(' ')}</DataArray>
      </Points>
      <Polys>
        <DataArray type="Int32" Name="connectivity" format="ascii">${conn.join(' ')}</DataArray>
        <DataArray type="Int32" Name="offsets" format="ascii">${offs.join(' ')}</DataArray>
      </Polys>
    </Piece>
  </PolyData>
</VTKFile>
`

        //VTK未壓縮binary: 每個DataArray內容為base64(UInt32位元組數標頭 + 原始資料)
        let b64 = (ta) => {
            let u8 = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength)
            let all = new Uint8Array(4 + u8.byteLength)
            all.set(new Uint8Array(new Uint32Array([u8.byteLength]).buffer), 0)
            all.set(u8, 4)
            return Buffer.from(all).toString('base64')
        }
        let binaryVtp = `<?xml version="1.0"?>
<VTKFile type="PolyData" version="0.1" byte_order="LittleEndian" header_type="UInt32">
  <PolyData>
    <Piece NumberOfPoints="5" NumberOfVerts="0" NumberOfLines="0" NumberOfStrips="0" NumberOfPolys="2">
      <Points>
        <DataArray type="Float32" NumberOfComponents="3" format="binary">${b64(new Float32Array(pts))}</DataArray>
      </Points>
      <Polys>
        <DataArray type="Int32" Name="connectivity" format="binary">${b64(new Int32Array(conn))}</DataArray>
        <DataArray type="Int32" Name="offsets" format="binary">${b64(new Int32Array(offs))}</DataArray>
      </Polys>
    </Piece>
  </PolyData>
</VTKFile>
`

        let toAb = (s) => {
            return new TextEncoder().encode(s).buffer
        }

        let verify = (geometry) => {
            let pos = geometry.getAttribute('position')
            let idx = geometry.getIndex()
            assert.strictEqual(idx.count, 9, '四邊形+三角形應三角化為3個三角形')
            assert.ok(Array.from(idx.array).every((i) => i >= 0 && i < pos.count), '索引須在頂點範圍內')
            assert.strictEqual(geometry.getAttribute('normal').count, pos.count)
            assert.deepStrictEqual(geometry.boundingBox.min.toArray(), [0, 0, 0])
            assert.deepStrictEqual(geometry.boundingBox.max.toArray(), [1, 1, 1])
            assert.ok(geometry.boundingSphere.radius > 0)
        }

        it('ASCII VTP: 解析並三角化', function() {
            let polyData = parseVtpArrayBuffer(toAb(asciiVtp))
            assert.deepStrictEqual(Array.from(polyData.getPoints().getData()), pts)
            assert.deepStrictEqual(Array.from(polyData.getPolys().getData()), [4, 0, 1, 2, 3, 3, 0, 1, 4])
            verify(vtkPolyDataToBufferGeometry(polyData))
        })

        it('binary(base64) VTP: 解析結果與ASCII相同', function() {
            let polyData = parseVtpArrayBuffer(toAb(binaryVtp))
            assert.deepStrictEqual(Array.from(polyData.getPoints().getData()), pts)
            assert.deepStrictEqual(Array.from(polyData.getPolys().getData()), [4, 0, 1, 2, 3, 3, 0, 1, 4])
            verify(vtkPolyDataToBufferGeometry(polyData))
        })

        it('parseVtpArrayBuffer接受TypedArray視圖', function() {
            let u8 = new TextEncoder().encode(asciiVtp)
            let polyData = parseVtpArrayBuffer(u8)
            verify(vtkPolyDataToBufferGeometry(polyData))
        })

        it('vtkCellArrayToIndices: 三角形直接輸出, 多邊形扇形展開, 少於3點之cell略過', function() {
            assert.deepStrictEqual(vtkCellArrayToIndices([3, 0, 1, 2]), [0, 1, 2])
            assert.deepStrictEqual(vtkCellArrayToIndices([4, 0, 1, 2, 3]), [0, 1, 2, 0, 2, 3])
            assert.deepStrictEqual(vtkCellArrayToIndices([2, 7, 8, 3, 0, 1, 2]), [0, 1, 2])
        })

        it('無點或無多邊形之VTP: 拋出明確錯誤', function() {
            let noPoly = asciiVtp
                .replace('NumberOfPolys="2"', 'NumberOfPolys="0"')
                .replace(/<Polys>[\s\S]*<\/Polys>/, '')
            assert.throws(() => vtkPolyDataToBufferGeometry(parseVtpArrayBuffer(toAb(noPoly))), /^Error: vtp has no (points|polygon) data$/)
        })

        it('非ArrayBuffer/TypedArray輸入: 拋出明確錯誤', function() {
            assert.throws(() => parseVtpArrayBuffer('x'), /invalid vtp data/)
        })

    })

})
