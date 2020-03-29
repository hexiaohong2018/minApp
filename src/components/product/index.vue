<template>
	<view class="content">
		<view
			class="margin"
			v-for="item in products"
			:key="item.product_id"
			:style="{ width: mode == 0 || mode == 1 ? '100%' : mode == 2 ? '50%' : '33%', padding: margin + 'rpx', fontSize: 28 - size + 'rpx' }"
		>
			<view class="card" :style="{ borderColor: border ? '#eee' : 'transparent', borderRadius: round ? '16rpx' : '0rpx', display: mode == 0 ? 'flex' : '' }">
				<view
					class="img"
					:style="{ backgroundImage: 'url(' + item.sv_p_images2 + ')', width: mode == 0 ? '32%' : '100%', paddingBottom: mode == 0 ? '32%' : '100%' }"
					@click="$emit('click', item.product_id,item.config_id||item.sv_assemble_config_id)"
				></view>
				<view class="card-content" :style="{ width: mode == 0 ? '68%' : '100%' }">
					<view class="des ellipsis-2" :style="{ height: 100 - size * 8 + 'rpx' }">{{ item.sv_remark || item.sv_p_name }}</view>
					<view v-if="type == 'sec'">
						<view
							v-if="item.progress"
							class="progress"
							:style="{ height: 38 - size * 2 + 'rpx', fontSize: mode == 3 ? '16rpx' : '', height: mode == 3 ? '24rpx' : '' }"
						>
							<view class="sell" :style="{ width: item.progress.sell + '%' }">
								<view class="value">已售{{ item.progress.sell + '%' }}</view>
							</view>
							<view class="left" v-if="mode != 3">仅剩{{ item.progress.left }}件</view>
						</view>
						<view v-if="item.begin" class="begin">限购{{ item.begin.limit }}件 {{ item.begin.beginTime }}开抢</view>
					</view>
					<view class="price-op" @click="$emit('submit', item.product_id, item.config_id||item.sv_assemble_config_id)">
						<view v-if="type == 'sec' || type == 'normal'" class="price" :style="{ color: _color, fontSize: 30 - size + 'rpx' }">{{ `￥${item.product_price}` }}</view>
						<view v-else class="price" :style="{ color: _color, fontSize: 30 - size + 'rpx' }">{{ `积分${item.sv_p_integral}` }}</view>
						<view class="storage" v-if="mode != 3 && type=='normal'">库存：{{ item.sv_p_storage }}</view>
						<view class="op">
							<text v-if="text" :style="{ fontSize: 30 - size * 3 + 'rpx', backgroundColor: _color }">{{ text }}</text>
							<view v-else class="iconfont-vant icon-vant-cart-circle-o" :style="{ color: _color, fontSize: 45 - size + 'rpx' }"></view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
import { ProductList, Seckill } from '../../utils/class.js';
import { setActiveColor } from '../../utils/util.js';
const productList = new ProductList();
const secKill = new Seckill();
export default {
	props: {
		text: String,
		border: Boolean,
		margin: {
			default: 6
		},
		color: {
			default: '#f44'
		},
		mode: {
			default: 2
		},
		round: {
			default: true
		},
		products: Array,
		type: {
			//normal 一般商品 sec 秒杀商品 integral 积分商品
			type: String,
			default: 'normal'
		}
	},
	computed: {
		size() {
			return this.mode == 0 ? 2 : this.mode;
		},
		_color() {
			return setActiveColor(this.color, '#f44');
		}
	}
};
</script>

<style lang="less" scoped>
.content {
	width: 100vw;
	display: flex;
	flex-wrap: wrap;
	box-sizing: border-box;
	.margin {
		box-sizing: border-box;
	}
	.card {
		box-sizing: border-box;
		overflow: hidden;
		border: 1px solid;
		width: 100%;
		.img {
			height: 0;
			background-position: center;
			background-repeat: no-repeat;
			background-size: cover;
		}
		.card-content {
			width: 100%;
			box-sizing: border-box;
			padding: 5rpx;
			background: white;
			.des {
				width: calc(100% - 20rpx);
				text-indent: 1.3rem;
				margin: 10rpx;
				line-height: 1.3rem;
			}
			.progress {
				height: 40rpx;
				width: 98%;
				background: #eee;
				border-radius: 20rpx;
				font-size: 20rpx;
				display: flex;
				align-items: center;
				color: #666;
				letter-spacing: 2rpx;
				overflow: hidden;
				position: relative;
				margin: 16rpx auto;
				.sell {
					color: white;
					background: linear-gradient(to right, rgb(250, 163, 96) 20%, rgb(246, 104, 177) 80%);
					border-radius: 20rpx;
					height: 100%;
					display: flex;
					justify-content: flex-start;
					align-items: center;
					box-sizing: border-box;
					position: relative;
					.value {
						position: absolute;
						left: 10rpx;
						display: flex;
						justify-content: flex-start;
						align-items: center;
						white-space: nowrap;
					}
				}
				.left {
					position: absolute;
					top: 0;
					right: 10rpx;
					bottom: 0;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
			.begin {
				color: red;
				padding-left: 10rpx;
				box-sizing: border-box;
				height: 40rpx;
			}
			.price-op {
				display: flex;
				justify-content: space-between;
				padding: 5rpx 10rpx;
				padding-bottom: 10rpx;
				align-items: center;
				.storage {
					color: #999;
					flex-grow: 1;
					font-size: 24rpx;
					margin-left: 10rpx;
				}
				.op {
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.op:active {
					opacity: var(--active-opacity);
				}
				text {
					padding: 6rpx 8rpx;
					border-radius: 10rpx;
					background-color: #f44;
					color: white;
				}
			}
		}
	}
}
</style>
