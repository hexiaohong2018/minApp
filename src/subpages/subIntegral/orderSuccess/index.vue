<template>
	<div class="success">
		<div class="iconfont-vant icon-vant-checked" :style="{ fontSize: '280rpx', color: '#2FB219' }"></div>
		<div class="text">兑换成功</div>
		<button class="btn" :data-id="orderId" @click="checkOrder">查看详情</button>
		<button class="btn" @click="goHome">返回首页</button>
	</div>
</template>

<script>
export default {
	data() {
		return {
			orderId: '',
			color: '#FF852A'
		};
	},
	onLoad(options) {
		this.orderId = options.id;
	},
	methods: {
		checkOrder(e) {
			uni.navigateTo({
				url: '../orderInfo/index?id=' + e.currentTarget.dataset.id
			});
		},
		goHome() {
			uni.switchTab({
				url: '../../../pages/integral/index'
			});
		}
	}
};
</script>

<style lang="less" scoped>
.success {
	width: 100vw;
	height: 900rpx;
	padding: 50rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	.text {
		padding: 100rpx;
		color: #666;
		font-size: 40rpx;
	}
	.btn {
		width: 80%;
		color: white;
		background: #db212e;
	}
	.btn:after {
		border: 1px solid #db212e;
	}
	.btn:last-child {
		color: #db212e;
		background: white;
		margin-top: 30rpx;
	}
}
</style>
