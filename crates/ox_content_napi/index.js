const { existsSync } = require('fs');
const { join } = require('path');

function loadBinding() {
  // Try loading the local development binary first (index.node)
  const localBinary = join(__dirname, 'index.node');
  if (existsSync(localBinary)) {
    return require(localBinary);
  }

  // Try platform-specific binary
  const platform = process.platform;
  const arch = process.arch;

  const platforms = {
    'darwin-arm64': 'ox-content.darwin-arm64.node',
    'darwin-x64': 'ox-content.darwin-x64.node',
    'linux-x64-gnu': 'ox-content.linux-x64-gnu.node',
    'linux-arm64-gnu': 'ox-content.linux-arm64-gnu.node',
    'win32-x64-msvc': 'ox-content.win32-x64-msvc.node',
  };

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
    `Please run 'pnpm build' in crates/ox_content_napi.`
  );
}

const binding = loadBinding();

// Export individual functions for ESM compatibility
module.exports = binding;
module.exports.parse = binding.parse;
module.exports.parseAndRender = binding.parseAndRender;
module.exports.parseAndRenderAsync = binding.parseAndRenderAsync;
module.exports.render = binding.render;
module.exports.transform = binding.transform;
module.exports.transformAsync = binding.transformAsync;
module.exports.version = binding.version;
module.exports.generateOgImageSvg = binding.generateOgImageSvg;
module.exports.buildSearchIndex = binding.buildSearchIndex;
module.exports.searchIndex = binding.searchIndex;
module.exports.extractSearchContent = binding.extractSearchContent;
module.exports.generateSsgHtml = binding.generateSsgHtml;
