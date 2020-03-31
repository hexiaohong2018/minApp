export default {
  namespaced: true,
  cache: 'local',

  state: {
    systemInfo: {}
  },

  getters: {
    systemInfo (state) {
      return state.systemInfo
    }
  },

  mutations: {
    setSystemInfo (state, data) {
      state.systemInfo = data
    }
  },

  actions: {
    systemInfo ({ commit }) {
      try {
        const {model,statusBarHeight,version,screenWidth,SDKVersion} = uni.getSystemInfoSync()
        var _phoneInfo = {
          version: version,//微信版本号 6.6.0以上支持navigationStyle
          statusBarHeight: statusBarHeight,
          screenWidth:screenWidth,
          SDKVersion:SDKVersion,//基础库信息 2.5.0以上支持自定tabbar
        }
        if (model.indexOf("iPhone X") != -1 || model.indexOf("unknown") != -1) {
          _phoneInfo.isIphoneX = true;
          _phoneInfo.tabBarHeight=86;//底部tabbar栏高度
        } else {
          _phoneInfo.isIphoneX = false;
          _phoneInfo.tabBarHeight = 56;//底部tabbar栏高度
        }
        if(uni.getMenuButtonBoundingClientRect){
          let menuRect = uni.getMenuButtonBoundingClientRect();
          _phoneInfo.menuRect=menuRect;
          _phoneInfo.menuHeight=menuRect.height + (menuRect.top - statusBarHeight) * 2;
          _phoneInfo.navHeight=statusBarHeight+_phoneInfo.menuHeight;//顶部导航栏高度
        }else{
          _phoneInfo.menuHeight = 44;
          _phoneInfo.navHeight=statusBarHeight+44;//顶部导航栏高度
        }
        commit('setSystemInfo', _phoneInfo)
      } catch (error) {
        console.log(error)
      }
    }
  }
}