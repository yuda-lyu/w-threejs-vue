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


let disposeGroup = (scene, group) => {
    group.traverse(function(obj) {
        if (obj.isMesh) {
            obj.geometry.dispose()
            obj.material.dispose()
        }
    })
    scene.remove(group)
    group = null
}


export {
    createGroup,
    disposeGroup
}
