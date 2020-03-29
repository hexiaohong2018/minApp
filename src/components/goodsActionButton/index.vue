<template>
	<view class="btn" :style="{backgroundImage:background,color:color}" @click="$emit('click',$event)">{{text}}</view>
</template>

<script>
	export default{
		props:{
			text:String,
			color:{
				type:String,
				default:'white'
			},
			background:{
				type:String,
				default:'linear-gradient(45deg,rgb(255,96,52),rgb(238,10,36))'
			}
		}
	}
</script>

<style lang="less" scoped>
	.btn{
		min-width: 220rpx;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28rpx;
		float: left;
	}
	.btn:active{
		opacity: var(--active-opacity);
	}
</style>
