import map from 'lodash-es/map'
import min from 'lodash-es/min'
import max from 'lodash-es/max'


let getCsrdFromMesh = (mesh) => {
    // console.log('mesh',mesh)
    let geometry = mesh.geometry
    // console.log('geometry',geometry)
    let cs = geometry.boundingSphere.center
    // console.log('cs',cloneDeep(cs))
    let rd = geometry.boundingSphere.radius
    // console.log('rd',rd)
    return {
        cs,
        rd,
    }
}


let BoxFromMesh = (mesh) => {
    let r = getCsrdFromMesh(mesh)
    let xmin = r.cs.x - r.rd
    let xmax = r.cs.x + r.rd
    let ymin = r.cs.y - r.rd
    let ymax = r.cs.y + r.rd
    let zmin = r.cs.z - r.rd
    let zmax = r.cs.z + r.rd
    return {
        xmin,
        xmax,
        ymin,
        ymax,
        zmin,
        zmax,
    }
}


let getBoxFromMeshs = (meshs) => {
    let bxs = map(meshs, (mesh, kmesh) => {
        // console.log('kmesh', kmesh, mesh)
        let bx = BoxFromMesh(mesh)
        // console.log('bx',bx)
        return bx
    })
    let xmin = min(map(bxs, 'xmin'))
    let xmax = max(map(bxs, 'xmax'))
    let ymin = min(map(bxs, 'ymin'))
    let ymax = max(map(bxs, 'ymax'))
    let zmin = min(map(bxs, 'zmin'))
    let zmax = max(map(bxs, 'zmax'))
    return {
        xmin,
        xmax,
        ymin,
        ymax,
        zmin,
        zmax,
    }
}


let getCsrdFromMeshs = (meshs) => {
    let bx = getBoxFromMeshs(meshs)
    // console.log('bx(all)',bx)
    let xrng = bx.xmax - bx.xmin
    let yrng = bx.ymax - bx.ymin
    let zrng = bx.zmax - bx.zmin
    let xc = (bx.xmax + bx.xmin) / 2
    let yc = (bx.ymax + bx.ymin) / 2
    let zc = (bx.zmax + bx.zmin) / 2
    let rd = max([xrng, yrng, zrng])
    return {
        cs: {
            x: xc,
            y: yc,
            z: zc,
        },
        rd,
    }
}


export default getCsrdFromMeshs
