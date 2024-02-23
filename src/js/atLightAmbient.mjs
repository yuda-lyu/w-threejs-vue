import oc from 'wsemi/src/color.mjs'
import * as THREE from 'three'


let createLightAmbient = (scene, { useLightAmbient, lightAmbientColor }) => {
    let lightAmbient = new THREE.AmbientLight(oc.toRgbString(lightAmbientColor))
    lightAmbient.visible = useLightAmbient
    scene.add(lightAmbient)
    return lightAmbient
}


let disposeLightAmbient = (scene, lightAmbient) => {
    scene.remove(lightAmbient)
    lightAmbient.dispose()
    lightAmbient = null
}


export {
    createLightAmbient,
    disposeLightAmbient
}
