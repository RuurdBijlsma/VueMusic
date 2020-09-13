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
    {
        path: '/album/:name/:id/:trackId?',
        name: 'Album',
        component: () => import('../views/Album')
    },
    {
        path: '/playlist/:name/:id',
        name: 'Playlist',
        component: () => import('../views/Playlist')
    },
    {
        path: '/artist/:name/:id',
        name: 'Artist',
        component: () => import('../views/Artist')
    },
    {
        path: '/user/:name/:id',
        name: 'User',
        component: () => import('../views/User')
    },
    {
        path: '/track/:name/:id',
        name: 'Track',
        component: () => import('../views/Track')
    },
    {
        path: '/category/:id',
        name: 'Category',
        component: () => import('../views/Category')
    },
    {
        path: '/artists',
        name: 'Artists',
        component: () => import('../views/Artists')
    },
    {
        path: '/albums',
        name: 'Albums',
        component: () => import('../views/Albums')
    },
    {
        path: '/playlists',
        name: 'Playlists',
        component: () => import('../views/Playlists')
    },
    {
        path: '/tracks',
        name: 'Tracks',
        component: () => import('../views/Tracks')
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('../views/Search')
    },
    {
        path: '/library',
        name: 'Library',
        component: () => import('../views/Library')
    },
    {
        path: '/tune',
        name: 'Tune',
        component: () => import('../views/Tune')
    },
    {
        path: '/radio',
        name: 'Radio',
        component: () => import('../views/Radio')
    },
]

const router = new VueRouter({
    routes
})

export default router
