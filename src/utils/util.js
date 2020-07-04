// 正则验证
/**
 * type:选择验证的类别 email,tel,idCard,name,也可以存入正则规则
 * value:需要验证的数据
 */
const verify = (function () {

  function email(value) {
    const reg = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/
    return reg.test(value)
  };

  function tel(value) {
    const reg = /^(\+86)?(13|14|15|17|18|19)[0-9]{9}$/
    const reg1 = /[0-9-()（）]{7,18}/
    return reg.test(value) || reg1.test(value)
  };

  function idCard(value) {
    const reg = /\d{17}[\d|x]|\d{15}$/
    return reg.test(value)
  };
  function chinese(value) {
    // [\u4e00-\u9fa5]中文
    const reg = /[A-Za-z0-9_\-\u4e00-\u9fa5]+/
    return reg.test(value)
  };
  function letter(value) {
    return /^[a-zA-Z]*$/.test(value);
  };
  /**
 * 只能是字母或者数字
 */
  function enOrNum(value) {
    //英文或者数字
    let reg = /^[0-9a-zA-Z]*$/g;
    return reg.test(value);
  };
  //验证整数
  function digits(value) {
    return /^\d+$/.test(value)
  };
  function url(value) {
    const reg = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/
    return reg.test(value)
  };
  /**
   * 是否车牌号
   */
  function carNo(value) {
    // 新能源车牌
    const xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    // 旧车牌
    const creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    if (value.length === 7) {
      return creg.test(value);
    } else if (value.length === 8) {
      return xreg.test(value);
    } else {
      return false;
    }
  };

  const fns = {
    email,
    tel,
    idCard,
    chinese,
    letter,
    url,
    carNo,
    enOrNum,
    digits
  }
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

const urlParams2Obj = (urlParams) => {
  var obj = {}
  decodeURIComponent(urlParams).replace(/(\w+)=(\w+)/ig, (str, key, value) => {
    obj[key] = value
  })
  return obj
}
const obj2UrlParams = (obj) => {
  return Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&')
}
const getUrlParam = (url, key) => {
  if (!key) {
    throw new Error("key不能为空")
  }
  var [url, param] = url.split('?');
  if (param) {
    return urlParams2Obj(param)[key]
  } else {
    return undefined
  }
}
function debounce(fn, delay) {
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
// 设置页码激活颜色
const setActiveColor = function (activeColor, defColor) {
  return isDeepColor(activeColor) ? activeColor : defColor
}
//设置微信顶部导航栏颜色
const setNavBarColor = (color) => {
  uni.setNavigationBarColor({
    frontColor: isDeepColor(color) ? '#ffffff' : '#000000',
    backgroundColor: color,
    animation: {
      duration: 300,
      timingFunc: 'easeIn'
    }
  })
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

/**
 * 判断是否为空
 */
const isEmpty = (value) => {
  switch (typeof value) {
    case 'undefined':
      return true;
    case 'string':
      if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0 || value === 'undefined' || value === 'null' || value === '[]' || value === '{}') return true;
      break;
    case 'boolean':
      if (!value) return true;
      break;
    case 'number':
      if (0 === value || isNaN(value)) return true;
      break;
    case 'object':
      if (null === value || value.length === 0) return true;
      for (var i in value) {
        return false;
      }
      return true;
  }
  return false;
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

/**
 * 计算两段位置的距离
 * //计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
 */
const getDistance = (lat1, lng1, lat2, lng2) => {
  var radLat1 = Rad(lat1)
  var radLat2 = Rad(lat2)
  var a = radLat1 - radLat2
  var b = Rad(lng1) - Rad(lng2)
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(
    b / 2), 2)))
  s = s * 6378.137 // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000 // 输出为公里
  // s=s.toFixed(4);
  return s
}
const Rad = (d) => {
  return d * Math.PI / 180.0 // 经纬度转换成三角函数中度分表形式。
}

function keepDecimal(num) {
  if (type(num) == "string") {
    return Math.round(parseFloat(num) * 100) / 100
  } else {
    return Math.round(num * 100) / 100
  }
}


/**
 * 本算法来源于简书开源代码，详见：https://www.jianshu.com/p/fdbf293d0a85
 * 全局唯一标识符（uuid，Globally Unique Identifier）,也称作 uuid(Universally Unique IDentifier) 
 * 一般用于多个组件之间,给它一个唯一的标识符,或者v-for循环的时候,如果使用数组的index可能会导致更新列表出现问题
 * 最可能的情况是左滑删除item或者对某条信息流"不喜欢"并去掉它的时候,会导致组件内的数据可能出现错乱
 * v-for的时候,推荐使用后端返回的id而不是循环的index
 * @param {Number} len uuid的长度
 * @param {Boolean} firstU 将返回的首字母置为"u"
 * @param {Nubmer} radix 生成uuid的基数(意味着返回的字符串都是这个基数),2-二进制,8-八进制,10-十进制,16-十六进制
 */
function guid(len = 32, firstU = true, radix = null) {
	let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	let uuid = [];
	radix = radix || chars.length;

	if (len) {
		// 如果指定uuid长度,只是取随机的字符,0|x为位运算,能去掉x的小数位,返回整数位
		for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
	} else {
		let r;
		// rfc4122标准要求返回的uuid中,某些位为固定的字符
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';

		for (let i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = 0 | Math.random() * 16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
	}
	// 移除第一个字符,并用u替代,因为第一个字符为数值时,该guuid不能用作id或者class
	if (firstU) {
		uuid.shift();
		return 'u' + uuid.join('');
	} else {
		return uuid.join('');
	}
}



export {
  //微信小程序，uniApp可用
  promiseAPI,//微信小程序API函数转Promise
  rpx2px,//rpx转px
  px2rpx,//px转rpx
  phoneInfo,//获取运行环境信息
  setNavBarColor,//设置微信导航栏颜色

  //通用
  verify,//正则验证
  debounce,//防抖函数
  obj2UrlParams,//object对象转url参数{a:1,b:2} to a=1&b=2
  urlParams2Obj,//url参数转对象 a=1&b=2 to {a:1,b:2}
  hex2Rgb,//16进制色转rgb
  isDeepColor,//颜色是否为深色
  setActiveColor,//设置激活颜色
  type,//判断类型
  isEmpty,//判断空类型
  getDistance,//计算经纬度坐标距离
  getUrlParam,//获取url参数值
  keepDecimal,//保留小数位
  guid,//uuid
}