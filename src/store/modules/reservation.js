export default {
  namespaced: true,
  cache: 'local',
  state: {
    employee: null,
    order: null,
    service: {}
  },
  getters: {
    employee (state) {
      return state.employee
    },
    order (state) {
      return state.order
    },
    service (state) {
      return state.service
    }
  },
  mutations: {
    setEmployee: (state, data) => {
      state.employee = data
    },
    setOrder: (state, data) => {
      state.order = data
    },
    setService: (state, data) => {
      state.service = data
    }
  }
}
