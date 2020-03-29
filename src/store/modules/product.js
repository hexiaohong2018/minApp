
export default {
  namespaced: true,
  state: {
    product: null
  },

  getters: {
    product (state) {
      return state.product
    }
  },

  mutations: {
    setProduct: (state, data) => {
      state.product = data
    }
  }
}
