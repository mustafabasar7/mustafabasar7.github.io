import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = (onProgress?: (percent: number) => void) => {
    return new Promise<GLTF | null>((resolve, reject) => {
      loader.load(
        "/models/character.glb",
        async (gltf) => {
          const character = gltf.scene;
          await renderer.compileAsync(character, camera, scene);
          character.traverse((child: any) => {
            if (child.isMesh) {
              const mesh = child as THREE.Mesh;
              child.castShadow = false;
              child.receiveShadow = false;
              mesh.frustumCulled = true;
              if (mesh.material && !Array.isArray(mesh.material)) {
                (mesh.material as THREE.ShaderMaterial).precision = "mediump";
              }
            }
          });
          resolve(gltf);
          setCharTimeline(character, camera);
          setAllTimeline();
          character.getObjectByName("footR")!.position.y = 3.36;
          character.getObjectByName("footL")!.position.y = 3.36;
          dracoLoader.dispose();
        },
        (event) => {
          if (onProgress && event.total) {
            onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
          }
        },
        (error) => {
          console.error("Error loading GLTF model:", error);
          reject(error);
        }
      );
    });
  };

  return { loadCharacter };
};

export default setCharacter;
