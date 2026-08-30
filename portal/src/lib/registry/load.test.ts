import { describe, expect, it } from "vitest";
import { listProducts, loadRegistry } from "./load";

/**
 * The registry on disk is configuration — these tests are the guarantee that
 * what ships in registry/ always satisfies the schema contract, so a bad JSON
 * edit fails CI instead of failing a customer.
 */
describe("registry loading", () => {
  it("lists the next-project flow", () => {
    expect(listProducts()).toContain("next-project");
  });

  it("loads and validates the next-project registry", () => {
    const registry = loadRegistry("next-project");
    expect(registry.flow.id).toBe("next-project");
    expect(registry.modules.size).toBeGreaterThan(0);
    expect(registry.flowModules.length).toBe(registry.flow.categories.moduleIds.length);
  });

  it("every field in every module carries a destination (hard rule 2)", () => {
    const registry = loadRegistry("next-project");
    for (const mod of registry.modules.values()) {
      for (const field of mod.fields) {
        expect(field.destination.kind, `${mod.id}.${field.id}`).toBeTruthy();
        expect(field.destination.ref, `${mod.id}.${field.id}`).toBeTruthy();
      }
    }
  });

  it("honours the documented ordering constraints", () => {
    const registry = loadRegistry("next-project");
    const ids = registry.flow.categories.moduleIds;
    // Chart of accounts first — the only point every source agrees on.
    expect(ids[0]).toBe("kontoplan");
    // Timpriser before Användarregister ("Yrkesroll (från timpriser)").
    expect(ids.indexOf("timpriser")).toBeLessThan(ids.indexOf("anvandarregister"));
  });

  it("rejects an unknown flow", () => {
    expect(() => loadRegistry("does-not-exist")).toThrow(/Unknown registry flow/);
  });
});
