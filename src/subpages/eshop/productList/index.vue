<template>
	<view class="product-list">
		<uni-search-bar placeholder="请输入搜索关键词" :radius="20" @confirm="onSearch" @input="onInput"></uni-search-bar>
		<mescroll-uni @init="mescrollInit" @up="upCallBack" @down="downCallBack" top="52px">
			<dc-product :products="products" @click="onBuy" @submit="onBuy" :color="activeColor" text="购买"></dc-product>
		</mescroll-uni>
	</view>
</template>

<script>
import dcProduct from '../../../components/product/index.vue';
import uniSearchBar from '../../../components/uni-search-bar/uni-search-bar.vue';
import { ProductList } from '../../../utils/class.js';
import { debounce } from '../../../utils/common.js';
import {setActiveColor} from '../../../utils/util.js';
import {mapGetters} from 'vuex';
const productList = new ProductList();
export default {
	data() {
		return {
			products: [],
			category: 0,
			subCategory: 0,
			searchStr: '',
			activeColor:''
		};
	},
	components: { dcProduct, uniSearchBar },
	onLoad(options) {
		this.category = options.id;
		this.subCategory = options.sid;
		this.activeColor = setActiveColor(this.navColor,"#f44");
		this.debounce = debounce(
			function(value) {
				this.searchStr = value;
				this.mescroll.resetUpScroll();
			},600,false);
	},
	computed:{
		...mapGetters({
			navColor:'custom/navColor'
		})
	},
	methods: {
		mescrollInit(mescroll) {
			this.mescroll = mescroll;
		},
		downCallBack(mescroll) {
			mescroll.resetUpScroll();
		},
		upCallBack(mescroll) {
			productList
				.getProductListByCategoryId({ category: this.category, subCategory: this.subCategory ? this.subCategory : 0, page: mescroll.num, searchStr: this.searchStr })
				.then(res => {
					if (mescroll.num == 1) this.products = [];
					this.products = [...this.products, ...res.productList];
					mescroll.endSuccess(res.productList.length, !res.isAll);
				});
		},
		onBuy(id) {
			uni.navigateTo({
				url: '../productInfo/index?id=' + id
			});
		},
		onSearch(e) {
			this.searchStr = e.value;
			this.mescroll.resetUpScroll();
		},
		onInput(e) {
			this.debounce(e.value);
		}
	}
};
</script>

<style lang="less" scoped>
.product-list {
	width: 100vw;
}
</style>
