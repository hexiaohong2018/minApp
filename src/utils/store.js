import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
let store = new Vuex.Store({
    // 1. state
    state:{
		globalData:{
			navBarHeight:0,
			tabBarHeight:0,
			navBarColor: '#ff4444',
			sales_user_id: null, //分店信息
		},
    },

    // 2. getters
    getters:{
		navColor(state){
			return state.globalData.navBarColor;
		},
		navHeight(state){
			return state.globalData.navBarHeight;
		},
		salesUserId(state){
			return state.globalData.sales_user_id;
		},
		tabBarHeight(state){
			return state.globalData.tabBarHeight;
		}
    },
    // 通常跟api接口打交道
    actions:{
		setSalesUserId({commit,state},id){
			commit("_setSalesUserId",id)
		},
		setNavColor({commit,state},navBarColor){
			commit("_setNavColor",navBarColor)
		},
		setNavHeight({commit,state},navBarHeight){
			commit('_setNavHeight',navBarHeight)
		},
		setTabBarHeight({commit,state},tabBarHeight){
			commit('_setTabBarHeight',tabBarHeight)
		}
    },
    // 4. mutations
    mutations:{
		_setSalesUserId(state,id){
			state.globalData.sales_user_id = id;
		},
		_setNavColor(state,navBarColor){
			state.globalData.navBarColor = navBarColor;
		},
		_setNavHeight(state,navBarHeight){
			state.globalData.navBarHeight = navBarHeight;
		},
		_setTabBarHeight(state,tabBarHeight){
			state.globalData.tabBarHeight = tabBarHeight;
		}
    }
});

export default store;