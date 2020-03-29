<template>
	 <view class="list-li">
	      <image class='head-img'  :src='item.head_img' />
	    <view class='user-name'>{{item.user_name}}</view>
	    <view class='src'>{{item.reason}}</view>
	    <view class='value-container'>
	      <view class="date">{{item.date}}</view>
	      <view class='value'>{{item.title}}：{{item.type == 0 ? "":"-"}}{{item.value}}{{item.present && item.present > 0?"(赠送"+item.present+")":""}}</view>
	    </view>
	  </view>
</template>

<script>
	export default{
		props:{
			item:Object
		}
	}
</script>

<style lang="less" scoped>
	.list-li {
	  width: 100%;
	  display: flex;
	  flex-direction: row;
	  height: 140rpx;
	  justify-content: flex-start;
	  align-items: center;
	  box-shadow: 0px 0px 4rpx 4rpx #eee;
	  border-radius: 20rpx;
	  box-sizing: border-box;
	  padding-left: 30rpx;
	  padding-right: 30rpx;
	  font-size: 24rpx;
	  background: white;
	  margin-top: 20rpx;
	}
	
	.head-img {
	  width: 86rpx;
	  height: 86rpx;
	  border-radius: 50%;
	}
	
	.user-name {
	  margin-left: 30rpx;
	  font-size: 28rpx;
	  font-weight: 600;
	  width: 100rpx;
	  overflow: hidden;
	  text-overflow:ellipsis;
	  white-space: nowrap;
	}
	
	.src {
	  text-align: center;
	  color: #999;
	  margin-left: 30rpx;
	}
	
	.value-container {
	  flex-grow: 1;
	}
	
	.value-container .value {
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: flex-end;
	  color: rgb(249, 165, 40);
	  font-weight: 600;
	}
	
	.value-container .date {
	  color: #999;
	  text-align: end;
	}

</style>
