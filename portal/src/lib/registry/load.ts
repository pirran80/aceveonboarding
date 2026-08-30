import fs from "node:fs";
import path from "node:path";
import {
  flowSchema,
  moduleRegistrySchema,
  type FlowDefinition,
  type ModuleDefinition,
} from "./schema";

/**
 * Registry loader. Reads flow + module definitions for a product from
 * `registry/products/<flowId>/` and validates them against the schema.
 *
 * Definitions are read from disk on every load in development (change a JSON
 * file → the flow changes) and cached in production.
 */

export interface ProductRegistry {
  flow: FlowDefinition;
  /** All modules in the registry file, keyed by id. */
  modules: Map<string, ModuleDefinition>;
  /** The modules the flow actually renders, in flow order. */
  flowModules: ModuleDefinition[];
}

const registryRoot = () => path.join(process.cwd(), "registry", "products");

const cache = new Map<string, ProductRegistry>();

export function listProducts(): string[] {
  return fs
    .readdirSync(registryRoot(), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

export function loadRegistry(flowId: string): ProductRegistry {
  if (process.env.NODE_ENV === "production") {
    const hit = cache.get(flowId);
    if (hit) return hit;
  }

  const dir = path.join(registryRoot(), flowId);
  if (!fs.existsSync(dir)) {
    throw new Error(`Unknown registry flow "${flowId}" — no directory ${dir}`);
  }

  const flow = flowSchema.parse(
    JSON.parse(fs.readFileSync(path.join(dir, "flow.json"), "utf-8"))
  );
  const moduleFile = moduleRegistrySchema.parse(
    JSON.parse(fs.readFileSync(path.join(dir, "modules.json"), "utf-8"))
  );

  const modules = new Map(moduleFile.modules.map((m) => [m.id, m]));

  const missing = flow.categories.moduleIds.filter((id) => !modules.has(id));
  if (missing.length > 0) {
    throw new Error(
      `Flow "${flowId}" references modules missing from modules.json: ${missing.join(", ")}`
    );
  }
  const flowModules = flow.categories.moduleIds.map((id) => modules.get(id)!);

  const registry: ProductRegistry = { flow, modules, flowModules };
  cache.set(flowId, registry);
  return registry;
}
