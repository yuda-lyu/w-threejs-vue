import get from 'lodash-es/get'
import isNumber from 'lodash-es/isNumber'
import isestr from 'wsemi/src/isestr.mjs'
import oc from 'wsemi/src/color.mjs'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'


let addStl = async(ev, url, opt = {}) => {

    //color
    let color = get(opt, 'color', null)
    if (!isestr(color)) {
        color = '#fff'
    }
    color = oc.toRgbString(color)
    // console.log('color', color)

    //opacity
    let opacity = get(opt, 'opacity', null)
    if (!isNumber(opacity)) {
        opacity = 1
    }

    //transparent
    let transparent = opacity < 1

    //loader
    let loader = new STLLoader()
    let geometry = await loader.loadAsync(url, (xhr) => {
        let prog = (xhr.loaded / xhr.total) * 100
        ev.emit('loading', {
            url,
            prog,
        })
    })
    // console.log('geometry', geometry)

    //material, MeshLambertMaterial, MeshPhysicalMaterial
    let material = new THREE.MeshLambertMaterial({

        // visible:false,

        color: new THREE.Color(color),
        // wireframe: true,

        depthTest: true,
        depthWrite: true,

        transparent,
        opacity,

        side: THREE.DoubleSide,

        // polygonOffset: true,
        // polygonOffsetFactor: 1, // positive value pushes polygon further away
        // polygonOffsetUnits: 1,

        // //for MeshPhysicalMaterial
        // clearcoat: 1.0,//物体表面清漆层或者说透明涂层的厚度
        // clearcoatRoughness: 0.1,//透明涂层表面的粗糙度
        // envMap: envTexture,
        // metalness: 0.25,
        // roughness: 0.1,
        // transmission: 0.99,

    })

    //mesh
    let mesh = new THREE.Mesh(geometry, material)
    // console.log('mesh', mesh)

    // // wireframe, 若要使用也需要座標平移
    // var geo = new THREE.WireframeGeometry( geometry ); // or WireframeGeometry
    // var mat = new THREE.LineBasicMaterial( { color: 0x000000 } );
    // var wireframe = new THREE.LineSegments( geo, mat );
    // mesh.add( wireframe )

    return mesh
}


export default addStl
