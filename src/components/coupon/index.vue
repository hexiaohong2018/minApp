<template>
	<movable-area class="coupon-contet" v-if="show">
		<movable-view class="coupons" direction="horizontal" inertia out-of-bounds :style="{width: (items.length*66)+ 'vw'}">
			<div class="coupon-item" v-for="item in items" :key="item.sv_coupon_id">
				<div class="des" :style="'background:linear-gradient(130deg,' + beginColor + ' 20%, ' + endColor + ')'">
					<div class="value">
						<span class="unit" v-if="item.sv_coupon_type == 0">￥</span>
						<span class="price">{{ item.sv_coupon_money }}</span>
						<span class="unit" v-if="item.sv_coupon_type != 0">折</span>
						<span class="name">{{ item.sv_coupon_name }}</span>
					</div>
					<div class="date">有效期:{{ `${item.sv_coupon_bendate}-${item.sv_coupon_enddate}` }}</div>
				</div>
				<div class="get" @click="onGet(item.sv_coupon_id)" :style="{ color: endColor }">
					<p>立 刻</p>
					<p>领 取</p>
				</div>
			</div>
		</movable-view>
	</movable-area>
</template>

<script>
	import {Coupon} from '../../utils/class.js'
	import {showToastFn} from '../../utils/util.js'
	
const coupon = new Coupon();
export default {
	props: {
		beginColor: {
			type: String,
			default: '#1abc9c'
		},
		endColor: {
			type: String,
			default: '#16a085'
		}
	},
	data() {
		return {
			show: false,
			items: []
		};
	},
	created() {
		//-1：全部 ，0:待使用，1:已使用，2:已失效，3:可领取
		coupon.getCouponList(3).then(res => {
			this.items = res;
			this.show = res.length > 0 ? true : false;
		});
	},
	methods: {
		onGet(id) {
			coupon
				.getCoupon(id)
				.then(res => {
					showToastFn('领取成功');
					this.items = this.items.filter(item => item.sv_coupon_id != id);
					this.show = this.items.length > 0 ? true : false;
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('领取失败');
				});
		}
	}
};
</script>

<style scoped lang="less">
.coupon-contet {
	width: 100vw;
	height: 200rpx;
	.coupons {
		// width: 150%;
		height: 100%;
		box-sizing: border-box;
		padding: 10rpx 10rpx;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		.coupon-item {
			width: 66vw;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-right: 10rpx;
			box-shadow: 0 -2px 3px -1px #eee, 0 2px 3px -1px #eee;
			.des {
				color: white;
				flex: 1;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-content: center;
				position: relative;
				overflow: hidden;
				.value {
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: flex-end;
					margin-bottom: 10rpx;
					box-sizing: border-box;
					font-size: 30rpx;
					.price {
						font-size: 50rpx;
					}
					.name {
						padding-left: 10rpx;
					}
				}

				.date {
					width: 100%;
					font-size: 20rpx;
					text-align: center;
				}
			}
			.des:before {
				content: '';
				width: 16rpx;
				position: absolute;
				top: 0;
				bottom: 0;
				left: -10rpx;
				background-image: url(https://res.decerp.cc/UploadImg/58139099/20200106144324915.png);
			}
			.get {
				height: 100%;
				width: 33%;
				font-size: 30rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				background: white;
				position: relative;
				overflow: hidden;
			}
			.get:after {
				position: absolute;
				content: '';
				width: 16rpx;
				top: 0;
				bottom: 0;
				right: -10rpx;
				z-index: 2;
				background-image: url(https://res.decerp.cc/UploadImg/58139099/20200106144324915.png);
			}
		}
	}
}
</style>
