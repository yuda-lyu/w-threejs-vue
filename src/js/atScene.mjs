import * as THREE from 'three'


let createScene = () => {
    let scene = new THREE.Scene()
    return scene
}


let disposeScene = (scene) => {

    //cleanMaterial, 已預先執行多種dispose, 此函數暫時用不到
    let cleanMaterial = (material) => {
        if (Array.isArray(material)) {
            material.forEach((m) => {
                cleanMaterial(m)
            })
            return
        }
        if (!material) {
            return
        }
        // console.log('dispose material')
        if (material.dispose) {
            material.dispose()
        }
        // dispose textures
        for (let key of Object.keys(material)) {
            let value = material[key]
            if (value && typeof value === 'object' && 'minFilter' in value && value.dispose) {
                // console.log('dispose texture')
                value.dispose()
            }
        }
    }

    scene.traverse(object => {
        // console.log('object', object)
        if (object.isLight) {
            // console.log('dispose light')
            if (object.dispose) {
                object.dispose()
            }
        }
        if (object.isMesh) {
            // console.log('dispose geometry')
            if (object.geometry && object.geometry.dispose) {
                object.geometry.dispose()
            }
            cleanMaterial(object.material)
        }
    })

    scene = null

}


export {
    createScene,
    disposeScene
}
