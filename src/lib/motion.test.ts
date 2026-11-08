import { expect, it } from "vitest";
import { shouldReveal, REVEAL_MIN_WIDTH } from "./motion";

it("reveals only on wide viewports without reduced motion", () => {
  expect(shouldReveal(REVEAL_MIN_WIDTH, false)).toBe(true);
  expect(shouldReveal(REVEAL_MIN_WIDTH - 1, false)).toBe(false);
  expect(shouldReveal(1920, true)).toBe(false);
});
