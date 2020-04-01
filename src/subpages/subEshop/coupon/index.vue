<template>
	<view class="coupon-content">
		<dc-tabs :active="active" :titles="['待使用', '已使用', '已过期']" @change="onChange" :color="navColor"></dc-tabs>
		<mescroll-uni @init="mescrollInit" :down="downOption" @up="upCallback" @down="downCallback" top="52px" bottom="120rpx">
			<view class="content">
				<dc-template-coupon v-for="item in couponList" :key="item.sv_coupon_id" :coupon="item" :disabled="active" :color="navColor" margin="30rpx">
					<view v-if="active" class="iconfont-dc" :class="{ 'icon-dc-yishiyong': active == 1, 'icon-dc-yiguoqi': active == 2 }"></view>
				</dc-template-coupon>
			</view>
		</mescroll-uni>

		<view class="more" :style="{ background: navColor }" @click="getMore">去领取更多优惠券</view>
	</view>
</template>

<script>
import dcTabs from '../../../components/tabs/index.vue';
import dcTemplateCoupon from '../../../components/template/coupon/index.vue';
import { Coupon } from '../../../utils/class.js';
import { showToastFn, setActiveColor } from '../../../utils/util.js';
import { mapGetters } from 'vuex';

const coupon = new Coupon();

export default {
	data() {
		return {
			active: 0,
			couponList: [],
			downOption: {
				use: true, // 是否启用下拉刷新; 默认true
				auto: true // 是否在初始化完毕之后自动执行下拉刷新的回调; 默认true
			}
		};
	},
	components: {
		dcTabs,
		dcTemplateCoupon
	},
	computed:{
		...mapGetters({
			navColor:setActiveColor('custom/navColor','#f44')
		})
	},
	methods: {
		onChange(index) {
			if (this.active == index) return;
			this.couponList = [];
			this.active = index;
			this.mescroll.resetUpScroll();
		},
		getMore() {
			uni.navigateTo({
				url: '../receiveCoupon/index'
			});
		},
		mescrollInit(mescroll) {
			this.mescroll = mescroll;
		},
		upCallback(mescroll) {
			coupon
				.getCouponList(this.active)
				.then(res => {
					this.couponList = res;
					mescroll.endSuccess(res.length, false);
				})
				.catch(err => {
					console.log(err);
					showToastFn('加载失败');
					mescroll.endErr();
				});
		},
		downCallback(mescroll) {
			this.mescroll.resetUpScroll();
		}
	}
};
</script>

<style lang="less" scoped>
.coupon-content {
	width: 100vw;
	.content {
		width: 100%;
		box-sizing: border-box;
		padding: 0 40rpx 100rpx 40rpx;
		.iconfont-dc {
			font-size: 120rpx;
		}
	}
	.more {
		width: 100vw;
		height: 120rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 32rpx;
		font-weight: bold;
		color: white;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 100;
	}
}
</style>
