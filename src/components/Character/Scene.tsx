import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { EffectComposer, RenderPass, ShaderPass, FXAAShader } from "three-stdlib";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      // FXAA post-process antialiasing - lighter than MSAA, preserves transparency.
      const composer = new EffectComposer(renderer);
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.addPass(new RenderPass(scene, camera));
      const fxaaPass = new ShaderPass(FXAAShader);
      const updateFxaa = () => {
        const r = canvasDiv.current!.getBoundingClientRect();
        const pr = renderer.getPixelRatio();
        composer.setSize(r.width, r.height);
        fxaaPass.material.uniforms["resolution"].value.set(
          1 / (r.width * pr),
          1 / (r.height * pr)
        );
      };
      updateFxaa();
      composer.addPass(fxaaPass);

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      let cancelled = false;
      let charResizeObserver: ResizeObserver | null = null;
      loadCharacter((value) => setLoading(value)).then((gltf) => {
        if (!cancelled && gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          screenLight = character.getObjectByName("screenlight") || null;
          setLoading(100);
          light.turnOnLights();
          animations.startIntro();
          window.addEventListener("resize", () => {
            handleResize(renderer, camera, canvasDiv, character);
            updateFxaa();
          });
          // On a language toggle the whole subtree remounts; the canvas can be
          // sized before layout settles, leaving the model off-center. Re-fit
          // once it loads, and observe the container so it recenters when its
          // real size arrives.
          const refit = () => { handleResize(renderer, camera, canvasDiv, character); updateFxaa(); };
          requestAnimationFrame(refit);
          if (canvasDiv.current) {
            charResizeObserver = new ResizeObserver(refit);
            charResizeObserver.observe(canvasDiv.current);
          }
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      let rafId = 0;
      let running = false;
      const animate = () => {
        rafId = requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        composer.render();
      };

      // Only render while the canvas is on-screen and the tab is visible.
      let inView = true;
      const start = () => {
        if (running) return;
        running = true;
        clock.getDelta(); // discard the paused interval so the mixer doesn't jump
        animate();
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(rafId);
      };
      const syncLoop = () => {
        if (inView && document.visibilityState === "visible") start();
        else stop();
      };
      const observer = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          syncLoop();
        },
        { threshold: 0 }
      );
      observer.observe(canvasDiv.current);
      document.addEventListener("visibilitychange", syncLoop);
      start();

      return () => {
        cancelled = true;
        clearTimeout(debounce);
        stop();
        charResizeObserver?.disconnect();
        observer.disconnect();
        document.removeEventListener("visibilitychange", syncLoop);
        scene.clear();
        composer.dispose();
        renderer.dispose();
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
