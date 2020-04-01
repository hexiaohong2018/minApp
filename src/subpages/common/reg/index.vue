<template>
	<div class="container">
		<div class="head"><open-data type="userAvatarUrl"></open-data></div>
		<form @submit="onSubmit" :report-submit="true">
			<input class="phone" v-model="phone" type="number" placeholder="请输入手机号码" />
			<div class="code-content">
				<input class="code" v-model="code" type="number" placeholder="请输入验证码" />
				<button class="send-code" @click="sendCode">{{ sendMsg }}</button>
			</div>
			<button class="reg" form-type="submit">绑定注册</button>
		</form>
		<div class="fast-title">微信用户快速绑定</div>
		<form :report-submit="true" @submit="fastSubmit">
			<button class="fast-wx-btn" open-type="getPhoneNumber" type="info" @getphonenumber="fastReg" form-type="submit">
				<div class="img"><i class="iconfont-dc icon-dc-weixin"></i></div>
			</button>
		</form>
	</div>
</template>

<script>
import { User } from '../../../utils/class.js';
import { showToastFn, showModalFn } from '../../../utils/util.js';
const user = new User();
export default {
	data() {
		return {
			phone: '',
			code: '',
			sendMsg: '获取验证码',
			formId: ''
		};
	},
	methods: {
		fastSubmit(e) {
			this.formId = '';
			this.formId = e.detail.formId;
		},
		fastReg(e) {
			if (e.detail.iv) {
				var params = e.detail;
				params.form_id = this.formId;
				user.weChatPhoneNumberReg(params)
					.then(res => {
						//移除推荐人ID
						this.$store.dispatch('loginInfo/setRecommendMemberId',0)
		
						showToastFn('注册成功', 'success');
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							});
						}, 1500);
					})
					.catch(msg => {
						showToastFn('注册失败', 'fail');
						console.log(msg);
					});
			} else {
				showModalFn('授权失败，请尝试手机号码登录/注册');
				console.log(e.detail.errMsg);
			}
		},
		onSubmit(e) {
			user.bindMemberCard(this.phone, this.code, e.detail.formId)
				.then(res => {
					//移除推荐人ID
					this.$store.dispatch('loginInfo/setRecommendMemberId',0);
					showToastFn('注册成功', 'success');
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 1500);
				})
				.catch(msg => {
					showToastFn('注册失败', 'fail');
					console.log(msg);
				});
		},
		sendCode() {
			user.sendCode(this.phone)
				.then(res => {
					let temp = 110,
						timer = setInterval(() => {
							this.sendMsg = `${temp}(s)`;
							if (!temp--) {
								this.sendMsg = '获取验证码';
								clearInterval(timer);
							}
						}, 1000);
				})
				.catch(msg => {
					console.log(msg);
					showToastFn(msg);
				});
		}
	}
};
</script>

<style lang="less" scoped>
.container {
	width: 100vw;
	height: 100vh;
	background: white;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 200rpx;

	.head {
		width: 200rpx;
		height: 200rpx;
		overflow: hidden;
		border-radius: 50%;
		margin-bottom: 60rpx;
	}

	.phone,
	.code {
		height: 80rpx;
		width: 500rpx;
		border: 1px solid #999;
		border-radius: 80rpx;
		padding-left: 40rpx;
		padding-right: 40rpx;
		box-sizing: border-box;
	}

	.code-content {
		margin-top: 35rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80rpx;
		width: 500rpx;
	}

	.code {
		width: 330rpx;
		position: relative;
		border-radius: 80rpx 0rpx 0rpx 80rpx;
		border-right: 0;
	}

	.send-code {
		width: 170rpx;
		height: 100%;
		font-size: 28rpx;
		background-color: #ff852a;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		border-radius: 0rpx 80rpx 80rpx 0rpx;
		padding: 10rpx;
	}

	.send-code:after {
		border: 1px solid #ff852a;
	}

	.reg {
		margin-top: 80rpx;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		background-color: #ff852a;
		height: 80rpx;
		color: white;
		border-radius: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10rpx;
	}

	.reg:after {
		border: 1px solid #ff852a;
	}

	.fast-title {
		color: #999;
		padding: 50rpx 20rpx;
		font-size: 28rpx;
		position: relative;
	}

	.fast-title:after,
	.fast-title:before {
		content: '';
		width: 100rpx;
		height: 2rpx;
		background: #eee;
		position: absolute;
		top: 50%;
	}

	.fast-title:after {
		right: -100rpx;
	}

	.fast-title:before {
		left: -100rpx;
	}
	.fast-wx-btn {
		background: transparent;
		.img {
			width: 70rpx;
			height: 70rpx;
			border-radius: 50%;
			background: rgb(0, 200, 0);
			display: flex;
			justify-content: center;
			align-items: center;
			.icon-dc-weixin {
				font-size: 50rpx;
				color: white;
			}
		}
	}
	.fast-wx-btn:after {
		border: 0;
	}
}
</style>
