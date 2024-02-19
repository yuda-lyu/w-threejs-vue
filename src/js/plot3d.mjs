import get from 'lodash-es/get'
import set from 'lodash-es/set'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import size from 'lodash-es/size'
import range from 'lodash-es/range'
import isEqual from 'lodash-es/isEqual'
import isNumber from 'lodash-es/isNumber'
// import cloneDeep from 'lodash-es/cloneDeep'
import evem from 'wsemi/src/evem.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import ispint from 'wsemi/src/ispint.mjs'
import isp0int from 'wsemi/src/isp0int.mjs'
import isEle from 'wsemi/src/isEle.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cint from 'wsemi/src/cint.mjs'
import dig from 'wsemi/src/dig.mjs'
import delay from 'wsemi/src/delay.mjs'
import pmSeries from 'wsemi/src/pmSeries.mjs'
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

    //useBox
    let useBox = get(opt, 'useBox')
    if (!isbol(useBox)) {
        useBox = false //false bbb
    }

    let getUseBox = () => {
        return useBox
    }

    let setUseBox = (b) => {
        useBox = b
        refreshAxis()
    }

    //axisX

    let axisXTitle = get(opt, 'axisXTitle')
    if (!isestr(axisXTitle)) {
        axisXTitle = 'X'
    }

    let axisXTitleColor = get(opt, 'axisXTitleColor')
    if (!isestr(axisXTitleColor)) {
        axisXTitleColor = '#fff'
    }

    let axisXTitleFontSize = get(opt, 'axisXTitleFontSize')
    if (!isestr(axisXTitleFontSize)) {
        axisXTitleFontSize = '1.0rem'
    }

    let axisXTitleFontFamily = get(opt, 'axisXTitleFontFamily')
    if (!isestr(axisXTitleFontFamily)) {
        axisXTitleFontFamily = 'Microsoft JhengHei'
    }

    let axisXTitleDistance = get(opt, 'axisXTitleDistance')
    if (!isnum(axisXTitleDistance)) {
        axisXTitleDistance = 0.22
    }
    axisXTitleDistance = cdbl(axisXTitleDistance)

    let axisXColor = get(opt, 'axisXColor')
    if (!isestr(axisXColor)) {
        axisXColor = '#fff'
    }

    let axisXWidth = get(opt, 'axisXWidth')
    if (!isnum(axisXWidth)) {
        axisXWidth = 1
    }
    axisXWidth = cdbl(axisXWidth)

    let axisXTickColor = get(opt, 'axisXTickColor')
    if (!isestr(axisXTickColor)) {
        axisXTickColor = '#fff'
    }

    let axisXTickwidth = get(opt, 'axisXTickwidth')
    if (!isnum(axisXTickwidth)) {
        axisXTickwidth = 1
    }
    axisXTickwidth = cdbl(axisXTickwidth)

    let axisXTickLength = get(opt, 'axisXTickLength')
    if (!isnum(axisXTickLength)) {
        axisXTickLength = 0.03
    }
    axisXTickLength = cdbl(axisXTickLength)

    let axisXTickNum = get(opt, 'axisXTickNum')
    if (!ispint(axisXTickNum)) {
        axisXTickNum = 11
    }
    axisXTickNum = cint(axisXTickNum)

    let axisXTickIntervalNum = Math.max(axisXTickNum - 1, 1)

    let axisXTickLabelDistance = get(opt, 'axisXTickLabelDistance')
    if (!isnum(axisXTickLabelDistance)) {
        axisXTickLabelDistance = 0.11
    }
    axisXTickLabelDistance = cdbl(axisXTickLabelDistance)

    let axisXTickLabelDig = get(opt, 'axisXTickLabelDig')
    if (!isp0int(axisXTickLabelDig)) {
        axisXTickLabelDig = 0
    }
    axisXTickLabelDig = cint(axisXTickLabelDig)

    let axisXTickLabelColor = get(opt, 'axisXTickLabelColor')
    if (!isestr(axisXTickLabelColor)) {
        axisXTickLabelColor = '#fff'
    }

    let axisXTickLabelFontSize = get(opt, 'axisXTickLabelFontSize')
    if (!isestr(axisXTickLabelFontSize)) {
        axisXTickLabelFontSize = '0.7rem'
    }

    let axisXTickLabelFontFamily = get(opt, 'axisXTickLabelFontFamily')
    if (!isestr(axisXTickLabelFontFamily)) {
        axisXTickLabelFontFamily = 'Microsoft JhengHei'
    }

    //axisY

    let axisYTitle = get(opt, 'axisYTitle')
    if (!isestr(axisYTitle)) {
        axisYTitle = 'Y'
    }

    let axisYTitleColor = get(opt, 'axisYTitleColor')
    if (!isestr(axisYTitleColor)) {
        axisYTitleColor = '#fff'
    }

    let axisYTitleFontSize = get(opt, 'axisYTitleFontSize')
    if (!isestr(axisYTitleFontSize)) {
        axisYTitleFontSize = '1.0rem'
    }

    let axisYTitleFontFamily = get(opt, 'axisYTitleFontFamily')
    if (!isestr(axisYTitleFontFamily)) {
        axisYTitleFontFamily = 'Microsoft JhengHei'
    }

    let axisYTitleDistance = get(opt, 'axisYTitleDistance')
    if (!isnum(axisYTitleDistance)) {
        axisYTitleDistance = 0.22
    }
    axisYTitleDistance = cdbl(axisYTitleDistance)

    let axisYColor = get(opt, 'axisYColor')
    if (!isestr(axisYColor)) {
        axisYColor = '#fff'
    }

    let axisYWidth = get(opt, 'axisYWidth')
    if (!isnum(axisYWidth)) {
        axisYWidth = 1
    }
    axisYWidth = cdbl(axisYWidth)

    let axisYTickColor = get(opt, 'axisYTickColor')
    if (!isestr(axisYTickColor)) {
        axisYTickColor = '#fff'
    }

    let axisYTickwidth = get(opt, 'axisYTickwidth')
    if (!isnum(axisYTickwidth)) {
        axisYTickwidth = 1
    }
    axisYTickwidth = cdbl(axisYTickwidth)

    let axisYTickLength = get(opt, 'axisYTickLength')
    if (!isnum(axisYTickLength)) {
        axisYTickLength = 0.03
    }
    axisYTickLength = cdbl(axisYTickLength)

    let axisYTickNum = get(opt, 'axisYTickNum')
    if (!ispint(axisYTickNum)) {
        axisYTickNum = 11
    }
    axisYTickNum = cint(axisYTickNum)

    let axisYTickIntervalNum = Math.max(axisYTickNum - 1, 1)

    let axisYTickLabelDistance = get(opt, 'axisYTickLabelDistance')
    if (!isnum(axisYTickLabelDistance)) {
        axisYTickLabelDistance = 0.11
    }
    axisYTickLabelDistance = cdbl(axisYTickLabelDistance)

    let axisYTickLabelDig = get(opt, 'axisYTickLabelDig')
    if (!isp0int(axisYTickLabelDig)) {
        axisYTickLabelDig = 0
    }
    axisYTickLabelDig = cint(axisYTickLabelDig)

    let axisYTickLabelColor = get(opt, 'axisYTickLabelColor')
    if (!isestr(axisYTickLabelColor)) {
        axisYTickLabelColor = '#fff'
    }

    let axisYTickLabelFontSize = get(opt, 'axisYTickLabelFontSize')
    if (!isestr(axisYTickLabelFontSize)) {
        axisYTickLabelFontSize = '0.7rem'
    }

    let axisYTickLabelFontFamily = get(opt, 'axisYTickLabelFontFamily')
    if (!isestr(axisYTickLabelFontFamily)) {
        axisYTickLabelFontFamily = 'Microsoft JhengHei'
    }

    //axisZ

    let axisZTitle = get(opt, 'axisZTitle')
    if (!isestr(axisZTitle)) {
        axisZTitle = 'Z'
    }

    let axisZTitleColor = get(opt, 'axisZTitleColor')
    if (!isestr(axisZTitleColor)) {
        axisZTitleColor = '#fff'
    }

    let axisZTitleFontSize = get(opt, 'axisZTitleFontSize')
    if (!isestr(axisZTitleFontSize)) {
        axisZTitleFontSize = '1.0rem'
    }

    let axisZTitleFontFamily = get(opt, 'axisZTitleFontFamily')
    if (!isestr(axisZTitleFontFamily)) {
        axisZTitleFontFamily = 'Microsoft JhengHei'
    }

    let axisZTitleDistance = get(opt, 'axisZTitleDistance')
    if (!isnum(axisZTitleDistance)) {
        axisZTitleDistance = 0.22
    }
    axisZTitleDistance = cdbl(axisZTitleDistance)

    let axisZColor = get(opt, 'axisZColor')
    if (!isestr(axisZColor)) {
        axisZColor = '#fff'
    }

    let axisZWidth = get(opt, 'axisZWidth')
    if (!isnum(axisZWidth)) {
        axisZWidth = 1
    }
    axisZWidth = cdbl(axisZWidth)

    let axisZTickColor = get(opt, 'axisZTickColor')
    if (!isestr(axisZTickColor)) {
        axisZTickColor = '#fff'
    }

    let axisZTickwidth = get(opt, 'axisZTickwidth')
    if (!isnum(axisZTickwidth)) {
        axisZTickwidth = 1
    }
    axisZTickwidth = cdbl(axisZTickwidth)

    let axisZTickLength = get(opt, 'axisZTickLength')
    if (!isnum(axisZTickLength)) {
        axisZTickLength = 0.03
    }
    axisZTickLength = cdbl(axisZTickLength)

    let axisZTickNum = get(opt, 'axisZTickNum')
    if (!ispint(axisZTickNum)) {
        axisZTickNum = 11
    }
    axisZTickNum = cint(axisZTickNum)

    let axisZTickIntervalNum = Math.max(axisZTickNum - 1, 1)

    let axisZTickLabelDistance = get(opt, 'axisZTickLabelDistance')
    if (!isnum(axisZTickLabelDistance)) {
        axisZTickLabelDistance = 0.11
    }
    axisZTickLabelDistance = cdbl(axisZTickLabelDistance)

    let axisZTickLabelDig = get(opt, 'axisZTickLabelDig')
    if (!isp0int(axisZTickLabelDig)) {
        axisZTickLabelDig = 0
    }
    axisZTickLabelDig = cint(axisZTickLabelDig)

    let axisZTickLabelColor = get(opt, 'axisZTickLabelColor')
    if (!isestr(axisZTickLabelColor)) {
        axisZTickLabelColor = '#fff'
    }

    let axisZTickLabelFontSize = get(opt, 'axisZTickLabelFontSize')
    if (!isestr(axisZTickLabelFontSize)) {
        axisZTickLabelFontSize = '0.7rem'
    }

    let axisZTickLabelFontFamily = get(opt, 'axisZTickLabelFontFamily')
    if (!isestr(axisZTickLabelFontFamily)) {
        axisZTickLabelFontFamily = 'Microsoft JhengHei'
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
        az *= toDeg
        polar *= toDeg
        az = az % 360
        if (az < 0) {
            az += 360
        }
        polar = polar % 360
        if (polar < 0) {
            polar += 360
        }
        return {
            azimuthAngle: az,
            polarAngle: polar,
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
            // console.log('viewAngle', viewAngle)

            //update
            _viewAngle = viewAngle

            //autoDisplayAxis
            autoDisplayAxis()

            //更新顯隱座標標題、軸與刻度
            try {
                render() //因使用timer偵測, 故可能發生render尚未創建定義而報錯
            }
            catch (err) {}

            //emit
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

    let createArrow = (x, y, z, dx, dy, dz, opt = {}) => {
        let dir = new THREE.Vector3(dx, dy, dz)
        dir.normalize()
        let origin = new THREE.Vector3(x, y, z)
        let color = get(opt, 'color', '#fff')
        let length = get(opt, 'length', 1)
        let headLength = get(opt, 'headLength', 0.05)
        let headWidth = get(opt, 'headWidth', 0.02)
        let arrowHelper = new THREE.ArrowHelper(dir, origin, length, nc(color), headLength, headWidth)
        return arrowHelper
    }
    let disposeArrow = (arrowHelper) => {
        try {
            scene.remove(arrowHelper)
        }
        catch (err) {}
        try {
            arrowHelper.dispose()
            arrowHelper = null
        }
        catch (err) {}
    }

    let createLine = (x1, y1, z1, x2, y2, z2, opt = {}) => {

        let color = get(opt, 'color', '#fff')
        let width = get(opt, 'width', 1)

        //material
        let material = new THREE.LineBasicMaterial({
            color: nc(color),
            linewidth: width,
        })

        //points
        let points = []
        points.push(new THREE.Vector3(x1, y1, z1))
        points.push(new THREE.Vector3(x2, y2, z2))

        //geometry
        let geometry = new THREE.BufferGeometry().setFromPoints(points)

        //line
        let line = new THREE.Line(geometry, material)

        //add
        scene.add(line)

        return {
            material,
            geometry,
            line,
        }
    }
    let disposeLine = (objLine) => {
        let line = get(objLine, 'line')
        let material = get(objLine, 'material')
        let geometry = get(objLine, 'geometry')
        try {
            scene.remove(line)
        }
        catch (err) {}
        try {
            line.dispose()
            line = null
        }
        catch (err) {}
        try {
            geometry.dispose()
            geometry = null
        }
        catch (err) {}
        try {
            material.dispose()
            material = null
        }
        catch (err) {}
        objLine = null
    }

    let createLines = (vs, opt = {}) => {
        let arrLines = map(vs, (v) => {
            let x1 = get(v, 'x1', 0)
            let y1 = get(v, 'y1', 0)
            let z1 = get(v, 'z1', 0)
            let x2 = get(v, 'x2', 0)
            let y2 = get(v, 'y2', 0)
            let z2 = get(v, 'z2', 0)
            let r = createLabel(x1, y1, z1, x2, y2, z2, opt)
            return r
        })
        return arrLines
    }
    let disposeLines = (arrLines) => {
        each(arrLines, (objLine) => {
            disposeLine(objLine)
        })
        arrLines = []
    }

    let createLabel = (text, x, y, z, opt = {}) => {

        let textColor = get(opt, 'textColor', '#fff')
        let textFontSize = get(opt, 'textFontSize', '0.8rem')
        let textFontFamily = get(opt, 'textFontFamily', 'Microsoft JhengHei')

        //ele
        let ele = document.createElement('div')
        ele.textContent = text
        ele.style.color = textColor
        ele.style.fontSize = textFontSize
        ele.style.fontFamily = textFontFamily
        // ele.style.display = 'none' //無效
        ele.style.visibility = 'visible' //改用visibility控制顯隱, visible, hidden
        // console.log('ele', ele)

        //cso
        let cso = new CSS2DObject(ele) //不須dispose
        cso.position.set(x, y, z)
        // console.log('cso',cso)

        //add
        scene.add(cso)

        return {
            cso,
            ele,
        }
    }
    let disposeLabel = (objLabel) => {
        try {
            let cso = get(objLabel, 'cso')
            scene.remove(cso)
        }
        catch (err) {}
        try {
            let ele = get(objLabel, 'ele')
            domRemove(ele)
        }
        catch (err) {}
        objLabel.cso = null
        objLabel.ele = null
        objLabel = null
    }

    let createLabels = (vs, opt = {}) => {
        let arrLabels = map(vs, (v) => {
            let text = get(v, 'text', '')
            let x = get(v, 'x', 0)
            let y = get(v, 'y', 0)
            let z = get(v, 'z', 0)
            let r = createLabel(text, x, y, z, opt)
            return r
        })
        return arrLabels
    }
    let disposeLabels = (arrLabels) => {
        each(arrLabels, (objLabel) => {
            disposeLabel(objLabel)
        })
        arrLabels = []
    }

    //axis
    let axisLines = []
    let axisLabels = []
    let axisRela = []
    let axisKpRela = {
        axisLines,
        axisLabels,
    }
    let createAxis = () => {

        //check
        if (!useBox) {
            return
        }

        let ts
        let ldxy = [ //x,y軸標題與刻度
            //0: 標題與刻度之平移布林, 代表指定x,y軸位於的基本側與對象側
            //1: x,y向正負向, 代表指定x,y軸刻度之朝向
            //2: x,y與z向, 代表繪製x,y向或z向
            [0, -1, 0],
            [1, 1, 0],
            [0, 0, -1],
            [1, 0, -1],
        ]
        let ldz = [ //z軸標題與刻度
            //0: x向刻度之平移布林
            //1: y向刻度之平移布林
            //2: x向標題之平移布林
            //3: y向標題之平移布林
            [0, 0, -1, -1],
            [1, 0, 1, -1],
            [1, 1, 1, 1],
            [0, 1, -1, 1],
        ]
        let lda = [ //x,y,z軸線
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
        ]

        let genTks = (cx, cy, cz, n, dx, dy, dz, tlx, tly, tlz, tnx, tny, tnz) => {
            let vs = map(range(n), (i) => {
                let x1
                let y1
                let z1
                let x2
                let y2
                let z2
                let xt
                let yt
                let zt
                x1 = cx + dx * i
                y1 = cy + dy * i
                z1 = cz + dz * i
                x2 = x1 + tlx
                y2 = y1 + tly
                z2 = z1 + tlz
                xt = x1 + tnx
                yt = y1 + tny
                zt = z1 + tnz
                return {
                    x1,
                    y1,
                    z1,
                    x2,
                    y2,
                    z2,
                    xt,
                    yt,
                    zt,
                }

            })
            return vs
        }

        //x-axis title
        if (true) {
            each(ldxy, (l, kl) => {
                let objLabel = createLabel(axisXTitle, 0, csr.rymin + l[0] * csr.ryrng + l[1] * axisXTitleDistance, csr.rzmin + l[2] * axisXTitleDistance, {
                    textColor: axisXTitleColor,
                    textFontSize: axisXTitleFontSize,
                    textFontFamily: axisXTitleFontFamily,
                })
                axisLabels.push(objLabel)
                axisRela.push({
                    key: 'x-title',
                    id: `s${kl}`,
                    rela: 'axisLabels',
                    ind: size(axisLabels) - 1,
                })
            })
        }

        //x-axis line
        if (true) {
            each(lda, (l, kl) => {
                let objLine = createLine(
                    csr.rxmin, csr.rymin + l[0] * csr.ryrng, csr.rzmin + l[1] * csr.rzrng,
                    csr.rxmax, csr.rymin + l[0] * csr.ryrng, csr.rzmin + l[1] * csr.rzrng,
                    {
                        color: axisXColor,
                        width: axisXWidth,
                    })
                axisLines.push(objLine)
                axisRela.push({
                    key: 'x-axis-line',
                    id: `s${kl}`,
                    rela: 'axisLines',
                    ind: size(axisLines) - 1,
                })
            })
        }

        //x-axis ticks
        each(ldxy, (l, kl) => {

            ts = genTks(
                csr.rxmin, csr.rymin + l[0] * csr.ryrng, csr.rzmin,
                axisXTickNum,
                1 / axisXTickIntervalNum, 0, 0,
                0, l[1] * axisXTickLength, l[2] * axisXTickLength,
                0, l[1] * axisXTickLabelDistance, l[2] * axisXTickLabelDistance,
            )

            each(ts, (t, i) => {

                let objLine = createLine(t.x1, t.y1, t.z1, t.x2, t.y2, t.z2, {
                    color: axisXTickColor,
                    width: axisXTickwidth,
                })
                axisLines.push(objLine)
                axisRela.push({
                    key: 'x-tick-line',
                    id: `s${kl}`,
                    rela: 'axisLines',
                    ind: size(axisLines) - 1,
                })

                //text
                let text = i * csr.xrng / axisXTickNum + csr.xmin
                text = dig(text, axisXTickLabelDig)

                let objLabel = createLabel(text, t.xt, t.yt, t.zt, {
                    textColor: axisXTickLabelColor,
                    textFontSize: axisXTickLabelFontSize,
                    textFontFamily: axisXTickLabelFontFamily,
                })
                axisLabels.push(objLabel)
                axisRela.push({
                    key: 'x-tick-label',
                    id: `s${kl}`,
                    rela: 'axisLabels',
                    ind: size(axisLabels) - 1,
                })

            })

        })

        //y-axis title
        if (true) {
            each(ldxy, (l, kl) => {
                let objLabel = createLabel(axisYTitle, csr.rxmin + l[0] * csr.rxrng + l[1] * axisYTitleDistance, 0, csr.rzmin + l[2] * axisYTitleDistance, {
                    textColor: axisYTitleColor,
                    textFontSize: axisYTitleFontSize,
                    textFontFamily: axisYTitleFontFamily,
                })
                axisLabels.push(objLabel)
                axisRela.push({
                    key: 'y-title',
                    id: `s${kl}`,
                    rela: 'axisLabels',
                    ind: size(axisLabels) - 1,
                })
            })
        }

        //y-axis line
        if (true) {
            each(lda, (l, kl) => {
                let objLine = createLine(
                    csr.rxmin + l[0] * csr.rxrng, csr.rymin, csr.rzmin + l[1] * csr.rzrng,
                    csr.rxmin + l[0] * csr.rxrng, csr.rymax, csr.rzmin + l[1] * csr.rzrng,
                    {
                        color: axisYColor,
                        width: axisYWidth,
                    })
                axisLines.push(objLine)
                axisRela.push({
                    key: 'y-axis-line',
                    id: `s${kl}`,
                    rela: 'axisLines',
                    ind: size(axisLines) - 1,
                })
            })
        }

        //y-axis ticks
        each(ldxy, (l, kl) => {

            ts = genTks(
                csr.rxmin + l[0] * csr.rxrng, csr.rymin, csr.rzmin,
                axisYTickNum,
                0, 1 / axisYTickIntervalNum, 0,
                l[1] * axisYTickLength, 0, l[2] * axisYTickLength,
                l[1] * axisYTickLabelDistance, 0, l[2] * axisYTickLabelDistance,
            )

            each(ts, (t, i) => {

                let objLine = createLine(t.x1, t.y1, t.z1, t.x2, t.y2, t.z2, {
                    color: axisYTickColor,
                    width: axisYTickwidth,
                })
                axisLines.push(objLine)
                axisRela.push({
                    key: 'y-tick-line',
                    id: `s${kl}`,
                    rela: 'axisLines',
                    ind: size(axisLines) - 1,
                })

                //text
                let text = i * csr.yrng / axisYTickNum + csr.ymin
                text = dig(text, axisYTickLabelDig)

                let objLabel = createLabel(text, t.xt, t.yt, t.zt, {
                    textColor: axisYTickLabelColor,
                    textFontSize: axisYTickLabelFontSize,
                    textFontFamily: axisYTickLabelFontFamily,
                })
                axisLabels.push(objLabel)
                axisRela.push({
                    key: 'y-tick-label',
                    id: `s${kl}`,
                    rela: 'axisLabels',
                    ind: size(axisLabels) - 1,
                })

            })

        })

        //z-axis title
        if (true) {
            each(ldz, (l, kl) => {
                let xt = csr.rxmin + l[0] * csr.rxrng + l[2] * axisZTitleDistance / 1.414
                let yt = csr.rymin + l[1] * csr.ryrng + l[3] * axisZTitleDistance / 1.414
                let objLabel = createLabel(axisZTitle, xt, yt, 0, {
                    textColor: axisZTitleColor,
                    textFontSize: axisZTitleFontSize,
                    textFontFamily: axisZTitleFontFamily,
                })
                axisLabels.push(objLabel)
                axisRela.push({
                    key: 'z-title',
                    id: `s${kl}`,
                    rela: 'axisLabels',
                    ind: size(axisLabels) - 1,
                })
            })
        }

        //z-axis line
        if (true) {
            each(lda, (l, kl) => {
                let objLine = createLine(
                    csr.rxmin + l[0] * csr.rxrng, csr.rymin + l[1] * csr.ryrng, csr.rzmin,
                    csr.rxmin + l[0] * csr.rxrng, csr.rymin + l[1] * csr.ryrng, csr.rzmax,
                    {
                        color: axisZColor,
                        width: axisZWidth,
                    })
                axisLines.push(objLine)
                axisRela.push({
                    key: 'z-axis-line',
                    id: `s${kl}`,
                    rela: 'axisLines',
                    ind: size(axisLines) - 1,
                })
            })
        }

        //z-axis ticks
        each(ldz, (l, kl) => {

            ts = genTks(
                csr.rxmin + l[0] * csr.rxrng, csr.rymin + l[1] * csr.ryrng, csr.rzmin,
                axisZTickNum,
                0, 0, 1 / axisZTickIntervalNum,
                l[2] * axisZTickLength / 1.414, l[3] * axisZTickLength / 1.414, 0,
                l[2] * axisZTickLabelDistance / 1.414, l[3] * axisZTickLabelDistance / 1.414, 0,
            )

            each(ts, (t, i) => {

                let objLine = createLine(t.x1, t.y1, t.z1, t.x2, t.y2, t.z2, {
                    color: axisZTickColor,
                    width: axisZTickwidth,
                })
                axisLines.push(objLine)
                axisRela.push({
                    key: 'z-tick-line',
                    id: `s${kl}`,
                    rela: 'axisLines',
                    ind: size(axisLines) - 1,
                })

                //text
                let text = i * csr.zrng / axisZTickNum + csr.zmin
                text = dig(text, axisZTickLabelDig)

                let objLabel = createLabel(text, t.xt, t.yt, t.zt, {
                    textColor: axisZTickLabelColor,
                    textFontSize: axisZTickLabelFontSize,
                    textFontFamily: axisZTickLabelFontFamily,
                })
                axisLabels.push(objLabel)
                axisRela.push({
                    key: 'z-tick-label',
                    id: `s${kl}`,
                    rela: 'axisLabels',
                    ind: size(axisLabels) - 1,
                })

            })

        })

    }
    let displayAxis = (key, id, show) => {
        each(axisRela, (v) => {
            let b1 = true
            if (isestr(key)) {
                b1 = v.key === key
            }
            let b2 = true
            if (isestr(id)) {
                b2 = v.id === id
            }
            let b = b1 && b2
            // console.log(v, b)
            if (b) {

                //o
                let o = get(axisKpRela, `${v.rela}.${v.ind}`)
                // console.log('o', o)

                //check
                if (!iseobj(o)) {
                    return true //跳出換下一個
                }

                if (get(o, 'ele')) {
                    let visibility = show ? 'visible' : 'hidden'
                    o.ele.style.visibility = visibility
                }
                else if (get(o, 'line')) {
                    o.line.visible = show
                }
                else {
                    console.log(`invalid attr.`, o)
                }

            }
        })
    }
    let disposeAxis = () => {
        disposeLines(axisLines)
        disposeLabels(axisLabels)
        axisRela = []
        // axisKpRela = {} //不能清除, 記憶體須保持關聯axisLines與axisLabels
    }

    let displayAxisAndTitleAndTick = (ax, id) => {
        displayAxis(`${ax}-title`, 's0', id === 's0')
        displayAxis(`${ax}-tick-label`, 's0', id === 's0')
        displayAxis(`${ax}-tick-line`, 's0', id === 's0')
        displayAxis(`${ax}-title`, 's1', id === 's1')
        displayAxis(`${ax}-tick-label`, 's1', id === 's1')
        displayAxis(`${ax}-tick-line`, 's1', id === 's1')
        displayAxis(`${ax}-title`, 's2', id === 's2')
        displayAxis(`${ax}-tick-label`, 's2', id === 's2')
        displayAxis(`${ax}-tick-line`, 's2', id === 's2')
        displayAxis(`${ax}-title`, 's3', id === 's3')
        displayAxis(`${ax}-tick-label`, 's3', id === 's3')
        displayAxis(`${ax}-tick-line`, 's3', id === 's3')
    }

    let autoDisplayAxis = () => {

        //check
        if (!useBox) {
            return
        }

        //check
        if (!iseobj(_viewAngle)) {
            return
        }

        let azimuthAngle = get(_viewAngle, 'azimuthAngle')
        let polarAngle = get(_viewAngle, 'polarAngle')

        let b1
        let b2
        let b

        b1 = azimuthAngle >= 0 && azimuthAngle <= 90 //0~90
        b2 = azimuthAngle >= 270 && azimuthAngle <= 360 //270~360
        b = b1 || b2
        if (b) {
            displayAxisAndTitleAndTick('x', 's0')
        }
        else {
            displayAxisAndTitleAndTick('x', 's1')
        }
        if (cameraType === 'orthographic') {
            if (Math.abs(polarAngle - 90) < 0.2) {
                if (Math.abs(azimuthAngle - 90) < 0.2 || Math.abs(azimuthAngle - 270) < 0.2) {
                    displayAxisAndTitleAndTick('x', 'none')
                }
                else if (b) {
                    displayAxisAndTitleAndTick('x', 's2')
                }
                else {
                    displayAxisAndTitleAndTick('x', 's3')
                }
            }
        }

        b1 = azimuthAngle >= 180 && azimuthAngle <= 360
        b2 = false
        b = b1 || b2
        if (b) {
            displayAxisAndTitleAndTick('y', 's0')
        }
        else {
            displayAxisAndTitleAndTick('y', 's1')
        }
        if (cameraType === 'orthographic') {
            if (Math.abs(polarAngle - 90) < 0.2) {
                if (Math.abs(azimuthAngle) < 0.2 || Math.abs(azimuthAngle - 180) < 0.2) {
                    displayAxisAndTitleAndTick('y', 'none')
                }
                else if (b) {
                    displayAxisAndTitleAndTick('y', 's2')
                }
                else {
                    displayAxisAndTitleAndTick('y', 's3')
                }
            }
        }

        if (azimuthAngle <= 90) {
            displayAxisAndTitleAndTick('z', 's0')
        }
        else if (azimuthAngle <= 180) {
            displayAxisAndTitleAndTick('z', 's1')
        }
        else if (azimuthAngle <= 270) {
            displayAxisAndTitleAndTick('z', 's2')
        }
        else {
            displayAxisAndTitleAndTick('z', 's3')
        }
        if (cameraType === 'orthographic') {
            if (Math.abs(polarAngle) < 0.2 || Math.abs(polarAngle - 180) < 0.2) {
                displayAxisAndTitleAndTick('z', 'none')
            }
        }

    }

    let refreshAxis = () => {

        //disposeAxis
        disposeAxis()

        if (useBox) {

            //createAxis
            createAxis()

            //autoDisplayAxis
            autoDisplayAxis()

        }

        //render
        render()

    }

    let setAxisXTitle = (v) => {
        axisXTitle = v; refreshAxis()
    }
    let setAxisXTitleColor = (v) => {
        axisXTitleColor = v; refreshAxis()
    }
    let setAxisXTitleFontSize = (v) => {
        axisXTitleFontSize = v; refreshAxis()
    }
    let setAxisXTitleFontFamily = (v) => {
        axisXTitleFontFamily = v; refreshAxis()
    }
    let setAxisXTitleDistance = (v) => {
        axisXTitleDistance = v; refreshAxis()
    }
    let setAxisXColor = (v) => {
        axisXColor = v; refreshAxis()
    }
    let setAxisXWidth = (v) => {
        axisXWidth = v; refreshAxis()
    }
    let setAxisXTickColor = (v) => {
        axisXTickColor = v; refreshAxis()
    }
    let setAxisXTickwidth = (v) => {
        axisXTickwidth = v; refreshAxis()
    }
    let setAxisXTickLength = (v) => {
        axisXTickLength = v; refreshAxis()
    }
    let setAxisXTickNum = (v) => {
        axisXTickNum = v; refreshAxis()
    }
    let setAxisXTickLabelDistance = (v) => {
        axisXTickLabelDistance = v; refreshAxis()
    }
    let setAxisXTickLabelDig = (v) => {
        axisXTickLabelDig = v; refreshAxis()
    }
    let setAxisXTickLabelColor = (v) => {
        axisXTickLabelColor = v; refreshAxis()
    }
    let setAxisXTickLabelFontSize = (v) => {
        axisXTickLabelFontSize = v; refreshAxis()
    }
    let setAxisXTickLabelFontFamily = (v) => {
        axisXTickLabelFontFamily = v; refreshAxis()
    }

    let setAxisYTitle = (v) => {
        axisYTitle = v; refreshAxis()
    }
    let setAxisYTitleColor = (v) => {
        axisYTitleColor = v; refreshAxis()
    }
    let setAxisYTitleFontSize = (v) => {
        axisYTitleFontSize = v; refreshAxis()
    }
    let setAxisYTitleFontFamily = (v) => {
        axisYTitleFontFamily = v; refreshAxis()
    }
    let setAxisYTitleDistance = (v) => {
        axisYTitleDistance = v; refreshAxis()
    }
    let setAxisYColor = (v) => {
        axisYColor = v; refreshAxis()
    }
    let setAxisYWidth = (v) => {
        axisYWidth = v; refreshAxis()
    }
    let setAxisYTickColor = (v) => {
        axisYTickColor = v; refreshAxis()
    }
    let setAxisYTickwidth = (v) => {
        axisYTickwidth = v; refreshAxis()
    }
    let setAxisYTickLength = (v) => {
        axisYTickLength = v; refreshAxis()
    }
    let setAxisYTickNum = (v) => {
        axisYTickNum = v; refreshAxis()
    }
    let setAxisYTickLabelDistance = (v) => {
        axisYTickLabelDistance = v; refreshAxis()
    }
    let setAxisYTickLabelDig = (v) => {
        axisYTickLabelDig = v; refreshAxis()
    }
    let setAxisYTickLabelColor = (v) => {
        axisYTickLabelColor = v; refreshAxis()
    }
    let setAxisYTickLabelFontSize = (v) => {
        axisYTickLabelFontSize = v; refreshAxis()
    }
    let setAxisYTickLabelFontFamily = (v) => {
        axisYTickLabelFontFamily = v; refreshAxis()
    }

    let setAxisZTitle = (v) => {
        axisZTitle = v; refreshAxis()
    }
    let setAxisZTitleColor = (v) => {
        axisZTitleColor = v; refreshAxis()
    }
    let setAxisZTitleFontSize = (v) => {
        axisZTitleFontSize = v; refreshAxis()
    }
    let setAxisZTitleFontFamily = (v) => {
        axisZTitleFontFamily = v; refreshAxis()
    }
    let setAxisZTitleDistance = (v) => {
        axisZTitleDistance = v; refreshAxis()
    }
    let setAxisZColor = (v) => {
        axisZColor = v; refreshAxis()
    }
    let setAxisZWidth = (v) => {
        axisZWidth = v; refreshAxis()
    }
    let setAxisZTickColor = (v) => {
        axisZTickColor = v; refreshAxis()
    }
    let setAxisZTickwidth = (v) => {
        axisZTickwidth = v; refreshAxis()
    }
    let setAxisZTickLength = (v) => {
        axisZTickLength = v; refreshAxis()
    }
    let setAxisZTickNum = (v) => {
        axisZTickNum = v; refreshAxis()
    }
    let setAxisZTickLabelDistance = (v) => {
        axisZTickLabelDistance = v; refreshAxis()
    }
    let setAxisZTickLabelDig = (v) => {
        axisZTickLabelDig = v; refreshAxis()
    }
    let setAxisZTickLabelColor = (v) => {
        axisZTickLabelColor = v; refreshAxis()
    }
    let setAxisZTickLabelFontSize = (v) => {
        axisZTickLabelFontSize = v; refreshAxis()
    }
    let setAxisZTickLabelFontFamily = (v) => {
        axisZTickLabelFontFamily = v; refreshAxis()
    }

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
        disposeMeshLabels()
        await addMeshCore(v)
        rdr()
    }

    let addMeshs = async (vs) => {
        resetTransform()
        disposeMeshLabels()
        await addMeshsCore(vs)
        rdr()
    }

    let getMeshsInfor = () => {
        let rs = map(meshs, (v, ind) => {
            // console.log('ind', v)
            let color = get(v, 'color', '')
            let label = get(meshLabels, `${ind}.ele`)
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

        //r
        let r = 1
        if (csrd.rd > 0) {
            r = 1 / csrd.rd
        }

        //rxrng, rxmin, rxmax, ryrng, rymin, rymax, rzrng, rzmin, rzmax
        let rxrng = 1
        let rxmin = -0.5
        let rxmax = rxmin + rxrng
        let ryrng = 1
        let rymin = -0.5
        let rymax = rymin + ryrng
        let rzrng = 1
        let rzmin = -0.5
        let rzmax = rzmin + rzrng

        //csr
        csr = {
            ...csrd,
            rx: r,
            ry: r,
            rz: r,
            rd: csrd.rd,
            rxrng,
            rxmin,
            rxmax,
            ryrng,
            rymin,
            rymax,
            rzrng,
            rzmin,
            rzmax,
        }
        // console.log('csr', csr)

    }

    let calcTransform = () => {
        each(meshs, (mesh) => {
            // console.log('mesh',mesh)
            let geometry = mesh.geometry
            geometry.translate(-csr.xc, -csr.yc, -csr.zc) //先平移
            geometry.scale(csr.rx, csr.ry, csr.rz) //再縮放
        })
    }

    let resetTransform = () => {
        each(meshs, (mesh) => {
            // console.log('mesh',mesh)
            let geometry = mesh.geometry
            geometry.scale(1 / csr.rx, 1 / csr.ry, 1 / csr.rz) //先恢復縮放
            geometry.translate(csr.xc, csr.yc, csr.zc) //再恢復平移
        })
    }

    //meshLabels
    let meshLabels = []
    let createMeshLabels = () => {
        let vs = map(meshs, (mesh) => {
            let c = mesh.geometry.boundingSphere.center //get(mesh, 'geometry.boundingSphere.center')
            let text = mesh.name
            let x = c.x
            let y = c.y
            let z = c.z
            return {
                text,
                x,
                y,
                z,
            }
        })
        meshLabels = createLabels(vs, {
            textColor: labelTextColor,
            textFontSize: labelTextFontSize,
            textFontFamily: labelTextFontFamily,
        })
    }
    let disposeMeshLabels = () => {
        disposeLabels(meshLabels)
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
        createMeshLabels()

        //check
        if (useBox) {

            //須有csr才能繪製axis與tick
            createAxis()

            //autoDisplayAxis
            autoDisplayAxis()

        }

        //更新平移與縮放後渲染
        render()

    }

    let setMeshLabelVisibleCore = (ind, visible) => {
        let label = get(meshLabels, `${ind}.ele`)
        if (!isEle(label)) {
            return null
        }
        try {
            //無法用display控制顯隱
            let visibility = 'hidden'
            if (visible === true) {
                visibility = 'visible'
            }
            meshLabels[ind].ele.style.visibility = visibility
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
        let label = get(meshLabels, `${ind}.ele`)
        if (!isEle(label)) {
            return null
        }
        try {
            meshLabels[ind].ele.textContent = text
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    let setMeshLabelTextColor = (ind, color) => {
        let label = get(meshLabels, `${ind}.ele`)
        if (!isEle(label)) {
            return null
        }
        try {
            meshLabels[ind].ele.style.color = color
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    let setMeshLabelTextFontSize = (ind, fontSize) => {
        let label = get(meshLabels, `${ind}.ele`)
        if (!isEle(label)) {
            return null
        }
        try {
            meshLabels[ind].ele.style.fontSize = fontSize
        }
        catch (err) {
            console.log(err)
        }
        render()
    }

    let setMeshLabelTextFontFamily = (ind, fontFamily) => {
        let label = get(meshLabels, `${ind}.ele`)
        if (!isEle(label)) {
            return null
        }
        try {
            meshLabels[ind].ele.style.fontFamily = fontFamily
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
        disposeMeshLabels()
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

        //disposeAxis
        disposeAxis()

        // labelDiv=document.querySelector('#labelDiv'); // same beginning
        // allLabelsToDelete=document.querySelectorAll('#labelDiv .label') // takes children of class "label" like in moon-earth example
        // forEach (elem in allLabelsToDelete ) {
        //     labelDiv.removeChild(elem)
        // }

        //disposeMeshLabels
        disposeMeshLabels()

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

    ev.getUseBox = getUseBox
    ev.setUseBox = setUseBox

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

    ev.setAxisXTitle = setAxisXTitle
    ev.setAxisXTitleColor = setAxisXTitleColor
    ev.setAxisXTitleFontSize = setAxisXTitleFontSize
    ev.setAxisXTitleFontFamily = setAxisXTitleFontFamily
    ev.setAxisXTitleDistance = setAxisXTitleDistance
    ev.setAxisXColor = setAxisXColor
    ev.setAxisXWidth = setAxisXWidth
    ev.setAxisXTickColor = setAxisXTickColor
    ev.setAxisXTickwidth = setAxisXTickwidth
    ev.setAxisXTickLength = setAxisXTickLength
    ev.setAxisXTickNum = setAxisXTickNum
    ev.setAxisXTickLabelDistance = setAxisXTickLabelDistance
    ev.setAxisXTickLabelDig = setAxisXTickLabelDig
    ev.setAxisXTickLabelColor = setAxisXTickLabelColor
    ev.setAxisXTickLabelFontSize = setAxisXTickLabelFontSize
    ev.setAxisXTickLabelFontFamily = setAxisXTickLabelFontFamily

    ev.setAxisYTitle = setAxisYTitle
    ev.setAxisYTitleColor = setAxisYTitleColor
    ev.setAxisYTitleFontSize = setAxisYTitleFontSize
    ev.setAxisYTitleFontFamily = setAxisYTitleFontFamily
    ev.setAxisYTitleDistance = setAxisYTitleDistance
    ev.setAxisYColor = setAxisYColor
    ev.setAxisYWidth = setAxisYWidth
    ev.setAxisYTickColor = setAxisYTickColor
    ev.setAxisYTickwidth = setAxisYTickwidth
    ev.setAxisYTickLength = setAxisYTickLength
    ev.setAxisYTickNum = setAxisYTickNum
    ev.setAxisYTickLabelDistance = setAxisYTickLabelDistance
    ev.setAxisYTickLabelDig = setAxisYTickLabelDig
    ev.setAxisYTickLabelColor = setAxisYTickLabelColor
    ev.setAxisYTickLabelFontSize = setAxisYTickLabelFontSize
    ev.setAxisYTickLabelFontFamily = setAxisYTickLabelFontFamily

    ev.setAxisZTitle = setAxisZTitle
    ev.setAxisZTitleColor = setAxisZTitleColor
    ev.setAxisZTitleFontSize = setAxisZTitleFontSize
    ev.setAxisZTitleFontFamily = setAxisZTitleFontFamily
    ev.setAxisZTitleDistance = setAxisZTitleDistance
    ev.setAxisZColor = setAxisZColor
    ev.setAxisZWidth = setAxisZWidth
    ev.setAxisZTickColor = setAxisZTickColor
    ev.setAxisZTickwidth = setAxisZTickwidth
    ev.setAxisZTickLength = setAxisZTickLength
    ev.setAxisZTickNum = setAxisZTickNum
    ev.setAxisZTickLabelDistance = setAxisZTickLabelDistance
    ev.setAxisZTickLabelDig = setAxisZTickLabelDig
    ev.setAxisZTickLabelColor = setAxisZTickLabelColor
    ev.setAxisZTickLabelFontSize = setAxisZTickLabelFontSize
    ev.setAxisZTickLabelFontFamily = setAxisZTickLabelFontFamily

    return ev
}


export default plot3d
