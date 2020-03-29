<template></template>
<script>
import store from '../../utils/store.js';
import { User } from '../../utils/class.js';
import { phoneInfo, showModalFn } from '../../utils/util.js';
const app = getApp();
// Object.assign(app, util, lib);
const user = new User();
export default {
	onLoad(options) {
		uni.hideTabBar();
		this.updateApp(); //检查是否有新发布的小程序
		phoneInfo().then(res => {
			store.dispatch('setNavHeight', res.statusBarHeight + res.menuHeight);//顶部导航栏高度
			store.dispatch('setTabBarHeight',res.isIphoneX?86:56);//底部tabbar栏高度
			
			if(res.version && res.SDKVersion){
				// version,//微信版本号 6.6.0以上支持navigationStyle
				//SDKVersion:SDKVersion,//基础库信息 2.5.0以上支持自定tabbar
				if (this.compareVersions(res.version, '6.6.0') == -1 || this.compareVersions(res.SDKVersion, '2.5.0') == -1) {
					//低于版本要求
					showModalFn('微信版本过低，请升级');
				} else {
					user.login().then(res => {
						uni.switchTab({
							url: '../eshop/index'
						});
					});
				}
			}else{
				user.login().then(res => {
					uni.switchTab({
						url: '../eshop/index'
					});
				});
			}
			
		});
	},
	methods: {
		compareVersions(sources, dests) {
			sources = sources.split('.').map(item => parseInt(item));
			dests = dests.split('.').map(item => parseInt(item));
			for (let i = 0, minL = Math.min(sources.length, dests.length); i < minL; i++) {
				if (sources[i] < dests[i]) {
					//版本号小于目标版本
					return -1;
					break;
				} else if (sources[i] > dests[i]) {
					return 1;
					break;
				} else if (i === minL && sources[i] === dests[i]) {
					return 0;
				}
			}
		},

		/**
		 * 检查新版本
		 */
		updateApp() {
			// #ifdef MP-WEIXIN
				const updateManager = uni.getUpdateManager();
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					console.log(res.hasUpdate);
				});
				
				updateManager.onUpdateReady(function() {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success: function(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate();
								uni.clearStorage();
							}
						}
					});
				});
				updateManager.onUpdateFailed(function() {
					// 新版本下载失败
					showToastFn('下载新版本失败');
				});
			// #endif
			
		}
	}
};
</script>

<style></style>
