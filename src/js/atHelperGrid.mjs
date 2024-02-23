import * as THREE from 'three'


let createHelperGrid = (scene, { useHelperGrid, helperGridLengthRatio, helperGridDensity, helperGridPositionRatioZ }) => {
    let helperGrid = new THREE.GridHelper(helperGridLengthRatio, helperGridDensity)
    helperGrid.visible = useHelperGrid
    helperGrid.geometry.rotateX(Math.PI * 0.5)
    helperGrid.geometry.translate(0, 0, helperGridPositionRatioZ)
    scene.add(helperGrid)
    return helperGrid
}


let disposeHelperGrid = (scene, helperGrid) => {
    scene.remove(helperGrid)
    helperGrid.dispose()
    helperGrid = null
}


export {
    createHelperGrid,
    disposeHelperGrid
}
