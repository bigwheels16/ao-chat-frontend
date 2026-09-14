import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
//import store from './vuex'
import VueSanitize from "vue-sanitize"


// https://www.npmjs.com/package/vue-sanitize
Vue.use(VueSanitize)

Vue.config.productionTip = false

new Vue({
  vuetify,
  //store,
  render: h => h(App)
}).$mount('#app')
