import type { CollectionAssetManifest, WriteCollectionAssetsResult } from "./collection-assets";
import { writeCollectionAssets } from "./collection-assets";
import { resolveCollectionAssetManifest } from "./custom-host-collection-assets";
import type {
  OxContentCustomHostBaseContext,
  OxContentCustomHostCollectionAssetsOptions,
} from "./custom-host-types";

export interface CustomHostCollectionAssetsBuildController {
  manifest(): Promise<CollectionAssetManifest | undefined>;
  write(): Promise<WriteCollectionAssetsResult>;
}

export function createCustomHostCollectionAssetsBuildController(input: {
  options: false | OxContentCustomHostCollectionAssetsOptions | undefined;
  context: OxContentCustomHostBaseContext;
}): CustomHostCollectionAssetsBuildController {
  if (!input.options) {
    return {
      manifest: async () => undefined,
      write: async () => ({ files: [] }),
    };
  }

  const options = input.options;
  let manifestPromise: Promise<CollectionAssetManifest> | undefined;
  const loadManifest = () => {
    if (!manifestPromise) {
      const current = resolveCollectionAssetManifest(options, input.context).catch((error) => {
        if (manifestPromise === current) {
          manifestPromise = undefined;
        }
        throw error;
      });
      manifestPromise = current;
    }
    return manifestPromise;
  };

  return {
    manifest: loadManifest,
    async write() {
      if (options.write === false) {
        return { files: [] };
      }
      const manifest = await loadManifest();
      return writeCollectionAssets({ manifest, outDir: input.context.outDir });
    },
  };
}
