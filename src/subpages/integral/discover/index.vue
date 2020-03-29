<template>
	<div class="container">
		<product type="integral" text="兑换" :products="products" :margin="8" @click="goTo($event)" @submit="onSubmit($event)"></product>
		<uni-load-more :status="loadStatus ? 'loading' : 'noMore'"></uni-load-more>
	</div>
</template>

<script>
import product from '@/components/product';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import { showToastFn } from '../../../utils/util.js';
import { Integral } from '../../../utils/class.js';
const integral = new Integral();
export default {
	onLoad() {
		this._getProductList();
	},
	data() {
		return {
			loadStatus: false,
			products: []
		};
	},
	components: { product, uniLoadMore },
	onPullDownRefresh() {
		this._getProductList().then(res => {
			showToastFn('刷新成功');
			uni.stopPullDownRefresh();
		});
	},
	onReachBottom() {
		if (!this.loadStatus) return;
		integral
			.getProductList()
			.then(res => {
				this.loadStatus = res.isAll ? false : true;
				this.products.push(...res.list);
			})
			.catch(msg => {
				console.log(msg);
			});
	},
	methods: {
		_getProductList() {
			return integral
				.getProductList(1)
				.then(res => {
					this.loadStatus = res.isAll ? false : true;
					this.products = res.list;
				})
				.catch(msg => {
					console.log(msg);
				});
		},
		goTo(index) {
			uni.navigateTo({
				url: '../productInfo/index?id=' + this.products[index].product_id
			});
		},
		onSubmit(index) {
			if (this.products[index].sv_p_integral > this.$store.getters['loginInfo/memberInfo'].sv_mw_availablepoint) {
				showToastFn('积分不够');
			} else {
				uni.setStorage({
					key: 'product',
					data: this.products[index]
				});
				uni.navigateTo({
					url: `../pay/index`
				});
			}
		}
	}
};
</script>

<style scoped lang="less">
.container {
	width: 100vw;
}
</style>
