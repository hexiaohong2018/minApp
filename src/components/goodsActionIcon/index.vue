<template>
	<button class="icon" :open-type="openType" 
	@click="$emit('click', $event)" :style="{ color: color }">
		<view class="iconfont-vant" :class="'icon-vant-' + icon"></view>
		<view class="text">{{ text }}</view>
		<view v-if="info" class="info">{{ info }}</view>
	</button>
</template>

<script>
export default {
	props: {
		icon: String,
		text: String,
		openType: String,
		color: {
			type: String,
			default: '#666'
		},
		info:Number
	}
};
</script>

<style lang="less" scoped>
.icon {
	height: 90rpx;
	width: 90rpx;
	box-sizing: border-box;
	float: left;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 4rpx;
	background-color: transparent;
	position: relative;
	.iconfont-vant {
		font-size: 42rpx;
		box-sizing: border-box;
		height: 60%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.text {
		height: 30%;
		font-size: 24rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.info {
		position: absolute;
		font-size: 22rpx;
		background-color: #f44;
		color: white;
		right: 0rpx;
		height: 34rpx;
		line-height: 34rpx;
		top: 4rpx;
		max-width: 50rpx;
		box-sizing: border-box;
		border-radius: 20rpx;
		border: 1px solid white;
		box-shadow: 0 0 1px 1px #eee;
		padding: 0 4rpx;
		min-width: 34rpx;
	}
}
.icon:after {
	border: 0;
}
.icon:active {
	opacity: var(--active-opacity);
}
</style>
