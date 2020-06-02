import {phoneInfo} from '../../utils/util.js'
export default {
    namespaced: true,
    cache: 'local',
    state: {},
    getters:{
      systemInfo(state){
        return state
      }
    },
    mutations: {
      setSystemInfo: (state, data) => {
		  Object.assign(state,data)
      }
    },
    actions: {
      systemInfo ({ commit }) {
		  phoneInfo().then(res=>{
			  commit('setSystemInfo',res )
		  }).catch(msg=>{
			  console.log(msg)
		  })
      }
    }
  }
  