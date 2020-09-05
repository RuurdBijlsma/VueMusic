import Vue from 'vue'
import Vuex from 'vuex'
import SpotifyWebApi from 'spotify-web-api-js';
import platform from './electron-module';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        auth: {
            code: null,
            token: null,
            refresh: null,
            expiryDate: null,
        },
        userInfo: {
            name: '',
            mail: '',
            country: '',
            followers: 0,
            avatar: 'img/no-user.jpg',
        },
        api: new SpotifyWebApi(),
    },
    mutations: {
        userInfo: (state, userInfo) => state.userInfo = userInfo,
        server: (state, server) => state.server = server,
        auth: (state, auth) => {
            localStorage.auth = JSON.stringify(auth);
            state.auth = auth
        },
    },
    getters: {
        isLoggedIn: state => {
            return state.auth.code !== null &&
                state.auth.token !== null &&
                state.auth.refresh !== null &&
                state.auth.expiryDate !== null;
        },
        isAuthExpired: (state, getters) => {
            if (!getters.isLoggedIn) {
                console.warn("Auth expiry check warning: User is not logged in");
                return true;
            }
            return new Date > state.auth.expiryDate;
        },
    },
    actions: {
        initialize: async ({dispatch}) => {
            if (localStorage.getItem('auth') !== null)
                try {
                    let auth = JSON.parse(localStorage.getItem('auth'));
                    await dispatch('commitAuth', auth);
                } catch (e) {
                    console.warn("Couldn't set auth from localStorage.auth", e)
                }

            await dispatch('_initialize');
        },
        spotifyLogin: async ({dispatch}) => {
            let auth = await dispatch('firstLogin');
            console.log("Auth result from 'spotifyLogin'", auth);
            await dispatch('commitAuth', auth);
        },
        loginByRefreshToken: async ({dispatch, state}) => {
            if (!state.auth.refresh) {
                console.warn("Couldn't get new token, refresh token isn't set", state.auth);
                return;
            }
            let auth = await dispatch('getAuthByRefreshToken', state.auth.refresh);
            await dispatch('commitAuth', auth);
        },
        commitAuth: async ({dispatch, commit, state}, auth) => {
            commit('auth', auth);

            let now = new Date();
            if (auth.expiryDate > now) {
                state.api.setAccessToken(auth.token);

                let msUntilExpire = auth.expiryDate - now;
                await dispatch('loadUserProfile');
                setTimeout(async () => {
                    await dispatch('loginByRefreshToken');
                }, msUntilExpire - 1000 * 60 * 5)
            } else {
                //auth is expired
                await dispatch('loginByRefreshToken');
            }
        },
        loadUserProfile: async ({state, commit}) => {
            let me = await state.api.getMe();
            commit('userInfo', {
                name: me.display_name,
                mail: me.email,
                country: me.country,
                followers: me.followers,
                avatar: me.images.length === 0 ? 'img/no-user.jpg' : me.images[0].url,
            })
        },
    },
    modules: {platform}
})
