import type { OxContentCustomHostMemo, OxContentCustomHostRoute } from "./custom-host-types";

export type DevRoutesState = {
  routes: readonly OxContentCustomHostRoute[];
  memo: OxContentCustomHostMemo;
};
