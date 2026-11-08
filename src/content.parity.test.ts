import { describe, expect, it } from "vitest";
import { config } from "./config";
import { configTR } from "./config.tr";
import { AGENTS, PROJECTS } from "./lib/agents";
import { AGENTS_TR, PROJECTS_TR } from "./lib/agents.tr";
import { UI } from "./i18n/strings";

// Recursively list every key path; arrays contribute their length so that
// length drift is caught too.
function shape(v: unknown, path = ""): string[] {
  if (Array.isArray(v)) {
    return [`${path}[len=${v.length}]`, ...v.flatMap((x, i) => shape(x, `${path}[${i}]`))];
  }
  if (v && typeof v === "object") {
    return Object.entries(v as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([k, x]) => shape(x, path ? `${path}.${k}` : k));
  }
  return [path];
}

const keysOf = (o: object) => Object.keys(o).sort();

describe("content parity EN <-> TR", () => {
  it("config", () => {
    expect(shape(configTR)).toEqual(shape(config));
  });

  it("UI strings: same keys, no empty values", () => {
    expect(keysOf(UI.tr)).toEqual(keysOf(UI.en));
    for (const lang of ["en", "tr"] as const) {
      for (const [k, v] of Object.entries(UI[lang])) expect(v, `${lang}:${k}`).not.toBe("");
    }
  });

  it("agents overlay", () => {
    expect(AGENTS_TR).toHaveLength(AGENTS.length);
    AGENTS.forEach((a, i) => {
      const tr = AGENTS_TR[i];
      expect(keysOf(tr), a.short).toEqual(keysOf(tr).filter((k) => k in a));
      for (const k of Object.keys(tr) as (keyof typeof tr)[]) {
        expect(shape(tr[k]), `${a.short}.${k}`).toEqual(shape(a[k]));
      }
    });
  });

  it("project overlay", () => {
    expect(keysOf(PROJECTS_TR)).toEqual(PROJECTS.map((p) => p.slug).sort());
    for (const p of PROJECTS) {
      const tr = PROJECTS_TR[p.slug];
      for (const k of Object.keys(tr) as (keyof typeof tr)[]) {
        expect(shape(tr[k]), `${p.slug}.${k}`).toEqual(shape(p[k]));
      }
    }
  });
});
