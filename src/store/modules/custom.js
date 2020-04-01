export default {
  namespaced: true,
  cache: 'local',
  state: {
    color: '#ff4444'
  },
  getters:{
    navColor(state){
      return state.color;
    }
  },
  mutations: {
    _setNavColor: (state, data) => {
      state.color = data
    }
  },
  actions: {
    setNavColor ({ commit }, data) {
      commit('_setNavColor', data)
    }
  }
}
