import Vue from 'vue'
import Vuex from 'vuex'
import SpotifyWebApi from 'spotify-web-api-js';
import platform from './electron-module';
import media from './media-module';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        windowWidth: window.innerWidth,
        auth: {
            code: null,
            token: null,
            refresh: null,
            expiryDate: null,
        },
        timeout: -1,
        userInfo: {
            name: '',
            mail: '',
            country: '',
            followers: 0,
            avatar: 'img/no-user.jpg',
        },
        api: new SpotifyWebApi(),
        library: {
            playlists: [],
        }
    },
    mutations: {
        windowWidth: (state, windowWidth) => state.windowWidth = windowWidth,
        addUserPlaylist: (state, playlist) => state.library.playlists.push(playlist),
        userPlaylists: (state, playlists) => state.library.playlists = playlists,
        timeout: (state, id) => state.timeout = id,
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
            if (localStorage.getItem('auth') !== null) {
                let auth;
                try {
                    auth = JSON.parse(localStorage.getItem('auth'));
                } catch (e) {
                    console.warn("Couldn't set auth from localStorage.auth", e)
                }
                await dispatch('commitAuth', auth);
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
            let {access_token, expires_in} = await dispatch('getAuthByRefreshToken', state.auth.refresh);
            let auth = {...state.auth};
            auth.token = access_token;
            auth.expiryDate = (+new Date) + expires_in * 1000;
            await dispatch('commitAuth', auth);
        },
        spotifyLogout: async ({state, commit}) => {
            localStorage.removeItem('auth');
            clearTimeout(state.timeout);
            commit('auth', {
                code: null,
                token: null,
                refresh: null,
                expiryDate: null,
            });
            commit('userPlaylists', []);
        },
        commitAuth: async ({dispatch, commit, state}, auth) => {
            commit('auth', auth);

            let now = new Date();
            if (auth.expiryDate > now) {
                state.api.setAccessToken(auth.token);

                let msUntilExpire = auth.expiryDate - now;
                await dispatch('initializeSpotify');
                commit('timeout', setTimeout(async () => {
                    await dispatch('loginByRefreshToken');
                }, msUntilExpire - 1000 * 60 * 5));
            } else {
                //auth is expired
                await dispatch('loginByRefreshToken');
            }
        },
        async * retrieveSpotifyArray({}, apiFunction) {
            //Example apiFunction: ({limit, offset})=>state.api.getUserPlaylists(me.id, {limit, offset})
            let offset = 0;
            let limit = 10;

            while (true) {
                let result = await apiFunction({offset, limit});
                for (let item of result.items) {
                    yield item;
                }
                if (result.next === null)
                    break;
                offset += limit;
            }
        },
        initializeSpotify: async ({state, commit, dispatch}) => {
            let me = await state.api.getMe();
            commit('userInfo', {
                name: me.display_name,
                mail: me.email,
                country: me.country,
                followers: me.followers,
                avatar: me.images.length === 0 ? 'img/no-user.jpg' : me.images[0].url,
            });

            commit('userPlaylists', []);
            let retrieval = ({limit, offset}) => state.api.getUserPlaylists(me.id, {limit, offset});
            for await(let playlist of await dispatch('retrieveSpotifyArray', retrieval)) {
                commit('addUserPlaylist', playlist);
            }
        },
    },
    modules: {platform, media}
})
