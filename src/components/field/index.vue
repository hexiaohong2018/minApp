<template>
	<view class="field-content">
		<view v-if="required" class="required">*</view>
		<view class="icon">
			<view v-if="leftImg" class="img" :style="{ backgroundImage: 'url(' + leftImg + ')'}"></view>
			<view class="iconfont-vant" :class="'icon-vant-'+icon"></view>
			<slot name="icon"></slot>
		</view>
		<view v-if="label" class="label" :style="{width:labelWidth}">{{label}}</view>
		<input :type="type" :value="value" :password="password" :placeholder="placeholder" 
		:maxlength="maxlength" :disabled="disabled"
		@input="$emit('input',$event)" @focus="$emit('focus',$event)" @blur="$emit('blur',$event)" @confirm="$emit('confirm',$event)"/>
		<slot name="right-icon"></slot>
		<view v-if="border" class="border"></view>
	</view>
</template>

<script>
	export default{
		
		// @input	EventHandle		当键盘输入时，触发input事件，event.detail = {value}	差异见下方 Tips
		// @focus	EventHandle		输入框聚焦时触发，event.detail = { value, height }，height 为键盘高度	仅微信小程序、App（2.2.3+） 、QQ小程序支持 height
		// @blur	EventHandle		输入框失去焦点时触发，event.detail = {value: value}	
		// @confirm EventHandle     点击完成按钮时触发，event.detail = {value: value}
		props:{
			required:Boolean,//必填
			label:String,
			labelWidth:{
				type:String,
				default:'180rpx'
			},
			value:String,
			password:Boolean,
			placeholder:String,
			icon:String,
			maxlength:{
				type:Number,
				default:140
			},
			disabled:Boolean,
			border:{
				type:Boolean,
				default:true
			},
			type:{
				type:String,
				default:"text" //text	文本输入键盘	number	数字输入键盘	注意iOS的vue页面弹出的数字键盘并非9宫格方式 
							//idcard	身份证输入键盘	微信、支付宝、百度、QQ小程序 digit	带小数点的数字键盘	App的nvue页面、微信、支付宝、百度、头条、QQ小程序
			}
		},
		computed:{
			leftImg() {
				var reg = /\w+\.(jpg|gif|bmp|png)/;
				return reg.test(this.icon) ? this.icon : '';
				
			}
		}
	}
</script>

<style lang="less" scoped>
	.field-content{
		width: 100%;
		display: flex;
		justify-content:flex-start;
		align-items: center;
		box-sizing: border-box;
		padding: 20rpx;
		background: white;
		position: relative;
		font-size: 28rpx;
		.required{
			color: #f44;
			padding: 4rpx;
		}
		.icon{
			padding-right: 8rpx;
			.iconfont-vant{
				font-size: 34rpx;
				color: #666;
			}
			.img {
				background-position: center;
				background-repeat: no-repeat;
				background-size: cover;
				width: 34rpx;
				height: 34rpx;
			}
		}
		input{
			flex: 1;
			padding: 10rpx 20rpx;
		}
		.border{
			position: absolute;
			height: 2rpx;
			left: 30rpx;
			right: 0;
			bottom: 0;
			background: #eee;
		}
	}
</style>
