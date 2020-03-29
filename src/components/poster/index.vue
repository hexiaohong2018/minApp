<template>
	<view class="poster-container">
		<uni-popup ref="popup" type="bottom" @change="onChange" :z-index="zIndex">
			<view class="popup-container">
				<view class="title">
					<text>分享</text>
					<view class="close" @tap="$refs.popup.close()"><view class="iconfont-vant icon-vant-close" :style="{ color: '#666', fontSize: '44rpx' }"></view></view>
				</view>
				<ul>
					<li>
						<view class="iconfont-vant icon-vant-thumb-circle-o"></view>
						好物分享
					</li>
					<li>
						<button open-type="share"></button>
						<view class="iconfont-vant icon-vant-friends-o" :style="{ color: _color }"></view>
						分享给好友
					</li>
					<li @tap="madePoster">
						<view class="iconfont-dc icon-dc-pengyouquan" :style="{ color: _color }"></view>
						生成分享海报
					</li>
				</ul>
				<canvas class="poto" :style="'width:' + canvasWidth + 'px; height:' + canvasHeight + 'px'" canvas-id="shareCanvas"></canvas>
			</view>
		</uni-popup>

		<view class="canvas-container" v-if="showPoster" catchtouchmove="ture">
			<block v-if="tempFilePath">
				<view class="img">
					<image :src="tempFilePath" mode="widthFix" @longpress="onSave"></image>
					<view class="iconfont-vant icon-vant-close .van-icon" @tap="hidePoster"></view>
				</view>
				<view class="tip">长按图片保存到相册</view>
			</block>
			<loading v-else status="loading" :color="color"></loading>
		</view>
	</view>
</template>
<script>
import loading from '../uni-load-more/uni-load-more.vue';
import { promiseAPI, showToastFn,setActiveColor} from '../../utils/util.js';
import { netRequest } from '../../utils/class.js';
// import store from '../../utils/store.js';

import uniPopup from '@/components/uni-popup/uni-popup.vue';

export default {
	data() {
		return {
			tempFilePath: '',
			canvasWidth: 600,
			canvasHeight: 900,
			spaceHeight: 140,
			QRcodeHeight: 120,
			showPoster: false
		};
	},
	components: { loading, uniPopup },
	props: {
		zIndex:{
			type:Number,
			default:1
		},
		show: Boolean,
		color: {
			type: String,
			default: '#f44'
		},
		shareInfo: {
			type: Object,
			default: () => ({
				title: '',
				imageUrl: '',
				path: ''
			})
		},
		round: Boolean
	},
	watch: {
		show: function(newValue, oldValue) {
			newValue ? this.$refs.popup.open() : this.$refs.popup.close();
		}
	},
	computed:{
		_color(){
			return setActiveColor(this.color,"#f44")
		}
	},
	methods: {
		onSave: function() {
			var that = this;
			uni.canvasToTempFilePath(
				{
					canvasId: 'shareCanvas',
					success(res) {
						that.saveImageToPhotosAlbumFun(res.tempFilePath);
					},
					fail: msg => {
						console.log(msg);
					}
				},
				that
			);
		},

		madePoster() {
			this.showPoster = true;
			promiseAPI(uni.getImageInfo, {
				src: this.shareInfo.imageUrl
			})
				.then(res => {
					var QRcodeHeight = this.QRcodeHeight,
						spaceHeight = this.spaceHeight,
						bgWidth = this.canvasWidth,
						bgHeight = this.canvasHeight - spaceHeight,
						title = this.shareInfo.title;
					const ctx = uni.createCanvasContext('shareCanvas', this); //画背景图,居中显示

					var zoom = res.width / bgWidth,
						zoomWidth = bgWidth,
						zoomHeight = Math.floor(res.height / zoom),
						bgHeight = zoomHeight;

					this.canvasHeight = bgHeight + spaceHeight;
					//填充图片背景色
					ctx.setFillStyle('white');
					ctx.fillRect(0, 0, bgWidth, bgHeight + spaceHeight); //填充背景颜色

					ctx.drawImage(res.path.search(/http:\/\/|https:\/\/|wxfile:\/\//) != -1 ? res.path : '../../' + res.path, 0, 0, zoomWidth, zoomHeight); //画背景图
					//画商品名称

					ctx.setFillStyle('black');
					ctx.setFontSize(24);
					var wordStringWidth = ctx.measureText(title).width,
						//20距离右边的边距
						maxWdith = bgWidth - (30 + QRcodeHeight + 20),
						wordWidth = wordStringWidth / title.length;

					if (wordStringWidth > maxWdith) {
						//文字太长截断,填补省略号
						ctx.fillText(title.slice(0, maxWdith / wordWidth - 1) + '...', 30 + QRcodeHeight, bgHeight + spaceHeight / 2 - wordWidth / 2);
					} else {
						ctx.fillText(title, 30 + QRcodeHeight, bgHeight + spaceHeight / 2 - wordWidth / 2);
					} //画去逛逛提示

					ctx.setFillStyle('#666');
					ctx.setFontSize(22);
					ctx.fillText('长按识别·去逛逛', 30 + QRcodeHeight, bgHeight + spaceHeight / 2 + 40 - wordWidth / 2);
					netRequest
						.getUrlCode(this.shareInfo.path)
						.then(res => {
							promiseAPI(uni.getImageInfo, { src: res })
								.then(res => {
									//画二维码
									ctx.drawImage(res.path, 20, bgHeight + (spaceHeight - QRcodeHeight) / 2, QRcodeHeight, QRcodeHeight);
									var that = this;
									ctx.draw(true, function() {
										//最终画图
										uni.canvasToTempFilePath(
											{
												canvasId: 'shareCanvas',
												success(res) {
													that.tempFilePath = res.tempFilePath;
												},
												fail: msg => {
													showToastFn('生成图片失败', 'fail');
													that.showPoster = false;
												}
											},
											that
										);
									});
								})
								.catch(msg => {
									console.log('绘制二维码失败:', msg);
									showToastFn('绘制二维码失败', 'fail');
									this.showPoster = false;
								});
						})
						.catch(msg => {
							console.log('生成二维码失败:', msg);
							showToastFn('生成二维码失败', 'fail');
							this.showPoster = false;
						});
				})
				.catch(msg => {
					console.log('绘制主图失败', msg);
					showToastFn('生成图片失败', 'fail');
					this.showPoster = false;
				});
		},

		hidePoster() {
			this.showPoster = false;
			this.tempFilePath = '';
		},

		saveImageToPhotosAlbumFun(filePath) {
			var that = this;
			uni.saveImageToPhotosAlbum({
				filePath: filePath,
				success: res => {
					showToastFn('保存成功,可到相册查看');
					that.showPoster = false;
					that.tempFilePath = '';
				},
				fail: msg => {
					uni.getSetting({
						success: function(res) {
							var statu = res.authSetting;
							if (!statu['scope.writePhotosAlbum']) {
								uni.showModal({
									title: '设置权限',
									content: '需要获取保存图片到相册的权限',
									success: function(tip) {
										if (tip.confirm) {
											uni.openSetting({
												success: function(data) {
													if (data.authSetting['scope.writePhotosAlbum'] === true) {
														showToastFn('授权成功'); //授权成功之后，再调用uni.saveImageToPhotosAlbum

														uni.saveImageToPhotosAlbum({
															filePath: filePath,
															success: res => {
																showToastFn('保存成功,可到相册查看');
																that.showPoster = false;
																that.tempFilePath = '';
															}
														});
													} else {
														showToastFn('授权失败');
														failCallBack && failCallBack(data);
													}
												}
											});
										}
									}
								});
							}
						},
						fail: function(res) {
							showToastFn('调用授权窗口失败', 'fail');
							failCallBack && failCallBack(res);
						}
					});
				}
			});
		},
		onChange(e){
			this.$emit(e.show?'open':'close');
		}
	}
};
</script>
<style lang="less" scoped>
@import '../../iconfont.css';

.popup-container {
	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	overflow: hidden;
	z-index: 99;
	position: relative;
	background: white;
	border-radius: 10rpx 10rpx 0 0;
	ul {
		width: 100%;
		height: 200rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-sizing: border-box;
		li {
			width: 33%;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 24rpx;
			color: #666;
			position: relative;
			button {
				position: absolute;
				left: 0;
				top: 0;
				right: 0;
				bottom: 0;
				background: transparent;
				z-index: 1;
			}
			button::after {
				border: 0;
			}
			.iconfont-vant,.iconfont-dc {
				font-size: 50rpx;
				margin-bottom: 5px;
			}
		}
		li:first-child::after {
			content: '';
			width: 30rpx;
			height: 30rpx;
			position: absolute;
			right: -15rpx;
			top: calc(50% - 15rpx);
			transform: rotate(45deg);
			border-top: 1px solid #eee;
			border-right: 1px solid #eee;
			background: #eee;
		}
		li:first-child {
			background: #eee;
		}
		li:last-child:after {
			content: '';
			width: 1px;
			height: 100rpx;
			background: #eee;
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
		}
	}
	.poto {
		transform: translateX(150%);
		position: absolute;
		top: 0;
		left: 0;
	}
	.title {
		width: 100%;
		height: 80rpx;
		padding-left: 20rpx;
		font-size: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		border-bottom: 1px solid #eee;
		.close {
			width: 80rpx;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
}

.canvas-container {
	width: 100vw;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 1000;
	background: rgba(0, 0, 0, 0.5);
	.img {
		width: 95%;
		position: relative;
		image {
			width: 100%;
			border-radius: 16rpx;
		}
		.van-icon {
			background: rgba(0, 0, 0, 0.3);
			color: white;
			font-size: 60rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			right: 15rpx;
			bottom: 15rpx;
			z-index: 2;
			border-radius: 50%;
			box-shadow: 0px 0px 2rpx 2rpx rgba(0, 0, 0, 0.3);
		}
	}

	.tip {
		color: white;
		font-size: 30rpx;
		padding: 5rpx;
	}
}
</style>
