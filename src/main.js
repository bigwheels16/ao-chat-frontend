import { createApp } from 'vue'
// Vuetify first, so its stylesheet sets the order of the CSS layers before any component's CSS
import vuetify from './plugins/vuetify'
import App from './App.vue'

createApp(App).use(vuetify).mount('#app')
