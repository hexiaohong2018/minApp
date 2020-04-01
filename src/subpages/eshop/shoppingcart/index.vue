<template>
	<view class="sopping-content">
		<view class="content" v-if="cartList.length > 0">
			<uni-swipe-action>
				<uni-swipe-action-item :options="options" v-for="(item, index) in cartList" :key="item.product_id" @click="delProduct(item.product_id)">
					<labe class="item">
						<radio color="#FF852A" :style="{ transform: 'scale(0.7)' }" :checked="item.sv_shop_cart_state == 0" @click="onChange(index)" />
						<dc-list
							:icon="item.sv_p_images2"
							:title="item.sv_p_remark ? item.sv_p_remark : item.sv_p_name"
							iconSize="150rpx"
							:border="index < cartList.length - 1 ? true : false"
							:style="{ width: '96vw' }"
						>
							<template v-slot:label>
								<view class="des-price">
									<view class="des">{{ item.sv_p_specs }}</view>
									<view class="price">¥ {{ item.product_unitprice }}</view>
								</view>
							</template>
							<template v-slot:right-icon>
								<uni-number-box
									:value="item.sv_pricing_method == 1 ? item.sv_p_weight : item.product_num"
									:min="1"
									:max="zeroInventorySales ? '10000' : item.sv_pricing_method == 0 ? item.sv_p_storage : item.sv_p_total_weight"
									@change="
										onStepperChange(
											$event,
											item.product_id,
											item.sv_pricing_method == 1 ? item.sv_p_weight : item.product_num,
											zeroInventorySales ? '' : item.sv_pricing_method == 0 ? item.sv_p_storage : item.sv_p_total_weight
										)
									"
									button-size="30px"
									input-width="30px"
									:disabled="item.sv_shop_cart_state != 0"
									:read-only="true"
								></uni-number-box>
							</template>
						</dc-list>
					</labe>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</view>
		<view v-else class="no-products">
			<view class="iconfont-vant icon-vant-cart-o"></view>
			<view class="des">
				<view class="shopping">
					购物车空,
					<text :style="{ color: activeColor }" @click="goDiscover">点击</text>
					去看看吧~
				</view>
				<view @click="onScan" class="qrcode" :style="{ color: activeColor }">扫码添加商品</view>
			</view>
		</view>

		<dc-submit-bar :price="totalPrice" button-text="去结算" disabled lable="合计:" @click="onSubmit">
			<label class="all" @click="selectAll">
				<radio color="#FF852A" :style="{ transform: 'scale(0.7)' }" :checked="selectedAll" />
				全选中
			</label>
		</dc-submit-bar>
		<product-feature :productId="prductId" @close="closeFeature" z-index="1000" :color="activeColor" @comfirm="onComfirm"></product-feature>
	</view>
</template>

<script>
import dcList from '../../../components/list/index.vue';
import uniSwipeAction from '../../../components/uni-swipe-action/uni-swipe-action.vue';
import uniSwipeActionItem from '../../../components/uni-swipe-action-item/uni-swipe-action-item.vue';
import dcSubmitBar from '../../../components/submit-bar/index.vue';
import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue';
import productFeature from '../../../components/productFeature/index.vue';
import { CartList, ProductList } from '../../../utils/class.js';
import { showToastFn, setActiveColor, showModal } from '../../../utils/util.js';
import {mapGetters} from 'vuex';
const cart = new CartList();
const productList = new ProductList();
export default {
	data() {
		return {
			selectedAll: false,
			totalPrice: 0,
			zeroInventorySales: true, //是否开启零库存销售
			cartList: [],
			activeColor: '',
			prductId: 0,
			options: [
				{
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				}
			]
		};
	},
	computed:{
		...mapGetters({
			shopInfo:'loginInfo/shopInfo',
			navColor:'custom/navColor'
		})
	},
	components: {
		dcList,
		uniSwipeAction,
		uniSwipeActionItem,
		dcSubmitBar,
		uniNumberBox
	},
	onLoad() {
		this.zeroInventorySales = this.shopInfo.zeroInventorySales;
		this.activeColor = setActiveColor(this.navColor, '#f44');
		this.init();
	},
	onPullDownRefresh() {
		this.init().then(res=>{
			uni.stopPullDownRefresh();
		})
	},
	methods: {
		init() {
			return cart.getCartList('加载中..').then(res => {
				this._inItCart(res);
				return res;
			});
		},
		//渲染数据
		_inItCart(res) {
			this.totalPrice = res.total_price;
			this.cartList = res.cart_list;
			this.selectedAll = res.cart_list.find(item => item.sv_shop_cart_state == 1) ? false : true;
		},
		goDiscover() {
			uni.reLaunch({
				url: '../../../pages/eshop/index?name=discover'
			});
		},
		selectAll() {
			this.selectedAll = !this.selectedAll;
			cart.isBuy(0, this.selectedAll ? 8 : 7)
				.then(res => {
					//7全部取消，8全部选中
					this._inItCart(res);
				})
				.catch(err => {
					console.log(err);
					showToastFn('操作失败,稍后再试');
				});
		},
		onChange(index) {
			var list = this.cartList;
			this.selectedAll = list.find(item => item.sv_shop_cart_state == 1) ? false : true;
			var op_type = list[index].sv_shop_cart_state == 1 ? 6 : 5;
			cart.isBuy(list[index].product_id, op_type)
				.then(res => {
					this._inItCart(res);
				})
				.catch(err => {
					console.log(err);
					showToastFn('操作失败，稍后再试');
				});
		},
		//删除商品
		delProduct(id) {
			cart.cutAll(id)
				.then(res => {
					this._inItCart(res);
					this.$store.dispatch('cartList/setNum',cart.product_num);
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('删除失败');
				});
		},
		onStepperChange(newVal, id, oldVal, max) {
			//添加
			if (newVal > oldVal) {
				cart.addCart(id)
					.then(res => {
						this._inItCart(res);
						this.$store.dispatch('cartList/addNum');
					})
					.catch(msg => {
						msg && showToastFn(msg.errmsg || '添加失败');
					});
			}
			//减少
			if (newVal < oldVal) {
				cart.cutCart(id)
					.then(res => {
						this._inItCart(res);
						this.$store.dispatch('cartList/subNum');
					})
					.catch(msg => {
						showToastFn('减少失败', 'fail');
					});
			}
		},
		onScan() {
			var that = this;
			uni.scanCode({
				success: function(e) {
					that._scanToCart(e.result);
				}
			});
		},
		closeFeature() {
			this.productId = 0;
		},
		onComfirm() {
			this.init();
		},
		onSubmit() {
			//若没有启动零库存销售，且购买商品数量超出库存
			if (this.cartList.find(item => item.product_num > item.sv_p_storage && !item.sv_shop_cart_state) && !this.zeroInventorySales) {
				// item.sv_p_remark ? item.sv_p_remark : item.sv_p_name
				showToastFn('部分商品库存不足，请把该商品移出结算后再提交');
				return;
			}

			let totalPrice = this.totalPrice || 0;
			if (totalPrice > 0) {
				if (!this.shopInfo.enableDoBusinessSwitch) {
					if (this.cartList.length > 0) {
						uni.navigateTo({
							url: '../pay/index'
						});
					} else {
						showToastFn('亲，您的购物车为空哦~');
					}
				} else {
					showToastFn('店铺已暂停营业!');
				}
			}
		},
		_scanToCart(str_code) {
			productList
				.searchProduct(str_code)
				.then(res => {
					var products = res.productList;
					switch (products.length) {
						case 0: //没有该商品
							showToastFn('暂无该商品', false);
							break;
						case 1:
							if (products[0].sv_is_newspec) {
								this.productId = products[0].product_id;
							} else {
								cart.addCart(products[0]).then(res => {
									this._inItCart(res);
								});
							}
							break;
						default:
					}
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('添加商品失败', false);
				});
		}
	}
};
</script>

<style lang="less" scoped>
.sopping-content {
	width: 100vw;
	.content {
		width: 100vw;
	}
	.no-products {
		width: 100vw;
		height: 400rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin-top: 400rpx;
		color: #999;
		.iconfont-vant {
			font-size: 150rpx;
			margin-bottom: 20rpx;
		}
		.shopping {
			font-size: 26rpx;
			text-align: center;
			padding: 10rpx 0;

			text {
				padding: 0 20rpx;
				font-weight: bolder;
			}
			text:active {
				opacity: var(--active-opacity);
			}
		}
		.qrcode {
			font-size: 26rpx;
			text-align: center;
			padding: 10rpx 0;
		}
		.qrcode:active {
			opacity: var(--active-opacity);
		}
	}
	.item {
		display: flex;
		width: 100%;
		padding-left: 15rpx;
		box-sizing: border-box;
		justify-content: flex-start;
		align-items: center;
		.des-price {
			font-size: 26rpx;
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			height: 100%;
			color: #666;
			.des {
				padding: 6rpx 0rpx;
			}
			.price {
				color: #f44;
				font-size: 24rpx;
			}
		}
	}
	.all {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
</style>
