<template>
	<uni-popup ref="popup" type="bottom" @change="onChange" :z-index="zIndex">
		<view class="feature">
			<!-- 头部 -->
			<view class="header">
				<image :src="current_img || sv_p_images2" mode="aspectFill"></image>
				<view class="info">
					<view class="title">{{ currentProduct.sv_p_name || sv_p_name }}</view>
					<view v-if="currentProduct" class="price" :style="'color:' + _color">
						￥{{ currentProduct.sv_move_p_unitprice }}
						<text>库存:{{ currentProduct.sv_p_storage }}</text>
					</view>
					<view class="spec">已选规格:{{ spec_str }}</view>
				</view>
				<icon class="close" type="cancel" size="25" @tap="$refs.popup.close()" color="#BFBFBF"></icon>
			</view>

			<!-- 规格列表 -->
			<scroll-view class="list" scroll-y>
				<view v-for="(sepcItem, index) in validspec" :key="index">
					<view class="title">{{ sepcItem.spec_name }}</view>
					<view class="feature-list">
						<view
							v-for="(item, index2) in sepcItem.attrilist"
							:key="index2"
							@tap="choseFeature(item.disabled, index, index2, sepcItem.spec_id, item.attri_name)"
							:class="'item ' + (item.checked ? 'item-active' : '') + '' + (item.disabled ? 'item-disable' : '')"
							:style="'background:' + (item.checked ? _color : item.disabled ? '#BFBFBF' : 'white') + ';border-color:' + (item.checked ? _color : '#BFBFBF')"
						>
							{{ item.attri_name }}
						</view>
					</view>
				</view>
			</scroll-view>
			<!-- 购买数量 -->
			<view class="count">
				<view class="info">
					<view class="buy-count">购买数量:</view>
					<!-- <view class="remain-count">剩余数量:{{1}}</view> -->
				</view>
				<view class="op"><uni-number-box min="0" :max="max" :value="product_num" @change="onChangeNumber" button-size="60rpx" input-width="60rpx"></uni-number-box></view>
			</view>

			<!-- 加入购物车 -->
			<view class="foot" @click="onConfrim">
				<view class="op" v-if="type == 'add-buy'">
					<view class="add-cart" id="addcart">加入购物车</view>
					<view class="buy-now" :style="'background-color:' + _color" id="buynow">立即购买</view>
				</view>
				<view v-else class="confrim" :style="'background-color:' + _color" id="comfirm">确定</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
import { CartList, ProductList } from '../../utils/class.js';
import { setActiveColor, showToastFn } from '../../utils/util.js';
import uniNumberBox from '../uni-number-box/uni-number-box.vue';
import uniPopup from '../uni-popup/uni-popup.vue';
import {mapGetters} from 'vuex';
const cart = new CartList();
const productList = new ProductList();
export default {
	data() {
		return {
			validspec: [], //规格数据
			productCustomdDetailList: [], //商品数据
			sv_p_images2: '', //商品主图
			sv_p_name: '', //主商品名称

			current_img: '', //当前显示图片
			spec_list: {}, //当前选中的规格

			productSpec_list: [],
			product_num: 1
		};
	},

	components: {
		uniNumberBox,
		uniPopup
	},
	props: {
		zIndex: {
			type: [String | Number],
			default: 1
		},
		productId: Number,
		type: {
			//按钮类型，comfrim 只有确定按钮，add-buy 有加入购物车和立刻购买按钮
			type: String,
			default: 'confrim',
			validator: function(value) {
				return ['confrim', 'add-buy'].indexOf(value) !== -1;
			}
		},
		color: {
			//按钮的主体颜色
			type: String,
			default: '#f44'
		},
		configId: Number, //配置ID
		buyState: Number // 购买状态 0：普通商品,1：拼团,2：秒杀
	},
	computed: {
		_color() {
			return setActiveColor(this.color, '#f44');
		},
		spec_str() {
			return Object.keys(this.spec_list)
				.map(key => this.spec_list[key])
				.join(',');
		},
		currentProduct() {
			// console.log(this.productCustomdDetailList)
			return this.productCustomdDetailList.find(item => item.sv_p_specs == this.spec_str) || null;
		},
		...mapGetters({
			shopInfo:'loginInfo/shopInfo'
		}),
		max() {
      if (!this.currentProduct) return 0;
			if (this.buyState == 0) {
				//一般商品，若没开启零库存，则最大购买为库存，否则不限制
				return this.shopInfo.zeroInventorySales ? 1000 : this.currentProduct.sv_p_storage;
			} else {
				//拼团，秒杀商品，若开启限购数量则最大购买为限购数量，否则不限制
				
				// currentProduct.sv_assemble_limit_buynum == 1?10:currentProduct.sv_assemble_cdetail_buynum
				return this.currentProduct.sv_assemble_limit_buynum == 1 ? 1000 : this.currentProduct.sv_assemble_cdetail_buynum;
			}
		}
	},

	methods: {
		//更加规格数组生成所有可能
		// _doExchange(doubleArrays){
		//     var len = doubleArrays.length;
		//     if (len >= 2) {
		//         var arr1 = doubleArrays[0];
		//         var arr2 = doubleArrays[1];
		//         var len1 = doubleArrays[0].length;
		//         var len2 = doubleArrays[1].length;
		//         var newlen = len1 * len2;
		//         var temp = new Array(newlen);
		//         var index = 0;
		//         for (var i = 0; i < len1; i++) {
		//             for (var j = 0; j < len2; j++) {
		//                 temp[index] = arr1[i] + "," + arr2[j];
		//                 index++;
		//             }
		//         }
		//         var newArray = new Array(len - 1);
		//         newArray[0] = temp;
		//         if (len > 2) {
		//             var _count = 1;
		//             for (var i = 2; i < len; i++) {
		//                 newArray[_count] = doubleArrays[i];
		//                 _count++;
		//             }
		//         }
		//         return doExchange(newArray);
		//     }
		//     else {
		//         return doubleArrays[0];
		//     }
		// },

		onChange(e) {
			this.product_num = 1;
			this.$emit(e.show ? 'open' : 'close');
		},
		addToCart: function(eventName) {
			if (this.currentProduct) {
				if (this.configId > 0) {
					//秒杀或者团购
					this.$emit(eventName, {
						confirm: true,
						product_num: this.product_num,
						productid: this.currentProduct.product_id
					});
					this.$refs.popup.close();
				} else {
					//加入购物
					cart.addCart(this.currentProduct, this.product_num, '添加中')
						.then(res => {
							//添加成功
							this.$emit(eventName, {
								confirm: true,
								product_num: cart.product_num,
								res: res
							});
							this.$refs.popup.close();
						})
						.catch(msg => {
							msg && showToastFn(msg.errmsg || '添加失败');
						});
				}
			}
		},
		onConfrim: function(e) {
			var spec = this.validspec.find(item => !this.spec_list.hasOwnProperty(item.spec_id)); //所有规格已选择
			if (!spec) {
				this.addToCart(e.target.id);
			} else {
				showToastFn('请选择' + spec.spec_name);
			}
		},

		setAttrDisable: function(row, attriname) {
			return this.validspec.map((item, index) => {
				//设置不可选择规格
				if (index != row) {
					item.attrilist = item.attrilist.map((attriItem, attrIndex) => {
						attriItem.disabled = this.productCustomdDetailList.find(item => {
							return item.sv_p_specs.indexOf(attriItem.attri_name) != -1 && item.sv_p_specs.indexOf(attriname) != -1;
						})
							? false
							: true;
						return attriItem;
					});
				}
				return item;
			});
		},
		choseFeature: function(disabled, row, column, specid, attriname) {
			if (!disabled) {
				var productCustomdDetailList = this.productCustomdDetailList,
					validspec = this.validspec,
					attrilist = validspec[row].attrilist,
					attri = attrilist[column];
				attrilist = attrilist.map((item, index) => {
					//设置选择状态
					item.checked = index == column ? !item.checked : false;
					return item;
				});
				attri.checked ? this.$set(this.spec_list, specid, attriname) : this.$delete(this.spec_list, specid);
				var spec_str = this.spec_str;
				var temp = this.productSpec_list.filter(item => {
					return item.indexOf(spec_str) != -1;
				});

				if (attri.checked) {
					validspec = validspec.map((item, index) => {
						if (row != index) {
							item.attrilist = item.attrilist.map(attriItem => {
								attriItem.disabled = temp.find(item => item.split(',').find(item => item == attriItem.attri_name)) ? false : true;
								return attriItem;
							});
						}

						return item;
					});
					attri.images_info && (this.current_img = attri.images_info);
				} else {
					validspec = validspec.map((item, index) => {
						if (row == index) {
							item.attrilist = item.attrilist.map(attriItem => {
								attriItem.disabled = temp.find(item => item.split(',').find(item => item == attriItem.attri_name)) ? false : true;
								return attriItem;
							});
						} else {
							item.attrilist = item.attrilist.map(attriItem => {
								attriItem.disabled = false;
								return attriItem;
							});
						}
						return item;
					});
					attri.images_info && (this.current_img = '');
				} //更新规格数据

				this.validspec = validspec; //更新当前选择的数据
			}
		},
		onChangeNumber(value) {
			this.product_num = value;
		}
	},
	watch: {
		productId: function(productId) {
			if (productId > 0) {
				var configId = this.configId,
					buyState = this.buyState;
				productList
					.getMorespecSubProductList(productId, configId, buyState)
					.then(res => {
						var productCustomdDetailList = res.productCustomdDetailList || [];
						this.validspec = res.sv_master_validspec || [];
						this.productCustomdDetailList = productCustomdDetailList;
						this.productSpec_list = productCustomdDetailList.map(item => item.sv_p_specs);
						this.sv_p_images2 = res.sv_p_images2;
						this.sv_p_name = res.sv_p_name;
						this.spec_list = {};
						this.product_num = 1;
						this.$refs.popup.open();
					})
					.catch(msg => {
						showToastFn('获取规格数据失败');
						console.log(msg);
					});
			} else {
				this.$refs.popup.close();
			}
		}
	}
};
</script>
<style lang="less" scoped>
.feature {
	height: 840rpx;
	width: 100vw;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	background: white;
	border-radius: 10rpx 10rpx 0 0;
}
.feature .header {
	height: 140rpx;
	width: 100%;
	position: relative;
	border-bottom: 1px solid #eaeaea;
	margin-left: 20rpx;

	image {
		width: 200rpx;
		height: 200rpx;
		left: 10rpx;
		position: absolute;
		top: -90rpx;
		border-radius: 10px;
		border: 1px solid #bfbfbf;
		background: white;
		max-width: 200rpx;
		max-height: 200rpx;
	}
	.info {
		margin-left: 30%;
		margin-right: 200rpx;
		display: flex;
		flex-direction: column;
		width: 55%;
		justify-content: flex-start;
		.title {
			width: 100%;
			height: 40rpx;
			line-height: 40rpx;
			overflow: hidden;
			padding-top: 10rpx;
			font-size: 26rpx;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.price {
			font-size: 34rpx;
			text {
				color: #999;
				font-size: 28rpx;
				padding-left: 10rpx;
			}
		}
		.spec {
			font-size: 24rpx;
			color: rgba(0, 0, 0, 0.6);
		}
	}
	.close {
		position: absolute;
		top: calc(50% - 12px);
		right: 30rpx;
	}
}

.list {
	height: 250rpx;
	flex-grow: 1;
	padding-left: 10px;
	border-bottom: 1px solid #eaeaea;
	margin-left: 10px;
	margin-bottom: 5rpx;
	.title {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
	}
	.feature-list {
		display: flex;
		width: 90%;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		.item {
			border: 1px solid #bfbfbf;
			border-radius: 3px;
			margin-right: 20rpx;
			min-width: 120rpx;
			text-align: center;
			font-size: 26rpx;
			height: 50rpx;
			line-height: 50rpx;
			padding: 0 10rpx;
			margin-bottom: 10rpx;
		}
		.item-active {
			color: white;
		}
		.item-disable {
			background: #bfbfbf;
			color: gainsboro;
		}
	}
}

.count {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	height: 90rpx;
	margin-left: 20rpx;
	.info {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		.buy-count {
			font-size: 28rpx;
			font-weight: bold;
		}
		.remain-count {
			font-size: 24rpx;
			color: rgba(0, 0, 0, 0.8);
		}
	}
	.op {
		margin-right: 60rpx;
	}
}
.foot {
	height: 100rpx;
	color: white;
	line-height: 100rpx;
	text-align: center;
	font-size: 32rpx;
	.op {
		display: flex;
		width: 100%;
		.buy-now {
			width: 50%;
		}
		.add-cart {
			background-color: #ff976a;
			width: 50%;
		}
	}
}
</style>
