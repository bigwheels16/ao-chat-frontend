const { defineConfig } = require('@vue/cli-service')
const { ProvidePlugin } = require('webpack')

process.env.VUE_APP_BUILD_TIME = new Date().toISOString()

// Production builds must be given the backend URL
if (process.env.NODE_ENV === 'production' && !process.env.VUE_APP_WEBSOCKET_URL) {
  throw new Error('VUE_APP_WEBSOCKET_URL must be set, e.g. wss://aochat-api.jkbff.com/connect')
}

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  productionSourceMap: false,
  configureWebpack: {
    // Node's Buffer and process globals, used by the chat code and the util package
    plugins: [
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ]
  }
})
