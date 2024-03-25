import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import oc from 'wsemi/src/color.mjs'
import * as THREE from 'three'


let createLine = (scene, x1, y1, z1, x2, y2, z2, opt = { }) => {

    let color = get(opt, 'color', '#fff')
    let width = get(opt, 'width', 1)

    //material
    let material = new THREE.LineBasicMaterial({
        color: oc.toRgbString(color),

        linewidth: width,
        //https://threejs.org/docs/#api/zh/materials/LineBasicMaterial
        //由于OpenGL Core Profile与 大多数平台上WebGL渲染器的限制，无论如何设置该值，线宽始终为1

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


let disposeLine = (scene, objLine) => {
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


let createLines = (scene, vs, opt = {}) => {
    let arrLines = map(vs, (v) => {
        let x1 = get(v, 'x1', 0)
        let y1 = get(v, 'y1', 0)
        let z1 = get(v, 'z1', 0)
        let x2 = get(v, 'x2', 0)
        let y2 = get(v, 'y2', 0)
        let z2 = get(v, 'z2', 0)
        let r = createLine(scene, x1, y1, z1, x2, y2, z2, opt)
        return r
    })
    return arrLines
}


let disposeLines = (scene, arrLines) => {
    each(arrLines, (objLine) => {
        disposeLine(scene, objLine)
    })
    arrLines = []
}


export {
    createLine,
    disposeLine,
    createLines,
    disposeLines
}
