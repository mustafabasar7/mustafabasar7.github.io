import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, SkeletonUtils } from "three-stdlib";

// Ready-made GLBs per node kind (CC0, from poly.pizza). Kinds without an entry
// fall back to a procedural mesh, so the cast can grow one model at a time.
const GLB_BY_KIND: Record<string, string> = {
  doc: "/models/graph/doc.glb",
  tool: "/models/graph/tool1.glb",
  tool2: "/models/graph/tool2.glb",
  human: "/models/graph/human.glb",
};

type LoadedGLB = { scene: THREE.Object3D; animations: THREE.AnimationClip[] };
const glbCache = new Map<string, Promise<LoadedGLB>>();

function loadGLBRaw(url: string): Promise<LoadedGLB> {
  let p = glbCache.get(url);
  if (!p) {
    p = new Promise<LoadedGLB>((resolve, reject) => {
      new GLTFLoader().load(url, (g) => resolve({ scene: g.scene, animations: g.animations }), undefined, reject);
    });
    glbCache.set(url, p);
  }
  return p;
}

// Returns a normalized clone plus a clip lookup (for animated models). Uses
// SkeletonUtils.clone so skinned meshes animate correctly per-instance.
function loadGLB(url: string): Promise<{ object: THREE.Object3D; clips: THREE.AnimationClip[] }> {
  return loadGLBRaw(url).then(({ scene, animations }) => ({
    object: normalize(SkeletonUtils.clone(scene)),
    clips: animations,
  }));
}

// Measure a model's real size from its GEOMETRY bounding boxes (transformed by
// world matrix), not Box3.setFromObject — skinned characters have a stray bone
// that blows up setFromObject and shrinks the figure to a speck.
function measureBox(obj: THREE.Object3D): THREE.Box3 {
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.geometry) {
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      if (m.geometry.boundingBox) {
        tmp.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
        box.union(tmp);
      }
    }
  });
  return box;
}

// Center the model and scale it so its largest dimension is ~2 world units,
// so a node's `scale = r * factor` frames it consistently.
function normalize(obj: THREE.Object3D): THREE.Object3D {
  const box = measureBox(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  obj.position.sub(center);
  const max = Math.max(size.x, size.y, size.z) || 1;
  const wrap = new THREE.Group();
  obj.scale.multiplyScalar(2 / max);
  wrap.add(obj);
  // Skinned meshes can frustum-cull incorrectly (stray bone) → disable it.
  obj.traverse((o) => { o.frustumCulled = false; });
  return wrap;
}

// Tiny 3D objects placed on the agent-graph nodes. A transparent canvas is laid
// over the SVG; an orthographic camera is mapped 1:1 to the SVG viewBox so each
// object sits exactly on its node. Objects are lightweight procedural meshes
// (no GLB downloads) that read as the node's role: doc / globe / check / hub…
export type GNode3D = { x: number; y: number; r: number; kind: string; glb?: string; scale?: number };

const VB_W = 300;
const VB_H = 372;

function makeMesh(kind: string): THREE.Object3D {
  const g = new THREE.Group();
  const purple = 0xc2a4ff;
  const matStd = (color: number, opts: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.55, ...opts });

  switch (kind) {
    case "doc": {
      const paper = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.7, 0.12), matStd(0xf2ecff));
      g.add(paper);
      // text lines
      const lineMat = matStd(0x9d7bff);
      for (let i = 0; i < 3; i++) {
        const ln = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.02), lineMat);
        ln.position.set(-0.1, 0.4 - i * 0.4, 0.08);
        g.add(ln);
      }
      break;
    }
    case "globe": {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), matStd(0x3f7fff, { roughness: 0.4 }));
      g.add(ball);
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(1.02, 12, 8)),
        new THREE.LineBasicMaterial({ color: 0xbcd4ff, transparent: true, opacity: 0.5 })
      );
      g.add(wire);
      break;
    }
    case "check": {
      const shape = new THREE.Shape();
      shape.moveTo(-0.7, 0.05);
      shape.lineTo(-0.25, -0.45);
      shape.lineTo(0.7, 0.6);
      shape.lineTo(0.5, 0.8);
      shape.lineTo(-0.25, 0.0);
      shape.lineTo(-0.5, 0.3);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false });
      geo.center();
      const check = new THREE.Mesh(geo, matStd(0x35c46a));
      check.scale.setScalar(1.15);
      g.add(check);
      g.userData.upright = true; // keep it standing; spin around its vertical axis
      break;
    }
    case "hub": {
      g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), matStd(purple, { flatShading: true })));
      break;
    }
    case "box": {
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), matStd(0x8d7bd6, { flatShading: true })));
      break;
    }
    case "ring": {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.28, 12, 28), matStd(purple)));
      break;
    }
    case "dot": {
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), matStd(purple)));
      break;
    }
    case "gear": {
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.35, 8), matStd(0x9d7bff, { flatShading: true })));
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.45, 16), matStd(0x15281c)));
      for (let i = 0; i < 8; i++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.45), matStd(0x9d7bff, { flatShading: true }));
        const a = (i / 8) * Math.PI * 2;
        tooth.position.set(Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85);
        tooth.rotation.y = -a;
        g.add(tooth);
      }
      g.rotation.x = Math.PI / 2;
      break;
    }
    case "disk": {
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.4), matStd(0x4a3f7a, { flatShading: true })));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.5), matStd(0xe8e0ff)));
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.5), matStd(0x2a2350));
      slot.position.set(0.1, 0.5, 0);
      g.add(slot);
      break;
    }
    case "stop": {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.3, 8), matStd(0xff7d5a, { flatShading: true }));
      s.rotation.x = Math.PI / 2;
      g.add(s);
      break;
    }
    case "warn": {
      g.add(new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.5, 4), matStd(0xffb23f, { flatShading: true })));
      break;
    }
    case "play": {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.3, 24), matStd(0x35c46a));
      c.rotation.z = -Math.PI / 2;
      g.add(c);
      break;
    }
    case "x": {
      const a = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.3), matStd(0xe0556a));
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.3), matStd(0xe0556a));
      a.rotation.z = Math.PI / 4;
      b.rotation.z = -Math.PI / 4;
      g.add(a, b);
      break;
    }
    default: {
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), matStd(purple)));
    }
  }
  return g;
}

const ProjectGraph3D = ({ nodes, running }: { nodes: GNode3D[]; running?: boolean }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    // Orthographic camera mapped to the SVG viewBox, but Y-up (top=VB_H) so the
    // 3D models render upright. Node Y is flipped when placing (VB_H - y) to keep
    // them aligned with the SVG, which is Y-down.
    const camera = new THREE.OrthographicCamera(0, VB_W, VB_H, 0, -100, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(60, -40, 120);
    scene.add(dir);
    const rim = new THREE.DirectionalLight(0xc2a4ff, 0.6);
    rim.position.set(-80, 60, 40);
    scene.add(rim);

    const objs: THREE.Object3D[] = [];
    const mixers: THREE.AnimationMixer[] = [];
    const timers: number[] = [];
    let disposed = false;

    const place = (inner: THREE.Object3D, n: GNode3D, clips?: THREE.AnimationClip[]) => {
      if (disposed) return;
      const o = new THREE.Group();
      o.add(inner);
      o.position.set(n.x, VB_H - n.y, 0); // flip Y to match the SVG (Y-down)
      // Per-kind size tweaks so small/dark models (e.g. tools) still read.
      const KIND_SCALE: Record<string, number> = { tool: 1.5, tool2: 1.5, doc: 1.2, human: 0.9 };
      o.scale.setScalar(n.r * 1.42 * (n.scale ?? KIND_SCALE[n.kind] ?? 1));
      // The tall human spanned both labels — keep it small and centered so its
      // head clears "risky step" above and its feet clear "interrupt" below.
      if (n.kind === "human") o.position.y -= 2;

      // Any model that ships animation clips stands still and plays Idle (so it
      // feels alive); the human approver also waves every 5s. Others slowly spin.
      const wave = clips?.find((c) => /\bWave\b/i.test(c.name));
      const idle = clips?.find((c) => /Idle$/i.test(c.name)) ?? clips?.find((c) => /Idle/i.test(c.name));
      if (clips && clips.length && (idle || wave)) {
        o.userData.spin = 0;
        o.rotation.x = 0;
        const mixer = new THREE.AnimationMixer(inner);
        mixers.push(mixer);
        if (idle) mixer.clipAction(idle).play();
        if (n.kind === "human" && wave) {
          const waveAt = () => {
            if (disposed) return;
            const a = mixer.clipAction(wave);
            a.setLoop(THREE.LoopOnce, 1);
            a.reset();
            a.play();
          };
          waveAt();
          timers.push(window.setInterval(waveAt, 5000)); // wave every 5s
        }
      } else {
        o.userData.spin = 0.3 + Math.random() * 0.3;
        o.rotation.x = inner.userData.upright ? 0 : -0.18;
      }
      // Gentle vertical bob so even the non-animated models feel alive.
      o.userData.baseY = o.position.y;
      o.userData.bob = n.kind === "human" ? 0 : 1.4 + Math.random();
      o.userData.phase = Math.random() * Math.PI * 2;
      scene.add(o);
      objs.push(o);
    };

    nodes.forEach((n) => {
      const url = n.glb || GLB_BY_KIND[n.kind];
      if (url) {
        loadGLB(url)
          .then(({ object, clips }) => place(object, n, clips))
          .catch(() => place(makeMesh(n.kind), n)); // fall back if the GLB fails
      } else {
        place(makeMesh(n.kind), n);
      }
    });

    const size = () => {
      const r = mount.getBoundingClientRect();
      if (r.width && r.height) renderer.setSize(r.width, r.height, false);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(mount);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      const speed = running ? 1.8 : 1;
      objs.forEach((o) => {
        o.rotation.y += dt * (o.userData.spin as number) * speed;
        const bob = o.userData.bob as number;
        if (bob) o.position.y = (o.userData.baseY as number) + Math.sin(t * 1.6 + (o.userData.phase as number)) * bob * speed;
      });
      mixers.forEach((m) => m.update(dt));
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => clearInterval(id));
      mixers.forEach((m) => m.stopAllAction());
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [nodes, running]);

  return <div className="pg-3d" ref={mountRef} aria-hidden="true" />;
};

export default ProjectGraph3D;
