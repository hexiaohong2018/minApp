<template>
	<div class="container">
		<dc-nav-bar arrow clear-float :background="activeColor" @click-left="onLeft">
			<template v-slot:title>
				<view class="tab">
					<view
						class="tab-item"
						:style="{ color: nav_index == 0 ? activeColor : inactiveColor, borderColor: inactiveColor, background: nav_index == 0 ? inactiveColor : '' }"
						@click="navChange(0)"
					>
						线上订单
					</view>
					<view
						class="tab-item"
						:style="{ color: nav_index == 1 ? activeColor : inactiveColor, borderColor: inactiveColor, background: nav_index == 1 ? inactiveColor : '' }"
						@click="navChange(1)"
					>
						线下订单
					</view>
				</view>
			</template>
		</dc-nav-bar>
		<view style="width: 100vw" v-show="nav_index == 0">
			<dc-tabs
				:active="active"
				:color="activeColor"
				v-if="nav_index == 0"
				:titles="['全部', '待付款', '待发货', '待收货', '已完成']"
				:style="{ width: '100vw', zIndex: 100 }"
				@change="onlineChange($event)"
			></dc-tabs>
			<mescroll-uni @init="mescrollInit" @down="downCallback" @up="upCallback" :top="_tabBarHeight + 'px'">
				<view class="online">
					<view class="list-item" v-for="(item, index) in online_list" :key="item.wt_nober" @click="onDetails(index)">
						<view class="list-title">
							<view class="order-title">
								<text style="color:#000;" class="fl">订单单号：{{ item.wt_nober }}</text>
								<text class="data-time">{{ item.wt_datetime }}</text>
							</view>
							<view class="deliver-info" v-if="item.sv_deliver_orderno">
								<view class="order-no">
									<text class="title">物流单号：</text>
									{{ item.sv_deliver_orderno }}
								</view>
								<view class="company">
									<text class="title">物流公司：</text>
									{{ item.sv_deliver_company }}
								</view>
								<view class="deliver-time">
									<text class="title">发货时间：</text>
									{{ item.sv_deliver_goods_time }}
								</view>
							</view>
						</view>

						<view class="p_listBox">
							<view class="p_list" v-for="subItem in item.order_product_json_str" :key="subItem.sv_p_name">
								<view class="name">{{ subItem.sv_p_name }}</view>
								<view class="number">x{{ subItem.sv_p_weight > 0 ? subItem.sv_p_weight : subItem.product_num }}</view>
								<view class="price">{{ subItem.product_unitprice }}</view>
							</view>
						</view>
						<view class="list-footer">
							<view class="fl totalbox">
								<view class="total">
									合计：
									<text>¥</text>
									{{ item.sv_order_actual_money }}
								</view>
								<view class="fr btnbox" v-if="item.sv_shop_payment_status == 0">
									<text @click.stop="deleteWithOrderListById(index)" class="cancelorder">取消订单</text>
									<text @click.stop="bindPayImmediately(index)" class="cancelorder gopay">立即支付</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</mescroll-uni>
		</view>
		<view v-show="nav_index == 1">
			<mescroll-uni @init="off_mescrollInit" :down="{ auto: false }" @down="off_downCallback" :up="{ auto: false }" @up="off_upCallback" :top="_tabBarHeight + 'px'">
				<view class="offline">
					<view class="list-item" v-for="item in offline_list" :key="item.order_running_id">
						<view class="list-title">
							<text style="color:#000;" class="fl">订单单号：{{ item.order_running_id }}</text>
							<text class="data-time">{{ item.order_datetime }}</text>
						</view>
						<view class="p_listBox">
							<view class="p_list" v-for="subItem in item.prlist" :key="subListItem">
								<view class="name">{{ subItem.product_name }}</view>
								<view class="number">x{{ subItem.sv_p_weight > 0 ? subItem.sv_p_weight : subItem.product_num }}</view>
								<view class="price">{{ subItem.product_unitprice }}</view>
							</view>
						</view>
						<view class="list-footer">
							<view class="fl totalbox">
								<view class="total">
									合计：
									<text>¥</text>
									{{ item.order_money }}
								</view>
							</view>
						</view>
					</view>
				</view>
			</mescroll-uni>
		</view>
	</div>
</template>

<script>
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import dcList from '@/components/list/index.vue';
import dcNavBar from '../../../components/navBar/index.vue';
import dcTabs from '../../../components/tabs/index.vue';
import store from '../../../utils/store.js';
import { setActiveColor, showToastFn, isDeepColor } from '../../../utils/util.js';
import { Pay, Order } from '../../../utils/class.js';
const pay = new Pay();
const order = new Order();

export default {
	data() {
		return {
			nav_index: 0,
			active: 0,
			activeColor: '',
			offline_list: [],
			online_list: [],
			active_temp: 1,
			tabBarHeight: 0
		};
	},
	components: { dcNavBar, uniLoadMore, dcList, dcTabs },
	computed: {
		_tabBarHeight() {
			return this.tabBarHeight + (this.nav_index == 0 ? 52 : 0);
		},
		inactiveColor() {
			return isDeepColor(this.activeColor) ? 'rgba(255,255,255,.8)' : 'rgba(0,0,0,.3)';
		}
	},
	onLoad(options) {
		var state = options.state;
		this.active = state;
		this.active_temp = state;
		this.activeColor = setActiveColor(store.getters.navColor, '#ffffff');
		this.tabBarHeight = store.getters.navHeight;
	},
	methods: {
		mescrollInit(mescroll) {
			this.mescroll = mescroll;
		},
		off_mescrollInit(mescroll) {
			this.off_mescroll = mescroll;
		},
		onLeft() {
			uni.navigateBack();
		},
		onlineChange(e) {
			this.online_list = [];
			this.active_temp = e;
			this.mescroll.resetUpScroll();
		},
		navChange(index) {
			var nav_index = this.nav_index;
			if (nav_index != index) {
				this.nav_index = index;
				if (index == 1 && this.offline_loadState != 2 && this.offline_loadState != 3) {
					//线下订单
					this.off_mescroll.resetUpScroll();
				}
			}
		},
		/**
		 * 获取线上订单
		 */
		onlineOrder(index, _page) {
			var paymentStatus = -1, //-1全部订单, 0待付款, 1已付款
				sv_delivery_status = -1; //-1全部，0等待配送，1配送中，2已完成
			if (index == 0) {
				//全部订单
				paymentStatus = -1;
			} else if (index == 1) {
				paymentStatus = 0;
			} else {
				paymentStatus = 1;
				sv_delivery_status = index == 2 ? 0 : index == 3 ? 1 : 2;
			}
			if (_page == 1) {
				this.online_list = [];
			}
			return order.onlineOrder(_page, paymentStatus, sv_delivery_status).then(res => {
				this.online_list = [...this.online_list, ...res.list];
				return res;
			});
		},
		/**
		 * 获取线下订单
		 * _pageIndex 获取订单的第几页，默认为第一页
		 *
		 */
		offlineOrder(page) {
			return order.offlineOrder(page).then(res => {
				this.offline_list = [...this.offline_list, ...res.list];
				return res;
			});
		},
		onDetails(index) {
			uni.navigateTo({
				url: '../paySuccess/index?orderId=' + this.online_list[index].sv_without_list_id
			});
		},

		off_downCallback(mescroll) {
			mescroll.resetUpScroll();
		},
		off_upCallback(mescroll) {
			this.offlineOrder(mescroll.num)
				.then(res => {
					mescroll.endSuccess(res.list.length, res.state == 2 ? false : true);
				})
				.catch(err => {
					console.log(err);
					mescroll.endErr();
				});
		},
		/*下拉刷新的回调, 有三种处理方式: */
		downCallback(mescroll) {
			mescroll.resetUpScroll();
		},
		/*上拉加载的回调*/
		upCallback(mescroll) {
			this.onlineOrder(this.active_temp, mescroll.num)
				.then(res => {
					console.log(res);
					this.active = this.active_temp;
					mescroll.endSuccess(res.list.length, res.state == 2 ? false : true);
				})
				.catch(err => {
					console.log(err);
					mescroll.endErr();
				});
		},
		deleteWithOrderListById(index) {
			let id = this.online_list[index].sv_without_list_id; //订单id
			order
				.delOrderById(id, this.online_list)
				.then(res => {
					showToastFn('取消成功');
					res && (this.online_list = res);
				})
				.catch(msg => {
					showToastFn('删除失败', 'fail');
					console.log(msg);
				});
		},
		bindPayImmediately: function(index) {
			let orderId = this.online_list[index].sv_without_list_id,
				totalPrice = this.online_list[index].sv_order_actual_money;

			pay.weChatPay(orderId, totalPrice)
				.then(res => {
					this.mescroll.resetUpScroll();
				})
				.catch(msg => {
					console.log(msg);
					showToastFn(msg);
				});
		}
	}
};
</script>

<style lang="less" scoped>
.container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	.tab {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 100%;
		font-size: 30rpx;
		box-sizing: border-box;
		.tab-item {
			border: 1px solid;
			min-width: 125rpx;
			text-align: center;
			font-weight: bold;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 8rpx 20rpx;
			box-sizing: content-box;
			font-size: 28rpx;
		}
		.tab-item:first-child {
			border-top-left-radius: 20rpx;
			border-bottom-left-radius: 20rpx;
		}
		.tab-item:last-child {
			border-top-right-radius: 20rpx;
			border-bottom-right-radius: 20rpx;
		}
		.tab-item:first-child {
			border-right: 0;
		}
	}
	.online,
	.offline {
		width: 100vw;
	}
	.list-item {
		padding: 24rpx 30rpx;
		background-color: #fff;
		margin-bottom: 16rpx;
	}

	.list-item .list-title {
		font-size: 28rpx;
		overflow: hidden;
		padding-bottom: 15rpx;
		border-bottom: 1rpx solid #eaeaea;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.list-title .data-time {
		font-size: 24rpx;
	}

	.list-item .p_listBox {
		padding-top: 20rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #eaeaea;
	}
	.list-item .p_list {
		overflow: hidden;
		display: flex;
	}
	.list-item .p_list .name {
		width: 360rpx;
		min-width: 360rpx;
		font-size: 28rpx;
	}
	.list-item .p_list .price {
		color: #ff5c00;
		width: 150rpx;
		font-size: 28rpx;
		text-align: right;
	}
	.list-item .p_list .price::before {
		content: '¥';
		font-size: 24rpx;
		margin-right: 10rpx;
	}

	.list-item .p_list .number {
		width: 180rpx;
		text-align: center;
		font-size: 28rpx;
	}
	.list-item .list-footer {
		overflow: hidden;
		line-height: 60rpx;
		font-size: 32rpx;
	}
	.list-item .list-footer .totalbox {
		padding-top: 10rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.list-item .list-footer .total {
		font-size: 30rpx;
		color: #f44;
	}
	.list-item .list-footer .btnbox {
		padding-top: 10rpx;
	}
	.list-item .list-footer .cancelorder {
		border-radius: 25rpx;
		border: 1rpx solid #999;
		color: #999;
		padding: 8rpx 16rpx;
		font-size: 26rpx;
	}
	.list-item .list-footer .gopay {
		margin-left: 20rpx;
		border: 1rpx solid orangered;
		color: orangered;
	}
	.deliver-info {
		padding-top: 10rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}
	.deliver-info .title {
		color: black;
	}
	.order-title {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
}
</style>
