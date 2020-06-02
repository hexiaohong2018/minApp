// 正则验证
const verify = (function () {
  function email (email) {
    const reg = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/
    return reg.test(email)
  };

  function tel (tel) {
    const reg = /^(\+86)?(13|14|15|17|18|19)[0-9]{9}$/
    return reg.test(tel)
  };

  function idCard (idCard) {
    const reg = /\d{17}[\d|x]|\d{15}$/
    return reg.test(idCard)
  };

  function regName (name) {
    const reg = /[\w\-\u4e00-\u9fa5]$/
    return reg.test(name)
  }
  const fns = {
    email,
    tel,
    idCard,
    regName
  }
  // type 包括邮件地址,手机号码,身份证号码,注册名称
  return function (type, value) {
    if (typeof fns[type] === 'function') {
      return fns[type](value)
    } else {
      const reg = new RegExp(type)
      return reg.test(value)
    }
  }
}())

const phoneInfo = () => {
  return new Promise((resolve, reject) => {
      uni.getSystemInfo({
        success: ({
          model,
          statusBarHeight,
          version,
          screenWidth,
          screenHeight,
          SDKVersion,
          safeArea
        }) => {
          let _phoneInfo = {
            version: version, // 微信版本号 6.6.0以上支持navigationStyle
            statusBarHeight: statusBarHeight,
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            SDKVersion: SDKVersion, // 基础库信息 2.5.0以上支持自定tabbar
            safeArea: safeArea
          }
          if (model.indexOf('iPhone X') != -1 || model.indexOf('iPhone 11') != -1 || model.indexOf('unknown') != -1) {
            _phoneInfo.isIphoneX = true
            _phoneInfo.tabBarHeight = 86 // 底部tabbar栏高度
          } else {
            _phoneInfo.isIphoneX = false
            _phoneInfo.tabBarHeight = 56 // 底部tabbar栏高度
          }
          if (uni.getMenuButtonBoundingClientRect) {
            const menuRect = uni.getMenuButtonBoundingClientRect()
            _phoneInfo.menuRect = menuRect
            _phoneInfo.menuHeight = menuRect.height + (menuRect.top - statusBarHeight) * 2
            _phoneInfo.navHeight = statusBarHeight + _phoneInfo.menuHeight // 顶部导航栏高度
          } else {
            _phoneInfo.menuHeight = 44
            _phoneInfo.navHeight = statusBarHeight + 44 // 顶部导航栏高度
          }
          resolve(_phoneInfo)
        },
        fail: (msg) => reject(msg)
      })
  })
}

const rpx2px = function (rpxValue) {
  return rpxValue / 750 * uni.getSystemInfoSync().windowWidth
}
const px2rpx = function (pxValue) {
  return pxValue * 750 / uni.getSystemInfoSync().windowWidth
}

function urlParams2Obj (urlParams) {
  var obj = {}
  decodeURIComponent(urlParams).replace(/(\w+)=(\w+)/ig, (str, key, value) => {
    obj[key] = value
  })
  return obj
}

function obj2UrlParams (obj) {
  return Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&')
}

function debounce (fn, delay) {
  var _timer = null
  return function () {
    clearTimeout(_timer)
    _timer = setTimeout(function () {
      fn(...arguments)
    }, delay)
  }
}

// 颜色转换
const hex2Rgb = (hexColor) => {
  hexColor = hexColor.toLowerCase()
  // 十六进制颜色值的正则表达式
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  // 如果是16进制颜色
  if (hexColor && reg.test(hexColor)) {
    if (hexColor.length === 4) {
      var hexColorNew = '#'
      for (var i = 1; i < 4; i += 1) {
        hexColorNew += hexColor.slice(i, i + 1).concat(hexColor.slice(i, i + 1))
      }
      hexColor = hexColorNew
    }
    // 处理六位的颜色值
    var hexColorChange = []
    for (var i = 1; i < 7; i += 2) {
      hexColorChange.push(parseInt('0x' + hexColor.slice(i, i + 2)))
    }
    return 'RGB(' + hexColorChange.join(',') + ')'
  } else {
    throw '颜色值格式不对'
  }
}
// 判断颜色深浅
const isDeepColor = (_color) => {
  var color = _color == 'transparent' ? 'rgb(0,0,0)' : _color
  if (color.indexOf('#') > -1) {
    color = hex2Rgb(color)
  }
  color = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
  var total = 0
  for (var i = 0; i < color.length; i++) {
    // r * 0.299 + g * 0.578 + b * 0.114 >= 192//浅色
    total += (i == 0 ? color[i] * 0.299 : i == 1 ? color[i] * 0.578 : color[i] * 0.114)
  }
  return !(total >= 192)
}

const type = (target) => {
  var ret = typeof (target)
  var template = {
    '[object Array]': 'array',
    '[object Object]': 'object',
    '[object String]': 'string',
    '[object Number]': 'number',
    '[object Boolean]': 'boolean'
  }
  if (target === null) {
    return 'null'
  }
  return ret == 'object' ? template[Object.prototype.toString.call(target)] : ret
}

const isNull = function (data) {
  return !!(!data || (data == '' || data == '' || data == 'undefined' || data == 'null' || data == '[]' || data == '{}'))
}

const promiseAPI = (apiFun, obj = {}) => {
  return new Promise((resolve, reject) => {
    obj.success = res => {
      resolve(res)
    }
    obj.fail = msg => {
      reject(msg)
    }
    apiFun(obj)
  })
}

export{
	phoneInfo,//获取运行环境信息
	verify,//正则验证
	rpx2px,//rpx转px
	px2rpx,//px转rpx
	debounce,//防抖函数
	obj2UrlParams,//object对象转url参数{a:1,b:2} to a=1&b=2
	urlParams2Obj,//url参数转对象 a=1&b=2 to {a:1,b:2}
	hex2Rgb,//16进制色转rgb
	isDeepColor,//颜色是否为深色
	type,//判断类型
	isNull,//判断空类型
	promiseAPI,//微信小程序API函数转Promise
}