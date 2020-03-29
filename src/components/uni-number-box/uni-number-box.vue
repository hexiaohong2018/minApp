<template>
	<view class="uni-numbox" :style="{ height: buttonSize, lineHeight: buttonSize }">
		<view @click="_calcValue('minus')" class="uni-numbox__minus" :style="{ width: buttonSize }">
			<text class="uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue <= min || disabled }">-</text>
		</view>
		<input :disabled="disabled || readOnly" @blur="_onBlur" class="uni-numbox__value" type="number" v-model="inputValue" :style="{ width: inputWidth }" />
		<view @click="_calcValue('plus')" class="uni-numbox__plus" :style="{ width: buttonSize }">
			<text class="uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue >= max || disabled }">+</text>
		</view>
	</view>
</template>
<script>
export default {
	name: 'UniNumberBox',
	props: {
		value: {
			type: [Number, String],
			default: 1
		},
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 100
		},
		step: {
			type: Number,
			default: 1
		},
		disabled: {
			type: Boolean,
			default: false
		},
		readOnly:Boolean,
		buttonSize: {
			type: String,
			default: '35px'
		},
		inputWidth: {
			type: String,
			default: '40px'
		}
	},
	data() {
		return {
			inputValue: 0
		};
	},
	watch: {
		value(val) {
			this.inputValue = +val;
		},
		inputValue(newVal, oldVal) {
			if (+newVal !== +oldVal) {
				this.$emit('change', newVal);
			}
		}
	},
	created() {
		this.inputValue = +this.value;
	},
	methods: {
		_calcValue(type) {
			if (this.disabled) {
				return;
			}
			const scale = this._getDecimalScale();
			let value = this.inputValue * scale;
			let step = this.step * scale;
			if (type === 'minus') {
				value -= step;
				if (value < this.min) {
					return;
				}
				if (value > this.max) {
					value = this.max;
				}
			} else if (type === 'plus') {
				value += step;
				if (value > this.max) {
					return;
				}
				if (value < this.min) {
					value = this.min;
				}
			}

			this.inputValue = String(value / scale);
		},
		_getDecimalScale() {
			let scale = 1;
			// 浮点型
			if (~~this.step !== this.step) {
				scale = Math.pow(10, (this.step + '').split('.')[1].length);
			}
			return scale;
		},
		_onBlur(event) {
			let value = event.detail.value;
			if (!value) {
				// this.inputValue = 0;
				return;
			}
			value = +value;
			if (value > this.max) {
				value = this.max;
			} else if (value < this.min) {
				value = this.min;
			}
			this.inputValue = value;
		}
	}
};
</script>
<style lang="scss" scoped>
.uni-numbox {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
}

.uni-numbox__value {
	background-color: $uni-bg-color;
	height: 100%;
	text-align: center;
	font-size: $uni-font-size-lg;
	border-width: 1rpx;
	border-style: solid;
	border-color: $uni-border-color;
	border-left-width: 0;
	border-right-width: 0;
}

.uni-numbox__minus {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: 100%;
	font-size: 20px;
	color: $uni-text-color;
	background-color: $uni-bg-color-grey;
	border-width: 1rpx;
	border-style: solid;
	border-color: $uni-border-color;
	border-top-left-radius: $uni-border-radius-base;
	border-bottom-left-radius: $uni-border-radius-base;
	border-right-width: 0;
}

.uni-numbox__plus {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: 100%;
	border-width: 1rpx;
	border-style: solid;
	border-color: $uni-border-color;
	border-top-right-radius: $uni-border-radius-base;
	border-bottom-right-radius: $uni-border-radius-base;
	background-color: $uni-bg-color-grey;
	border-left-width: 0;
}

.uni-numbox--text {
	font-size: 40rpx;
	color: $uni-text-color;
}

.uni-numbox--disabled {
	color: $uni-text-color-disable;
}
</style>
