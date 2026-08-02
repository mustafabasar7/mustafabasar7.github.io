import * as THREE from "three";

export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchMove = (
  event: TouchEvent,
  startX: number,
  setMousePosition: (x: number, y: number) => void
) => {
  const dragDistance = event.touches[0].clientX - startX;
  const mouseX = THREE.MathUtils.clamp(
    dragDistance / (window.innerWidth * 0.45),
    -1,
    1
  );
  // Vertical movement belongs to native page scrolling; only horizontal drag
  // controls the character so the model does not bob during a swipe.
  setMousePosition(mouseX, 0);
};

export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  setMousePosition(0, 0, 0.05, 0.05);
};

export const handleHeadRotation = (
  headBone: THREE.Object3D,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  lerp: (x: number, y: number, t: number) => number
) => {
  if (!headBone) return;
  if (window.innerWidth <= 768 && window.scrollY < 200) {
    headBone.rotation.y = lerp(headBone.rotation.y, mouseX * 0.5, 0.09);
    headBone.rotation.x = lerp(headBone.rotation.x, mouseY * 0.22, 0.09);
    return;
  }

  // Preserve the established fixed desktop pose.
  if (window.scrollY < 200) {
    headBone.rotation.y = lerp(headBone.rotation.y, 0.5, interpolationY);
    headBone.rotation.x = lerp(headBone.rotation.x, 0, interpolationX);
  } else {
    if (window.innerWidth > 1024) {
      headBone.rotation.x = lerp(headBone.rotation.x, -0.4, 0.03);
      headBone.rotation.y = lerp(headBone.rotation.y, -0.3, 0.03);
    }
  }
};
