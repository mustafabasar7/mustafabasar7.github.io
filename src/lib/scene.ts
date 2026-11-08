import * as THREE from "three";
import { isPhone } from "./viewport";

/**
 * Scene module: the single owner of WebGL canvas plumbing (renderer creation,
 * DPR cap, resize, container-relative pointer, pause when off-screen or tab
 * hidden, full disposal). Callers only describe *what* to draw:
 *
 *   const handle = mountScene(el, (ctx) => {
 *     ...build scene/camera...
 *     return { update: (dt, t) => {...}, render: () => ctx.renderer.render(scene, camera) };
 *   }, { rendererOptions: { alpha: true }, maxDpr: 2 });
 *   // later: handle.dispose();
 */

/** Phones render at a lower pixel ratio to save fill-rate and battery. */
export const PHONE_MAX_DPR = 1.25;

/** Pure: effective pixel ratio given the device ratio, caller cap and tier. */
export function capDpr(deviceDpr: number, max: number, phone: boolean): number {
  const limit = phone ? Math.min(max, PHONE_MAX_DPR) : max;
  return Math.min(deviceDpr || 1, limit);
}

/**
 * Pure: pointer position relative to a container rect, normalized to
 * [-1, 1] (x right-positive, y DOWN-positive, matching the old window-based
 * normalization). Clamped; a zero-size rect yields 0.
 */
export function normalizePointer(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): { x: number; y: number } {
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  if (!rect.width || !rect.height) return { x: 0, y: 0 };
  return {
    x: clamp(((clientX - rect.left) / rect.width) * 2 - 1),
    y: clamp(((clientY - rect.top) / rect.height) * 2 - 1),
  };
}

/** Pure: should the render loop be running? */
export const shouldRun = (inView: boolean, visibility: DocumentVisibilityState | string) =>
  inView && visibility === "visible";

/** Dispose geometries, materials (and their textures) of everything under root. */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    mats.forEach((mat) => {
      Object.values(mat).forEach((v) => {
        if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose();
      });
      mat.dispose();
    });
  });
}

export interface SceneContext {
  container: HTMLElement;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  /** Live, container-relative normalized pointer (see {@link normalizePointer}). */
  pointer: { x: number; y: number };
}

export interface SceneInstance {
  /** Per-frame logic; dt/t in seconds. */
  update?: (dt: number, t: number) => void;
  /** Draw the frame (renderer.render or composer.render). */
  render: () => void;
  /** Called with the container's CSS size on mount and whenever it changes. */
  onResize?: (width: number, height: number) => void;
  /** Extra cleanup, run before the module's own disposal. */
  dispose?: () => void;
  /** Scene graphs to free (geometries/materials/textures) on dispose. */
  scenes?: THREE.Object3D[];
}

export interface MountOptions {
  rendererOptions?: THREE.WebGLRendererParameters;
  /** Desktop/tablet DPR cap (phones get {@link PHONE_MAX_DPR} at most). */
  maxDpr?: number;
  /** Let three set the canvas inline CSS size (default true). */
  updateStyle?: boolean;
}

export interface SceneHandle {
  dispose: () => void;
}

export function mountScene(
  container: HTMLElement,
  build: (ctx: SceneContext) => SceneInstance,
  opts: MountOptions = {}
): SceneHandle {
  const { rendererOptions, maxDpr = 2, updateStyle = true } = opts;

  const renderer = new THREE.WebGLRenderer(rendererOptions);
  renderer.setPixelRatio(capDpr(window.devicePixelRatio, maxDpr, isPhone()));
  container.appendChild(renderer.domElement);

  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0 };
  const ctx: SceneContext = { container, renderer, clock, pointer };
  const inst = build(ctx);

  const applySize = () => {
    const r = container.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, updateStyle);
    inst.onResize?.(r.width, r.height);
  };
  applySize();
  const ro = new ResizeObserver(applySize);
  ro.observe(container);

  const onPointer = (e: PointerEvent) => {
    const p = normalizePointer(e.clientX, e.clientY, container.getBoundingClientRect());
    pointer.x = p.x;
    pointer.y = p.y;
  };
  document.addEventListener("pointermove", onPointer);

  let rafId = 0;
  let running = false;
  const frame = () => {
    rafId = requestAnimationFrame(frame);
    const dt = clock.getDelta();
    inst.update?.(dt, clock.getElapsedTime());
    inst.render();
  };
  const start = () => {
    if (running) return;
    running = true;
    clock.getDelta(); // drop the paused gap
    frame();
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };
  let inView = true;
  const sync = () => (shouldRun(inView, document.visibilityState) ? start() : stop());
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    sync();
  }, { threshold: 0 });
  io.observe(container);
  document.addEventListener("visibilitychange", sync);
  start();

  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("pointermove", onPointer);
      inst.dispose?.();
      inst.scenes?.forEach((s) => {
        disposeObject(s);
        (s as THREE.Scene).clear?.();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    },
  };
}
