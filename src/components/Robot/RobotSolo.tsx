import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildSoloRobot, RobotInstance } from "./utils/robotModel";
import { setRobotLighting } from "./utils/robotLighting";

interface Props {
  /** Ready-made robot.glb clips to cycle through, visualizing the action. */
  clips: string[];
  /** Seconds each clip plays before advancing. */
  hold?: number;
}

// A single centered robot that loops through the model's ready-made animation
// clips. Used on project detail pages to visually accompany the live LangGraph
// action. No hand-authored animation - only the clips baked into the model.
const RobotSolo = ({ clips, hold = 2.6 }: Props) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const clipsRef = useRef(clips);
  clipsRef.current = clips.length ? clips : ["Idle"];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const rect = mount.getBoundingClientRect();
    const w = rect.width || 480;
    const h = rect.height || 520;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 1.1, 7.2);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    setRobotLighting(scene);

    const mouse = { x: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    };
    document.addEventListener("mousemove", onMouseMove);

    let robot: RobotInstance | null = null;
    let clipIndex = 0;
    let nextAt = 0;
    const clock = new THREE.Clock();
    let rafId = 0;
    let running = false;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      if (robot) {
        robot.mixer.update(dt);
        robot.root.position.y = -0.9 + Math.sin(t * 1.4) * 0.04;
        robot.root.rotation.y = THREE.MathUtils.lerp(robot.root.rotation.y, mouse.x * 0.6, 0.06);
        // advance through the ready-made clips
        if (t >= nextAt) {
          const list = clipsRef.current;
          const name = list[clipIndex % list.length];
          robot.play(name, { once: false });
          clipIndex++;
          nextAt = t + hold;
        }
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

    buildSoloRobot(0xc2a4ff)
      .then((inst) => {
        if (disposed) return;
        robot = inst;
        robot.root.position.set(0, -0.9, 0);
        scene.add(robot.root);
      })
      .catch(() => {});

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
  }, [hold]);

  return <div className="robot-solo-canvas" ref={mountRef} />;
};

export default RobotSolo;
