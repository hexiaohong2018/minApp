<template>
	<view class="container">
		<dc-field
			:value="addr"
			:disabled="dis_lbs"
			required
			label="收货地址"
			:placeholder="dis_lbs ? '请点击右边图标选择地址' : '请输入收货地址'"
			@change="changeAddr"
		l>
		<template v-slot:right-icon>
			<view class="iconfont-vant icon-vant-location" @click="chooseLocation" :style="{color:'#3992f9'}"></view>
		</template>
		</dc-field>
		<dc-field :value="instructions" label="门牌号" placeholder="请输入门牌号" required @blur="changeAddrRemark" />
		<dc-field :value="name" label="联系人" placeholder="请输入联系人" required @blur="changeContacts" />
		<dc-field :value="phone" label="手机号" placeholder="请输入手机号码" required :border="false" @blur="changePhone" />
		
		<view class="add" @click="determineAddress">
			<view class="iconfont-vant" :class="'icon-vant-'+(id > 0 ? 'edit':'plus')"></view>
			{{ id > 0 ? '修改保存' : '确定新增' }}
		</view>
	</view>
</template>

<script>
import { showToastFn } from '../../../utils/util.js';
import { Address } from '../../../utils/class.js';
import dcField from '../../../components/field/index.vue';
const addr = new Address();
export default {
	components:{dcField},
	onLoad(options) {
		var shopInfo = this.$store.getters['loginInfo/shopInfo'];
		shopInfo && (this.dis_lbs = shopInfo.dis_lbs);
		if (options.id > 0) {
			uni.setNavigationBarTitle({
				title: '修改收货地址'
			});
			addr.getAddressList({ id: options.id })
				.then(res => {
					this.addr = res.pcdAddress;
					this.instructions = res.instructions;
					this.name = res.sv_receipt_name;
					this.phone = res.sv_receipt_phone;
					this.id = res.sv_receipt_id;
					this.coordinate = res.sv_receipt_mlanlat;
				})
				.catch(msg => {
					showToastFn('获取地址失败');
				});
		}
	},
	data() {
		return {
			addr: '',
			instructions: '',
			name: '',
			phone: '',
			id: 0,
			coordinate: '',
			dis_lbs: false
		};
	},
	methods: {
		changeAddr(e) {
			this.addr = e.detail.value;
		},
		changeAddrRemark(e) {
			this.instructions = e.detail.value;
		},
		changeContacts(e) {
			this.name = e.detail.value;
		},
		changePhone(e) {
			this.phone = e.detail.value;
		},
		determineAddress() {
			addr.saveAddress(this.$data)
				.then(res => {
					showToastFn('保存成功');
					setTimeout(function() {
						uni.navigateBack({
							delta: 1
						});
					}, 1000);
				})
				.catch(msg => {
					console.log(msg);
					showToastFn(msg);
				});
		},

		//选择位置位置
		chooseLocation: function(e) {
			addr.location({
				wxFn: uni.chooseLocation,
				success: res => {
					this.coordinate = JSON.stringify({
						longitude: res.longitude,
						latitude: res.latitude
					});
					this.addr = res.address;
				},
				fail: err => {
					console.log(err);
				}
			});
		}
	}
};
</script>

<style lang="less" scoped>
.container {
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: white;
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
		.iconfont-vant {
			margin-right: 10rpx;
		}
	}
}
</style>
