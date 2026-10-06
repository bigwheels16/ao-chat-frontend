process.env.VUE_APP_BUILD_TIME = new Date().toISOString()

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  productionSourceMap: false
}
