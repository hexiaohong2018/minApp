<template>
	<view>
		<view class="nav-bar-container" :class="{ shadow: shadow }" :style="'background:' + backGround + ';height:' + (statusBarHeight + menuHeight) + 'px'">
			<view class="status-bar" :style="'height:' + statusBarHeight + 'px;'"></view>
			<view class="menu" :style="'height:' + menuHeight + 'px; color:' + color">
				<view class="left" @click="clickLeft(isShare)">
					<template v-if="_leftIcon">
						<view class="arrow" :style="'background:' + arrowBackground + ';border-color:' + color"></view>
						<view class="arrow-left"><view class="iconfont-vant" :class="'icon-vant-' + _leftIcon"></view></view>
					</template>
					<slot v-else name="left"></slot>
				</view>
				<view class="title" v-if="backGround != 'transparent'">
					<view class="content" v-if="title">{{ title }}</view>
					<slot v-else name="title"></slot>
				</view>
			</view>
		</view>
		<!-- 清除浮动影响 -->
		<view v-if="clearFloat" class="clearfix" :style="'height:' + (statusBarHeight + menuHeight) + 'px'"></view>
	</view>
</template>

<script>
import { phoneInfo, setNavBarColor, isDeepColor } from '../../utils/util.js';
import store from '../../utils/store.js';

export default {
	data() {
		return {
			statusBarHeight: 0,
			menuHeight: 0,
			isShare: false,
			backGround:"",
		};
	},
	props: {
		title: String,
		background: String,
		clearFloat: Boolean,
		leftIcon: String,
		arrow: Boolean,
		shadow: Boolean
	},
	beforeMount() {
		// 在组件实例进入页面节点树时执行
		phoneInfo().then(res => {
			this.backGround = this.background || store.getters.navColor;
			this.statusBarHeight = res.statusBarHeight;
			this.menuHeight = res.menuHeight;
			setNavBarColor(this.backGround);
		});
	},
	watch: {
		background: function(newValue) {
			this.backGround = newValue;
			setNavBarColor(newValue);
		}
	},
	computed: {
		color() {
			return isDeepColor(this.background) ? '#ffffff' : '#000000';
		},
		arrowBackground() {
			return isDeepColor(this.background) ? '#000000' : '#ffffff';
		},
		_leftIcon() {
			var icon = this.leftIcon ? this.leftIcon : this.arrow ? 'arrow-left' : '';
			if (icon == 'wap-home') {
				this.isShare = true;
			}
			return this.leftIcon ? this.leftIcon : this.arrow ? 'arrow-left' : '';
		}
	},
	methods:{
		clickLeft(isShare){
			if(this.arrow && !this.leftIcon){
				uni.navigateBack({
					delta:1
				})
			}
			this.$emit('clickLeft',isShare)
		}
	}
};
</script>
<style scoped lang="less">
.nav-bar-container {
	position: fixed;
	z-index: 10000;
	transition: background 0.3s;
	top: 0;
	left: 0;
	right: 0;
	.status-bar {
		width: 100%;
	}
	.clearfix {
		display: block;
		clear: both;
	}
	.menu {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 18px;
		font-weight: 500;
		position: relative;
		.left {
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			box-sizing: border-box;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 10px;
			.arrow {
				width: 28px;
				height: 28px;
				border-radius: 50%;
				border: 1px solid;
				opacity: 0.18;
				display: flex;
				justify-content: center;
				align-items: center;
				border: 1px solid;
			}
			.arrow-left {
				width: 30px;
				height: 30px;
				top: 50%;
				transform: translateY(-50%);
				z-index: 99;
				position: absolute;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.title {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 50%;
			.content {
				font-size: 18px;
				height: 25px;
				width: 100%;
				box-sizing: border-box;
				padding: 10;
				text-align: center;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}
		}
	}
}
.shadow {
	box-shadow: 0 1px 6px #ccc;
}
</style>
