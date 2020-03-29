<template>
  <view class="pay-container">
    <view class="state1">
      <view class="icon">
        <view class="iconfont-vant icon-vant-clock-o" :style="{color: activeColor, 'font-size': '50px'}"></view>
      </view>
      <view class="des">
        <view class="title">{{service.sv_reservation_state_name}}</view>
        <view class="content">请按时到店，凭订单号或者手机号与商家确定后即可享受服务</view>
      </view>

    </view>
    <view class="people-info">
      <view class="waiter">
        <view class="title">技师</view>
        <view class="info">{{service.sv_technician_name || "到店安排"}}</view>
      </view>
      <view class="costomer">
        <view class="title">到店人</view>
        <view class="info">{{service.sv_reservation_person}}({{service.sv_reservation_phone}})</view>
      </view>
    </view>
    <ul class="todo-container">
      <li class="todo-item">
        <view class="title">
          <view class="content">订单号：{{service.sv_reservation_code}}</view>
          <view :style="{color: activeColor}">
            {{service.sv_reservation_state_name}}
          </view>
        </view>
        <view class="list">
          <image class="img" mode="aspectFill" :src="service.sv_p_images2"></image>
          <view class="name">{{service.sv_p_name}}</view>
          <view class="price">{{service.sv_reservation_money}}</view>
        </view>
        <view class="foot">
          <view class="time">预约到店：<text :style="{color: activeColor}">{{service.sv_reservation_date1_new}}</text></view>

          <view v-if="service.sv_reservation_state === 1" class="op" @click="onCancel(service.sv_reservation_id)">取消预约</view>
        </view>
      </li>
    </ul>
  </view>
</template>
<script>
import { setActiveColor, showToastFn } from '@/utils/util'
import store from '@/utils/store.js'
import { mapGetters } from 'vuex'
import { BookService } from '@/utils/class'
const bookService = new BookService()
export default {
  navigate: ['navigateTo'],
  data () {
    return {
      activeColor: '#f44'
    }
  },
  computed: {
    ...mapGetters({
      service: 'reservation/service'
    })
  },
  methods: {
    onCancel (id) {
      bookService.cancelService(id).then(res=>{
        showToastFn('取消成功')
        this.service.sv_reservation_state = -1
      }).catch(msg=>{
        showToastFn(msg.result || "取消失败")
      })
    }
  },
  created () {
    this.activeColor = setActiveColor(store.getters.navColor, '#f44')
  }
}
</script>
<style lang='less' scoped>
.todo-container {
  width: 100vw;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 20rpx;
}

.todo-item {
  width: 100%;
  border-radius: 20rpx;
  background: white;
  font-size: 26rpx;
  color: #666;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}

.todo-item .title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60rpx;
  border-bottom: 1px solid #eee;
  padding: 10rpx 20rpx;
}

.todo-item .list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 150rpx;
  padding: 20rpx 20rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.todo-item .list .img {
  width: 18%;
  height: 100%;
  box-sizing: border-box;
}

.todo-item .list .price {
  width: 20%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.todo-item .list .price::before {
  content: "￥";
}

.todo-item .list .name {
  height: 90%;
  padding: 0px 20rpx;
  width: 60%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.todo-item .foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60rpx;
  border-top: 1px solid #eee;
  padding: 10rpx 20rpx;
  color: #999;
}

.todo-item .foot .op{
  padding: 10rpx 20rpx;
  border: 1px solid #eee;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.pay-container{
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.pay-container .state1{
  width: 100%;
  height: 200rpx;
  background: white;
  display: flex;
  box-sizing: border-box;
  padding: 30rpx;
}
.pay-container .state1 .icon{
  font-size: 80rpx;
  height: 100%;
  width: 150rpx;
  
  display: flex;
  justify-content: center;
  align-items: center;
}
.pay-container .state1 .des{
  font-size: 30rpx;
  padding-left: 30rpx;

}
.pay-container .state1 .title{
  font-size: 34rpx;
  color: black;
}
.pay-container .state1 .content{
  font-size: 26rpx;
  margin-top: 10rpx;
}

.people-info{
  width: 100%;
  background: white;
  padding: 30rpx;
  box-sizing: border-box;
  border-top: 1px dotted #eee;
  font-size:28rpx;
  margin-bottom: 10rpx;
}
.people-info .waiter, .people-info .costomer{
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0rpx;
}
.people-info .title{
  color: black;
}
.todo-container{
  padding:0;
}
.todo-item{
  border-radius: 0;
}
.home{
  position: fixed;
  bottom: 150rpx;
  right: 40rpx;
  background: rgba(0,0,0,.5);
  border-radius: 50%;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>