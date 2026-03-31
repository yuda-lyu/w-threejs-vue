import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to write VTP file (XML PolyData)
class VtpWriter {
    constructor() {
        this.points = [];
        this.polys = [];
    }

    addPoint(x, y, z) {
        this.points.push([x, y, z]);
        return this.points.length - 1;
    }

    addPoly(indices) {
        this.polys.push(indices);
    }

    save(filepath) {
        let xml = '<?xml version="1.0"?>\n';
        xml += '<VTKFile type="PolyData" version="0.1" byte_order="LittleEndian">\n';
        xml += '  <PolyData>\n';
        xml += `    <Piece NumberOfPoints="${this.points.length}" NumberOfVerts="0" NumberOfLines="0" NumberOfStrips="0" NumberOfPolys="${this.polys.length}">\n`;
        xml += '      <Points>\n';
        xml += '        <DataArray type="Float32" Name="Points" NumberOfComponents="3" format="ascii">\n';
        xml += this.points.map(p => p.join(' ')).join(' ');
        xml += '\n        </DataArray>\n';
        xml += '      </Points>\n';
        xml += '      <Polys>\n';
        xml += '        <DataArray type="Int32" Name="connectivity" format="ascii">\n';
        xml += this.polys.map(poly => poly.join(' ')).join(' ');
        xml += '\n        </DataArray>\n';
        xml += '        <DataArray type="Int32" Name="offsets" format="ascii">\n';
        let currentOffset = 0;
        const offsets = this.polys.map(poly => {
            currentOffset += poly.length;
            return currentOffset;
        });
        xml += offsets.join(' ');
        xml += '\n        </DataArray>\n';
        xml += '      </Polys>\n';
        xml += '    </Piece>\n';
        xml += '  </PolyData>\n';
        xml += '</VTKFile>';
        fs.writeFileSync(filepath, xml);
        console.log(`Saved ${filepath}`);
    }
}

// Geometry Generators

// 1. Z-Aligned Cylinder (for Shafts, Holes, Canisters)
// Circle in XY plane, Height along Z
function createCylinderZ(writer, radius, height, radialSegments = 20, xOffset = 0, yOffset = 0, zOffset = 0) {
    const baseIndex = writer.points.length;
    // Top cap center
    const topCenter = writer.addPoint(xOffset, yOffset, zOffset + height / 2);
    // Bottom cap center
    const bottomCenter = writer.addPoint(xOffset, yOffset, zOffset - height / 2);

    for (let i = 0; i < radialSegments; i++) {
        const theta = (i / radialSegments) * Math.PI * 2;
        const x = Math.cos(theta) * radius + xOffset;
        const y = Math.sin(theta) * radius + yOffset;
        writer.addPoint(x, y, zOffset + height / 2); // Top rim
        writer.addPoint(x, y, zOffset - height / 2); // Bottom rim
    }

    for (let i = 0; i < radialSegments; i++) {
        const next = (i + 1) % radialSegments;
        const topCurrent = baseIndex + 2 + 2 * i;
        const botCurrent = baseIndex + 3 + 2 * i;
        const topNext = baseIndex + 2 + 2 * next;
        const botNext = baseIndex + 3 + 2 * next;

        writer.addPoly([baseIndex, topCurrent, topNext]); // Top
        writer.addPoly([baseIndex + 1, botNext, botCurrent]); // Bottom
        writer.addPoly([topCurrent, botCurrent, botNext]); // Side 1
        writer.addPoly([botNext, topNext, topCurrent]); // Side 2
    }
}

function createBox(writer, sizeX, sizeY, sizeZ, x = 0, y = 0, z = 0) {
    const hx = sizeX / 2;
    const hy = sizeY / 2;
    const hz = sizeZ / 2;
    const idx = writer.points.length;

    // 8 points
    writer.addPoint(x - hx, y - hy, z - hz); // 0
    writer.addPoint(x + hx, y - hy, z - hz); // 1
    writer.addPoint(x + hx, y + hy, z - hz); // 2
    writer.addPoint(x - hx, y + hy, z - hz); // 3
    writer.addPoint(x - hx, y - hy, z + hz); // 4
    writer.addPoint(x + hx, y - hy, z + hz); // 5
    writer.addPoint(x + hx, y + hy, z + hz); // 6
    writer.addPoint(x - hx, y + hy, z + hz); // 7

    const faces = [
        [0, 1, 2, 3], // Bottom (XY) - wait, Z- is bottom
        [1, 5, 6, 2], // Right (YZ)
        [5, 4, 7, 6], // Top (XY)
        [4, 0, 3, 7], // Left (YZ)
        [3, 2, 6, 7], // Back (XZ)
        [4, 5, 1, 0]  // Front (XZ)
    ];

    faces.forEach(face => {
        writer.addPoly([idx + face[0], idx + face[1], idx + face[2]]);
        writer.addPoly([idx + face[2], idx + face[3], idx + face[0]]);
    });
}

function createSpiralRampZ(writer, radius, width, height, totalDepth, turns, zTop = 0, cx = 0, cy = 0, cw = false) {
    // Generate a spiral going DOWN from zTop to zTop - totalDepth
    const segmentsPerTurn = 40;
    const totalSegments = turns * segmentsPerTurn;
    const angleStep = (Math.PI * 2) / segmentsPerTurn;
    const zStep = totalDepth / totalSegments; // positive step for calc, subtract from top

    const ringIndices = [];

    for (let i = 0; i <= totalSegments; i++) {
        const currentAngle = (cw ? -1 : 1) * i * angleStep;
        const currentZ = zTop - (i * zStep);

        const cosA = Math.cos(currentAngle);
        const sinA = Math.sin(currentAngle);

        // Inner and Outer radii
        const rInner = radius - width / 2;
        const rOuter = radius + width / 2;

        // Height of the tunnel cross-section (along Z)
        // ALIGNMENT FIX: Treat currentZ as CENTER, not Floor, to match createBox tunnels.
        const floorZ = currentZ - height / 2;
        const ceilZ = currentZ + height / 2;

        const startIdx = writer.points.length;
        ringIndices.push(startIdx);

        // 4 corners of the section (Radial in XY plane)
        // 0: Inner Top
        writer.addPoint(rInner * cosA + cx, rInner * sinA + cy, ceilZ);
        // 1: Outer Top
        writer.addPoint(rOuter * cosA + cx, rOuter * sinA + cy, ceilZ);
        // 2: Outer Bottom
        writer.addPoint(rOuter * cosA + cx, rOuter * sinA + cy, floorZ);
        // 3: Inner Bottom
        writer.addPoint(rInner * cosA + cx, rInner * sinA + cy, floorZ);
    }

    for (let i = 0; i < totalSegments; i++) {
        const base = ringIndices[i];
        const next = ringIndices[i + 1];

        writer.addPoly([base + 0, base + 1, next + 1, next + 0]); // Top
        writer.addPoly([base + 1, base + 2, next + 2, next + 1]); // Outer
        writer.addPoly([base + 2, base + 3, next + 3, next + 2]); // Bottom
        writer.addPoly([base + 3, base + 0, next + 0, next + 3]); // Inner
    }
}

// --- MAIN CONFIG ---
const outDir = __dirname;
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Constants for DGR Logic
const DEPTH = -500; // Repository level
const SURFACE = 0;  // Surface level

// Initialize writers for repeated components
const canister = new VtpWriter();
const fuel = new VtpWriter();
const buffer = new VtpWriter();
const plate = new VtpWriter();

// Note: Geometry generation for these is moved into the hole loop below to populate all holes.

// --- LAYOUT GENERATION ---
// Optimized Layout: Single Central Hub, Single Shaft.
const layout = {
    centralY: 150,     // Single Central Hub Position
    mainLen: 400,      // EXTENDED: Deposition Spine Length (for 15 tunnels)
    mainWid: 8,
    depTunLen: 180,    // 3x length
    depTunSpacing: 25,
    depTunWid: 5,
    depTunHei: 5,
    holeSpacing: 8,
    holeDepth: 8,
    holeRadius: 0.9
};

const holes = new VtpWriter();
const depTunnels = new VtpWriter();
const mainTun = new VtpWriter();

// 1. Central Area (The Only Hub)
// Logistics, Shaft Landing, Ramp Entry all in one place.
const central = new VtpWriter();
createBox(central, 60, 40, 15, 0, layout.centralY, DEPTH);
central.save(path.join(outDir, 'central_area.vtp'));

// 2. Transport Tunnel (Central to Deposition)
// Connects Central (130 edge) to Spine (80 edge)
createBox(mainTun, 10, 50, 8, 0, 105, DEPTH);

// 3. Deposition Spine (Main Tunnel)
// Top Y = 80. Length = 400.
// Center Y = 80 - (400/2) = -120.
const spineCenterY = 80 - (layout.mainLen / 2);
createBox(mainTun, 10, layout.mainLen, 8, 0, spineCenterY, DEPTH);
mainTun.save(path.join(outDir, 'main_tunnel.vtp'));

// 4. Deposition Tunnels & Holes
// Start from bottom of spine
const startY = (spineCenterY - (layout.mainLen / 2)) + 20;

// Helper: Generate components for a single hole
function generateHoleComponents(hx, hy) {
    const holeTopZ = DEPTH - (layout.depTunHei / 2);
    const holeCenterZ = holeTopZ - (layout.holeDepth / 2);
    const plateZ = holeCenterZ - (layout.holeDepth / 2) + 0.1;

    createCylinderZ(holes, layout.holeRadius, layout.holeDepth, 12, hx, hy, holeCenterZ);
    createCylinderZ(buffer, 0.875, 7, 12, hx, hy, holeCenterZ);
    createCylinderZ(canister, 0.525, 4.8, 12, hx, hy, holeCenterZ);
    createBox(fuel, 0.3, 0.3, 4.4, hx, hy, holeCenterZ);
    createCylinderZ(plate, 0.85, 0.15, 12, hx, hy, plateZ);
}

const plug = new VtpWriter();

for (let i = 0; i < 15; i++) {
    const yPos = startY + (i * layout.depTunSpacing);

    // Right Tunnel
    const rTunX = (layout.mainWid / 2) + (layout.depTunLen / 2);
    createBox(depTunnels, layout.depTunLen, 5, 5, rTunX, yPos, DEPTH);

    // Left Tunnel
    const lTunX = -((layout.mainWid / 2) + (layout.depTunLen / 2));
    createBox(depTunnels, layout.depTunLen, 5, 5, lTunX, yPos, DEPTH);

    // Plugs
    createBox(plug, 4, 5.2, 5.2, (layout.mainWid / 2) + 2, yPos, DEPTH);
    createBox(plug, 4, 5.2, 5.2, -((layout.mainWid / 2) + 2), yPos, DEPTH);

    // Holes (Right)
    let holeStartX = (layout.mainWid / 2) + 10;
    let holesPerTun = Math.floor((layout.depTunLen - 15) / 8);
    for (let h = 0; h < holesPerTun; h++) {
        let hx = holeStartX + (h * 8);
        generateHoleComponents(hx, yPos);
    }
    // Holes (Left)
    let holeStartX_L = -((layout.mainWid / 2) + 10);
    for (let h = 0; h < holesPerTun; h++) {
        let hx = holeStartX_L - (h * 8);
        generateHoleComponents(hx, yPos);
    }
}

holes.save(path.join(outDir, 'deposition_hole.vtp'));
depTunnels.save(path.join(outDir, 'deposition_tunnel.vtp'));
plug.save(path.join(outDir, 'end_plug.vtp'));

// Save Populated Components
canister.save(path.join(outDir, 'canister.vtp'));
fuel.save(path.join(outDir, 'fuel_assembly.vtp'));
buffer.save(path.join(outDir, 'buffer.vtp'));
plate.save(path.join(outDir, 'bottom_plate.vtp'));

// 10. Access Ramp (Spiral)
const ramp = new VtpWriter();
// Safety Update: Move Spiral North to avoid encircling the shaft.
// Shaft at Y=150. Central Area extends to Y=170.
// Spiral Radius 50. Let's place Center at Y=260.
// Spiral Extent: Y=210 to Y=310. Clearance ~40m from Central Area.
const rampCenterY = 260;

// Spiral centered at (0, 260). Ends at X=50, Y=260, Z=DEPTH (Angle 0).
// CW Rotation (true) so it exits Tangent South at (50, 260).
createSpiralRampZ(ramp, 50, 8, 8, 500, 3, SURFACE, 0, rampCenterY, true);

// Ramp Connectors (L-Shape to Central Area):
// 1. Southbound Tunnel: From Spiral Exit (X=50, Y=260) down to Y=150 line.
// Center Y = (260 + 150) / 2 = 205. Length = 110.
createBox(ramp, 8, 120, 8, 50, 205, DEPTH);

// 2. Westbound Entry: Connect Southbound Tunnel (X=50) to Central Area (Box edge X=30).
// Center X = 40. Y = 150.
createBox(ramp, 25, 8, 8, 40, layout.centralY, DEPTH);

ramp.save(path.join(outDir, 'access_ramp.vtp'));

// 11. Shafts
const shafts = new VtpWriter();
// Single Main Shaft in the center of the hub (Y=150)
createCylinderZ(shafts, 4, 500, 24, 0, layout.centralY, -250);
shafts.save(path.join(outDir, 'shafts.vtp'));

// 12. Surface Facilities (Ground & Buildings)
const surface = new VtpWriter();

// A. Ground Plane (Area)
// Reverted to compact size to focus only on buildings, ignoring underground extent.
createBox(surface, 200, 250, 1, 0, 200, -0.5);

// B. Shaft Headframe (Tall building above shaft at Y=150)
createBox(surface, 15, 15, 30, 0, layout.centralY, 15);

// C. Ramp Access Building (North, above ramp spiral start)
// Entrance at X=50, Y=260.
createBox(surface, 20, 30, 10, 50, 260, 5);

// D. Administration & Support Buildings
// Office (West of shaft)
createBox(surface, 20, 40, 12, -40, 150, 6);
// Workshop (East of shaft)
createBox(surface, 20, 60, 10, 40, 150, 5);
// Misc buildings
createBox(surface, 10, 20, 8, -40, 190, 4);
createBox(surface, 15, 25, 8, -40, 110, 4);

surface.save(path.join(outDir, 'surface_facilities.vtp'));

// 12. Host Rock (Giant Box)
const rock = new VtpWriter();
// From Z=50 (hills) to Z=-600. Center = -275. Height = 650.
createBox(rock, 1000, 1000, 650, 0, 0, -275);
rock.save(path.join(outDir, 'host_rock.vtp'));
