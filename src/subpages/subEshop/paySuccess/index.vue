<template>
	<view>
		<!-- pages/paySuccess/index.uniml -->
		<dc-nav-bar title="订单详情" :left-icon="icon" :background="activeColor" clear-float @click-left="onClickLeft"></dc-nav-bar>
		<view class="order-container">
			<view class="order-state" :style="{ background: activeColor }">
				<view class="order-info">
					<view class="title">
						<text v-if="orderInfo.shipping_methods">
							{{
								orderInfo.payment_status
									? orderInfo.delivery_status
										? orderInfo.delivery_status == 1
											? '商家已发货'
											: '已完成交易'
										: '等待商家发货'
									: '等待买家付款'
							}}
						</text>
						<text v-else>{{ orderInfo.payment_status ? (orderInfo.delivery_status == 2 ? '已完成交易' : '请尽快到店提取') : '请尽快到店提取(未付款)' }}</text>
					</view>
					<view class="info">订单号：{{ orderInfo.order_id }}</view>
				</view>
				<view class="icon" style="font-size:130rpx">
					<!-- shipping_methods 0到店，1配送 -->
					<!-- 0待付款, 1已付款 payment_status -->
					<!-- 0等待配送，1配送中，2已完成 delivery_status -->
					<view
						v-if="orderInfo.shipping_methods"
						class="iconfont-vant"
						:class="
							'icon-vant-' +
								(orderInfo.payment_status ? (orderInfo.delivery_status ? (orderInfo.delivery_status == 1 ? 'logistics' : 'sign') : 'tosend') : 'balance-pay')
						"
					></view>
					<view v-else class="iconfont-vant icon-vant-bag-o"></view>
				</view>
			</view>
			<!-- 送货上门显示收货人信息  到店自提显示店铺联系信息-->
			<view class="verifycode" v-if="orderInfo.verifycode && orderInfo.payment_status">
				<canvas class="bar" canvas-id="barcode"></canvas>
				<text class="number">核销码：{{ orderInfo.verifycode }}</text>
			</view>
			<view class="consignee">
				<view class="location">
					<view class="iconfont-vant" :class="'icon-vant-' + (orderInfo.shipping_methods ? 'location-o' : 'shop-o')" :style="{ color: activeColor }"></view>
				</view>
				<template v-if="orderInfo.shipping_methods">
					<view class="info">收货人：{{ orderInfo.receipt_data.s_r_name + ' ' + orderInfo.receipt_data.s_r_phone }}</view>
					<view class="info">收货地址：{{ orderInfo.receipt_data.s_r_address }}</view>
				</template>
				<template v-else>
					<view class="info" @tap="oncall">联系商家：{{ shopInfo.shop_name + ' ' + (shopInfo.storePhoneNumber ? shopInfo.storePhoneNumber : '') }}</view>
					<view class="info">商家地址：{{ shopInfo.shop_address }}</view>
				</template>
			</view>
			<ul class="orders">
				<li class="item" v-for="(item, index) in orderInfo.products" :key="item.product_id">
					<view class="product">
						<view class="des">{{ item.name }}</view>
						<view class="price">
							<view class="num">{{ item.num }}</view>
							<view class="value">{{ item.price }}</view>
						</view>
					</view>
					<view class="bottom">
						<ul class="category">
							<li class="category-item" v-for="(subItem, subIndex) in item.combination_new" :key="subIndex">{{ subItem.sv_p_name }}</li>
						</ul>
						<!-- 已付款并且该商品没有申请过退货时，可单个商品退货 -->
						<!-- refund 98不可以退货,99可以退货，100申请，101拒绝，200确认 -->
						<!-- <view class="op" uni:if="{{item.refund != 98 && memberID > 0}}"> -->
						<view class="op" v-if="item.refund != 98">
							<template v-if="item.op_state">
								<uni-number-box
									:value="item.op_num"
									:min="1"
									:max="item.num"
									@change="changeOpNum($event, index)"
									button-size="25px"
									input-width="25px"
								></uni-number-box>
								<view class="btn" @tap="onReturn(index)">取消</view>
								<view class="btn" @tap="onComfiReturn({ index: index, productid: item.product_id, wproductid: item.w_product_id })">确定</view>
							</template>
							<view v-else :class="'btn ' + (item.refund != 99 ? 'state-btn' : '')" @tap="onReturn(index)">
								{{ item.refund == 99 ? '退货' : item.refund == 100 ? '退货中' : item.refund == 101 ? '拒绝退货' : '已退货' }}
							</view>
						</view>
					</view>
				</li>
			</ul>
			<view class="total">
				<!-- 已付款并且没申请过退货时可以整单退 -->
				<view class="btn" @tap="onAllReturn" v-if="orderInfo.un_refund">整单退</view>
				<view class="price">
					合计：
					<text>{{ orderInfo.total_momey }}</text>
					<p v-if="orderInfo.receipt_data && orderInfo.receipt_data.sv_move_freight > 0 && !orderInfo.receipt_data.sv_move_freight_isfree">
						(含运费:{{ orderInfo.receipt_data.sv_move_freight }})
					</p>
				</view>
			</view>
		</view>

		<view class="footer" v-if="!orderInfo.payment_status">
			<view @tap="bindDelPay" class="del-oder" :style="'background:' + activeColor">取消订单</view>
			<view @tap="bindPayImmediately" class="pay-oder" :style="'background:' + activeColor">付款</view>
		</view>
		<view class="footer" v-if="orderInfo.payment_status && orderInfo.shipping_methods == 0">
			<view @tap="toShop" class="to-shop" :style="'background:' + activeColor">导航到店</view>
		</view>

		<dc-poster :show="showShare" :share-info="shareInfo" :color="activeColor" z-index="10000"></dc-poster>
	</view>
</template>

<script>
import wxbarcode from 'wxbarcode';
import { Pay, Order } from '../../../utils/class.js';
import { showToastFn, setActiveColor, showModalFn } from '../../../utils/util.js';
import store from '../../../utils/store.js';
import dcPoster from '../../../components/poster/index.vue';
import uniNumberBox from '../../../components/uni-number-box/uni-number-box.vue';
import dcNavBar from '../../../components/navBar/index.vue';

const pay = new Pay();
const order = new Order();

export default {
	data() {
		return {
			activeColor: '',
			orderInfo: {},
			shopInfo: {},
			//店铺信息
			showShare: false,
			shareInfo: {},
			icon: 'arrow-left',

			cid: '',
			//配置ID
			pid: '',
			//子商品ID
			picUrl: '',
			pmid: '' //主商品ID
		};
	},
	components: {
		dcPoster,
		uniNumberBox,
		dcNavBar
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		uni.hideShareMenu();
		this.shopInfo = this.$store.getters['loginInfo/shopInfo'];
		this.activeColor = setActiveColor(store.getters.navColor, '#f44');
		if (options.buystate == 1) {
			this.showShare = true;
			//拼团则显示分享
			this.shareInfo = {
				title: '邀请好友参团',
				imageUrl: options.picUrl,
				path: '/subpages/subEshop/groupBuyInfo/index?cid=' + options.cid + '&id=' + options.pmid + '&s=1' //pmid商品ID
			};
		}

		// 支付页面跳转过来,顶部导航左图标改成返回首页
		getCurrentPages().length == 1 && (this.icon = 'wap-home');

		this.getOrderInfoById(options.orderId);
	},

	methods: {
		/**
		 * 获取订单信息
		 */
		getOrderInfoById(orderId) {
			if (orderId > 0) {
				order
					.getOrderInfoById(orderId)
					.then(res => {
						res.op_state = false; //显示 控制显示退货/取消按钮
						res.op_num = 1; //退货数量
						this.orderInfo = res;
						if (res.verifycode && res.payment_status) {
							//核销码
							wxbarcode.barcode('barcode', res.verifycode, 504, 108);
						}
					})
					.catch(msg => {
						showToastFn('获取订单详情失败');
						console.log(msg);
					});
			}
		},

		/**
		 * 立即支付
		 */
		bindPayImmediately: function(e) {
			var { without_list_id, total_momey, payment_status } = this.orderInfo;
			!payment_status &&
				pay
					.weChatPay(without_list_id, total_momey)
					.then(res => {
						this.getOrderInfoById(without_list_id);
					})
					.catch(msg => {
						showToastFn(msg);
						console.log(msg);
					});
		},
		//取消订单
		bindDelPay: function() {
			order
				.delOrderById(this.orderInfo.without_list_id)
				.then(res => {
					showToastFn('取消成功', 'success');
					setTimeout(() => {
						uni.switchTab({
							url: '../../../pages/eshop/index'
						});
					}, 1500);
				})
				.catch(msg => {
					showToastFn('取消失败');
					console.log(msg);
				});
		},
		onClickLeft(e) {
			if (e) {
				uni.switchTab({
					url: '../../../pages/eshop/index'
				});
			} else {
				uni.navigateBack({
					delta: 1
				});
			}
		},
		hideShare: function() {
			this.showShare = false;
		},

		//退货或取消退货
		onReturn(index) {
			var orderInfo = this.orderInfo;
			if (orderInfo.products[index].refund == '99') {
				this.$set(this.orderInfo.products[index], 'op_state', !orderInfo.products[index].op_state);
				this.$set(this.orderInfo.products[index], 'op_num', 1);
			}
		},

		//确定退货
		onComfiReturn(e) {
			var { index, productid, wproductid } = e,
				orderInfo = this.orderInfo,
				{ without_list_id, products } = orderInfo;
			showModalFn(
				'是否退货？',
				() => {
					order
						.refund({
							list_id: without_list_id,
							state: 2,
							num: products[index].op_num,
							product_id: productid,
							w_product_id: wproductid
						})
						.then(() => {
							orderInfo.un_refund = false; //隐藏整单退

							products[index].op_state = false;
							products[index].refund = '100'; //设置退货状态，申请中

							this.orderInfo = orderInfo;
							showToastFn('退货成功');
						})
						.catch(msg => {
							console.log(msg);
							showToastFn('退货失败：' + msg.values);
						});
				},
				() => {}
			);
		},

		//整单退
		onAllReturn(e) {
			var orderInfo = this.orderInfo,
				without_list_id = orderInfo.without_list_id;
			showModalFn(
				'是否整单退？',
				() => {
					order
						.refund({
							list_id: without_list_id,
							state: 1
						})
						.then(() => {
							orderInfo.un_refund = false; //隐藏整单退
							orderInfo.products = orderInfo.products.map(item => {
								item.refund = '100'; //设置退货状态，申请中
								return item;
							});
							this.orderInfo = orderInfo;
							showToastFn('退货成功');
						})
						.catch(msg => {
							showToastFn('退货失败：' + msg.values);
							console.log(msg);
						});
				},
				() => {}
			);
		},

		//退货数量发生变化
		changeOpNum(vaule, index) {
			var orderInfo = this.orderInfo;
			orderInfo.products[index].op_num = vaule;
			this.orderInfo = orderInfo;
		},

		oncall() {
			const phoneNumber = this.$store.getters['loginInfo/shopInfo'].storePhoneNumber;
			if (phoneNumber) {
				uni.makePhoneCall({
					phoneNumber
				});
			} else {
				showToastFn('联系电话空', 'fail');
			}
		},

		//导航到店铺
		toShop() {
		
			var	shopInfo = this.$store.getters['loginInfo/shopInfo'],
				coordinate = shopInfo && shopInfo.sv_us_coordinate;
			if (coordinate) {
				uni.openLocation({
					latitude: coordinate.lat,
					longitude: coordinate.lng,
					scale: 14,
					name: shopInfo.shop_address
				});
			} else {
				showToastFn('商家没有配置店铺坐标');
			}
		}
	}
};
</script>
<style lang="less" scoped>
.order-container {
	width: 100vw;
	margin-bottom: 100rpx;
	.order-state {
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		width: 100%;
		color: white;
		font-size: 34rpx;
		padding: 10rpx 60rpx;
		position: relative;
		.icon {
			position: absolute;
			right: 60rpx;
			color: rgba(255, 255, 255, 0.5);
			.iconfont-vant {
				font-size: 110rpx;
			}
		}
		.order-info {
			display: flex;
			flex-direction: column;
			.title {
				padding-bottom: 20rpx;
			}
			.info {
				font-size: 28rpx;
				margin-bottom: 10rpx;
			}
		}
	}
	.consignee {
		width: 100%;
		height: 160rpx;
		padding: 10rpx 20rpx 10rpx 120rpx;
		background: white;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		position: relative;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
		.info {
			padding: 5rpx;
		}
		.location {
			width: 100rpx;
			height: 100rpx;
			left: 60rpx;
			top: 50%;
			transform: translate(-50%, -50%);
			position: absolute;
			font-size: 80rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 50%;
			color: white;
			.iconfont-vant {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 120rpx;
			}
		}
	}
	.verifycode {
		margin: 10rpx auto;
		height: 200rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		background: white;
		padding: 30rpx 0;
		box-sizing: border-box;
		z-index: 0;
		.bar {
			width: 504rpx;
			height: 108rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
		}
		.number {
			color: #3992f9;
			letter-spacing: 0.11rem;
			margin-top: 10rpx;
			font-size: 26rpx;
		}
	}

	.orders {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		.item {
			width: 100%;
			box-sizing: border-box;
			padding: 10rpx 30rpx 10rpx 30rpx;
			height: 160rpx;
			display: flex;
			flex-direction: column;
			background: white;
			border-bottom: 1px solid #eee;
			.product {
				display: flex;
				width: 100%;
				flex-grow: 1;
				font-size: 30rpx;
				overflow: hidden;
				justify-content: space-between;
				align-items: center;
				box-sizing: border-box;
				padding-bottom: 10rpx;
				.des {
					height: 65rpx;
					width: 80%;
					font-size: 30rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					color: #666;
					line-height: 65rpx;
				}
				.price {
					height: 100%;
					text-align: right;
					display: flex;
					justify-content: center;
					align-items: center;
					.value {
						width: 100%;
						font-size: 32rpx;
						color: #f44;
						position: relative;
					}
					.value::before {
						content: '￥';
						font-size: 24rpx;
						margin-left: 10rpx;
					}
					.num {
						font-size: 24rpx;
						color: #999;
					}
					.num::before {
						content: 'x';
						font-size: 20rpx;
					}
				}
			}
			.bottom {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
				height: 62rpx;
				.category {
					height: 100%;
					font-size: 24rpx;
					color: #999;
					display: flex;
					justify-content: flex-start;
					align-items: center;
					overflow: hidden;
					flex-grow: 1;
					.category-item {
						padding: 5rpx;
					}
				}
				.op {
					width: 400rpx;
					height: 100%;
					overflow: hidden;
					display: flex;
					justify-content: flex-end;
					align-items: center;
					box-sizing: border-box;
					.state-btn {
						border: 0;
						color: #f2826a;
					}
				}
			}
		}
	}

	.total {
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 20rpx;
		background: white;
		box-sizing: border-box;
		font-size: 34rpx;
		position: relative;
		.price {
			position: absolute;
			right: 20rpx;
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			justify-content: center;
			align-items: center;
		}
		text {
			color: #f44;
		}
		text::before {
			content: '￥';
			margin-right: 10rpx;
			font-size: 28rpx;
		}
		p {
			font-size: 26rpx;
			color: #666;
		}
	}
}
.footer {
	width: 100%;
	height: 50px;
	background-color: #fff;
	position: fixed;
	bottom: 0;
	font-size: 32rpx;
	.del-oder {
		width: 50%;
		float: left;
		text-align: center;
		line-height: 50px;
		background-color: rgb(255, 68, 68);
		color: #fff;
		position: relative;
	}
	.del-oder::after {
		content: '';
		display: block;
		height: 50px;
		width: 1px;
		position: absolute;
		right: 0;
		top: 0;
		background-color: #fff;
	}
	.pay-oder,
	.to-shop {
		width: 50%;
		float: left;
		text-align: center;
		line-height: 50px;
		background-color: rgb(255, 68, 68);
		color: #fff;
	}
	.to-shop {
		width: 100%;
	}
}
.orders .item .bottom .op .btn,
.order-container .total .btn {
	min-width: 70rpx;
	border: 1px solid #eee;
	font-size: 24rpx;
	border-radius: 12rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 10rpx;
	padding: 10rpx;
}
</style>
