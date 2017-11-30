// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import routerCond from './assets/js/routerCond'

// css
import './assets/css/common.css'

const port = process.env.PORT || 3000
const baseURL = process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : 'http://localhost:' + port
const http = axios.create({ baseURL: baseURL })

Vue.config.productionTip = false
Vue.prototype.$baseURL = baseURL
Vue.prototype.$http = http

routerCond(router, http)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
