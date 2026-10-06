process.env.VUE_APP_BUILD_TIME = new Date().toISOString()

// Production builds must be given the backend URL
if (process.env.NODE_ENV === 'production' && !process.env.VUE_APP_WEBSOCKET_URL) {
  throw new Error('VUE_APP_WEBSOCKET_URL must be set, e.g. wss://aochat-api.jkbff.com/connect')
}

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  productionSourceMap: false
}
