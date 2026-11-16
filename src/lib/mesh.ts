// Mesh analysis for 3D print quoting. Runs in the browser (instant quote)
// and on the server (authoritative re-check before an order is created).
// Supports binary STL, ASCII STL and OBJ. Units are whatever the file uses;
// the caller applies the unit scale (mm or inch).

export type MeshStats = {
  triangles: number;
  volume: number; // cubic file-units (mm³ when the file is in mm)
  size: { x: number; y: number; z: number };
  positions: Float32Array; // flat xyz triangle soup, for preview rendering
};

export class MeshError extends Error {}

function finish(positions: Float32Array): MeshStats {
  const n = positions.length / 9;
  if (n === 0) throw new MeshError("The file has no triangles.");
  let vol = 0;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i], ay = positions[i + 1], az = positions[i + 2];
    const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5];
    const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8];
    // signed volume of the tetrahedron (origin, a, b, c)
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    for (let k = 0; k < 9; k += 3) {
      const x = positions[i + k], y = positions[i + k + 1], z = positions[i + k + 2];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
  }
  return {
    triangles: n,
    volume: Math.abs(vol),
    size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ },
    positions,
  };
}

function parseBinarySTL(buf: ArrayBuffer): MeshStats {
  const view = new DataView(buf);
  const count = view.getUint32(80, true);
  if (84 + count * 50 > buf.byteLength) throw new MeshError("The STL file looks truncated.");
  const out = new Float32Array(count * 9);
  let o = 0;
  for (let t = 0; t < count; t++) {
    const base = 84 + t * 50 + 12; // skip normal
    for (let k = 0; k < 9; k++) out[o++] = view.getFloat32(base + k * 4, true);
  }
  return finish(out);
}

function parseAsciiSTL(text: string): MeshStats {
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  const vals: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) vals.push(+m[1], +m[2], +m[3]);
  if (vals.length % 9 !== 0) throw new MeshError("The ASCII STL has an incomplete triangle.");
  return finish(new Float32Array(vals));
}

function parseOBJ(text: string): MeshStats {
  const verts: number[] = [];
  const tris: number[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("v ")) {
      const p = line.split(/\s+/);
      verts.push(+p[1], +p[2], +p[3]);
    } else if (line.startsWith("f ")) {
      const idx = line
        .split(/\s+/)
        .slice(1)
        .map((tok) => {
          const i = parseInt(tok.split("/")[0], 10);
          return i < 0 ? verts.length / 3 + i : i - 1;
        });
      for (let k = 1; k + 1 < idx.length; k++) {
        for (const vi of [idx[0], idx[k], idx[k + 1]]) {
          tris.push(verts[vi * 3], verts[vi * 3 + 1], verts[vi * 3 + 2]);
        }
      }
    }
  }
  if (tris.some((v) => Number.isNaN(v))) throw new MeshError("The OBJ file references missing vertices.");
  return finish(new Float32Array(tris));
}

export function analyzeMesh(fileName: string, buf: ArrayBuffer): MeshStats {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext === "obj") return parseOBJ(new TextDecoder().decode(buf));
  if (ext !== "stl") throw new MeshError("Upload an .stl or .obj file.");
  if (buf.byteLength < 84) throw new MeshError("The STL file is too small to be valid.");
  // Binary STLs can start with "solid" too, so trust the size check first.
  const count = new DataView(buf).getUint32(80, true);
  if (84 + count * 50 === buf.byteLength) return parseBinarySTL(buf);
  const head = new TextDecoder().decode(buf.slice(0, 512));
  if (/^\s*solid/i.test(head)) return parseAsciiSTL(new TextDecoder().decode(buf));
  return parseBinarySTL(buf);
}

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB
