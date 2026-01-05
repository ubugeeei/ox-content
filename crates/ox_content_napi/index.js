// Auto-generated loader for @ox-content/napi
// This file loads the native module based on the current platform

const { existsSync } = require('fs');
const { join } = require('path');

const platforms = {
  'darwin-arm64': 'ox-content.darwin-arm64.node',
  'darwin-x64': 'ox-content.darwin-x64.node',
  'linux-x64-gnu': 'ox-content.linux-x64-gnu.node',
  'linux-arm64-gnu': 'ox-content.linux-arm64-gnu.node',
  'win32-x64-msvc': 'ox-content.win32-x64-msvc.node',
};

function loadBinding() {
  // Try loading the local development binary first (index.node)
  const localBinary = join(__dirname, 'index.node');
  if (existsSync(localBinary)) {
    return require(localBinary);
  }

  // Try platform-specific binary
  const platform = process.platform;
  const arch = process.arch;

  let key;
  if (platform === 'darwin') {
    key = `darwin-${arch}`;
  } else if (platform === 'linux') {
    key = `linux-${arch}-gnu`;
  } else if (platform === 'win32') {
    key = `win32-${arch}-msvc`;
  }

  const binaryName = platforms[key];
  if (binaryName) {
    const binaryPath = join(__dirname, binaryName);
    if (existsSync(binaryPath)) {
      return require(binaryPath);
    }
  }

  throw new Error(
    `@ox-content/napi: No compatible binary found for ${platform}-${arch}. ` +
    `Please run 'pnpm build' in crates/ox_content_napi or install a prebuilt binary.`
  );
}

module.exports = loadBinding();
