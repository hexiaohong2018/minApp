//类库
//导入配置文件
import {
	apiHost,
	keyName,
	imgUrl,
	expiredTimeName
} from "../config.js";
//导入工具函数
import {
	formatTime,
	getUrlParam,
	verify, //常用正则验证
	promiseAPI,
	type, //判断变量类型
	showToastFn,
	isNull, //判断变量是否为空
	currying, //柯里函数
} from "./util.js";
import md5 from "md5";
import {
	classifyModule
} from "../components/customUI.js";

import store from '@/store/index.js'


let key = "";
//商品默认图
const def_img = 'https://res.decerp.cc/UploadImg/58139099/20191219145000806.png';
const def_img_big = 'https://res.decerp.cc/UploadImg/58139099/Product/20200218144509805.png'

function _setKey(value) {
	key = value
	uni.setStorage({
		key: keyName,
		data: value,
	})
}

function _getKey() {
	return key || (key = uni.getStorageSync(keyName));
}
//格式化幻灯片轮播图
function _formatSlideShow(images) {
	images = isNull(images) ? [] :
		(type(images) == 'array' ? images : JSON.parse(images)).filter(item => item.code);
	return images.length == 0 ? [{
			img: def_img
		}] :
		images.map(item => ({
			img: imgUrl + item.code
		}));
}
//格式化商品详情
function _formatDetails(details) {
	return isNull(details) ? '' :
		details.replace(/(<img.*?)(\/>|>)(<br\s*\/>\s*)*/ig, ($, $1, $2) => {
			$2 = 'style="width:100%;height:auto;display:block"/>';
			return $1 + $2;
		});
}

class NetRequest {
	constructor() {
		if (!NetRequest.single) {
			NetRequest.single = this;
		}
		return NetRequest.single;
	}
	/**
	 * 参数拼接函数
	 * url请求API地址
	 * params请求参数对象
	 */
	_queryConfig(url, params) {
		url += "?"
		for (let key in params) {
			url += (key + "=" + params[key] + "&");
		}
		return url.substring(0, url.length - 1);
	}
	/**
	 * get网络请求函数,返回值为Promise对象，方便异步处理
	 *  url:请求API(必填)
	 *  data:请求参数对象
	 *  contentType: 发送信息至服务器时内容编码类型（0:表示application/x-www-form-urlencoded，1:表示application/json）,
	 *               默认为:1,
	 *  tips:提示信息,发起请求等待时的提示信息
	 */
	getApi({
		url,
		contentType = 1,
		tips,
		data
	} = {}) {
		if (!url) return Promise.reject("url必填");
		//有提示信息，显示提示
		tips && uni.showLoading({
			title: tips,
			mask: true
		})
		return new Promise((resolve, reject) => {
			uni.request({
				url: apiHost + url,
				data: data,
				method: "GET",
				header: {
					'content-type': contentType == 0 ? "application/x-www-form-urlencoded" : "application/json"
				},
				success: res => resolve(res.data),
				fail: err => reject(err),
				complete: () => tips && uni.hideLoading() //请求完成隐藏提示
			})
		})
	}
	/**
	 * post网络请求函数,返回值为Promise对象，方便异步处理
	 *  url:请求API(必填)
	 *  data:请求参数对象,若body数据存在，data参数将被拼接到url上
	 *  body:请求参数body数据
	 *  contentType: 发送信息至服务器时内容编码类型（0:表示application/x-www-form-urlencoded，1:表示application/json）,
	 *               默认为:0,若body有数据时,contentType值为1
	 *  tips:提示信息,发起请求等待时的提示信息
	 */
	postApi({
		url,
		data,
		body,
		contentType = 0,
		tips
	} = {}) {
		if (!url) return Promise.reject("请求必须包括形参params，且parames必须包括'url'请求API");
		if (body) { //若果body存在，拼接参数到url
			contentType = 1;
			url = this._queryConfig(url, data);
			data = body;
		}
		//有提示信息，显示提示
		tips && uni.showLoading({
			title: tips,
			mask: true
		});

		return new Promise((resolve, reject) => {
			uni.request({
				url: apiHost + url,
				data: data,
				method: "POST",
				header: {
					'content-type': contentType == 0 ? "application/x-www-form-urlencoded" : "application/json"
				},
				success: res => resolve(res.data),
				fail: err => reject(err),
				complete: () => tips && uni.hideLoading() //请求完成隐藏提示
			})
		})
	}

	/**
	 * 支付成功发出响声
	 * user_id:店铺ID
	 */
	printCallback(user_id) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: imgUrl + '/api/SendSocketMsg/WaiterOrderMsgWithUserId?user_id=' + user_id,
				async: false,
				header: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				method: 'POST',
				success: function(res) {
					if (res.statusCode == 200) {
						resolve(res.data)
					} else {
						reject(res);
					}
				},
				fail: function(res) {
					reject(res);
				},
			})
		})
	}

	/**
	 * 收集formID
	 */
	saveFormId(formId) {
		return this.getApi({
			url: "/wx/SaveFormid",
			data: {
				key: _getKey(),
				formid: formId
			}
		})
	}

	/**
	 * 获取商品二维码
	 * url:用于生成二维码的路径
	 */
	getUrlCode(url) {
		let index = url.indexOf('?'),
			params = url.match(/(\w+)=(\w+)/ig),
			page = url.substring(1, index != -1 ? index : url.length - 1),
			scene = "";
		if (params) {
			for (let i = params.length; i--;) {
				scene += params[i] + (i > 0 ? "&" : "")
			}
		}

		if (scene.length <= 32) { //参数字符串不可以超过32位
			return this.getApi({
				url: "/wx/getwxacodeunlimitad",
				data: {
					key: _getKey(),
					page,
					scene
				}
			}).then(res => {
				if (res) {
					return imgUrl + res;
				} else {
					return Promise.reject(res);
				}
			})
		} else {
			return Promise.reject("scene长度超过32")
		}
	}
	//解码二维码相关参数
	getParams(options) {
		let params = {};
		for (let key in options) {
			if (options.hasOwnProperty(key)) {
				if (key == "scene") { //二维码参数放在scene中
					// 解码
					// unescape(options[key])
					decodeURIComponent(options[key]).replace(/(\w+)=(\w+)/ig, (str, key, value) => {
						params[key] = value
					})
				} else {
					params[key] = options[key];
				}
			}
		}
		return params;
	}
}
const netRequest = new NetRequest();
class Order {
	constructor() {
		if (!Order.single) {
			Order.single = this;
		}
		return Order.single;
	}

	/**
	 * 获取订单数量信息
	 */
	getOrderCount() {
		return netRequest.getApi({
			url: "/wx/GetCateringOrderProductTotalList",
			data: {
				key: _getKey()
			}
		}).then(res => {
			if (res && res.succeed) {
				return res.values;
			} else {
				return Promise.reject(res);
			}
		})
	}
	/**
	 * 获取线下订单
	 * _page 获取订单的第几页，如果不给值，每调用一次页数自增1，从第一页开始
	 */
	offlineOrder = (function() {
		let page = 1,
			pageSize = 10;
		return function(_page) {
			_page && (page = _page);
			return netRequest.getApi({
				url: "/wx/GetOffLineorderListPageList",
				data: {
					key: _getKey(),
					pageIndex: page,
					pageSize: pageSize,
				}
			}).then(res => {
				if (res.succeed && res.values) {
					let list = (res.values.orderList || []).map(item => {
							item.order_datetime = formatTime(new Date(item.order_datetime));
							return item;
						}),
						state = (list.length == 0 && page == 1) ? 3 : list.length < pageSize ? 2 : 1;
					page++;
					return {
						list,
						state
					}
				} else {
					return Promise.reject(res);
				}
			})
		}
	}());
	/**
	 * 获取线上订单
	 *  _page,获取订单的第几页，如果不给值，每调用一次页数自增1，从第一页开始
	 *  pagepaymentStatus,//-1全部订单, 0待付款, 1已付款
	 *  sv_delivery_status//-1全部，0等待配送，1配送中，2已完成
	 */
	onlineOrder = (function() {
		let page = 1,
			pageSize = 10;
		return function(_page, paymentStatus, sv_delivery_status) {
			_page && (page = _page)
			return netRequest.getApi({
				url: "/wx/GetCateringOrderProductPageList",
				data: {
					key: _getKey(),
					pageSize,
					pageIndex: page,
					paymentStatus,
					sv_delivery_status,
				},
			}).then(res => {
				if (res.succeed && res.values) {
					let list = res.values.map(item => {
							item.order_product_json_str = JSON.parse(item.order_product_json_str);
							item.wt_datetime = formatTime(new Date(item.wt_datetime));
							item.sv_deliver_goods_time = formatTime(new Date(item.sv_deliver_goods_time));
							return item;
						}),
						state = (list.length == 0 && page == 1) ? 3 : list.length < 10 ? 2 : 1 //3没有数据，2加载完毕，1还有数据
					page++;
					return {
						list,
						state
					};
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())


	delOrderById(id, list) {
		return netRequest.getApi({
			url: "/wx/DeleteWithOrderListById",
			data: {
				key: _getKey(),
				orderId: id
			}
		}).then(res => {
			if (res.succeed) {
				return list ? list.filter(item =>
					item.sv_without_list_id != id
				) : list;
			} else {
				return Promise.reject(res);
			}
		})
	}
	getOrderInfoById(id) {
		return netRequest.getApi({
			url: "/wx/GetCateringOrderProductInfoByOrderListId",
			data: {
				orderListId: id,
				key: _getKey()
			}
		}).then(res => {
			if (res.succeed && res.values) {
				let value = res.values,
					sv_shop_payment_status = +value.sv_shop_payment_status,
					products = value.order_product_json_str ? JSON.parse(value.order_product_json_str) : [];
				let result = {
					// sv_return_state  1整单申请退货2部分申请 ； sv_applicatio_state  申请操作订单状态 100申请，101拒绝，200确认
					un_refund: (!sv_shop_payment_status || +value.sv_return_state || +value.sv_applicatio_state) ? false : true,
					without_list_id: value.sv_without_list_id,
					total_momey: value.sv_order_actual_money,
					payment_status: sv_shop_payment_status, //付款状态，0待付款, 1已付款
					delivery_status: +value.sv_delivery_status, //发货状态，0等待配送，1配送中，2已完成
					shipping_methods: +value.sv_shipping_methods, //配送方式，0到店，1配送,
					order_id: value.wt_nober, //订单号
					receipt_data: value.sv_receipt_data ? JSON.parse(value.sv_receipt_data) : {}, //收货人信息
					verifycode: value.verifycode, //核销码
					verifystatus: value.verifystatus, //核销状态
					products: products.map(item => {
						return {
							w_product_id: item.sv_without_product_id, //退货详情ID
							product_id: item.product_id, //商品ID
							// 已付款并且该商品没有申请过退货时，可单个商品退货
							refund: sv_shop_payment_status ? +item.state ? +item.state : "99" : "98", //98不可以退货,99可以退货，100申请，101拒绝，200确认
							name: item.sv_p_specs ? item.sv_p_name.replace('(' + item.sv_p_specs + ')', '') : item.sv_p_name,
							num: item.sv_p_weight > 0 ? item.sv_p_weight : item.product_num,
							price: item.product_unitprice,
							combination_new: [...(item.combination_new || []), ...(item.sv_p_specs ? item.sv_p_specs.split(',').map(
								item => ({
									sv_p_name: item
								})) : [])] //商品规格
						}
					})
				};
				return result;
			} else {
				return Promise.reject(res);
			}
		})
	}

	/**
	 * 退货
	 * list_id,订单ID,
	 * state 申请退货状态 1整单申请退货2部分申请
	 * num,退货数量
	 * product_id 商品ID,
	 * w_product_id,//订单详情ID
	 * sv_remark 备注,
	 * return_cause退货原因
	 */
	refund({
		list_id,
		state,
		num = 0,
		product_id = 0,
		w_product_id = 0,
		sv_remark = "",
		return_cause = ""
	} = {}) {
		if (!list_id || !state) throw "list_id或state不能为空";
		return netRequest.postApi({
			url: "/wx/AddOnlineReturnApplication",
			data: {
				key: _getKey(),
				id: list_id,
				state: state,
				num: num,
				p_id: product_id,
				d_id: w_product_id,
				sv_remark: sv_remark,
				return_cause: return_cause
			}
		}).then(res => {
			if (!res.succeed) {
				return Promise.reject(res);
			}
		})
	}
}
class Coupon {
	constructor() {
		if (!Coupon.single) {

			Coupon.single = this;
		}
		return Coupon.single;
	}
	/**
	 * 获取优惠券列表
	 * status： -1：全部 ，0:待使用，1:已使用，2:已失效，3:可领取
	 * muti:待使用券是否叠加，默认不叠加false
	 */
	getCouponList(status, muti = false) {
		return netRequest.getApi({
			url: "/Wx/GetMemberWxCouponRecordList",
			data: {
				key: _getKey(),
				status,
				muti
			}
		}).then(res => {
			if (res && res.succeed) {
				return (res.values || []).map(item => {
					item.receive = true
					item.sv_coupon_bendate = formatTime(new Date(item.sv_coupon_bendate), false);
					item.sv_coupon_enddate = formatTime(new Date(item.sv_coupon_enddate), false);
					item.sv_coupon_money = item.sv_coupon_type == 1 ? parseInt(item.sv_coupon_money / 10) : item.sv_coupon_money;
					return item;
				});
			} else {
				return Promise.reject(res);
			}
		})
	}
	/**
	 * 领取优惠券
	 * couponid优惠券ID
	 */
	getCoupon(couponid) {
		return netRequest.getApi({
			url: "/Wx/GetMemberWxCoupon",
			data: {
				key: _getKey(),
				sv_coupon_id: couponid,
			},
			tips: "领取中"
		}).then(res => {
			if (res.succeed) {
				return res;
			} else {
				return Promise.reject(res);
			}
		})
	}
}
class User {
	constructor() {
		if (!User.single) {
			this.lastTime = 0;
			User.single = this;
		}
		return User.single;
	}
	// 获取打开卡包数据
	memberCardDataFn() {
		let extConfig = uni.getExtConfigSync ? uni.getExtConfigSync() : {};
		let user_id = extConfig.attr.userid; //获取店铺id0000000
		return netRequest.getApi({
			url: "/wx/GetCardUrl",
			data: {
				user_id
			},
			tips: "正打开卡包.."
		}).then(res => {
			if (res) {
				let memberData = {}
				getUrlParam(res).forEach(item => {
					if (item.key != "action") {
						memberData[item.key] = decodeURIComponent(item.value);
					}
				});
				return memberData;
			} else {
				return Promise.reject(res);
			}
		})
	}
	/**
	 * 获取验证码
	 * phoneNumber 手机号码
	 * wait 时间间隔，单位毫秒
	 */
	sendCode(phoneNumber, wait = 120000) {
		let nowTime = new Date().getTime();
		if (nowTime - this.lastTime > wait) {
			if (verify('tel', phoneNumber)) {
				return netRequest.postApi({
					url: "/Wx/SendCode",
					data: {
						key: _getKey(),
						mobile: phoneNumber
					}
				}).then(res => {
					this.lastTime = nowTime;
					return res;
				}).catch(msg => {
					return Promise.reject(msg);
				})
			} else {
				return Promise.reject("电话号码不正确");
			}
		} else {
			return Promise.reject("不能重复发送");
		}
	}

	/**
	 * 绑定手机注册会员
	 * mobile,
	  code,
	  formId
	 * 
	 */
	bindMemberCard(mobile, code, formId) {
		if (!verify('tel', mobile)) return Promise.reject("手机号不正确");
		if (!code) return Promise.reject("验证码为空");
		var userInfo = uni.getStorageSync("userInfo");

		// //更新会员头像和昵称
		this.updataMemberInfo(userInfo.nickName, userInfo.avatarUrl).then(res => {
			if (!res.succeed) {
				console.error("更新头像昵称失败", res);
			}
		})
		return netRequest.postApi({
			url: "/Wx/BindMemberCard",
			data: {
				key: _getKey(),
				memberName: userInfo ? userInfo.nickName : "",
				memberImg: userInfo ? userInfo.avatarUrl : "",
				form_id: formId,
				code,
				mobile,
			},
			tips: "注册中"
		}).then(res => {
			if (res.succeed && res.values) {
				uni.removeStorageSync("userInfo"); //移除用户微信头像，名称信息
				//更新本地会员信息
				let memberInfo = store.getters['loginInfo/memberInfo'];
				for (let key in memberInfo) {
					res.values[key] && (memberInfo[key] = res.values[key])
				}

				store.dispatch('loginInfo/setMemberInfo', memberInfo);
				//更新access_token信息
				_setKey(res.values.access_token);
				this.getMemberCardInfo();
				return memberInfo;
			} else {
				console.error(res);
				return Promise.reject(res.errmsg);
			}
		})
	}
	0
	/**
	 * 微信号快速注册会员
	 */
	weChatPhoneNumberReg({
		iv,
		encryptedData,
		form_id
	}) {
		var userInfo = uni.getStorageSync("userInfo");

		// //更新会员头像和昵称
		this.updataMemberInfo(userInfo.nickName, userInfo.avatarUrl).then(res => {
			if (!res.succeed) {
				console.error("更新头像昵称失败", res);
			}
		});
		return netRequest.postApi({
			url: "/wx/UserWeChatPhoneNumberReg",
			data: {
				key: _getKey(),
				memberName: userInfo ? userInfo.nickName : "",
				memberImg: userInfo ? userInfo.avatarUrl : "",
				iv,
				encryptedData,
				form_id
			},
			tips: "注册中"
		}).then(res => {
			if (res.succeed && res.values) {
				uni.removeStorageSync("userInfo"); //移除用户微信头像，名称信息
				let memberInfo = store.getters['loginInfo/memberInfo'];
				//更新本地会员信息
				for (let key in memberInfo) {
					res.values[key] && (memberInfo[key] = res.values[key])
				}
				store.dispatch('loginInfo/setMemberInfo', memberInfo);
				//更新access_token信息
				_setKey(res.values.access_token);
				this.getMemberCardInfo();
				return memberInfo;
			} else {
				return Promise.reject(res);
			}
		})
	}


	//用户登陆函数
	// recommend_member_id 推荐人ID
	// sales_user_id 分店id
	//店铺ID 指定登录哪家店铺
	login(recommend_member_id = "", user_id = "") {
		let expiredTime = store.getters['loginInfo/expiredTime'],
			now = +new Date(),
			sales_user_id = user_id || "";
		if (now - expiredTime > 1 * 24 * 60 * 60 * 1000) {
			return promiseAPI(uni.login).then(res => {
				if (res.code) {
					let extConfig = uni.getExtConfigSync ? uni.getExtConfigSync() : {}; //读取ext.json文件信息
					let user_id = extConfig.attr.userid, //获取店铺id0000000
						timestamp = new Date().getMinutes(), //时间戳
						nonce = timestamp, //随机数
						user_idMd5 = md5(user_id).toUpperCase(),
						signatureMd5 = [user_idMd5, timestamp, nonce].sort(),
						signature = md5(signatureMd5.join("")).toUpperCase(),
						code = res.code;
					return netRequest.postApi({
						url: "/wx/WxAppLogin",
						data: {
							timestamp,
							nonce,
							user_id,
							signature,
							code,
							recommend_member_id,
							sales_user_id
						}
					})
				} else {
					return Promise.reject(res);
				}
			}).then(res => {
				if (res.succeed && res.values && res.result) {
					let data = res.values,
						result = res.result,
						access_token = data.access_token,
						wxAppExtrUIElements = {},
						loginInfo = {};
					result.wxAppExtrUIElements && result.wxAppExtrUIElements.map(item => {
						wxAppExtrUIElements[item.elementCode] = item.enabled;
					});
					loginInfo = {
						memberInfo: {
							member_id: Number(data.member_id), //会员id
							sv_mw_availableamount: data.sv_mw_availableamount, //会员金额
							sv_headimgurl: data.sv_headimgurl, //会员头像
							sv_nick_name: data.sv_nick_name //会员名称
						},
						shopInfo: {
							storePhoneNumber: result.shopInfo.sv_us_phone, //商家电话
							shop_name: result.shopInfo.sv_us_name, //店铺名称
							user_id: result.shopInfo.user_id, //店铺ID
							shop_address: result.shopInfo.address, //店铺地址
							sv_us_coordinate: result.shopInfo.sv_us_coordinate ? JSON.parse(result.shopInfo.sv_us_coordinate) : null, //获取商铺位置信息
							sv_us_range: result.shopInfo.sv_us_range ? result.shopInfo.sv_us_range : 5, //配送距离,默认5公里
							dis_lbs: result.dis_lbs, //是否使用定位
							takeOutFoodPay: result.takeOutFoodPay, //外卖支付方式
							shopPay: result.shopPay, //店付方式
							enableDoBusiness: result.returnEnableDoBusiness, //是否营业
							sv_shop_notice: result.shopInfo.sv_shop_notice, //店铺公告
							sv_us_logo: result.shopInfo.sv_us_logo ? imgUrl + result.shopInfo.sv_us_logo : "",
							wxAppExtrUIElements: wxAppExtrUIElements,
							shopList: (!result.shopList || result.shopList.length == 0) ? null : result.shopList.map(shop => {
								shop.sv_us_coordinate = JSON.parse(shop.sv_us_coordinate)
								return shop;
							}),
							businessDate: {
								beginDate: result.beginDate,
								centerDate: result.centerDate,
								nightDate: result.nightDate
							},

							//默认广告图片
							sv_advertising_picture: (JSON.parse(result.shopInfo.sv_advertising_picture) || []).filter(item => item.code)
								.map(item => {
									item.code = item.code ? imgUrl + item.code : "";
									return item;
								}),

							freight: { //运费信息
								sv_delivery_rise: result.sv_delivery_rise,
								sv_money_satisfy: result.sv_money_satisfy,
								sv_move_freight: result.sv_move_freight
							},
							//店铺自定义装修信息(旧版本数据)
							// wxapp_uiconfig: classifyModule(result.wxapp_uiconfig && JSON.parse(result.wxapp_uiconfig).map(
							// 	item => {
							// 		item.subModule = item.subModule && item.subModule.map(item => {
							// 			item.img = item.img && imgUrl + item.img;
							// 			return item;
							// 		})
							// 		return item;
							// 	})),
							WIFI: {
								name: result.wiFiName,
								pwd: result.wiFiPwd
							},
							zeroInventorySales: result.zeroInventorySales,
							sales_user_id,
							cantopup:result.cantopup,
							usingid:result.usingid,
						},
						distributorInfo: {
							name: result.distributor_name
						},
					}
					//更新access_token信息
					_setKey(access_token);
					//更新登录信息
					store.dispatch('loginInfo/setLogin', loginInfo);
					// 假设登录态保持1天
					let expiredTime = +new Date() + 1 * 24 * 60 * 60 * 1000;
					store.dispatch('loginInfo/setExpiredTime', expiredTime);
					return loginInfo;
				} else {
					return Promise.reject(res);
				}
			})
		} else {
			return Promise.resolve(store.getters['loginInfo/login']);
		}
	}

	//获取会员卡信息
	getMemberCardInfo() {
		return netRequest.getApi({
			url: '/Wx/MemberCardInfo',
			data: {
				key: _getKey()
			}
		}).then(res => {
			if (res.succeed) {
				let memberCardInfo = {},
					values = res.values;
				if (values) {
					memberCardInfo.sv_ml_commondiscount = (+values.sv_ml_commondiscount);
					memberCardInfo.sv_mw_availableamount = (+values.sv_mw_availableamount);
					memberCardInfo.sv_mw_availablepoint = (+values.sv_mw_availablepoint);
					memberCardInfo.member_id = values.member_id;
					memberCardInfo.sv_ml_name = values.sv_ml_name;
					memberCardInfo.sv_mr_cardno = values.sv_mr_cardno;
				}
				store.dispatch('loginInfo/setMemberCardInfo', memberCardInfo);
				return memberCardInfo;
			} else {
				return Promise.reject(res);
			}
		})
	}
	//更新会员头像，名称
	updataMemberInfo(name, head_url) {
		return netRequest.getApi({
			url: "/wx/UpdatShopUserInfo",
			data: {
				key: _getKey(),
				sv_nick_name: name,
				head_url: head_url
			}
		})
	}
	getUiConfig() {
		return netRequest.getApi({
			url: '/wx/GetWxAppUiConfig',
			data: {
				key: _getKey()
			}
		}).then(res => {
			if (res.succeed) {
				let modules = (res.values || []).map(item => {
					if (item.id == 3) {
						if (item.source == 1) {
							if (item.categeryproductModel) {
								item.subModule = item.categeryproductModel.list.map(item => {
									item.sv_p_name = item.sv_move_p_name || item.sv_p_name; //商品名称 productName
									item.sv_p_images2 = (item.sv_p_images2 && item.sv_p_images2 != '{}') ? imgUrl + item.sv_p_images2 :
										def_img;
									item.product_price = item.sv_move_p_unitprice && item.sv_move_p_unitprice > 0 ? item.sv_move_p_unitprice :
										item.sv_p_unitprice; //商品单价
									return item;
								})
								delete item.categery;
								delete item.categeryproductModel;
							}
						}
						if (item.source == 0) {
							item.subModule = item.subModule.map(item => {
								item.productModel.sv_p_name = item.productModel.sv_move_p_name || item.productModel.sv_p_name;
								item.productModel.sv_p_images2 = (item.productModel.sv_p_images2 && item.productModel.sv_p_images2 !=
									'{}') ? imgUrl + item.productModel.sv_p_images2 : def_img;
								item.productModel.product_price = item.productModel.sv_move_p_unitprice && item.productModel.sv_move_p_unitprice >
									0 ? item.productModel.sv_move_p_unitprice : item.productModel.sv_p_unitprice; //商品单价
								return item.productModel;
							})
						}
					} else if (item.id == 5) {
						item.subModule = item.subModule.map(item => {
							let assembleConfigModel = item.assembleConfigModel,
								obj = {
									sv_p_images: assembleConfigModel.sv_assemble_config_picurl ? imgUrl + assembleConfigModel.sv_assemble_config_picurl :
										def_img_big,
									singlePrice: assembleConfigModel.sv_assemble_cdetail_sprice,
									groupPrice: assembleConfigModel.sv_assemble_cdetail_gprice,
									des: assembleConfigModel.sv_assemble_config_name,
									assembleconfigid: assembleConfigModel.sv_assemble_config_id,
									assembledetailpid: assembleConfigModel.sv_assemble_cdetail_pid,
									groupNum: assembleConfigModel.sv_assemble_config_num,
									mms: parseInt(assembleConfigModel.sv_ts_milliseconds)
								};

							return obj;
						})

					} else if (item.id == 6) {
						item.subModule = item.subModule.map(item => {
							let assembleConfigModel = item.assembleConfigModel;
							return {
								sv_p_name: assembleConfigModel.sv_move_p_name || assembleConfigModel.sv_p_name, //商品名称 productName
								sv_p_images2: (assembleConfigModel.sv_p_images2 && assembleConfigModel.sv_p_images2 !=
									'{}') ? imgUrl + assembleConfigModel.sv_p_images2 : def_img,
								product_price: assembleConfigModel.sv_assemble_cdetail_gprice, //商品单价
								product_id: assembleConfigModel.sv_assemble_cdetail_pid,
								config_id: assembleConfigModel.sv_assemble_config_id,
								progress: {
									sell: Math.floor((assembleConfigModel.sv_assemble_cdetail_abuynum / assembleConfigModel.sv_assemble_cdetail_astorage) *
										100),
									left: assembleConfigModel.sv_assemble_cdetail_astorage - assembleConfigModel.sv_assemble_cdetail_abuynum
								},
								sv_p_storage: assembleConfigModel.sv_assemble_cdetail_astorage,
								// sv_assemble_limit_buynum
							}
						})

					} else {
						item.subModule = item.subModule && item.subModule.map(item => {
							item.img = item.img && imgUrl + item.img;
							return item;
						})
					}
					return item;
				})
				return classifyModule(modules)
			} else {
				return Promise.reject(res);
			}
		})
	}
}
class CartList {
	constructor() {
		if (!CartList.single) {
			this.cart_list = []; //购物车列表
			this.total_price = 0; //购物车的商品总价
			this.product_num = 0; //购物车商品数量
			CartList.single = this;
		}
		return CartList.single;
	}

	//查找商品对象,返回找到的对象
	_getProduct(product_id) {
		return this.cart_list.find(item => item.product_id == product_id);
	}

	_delProduct(product_id) {
		let product = this._getProduct(product_id);
		if (product.sv_shop_cart_state == 0) {
			this.total_price -= product.product_unitprice * product.product_num;
		}
		this.product_num -= product.product_num;
		let index = this.cart_list.findIndex(item => item.product_id == product_id);
		this.cart_list.splice(index, 1);
		return {
			cart_list: this.cart_list,
			total_price: this.total_price,
			product_num: this.product_num
		}
	}

	_addProduct(product_id, num) {
		let product = this._getProduct(product_id);
		product.product_num += num;
		this.total_price += product.product_unitprice * num
		this.product_num += num;
		return {
			cart_list: this.cart_list,
			total_price: this.total_price,
			product_num: this.product_num
		}
	}

	_cutProduct(product_id, num) {
		let product = this._getProduct(product_id);
		this.total_price -= product.product_unitprice * num;
		product.product_num -= num;
		this.product_num -= num;
		return {
			cart_list: this.cart_list,
			total_price: this.total_price,
			product_num: this.product_num
		}
	}

	_operateShoppingCart(data, tips = "") {
		return netRequest.postApi({
			url: "/wx/OperateCateringShopCartProductNum",
			data,
			tips
		});
	}

	//id 商品ID
	_getProductById(id) {
		return netRequest.getApi({
			url: "/HardwareStore/ProductInfo",
			data: {
				id
			}
		});
	}

	/**
	 * 商品第一次添加到购物车
	 * @param {number,object} product_info 商品信息，可以是商品ID或者具体商品
	 * @param {*} num 添加商品的数量
	 */
	_firstAddCart(product_info, num, tips) {
		let product = product_info;
		if (type(product) != "object") {
			return this._getProductById(product_info).then(res => { //通过商品ID获取到具体商品
				if (res.product) {
					product = res.product;
					product.product_price = product.sv_move_p_unitprice && product.sv_move_p_unitprice > 0 ? product.sv_move_p_unitprice :
						product.sv_p_unitprice; //商品单价
					return this._operateShoppingCart({
						key: _getKey(),
						product_id: product.product_id, //商品id
						sv_p_unitprice: product.product_price, //单价
						product_num: num, //每次添加的数量
						OperateType: 0, //首次添加
					}, tips).then(res => {
						if (res.succeed && !res.errmsg) {
							return this.getCartList().then(res => {
								return {
									cart_list: res.cart_list,
									total_price: res.total_price,
									product_num: res.product_num
								}
							})
						} else {
							return Promise.reject(res);
						}
					})
				} else {
					return Promise.reject(res);
				}
			});

		} else {
			product.product_price = product.sv_move_p_unitprice && product.sv_move_p_unitprice > 0 ? product.sv_move_p_unitprice :
				product.sv_p_unitprice; //商品单价
			return this._operateShoppingCart({
				key: _getKey(),
				product_id: product.product_id, //商品id
				sv_p_unitprice: product.product_price, //单价
				product_num: num, //每次添加的数量
				OperateType: 0, //首次添加
			}).then(res => {
				if (res.succeed && !res.errmsg) {
					return this.getCartList().then(res => {
						return {
							cart_list: res.cart_list,
							total_price: res.total_price,
							product_num: res.product_num
						}
					})
				} else {
					return Promise.reject(res);
				}
			})
		}
	}

	//删除单个商品
	//OperateType: 3
	// cut_product_type: 3,
	// sv_without_product_id: product.sv_without_product_id,

	//删除当前类别所有商品
	// OperateType: 4, //删除当前类别所有商品
	// cut_product_type: 3,
	// sv_without_product_id: product.sv_without_product_id,


	// 首次添加
	//OperateType: 0, //首次添加
	// sv_p_unitprice: product.product_price, //单价

	//清空购物车
	// OperateType: 1, 

	/**
	 * 添加商品到购物车
	 * @param product_info 商品信息 可以是商品ID，可以是具体商品
	 * @param num 添加商品的数量
	 * @param tips 提示的文字
	 */
	addCart(product_info, num = 1, tips = "") {
		let id = type(product_info) != "Object" ? product_info : product_info.product_id, //判断product_info是商品ID，还是具体商品
			product = this._getProduct(id); //在购物车商品中获取具体商品
		if (product) {
			return this._operateShoppingCart({
				key: _getKey(),
				product_id: id,
				product_num: num,
				OperateType: 2, //添加商品
				//一般添加
				sv_without_product_id: product.sv_without_product_id,
				cut_product_type: 0
			}, tips).then(res => {
				if (res.succeed) {
					showToastFn("已加入购物车", "none");
					return this._addProduct(id, num);
				} else {
					return Promise.reject(res);
				}
			})
		} else {
			return this._firstAddCart(product_info, num, tips).then(res => {
				showToastFn("已加入购物车", "none");
				return res;
			})
		}
	}

	/**
	 * 从购物车减少商品
	 */
	cutCart(product_id, num = 1, show_tip = false) {
		let product = this.cart_list.find(item => {
			return item.product_id == product_id;
		});
		if (!product) return Promise.reject("商品不存在");
		return this._operateShoppingCart({
			key: _getKey(),
			OperateType: 3, //删除单个商品
			product_id: product_id,
			product_num: num,
			cut_product_type: 3,
			sv_without_product_id: product.sv_without_product_id,
		}, "减少中").then(res => {
			if (res.succeed) {
				showToastFn("减少成功", "none");
				return this._cutProduct(product_id, num);
			} else {
				showToastFn("减少失败", "fail");
				return Promise.reject(res);
			}
		})
	}
	/**
	 * 删除购物车商品
	 */
	cutAll(product_id, show_tip = true) {
		let product = this.cart_list.find(item => {
			return item.product_id == product_id;
		});
		if (!product) return Promise.reject("商品不存在");
		return this._operateShoppingCart({
			key: _getKey(),
			OperateType: 4, //删除当前类别所有商品
			product_id: product.product_id,
			product_num: 1,
			cut_product_type: 3,
			sv_without_product_id: product.sv_without_product_id,
		}).then(res => {
			if (res.succeed) {
				showToastFn("删除成功", "none");
				return this._delProduct(product_id);
			} else {
				showToastFn("删除失败", "fail");
				Promise.reject(res);
			}
		})
	}
	/**
	 * 清空购物车
	 */
	clearCart() {
		return this._operateShoppingCart({
			key: _getKey(),
			OperateType: 1, //清空购物车
		}).then(res => {
			this.cart_list = [];
			this.total_price = 0;
			this.product_num = 0;
			return {
				cart_list: [],
				total_price: 0,
				product_num: 0
			}
		})
	}
	/**
	 * 商品是否加入购物车结算
	 * OperateType: 5=取消结算选中，即结算不计入，6=重新加入结算选中，即结算计入 7=全部取消计算选中，8=全部重新加入结算
	 */
	isBuy(productId, operateType) {
		let product,
			params = {
				key: _getKey(),
				product_id: productId,
				OperateType: operateType,

			};
		if (productId != 0) {
			product = this.cart_list.find(item => {
				return item.product_id == productId;
			});
			params.sv_without_product_id = product.sv_without_product_id;
		}

		return this._operateShoppingCart(params, "加载中").then(res => {
			if (res.succeed) {
				if (operateType == 6) {
					product.sv_shop_cart_state = 0;
					this.total_price += product.product_unitprice * product.product_num;
				}
				if (operateType == 5) {
					product.sv_shop_cart_state = 1;
					this.total_price -= product.product_unitprice * product.product_num;
				}
				if (operateType == 7) {
					this.cart_list = this.cart_list.map(item => {
						item.sv_shop_cart_state = 1;
						return item;
					})
					this.total_price = 0;
				}
				if (operateType == 8) {
					this.total_price = 0;
					this.cart_list = this.cart_list.map(item => {
						item.sv_shop_cart_state = 0;
						this.total_price += item.product_unitprice * item.product_num;
						return item;
					})
				}
				return {
					cart_list: this.cart_list,
					total_price: this.total_price,
					product_num: this.product_num
				}

			} else {
				return Promise.reject(res);
			}
		})


	}
	/**
	 * 获取购物车信息
	 */
	getCartList(tips, state) {
		let data = {
			key: _getKey()
		}
		if (state != null) {
			data.sv_shop_cart_state = state
		}
		return netRequest.getApi({
			url: "/wx/GetCateringShoppingCartListByShopUserId",
			data,
			tips
		}).then(res => {
			if (res.succeed && res.values) {
				this.product_num = 0;
				this.cart_list = res.values.dataList.map(item => {
					item.product_num = item.sv_pricing_method == 1 ? item.sv_p_weight : item.product_num; //商品数量
					item.sv_p_name = item.sv_move_p_name || item.sv_p_name; //商品名称
					item.sv_p_images2 = item.sv_p_images2 ? imgUrl + item.sv_p_images2 : def_img
					item.product_price = item.sv_move_p_unitprice && item.sv_move_p_unitprice > 0 ? item.sv_move_p_unitprice :
						item.sv_p_unitprice; //商品单价
					this.product_num += item.product_num; //设置购物车数目

					return item;
				})
				this.total_price = res.values.totalPrice;
				return {
					cart_list: this.cart_list,
					total_price: this.total_price,
					product_num: this.product_num
				};
			} else {
				return Promise.reject(res);
			}
		})
	}
}
class Pay {
	constructor() {
		if (!Pay.single) {
			Pay.single = this;
		}
		return Pay.single;
	}
	/**
	 * 微信支付
	 * @param {number} orderId 订单ID
	 * @param {number} total_price 订单总价钱
	 */
	weChatPay(orderId, total_price) {
		return netRequest.getApi({
			url: "/wx/TestWeChatPay1",
			data: {
				key: _getKey(),
				orderId: orderId
			},
			tips: "微信支付"
		}).then(res => {
			if (res.succeed && res.values && res.values.prepay_id) {
				let data = res.values;
				return promiseAPI(uni.requestPayment, {
					'appId': data.appId,
					'timeStamp': data.timestamp.toString(),
					'nonceStr': data.nonce_str,
					'package': 'prepay_id=' + data.prepay_id + '',
					'signType': data.signType || "MD5",
					'total_fee': total_price,
					'paySign': data.sign,
				}).then(res => res).catch(msg => {
					return Promise.reject(msg.errMsg.substring(msg.errMsg.indexOf("fail")));
				});
			} else {
				let values = res.values,
					msg = (values && values.return_msg) || (values && values.errMsg) || res.errmsg || '支付失败:' + res.code;
				return Promise.reject(msg);
			}
		})
	};

	/**
	 * 微信充值
	 * model = {
	        total_fee:"",
	        g_fee: "",
	        bzid: "",
	   }
	 */
	weChatTopUp(model) {
		model.key = _getKey();
		return netRequest.postApi({
				url: "/Wx/WxAppWeiXinPayTopUp",
				data: model
			})
			.then(res => {
				if (res && res.prepay_id) {
					return promiseAPI(uni.requestPayment, {
						'appId': res.appId,
						'timeStamp': res.timestamp.toString(),
						'nonceStr': res.nonce_str,
						'package': 'prepay_id=' + res.prepay_id + '',
						'signType': res.signType || "MD5",
						'total_fee': model.total_fee,
						'paySign': res.sign,
					}).then(res => {
						return res;
					}).catch(msg => {
						return Promise.reject(msg.errMsg.substring(msg.errMsg.indexOf("fail")));
					});
				} else {
					return Promise.reject(res.errmsg || res.return_msg);
				}
			})
	}
	getCustomTopupConfig() {
		return netRequest.getApi({
			url: "/Wx/GetCustomTopupConfig",
			data: {
				key: _getKey()
			}
		}).then(res => {
			if (res.succeed) {
				return res.values ? res.values : [];
			} else {
				return Promise.reject(res);
			}
		})
	}

	/**
	 * 支付订单函数
	 * @param {object} params 支付参数
	 */
	payOrder(params) {
		params.key = _getKey();
		return netRequest.postApi({
			url: '/wx/SaveCateringOrderData',
			data: params,
			tips: "支付中"
		}).then(res => {
			if (res.succeed) {
				return res;
			} else {
				showToastFn("支付失败:" + res.errmsg);
				return Promise.reject(res);
			}
		})
	}
	//预支付
	prePayOrder(params) {
		params.key = _getKey();
		return netRequest.postApi({
			url: '/wx/PreCateringOrderData',
			data: params,
			tips: '计算中..'
		}).then(res => {
			if (res.succeed && res.values) {
				return res.values;
			} else {
				// showToastFn(res.errmsg || "操作失败");
				return Promise.reject(res);
			}
		})
	}

	fastBuy(params) {
		params.key = _getKey();
		return netRequest.postApi({
			url: "/wx/FastBuy",
			data: params,
			tips: "支付中"
		}).then(res => {
			if (res.succeed) {
				return res;
			} else {
				return Promise.reject(res);
			}
		})
	}

}

class ProductList {
	constructor() {
		if (!ProductList.single) {
			ProductList.single = this;
		}
		return ProductList.single;
	}

	_getProductList({
		page, //商品分页显示，当前页数
		size = 10, //单次从数据库获取商品的数量
		tips = "", //加载过程中，loading文本
		isRecommend = false, //是否读取推荐商品
		category = 0, //当前商品类别，默认值0，表示所有类别,
		searchStr = "", //搜索关键字
		subCategory = 0 //子类ID
	} = {}) {
		return netRequest.getApi({
			url: "/wx/GetProductPageList",
			data: {
				key: _getKey(),
				category,
				producttype_id: 0,
				pageIndex: page,
				pageSize: size,
				isRecommend,
				seachStr: searchStr,
				son_category: subCategory
			},
			tips
		}).then(res => {
			if (res.succeed && res.values) {
				let list = res.values.list;
				if (list) {
					return {
						productList: list.map(item => {
							item.sv_p_name = item.sv_move_p_name || item.sv_p_name; //商品名称 productName
							item.sv_p_images2 = (item.sv_p_images2 && item.sv_p_images2 != '{}') ? imgUrl + item.sv_p_images2 :
								def_img
							item.product_price = item.sv_move_p_unitprice && item.sv_move_p_unitprice > 0 ? item.sv_move_p_unitprice :
								item.sv_p_unitprice; //商品单价
							return item;
						}),
						isAll: res.values.total <= page ? true : false
					};
				} else {
					return {
						productList: [],
						isAll: true
					}
				}
			} else {
				return Promise.reject(res);
			}
		})
	}


	//获取商品详细信息
	getProductInfo(product_id, str_tip = "") {
		return netRequest.getApi({
			url: "/HardwareStore/ProductInfo",
			data: {
				id: product_id
			},
			tips: str_tip
		}).then(res => {
			if (res.product) {
				let product = res.product;
				product.sv_p_imagesList = _formatSlideShow(product.sv_p_imagesList);
				product.sv_p_images2 = product.sv_p_images2 ? imgUrl + product.sv_p_images2 : def_img;
				product.sv_move_p_details = _formatDetails(product.sv_move_p_details);
				return product;
			} else {
				return Promise.reject(res);
			}
		})
	}

	/**
	 * 根据多个商品的ID,获取商品
	 */
	getProductListByIDs(ids) {
		return netRequest.postApi({
			url: "/wx/GetProductPageListByIds",
			data: {
				key: _getKey(),
				category: this.categoryId,
				producttype_id: 0,
				pageIndex: this.pageIndex,
				pageSize: this.pageSize,
				isRecommend: this.isRecommend,
				seachStr: this.searchStr
			},
			body: ids
		}).then(res => {
			if (res.succeed && res.values && res.values.list) {
				let list = res.values.list;
				this.result = {
					productList: list.map(item => {
						item.sv_p_name = item.sv_move_p_name || item.sv_p_name; //商品名称 productName
						item.sv_p_images2 = (item.sv_p_images2 && item.sv_p_images2 != '{}') ? imgUrl + item.sv_p_images2 :
							def_img
						item.product_price = item.sv_move_p_unitprice && item.sv_move_p_unitprice > 0 ? item.sv_move_p_unitprice :
							item.sv_p_unitprice; //商品单价
						return item;
					}),
					isAll: res.values.total == this.pageIndex ? true : false
				};
				return this.result;
			} else {
				return Promise.reject(res);
			}
		})
	}

	/**
	 * 获取多规格商品列表
	 * @param product_id 商品ID
	 */
	getMorespecSubProductList(product_id, config_id, buy_state) {
		if (product_id <= 0) return Promise.reject("商品ID不能小于0");
		return netRequest.getApi({
			url: "/wx/GetMorespecSubProductList",
			data: {
				id: product_id,
				key: _getKey(),
				sv_assemble_config_id: config_id, //配置信息id(秒杀，团购需要用到)
				buystate: buy_state, //购买状态：0：普通商品,1：拼团,2：秒杀
			},
			tips: "加载规格中"
		}).then(res => {
			if (res.succeed && res.values) {
				var value = res.values,
					productCustomdDetailList = value.productCustomdDetailList,
					sv_master_validspec = value.sv_master_validspec,
					sv_p_images2 = value.sv_p_images2 ? imgUrl + value.sv_p_images2 : def_img, //商品主图
					sv_p_name = value.sv_p_name; //主商品名称
				productCustomdDetailList = productCustomdDetailList && productCustomdDetailList
					.map(item => {
						return {
							'product_id': item.product_id,
							'sv_p_images2': item.sv_p_images2 ? imgUrl + item.sv_p_images2 : def_img,
							'sv_p_name': item.sv_p_name,
							'sv_move_p_unitprice': item.sv_move_p_unitprice && item.sv_move_p_unitprice > 0 ? item.sv_move_p_unitprice :
								item.sv_p_unitprice, //商品单价
							'sv_p_storage': item.sv_p_storage,
							'sv_p_specs': item.sv_p_specs
						}
					});
				sv_master_validspec = sv_master_validspec && sv_master_validspec.map(item => {
					return {
						'spec_name': item.spec_name,
						'spec_id': item.spec_id,
						attrilist: item.attrilist.map(item1 => {
							return {
								'checked': false, //是否被选中
								'disabled': false, //是否被禁用
								'attri_name': item1.attri_name,
								'images_info': item.sv_canbe_uploadimages ? (item1.images_info ? imgUrl + item1.images_info : def_img) :
									''
							}
						})
					};
				});

				return {
					sv_p_images2,
					sv_p_name,
					productCustomdDetailList,
					sv_master_validspec
				}
			} else {
				return Promise.reject(res);
			}
		})
	}
	/**
	 * page获取第几页数据
		size单次从数据库获取商品的数量
		tips加载过程中，loading文本
		isRecommend是否读取推荐商品
	 */
	getProductPageList = (function(_page = 1) {
		return function({
			page,
			size = 10,
			tips = "",
			isRecommend = false
		} = {}) {
			return this._getProductList({
				page: page ? (_page = page) : _page,
				size,
				tips,
				isRecommend
			}).then(res => {
				_page++;
				return res;
			}).catch(err => {
				return Promise.reject(err);
			})
		}
	}())


	//根据分类ID获取商品
	getProductListByCategoryId = (function(_page = 1) {
		return function({
			category,
			page,
			subCategory = 0,
			tips = "",
			size = 10,
			isRecommend = false,
			searchStr = ''
		} = {}) {
			return this._getProductList({
				page: page ? (_page = page) : _page,
				category,
				subCategory,
				tips,
				size,
				isRecommend,
				searchStr
			}).then(res => {
				_page++;
				return res;
			}).catch(err => {
				return Promise.reject(err);
			})
		}
	}())

	//搜索商品
	searchProduct({
		searchStr,
		tips = '',
		category = 0,
		subCategory = 0
	} = {}) {
		return this._getProductList({
			searchStr,
			tips,
			category,
			subCategory,
			page: 1,
			size: 100
		}).then(res => res ? res : Promise.reject(res))
	}

	/**
	 * 获取商品分类列表
	 * cId主分类ID,若存在则获取该主类下的子分类列表
	 */
	getProductCategory(cId) {
		let url = cId ? "/wx/GetCategoryById" : "/wx/GetProductCategoryList",
			data = {
				key: _getKey()
			};
		cId && (data.cid = cId);
		return netRequest.getApi({
			url,
			data
		}).then(res => {
			if (res.succeed) {
				return res.values;
			} else {
				return Promise.reject(res);
			}
		})
	}
}
class Address {
	constructor() {
		if (!Address.single) {
			Address.prototype.flag = '（补充说明）：'; //分割地址与补充说明的标志
			Address.single = this;
		}
		return Address.single;
	}
	//id地址ID
	//def获取默认地址
	getAddressList({
		id,
		def
	} = {}) {
		return netRequest.getApi({
				url: "/wx/GetReceiptAddressListByMemberId",
				data: {
					key: _getKey()
				}
			})
			.then(res => {
				if (res.succeed && res.values) {
					let values = res.values.map(item => {
						let split = item.pcdAddress.split(this.flag);
						item.pcdAddress = split[0];
						item.instructions = split.length >= 2 ? split[1] : "" //补充说明
						return item;
					});
					if (id > 0) { //有id获取具体地址
						let addr = values.find(item => item.sv_receipt_id == id);
						return addr || null;
					} else if (def) { //有默认，获取默认地址，id权限大于默认,没有设置默认地址返回第一条地址
						let defaddr = values.find(item => item.sv_isdefault_address == def);
						return defaddr ? defaddr : values.length > 0 ? values[0] : null;
					} else { //都没有返回地址列表
						return values;
					}
				} else {
					return Promise.reject(res);
				}
			})
	}
	delAddress(receiptId) {
		return netRequest.postApi({
				url: "/Wx/DeleteReceiptAddressByReceiptId",
				data: {
					key: _getKey(),
					receiptId
				}
			})
			.then(res => {
				if (res.succeed) {
					return res;
				} else {
					return Promise.reject(res);
				}
			})
	}
	setDefAddress(receiptId) {
		return netRequest.postApi({
				url: "/Wx/SetDefaultReceiptAddressByReceiptId",
				data: {
					key: _getKey(),
					receiptId
				}
			})
			.then(res => {
				if (res.succeed) {
					return res;
				} else {
					return Promise.reject(res);
				}
			})
	}
	/**
	 * id：地址id，
	 * addr：地址，
	 * def：是否默认地址，
	 * instructions：地址补充说明，
	 * name：联系人姓名，
	 * phone:手机号码，
	 * coordinate：坐标对象
	 */
	saveAddress({
		id,
		addr,
		def = false,
		instructions,
		name,
		phone,
		coordinate
	} = {}) {
		let txtPcdAddress = instructions ? addr + this.flag + instructions : addr;
		let reg = /^1[3|4|5|6|7|8|9]\d{9}$/;
		if (name == "" || name == undefined || name == null) {
			return Promise.reject('请输入收货人名称');
		} else if (name.length > 15) {
			return Promise.reject('收货人名称长度不能大于15个字符！');
		} else if (phone == "" || phone == undefined || phone == null) {
			return Promise.reject('请输入收货人手机号码');
		} else if (!reg.test(phone)) {
			return Promise.reject('请输入正确的11位数字手机号码');
		} else if (addr == "" || addr == undefined || addr == null) {
			return Promise.reject('收货地址不能为空');
		} else if (txtPcdAddress.length > 100) {
			return Promise.reject('收货地址长度不能大于100个字符');
		} else {
			let params = {
				key: _getKey(),
				sv_receipt_id: id,
				sv_receipt_name: name,
				sv_receipt_phone: phone,
				sv_receipt_province: 0,
				sv_receipt_city: 0,
				sv_receipt_district: 0,
				sv_receipt_address: txtPcdAddress,
				sv_address_enabled: true,
				isDefault: true,
				sv_isdefault_address: def,
			};
			coordinate && (params.sv_receipt_mlanlat = coordinate) //经纬度存在，则保存
			return netRequest.postApi({
					url: "/wx/AddDefaultAddressInfo",
					data: params,
					tips: "保存中"
				})
				.then(res => {
					if (res.succeed) {
						return res.values;
					} else {
						return Promise.reject(res);
					}
				})
		}
	}
	/**
	 * wxFn:可以是uni.chooseLocation 也可以是uni.getLocation
	 * 
	 */
	location({
		wxFn,
		scopeName = "userLocation",
		success,
		fail,
		content = '需要获取您的位置信息，请修改授权，否则部分功能无法正常使用'
	} = {}) {
		let successCallBack = success,
			failCallBack = fail;
		wxFn({
			success: function(res) {
				successCallBack(res);
			},
			fail: function() {
				uni.getSetting({
					success: function(res) {
						let statu = res.authSetting;
						if (!statu[`scope.${scopeName}`]) {
							uni.showModal({
								title: '设置权限',
								content: content,
								success: function(tip) {
									if (tip.confirm) {
										uni.openSetting({
											success: function(data) {
												if (data.authSetting[`scope.${scopeName}`] === true) {
													showToastFn("授权成功")
													//授权成功之后，再调用wxFn
													wxFn({
														type: 'wgs84',
														success: function(res) {
															successCallBack(res);
														},
													})
												} else {
													showToastFn("授权失败")
													failCallBack && failCallBack(data);
												}
											}
										})
									}
								}
							})
						}
					},
					fail: function(res) {
						showToastFn("调用授权窗口失败", "fail")
						failCallBack && failCallBack(res)
					}
				})
			}
		})
	}
}
let activityCommon = {
	//购买状态buystate：0：单独购买；1：一键开团，参团；2.秒杀
	getShoppingCartList: function(product_id, product_num, sv_assemble_config_id, buystate) {
		return netRequest.getApi({
			url: "/wx/GetFastShoppingCartListByShopUserId",
			data: {
				key: _getKey(),
				product_id,
				product_num,
				sv_assemble_config_id,
				buystate,
				OperateType: 0
			}
		}).then(res => {
			if (res.succeed && res.values) {
				let product_num = 0
				return {
					cart_list: res.values.dataList.map(item => {
						item.product_num = item.sv_pricing_method == 1 ? item.sv_p_weight : item.product_num; //商品数量
						item.sv_p_name = item.sv_move_p_name || item.sv_p_name; //商品名称
						item.sv_p_images2 = item.sv_p_images2 ? imgUrl + item.sv_p_images2 : def_img
						item.product_price = item.sv_move_p_unitprice && item.sv_move_p_unitprice > 0 ? item.sv_move_p_unitprice :
							item.sv_p_unitprice; //商品单价
						product_num += item.product_num; //设置购物车数目
						return item;
					}),
					total_price: res.values.totalPrice,
					product_num: product_num
				};
			} else {
				return Promise.reject(res);
			}
		})
	}
}
class GroupBuy {
	constructor() {
		if (!GroupBuy.single) {
			this.pageIndex = 1;
			this.pageSize = 10;
			GroupBuy.single = this;
		}
		return GroupBuy.single;
	}
	//获取团购商品购物车列表
	getShoppingCartList = activityCommon.getShoppingCartList;

	/**获取所有团购列表 */
	getGroupBuyList() {
		return netRequest.getApi({
			url: "/wx/GetSpAssembleConfigInfo",
			data: {
				key: _getKey(),
				page: this.pageIndex,
				pagesize: this.pageSize
			},
			tips: "加载中"
		}).then(res => {
			if (res.succeed && res.values && res.values.dataList) {
				let dataList = res.values.dataList.map(item => {
					let obj = {
						sv_p_images: item.sv_assemble_config_picurl ? imgUrl + item.sv_assemble_config_picurl : def_img_big,
						singlePrice: item.sv_assemble_cdetail_sprice,
						groupPrice: item.sv_assemble_cdetail_gprice,
						des: item.sv_assemble_config_name,
						// endTime: new Date(item.sv_assemble_config_edate),
						assembleconfigid: item.sv_assemble_config_id,
						assembledetailpid: item.sv_assemble_cdetail_pid,
						groupNum: item.sv_assemble_config_num,
						mms: parseInt(item.sv_ts_milliseconds),
						// nowTime: item.sv_current_date ? new Date(item.sv_current_date) : new Date()
					};
					return obj;
				})
				return dataList;
			} else {
				return Promise.reject(res);
			}
		})
	}
	/**根据{pid,cid}数组 获取对应的拼团商品*/
	getGroupBuyListbyConfig(configs) {
		return netRequest.postApi({
			url: "/wx/GetHomePageAssembleConfigInfo",
			data: {
				key: _getKey(),
				page: 0,
				pagesize: 0
			},
			body: configs
		}).then(res => {
			if (res.succeed && res.values && res.values.dataList) {
				let dataList = res.values.dataList.map(item => {
					let obj = {

						sv_p_images: item.sv_assemble_config_picurl ? imgUrl + item.sv_assemble_config_picurl : def_img_big,
						singlePrice: item.sv_assemble_cdetail_sprice,
						groupPrice: item.sv_assemble_cdetail_gprice,
						des: item.sv_assemble_config_name,
						// endTime: new Date(item.sv_assemble_config_edate),
						assembleconfigid: item.sv_assemble_config_id,
						assembledetailpid: item.sv_assemble_cdetail_pid,
						groupNum: item.sv_assemble_config_num,
						// nowTime: item.sv_current_date ? new Date(item.sv_current_date) : new Date()
						mms: parseInt(item.sv_ts_milliseconds)
					};
					return obj;
				})
				return dataList;

			} else {
				return Promise.reject(res);
			}
		})
	}
	/**获取团购详情 */
	getGroupBuyListItem(assembleconfigid, assembledetailpid) {
		return netRequest.getApi({
			url: "/wx/GetSpMemberAssembleInfo",
			data: {
				key: _getKey(),
				assembleconfigid: assembleconfigid,
				assembledetailpid: assembledetailpid,
				page: 0,
				pagesize: 0
			},
			tips: "加载中"
		}).then(res => {
			if (res.succeed && res.values) {
				let data = res.values,
					value = {
						sv_move_p_details: _formatDetails(data.sv_move_p_details),
						sv_p_images: _formatSlideShow(data.sv_p_images),
						picUrl: data.sv_assemble_config_picurl ? imgUrl + data.sv_assemble_config_picurl : def_img_big,
						singlePrice: data.sv_assemble_cdetail_sprice,
						groupPrice: data.sv_assemble_cdetail_gprice,
						des: data.sv_assemble_config_name,
						assembleconfigid: data.sv_assemble_config_id,
						assembledetailpid: data.sv_assemble_cdetail_pid,
						sv_is_newspec: data.sv_is_newspec,
						groupNum: data.sv_assemble_config_num,
						dataList: (data.memberAssemble_list.dataList || []).map(item => {
							item.sv_member_names = JSON.parse(item.sv_member_names)
							return item;
						}),
						assembleState: data.sv_assemble_state, //是否可用开团0不可开团,1可开团
						sv_assemble_config_mode: data.sv_assemble_config_mode, //0自提，1配送
						mms: parseInt(data.sv_ts_milliseconds)
					};
				return value;
			} else {
				return Promise.reject(res);
			}
		})
	}
}
class Seckill {
	constructor() {
		if (!Seckill.single) {
			Seckill.single = this;
		}
		return Seckill.single;
	}
	//获取秒杀商品购物车列表
	getShoppingCartList = activityCommon.getShoppingCartList;

	/**
	 *state 活动状态(0:未开始;1:已开始;)
	 */
	_getProductList(state, page, pagesize) {
		return netRequest.getApi({
			url: "/wx/GetSpikeProductInfo",
			data: {
				key: _getKey(),
				activitystate: state,
				page,
				pagesize
			}
		}).then(res => {
			let values = res.values
			if (res.succeed && values && values.dataList) {
				let list = values.dataList.map(item => {
					item.product_id = item.sv_assemble_cdetail_pid;
					item.sv_p_name = item.sv_move_p_name || item.sv_p_name; //商品名称 productName
					item.sv_p_images2 = (item.sv_p_images2 && item.sv_p_images2 != '{}') ? imgUrl + item.sv_p_images2 :
						def_img;
					item.product_price = item.sv_assemble_cdetail_gprice; //商品单价
					if (state == 1) {
						item.progress = {
							sell: Math.floor((item.sv_assemble_cdetail_abuynum / item.sv_assemble_cdetail_astorage) * 100),
							left: item.sv_assemble_cdetail_astorage - item.sv_assemble_cdetail_abuynum
						};
					} else {
						let sdata = new Date(item.sv_assemble_config_sdate),
							m = sdata.getMinutes(),
							h = sdata.getHours();
						item.begin = {
							formId: 0,
							limit: item.sv_assemble_cdetail_buynum,
							beginTime: `${sdata.getMonth() + 1}月${sdata.getDate()}日${h >= 10 ? h : ("0" + h)}:${m >= 10 ? m : ("0" + m)}`
						}
					}
					return item;
				});
				//加载状态 0加载中，1加载完毕，2暂无数据
				let loadStatus = (list.length == 0 && this.pageIndex == 1) ? 2 : list.length < this.pageSize ? 1 : 0
				return {
					list,
					loadStatus
				}
			} else {
				return Promise.reject(res);
			}
		})
	}
	//获取秒杀商品
	//state 活动状态(0: 未开始; 1: 已开始;)
	getProductList = (function(page = 1) {
		return function({
			state,
			page,
			size = 10
		} = {}) {
			return this._getProductList(state, page, size);
		}
	}())
	//更加配置信息新{id,cid}数组获取秒杀商品
	getProductListByConfig(configs) {
		return netRequest.postApi({
			url: "/wx/GetHomePageSpikeProductInfo",
			data: {
				key: _getKey(),
				activitystate: "1", //获取正在开抢的商品
				page: 0, //获取全部符合条件的商品
				pagesize: 0, //获取全部符合条件的商品
			},
			body: configs
		}).then(res => {
			if (res.succeed && res.values && res.values.dataList) {
				let list = res.values.dataList;
				return {
					productList: list.map(item => {
						item.sv_p_name = item.sv_move_p_name || item.sv_p_name; //商品名称 productName
						item.sv_p_images2 = (item.sv_p_images2 && item.sv_p_images2 != '{}') ? imgUrl + item.sv_p_images2 :
							def_img
						item.product_price = item.sv_assemble_cdetail_gprice; //商品单价
						item.product_id = item.sv_assemble_cdetail_pid;
						item.progress = {
							sell: Math.floor((item.sv_assemble_cdetail_abuynum / item.sv_assemble_cdetail_astorage) * 100),
							left: item.sv_assemble_cdetail_astorage - item.sv_assemble_cdetail_abuynum
						};
						return item;
					}),
				};
			} else {
				return Promise.reject(res);
			}
		})
	}
	//获取更多秒杀商品
	//state 活动状态(0: 未开始; 1: 已开始;)
	// getMoreProduct(state) {
	// 	// this.pageIndex++;
	// 	return this._getProductList(state);
	// }

	/**
	 * seckillId 秒杀配置ID,
	 * productId 商品ID
	 */
	getProductInfo(seckillId, productId) {
		return netRequest.getApi({
			url: "/wx/GetSelectSpikeProductInfo",
			data: {
				key: _getKey(),
				assembleconfigid: seckillId,
				assembledetailpid: productId
			},
			tips: "加载中"
		}).then(res => {
			let values = res.values;
			if (res.succeed && values) {
				values.sv_assemble_config_edate = new Date(values.sv_assemble_config_edate);
				values.sv_assemble_config_sdate = new Date(values.sv_assemble_config_sdate);
				values.sv_assemble_config_ndate = values.sv_assemble_config_ndate ? new Date(item.sv_assemble_config_ndate) :
					new Date();
				values.mms = parseInt(values.sv_ts_milliseconds);
				values.sv_p_name = values.sv_move_p_name || values.sv_p_name; //商品名称 productName
				values.sv_p_images = _formatSlideShow(values.sv_p_images);
				values.sv_move_p_details = _formatDetails(values.sv_move_p_details);
				values.sv_p_images2 = values.sv_p_images2 ? imgUrl + values.sv_p_images2 : def_img;
				return values
			} else {
				return Promise.rejec(res);
			}
		})
	}
}
class Share {
	constructor() {
		if (!Share.single) {
			Share.single = this;
		}
		return Share.single;
	}
	//获取邀请有礼配置信息
	getConfigInfo() {
		return netRequest.postApi({
			url: "/Wx/GetOnlineUserConfigInvInfo",
			data: {
				key: _getKey()
			},
			tips: "加载中"
		}).then(res => {
			if (res.succeed && res.values) {
				if (res.values.length > 0) {
					let sv_invitation_info = JSON.parse(res.values[0].sv_invitation_info);
					sv_invitation_info.campaign_img = sv_invitation_info.campaign_img ? imgUrl + sv_invitation_info.campaign_img :
						def_img_big;
					sv_invitation_info.campaign_rules = sv_invitation_info.campaign_rules && sv_invitation_info.campaign_rules.split(
						"\n");
					return {
						sv_invitation_info,
						userModuleConfigDetail: res.values[0].userModuleConfigDetail.map(item => {
							item.sv_detail_value = (+item.sv_detail_value);
							return item;
						})
					}
				}
			} else {
				return Promise.reject(res);
			}
		})
	}
	//获取邀请有礼奖励信息
	getIncentiveInfo() {
		return netRequest.postApi({
			url: "/wx/GetCoverUserConfigInvInfo",
			data: {
				key: _getKey()
			}
		}).then(res => {
			if (res.succeed && res.values) {
				let invitation_info = res.values;
				invitation_info.sv_detail_value = +invitation_info.sv_detail_value;
				return invitation_info;
			} else {
				return Promise.reject(res);
			}
		})
	}
	//统计浏览次数
	updateMemberOfVisits() {
		return netRequest.postApi({
			url: "/wx/UpdateMemberAccessCount",
			data: {
				key: _getKey()
			}
		}).then(res => {
			if (res.succeed) {
				return res;
			} else {
				return Promise.reject(res);
			}
		}).catch(msg => {
			return Promise.reject(msg);
		})
	}
}
class Bill {
	constructor() {
		if (!Bill.single) {
			Bill.single = this;
		}
		return Bill.single;
	}
	/**
	 * 获取佣金或积分记录
	 * type:1获取积分,2获取佣金
	 * page:获取第几页
	 */
	_getCommission_Or_Integral_Record(type) {
		let page = 1,
			pageSize = 10;
		return function(_page, _pageSize) {
			_page && (page = _page);
			_pageSize && (pageSize = _pageSize);
			return netRequest.postApi({
				url: "/wx/GetRecordDetailInfo",
				data: {
					key: _getKey(),
					type,
					page,
					pageSize
				}
			}).then(res => {
				if (res.succeed && res.values) {
					let list = (res.values.dataList || []).map(item => {
						let obj = {};
						obj.head_img = item.sv_headimgurl || '/static/user.png';
						obj.user_name = item.sv_member_name || '...';
						obj.reason = item.sv_operation_name || '';
						obj.date = formatTime(new Date(item.sv_creation_date), false);
						obj.type = item.sv_mpr_type || 0;
						obj.title = type == 2 ? "金额" : "积分";
						obj.value = (+item.sv_integral_money_num);
						return obj;
					});
					let state = (list.length == 0 && page == 1) ? 3 : list.length < pageSize ? 2 : 1; //3无数据，2加载完毕，1加载中
					page++;
					return {
						list,
						state,
						total: res.values.totalMoney
					}
				} else {
					return Promise.reject(res);
				}
			})
		}
	}

	// 获取消费记录  _page查询第几页
	getConsumptionRecord = (function() {
		let page = 1,
			pageSize = 10;
		return function(_page) {
			_page && (page = _page);
			return netRequest.getApi({
				url: "/Wx/GetCardBillList",
				data: {
					key: _getKey(),
					page,
					pageSize
				}
			}).then(res => {
				if (res.succeed && res.values && res.values.list) {
					let list = res.values.list.map(item => {
						let obj = {};
						obj.head_img = "/static/user.png";
						obj.user_name = "...";
						obj.reason = item.order_payment + '支付';
						obj.date = formatTime(new Date(item.order_datetime), false);
						obj.type = 1; //减少金额
						obj.title = "金额";
						obj.value = item.product_total;
						return obj;
					});
					let state = (list.length == 0 && page == 1) ? 3 : list.length < pageSize ? 2 : 1; //3无数据，2加载完毕，1加载中
					page++;
					return {
						list,
						state
					}
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())

	//获取充值记录 _page查询第几页
	getTopUpRecord = (function() {
		let page = 1,
			pageSize = 10;
		return function(_page) {
			_page && (page = _page);
			return netRequest.getApi({
				url: "/Wx/GetCardSavingsList",
				data: {
					key: _getKey(),
					page,
					pageSize
				}
			}).then(res => {
				if (res && res.values) {
					let list = res.values.map(item => {
						let obj = {};
						obj.head_img = "/static/user.png";
						obj.user_name = "...";
						obj.reason = item.sv_mrr_payment + '支付';
						obj.date = formatTime(new Date(item.sv_mrr_date), false);
						obj.type = 0; //增加金额
						obj.title = "金额";
						obj.present = item.sv_mrr_present;
						obj.value = item.sv_mrr_money;
						return obj;
					});
					let state = (list.length == 0 && page == 1) ? 3 : list.length < pageSize ? 2 : 1; //3无数据，2加载完毕，1加载中
					page++;
					return {
						list,
						state
					}
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())

	//获取佣金记录 _page查询第几页
	getCommissionRecord = this._getCommission_Or_Integral_Record(2);
	//获取积分记录 _page查询第几页
	getIntegralRecord = this._getCommission_Or_Integral_Record(1);
}
class Integral {
	constructor() {
		if (!Integral.single) {
			Integral.single = this;
		}
		return Integral.single;
	}
	//获取可兑换商品列表
	getProductList = (function() {
		var page = 1,
			pagesize = 10;
		return function(_page, _pagesize) {
			page = _page || page;
			pagesize = _pagesize || pagesize;
			return netRequest.getApi({
				url: '/wx/GetIntegralProductInfo',
				data: {
					key: _getKey(),
					page,
					pagesize
				}
			}).then(res => {
				var value = res.values;
				if (res.succeed && value) {
					let productList = value.integralProductList;
					return {
						availablepoint: value.availablepoint,
						list: productList.dataList.map(item => {
							item.deliveryMode = value.deliveryMode || 0;
							item.sv_p_images2 = item.sv_p_images2 ? imgUrl + item.sv_p_images2 :
								def_img;
							return item;
						}),
						isAll: (page++ * pagesize >= productList.total) ? true : false
					};
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())
	//获取商品详情
	getProductInfo(product_id) {
		return netRequest.getApi({
			url: '/wx/GetSelectIntegralProductInfo',
			data: {
				key: _getKey(),
				product_id
			},
		}).then(res => {
			var value = res.values && res.values.selectIntegralProduct;
			if (res.succeed && value) {
				value.deliveryMode = res.values.deliveryMode || 0;
				value.sv_p_images2 = value.sv_p_images2 ? imgUrl + value.sv_p_images2 : def_img,
					value.sv_p_imagesList = _formatSlideShow(value.sv_p_images),
					value.sv_move_p_details = _formatDetails(value.sv_move_p_details)
				return value;
			} else {
				return Promise.reject(res)
			}
		})
	}
	//获取已兑换商品列表
	getOrderList = (function() {
		var page = 1,
			pagesize = 10;
		return function(_page, _pagesize) {
			page = _page || page;
			pagesize = _pagesize || pagesize
			return netRequest.getApi({
				url: '/wx/GetIntProductExchangeInfo',
				data: {
					key: _getKey(),
					page,
					pagesize
				}
			}).then(res => {
				if (res.succeed && res.values) {
					return {
						list: res.values.dataList.map(item => {
							item.exchangedetaillist.map(product => {
								product.sv_p_images2 = product.sv_p_images2 ? imgUrl + product.sv_p_images2 :
									def_img;
								return product;
							})
							item.sv_creation_date = formatTime(new Date(item.sv_creation_date))
							return item;
						}),
						isAll: (page++ * pagesize >= res.values.total) ? true : false
					}
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())
	//orderid,订单ID
	getOrderInfo(orderId) {
		return netRequest.getApi({
			url: '/wx/GetIntProductExchangeInfo',
			data: {
				key: _getKey(),
				page: 0,
				pagesize: 0,
				integral_pexchange_no: orderId
			}
		}).then(res => {
			let values = res.values,
				dataList = values && values.dataList && values.dataList[0];
			if (res.succeed && dataList) {
				dataList.exchangedetaillist = (dataList.exchangedetaillist || []).map(item => {
					item.sv_p_images2 = item.sv_p_images2 ? imgUrl + item.sv_p_images2 :
						def_img;
					return item;
				})
				dataList.sv_delivery_time = dataList.sv_delivery_time ? formatTime(new Date(dataList.sv_delivery_time)) : '';
				dataList.sv_creation_date = dataList.sv_creation_date ? formatTime(new Date(dataList.sv_creation_date)) : '';

				return dataList;
			} else {
				return Promise.reject(res);
			}
		})
	}
	//兑换
	order({
		sv_integral_pexchange_mode,
		sv_integral_pexchange_source = 1,
		sv_receipt_id,
		sv_delivery_time,
		products, //可以传商品列表或者单个商品
		sv_remark, //备注
	} = {}) {
		return netRequest.postApi({
			url: '/wx/SaveProductExchangeList',
			data: {
				key: _getKey(),
			},
			body: {
				sv_delivery_time,
				sv_remark,
				sv_integral_pexchange_mode, //0:自提;1:配送;
				sv_integral_pexchange_source, //0:线下;1:线上小程序;
				sv_receipt_id, //收货地址
				exchangedetaillist: products instanceof Array ? products.map(item => {
					return {
						sv_integral_id: item.sv_integral_id,
						product_id: item.product_id,
						sv_p_integral: item.sv_p_integral,
						sv_pchangenumber: products.num
					}
				}) : [{
					sv_integral_id: products.sv_integral_id,
					product_id: products.product_id,
					sv_p_integral: products.sv_p_integral,
					sv_pchangenumber: products.num
				}] //兑换商品列表
			}
		}).then(res => {
			if (res.succeed && res.values) {
				return res.values;
			} else {
				return Promise.reject(res);
			}
		})
	}
}
class BookService {
	constructor() {
		if (!BookService.single) {
			BookService.single = this
		}
		return BookService.single
	}
	//获取预约项目列表
	getServices = (function(_pageIndex = 1) {
		return function({
			pageIndex,
			pageSize = 10
		} = {}) {
			return netRequest.getApi({
				url: '/Reservation/Reservationlist',
				data: {
					key: _getKey(),
					pageIndex: pageIndex ? (_pageIndex = pageIndex) : _pageIndex,
					pageSize
				}
			}).then(res => {
				if (res.succeed && res.values) {
					var result = {
						list: res.values.list.map(item => {
							item.product_price = item.sv_p_unitprice;
							item.sv_p_images2 = item.sv_product_logo ? imgUrl + item.sv_product_logo : '/images/foodimg.png'
							return item;
						}),
						isAll: _pageIndex++ * pageSize >= res.values.count ? true : false
					}
					return result;
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())
	//获取技师列表
	//sp_grouping_id 岗位ID
	getEmployees = (function(_pageIndex = 1) {
		return function({
			pageIndex,
			pageSize = 10,
			sp_grouping_id = 0
		} = {}) {
			return netRequest.getApi({
				url: '/Reservation/GetTechnicianModelList',
				data: {
					key: _getKey(),
					pageIndex: pageIndex ? (_pageIndex = pageIndex) : _pageIndex,
					pageSize,
					sp_grouping_id
				}
			}).then(res => {
				if (res.succeed && res.values) {
					var result = {
						list: res.values.list.map(item => {
							item.sv_technician_photo = item.sv_technician_photo ? imgUrl + item.sv_technician_photo :
								'/images/user.png'
							return item;
						}),
						isAll: _pageIndex++ * pageSize >= res.values.count ? true : false
					}
					return result;
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())

	//获取我的预约
	//state 预约状态：1 申请，2 接受【预约成功】，3 待确认【预约内容被修改，等待客户确认】，4 爽约【客户爽约】，5 完成，6 下单，-2 拒绝【预约失败】，-3 取消
	getMyServices = (function(_pageIndex = 1) {
		return function({
			pageIndex,
			pageSize = 10,
			state
		} = {}) {
			return netRequest.getApi({
				url: '/Reservation/GetReservationlist',
				data: {
					key: _getKey(),
					pageIndex: pageIndex ? (_pageIndex = pageIndex) : _pageIndex,
					pageSize,
					state,
				}
			}).then(res => {
				if (res.succeed && res.values) {
					var result = {
						list: res.values.list.map(item => {
							item.product_price = item.sv_reservation_money;
							item.sv_p_images2 = item.sv_product_logo ? imgUrl + item.sv_product_logo : '/images/foodimg.png'
							return item;
						}),
						isAll: _pageIndex++ * pageSize >= res.values.count ? true : false
					}
					return result;
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())
	//根据项目，获取技师
	getEmployeesByService(product_id) {
		return netRequest.getApi({
			url: "/Reservation/GetProductTechnicianList",
			data: {
				key: _getKey(),
				product_id
			}
		}).then(res => {
			if (res.succeed && res.values) {
				return res.values.list.map(item => {
					item.sv_technician_photo = item.sv_technician_photo ? imgUrl + item.sv_technician_photo : '/images/user.png';
					return item;
				});
			} else {
				return Promise.reject(res);
			}
		})
	}
	//根据技师获取项目
	getServicesByEmployee = (function(_pageIndex = 1) {
		return function({
			pageIndex,
			pageSize = 10,
			technician_id
		} = {}) {

			return netRequest.getApi({
				url: '/Reservation/GetProductReservationList',
				data: {
					key: _getKey(),
					pageIndex: pageIndex ? (_pageIndex = pageIndex) : _pageIndex,
					pageSize,
					technician_id
				}
			}).then(res => {
				if (res.succeed && res.values) {
					var result = {
						list: res.values.list.map(item => {
							item.product_price = item.sv_p_unitprice;
							item.sv_p_images2 = item.sv_product_logo ? imgUrl + item.sv_product_logo : '/images/foodimg.png'
							return item;
						}),
						isAll: _pageIndex++ * pageSize >= res.values.count ? true : false
					}
					return result;
				} else {
					return Promise.reject(res);
				}
			})
		}
	}())

	//获取项目详情
	getServiceInfo(product_id, tips) {
		return netRequest.getApi({
			url: '/Reservation/GetReservationProduct',
			data: {
				key: _getKey(),
				product_id
			},
			tips
		}).then(res => {
			if (res.succeed && res.values) {

				var values = res.values;

				values.sv_p_images2 = values.sv_product_logo ? imgUrl + values.sv_product_logo : "/images/foodimg.png";
				values.sv_p_imagesList = [{
					img: values.sv_p_images2
				}];

				values.sv_move_p_details = values.sv_description ?
					values.sv_description.replace(/(<img.*?)(\/>|>)(<br\s*\/>\s*)*/ig, ($, $1, $2) => {
						$2 = 'style="width:100%;height:auto;display:block"/>';
						return $1 + $2;
					}) : "";
				return values;
			} else {
				return Promise.reject(res);
			}
		})
	}
	//reservation预约ID
	confirmService(reservation) {
		return netRequest.postApi({
			url: '/Reservation/AcceptReservation',
			data: {
				key: _getKey(),
				reservation
			}
		}).then(res => {
			if (res.succeed) {
				return res.values
			} else {
				return Promise.reject(res);
			}
		})
	}
	//获取班次
	//newdate 日期，格式格式（yyyy-mm-dd），不传默认为今天
	getWorkingShift(weeks_number, newdate, sv_technician_id) {
		return netRequest.getApi({
			url: "/Reservation/GetWorkClassesModelList",
			data: {
				key: _getKey(),
				newdate,
				weeks_number,
				sv_technician_id
			}
		}).then(res => {
			if (res.succeed) {
				return res.values
			} else {
				return Promise.reject(res);
			}
		})
	}

	//提交预约
	// product_id	项目id必填
	// sv_reservation_money 项目价格
	// sv_product_number	项目数必填
	// sv_person_number	预约人数必填
	// sv_product_time	项目时长必填
	// sv_technician_id	技师id可选填(不填到店分配)
	// sv_reservation_person	预约人姓名必填
	// sv_reservation_phone	预约电话必填
	// sv_reservation_date1	预约时间起必填
	// sv_reservation_date2	预约时间止必填
	// sv_reservation_state	预约状态1申请
	// sv_service_type	服务方式【1到店；2上门】 必填
	applyService({
		product_id,
		sv_reservation_money,
		sv_product_number,
		sv_person_number,
		sv_product_time,
		sv_technician_id,
		sv_reservation_person,
		sv_reservation_phone,
		sv_reservation_date1,
		sv_reservation_date2,
		sv_reservation_state = 1,
		sv_service_type = 1
	}) {
		return netRequest.postApi({
			url: '/Reservation/ApplyReservation',
			data: {
				key: _getKey(),
				product_id,
				sv_reservation_money,
				sv_product_number,
				sv_person_number,
				sv_product_time,
				sv_technician_id,
				sv_reservation_person,
				sv_reservation_phone,
				sv_reservation_date1,
				sv_reservation_date2,
				sv_reservation_state,
				sv_service_type
			}
		}).then(res => {
			if (res.succeed) {
				return res.values;
			} else {
				return Promise.reject(res);
			}
		})
	}

	//获取预约成功信息
	getServiceOrderInfo(reservation_id) {
		return netRequest.getApi({
			url: '/Reservation/GetReservationinfo',
			data: {
				key: _getKey(),
				reservation_id
			},
			tips: "加载中"
		}).then(res => {
			var values = res.values,
				model = values && values.model;
			if (res.succeed && values && model) {
				model.sv_p_images2 = model.sv_product_logo ? imgUrl + model.sv_product_logo : '/images/foodimg.png'
				return model;
			} else {
				return Promise.reject(res)
			}
		})
	}
	//取消预约
	cancelService(reservation_id) {
		return netRequest.postApi({
			url: '/Reservation/CancelReservation',
			data: {
				key: _getKey(),
				reservation_id
			}
		}).then(res => {
			if (res.succeed && res.result) {
				return res.result;
			} else {
				return Promise.reject(res);
			}
		})
	}
	getEmployeeInfo(sv_technician_id) {
		return netRequest.getApi({
			url: '/Reservation/GetTechnicianModelinfo',
			data: {
				key: _getKey(),
				sv_technician_id
			}
		}).then(res => {
			if (res.succeed && res.values) {
				var values = res.values;
				values.sv_technician_photo = values.sv_technician_photo ? imgUrl + values.sv_technician_photo :
					'/images/user.png';

				values.sv_technician_works = (values.sv_technician_works || []).map(item => {
					return item.img.map(img => {
						return {
							des: item.des,
							img: img ? imgUrl + img.img : '/images/foodimg.png'
						}
					})
				})
				return values;
			} else {
				return Promise.reject(res);
			}
		})
	}

}
module.exports = {
	NetRequest, //网络请求基础类
	netRequest, //网络请求实例
	Order, //订单类
	Coupon, //优惠券类
	User, //会员相关类
	CartList, //购物车类
	Pay, //支付类
	ProductList, //商品类
	GroupBuy, //团购类
	Seckill, //秒杀类
	Address, //地址类
	Share, //分享有礼
	Bill, //账单类
	Integral, //积分兑换商品
	BookService
}
