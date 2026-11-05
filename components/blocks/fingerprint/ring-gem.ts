import type * as THREE from "three";
import { BVHShaderGLSL, MeshBVHUniformStruct, type MeshBVH } from "three-mesh-bvh";

type Three = typeof THREE;

// Chất liệu kim cương dò tia: từ mỗi điểm ảnh, tia nhìn khúc xạ vào viên đá, dội phản xạ toàn phần bên trong (dò bằng BVH của
// chính hình đá) tới khi thoát ra, rồi lấy màu môi trường theo hướng thoát; ba kênh màu đi với chiết suất lệch nhau chút ít
// nên ra "lửa" (tán sắc). Mặt ngoài cộng thêm phản chiếu Fresnel. Cùng cách với chất liệu kim cương của WebGi; thông số lấy
// từ chất liệu đá trong file nhẫn ("Gem 03": chiết suất 2,6, dội tối đa 5 lần, tán sắc 0,01, cường độ môi trường 1,3).
const IOR = 2.6;
const BOUNCES = 5;
const DISPERSION = 0.01;
const ENV_INTENSITY = 1.3;

const vertexShader = /* glsl */ `
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying mat4 vLocalFromWorld; // world → toạ độ riêng của hình đá (nơi BVH được dựng)
varying mat3 vWorldFromLocal;
#include <clipping_planes_pars_vertex>

void main() {
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
    m = m * instanceMatrix;
  #endif
  vec4 world = m * vec4(position, 1.0);
  vWorldPosition = world.xyz;
  vWorldFromLocal = mat3(m);
  vWorldNormal = normalize(vWorldFromLocal * normal);
  vLocalFromWorld = inverse(m);
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}
`;

const fragmentShader = /* glsl */ `
#define BOUNCES ${BOUNCES}
${BVHShaderGLSL.common_functions}
${BVHShaderGLSL.bvh_struct_definitions}
${BVHShaderGLSL.bvh_ray_functions}
#include <clipping_planes_pars_fragment>

uniform BVH bvh;
uniform samplerCube envMap;
uniform mat3 envRotation;
uniform float envIntensity;
uniform float ior;
uniform float dispersion;
uniform float eps; // bước lùi khỏi mặt vừa chạm, theo toạ độ riêng của hình đá

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying mat4 vLocalFromWorld;
varying mat3 vWorldFromLocal;

// Mức mipmap theo độ đổi hướng nhìn giữa hai điểm ảnh kề nhau: hướng sau khúc xạ nhảy cóc giữa các mặt cắt, lấy đạo hàm của nó
// sẽ chọn nhầm mipmap mờ ở mép mặt.
vec3 env(vec3 dir, vec3 gx, vec3 gy) {
  return textureGrad(envMap, envRotation * dir, gx, gy).rgb * envIntensity;
}

// Hướng (world) của tia nhìn V sau khi đi xuyên viên đá với chiết suất eta, vào từ mặt có pháp tuyến n.
vec3 traceGem(vec3 V, vec3 n, float eta) {
  vec3 dir = normalize(mat3(vLocalFromWorld) * refract(V, n, 1.0 / eta));
  vec3 ro = (vLocalFromWorld * vec4(vWorldPosition, 1.0)).xyz + dir * eps;
  for (int i = 0; i < BOUNCES; i++) {
    uvec4 faceIndices = uvec4(0u);
    vec3 faceNormal = vec3(0.0, 0.0, 1.0);
    vec3 barycoord = vec3(0.0);
    float side = 1.0;
    float dist = 0.0;
    if (!bvhIntersectFirstHit(bvh, ro, dir, faceIndices, faceNormal, barycoord, side, dist)) break;
    ro += dir * dist;
    vec3 outDir = refract(dir, faceNormal, eta); // faceNormal luôn quay ngược chiều tia
    if (dot(outDir, outDir) > 0.0) {
      dir = outDir;
      break;
    }
    dir = reflect(dir, faceNormal); // phản xạ toàn phần: dội tiếp bên trong
    ro += dir * eps;
  }
  return normalize(vWorldFromLocal * dir);
}

void main() {
  #include <clipping_planes_fragment>
  vec3 V = normalize(vWorldPosition - cameraPosition);
  vec3 n = normalize(vWorldNormal);
  n = faceforward(n, V, n);
  vec3 gx = dFdx(V);
  vec3 gy = dFdy(V);

  float f0 = pow((ior - 1.0) / (ior + 1.0), 2.0);
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - clamp(dot(-V, n), 0.0, 1.0), 5.0);
  vec3 reflected = env(reflect(V, n), gx, gy);
  vec3 refracted = vec3(
    env(traceGem(V, n, ior * (1.0 - dispersion)), gx, gy).r,
    env(traceGem(V, n, ior), gx, gy).g,
    env(traceGem(V, n, ior * (1.0 + dispersion)), gx, gy).b
  );
  gl_FragColor = vec4(mix(refracted, reflected, fresnel), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// env: môi trường dạng cube (có mipmap). Hình của bvh phải có pháp tuyến phẳng theo mặt cắt.
export function createGemMaterial(T3: Three, bvh: MeshBVH, env: THREE.Texture): THREE.ShaderMaterial {
  const struct = new MeshBVHUniformStruct();
  struct.updateFrom(bvh);
  const geo = bvh.geometry;
  if (!geo.boundingSphere) geo.computeBoundingSphere();
  return new T3.ShaderMaterial({
    uniforms: {
      bvh: { value: struct },
      envMap: { value: env },
      envRotation: { value: new T3.Matrix3() },
      envIntensity: { value: ENV_INTENSITY },
      ior: { value: IOR },
      dispersion: { value: DISPERSION },
      eps: { value: geo.boundingSphere!.radius * 1e-3 },
    },
    vertexShader,
    fragmentShader,
    clipping: true,
  });
}

export function disposeGemMaterial(m: THREE.ShaderMaterial) {
  (m.uniforms.bvh.value as MeshBVHUniformStruct).dispose();
  m.dispose();
}
