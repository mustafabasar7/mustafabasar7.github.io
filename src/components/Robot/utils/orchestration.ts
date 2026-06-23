export const WORKER_COUNT = 3;

// Which worker (0..WORKER_COUNT-1) is active at `elapsed` seconds.
export function activeWorker(elapsed: number, period = 2): number {
  const cycle = Math.floor(elapsed / period);
  return ((cycle % WORKER_COUNT) + WORKER_COUNT) % WORKER_COUNT;
}

// Parametric position (0..1) of the task pulse along the current edge.
// Triangle wave: 0 at the start of the period, 1 at mid-period, back to 0 at the end.
export function pulsePhase(elapsed: number, period = 2): number {
  const t = (elapsed % period) / period; // 0..1 within the period
  return 1 - Math.abs(1 - 2 * t); // triangle: 0->1->0
}

export function pulseDirection(elapsed: number, period = 2): "out" | "back" {
  const t = (elapsed % period) / period;
  return t < 0.5 ? "out" : "back";
}
