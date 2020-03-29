# uni-decerp

编码：

> 最好使用 `vscode` 编辑器
>
> 源码也上传了项目 `vscode eslint`配置
>
> 如果不需要请删除  `.vscode` 文件夹



## Router使用方式

在页面添加 `navigate`类型是 `Array` 对应值是：`['navigateTo', 'switchTab', 'reLaunch', 'redirectTo']`

用法

```js
// 文件目录 pages/home/index.vue


export default {
  navigate: ['navigateTo']
}
// 会生成 navigateTo 跳转的方式
// 会生成 name 值为 所在文件夹的名称(home)

export default {
  navigate: ['navigateTo', 'switchTab']
}
// 会生成navigateTo、switchTab跳转的方式
// 会生成两条数据
// navigateTo 对应 name 值为 所在文件夹的名称(home)
// switchTab 对应 name 值为 所在文件夹的名称(swhome)

// 其他方式对应值
// reLaunch 对应 name 值为 所在文件夹的名称(relhome)
// redirectTo 对应 name 值为 所在文件夹的名称(redhome)

```

```js
this.$minRouter.push({
	// 这里的 name 对应上面生成的 name 值
    name: 'home',
    // params 是页面传参类型最好是 Object
    params: { id: 1 }
})


// 不传参时可以直接如下写法
this.$minRouter.push('swhome')


// 获取页面参数
this.$parseURL()

```

项目中文件目录 `router/index.js` 

可以设置路由拦截用法和 `Vue` 全局前置钩子类似

## Request使用方式

文件目录 `api/index`

基本配置都在这里，最好不要乱动这个文件

需要添加新的请求需要在文件夹 `api` 下面建文件

按如下形式编写
文件名为 `user`
```js
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
```

```js
// 在页面中
this.$minApi.user.uniapp({ wd: 'uni-app' })
this.$minApi.user.puniapp({ wd: 'uni-app' })
```

## Store使用方式

文件目录 `store/`

新建文件必须使用命名空间 `namespaced: true`

还有一个可选参数 `cache` 值是 `String` 类型的

```js
export default {
  namespaced: true,
	cache: 'local'
}
```

local 表示使用localStorage缓存

默认不缓存
