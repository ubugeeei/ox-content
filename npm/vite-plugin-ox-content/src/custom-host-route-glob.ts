import * as fsSync from "node:fs";
import type { ViteDevServer } from "vite";
import { collectDevModuleDependencies } from "./custom-host-module-deps";
import type { OxContentCustomHostOptions } from "./custom-host-types";
import { normalizeHostModuleId } from "./custom-host-loader";

export function hasRouteHostImportMetaGlob(
  server: ViteDevServer,
  host: OxContentCustomHostOptions["host"],
  root: string,
): boolean {
  if (typeof host !== "string") {
    return false;
  }
  const hostModuleId = normalizeHostModuleId(host, root);
  return collectDevModuleDependencies(server.moduleGraph, hostModuleId, root).some(
    sourceUsesImportMetaGlob,
  );
}

function sourceUsesImportMetaGlob(file: string): boolean {
  try {
    return fsSync.readFileSync(file, "utf8").includes("import.meta.glob");
  } catch {
    return false;
  }
}
