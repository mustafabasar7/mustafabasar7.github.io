import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, DRACOLoader, SkeletonUtils } from "three-stdlib";
import { setRobotLighting } from "./utils/robotLighting";

interface Props {
  /** GLB URL to display. */
  url: string;
  /** Uniform scale multiplier on top of the auto-fit. */
  scale?: number;
  /** Preferred animation clip name (substring match); falls back to first clip. */
  clip?: string;
  /** If set, render an orbiting flock of these GLBs instead of one model. */
  flock?: string[];
}

const loaderCache = new Map<string, Promise<{ scene: THREE.Object3D; animations: THREE.AnimationClip[] }>>();

function load(url: string) {
  let p = loaderCache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/");
      loader.setDRACOLoader(draco);
      loader.load(url, (g) => resolve({ scene: g.scene, animations: g.animations }), undefined, reject);
    });
    loaderCache.set(url, p);
  }
  return p;
}

function pickClip(clips: THREE.AnimationClip[], name?: string): THREE.AnimationClip | null {
  if (!clips.length) return null;
  if (name) {
    const found = clips.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }
  return clips[0];
}

// A generic GLB viewer. Fits the subject in the box and centers it, plays its
// ready-made animation clip, and gently auto-rotates with mouse parallax.
const ModelViewer = ({ url, scale = 1, clip, flock }: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const rect = mount.getBoundingClientRect();
    const w = rect.width || 480;
    const h = rect.height || 520;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    setRobotLighting(scene);

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    document.addEventListener("mousemove", onMouseMove);

    const pivot = new THREE.Group();
    scene.add(pivot);
    const mixers: THREE.AnimationMixer[] = [];
    const flyers: { obj: THREE.Object3D; radius: number; speed: number; phase: number; y: number }[] = [];

    // Frame the camera to a bounding sphere, subject centered in the viewport.
    const frame = (radius: number, margin = 1.2) => {
      const fov = (camera.fov * Math.PI) / 180;
      const dist = (radius / Math.sin(fov / 2)) * margin;
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
    };

    let rafId = 0;
    let running = false;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      mixers.forEach((m) => m.update(dt));
      if (flyers.length) {
        flyers.forEach((f) => {
          const a = t * f.speed + f.phase;
          f.obj.position.set(Math.cos(a) * f.radius, f.y + Math.sin(t * 1.3 + f.phase) * 0.25, Math.sin(a) * f.radius);
          f.obj.rotation.y = -a + Math.PI / 2;
        });
        pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, mouse.x * 0.4, 0.05);
      } else {
        pivot.rotation.y += 0.004;
        pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, mouse.y * 0.1, 0.04);
      }
      renderer.render(scene, camera);
    };
    const start = () => { if (!running) { running = true; clock.getDelta(); animate(); } };
    const stop = () => { running = false; cancelAnimationFrame(rafId); };
    const onVis = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVis);

    const onResize = () => {
      const r = mount.getBoundingClientRect();
      if (!r.width || !r.height) return;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    };
    window.addEventListener("resize", onResize);
    start();

    if (flock && flock.length) {
      // Orbiting flock — a concrete swarm, framed tight so the birds read large.
      const perKind = 4;
      Promise.all(flock.map((u) => load(u)))
        .then((kinds) => {
          if (disposed) return;
          let maxR = 1;
          kinds.forEach((k, ki) => {
            const box = new THREE.Box3().setFromObject(k.scene);
            const size = box.getSize(new THREE.Vector3()).length() || 1;
            const norm = (2.6 / size) * scale; // bigger birds than before
            for (let i = 0; i < perKind; i++) {
              const inst = SkeletonUtils.clone(k.scene);
              inst.scale.setScalar(norm);
              const ring = 1.8 + ki * 0.9;
              maxR = Math.max(maxR, ring);
              const phase = (i / perKind) * Math.PI * 2 + ki;
              flyers.push({ obj: inst, radius: ring, speed: 0.5 + ki * 0.15, phase, y: (ki - 1) * 0.7 });
              pivot.add(inst);
              if (k.animations.length) {
                const mixer = new THREE.AnimationMixer(inst);
                mixer.clipAction(k.animations[0]).play();
                mixers.push(mixer);
              }
            }
          });
          frame(maxR + 0.6, 1.0); // zoomed in
        })
        .catch(() => {});
    } else {
      load(url)
        .then(({ scene: model, animations }) => {
          if (disposed) return;
          const root = SkeletonUtils.clone(model);
          pivot.add(root);

          // 1) normalize size, then 2) recenter on the *scaled* bounds so the
          //    subject is dead-center (no heads cut at the top).
          const pre = new THREE.Box3().setFromObject(root);
          const maxDim = Math.max(...pre.getSize(new THREE.Vector3()).toArray()) || 1;
          root.scale.setScalar((2.6 / maxDim) * scale);

          const post = new THREE.Box3().setFromObject(root);
          const center = post.getCenter(new THREE.Vector3());
          root.position.sub(center);

          const sphere = post.getBoundingSphere(new THREE.Sphere());
          frame(sphere.radius, 1.25);

          const chosen = pickClip(animations, clip);
          if (chosen) {
            const mixer = new THREE.AnimationMixer(root);
            mixer.clipAction(chosen).play();
            mixers.push(mixer);
          }
        })
        .catch(() => {});
    }

    return () => {
      disposed = true;
      stop();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [url, scale, clip, flock]);

  return <div className="model-viewer-canvas" ref={mountRef} />;
};

export default ModelViewer;
