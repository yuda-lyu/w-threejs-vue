import get from 'lodash-es/get'
import set from 'lodash-es/set'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import isEqual from 'lodash-es/isEqual'
import isNumber from 'lodash-es/isNumber'
import evem from 'wsemi/src/evem.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isEle from 'wsemi/src/isEle.mjs'
import delay from 'wsemi/src/delay.mjs'
import pmSeries from 'wsemi/src/pmSeries.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import oc from 'wsemi/src/color.mjs'
import domRemove from 'wsemi/src/domRemove.mjs'
import getFileNameExt from 'wsemi/src/getFileNameExt.mjs'
import * as THREE from 'three'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import CameraControls from 'camera-controls'
import addStl from './addStl.mjs'
import getCsrdFromMeshs from './getCsrdFromMeshs.mjs'


let toRad = Math.PI / 180
let toDeg = 180 / Math.PI


let nc = (c) => {
    c = oc.toRgbString(c)
    return c
}


async function plot3d(items, opt = {}) {

    //如果是多个网格模型组成一个模型对象，分别去平移每个网格模型对应的几何体可能比较麻烦，对于这种情况也可以给该模型对象嵌套一个父对象，然后把该模型对象相对于父对象平移一定距离，然后旋转该模型的父对象，不旋转模型本身，可以看到该模型的旋转效果，视觉效果上旋转轴改变了。
    //http://www.yanhuangxueyuan.com/doc/Three.js/translateAxis.html

    //有使用labels時OrbitControls得使用rendererLabels.domElement掛載, 否則會失去監聽無法操作
    //https://blog.csdn.net/weixin_41111068/article/details/83650977

    //How to completely clean up a Three.js scene
    //https://discourse.threejs.org/t/when-to-dispose-how-to-completely-clean-up-a-three-js-scene/1549/10

    //In general, attributes are freed if you call dispose() on the respective geometry object. However, if attributes needs to be replaced, it could be indeed a source of a memory leak because there it’s not possible so far to selectively free a single buffer attribute.
    //https://discourse.threejs.org/t/disposal-of-buffers-colors-vectors-etc/13094

    //MeshPhysicalMaterial清漆层
    //https://www.mvrlink.com/threejs-meshphysicalmaterial-clearcoat-layer/

    //check
    if (!isearr(items)) {
        items = []
    }

    //domPanel
    let domPanel = get(opt, 'domPanel')
    if (!isEle(domPanel)) {
        domPanel = document.body
        // console.log('domPanel use document.body')
    }

    let gs = (ele) => {
        let w = 0
        if (isNumber(ele.innerWidth)) {
            w = ele.innerWidth
        }
        else if (isNumber(ele.clientWidth)) {
            w = ele.clientWidth
        }
        else {
            console.log('ele', ele)
            throw new Error(`can not get width from ele`)
        }
        let h = 0
        if (isNumber(ele.innerWidth)) {
            h = ele.innerHeight
        }
        else if (isNumber(ele.clientWidth)) {
            h = ele.clientHeight
        }
        else {
            console.log('ele', ele)
            throw new Error(`can not get height from ele`)
        }
        return { w, h }
    }

    //rendererWidth, rendererHeight
    let rwh = gs(domPanel)
    let rendererWidth = rwh.w
    let rendererHeight = rwh.h

    //backgroundColor
    let backgroundColor = get(opt, 'backgroundColor')
    if (!isestr(backgroundColor)) {
        backgroundColor = '#222'
    }

    //useHelperAxes
    let useHelperAxes = get(opt, 'useHelperAxes')
    if (!isbol(useHelperAxes)) {
        useHelperAxes = true
    }

    //helperAxesLengthRatio
    let helperAxesLengthRatio = get(opt, 'helperAxesLengthRatio')
    if (!isnum(helperAxesLengthRatio)) {
        helperAxesLengthRatio = 1
    }
    helperAxesLengthRatio = cdbl(helperAxesLengthRatio)

    //useHelperGrid
    let useHelperGrid = get(opt, 'useHelperGrid')
    if (!isbol(useHelperGrid)) {
        useHelperGrid = true
    }

    //helperGridLengthRatio
    let helperGridLengthRatio = get(opt, 'helperGridLengthRatio')
    if (!isnum(helperGridLengthRatio)) {
        helperGridLengthRatio = 5
    }
    helperGridLengthRatio = cdbl(helperGridLengthRatio)

    //helperGridDensity
    let helperGridDensity = get(opt, 'helperGridDensity')
    if (!isnum(helperGridDensity)) {
        helperGridDensity = 50
    }
    helperGridDensity = cdbl(helperGridDensity)

    //helperGridPositionRatioZ
    let helperGridPositionRatioZ = get(opt, 'helperGridPositionRatioZ')
    if (!isnum(helperGridPositionRatioZ)) {
        helperGridPositionRatioZ = -1
    }
    helperGridPositionRatioZ = cdbl(helperGridPositionRatioZ)

    //useLightAmbient
    let useLightAmbient = get(opt, 'useLightAmbient')
    if (!isbol(useLightAmbient)) {
        useLightAmbient = true
    }

    //lightAmbientColor
    let lightAmbientColor = get(opt, 'lightAmbientColor')
    if (!isestr(lightAmbientColor)) {
        lightAmbientColor = '#999'
    }

    //useLightPoint
    let useLightPoint = get(opt, 'useLightPoint')
    if (!isbol(useLightPoint)) {
        useLightPoint = false
    }

    //lightPointPoss
    let lightPointPoss = get(opt, 'lightPointPoss')
    if (!isearr(lightPointPoss)) {
        lightPointPoss = [
            [5, 5, 5],
            [-5, 5, 5],
            [5, -5, 5],
        ]
    }

    //lightPointColor
    let lightPointColor = get(opt, 'lightPointColor')
    if (!isestr(lightPointColor)) {
        lightPointColor = '#fff'
    }

    //lightPointIntensity
    let lightPointIntensity = get(opt, 'lightPointIntensity')
    if (!isnum(lightPointIntensity)) {
        lightPointIntensity = 100
    }
    lightPointIntensity = cdbl(lightPointIntensity)

    //lightPointDistance
    let lightPointDistance = get(opt, 'lightPointDistance')
    if (!isnum(lightPointDistance)) {
        lightPointDistance = 0 //無限遠
    }
    lightPointDistance = cdbl(lightPointDistance)

    //lightPointDecay
    let lightPointDecay = get(opt, 'lightPointDecay')
    if (!isnum(lightPointDecay)) {
        lightPointDecay = 2
    }
    lightPointDecay = cdbl(lightPointDecay)

    //useLightDirection
    let useLightDirection = get(opt, 'useLightDirection')
    if (!isbol(useLightDirection)) {
        useLightDirection = true
    }

    //lightDirectionColor
    let lightDirectionColor = get(opt, 'lightDirectionColor')
    if (!isestr(lightDirectionColor)) {
        lightDirectionColor = '#fff'
    }

    //lightDirectionIntensity
    let lightDirectionIntensity = get(opt, 'lightDirectionIntensity')
    if (!isnum(lightDirectionIntensity)) {
        lightDirectionIntensity = 3
    }
    lightDirectionIntensity = cdbl(lightDirectionIntensity)

    //lightDirectionPos
    let lightDirectionPos = get(opt, 'lightDirectionPos')
    if (!isearr(lightDirectionPos)) {
        lightDirectionPos = [10, 10, 10]
    }

    //cameraType
    let cameraType = get(opt, 'cameraType')
    if (cameraType !== 'perspective' && cameraType !== 'orthographic') {
        cameraType = 'perspective'
    }

    //cameraFov
    let cameraFov = get(opt, 'cameraFov')
    if (!isnum(cameraFov)) {
        cameraFov = 35
    }
    cameraFov = cdbl(cameraFov)

    //cameraNear
    let cameraNear = get(opt, 'cameraNear')
    if (!isnum(cameraNear)) {
        cameraNear = 0.1
    }
    cameraNear = cdbl(cameraNear)

    //cameraFar
    let cameraFar = get(opt, 'cameraFar')
    if (!isnum(cameraFar)) {
        cameraFar = 1000
    }
    cameraFar = cdbl(cameraFar)

    //cameraOrthographicRatio
    let cameraOrthographicRatio = get(opt, 'cameraOrthographicRatio')
    if (!isnum(cameraOrthographicRatio)) {
        cameraOrthographicRatio = 0.5
    }
    cameraOrthographicRatio = cdbl(cameraOrthographicRatio)

    //cameraPos
    let cameraPos = get(opt, 'cameraPos')
    if (!isearr(cameraPos)) {
        cameraPos = [1, 1, 1]
    }

    //cameraAzimuthAngle
    let cameraAzimuthAngle = get(opt, 'cameraAzimuthAngle')
    if (!isnum(cameraAzimuthAngle)) {
        cameraAzimuthAngle = 130
    }
    cameraAzimuthAngle = cdbl(cameraAzimuthAngle)

    //cameraPolarAngle
    let cameraPolarAngle = get(opt, 'cameraPolarAngle')
    if (!isnum(cameraPolarAngle)) {
        cameraPolarAngle = 50
    }
    cameraPolarAngle = cdbl(cameraPolarAngle)

    //labelTextColor
    let labelTextColor = get(opt, 'labelTextColor')
    if (!isestr(labelTextColor)) {
        labelTextColor = '#fff'
    }

    //labelTextFontFamily
    let labelTextFontFamily = get(opt, 'labelTextFontFamily')
    if (!isestr(labelTextFontFamily)) {
        labelTextFontFamily = 'Microsoft JhengHei'
    }

    //labelTextFontSize
    let labelTextFontSize = get(opt, 'labelTextFontSize')
    if (!isestr(labelTextFontSize)) {
        labelTextFontSize = '0.8rem'
    }

    //useAutoRotate
    let useAutoRotate = get(opt, 'useAutoRotate')
    if (!isbol(useAutoRotate)) {
        useAutoRotate = false
    }

    let getUseAutoRotate = () => {
        return useAutoRotate
    }

    let setUseAutoRotate = (b) => {
        useAutoRotate = b
    }

    //autoRotateDeg
    let autoRotateDeg = get(opt, 'autoRotateDeg')
    if (!isnum(autoRotateDeg)) {
        autoRotateDeg = 20
    }
    autoRotateDeg = cdbl(autoRotateDeg)

    let setAutoRotateDeg = (r) => {
        autoRotateDeg = r
    }

    //ev
    let ev = evem()

    //clock
    let clock = new THREE.Clock()
    // console.log('clock',clock)

    //scene
    let scene = new THREE.Scene()
    let disposeScene = () => {
        let cleanMaterial = (material) => { //已預先執行多種dispose, 此函數暫時用不到
            // console.log('dispose material')
            material.dispose()
            // dispose textures
            for (let key of Object.keys(material)) {
                let value = material[key]
                if (value && typeof value === 'object' && 'minFilter' in value) {
                    // console.log('dispose texture')
                    value.dispose()
                }
            }
        }
        scene.traverse(object => {
            // console.log('object', object)
            if (object.isLight) {
                // console.log('dispose light')
                object.dispose()
            }
            if (object.isMesh) {
                // console.log('dispose geometry')
                object.geometry.dispose()
                if (object.material.isMaterial) {
                    cleanMaterial(object.material)
                }
                else {
                    // an array of materials
                    for (let material of object.material) cleanMaterial(material)
                }
            }
        })
        scene = null
    }

    //backgroundColor
    scene.background = new THREE.Color(nc(backgroundColor))

    let setBackgroundColor = (c) => {
        backgroundColor = c
        scene.background = new THREE.Color(nc(c))
        render()
    }

    //helperAxes
    let helperAxes = null
    let createHelperAxes = () => {
        helperAxes = new THREE.AxesHelper(helperAxesLengthRatio)
        helperAxes.visible = useHelperAxes
        scene.add(helperAxes)
    }
    let disposeHelperAxes = () => {
        scene.remove(helperAxes)
        helperAxes.dispose()
        helperAxes = null
    }
    createHelperAxes()

    let getUseHelperAxes = () => {
        return useHelperAxes
    }

    let setUseHelperAxes = (b) => {
        useHelperAxes = b
        helperAxes.visible = b
        render()
    }

    let setHelperAxesLengthRatio = (r) => {
        //因無直接設定AxesHelper size函數, 故使用重產
        helperAxesLengthRatio = r
        disposeHelperAxes()
        createHelperAxes()
        render()
    }

    //helperGrid
    let helperGrid = null
    let createHelperGrid = () => {
        helperGrid = new THREE.GridHelper(helperGridLengthRatio, helperGridDensity)
        helperGrid.visible = useHelperGrid
        helperGrid.geometry.rotateX(Math.PI * 0.5)
        helperGrid.geometry.translate(0, 0, helperGridPositionRatioZ)
        scene.add(helperGrid)
    }
    let disposeHelperGrid = () => {
        scene.remove(helperGrid)
        helperGrid.dispose()
        helperGrid = null
    }
    createHelperGrid()

    let getUseHelperGrid = () => {
        return useHelperGrid
    }

    let setUseHelperGrid = (b) => {
        useHelperGrid = b
        helperGrid.visible = b
        render()
    }

    let setHelperGridLengthRatio = (r) => {
        helperGridLengthRatio = r
        disposeHelperGrid()
        createHelperGrid()
        render()
    }

    let setHelperGridDensity = (r) => {
        helperGridDensity = r
        disposeHelperGrid()
        createHelperGrid()
        render()
    }

    let setHelperGridPositionRatioZ = (r) => {
        helperGridPositionRatioZ = r
        disposeHelperGrid()
        createHelperGrid()
        render()
    }

    // //fog
    // let fogColor='#aaa'
    // let fog = new THREE.Fog( nc(fogColor) , 0, 3 )
    // scene.fog = fog

    //lightAmbient
    let lightAmbient = null
    let createLightAmbient = () => {
        lightAmbient = new THREE.AmbientLight(nc(lightAmbientColor))
        lightAmbient.visible = useLightAmbient
        scene.add(lightAmbient)
    }
    let disposeLightAmbient = () => {
        scene.remove(lightAmbient)
        lightAmbient.dispose()
        lightAmbient = null
    }
    createLightAmbient()

    let setUseLightAmbient = (b) => {
        useLightAmbient = b
        lightAmbient.visible = b
        render()
    }

    let setLightAmbientColor = (c) => {
        lightAmbientColor = c
        lightAmbient.color = new THREE.Color(nc(c))
        render()
    }

    //lightPoint
    let lightPoints = null
    let createLightPoints = () => {
        lightPoints = []
        each(lightPointPoss, (lp) => {
            let lightPoint = new THREE.PointLight(nc(lightPointColor), lightPointIntensity, lightPointDistance, lightPointDecay)
            lightPoint.visible = useLightPoint
            let x = get(lp, 0, 0)
            let y = get(lp, 1, 0)
            let z = get(lp, 2, 0)
            lightPoint.position.set(x, y, z)
            scene.add(lightPoint)
            lightPoints.push(lightPoint)
        })
    }
    let disposeLightPoints = () => {
        each(lightPoints, (lightPoint) => {
            scene.remove(lightPoint)
            lightPoint.dispose()
            lightPoint = null
        })
        lightPoints = null
    }
    createLightPoints()

    let setUseLightPoint = (b) => {
        useLightPoint = b
        each(lightPoints, (lightPoint) => {
            lightPoint.visible = b
        })
        render()
    }

    let setLightPointPoss = (poss) => {
        lightPointPoss = poss
        disposeLightPoints()
        createLightPoints()
        render()
    }

    let setLightPointColor = (c) => {
        lightPointColor = c
        disposeLightPoints()
        createLightPoints()
        render()
    }

    let setLightPointIntensity = (r) => {
        lightPointIntensity = r
        disposeLightPoints()
        createLightPoints()
        render()
    }

    let setLightPointDistance = (r) => {
        lightPointDistance = r
        disposeLightPoints()
        createLightPoints()
        render()
    }

    let setLightPointDecay = (r) => {
        lightPointDecay = r
        disposeLightPoints()
        createLightPoints()
        render()
    }

    //lightDirection
    let lightDirection = null
    let createLightDirection = () => {
        lightDirection = new THREE.DirectionalLight(nc(lightDirectionColor), lightDirectionIntensity)
        lightDirection.visible = useLightDirection
        let x = get(lightDirectionPos, 0, 0)
        let y = get(lightDirectionPos, 1, 0)
        let z = get(lightDirectionPos, 2, 0)
        lightDirection.position.set(x, y, z)
        // lightDirection.castShadow = true
        scene.add(lightDirection)
    }
    let disposeLightDirection = () => {
        scene.remove(lightDirection)
        lightDirection.dispose()
        lightDirection = null

    }
    createLightDirection()

    let setUseLightDirection = (b) => {
        useLightDirection = b
        lightDirection.visible = b
        render()
    }

    let setLightDirectionColor = (c) => {
        lightDirectionColor = c
        lightDirection.color = new THREE.Color(nc(c))
        render()
    }

    let setLightDirectionIntensity = (r) => {
        lightDirectionIntensity = r
        disposeLightDirection()
        createLightDirection()
        render()
    }

    let setLightDirectionPos = (pos) => {
        lightDirectionPos = pos
        disposeLightDirection()
        createLightDirection()
        render()
    }

    let gasp = (w, h) => {
        let r = 1
        if (h > 0) {
            r = w / h
        }
        // console.log('gasp', 'w', w, 'h', h, 'r', r)
        return r
    }

    //cameraAspect
    let cameraAspect = gasp(rendererWidth, rendererHeight)

    //camera
    let camera = null
    let createPerspectiveCamera = () => {
        camera = new THREE.PerspectiveCamera(
            cameraFov, //攝像機視錐體垂直視野角度
            cameraAspect, //攝像機視錐體長寬比
            cameraNear, //攝像機視錐體近端面
            cameraFar, //攝像機視錐體遠端面
        )
    }
    let createOrthographicCamera = () => {
        let s = cameraOrthographicRatio
        camera = new THREE.OrthographicCamera(
            -s * cameraAspect, // left: 攝像機視錐體左側面
            s * cameraAspect, // right: 攝像機視錐體右側面
            s, // top: 攝像機視錐體上側面
            -s, // bottom : 攝像機視錐體下側面
            cameraNear, //攝像機視錐體近端面
            cameraFar, //攝像機視錐體遠端面
        )
    }
    let viewCenter = () => {

        let setViewYShiftRatio = (yShiftRatio) => {
            let yDiff = yShiftRatio * rendererHeight
            let fullWidth = rendererWidth
            let fullHeight = rendererHeight - yDiff
            let widthOffset = 0
            let heightOffset = -yDiff
            let viewWidth = rendererWidth
            let viewHeight = rendererHeight
            camera.setViewOffset(fullWidth, fullHeight, widthOffset, heightOffset, viewWidth, viewHeight)
        }

        // setViewYShiftRatio(-1, 0, 0, 0) //平移模型中心(旋轉中心)至panel頂部
        setViewYShiftRatio(-0.08, 0, 0, 0) //視區中心稍微往上

    }
    let setCameraPosCore = (pos) => {
        let x = get(pos, 0, 0)
        let y = get(pos, 1, 0)
        let z = get(pos, 2, 0)
        camera.position.set(x, y, z) //旋轉物件面向世界空間中的一個點
    }
    let createCamera = () => {

        //create
        if (cameraType === 'perspective') {
            createPerspectiveCamera()
        }
        else if (cameraType === 'orthographic') {
            createOrthographicCamera()
        }

        //setCameraPosCore
        setCameraPosCore(cameraPos)

        //camera的z軸朝上
        camera.up.x = 0
        camera.up.y = 0
        camera.up.z = 1

        //viewCenter
        viewCenter()

    }
    let disposeCamera = () => {
        camera = null
    }
    createCamera()

    let getCameraType = () => {
        return cameraType
    }

    let setCameraType = (c) => {
        cameraType = c
        disposeCamera() //camera無dispose
        createCamera()
        //因controls須由camera產生, 故變更camera也得要重產controls
        disposeControls()
        createControls()
        render()
    }

    // let setCameraPos = (pos) => { //不提供直接修改camera position, 外部改變視角須改變azimuthAngle或polarAngle
    //     cameraPos = pos
    //     setCameraPosCore(pos)
    //     render()
    // }

    let setCameraFov = (r) => {
        cameraFov = r
        camera.fov = r
        camera.updateProjectionMatrix()
        render()
    }

    let setCameraNear = (r) => {
        cameraNear = r
        camera.near = r
        camera.updateProjectionMatrix()
        render()
    }

    let setCameraFar = (r) => {
        cameraFar = r
        camera.far = r
        camera.updateProjectionMatrix()
        render()
    }

    let setCameraOrthographicRatio = (r) => {
        cameraOrthographicRatio = r
        disposeCamera() //camera無dispose
        createCamera()
        //因controls須由camera產生, 故變更camera也得要重產controls
        disposeControls()
        createControls()
        render()
    }

    //renderer
    let renderer = new THREE.WebGLRenderer({
        antialias: true,
    })
    renderer.setSize(rendererWidth, rendererHeight)
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 2.2;
    // renderer.physicallyCorrectLights = true;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    domPanel.appendChild(renderer.domElement)

    //rendererLabels
    let rendererLabels = new CSS2DRenderer()
    rendererLabels.setSize(rendererWidth, rendererHeight)
    rendererLabels.domElement.style.position = 'absolute'
    rendererLabels.domElement.style.top = '0px'
    rendererLabels.domElement.style.left = '0px'
    domPanel.appendChild(rendererLabels.domElement)

    //controls
    CameraControls.install({ THREE })
    let controls = null
    let createControls = () => {

        //CameraControls
        controls = new CameraControls(camera, rendererLabels.domElement)

        //controls
        // // controls.target.set( 0, 0, -0.1 )
        // // controls.enableDamping = true
        // controls.enablePan=true //平移
        // controls.enableRotate=true //旋轉
        // controls.enableZoom=true //縮放
        // // controls.autoRotate=true //自動旋轉
        // // controls.screenSpacePanning=false
        // controls.zoomToCursor=true //針對滑鼠位置zoom
        controls.mouseButtons = { //PAN ROTATE DOLLY

            //鍵名大寫為OrbitControls使用
            // LEFT: THREE.MOUSE.PAN,
            // MIDDLE: THREE.MOUSE.DOLLY,
            // RIGHT: THREE.MOUSE.ROTATE,

            //鍵名小寫為CameraControls使用
            left: CameraControls.ACTION.ROTATE,
            middle: CameraControls.ACTION.DOLLY,
            right: CameraControls.ACTION.OFFSET,
            wheel: CameraControls.ACTION.ZOOM,

        }
        controls.touches = {

            //鍵名小寫為CameraControls使用
            one: CameraControls.ACTION.TOUCH_ROTATE,
            two: CameraControls.ACTION.TOUCH_DOLLY_OFFSET,
            three: CameraControls.ACTION.TOUCH_OFFSET,

        }

    }
    let disposeControls = () => {
        controls = null
    }
    createControls()

    let getCameraViewAngle = () => {
        let az = get(controls, 'azimuthAngle')
        let polar = get(controls, 'polarAngle')
        return {
            azimuthAngle: az * toDeg,
            polarAngle: polar * toDeg,
        }
    }

    let setCameraViewAngle = (az, polar) => {
        set(controls, 'azimuthAngle', az * toRad)
        set(controls, 'polarAngle', polar * toRad)
    }

    //dollyTo( distance, enableTransition )
    //zoomTo( zoom, enableTransition )

    let iniCameraViewAngle = () => {
        setCameraViewAngle(cameraAzimuthAngle, cameraPolarAngle)
    }
    iniCameraViewAngle()

    let setCameraAzimuthAngle = (r) => {
        cameraAzimuthAngle = r
        setCameraViewAngle(cameraAzimuthAngle, cameraPolarAngle)
    }

    let setCameraPolarAngle = (r) => {
        cameraPolarAngle = r
        setCameraViewAngle(cameraAzimuthAngle, cameraPolarAngle)
    }

    let _viewAngle = null //前次viewAngle
    let timer = setInterval(() => { //timer偵測
        let viewAngle = getCameraViewAngle()
        if (!isEqual(viewAngle, _viewAngle)) {
            _viewAngle = viewAngle
            ev.emit('change-view-angle', viewAngle)
        }
    }, 50)

    //group
    let group = null
    let createGroup = () => {
        group = new THREE.Group()
        // each(meshs, (mesh) => {
        //     group.add(mesh)
        // })
        // console.log('group',group)
        scene.add(group)
    }
    let disposeGroup = () => {
        group.traverse(function(obj) {
            if (obj.isMesh) {
                obj.geometry.dispose()
                obj.material.dispose()
            }
        })
        scene.remove(group)
        group = null
    }
    createGroup()

    //meshs
    let meshs = []

    let addMeshCore = async (v) => {

        //type
        let type = get(v, 'type', '')
        if (!isestr(type)) {
            type = getFileNameExt(v.url)
        }
        if (type !== 'stl') {
            throw new Error(`現在僅支援stl檔`)
        }

        //gc, a
        let color = get(v, 'color', '')
        let c = oc.toRgba(color)
        let gc = oc.toRgbString(c)
        let a = c.a
        // console.log('addStl before', c, gc, a)

        //load
        let mesh = await addStl(ev, v.url, {
            color: gc,
            opacity: a,
        })

        //add name and color
        mesh.name = v.name
        mesh.color = color
        // console.log('mesh', mesh)

        //push
        meshs.push(mesh)

        //add
        group.add(mesh)

    }

    let addMeshsCore = async (vs) => {
        await pmSeries(vs, async(v) => {
            await addMeshCore(v)
        })
    }

    await addMeshsCore(items)
    // console.log('first addMeshsCore')

    let addMesh = async (v) => {
        resetTransform()
        disposeLabel()
        await addMeshCore(v)
        rdr()
    }

    let addMeshs = async (vs) => {
        resetTransform()
        disposeLabel()
        await addMeshsCore(vs)
        rdr()
    }

    let getMeshsInfor = () => {
        let rs = map(meshs, (v, ind) => {
            // console.log('ind', v)
            let color = get(v, 'color', '')
            let label = get(labels, ind)
            let labelText = get(label, 'textContent', '')
            let labelTextColor = get(label, 'style.color', '')
            let labelTextFontSize = get(label, 'style.fontSize', '')
            let labelTextFontFamily = get(label, 'style.fontFamily', '')
            return {
                visible: v.visible,
                color,
                labelText,
                labelTextColor,
                labelTextFontSize,
                labelTextFontFamily,
            }
        })
        return rs
    }

    let setMeshVisibleCore = (ind, visible) => {
        let mesh = get(meshs, ind)
        if (!iseobj(mesh)) {
            return null
        }
        try {
            meshs[ind].visible = visible
        }
        catch (err) {
            console.log(err)
        }
    }

    let setMeshVisible = (ind, visible) => {
        setMeshVisibleCore(ind, visible)
        setMeshLabelVisibleCore(ind, visible)
        render()
    }

    let setMeshColor = (ind, color) => {
        let mesh = get(meshs, ind)
        if (!iseobj(mesh)) {
            return null
        }
        try {
            let c = oc.toRgba(color)
            // console.log('color', color)
            // console.log('c', c)
            let gc = oc.toRgbString(c)
            let a = c.a
            // console.log('gc', gc)
            // console.log('a', a)
            meshs[ind].material.color = new THREE.Color(gc)
            meshs[ind].material.opacity = a
            meshs[ind].color = color
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    //csr
    let csr = {}
    let calcCsr = () => {

        //csrd
        let csrd = getCsrdFromMeshs(meshs)
        // console.log('csrd', csrd)

        //cs, r
        let cs = csrd.cs
        let r = 1
        if (csrd.rd > 0) {
            r = 1 / csrd.rd
        }

        //csr
        csr = {
            ...cs,
            r,
        }
        // console.log('csr', csr)

    }

    let calcTransform = () => {
        each(meshs, (mesh) => {
            // console.log('mesh',mesh)
            let geometry = mesh.geometry
            geometry.translate(-csr.x, -csr.y, -csr.z) //先平移
            geometry.scale(csr.r, csr.r, csr.r) //再縮放
        })
    }

    let resetTransform = () => {
        each(meshs, (mesh) => {
            // console.log('mesh',mesh)
            let geometry = mesh.geometry
            let r = 1 / csr.r
            geometry.scale(r, r, r) //先恢復縮放
            geometry.translate(csr.x, csr.y, csr.z) //再恢復平移
        })
    }

    //labels
    let labels = []
    let createLabels = () => {
        each(meshs, (mesh) => {

            //ele
            let ele = document.createElement('div')
            ele.textContent = mesh.name
            ele.style.color = labelTextColor
            ele.style.fontSize = labelTextFontSize
            ele.style.fontFamily = labelTextFontFamily
            // ele.style.display = 'none' //無效
            ele.style.visibility = 'visible' //改用visibility控制顯隱, visible, hidden
            // console.log('ele', ele)

            //cso
            let cso = new CSS2DObject(ele)
            let c = mesh.geometry.boundingSphere.center //get(mesh, 'geometry.boundingSphere.center')
            cso.position.set(c.x, c.y, c.z)
            // console.log('cso',cso)

            //push
            labels.push(ele)

            //add
            mesh.add(cso)

        })
    }
    let disposeLabel = () => {
        each(labels, (ele) => {
            domRemove(ele)
        })
        labels = []
    }

    let rdr = async () => {

        //初始渲染
        render()

        await delay(1)

        //須先等初始渲染後才能取得csr
        calcCsr()

        //須有csr各mesh才能translate與scale
        calcTransform()

        //須mesh已translate與scale才能取得center並給予label座標
        createLabels()

        //更新平移與縮放後渲染
        render()

    }

    let setMeshLabelVisibleCore = (ind, visible) => {
        let label = get(labels, ind)
        if (!isEle(label)) {
            return null
        }
        try {
            //無法用display控制顯隱
            let visibility = 'hidden'
            if (visible === true) {
                visibility = 'visible'
            }
            labels[ind].style.visibility = visibility
        }
        catch (err) {
            console.log(err)
        }
    }

    let setMeshLabelVisible = (ind, visible) => {
        setMeshLabelVisibleCore(ind, visible)
        render()
    }

    let setMeshLabelText = (ind, text) => {
        let label = get(labels, ind)
        if (!isEle(label)) {
            return null
        }
        try {
            labels[ind].textContent = text
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    let setMeshLabelTextColor = (ind, color) => {
        let label = get(labels, ind)
        if (!isEle(label)) {
            return null
        }
        try {
            labels[ind].style.color = color
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    let setMeshLabelTextFontSize = (ind, fontSize) => {
        let label = get(labels, ind)
        if (!isEle(label)) {
            return null
        }
        try {
            labels[ind].style.fontSize = fontSize
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    let setMeshLabelTextFontFamily = (ind, fontFamily) => {
        let label = get(labels, ind)
        if (!isEle(label)) {
            return null
        }
        try {
            labels[ind].style.fontFamily = fontFamily
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    let cleanMeshs = () => {
        each(meshs, (mesh) => {
            group.remove(mesh)
        })
        disposeGroup()
        meshs = []
        createGroup()
        disposeLabel()
        render()
    }

    // let iRender = 0
    let render = () => {
        // iRender++
        // console.log('render', iRender)
        try {
            renderer.render(scene, camera)
            rendererLabels.render(scene, camera)
        }
        catch (err) {
            console.log(err)
        }
    }

    let resize = () => {
        // console.log('resize')

        //rendererWidth, rendererHeight, cameraAspect
        let rwh = gs(domPanel)
        rendererWidth = rwh.w
        rendererHeight = rwh.h
        cameraAspect = gasp(rendererWidth, rendererHeight)
        // console.log('resize rendererWidth', rendererWidth)
        // console.log('resize rendererHeight', rendererHeight)
        // console.log('resize cameraAspect', cameraAspect)

        //update camera
        camera.aspect = cameraAspect
        camera.updateProjectionMatrix()

        //viewCenter
        viewCenter()

        //update renderer
        renderer.setSize(rendererWidth, rendererHeight)
        rendererLabels.setSize(rendererWidth, rendererHeight)

        //render
        render()

    }

    //第1次渲染
    rdr() //非同步驅動, 故不能用await等待
        .then(() => {
            ev.emit('init')
        })

    //stop
    let stop = false

    // let iAnimate = 0
    let animate = () => {
        // iAnimate++
        // console.log('animate', iAnimate)
        if (stop) {
            // console.log('animate stop')
            return
        }
        try {

            //delta
            let delta = clock.getDelta()
            // console.log('delta',delta)

            //hasControlsUpdated
            let hasControlsUpdated = controls.update(delta)
            // console.log('hasControlsUpdated',hasControlsUpdated)

            //useAutoRotate
            if (useAutoRotate) {
                let az = -autoRotateDeg * toRad * delta
                // console.log('az', az)
                controls.azimuthAngle += az
            }

            //requestAnimationFrame
            requestAnimationFrame(animate)

            //check
            if (hasControlsUpdated) {
                // console.log('hasControlsUpdated and render')
                render()
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    //animate
    animate()

    let disposeAll = () => {
        // console.log('disposeAll')

        //emit
        ev.emit('dispose')

        //clearInterval
        clearInterval(timer)

        //stop
        stop = true

        //disposeGroup
        disposeGroup()

        //disposeHelperAxes
        disposeHelperAxes()

        //disposeHelperGrid
        disposeHelperGrid()

        //disposeLightAmbient
        disposeLightAmbient()

        //disposeLightPoints
        disposeLightPoints()

        //disposeLightDirection
        disposeLightDirection()

        // labelDiv=document.querySelector('#labelDiv'); // same beginning
        // allLabelsToDelete=document.querySelectorAll('#labelDiv .label') // takes children of class "label" like in moon-earth example
        // forEach (elem in allLabelsToDelete ) {
        //     labelDiv.removeChild(elem)
        // }

        //disposeLabel
        disposeLabel()

        //disposeScene
        disposeScene()

        //remove
        // console.log('renderer.domElement',renderer.domElement)
        // console.log('rendererLabels.domElement',rendererLabels.domElement)
        // document.body.remove(renderer.domElement)
        // document.body.remove(rendererLabels.domElement)
        // renderer.domElement.remove()
        // rendererLabels.domElement.remove()
        domRemove(renderer.domElement)
        domRemove(rendererLabels.domElement)

        //dispose & free renderer
        renderer.dispose()
        // rendererLabels.dispose()
        renderer = null
        rendererLabels = null

        //free clock
        // clock.dispose()
        clock = null

        //disposeControls
        disposeControls()

        //disposeCamera
        disposeCamera()

        //free scene
        // scene.dispose()
        scene = null

    }

    //save
    ev.render = render
    ev.resize = resize
    ev.dispose = disposeAll

    ev.getUseAutoRotate = getUseAutoRotate
    ev.setUseAutoRotate = setUseAutoRotate
    ev.setAutoRotateDeg = setAutoRotateDeg

    ev.setCameraViewAngle = setCameraViewAngle
    ev.getCameraViewAngle = getCameraViewAngle
    ev.setCameraAzimuthAngle = setCameraAzimuthAngle
    ev.setCameraPolarAngle = setCameraPolarAngle

    ev.setBackgroundColor = setBackgroundColor

    ev.getUseHelperAxes = getUseHelperAxes
    ev.setUseHelperAxes = setUseHelperAxes
    ev.setHelperAxesLengthRatio = setHelperAxesLengthRatio

    ev.getUseHelperGrid = getUseHelperGrid
    ev.setUseHelperGrid = setUseHelperGrid

    ev.setHelperGridLengthRatio = setHelperGridLengthRatio
    ev.setHelperGridDensity = setHelperGridDensity
    ev.setHelperGridPositionRatioZ = setHelperGridPositionRatioZ

    ev.setUseLightAmbient = setUseLightAmbient
    ev.setLightAmbientColor = setLightAmbientColor

    ev.setUseLightPoint = setUseLightPoint
    ev.setLightPointPoss = setLightPointPoss
    ev.setLightPointColor = setLightPointColor
    ev.setLightPointIntensity = setLightPointIntensity
    ev.setLightPointDistance = setLightPointDistance
    ev.setLightPointDecay = setLightPointDecay

    ev.setUseLightDirection = setUseLightDirection
    ev.setLightDirectionColor = setLightDirectionColor
    ev.setLightDirectionIntensity = setLightDirectionIntensity
    ev.setLightDirectionPos = setLightDirectionPos

    ev.getCameraType = getCameraType
    ev.setCameraType = setCameraType
    // ev.setCameraPos = setCameraPos
    ev.setCameraFov = setCameraFov
    ev.setCameraNear = setCameraNear
    ev.setCameraFar = setCameraFar
    ev.setCameraOrthographicRatio = setCameraOrthographicRatio

    ev.addMesh = addMesh
    ev.addMeshs = addMeshs
    ev.getMeshsInfor = getMeshsInfor
    ev.setMeshVisible = setMeshVisible
    ev.setMeshColor = setMeshColor
    ev.setMeshLabelVisible = setMeshLabelVisible
    ev.setMeshLabelText = setMeshLabelText
    ev.setMeshLabelTextColor = setMeshLabelTextColor
    ev.setMeshLabelTextFontSize = setMeshLabelTextFontSize
    ev.setMeshLabelTextFontFamily = setMeshLabelTextFontFamily
    ev.cleanMeshs = cleanMeshs

    return ev
}


export default plot3d
