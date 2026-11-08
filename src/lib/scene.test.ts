import { describe, expect, it } from "vitest";
import { capDpr, normalizePointer, shouldRun, PHONE_MAX_DPR } from "./scene";

describe("capDpr", () => {
  it("caps desktop at the caller max", () => {
    expect(capDpr(3, 1.5, false)).toBe(1.5);
    expect(capDpr(3, 2, false)).toBe(2);
    expect(capDpr(1, 2, false)).toBe(1);
  });
  it("lowers the cap on phones", () => {
    expect(capDpr(3, 2, true)).toBe(PHONE_MAX_DPR);
    expect(capDpr(1, 2, true)).toBe(1);
  });
  it("falls back to 1 for a bad device ratio", () => {
    expect(capDpr(0, 2, false)).toBe(1);
  });
});

describe("normalizePointer", () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  it("maps centre to 0 and corners to +-1", () => {
    expect(normalizePointer(200, 100, rect)).toEqual({ x: 0, y: 0 });
    expect(normalizePointer(100, 50, rect)).toEqual({ x: -1, y: -1 });
    expect(normalizePointer(300, 150, rect)).toEqual({ x: 1, y: 1 });
  });
  it("clamps outside the container", () => {
    expect(normalizePointer(1000, -500, rect)).toEqual({ x: 1, y: -1 });
  });
  it("handles zero-size rects", () => {
    expect(normalizePointer(5, 5, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe("shouldRun", () => {
  it("runs only when in view and visible", () => {
    expect(shouldRun(true, "visible")).toBe(true);
    expect(shouldRun(false, "visible")).toBe(false);
    expect(shouldRun(true, "hidden")).toBe(false);
  });
});
