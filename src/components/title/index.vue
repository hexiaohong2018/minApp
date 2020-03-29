<template>
	<view class="title-container" @tap.native.stop="onclick" :style="'background:' + background + ';color:' + color">
		<image v-if="src" class="img" :src="src" mode="aspectFit"></image>
		<view class="title" :style="'text-align:' + position + ';'">
			<view class="main">{{ title }}</view>
			<view class="sub" v-if="subTitle">{{ subTitle }}</view>
		</view>
		<view class="right" v-if="link"><view class="arrow" :style="'border-color:' + color"></view></view>
	</view>
</template>
<script>
export default {
	props: {
		background: {
			type: String,
			default: 'white'
		},
		color: {
			type: String,
			default: '#333'
		},
		src: String,
		title: String,
		subTitle: String,
		link: Object,
		position: {
			type: String,
			default: 'center'
		}
	},
	methods: {
		onclick: function(e) {
			var link = this.link;
			if (!link) return;
			this.$store.commit('mapPath/setMapPath');
			const mapPath = this.$store.getters['mapPath/mapPath'];

			var params = link.Params,
				target = (target = params
					? `${mapPath[link.target]}?${Object.keys(params)
							.map(key => `${key}=${params[key]}`)
							.join('&')}`
					: mapPath[link.target]);
			if (target) {
				uni.navigateTo({
					url: target,
					success: function(res) {},
					fail: function(res) {
						uni.switchTab({
							url: target
						});
					}
				});
			}
		}
	}
};
</script>
<style lang="less" scoped>
@import '../customUI.css';
.title-container {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	background: white;
	box-sizing: border-box;
	position: relative;
	padding: 14rpx 35rpx;
	width: 100vw;
	.title {
		font-size: var(--title_fontSize);
		flex-grow: 1;
		line-height: 1.2em;
		width: 100%;
		.main {
			font-weight: bold;
			width: 100%;
		}
		.sub {
			font-size: var(--sub_title_fontSize);
			padding-top: 8rpx;
			width: 100%;
		}
	}
	.arrow {
		border-top: 1px solid;
		border-right: 1px solid;
		width: 15rpx;
		height: 15rpx;
		transform: rotate(45deg);
	}
	.img {
		width: 32rpx;
		height: 32rpx;
	}
	.right {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-left: 25rpx;
		padding-top: 25rpx;
		padding-bottom: 25rpx;
		right: 38rpx;
		top: 50%;
		transform: translateY(-50%);
	}
}
</style>
