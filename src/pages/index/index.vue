<template>
	<view class="content">
		{{test}}
	</view>
</template>

<script>
	import {mapGetters} from 'vuex'
	import {getUrlParam,verify} from '../../utils/util.js'
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
			console.log(new Date().Format("yyyy-MM-dd hh:mm:ss.S"))
			console.log(getUrlParam('index/index?a=1',"a"))
			console.log(getUrlParam('index/index?a=1',"b"))
			console.log(getUrlParam('index/index',"b"))
			console.log(verify('tel',18027463020))
			console.log(verify('name','小宏*'))
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
