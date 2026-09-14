import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  
}

const store = new Vuex.Store({
  state,
  getters: {
    user(state) {
      return state.user
    }
  },
  actions: {
    setUser(context, user) {
      context.commit("user", user)  // references "user" mutation
    }
  },
  mutations: {
    user(state, user) {
      state.user = user
    }
  }
})

export default store

// https://www.youtube.com/watch?v=obZZPnmTljA&ab_channel=ScalableScripts
// this.$store.dispatch("setUser", user)  // triggers "setUser" action with user obj

// import { mapGetters } from 'vuex'
// computed: {
//  ...mapGetters(['user'])
//}