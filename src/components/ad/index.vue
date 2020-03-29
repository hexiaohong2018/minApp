<template>
	<view class="ad-container" :style="'height:' + height + 'px;background:' + background + ';'">
		<swiper
			:autoplay="autoplay"
			indicator-active-color="#fff"
			indicator-color="rgba(255,255,255,0.3)"
			circular="true"
			:indicator-dots="indicator"
			:skip-hidden-item-layout="skipHiddenItem"
		>
			<swiper-item v-for="(item, index) in images" :key="index">
				<view class="des" v-if="item.des">{{ item.des }}</view>
				<image class="img" :class="{ round: round }" :src="item.img" mode="widthFix" @tap="onbindTab" :data-index="index" @load="imageLoad"></image>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
import { phoneInfo } from '../../utils/util.js';
export default {
	data() {
		return {
			height: 375,
			indicator: false
		};
	},
	props: {
		images: Array,
		autoplay: {
			type: Boolean,
			default: true
		},
		background: {
			type: String,
			default: 'white'
		},
		minHeight: Boolean,
		skipHiddenItem: Boolean,
		round: Boolean
	},
	created: function() {
		this.imageCount = 0; //临时变量
		this.tempHeight = 0; //临时变量
		phoneInfo().then(res => {
			this.phone_width = res.screenWidth; //临时变量
		});
	},
	methods: {
		onbindTab: function(e) {
			var index = e.currentTarget.dataset.index,
				image = this.images[index];
			
			if ('link' in image) {
				this.$store.commit('mapPath/setMapPath')
				const mapPath = this.$store.getters['mapPath/mapPath']
				var link = image.link,
				params = link.Params,
					target = target = params
						? `${mapPath[link.target]}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`
						: mapPath[link.target];
					
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
		},
		imageLoad: function(e) {
			var zoom = this.phone_width / e.detail.width,
				imageHeight = Math.ceil(e.detail.height * zoom);
				
			this.imageCount++; //获取图片中高度最高的高度

			if (imageHeight > this.tempHeight) {
				this.tempHeight = this.minHeight && imageHeight < 375 ? 375 : imageHeight;
			} //最后一张时，设置容器高度

			if (this.imageCount == this.images.length && this.height != this.tempHeight) {
				this.height = this.tempHeight;
			}
		}
	},
	watch: {
		images: function(newValue) {
			this.indicator = newValue.length > 1 ? true : false;
		}
	}
};
</script>
<style scoped lang="less">
.ad-container {
	width: 100vw;
	box-sizing: border-box;
	swiper {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		swiper-item {
			height: 100%;
			width: 100%;
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			.des {
				position: absolute;
				width: 100%;
				height: 50rpx;
				background-color: rgba(0, 0, 0, 0.3);
				color: white;
				bottom: 0;
				left: 0;
				font-size: 26rpx;
				line-height: 50rpx;
				padding-left: 20rpx;
				padding-right: 20rpx;
			}
			.img {
				height: 100%;
				width: 100%;
			}
			.round {
				border-radius: 20rpx;
			}
		}
	}
}
</style>
