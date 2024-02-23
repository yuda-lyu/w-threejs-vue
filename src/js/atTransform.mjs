import get from 'lodash-es/get'
import each from 'lodash-es/each'


let calcTransform = (csr, meshs) => {
    each(meshs, (mesh) => {
        // console.log('mesh',mesh)
        let geometry = get(mesh, 'geometry')
        try {
            geometry.translate(-csr.xc, -csr.yc, -csr.zc) //先平移
            geometry.scale(csr.rx, csr.ry, csr.rz) //再縮放
        }
        catch (err) { }
    })
}


let resetTransform = (csr, meshs) => {
    each(meshs, (mesh) => {
        // console.log('mesh',mesh)
        let geometry = mesh.geometry
        geometry.scale(1 / csr.rx, 1 / csr.ry, 1 / csr.rz) //先恢復縮放
        geometry.translate(csr.xc, csr.yc, csr.zc) //再恢復平移
    })
}


export {
    calcTransform,
    resetTransform
}
