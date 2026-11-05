import type * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { MeshBVH } from "three-mesh-bvh";
import { createGemMaterial, disposeGemMaterial } from "./ring-gem";

type Three = typeof THREE;

// Hình nhẫn đọc từ file .glb (public/models/ring.glb, xuất từ WebGi/iJewel, hình nén Draco). File chỉ cho hình dáng: chất liệu
// trong file là loại riêng của WebGi mà three.js không dựng lại được, nên kim loại và đá dùng chất liệu riêng ở cuối file này
// (thông số chép từ chất liệu trong file).
// Đơn vị cảnh: trục ngón tay là Z, đỉnh nhẫn hướng +Y (file đã đặt sẵn theo hướng này). Nhẫn được co giãn cho cao bằng RING_H,
// đáy ở RING_BOTTOM: đúng chỗ chiếc nhẫn dựng bằng code trước đây, để khung camera và các hiệu ứng của cảnh giữ nguyên.
const RING_H = 3.87;
const RING_BOTTOM = -1.51;

// Bộ giải nén Draco tự phục vụ trong public/draco (chép từ three/examples/jsm/libs/draco/gltf), không gọi CDN ngoài.
const DRACO_PATHS = { js: "/draco/draco_wasm_wrapper.js", wasm: "/draco/draco_decoder.wasm" };

// Góc (độ) tối thiểu giữa hai mặt kề nhau để cạnh chung thành nét lưới. Kim loại của mô hình cong mượt: từ khoảng 12° trở lên
// là mất hẳn chấu và hai cánh ở vai, còn dưới 8° chỉ dày thêm chứ không hiện thêm hình gì, nên lưới chính và lưới trong thấu
// kính dùng chung một ngưỡng. Mặt cắt kim cương phẳng nên mọi cạnh giữa hai mặt cắt đều vượt 1°, còn đường chéo chia mặt
// thành tam giác thì không.
const WIRE_ANGLE = 8;
const STONE_ANGLE = 1;

// Đá nhận theo chất liệu kim cương của WebGi (GLTFLoader đưa phần mở rộng lạ vào userData.gltfExtensions); file từ nguồn khác
// thì nhận theo tên node. Mọi mesh còn lại là kim loại.
const isStone = (mesh: THREE.Mesh) => {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return mats.some((m) => m.userData.gltfExtensions?.WEBGI_materials_diamond) || /diamond|gem|stone/i.test(mesh.name);
};

// Hình đá: mỗi tam giác giữ đỉnh riêng để có pháp tuyến phẳng đúng mặt cắt (chất liệu dò tia khúc xạ theo pháp tuyến này).
function stoneGeometry(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = src.index ? src.toNonIndexed() : src.clone();
  for (const name of Object.keys(g.attributes)) if (name !== "position") g.deleteAttribute(name);
  g.computeVertexNormals(); // không có index nên mỗi mặt phẳng một pháp tuyến
  return g;
}

// Nét lưới từ cạnh của hình: như EdgesGeometry của three.js (cạnh giữa hai mặt lệch nhau từ `angle` độ trở lên, cộng các cạnh
// hở, cùng độ làm tròn 1e-4 nên ra đúng chừng ấy nét), nhưng khoá cạnh bằng số thay vì ghép chuỗi cho từng cạnh. Với ~170
// nghìn tam giác kim loại, EdgesGeometry tốn hơn một giây và chặn luồng chính; cách này khoảng một phần năm.
function edgeLines(T3: Three, g: THREE.BufferGeometry, angle: number): THREE.BufferGeometry {
  const pos = g.getAttribute("position");
  const index = g.getIndex();
  // Gộp các đỉnh trùng vị trí (làm tròn 1e-4 như EdgesGeometry) thành một mã đỉnh.
  const ids = new Map<string, number>();
  const idOf = new Uint32Array(pos.count);
  const first: number[] = []; // đỉnh gốc đại diện cho mỗi mã
  for (let i = 0; i < pos.count; i++) {
    const key = `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
    let id = ids.get(key);
    if (id === undefined) {
      id = first.length;
      ids.set(key, id);
      first.push(i);
    }
    idOf[i] = id;
  }
  const n = first.length;
  const tris = (index ? index.count : pos.count) / 3;
  const normals = new Float32Array(tris * 3);
  // Cạnh có hướng u→v (khoá u·n + v) → tam giác đã gặp, chờ tam giác kề đi chiều ngược lại; -1 khi đã ghép xong.
  const open = new Map<number, number>();
  const pairs: number[] = []; // u, v, cos góc giữa hai mặt
  const a = new T3.Vector3();
  const b = new T3.Vector3();
  const c = new T3.Vector3();
  const nrm = new T3.Vector3();
  const vi = [0, 0, 0];
  const vid = [0, 0, 0];
  for (let t = 0; t < tris; t++) {
    for (let k = 0; k < 3; k++) {
      vi[k] = index ? index.getX(t * 3 + k) : t * 3 + k;
      vid[k] = idOf[vi[k]];
    }
    if (vid[0] === vid[1] || vid[1] === vid[2] || vid[2] === vid[0]) continue; // tam giác suy biến
    a.fromBufferAttribute(pos, vi[0]);
    b.fromBufferAttribute(pos, vi[1]);
    c.fromBufferAttribute(pos, vi[2]);
    T3.Triangle.getNormal(a, b, c, nrm);
    normals[t * 3] = nrm.x;
    normals[t * 3 + 1] = nrm.y;
    normals[t * 3 + 2] = nrm.z;
    for (let k = 0; k < 3; k++) {
      const u = vid[k];
      const v = vid[(k + 1) % 3];
      const back = open.get(v * n + u);
      if (back !== undefined && back >= 0) {
        pairs.push(u, v, nrm.x * normals[back * 3] + nrm.y * normals[back * 3 + 1] + nrm.z * normals[back * 3 + 2]);
        open.set(v * n + u, -1);
      } else if (!open.has(u * n + v)) {
        open.set(u * n + v, t);
      }
    }
  }
  const lim = Math.cos(T3.MathUtils.DEG2RAD * angle);
  const out: number[] = [];
  const push = (u: number, v: number) => {
    a.fromBufferAttribute(pos, first[u]);
    b.fromBufferAttribute(pos, first[v]);
    out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };
  for (let i = 0; i < pairs.length; i += 3) if (pairs[i + 2] <= lim) push(pairs[i], pairs[i + 1]);
  for (const [key, t] of open) if (t >= 0) push(Math.floor(key / n), key % n); // cạnh hở
  const lines = new T3.BufferGeometry();
  lines.setAttribute("position", new T3.Float32BufferAttribute(out, 3));
  return lines;
}

interface StoneFrame {
  ax: number; // trục đá (0, 1, 2 = x, y, z)
  mid: THREE.Vector3; // tâm hộp bao
  table: THREE.Vector3; // tâm mặt bàn
  r: number; // bán kính đai
  girdle: number; // toạ độ của đai trên trục đá
  rTable: number; // bán kính mặt bàn
}

// Khung của một hình đá, trong toạ độ riêng của hình. Trục đá là cạnh ngắn nhất của hộp bao; đầu mặt bàn phẳng nên có nhiều
// đỉnh nằm sát mặt hộp, đầu kia là chóp đáy chỉ có một điểm.
function stoneFrame(T3: Three, g: THREE.BufferGeometry): StoneFrame {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const size = b.getSize(new T3.Vector3()).toArray();
  const ax = size.indexOf(Math.min(...size));
  const lo = b.min.getComponent(ax);
  const hi = b.max.getComponent(ax);
  const eps = (hi - lo) * 0.02;
  const pos = g.getAttribute("position");
  let nLo = 0;
  let nHi = 0;
  for (let i = 0; i < pos.count; i++) {
    const v = pos.getComponent(i, ax);
    if (v < lo + eps) nLo++;
    else if (v > hi - eps) nHi++;
  }
  const mid = b.getCenter(new T3.Vector3());
  const top = nHi >= nLo ? hi : lo;
  const r = Math.max(...size.filter((_, i) => i !== ax)) / 2;
  // Đai: các đỉnh xa trục nhất (lấy trung bình độ cao vì đai có bề dày). Mặt bàn: đỉnh xa trục nhất trên mặt bàn.
  const v = new T3.Vector3();
  let gSum = 0;
  let gN = 0;
  let rTable = 0;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const h = v.getComponent(ax);
    const rad = v.sub(mid).setComponent(ax, 0).length();
    if (rad > 0.95 * r) {
      gSum += h;
      gN++;
    }
    if (Math.abs(h - top) < eps) rTable = Math.max(rTable, rad);
  }
  return { ax, mid, table: mid.clone().setComponent(ax, top), r, girdle: gN ? gSum / gN : mid.getComponent(ax), rTable };
}

// Nét đá nhỏ là ký hiệu như bản vẽ trang sức: vòng đai và vòng mặt bàn. Mỗi viên chỉ rộng vài pixel; vẽ đủ mặt cắt (gần 300
// nét, riêng phần đai đã có sáu vòng đỉnh) thì dải đá tấm thành một vệt sáng đặc.
function stoneSymbol(T3: Three, f: StoneFrame): THREE.BufferGeometry {
  const u = (f.ax + 1) % 3;
  const w = (f.ax + 2) % 3;
  const out: number[] = [];
  const p = new T3.Vector3();
  const ring = (h: number, r: number, n: number) => {
    for (let i = 0; i < n; i++) {
      for (const k of [i, i + 1]) {
        const a = (k / n) * Math.PI * 2;
        p.copy(f.mid).setComponent(f.ax, h);
        p.setComponent(u, p.getComponent(u) + r * Math.cos(a));
        p.setComponent(w, p.getComponent(w) + r * Math.sin(a));
        out.push(p.x, p.y, p.z);
      }
    }
  };
  ring(f.girdle, f.r, 16);
  ring(f.table.getComponent(f.ax), f.rTable, 8);
  const g = new T3.BufferGeometry();
  g.setAttribute("position", new T3.Float32BufferAttribute(out, 3));
  return g;
}

// ─── Lắp ráp ─────────────────────────────────────────────────────────────────

interface Part {
  geo: THREE.BufferGeometry;
  wire: THREE.BufferGeometry;
  fine: THREE.BufferGeometry; // lưới cho thấu kính (hiện dùng chung với wire, xem WIRE_ANGLE)
  kind: "metal" | "stone";
  m?: THREE.Matrix4;
  bvh?: MeshBVH; // đá: để chất liệu dò tia bên trong
}

export interface RingParts {
  parts: Part[];
  // Đá nhỏ: mỗi hình đá trong file vẽ một lần theo instance.
  small: { geo: THREE.BufferGeometry; matrices: THREE.Matrix4[]; bvh: MeshBVH }[];
  // Ký hiệu (vòng đai, vòng mặt bàn) của mọi đá nhỏ gộp thành một lưới đường duy nhất (đã đặt sẵn vào toạ độ nhẫn).
  smallWire: THREE.BufferGeometry;
  glints: [number, number, number][];
  dispose(): void;
}

// Đọc file nhẫn (.glb) đã tải về. Toàn bộ kim loại gộp thành một mesh; viên đá lớn nhất là viên chủ (chất liệu đá hai lớp),
// các viên còn lại vẽ theo instance.
export async function loadRingParts(T3: Three, data: ArrayBuffer): Promise<RingParts> {
  const draco = new DRACOLoader().setDecoderPath(DRACO_PATHS);
  let scene: THREE.Group;
  try {
    scene = (await new GLTFLoader().setDRACOLoader(draco).parseAsync(data, "")).scene;
  } finally {
    draco.dispose(); // đóng các worker giải nén
  }
  scene.updateMatrixWorld(true);

  const metal: THREE.BufferGeometry[] = [];
  const stones: { src: THREE.BufferGeometry; m: THREE.Matrix4 }[] = [];
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.geometry.getAttribute("position").count < 3) return;
    if (isStone(mesh)) {
      stones.push({ src: mesh.geometry, m: mesh.matrixWorld.clone() });
      return;
    }
    const g = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal") g.deleteAttribute(name);
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    metal.push(g);
  });
  if (!metal.length) throw new Error("ring.glb: không có phần kim loại");

  // mergeGeometries cần mọi hình cùng có hoặc cùng không có index.
  const indexed = metal.every((g) => g.index);
  const metalGeo = mergeGeometries(indexed ? metal : metal.map((g) => (g.index ? g.toNonIndexed() : g)));
  metal.forEach((g) => g.dispose());
  if (!metalGeo) throw new Error("ring.glb: không gộp được phần kim loại");

  // Co giãn và dời cả nhẫn vào đúng chỗ chiếc nhẫn cũ.
  metalGeo.computeBoundingBox();
  const box = metalGeo.boundingBox!.clone();
  for (const s of stones) {
    s.src.computeBoundingBox();
    box.union(s.src.boundingBox!.clone().applyMatrix4(s.m));
  }
  const k = RING_H / (box.max.y - box.min.y);
  const fit = new T3.Matrix4()
    .makeTranslation(-k * (box.min.x + box.max.x) / 2, RING_BOTTOM - k * box.min.y, -k * (box.min.z + box.max.z) / 2)
    .multiply(new T3.Matrix4().makeScale(k, k, k));
  metalGeo.applyMatrix4(fit);
  stones.forEach((s) => s.m.premultiply(fit));

  const owned = new Set<THREE.BufferGeometry>([metalGeo]);
  const own = <G extends THREE.BufferGeometry>(g: G) => {
    owned.add(g);
    return g;
  };
  const wire = own(edgeLines(T3, metalGeo, WIRE_ANGLE));
  const parts: Part[] = [{ geo: metalGeo, wire, fine: wire, kind: "metal" }];

  // Mỗi hình đá trong file chỉ chuẩn bị một lần (hình, BVH, nét, khung), dùng chung cho mọi viên cùng hình.
  type Shape = { geo: THREE.BufferGeometry; bvh: MeshBVH; f: StoneFrame; symbol: THREE.BufferGeometry };
  const shapes = new Map<THREE.BufferGeometry, Shape>();
  const shapeOf = (src: THREE.BufferGeometry) => {
    let s = shapes.get(src);
    if (!s) {
      const f = stoneFrame(T3, src);
      const geo = own(stoneGeometry(src));
      s = { geo, bvh: new MeshBVH(geo), f, symbol: stoneSymbol(T3, f) };
      shapes.set(src, s);
    }
    return s;
  };
  // Viên to nhất (theo bề ngang hộp bao trong toạ độ nhẫn) xếp đầu: viên chủ, rồi tới các viên phụ lớn kế tiếp.
  const width = (s: (typeof stones)[number]) => s.src.boundingBox!.clone().applyMatrix4(s.m).getSize(new T3.Vector3()).x;
  stones.sort((a, b) => width(b) - width(a));

  const glints: [number, number, number][] = [];
  const [main, ...rest] = stones;
  if (main) {
    const s = shapeOf(main.src);
    const edges = own(edgeLines(T3, s.geo, STONE_ANGLE));
    parts.push({ geo: s.geo, wire: edges, fine: edges, kind: "stone", m: main.m, bvh: s.bvh });
    // Ba tia lóe trên vương miện viên chủ (mặt bàn hướng +Y), giữ đúng chỗ như ở chiếc nhẫn cũ: các hệ số tính cho đá bán
    // kính 0,56, nhân K cho vừa viên này, đo từ tâm đai.
    const g = s.f.mid.clone().setComponent(s.f.ax, s.f.girdle).applyMatrix4(main.m);
    const K = width(main) / 2 / 0.56;
    glints.push(
      [g.x - 0.16 * K, g.y + 0.2 * K, g.z + 0.2 * K],
      [g.x + 0.2 * K, g.y + 0.12 * K, g.z + 0.42 * K],
      [g.x + 0.02 * K, g.y + 0.05 * K, g.z + 0.6 * K],
    );
  }
  // Thêm một tia trên mặt bàn hai viên lớn kế tiếp (nhô ra khỏi mặt bàn một chút để không bị chính viên đá che).
  for (const st of rest.slice(0, 2)) {
    const { f } = shapeOf(st.src);
    const p = f.table.clone().sub(f.mid).multiplyScalar(1.25).add(f.mid).applyMatrix4(st.m);
    glints.push([p.x, p.y, p.z]);
  }

  const groups = new Map<Shape, THREE.Matrix4[]>();
  for (const st of rest) {
    const s = shapeOf(st.src);
    groups.set(s, [...(groups.get(s) ?? []), st.m]);
  }
  const wirePts: number[] = [];
  const v = new T3.Vector3();
  for (const st of rest) {
    const pos = shapeOf(st.src).symbol.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(st.m);
      wirePts.push(v.x, v.y, v.z);
    }
  }
  const smallWire = own(new T3.BufferGeometry());
  smallWire.setAttribute("position", new T3.Float32BufferAttribute(wirePts, 3));

  // Hình và chất liệu gốc của file không còn dùng tới (hình đã được chép sang các hình ở trên).
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh && !(o as THREE.Points).isPoints) return;
    mesh.geometry.dispose();
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
  });

  return {
    parts,
    small: [...groups].map(([{ geo, bvh }, matrices]) => ({ geo, matrices, bvh })),
    smallWire,
    glints,
    dispose() {
      owned.forEach((g) => g.dispose());
    },
  };
}

export interface RingMaterials {
  metal: THREE.MeshPhysicalMaterial;
  gems: Map<MeshBVH, THREE.ShaderMaterial>; // mỗi hình đá một chất liệu (dò tia trên BVH của hình đó)
  all: THREE.Material[];
  dispose(): void;
}

// Vàng trắng đánh bóng theo đúng chất liệu kim loại trong file (WebGi "whitegold polished": màu 0,658 tuyến tính, độ nhám
// 0,05); đá là chất liệu dò tia (ring-gem.ts). env: môi trường đã lọc (PMREM) cho kim loại; gemEnv: môi trường cube cho đá.
export function createRingMaterials(T3: Three, rp: RingParts, env: THREE.Texture, gemEnv: THREE.Texture): RingMaterials {
  const metal = new T3.MeshPhysicalMaterial({
    color: new T3.Color().setRGB(0.658, 0.658, 0.658, T3.LinearSRGBColorSpace),
    metalness: 1,
    roughness: 0.05,
    side: T3.DoubleSide, // file đánh dấu kim loại là hai mặt (doubleSided): vài phần là vỏ mỏng, nhìn được cả hai mặt
    envMap: env,
    envMapIntensity: 1,
  });
  const gems = new Map<MeshBVH, THREE.ShaderMaterial>();
  for (const { bvh } of [...rp.parts, ...rp.small]) {
    if (bvh && !gems.has(bvh)) gems.set(bvh, createGemMaterial(T3, bvh, gemEnv));
  }
  return {
    metal,
    gems,
    all: [metal, ...gems.values()],
    dispose() {
      metal.dispose();
      gems.forEach(disposeGemMaterial);
    },
  };
}

export function createSolid(T3: Three, rp: RingParts, mats: RingMaterials): THREE.Group {
  const group = new T3.Group();
  for (const p of rp.parts) {
    const mesh = new T3.Mesh(p.geo, p.bvh ? mats.gems.get(p.bvh) : mats.metal);
    if (p.m) mesh.applyMatrix4(p.m);
    group.add(mesh);
  }
  for (const { geo, matrices, bvh } of rp.small) {
    const im = new T3.InstancedMesh(geo, mats.gems.get(bvh), matrices.length);
    matrices.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    group.add(im);
  }
  return group;
}

export function createWire(
  T3: Three,
  rp: RingParts,
  material: THREE.LineBasicMaterial,
  fine?: THREE.LineBasicMaterial,
): THREE.Group {
  const group = new T3.Group();
  for (const p of rp.parts) {
    const line = new T3.LineSegments(fine ? p.fine : p.wire, material);
    if (p.m) line.applyMatrix4(p.m);
    group.add(line);
  }
  const small = new T3.LineSegments(rp.smallWire, material);
  small.frustumCulled = false;
  group.add(small);
  return group;
}
