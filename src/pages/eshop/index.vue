<template>
  <view class="index-container">
    <nav-bar :title="title" :background="navbarColor" clear-float>
      <template v-slot:left>
        <view
          v-if="name == 'discover'"
          @click="mode = mode == 0 ? 2 : 0"
          class="iconfont-dc"
          :class="'icon-dc-' + (mode == 2 ? 'liebiao' : 'app')"
          style="font-size: 23px;"
        ></view>
      </template>
    </nav-bar>

    <eshop :show="name == 'eshop'" :uiconfig="uiConfig" :color="navbarColor"></eshop>
    <discover :show="name == 'discover'" :color="navbarColor" :mode="mode"></discover>
    <order :show="name == 'order'" :color="navbarColor"></order>
    <info :show="name == 'info'" :color="navbarColor"></info>

    <uni-popup ref="popup" :maskClick="false">
      <view class="popup-style">
        <text>恭喜你</text>
        <text class="popup-content" :style="{ color: navbarColor }">
          {{ invitation_info.sv_detail_value }}
          <text
            :style="{ color: navbarColor }"
          >{{ invitation_info.sv_user_givingtype == 1 ? '积分' : '元' }}</text>
        </text>
        <text>注册会员和好友一起领取奖励</text>
        <button
          open-type="getUserInfo"
          @getuserinfo="showBindPhone"
          class="get-btn"
          :style="{ background: navbarColor }"
        >立即领取</button>
      </view>
      <view class="iconfont-vant icon-vant-close give-up" @click="giveUp"></view>
    </uni-popup>

    <dc-tab-bar
      :items="tabbarList"
      :name="name"
      @change="name = $event"
      z-index="99"
      :active-color="navbarColor"
    ></dc-tab-bar>
  </view>
</template>

<script>
import navBar from "../../components/navBar/index.vue";
import dcTabBar from "../../components/tabbar/index.vue";
import discover from "./discover/index.vue";
import eshop from "./index/index.vue";
import info from "./info/index.vue";
import order from "./order/index.vue";
import uniPopup from "../../components/uni-popup/uni-popup.vue";

import store from "../../utils/store.js";
import { decodeWXCodeParams } from "../../utils/util.js";
import { User, Share } from "../../utils/class.js";
import { mapGetters } from "vuex";
const user = new User();
const share = new Share();
export default {
  navigate: ["switchTab"],
  data() {
    return {
      mode: 2,
      name: "",
      uiConfig: null,
      invitation_info: null,
      tabbarList: [
        {
          title: "首页",
          icon: "home-o",
          name: "eshop"
        },
        {
          title: "商城",
          icon: "bag-o",
          name: "discover"
        },
        {
          title: "预约",
          icon: "underway-o",
          name: "order"
        },
        {
          title: "我的",
          icon: "user-o",
          name: "info"
        }
      ],
      navbarColor: "#f44"
    };
  },

  computed: {
    title() {
      return this.name
        ? this.tabbarList.find(item => item.name == this.name).title
        : "";
    },
    ...mapGetters({
      memberInfo: "loginInfo/memberInfo"
    })
  },
  onLoad(options) {
    uni.hideTabBar();
    let params = decodeWXCodeParams(options); //解析参数
    this.name = params.name || "eshop";

    params.rid &&
      memberInfo.member_id <= 0 &&
      uni.setStorageSync("recommend_member_id", params.rid);
    params.uid && store.dispatch("setSalesUserId", params.uid);
  },

  components: { navBar, dcTabBar, discover, eshop, info, order, uniPopup },
  onShow() {
    this.login();
  },

  methods: {
    login() {
      let rid = uni.getStorageSync("recommend_member_id"),
        uid = store.getters.salesUserId;
      if (uid > 0 || rid > 0) {
        this.$store.dispatch("loginInfo/setExpiredTime", null);
      }
      if (uid && uid > 0) {
        uni.showLoading({
          title: "切换门店中"
        });
      }
      if (!rid) this.$refs.popup.close();

      return user.login(rid, uid).then(res => {
        uni.hideLoading();
        this.getUiConfig();
        if (rid && rid > 0 && this.memberInfo.member_id <= 0) {
          share
            .getIncentiveInfo()
            .then(res => {
              this.invitation_info = res;
              this.$refs.popup.open();
            })
            .catch(msg => {
              showToastFn("获取邀请奖励信息失败,请刷新重试!");
              console.log(msg);
            });
        }
      });
    },
    giveUp() {
      showModalFn(
        "放弃领取奖励",
        function(e) {
          uni.removeStorage({ key: "recommend_member_id" });
          this.$refs.popup.close();
        },
        function() {
          console.log("用户按下取消");
        }
      );
    },
    showBindPhone(e) {
      // 显示绑定手机的对话框
      let memberInfo = this.$store.getters["loginInfo/memberInfo"];
      if (memberInfo.member_id > 0) {
        showToastFn("你已经是会员");
      } else {
        //统计浏览次数
        share.updateMemberOfVisits().catch(msg => {
          console.log(msg);
          showToastFn("统计浏览失败");
        });
        if (e.detail.userInfo) {
          uni.setStorageSync("userInfo", e.detail.userInfo);
          uni.navigateTo({
            url: "../../subpages/common/reg/index"
          });
        }
      }
    },
    getUiConfig() {
      return user.getUiConfig().then(res => {
        this.uiConfig = res;
        let navColor = "#f44";
        if (res) {
          navColor = res["-1"][0]["color"];
        }
        store.dispatch("setNavColor", navColor);
        this.navbarColor = navColor;
        return res;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.popup-style {
  width: 500rpx;
  height: 620rpx;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: white;
  text {
    font-size: 24rpx;
    font-family: PingFang-SC-Regular;
    font-weight: bold;
    color: rgb(102, 102, 102);
  }
  text:first-child {
    font-size: 36rpx;
    font-family: PingFang-SC-Regular;
    font-weight: bold;
    color: rgb(0, 0, 0);
  }
  .popup-content {
    font-size: 134rpx;
    font-family: PingFang-SC-Bold;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    text {
      font-size: 26rpx;
      font-family: PingFang-SC-Regular;
      font-weight: bold;
    }
  }

  .get-btn {
    width: 356rpx;
    height: 96rpx;
    box-shadow: 0rpx 8rpx 16rpx 0rpx #eee;
    border-radius: 48rpx;
    color: white;
    margin-top: 50rpx;
    margin-bottom: 20rpx;
    font-size: 32rpx;
    line-height: 96rpx;
  }
}
.give-up {
  font-size: 24rpx;
  padding: 20rpx;
  color: rgb(102, 102, 102);
  font-size: 80rpx;
  color: white;
  margin-top: 50rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
