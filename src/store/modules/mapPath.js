export default {
  namespaced: true,
  cache: 'local',
  state: {
    mapPath: {}
  },
  getters: {
    mapPath (state) {
      return state.mapPath
    }
  },
  mutations: {
    setMapPath: (state) => {
      state.mapPath = {
		  '/subPages/productDisplay/index':'/subpages/eshop/productInfo/index',
		  '/subPages/category/index':'/subpages/eshop/productList/index',
		  '/subPages/groupProductDisplay/index':'/subpages/subEshop/groupBuyInfo/index',
		  '/subPages/secKillDisplay/index':'/subpages/subEshop/secKillInfo/index',
		  '/subPages/groupBuy/index':'/subpages/subEshop/groupBuy/index',
		  '/subPages/seckill/index':'/subpages/subEshop/seckill/index'
	  }
    }
  }
}