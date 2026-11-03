import type * as THREE from "three";

type Three = typeof THREE;

// Mô hình nhẫn cầu hôn cổ điển (theo ảnh mẫu của Hoàng): viên kim cương tròn cắt brilliant (nhỏ, ~22% đường kính nhẫn) trên 4 chấu
// cao đầu tròn; bên dưới là cụm vòng dây dày xỏ vào nhau như nút thắt, cùng một viên đá nhỏ giữ bằng ba hạt ở chân cụm; hai tấm
// pavé hình chiếc lá ôm hai bên đầu nhẫn; thân nhẫn mảnh có viền hạt milgrain chạy suốt hai mép, thắt lại ở các mối dây quấn xen
// giữa những đoạn thân tròn bóng.
// Đơn vị cảnh: lòng nhẫn bán kính 1,41 (≈ 17 mm, 1 đơn vị ≈ 6 mm). Trục ngón tay là Z, đỉnh nhẫn hướng +Y.

const R = 1.45; // bán kính đường tâm thân nhẫn
const T_BASE = 0.072; // độ dày thân ở đáy nhẫn
const T_HEAD = 0.1; // phần dày thêm ở vai
const W_BASE = 0.17; // bề rộng thân (dọc ngón) ở đáy
const W_HEAD = 0.16; // phần rộng thêm ở vai
const SPREAD = 0.95; // độ rộng (rad) của đoạn thân nâng lên quanh đỉnh
const R_IN = R - T_BASE / 2; // lòng nhẫn giữ cố định, chỉ mặt ngoài dày lên ở vai

// Vị trí (|φ|, rad) của các mối dây quấn ở mỗi bên thân. Giữa hai mối thân phồng lên như chiếc đèn lồng, tại mối thì thắt lại;
// khoảng cách chọn sao cho đáy nhẫn (φ = π) rơi đúng giữa một đoạn phồng, nên thân liền mạch qua đáy.
const KNOT0 = 1.2;
const SPACING = (Math.PI - KNOT0) / 2.5;
const KNOTS = [KNOT0, KNOT0 + SPACING, KNOT0 + 2 * SPACING];
const waist = (phi: number) => KNOTS.reduce((s, k) => s + Math.exp(-(((Math.abs(phi) - k) / 0.08) ** 2)), 0);
// 0 tại mối, 1 giữa hai mối; chỉ bắt đầu từ sau vai (|φ| > 0.95) để phần ôm đầu nhẫn không bị ảnh hưởng.
const lantern = (phi: number) => {
  const a = Math.abs(phi);
  const t = Math.min(1, Math.max(0, (a - 0.95) / 0.25));
  return t * t * (3 - 2 * t) * 0.5 * (1 - Math.cos((2 * Math.PI * (a - KNOT0)) / SPACING));
};

const bump = (phi: number) => Math.exp(-((phi / SPREAD) ** 2));
const thick = (phi: number) => (T_BASE + T_HEAD * bump(phi)) * (1 - 0.12 * waist(phi) + 0.18 * lantern(phi));
const width = (phi: number) => (W_BASE + W_HEAD * bump(phi)) * (1 - 0.22 * waist(phi) + 0.22 * lantern(phi));

export const R_TOP = R_IN + thick(0); // bán kính ngoài ở đỉnh nhẫn
// Bán kính viên đá chính. Ảnh mẫu: viên đá chỉ rộng ~22% đường kính ngoài của nhẫn (đo trên ảnh nhìn thẳng), tức đường kính
// ~0,7 đơn vị cảnh (≈ 4,5 mm); bản trước dùng 0,58 nên viên đá to gần gấp đôi.
export const STONE_R = 0.4;
const K = STONE_R / 0.56; // dùng cho vị trí tia lóe, tính theo đá bán kính 0,56
// Mọi kích thước của cụm đầu nhẫn (chấu, vòng dây, cổ, đá nhỏ) được vẽ theo đá bán kính 0,58 rồi nhân HS để vừa viên đá thật.
const HS = STONE_R / 0.58;
const HEAD_H = 0.92 * HS; // đai (girdle) viên đá chính cao hơn mặt trên thân nhẫn chừng này (hạ thấp từ 1,1 cho gần thân hơn)
export const STONE_Y = R_TOP + HEAD_H; // cao độ đai (girdle) viên đá chính

// Tấm pavé hình lá: nằm trên vai, từ φ = LEAF0 tới LEAF1 mỗi bên.
const LEAF0 = 0.26;
const LEAF1 = 1.0;
const LEAF_HALF_W = 0.14;

// ─── Thân nhẫn ────────────────────────────────────────────────────────────────

// Một điểm trên tiết diện siêu-elip quét dọc đường tròn. Lòng nhẫn (c < 0) bo tròn hơn cho đúng kiểu comfort-fit.
function bandPoint(phi: number, a: number): [number, number, number] {
  const t = thick(phi);
  const w = width(phi);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const n = c < 0 ? 2.3 : 3.6;
  const x = Math.sign(c) * Math.abs(c) ** (2 / n);
  const y = Math.sign(s) * Math.abs(s) ** (2 / n);
  const rc = R_IN + t / 2 + (x * t) / 2;
  return [Math.sin(phi) * rc, Math.cos(phi) * rc, (y * w) / 2];
}

// Bán kính mặt ngoài của thân tại độ lệch z dọc ngón (tấm pavé đặt lên đúng mặt này).
function bandTop(phi: number, z: number): number {
  const t = thick(phi);
  const y = Math.min(1, Math.abs(z) / (width(phi) / 2));
  return R_IN + t / 2 + (t / 2) * (1 - y ** 3.6) ** (1 / 3.6);
}

function bandVertices(segs: number, prof: number): Float32Array {
  const out = new Float32Array(segs * prof * 3);
  for (let i = 0; i < segs; i++) {
    const phi = -Math.PI + (i / segs) * Math.PI * 2;
    for (let k = 0; k < prof; k++) {
      out.set(bandPoint(phi, (k / prof) * Math.PI * 2), (i * prof + k) * 3);
    }
  }
  return out;
}

function bandGeometry(T3: Three, segs: number, prof: number): THREE.BufferGeometry {
  const idx: number[] = [];
  for (let i = 0; i < segs; i++) {
    const i2 = (i + 1) % segs;
    for (let k = 0; k < prof; k++) {
      const k2 = (k + 1) % prof;
      const a = i * prof + k;
      const b = i2 * prof + k;
      const c = i2 * prof + k2;
      const d = i * prof + k2;
      idx.push(a, d, b, b, d, c);
    }
  }
  const g = new T3.BufferGeometry();
  g.setAttribute("position", new T3.BufferAttribute(bandVertices(segs, prof), 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Lưới bản vẽ của thân nhẫn: chỉ vẽ cạnh ô lưới (không có đường chéo tam giác) cho giống bản vẽ kỹ thuật.
function bandWire(T3: Three, segs: number, prof: number, ringEvery: number): THREE.BufferGeometry {
  const v = bandVertices(segs, prof);
  const pts: number[] = [];
  const at = (i: number, k: number) => ((i % segs) * prof + (k % prof)) * 3;
  const seg = (p: number, q: number) => pts.push(v[p], v[p + 1], v[p + 2], v[q], v[q + 1], v[q + 2]);
  for (let i = 0; i < segs; i++) {
    for (let k = 0; k < prof; k++) {
      seg(at(i, k), at(i + 1, k));
      if (i % ringEvery === 0) seg(at(i, k), at(i, k + 1));
    }
  }
  const g = new T3.BufferGeometry();
  g.setAttribute("position", new T3.Float32BufferAttribute(pts, 3));
  return g;
}

// ─── Kim cương tròn cắt brilliant (bán kính đai = 1, mặt bàn hướng +Y) ───────────────

// Mỗi mặt cắt có một sắc (trắng, lam, vàng cam, tím) để ánh phản chiếu ngả màu như "lửa" (tán sắc) của kim cương.
// Ảnh mẫu đo được: chỉ khoảng 10% điểm có màu rõ, còn lại trắng xám, nên phần lớn mặt để trắng và sắc chỉ rất nhẹ.
const FIRE = [
  [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1],
  [0.78, 0.88, 1], [1, 0.9, 0.8], [0.9, 0.84, 1],
];

function diamondGeometry(T3: Three): THREE.BufferGeometry {
  const rt = 0.56; // bán kính mặt bàn
  const rs = 0.8; // bán kính điểm sao
  const rp = 0.78; // bán kính điểm gãy của mặt đáy
  const gTop = 0.025;
  const gBot = -0.025;
  const yt = gTop + 0.3; // mặt bàn
  const depth = 0.863; // góc đáy ≈ 40,75°
  const c8 = Math.cos(Math.PI / 8);
  // Độ cao điểm sao / điểm gãy tính cho mặt thoi (kite) nằm phẳng thật.
  const ys = gTop + (0.3 * (1 - rs * c8)) / (1 - rt);
  const yp = gBot - depth * (1 - rp * c8);

  type V = [number, number, number];
  const mod = (k: number, n: number) => ((k % n) + n) % n;
  const pt = (r: number, y: number, ang: number): V => [r * Math.cos(ang), y, r * Math.sin(ang)];
  const Tb = (k: number) => pt(rt, yt, (mod(k, 8) * Math.PI) / 4);
  const S = (k: number) => pt(rs, ys, ((mod(k, 8) + 0.5) * Math.PI) / 4);
  const G = (j: number) => pt(1, gTop, (mod(j, 16) * Math.PI) / 8);
  const H = (j: number) => pt(1, gBot, (mod(j, 16) * Math.PI) / 8);
  const P = (k: number) => pt(rp, yp, ((mod(k, 8) + 0.5) * Math.PI) / 4);
  const C: V = [0, gBot - depth, 0];
  const Tc: V = [0, yt, 0];
  const inside: V = [0, -0.3, 0];

  const pos: number[] = [];
  const col: number[] = [];
  let n = 0;
  // Mỗi tam giác tự quay về hướng ra ngoài (viên đá lồi nên so với một điểm bên trong là đủ).
  const tri = (a: V, b: V, c: V) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (a[0] + b[0] + c[0]) / 3 - inside[0];
    const my = (a[1] + b[1] + c[1]) / 3 - inside[1];
    const mz = (a[2] + b[2] + c[2]) / 3 - inside[2];
    const [p, q] = nx * mx + ny * my + nz * mz >= 0 ? [b, c] : [c, b];
    pos.push(...a, ...p, ...q);
    const f = FIRE[(n * 5 + 3) % FIRE.length];
    for (let i = 0; i < 3; i++) col.push(...f);
    n++;
  };

  for (let k = 0; k < 8; k++) {
    tri(Tc, Tb(k), Tb(k + 1)); // mặt bàn
    tri(Tb(k), Tb(k + 1), S(k)); // mặt sao
    tri(Tb(k), S(k), G(2 * k)); // mặt thoi trên (kite = 2 tam giác)
    tri(Tb(k), G(2 * k), S(k - 1));
    tri(S(k), G(2 * k), G(2 * k + 1)); // mặt đai trên
    tri(S(k), G(2 * k + 1), G(2 * k + 2));
    tri(C, P(k - 1), H(2 * k)); // mặt thoi đáy
    tri(C, H(2 * k), P(k));
    tri(P(k), H(2 * k), H(2 * k + 1)); // mặt đai dưới
    tri(P(k), H(2 * k + 1), H(2 * k + 2));
  }
  for (let j = 0; j < 16; j++) {
    tri(G(j), G(j + 1), H(j)); // đai
    tri(G(j + 1), H(j + 1), H(j));
  }

  const g = new T3.BufferGeometry();
  g.setAttribute("position", new T3.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new T3.Float32BufferAttribute(col, 3));
  g.computeVertexNormals(); // không có index nên mỗi mặt phẳng một pháp tuyến: ra đúng dạng đá cắt
  return g;
}

// ─── Lắp ráp ─────────────────────────────────────────────────────────────────

interface Part {
  geo: THREE.BufferGeometry;
  wire: THREE.BufferGeometry;
  fine: THREE.BufferGeometry; // lưới dày hơn cho thấu kính
  kind: "metal" | "stone";
  m?: THREE.Matrix4;
}

export interface RingParts {
  parts: Part[];
  // Toàn bộ đá nhỏ (trên hai tấm lá): cùng một hình, vẽ một lần theo instance.
  small: { geo: THREE.BufferGeometry; matrices: THREE.Matrix4[]; wire: THREE.BufferGeometry };
  // Hạt milgrain viền hai mép thân và viền hai tấm lá.
  beads: { geo: THREE.BufferGeometry; matrices: THREE.Matrix4[] };
  glints: [number, number, number][];
  dispose(): void;
}

// Đường chấu (khoảng cách tới trục viên đá, độ cao so với đai; đơn vị cảnh): từ chân trong cổ đầu nhẫn, thẳng lên gần như
// đứng, hơi phình ra ở đai rồi cúi lên mép vương miện. Chừa khe với đáy viên đá (bán kính đá 0,58).
const PRONG: [number, number][] = [
  [0.15, -0.95],
  [0.2, -0.8],
  [0.3, -0.62],
  [0.42, -0.44],
  [0.52, -0.26],
  [0.585, -0.1],
  [0.62, 0.0],
  [0.605, 0.07],
  [0.53, 0.11],
];

const PRONGS = 4;

export function createRingParts(T3: Three): RingParts {
  const parts: Part[] = [];
  const owned: THREE.BufferGeometry[] = [];
  const own = <G extends THREE.BufferGeometry>(g: G): G => {
    owned.push(g);
    return g;
  };
  const wf = (g: THREE.BufferGeometry) => own(new T3.WireframeGeometry(g));

  // Thân nhẫn
  parts.push({
    geo: own(bandGeometry(T3, 300, 40)),
    wire: own(bandWire(T3, 60, 12, 2)),
    fine: own(bandWire(T3, 120, 20, 2)),
    kind: "metal",
  });

  // Mối dây quấn quanh thân: mỗi mối ba vòng dây xếp cạnh nhau, hơi nghiêng, bám sát tiết diện thân rồi nhô ra một chút.
  const wrap = (phi0: number, tilt: number, tube: number, tubular: number, radial: number) => {
    const M = 40;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < M; i++) {
      const a = (i / M) * Math.PI * 2;
      const phi = phi0 + tilt * Math.sin(a);
      const [x, y, z] = bandPoint(phi, a);
      const rc = R_IN + thick(phi) / 2;
      const dx = x - Math.sin(phi) * rc;
      const dy = y - Math.cos(phi) * rc;
      const len = Math.hypot(dx, dy, z) || 1;
      pts.push(new T3.Vector3(x + (dx / len) * 0.016, y + (dy / len) * 0.016, z + (z / len) * 0.016));
    }
    return own(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts, true), tubular, tube, radial, true));
  };
  for (const side of [-1, 1]) {
    for (const k of KNOTS) {
      for (const off of [-0.048, -0.016, 0.016, 0.048]) {
        const phi0 = side * (k + off);
        parts.push({
          geo: wrap(phi0, 0.03 * side, 0.0135, 72, 6),
          wire: wf(wrap(phi0, 0.03 * side, 0.0135, 16, 3)),
          fine: wf(wrap(phi0, 0.03 * side, 0.0135, 28, 4)),
          kind: "metal",
        });
      }
    }
  }

  // Cổ đầu nhẫn: trụ nhỏ dần lên, nối thân với cụm vòng dây và là chân của bốn chấu
  const NECK_H = 0.3 * HS;
  const yN = R_TOP - 0.04 + NECK_H / 2;
  const neck = own(new T3.CylinderGeometry(0.13 * HS, 0.2 * HS, NECK_H, 28).translate(0, yN, 0));
  parts.push({
    geo: neck,
    wire: wf(own(new T3.CylinderGeometry(0.13 * HS, 0.2 * HS, NECK_H, 10).translate(0, yN, 0))),
    fine: wf(neck),
    kind: "metal",
  });

  // Sợi dây tròn đi qua các điểm (tuỳ chọn khép kín): dùng cho vòng dây, chân vòng, chấu
  const sweep = (pts: THREE.Vector3[], r: number, closed: boolean, seg: number) => {
    const curve = new T3.CatmullRomCurve3(pts, closed);
    parts.push({
      geo: own(new T3.TubeGeometry(curve, seg, r, 10, closed)),
      wire: wf(own(new T3.TubeGeometry(curve, Math.max(8, seg / 4), r, 4, closed))),
      fine: wf(own(new T3.TubeGeometry(curve, Math.max(12, seg / 2), r, 6, closed))),
      kind: "metal",
    });
  };

  // Cụm vòng dây đan vào nhau như ảnh cận cảnh: mỗi mặt trước/sau có hai vòng dây DẸT (dải bản rộng, mép bo tròn, bề rộng nằm
  // trong mặt phẳng vòng) hình elip thon cao, nghiêng ngược chiều nhau. Dải đan thật: tại hai chỗ giao, vòng này đi trước rồi
  // vòng kia đi trước (lệch theo pháp tuyến tỉ lệ sin góc), nên không xuyên vào nhau. Vòng ngả ra ngoài ở phía trên (≈ 30° so
  // với phương thẳng đứng) để đỉnh vòng nằm ngoài thân đá, còn đáy vòng chụm về cổ đầu nhẫn qua một chân ngắn.
  const LOOP_RH = 0.34 * HS; // bán kính ngang (thon)
  const LOOP_RV = 0.46 * HS; // bán kính đứng
  const LOOP_A = 0.07 * HS; // nửa bề rộng dải (trong mặt phẳng vòng)
  const LOOP_B = 0.038 * HS; // nửa độ dày dải (vuông góc mặt phẳng vòng)
  const LOOP_WEAVE = 0.045 * HS; // độ lệch trước/sau tại chỗ giao
  const LEAN = 0.52;
  // Vòng elip dẹt: tâm c, trục ngang h, trục đứng w, pháp tuyến n; wave là biên độ lệch theo n (∝ sin góc)
  const ribbonLoop = (
    c: THREE.Vector3,
    h: THREE.Vector3,
    w: THREE.Vector3,
    n: THREE.Vector3,
    wave: number,
    segs: number,
    prof: number,
  ) => {
    const pos = new Float32Array(segs * prof * 3);
    const P = new T3.Vector3();
    const tan = new T3.Vector3();
    const m = new T3.Vector3();
    const V = new T3.Vector3();
    for (let i = 0; i < segs; i++) {
      const th = (i / segs) * Math.PI * 2;
      const ct = Math.cos(th);
      const st = Math.sin(th);
      P.copy(c).addScaledVector(h, LOOP_RH * ct).addScaledVector(w, LOOP_RV * st).addScaledVector(n, wave * st);
      tan.set(0, 0, 0).addScaledVector(h, -LOOP_RH * st).addScaledVector(w, LOOP_RV * ct);
      m.crossVectors(n, tan).normalize(); // hướng ra ngoài trong mặt phẳng vòng
      for (let k = 0; k < prof; k++) {
        const ph = (k / prof) * Math.PI * 2;
        V.copy(P).addScaledVector(m, LOOP_A * Math.cos(ph)).addScaledVector(n, LOOP_B * Math.sin(ph));
        pos.set([V.x, V.y, V.z], (i * prof + k) * 3);
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < segs; i++) {
      const i2 = (i + 1) % segs;
      for (let k = 0; k < prof; k++) {
        const k2 = (k + 1) % prof;
        const a = i * prof + k;
        const b = i2 * prof + k;
        const d = i * prof + k2;
        const e = i2 * prof + k2;
        idx.push(a, d, b, b, d, e);
      }
    }
    const g = own(new T3.BufferGeometry());
    g.setAttribute("position", new T3.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  for (const zs of [1, -1]) {
    for (const xs of [-1, 1]) {
      const c = new T3.Vector3(xs * 0.26 * HS, STONE_Y - 0.46 * HS, zs * 0.36 * HS);
      const tilt = -xs * zs * 0.44; // ≈ 25°
      const wy = Math.cos(LEAN);
      const wz = zs * Math.sin(LEAN);
      const h = new T3.Vector3(Math.cos(tilt), 0, Math.sin(tilt));
      const w = new T3.Vector3(-wz * Math.sin(tilt), wy, wz * Math.cos(tilt));
      const n = new T3.Vector3().crossVectors(h, w).normalize();
      const wave = -xs * LOOP_WEAVE;
      parts.push({
        geo: ribbonLoop(c, h, w, n, wave, 120, 14),
        wire: wf(ribbonLoop(c, h, w, n, wave, 28, 6)),
        fine: wf(ribbonLoop(c, h, w, n, wave, 56, 8)),
        kind: "metal",
      });
      // đáy vòng (góc 270°) có một chân ngắn chạy vào cổ đầu nhẫn
      const b = c.clone().addScaledVector(w, -LOOP_RV).addScaledVector(n, -wave);
      sweep(
        [b, new T3.Vector3(b.x * 0.7, b.y - 0.05 * HS, b.z * 0.7), new T3.Vector3(b.x * 0.3, b.y - 0.02 * HS, b.z * 0.3)],
        0.04 * HS,
        false,
        16,
      );
    }
  }

  // Bốn chấu cao giữ viên chính, đặt theo bốn hướng (dọc thân và ngang thân): ống tròn dày, đầu bo tròn như ảnh cận cảnh
  const PRONG_R = 0.075 * HS;
  const BALL = 0.088 * HS;
  for (let n = 0; n < PRONGS; n++) {
    const psi = (n * Math.PI * 2) / PRONGS;
    const pts = PRONG.map(([rho, y]) => new T3.Vector3(rho * HS * Math.cos(psi), STONE_Y + y * HS, rho * HS * Math.sin(psi)));
    sweep(pts, PRONG_R, false, 40);
    const tip = own(new T3.SphereGeometry(BALL, 16, 12));
    const last = pts[pts.length - 1];
    tip.translate(last.x, last.y, last.z);
    parts.push({
      geo: tip,
      wire: wf(own(new T3.SphereGeometry(BALL, 6, 4).translate(last.x, last.y, last.z))),
      fine: wf(tip),
      kind: "metal",
    });
  }

  // Viên đá chính
  const diamond = own(diamondGeometry(T3));
  const diamondEdges = own(new T3.EdgesGeometry(diamond, 1));
  parts.push({
    geo: diamond,
    wire: diamondEdges,
    fine: diamondEdges,
    kind: "stone",
    m: new T3.Matrix4().makeScale(STONE_R, STONE_R, STONE_R).setPosition(0, STONE_Y, 0),
  });

  // ─ Hai tấm pavé hình lá trên vai ─
  // Điểm trên mặt tấm lá: u dọc theo vai (0 → 1), v ngang tấm (-1 → 1). Tấm bầu lên giữa, thon nhọn hai đầu.
  const leafHalf = (u: number) => LEAF_HALF_W * Math.sin(Math.PI * u) ** 0.7;
  const leafAt = (side: number, u: number, v: number, lift = 0): [number, number, number] => {
    const phi = side * (LEAF0 + (LEAF1 - LEAF0) * u);
    const z = v * leafHalf(u);
    const r = bandTop(phi, z) + 0.016 + 0.06 * (1 - v * v) * Math.sin(Math.PI * u) ** 0.5 + lift;
    return [Math.sin(phi) * r, Math.cos(phi) * r, z];
  };
  const leaf = (side: number, nu: number, nv: number) => {
    const pos = new Float32Array((nu + 1) * (nv + 1) * 3);
    for (let i = 0; i <= nu; i++) {
      for (let j = 0; j <= nv; j++) {
        pos.set(leafAt(side, i / nu, -1 + (2 * j) / nv), (i * (nv + 1) + j) * 3);
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j;
        const b = (i + 1) * (nv + 1) + j;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
    const g = own(new T3.BufferGeometry());
    g.setAttribute("position", new T3.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  for (const side of [-1, 1]) {
    parts.push({ geo: leaf(side, 28, 12), wire: wf(leaf(side, 6, 4)), fine: wf(leaf(side, 10, 6)), kind: "metal" });
  }

  const smalls: THREE.Matrix4[] = [];
  const yAxis = new T3.Vector3(0, 1, 0);
  const q = new T3.Quaternion();
  const stonePts: THREE.Vector3[] = [];
  const addSmall = (p: THREE.Vector3, up: THREE.Vector3, s: number, spin = 0) => {
    q.setFromUnitVectors(yAxis, up);
    q.multiply(new T3.Quaternion().setFromAxisAngle(yAxis, spin));
    smalls.push(new T3.Matrix4().compose(p, q, new T3.Vector3(s, s, s)));
  };
  // Viên kim cương nhỏ ở chân cụm vòng dây (một ở mặt trước, một ở mặt sau), giữ bằng ba hạt tròn, đỡ bằng một thanh ngắn vào cổ
  for (const zs of [1, -1]) {
    const up = new T3.Vector3(0, 0.7, zs * 0.7).normalize();
    const S = 0.15 * HS; // ảnh cận cảnh: viên đá nhỏ rộng khoảng 1/5 viên chính, hai hạt giữ to bằng ~1/3 đường kính nó
    const bead = 0.05 * HS;
    const p = new T3.Vector3(0, STONE_Y - 0.8 * HS, zs * 0.4 * HS);
    addSmall(p, up, S, 0);
    const e1 = new T3.Vector3(1, 0, 0);
    const e2 = new T3.Vector3().crossVectors(up, e1).normalize();
    for (let k = 0; k < 3; k++) {
      const a = Math.PI / 2 + (k * Math.PI * 2) / 3;
      const c = p.clone().addScaledVector(e1, Math.cos(a) * S * 1.18).addScaledVector(e2, Math.sin(a) * S * 1.18);
      parts.push({
        geo: own(new T3.SphereGeometry(bead, 12, 8).translate(c.x, c.y, c.z)),
        wire: wf(own(new T3.SphereGeometry(bead, 6, 4).translate(c.x, c.y, c.z))),
        fine: wf(own(new T3.SphereGeometry(bead, 8, 6).translate(c.x, c.y, c.z))),
        kind: "metal",
      });
    }
    sweep(
      [new T3.Vector3(0, STONE_Y - 0.82 * HS, zs * 0.1 * HS), new T3.Vector3(0, STONE_Y - 0.82 * HS, zs * 0.38 * HS)],
      0.03 * HS,
      false,
      8,
    );
  }

  // Bốn viên đá trên mỗi tấm lá, to nhất ở giữa
  for (const side of [-1, 1]) {
    [0.17, 0.39, 0.61, 0.83].forEach((u, i) => {
      const s = i === 1 || i === 2 ? 0.07 : 0.05;
      const [x, y, z] = leafAt(side, u, 0, -0.006);
      const phi = side * (LEAF0 + (LEAF1 - LEAF0) * u);
      const p = new T3.Vector3(x, y, z);
      stonePts.push(p);
      addSmall(p, new T3.Vector3(Math.sin(phi), Math.cos(phi), 0), s, phi);
    });
  }

  // Hạt milgrain: viền hai mép thân suốt vòng nhẫn (trừ chỗ dưới đầu nhẫn) và viền quanh hai tấm lá.
  // Ảnh cận cảnh: hạt ở hai vai to (gấp ~2 hạt viền thường) và thưa, nhỏ dần khi xuống thân. Đoạn trên tấm lá do hàng hạt
  // viền lá đảm nhiệm (cùng vị trí mép) nên hạt dọc thân chỉ bắt đầu sau tấm lá, to ở đó rồi nhỏ dần về mức cũ.
  const beads: THREE.Matrix4[] = [];
  const noRot = new T3.Quaternion();
  for (const side of [-1, 1]) {
    let phi = LEAF1 + 0.02;
    while (phi < Math.PI) {
      const t = Math.min(1, Math.max(0, (phi - (LEAF1 + 0.02)) / 0.9));
      const bs = 1 + 0.7 * (1 - t * t * (3 - 2 * t)); // 1,7 ở sát tấm lá → 1 từ phi ≈ LEAF1 + 0,92 trở đi
      for (const a0 of [Math.PI / 4, -Math.PI / 4]) {
        const [x, y, z] = bandPoint(side * phi, a0);
        beads.push(new T3.Matrix4().compose(new T3.Vector3(x * 1.003, y * 1.003, z), noRot, new T3.Vector3(bs, bs, bs)));
      }
      phi += 0.027 * (0.6 + 0.4 * bs) * bs;
    }
    const leafBead = new T3.Vector3(1.5, 1.5, 1.5);
    for (const v of [-1, 1]) {
      for (let u = 0.04; u < 0.97; u += 0.07) {
        const [x, y, z] = leafAt(side, u, v * 0.96, -0.002);
        beads.push(new T3.Matrix4().compose(new T3.Vector3(x, y, z), noRot, leafBead));
      }
    }
  }

  // Cạnh của mọi đá nhỏ gộp thành một lưới đường duy nhất (đã đặt sẵn vào toạ độ nhẫn)
  const pos = diamondEdges.getAttribute("position");
  const v = new T3.Vector3();
  const wirePts: number[] = [];
  for (const m of smalls) {
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m);
      wirePts.push(v.x, v.y, v.z);
    }
  }
  const smallWire = own(new T3.BufferGeometry());
  smallWire.setAttribute("position", new T3.Float32BufferAttribute(wirePts, 3));

  const beadGeo = own(new T3.SphereGeometry(0.0155, 8, 6));

  // Vị trí tia lóe (toạ độ nhẫn): trên viên chính và vài viên nhỏ trên hai tấm lá.
  const glints: [number, number, number][] = [
    [-0.16 * K, STONE_Y + 0.2 * K, 0.2 * K],
    [0.2 * K, STONE_Y + 0.12 * K, 0.42 * K],
    [0.02 * K, STONE_Y + 0.05 * K, 0.6 * K],
    [stonePts[1].x, stonePts[1].y + 0.03, stonePts[1].z],
    [stonePts[6].x, stonePts[6].y + 0.03, stonePts[6].z],
  ];

  return {
    parts,
    small: { geo: diamond, matrices: smalls, wire: smallWire },
    beads: { geo: beadGeo, matrices: beads },
    glints,
    dispose() {
      owned.forEach((g) => g.dispose());
    },
  };
}

export interface RingMaterials {
  metal: THREE.MeshPhysicalMaterial;
  pave: THREE.MeshPhysicalMaterial;
  stoneBack: THREE.MeshPhysicalMaterial;
  stoneFront: THREE.MeshPhysicalMaterial;
}

// Bạch kim bóng; đá gồm hai lớp: mặt trong (BackSide) phản chiếu như gương cho ra hiệu ứng ánh lửa bên trong,
// mặt ngoài chỉ cộng thêm ánh phản chiếu của mặt vương miện (không phủ lớp kính mờ nào lên trên). Màu từng mặt cắt
// (vertexColors) ngả nhẹ để có "lửa".
export function createRingMaterials(T3: Three, env: THREE.Texture, envStone: THREE.Texture): RingMaterials {
  return {
    metal: new T3.MeshPhysicalMaterial({
      color: 0xe2e2e3, // bạc xám trung tính như ảnh mẫu (đo được ~#BBBBBC, gần như không ngả màu)
      metalness: 1,
      roughness: 0.22, // bóng mờ nhẹ như bạc đánh bóng: phản chiếu chuyển sắc mềm, không sắc cạnh như gương
      side: T3.DoubleSide, // chén và tấm lá là vỏ mỏng, nhìn được cả hai mặt
      envMap: env,
      envMapIntensity: 1,
    }),
    // Đá nhỏ quá nhỏ để cần hai lớp: một lớp gương có chút tự sáng cho luôn lấp lánh.
    pave: new T3.MeshPhysicalMaterial({
      color: 0xf4f4f6,
      metalness: 1,
      roughness: 0,
      flatShading: true,
      vertexColors: true,
      emissive: 0xc8ccd6,
      emissiveIntensity: 0.22,
      envMap: envStone,
      envMapIntensity: 2,
    }),
    stoneBack: new T3.MeshPhysicalMaterial({
      color: 0xf2f2f5,
      metalness: 1,
      roughness: 0,
      flatShading: true,
      vertexColors: true,
      side: T3.BackSide,
      envMap: envStone,
      envMapIntensity: 1.1,
    }),
    // Màu đen nên không có thành phần khuếch tán, chỉ còn phản xạ Fresnel (ior 2,4 → ~17% khi nhìn thẳng, mạnh dần ở góc xiên),
    // cộng dồn lên lớp trong. Trước đây lớp này là kính trắng đục 30% có ánh cầu vồng nên đá trông như thuỷ tinh.
    stoneFront: new T3.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0,
      roughness: 0,
      ior: 2.4,
      flatShading: true,
      transparent: true,
      blending: T3.AdditiveBlending,
      depthWrite: false,
      envMap: envStone,
      envMapIntensity: 0.6,
    }),
  };
}

export function createSolid(T3: Three, rp: RingParts, mats: RingMaterials): THREE.Group {
  const group = new T3.Group();
  for (const p of rp.parts) {
    const meshes =
      p.kind === "metal"
        ? [new T3.Mesh(p.geo, mats.metal)]
        : [new T3.Mesh(p.geo, mats.stoneBack), new T3.Mesh(p.geo, mats.stoneFront)];
    meshes.forEach((mesh, n) => {
      if (p.m) mesh.applyMatrix4(p.m);
      mesh.renderOrder = n; // lớp trong vẽ trước lớp kính
      group.add(mesh);
    });
  }
  const instanced = (geo: THREE.BufferGeometry, mat: THREE.Material, ms: THREE.Matrix4[]) => {
    const im = new T3.InstancedMesh(geo, mat, ms.length);
    ms.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    group.add(im);
  };
  instanced(rp.small.geo, mats.pave, rp.small.matrices);
  instanced(rp.beads.geo, mats.metal, rp.beads.matrices);
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
  const small = new T3.LineSegments(rp.small.wire, material);
  small.frustumCulled = false;
  group.add(small);
  return group;
}
