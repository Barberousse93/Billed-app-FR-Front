export const localStorageMock = (function () {
  let store = {}
  return {
    getItem: function (key) {
      // console.log(JSON.stringify(store[key]))
      return JSON.stringify(store[key])
    },
    setItem: function (key, value) {
      store[key] = value.toString()
    },
    clear: function () {
      store = {}
    },
    removeItem: function (key) {
      delete store[key]
    },
  }
})()
