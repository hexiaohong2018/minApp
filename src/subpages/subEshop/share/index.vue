<template>
	<view class="activity-container">
		<block v-if="sv_invitation_info">
			<view class="img" v-if="!showRule"><image :src="sv_invitation_info.campaign_img"></image></view>
			<view class="des" id="des">给好友送福利，他得你也得</view>
			<view class="name" :style="{ borderColor: navColor, color: navColor }">{{ sv_invitation_info.campaign_name }}</view>
			<view class="gift">
				<view class="item">
					<text>您可获得</text>
					<text>{{ userModuleConfigDetail[0].sv_detail_value }}</text>
					<text>{{ userModuleConfigDetail[0].sv_user_givingtype == 1 ? '积分' : '元' }}</text>
				</view>
				<view class="item">
					<text>好友可得</text>
					<text>{{ userModuleConfigDetail[1].sv_detail_value }}</text>
					<text>{{ userModuleConfigDetail[1].sv_user_givingtype == 1 ? '积分' : '元' }}</text>
				</view>
			</view>
			<button class="share" :style="{ background: navColor }" @click="onShare">分享给好友</button>
			<view class="rule-head" @click="onClose">
				活动规则
				<view :class="{ 'rule-head-after-active': showRule, 'rule-head-after': !showRule }" @click.stop="onClose"></view>
			</view>
			<view class="rule" v-if="showRule">
				<p v-for="item in sv_invitation_info.campaign_rules" v-key="item">{{ item }}</p>
			</view>
		</block>
		<view v-else class="iconfont icon-wukong"></view>
		<!-- 分享 -->
		<dc-poster :share-info="shareInfo" :show="showPoseter" @close="ClosePoster" :color="navColor"></dc-poster>
	</view>
</template>

<script>
import { Share } from '../../../utils/class.js';
import { setActiveColor, showToastFn } from '../../../utils/util.js';
import dcPoster from '../../../components/poster/index.vue';
import {mapGetters} from 'vuex';
const share = new Share();
export default {
	data() {
		return {
			showRule: false,
			sv_invitation_info: null,
			userModuleConfigDetail: [], //奖励信息
			shareInfo: {},
			showPoseter: false,
		};
	},
	components: { dcPoster },
	computed:{
		...mapGetters({
			navColor:setActiveColor('custom/navColor','#000')
		})
	},
	onLoad(options) {
		share
			.getConfigInfo()
			.then(res => {
				if (res) {
					var sv_invitation_info = res.sv_invitation_info;
					this.sv_invitation_info = sv_invitation_info;
					this.userModuleConfigDetail = res.userModuleConfigDetail;
					this.shareInfo = {
						//配置分享信息,rid推荐人member_id
						title: '分享有礼',
						path: sv_invitation_info ? '/pages/eshop/index?rid=' + this.$store.getters['loginInfo/memberInfo'].member_id : '/pages/eshop/index',
						imageUrl: sv_invitation_info ? sv_invitation_info.campaign_img : ''
					};
				} else {
					showToastFn('商家没有配置邀请信息');
				}
			})
			.catch(msg => {
				showToastFn('获取邀请信息失败');
				console.log(msg);
			});
	},
	onShareAppMessage(res) {
		return this.shareInfo;
	},
	methods: {
		onShare() {
			this.showPoseter = true;
		},
		onClose: function() {
			this.showRule = !this.showRule;
		},
		ClosePoster(){
			this.showPoseter = false;
		}
	}
};
</script>


<style lang="less" scoped>
.activity-container {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	padding: 0 40rpx;
	box-sizing: border-box;
	color: #333;
	height: 100vh;
	background-color: white;
	height: 100vh;
	.icon-wukong {
		color: #999;
		font-size: 80rpx;
	}
	.img {
		width: 95%;
		height: 320rpx;
		overflow: hidden;
		border-radius: 20rpx;
		box-shadow: 0px 0px 4rpx 4rpx #eee;
		margin-top: 20rpx;
		image {
			width: 100%;
			height: 100%;
		}
	}
	.des {
		font-size: 28rpx;
		margin: 30rpx auto;
		text-align: center;
	}
	.name {
		min-width: 200rpx;
		border-radius: 40rpx;
		padding-left: 40rpx;
		padding-right: 40rpx;
		line-height: 72rpx;
		font-size: 32rpx;
		border: 1px solid;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.name::after {
		border: 0;
	}
	.share {
		height: 78rpx;
		width: 500rpx;
		border-radius: 40rpx;
		padding-left: 20rpx;
		padding-right: 20rpx;
		text-align: center;
		line-height: 74rpx;
		font-size: 32rpx;
		font-weight: 500;
		color: white;
		box-shadow: 0px 0px 2rpx 2rpx #eee;
		margin: 35rpx auto;
	}
	.share::after {
		border: 0;
	}
	.gift {
		width: 94%;
		height: 400rpx;
		display: flex;
		justify-content: space-around;
		align-content: center;
		.item {
			width: 260rpx;
			height: 320rpx;
			margin: auto 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			text {
				color: #915900;
				font-weight: bold;
				font-size: 72rpx;
			}
			text:first-child {
				font-size: 36rpx;
				font-weight: normal;
			}
			text:last-child {
				font-size: 36rpx;
				font-weight: normal;
			}
		}
		.item:first-child {
			border: 1px dotted #915900;
			position: relative;
		}
		.item:first-child::before {
			position: absolute;
			content: '';
			width: 40rpx;
			height: 40rpx;
			background: white;
			border-right: 2px dotted #915900;
			border-radius: 50%;
			top: 50%;
			margin-top: -20rpx;
			left: -30rpx;
		}
		.item:first-child::after {
			position: absolute;
			content: '';
			width: 40rpx;
			height: 40rpx;
			background: white;
			border-left: 2px dotted #915900;
			border-radius: 50%;
			top: 50%;
			margin-top: -20rpx;
			right: -30rpx;
		}
		.item:last-child {
			background: #f7d146;
			position: relative;
		}
		.item:last-child::before {
			position: absolute;
			content: '';
			width: 40rpx;
			height: 40rpx;
			background: white;
			border-radius: 50%;
			top: 50%;
			margin-top: -20rpx;
			left: -20rpx;
		}
		.item:last-child::after {
			position: absolute;
			content: '';
			width: 40rpx;
			height: 40rpx;
			background: white;
			border-radius: 50%;
			top: 50%;
			margin-top: -20rpx;
			right: -20rpx;
		}
	}
	.rule {
		width: 100%;
		color: #666;
		padding-left: 20rpx;
		padding-right: 20rpx;
		font-size: 24rpx;
		font-weight: 500;
		line-height: 21px;
		margin-bottom: 100rpx;
		display: block;
		p {
			display: block;
			text-indent: 2em;
			margin-bottom: 10rpx;
		}
	}
	.rule-head {
		font-size: 28rpx;
		position: relative;
		text-align: center;
		padding: 20rpx 5rpx 20rpx 20rpx;
		.rule-head-after {
			position: absolute;
			top: calc(50% - 10rpx);
			right: -30rpx;
			content: '';
			width: 14rpx;
			height: 14rpx;
			border-right: 1px solid #333;
			border-bottom: 1px solid #333;
			transform: rotate(45deg);
		}
		.rule-head-after-active {
			position: absolute;
			top: calc(50% - 7rpx);
			right: -30rpx;
			content: '';
			width: 14rpx;
			height: 14rpx;
			border-right: 1px solid #333;
			border-top: 1px solid #333;
			transform: rotate(-45deg);
		}
	}
}
</style>
