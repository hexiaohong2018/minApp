<template>
	<view class="item" @click="$emit('click',coupon.sv_coupon_id)" :style="{marginTop:margin}">
		<view class="des">
			<view class="name ellipsis">{{ coupon.sv_coupon_name }}</view>
			<view class="condition ellipsis">满{{ coupon.sv_coupon_use_conditions }}元可用</view>
			<view class="date ellipsis" :style="{ color: disabled ? '#666' : '#e04b28' }">有效期:{{ coupon.sv_coupon_bendate }} - {{ coupon.sv_coupon_enddate }}</view>
			<view class="img"><slot></slot></view>
		</view>
		<view class="btn" :style="{ background: disabled ? ' #a9a3a3' : _color }">
			<view class="price">
				<text v-if="coupon.sv_coupon_type == 0">¥</text>
				{{ coupon.sv_coupon_type == 0 ? coupon.sv_coupon_money : coupon.sv_coupon_money / 10 }}
				<text v-if="coupon.sv_coupon_type == 1">折</text>
			</view>
			<view class="get" v-if="recived">立刻领取</view>
		</view>
	</view>
</template>

<script>
	import {setActiveColor} from '../../../utils/util.js'
export default {
	props: {
		coupon: Object,
		disabled: Boolean,
		recived:Boolean,
		color:{
			type:String,
			default:"#f44"
		},
		margin:{
			type:String,
			default:'40rpx'
		}
	},
	computed:{
		_color(){
			return setActiveColor(this.color,'#f44')
		}
	}
};
</script>

<style lang="less" scoped>
.item {
	width: 100%;
	height: 180rpx;
	border-radius: 20rpx;
	// margin-top: 40rpx;
	box-shadow: 0 0 3px 3px #eee;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	.des {
		flex: 1;
		box-sizing: border-box;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		position: relative;
		.img {
			position: absolute;
			top: -30rpx;
			right: -28rpx;
			width: 120rpx;
			height: 120rpx;
			color: #666;
			z-index: 3;
		}
		.name {
			width: 100%;
			font-size: 30rpx;
			
			font-weight: bold;
			color: #666;
		}
		.date {
			width: 100%;
			font-size: 26rpx;
		}
		.condition {
			width: 100%;
			display: flex;
			font-size: 24rpx;
			color: #666;
			margin: 10rpx 0;
		}
	}
	.btn {
		width: 33%;
		box-sizing: border-box;
		padding:0px 8px;
		background: #f44;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: white;
		position: relative;
		.price {
			font-size: 50rpx;
			display: flex;
			justify-content: flex-end;
			align-self: center;
			text {
				font-size: 30rpx;
				padding: 0 10rpx;
				display: flex;
				justify-content: flex-end;
				align-self: center;
			}
		}
		.get{
			margin-top: 10rpx;
			font-size: 28rpx;
		}
		
	}
	.btn:after {
		content: '';
		position: absolute;
		width: 15px;
		height: 100%;
		left: -8px;
		top: 0;
		z-index: 2;
		background-image: url(../../../static/dot.png);
		background-repeat: repeat;
	}
}
</style>
