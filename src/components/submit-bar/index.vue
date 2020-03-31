<template>
	<view class="submit-bar" :class="{ shadow: border, safe: isIphoneX }" :style="{ zIndex: zIndex }">
		<view class="other"><slot></slot></view>
		<view class="label">{{ label }}</view>
		<view class="price">{{ _price }}</view>
		<view class="btn" @click="$emit('click')">{{ buttonText }}</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isIphoneX: false
		};
	},
	props: {
		price: {
			type: [String | Number],
			default: 0
		},
		buttonText: String,
		label: {
			type: String,
			default: '合计:'
		},
		zIndex: {
			type: [String | Number],
			default: 1
		},
		border: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		_price() {
			if (this.price > 1 && this.price % 1) {
				return this.price.toFixed(2);
			} else {
				return this.price > 0 ? this.price : 0;
			}
		}
	},
	created() {
		this.isIphoneX = this.$store.getters['systemInfo/systemInfo'].isIphoneX
	}
};
</script>

<style lang="less" scoped>
.shadow {
	box-shadow: 0 -1px 1rpx 1rpx #eee;
}
.safe {
	padding-bottom: 30px;
}
.submit-bar {
	width: calc(100vw - 40rpx);
	height: 110rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	padding-left: 20rpx;
	padding-right: 20rpx;
	background-color: white;
	color: #666;
	font-weight: 600;
	font-size: 30rpx;
	box-sizing: content-box;
	.btn {
		height: 80rpx;
		border-radius: 80rpx;
		min-width: 200rpx;
		background-image: linear-gradient(45deg, rgb(255, 96, 52), rgb(238, 10, 36));
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-size: 28rpx;
	}
	.btn:active {
		opacity: var(--active-opacity);
	}
	.btn::after {
		border: 0;
	}
	.price {
		padding: 0 16rpx 0 40rpx;
		color: #f44;
		position: relative;
	}
	.price:before {
		content: '¥';
		position: absolute;
		left: 20rpx;
		top: 50%;
		transform: translateY(-50%);
		font-size: 26rpx;
	}
	.other {
		// width: 43%;
		flex: 1;
		height: 100%;
		color: #999;
		font-weight: 500;
		font-size: 26rpx;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		box-sizing: border-box;
		padding: 4rpx;
	}
}
</style>
