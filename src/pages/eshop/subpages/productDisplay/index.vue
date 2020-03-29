<template>
  <view>
    <dc-nav-bar arrow background="transparent" arrow-color="black" />
      <scroll-view class="container" scroll-y scroll-with-animation>

        <!-- 轮播图 -->
        <dc-ad :images="product.sv_p_imagesList" min-height />
        <!-- 商品描述 -->
        <view class="feature">
          <view class="info">
            <view class="text">{{product.sv_p_remark||product.sv_p_name}}</view>
            <view class="price">
              ￥{{product.sv_move_p_unitprice > 0 ? product.sv_move_p_unitprice : product.sv_p_unitprice}}
            </view>
          </view>
          <view class="share" @click='onShare'>
            <view class="min-flex min-flex-dir-top">
              <view class="iconfont-vant icon-vant-share"></view>
              <view class="share-t">分享</view>
            </view>
          </view>
        </view>
        <!-- 选择规格 -->
        <view class='feature1' v-if="product.sv_is_newspec">
          选择商品规格
        </view>
        <!-- 商品详情 -->
        <view class="info1">
          <view class="title">商品详情</view>
          <rich-text v-if="product.sv_move_p_details"  :nodes="product.sv_move_p_details"></rich-text>
          <view class="no-info" v-else>暂无商品详情信息</view>
        </view>
      </scroll-view>

      <dc-poster :share-info="shareInfo" :show="showPoseter" @close="showPoseter = false"></dc-poster>
  </view>
</template>
<script>
import { BookService } from '../../../../utils/class'
import { mapGetters } from 'vuex'
import { DcAd } from '@/components/ad/index'
import { DcPoster } from '@/components/poster/index'
const bookService = new BookService()
export default {
  navigate: ['navigateTo'],
  components: {
    DcAd,
    DcPoster
  },
  data () {
    return {
      showPoseter: false,
      shareInfo: {}
    }
  },
  computed: {
    ...mapGetters({
      product: 'product/product'
    })
  },
  methods: {
    onShare() {
      this.shareInfo = {
        title: this.product.sv_p_remark || this.product.sv_p_name,
        imageUrl: this.product.sv_p_images2,
        path: "/pages/eshop/subpages/productDisplay/index?id=" + this.product.product_id + "&s=1"
      }
      this.showPoseter = true
    }
  }
}
</script>
<style lang='scss' scoped>
.feature{
  display: flex;
  background: white;
  height: 150rpx;
  align-items: center;
}
.feature .share{
  height: 100%;
  display: flex;
  flex-direction:column;
  width: 10%;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  .share-t {
    font-size: 18rpx;
    color: #888;
  }
}
.feature .share van-icon{
  color: orangered;
}

.feature .info{
  height: 80%;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 85%;
  margin-right: 10rpx;
}
.feature .info .text{
  font-size: 24rpx;
  overflow: hidden;
}
.feature .info .price{
  font-size:  35rpx;
  color: red;
}

.feature1{
  font-size: 26rpx;
  margin-top: 6rpx;
  height: 100rpx;
  background: white;
  line-height: 100rpx;
  padding-left: 25rpx;
  position: relative;
}
.feature1::after{
  position:  absolute;
  content: "";
  width: 20rpx;
  height: 20rpx;
  border-top: 2px solid #bcbcbc;
  border-right: 2px solid #bcbcbc;
  transform: rotate(45deg);
  right: 40rpx;
  top: 0;
  bottom: 0;
  margin: auto;
}


.info1{
  background: white;
  margin-top: 6rpx;
  padding-bottom: 100rpx;
}
.info1 .title{
color: red;
 font-size: 28rpx;
 text-align: center;
 height: 70rpx;
 line-height: 70rpx;
 margin-bottom: 20rpx;
 border-bottom: 1px solid rgba(0,0,0,0.1);
}
.info1 image{
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  margin-bottom: -9rpx;
}

.info1 .no-info{
  font-size: 26rpx;
  color: rgba(0,0,0,0.5);
  text-align: center;
  height: 100rpx;
  line-height: 100rpx;
}
.cart{
  position: fixed;
  z-index: 99;
  bottom: 120rpx;
  right: 20rpx;
  width: 85rpx;
  height: 85rpx;
  background-color: rgba(0,0,0,0.5);
  box-shadow: 0rpx 0rpx 4rpx 4rpx rgba(0,0,0,0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>