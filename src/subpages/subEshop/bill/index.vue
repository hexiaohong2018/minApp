<template>
	<view class="bill-container">
		<dc-tabs :titles="['消费记录', '充值记录', '佣金记录']" :active="active" @change="onChange" :color="navColor"></dc-tabs>
		<mescroll-uni @init="mescrollInit" :down="downOption" @down="downCallback" :up="upOption" @up="upCallback" top="52px">
			<view class="content">
				<integral-commission-item v-for="item,index in list" :item="item" :key="index"></integral-commission-item>
			</view>
		</mescroll-uni>
	</view>
</template>

<script>
import dcTabs from '../../../components/tabs/index.vue';
import integralCommissionItem from '../../../components/template/integral-commission-item/index.vue';
import { showToastFn } from '../../../utils/util.js';
import {Bill} from '../../../utils/class.js';
import {mapGetters} from 'vuex';
const bill = new Bill();
export default {
	data() {
		return {
			active: 0,
			activeTemp:0,
			list: [],
			// loadStatus:true,
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
	components: {
		dcTabs,
		integralCommissionItem
	},
	computed:{
		...mapGetters({
			navColor:'custom/navColor'
		})
	},
	methods: {
		_getListData(page) {
			let index = this.activeTemp;
			if(page == 1) this.list = [];
			if (index == 0) {
				return bill.getConsumptionRecord(page).then(res => {
						this.list=[...this.list, ...res.list];
						this.active = index;
						return res;
				});
			} else if (index == 1) {
				return bill.getTopUpRecord(page).then(res => {
					this.list=[...this.list, ...res.list];
					this.active = index;
					return res;
				});
			} else if (index == 2) {
				return bill.getCommissionRecord(page).then(res => {
					this.list=[...this.list, ...res.list];
					this.active = index;
					return res;
				});
			}
		},
		onChange(active) {
			this.activeTemp = active;
			this.mescroll.resetUpScroll();
		},
		mescrollInit(mescroll){
			this.mescroll = mescroll;
		},
		/*下拉刷新的回调, 有三种处理方式: */
		downCallback(mescroll) {
			this.mescroll.resetUpScroll(); 
		},
		/*上拉加载的回调*/
		upCallback(mescroll) {
			this._getListData(mescroll.num).then(res=>{
				mescroll.endSuccess(res.list.length,res.state==2?false:true);
			}).catch(err=>{
				console.log(err);
				showToastFn("获取记录失败");
				mescroll.endErr()
			})
		}
	}
};
</script>

<style lang="less" scoped>
	.content{
		width: 100vw;
		padding: 10rpx 30rpx;
		box-sizing: border-box;
	}
</style>
