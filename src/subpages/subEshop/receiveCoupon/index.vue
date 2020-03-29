<template>
	<view class="receive-container">
		<dc-template-coupon v-for="item in couponList" :key="item.sv_coupon_id" :coupon="item" @click="getCoupon" :recived="true" :color="color"></dc-template-coupon>
	</view>
</template>

<script>
import dcTemplateCoupon from '../../../components/template/coupon/index.vue';
import { Coupon } from '../../../utils/class.js';
import { showToastFn} from '../../../utils/util.js';
import store from '../../../utils/store.js';
const coupon = new Coupon();
export default {
	data() {
		return {
			couponList: [],
			color:''
		};
	},
	components: {
		dcTemplateCoupon
	},
	onLoad() {
		this.color = store.getters.navColor;
		this.getMemberWxCouponRecordList();
	},
	methods: {
		/**
		 * 获取领取的优惠券
		 */
		getMemberWxCouponRecordList() {
			coupon
				.getCouponList(3)
				.then(res => {
					this.couponList = res;
				})
				.catch(msg => {
					this.couponList = [];
					showToastFn('获取优惠券列表失败');
					console.error(res);
				});
		},
		getCoupon(id) {
			coupon
				.getCoupon(id)
				.then(res => {
					showToastFn('领取成功', 'success');
					this.getMemberWxCouponRecordList();
				})
				.catch(msg => {
					showToastFn('领取失败', 'fail');
					console.log(msg);
				});
		}
	}
};
</script>

<style lang="less" scoped>
.receive-container {
	width: 100vw;
	padding: 0 30rpx;
	box-sizing: border-box;
}
</style>
