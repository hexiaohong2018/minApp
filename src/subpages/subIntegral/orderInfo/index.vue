<template>
	<view class="info">
		<view class="bar">
			<text>{{ orderInfo.sv_integral_pexchange_mode == 0 ? '自提时间' : '配送时间' }}</text>
			<text class="deliver-time">{{ orderInfo.sv_delivery_time }}</text>
			<template v-if="orderInfo.sv_integral_pexchange_mode == 0">
				<view class="content"><canvas class="bar" canvas-id="barcode"></canvas></view>
				<text class="number">核销码：22365985552365</text>
			</template>
		</view>
		<view class="order">
			<dc-list
				v-for="item in orderInfo.exchangedetaillist"
				:key="item.sv_integral_id"
				:title="item.sv_p_name"
				:label="`×${item.sv_pchangenumber}`"
				:icon="item.sv_p_images2"
				icon-size="100rpx"
			>
				<text>积分{{ item.sv_p_integralexchange }}</text>
			</dc-list>
		</view>
		<template v-if="orderInfo.sv_integral_pexchange_mode == 0">
			<dc-list title="店铺名称" :value="shopName" />
			<dc-list title="联系电话" :value="shopPhone" @click="onPhone">
				<template v-slot:right-icon>
					<view class="iconfont-vant icon-vant-phone-o" :style="{ color: '#ff852a' }"></view>
				</template>
			</dc-list>
			<dc-list title="店铺地址" :value="shopAddr" @click="navigatToShop">
				<template v-slot:right-icon>
					<view class="iconfont-vant icon-vant-location-o" :style="{ color: '#ff852a' }"></view>
				</template>
			</dc-list>
			<dc-list title="订单编号" :value="orderInfo.sv_integral_pexchange_no" />
			<dc-list title="订单时间" :value="orderInfo.sv_creation_date" />
		</template>
		<template v-else>
			<dc-list title="收货人" :value="orderInfo.sv_mr_name" />
			<dc-list title="联系电话" :value="orderInfo.sv_mr_mobile" />
			<dc-list title="收货地址" :value="orderInfo.sv_receipt_address" />
			<dc-list title="订单编号" :value="orderInfo.sv_integral_pexchange_no" />
			<dc-list title="订单时间" :value="orderInfo.sv_creation_date" />
		</template>
		<view class="home" @click="goHome"><view class="iconfont-vant icon-vant-wap-home" :style="{ fontSize: '50rpx' }"></view></view>
	</view>
</template>

<script>
import wxbarcode from 'wxbarcode';
import { Integral } from '../../../utils/class.js';
import { showToastFn } from '../../../utils/util.js';
import { mapGetters } from 'vuex';
import dcList from '../../../components/list/index.vue';
const integral = new Integral();
export default {
	data() {
		return {
			orderInfo: {},
			shopName: '',
			shopPhone: '',
			shopAddr: ''
		};
	},
	computed:{
		...mapGetters({
			shopInfo:'loginInfo/shopInfo'
		})
	},
	components: { dcList },
	methods: {
		goHome() {
			uni.switchTab({
				url: '../../../pages/integral/index'
			});
		},
		navigatToShop() {
			var shopInfo = this.shopInfo;
			if (!shopInfo.sv_us_coordinate || !shopInfo.shop_address) {
				showToastFn(!shopInfo.sv_us_coordinate ? '店铺坐标为空无法导航' : '店铺地址为空导航');
			} else {
				uni.openLocation({
					latitude: sv_us_coordinate.lat,
					longitude: sv_us_coordinate.lng,
					name: shopInfo.shop_address
				});
			}
		},
		onPhone() {
			const phoneNumber = this.shopInfo.storePhoneNumber;
			if (phoneNumber) {
				uni.makePhoneCall({
					phoneNumber
				});
			} else {
				showToastFn('联系电话空', 'fail');
			}
		}
	},

	onLoad(options) {
		integral
			.getOrderInfo(options.id)
			.then(res => {
				this.orderInfo = res;
				if (res.sv_integral_pexchange_mode == 0) {
					//这里通过核销码生成条形码，现在还没有数据
					wxbarcode.barcode('barcode', '132165465465421', 504, 108);
					let shopInfo = this.shopInfo;
					if (shopInfo) {
						this.shopName = shopInfo.shop_name;
						this.shopPhone = shopInfo.storePhoneNumber;
						this.shopAddr = shopInfo.shop_address;
					}
				}
			})
			.catch(msg => {
				showToastFn('获取订单详情失败');
				console.log(msg);
			});
	}
};
</script>

<style scoped lang="less">
.info {
	width: 100vw;
	.home {
		position: fixed;
		right: 30rpx;
		bottom: 100rpx;
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.3);
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.order {
		padding: 0px 20rpx;
		box-sizing: border-box;
		background: white;
		width: 100%;
		border-bottom: 1px solid #eee;
		.img {
			width: 100rpx;
			height: 100rpx;
			margin-right: 20rpx;
			image {
				width: 100%;
				height: 100%;
			}
		}
		text {
			color: #f67717;
		}
	}
	.bar {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		align-items: center;
		background: white;
		border-bottom: 10rpx solid #f8f8f8;
		font-size: 28rpx;
		box-sizing: border-box;
		padding: 30rpx 0rpx;
		.deliver-time {
			margin-top: 20rpx;
		}
		.content {
			margin: 20rpx auto;
			width: 540rpx;
			height: 108rpx;
			.bar {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
			}
		}
		.number {
			color: #3992f9;
			letter-spacing: 0.11rem;
		}
	}
}
</style>
