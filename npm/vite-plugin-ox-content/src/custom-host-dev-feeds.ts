import * as path from "node:path";
import type { ViteDevServer } from "vite";
import { createTrackedContext } from "./custom-host-dev-response";
import { createOutputsContext, loadOutputs } from "./custom-host-loader";
import type {
  DevCacheEntry,
  OxContentCustomHostBaseContext,
  OxContentCustomHostDependency,
  OxContentCustomHostMemo,
  OxContentCustomHostModule,
  OxContentCustomHostOptions,
  OxContentCustomHostRoute,
} from "./custom-host-types";
import {
  deserializeResponse,
  normalizeRoutePath,
  serializeResponse,
  stripBasePathname,
} from "./custom-host-utils";
import { feedOutputFileName, feedOutputPath, feedOutputWarning } from "./feeds-output";
import { renderFeedFiles } from "./feeds";
import { planSsgOutputs } from "./ssg-output";
import type { OxContentOptions, ResolvedFeedChannel, ResolvedOptions } from "./types";

type DevRoutesState = {
  routes: readonly OxContentCustomHostRoute[];
  memo: OxContentCustomHostMemo;
};

type FeedMatch = {
  path: string;
  warning?: string;
};

export const CUSTOM_HOST_DEV_FEED_CACHE_PREFIX = "feed\0";

export function createCustomHostDevFeedResponder(input: {
  server: ViteDevServer;
  hostOptions: OxContentCustomHostOptions;
  rawOptions: OxContentOptions;
  context: OxContentCustomHostBaseContext;
  loadHost(): Promise<OxContentCustomHostModule>;
  loadRoutesState(): Promise<DevRoutesState>;
  cache: Map<string, DevCacheEntry>;
  rememberDeps(key: string, dependencies: readonly OxContentCustomHostDependency[]): void;
}): (request: Request) => Promise<Response | undefined> {
  return async (request) => {
    if (input.hostOptions.dev?.feedOutputs !== true) {
      return undefined;
    }
    const match = matchFeedRequest(request, input.context.options);
    if (!match) {
      return undefined;
    }
    if (match.warning) {
      input.server.config.logger.warn(match.warning);
      return undefined;
    }

    const routesState = await input.loadRoutesState();
    if (hasExplicitRoute(routesState.routes, match.path)) {
      return undefined;
    }

    const key = `${CUSTOM_HOST_DEV_FEED_CACHE_PREFIX}${match.path}`;
    let entry = input.cache.get(key);
    if (!entry) {
      const current: DevCacheEntry = {
        promise: renderDevFeedResponse(input, routesState, match.path)
          .then((serialized) => {
            if (serialized && input.cache.get(key) === current) {
              input.rememberDeps(key, serialized.dependencies);
            }
            return serialized;
          })
          .catch((error) => {
            if (input.cache.get(key) === current) {
              input.cache.delete(key);
            }
            throw error;
          }),
      };
      entry = current;
      input.cache.set(key, entry);
    }

    const serialized = await entry.promise;
    if (!serialized) {
      return undefined;
    }
    return deserializeResponse(serialized, request.method === "HEAD");
  };
}

async function renderDevFeedResponse(
  input: {
    server: ViteDevServer;
    hostOptions: OxContentCustomHostOptions;
    rawOptions: OxContentOptions;
    context: OxContentCustomHostBaseContext;
    loadHost(): Promise<OxContentCustomHostModule>;
  },
  routesState: DevRoutesState,
  requestedPath: string,
) {
  const host = await input.loadHost();
  const trackedDependencies = new Set<OxContentCustomHostDependency>();
  const outputContext = createTrackedContext(
    createOutputsContext(input.context, routesState.routes, routesState.memo),
    input.server,
    trackedDependencies,
  );
  const outputData = await loadOutputs(host, outputContext);
  const plan = planSsgOutputs({
    pages: [],
    root: input.context.root,
    outDir: input.context.outDir,
    srcDir: path.resolve(input.context.root, input.context.options.srcDir),
    options: input.rawOptions,
    siteDescription: outputData?.siteDescription,
    collections: outputData?.collections,
    collectionNames: outputData?.collectionNames,
    items: outputData?.items,
  });
  const rendered = await renderFeedFiles(plan.feeds);
  if (rendered.warning) {
    input.server.config.logger.warn(rendered.warning);
    return undefined;
  }
  const file = rendered.files.find((candidate) => candidate.path === requestedPath);
  if (!file) {
    return undefined;
  }
  return serializeResponse(
    new Response(file.content, {
      headers: { "content-type": file.contentType },
      status: 200,
    }),
    [...trackedDependencies, ...(input.hostOptions.dev?.dependencies ?? [])],
  );
}

function matchFeedRequest(request: Request, options: ResolvedOptions): FeedMatch | undefined {
  if (!options.feeds?.enabled) {
    return undefined;
  }
  const url = new URL(request.url);
  const pathname = stripBasePathname(url.pathname, options.base);
  if (!pathname) {
    return undefined;
  }
  const requestedPath = pathname.replace(/^\/+/u, "");
  if (!requestedPath) {
    return undefined;
  }

  const channels = feedChannels(options.feeds);
  const candidates = new Set<string>();
  for (const channel of channels) {
    for (const format of channel.formats) {
      const outputPath = feedOutputPath(channel.path, feedOutputFileName(format));
      if (outputPath) {
        candidates.add(outputPath);
      }
    }
  }
  if (!candidates.has(requestedPath)) {
    return undefined;
  }
  return { path: requestedPath, warning: feedOutputWarning(undefined, channels) };
}

function hasExplicitRoute(
  routes: readonly OxContentCustomHostRoute[],
  requestedPath: string,
): boolean {
  const routePath = normalizeRoutePath(`/${requestedPath}`);
  return routes.some((route) => normalizeRoutePath(route.path) === routePath);
}

function feedChannels(options: ResolvedOptions["feeds"]): ResolvedFeedChannel[] {
  if (!options?.enabled) {
    return [];
  }
  return options.feeds?.length ? options.feeds : [options];
}
