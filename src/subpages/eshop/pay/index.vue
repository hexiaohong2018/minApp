<template>
	<view class="pay-content">
		<dc-nav-bar arrow clear-float :background="navColor">
			<template v-slot:title>
				<view class="tab">
					<view
						class="tab-item"
						:style="{ color: delivery == 0 ? navColor : inactiveColor, borderColor: inactiveColor, background: delivery == 0 ? inactiveColor : '' }"
						@click="navChange(0, configDeliverMode != '0' && configDeliverMode != '2')"
					>
						自提
					</view>
					<view
						class="tab-item"
						:style="{ color: delivery == 1 ? navColor : inactiveColor, borderColor: inactiveColor, background: delivery == 1 ? inactiveColor : '' }"
						@click="navChange(1, configDeliverMode != '1' && configDeliverMode != '2')"
					>
						配送
					</view>
				</view>
			</template>
		</dc-nav-bar>
		<button class="reg" v-if="memberCardInfo.member_id <= 0" open-type="getUserInfo" @getuserinfo="onReg"></button>
		<scroll-view class="pay" scroll-y>
			<view class="send-time">
				<dc-list :title="consignee" :label="addr" :is-link="delivery == '0' ? false : true" :url="delivery == '0' ? '' : '../../common/addressList/index'">
					<template v-slot:icon>
						<view class="iconfont-vant" :class="delivery == '0' ? 'icon-vant-shop-o' : 'icon-vant-location'"></view>
					</template>
				</dc-list>
				<image class="border" src="../../../static/border.png" mode="aspectFit"></image>
			</view>
			<view class="send-time" @click="onShowp"><dc-list :title="delivery == '0' ? '自提时间' : '配送时间'" :value="sendTime" is-link /></view>

			<ul class="producs">
				<view class="title">商品列表</view>
				<li class="item" v-for="(product, index) in cartInfo.cart_list" :key="product.product_id">
					<dc-list
						:icon="product.sv_p_images2"
						:title="product.sv_remark || product.sv_p_name"
						iconSize="150rpx"
						:border="index < cartInfo.cart_list.length - 1 ? true : false"
						style="width:100vw"
					>
						<template v-slot:label>
							<view class="des-price">
								<view class="des">{{ product.sv_p_specs }}</view>
								<view class="price">¥ {{ product.product_unitprice }}</view>
							</view>
						</template>
						<template v-slot:right-icon>
							<view class="num">x{{ product.sv_pricing_method == 1 ? product.sv_p_weight : product.product_num }}</view>
						</template>
					</dc-list>
				</li>
			</ul>
			<view class="discountinformation" v-if=" buystate==0 && memberCardInfo.sv_ml_commondiscount != 10">
				<view>优惠信息<text style="font-size: 24rpx;">（会员）</text></view>
				<view>享受<text class="colorbase1">{{ memberCardInfo.sv_ml_commondiscount }}</text>折</view>
			</view>
			<view v-if="delivery == 1" class="fr colorbase1">{{ freightInfo }}</view>
			<view v-if="buystate == 0" class="coupon">
				<dc-list :title="`优惠券${coupons[selectCouponIndex] ? ' 已选:' + coupons[selectCouponIndex].sv_coupon_name : ''}`" isLink @click="openCoupon">
					<text class="gray" v-if="!coupons[selectCouponIndex]">{{ invalidConponConts > 0 ? invalidConponConts + '张可用' : '无可用' }}</text>
					<text class="colorbase1" v-else>
						<block v-if="coupons[selectCouponIndex].sv_coupon_type == 1">{{ coupons[selectCouponIndex].sv_coupon_money }}折</block>
						<block v-else>-¥{{ coupons[selectCouponIndex].sv_coupon_money }}</block>
					</text>
				</dc-list>
			</view>
			<!-- 支付方式,type:0，前台支付，1，微信支付，2，余额支付 -->
			<radio-group class="pay-method" @change="checkedPayStyle">
				<view class="title">支付方式</view>
				<label v-if="payMethods['receptionPay']">
					<dc-list :title="delivery == 0 ? '前台支付' : '货到付款'" :style="{ width: '100vw' }">
						<template v-slot:icon>
							<view class="iconfont-vant icon-vant-balance-pay" style="color: #ff5c00;"></view>
						</template>
					</dc-list>
					<radio value="0" :color="checkedColor" :style="{ transform: 'scale(0.7)' }" :checked="pay_modle == 0"></radio>
				</label>
				<label v-if="payMethods['memberPay']">
					<dc-list title="储值卡支付" :style="{ width: '100vw' }">
						<template v-slot:icon>
							<view class="iconfont-vant icon-vant-debit-pay" style="color: orange;"></view>
						</template>
						<template v-slot:right-icon>
							<view class="momey" v-if="memberCardInfo.sv_mw_availableamount > 0">余额：{{ memberCardInfo.sv_mw_availableamount }}</view>
							<button class="pay-reg" v-if="memberCardInfo.member_id <= 0" open-type="getUserInfo" @getuserinfo="onReg">注册会员</button>
						</template>
					</dc-list>
					<radio value="2" :color="checkedColor" :style="{ transform: 'scale(0.7)' }" :checked="pay_modle == 2"></radio>
				</label>
				<label v-if="payMethods['wecahtPay']">
					<dc-list title="微信支付" :style="{ width: '100vw' }">
						<template v-slot:icon>
							<view class="iconfont-dc icon-dc-weixinzhifu" style="color: #006400;"></view>
						</template>
					</dc-list>
					<radio value="1" :color="checkedColor" :style="{ transform: 'scale(0.7)' }" :checked="pay_modle == 1"></radio>
				</label>
			</radio-group>

			<input class="uni-input" :value="remark" type="text" placeholder="填写备注信息" @blur="changeRemark" />
		</scroll-view>

		<dc-submit-bar buttonText="确定下单" :price="totalPriceWidthDeliver" @click="onSubmit">{{ delivery == 1 ? deliveryText : '' }}</dc-submit-bar>

		<w-picker mode="dateTime" :startYear="minDate" step="1" current @confirm="onConfirmTime" @cancel="onCancelTime" ref="dateTime"></w-picker>
		<uni-popup ref="popup" type="bottom" z-index="100">
			<radio-group @change="selectCoupon">
				<view class="coupon-title">
					优惠券
					<view class="iconfont-vant icon-vant-close" @click="cancelCoupon"></view>
				</view>
				<scroll-view class="coupon-container" scroll-y>
					<label v-for="(coupon, index) in coupons" :key="coupon.sv_coupon_id" @click="$event.stopPropagation()">
						<dc-template-coupon :coupon="coupon" margin="0" :style="{ width: '81vw', marginRight: '10rpx' }" :color="navColor"></dc-template-coupon>
						<radio :style="{ transform: 'scale(0.7)' }" :color="checkedColor" :value="index" :disabled="coupon.disabled" :checked="coupon.checked"></radio>
					</label>
				</scroll-view>
			</radio-group>
		</uni-popup>
	</view>
</template>

<script>
import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue';
import wPicker from '@/components/w-picker/w-picker.vue';
import dcList from '@/components/list/index.vue';
import dcNavBar from '../../../components/navBar/index.vue';
import uniPopup from '../../../components/uni-popup/uni-popup.vue';
import dcTemplateCoupon from '../../../components/template/coupon/index.vue';
import dcSubmitBar from '../../../components/submit-bar/index.vue';
import { mapGetters } from 'vuex';

import { showToastFn, formatTime, isDeepColor, setActiveColor, showModalFn } from '../../../utils/util.js';
import { CartList, Address, Coupon, User, Pay, netRequest, GroupBuy } from '../../../utils/class.js';
const cart = new CartList();
const address = new Address();
const coupon = new Coupon();
const user = new User();
const pay = new Pay();
const groupBuy = new GroupBuy();

export default {
	components: { uniNumberBox, wPicker, dcList, dcNavBar, uniPopup, dcTemplateCoupon, dcSubmitBar },
	data() {
		return {
			coupons: [],
			selectCouponIndex: -1,
			cartInfo: null,
			totalPrice: 0, //计算后的总结，不含运费
			addr: '填写收货地址', //收货地址
			consignee: '', //收货人
			delivery:1,
			remark: '',
			deliveryAddr: '', //收货地址
			deliveryPerson: '', //收货人
			deliveryPhone: '', //收货人电话
			sv_receipt_id: '0', //地址ID
			pay_modle: 1, //用户选择的支付方式
			kilometer: 10000, //当前地址与店铺的距离
			pack_cost: 0, //打包费

			sendTime: '选定时间', //发货/提货时间
			minDate: new Date().getFullYear(),

			num: 1, //兑换个数
			limit_num: 0, //最多可兑换数量
			activityInfo: null, //拼团，秒杀活动信息
			buystate: 0, //一般购买，1拼团,2秒杀
			configDeliverMode: 2 //商家后台配置的支持配送的方式，2支持自提和配送，0只支持自提，1只支持配送
		};
	},
	computed: {
		...mapGetters({
			memberCardInfo: 'loginInfo/memberCardInfo',
			shopInfo:'loginInfo/shopInfo',
			navColor:'custom/navColor'
		}),
		inactiveColor() {
			return isDeepColor(this.navColor) ? 'rgba(255,255,255,.8)' : 'rgba(0,0,0,.3)';
		},
		checkedColor() {
			return setActiveColor(this.navColor, '#f44');
		},
		invalidConponConts() {
			return this.coupons.filter(item => !item.disabled).length;
		},
		payMethods() {
			return this.delivery == 0 ? this.shopInfo.shopPay : this.shopInfo.takeOutFoodPay;
		},
		totalPriceWidthDeliver() {
				var freight = this.shopInfo.freight || {},
				cartTotalPrice = this.totalPrice || 0;
			return this.delivery == 0 ? cartTotalPrice 
			: cartTotalPrice >= freight.sv_money_satisfy ? cartTotalPrice 
			:cartTotalPrice + freight.sv_move_freight;
		},
		freightInfo() {
			var freight = this.shopInfo.freight;
			return `${freight.sv_delivery_rise > 0 ? '满' + freight.sv_delivery_rise + '元起送' : ''}
			${freight.sv_move_freight > 0 ? ' 运费' + freight.sv_move_freight + '元' : ''}
			${freight.sv_money_satisfy > 0 ? ' 满' + freight.sv_money_satisfy + '元免运费' : ''}`;
		},

		deliveryText() {
			if (this.cartInfo) {
				var deliveryText = '',
					freight = this.shopInfo.freight,
					totalPrice = this.cartInfo.total_price;
				if (this.delivery == '1') {
					if (freight) {
						if (totalPrice > 0 && totalPrice < freight.sv_delivery_rise) {
							let canDeliver = parseFloat((freight.sv_delivery_rise - totalPrice).toFixed(2) || 0);
							deliveryText = '(还差' + canDeliver + '元可配送)';
						} else {
							if (totalPrice >= freight.sv_money_satisfy) {
								deliveryText = '(免运费)';
							} else {
								let freightFree = parseFloat((freight.sv_money_satisfy - totalPrice).toFixed(2) || 0);
								deliveryText = '(差' + freightFree + '元可免' + freight.sv_move_freight + '元运费)';
							}
						}
					}
				}
				return deliveryText;
			} else {
				return '';
			}
		}
	},
	onLoad() {
		this.activityInfo = uni.getStorageSync('activityInfo'); //拼团，秒杀活动信息;
		this.configDeliverMode = this.activityInfo.deliver || 2;
		//用户选择配送方式,0自提，1配送，2两者都支持
		this.delivery =  this.configDeliverMode == 2 ? 1 : this.configDeliverMode;
		this.buystate = this.activityInfo.buystate ? this.activityInfo.buystate : 0; //如果是活动，不显示优惠券
		uni.removeStorage({ key: 'activityInfo' });
		
		//activityInfo.productid是否拼团
		Promise.all([
			this.activityInfo.productid
				? groupBuy.getShoppingCartList(this.activityInfo.productid, this.activityInfo.product_num, this.activityInfo.assembleconfigid, this.activityInfo.buystate)
				: cart.getCartList('',this.delivery),
			coupon.getCouponList(0),
			user.getMemberCardInfo()
		]).then(values => {
			this.cartInfo = values[0];
			this.totalPrice = this.cartInfo.total_price;
			this.coupons = values[1].map(item => {
				item.checked = false;
				item.disabled = this.cartInfo.total_price >= item.sv_coupon_use_conditions ? false : true;
				return item;
			});
		});
	},
	onShow() {
		// this.pay_modle = this.memberCardInfo.sv_mw_availableamount > 0 ? 2 : 1; //余额足够则余额支付，否则微信

		//获取地址信息
		address.getAddressList({ def: true }).then(addr => {
			if (addr) {
				this.deliveryPhone = addr.sv_receipt_phone;
				this.deliveryPerson = addr.sv_receipt_name;
				this.sv_receipt_id = addr.sv_receipt_id;
				this.deliveryAddr = addr.pcdAddress + addr.instructions;
				this._setDelivery(this.delivery || '0');
				//计算店铺与所选地址的距离
				var sv_receipt_mlanlat = addr && addr.sv_receipt_mlanlat && JSON.parse(addr.sv_receipt_mlanlat),
					shopInfo = this.shopInfo || this.shopInfo,
					sv_us_coordinate = shopInfo.sv_us_coordinate; //店铺坐标
				//启用定位功能
				if (!shopInfo.dis_lbs && sv_us_coordinate && sv_receipt_mlanlat) {
					this.kilometer = parseInt(app.getDistance(sv_receipt_mlanlat.latitude, sv_receipt_mlanlat.longitude, sv_us_coordinate.lat, sv_us_coordinate.lng));
				}
			}
		});
	},
	methods: {
		_setCartListInfo() {
			var activityInfo = this.activityInfo,
				configDeliverMode = activityInfo.deliver || 2;
			this._getCartlist(activityInfo).then(cartList => {
				this.setData(
					{
						//设置购物车信息
						cartListInfo: cartList,
						configDeliverMode: configDeliverMode,
						delivery: configDeliverMode == 2 ? 1 : configDeliverMode
					},
					function() {
						this.setData({
							totalPrice: this._setTotalPrice()
						});
					}
				);
			});
		},

		//跳转到下单成功页
		/**
		 * @param {*} orderId
		 * @param {*} shopID 店铺ID
		 * @param {*} msg 提示消息
		 */
		_printCallback({ orderId, shopID, msg }) {
			msg && msg != '支付成功' && showToastFn(msg);
			let activityInfo = this.activityInfo,
				url = '../../subEshop/paySuccess/index?orderId=' + orderId;
			if (activityInfo.assembleconfigid) {
				url =
					url +
					'&cid=' +
					activityInfo.assembleconfigid +
					'&pid=' +
					activityInfo.productid +
					'&picUrl=' +
					activityInfo.picUrl +
					'&buystate=' +
					activityInfo.buystate +
					'&pmid=' +
					activityInfo.product_main_id;
			}
			netRequest
				.printCallback(shopID) //后台发出声音
				.then(res => {
					if (msg != '支付成功') {
						uni.reLaunch({
							url
						});
					} else {
						var time = 10;
						var timer = setInterval(function() {
							if (time == 0) {
								clearInterval(timer);
								uni.reLaunch({
									url
								});
							} else {
								showToastFn(`支付成功：${time--}s`);
							}
						}, 1000);
					}
				})
				.catch(msg => {
					if (msg != '支付成功') {
						uni.reLaunch({
							url
						});
					} else {
						var time = 10;
						var timer = setInterval(function() {
							if (time == 0) {
								clearInterval(timer);
								uni.reLaunch({
									url
								});
							} else {
								showToastFn(`支付成功：${timer--}s`);
							}
						}, 1000);
					}
				});
		},

		_prePayOrder(index) {
			return pay.prePayOrder({
				sv_remark: this.remark,
				sv_shipping_methods: this.delivery, //配送方式
				sv_payment_type: 0, // 支付方式
				member_id: this.memberCardInfo.member_id, //会员id
				sv_receipt_id: this.sv_receipt_id, //外卖地址
				sv_coupon_id: index ? this.coupons[index].sv_coupon_id : 0,
				sv_record_id: index ? this.coupons[index].sv_record_id : 0,
				sv_delivery_time: '',
				form_id: ''
			});
		},

		checkedPayStyle(e) {
			this.pay_modle = e.detail.value;
		},
		openCoupon() {
			this.$refs.popup.open();
		},
		selectCoupon(e) {
			var index = e.detail.value;
			this.$refs.popup.close();
			this._prePayOrder(index)
				.then(res => {
					this.totalPrice = res.sv_order_actual_money;
					this.selectCouponIndex = index; //选择的优惠券ID
					this.coupons[index].checked = true;
				})
				.catch(err => {
					showToastFn('选择优惠券失败：' + err.errmsg);
					this.coupons[index].checked = false;
					this.selectCouponIndex = -1;
					console.log(err);
				});
		},
		//取消优惠券选择
		cancelCoupon() {
			this.$refs.popup.close();
			this._prePayOrder().then(res => {
				
				this.totalPrice = res.sv_order_actual_money;
				this.selectCouponIndex > -1 && (this.coupons[this.selectCouponIndex].checked = false);
				this.selectCouponIndex = -1; //选择的优惠券ID
			});
		},
		navChange(index, disabled) {
			if (disabled) {
				showToastFn(`不支持${index == 0 ? '自提' : '配送'}方式`);
				return;
			}

			var delivery = this.delivery;
			if (delivery != index) {
				this.delivery = index;
				this._setDelivery(this.delivery || '0');
			}
		},
		onReg(e) {
			uni.setStorageSync('userInfo', e.detail.userInfo);
			uni.navigateTo({
				url: '../../common/reg/index'
			});
		},
		_setDelivery(delivery) {
			if (delivery == 0) {
				//自提
				this.consignee = this.shopInfo.storePhoneNumber ? `${this.shopInfo.shop_name}(${this.shopInfo.storePhoneNumber})` : this.shopInfo.shop_name;
				this.addr = this.shopInfo.shop_address;
			} else {
				//配送，或两者都支持
				this.delivery = 1;
				this.consignee = this.deliveryPhone ? `${this.deliveryPerson}(${this.deliveryPhone})` : this.deliveryPhone;
				this.addr = this.deliveryAddr || '填写收货地址';
			}
		},
		goToProductInfo(e) {
			uni.navigateTo({
				url: '../../integral/productInfo/index?id=' + e.currentTarget.dataset.id
			});
		},
		onShowp() {
			this.$refs.dateTime.show();
		},
		onConfirmTime(e) {
			this.sendTime = e.result;
		},
		onCancelTime(e) {
			this.sendTime = '选定时间';
		},

		onSubmit() {
			if (this.shopInfo.enableDoBusiness) {
				//是否营业
				let delivery = this.delivery, //配送方式方式
					sv_payment_type = this.pay_modle, //支付方式
					totalPrice = this.totalPrice + this.pack_cost,
					freight = this.shopInfo.freight, //运费信息
					sv_receipt_id = this.sv_receipt_id, //地址id
					selectCouponIndex = this.selectCouponIndex,
					coupons = this.coupons;

				//如果是送货上门
				if (delivery == 1) {
					if (sv_receipt_id <= 0) {
						//没有收货地址
						showToastFn('请添加收货地址');
						return;
					}
					//店铺开启定位，并且超出配送距离
					if (!this.shopInfo.dis_lbs && this.kilometer > this.shopInfo.sv_us_range) {
						showToastFn('超出配送范围');
						return;
					}
					//不满足配送条件
					if (totalPrice < freight.sv_delivery_rise) {
						showToastFn('还差' + (freight.sv_delivery_rise - totalPrice).toFixed(2) + '元可配送');
						return;
					}
				}
				if (sv_payment_type == 2 && this.memberCardInfo.sv_mw_availableamount < totalPrice) {
					//储值卡支付
					showModalFn('储值卡余额不足，是否去充值', function() {
						uni.navigateTo({
							url: '../../subEshop/recharge/index'
						});
					});
					return;
				}

				var sendTime = null;
				if (this.sendTime != '选定时间') {
					sendTime = new Date(this.sendTime);
					if (sendTime - new Date() <= 120000) {
						showToastFn('配送时间不符合要求，必须比当前大于2分钟以上');
						return;
					} else {
						sendTime = sendTime.setHours(sendTime.getHours(), sendTime.getMinutes() - sendTime.getTimezoneOffset(), sendTime.getSeconds());
					}
				}

				//确定支付
				let params = {
					sv_remark: this.sv_remark,
					sv_shipping_methods: delivery, //配送方式
					sv_payment_type, // 支付方式
					member_id: this.memberCardInfo.member_id, //会员id
					sv_receipt_id, //外卖地址
					sv_coupon_id: selectCouponIndex > -1 ? coupons[selectCouponIndex].sv_coupon_id : 0,
					sv_record_id: selectCouponIndex > -1 ? coupons[selectCouponIndex].sv_record_id : 0,
					sv_delivery_time: sendTime,
					form_id: ''
				};

				let activityInfo = this.activityInfo,
					is_groupBuy = activityInfo.assembleconfigid ? true : false;
				//一键开团
				if (is_groupBuy) {
					params.is_assemble = activityInfo.isAssemble; // 是否开团;(0:参团;1:开团;)
					params.sv_assemble_id = activityInfo.isAssemble == 0 ? activityInfo.assembleid : ''; //参团ID(is_assemble 为0时必填，为1时 为空)
					params.sv_product_num = activityInfo.product_num; // 购买数量
					params.sv_assemble_config_id = activityInfo.assembleconfigid; // 拼团信息
					params.buystate = activityInfo.buystate;
					params.sv_product_id = activityInfo.productid;
				}

				pay[is_groupBuy ? 'fastBuy' : 'payOrder'](params)
					.then(res => {
						if (res.succeed) {
							let orderId = res.values;
							let shopID = res.result;
							//微信支付
							if (sv_payment_type == 1) {
								pay.weChatPay(res.values, totalPrice)
									.then(res => {
										this._printCallback({
											orderId,
											shopID,
											msg: '支付成功'
										});
									})
									.catch(msg => {
										this._printCallback({
											orderId,
											shopID,
											msg: '支付失败：' + msg
										});
									});
							} else {
								//其他支付
								this._printCallback({
									orderId,
									shopID,
									msg: sv_payment_type == 0 ? '等待付款' : '支付成功'
								});
							}
						} else {
							this._printCallback({
								orderId,
								shopID,
								msg: '支付失败'
							});
						}
					})
					.catch(msg => {
						console.log(msg);
						showToastFn('支付失败:' + msg.errmsg);
					});
			} else {
				//店铺暂停营业
				showToastFn('当前店铺已暂停营业');
			}
		},
		changeRemark(e) {
			this.remark = e.detail.value;
		}
	}
};
</script>

<style lang="less" scoped>
.pay-content {
	width: 100vw;
	box-sizing: border-box;
	background: white;
	position: relative;
	// margin-bottom: 90px;
	.tab {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 100%;
		font-size: 30rpx;
		box-sizing: border-box;
		.tab-item {
			border: 1px solid;
			min-width: 125rpx;
			text-align: center;
			font-weight: bold;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 8rpx 20rpx;
		}
		.tab-item:first-child {
			border-top-left-radius: 20rpx;
			border-bottom-left-radius: 20rpx;
		}
		.tab-item:last-child {
			border-top-right-radius: 20rpx;
			border-bottom-right-radius: 20rpx;
		}
		.tab-item:first-child {
			border-right: 0;
		}
	}
	.reg {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		background-color: transparent;
	}
	.reg:after {
		border: 0;
	}
	.pay {
		min-height: 100vh;
		width: 100vw;
		padding-bottom: 100px;
		box-sizing: content-box;
	}
	.delivery {
		font-size: 30rpx;
		border-bottom: 1px solid #eee;
		display: flex;
		padding: 40rpx 20rpx;
		font-weight: 600;
		label {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		label:last-child {
			margin-left: 30rpx;
		}
	}
	.send-time {
		width: 100%;
		padding: 20rpx 0rpx;
		font-weight: 600;
		position: relative;
		.iconfont-vant {
			font-size: 32rpx;
			color: #3992f9;
		}
		.border {
			position: absolute;
			width: 92%;
			height: 10rpx;
			left: 50%;
			transform: translateX(-50%);
		}
	}
	.title {
		font-size: 28rpx;
		color: #333;
		padding: 30rpx 20rpx;
	}
	.producs {
		border-top: 20rpx solid #f8f8f8;
		border-bottom: 1px solid #eee;
		padding-bottom: 10rpx;

		.item {
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			.des-price {
				font-size: 26rpx;
				width: 100%;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				height: 100%;
				color: #999;
				.des {
					padding: 8rpx 0rpx;
				}
				.price {
					color: #f44;
					font-size: 24rpx;
				}
			}
			.num {
			}
		}
	}
	.coupon {
		.gray {
			color: #666;
		}
	}
	.discountinformation {
		height: 70rpx;
		line-height: 70rpx;
		font-size: 26rpx;
		display: flex;
		background: white;
		justify-content: space-between;
		padding-left: 25rpx;
		padding-right: 25rpx;
	}
	.colorbase1 {
		color: #ff5c00;
		background: white;
		text-align: right;
		font-size: 26rpx;
	}
	.fr {
		width: 100vw;
		box-sizing: border-box;
		padding: 10rpx 25rpx 10rpx 0;
	}
	.pay-method {
		border-top: 20rpx solid #f8f8f8;
		.pay-reg {
			background-color: transparent;
			font-size: 28rpx;
			color: #f44;
			margin: 0;
			padding: 0;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.pay-reg::after {
			border: 0;
		}
		.momey {
			color: #f44;
			font-size: 24rpx;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.iconfont-vant,
		.iconfont-dc {
			font-size: 40rpx;
		}
		label {
			width: 100vw;
			box-sizing: border-box;
			padding-right: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			border-bottom: 1px solid #f8f8f8;
		}
	}
	.uni-input {
		font-size: 26rpx;
		padding: 10rpx 20rpx;
		// margin-bottom: 140rpx;
	}

	.submit-bar {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100vw;
		display: flex;
		align-items: center;
		height: 110rpx;
		font-size: 32rpx;
		font-weight: border;
		box-shadow: 0 -1px 2px 1px #eee;
		z-index: 1000;
		background-color: white;
		.total {
			flex: 1;
			height: 100%;
			box-sizing: border-box;
			padding-left: 30rpx;
			display: flex;
			align-items: center;
			text {
				color: #ee0a24;
			}
		}
		.btn {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 30%;
			height: 100%;
			// background-color: #f44;
			color: white;
		}
		.btn:active {
			opacity: var(--active-opacity);
		}
	}
	.coupon-title {
		width: 100vw;
		height: 90rpx;
		background-color: white;
		line-height: 90rpx;
		text-align: center;
		font-size: 30rpx;
		font-weight: bolder;
		border-radius: 20rpx 20rpx 0 0;
		border-bottom: 1px solid #eee;
		position: relative;
		.iconfont-vant {
			font-size: 44rpx;
			position: absolute;
			right: 16rpx;
			top: 50%;
			transform: translateY(-50%);
			color: #666;
			font-weight: 500;
		}
	}
	.coupon-container {
		width: 100vw;
		height: 900rpx;
		background: white;
		box-sizing: border-box;
		padding-bottom: 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		label {
			width: 98%;
			margin: auto;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 30rpx;
		}
	}
}
</style>
