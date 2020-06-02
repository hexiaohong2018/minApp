<template>
	<view class="content">
		{{test}}
	</view>
</template>

<script>
	import {mapGetters} from 'vuex'
	export default {
		data() {
			return {
				title: 'Hello',
				list: [{
					text: '点赞',
					color: 'blue',
					fontSize: 28
				}, {
					text: '分享'
				}, {
					text: '评论'
				}],
				show: true
			}
		},
		onLoad() {
			console.log(this.systemInfo)
		},
		methods: {

		},
		computed:{
			...mapGetters({
				test:'test/testData',
				systemInfo:'systemInfo/systemInfo'
			})
		}

		
	}
</script>

<style>
	.test{
		display: flex;
		flex-direction:column;
	}
	.content {
		text-align: center;
		height: 400upx;
	}

	.logo {
		height: 200upx;
		width: 200upx;
		margin-top: 200upx;
	}

	.title {
		font-size: 36upx;
		color: #8f8f94;
	}
</style>
