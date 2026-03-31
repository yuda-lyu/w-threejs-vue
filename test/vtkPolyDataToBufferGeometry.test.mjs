import assert from 'assert'
import { readFile } from 'node:fs/promises'
import {
    parseVtpArrayBuffer,
    vtkCellArrayToIndices,
    vtkPolyDataToBufferGeometry
} from '../src/js/vtkPolyDataToBufferGeometry.mjs'


let loadArrayBuffer = async(path) => {
    let buffer = await readFile(path)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}


describe('vtkPolyDataToBufferGeometry', function() {

    it('should convert vtp file to indexed BufferGeometry', async function() {
        let arrayBuffer = await loadArrayBuffer('./test/vtp/central_area.vtp')
        let polyData = parseVtpArrayBuffer(arrayBuffer)
        let geometry = vtkPolyDataToBufferGeometry(polyData)

        assert.ok(geometry.getAttribute('position'))
        assert.ok(geometry.getAttribute('normal'))
        assert.ok(geometry.getIndex())
        assert.ok(geometry.getIndex().count > 0)
        assert.strictEqual(geometry.getIndex().count % 3, 0)
        assert.ok(geometry.boundingBox)
        assert.ok(geometry.boundingSphere)
    })

    it('should triangulate polygon cells before building geometry', async function() {
        let arrayBuffer = await loadArrayBuffer('./test/vtp/access_ramp.vtp')
        let polyData = parseVtpArrayBuffer(arrayBuffer)
        let originalPolys = polyData.getPolys().getData()
        let geometry = vtkPolyDataToBufferGeometry(polyData)

        assert.ok(originalPolys[0] > 3)
        assert.ok(geometry.getIndex().count > 0)
        assert.strictEqual(geometry.getIndex().count % 3, 0)
    })

    it('should support polygon fan fallback for cell-array conversion', function() {
        let indices = vtkCellArrayToIndices(new Uint32Array([4, 0, 1, 2, 3]))
        assert.deepStrictEqual(indices, [0, 1, 2, 0, 2, 3])
    })

})
