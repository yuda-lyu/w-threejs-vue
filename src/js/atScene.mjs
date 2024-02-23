import * as THREE from 'three'


let createScene = () => {
    let scene = new THREE.Scene()
    return scene
}


let disposeScene = (scene) => {

    //cleanMaterial, 已預先執行多種dispose, 此函數暫時用不到
    let cleanMaterial = (material) => {
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


export {
    createScene,
    disposeScene
}
