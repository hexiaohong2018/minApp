<template>
	<div v-show="show" class="discover">
		<view class="tab-content">
			<div class="tab">
				<div class="category" :class="{ 'category-hide': search }">
					<div class="tabs"><dc-tabs :active="active" :titles="titles" @change="onChange($event)" :color="color"></dc-tabs></div>
					<div class="serach"><view class="iconfont-vant icon-vant-search" @click="openSearch"></view></div>
				</div>
				<view class="uni-search-bar">
					<uni-search-bar placeholder="请输入搜索关键词" :radius="20" cancelButton="always" @input="onInput" @cancel="cancelSearch" @confirm="onSearch" />
				</view>
			</div>
		</view>

		<mescroll-uni :top="navHeight + 'px'" :bottom="tabBarHeight + 'px'" @init="mescrollInit" @down="downCallback" @up="upCallback" :down="downOption" :up="upOption">
			<div class="discover-content"><product :mode="mode" text="购买" :products="products" :color="color" @click="onBuy" @submit="onBuy"></product></div>
		</mescroll-uni>
		<view v-if="num" class="cart iconfont-vant icon-vant-shopping-cart" @click="goShoppingCart">
			<view class="num ellipsis">{{num}}</view>
		</view>
	</div>
</template>

<script>
import product from '@/components/product';
import uniSearchBar from '../../../components/uni-search-bar/uni-search-bar.vue';
import dcTabs from '../../../components/tabs/index.vue';
import { ProductList, CartList } from '../../../utils/class.js';
import { showToastFn } from '../../../utils/util.js';
import { debounce } from '../../../utils/common.js';
import { mapGetters } from 'vuex'

import store from '../../../utils/store.js';
const productList = new ProductList();
const cart = new CartList();
export default {
	name: 'discover',
	props: {
		mode: {
			type: Number,
			default: 2
		},
		show: Boolean,
		color: String
	},
	data() {
		return {
			loadStatus: true,
			products: [],
			search: false,
			categoryid: 0,
			active: 0,
			categoryList: [],
			// num: 0,
			navHeight: 0,
			tabBarHeight: 0,
			// 下拉刷新的常用配置
			downOption: {
				use: true, // 是否启用下拉刷新; 默认true
				auto: false // 是否在初始化完毕之后自动执行下拉刷新的回调; 默认true
			},
			// 上拉加载的常用配置
			upOption: {
				use: true, // 是否启用上拉加载; 默认true
				auto: false, // 是否在初始化完毕之后自动执行上拉加载的回调; 默认true
				page: {
					num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
					size: 10 // 每页数据的数量,默认10
				},
				noMoreSize: 5, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
				empty: {
					tip: '暂无相关数据'
				}
			}
		};
	},
	components: {
		product,
		uniSearchBar,
		dcTabs
	},
	computed: {
	  ...mapGetters({
		num: 'cartList/num'
	  }),
		titles() {
			return this.categoryList.map(item => item.sv_pc_name);
		}
	},
	created() {
		this.onLoad = (function() {
			var is_first_run = true;
			return function() {
				if (is_first_run) {
					this.navHeight = this.$store.getters['systemInfo/systemInfo'].navHeight + 52;
					this.tabBarHeight = this.$store.getters['systemInfo/systemInfo'].tabBarHeight;
					this.debounce = debounce(
						value => {
							productList.searchProduct({ searchStr: value }).then(res => {
								this.products = res.productList;
								this.mescroll.endSuccess(res.productList.length, false);
							});
						},
						600,
						false
					);
					this.init().then(res => {
						this.mescroll.resetUpScroll();
					});
					
					cart.getCartList().then(res=>{
						this.$store.dispatch('cartList/setNum',res.product_num);
					})

					is_first_run = false;
				}
			};
		})();
	},
	watch: {
		show(newVal) {
			if (newVal) {
				this.onLoad();
				// cart.getCartList().then(res => {
					
				// 	this.num = res.product_num;
				// });
			}
		}
	},
	methods: {
		mescrollInit(mescroll) {
			this.mescroll = mescroll;
		},
		downCallback(mescroll) {
			uni.removeStorageSync('expiredTime');
			this.$parent.getUiConfig().then(res=>{
				console.log(res);
			})
			cart.getCartList().then(res => {
				this.$store.dispatch('cartList/setNum',res.product_num);
				// this.num = res.product_num;
			});
			this.init()
				.then(res => {
					mescroll.resetUpScroll();
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('加载失败');
					mescroll.endErr();
				});
		},
		upCallback(mescroll) {
			productList
				.getProductListByCategoryId({ category: this.categoryid, page: mescroll.num })
				.then(res => {
					if (mescroll.num == 1) this.products = [];
					this.products = [...this.products, ...res.productList];
					mescroll.endSuccess(res.productList.length, !res.isAll);
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('加载失败');
					mescroll.endErr();
				});
		},
		goShoppingCart() {
			uni.navigateTo({
				url: '../../subpages/eshop/shoppingcart/index'
			});
		},
		onChange(index) {
			if (index == this.categoryList.length - 1) {
				uni.navigateTo({
					url: '../../subpages/subEshop/category/index'
				});
			} else {
				this.categoryid = this.categoryList[index].productcategory_id; //种类ID
				this.active = index;
				this.mescroll.resetUpScroll();
			}
		},
		init() {
			return productList.getProductCategory().then(res => {
				res.splice(4, res.length - 4, { productcategory_id: -1, sv_pc_name: '更多分类>' });
				res.unshift({ productcategory_id: 0, sv_pc_name: '所有商品' });
				this.categoryid = res[this.active].productcategory_id;
				this.categoryList = res;
				return res;
			});
		},

		onSearch(e) {
			productList.searchProduct({ searchStr: e.value }).then(res => {
				this.products = res.productList;
				this.mescroll.endSuccess(res.productList.length, false);
			});
		},
		openSearch() {
			this.search = true;
		},
		cancelSearch() {
			this.search = false;
		},
		onBuy(id) {
			uni.navigateTo({
				url: `../../subpages/eshop/productInfo/index?id=${id}`
			});
		},
		onInput(e) {
			this.debounce(e.value);
		}
	}
};
</script>

<style lang="less" scoped>
.discover {
	width: 100vw;
	.cart {
		position: fixed;
		bottom: 250rpx;
		left: 50rpx;
		width: 74rpx;
		height: 74rpx;
		background: rgba(0, 0, 0, 0.3);
		color: white;
		border-radius: 50%;
		font-size: 50rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid white;
		box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2);
		z-index: 2;
		.num {
			position: fixed;
			left: 100rpx;
			bottom: 300rpx;
			height: 32rpx;
			min-width: 32rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			z-index: 2;
			max-width: 34rpx;
			padding: 0 6rpx;
			background-color: #f44;
			border: 1px solid white;
			color: white;
			font-size: 24rpx;
			border-radius: 10rpx;
		}
	}
	.tab-content {
		width: 100vw;
		height: 52px;
		overflow: hidden;
		.tab {
			width: 200%;
			height: 52px;
			display: flex;
			overflow: hidden;
			border-bottom: 1px solid #eee;
			.category {
				width: 50%;
				height: 100%;
				transition: width 0.3s;
				display: flex;
				.tabs {
					width: 88%;
					height: 100%;
				}
				.serach {
					width: 12%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: white;
					.iconfont-vant {
						font-size: 45rpx;
					}
				}
			}
			.category-hide {
				width: 0%;
			}
			.uni-search-bar {
				width: 50%;
				height: 100%;
			}
		}
	}

	.discover-content {
		width: 100%;
	}
}
</style>
