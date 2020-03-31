<template>
	<view class="integral-content">
		<uni-grid v-if="memberInfo.member_id <= 0" :column-num="1" :show-border="false" :square="false" :highlight="false">
			<uni-grid-item>
				<view class="wx-info">
					<button class="img" open-type="getUserInfo" @getuserinfo="onReg"><open-data type="userAvatarUrl"></open-data></button>
					<div slot="text" class="des"><text>绑定会员</text></div>
				</view>
			</uni-grid-item>
		</uni-grid>
		<uni-grid v-else :column="3" :show-border="false" :square="false" :highlight="false">
			<uni-grid-item>
				<view class="item">
					<view class="iconfont-vant icon-vant-points"></view>
					<view class="des">
						<text>{{memberCardInfo.sv_mw_availablepoint}}</text>
						积分
					</view>
				</view>
			</uni-grid-item>
			<uni-grid-item>
				<view class="item" @click="checkRecord">
					<view class="iconfont-vant icon-vant-orders-o"></view>
					<view class="des">兑换记录</view>
				</view>
			</uni-grid-item>
			<uni-grid-item>
				<view class="item" @click="goEshop">
					<view class="iconfont-vant icon-vant-shop-o"></view>
					<view class="des">积分商城</view>
				</view>
			</uni-grid-item>
		</uni-grid>
		<dc-list title="积分兑换" value="更多" is-link url="../../subpages/integral/discover/index"></dc-list>
		<dc-product :products="products" type="integral" text="兑换" @click="goTo" @submit="onSubmit"></dc-product>
		<uni-load-more :status="loadStatus ? 'loading' : 'noMore'"></uni-load-more>
	</view>
</template>

<script>
import uniGrid from '@/components/uni-grid/uni-grid.vue';
import uniGridItem from '@/components/uni-grid-item/uni-grid-item.vue';
import dcProduct from '../../components/product/index.vue';
import uniLoadMore from '../../components/uni-load-more/uni-load-more.vue';
import dcList from '../../components/list/index.vue';
import product from '../../components/product';
import dcField from '../../components/field/index.vue';

import { showToastFn } from '../../utils/util.js';
import { User, Integral } from '../../utils/class.js';
import { mapGetters } from 'vuex';
const user = new User();
const integral = new Integral();

export default {
	data() {
		return {
			loadStatus: true,
			products: [],
		};
	},
	computed:{
		...mapGetters({
			memberInfo: 'loginInfo/memberInfo',
			memberCardInfo:'loginInfo/memberCardInfo'
		})
	},
	onLoad() {
		uni.hideTabBar();
	},
	onShow() {
		this._login();
	},
	onShareAppMessage() {
		var shopInfo = this.$store.getters['loginInfo/shopInfo'];
		
		return {
			title: shopInfo.shop_name,
			imageUrl: shopInfo.sv_us_logo,
			path: '/pages/integral/index'
		};
	},
	components: { uniGrid, uniGridItem, dcProduct, dcList, uniLoadMore, dcField },
	onPullDownRefresh() {
		uni.removeStorageSync('expiredTime');
		this._login().then(res => {
			showToastFn('刷新成功');
			uni.stopPullDownRefresh();
		});
	},
	onReachBottom() {
		if (!this.loadStatus) return;
		integral
			.getProductList()
			.then(res => {
				this.loadStatus = res.isAll ? false : true;
				this.products.push(...res.list);
			})
			.catch(msg => {
				console.log(msg);
			});
	},
	methods: {
		_login() {
			return user
				.login()
				.then(res => {
					return integral.getProductList(1);
				})
				.then(res => {
					this.loadStatus = true;
					// loginInfo.memberInfo.sv_mw_availablepoint = res.availablepoint;
					// this.memberInfo = this.memberInfo;
					// this.$store.dispatch('loginInfo/setLogin', loginInfo);
					this.loadStatus = res.isAll ? false : true;
					this.products = res.list;
				})
				.catch(msg => {
					console.log(msg);
					return Promise.reject(msg);
				});
		},
		goTo(id) {
			uni.navigateTo({
				url: '../../subpages/integral/productInfo/index?id=' + id
			});
		},
		goEshop() {
			uni.switchTab({
				url: '../eshop/index'
			});
		},
		checkRecord(index) {
			uni.navigateTo({
				url: '../../subpages/integral/order/index'
			});
		},
		goEshop() {
			uni.switchTab({
				url: '../eshop/index'
			});
		},
		onSubmit(id) {
			var product = this.products.find(item => item.product_id == id);
			if (product.sv_p_integral > this.memberInfo.sv_mw_availablepoint) {
				showToastFn('积分不够');
			} else {
				uni.setStorage({
					key: 'product',
					data: product
				});
				uni.navigateTo({
					url: `../../subpages/integral/pay/index`
				});
			}
		},
		onReg(e) {
			uni.setStorageSync('userInfo', e.detail.userInfo);
			uni.navigateTo({
				url: '../../subpages/common/reg/index'
			});
		}
	}
};
</script>

<style lang="less" scoped>
.integral-content {
	width: 100vw;
	font-size: 28rpx;
	color: #333;
	overflow-x: hidden;
	box-sizing: border-box;
	.wx-info {
		width: 100vw;
		height: 200rpx;
		background: white;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		.img {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			overflow: hidden;
			margin-bottom: 20rpx;
			padding: 0;
		}
		.img:after {
			border: 0;
		}
		.des {
			color: #666;
			letter-spacing: 0.1rem;

			text {
				color: #fd7108;
				font-weight: 600;
				letter-spacing: 2rpx;
			}
		}
	}

	.item {
		background-color: white;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-content: center;
		font-size: 24rpx;
		width: 100%;
		margin-bottom: 10rpx;
		.iconfont-vant {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 50rpx;
			box-sizing: border-box;
			padding: 30rpx 0 10rpx 0;
		}
		.des {
			width: 100%;
			text-align: center;
			box-sizing: border-box;
			padding-bottom: 30rpx;
			text {
				color: #fd7108;
				padding-right: 5rpx;
			}
		}
	}
}
</style>
