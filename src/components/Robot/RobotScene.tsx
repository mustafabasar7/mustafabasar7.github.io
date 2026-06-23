import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, RenderPass, ShaderPass, FXAAShader } from "three-stdlib";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildRobotTeam, RobotInstance } from "./utils/robotModel";
import { setRobotLighting } from "./utils/robotLighting";
import { activeWorker, pulsePhase } from "./utils/orchestration";

gsap.registerPlugin(ScrollTrigger);

const WORKER_POSITIONS = [
  new THREE.Vector3(-2.6, -1.7, 0.2),
  new THREE.Vector3(0, -2.0, 0.8),
  new THREE.Vector3(2.6, -1.7, 0.2),
];
const SUPERVISOR_ANCHOR = new THREE.Vector3(0, 1.2, 0);
const ROLES = ["Security", "Document Analyst", "Code"];
// Role-specific "action" each worker performs when the supervisor activates it.
const ROLE_ACTIONS = ["Punch", "ThumbsUp", "Jump"];

const RobotScene = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    mount.style.position = "relative";
    const rect = mount.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
    camera.position.set(0, 0.2, 13);
    camera.lookAt(0, -0.2, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.addPass(new RenderPass(scene, camera));
    const fxaa = new ShaderPass(FXAAShader);
    const setFxaa = () => {
      const r = mount.getBoundingClientRect();
      const pr = renderer.getPixelRatio();
      composer.setSize(r.width, r.height);
      fxaa.material.uniforms["resolution"].value.set(1 / (r.width * pr), 1 / (r.height * pr));
    };
    setFxaa();
    composer.addPass(fxaa);

    setRobotLighting(scene);

    // edges supervisor -> each worker
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x8d7bd6, transparent: true, opacity: 0.45 });
    WORKER_POSITIONS.forEach((p) => {
      const g = new THREE.BufferGeometry().setFromPoints([SUPERVISOR_ANCHOR, p]);
      scene.add(new THREE.Line(g, edgeMat));
    });

    // task pulse
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xe6c3ff })
    );
    scene.add(pulse);

    // interaction state
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    document.addEventListener("mousemove", onMouseMove);

    const label = document.createElement("div");
    label.className = "robot-role-label";
    label.style.cssText =
      "position:absolute;pointer-events:none;padding:4px 10px;border-radius:14px;" +
      "background:rgba(31,27,56,.88);color:#e6dcff;font:600 12px/1 'Segoe UI',sans-serif;" +
      "letter-spacing:.05em;opacity:0;transition:opacity .15s;transform:translate(-50%,-130%);z-index:5;";
    mount.appendChild(label);

    const st = gsap.fromTo(
      camera.position,
      { z: 15, y: 0.8 },
      {
        z: 12,
        y: -0.2,
        ease: "none",
        scrollTrigger: { trigger: ".robot-section", start: "top bottom", end: "center center", scrub: 0.5 },
      }
    );

    let team: { supervisor: RobotInstance; workers: RobotInstance[] } | null = null;
    let lastActive = -1;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let onHover: ((e: MouseEvent) => void) | null = null;

    const clock = new THREE.Clock();
    let rafId = 0;
    let running = false;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      if (team) {
        team.supervisor.mixer.update(dt);
        team.workers.forEach((wk) => wk.mixer.update(dt));

        team.supervisor.root.position.y = SUPERVISOR_ANCHOR.y + Math.sin(t * 1.4) * 0.06;
        team.supervisor.root.rotation.y = THREE.MathUtils.lerp(
          team.supervisor.root.rotation.y,
          mouse.x * 0.6,
          0.08
        );

        const active = activeWorker(t);
        const phase = pulsePhase(t);
        pulse.position.lerpVectors(SUPERVISOR_ANCHOR, WORKER_POSITIONS[active], phase);

        if (active !== lastActive) {
          team.workers.forEach((wk, i) => wk.play(i === active ? ROLE_ACTIONS[i] : "Idle"));
          // supervisor reacts too — a quick gesture as it dispatches
          team.supervisor.play(active % 2 === 0 ? "ThumbsUp" : "Wave");
          lastActive = active;
        }
      }

      composer.render();
    };

    let inView = true;
    const start = () => { if (!running) { running = true; clock.getDelta(); animate(); } };
    const stop = () => { running = false; cancelAnimationFrame(rafId); };
    const sync = () => { if (inView && document.visibilityState === "visible") start(); else stop(); };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0 });
    io.observe(mount);
    document.addEventListener("visibilitychange", sync);
    const onResize = () => {
      const r = mount.getBoundingClientRect();
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
      setFxaa();
    };
    window.addEventListener("resize", onResize);
    start();

    // Load robots, then complete the loading screen.
    buildRobotTeam(WORKER_POSITIONS)
      .then((built) => {
        if (disposed) return;
        team = built;
        scene.add(built.supervisor.root);
        built.workers.forEach((wk) => scene.add(wk.root));

        const workerRoots = built.workers.map((wk) => wk.root);
        onHover = (e: MouseEvent) => {
          const r = mount.getBoundingClientRect();
          ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
          ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
          raycaster.setFromCamera(ndc, camera);
          const hits = raycaster.intersectObjects(workerRoots, true);
          if (hits.length) {
            let obj: THREE.Object3D | null = hits[0].object;
            let idx = -1;
            while (obj && idx === -1) {
              idx = workerRoots.indexOf(obj);
              obj = obj.parent;
            }
            if (idx !== -1) {
              label.textContent = ROLES[idx];
              label.style.left = `${e.clientX - r.left}px`;
              label.style.top = `${e.clientY - r.top}px`;
              label.style.opacity = "1";
              return;
            }
          }
          label.style.opacity = "0";
        };
        mount.addEventListener("mousemove", onHover);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("mousemove", onMouseMove);
      if (onHover) mount.removeEventListener("mousemove", onHover);
      window.removeEventListener("resize", onResize);
      st.scrollTrigger?.kill();
      st.kill();
      label.remove();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return <div className="robot-canvas" ref={mountRef} />;
};

export default RobotScene;
