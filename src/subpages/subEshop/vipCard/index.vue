<template>
	<view class="card-content">
		<view class="card">
			<image class="bg" src="/static/card_bg.png" mode="aspectFit"></image>
			<view class="shop-info">
				<image v-if="shopInfo.sv_user_logo" class="head-img" mode="aspectFit" :src="shopInfo.sv_user_logo"></image>
				<view class="name">{{ shopInfo.shop_name || '' }}</view>
			</view>
			<view class="member-id">{{ memberCardInfo.sv_mr_cardno }}</view>
			<view class="bar-icon" @tap="showBarCode"><view class="iconfont-vant icon-vant-qr" style="font-size: 50rpx"></view></view>
		</view>
		<canvas v-if="showBarcode" class="bar" canvas-id="barcode"></canvas>
	</view>
</template>

<script>
import wxbarcode from 'wxbarcode';
import { mapGetters } from 'vuex';
export default {
	data() {
		return {
			showBarcode: false
		};
	},
	computed: {
		...mapGetters({
			memberCardInfo: 'loginInfo/memberCardInfo',
			shopInfo: 'loginInfo/shopInfo'
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	methods: {
		showBarCode() {
			this.showBarcode = true;
			wxbarcode.barcode('barcode', this.memberCardInfo.sv_mr_cardno, 610, 100);
		}
	}
};
</script>
<style lang="less" scoped>
.card-content {
	width: 100vw;
	padding: 60rpx;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	height: 100vh;
	background: white;
}
.card-content .card {
	position: relative;
	width: 100%;
	height: 380rpx;
	overflow: hidden;
	box-sizing: border-box;
}
.card-content .card .bg {
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 0;
}
.card-content .card .shop-info {
	position: absolute;
	z-index: 99;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	padding: 20rpx;
	width: 70%;
	height: 30%;
	left: 30rpx;
	top: 10rpx;
}
.card-content .card .shop-info .head-img {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	border: 2px solid white;
	box-shadow: 0 0 8rpx 3rpx rgba(0, 0, 0, 0.3);
}
.card-content .card .shop-info .name {
	color: white;
	text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
	margin-left: 20rpx;
}
.card-content .card .member-id {
	position: absolute;
	bottom: 37rpx;
	left: 40rpx;
	color: white;
	text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
}

.bar {
	margin-top: 50rpx;
}

.bar-icon {
	position: absolute;
	right: 50rpx;
	top: 50rpx;
	color: rgba(255, 255, 255, 0.8);
}
</style>
