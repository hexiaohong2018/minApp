<template>
	<view class="recommend-container">
		<dc-nav-bar :background="navColor" title="推荐中心" arrow @click-left="goBack" clear-float></dc-nav-bar>
		<view class="total" :style="{ background: navColor, color: _color }">
			<view :class="{ 'i-count': activeIndex == 0, 'c-count': activeIndex == 1 }">{{ total }}</view>
			<view class="title">{{ activeIndex == 0 ? '总积分' : '总收益' }}<text>(最近3个月)</text></view>
			<view class="share" @click="onShare">
				<view class="icon iconfont-vant icon-vant-cluster-o"></view>
				<text>推广</text>
			</view>
		</view>
		<dc-tabs :titles="['积分', '佣金']" style="width: 100vw;" :active="activeIndex" :color="navColor" @change="onChange"></dc-tabs>

		<mescroll-uni @init="mescrollInit" :down="downOption" @down="downCallback" :up="upOption" @up="upCallback" :top="tabBarHeight + 'px'">
			<view class="content"><integral-commission-item v-for="item,index in recordList" :item="item" :key="index"></integral-commission-item></view>
		</mescroll-uni>
	</view>
</template>

<script>
import dcNavBar from '../../../components/navBar/index.vue';
import dcTabs from '../../../components/tabs/index.vue';
import integralCommissionItem from '../../../components/template/integral-commission-item/index.vue';
import { Bill } from '../../../utils/class.js';
import { showToastFn, isDeepColor } from '../../../utils/util.js';
import {mapGetters} from 'vuex';
const bill = new Bill();
export default {
	data() {
		return {
			activeIndex: 0,
			total: 20,
			tabBarHeight: 0,
			recordList: [],
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
	components: { dcNavBar, dcTabs, integralCommissionItem },
	computed: {
		_color() {
			return isDeepColor(this.navColor) ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
		},
		...mapGetters({
			navColor:'custom/navColor'
		})
	},
	onLoad() {
		this.tabBarHeight = this.$store.getters['systemInfo/systemInfo'].navHeight + 172;
	},
	methods: {
		mescrollInit(mescroll) {
			this.mescroll = mescroll;
		},
		onChange(index) {
			this.activeIndex = index;
			this.mescroll.resetUpScroll();
		},

		goBack() {
			uni.navigateBack();
		},
		onShare() {
			uni.navigateTo({
				url: '../share/index'
			});
		},
		_getRecord(pageIndex) {
			var activeIndex = this.activeIndex;
			return bill[activeIndex == 0 ? 'getIntegralRecord' : 'getCommissionRecord'](pageIndex, 10).then(res => {
				if (pageIndex == 1) {
					this.recordList = [];
				}
				this.recordList = [...this.recordList, ...res.list];
				this.total = activeIndex == 0 ? this.$store.getters['loginInfo/memberInfo'].sv_mw_availablepoint : res.total;
				return res;
			});
		},
		/*下拉刷新的回调, 有三种处理方式: */
		downCallback(mescroll) {
			mescroll.resetUpScroll();
		},
		/*上拉加载的回调*/
		upCallback(mescroll) {
			this._getRecord(mescroll.num)
				.then(res => {
					mescroll.endSuccess(res.list.length, res.state == 2 ? false : true);
				})
				.catch(err => {
					showToastFn('获取数据失败');
					console.log(err);
					mescroll.endErr();
				});
		}
	}
};
</script>

<style lang="less" scoped>
.recommend-container {
	.total {
		width: 100vw;
		height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		.i-count {
			font-size: 80rpx;
			font-weight: 500;
		}
		.c-count {
			font-size: 80rpx;
			font-weight: 500;
		}
		.c-count::before {
			content: '￥';
			font-size: 40rpx;
		}
		.title {
			font-size: 28rpx;
			text{
				font-size: 20rpx;
			}
		}
		.share {
			position: absolute;
			right: 30rpx;
			font-size: 28rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			top: 30rpx;
			.icon {
				transform: rotate(-90deg);
				margin-right: 10rpx;
			}
		}
	}
	.content {
		width: 100vw;
		padding: 0 20rpx;
		box-sizing: border-box;
	}
}
</style>
