export default {
  namespaced: true,
  cache: 'local',

  state: {
    systemInfo: {}
  },

  getters: {
    systemInfo (state) {
      return state.systemInfo
    }
  },

  mutations: {
    setSystemInfo (state, data) {
      state.systemInfo = data
    }
  },

  actions: {
    systemInfo ({ commit }) {
      try {
        const res = uni.getSystemInfoSync()
        commit('setSystemInfo', res)
      } catch (error) {
        console.log(error)
      }
    }
  }
}
