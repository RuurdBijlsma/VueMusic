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
        path: '/downloads',
        name: 'Downloads',
        component: () => import('../views/Downloads')
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
        path: '/library',
        name: 'Library',
        component: () => import('../views/Library')
    },
    {
        path: '/library/artists',
        name: 'Artists',
        component: () => import('../views/Artists')
    },
    {
        path: '/library/albums',
        name: 'Albums',
        component: () => import('../views/Albums')
    },
    {
        path: '/library/playlists',
        name: 'Playlists',
        component: () => import('../views/Playlists')
    },
    {
        path: '/library/tracks',
        name: 'Tracks',
        component: () => import('../views/Tracks')
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('../views/Search')
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
    {
        path: '/nowplaying',
        name: 'NowPlaying',
        component: () => import('../views/NowPlaying')
    },
]

const router = new VueRouter({
    routes
})

export default router
