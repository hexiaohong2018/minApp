<template>
	<view class="dispaly-container">
		<dc-nav-bar arrow :background="navBarBackground" title="商品详情"></dc-nav-bar>
		<button class="reg-btn" v-if="!memberInfo.member_id" open-type="getUserInfo" lang="zh_CN" @getuserinfo="onGetUserInfo"></button>
		<dc-group-book-item :product="product" :is-display="false" @share="onShare" :color="activeColor"></dc-group-book-item>
		<view class="buying">
			<view class="title">{{ product.dataList.length }}人正在拼单，可以直接参与</view>
			<ul>
				<li v-for="(item, index) in product.dataList" :key="index">
					<view class="imgs">
						<block v-for="(nameItem, index2) in item.sv_member_names" :key="index2">
							<image v-if="nameItem.member_picurl" :src="nameItem.member_picurl" :style="'left:' + (30 + nameIndex * 50) + 'rpx; z-index:' + (2 + nameIndex)"></image>
							<view v-else class="iconfont-vant icon-vant-user-o" :style="'left:' + (30 + nameIndex * 50) + 'rpx; z-index:' + (2 + nameIndex)"></view>
						</block>
					</view>
					<view class="des">还差{{ item.remain_assemble_num }}人拼成</view>
					<view
						class="go-group"
						:style="'background:' + activeColor"
						@tap="
							onGroup(1, {
								assembleid: item.sv_assemble_id,
								assembleconfigid: product.assembleconfigid,
								productid: product.assembledetailpid,
								isnewspec: product.sv_is_newspec,
								deliver: product.sv_assemble_config_mode
							})
						"
					>
						去参团
					</view>
				</li>
			</ul>
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
				<dc-goods-action-icon icon="chat-o" open-type="contact" text="客服"></dc-goods-action-icon>
				<dc-goods-action-icon icon="share" text="分享" @click="onShare"></dc-goods-action-icon>
			</template>
			<template v-slot:btns>
				<dc-goods-action-btn
					text="单独购买"
					background="linear-gradient(45deg,rgb(255,208,30),rgb(255,137,23))"
					@click="
						onGroup(0, {
							assembleconfigid: product.assembleconfigid,
							productid: product.assembledetailpid,
							isnewspec: product.sv_is_newspec,
							deliver: product.sv_assemble_config_mode
						})
					"
				></dc-goods-action-btn>
				<dc-goods-action-btn
					text="一键开团"
					background="linear-gradient(45deg,rgb(255,96,52),rgb(238,10,36))"
					@click="
						onGroup(1, {
							assembleconfigid: product.assembleconfigid,
							productid: product.assembledetailpid,
							isnewspec: product.sv_is_newspec,
							deliver: product.sv_assemble_config_mode
						})
					"
				></dc-goods-action-btn>
			</template>
		</dc-goods-action>

		<product-feature
			:productId="productId"
			z-index="1000"
			:color="activeColor"
			:configId="configId"
			:buyState="buyState"
			@comfirm="onComfrim"
			@close="closeFeature"
		></product-feature>
		<!-- 分享 -->
		<dc-poster @close="onClose" :share-info="shareInfo" :show="showPoseter" z-index="1000" :color="activeColor"></dc-poster>
	</view>

</template>

<script>
import { GroupBuy, CartList, User } from '../../../utils/class.js';

import { decodeWXCodeParams, setActiveColor, showToastFn} from '../../../utils/util.js';
import dcGroupBookItem from '../../../components/group-book-item/index.vue';
import dcPoster from '../../../components/poster/index.vue';
import productFeature from '../../../components/productFeature/index.vue';
import dcGoodsAction from '../../../components/goodsAction/index.vue';
import dcGoodsActionIcon from '../../../components/goodsActionIcon/index.vue';
import dcGoodsActionBtn from '../../../components/goodsActionButton/index.vue';
import dcNavBar from '../../../components/navBar/index.vue';
import store from '../../../utils/store.js';
import { debounce } from '../../../utils/common.js'

const groupBuy = new GroupBuy();
const cart = new CartList();
const user = new User();

export default {
	data() {
		return {
			productId: '',
			configId: '',
			buyState: 0,
			memberInfo: {}, //会员信息
			activeColor: '',
			product: {},
			isEnd: false,
			showPoseter: false,
			shareInfo: {},
			navBarBackground:'transparent',
			menuHeight: 0,
		};
	},

	components: {
		dcNavBar,
		dcGroupBookItem,
		dcPoster,
		productFeature,
		dcGoodsAction,
		dcGoodsActionBtn,
		dcGoodsActionIcon
	},
	props: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var params = decodeWXCodeParams(options);
		this.activeColor = store.getters.navColor;
		this.menuHeight = this.$store.getters['systemInfo/systemInfo'].navHeight;
		
		this.debounce = debounce((e)=>{
			if (e.scrollTop > this.menuHeight) {
				this.navBarBackground = this.activeColor;
			} else {
				this.navBarBackground = 'transparent';
			}
		},600,false)

		//如果是从分享页面过来的则登录获取用户信息
		if (params.s) {
			user.login().then(res => {
				let loginInfo = res;
				this.memberInfo = loginInfo.memberInfo;
				this.getGroupBuyListItemFun(params.cid, params.id);
			});
		} else {
			this.getGroupBuyListItemFun(params.cid, params.id);
		}
	},
	onShow: function() {
		this.memberInfo = this.$store.getters['loginInfo/memberInfo'];
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
		getGroupBuyListItemFun(cid, id) {
			groupBuy
				.getGroupBuyListItem(cid, id)
				.then(res => {
					this.shareInfo = {
						title: res.des,
						imageUrl: res.picUrl,
						path: '/subpages/subEshop/groupBuyInfo/index?cid=' + cid + '&id=' + id + '&s=1' //pmid商品ID
					};
					this.product = res;
					this.isEnd = res.mms > 0 ? false : true; //是否允许一键开团
				})
				.catch(msg => {
					showToastFn('加载拼团信息失败!');
					console.log(msg);
				});
		},
		//buystate:团购为1，0为单独购买
		onGroup(buystate, activityInfo) {
			let member_id = this.$store.getters['loginInfo/memberInfo'].member_id,
				dataList = this.product.dataList;
				
			activityInfo.picUrl = this.product.picUrl;
			activityInfo.buystate = buystate;
			activityInfo.product_main_id = activityInfo.productid;

			if (activityInfo.buystate == '1' && dataList.find(item => item.sv_member_names.find(item => item.member_id == member_id))) {
				showToastFn('你已参团', 'fail');
			} else {
				activityInfo.isAssemble = activityInfo.assembleid ? 0 : 1; //0参团 1开团
				//判断是否为多规格

				if (activityInfo.isnewspec) {
					//保存开团信息
					this.configId = activityInfo.assembleconfigid;
					this.productId = activityInfo.productid;
					this.buyState = activityInfo.buystate;

					uni.setStorageSync('activityInfo', activityInfo);
				} else {
					//产品不是多规格
					activityInfo.product_num = 1;
					uni.setStorageSync('activityInfo', activityInfo);
					uni.navigateTo({
						url: '../../eshop/pay/index'
					});
				}
			}
		},

		onComfrim(e) {
			let { confirm, product_num, productid } = e;
			let activityInfo = uni.getStorageSync('activityInfo');
			activityInfo.product_num = product_num;
			activityInfo.productid = productid; // activityInfo.product_main_id = product_main_id;

			uni.setStorageSync('activityInfo', activityInfo);
			uni.navigateTo({
				url: '../../eshop/pay/index'
			});
		},

		onGetUserInfo(e) {
			if (e.detail.userInfo) {
				uni.setStorageSync('userInfo', e.detail.userInfo);
				uni.navigateTo({
					url: '../../common/reg/index'
				});
			}
		},
		goHome(){
			uni.switchTab({
				url:'../../../pages/eshop/index'
			})
		},
		onShare(e) {
			this.showPoseter = true;
		},
		onClose() {
			this.showPoseter = false;
		}
	}
};
</script>
<style lang="less" scoped>
.dispaly-container {
	padding-bottom: 100rpx;
	position: relative;
	width: 100vw;
	background-color: white;

	.buying {
		width: 100%;
		margin-top: 5rpx;
		background: white;
		.title {
			font-size: 30rpx;
			color: #303133;
			height: 100rpx;
			line-height: 100rpx;
			padding-left: 20rpx;
			border-bottom: 1px solid #eee;
		}
		ul {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 100%;
			padding-left: 20rpx;
			padding-right: 20rpx;
			box-sizing: border-box;
			-webkit-box-sizing: border-box;
			li {
				height: 130rpx;
				width: 100%;
				border-top: 1px solid #eee;
				display: flex;
				justify-content: space-between;
				align-items: center;
				color: #666;
				font-size: 28rpx;
			}
			li:first-child {
				border-top: 0;
			}
		}

		.imgs {
			height: 100%;
			flex-grow: 1;
			overflow: hidden;
			position: relative;
			image,
			.iconfont-vant {
				width: 70rpx;
				height: 70rpx;
				border-radius: 50%;
				overflow: hidden;
				border: 2px solid white;
				position: absolute;
				top: 50%;
				margin-top: -35rpx;
				box-sizing: border-box;
				-webkit-box-sizing: border-box;
				background: #ebeef5;
			}
			.iconfont-vant {
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}

		.des {
			width: 200rpx;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			text-align: right;
		}
		.go-group {
			width: 120rpx;
			color: white;
			height: 60rpx;
			text-align: center;
			border-radius: 10rpx;
			line-height: 60rpx;
			margin-left: 20rpx;
		}
	}

	.info1 {
		width: 100vw;
		box-sizing: border-box;
		background: white;
		margin-top: 6rpx;
		padding-bottom: 100rpx;
		.title {
			color: red;
			font-size: 28rpx;
			text-align: center;
			height: 70rpx;
			line-height: 70rpx;
			margin-bottom: 20rpx;
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		}
		.no-info {
			font-size: 26rpx;
			color: rgba(0, 0, 0, 0.5);
			text-align: center;
			height: 100rpx;
			line-height: 100rpx;
		}
	}

	.reg-btn {
		padding: 0;
		margin: 0;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		z-index: 1000;
	}
	.reg-btn::after {
		border: 0;
	}
}
</style>
