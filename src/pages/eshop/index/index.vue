<template>
	<view class="index-container" v-show="show">
		<view v-if="shopInfo.shopList ? true : false" class="shops" :style="{ backgroundColor: color, color: _color }">
			<view class="shops-content" @click="selectShop">
				<view class="name ellipsis">
					{{ shopInfo.shop_name }}
					<view class="name-after" :style="{ color: _color }"></view>
				</view>
				<view class="search" :style="{ color: _color }">
					<view class="iconfont-vant icon-vant-search"></view>
					请输入分店的名称
				</view>
			</view>
			<!-- <view class="iconfont-vant icon-vant-qr" style="font-size:55rpx" @click="createQr"></view> -->
		</view>
<!-- 		<dc-poster :show="showPoster" @close="onClose" :share-info="shareInfo" z-index="1000" :color="color"></dc-poster> -->
		<mescroll-uni
			@init="mescrollInit"
			:up="{ auto: false }"
			:down="{ auto: false }"
			@up="upCallBack"
			@down="downCallBack"
			:top="navHeight + 'px'"
			:bottom="tabBarHeight + 'px'"
		>
			<view v-if="uiconfig" class="content">
				<!-- 图文导航模块 -->
				<dc-nav v-for="(item, index) in uiconfig[1]" :key="index" :style="{ order: item.order }" :items="item.subModule" :zoom="1" />
				<!-- 广告模块 -->
				<dc-ad v-for="(item, index) in uiconfig[0]" :key="index" :style="{ order: item.order }" :images="item.subModule" :autoplay="true" :background="white" />
				<!-- 标题模块 -->
				<dc-title
					v-for="(item, index) in uiconfig[2]"
					:key="index"
					:style="{ order: item.order }"
					:color="item.color"
					:title="item.mainhead"
					:subTitle="item.subhead"
					:position="item.position"
					:link="item.link"
				/>
				<!-- 商品模块 -->
				<dc-product
					v-for="(item, index) in uiconfig[3]"
					:key="index"
					:style="{ order: item.order }"
					:angle="item.angle"
					:mode="item.style"
					@click="onBuy"
					@submit="onBuy"
					round
					:products="item.subModule"
					:color="color"
				/>
				<!-- 优惠券领取 -->
				<dc-coupon v-for="(item, index) in uiconfig[4]" type="item.style" :key="index" :style="{ order: item.order }" />
				<!-- 团购模块 -->
				<dc-group-book v-for="(item, index) in uiconfig[5]" :key="index" :style="{ order: item.order }" :products="item.subModule" :color="color" />
				<!-- 秒杀商品模块 -->
				<dc-product
					v-for="(item, index) in uiconfig[6]"
					:key="index"
					:style="{ order: item.order }"
					:products="item.subModule"
					type="sec"
					:mode="item.style"
					:round="item.round == 'round'"
					@click="onSecKill"
					@submit="onSecKill"
					:color="color"
				/>
			</view>

			<view class="content" v-else>
				<dc-ad v-if="ad_img.length" :images="ad_img" :autoplay="true" :background="white" />
				<dc-nav v-if="navItems.length" :items="navItems" />
				<dc-product v-if="productList.length" :products="productList" :mode="2" round @click="onBuy" @submit="onBuy" :color="color" />
			</view>
		</mescroll-uni>
		
	</view>
</template>

<script>
import { isDeepColor, showToastFn } from '../../../utils/util.js';
import { User } from '../../../utils/class.js';
import dcNav from '../../../components/navs/index.vue';
import dcAd from '../../../components/ad/index.vue';
import dcTitle from '../../../components/title/index.vue';
import dcProduct from '../../../components/product/index.vue';
import dcCoupon from '../../../components/coupon/index.vue';
import dcGroupBook from '../../../components/group-book/index.vue';
// import dcPoster from '../../../components/poster/index.vue';
import { ProductList } from '../../../utils/class.js';
import { mapGetters } from 'vuex';
const user = new User();
const productList = new ProductList();
export default {
	name: 'eshop',
	props: {
		show: Boolean,
		uiconfig: Object,
		color: String
	},
	data() {
		return {
			navHeight: 0,
			tabBarHeight: 0,
			ad_img: [],
			navItems: [],
			productList: [],
			shareInfo: null,
			showPoster: false
		};
	},
	components: {
		dcNav,
		dcAd,
		dcTitle,
		dcProduct,
		dcCoupon,
		dcGroupBook,
		// dcPoster
	},
	created() {
		// 在组件内模拟onLoad函数
		this.onLoad = (function() {
			var is_first_run = true;
			return function() {
				if (is_first_run) {
					let shopInfo = this.$store.getters['loginInfo/shopInfo'],
						shop_name = shopInfo.shop_name || '首页';
					this.navHeight = this.$store.getters['systemInfo/systemInfo'].navHeight + (shopInfo.shopList ? 40 : 0);
					this.tabBarHeight = this.$store.getters['systemInfo/systemInfo'].tabBarHeight;
					this.init();
					is_first_run = false;
				}
			};
		})();
	},
	watch: {
		show(newVal) {
			if (newVal) {
				this.onLoad();
			}
		}
	},
	methods: {
		// onClose() {
		// 	this.showPoster = false;
		// },
		// createQr() {
		// 	let shopInfo = this.$store.getters['loginInfo/shopInfo'],
		// 		uid = shopInfo && (shopInfo.sales_user_id || shopInfo.user_id),
		// 		name = (shopInfo && shopInfo.shop_name) || '',
		// 		sv_us_logo = shopInfo && shopInfo.sv_us_logo;
		// 	this.shareInfo = {
		// 		title: '欢迎扫码进入：' + name,
		// 		imageUrl: sv_us_logo || '',
		// 		path: '/pages/eshop/index?uid=' + uid
		// 	};
		// 	this.showPoseter = true;
		// 	// console.log(this.shareInfo,this.showPoseter);
		// },

		selectShop() {
			uni.navigateTo({
				url: '../../subpages/eshop/shops/index'
			});
		},
		mescrollInit(mescroll) {
			this.mescroll = mescroll;
		},
		upCallBack(mescroll) {
			if (this.uiconfig) {
				mescroll.endSuccess(10, false);
			} else {
				productList
					.getProductPageList({ page: mescroll.num })
					.then(res => {
						if (mescroll.num == 1) this.productList = [];
						this.productList = [...this.productList, ...res.productList];
						mescroll.endSuccess(res.productList.length, !res.isAll);
					})
					.catch(err => {
						showToastFn('加载失败..');
						mescroll.endErr();
					});
			}
		},
		downCallBack(mescroll) {
			uni.removeStorageSync('expiredTime');
			this.$parent
				.getUiConfig()
				.then(res => {
					this.init();
				})
				.catch(err => {
					showToastFn('加载失败..');
					this.mescroll.endErr();
				});
		},

		onBuy(id) {
			uni.navigateTo({
				url: `../../subpages/eshop/productInfo/index?id=${id}`
			});
		},

		onSecKill(id, cid) {
			uni.navigateTo({
				url: `../../subpages/subEshop/secKillInfo/index?seckillId=${cid}&id=${id}`
			});
		},

		init() {
			if (this.uiconfig) {
				this.mescroll.resetUpScroll();
			} else {
				productList.getProductCategory().then(res => {
					var arr = [];
					for (let i = 0; i < res.length && i < 5; i++) {
						let obj = {};
						obj['des'] = res[i].sv_pc_name;
						obj['link'] = {
							target: '/subPages/category/index',
							params: {
								id: res[i].productcategory_id
							}
						};
						arr.push(obj);
					}
					this.navItems = arr;
				});
				this.mescroll.resetUpScroll(); //触发下拉加载事件，加载商品
			}
		}
	},
	computed: {
		...mapGetters({
			shopInfo: 'loginInfo/shopInfo'
		}),
		_color() {
			return isDeepColor(this.color) ? '#fff' : '#666';
		}
	}
};
</script>

<style lang="less" scoped>
.index-container {
	width: 100vw;
	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		width: 100%;
	}
	.shops {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80rpx;
		width: 100vw;
		box-sizing: border-box;
		padding: 6rpx 30rpx 14rpx 30rpx;
		font-size: 28rpx;
		.shops-content {
			flex: 1;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			width: 100%;
			background-color: rgba(247, 248, 250, 0.5);
			height: 100%;
			border-radius: 36rpx;
			box-sizing: border-box;
			padding: 0 36rpx;
			margin-right: 10rpx;
			.name {
				padding-right: 36rpx;
				position: relative;
				font-weight: bold;
				max-width: 200rpx;
				.name-after {
					width: 14rpx;
					height: 14rpx;
					border-right: 4rpx solid;
					border-bottom: 4rpx solid;
					position: absolute;
					right: 10rpx;
					top: 30%;
					transform: rotate(45deg) translateY(-50%);
				}
			}

			.search {
				padding-left: 40rpx;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				position: relative;

				.iconfont-vant {
					display: flex;
					justify-content: center;
					align-items: center;
					padding-right: 20rpx;
				}
			}
			.search:before {
				content: '';
				position: absolute;
				width: 1px;
				height: 30rpx;
				background-color: rgba(247, 248, 250, 0.5);
				left: 18rpx;
			}
		}
	}
}
</style>
