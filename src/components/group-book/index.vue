<template>
	<ul class="groups">
		<group-buy-item v-for="product in (products||_products)" :key="product.assembledetailpid" :product="product" :color="_color" @buy="onBuy"></group-buy-item>
	</ul>
</template>

<script>
import groupBuyItem from "../group-book-item/index.vue";
import {setActiveColor} from '../../utils/util.js';
import {GroupBuy} from '../../utils/class.js'
const groupBuy = new GroupBuy();
export default {
	components:{
		groupBuyItem
	},
	props: {
		color: {
			type: String,
			default: '#f44'
		},
		products:Array,
	},
	computed:{
		_color(){
			return setActiveColor(this.color,'#f44');
		}
	},
	methods:{
		onBuy(e){
			uni.navigateTo({
				url:'/subpages/subEshop/groupBuyInfo/index?cid=' + e.cid + '&id=' + e.id
			})
		}
	}
};
</script>

<style scoped lang="less">
.groups {
	width: 100vw;
	background: white;
}
</style>
