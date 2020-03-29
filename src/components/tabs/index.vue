<template>
	<scroll-view scroll-x scroll-with-animation :scroll-into-view="scrollIndex" class="tabs-container" :class="{ 'tabs-container-border': border }">
		<ul class="tabs">
			<li
				class="tab title-class"
				v-for="(item, index) in titles"
				:key="item"
				:style="{ width: itemWidth + '%',color: active == index ? _color : '' }"
				@click="onTab(index)"
				:id="'_' + index"
			>
				<slot name="nav-left"></slot>
				<view class="title" @click.stop="onTab(index)">{{ item }}</view>
				<slot name="nav-right"></slot>
			</li>
			<view
				class="slide"
				:style="{
					left: active * itemWidth + '%',
					marginLeft: itemWidth / 2 + '%',
					width: itemWidth * (titles.length < 4 ? titles.length : 4) + 'rpx',
					background:_color
				}"
			></view>
		</ul>
	</scroll-view>
</template>

<script>
	import {setActiveColor} from '../../utils/util.js';
export default {
	data() {
		return {
			scrollIndex: '_0'
		};
	},
	props: {
		color:{
			type:String,
			default:'#f44'
		},
		titles: {
			type: Array,
			value: []
		},
		active: Number,
		border: {
			type: Boolean,
			value: true
		}
	},
	computed: {
		itemWidth() {
			return this.titles.length < 4 ? Math.ceil((100 / this.titles.length) * 100) / 100 : 25;
		},
		_color(){
			return setActiveColor(this.color,"#f44")
		}
	},
	methods: {
		onTab: function(index) {
			if(index == this.active) return;
			this.scrollIndex = '_' + (index - 1 < 0 ? 0 : index - 1);
			this.$emit('change', index);
		}
	}
};
</script>

<style lang="less" scoped>
.tabs-container {
	height: 52px;
	width: 100%;
	z-index: 99;
	background: white;
}
.tabs-container-border {
	border-bottom: 1px solid #eee;
}

.tabs-container .tabs {
	height: 100%;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	position: relative;
}

.tabs-container .tab {
	text-align: center;
	color: #666;
	min-width: 25%;
	padding: 10rpx;
	box-sizing: border-box;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
.tabs-container .tab .title {
	font-size: 30rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.tabs-container .slide {
	position: absolute;
	bottom: 0;
	height: 6rpx;
	border-radius: 6rpx;
	z-index: 1;
	transition: left 0.3s linear;
	transform: translateX(-50%);
}
</style>
