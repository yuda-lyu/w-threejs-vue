import get from 'lodash-es/get.js'
import isfun from 'wsemi/src/isfun.mjs'
import * as THREE from 'three'
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader.js'
import vtkTriangleFilter from '@kitware/vtk.js/Filters/General/TriangleFilter.js'


let toArrayBuffer = (data) => {
    if (data instanceof ArrayBuffer) {
        return data
    }

    if (ArrayBuffer.isView(data)) {
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    }

    throw new Error('invalid vtp data, need ArrayBuffer or TypedArray')
}


let loadArrayBuffer = async(url, opt = {}) => {
    let onProgress = get(opt, 'onProgress')

    if (typeof XMLHttpRequest === 'function') {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
            xhr.open('GET', url, true)
            xhr.responseType = 'arraybuffer'

            xhr.onprogress = (evt) => {
                if (!isfun(onProgress)) {
                    return
                }
                let total = evt.total || 0
                let loaded = evt.loaded || 0
                let prog = total > 0 ? (loaded / total) * 100 : null
                onProgress({
                    url,
                    loaded,
                    total,
                    prog,
                })
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response)
                    return
                }
                reject(new Error(`load vtp failed[${xhr.status}] for url[${url}]`))
            }

            xhr.onerror = () => {
                reject(new Error(`load vtp failed for url[${url}]`))
            }

            xhr.send()
        })
    }

    let response = await fetch(url)
    if (!response.ok) {
        throw new Error(`load vtp failed[${response.status}] for url[${url}]`)
    }

    let arrayBuffer = await response.arrayBuffer()

    if (isfun(onProgress)) {
        onProgress({
            url,
            loaded: arrayBuffer.byteLength,
            total: arrayBuffer.byteLength,
            prog: 100,
        })
    }

    return arrayBuffer
}


let parseVtpArrayBuffer = (data) => {
    let reader = vtkXMLPolyDataReader.newInstance()
    reader.parseAsArrayBuffer(toArrayBuffer(data))
    return reader.getOutputData(0)
}


let loadVtpAsPolyData = async(url, opt = {}) => {
    let arrayBuffer = await loadArrayBuffer(url, opt)
    return parseVtpArrayBuffer(arrayBuffer)
}


let buildTrianglePolyData = (polyData) => {
    let triangleFilter = vtkTriangleFilter.newInstance()
    triangleFilter.setInputData(polyData)
    triangleFilter.update()
    return triangleFilter.getOutputData(0)
}


let vtkCellArrayToIndices = (cells) => {
    let indices = []
    let i = 0

    while (i < cells.length) {
        let n = cells[i]
        i += 1

        if (n < 3) {
            i += n
            continue
        }

        if (n === 3) {
            indices.push(cells[i], cells[i + 1], cells[i + 2])
            i += 3
            continue
        }

        let i0 = cells[i]
        for (let j = 1; j < n - 1; j++) {
            indices.push(i0, cells[i + j], cells[i + j + 1])
        }
        i += n
    }

    return indices
}


let toPositionArray = (points) => {
    if (points instanceof Float32Array) {
        return points
    }

    return new Float32Array(points)
}


let toIndexArray = (indices, vertexCount) => {
    if (vertexCount > 65535) {
        return new Uint32Array(indices)
    }
    return new Uint16Array(indices)
}


let vtkPolyDataToBufferGeometry = (polyData) => {
    let trianglePolyData = buildTrianglePolyData(polyData)

    let points = get(trianglePolyData, 'getPoints', () => null)()
    let polys = get(trianglePolyData, 'getPolys', () => null)()

    let pointsData = get(points, 'getData', () => null)()
    let polysData = get(polys, 'getData', () => null)()

    if (!pointsData || pointsData.length < 3) {
        throw new Error('vtp has no points data')
    }
    if (!polysData || polysData.length < 4) {
        throw new Error('vtp has no polygon data')
    }

    let positions = toPositionArray(pointsData)
    let indices = vtkCellArrayToIndices(polysData)
    let vertexCount = positions.length / 3

    if (indices.length < 3) {
        throw new Error('vtp has no triangle cells')
    }

    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setIndex(new THREE.BufferAttribute(toIndexArray(indices, vertexCount), 1))
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
}


export {
    loadVtpAsPolyData,
    parseVtpArrayBuffer,
    buildTrianglePolyData,
    vtkCellArrayToIndices,
    vtkPolyDataToBufferGeometry
}

export default vtkPolyDataToBufferGeometry
