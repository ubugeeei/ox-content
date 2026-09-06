import type { ViteDevServer } from "vite";
import { createAssetsContext, themeTokenMiddleware } from "./custom-host-assets";
import { createCustomHostCollectionAssetsDevController } from "./custom-host-collection-assets";
import {
  createBaseContext,
  createContextMemo,
  createRoutesContext,
  loadHost,
  loadRoutes,
  normalizeHostModuleId,
} from "./custom-host-loader";
import { createTrackedContext, devResponse } from "./custom-host-dev-response";
import type {
  DevCacheEntry,
  OxContentCustomHostDependency,
  OxContentCustomHostModule,
  OxContentCustomHostOptions,
  OxContentCustomHostRoute,
  ResolvedThemeTokens,
} from "./custom-host-types";
import {
  canonicalFilePath,
  clearKeyDeps,
  connectRequestToRequest,
  invalidateViteModules,
  patchServerClose,
  resolveOutDir,
  versionedModuleId,
  writeConnectResponse,
} from "./custom-host-utils";
import type { ResolvedOptions } from "./types";
import {
  anyCustomHostDependencyMatches,
  broadDependencies,
  dependencyWatchPaths,
  exactDependencyKeys,
  normalizeCustomHostDependencies,
  type NormalizedCustomHostDependency,
} from "./custom-host-watch";

export function configureDevServer(
  server: ViteDevServer,
  input: OxContentCustomHostOptions,
  options: ResolvedOptions,
  themeTokens: ResolvedThemeTokens | undefined,
): void {
  const root = server.config.root;
  const outDir = resolveOutDir(server.config, options, root);
  const assets = createAssetsContext(
    options,
    outDir,
    undefined,
    themeTokens,
    server.moduleGraph,
    root,
  );
  let ssrVersion = 0;
  const loadModule = (moduleId: string) =>
    server.ssrLoadModule(versionedModuleId(moduleId, ssrVersion));
  const baseContext = createBaseContext("serve", root, outDir, options, loadModule, assets);
  const cache = new Map<string, DevCacheEntry>();
  const keyDeps = new Map<string, Set<string>>();
  const depKeys = new Map<string, Set<string>>();
  const keyBroadDeps = new Map<string, NormalizedCustomHostDependency[]>();
  const globalDependencies = normalizeCustomHostDependencies(root, input.dev?.dependencies);
  const configuredRouteDependencies = normalizeCustomHostDependencies(
    root,
    input.dev?.routeDependencies,
  );
  let routeCatalogueDependencies = [...configuredRouteDependencies];
  let hostPromise: Promise<OxContentCustomHostModule> | undefined;
  let routesPromise: Promise<readonly OxContentCustomHostRoute[]> | undefined;
  let routesGeneration = 0;
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;
  const addedWatchPaths = new Set<string>();

  const addWatchPaths = (paths: readonly string[]) => {
    const nextPaths = paths.filter((watchPath) => !addedWatchPaths.has(watchPath));
    if (nextPaths.length === 0) {
      return;
    }
    server.watcher.add(nextPaths);
    for (const watchPath of nextPaths) {
      addedWatchPaths.add(watchPath);
    }
  };

  addWatchPaths(dependencyWatchPaths([...globalDependencies, ...configuredRouteDependencies]));

  const scheduleReload = () => {
    const delay = input.dev?.reloadDebounceMs ?? 80;
    if (reloadTimer) {
      clearTimeout(reloadTimer);
    }
    reloadTimer = setTimeout(() => {
      reloadTimer = undefined;
      server.ws.send({ type: "full-reload" });
    }, delay);
  };

  const clearKey = (key: string) => {
    cache.delete(key);
    clearKeyDeps(key, keyDeps, depKeys);
    keyBroadDeps.delete(key);
  };

  const clearResponses = () => {
    cache.clear();
    keyDeps.clear();
    depKeys.clear();
    keyBroadDeps.clear();
  };

  const rememberDeps = (key: string, dependencies: readonly OxContentCustomHostDependency[]) => {
    clearKeyDeps(key, keyDeps, depKeys);
    keyBroadDeps.delete(key);

    const normalized = normalizeCustomHostDependencies(root, dependencies);
    addWatchPaths(dependencyWatchPaths(normalized));
    const exact = new Set(exactDependencyKeys(normalized));
    keyDeps.set(key, exact);
    for (const dep of exact) {
      const keys = depKeys.get(dep) ?? new Set<string>();
      keys.add(key);
      depKeys.set(dep, keys);
    }
    const broad = broadDependencies(normalized);
    if (broad.length > 0) {
      keyBroadDeps.set(key, broad);
    }
  };

  const clearHost = () => {
    hostPromise = undefined;
    routesPromise = undefined;
    routesGeneration += 1;
    routeCatalogueDependencies = [...configuredRouteDependencies];
    clearResponses();
  };

  const clearRoutes = () => {
    routesPromise = undefined;
    routesGeneration += 1;
    routeCatalogueDependencies = [...configuredRouteDependencies];
    clearResponses();
  };

  const loadCachedHost = async () => {
    if (!hostPromise) {
      const current = loadHost(input.host, loadModule, root).catch((error) => {
        if (hostPromise === current) {
          hostPromise = undefined;
        }
        throw error;
      });
      hostPromise = current;
    }
    return hostPromise;
  };

  const loadCachedRoutes = async () => {
    if (!routesPromise) {
      const generation = routesGeneration;
      const memo = createContextMemo();
      const trackedDependencies = new Set<OxContentCustomHostDependency>();
      const context = createTrackedContext(
        createRoutesContext(baseContext, memo),
        server,
        trackedDependencies,
      );
      const current = loadCachedHost()
        .then((host) => loadRoutes(host, context))
        .then((routes) => {
          if (routesPromise === current && routesGeneration === generation) {
            const inferred = normalizeCustomHostDependencies(root, [...trackedDependencies]);
            routeCatalogueDependencies = [...configuredRouteDependencies, ...inferred];
            addWatchPaths(dependencyWatchPaths(routeCatalogueDependencies));
          }
          return routes;
        })
        .catch((error) => {
          if (routesPromise === current) {
            routesPromise = undefined;
          }
          throw error;
        });
      routesPromise = current;
    }
    return routesPromise;
  };

  const collectionAssets = createCustomHostCollectionAssetsDevController({
    server,
    options: input.collectionAssets,
    context: baseContext,
    beforeReplan(file) {
      ssrVersion += 1;
      invalidateViteModules(server, file, true);
    },
    onReplanned() {
      clearResponses();
      scheduleReload();
    },
  });

  const onChange = (_event: string, file: string) => {
    const changed = canonicalFilePath(file);
    if (typeof input.host === "string" && changed === normalizeHostModuleId(input.host, root)) {
      ssrVersion += 1;
      invalidateViteModules(server, changed, true);
      clearHost();
      scheduleReload();
      return;
    }

    collectionAssets?.invalidate(changed);

    if (anyCustomHostDependencyMatches(routeCatalogueDependencies, changed)) {
      ssrVersion += 1;
      invalidateViteModules(server, changed, true);
      clearRoutes();
      scheduleReload();
      return;
    }

    let invalidated = false;
    if (anyCustomHostDependencyMatches(globalDependencies, changed)) {
      clearResponses();
      invalidated = true;
    }
    for (const key of [...(depKeys.get(changed) ?? [])]) {
      clearKey(key);
      invalidated = true;
    }
    for (const [key, dependencies] of [...keyBroadDeps]) {
      if (
        dependencies.some((dependency) => anyCustomHostDependencyMatches([dependency], changed))
      ) {
        clearKey(key);
        invalidated = true;
      }
    }
    if (invalidated) {
      ssrVersion += 1;
      invalidateViteModules(server, changed, true);
      scheduleReload();
    }
  };
  const onAdd = (file: string) => onChange("add", file);
  const onFileChange = (file: string) => onChange("change", file);
  const onUnlink = (file: string) => onChange("unlink", file);

  server.watcher.on("all", onChange);
  server.watcher.on("add", onAdd);
  server.watcher.on("change", onFileChange);
  server.watcher.on("unlink", onUnlink);
  server.middlewares.use(themeTokenMiddleware(themeTokens));
  if (collectionAssets) {
    server.middlewares.use(collectionAssets.middleware);
  }
  server.middlewares.use(async (req, res, next) => {
    const request = connectRequestToRequest(req);
    if (!request || (request.method !== "GET" && request.method !== "HEAD")) {
      next();
      return;
    }

    try {
      const response = await devResponse({
        request,
        server,
        input,
        context: baseContext,
        loadHost: loadCachedHost,
        loadRoutes: loadCachedRoutes,
        cache,
        rememberDeps,
      });
      if (!response) {
        next();
        return;
      }
      await writeConnectResponse(response, res);
    } catch (error) {
      next(error);
    }
  });

  patchServerClose(server, () => {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
      reloadTimer = undefined;
    }
    server.watcher.off("all", onChange);
    server.watcher.off("add", onAdd);
    server.watcher.off("change", onFileChange);
    server.watcher.off("unlink", onUnlink);
    cache.clear();
    keyDeps.clear();
    depKeys.clear();
    keyBroadDeps.clear();
    collectionAssets?.close();
    if (addedWatchPaths.size > 0) {
      server.watcher.unwatch([...addedWatchPaths]);
      addedWatchPaths.clear();
    }
  });
}
