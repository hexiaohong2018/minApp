<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    this.$store.dispatch('systemInfo/systemInfo')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style>
/*每个页面公共css */
@import url("./iconfont.css");
@import url("./iconfont-dc.css");
body,page{
  margin: 0;
  padding: 0;
  --active-opacity:0.5;
  color: #333;
  font-size: 16px;
  background: #f8f8f8;
  min-height: 100vh;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  font-family: 'PingFang SC', Helvetica, 'STHeiti STXihei', 'Microsoft YaHei', Tohoma, Arial, sans-serif;
}
ul, li{
  padding:0;
  margin:0;
  list-style:none
}
.ellipsis{
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.ellipsis-2{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.ellipsis-3{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
</style>
