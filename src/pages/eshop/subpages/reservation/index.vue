<template>
  <view>
    <dc-tabs :active="activeIndex" :titles="tabsList" @change="handleTabsChange"></dc-tabs>
    <mescroll-uni :top="navHeight + 'px'" :bottom="tabBarHeight + 'px'" @init="mescrollInit" @down="downCallback" @up="upCallback" :down="downOption" :up="upOption">
			<view class="item" v-for="(item, index) in pList" :key="index">
        <view class="todo-item">
          <view class="title">
            <view class="content">订单号：{{item.sv_reservation_code}}</view>
            <view :style="{color: activeColor}">
              {{item.sv_reservation_state_name}}
            </view>
          </view>
          <view class="list">
            <image class="img" mode="aspectFill" :src="item.sv_p_images2"></image>
            <view class="name">{{item.sv_p_name}}</view>
            <view class="price">{{item.sv_reservation_money}}</view>
          </view>
          <view class="foot">
            <view class="time">预约到店：<text :style="{color:activeColor}">{{item.sv_reservation_date1_new}}</text></view>

            <view v-if="item.sv_reservation_state === 1" class="op" @click="onCancel(item.sv_reservation_id)">取消预约</view>
          </view>
        </view>
      </view>
		</mescroll-uni>

    

  </view>
</template>
<script>
import { BookService } from '@/utils/class'
import dcTabs from '@/components/tabs/index.vue'
import { setActiveColor, showToastFn } from '@/utils/util'
import { mapGetters } from 'vuex'
const bookService = new BookService()
export default {
  navigate: ['navigateTo'],
  components:{
		dcTabs
	},
  data () {
    return {
      // 待服务: 1; 已服务: 5; 已取消: -3; 全部预约: 0;
      tabsList: ['待服务', '已服务', '已取消', '全部预约'],
      activeIndex: 0,
      pList: [],
      activeColor: '#f44',
      status: 1,
      pageIndex: 1,
      mescroll: {},
      navHeight: 0,
			tabBarHeight: 0,
			// 下拉刷新的常用配置
			downOption: {
				use: true, // 是否启用下拉刷新; 默认true
				auto: false // 是否在初始化完毕之后自动执行下拉刷新的回调; 默认true
			},
			// 上拉加载的常用配置
			upOption: {
				use: true, // 是否启用上拉加载; 默认true
				auto: false, // 是否在初始化完毕之后自动执行上拉加载的回调; 默认true
				page: {
					num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
					size: 10 // 每页数据的数量,默认10
				},
				noMoreSize: 5, // 配置列表的总数量要大于等于5条才显示'-- END --'的提示
				empty: {
					tip: '暂无相关数据'
				}
			}
    }
  },
  computed:{
    ...mapGetters({
			navColor:"custom/navColor",
			systemInfo:'systemInfo/systemInfo'
		}),
  },
  methods: {
    mescrollInit(mescroll) {
			this.mescroll = mescroll
		},
		downCallback(mescroll) {
			mescroll.resetUpScroll()
		},
		upCallback(mescroll) {
        bookService.getMyServices({
          pageIndex: mescroll.num,
          state: this.status
        })
				.then(res => {
					if (mescroll.num == 1) this.pList = []
					this.pList = [...this.pList, ...res.list]
					mescroll.endSuccess(res.list.length, !res.isAll)
				})
				.catch(msg => {
					showToastFn('加载失败')
					mescroll.endErr()
				});
		},
    handleTabsChange (index) {
      switch (index) {
        case 0:
          this.status = 1
          break
        case 1:
          this.status = 5
          break
        case 2:
          this.status = -3
          break
        case 3:
          this.status = 0
          break
      }
      this.pList = []
      this.pageIndex = 1
      this.mescroll.triggerDownScroll()
      this.activeIndex = index
    },
    onCancel (id) {
      bookService.cancelService(id).then(res=>{
        showToastFn('取消成功')
        this.service.sv_reservation_state = -1
      }).catch(msg=>{
        showToastFn(msg.result || "取消失败")
      })
    },
    getMyServices () {
      bookService.getMyServices({
        pageIndex: this.pageIndex,
        state: this.status
      }).then(res => {
        console.log(res)
        this.pList = res.list
      })
    }
  },

  created () {
    this.activeColor = setActiveColor(this.navColor,"#f44")
    this.navHeight = this.systemInfo.navHeight - 22
    this.getMyServices()
  }

}
</script>
<style lang='scss' scoped>
.item {
  margin: 20rpx;
}
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
</style>