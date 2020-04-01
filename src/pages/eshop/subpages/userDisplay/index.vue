<template>
  <view class="user-container">
    <dc-nav-bar title="简介" arrow background="transparent" />
    <view class="des">
      <image class="bg" :src="employee.sv_technician_photo" mode="widthFix"></image>
      <view class="user-info">
        <image class="head" :src="employee.sv_technician_photo" mode="aspectFit"></image>
        <view class="name">
          <view class="content">{{employee.sv_technician_name}}</view>
          <view class="count">已被约{{employee.sv_reservation_number}}次</view>
        </view>
        <view class="grade">
          <view class="content">{{employee.sp_grouping_name}}</view>
          <view class="no">NO:{{employee.sv_technician_id}}</view>
        </view>
      </view>
      <ul class="contact">
        <li @click="callPhone">拨打电话</li>
        <li @click="addWechat">加我微信</li>
        <li @click="gotoShop">门店地址</li>
      </ul>
    </view>
    <view class="intro">
    <view class="title">ta的简介</view>
    <view class="content">{{employee.sv_description||'暂无简介...'}}</view>
    </view>
    <view class="production">
    <view class="title">ta的作品</view>
    <view class="no-production" v-if="employee.sv_technician_works.length == 0">
      暂无作品
    </view>
    <block v-else>
      <dc-ad  v-for="(item, index) in employee.sv_technician_works" :key="index" :images="item"  :indicator="false"/>
    </block>
    
    </view>
    <view class="submit" @click="onSubmit" :style="{background:activeColor}">立即预约</view>
  </view>
</template>

<script>
import { BookService } from '../../../../utils/class'
import { showToastFn } from '../../../../utils/util'
import {mapGetters} from 'vuex'
import DcAd from '../../../../components/ad'
const bookService = new BookService()
export default {
  navigate: ['navigateTo'],
  components: {
    DcAd
  },
  data () {
    return {
      employee:{},
      productions: [],
      activeColor:"#f44"
    }
  },
  computed:{
	  ...mapGetters({
		  shopInfo:'loginInfo/shopInfo'
	  })
  },
  methods: {
    addWechat(){
      var wx_num = this.employee.sv_wx_number
      if(wx_num){
        uni.setClipboardData({
          data: wx_num,
          success(res) {
            showToastFn("复制微信号成功,请到微信添加好友页面进行操作")
          }
        })
      }else{
        showToastFn("微信号为空","fail");
      }
    },
    callPhone(){
      const phoneNumber = this.employee.sv_technician_phone;
      if (phoneNumber) {
        uni.makePhoneCall({
          phoneNumber
        })
      } else {
        showToastFn("联系电话空", "fail");
      }
    },
    gotoShop(){
      if(!this.shopInfo.sv_us_coordinate || !this.shopInfo.shop_address){
        showToastFn(`商家配置位置信息有误：${!this.shopInfo.sv_us_coordinate?'店铺坐标为空':'店铺地址为空'}`);
      }else{
        uni.openLocation({
          latitude: sv_us_coordinate.lat,
          longitude: sv_us_coordinate.lng,
          name: this.shopInfo.shop_address
        })
      }
    },
    onSubmit () {
      this.$store.commit('reservation/setEmployee', this.employee)
      this.$minRouter.push({
        name: 'eshop/subpages/todoTime'
      })
    }
  },
  onLoad () {
    const { id } = this.$parseURL()
    bookService.getEmployeeInfo(id).then(res => {
      this.employee = res
    })
  }
};
</script>

<style lang='scss' scoped>
.user-container{
  width: 100vw;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin-bottom: 100rpx;
}

.des{
  width: 100%;
  height: 467rpx;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  color: white;
  padding: 50rpx 50rpx 0 50rpx;
  box-sizing: border-box;
  text-shadow: 4rpx 4rpx 4rpx #666;
}
.des .bg{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter:blur(10rpx);
}
.des .user-info{
  display: flex;
  align-items: center;
  width: 100%;
  height: 100rpx;
}
.des .user-info .head{
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 2px solid white;
}
.des .user-info .name{
  margin-left: 20rpx;
  flex-grow: 1;
  
}
.des .user-info .name .content{
  font-weight: 600;
  font-size: 36rpx;
}
.des .user-info .name .count{
  font-size: 24rpx;
}
.des .user-info .grade {
  font-size: 32rpx;
  font-weight: 600;
}
.des .contact{
  width: 100%;
  height: 100rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.des .contact li{
  font-size: 28rpx;
}
.production{
  width: 100%;
  background: white;
  margin-top: 20rpx;
}
.title{
  font-size: 38rpx;
  padding: 20rpx;
  color: black;
}
.submit{
  position: fixed;
  width: 100%;
  height: 100rpx;
  color: white;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.intro{
  background: white;
  height: 200rpx;
  font-size: 28rpx;
  color: #666;
}
.intro .content{
  text-indent: 2em;
  width: 100%;
  box-sizing: border-box;
  padding: 0 20rpx 10rpx 20rpx;
}

.no-production{
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  padding: 100rpx;
}
</style>