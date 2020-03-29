<template>
	<li class="group-item" :key="product.assembleconfigid">
		<view class="img" :style="{ backgroundImage: `url(${product.sv_p_images})` }" @click="onBuy(product.assembleconfigid, product.assembledetailpid)"></view>
		<div class="des">
			<div class="content">{{ product.des }}</div>
			<div v-if="finish" class="end-time" :style="{ color: color }">活动结束</div>
			<view v-else class="end-time">
				<uni-countdown
					:color="color"
					:splitor-color="color"
					:show-day="Boolean(day)"
					:day="day"
					:hour="hours"
					:minute="minutes"
					:second="seconds"
					@timeup="timeUp"
				></uni-countdown>
			</view>
		</div>
		<div class="price">
			<div class="value" :style="{ color: color }">
				<div class="g-value">￥{{ product.groupPrice }}</div>
				<div class="s-value">单买价：{{ product.singlePrice }}</div>
				<div class="num" :style="{ borderColor: color }">{{ product.groupNum }}人团</div>
			</div>
			<div class="buy" v-if="isDisplay" :style="{ background: color, opacity: finish ? 0.5 : 1 }" @click="onBuy(product.assembleconfigid, product.assembledetailpid)">
				去拼团
			</div>
			<div v-else class="share" @click="$emit('share', { id: product.assembledetailpid, cid: product.assembleconfigid })">
				<view class="iconfont-vant icon-vant-share" :style="{ color: color, fontSize: '45rpx' }"></view>
			</div>
		</div>
	</li>
</template>

<script>
// import dcAd from '../ad/index.vue';
import uniCountdown from '@/components/uni-countdown/uni-countdown.vue';
import { formatDuring } from '../../utils/util.js';
export default {
	data() {
		return {
			finish: false
		};
	},
	props: {
		product: {
			type: Object,
			default: null
		},
		color: {
			type: String,
			default: '#f44'
		},
		isDisplay: {
			type: Boolean,
			default: true
		}
	},
	components: {
		uniCountdown
	},
	computed: {
		day() {
			return formatDuring(this.product.mms).day;
		},
		hours() {
			return formatDuring(this.product.mms).hours;
		},
		minutes() {
			return formatDuring(this.product.mms).minutes;
		},
		seconds() {
			return formatDuring(this.product.mms).seconds;
		}
	},

	methods: {
		timeUp() {
			this.finish = true;
		},
		onBuy(assembleconfigid, assembledetailpid) {
			if (this.finish) {
				return;
			}
			this.$emit('buy', { cid: assembleconfigid, id: assembledetailpid });
		}
	}
};
</script>

<style scoped lang="less">
.group-item {
	margin-bottom: 10rpx 0;
	padding: 20rpx;
	box-sizing: border-box;
	font-size: 30rpx;
	.img {
		width: 100%;
		height: 420rpx;
		box-sizing: border-box;
		overflow: hidden;
		border-radius: 20rpx;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	.des {
		width: 100%;
		height: 80rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		padding: 0 10rpx;
		.content {
			height: 100%;
			width: 60%;
			box-sizing: border-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			padding: 10rpx;
			display: flex;
			align-items: center;
		}
		.end-time {
			font-size: 24rpx;
			font-weight: bolder;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.price {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx;
		box-sizing: border-box;
		.value {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			.s-value {
				font-size: 20rpx;
				color: #999;
				margin-left: 10rpx;
			}
			.num {
				font-size: 24rpx;
				border-radius: 8rpx;
				padding-left: 10rpx;
				padding-right: 10rpx;
				margin-left: 10rpx;
				border: 1px solid;
			}
		}
		.buy {
			padding: 10rpx 0;
			width: 18%;
			border-radius: 10rpx;
			color: white;
			font-size: 28rpx;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.share {
			padding: 10rpx;
			.iconfont-vant {
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
}
</style>
