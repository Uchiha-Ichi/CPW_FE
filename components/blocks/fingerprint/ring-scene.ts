import type * as THREE from "three";
import {
  createRingMaterials,
  createSolid,
  createWire,
  type RingParts,
} from "./ring-model";

type Three = typeof THREE;

export interface RingEls {
  sec: HTMLElement;
  stage: HTMLElement;
  cv: HTMLCanvasElement;
  lcv: HTMLCanvasElement;
  lens: HTMLElement;
  pointer: HTMLElement;
}

// Tên class (CSS module) mà cảnh bật dần theo nhịp: s1 hiện câu 1, s2 hiện câu 2, s3 hiện bóng đổ; lens khi rê chuột.
export interface RingClasses {
  s1: string;
  s2: string;
  s3: string;
  lens: string;
}

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const out = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

// Khối luôn có nền navy (cả hai theme), đường lưới luôn dùng xanh nhạt cho đủ tương phản.
const wireHex = () => 0x58b7ff;

// Dựng cảnh nhẫn (rp: hình nhẫn đã đọc từ file; studio: ảnh môi trường HDR dạng equirect) vào hai canvas có sẵn. Trả về hàm
// dọn dẹp (dọn luôn rp), hoặc null nếu trình duyệt không tạo được WebGL (khi đó rp và studio vẫn thuộc về nơi gọi).
export function mountRingScene(
  T3: Three,
  rp: RingParts,
  studio: THREE.Texture,
  els: RingEls,
  cls: RingClasses,
  reduce: boolean,
): (() => void) | null {
  const { sec, stage, cv, lcv, lens, pointer } = els;

  let r1: THREE.WebGLRenderer;
  try {
    r1 = new T3.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  } catch {
    return null;
  }
  let r2: THREE.WebGLRenderer | null = null;
  try {
    r2 = new T3.WebGLRenderer({ canvas: lcv, antialias: true, alpha: true });
  } catch {
    r2 = null; // không có thấu kính cũng không sao
  }
  const renderers = r2 ? [r1, r2] : [r1];
  renderers.forEach((r) => {
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.localClippingEnabled = true;
    r.toneMapping = T3.ACESFilmicToneMapping; // như WebGi khi dựng file nhẫn (Tonemap: ACES, exposure 1)
    r.toneMappingExposure = 1;
  });

  const TAU = Math.PI * 2;
  const scene = new T3.Scene();
  const lensScene = new T3.Scene();
  const cam = new T3.PerspectiveCamera(32, 4 / 3, 0.1, 200);
  cam.position.set(0, 0.9, 8.6);
  cam.lookAt(0, 0.6, 0);

  // Môi trường phản chiếu: ảnh HDR chụp studio thật (studio, dạng equirect), như WebGi dùng ảnh HDR studio khi dựng file nhẫn.
  // Kim loại lấy bản đã lọc theo độ nhám (PMREM); đá dò tia cần lấy mẫu sắc nét theo hướng tia thoát nên dùng bản cube có mipmap.
  studio.generateMipmaps = true; // fromEquirectangularTexture chép cài đặt mipmap của ảnh nguồn sang cube
  studio.minFilter = T3.LinearMipmapLinearFilter;
  const pm = new T3.PMREMGenerator(r1);
  const envRT = pm.fromEquirectangular(studio);
  pm.dispose();
  const gemRT = new T3.WebGLCubeRenderTarget(512).fromEquirectangularTexture(r1, studio);
  studio.dispose();

  scene.add(new T3.AmbientLight(0xffffff, 0.25));
  // Đèn rọi trên kim loại bóng chỉ tạo một điểm sáng gắt (cảm giác "đèn xoi vào"); ánh sáng chính đã có từ môi trường, nên để rất nhẹ.
  const key = new T3.DirectionalLight(0xffffff, 0.4);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new T3.DirectionalLight(0xcfdcff, 0.8);
  rim.position.set(-6, 2, -6);
  scene.add(rim);

  // Hai mặt cắt đặt cùng một hướng nhưng ngược dấu: bên trái sóng là nhẫn đặc, bên phải là khung lưới.
  const pSolid = new T3.Plane(new T3.Vector3(-1, 0, 0), -3);
  const pWire = new T3.Plane(new T3.Vector3(1, 0, 0), 3);

  const mats = createRingMaterials(T3, rp, envRT.texture, gemRT.texture);
  mats.all.forEach((m) => (m.clippingPlanes = [pSolid]));
  const spin = new T3.Matrix4(); // xoay môi trường quanh đá, xem update()

  const grp = new T3.Group();
  scene.add(grp);
  grp.add(createSolid(T3, rp, mats));

  const wireMat = new T3.LineBasicMaterial({ color: wireHex(), transparent: true, opacity: 0.8, toneMapped: false, clippingPlanes: [pWire] });
  grp.add(createWire(T3, rp, wireMat));

  // Thấu kính: cảnh riêng chỉ có bản vẽ lưới dày hơn.
  const lensMat = new T3.LineBasicMaterial({ color: wireHex(), transparent: true, opacity: 0.95, toneMapped: false });
  const lensFineMat = new T3.LineBasicMaterial({ color: wireHex(), transparent: true, opacity: 0.35, toneMapped: false });
  const lensGrp = new T3.Group();
  lensScene.add(lensGrp);
  lensGrp.add(createWire(T3, rp, lensMat));
  lensGrp.add(createWire(T3, rp, lensFineMat, lensFineMat));

  // Tia lóe trên đá, nhấp nháy lệch pha nhau.
  const glintTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(210,232,255,.55)");
    g.addColorStop(1, "rgba(160,200,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    x.fillStyle = "rgba(255,255,255,.95)";
    x.beginPath();
    x.moveTo(64, 0); x.lineTo(70, 58); x.lineTo(128, 64); x.lineTo(70, 70);
    x.lineTo(64, 128); x.lineTo(58, 70); x.lineTo(0, 64); x.lineTo(58, 58);
    x.closePath();
    x.fill();
    const t = new T3.CanvasTexture(c);
    t.colorSpace = T3.SRGBColorSpace;
    return t;
  })();
  const glints = rp.glints.map((p, i) => {
    const s = new T3.Sprite(
      new T3.SpriteMaterial({
        map: glintTex,
        blending: T3.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        toneMapped: false,
        clippingPlanes: [pSolid],
      }),
    );
    s.position.set(p[0], p[1], p[2]);
    s.scale.setScalar(0.01);
    grp.add(s);
    return { s, phase: i * 1.7 };
  });

  // Sóng sáng quét ngang
  const fadeTex = (w: number, h: number, peak: number) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d")!;
    const a = x.createLinearGradient(0, 0, w, 0);
    a.addColorStop(0, "rgba(91,180,255,0)");
    a.addColorStop(0.5, `rgba(91,180,255,${peak})`);
    a.addColorStop(1, "rgba(91,180,255,0)");
    x.fillStyle = a;
    x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "destination-in";
    const b = x.createLinearGradient(0, 0, 0, h);
    b.addColorStop(0, "rgba(0,0,0,0)");
    b.addColorStop(0.25, "#000");
    b.addColorStop(0.75, "#000");
    b.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = b;
    x.fillRect(0, 0, w, h);
    const t = new T3.CanvasTexture(c);
    t.colorSpace = T3.SRGBColorSpace;
    return t;
  };
  const glowTex = fadeTex(64, 64, 0.75);
  const lineTex = fadeTex(8, 64, 1);
  const glow = new T3.Mesh(
    new T3.PlaneGeometry(0.9, 6),
    new T3.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, depthTest: false, opacity: 0, toneMapped: false }),
  );
  const glowLine = new T3.Mesh(
    new T3.PlaneGeometry(0.05, 6),
    new T3.MeshBasicMaterial({ map: lineTex, color: 0x9fd8ff, transparent: true, depthWrite: false, depthTest: false, opacity: 0, toneMapped: false }),
  );
  glow.position.set(0, 0.5, 0);
  glowLine.position.set(0, 0.5, 0);
  glow.renderOrder = glowLine.renderOrder = 5;
  scene.add(glow);
  scene.add(glowLine);

  // Vệt sáng lao tới theo chiều sâu
  const NT = 160;
  const tp = new Float32Array(NT * 6);
  const tl = new Float32Array(NT);
  const spawn = (i: number, z: number) => {
    const a = Math.random() * TAU;
    const r = 2 + Math.random() * 6.5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.75 + 0.5;
    tl[i] = 0.5 + Math.random() * 2;
    tp[i * 6] = x; tp[i * 6 + 1] = y; tp[i * 6 + 2] = z;
    tp[i * 6 + 3] = x; tp[i * 6 + 4] = y; tp[i * 6 + 5] = z - tl[i];
  };
  for (let i = 0; i < NT; i++) spawn(i, -Math.random() * 90);
  const tg = new T3.BufferGeometry();
  tg.setAttribute("position", new T3.BufferAttribute(tp, 3));
  const streakMat = new T3.LineBasicMaterial({ color: wireHex(), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  scene.add(new T3.LineSegments(tg, streakMat));

  const recolor = () => {
    [wireMat, lensMat, lensFineMat, streakMat].forEach((m) => m.color.set(wireHex()));
  };
  const themeObs = new MutationObserver(recolor);
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let W = 0;
  let H = 0;
  let t = 0;
  let last = 0;
  let vis = false;
  let played = false;
  let left = false;
  let lensOn = false;
  let raf = 0;

  const size = () => {
    const r = stage.getBoundingClientRect();
    if (!r.width) return;
    W = r.width;
    H = r.height;
    renderers.forEach((x) => x.setSize(W, H, false));
    cam.aspect = W / H;
    cam.updateProjectionMatrix();
  };

  const update = (dt: number) => {
    if (t > 0.15) sec.classList.add(cls.s1);
    if (t > 2.1) sec.classList.add(cls.s2);
    if (t > 4.2) sec.classList.add(cls.s3);

    const fly = out(t / 1.6);
    grp.position.z = -38 * (1 - fly);
    grp.position.y = 0.06 * Math.sin(t * 1.2) - 0.35;
    grp.rotation.x = 0.33 + 0.04 * Math.sin(t * 0.6);
    grp.rotation.y = 0.62 * Math.sin(t * 0.42) + 9 * Math.pow(1 - fly, 2);

    const sx = t < 2.4 ? -3 : t > 4.2 ? 3.2 : -2.6 + 5.2 * ease((t - 2.4) / 1.8);
    pSolid.constant = sx;
    pWire.constant = -sx;
    const g = t > 2.4 && t < 4.3 ? 1 : 0;
    const gm = glow.material as THREE.MeshBasicMaterial;
    const lm = glowLine.material as THREE.MeshBasicMaterial;
    gm.opacity += (g * 0.9 - gm.opacity) * 0.2;
    lm.opacity += (g - lm.opacity) * 0.25;
    glow.position.x = glowLine.position.x = sx;

    const v = t < 1.8 ? 55 - 49 * out(t / 1.8) : 4;
    streakMat.opacity = t < 1.8 ? 0.55 : Math.max(0.16, 0.55 - 0.39 * out((t - 1.8) / 2.2));
    for (let i = 0; i < NT; i++) {
      const z = tp[i * 6 + 2] + v * dt;
      if (z > 9) {
        spawn(i, -80 - Math.random() * 10);
        continue;
      }
      tp[i * 6 + 2] = z;
      tp[i * 6 + 5] = z - tl[i] * (0.3 + v / 18);
    }
    tg.attributes.position.needsUpdate = true;

    // Tia lóe chỉ bắt đầu khi nhẫn đã thành hình
    const on = smooth((t - 4.2) / 0.8);
    glints.forEach(({ s, phase }) => {
      const pulse = Math.pow(Math.max(0, Math.sin(t * 1.9 + phase)), 8);
      const m = s.material as THREE.SpriteMaterial;
      m.opacity = on * pulse * 0.65;
      s.scale.setScalar(0.1 + 0.3 * pulse);
      m.rotation = t * 0.4 + phase;
    });

    // Ánh sáng quanh đá quay chậm: mỗi mặt cắt liên tục chuyển giữa chói và tối, như kim cương dưới đèn.
    spin.makeRotationY(t * 0.45);
    mats.gems.forEach((m) => m.uniforms.envRotation.value.setFromMatrix4(spin));

    lensGrp.position.copy(grp.position);
    lensGrp.rotation.copy(grp.rotation);
  };

  const draw = () => {
    r1.render(scene, cam);
    if (r2 && lensOn) r2.render(lensScene, cam);
  };

  const loop = (now: number) => {
    if (!vis) {
      raf = 0;
      return;
    }
    const real = last ? Math.min(0.5, (now - last) / 1000) : 0;
    last = now;
    t += real;
    update(Math.min(0.05, real));
    draw();
    raf = requestAnimationFrame(loop);
  };

  size();
  // Biên dịch shader sớm, lúc section còn nằm ngoài khung nhìn, để khung hình đầu tiên không bị khựng.
  r1.compileAsync(scene, cam).catch(() => {});
  const cleanups: (() => void)[] = [];

  if (reduce) {
    // Không chuyển động: dựng sẵn khung cuối (nhẫn đã thành hình, tia lóe bật).
    t = 6;
    update(0);
    grp.position.z = 0;
    grp.rotation.y = 0.6;
    glints.forEach(({ s }) => {
      (s.material as THREE.SpriteMaterial).opacity = 0.5;
      s.scale.setScalar(0.26);
    });
    sec.classList.add(cls.s1, cls.s2, cls.s3);
    draw();
  } else {
    const io = new IntersectionObserver(
      (es) => {
        const e = es[es.length - 1];
        vis = e.isIntersecting;
        if (!vis) {
          if (e.intersectionRatio === 0) left = true;
          return;
        }
        if (!played || left) {
          played = true;
          left = false;
          t = 0;
          sec.classList.remove(cls.s1, cls.s2, cls.s3);
        }
        last = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { threshold: 0.3 },
    );
    io.observe(sec);
    cleanups.push(() => io.disconnect());

    if (r2) {
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = stage.getBoundingClientRect();
        const lx = e.clientX - r.left;
        const ly = e.clientY - r.top;
        lensOn = true;
        stage.classList.add(cls.lens);
        lens.style.clipPath = `circle(75px at ${lx}px ${ly}px)`;
        pointer.style.transform = `translate(${lx}px, ${ly}px)`;
      };
      const leave = () => {
        lensOn = false;
        stage.classList.remove(cls.lens);
        lens.style.clipPath = "circle(0px at 50% 50%)";
      };
      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", leave);
      });
    }
  }

  const ro = new ResizeObserver(() => {
    size();
    if (reduce || !vis) draw();
  });
  ro.observe(stage);

  return () => {
    cancelAnimationFrame(raf);
    raf = 0;
    vis = false;
    cleanups.forEach((f) => f());
    ro.disconnect();
    themeObs.disconnect();
    rp.dispose();
    mats.dispose();
    [wireMat, lensMat, lensFineMat, streakMat].forEach((m) => m.dispose());
    glints.forEach(({ s }) => (s.material as THREE.SpriteMaterial).dispose());
    [glow, glowLine].forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.MeshBasicMaterial).dispose();
    });
    tg.dispose();
    glintTex.dispose();
    glowTex.dispose();
    lineTex.dispose();
    envRT.dispose();
    gemRT.dispose();
    renderers.forEach((r) => {
      r.dispose();
      r.forceContextLoss();
    });
  };
}
