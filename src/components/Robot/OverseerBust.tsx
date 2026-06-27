import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, DRACOLoader } from "three-stdlib";
import { setRobotLighting } from "./utils/robotLighting";

// A reusable "overseer" bust (e.g. Mustafa) that watches the agents and gently
// tracks the cursor. The model is a static bust (no rig) so the life comes from
// the cursor-tracking rotation; the raw bottom cut is hidden with a CSS fade.
type Props = {
  /** GLB path. Defaults to the generated Mustafa bust. */
  src?: string;
  /** Square-ish pixel size of the canvas. */
  size?: number;
  /** Extra class on the wrapper. */
  className?: string;
  /** Optional name shown under the bust (rendered above the mist so it stays legible). */
  label?: string;
};

function measure(obj: THREE.Object3D) {
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

const OverseerBust = ({ src = "/models/graph/mustafa.glb", size = 240, className = "", label }: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.08, 3.9);
    camera.lookAt(0, 0.08, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    setRobotLighting(scene);
    const fill = new THREE.DirectionalLight(0xc2a4ff, 0.5);
    fill.position.set(-3, 2, 4);
    scene.add(fill);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    document.addEventListener("mousemove", onMove);

    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    loader.setDRACOLoader(draco);
    loader.load(
      src,
      (g) => {
        if (disposed) return;
        const obj = g.scene;
        obj.traverse((o) => (o.frustumCulled = false));
        const box = measure(obj);
        const sz = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxH = Math.max(sz.y, sz.x) || 1;
        const s = 2.0 / maxH;
        obj.position.sub(center);
        obj.scale.setScalar(s);
        // Keep it roughly centered (a touch low) so the head has top clearance.
        obj.position.y -= sz.y * s * 0.02;
        pivot.add(obj);
      },
      undefined,
      () => {}
    );

    const fit = () => {
      const r = mount.getBoundingClientRect();
      const d = Math.max(1, Math.min(r.width, r.height));
      renderer.setSize(r.width || size, r.height || size, false);
      camera.aspect = (r.width || size) / (r.height || size);
      camera.updateProjectionMatrix();
      void d;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(mount);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      // Track the cursor: turn toward it (yaw) and clearly look up/down (pitch).
      // A small downward bias keeps it generally watching the agents below.
      // Base yaw biased left so he generally faces the agents to his left.
      pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, -0.38 + mouse.x * 0.5, 0.06);
      pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, 0.12 + mouse.y * 0.5, 0.06);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      draco.dispose();
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [src, size]);

  return (
    <div
      className={`overseer-bust ${className}`}
      aria-hidden="true"
      style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <div
          ref={mountRef}
          style={{
            width: "100%",
            height: "100%",
            // Soft, gradual fade so the raw bottom cut of the bust dissolves.
            WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 85%)",
            maskImage: "linear-gradient(to bottom, #000 50%, transparent 85%)",
          }}
        />
        {/* Mist where the bust dissolves, so it never reads as a hard cut. */}
        <div
          style={{
            position: "absolute",
            left: "-10%",
            right: "-10%",
            bottom: 0,
            height: "54%",
            pointerEvents: "none",
            background:
              "linear-gradient(to top, rgba(7,6,14,0.82) 0%, rgba(7,6,14,0.55) 32%, rgba(7,6,14,0.22) 64%, rgba(7,6,14,0) 100%)",
            filter: "blur(7px)",
          }}
        />
      </div>
      {/* Name — rendered after the mist (so it paints on top) and pulled up over
          the dissolve, so the fog never hides it. */}
      {label && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: -Math.round(size * 0.06) + 2,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#e9e0ff",
            textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default OverseerBust;
