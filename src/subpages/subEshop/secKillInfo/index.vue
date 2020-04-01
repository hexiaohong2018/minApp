<template>
	<view>
		<dc-nav-bar title="商品详情" arrow :background="navBarBackground"></dc-nav-bar>

		<button class="reg-btn" v-if="!memberInfo.member_id" open-type="getUserInfo" lang="zh_CN" @getuserinfo="onGetUserInfo"></button>

		<dc-ad :images="product.sv_p_images"></dc-ad>
		<view class="seckill-info">
			<view class="price">
				<view class="count">
					<view class="seckill-price">{{ product.sv_assemble_cdetail_gprice }}</view>
					<view class="original-price">{{ product.sv_p_unitprice }}</view>
					<view class="limit" v-if="product.sv_assemble_limit_buynum == 0">限购数量:{{ product.sv_assemble_cdetail_buynum }}</view>
				</view>
				<view class="has-buy">累计已抢数量：{{ product.sv_assemble_cdetail_abuynum }}</view>
			</view>
			<view class="time">
				<view class="clock">
					<view class="iconfont-vant icon-vant-clock-o"></view>
					<text>限时秒杀</text>
				</view>
				<view class="start" v-if="start == 0 || start == 2">{{ start == 2 ? '秒杀结算' : '即将开抢' }}</view>
				<view class="timer" v-else>
					<text class="h">{{ hTime }}</text>
					:
					<text class="m">{{ mTime }}</text>
					:
					<text class="s">{{ sTime }}</text>
				</view>
			</view>
		</view>
		<view class="des-container">
			<view class="des ellipsis-2">{{ product.sv_p_remark || product.sv_p_name }}</view>
			<view class="share" @tap="onShare"><view class="iconfont-vant icon-vant-share" :style="{ fontSize: '50rpx', color: 'red' }"></view></view>
		</view>

		<!-- 商品详情 -->
		<view class="info1">
			<view class="title">商品详情</view>
			<rich-text v-if="product.sv_move_p_details" :nodes="product.sv_move_p_details"></rich-text>
			<view class="no-info" v-else>暂无商品详情信息</view>
		</view>

		<dc-goods-action z-index="999">
			<template v-slot:icons>
				<dc-goods-action-icon icon="home-o" text="首页" @click="goHome"></dc-goods-action-icon>
				<dc-goods-action-icon icon="ellipsis" text="更多" @click="more"></dc-goods-action-icon>
				<dc-goods-action-icon icon="chat-o" open-type="contact" text="客服"></dc-goods-action-icon>
			</template>
			<template v-slot:btns>
				<view
					class="commit"
					@click="
						onSecKill(start, {
							id: product.sv_assemble_cdetail_pid,
							cid: product.sv_assemble_config_id,
							sv_is_newspec: product.sv_is_newspec
						})
					"
				>
					{{ start == 2 ? '已结束' : start == 1 ? '马上抢' : '未开始' }}
				</view>
			</template>
		</dc-goods-action>

		<product-feature
			z-index="1000"
			:product-id="productId"
			:config-id="product.sv_assemble_config_id"
			buy-state="2"
			@comfirm="onComfrim"
			@close="closeFeature"
		></product-feature>

		<!-- 分享 -->
		<dc-poster z-index="1000" :share-info="shareInfo" :show="showPoseter" :color="navColor"></dc-poster>
	</view>
</template>

<script>
import { Seckill, User } from '../../../utils/class.js';
import { decodeWXCodeParams, formatDuring, showToastFn } from '../../../utils/util.js';
const seckill = new Seckill();
const user = new User();

import dcAd from '../../../components/ad/index.vue';
import productFeature from '../../../components/productFeature/index.vue';
import dcPoster from '../../../components/poster/index.vue';
import dcNavBar from '../../../components/navBar/index.vue';
import dcGoodsAction from '../../../components/goodsAction/index.vue';
import dcGoodsActionIcon from '../../../components/goodsActionIcon/index.vue';
import dcGoodsActionBtn from '../../../components/goodsActionButton/index.vue';
import { debounce } from '../../../utils/common.js';
import {mapGetters} from 'vuex';
export default {
	data() {
		return {
			product: {},
			start: 0, //即将开抢,1秒杀计时,2秒杀结束
			timer: null,
			hTime: '00',
			mTime: '00',
			sTime: '00',
			formId: 0,
			showPoseter: false,
			shareInfo: {},
			productId: '',
			configId: '',
			navBarBackground: 'transparent',
			menuHeight: 0
		};
	},

	components: {
		dcAd,
		productFeature,
		dcPoster,
		dcNavBar,
		dcGoodsAction,
		dcGoodsActionIcon,
		dcGoodsActionBtn
	},
	computed:{
		...mapGetters({
			systemInfo:'systemInfo/systemInfo',
			memberInfo:'loginInfo/memberInfo',
			navColor:'custom/navColor'
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var params = decodeWXCodeParams(options); //解析参数
		this.menuHeight = this.systemInfo.navHeight;
		this.debounce = debounce(
			e => {
				if (e.scrollTop > this.menuHeight) {
					this.navBarBackground = this.navColor;
				} else {
					this.navBarBackground = 'transparent';
				}
			},
			600,
			false
		);

		if (params.s) {
			user.login().then(res => {
				let loginInfo = res;
				this.getProductInfoFun(params.seckillId, params.id);
			});
		} else {
			this.getProductInfoFun(params.seckillId, params.id);
		}
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {
		this.timer && clearInterval(this.timer);
	},
	onShareAppMessage: function(res) {
		return this.shareInfo;
	},
	onPageScroll(e) {
		this.debounce(e);
	},
	methods: {
		closeFeature() {
			this.productId = 0;
		},
		getProductInfoFun(sid, id) {
			seckill
				.getProductInfo(sid, id)
				.then(res => {
					this.product = res;
					this.shareInfo = {
						title: res.sv_p_remark || res.sv_p_name,
						imageUrl: res.sv_p_images2,
						path: '/subPages/secKillDisplay/index?seckillId=' + sid + '&id=' + id + '&s=1' //pmid商品ID
					};

					if (res.sv_assemble_config_ndate > res.sv_assemble_config_sdate) {
						this.setTime(res.mms);
					}
				})
				.catch(msg => {
					showToastFn('获取秒杀商品信息失败');
					console.log(msg);
				});
		},

		more() {
			uni.navigateTo({
				url: '../seckill/index'
			});
		},

		setTime(mms) {
			this.start = 1;
			this.timer = setInterval(() => {
				mms -= 1000;
				if (mms > 0) {
					var time = formatDuring(mms);
					this.hTime = time.day * 24 + time.hours >= 10 ? time.day * 24 + time.hours : '0' + (time.day * 24 + time.hours);
					this.mTime = time.minutes >= 10 ? time.minutes : '0' + time.minutes;
					this.sTime = time.seconds >= 10 ? time.seconds : '0' + time.seconds;
				} else {
					clearInterval(this.timer);
					this.start = 2;
				}
			}, 1000);
		},

		formSubmit() {
			this.formId = this.formId > 0 ? 0 : 123;
		},

		onSecKill(start, e) {
			if (start == 1) {
				//判断是否为多规格
				let activityInfo = {
					buystate: 2,
					productid: e.id,
					assembleconfigid: e.cid,
					product_num: 1
				};

				if (e.sv_is_newspec) {
					//保存开团信息
					(this.productId = activityInfo.productid), (this.configId = activityInfo.assembleconfigid);
					uni.setStorageSync('activityInfo', activityInfo);
				} else {
					//产品不是多规格
					uni.setStorageSync('activityInfo', activityInfo);
					uni.navigateTo({
						url: '../../eshop/pay/index'
					});
				}
			}
		},

		onComfrim(e) {
			let { confirm, product_num, productid } = e; //sv_assemble_limit_buynum 0:限制;1:不限制
			let { sv_assemble_limit_buynum, sv_assemble_cdetail_buynum } = this.product;

			if (sv_assemble_limit_buynum == '1' || (sv_assemble_limit_buynum == '0' && product_num <= sv_assemble_cdetail_buynum)) {
				let activityInfo = uni.getStorageSync('activityInfo');
				activityInfo.product_num = product_num;
				activityInfo.productid = productid;
				uni.setStorageSync('activityInfo', activityInfo);
				uni.navigateTo({
					url: '../../eshop/pay/index'
				});
			} else {
				showToastFn('购买数量不能大于:' + sv_assemble_cdetail_buynum + ' !!');
			}
		},

		onGetUserInfo(e) {
			if (e.detail.userInfo) {
				uni.setStorageSync('userInfo', e.detail.userInfo);
				uni.navigateTo({
					url: '../../subPages/reg/index'
				});
			}
		},

		goHome() {
			uni.switchTab({
				url: '../../../pages/eshop/index'
			});
		},

		onShare(e) {
			this.showPoseter = true;
		}
	}
};
</script>
<style lang="less" scoped>
.commit {
	background: linear-gradient(45deg, rgb(255, 96, 52), rgb(238, 10, 36));
	width: 440rpx;
	height: 100%;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
}
.commit:active {
	opacity: var(--active-opacity);
}
.seckill-info {
	width: 100%;
	height: 120rpx;
	color: rgba(255, 255, 255, 0.7);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: var(--des_fontSize);
	background: red;
}

.seckill-info .price {
	display: flex;
	flex-grow: 1;
	justify-content: center;
	align-items: flex-start;
	flex-direction: column;
	height: 100%;
	padding-left: 20rpx;
}

.seckill-info .price .count {
	display: flex;
	justify-content: flex-start;
	align-items: flex-end;
}

.seckill-info .price .count .seckill-price {
	font-size: 45rpx;
	font-weight: 500;
	color: white;
}
.seckill-info .price .count .original-price {
	padding: 0rpx 10rpx;
	text-decoration: line-through;
}
.seckill-info .price .count .seckill-price::before,
.seckill-info .price .count .original-price::before {
	content: '￥';
	font-size: var(--des_fontSize);
}

.seckill-info .time {
	width: 200rpx;
	position: relative;
	background: rgb(246, 189, 40);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
}
.seckill-info .time::before {
	content: '';
	position: absolute;
	width: 40rpx;
	height: 40rpx;
	background: rgb(246, 189, 40);
	transform: rotate(-45deg) translateY(50%);
	left: -20rpx;
	top: 20rpx;
}
.seckill-info .time .clock {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 10rpx;
	color: rgb(142, 38, 2);
	font-size: 28rpx;
	font-weight: 500;
}
.seckill-info .time .clock van-icon {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 10rpx;
}

.seckill-info .time .start {
	padding: 4rpx 15rpx;
	background: rgb(231, 145, 32);
	color: white;
	border-radius: 10rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}
.seckill-info .time .timer {
	display: flex;
	color: white;
}
.seckill-info .time .timer text {
	background: rgb(231, 145, 32);
	box-sizing: border-box;
	padding: 0rpx 5rpx;
	border-radius: 5rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}
.des-container {
	display: flex;
	width: 100%;
	justify-items: center;
	align-items: center;
	background: white;
}
.des-container .share van-icon {
	display: flex;
	justify-content: center;
	align-items: center;
}
.des {
	width: 91%;
	box-sizing: border-box;
	background: white;
	padding: 10rpx 20rpx;
	height: 100rpx;
	align-items: center;
	line-height: 1.3rem;
	text-indent: 1.3rem;
	color: #666;
}

.goods-action {
	position: relative;
}
.remind {
	position: absolute;
	z-index: 2;
	right: 0;
	top: 0;
	height: 50px;
	width: 550rpx;
	background: #f44;
	color: white;
	border-radius: 0;
	font-size: 33rpx;
	margin: 0;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
}
.remind::after {
	border: 0;
}

.info1 {
	width: 100vw;
	box-sizing: border-box;
	background: white;
	margin-top: 6rpx;
	padding-bottom: 100rpx;
}
.info1 .title {
	color: red;
	font-size: 28rpx;
	text-align: center;
	height: 70rpx;
	line-height: 70rpx;
	margin-bottom: 20rpx;
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
/* .info1 rich-text .rich-img {
  width: 100% !important;
  height: auto !important;
} */
.info1 .no-info {
	font-size: 26rpx;
	color: rgba(0, 0, 0, 0.5);
	text-align: center;
	height: 100rpx;
	line-height: 100rpx;
}

.reg-btn {
	padding: 0;
	margin: 0;
	position: fixed;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: transparent;
	z-index: 1000;
}
.dispaly-container .reg-btn::after {
	border: 0;
}
</style>
