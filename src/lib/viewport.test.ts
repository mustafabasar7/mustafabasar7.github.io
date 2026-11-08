import { describe, expect, it } from "vitest";
import { tierFor } from "./viewport";

describe("tierFor", () => {
  it("classifies widths at the breakpoint edges", () => {
    expect(tierFor(375)).toBe("phone");
    expect(tierFor(768)).toBe("phone");
    expect(tierFor(769)).toBe("tablet");
    expect(tierFor(1024)).toBe("tablet");
    expect(tierFor(1025)).toBe("desktop");
    expect(tierFor(1920)).toBe("desktop");
  });
});
