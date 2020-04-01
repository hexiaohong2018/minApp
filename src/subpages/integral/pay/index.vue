<template>
	<view class="pay">
		<button class="reg" v-if="memberInfo.member_id <= 0" open-type="getUserInfo" @getuserinfo="onReg"></button>
		<radio-group @change="onChange">
			<label>
				<radio
					value="0"
					:disabled="product.deliveryMode != '0' && product.deliveryMode != '2'"
					:checked="delivery == '0'"
					color="#FF852A"
					:style="{ transform: 'scale(0.7)' }"
				/>

				自提
			</label>
			<label>
				<radio
					value="1"
					:disabled="product.deliveryMode != '1' && product.deliveryMode != '2'"
					:checked="delivery == '1'"
					color="#FF852A"
					:style="{ transform: 'scale(0.7)' }"
				/>

				配送
			</label>
		</radio-group>
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
			<li class="item">
				<image :src="product.sv_p_images2" mode="aspectFit" :data-id="product.product_id" @click="goToProductInfo"></image>
				<view class="des">
					<view class="content">{{ product.sv_remark || product.sv_p_name }}</view>
					<view class="integral">{{ `积分${product.sv_p_integral}` }}</view>
				</view>
				<uni-number-box :value="num" :min="1" :max="limit_num" @change="onStepperChange" button-size="28px" input-width="28px"></uni-number-box>
			</li>
		</ul>
		<input class="uni-input" :value="remark" type="text" placeholder="填写备注信息" @blur="changeRemark" />
		<view class="submit-bar">
			<view class="total">
				合计：
				<text>{{ product.sv_p_integral * num }}积分</text>
			</view>
			<view class="btn" @click="onSubmit">兑换</view>
		</view>
		<w-picker mode="dateTime" :startYear="minDate" step="1" current @confirm="onConfirmTime" @cancel="onCancelTime" ref="dateTime"></w-picker>
	</view>
</template>

<script>
import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue';
import wPicker from '@/components/w-picker/w-picker.vue';
import dcList from '@/components/list/index.vue';

import { showToastFn, formatTime } from '../../../utils/util.js';
import { Integral, Address } from '../../../utils/class.js';
import {mapGetters} from 'vuex';
const integral = new Integral();
const addr = new Address();
export default {
	components: { uniNumberBox, wPicker, dcList },
	data() {
		return {
			product: null, //积分兑换的商品
			addr: '填写收货地址', //收货地址
			consignee: '', //收货人
			delivery: '0', //配送方式,0自提，1配送，2两者都支持
			remark: '',
			deliveryAddr: '', //收货地址
			deliveryPerson: '', //收货人
			deliveryPhone: '', //收货人电话
			sv_receipt_id: '0', //地址ID
			sendTime: '选定时间', //发货/提货时间
			num: 1, //兑换个数
			minDate: new Date().getFullYear(),
			limit_num: 0 //最多可兑换数量
		};
	},
	onLoad() {
		var product = uni.getStorageSync('product');
		this.limit_num = product.sv_is_limit_exchange ? Math.min(product.sv_limit_exchangenum, product.sv_p_integralsurplus) : product.sv_p_integralsurplus;
		this._setDelivery(product.deliveryMode);
		product.num = 1; //默认一个数量
		this.product = product;
		uni.removeStorage({
			key: 'product'
		});
	},
	onShow() {
		addr.getAddressList({ def: true }).then(res => {
			this.deliveryPhone = res.sv_receipt_phone;
			this.deliveryPerson = res.sv_receipt_name;
			this.sv_receipt_id = res.sv_receipt_id;
			this.deliveryAddr = res.pcdAddress + res.instructions;
			this._setDelivery(this.delivery || '0');
		});
	},
	computed:{
		...mapGetters({
			memberInfo:'loginInfo/memberInfo',
			shopInfo:'loginInfo/shopInfo'
		})
	},
	methods: {
		onReg(e) {
			uni.setStorageSync('userInfo', e.detail.userInfo);
			uni.navigateTo({
				url: '../common/reg/index'
			});
		},
		formatter(type, value) {
			if (type === 'year') {
				return `${value}年`;
			} else if (type === 'month') {
				return `${value}月`;
			} else if (type === 'day') {
				return `${value}日`;
			} else if (type === 'hour') {
				return `${value}时`;
			} else if (type === 'minute') {
				return `${value}分`;
			}
			return value;
		},
		_setDelivery(delivery) {
			if (delivery == 0) {
				//自提
				this.consignee = `${this.shopInfo.shop_name}(${this.shopInfo.storePhoneNumber})`;
				this.addr = this.shopInfo.shop_address;
			} else {
				//配送，或两者都支持
				this.delivery = 1;
				this.consignee = `${this.deliveryPerson}(${this.deliveryPhone})`;
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

		onChange(e) {
			this.delivery = e.detail.value;
			this._setDelivery(this.delivery);
		},
		onStepperChange(num) {
			if (this.product.sv_p_integral * num > this.memberInfo.sv_mw_availablepoint) {
				showToastFn('积分不够');
			} else {
				this.num = num;
				this.product.num = num;
			}
		},
		onSubmit() {
			if (this.product.num <= 0) {
				showToastFn('兑换数量必须大于0');
				return;
			}
			if (this.product.sv_p_integralsurplus <= 0) {
				showToastFn('商品剩余数量为0');
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

			integral
				.order({
					sv_integral_pexchange_mode: this.delivery,
					sv_integral_pexchange_source: 1,
					sv_receipt_id: this.sv_receipt_id,
					sv_delivery_time: new Date(sendTime), //配送时间
					products: this.product,
					sv_remark: this.remark
				})
				.then(res => {
					showToastFn('兑换成功');
					setTimeout(() => {
						uni.navigateTo({
							url: '../../subIntegral/orderSuccess/index?id=' + res.integral_pexchange_no
						});
					}, 1500);
				})
				.catch(msg => {
					showToastFn(msg.errmsg || '兑换失败');
					console.log(msg);
				});
		},
		changeRemark(e) {
			this.remark = e.detail.value;
		},
		limit(e) {
			if (e.detail == 'plus') {
				var product = this.product;
				if (product.sv_is_limit_exchange && product.sv_limit_exchangenum < product.sv_p_integralsurplus) {
					showToastFn('不能超过最大兑换数量');
				} else {
					showToastFn('库存不足');
				}
			}
		}
	}
};
</script>

<style lang="less" scoped>
.pay {
	width: 100vw;
	height: 100vh;
	box-sizing: border-box;
	background: white;
	position: relative;
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
	radio-group {
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
			font-size: 35rpx;
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
	.producs {
		border-top: 26rpx solid #f8f8f8;
		border-bottom: 1px solid #eee;
		padding-bottom: 10rpx;
		.title {
			font-size: 28rpx;
			color: #333;
			padding: 30rpx 20rpx;
		}
		.item {
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			box-sizing: border-box;
			padding: 30rpx;
			font-size: 24rpx;
			image {
				width: 130rpx;
				height: 130rpx;
				margin-right: 10rpx;
			}
			.des {
				flex: 1;
				display: flex;
				flex-direction: column;
				.content {
					width: 320rpx;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					padding-bottom: 20rpx;
				}
				.integral {
					color: #ff852a;
				}
			}
		}
	}
	.uni-input {
		font-size: 26rpx;
		padding: 10rpx 20rpx;
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
			background-color: #f44;
			color: white;
		}
		.btn:active {
			opacity: var(--active-opacity);
		}
	}
}
</style>
