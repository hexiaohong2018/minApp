<template>
	<div class="container">
		<!-- <mescroll-body @init="mescrollInit" @up="upCallBack" @down="downCallBack" bottom="100rpx" :down="{ auto: false }" :up="{ auto: false, empty: { tip: '暂无地址数据' } }"> -->
			<radio-group @change="onChange">
				<uni-swipe-action>
					<uni-swipe-action-item :options="options" v-for="(item, index) in addrList" :key="item.sv_receipt_id" @click="onClick($event, index)">
						<labe class="addr">
							<radio :value="item.sv_receipt_id" color="#FF852A" :style="{ transform: 'scale(0.7)' }" :checked="defValue == item.sv_receipt_id" />
							<dc-list
								:title="`${item.sv_receipt_name}(${item.sv_receipt_phone})`"
								:label="item.pcdAddress + item.instructions"
								@click="setDefAddress(item.sv_receipt_id)"
							/>
						</labe>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</radio-group>
		<!-- </mescroll-body> -->

		<div class="add" @click="addAddr">
			<view class="iconfont-vant icon-vant-plus"></view>
			新增收货地址
		</div>
	</div>
</template>

<script>
import dcList from '../../../components/list/index.vue';
import uniSwipeAction from '../../../components/uni-swipe-action/uni-swipe-action.vue';
import uniSwipeActionItem from '../../../components/uni-swipe-action-item/uni-swipe-action-item.vue';

import { showToastFn, showModalFn } from '../../../utils/util.js';
import { Address } from '../../../utils/class.js';
const addr = new Address();
export default {
	data() {
		return {
			defValue: '0',
			addrList: {},
			options: [
				{
					text: '编辑',
					style: {
						backgroundColor: '#007aff'
					}
				},
				{
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				}
			]
		};
	},
	components: {
		dcList,
		uniSwipeAction,
		uniSwipeActionItem
	},
	onShow() {
		addr.getAddressList().then(res => {
			let def_address = res.find(item => item.sv_isdefault_address);
			this.defValue = def_address ? def_address.sv_receipt_id : 0;
			this.addrList = res;
		});
	},
	methods: {
		// mescrollInit(mescroll) {
		// 	this.mescroll = mescroll;
		// },
		// downCallBack(mescroll) {
		// 	mescroll.resetUpScroll();
		// },
		// upCallBack(mescroll) {
		// 	addr.getAddressList().then(res => {
		// 		let def_address = res.find(item => item.sv_isdefault_address);
		// 		this.defValue = def_address ? def_address.sv_receipt_id : 0;
		// 		this.addrList = res;
		// 		mescroll.endSuccess(res.length, false);
		// 	});
		// },
		_setDefAddress(id) {
			//地址id
			addr.setDefAddress(id)
				.then(res => {
					this.defValue = id;
					showToastFn('设置默认地址成功');
					let pages = getCurrentPages(),
						prePage = pages[pages.length - 2];
					//如果是从兑换/支付页面跳转过来的，则返回
					if (prePage && prePage.route && prePage.route.indexOf('pay') > -1) {
						uni.navigateBack({
							delta: 1
						});
					}
				})
				.catch(msg => {
					console.log(msg);
					showToastFn('设置默认地址失败');
				});
		},
		onClick(e, index) {
			let addrItem = this.addrList[index];
			if (e.index == 0) {
				//修改
				uni.navigateTo({
					url: '../addAddress/index?id=' + addrItem.sv_receipt_id
				});
			} else {
				//删除
				showModalFn(
					'确定删除吗？',
					() => {
						addr.delAddress(addrItem.sv_receipt_id)
							.then(res => {
								this.addrList.splice(index, 1);
								showToastFn('删除成功');
							})
							.catch(msg => {
								console.log(msg);
								showToastFn('删除失败');
							});
					},
					() => {
						showToastFn('已取消删除');
					}
				);
			}
		},
		addAddr() {
			uni.navigateTo({
				url: '../addAddress/index'
			});
		},
		setDefAddress(e) {
			this._setDefAddress(e);
		},
		onChange(e) {
			var value = e.detail.value;
			if (this.defValue == value) return;
			this._setDefAddress(value);
		}
	}
};
</script>

<style lang="less" scoped>
.container {
	width: 100vw;
	height: 100vh;
	box-sizing: border-box;
	overflow-y: scroll;
	overflow-x: hidden;
	background: white;
	.addr {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-left: 10rpx;
		box-sizing: border-box;
	}
	.add {
		position: fixed;
		width: 100%;
		height: 100rpx;
		background: white;
		border-top: 1px solid #eee;
		bottom: 0;
		left: 0;
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28rpx;
		color: #ff852a;
		z-index: 100;
		.iconfont-vant {
			margin-right: 10rpx;
		}
	}
	.op {
		height: 100%;
		width: 130px;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
		.del,
		.edit {
			width: 50%;
			height: 100%;
			color: white;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 28rpx;
		}
		.del {
			background: #ee0a24;
		}
		.edit {
			background: #07c160;
		}
	}
}
</style>
