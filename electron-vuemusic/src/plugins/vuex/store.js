import Vue from 'vue'
import Vuex from 'vuex'
import SpotifyWebApi from 'spotify-web-api-js';
import platform from './electron-module';
import media from './media-module';
import EventEmitter from 'events';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        events: new EventEmitter(),
        windowWidth: window.innerWidth,
        auth: {
            code: null,
            token: null,
            refresh: null,
            expiryDate: null,
        },
        timeout: -1,
        userInfo: {
            id: '',
            name: '',
            mail: '',
            country: '',
            followers: 0,
            avatar: 'img/no-user.jpg',
        },
        api: new SpotifyWebApi(),
        library: {
            isRefreshingPlaylists: false,
            playlists: [],
        },
        homePage: {
            featured: {title: '', playlists: []},
            recent: [],
            newReleases: [],
            personalized: [],
        },
    },
    mutations: {
        isRefreshingPlaylists: (state, value) => state.library.isRefreshingPlaylists = value,
        homePage: (state, homePage) => state.homePage = homePage,
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
                state.events.emit('accessToken');

                let msUntilExpire = auth.expiryDate - now;
                await dispatch('initializeSpotify');
                commit('timeout', setTimeout(async () => {
                    await dispatch('loginByRefreshToken');
                }, msUntilExpire - 1000 * 60 * 5));
            } else {
                console.warn("Auth has expired, getting new token");
                //auth is expired
                await dispatch('loginByRefreshToken');
            }
        },
        waitFor: async ({state}, event) => {
            return new Promise(resolve => {
                state.events.on(event, resolve);
            });
        },
        awaitAuth: async ({dispatch, commit, state}) => {
            if (state.api.getAccessToken() !== null)
                return;
            return await dispatch('waitFor', 'accessToken');
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
            await dispatch('refreshUserInfo');
            dispatch('refreshUserPlaylists').then();
        },
        refreshUserInfo: async ({commit, state}) => {
            let me = await state.api.getMe();
            commit('userInfo', {
                id: me.id,
                name: me.display_name,
                mail: me.email,
                country: me.country,
                followers: me.followers,
                avatar: me.images.length === 0 ? 'img/no-user.jpg' : me.images[0].url,
            });
        },
        refreshUserPlaylists: async ({commit, state, dispatch}) => {
            if (state.library.isRefreshingPlaylists) {
                await dispatch('waitFor', 'refreshedPlaylists');
                return;
            }
            commit('isRefreshingPlaylists', true);
            commit('userPlaylists', []);

            if (state.userInfo.id === '')
                await dispatch('refreshUserInfo');

            let retrieval = ({limit, offset}) => state.api.getUserPlaylists(state.userInfo.id, {limit, offset});
            for await(let playlist of await dispatch('retrieveSpotifyArray', retrieval)) {
                commit('addUserPlaylist', playlist);
            }
            state.events.emit('refreshedPlaylists');
            commit('isRefreshingPlaylists', false);
        },
        refreshHomePage: async ({commit, dispatch, state}) => {
            await dispatch('awaitAuth');
            let homePage = {
                featured: {title: '', playlists: []},
                recent: [],
                newReleases: [],
                personalized: [],
            };
            commit('homePage', homePage);

            //Featured playlists
            let featured = await state.api.getFeaturedPlaylists({limit: 50});
            homePage.featured.title = featured.message;
            homePage.featured.playlists.push(...featured.playlists.items);

            //Personalized playlists
            let personalized;
            if (localStorage.getItem('discoverPlaylists') === null) {
                if (state.library.playlists.length === 0) {
                    await dispatch('refreshUserPlaylists');
                }
                const discoverNames = ['Discover Weekly', 'Release Radar', ...[...Array(10)].map((_, i) => 'Daily Mix ' + (i + 1))];

                personalized = state.library.playlists.filter(playlist => discoverNames
                        .findIndex(name => playlist.name.includes(name)) !== -1 &&
                    playlist.owner.display_name === 'Spotify'
                );
                personalized.sort((a, b) => {
                    let aI = discoverNames.findIndex(name => a.name.includes(name));
                    let bI = discoverNames.findIndex(name => b.name.includes(name));
                    return aI - bI;
                });
                if (personalized.length > 0) {
                    localStorage.discoverPlaylists = JSON.stringify(personalized);
                    homePage.personalized.push(...personalized);
                }
            } else {
                homePage.personalized.push(...JSON.parse(localStorage.discoverPlaylists));
            }
            console.log(homePage.personalized)

            //New releases
            let newReleases = await state.api.getNewReleases({limit: 50});
            console.log(newReleases);
            homePage.newReleases.push(...newReleases.albums.items);
        },
    },
    modules: {platform, media}
})
