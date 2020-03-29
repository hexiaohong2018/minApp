<template>
	<div class="container">
		<nav-bar title="商品详情" :background="navBarBackground" :left-icon="icon" @click-left="onClickLeft"></nav-bar>
		<div v-if="loading" class="img-skeleton"></div>
		<ad v-else :images="productInfo.sv_p_imagesList"></ad>

		<div class="msg">
			<div class="des">{{ productInfo.sv_remark || productInfo.sv_p_name }}</div>
			<div class="integral">
				<div class="value">
					{{ `${productInfo.sv_p_integral}积分` }}
					<text>{{ `￥${productInfo.sv_p_unitprice}` }}</text>
				</div>
				<div class="share" @click="onShare">
					<div class="iconfont-vant icon-vant-share"></div>
					<p>分享</p>
				</div>
			</div>
			<span class="remain">{{ `剩余${productInfo.sv_p_integralsurplus >= 0 ? productInfo.sv_p_integralsurplus : 0}件` }}</span>
		</div>
		<div class="info">
			<div class="title">商品详情</div>
			<rich-text v-if="productInfo.sv_move_p_details" :nodes="productInfo.sv_move_p_details"></rich-text>
			<text v-else>暂无详情</text>
		</div>

		<div class="btn" @click="exchange">
			<div>{{ `${productInfo.sv_p_integral || 0}积分` }}</div>
			<div>立即兑换</div>
		</div>
		<poster :show="showPoster" @close="onClose" :shareInfo="shareInfo" round z-index="1000"></poster>
	</div>
</template>
<script>
import poster from '@/components/poster/index.vue';
import ad from '@/components/ad/index.vue';
import navBar from '@/components/navBar/index.vue';
import store from '../../../utils/store.js';
import { debounce } from '../../../utils/common.js';

import { showToastFn, decodeWXCodeParams } from '../../../utils/util.js';
import { Integral, User } from '../../../utils/class.js';
const integral = new Integral();
const user = new User();
export default {
	data() {
		return {
			productInfo: null,
			navBarBackground: 'transparent',
			showPoster: false,
			shareInfo: {},
			loading: true,
			icon: 'arrow-left'
		};
	},
	onShareAppMessage() {
		return this.shareInfo;
	},
	onLoad(options) {
		this.menuHeight = store.getters.navHeight;
		this.debounce = debounce((e)=>{
			if (e.scrollTop > this.menuHeight) {
				this.navBarBackground = '#ffffff';
			} else {
				this.navBarBackground = 'transparent';
			}
		},600,false)
		options = decodeWXCodeParams(options);
		if (options.s) {
			user.login().then(res => {
				user.getMemberCardInfo();
				this._getProductInfo(options.id);
			});
		} else {
			this._getProductInfo(options.id);
		}
		options.s && (this.icon = 'wap-home');
	},
	onPageScroll(e) {
		this.debounce(e);
	},
	components: {
		ad,
		navBar,
		poster
	},
	methods: {
		_getProductInfo(id) {
			id &&
				integral
					.getProductInfo(id)
					.then(res => {
						this.loading = false;
						this.productInfo = res;
						this.shareInfo = {
							title: res.sv_p_name,
							imageUrl: res.sv_p_images2,
							path: `/subpages/integral/productInfo/index?id=${id}&s=1`
						};
					})
					.catch(msg => {
						console.log(msg);
						showToastFn('获取商品信息失败');
					});
		},
		onSave() {
			this.showPoster = false;
		},
		onClickLeft(e) {
			if (e) {
				uni.switchTab({
					url: '../../../pages/integral/index'
				});
			} else {
				uni.navigateBack({
					delta: 1
				});
			}
		},
		onShare() {
			this.showPoster = true;
		},
		onClose() {
			this.showPoster = false;
		},
		exchange() {
			if (!this.productInfo) {
				showToastFn('获取商品信息有误');
			} else if (this.productInfo.sv_p_integralsurplus <= 0) {
				showToastFn('剩余数量为:0');
			} else if (this.productInfo.sv_p_integral > this.$store.getters['loginInfo/memberInfo'].sv_mw_availablepoint) {
				showToastFn('积分不够');
			} else {
				uni.setStorage({
					key: 'product',
					data: this.productInfo
				});
				uni.navigateTo({
					url: '../pay/index'
				});
			}
		}
	}
};
</script>

<style scoped lang="less">
.container {
	background: white;
	padding-bottom: 110rpx;
	.img-skeleton {
		width: 100%;
		height: 0;
		padding-bottom: calc(100% - 30rpx);
		border-bottom: 30rpx solid white;
		background: #f2f3f5;
	}
	.btn {
		position: fixed;
		left: 0;
		bottom: 0;
		right: 0;
		height: 110rpx;
		background: #f44;
		color: white;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-weight: 600;
		font-size: 35rpx;
		div:first-child {
			margin-bottom: 4rpx;
		}
	}
	.btn:active {
		opacity: var(--active-opacity);
	}
}
.msg {
	width: 100vw;
	padding: 20rpx 36rpx 30rpx 36rpx;
	box-sizing: border-box;
	font-weight: 600;
	background: white;
	.des {
		width: 100%;
		font-size: 28rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-indent: 1.3rem;
		line-height: 1.4rem;
	}
	.integral {
		font-size: 32rpx;
		color: #f67717;
		letter-spacing: 0.08rem;
		margin-bottom: 28rpx;
		margin-top: 28rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		.value {
			display: flex;
			flex: 1;
			justify-content: flex-start;
			align-items: center;
			text {
				font-weight: 500;
				color: #333;
				font-size: 22rpx;
				letter-spacing: 0;
				text-decoration: line-through;
				margin-left: 18rpx;
			}
		}
		.share {
			display: felx;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			p {
				font-size: 22rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				color: #999;
			}
			.iconfont-vant {
				font-size: 38rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.share:active {
			opacity: var(--active-opacity);
		}
	}
	.remain {
		font-size: 25rpx;
		color: #f66800;
		background: #ffe0c9;
		border-radius: 10rpx;
		padding: 12rpx 18rpx;
		position: relative;
		letter-spacing: 0.08rem;
		z-index: 2;
	}
	.remain:after {
		content: '';
		width: 20rpx;
		height: 20rpx;
		background: #ffe0c9;
		position: absolute;
		top: 50%;
		transform: translateY(-50%) rotate(45deg);
		left: -10rpx;
		z-index: -1;
	}
}
.info {
	width: 100vw;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	border-top: 20rpx solid #f8f8f8;
	.title {
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28rpx;
		color: #333;
		letter-spacing: 0.08rem;
		border-bottom: 1px solid #eee;
	}
	.title:after,
	.title:before {
		content: '';
		width: 40rpx;
		height: 2rpx;
		background: #333;
		margin: 0 10rpx;
	}
	text {
		font-size: 24rpx;
		padding: 30rpx;
	}
}
</style>
