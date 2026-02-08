/**
 * Island Architecture support for ox-content
 *
 * Provides parsing and transformation of <Island> components
 * for partial hydration in SSG pages.
 */

export {
  transformIslands,
  hasIslands,
  extractIslandInfo,
  generateHydrationScript,
  resetIslandCounter,
  type LoadStrategy,
  type IslandInfo,
  type ParseIslandsResult,
} from "./parse";
