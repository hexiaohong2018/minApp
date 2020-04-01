export default {
	namespaced: true,
	cache: 'local',
	state: {
		memberInfo: null,
		shopInfo: null,
		distributorInfo: null,
		expiredTime: null,//登录有效时间
		memberCardInfo:null,
		recommend_member_id:0,//推荐人ID
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
		},
		login(state){
			return state
		},
		salesUserId(state){
			return state.shopInfo.sales_user_id;
		},
		recommendMemberId(state){
			return state.recommend_member_id;
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
		},
		_setSalesUserId(state,data){
			state.expiredTime = null;//切换门店时，去掉过期时间，重新登录
			state.shopInfo.sales_user_id = data;
		},
		_setRecommendMemberId(state,data){
			data > 0 && (state.expiredTime = null)//存在推荐人，去掉过期时间，重新登录
			state.recommend_member_id = data;
		}
	},
	actions: {
		setRecommendMemberId({commit},data){
			commit('_setRecommendMemberId',data);
		},
		setSalesUserId({commit},data){
			commit('_setSalesUserId',data)
		},
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
