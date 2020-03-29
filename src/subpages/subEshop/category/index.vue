<template>
	<view class="container">
		<view class="content">
			<scroll-view class="left" scroll-y>
				<view
					v-for="(item, index) in categorys"
					:key="item.productcategory_id"
					class="item ellipsis"
					@click="onChange(index)"
					:class="{ 'item-active': activeIndex == index }"
					:style="{ color: activeIndex == index ? navColor : '' }"
				>
					{{ item.sv_pc_name }}
				</view>
				<view class="line" :style="{ top: _lineHeight + 'rpx', backgroundColor: navColor }"></view>
			</scroll-view>
			<view class="right">
				<view class="title" :style="{color:navColor}">{{ categorys[activeIndex].sv_pc_name }}</view>
				<scroll-view class="category" scroll-y>
					<view v-if="subCategorys.length > 0" class="category-content">
						<view class="category-item" v-for="item in subCategorys" :key="item.productsubcategory_id" @click="showProducts(categorys[activeIndex].productcategory_id,item.productsubcategory_id)">
							<view class="img"></view>
							<view class="des ellipsis">{{ item.sv_psc_name }}</view>
						</view>
					</view>

					<view v-else class="empty">
						<view class="img"></view>
						<view class="text">暂无类目</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import { setActiveColor } from '../../../utils/util.js';

import store from '../../../utils/store.js';
// import uniSearchBar from '../../../components/uni-search-bar/uni-search-bar.vue';
import { ProductList } from '../../../utils/class.js';
const productList = new ProductList();
export default {
	// components: { uniSearchBar },
	data() {
		return {
			navColor: 'green',
			activeIndex: 0,
			categorys: [],
			subCategorys: []
		};
	},
	methods: {
		onChange(index) {
			productList.getProductCategory(this.categorys[index].productcategory_id).then(res => {
				if(res.length == 0){
					uni.navigateTo({
						url:'../../eshop/productList/index?id='+this.categorys[index].productcategory_id
					})
				}else{
					this.subCategorys = res;
					this.activeIndex = index;
				}
			});
		},
		showProducts(id,sid){
			uni.navigateTo({
				url:`../../eshop/productList/index?id=${id}&sid=${sid}`
			})
		}
	},
	computed: {
		_lineHeight() {
			return this.activeIndex * 100;
		}
	},
	onLoad() {
		productList.getProductCategory().then(res => {
			this.categorys = res;
			productList.getProductCategory(this.categorys[this.activeIndex].productcategory_id).then(res => {
				this.subCategorys = res;
			});
		});
		this.navColor = store.getters.navColor;
	}
};
</script>

<style lang="less" scoped>
.container {
	width: 100vw;
	height: 100vh;
	.content {
		display: flex;
		justify-content: center;
		align-self: center;
		height: 100vh;
		.left {
			width: 23%;
			height: 100%;
			font-size: 30rpx;
			display: flex;
			flex-direction: column;
			background-color: white;
			position: relative;
			.line {
				position: absolute;
				left: 0;
				width: 6rpx;
				height: 100rpx;
				transition: top 0.3s linear;
			}
			.item {
				width: 100%;
				height: 100rpx;
				text-align: center;
				line-height: 100rpx;
				box-sizing: border-box;
				padding: 0 10rpx;
			}
			.item-active {
				background-color: #f8f8f8;
			}
		}
		.right {
			height: 100%;
			flex: 1;
			box-sizing: border-box;
			padding: 12rpx;
			position: relative;
			.title {
				font-size: 28rpx;
				height: 80rpx;
				line-height: 80rpx;
				width: 100%;
				font-weight: 600;
				box-sizing: border-box;
				padding-left: 20rpx;
				position: absolute;
				top: 12rpx;
				background-color: white;
			}
			.category {
				width: 100%;
				height: calc(100% - 80rpx);
				background-color: white;
				border-radius: 15rpx;
				position: relative;
				margin-top: 80rpx;
				.empty {
					position: absolute;
					left: 50%;
					top: 100rpx;
					transform: translateX(-50%);
					display: flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;
					.img {
						background-image: url(../../../static/mescroll-empty.png);
						width: 200rpx;
						height: 200rpx;
						background-position: center;
						background-repeat: no-repeat;
						background-size: cover;
					}
					.text {
						font-size: 26rpx;
						color: #999;
					}
				}

				.category-content {
					width: 100%;
					box-sizing: border-box;
					display: flex;
					flex-wrap: wrap;
					.category-item {
						width: 33%;
						height: 250rpx;
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
						box-sizing: border-box;
						padding: 20rpx;
						.img {
							width: 90%;
							height: 0;
							padding-bottom: 90%;
							background-image: url('https://res.decerp.cc/UploadImg/58139099/20191219145000806.png');
							background-position: center;
							background-repeat: no-repeat;
							background-size: cover;
						}
						.des {
							width: 90%;
							padding-top: 20rpx;
							text-align: center;
							font-size: 26rpx;
							color: #666;
						}
					}
				}
			}
		}
	}
}
</style>
