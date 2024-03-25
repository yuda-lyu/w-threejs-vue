import get from 'lodash-es/get.js'
import oc from 'wsemi/src/color.mjs'
import * as THREE from 'three'


let createArrow = (scene, x, y, z, dx, dy, dz, opt = {}) => {
    let dir = new THREE.Vector3(dx, dy, dz)
    dir.normalize()
    let origin = new THREE.Vector3(x, y, z)
    let color = get(opt, 'color', '#fff')
    let length = get(opt, 'length', 1)
    let headLength = get(opt, 'headLength', 0.05)
    let headWidth = get(opt, 'headWidth', 0.02)
    let arrowHelper = new THREE.ArrowHelper(dir, origin, length, oc.toRgbString(color), headLength, headWidth)
    scene.add(arrowHelper)
    return arrowHelper
}


let disposeArrow = (scene, arrowHelper) => {
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


export {
    createArrow,
    disposeArrow
}
