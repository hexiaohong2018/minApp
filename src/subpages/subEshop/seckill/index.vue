<template>
	<view class="seckill-container">
		<dc-tabs :active="active" :titles="['正在疯抢', '即将开启']" @change="onChange" :color="navColor"></dc-tabs>
		<mescroll-uni @init="mescrollInit" :down="downOption" @down="downCallback" :up="upOption" @up="upCallback" top="52px">
			<dc-product :products="products" mode="0" round type="sec" :text="active == 0 ? '马上抢' : '未开始'" border margin="10" :color="navColor"
			@click="onSecKill"
			@submit="onSecKill"
			
			/>
		</mescroll-uni>
	</view>
</template>

<script>
import { CartList, Seckill } from '../../../utils/class.js';
import { showToastFn, formatTime } from '../../../utils/util.js';
const cart = new CartList();
const seckill = new Seckill();

import dcTabs from '../../../components/tabs/index.vue';
import dcProduct from '../../../components/product/index.vue';
import {mapGetters} from 'vuex';
export default {
	components: { dcTabs, dcProduct },
	data() {
		return {
			active: 0,
			products: [],
			// loadState: 0,
			//下拉刷新组件配置
			// 下拉刷新的常用配置
			downOption: {
				use: true, // 是否启用下拉刷新; 默认true
				auto: true // 是否在初始化完毕之后自动执行下拉刷新的回调; 默认true
			},
			// 上拉加载的常用配置
			upOption: {
				use: true, // 是否启用上拉加载; 默认true
				auto: true, // 是否在初始化完毕之后自动执行上拉加载的回调; 默认true
				page: {
					num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
					size: 10 // 每页数据的数量,默认10
				},
				noMoreSize: 5, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
				empty: {
					tip: '暂无相关数据'
				}
			}
		};
	},
	computed:{
		...mapGetters({
			navColor:'custom/navColor'
		})
	},

	methods: {
		onSecKill(id,cid){
			uni.navigateTo({
				url:`../secKillInfo/index?seckillId=${cid}&id=${id}`
			})
		},
		mescrollInit(mescroll){
			this.mescroll = mescroll;
		},
		onChange(active) {
			this.active = active;
			this.mescroll.resetUpScroll();
		},
		/*下拉刷新的回调, 有三种处理方式: */
		downCallback(mescroll) {
			mescroll.resetUpScroll();
		},
		/*上拉加载的回调*/
		upCallback(mescroll) {
			seckill
				.getProductList({state:this.active==0?1:0,page:mescroll.num})
				.then(res => {
					if(mescroll.num == 1) this.products = [];
					this.products =[...this.products,...res.list];
					mescroll.endSuccess(res.list.length,res.loadState==1?false:true);
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('获取秒杀商品列表失败');
					mescroll.endErr();
				});
		}
	}
};
</script>

<style lang="less" scoped>
.seckill-container {
	width: 100vw;
	.content {
		width: 100%;
		padding: 10 20rpx;
		box-sizing: border-box;
	}
}
</style>
