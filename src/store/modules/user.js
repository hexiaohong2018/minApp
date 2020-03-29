export default {
  namespaced: true,
  cache: 'local',
  state: {
    testData: '123'
  },
  mutations: {
    setTest: (state, data) => {
      state.testData = data
    }
  },
  actions: {
    test ({ commit }, data) {
      commit('setTest', data)
    }
  }
}
