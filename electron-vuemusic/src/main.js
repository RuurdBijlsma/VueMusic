import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './plugins/router'
import store from './plugins/vuex/store'
import vuetify from './plugins/vuetify';

import PerfectScrollbar from 'vue2-perfect-scrollbar'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'
Vue.use(PerfectScrollbar)

import {RecycleScroller} from 'vue-virtual-scroller';
Vue.component('RecycleScroller', RecycleScroller);
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';


import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
