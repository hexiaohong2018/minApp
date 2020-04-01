<template>
	<div class="container">
		<nav-bar title="商品详情" :background="navBarBackground" :left-icon="icon" @click-left="onClickLeft"></nav-bar>
		<div v-if="loading" class="img-skeleton"></div>
		<ad v-else :images="product.sv_p_imagesList"></ad>

		<div class="msg">
			<div class="des">{{ product.sv_remark || product.sv_p_name }}</div>
			<div class="integral">
				<!-- <div class="value">￥{{product.sv_move_p_unitprice}}</div>
				<div class="original">￥{{product.sv_p_memberprice}}</div> -->
				<div class="value">￥{{ product.sv_move_p_unitprice > 0 ? product.sv_move_p_unitprice : product.sv_p_unitprice }}</div>
				<!-- sv_p_memberprice会员价 -->
				<div class="share" @click="onShare">
					<div class="iconfont-vant icon-vant-share"></div>
					<p>分享</p>
				</div>
			</div>
			<span v-if="!shopInfo.zeroInventorySales" class="remain">{{ `剩余${product.sv_p_storage >= 0 ? product.sv_p_storage : 0}件` }}</span>
		</div>
		<div class="info">
			<div class="title">商品详情</div>
			<rich-text v-if="product.sv_move_p_details" :nodes="product.sv_move_p_details"></rich-text>
			<text v-else>暂无详情</text>
		</div>
		<dc-goods-action z-index="999">
			<template v-slot:icons>
				<dc-goods-action-icon icon="shop" text="店铺" @click="goHome"></dc-goods-action-icon>
				<dc-goods-action-icon icon="cart" text="购物车" :info="num" @click="goShoppingCart"></dc-goods-action-icon>
				<dc-goods-action-icon icon="chat" open-type="contact" text="客服"></dc-goods-action-icon>
			</template>
			<template v-slot:btns>
				<dc-goods-action-btn
					text="加入购物车"
					background="linear-gradient(45deg,rgb(255,208,30),rgb(255,137,23))"
					@click="addCard(product.product_id, product.sv_is_newspec)"
				></dc-goods-action-btn>
				<dc-goods-action-btn
					text="立即购买"
					background="linear-gradient(45deg,rgb(255,96,52),rgb(238,10,36))"
					@click="onBuy(product.product_id, product.sv_is_newspec)"
				></dc-goods-action-btn>
			</template>
		</dc-goods-action>
		<poster :show="showPoster" @close="onClose" :share-info="shareInfo" z-index="1000" :color="navColor"></poster>
		<product-feature :productId="productId" @close="closeFeature" z-index="1000" :color="navColor" @comfirm="onComfirm"></product-feature>
	</div>
</template>

<script>
import poster from '@/components/poster/index.vue';
import ad from '@/components/ad/index.vue';
import navBar from '@/components/navBar/index.vue';
import dcGoodsAction from '../../../components/goodsAction/index.vue';
import dcGoodsActionIcon from '../../../components/goodsActionIcon/index.vue';
import dcGoodsActionBtn from '../../../components/goodsActionButton/index.vue';
import productFeature from '../../../components/productFeature/index.vue';
import { debounce } from '../../../utils/common.js';

import { mapGetters } from 'vuex';

import { showToastFn, decodeWXCodeParams } from '../../../utils/util.js';
import { ProductList, User, CartList } from '../../../utils/class.js';
const cart = new CartList();
const productList = new ProductList();
const user = new User();
export default {
	data() {
		return {
			product: null,
			navBarBackground: 'transparent',
			showPoster: false,
			shareInfo: {},
			loading: true,
			icon: 'arrow-left',
			menuHeight: 0,
			// navColor: '',
			productId: 0, //当前购买的商品ID
			isbuyNow: false
		};
	},
	onShareAppMessage() {
		return this.shareInfo;
	},
	onLoad(options) {
		this.menuHeight = this.ststemInfo.navHeight;
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
		options = decodeWXCodeParams(options);
		if (options.s) {
			user.login().then(res => {
				user.getMemberCardInfo();
				this._getProductInfo(options.id);
			});
		} else {
			this._getProductInfo(options.id);
		}
		options.s && (this.icon = 'wap-home');
	},
	onPageScroll(e) {
		this.debounce(e);
	},
	components: {
		ad,
		navBar,
		poster,
		dcGoodsAction,
		dcGoodsActionBtn,
		dcGoodsActionIcon,
		productFeature
	},
	computed: {
		...mapGetters({
			num: 'cartList/num',
			shopInfo: 'loginInfo/shopInfo',
			navColor:'custom/navColor',
			ststemInfo:'systemInfo/systemInfo'
		})
	},
	methods: {
		goHome() {
			uni.reLaunch({
				url: '../../../pages/eshop/index'
			});
		},
		addCard(id, isnewspec) {
			if (isnewspec) {
				//多规格
				this.productId = id;
			} else {
				cart.addCart(id)
					.then(() => {
						this.$store.dispatch('cartList/setNum', cart.product_num);
					})
					.catch(err => {
						err && showToastFn(err.errmsg || '添加失败');
					});
			}
		},
		onComfirm(e) {
			this.$store.dispatch('cartList/setNum', e.product_num);
			if (this.isbuyNow) {
				this.isbuyNow = false;
				uni.navigateTo({
					url: '../pay/index'
				});
			}
		},

		onBuy(id, isnewspec) {
			this.isbuyNow = true;
			if (isnewspec) {
				this.productId = id;
			} else {
				cart.addCart(id)
					.then(() => {
						this.$store.dispatch('cartList/setNum', cart.product_num);
						uni.navigateTo({
							url: '../pay/index'
						});
					})
					.catch(err => {
						err && showToastFn(err.errmsg || '添加失败');
					});
			}
		},
		closeFeature() {
			this.productId = 0;
		},
		goShoppingCart() {
			uni.navigateTo({
				url: '../shoppingcart/index'
			});
		},
		_getProductInfo(id) {
			id &&
				productList
					.getProductInfo(id, '加载中')
					.then(res => {
						this.product = res;
						this.loading = false;
						this.shareInfo = {
							title: res.sv_p_remark || res.sv_p_name,
							imageUrl: res.sv_p_images2,
							path: '/subPages/productInfo/index?id=' + res.product_id + '&s=1'
						};
					})
					.catch(msg => {
						console.log(msg);
						showToastFn('加载商品失败');
					});
		},
		onSave() {
			this.showPoster = false;
		},
		onClickLeft(e) {
			if (e) {
				uni.switchTab({
					url: '../../../pages/integral/index'
				});
			} else {
				uni.navigateBack({
					delta: 1
				});
			}
		},
		onShare() {
			this.showPoster = true;
		},
		onClose() {
			this.showPoster = false;
		}
	}
};
</script>

<style scoped lang="less">
.container {
	background: white;
	padding-bottom: 160rpx;
	.img-skeleton {
		width: 100%;
		height: 0;
		padding-bottom: calc(100% - 30rpx);
		border-bottom: 30rpx solid white;
		background: #f2f3f5;
	}
}
.msg {
	width: 100vw;
	padding: 20rpx 36rpx 30rpx 36rpx;
	box-sizing: border-box;
	font-weight: 600;
	background: white;
	.des {
		width: 100%;
		font-size: 28rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-indent: 1.3rem;
		line-height: 1.4rem;
	}
	.integral {
		font-size: 32rpx;
		color: #f67717;
		letter-spacing: 0.08rem;
		margin: 18rpx 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		.value {
			display: flex;
			flex: 1;
			justify-content: flex-start;
			align-items: center;
			text {
				font-weight: 500;
				color: #333;
				font-size: 22rpx;
				letter-spacing: 0;
				text-decoration: line-through;
				margin-left: 18rpx;
			}
		}
		.share {
			display: felx;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			p {
				font-size: 22rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				color: #999;
			}
			.iconfont-vant {
				font-size: 38rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.share:active {
			opacity: var(--active-opacity);
		}
	}
	.remain {
		font-size: 25rpx;
		color: #f66800;
		background: #ffe0c9;
		border-radius: 10rpx;
		padding: 12rpx 18rpx;
		position: relative;
		letter-spacing: 0.08rem;
		z-index: 2;
	}
	.remain:after {
		content: '';
		width: 20rpx;
		height: 20rpx;
		background: #ffe0c9;
		position: absolute;
		top: 50%;
		transform: translateY(-50%) rotate(45deg);
		left: -10rpx;
		z-index: -1;
	}
}
.info {
	width: 100vw;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	border-top: 20rpx solid #f8f8f8;
	.title {
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28rpx;
		color: #333;
		letter-spacing: 0.08rem;
		border-bottom: 1px solid #eee;
	}
	.title:after,
	.title:before {
		content: '';
		width: 40rpx;
		height: 2rpx;
		background: #333;
		margin: 0 10rpx;
	}
	text {
		font-size: 24rpx;
		padding: 30rpx;
	}
}
</style>
