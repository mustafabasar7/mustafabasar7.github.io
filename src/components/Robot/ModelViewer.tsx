import { useEffect, useRef, useState } from "react";
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
  /** If set, render a moving flock of these GLBs instead of one model. */
  flock?: string[];
  /** Flock variant: keep the pack on the ground instead of flying in orbits. */
  ground?: boolean;
  /** Upright correction (radians) for models exported Z-up instead of Y-up. */
  rotX?: number;
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

function clipIndex(clips: THREE.AnimationClip[], name?: string): number {
  if (!clips.length) return -1;
  if (name) {
    const i = clips.findIndex((c) => c.name.toLowerCase().includes(name.toLowerCase()));
    if (i >= 0) return i;
  }
  return 0;
}

/** "CharacterArmature|Wave" → "Wave"; "Sitting" → "Sitting". */
const prettyClip = (name: string) => name.split("|").pop() ?? name;

// Measure a model by its *bind-pose* geometry, not Box3.setFromObject — some
// rigged exports have a stray bone that blows the skinned bounds up (e.g. 182
// units), which would shrink the real subject to a speck. Unioning each mesh's
// geometry box, transformed by its world matrix, ignores that bone outlier.
function measureBindPose(obj: THREE.Object3D): THREE.Box3 {
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

// A generic GLB viewer you can play with: drag to rotate, click to change the
// pose (or scatter the swarm). Fits the subject in the box, sits it slightly
// low so it reads clearly, and plays its ready-made animation clip.
const ModelViewer = ({ url, scale = 1, clip, flock, ground, rotX = 0 }: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hud, setHud] = useState("drag to rotate");

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
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    mount.appendChild(renderer.domElement);

    setRobotLighting(scene);

    const pivot = new THREE.Group();
    scene.add(pivot);
    const mixers: THREE.AnimationMixer[] = [];
    const flyers: { obj: THREE.Object3D; radius: number; speed: number; angle: number; y: number }[] = [];

    // Single-model clip control (filled in once the GLB loads).
    let clipList: THREE.AnimationClip[] = [];
    let mainMixer: THREE.AnimationMixer | null = null;
    let current: THREE.AnimationAction | null = null;
    let curClip = -1;

    // Rotation driven by the user (drag + inertia) with a gentle idle spin.
    const rot = { y: 0, x: 0, vy: 0 };
    let dragging = false;
    let last = { x: 0, y: 0 };
    let moved = 0;
    let burst = 1; // swarm speed multiplier, decays back to 1

    const playClip = (i: number) => {
      if (!mainMixer || !clipList[i]) return;
      const next = mainMixer.clipAction(clipList[i]);
      next.reset().fadeIn(0.3).play();
      if (current && current !== next) current.fadeOut(0.3);
      current = next;
      curClip = i;
      setHud(`${prettyClip(clipList[i].name)} · click ↻`);
    };

    const onClick = () => {
      if (flyers.length) {
        burst = 2.6;
        setHud("scattering…");
        window.setTimeout(() => !disposed && setHud("click to scatter"), 900);
      } else if (clipList.length > 1) {
        playClip((curClip + 1) % clipList.length);
      } else {
        rot.vy += 0.25; // static model: a satisfying spin
      }
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      rot.vy = 0;
      last = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = "grabbing";
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      rot.y += dx * 0.008;
      rot.x = THREE.MathUtils.clamp(rot.x + dy * 0.005, -0.5, 0.5);
      rot.vy = dx * 0.008;
      last = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      try { renderer.domElement.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      if (moved < 5) onClick();
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);

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
      mixers.forEach((m) => m.update(dt));
      mainMixer?.update(dt);

      if (flyers.length) {
        burst = THREE.MathUtils.lerp(burst, 1, 0.03);
        flyers.forEach((f) => {
          f.angle += dt * f.speed * burst;
          const y = ground ? f.y : f.y + Math.sin(f.angle * 1.3) * 0.25;
          f.obj.position.set(Math.cos(f.angle) * f.radius, y, Math.sin(f.angle) * f.radius);
          f.obj.rotation.y = -f.angle + Math.PI / 2;
        });
      }

      // Rotation: drag sets it directly; otherwise inertia + a slow idle spin,
      // and the tilt eases back to level.
      if (!dragging) {
        rot.y += rot.vy + 0.0035;
        rot.vy *= 0.94;
        rot.x = THREE.MathUtils.lerp(rot.x, 0, 0.04);
      }
      pivot.rotation.y = rot.y;
      pivot.rotation.x = rot.x;

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
      // A pack/swarm — clone each kind a few times and orbit them. On the
      // ground we drop the vertical bob and tuck the pack low; in the air they
      // fly in stacked rings.
      const perKind = ground ? 3 : 4;
      setHud(ground ? "click to scatter the pack" : "click to scatter the swarm");
      Promise.all(flock.map((u) => load(u)))
        .then((kinds) => {
          if (disposed) return;
          let maxR = 1;
          kinds.forEach((k, ki) => {
            const box = new THREE.Box3().setFromObject(k.scene);
            const size = box.getSize(new THREE.Vector3()).length() || 1;
            const norm = (2.6 / size) * scale;
            const ci = clipIndex(k.animations, ground ? "walk" : undefined);
            for (let i = 0; i < perKind; i++) {
              const inst = SkeletonUtils.clone(k.scene);
              // Animated skinned meshes have a stale bounding sphere after
              // cloning — disable frustum culling so they never vanish.
              inst.traverse((o) => { o.frustumCulled = false; });
              inst.scale.setScalar(norm);
              const ring = ground ? 1.2 + ki * 0.7 + i * 0.18 : 1.8 + ki * 0.9;
              maxR = Math.max(maxR, ring);
              const phase = (i / perKind) * Math.PI * 2 + ki;
              flyers.push({
                obj: inst,
                radius: ring,
                speed: (ground ? 0.35 : 0.5) + ki * 0.15,
                angle: phase,
                y: ground ? -0.9 : (ki - 1) * 0.7,
              });
              pivot.add(inst);
              if (k.animations.length && ci >= 0) {
                const mixer = new THREE.AnimationMixer(inst);
                mixer.clipAction(k.animations[ci]).play();
                mixers.push(mixer);
              }
            }
          });
          // Ground packs read better framed a touch higher (subject sits low).
          frame(maxR + 0.6, ground ? 1.4 : 1.0);
        })
        .catch(() => {});
    } else {
      load(url)
        .then(({ scene: model, animations }) => {
          if (disposed) return;
          const root = SkeletonUtils.clone(model);
          // Animated skinned meshes have a stale bounding sphere after cloning —
          // disable frustum culling so they never get wrongly culled away.
          root.traverse((o) => { o.frustumCulled = false; });
          // Stand up Z-up exports before measuring so the fit is correct.
          root.rotation.x = rotX;
          pivot.add(root);

          // 1) normalize size, then 2) recenter on the *scaled* bounds, then
          //    3) drop the subject a touch so it sits low and reads clearly.
          const pre = measureBindPose(root);
          const maxDim = Math.max(...pre.getSize(new THREE.Vector3()).toArray()) || 1;
          root.scale.setScalar((2.6 / maxDim) * scale);

          const post = measureBindPose(root);
          const center = post.getCenter(new THREE.Vector3());
          root.position.sub(center);

          const sphere = post.getBoundingSphere(new THREE.Sphere());
          root.position.y -= sphere.radius * 0.06;
          frame(sphere.radius, 1.6);

          clipList = animations;
          if (animations.length) {
            mainMixer = new THREE.AnimationMixer(root);
            playClip(clipIndex(animations, clip));
          } else {
            setHud("drag to rotate");
          }
        })
        .catch(() => {});
    }

    return () => {
      disposed = true;
      stop();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [url, scale, clip, flock, ground, rotX]);

  return (
    <div className="model-viewer-wrap">
      <div className="model-viewer-canvas" ref={mountRef} />
      <div className="mv-hud">{hud}</div>
    </div>
  );
};

export default ModelViewer;
