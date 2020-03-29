import MinRequest from '@/utils/min-request'

const minRequest = new MinRequest()

const baseURL = process.env.VUE_APP_BASE_URL
  
// 设置默认配置
minRequest.setConfig((config) => {
  config.baseURL = baseURL
  return config
})

// 请求拦截器
minRequest.interceptors.request((request) => {
  return request
})

// 响应拦截器
minRequest.interceptors.response((response) => {
  return response.data
})

let apis = {}
const apiFiles = require.context('./', true, /\.js$/)
apiFiles.keys().forEach(path => {
  if (path !== './index.js') {
    const apiContent = apiFiles(path).default
    const prefix = path.replace(/^\.\/(.*)\.js$/, '$1')
    apis = Object.assign({}, apis, { [prefix]: apiContent })
  }
})

export { minRequest }

export default {
  ...apis
}
