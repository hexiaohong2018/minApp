<template>
	<view class="integral-contaner">
		<view class="list-ul"><integral-commission-item v-for="(item, index) in integral" :item="item" :key="index" style="width:100%"></integral-commission-item></view>
		<uni-load-more :status="loadStatus == 1 ? 'loading' : 'noMore'"></uni-load-more>
	</view>
</template>

<script>
import integralCommissionItem from '../../../components/template/integral-commission-item/index.vue';
import uniLoadMore from '../../../components/uni-load-more/uni-load-more.vue';
import { Bill } from '../../../utils/class.js';
import { showToastFn } from '../../../utils/util.js';
const bill = new Bill();
export default {
	data() {
		return {
			integral: [],
			loadStatus: 1 //1加载中，2加载完毕，3没数据
		};
	},
	components: { integralCommissionItem, uniLoadMore },
	onLoad() {
		this.getShopUserIntegral(1).catch(msg => {
			showToastFn('获取积分失败', 'fail');
			console.log(msg);
		});
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {
		if (this.loadStatus == 2) return;
		this.getShopUserIntegral().catch(msg => {
			showToastFn('加载积分失败', 'fail');
			console.log(msg);
		});
	},
	onPullDownRefresh() {
		this.integral = [];
		this.getShopUserIntegral(1)
			.then(() => {
				uni.stopPullDownRefresh();
			})
			.catch(msg => {
				showToastFn('加载积分失败', 'fail');
				console.log(msg);
			});
	},
	methods: {
		getShopUserIntegral(page) {
			this.loadStatus = 1;
			return bill.getIntegralRecord(page).then(res => {
				(this.integral = [...this.integral, ...res.list]), (this.loadStatus = res.state);
			});
		}
	}
};
</script>

<style lang="less" scoped>
.integral-contaner {
	width: 100vw;
	.list-ul {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding-left: 20rpx;
		padding-right: 20rpx;
	}
}
</style>
