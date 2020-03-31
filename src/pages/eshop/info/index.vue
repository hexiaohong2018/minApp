<template>
	<div v-show="show" class="info">
		<button class="reg-btn" v-if="memberInfo.member_id <= 0" open-type="getUserInfo" lang="zh_CN" @getuserinfo="onGetUserInfo"></button>

		<div class="member-info" :style="{ backgroundColor: color, color: fontColor }">
			<div class="wx-info">
				<div class="head-img">
					<!-- #ifdef MP-WEIXIN || MP-BAIDU || MP-QQ -->
					<open-data type="userAvatarUrl"></open-data>
					<!-- #endif -->
					<!-- #ifndef MP-WEIXIN || MP-BAIDU || MP-QQ-->
					<view class="img" :style="{ backgroundImage: 'url(' + memberInfo.sv_headimgurl + ')' }"></view>
					<!-- #endif -->
				</div>
				<div class="name">
					<!-- #ifdef MP-WEIXIN || MP-BAIDU || MP-QQ -->
					<open-data type="userNickName"></open-data>
					<!-- #endif -->
					<!-- #ifndef MP-WEIXIN || MP-BAIDU || MP-QQ-->
					{{ memberInfo.sv_nick_name || '' }}
					<!-- #endif -->
					<div v-if="memberInfo.member_id > 0" class="nikkname">{{ memberCardInfo.sv_ml_name }}</div>
					<div v-else class="reg">登录/注册</div>
				</div>
			</div>
			<ul class="fortune">
				<li @click="topUp">
					<div class="value">{{ memberCardInfo.sv_mw_availableamount || 0 }}</div>
					<div class="text">余额</div>
				</li>
				<li @click="checkIntegral">
					<div class="value">{{ memberCardInfo.sv_mw_availablepoint || 0 }}</div>
					<div class="text">积分</div>
				</li>
				<li @click="checkCoupon">
					<div class="value">{{ couponConts }}</div>
					<div class="text">优惠券</div>
				</li>
			</ul>
		</div>

		<mescroll-uni :top="navBarHeight + 'px'" :bottom="tabBarHeight + 'px'" @down="downCallback" :down="{ auto: false }" :up="{ use: false }">
			<div class="card" @click="openVip">
				<div class="title">
					<view class="iconfont-vant icon-vant-vip-card-o"></view>
					<text>VIP会员</text>
				</div>
				<text class="des">{{ memberInfo.member_id <= 0 ? '开通会员享受更多优惠' : '打开会员卡查看优惠信息' }}</text>
			</div>

			<div class="grid-group">
				<view class="grid-item" @click="checkOrder(1)">
					<view class="iconfont-vant icon-vant-balance-pay">
						<view class="dot" v-if="orderCount.pendingPayment">{{ orderCount.pendingPayment }}</view>
					</view>
					<view class="text">待付款</view>
				</view>

				<view class="grid-item" @click="checkOrder(2)">
					<view class="iconfont-vant icon-vant-tosend">
						<view class="dot" v-if="orderCount.waiting">{{ orderCount.waiting }}</view>
					</view>
					<view class="text">待发货</view>
				</view>

				<view class="grid-item" @click="checkOrder(3)">
					<view class="iconfont-vant icon-vant-logistics">
						<view class="dot" v-if="orderCount.inDelivery">{{ orderCount.inDelivery }}</view>
					</view>
					<view class="text">待收货</view>
				</view>

				<view class="grid-item" @click="checkOrder(0)">
					<view class="iconfont-vant icon-vant-sign"></view>
					<view class="text">全部订单</view>
				</view>
			</div>

			<div class="grid-group">
				<view class="grid-item" @click="goRecommend">
					<view class="iconfont-vant icon-vant-award-o"></view>
					<view class="text">推荐中心</view>
				</view>

				<view class="grid-item" @click="onShare">
					<view class="iconfont-vant icon-vant-gift-o"></view>
					<view class="text">邀请有礼</view>
				</view>

				<view class="grid-item" @click="openReservation">
					<view class="iconfont-vant icon-vant-todo-list-o"></view>
					<view class="text">我的预约</view>
				</view>

				<view class="grid-item" @click="seckill">
					<view class="iconfont-vant icon-vant-clock-o"></view>
					<view class="text">秒杀</view>
				</view>

				<view class="grid-item" @click="groupBuy">
					<view class="iconfont-vant icon-vant-friends-o"></view>
					<view class="text">拼团</view>
				</view>

				<view class="grid-item" @click="goIntegral">
					<view class="iconfont-vant icon-vant-shop-collect-o"></view>
					<view class="text">积分商城</view>
				</view>
			</div>

			<div class="grid-group">
				<view class="grid-item" @click="checkBill">
					<view class="iconfont-vant icon-vant-bill-o"></view>
					<view class="text">我的账单</view>
				</view>

				<view class="grid-item" @click="addressList">
					<view class="iconfont-vant icon-vant-location-o"></view>
					<view class="text">地址管理</view>
				</view>

				<view class="grid-item" @click="onPhone">
					<view class="iconfont-vant icon-vant-phone-o"></view>
					<view class="text">联系商家</view>
				</view>

				<view class="grid-item">
					<view class="iconfont-vant icon-vant-service-o"><button class="contact" open-type="contact"></button></view>
					<view class="text">客服帮助</view>
				</view>
			</div>
			<view class="foot" v-if="distributorInfo.name">
				<view v-if="false" class="img" :style="{ backgroundImage: 'url(/static/shoplogo.png)' }"></view>
				<view class="des">-- {{ distributorInfo.name }} --</view>
			</view>
		</mescroll-uni>
	</div>
</template>

<script>
import { User, Coupon, Bill, Order } from '../../../utils/class.js';
import { isDeepColor, showToastFn } from '../../../utils/util.js';
import { mapGetters } from 'vuex';
const user = new User();
const coupon = new Coupon();
const bill = new Bill();
const order = new Order();
export default {
	name: 'info',
	props: {
		show: Boolean,
		color: String
	},
	data() {
		return {
			couponConts: 0,
			orderCount: {},
			navBarHeight: 0,
			tabBarHeight: 0
		};
	},
	created() {
		this.onLoad = (function() {
			var is_first_run = true;
			return function() {
				if (is_first_run) {
					this.navBarHeight = this.$store.getters['systemInfo/systemInfo'].navHeight + 128;
					this.tabBarHeight = this.$store.getters['systemInfo/systemInfo'].tabBarHeight;
					is_first_run = false;
				}
			};
		})();
	},
	computed: {
		fontColor() {
			return isDeepColor(this.color) ? 'white' : '#333';
		},
		...mapGetters({
			memberInfo: 'loginInfo/memberInfo',
			memberCardInfo: 'loginInfo/memberCardInfo',
			distributorInfo: 'loginInfo/distributorInfo'
		})
	},
	watch: {
		show(newVal) {
			this.onLoad();
			newVal && this.init();
		}
	},
	methods: {
		topUp() {
			let shopInfo = this.$store.getters['loginInfo/shopInfo'],
				extConfig = uni.getExtConfigSync ? uni.getExtConfigSync() : {}, //读取ext.json文件信息
				auditid = extConfig && extConfig.attr && extConfig.attr.auditid;
			if (shopInfo.cantopup || shopInfo.usingid >= auditid) {
				uni.navigateTo({
					url: '../../subpages/subEshop/recharge/index'
				});
			}
		},
		downCallback(mescroll) {
			uni.removeStorageSync('expiredTime');
			this.$parent.getUiConfig();
			this.init()
				.then(res => {
					mescroll.endSuccess();
				})
				.catch(err => {
					showToastFn('加载失败..');
					mescroll.endErr();
				});
		},
		init() {
			return Promise.all([order.getOrderCount(), coupon.getCouponList(0), user.getMemberCardInfo()]).then(values => {
				var [orderCount, couponList] = values;
				this.orderCount = orderCount;
				this.couponConts = couponList.length;
			});
		},
		// 注册
		onGetUserInfo(e) {
			if (e.detail.userInfo) {
				uni.setStorageSync('userInfo', e.detail.userInfo);
				uni.navigateTo({
					url: '../../subpages/common/reg/index'
				});
			}
		},
		groupBuy() {
			uni.navigateTo({
				url: '../../subpages/subEshop/groupBuy/index'
			});
		},
		checkIntegral() {
			uni.navigateTo({
				url: '../../subpages/subEshop/integral/index'
			});
		},
		seckill() {
			uni.navigateTo({
				url: '../../subpages/subEshop/seckill/index'
			});
		},
		goRecommend() {
			uni.navigateTo({
				url: '../../subpages/subEshop/recommend/index'
			});
		},
		checkOrder(state) {
			uni.navigateTo({
				url: '../../subpages/subEshop/order/index?state=' + state
			});
		},
		checkBill() {
			uni.navigateTo({
				url: '../../subpages/subEshop/bill/index'
			});
		},
		openReservation() {
			this.$minRouter.push({
				name: 'eshop/subpages/reservation'
			});
		},
		openVip() {
			if (uni.navigateToMiniProgram) {
				user.memberCardDataFn()
					.then(res => {
						uni.navigateToMiniProgram({
							appId: 'wxeb490c6f9b154ef9', // 固定为此 appid，不可改动
							extraData: res, // 包括 encrypt_card_id, outer_str, biz三个字段
							fail(e) {
								console.error(e);
							}
						});
					})
					.catch(msg => {
						uni.navigateTo({
							url: '../../subpages/subEshop/vipCard/index'
						});
					});
			} else {
				uni.navigateTo({
					url: '../../subpages/subEshop/vipCard/index'
				});
			}
		},
		onPhone() {
			const phoneNumber = this.$store.getters['loginInfo/shopInfo'].storePhoneNumber;
			if (phoneNumber) {
				uni.makePhoneCall({
					phoneNumber
				});
			} else {
				showToastFn('联系电话空', 'fail');
			}
		},
		checkCoupon() {
			uni.navigateTo({
				url: '../../subpages/subEshop/coupon/index'
			});
		},
		onShare() {
			uni.navigateTo({
				url: '../../subpages/subEshop/share/index'
			});
		},
		addressList() {
			uni.navigateTo({
				url: '../../subpages/common/addressList/index'
			});
		},
		goIntegral() {
			uni.switchTab({
				url: '../integral/index'
			});
		}
	}
};
</script>

<style lang="less" scoped>
.info {
	position: relative;
	width: 100vw;
	min-height: 100vh;
	.reg-btn {
		padding: 0;
		margin: 0;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		z-index: 99;
	}

	.reg-btn::after {
		border: 0;
	}
	.icon {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 10rpx;
	}

	.member-info {
		width: 100vw;
		height: 128px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		position: relative;

		overflow: hidden;
		.wx-info {
			display: flex;
			align-items: center;
			padding: 10rpx 60rpx;
			box-sizing: border-box;
			.head-img {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				overflow: hidden;
				margin-right: 30rpx;
				.img {
					width: 100%;
					height: 100%;
					background-repeat: no-repeat;
					background-position: center;
					background-size: cover;
				}
			}

			.name {
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				.nikkname {
					font-size: 24rpx;
					height: 40rpx;
					min-width: 80rpx;
					line-height: 40rpx;
					padding: 0rpx 15rpx;
					border-radius: 14rpx;
					background-color: rgba(0, 0, 0, 0.2);
					margin-top: 15rpx;
				}
				.reg {
					font-size: 20rpx;
					padding-top: 15rpx;
				}
			}
		}

		.fortune {
			width: 100%;
			height: 100rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 16rpx;
			padding-bottom: 20rpx;
			li {
				display: flex;
				flex-direction: column;
				width: 100%;
				height: 100%;
				justify-content: center;
				align-items: center;
				position: relative;

				.text {
					font-size: 24rpx;
					margin-top: 6rpx;
				}
			}

			li:after {
				content: '|';
				width: 2rpx;
				height: 40%;
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				right: 0;
			}

			li:last-child:after {
				width: 0;
			}
		}
	}
	.card {
		width: 94%;
		height: 110rpx;
		border-radius: 14rpx;
		background: linear-gradient(90deg, rgb(250, 189, 145), rgb(255, 222, 191));
		margin: 0 auto;
		margin-bottom: 20rpx;
		color: rgb(137, 92, 51);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 50rpx 10rpx 20rpx;
		box-sizing: border-box;
		font-size: 24rpx;
		position: relative;
		margin-top: 20rpx;
		.title {
			display: flex;
			justify-content: center;
			align-items: center;
			.iconfont-vant {
				font-size: 50rpx;
				margin-right: 10rpx;
			}
		}
	}
	.card:after {
		content: '';
		width: 14rpx;
		height: 14rpx;
		border-top: 1px solid rgb(137, 92, 51);
		border-right: 1px solid rgb(137, 92, 51);
		position: absolute;
		right: 20rpx;
		top: 50%;
		transform: translateY(-50%) rotate(45deg);
	}
	.card:active {
		opacity: var(--active-opacity);
	}
	.grid-group {
		width: 94vw;
		border-radius: 16rpx;
		background-color: white;
		margin: 0rpx auto 20rpx auto;
		overflow: hidden;
		min-height: 162rpx;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		.grid-item {
			width: 25%;
			height: 100%;
			min-height: 162rpx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			padding: 10rpx;

			.iconfont-vant {
				position: relative;
				font-size: 50rpx;
				padding: 10rpx;
				position: relative;
				.dot {
					height: 32rpx;
					min-width: 32rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: #f44;
					color: white;
					border-radius: 32rpx;
					position: absolute;
					right: 0;
					top: -6rpx;
					z-index: 2;
					font-size: 24rpx;
					box-sizing: border-box;
					border: 1px solid white;
					transform: translateX(20%);
					padding: 0 6rpx;
				}
				.contact {
					position: absolute;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
					z-index: 2;
					background-color: transparent;
				}
				.contact:after {
					border: 0;
				}
			}
			.text {
				font-size: 24rpx;
				color: #666;
			}
		}
	}
	.foot {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 150rpx;
		color: #666;
		.img {
			width: 80rpx;
			height: 80rpx;
			background-position: center;
			background-repeat: no-repeat;
			background-size: cover;
			margin-bottom: 10rpx;
		}
	}
}
</style>
