import * as THREE from "three";

export function setRobotLighting(scene: THREE.Scene): void {
  const ambient = new THREE.AmbientLight(0xb9a8ff, 0.6);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xc2a4ff, 6, 30);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
}
