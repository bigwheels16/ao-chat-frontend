// Exports a file's text, as raw-loader does in the webpack build
module.exports = {
  process: src => `module.exports = ${JSON.stringify(src)};`,
}
