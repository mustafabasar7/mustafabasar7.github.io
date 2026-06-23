import * as THREE from "three";

export function setRobotLighting(scene: THREE.Scene): void {
  const ambient = new THREE.AmbientLight(0xc8b9ff, 0.85);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(3, 5, 4);
  scene.add(key);

  // strong purple rim from behind for a glowing, eye-catching edge
  const rim = new THREE.PointLight(0xc2a4ff, 14, 40);
  rim.position.set(-3, 2, -3);
  scene.add(rim);

  // warm accent fill from the right
  const fill = new THREE.PointLight(0xff8fd0, 6, 30);
  fill.position.set(4, -1, 2);
  scene.add(fill);
}
