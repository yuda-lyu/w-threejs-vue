import get from 'lodash-es/get.js'
import oc from 'wsemi/src/color.mjs'
import * as THREE from 'three'


let createLightDirection = (scene, { useLightDirection, lightDirectionPos, lightDirectionColor, lightDirectionIntensity }) => {
    let lightDirection = new THREE.DirectionalLight(oc.toRgbString(lightDirectionColor), lightDirectionIntensity)
    lightDirection.visible = useLightDirection
    let x = get(lightDirectionPos, 0, 0)
    let y = get(lightDirectionPos, 1, 0)
    let z = get(lightDirectionPos, 2, 0)
    lightDirection.position.set(x, y, z)
    // lightDirection.castShadow = true
    scene.add(lightDirection)
    return lightDirection
}


let disposeLightDirection = (scene, lightDirection) => {
    scene.remove(lightDirection)
    lightDirection.dispose()
    lightDirection = null
}


export {
    createLightDirection,
    disposeLightDirection
}
