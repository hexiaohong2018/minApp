<template>
  <view class="todo-time" :style="{'padding-bottom': isIphoneX ? '84px' : '50px'}">
    <dc-nav-bar title="预约时间" arrow clear-float :background="activeColor" />
    <view class="order-item">
      <view v-if="order" class="order min-flex min-flex-main-between">
        <view class="min-flex min-flex-dir-top">
          <view class="title">{{order.sv_p_name}}</view>
          <view class="value">约{{order.sv_product_time}}分钟</view>
        </view>
        <view class="min-flex label">
          <view>￥ {{order.sv_p_unitprice}}</view>
          <view class="iconfont-vant icon-vant-close" style="padding-left: 16rpx;" @click="clearOrder"></view>
        </view>
      </view>
      <dc-list v-else custom-class="cell">
        <view  class="add-icon" @click="onAdd">
          <view class="iconfont-vant icon-vant-add-o" size="38rpx"></view>
          <text>添加项目</text>
        </view>
      </dc-list>
    </view>

    
    
    <view class="order-item">
      <dc-list :title="employee.sv_technician_name" icon="contact" value="更换技师" @click="changeUser" v-if="employee"></dc-list>
      <dc-list v-else custom-class="cell" title="到店安排" icon="contact" value="不选择技师" bindtap="changeUser"></dc-list>
    </view>
    
    <view class="order-item">
      <view class="min-border-bottom">
        <dc-list title="预约人数" custom-class="cell">
          <uni-number-box buttonSize="30px" inputWidth="35px" :value="person_count" @change="handleChangeCount"></uni-number-box>
        </dc-list>
      </view>
      <view class="min-border-bottom">
        <dc-list title="预约人" custom-class="cell">
          <input style="width: 50%; text-align: right;" placeholder="请输入预约人姓名" v-model="person_name" />
        </dc-list>
      </view> 
      
      <view class="min-border-top">
        <dc-list title="手机号" custom-class="cell">
          <input style="width: 50%; text-align: right;" type="number" :maxlength="11" placeholder="请输入预约人手机号" v-model="person_phone" />
        </dc-list>
      </view>
    </view>

    <ul class="order-time">
      <li class="today" v-if="dayNav[0].week !== '今天'" @click="reSetTime">
        <view class="iconfont-vant icon-vant-arrow-left" style="font-size: 34rpx;"></view>
        <view class="more">今天</view>
      </li>
      <li @click="selectDay(index)" v-for="(item, index) in dayNav" :key="index" :class="{'item-active': active === index}" :style="{color: active === index ? activeColor : ''}">
        <view class="week">{{item.week}}</view>
        <view class="day">{{item.day}}</view>
      </li>
      <li bindtap="moreTime">
        
        <picker mode="date" :start="minDate" :end="maxDate" @change="bindTimeChange">
          <view class="iconfont-vant icon-vant-notes-o" style="font-size: 34rpx; text-align: center;"></view>
          <view class="more">更多</view>
        </picker>
      </li>
    </ul>
    <ul class="order-day">
      <li v-for="(item, index) in times" :key="index" :style="{'border-bottom': '4rpx solid;', 'border-bottom-color': choosedIndex === index ? activeColor : 'transparent'}" :class="{'choosed': item.choosed}" @click="onChoose(index)">{{item.s_value}}</li>
    </ul>

    <view class="p-btn min-flex min-flex-main-between">
      <view class="min-flex" style="padding-left: 28rpx;">
        <view>预约时间（日期/时间）：</view>
        <view style="color: #f44; padding-left: 16rpx;">{{choosedIndex >= 0 ? dayNav[active].day  + '/' + times[choosedIndex].s_value : '请选择'}}</view>
      </view>
      <view class="btn-y min-flex" @click="onSubmit">提交预约</view>
    </view>

  </view>
</template>
<script>
import DcList from '@/components/list/index'
import UniNumberBox from '@/components/uni-number-box/uni-number-box'
import { getWeek, setActiveColor, showToastFn, mobileNumber, showModalFn } from '@/utils/util'
import { mapGetters, mapMutations } from 'vuex'
import { BookService } from '@/utils/class'
const bookService = new BookService()
function dateFormat(fmt, date) {
    let ret
    const opt = {
        "Y+": date.getFullYear().toString(),
        "m+": (date.getMonth() + 1).toString(),
        "d+": date.getDate().toString(),
        "H+": date.getHours().toString(),
        "M+": date.getMinutes().toString(),
        "S+": date.getSeconds().toString()
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt)
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
    }
    return fmt
}
export default {
  navigate: ['navigateTo'],
  components: {
    DcList,
    UniNumberBox
  },
  computed: {
    ...mapGetters({
      employee: 'reservation/employee',
      order: 'reservation/order',
      navColor:"custom/navColor"
    })
  },
  created () {
    this.activeColor = setActiveColor(this.navColor, '#f44')
    this.dayNav = getWeek({
      days: 4
    })
    this._getWorkingShift(0)
    this.minDate = dateFormat('YYYY-mm-dd', new Date())
    this.maxDate = dateFormat('YYYY-mm-dd', new Date((new Date().getTime()) + 60 * 24 * 60 * 60 * 1000))
  },
  data () {
    return {
      activeColor: '#f44',
      person_name: '',
      person_phone: '',
      active: 0,
      dayNav: [],
      times: [],
      choosedIndex: -1,
      minDate: '',
      maxDate: '',
      person_count: 1
    }
  },
  methods: {
    ...mapMutations({
      setOrder: 'reservation/setOrder',
      setService: 'reservation/setService',
      setOrderTabsIndex: 'index/setOrderTabsIndex'
    }),
    handleChangeCount (num) {
      this.person_count = num
    },
    changeUser () {
      this.setOrderTabsIndex(0)
      this.$minRouter.push({
        name: 'sweshop'
      })
    },
    clearOrder () {
      this.setOrder(null)
    },
    onAdd () {
      this.setOrderTabsIndex(1)
      this.$minRouter.push({
        name: 'sweshop'
      })
    },
    _getWorkingShift(index) {
      let s_nav = this.dayNav[index]
      let timestamp = new Date()
      let date = timestamp.getFullYear() + '-' + s_nav.day
      let technician_id = this.employee ? this.employee.sv_technician_id : 0

      bookService.getWorkingShift(new Date(date).getDay(), date, technician_id).then(res => {
        this.times = res.list.reservation_time.map(item => {
          return {
            choosed: item.isEffective && new Date(date.replace(/-/g, '/') + ' ' + item.sv_timeslice_start) < timestamp,
            s_value: item.sv_timeslice_start,
            e_value: item.sv_timeslice_end
          }
        })
      })
    },
    reSetTime() {
      this.dayNav = getWeek({
        days: 4
      })
      this.active = 0
      this.choosedIndex = -1
      this._getWorkingShift(0)
    },
    selectDay(index) {
      this.active = index
      this.choosedIndex = -1
      this._getWorkingShift(index)
    },
    onChoose(index) {
      if (!this.times[index].choosed) {
        this.choosedIndex = index
      }
    },
    bindTimeChange(e) {
      this.dayNav = getWeek({
        timestamp: new Date(e.detail.value).getTime(),
        days: 4
      })
      this.active = 0
      this.choosedIndex = -1
      this._getWorkingShift(0)
    },
    /**
     * 确定预约
     * product_id	项目id必填
     * sv_reservation_money 项目金额
      sv_product_number	项目数必填
      sv_person_number	预约人数必填
      sv_product_time	项目时长必填
      sv_technician_id	技师id可选填(不填到店分配)
      sv_reservation_person	预约人姓名必填
      sv_reservation_phone	预约电话必填
      sv_reservation_date1	预约时间起必填
      sv_reservation_date2	预约时间止必填
      sv_reservation_state	预约状态1申请
      sv_service_type	服务方式【1到店；2上门】 必填
    */

  _applyService({ product_id,sv_reservation_money,sv_product_number,sv_person_number,sv_product_time,sv_technician_id,
    sv_reservation_person,sv_reservation_phone,sv_reservation_date1,sv_reservation_date2
    }){
      bookService.applyService({
        product_id,
        sv_reservation_money,
        sv_product_number,
        sv_person_number,
        sv_product_time,
        sv_technician_id,
        sv_reservation_person,
        sv_reservation_phone,
        sv_reservation_date1,
        sv_reservation_date2
      }).then(res => {
        // wx.navigateTo({
        //   url: `../todoPaySuccess/index?reservation_id=${res}`
        // })
        this.$minRouter.push({
          name: 'eshop/subpages/todoPaySuccess'
        })
   
        bookService.getServiceOrderInfo(res).then(res1=>{
          this.setService(res1)
        })
      
      }).catch(msg=>{
        showModalFn("预约失败:" + msg.result)
      })
    },
    onSubmit(e) {
      var order = this.order,
        product_id = order && order.product_id,
        sv_reservation_money = order && order.sv_p_unitprice,
        sv_product_number = 1,
        sv_person_number = this.person_count,
        sv_product_time = order && order.sv_product_time,
        time = this.choosedIndex > -1 ? this.times[this.choosedIndex] : null,
        sv_reservation_date1 = time && time.s_value,
        sv_reservation_date2 = time && time.e_value,
        sv_technician_id = (this.employee && this.employee.sv_technician_id) || 0,
        sv_reservation_person = this.person_name,
        sv_reservation_phone = this.person_phone;
      if (!product_id){
        showToastFn("请选择预约项目")
        return;
      }
      if (!sv_reservation_person){
        showToastFn("预约人不能为空")
        return;
      }
      if (!sv_reservation_phone || !mobileNumber(sv_reservation_phone)) {
        showToastFn("手机号不正确")
        return;
      }
      if (!time){
        showToastFn("请选择预约时间")
        return;
      }
      if (!sv_technician_id){
        showModalFn("到店安排技师?",()=>{
          this._applyService({
            product_id,
            sv_reservation_money,
            sv_product_number,
            sv_person_number,
            sv_product_time,
            sv_technician_id,
            sv_reservation_person,
            sv_reservation_phone,
            sv_reservation_date1,
            sv_reservation_date2
          })
          return;
        },()=>{
          showToastFn("请选择技师");
          return;
        })
      }else{
        this._applyService({
          product_id,
          sv_reservation_money,
          sv_product_number,
          sv_person_number,
          sv_product_time,
          sv_technician_id,
          sv_reservation_person,
          sv_reservation_phone,
          sv_reservation_date1,
          sv_reservation_date2
        })
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.p-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  font-size: 26rpx;
  background: #ffffff;
  .btn-y {
    width: 240rpx;
    height: 100rpx;
    background: #f44;
    color: #ffffff;
    font-size: 28rpx;
  }
}
.todo-time{
  box-sizing: border-box;
  width: 100vw;
  padding: 0 30rpx 100rpx 30rpx;
}
.order {
  padding: 20rpx;
  .title {
    color: #333;
    font-size: 26rpx;
    line-height: 1.3rem;
    box-sizing: border-box;
  }
  .value {
    color: #999;
  }
  .label {
    color: #999;
  }
}
.order-item{
  width: 100%;
  border-radius: 20rpx;
  background: white;
  overflow: hidden;
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.order-item .add-icon{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10rpx auto;
  font-size: 28rpx;
  color: #999;
}
.order-item .add-icon van-icon{
  display: flex;
  justify-content: center;
  align-items: center;
}
.order-item .add-icon text{
  padding-left: 5rpx;
}

.order-item .cell{
  height: 110rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.order-item .custom-icon{
  height: 100%;
  font-size: 18rpx;
  padding-left: 30rpx;
}
.order-item van-icon{
  display: flex;
  justify-content: center;
  align-items: center;
}
.order-time{
  width: 100%;
  height: 110rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 26rpx;
  margin-top: 20rpx;
}
.order-time li{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
  overflow: hidden;
}
.order-time .today{
  display: flex;
  flex-direction: row;
}
.order-time .item-active{
  position: relative;
}
.order-time .item-active::after{
  content: "";
  background: white;
  width: 24rpx;
  height: 24rpx;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  bottom: -12rpx;
}
.order-day{
  width: 100%;
  background: white;
  border-radius: 20rpx;
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
  padding: 20rpx 10rpx 50rpx 10rpx;
  margin-bottom: 50rpx;
  font-size: 28rpx;
}
.order-day li{
  width: 20%;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: 20rpx;
  color: #666;
}
.order-day .choosed{
  color: #bdc3c7;
}

.submit{
  position: relative;
}
.submit .btn{
  position: absolute;
  right: 0;
  top: 0;
  height: 100rpx;
  width: 220rpx;
  z-index: 1;
  text-align: center;
  line-height: 100rpx;
  color: white;
  font-size: 30rpx;
}
.submit .des{
  font-size: 28rpx;
  color: #666;
  padding-left: 20rpx;
}
.submit .des text{
  padding-left: 20rpx;
}

.input-class{
  background-color: transparent !important;
  color: #666 !important;
}
.change-class{
  background-color: transparent !important;
}
</style>