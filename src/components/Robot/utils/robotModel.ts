import * as THREE from "three";
import { mergeBufferGeometries } from "three-stdlib";
import { WORKER_COUNT } from "./orchestration";

// One low-poly "robot": a rounded body box, a head box, two emissive eyes.
export function buildRobotGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const body = new THREE.BoxGeometry(0.7, 0.8, 0.5);
  body.translate(0, 0.0, 0);
  parts.push(body);

  const head = new THREE.BoxGeometry(0.5, 0.45, 0.45);
  head.translate(0, 0.62, 0);
  parts.push(head);

  const eyeGeo = (x: number) => {
    const e = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    e.translate(x, 0.64, 0.24);
    return e;
  };
  parts.push(eyeGeo(-0.12), eyeGeo(0.12));

  const merged = mergeBufferGeometries(parts, false);
  if (!merged) {
    throw new Error("Failed to merge robot geometries");
  }
  merged.computeVertexNormals();
  return merged;
}

export const robotMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#2a2150"),
  emissive: new THREE.Color("#c2a4ff"),
  emissiveIntensity: 0.15,
  metalness: 0.3,
  roughness: 0.6,
});

export function buildSupervisor(): THREE.Mesh {
  const geo = buildRobotGeometry();
  const mat = robotMaterial.clone();
  mat.emissiveIntensity = 0.4;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(1.4);
  mesh.frustumCulled = true;
  return mesh;
}

export function buildWorkers(positions: THREE.Vector3[]): THREE.InstancedMesh {
  if (positions.length !== WORKER_COUNT) {
    throw new Error(`expected ${WORKER_COUNT} worker positions`);
  }
  const geo = buildRobotGeometry();
  const inst = new THREE.InstancedMesh(geo, robotMaterial.clone(), WORKER_COUNT);
  const m = new THREE.Matrix4();
  positions.forEach((p, i) => {
    m.makeTranslation(p.x, p.y, p.z);
    inst.setMatrixAt(i, m);
  });
  inst.instanceMatrix.needsUpdate = true;
  inst.frustumCulled = true;
  return inst;
}
