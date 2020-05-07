export default {
    namespaced: true,
    cache: 'local',
    state: {
      testData: '123'
    },
    getters:{
      testData(state){
        return state.testData
      }
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
  