const toString = Object.prototype.toString
/**
 * @description 判断是否是Object类型
 */
export function isObject (value) {
  return toString.call(value) === '[object Object]'
}

/**
 * @description 判断是否是Array类型
 */
export function isArray (value) {
  return toString.call(value) === '[object Array]'
}

/**
 * @description 判断是否是Function类型
 */
export function isFunction (value) {
  return toString.call(value) === '[object Function]'
}

/**
 * @description 判断是否是String类型
 */
export function isString (value) {
  return toString.call(value) === '[object String]'
}

/**
 * @description 判断是否是Undefined类型
 */
export function isUndefined (value) {
  return toString.call(value) === '[object Undefined]'
}

/**
 * @description 判断是否是Boolean类型
 */
export function isBoolean (value) {
  return toString.call(value) === '[object Boolean]'
}

/**
 * @description 判断是否是false
 */
export function isFalse (value) {
  return value === false
}

/**
 * @description 隐藏部分手机号码
 */
export function hideTel (value) {
  return value.replace(/(.{3}).+(.{4})/, '$1****$2')
}

/**
 * @description 隐藏部分身份证号码
 */
export function hideIdCar (value) {
  return value.replace(/(.{3}).+(.{4})/, '$1*********$2')
}

/**
 * @description 每隔 4位 加 ' '
 */
export function pattern4Right (value, pattern = ' ') {
  return value.replace(/\B(?=(\d{4})+(?!\d))/g, pattern)
}

/**
 * @description 每隔 4位 减少 ' '
 */
export function reduction4 (value) {
  return value.replace(/\$\s?|( *)/g, '')
}

/**
 * @description 清除两边的空格
 */
export function trim (value) {
  return value.trim()
}

/**
 * @param callback 回调函数
 * @param countdown 倒计时时间 默认 60s
 * @param interval 时间间隔 默认1000ms
 * @description 倒计时
 */
export function setCountDown (callback, countdown = 59, interval = 1000) {
  callback(countdown)
  const timer = setInterval(() => {
    countdown--
    if (countdown < 1) {
      clearInterval(timer)
    }
    callback(countdown, timer)
  }, interval)
}

/**
 * @description 防抖
 * @param callback 回调函数
 * @param interval 时间间隔 默认500ms
 * @param immediate true 表立即执行，false 表非立即执行 默认true
 */
export function debounce (callback, interval = 500, immediate = true) {
  let timer
  return function () {
    const args = arguments
    if (timer) clearTimeout(timer)
    if (immediate) {
      const flag = !timer
      timer = setTimeout(() => {
        timer = null
      }, interval)
      if (flag) callback.apply(this, args)
    } else {
      timer = setTimeout(() => {
        callback.apply(this, args)
      }, interval)
    }
  }
}
