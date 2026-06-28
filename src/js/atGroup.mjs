import * as THREE from 'three'


let createGroup = (scene) => {
    let group = new THREE.Group()
    // each(meshs, (mesh) => {
    //     group.add(mesh)
    // })
    // console.log('group',group)
    scene.add(group)
    return group
}


let disposeMaterial = (material) => {
    if (Array.isArray(material)) {
        material.forEach((m) => {
            disposeMaterial(m)
        })
    }
    else if (material && material.dispose) {
        material.dispose()
        Object.keys(material).forEach((key) => {
            let value = material[key]
            if (value && typeof value === 'object' && 'minFilter' in value && value.dispose) {
                value.dispose()
            }
        })
    }
}


let disposeGroup = (scene, group) => {
    if (!group) {
        return
    }
    group.traverse(function(obj) {
        if (obj.isMesh) {
            if (obj.geometry && obj.geometry.dispose) {
                obj.geometry.dispose()
            }
            disposeMaterial(obj.material)
        }
    })
    if (scene && scene.remove) {
        scene.remove(group)
    }
    group = null
}


export {
    createGroup,
    disposeGroup
}
