export default {
  namespaced: true,
  cache: 'local',
  state: {
    num:0
  },
  getters:{
	  num(state){
		  return state.num;
	  }
  },
  mutations: {
    setNumSync(state,num){
		state.num = num;
	},
	addNumSync(state){
		state.num++;
	},
	subNumSync(state){
		state.num--;
	}
  },
  actions: {
	 setNum({commit},num){
		 commit('setNumSync',num);
	 },
	 addNum({commit}){
		 commit('addNumSync');
	 },
	 subNum({commit}){
		 commit('subNumSync');
	 }
  }
}
