<template>
	<view class="integralRecording">
		<view class="header">
			<view class="databox">
				<view class="integral">{{ memberCardInfo.sv_mw_availableamount }}</view>
				<view class="integralText">余额 (元)</view>
			</view>
		</view>
		<!-- 会员充值输入框 -->
		<view class="rechargeContent">
			<view class="rechargeBox" :hidden="showInput"><dc-field :value="rechargeValue" placeholder="手动输入充值金额" @blur="changeValue" :border="false"></dc-field></view>
			<view class="rechargeValue"><view class="title">选择充值金额</view></view>
			<view
				v-for="(item, index) in rechargeList"
				:key="item.sv_detali_proportionalue"
				@click="selectRechargeValue(index)"
				:class="'list-item ' + (item.checked ? 'active' : '') + ' ' + (item.needClass ? 'marginRight0' : '')"
			>
				<view class="value">{{ item.sv_detali_proportionalue }}元</view>

				<view class="giftValue" v-if="item.sv_detail_value > 0">{{ '赠送' + item.sv_detail_value + '元' }}</view>
			</view>
		</view>
		<!-- 立即充值 -->
		<view class="rechargeImmediately">
			<view class="box"><button class="btn" :disabled="rechargeValue > 0 ? false : true" @click="rechargeImmediately">立即充值</button></view>
		</view>
		<!-- 立即充值 -->
	</view>
</template>

<script>
import dcField from '../../../components/field/index.vue';
import { mapGetters } from 'vuex';
import { Pay } from '../../../utils/class.js';
import { showModalFn, showToastFn } from '../../../utils/util.js';
const pay = new Pay();

export default {
	data() {
		return {
			rechargeList: [],
			rechargeValue: '',
			showInput: true
		};
	},
	components: {
		dcField
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.getCustomTopupConfig();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	computed: {
		...mapGetters({
			memberCardInfo: 'loginInfo/memberCardInfo'
		})
	},
	methods: {
		/**
		 * 获取会员自定义充值
		 */
		getCustomTopupConfig() {
			pay.getCustomTopupConfig()
				.then(res => {
					if (res.length > 0) {
						this.rechargeList = res.map((item, index) => {
							item.checked = false;
							item.needClass = (index + 1) % 3 ? false : true;
							return item;
						});
						this.showInput = true;
					} else {
						this.rechargeList = [
							{
								sv_user_configdetail_id: 0,
								//充值方案id
								sv_detali_proportionalue: 50,
								//充值的金额
								sv_detail_value: 0,
								//赠送的金额
								checked: false
							},
							{
								sv_user_configdetail_id: 0,
								//充值方案id
								sv_detali_proportionalue: 100,
								//充值的金额
								sv_detail_value: 0,
								//赠送的金额
								checked: false
							},
							{
								sv_user_configdetail_id: 0,
								//充值方案id
								sv_detali_proportionalue: 200,
								//充值的金额
								sv_detail_value: 0,
								//赠送的金额
								checked: false,
								needClass: true
							},
							{
								sv_user_configdetail_id: 0,
								//充值方案id
								sv_detali_proportionalue: 300,
								//充值的金额
								sv_detail_value: 0,
								//赠送的金额
								checked: false
							},
							{
								sv_user_configdetail_id: 0,
								//充值方案id
								sv_detali_proportionalue: 500,
								//充值的金额
								sv_detail_value: 0,
								//赠送的金额
								checked: false
							},
							{
								sv_user_configdetail_id: 0,
								//充值方案id
								sv_detali_proportionalue: 1000,
								//充值的金额
								sv_detail_value: 0,
								//赠送的金额
								checked: false,
								needClass: true
							}
						];
						this.showInput = false;
					}
				})
				.catch(msg => {
					console.log(msg);
				});
		},

		/**
		 * 选择一个充值的值
		 */
		selectRechargeValue(index) {
			this.resetRechargeList(index);
			this.rechargeValue = this.rechargeList[index].sv_detali_proportionalue;
		},

		/**
		 * 重置列表的选中的状态
		 */
		resetRechargeList(index) {
			this.rechargeList = this.rechargeList.map((item, _index) => {
				item.checked = _index == index ? true : false;
				return item;
			});
		},

		/**
		 * 赋值给输入框
		 */
		changeValue(e) {
			let values = e.detail.value;
			var reg = /^[0-9]{1}\d*(\.\d{1,2})?$/;
			if (values != '' && values != undefined && values != null) {
				if (!reg.test(values)) {
					showModalFn('请输入正确有效金额');
					this.rechargeValue = 0;
					return;
				} else {
					this.resetRechargeList(-1);
					this.rechargeValue = parseFloat(values || '').toFixed(2);
				}
			} else {
				this.rechargeValue = 0;
			}
		},

		/**
		 * 立即充值
		 */
		rechargeImmediately() {
			var rechargeValue = parseFloat(this.rechargeValue || 0); //自定义充值的金额
			if (rechargeValue > 0) {
				var item = this.rechargeList.find(item => item.checked),
					total_fee = item && item.sv_detali_proportionalue ? item.sv_detali_proportionalue : rechargeValue,
					model = {
						total_fee: total_fee,
						g_fee: item && item.sv_detail_value ? item.sv_detail_value : '',
						bzid: item && item.sv_user_configdetail_id ? item.sv_user_configdetail_id : ''
					};
				pay.weChatTopUp(model)
					.then(res => {
						showToastFn('充值成功', 'success');
						this.memberCardInfo.sv_mw_availableamount += total_fee;
						this.$store.dispatch('loginInfo/setMemberCardInfo', this.memberCardInfo);
						setTimeout(res => {
							uni.navigateBack({
								delta: 1
							});
						}, 1000);
					})
					.catch(msg => {
						showToastFn('充值失败:' + msg);
					});
			} else {
				showModalFn('充值的金额必须大于0');
			}
		}
	}
};
</script>
<style>
.integralRecording .header {
	height: 280rpx;
	position: relative;
	margin-bottom: 20rpx;
}
.integralRecording .headerbg {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 280rpx;
	z-index: 0;
}
.integralRecording .databox {
	width: 100%;
	position: absolute;
	z-index: 1;
	padding-top: 70rpx;
	color: #000;
	text-align: center;
}
.integralRecording .databox .integral {
	font-size: 60rpx;
	font-weight: bold;
}
.integralRecording .databox .integralText {
	font-size: 32rpx;
	padding-top: 15rpx;
}
.rechargeContent {
	padding: 0 30rpx;
	overflow: hidden;
	padding-bottom: 70px;
}
.rechargeContent .rechargeBox {
	background: #f8f8f8;
	padding: 20rpx 30rpx;
	font-size: 32rpx;
	border-radius: 8rpx;
}
.rechargeContent .rechargeValue {
	color: #666;
}
.rechargeContent .rechargeValue .title {
	font-size: 28rpx;
	padding-top: 20rpx;
	padding-bottom: 20rpx;
}
.rechargeContent .list-item {
	width: 216.66666rpx;
	padding: 20rpx 0;
	border: 1px solid #eaeaea;
	float: left;
	font-size: 28rpx;
	border-radius: 8rpx;
	text-align: center;
	margin-bottom: 20rpx;
	margin-right: 15rpx;
	background: white;
}
.rechargeContent .active {
	color: #fff;
	background: orangered;
	border-color: orangered;
}
.rechargeContent .marginRight0 {
	margin-right: 0;
}
.rechargeContent .list-item .giftValue {
	font-size: 24rpx;
	height: 40rpx;
	line-height: 40rpx;
	padding-top: 10rpx;
}
.rechargeImmediately {
	position: fixed;
	bottom: 0;
	width: 100%;
	height: 60px;
}
.rechargeImmediately .box {
	padding: 0 30rpx;
}
.rechargeImmediately .btn {
	background-color: orangered;
	color: #fff;
}
.rechargeImmediately .btn[disabled] {
	background-color: orangered;
	color: #fff;
	opacity: 0.6;
}
</style>
