import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildSoloRobot, RobotInstance } from "./utils/robotModel";
import { setRobotLighting } from "./utils/robotLighting";
import { mountScene } from "../../lib/scene";

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
    let disposed = false;

    const handle = mountScene(
      mount,
      ({ renderer, pointer: mouse }) => {
        const rect = mount.getBoundingClientRect();
        const w = rect.width || 480;
        const h = rect.height || 520;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
        camera.position.set(0, 1.1, 7.2);
        camera.lookAt(0, 0.6, 0);

        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        setRobotLighting(scene);

        let robot: RobotInstance | null = null;
        let clipIndex = 0;
        let nextAt = 0;

        buildSoloRobot(0xc2a4ff)
          .then((inst) => {
            if (disposed) return;
            robot = inst;
            robot.root.position.set(0, -0.9, 0);
            scene.add(robot.root);
          })
          .catch(() => {});

        return {
          scenes: [scene],
          onResize(rw, rh) {
            camera.aspect = rw / rh;
            camera.updateProjectionMatrix();
          },
          update(dt, t) {
            if (!robot) return;
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
          },
          render: () => renderer.render(scene, camera),
        };
      },
      {
        rendererOptions: { alpha: true, antialias: true, powerPreference: "high-performance" },
        maxDpr: 1.5,
      }
    );

    return () => {
      disposed = true;
      handle.dispose();
    };
  }, [hold]);

  return <div className="robot-solo-canvas" ref={mountRef} />;
};

export default RobotSolo;
