export default {
  namespaced: true,
  state: {
    orderTabsIndex: 0
  },
  getters: {
    orderTabsIndex (state) {
      return state.orderTabsIndex
    }
  },
  mutations: {
    setOrderTabsIndex: (state, data) => {
      state.orderTabsIndex = data
    }
  }
}
