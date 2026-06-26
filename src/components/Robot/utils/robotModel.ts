import * as THREE from "three";
import { GLTFLoader, DRACOLoader, SkeletonUtils } from "three-stdlib";

export interface RobotInstance {
  root: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  play: (name: string, opts?: { once?: boolean }) => void;
}

interface LoadedRobot {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
}

let cache: Promise<LoadedRobot> | null = null;

function loadRobot(): Promise<LoadedRobot> {
  if (cache) return cache;
  cache = new Promise<LoadedRobot>((resolve, reject) => {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    loader.setDRACOLoader(draco);
    loader.load(
      "/models/robot.glb",
      (gltf) => resolve({ scene: gltf.scene, animations: gltf.animations }),
      undefined,
      reject
    );
  });
  return cache;
}

// Tint the robot's materials toward a solid accent color. Kept matte and opaque
// (low emissive, higher roughness) so the figures read as solid, not glowy/ghostly.
function tint(obj: THREE.Object3D, accent: number, strength = 0.7) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh && mesh.material && !Array.isArray(mesh.material)) {
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
      if (mat.color) mat.color.lerp(new THREE.Color(accent), strength);
      if ("emissive" in mat) {
        mat.emissive = new THREE.Color(accent);
        mat.emissiveIntensity = 0.12; // subtle, not glowing
      }
      if ("metalness" in mat) mat.metalness = 0.3;
      if ("roughness" in mat) mat.roughness = 0.6; // matte, not shiny
      mat.transparent = false;
      mat.opacity = 1;
      mesh.material = mat;
      mesh.frustumCulled = true;
    }
  });
}

function makeInstance(
  loaded: LoadedRobot,
  accent: number,
  strength = 0.7
): RobotInstance {
  const root = SkeletonUtils.clone(loaded.scene);
  tint(root, accent, strength);
  const mixer = new THREE.AnimationMixer(root);
  const actions: Record<string, THREE.AnimationAction> = {};
  loaded.animations.forEach((clip) => {
    actions[clip.name] = mixer.clipAction(clip);
  });
  let current: THREE.AnimationAction | null = null;
  const play = (name: string, opts?: { once?: boolean }) => {
    const next = actions[name];
    if (!next || next === current) return;
    next.reset();
    if (opts?.once) {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true; // hold the final pose (e.g. stay down after Death)
    } else {
      next.setLoop(THREE.LoopRepeat, Infinity);
      next.clampWhenFinished = false;
    }
    next.fadeIn(0.3).play();
    if (current) current.fadeOut(0.3);
    current = next;
  };
  return { root, mixer, play };
}

export interface RobotTeam {
  supervisor: RobotInstance;
  workers: RobotInstance[];
}

// A single centered robot used on the project detail pages, where it plays the
// model's ready-made animation clips to visualize a LangGraph action.
export async function buildSoloRobot(accent = 0xc2a4ff): Promise<RobotInstance> {
  const loaded = await loadRobot();
  const inst = makeInstance(loaded, accent);
  inst.root.scale.setScalar(0.95);
  inst.play("Idle");
  return inst;
}

export async function buildRobotTeam(workerPositions: THREE.Vector3[]): Promise<RobotTeam> {
  const loaded = await loadRobot();

  // Orchestrator keeps the site purple, but solid (not washed out / glowing).
  const supervisor = makeInstance(loaded, 0xc2a4ff, 0.45);
  supervisor.root.scale.setScalar(0.74);
  supervisor.play("Idle");

  // Workers get distinct, solid colors: blue, red, green.
  const WORKER_COLORS = [0x3f7fff, 0xff4d4d, 0x35c46a];
  const workers = workerPositions.map((p, i) => {
    const w = makeInstance(loaded, WORKER_COLORS[i] ?? 0x8d7bd6, 0.8);
    w.root.position.copy(p);
    w.root.scale.setScalar(0.6);
    w.play("Idle");
    return w;
  });

  return { supervisor, workers };
}
