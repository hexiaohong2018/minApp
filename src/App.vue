<script>
	export default {
		onLaunch: function() {
			this.$store.dispatch('test/test',567);
			this.$store.dispatch('systemInfo/systemInfo');
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "uview-ui/index.scss";
</style>
