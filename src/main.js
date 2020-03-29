import Vue from 'vue'
import App from './App'
import MinRouter from './utils/min-router'
import minRouter from './router'
import store from './store/index'
import MinRequest from './utils/min-request'
import minRequest from './api'
import './style/index.scss'

import MescrollBody from 'components/mescroll-uni/mescroll-body.vue'
import MescrollUni from 'components/mescroll-uni/mescroll-uni.vue'


Vue.config.productionTip = false

App.mpType = 'app'

Vue.component('mescroll-body',MescrollBody)
Vue.component('mescroll-uni',MescrollUni)

Vue.use(MinRouter)
Vue.use(MinRequest)

const app = new Vue({
  ...App,
  minRouter,
  store,
  minRequest
})
app.$mount()
