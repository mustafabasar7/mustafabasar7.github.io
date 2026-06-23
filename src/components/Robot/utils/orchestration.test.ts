import { describe, it, expect } from "vitest";
import {
  WORKER_COUNT,
  activeWorker,
  pulsePhase,
  pulseDirection,
} from "./orchestration";

describe("orchestration", () => {
  it("has three workers", () => {
    expect(WORKER_COUNT).toBe(3);
  });

  it("cycles the active worker every period and wraps", () => {
    expect(activeWorker(0)).toBe(0);
    expect(activeWorker(2.5)).toBe(1);
    expect(activeWorker(4.1)).toBe(2);
    expect(activeWorker(6.0)).toBe(0); // wrapped back to first
  });

  it("pulse phase goes 0->1 within a worker period", () => {
    expect(pulsePhase(0)).toBeCloseTo(0, 5);
    expect(pulsePhase(1)).toBeCloseTo(1, 1); // mid-period = far end
    expect(pulsePhase(1.999)).toBeLessThan(0.05); // near end of period = back near start
  });

  it("pulse travels out then back within a period", () => {
    expect(pulseDirection(0.5)).toBe("out");
    expect(pulseDirection(1.5)).toBe("back");
  });
});
