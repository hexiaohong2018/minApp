<template>
	<view class="order" v-show="show">
		<dc-tabs :active="activeIndex" :titles="tabsList" @change="handleTabsChange" :color="_color"></dc-tabs>

		<view v-show="activeIndex === 0">
			<mescroll-uni
				@init="employeeMescrollInit"
				:top="navHeight + 'px'"
				:bottom="tabBarHeight + 'px'"
				@up="employeeUpCallBack"
				@down="employeeDownCallBack"
				:down="{ auto: false }"
				:up="{ auto: false }"
			>
				<view class="tech min-flex min-flex-main-between" v-for="item in employees" :key="item.sv_technician_id">
					<view class="min-flex">
						<image mode="aspectFit" :src="item.sv_technician_photo" @click="showUser(item.sv_technician_id)"></image>
						<view style="margin-left: 16rpx;">
							<view class="name">{{ item.sv_technician_name }}</view>
							<view class="grade">{{ item.sp_grouping_name }}</view>
							<view class="no" :style="{ color: _color }">NO:{{ item.sv_technician_id }}</view>
						</view>
					</view>
					<view>
						<view class="op" :style="{ background: _color }" @click="onSubmit(item)">预约</view>
						<view class="count" :style="{ color: _color }">已被约{{ item.sv_reservation_number }}次</view>
					</view>
				</view>
			</mescroll-uni>
		</view>
		<view v-show="activeIndex === 1">
			<mescroll-uni
				@init="orderMescrollInit"
				:top="navHeight + 'px'"
				:bottom="tabBarHeight + 'px'"
				@up="orderUpCallBack"
				@down="orderDownCallBack"
				:down="{ auto: false }"
				:up="{ auto: false }"
			>
				<view class="p-item min-flex min-flex-main-between" v-for="item in orders" :key="item.product_id">
					<view class="min-flex">
						<image class="img" :src="item.sv_p_images2" mode="aspectFill" @click="showOrder(item.product_id)"></image>
						<view class="dec min-flex min-flex-dir-top min-flex-main-between">
							<view>{{ item.sv_p_name }}</view>
							<view :style="{ color: _color }">{{ item.sv_p_memberprice }}</view>
						</view>
					</view>
					<view class="min-flex min-flex-dir-top min-flex-main-between" style="height: 120rpx;">
						<view></view>
						<view class="op" :style="{ background: color }" @click="handleOrder(item)">预约</view>
					</view>
				</view>
			</mescroll-uni>
		</view>
	</view>
</template>

<script>
import dcTabs from '../../../components/tabs/index.vue';
import { BookService } from '../../../utils/class';
import { setActiveColor } from '../../../utils/util';
import { mapMutations, mapGetters } from 'vuex';
const bookService = new BookService();
export default {
	name: 'order',
	props: {
		show: {
			default: false,
			type: Boolean
		},
		color: String
	},
	components: {
		dcTabs
	},
	data() {
		return {
			tabsList: ['技师', '项目'],
			employees: [],
			orders: [],
			navHeight: 0,
			tabBarHeight: 0
		};
	},
	computed: {
		...mapGetters({
			activeIndex: 'index/orderTabsIndex'
		}),
		_color() {
			return setActiveColor(this.color, '#f44');
		}
	},
	watch: {
		activeIndex(newVal) {
			if (newVal == 0) {
				this.employeeMescroll.resetUpScroll();
			} else {
				this.orderMescroll.resetUpScroll();
			}
		},
		show(newVal) {
			newVal && this.onLoad();
		}
	},
	created() {
		this.onLoad = (function() {
			var is_first_run = true;
			return function() {
				if (is_first_run) {
					this.navHeight = this.$store.getters['systemInfo/systemInfo'].navHeight + 52;
					this.tabBarHeight = this.$store.getters['systemInfo/systemInfo'].tabBarHeight;
					this.employeeMescroll.resetUpScroll();
					is_first_run = false;
				}
			};
		})();
	},
	methods: {
		employeeMescrollInit(mescroll) {
			
			this.employeeMescroll = mescroll;
		},
		orderMescrollInit(mescroll) {
			
			this.orderMescroll = mescroll;
		},
		employeeUpCallBack(mescroll) {
			bookService.getEmployees({ pageIndex: mescroll.num }).then(res => {
				if (mescroll.num == 1) {
					this.employees = [];
				}
				this.employees = [...this.employees, ...res.list];
				mescroll.endSuccess(res.list.length, !res.isAll);
			});
		},
		employeeDownCallBack(mescroll) {
			this.$parent.getUiConfig();
			mescroll.resetUpScroll();
		},

		orderUpCallBack(mescroll) {
			bookService.getServices({ pageIndex: mescroll.num }).then(res => {
				if (mescroll.num == 1) {
					this.orders = [];
				}
				this.orders = [...this.orders, ...res.list];
				mescroll.endSuccess(res.list.length, !res.isAll);
			});
		},
		orderDownCallBack(mescroll) {
			this.$parent.getUiConfig();
			mescroll.resetUpScroll();
		},

		...mapMutations({
			getProduct: 'product/setProduct',
			setOrderTabsIndex: 'index/setOrderTabsIndex'
		}),
		handleTabsChange(index) {
			this.setOrderTabsIndex(index);
		},
		showUser(id) {
			this.$minRouter.push({
				name: 'eshop/subpages/userDisplay',
				params: { id }
			});
		},
		showOrder(id) {
			bookService.getServiceInfo(id, '加载中').then(res => {
				this.getProduct(res);
			});
			this.$minRouter.push({
				name: 'eshop/subpages/productDisplay',
				params: { id }
			});
		},
		onSubmit(employee) {
			this.$store.commit('reservation/setEmployee', employee);
			this.$minRouter.push({
				name: 'eshop/subpages/todoTime'
			});
		},
		handleOrder(order) {
			this.$store.commit('reservation/setOrder', order);
			this.$minRouter.push({
				name: 'eshop/subpages/todoTime'
			});
		}
	}
};
</script>
<style>
.mescroll-uni-fixed {
	background-color: #f8f8f8;
}
</style>
<style lang="scss" scoped>
.tech {
	height: 180rpx;
	font-size: 28rpx;
	color: #666;
	background: #ffffff;
	margin: 30rpx 20rpx;
	padding: 0 20rpx;
	border-radius: 20rpx;
	image {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		box-shadow: 0 0 2rpx 2rpx #eee;
	}
	.name,
	.grade,
	.no {
		font-size: 24rpx;
	}
	.op {
		width: 120rpx;
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
		border-radius: 20rpx;
		color: white;
	}
	.count {
		font-size: 24rpx;
		padding: 10rpx;
	}
}

// .item {
// 	background: #ffffff;
// 	margin: 24rpx;
// 	border-radius: 4px;
// 	font-size: 28rpx;
// 	color: #666666;
// 	.reservation {
// 		padding: 36rpx;
// 		height: 96rpx;
// 	}
// 	.tips {
// 		color: #3BC475;
// 	}
// 	.grap {
// 		color: #999999;
// 	}
// 	.info {
// 		padding: 36rpx;
// 		height: 160rpx;
// 	}
// 	.img {
// 		width: 100rpx;
// 		height: 100rpx;
// 	}
// 	.date {
// 		padding: 36rpx;
// 		height: 96rpx;
// 	}
// 	.btn {
// 		margin: 0;
// 		font-size: 28rpx;
// 		color: #666666;
// 	}
// }

.yuyue {
	background: #ffffff;
	padding: 24rpx;
	height: 180rpx;
	margin: 24rpx;
	border-radius: 4px;
	font-size: 22rpx;
	.img {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		box-shadow: 0 0 2rpx 2rpx #eee;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.dec {
		padding-left: 20rpx;
		flex-grow: 1;
		font-size: 24rpx;
	}
	.op {
		width: 120rpx;
		background: #f44;
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
		border-radius: 20rpx;
		color: white;
	}
}
.p-item {
	padding-right: 24rpx;
	background: #ffffff;
	height: 180rpx;
	margin: 24rpx;
	border-radius: 4px;
	.img {
		width: 180rpx;
		height: 180rpx;
		border-radius: 4px 0 0 4px;
	}
	.dec {
		height: 120rpx;
		padding-left: 20rpx;
		flex-grow: 1;
		font-size: 24rpx;
	}
	.op {
		width: 120rpx;
		background: #f34289;
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
		border-radius: 20rpx;
		color: white;
		font-size: 22rpx;
	}
}
.pl-item {
	margin: 24rpx;
	background: #ffffff;
	width: 310rpx;
	font-size: 24rpx;
	border-radius: 4px;
	.img {
		border-radius: 4px 4px 0 0;
		width: 310rpx;
		height: 310rpx;
	}
	.op {
		width: 120rpx;
		background: #f34289;
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
		border-radius: 20rpx;
		color: white;
		font-size: 22rpx;
	}
}
</style>
