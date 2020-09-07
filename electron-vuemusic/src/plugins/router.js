import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/ListenNow.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings')
    },
    {
        path: '/browse',
        name: 'Browse',
        component: () => import('../views/Browse')
    },
]

const router = new VueRouter({
    routes
})

export default router
