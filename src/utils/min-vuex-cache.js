function minVuexCache ({ key = 'minvuexcache', localStorage = [] }) {
    if (!Array.isArray(localStorage)) {
      throw new Error('localStorage 必须是 Array 类型')
    }
    function setState (key, state) {
      return uni.setStorageSync(key, state)
    }
  
    function getState (key) {
      return uni.getStorageSync(key)
    }
    return function (store) {
      store.replaceState(Object.assign({}, store.state, getState(key)))
      store.subscribe((_mutation, state) => {
        let localData = {}
        Object.keys(state).forEach(item => {
          if (localStorage.includes(item)) {
            localData = Object.assign({}, localData, { [item]: state[item] })
          }
        })
        setState(key, localData)
      })
    }
  }
  
  export default minVuexCache
  