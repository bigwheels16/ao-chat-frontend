// Exports a file's text, as raw-loader does in the webpack build
module.exports = {
  process: src => ({ code: `module.exports = ${JSON.stringify(src)};` }),
}
