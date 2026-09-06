import * as path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { collectDevModuleDependencies } from "./custom-host-module-deps";
import type { CustomHostDevModuleGraph, CustomHostDevModuleNode } from "./custom-host-stylesheets";

describe("custom host module dependency inference", () => {
  it("skips virtual module ids as watch dependencies while traversing their imports", () => {
    const root = path.resolve("fixtures/custom-host");
    const realTransitive = node({ file: path.join(root, "src", "collections.ts") });
    const virtualCollection = node({
      id: "\0virtual:ox-content/collections",
      url: "/@id/__x00__virtual:ox-content/collections",
      imports: [realTransitive],
    });
    const host = node({
      id: "/src/host.ts",
      imports: [virtualCollection],
    });
    const moduleGraph = graph([host, virtualCollection, realTransitive]);

    const dependencies = collectDevModuleDependencies(moduleGraph, "/src/host.ts", root);

    expect(dependencies).toContain(normalize(path.join(root, "src", "host.ts")));
    expect(dependencies).toContain(normalize(path.join(root, "src", "collections.ts")));
    expect(dependencies).not.toContain(
      normalize(path.join(root, "\0virtual:ox-content/collections")),
    );
    expect(dependencies.every((dependency) => !dependency.includes("\0"))).toBe(true);
    expect(dependencies.every((dependency) => !dependency.includes("__x00__"))).toBe(true);
  });
});

function node(input: {
  id?: string;
  url?: string;
  file?: string;
  imports?: CustomHostDevModuleNode[];
}): CustomHostDevModuleNode {
  return {
    id: input.id,
    url: input.url,
    file: input.file,
    importedModules: input.imports,
  };
}

function graph(nodes: CustomHostDevModuleNode[]): CustomHostDevModuleGraph {
  const modulesByFile = new Map<string, Set<CustomHostDevModuleNode>>();
  for (const moduleNode of nodes) {
    if (!moduleNode.file) {
      continue;
    }
    modulesByFile.set(normalize(moduleNode.file), new Set([moduleNode]));
  }
  return {
    idToModuleMap: new Map(
      nodes.flatMap((moduleNode) => (moduleNode.id ? [[moduleNode.id, moduleNode]] : [])),
    ),
    getModuleById(id) {
      return nodes.find((moduleNode) => moduleNode.id === id);
    },
    getModulesByFile(file) {
      return modulesByFile.get(normalize(file));
    },
  };
}

function normalize(file: string): string {
  return path.resolve(file).replace(/\\/g, "/");
}
