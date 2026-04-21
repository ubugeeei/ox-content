import { defineConfig } from "vite-plus";

const task = (
  command: string,
  options: {
    cwd?: string;
    dependsOn?: string[];
    cache?: false;
  } = {},
) => ({
  command,
  ...options,
});

const noopTask = (
  dependsOn?: string[],
  options: {
    cache?: false;
  } = {},
) => task('node -e ""', { dependsOn, ...options });

const uncachedTask = (
  command: string,
  options: {
    cwd?: string;
    dependsOn?: string[];
  } = {},
) => task(command, { ...options, cache: false });

export default defineConfig({
  fmt: {
    ignorePatterns: ["crates/ox_content_ssg/templates/*.html"],
  },
  lint: {
    options: {
      typeAware: true,
    },
  },
  test: {
    passWithNoTests: true,
    exclude: ["**/test/vrt/**"],
  },
  run: {
    cache: {
      scripts: true,
      tasks: true,
    },
    tasks: {
      build: noopTask(["build:rust", "build:npm"]),
      "build:rust": task("cargo build --workspace"),
      "build:rust-release": task("cargo build --workspace --release"),
      "build:napi": task("vp run --filter ./crates/ox_content_napi build"),
      "build:npm": task("vp run --filter './npm/*' build", {
        dependsOn: ["build:napi"],
      }),
      "build:wasm": task("wasm-pack build --target web --out-dir pkg", {
        cwd: "crates/ox_content_wasm",
      }),

      test: noopTask(["test:rust", "test:ts"]),
      "test:rust": task("cargo test --workspace"),
      "test:rust-verbose": uncachedTask("cargo test --workspace -- --nocapture"),
      "test:ts": noopTask(["test:ts-unit", "test:vrt"]),
      "test:ts-unit": task("pnpm --dir npm/vite-plugin-ox-content exec vp test src", {
        dependsOn: ["build:napi"],
      }),
      "test:vrt": uncachedTask("pnpm --dir npm/vite-plugin-ox-content exec playwright test", {
        dependsOn: ["build:napi"],
      }),
      "test:vrt:update": uncachedTask(
        "pnpm --dir npm/vite-plugin-ox-content exec playwright test --update-snapshots",
        {
          dependsOn: ["build:napi"],
        },
      ),

      check: noopTask(["check:rust", "check:ts"]),
      "check:rust": task("cargo check --workspace"),

      clippy: task("cargo clippy --workspace --all-targets -- -D warnings"),

      fmt: noopTask(["fmt:rust", "fmt:ts"]),
      "fmt:rust": task("cargo fmt --all"),
      "fmt:check": noopTask(["fmt:rust-check", "check:ts"]),
      "fmt:rust-check": task("cargo fmt --all -- --check"),
      "fmt:ts": task('vp fmt "npm/*/src" scripts'),
      "fmt:ts-check": noopTask(["check:ts"]),

      lint: noopTask(["lint:rust", "check:ts"]),
      "lint:rust": task("cargo clippy --workspace --all-targets -- -D warnings"),
      "lint:ts": noopTask(["check:ts"]),
      "check:ts": task(
        'vp check vite.config.ts scripts && vp exec --filter "./npm/*" -- vp check src vite.config.ts',
      ),

      bench: noopTask(["bench:rust", "bench:parse", "bench:bundle"], { cache: false }),
      "bench:rust": uncachedTask("cargo bench --workspace"),
      "bench:parse": uncachedTask("vp run --filter ./benchmarks/bundle-size benchmark:parse"),
      "bench:bundle": uncachedTask("vp run --filter ./benchmarks/bundle-size benchmark"),

      "doc:cargo": task("cargo doc --workspace --no-deps"),
      "doc:cargo-open": uncachedTask("cargo doc --workspace --no-deps --open"),
      clean: uncachedTask("cargo clean"),
      "napi-prepublish": uncachedTask("napi prepublish", {
        cwd: "crates/ox_content_napi",
      }),

      ci: noopTask(["fmt:rust-check", "lint:rust", "check:ts", "test"]),
      ready: noopTask(["fmt", "lint", "test"]),
      coverage: uncachedTask("cargo llvm-cov --workspace --html"),
      setup: uncachedTask(
        "rustup component add clippy rustfmt && cargo install cargo-watch cargo-llvm-cov",
      ),
      watch: uncachedTask("cargo watch -x test"),
      "watch-check": uncachedTask("cargo watch -x check"),

      playground: uncachedTask("vp run --filter ./examples/playground dev"),
      "integ-vue": uncachedTask("vp run --filter ./examples/integ-vue dev"),
      "integ-react": uncachedTask("vp run --filter ./examples/integ-react dev"),
      "integ-svelte": uncachedTask("vp run --filter ./examples/integ-svelte dev"),
      "ssg-vite": uncachedTask("vp run --filter ./examples/ssg-vite dev"),
      "plugin-markdown-it": uncachedTask("vp run --filter ./examples/plugin-markdown-it start"),
      "plugin-rehype": uncachedTask("vp run --filter ./examples/plugin-rehype start"),
      "gen-source-docs": uncachedTask("vp run --filter ./examples/gen-source-docs dev"),

      "dev:docs": uncachedTask("vp run --filter ./docs dev", {
        dependsOn: ["build:npm"],
      }),
      "dev:playground": uncachedTask("vp run --filter ./examples/playground dev"),
      dev: uncachedTask(
        [
          "trap 'kill 0' EXIT INT TERM",
          "vp run --filter ./docs dev &",
          "vp run --filter ./examples/playground dev &",
          "wait",
        ].join("\n"),
        {
          dependsOn: ["build:npm"],
        },
      ),
      "dev-build": task("vp run --filter ./docs build", {
        dependsOn: ["build:npm"],
      }),
      "dev-preview": uncachedTask("vp run --filter ./docs preview"),

      install: uncachedTask("vp install"),
      release: uncachedTask("node --experimental-strip-types scripts/release.ts"),
      "examples-install": noopTask(["install"], { cache: false }),
    },
  },
});
