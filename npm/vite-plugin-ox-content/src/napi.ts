export async function importNapiModule(): Promise<typeof import("@ox-content/napi")> {
  const mod = (await import("@ox-content/napi")) as typeof import("@ox-content/napi") & {
    default?: Partial<typeof import("@ox-content/napi")>;
  };

  if (mod.default && typeof mod.default === "object") {
    return {
      ...mod.default,
      ...mod,
    };
  }

  return mod;
}
