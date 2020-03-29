import { minRequest } from './index'

export default {
  /**
   * @description 描述信息
   */
  uniapp (data) {
    return minRequest.get('/s', data)
  },
  /**
   * @description post请求
   */
  puniapp (data) {
    return minRequest.post('/s', data)
  }
}
