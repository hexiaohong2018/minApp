<template>
	<view class="goupbook-content">
		<dc-group-book :products="products" :color="navColor"></dc-group-book>
		<uni-load-more :status="loadState?'loading':'noMore'"></uni-load-more>
	</view>
</template>

<script>
import dcGroupBook from '../../../components/group-book/index.vue';
import uniLoadMore from '../../../components/uni-load-more/uni-load-more.vue';
import {GroupBuy} from '../../../utils/class.js';
import {showToastFn} from '../../../utils/util.js';
import {mapGetters} from 'vuex';
const groupBuy = new GroupBuy();
export default {
	data() {
		return {
			products: [],
			loadState: true
		};
	},
	computed:{
		...mapGetters({
			navColor:'custom/navColor'
		})
	},
	components: { dcGroupBook,uniLoadMore },
	onLoad() {
		groupBuy
			.getGroupBuyList()
			.then(res => {
				this.products=res;
				this.loadState=false
			})
			.catch(msg => {
				showToastFn('加载失败', 'fail');
				this.loadState=false
			});
	}
};
</script>

<style lang="less" scoped>
.goupbook-content {
	width: 100%;
}
</style>
