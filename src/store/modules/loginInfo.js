export default {
	namespaced: true,
	cache: 'local',
	state: {
		memberInfo: null,
		shopInfo: null,
		distributorInfo: null,
		expiredTime: null,
		memberCardInfo:null,
	},
	getters: {
		memberInfo(state) {
			return state.memberInfo;
		},
		shopInfo(state) {
			return state.shopInfo;
		},
		distributorInfo(state) {
			return state.distributorInfo;
		},
		expiredTime(state) {
			return state.expiredTime;
		},
		memberCardInfo(state){
			return state.memberCardInfo;
		}
	},
	mutations: {
		_setMemberInfo(state, data) {
			state.memberInfo = data;
		},
		_setShopInfo(state, data) {
			state.shopInfo = date;
		},
		_setDistributorInfo(state, data) {
			state.distributorInfo = date;
		},
		_setLogin(state, data) {
			Object.assign(state, data);
		},
		_setExpiredTime(state, data) {
			state.expiredTime = data;
		},
		_setMemberCardInfo(state,data){
			state.memberCardInfo = data;
		}
	},
	actions: {
		setMemberInfo({
			commit
		}, data) {
			commit('_setMemberInfo', data);
		},
		setShopInfo({
			commit
		}, data) {
			commit('_setShopInfo', data);
		},
		setDistributorInfo({
			commit
		}, data) {
			commit('_setDistributorInfo', data);
		},
		setLogin({
			commit
		}, data) {
			commit('_setLogin', data);
		},
		setExpiredTime({
			commit
		}, data) {
			commit('_setExpiredTime', data);
		},
		setMemberCardInfo({commit},data){
			commit('_setMemberCardInfo', data)
		}
	}
}
