import get from 'lodash-es/get.js'
import isNumber from 'lodash-es/isNumber.js'
import isestr from 'wsemi/src/isestr.mjs'
import oc from 'wsemi/src/color.mjs'
import * as THREE from 'three'
import {
    loadVtpAsPolyData,
    vtkPolyDataToBufferGeometry
} from './vtkPolyDataToBufferGeometry.mjs'


let addVtp = async(ev, url, opt = {}) => {

    //color
    let color = get(opt, 'color', null)
    if (!isestr(color)) {
        color = '#fff'
    }
    color = oc.toRgbString(color)

    //opacity
    let opacity = get(opt, 'opacity', null)
    if (!isNumber(opacity)) {
        opacity = 1
    }

    //transparent
    let transparent = opacity < 1

    let polyData = await loadVtpAsPolyData(url, {
        onProgress: (msg) => {
            ev.emit('loading', msg)
        },
    })

    let geometry = vtkPolyDataToBufferGeometry(polyData)

    let material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(color),
        depthTest: true,
        depthWrite: true,
        transparent,
        opacity,
        side: THREE.DoubleSide,
    })

    let mesh = new THREE.Mesh(geometry, material)

    return mesh
}


export default addVtp
