<template>
	<view class="shops-content">
		<!-- <uni-search-bar placeholder="请输入分店的名称" @confirm="onSearch" @cancel="onCancel"></uni-search-bar> -->
		<view class="nearest">
			<view class="head">离你最近的店铺</view>
			<dc-list :title="nearShop.sv_us_name" :label="nearShop.sv_us_address" :value="nearShop.distance ? nearShop.distance + 'km' : ''" @click="onSelect(nearShop.user_id)">
				<template v-slot:icon>
					<view class="iconfont-dc icon-dc-fendian" style="font-size: 80rpx"></view>
				</template>
			</dc-list>
			<view class="btns">
				<view class="phone" v-if="nearShop.phone" @click="onPhone(nearShop.phone)">
					<view class="iconfont-vant icon-vant-phone-o"></view>
					{{ nearShop.phone }}
				</view>
				<view class="navigator" v-if="nearShop.sv_us_coordinate && nearShop.sv_us_coordinate.lat" @click="onNavigat(nearShop.sv_us_coordinate, nearShop.sv_us_address)">
					<view class="iconfont-vant icon-vant-location-o"></view>
					导航去这里
				</view>
			</view>
		</view>
		<view class="content">
			<view class="head">所有店铺</view>
			<view class="shop" v-for="shop in shopList" :key="shop.user_id">
				<dc-list :title="shop.sv_us_name" :label="shop.sv_us_address" :value="shop.distance ? shop.distance + 'km' : ''" @click="onSelect(shop.user_id)">
					<template v-slot:icon>
						<view class="iconfont-dc icon-dc-fendian" style="font-size: 80rpx"></view>
					</template>
				</dc-list>
				<view class="btns">
					<view class="phone" v-if="shop.phone" @click="onPhone(shop.phone)">
						<view class="iconfont-vant icon-vant-phone-o"></view>
						{{ shop.phone }}
					</view>
					<view class="navigator" v-if="shop.sv_us_coordinate && shop.sv_us_coordinate.lat" @click="onNavigat(shop.sv_us_coordinate, shop.sv_us_address)">
						<view class="iconfont-vant icon-vant-location-o"></view>
						导航去这里
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import dcList from '../../../components/list/index.vue';
import uniSearchBar from '../../../components/uni-search-bar/uni-search-bar.vue';
import { getDistance } from '../../../utils/util.js';
import { Address } from '../../../utils/class.js';
import store from '../../../utils/store.js';
const address = new Address();
export default {
	components: { dcList, uniSearchBar },
	data() {
		return {
			shopList: [],
			// searchList: [],
			nearShop: null
		};
	},
	onLoad() {
		let shopList = this.$store.getters['loginInfo/shopInfo'].shopList;
		//获取当前位置
		address.location({
			wxFn: uni.getLocation,
			success: res => {
				this.shopList = shopList.map(shop => {
					shop.sv_us_coordinate && (shop.distance = Math.ceil(getDistance(shop.sv_us_coordinate.lat, shop.sv_us_coordinate.lng, res.latitude, res.longitude)));
					return shop;
				});
				var min = Infinity;
				shopList.forEach(item => {
					min = item.distance < min ? item.distance : min;
				});
				this.nearShop = shopList.find(shop => shop.distance == min);
			},
			fail: msg => {
				console.log(msg);
			},
			content: '位置权限用于定位离你最近的店铺'
		});
	},
	methods: {
		onPhone(phoneNumber) {
			uni.makePhoneCall({ phoneNumber });
		},
		onNavigat(coordinate, name) {
			uni.openLocation({
				latitude: coordinate.lat,
				longitude: coordinate.lng,
				scale: 14,
				name: name
			});
		},
		onSelect(uid) {
			store.dispatch('setSalesUserId', uid);
			uni.navigateBack({
				delta: 1
			});
		},
		// onSearch(e) {
		// 	this.searchList = this.shopList.filter(item => {
		// 		return item.sv_us_name.indexOf(e.value) > -1;
		// 	});
		// },
		// onCancel() {
		// 	this.searchList = [];
		// }
	}
};
</script>

<style lang="less" scoped>
.shops-content {
	width: 100vw;
	min-height: 100vh;
	.head {
		height: 50rpx;
		width: 100%;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		background-color: white;
		padding: 0 30rpx;
		font-weight: 600;
	}
	.btns {
		width: 100%;
		height: 88rpx;
		display: flex;
		justify-content: space-between;
		background-color: white;
		border-top: 1px solid #eee;
	}
	.phone,
	.navigator {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #666;
		border-right: 1px solid #eee;
		.iconfont-vant {
			margin-right: 15rpx;
		}
	}
	.navigator {
		.iconfont-vant {
			color: green;
		}
	}
	.phone {
		.iconfont-vant {
			color: #ff852a;
		}
	}
	.phone:active,
	.navigator:active {
		opacity: var(--active-opacity);
	}
	.nearest {
		width: 100%;
		margin-bottom: 20rpx;
	}
	.content {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		.shop {
			width: 100%;
			margin-bottom: 20rpx;
		}
	}
}
</style>
