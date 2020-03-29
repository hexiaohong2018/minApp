<template>
	<view class="list-content" @click="goTo">
		<view class="left-icon">
			<template v-if="icon">
				<view v-if="leftImg" class="img" :style="{ backgroundImage: 'url(' + leftImg + ')', width: iconSize, height: iconSize }"></view>
				<view v-else class="iconfont-vant" :class="'icon-vant-' + icon" :style="{ fontSize: iconSize }"></view>
			</template>
			<slot v-else name="icon"></slot>
		</view>
		<view class="content">
			<view class="top">
				<view class="title ellipsis-2">{{ title }}</view>
				<view v-if="value" class="value">{{ value }}</view>
				<slot v-else></slot>
			</view>
			<view v-if="label" class="bottom ellipsis">{{ label }}</view>
			<slot v-else name="label"></slot>
			<view v-if="border" class="border"></view>
		</view>
		<view class="right-icon">
			<view v-if="isLink" class="arrow"></view>
			<slot v-else name="right-icon"></slot>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		icon: String,
		title: String,
		value: String,
		url: String,
		isLink: Boolean,
		label: String,
		border: Boolean,
		iconSize: {
			type: String,
			default: '40rpx'
		},
		linkType: {
			type: String,
			default: 'navigateTo'
		}
	},
	computed: {
		leftImg() {
			var reg = /\w+\.(jpg|gif|bmp|png)/;
			return reg.test(this.icon) ? this.icon : '';
		}
	},
	methods: {
		goTo() {
			if (this.url) {
				switch (this.linkType) {
					case 'navigateTo':
						uni.navigateTo({
							url: this.url
						});
						break;
					case 'switchTab':
						uni.switchTab({
							url: this.url
						});
						break;
					case 'reLaunch':
						uni.reLaunch({
							url: this.url
						});
				}
			}
			this.$emit('click')
		}
	}
};
</script>

<style lang="less" scoped>
.list-content {
	width: 100%;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	box-sizing: border-box;
	padding: 24rpx 40rpx 24rpx 24rpx;
	background-color: white;
	font-size: 28rpx;
	overflow: hidden;
	position: relative;
	.left-icon {
		.img {
			background-position: center;
			background-repeat: no-repeat;
			background-size: cover;
		}
	}
	.right-icon {
		.arrow {
			width: 18rpx;
			height: 18rpx;
			border-top: 1px solid #bbb;
			border-right: 1px solid #bbb;
			transform: rotate(45deg);
		}
	}
	.content {
		// width: 80%;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		box-sizing: border-box;
		padding: 0 10rpx 0 20rpx;
		.border {
			position: absolute;
			right: 0;
			bottom: 1rpx;
			height: 2rpx;
			width: calc(100% - 84rpx);
			background-color: #eee;
		}
		.top {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			.title {
				color: #333;
				font-size: 26rpx;
				line-height: 1.3rem;
				box-sizing: border-box;
				padding-right: 40rpx;
			}
			.value {
				color: #999;
				display: flex;
				justify-content: flex-end;
				align-items: center;
			}
		}
		.bottom {
			font-size: 24rpx;
			color: #999;
			margin-top: 8rpx;
			width: 100%;
		}
	}
}
</style>
