import get from 'lodash-es/get'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import domRemove from 'wsemi/src/domRemove.mjs'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'


let createLabel = (scene, text, x, y, z, opt = {}) => {

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


let disposeLabel = (scene, objLabel) => {
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


let createLabels = (scene, vs, opt = {}) => {
    let arrLabels = map(vs, (v) => {
        let text = get(v, 'text', '')
        let x = get(v, 'x', 0)
        let y = get(v, 'y', 0)
        let z = get(v, 'z', 0)
        let r = createLabel(scene, text, x, y, z, opt)
        return r
    })
    return arrLabels
}


let disposeLabels = (scene, arrLabels) => {
    each(arrLabels, (objLabel) => {
        disposeLabel(scene, objLabel)
    })
    arrLabels = []
}


export {
    createLabel,
    disposeLabel,
    createLabels,
    disposeLabels
}
