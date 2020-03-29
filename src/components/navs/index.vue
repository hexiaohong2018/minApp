<template>
	<ul class="nav-container">
		<li class="nav-item" v-for="(item, index) in items" :key="index" @tap="onbindTap" :data-index="index">
			<image v-if="item.img" :src="item.img" mode="widthFix" />
			<div class="des" v-if="item.des">{{ item.des }}</div>
		</li>
	</ul>
</template>
<script>
export default {
	props: {
		items: Array
	},
	methods: {
		onbindTap: function(e) {
			var index = e.currentTarget.dataset.index,
				item = this.items[index];
			if ('link' in item) {
				this.$store.commit('mapPath/setMapPath');
				const mapPath = this.$store.getters['mapPath/mapPath'];
				var link = item.link,
					params = link.Params,
					target = params
						? `${mapPath[link.target]}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`
						: mapPath[link.target];
				if (target) {
					uni.navigateTo({
						url: target,
						success: function(res) {},
						fail: function(res) {
							uni.switchTab({
								url: target
							});
						}
					});
				}
			}
		}
	}
};
</script>
<style lang="less" scoped>
.nav-container {
	width: 100vw;
	box-sizing: border-box;
	display: flex;
	background: white;
	.nav-item {
		flex: 1;
		box-sizing: border-box;
		min-width: 20%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		image {
			width: 102%;
		}
		.des {
			background: white;
			box-sizing: border-box;
			padding: 0rpx 10rpx;
			width: 102%;
			max-height: 34px;
			height: 34px;
			text-align: center;
			line-height: 34px;
			font-size: 14px;
			font-weight: 600;
			color: #333333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			justify-content: center;
			align-items: center;
		}
	}
}
</style>
