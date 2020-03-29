import Vue from 'vue'
import Vuex from 'vuex'
import MinVuexCache from '@/utils/min-vuex-cache'

Vue.use(Vuex)

/**
 * 禁止再此添加任何代码
 *
 * 除了vuex原生参数外可配置的参数:
 * cache: { 'not' | 'local' }
 *
 * not 表示不缓存
 * local 表示使用localStorage缓存
 * 默认不缓存缓存
 *
 * ```js
 * export default {
 *   cache: 'local'
 * }
 * ```
 */

// 自动注册模块
const modules = {}
const localStorage = []
const modulesFiles = require.context('./modules', true, /\.js$/)
modulesFiles.keys().forEach(modulePath => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.js$/, '$1')
  const moduleContent = modulesFiles(modulePath).default
  if (moduleContent.cache === 'local') localStorage.push(moduleName)
  modules[moduleName] = moduleContent
})
export default new Vuex.Store({
  modules,
  plugins: [MinVuexCache({ localStorage })]
})
