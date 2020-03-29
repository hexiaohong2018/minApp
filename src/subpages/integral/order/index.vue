<template>
	<div class="container">
		<ul class="orders">
			<li class="order" v-for="(order, Index) in orders" :key="order.sv_integral_pexchange_no" :data-id="order.sv_integral_pexchange_no" @click="checkOrder">
				<div class="status">
					<div class="munber">订单号：{{ order.sv_integral_pexchange_no }}</div>
					<div :class="{ s: order.sv_integral_pexchangeno_state == 0, sd: order.sv_integral_pexchangeno_state == 1, sf: order.sv_integral_pexchangeno_state == 2 }">
						{{ order.sv_integral_pexchangeno_sname }}
					</div>
				</div>
				<div class="list">
					<dc-list
						v-for="(product, index) in order.exchangedetaillist"
						:key="product.product_id"
						:title="product.sv_p_name"
						:label="`×${product.sv_pchangenumber}`"
						:icon="product.sv_p_images2"
						icon-size="100rpx"
					>
						<text>积分{{ product.sv_p_integral }}</text>
					</dc-list>
				</div>
				<div class="foot">
					<div class="date">{{ order.sv_creation_date }}</div>
					<div class="total">
						共{{ order.no_product_num }}件商品，合计：
						<text>{{ order.no_integralexchange_count }}</text>
						积分
					</div>
				</div>
			</li>
		</ul>
		<uni-load-more :status="loadStatus ? 'loading' : 'noMore'"></uni-load-more>
	</div>
</template>

<script>
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import dcList from '@/components/list/index.vue'
import { showToastFn } from '../../../utils/util.js';
import { Integral } from '../../../utils/class.js';
const integral = new Integral();

export default {
	data() {
		return {
			loadStatus: true,
			orders: []
		};
	},
	components: { uniLoadMore,dcList},
	onLoad() {
		this._getOrderList();
	},
	onPullDownRefresh() {
		this._getOrderList().then(res => {
			showToastFn('刷新成功');
			uni.stopPullDownRefresh();
		});
	},
	onReachBottom() {
		if (!this.loadStatus) return;
		integral
			.getOrderList()
			.then(res => {
				this.orders = [...this.orders, ...res.list];
				this.loadStatus = res.isAll ? false : true;
			})
			.catch(msg => {
				console.log(msg);
				showToastFn('获取订单失败');
			});
	},
	methods: {
		_getOrderList() {
			this.loadStatus = false;
			return integral
				.getOrderList(1)
				.then(res => {
					this.orders = res.list;
					this.loadStatus = res.isAll ? false : true;
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('获取订单失败');
				});
		},
		checkOrder(e) {
			uni.navigateTo({
				url: '../../subIntegral/orderInfo/index?id=' + e.currentTarget.dataset.id
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
	.orders {
		width: 100vw;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0px 20rpx;
		box-sizing: border-box;
		background: white;
		margin-bottom: 40rpx;
		.order {
			width: 100%;
			border-bottom: 1px solid #eee;
			.status,
			.foot {
				width: 100%;
				display: flex;
				padding: 28rpx 0rpx;
				justify-content: space-between;
				font-size: 28rpx;
			}
			.status {
				.s {
					color: #db212e;
				}
				.sd {
					color: #f67717;
				}
				.sf {
					color: #2ca657;
				}
			}
			.foot {
				font-size: 26rpx;
				.total {
					text {
						color: #f67717;
					}
				}
			}
			.list {
				width: 100%;
				text {
					color: #f67717;
				}
			}
		}
		.order:last-child {
			border-bottom: 0;
		}
	}
}
</style>
