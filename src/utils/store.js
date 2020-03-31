import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
let store = new Vuex.Store({
    // 1. state
    state:{
		navBarColor: '#ff4444',
		sales_user_id: null, //分店信息
    },

    // 2. getters
    getters:{
		navColor(state){
			return state.navBarColor;
		},
		salesUserId(state){
			return state.sales_user_id;
		}
    },
    // 通常跟api接口打交道
    actions:{
		setSalesUserId({commit,state},id){
			commit("_setSalesUserId",id)
		},
		setNavColor({commit,state},navBarColor){
			commit("_setNavColor",navBarColor)
		}
    },
    // 4. mutations
    mutations:{
		_setSalesUserId(state,id){
			state.sales_user_id = id;
		},
		_setNavColor(state,navBarColor){
			state.navBarColor = navBarColor;
		}
    }
});

export default store;