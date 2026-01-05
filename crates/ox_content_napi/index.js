/* eslint-disable */
const { existsSync, readFileSync } = require('fs')
const { join } = require('path')

const { platform, arch } = process

let nativeBinding = null
let localFileExisted = false
let loadError = null

function isMusl() {
  // For Node 10
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      const lddPath = require('child_process').execSync('which ldd').toString().trim()
      return readFileSync(lddPath, 'utf8').includes('musl')
    } catch {
      return true
    }
  } else {
    const { glibcVersionRuntime } = process.report.getReport().header
    return !glibcVersionRuntime
  }
}

switch (platform) {
  case 'darwin':
    localFileExisted = existsSync(join(__dirname, 'index.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./index.node')
      } else {
        nativeBinding = require(`@ox-content/napi-${platform}-${arch}`)
      }
    } catch (e) {
      loadError = e
    }
    break
  case 'linux':
    localFileExisted = existsSync(join(__dirname, 'index.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./index.node')
      } else if (isMusl()) {
        nativeBinding = require(`@ox-content/napi-${platform}-${arch}-musl`)
      } else {
        nativeBinding = require(`@ox-content/napi-${platform}-${arch}-gnu`)
      }
    } catch (e) {
      loadError = e
    }
    break
  case 'win32':
    localFileExisted = existsSync(join(__dirname, 'index.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./index.node')
      } else {
        nativeBinding = require(`@ox-content/napi-win32-${arch}-msvc`)
      }
    } catch (e) {
      loadError = e
    }
    break
  default:
    throw new Error(`Unsupported platform: ${platform}`)
}

if (!nativeBinding) {
  if (loadError) {
    throw loadError
  }
  throw new Error('Failed to load native binding')
}

const { parse, parseAndRender, render, version, transform } = nativeBinding

module.exports.parse = parse
module.exports.parseAndRender = parseAndRender
module.exports.render = render
module.exports.version = version
module.exports.transform = transform
