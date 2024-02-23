import * as THREE from 'three'


let createHelperAxes = (scene, { useHelperAxes, helperAxesLengthRatio }) => {
    let helperAxes = new THREE.AxesHelper(helperAxesLengthRatio)
    helperAxes.visible = useHelperAxes
    scene.add(helperAxes)
    return helperAxes
}


let disposeHelperAxes = (scene, helperAxes) => {
    scene.remove(helperAxes)
    helperAxes.dispose()
    helperAxes = null
}


export {
    createHelperAxes,
    disposeHelperAxes
}
