
import utils from "../utils/util.js";

function classifyModule(modules) {
  var modulesObj = null;
  if (utils.type(modules) === "array" && modules.length > 0) {
    modulesObj = {};
    modules.forEach((item, index) => {
      if (!modulesObj[item.id]) {
        modulesObj[item.id] = [];
      }
      item.order = index;
      //修正商品模块，按类目选择的数量,原先结构num是放在categery里，后来存放在item中，
      //所有如果item,有值则覆盖掉原来的item.categery的值
      // if (item.id == 3 && item.source == "1" && item.num) {
      //   item.categery.num = item.num;
      // }
      modulesObj[item.id].push(item);
    })
  }
  return modulesObj;
}
const rpxTopx = function (rpxValue) {
  return rpxValue / 750 * uni.getSystemInfoSync().windowWidth
}
const pxTorpx = function (pxValue) {
  return pxValue * 750 / uni.getSystemInfoSync().windowWidth;
}

module.exports = {
  rpxTopx,
  pxTorpx,
  classifyModule
}