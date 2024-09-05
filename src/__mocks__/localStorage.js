// export const localStorageMock = (function() {
//   let store = {};
//   return {
//     getItem: function(key) {
//       return JSON.stringify(store[key])
//     },
//     setItem: function(key, value) {
//       store[key] = value.toString()
//     },
//     clear: function() {
//       store = {}
//     },
//     removeItem: function(key) {
//       delete store[key]
//     }
//   }
// })()
export const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  clear() {
    this.store = {};
  },
  removeItem(key) {
    delete this.store[key];
  }
};
