<template>
	<view class="tab-bar-content" :class="{ shadow: border,safe:systemInfo.isIphoneX }" :style="{zIndex:zIndex}">
		<view class="item" v-for="(item, index) in items" 
		:key="item.title" 
		:style="{ color: _index == index? _activeColor:inactiveColor}" @click="change(index)">
			<view class="icon">
				<view class="iconfont-vant" :class="'icon-vant-' + item.icon"></view>
			</view>
			<view class="title">{{ item.title || '' }}</view>
		</view>
	</view>
</template>

<script>
	import {setActiveColor} from '../../utils/util.js';
	import{mapGetters} from 'vuex';
	
export default {

	props: {
		active:{
			type: [String, Number],
			default: 0
		},
		name:String,
		border: {
			type: Boolean,
			default: true
		},
		activeColor: {
			type: String,
			default: '#f44'
		},
		inactiveColor: {
			type: String,
			default: '#7d7e80'
		},
		zIndex: {
			type: [String, Number],
			default: 1
		},
		items: {
			type: Array,
			required: true,
			validator: function(value) {
				return !value.find(item => !(item.icon || item.title));
			}
		}
	},
	methods:{
		change(index){
			this.$emit('change',this.name?this.items[index].name:index);
		}
	},
	computed: {
		...mapGetters({
			systemInfo:'systemInfo/systemInfo'
		}),
		_activeColor(){
			return setActiveColor(this.activeColor,"#f44")
		},
		_index(){
			var index = this.items.findIndex(item=>item.name == this.name);
			return index != -1? index: this.active;
		}
	}
};
</script>

<style lang="less" scoped>
.shadow {
	box-shadow: 0 -1px 1rpx 1rpx #eee;
}
.safe{
	padding-bottom: 30px;
}
.tab-bar-content {
	box-sizing: content-box;
	height: 56px;
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: white;
	.item {
		flex: 1;
		height: 100%;
		display: felx;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 5px;
		.icon {
			width: 100%;
			height: 68%;
			box-sizing: border-box;
			display: flex;
			justify-content: center;
			align-items: center;
			padding-bottom: 3px 0;
			.iconfont-vant {
				font-size: 25px;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.title {
			width: 100%;
			height: 32%;
			font-size: 12px;
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
		}
	}
}
</style>
