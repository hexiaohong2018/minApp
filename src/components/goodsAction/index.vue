<template>
	<view class="goodsAction" :class="{ safe: iphoneX, shadow: border }" :style="{ zIndex: zIndex }">
		<view class="icons"><slot name="icons"></slot></view>
		<view class="btns"><slot name="btns"></slot></view>
	</view>
</template>

<script>
export default {
	props: {
		border: {
			type: Boolean,
			default: true
		},
		zIndex: {
			type: [String | Number],
			default: 1
		}
	},
	data() {
		return {
			iphoneX: false
		};
	},
	created() {
		
		
			this.iphoneX = this.$store.getters['systemInfo/systemInfo'].isIphoneX;
	}
};
</script>

<style lang="less" scoped>
.safe {
	padding-bottom: 30px;
}
.shadow {
	box-shadow: 0 -1px 1rpx 1rpx #eee;
}
.goodsAction {
	height: 110rpx;
	width: 100vw;
	background-color: white;
	position: fixed;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-sizing: content-box;
	.icons {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.btns {
		display: flex;
		height: 85rpx;
		border-radius: 50rpx;
		min-width: 30%;
		max-width: 70%;
		margin: 0rpx 20rpx;
		overflow: hidden;
		flex: 1;
	}
}
</style>
