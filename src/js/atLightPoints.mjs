import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import oc from 'wsemi/src/color.mjs'
import * as THREE from 'three'


let createLightPoints = (scene, { useLightPoint, lightPointPoss, lightPointColor, lightPointIntensity, lightPointDistance, lightPointDecay }) => {
    let lightPoints = []
    each(lightPointPoss, (lp) => {
        let lightPoint = new THREE.PointLight(oc.toRgbString(lightPointColor), lightPointIntensity, lightPointDistance, lightPointDecay)
        lightPoint.visible = useLightPoint
        let x = get(lp, 0, 0)
        let y = get(lp, 1, 0)
        let z = get(lp, 2, 0)
        lightPoint.position.set(x, y, z)
        scene.add(lightPoint)
        lightPoints.push(lightPoint)
    })
    return lightPoints
}


let disposeLightPoints = (scene, lightPoints) => {
    each(lightPoints, (lightPoint) => {
        scene.remove(lightPoint)
        lightPoint.dispose()
        lightPoint = null
    })
    lightPoints = null
}


export {
    createLightPoints,
    disposeLightPoints
}
