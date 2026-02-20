/**
 * Ambient module declarations for optional dependencies.
 *
 * These packages are dynamically imported at runtime only when
 * the corresponding template format (.vue, .tsx, .svelte) is used.
 * Users must install them as devDependencies in their own project.
 */

declare module "@vizejs/vite-plugin" {
  const plugin: () => import("rolldown").Plugin | import("rolldown").Plugin[];
  export default plugin;
}
