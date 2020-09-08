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
        browse: {
            categories: [],
            genres: [],
        },
        playlist: {},
        album: {},
        artist: {},
    },
    mutations: {
        loadPlaylist: (state, {id, playlist}) => Vue.set(state.playlist, id, playlist),
        extendPlaylist: (state, {id, tracks}) => state.playlist[id].tracks.push(...tracks),
        loadAlbum: (state, {id, album}) => Vue.set(state.album, id, album),
        extendAlbum: (state, {id, tracks}) => state.album[id].tracks.push(...tracks),
        loadArtist: (state, {id, artist}) => Vue.set(state.artist, id, {artist, related: [], tracks: [], albums: {}}),
        loadArtistRelated: (state, {id, related}) => state.artist[id].related = related,
        loadArtistTracks: (state, {id, tracks}) => state.artist[id].tracks = tracks,
        loadArtistAlbums: (state, {id, albums}) => state.artist[id].albums = albums,

        browseCategories: (state, categories) => state.browse.categories = categories,
        browseGenres: (state, genres) => state.browse.genres = genres,

        homeFeatured: (state, featured) => state.homePage.featured = featured,
        homeRecent: (state, recent) => state.homePage.recent = recent,
        homeNew: (state, newReleases) => state.homePage.newReleases = newReleases,
        homePersonalized: (state, personalized) => state.homePage.personalized = personalized,

        isRefreshingPlaylists: (state, value) => state.library.isRefreshingPlaylists = value,
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
        urlName: () => name => {
            return encodeURIComponent(name.toLowerCase().replace(/ /gi, '-'));
        }
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
        async * retrieveSpotifyArray({state}, [apiFunction, nextProperty = r => r.next]) {
            let getData = () => apiFunction()

            while (true) {
                let result = await getData();

                if (result !== null)
                    yield result;

                if (result === null || nextProperty(result) === null)
                    break;

                let nextUrl = nextProperty(result);
                if (nextUrl === undefined)
                    console.warn("next url is undefined");

                getData = () => state.api.getGeneric(nextUrl);
                nextProperty = r => r.next;
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

            let retrieval = () => state.api.getUserPlaylists(state.userInfo.id);
            for await(let batch of await dispatch('retrieveSpotifyArray', [retrieval])) {
                for (let playlist of batch.items)
                    commit('addUserPlaylist', playlist);
            }
            state.events.emit('refreshedPlaylists');
            commit('isRefreshingPlaylists', false);
        },
        refreshHomePage: async ({commit, dispatch, state}) => {
            await dispatch('awaitAuth');

            //Featured playlists
            let featured = await state.api.getFeaturedPlaylists({limit: 50});
            commit('homeFeatured', {
                title: featured.message,
                playlists: featured.playlists.items,
            });

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
                    commit('homePersonalized', personalized);
                }
            } else {
                commit('homePersonalized', JSON.parse(localStorage.discoverPlaylists));
            }

            //New releases
            let newReleases = await state.api.getNewReleases({limit: 50});
            commit('homeNew', newReleases.albums.items);

            //Recently played playlists or albums
            if (localStorage.getItem('recentlyPlayed') !== null)
                commit('homeRecent', JSON.parse(localStorage.recentlyPlayed));
        },
        refreshBrowsePage: async ({dispatch, commit, state}) => {
            state.api.getCategories({limit: 50})
                .then(c => commit('browseCategories', c.categories.items));
            state.api.getAvailableGenreSeeds().then(g => {
                commit('browseGenres', g.genres.map(genre =>
                    genre.split('-')
                        .map(w => w
                                .substr(0, 1)
                                .toUpperCase() +
                            w.substr(1))
                        .join(' ')
                ));
            });
        },
        loadPlaylist: async ({dispatch, commit, state}, id) => {
            let retrieval = () => state.api.getPlaylist(id);
            let nextProperty = r => r.tracks.next;
            for await(let batch of await dispatch('retrieveSpotifyArray', [retrieval, nextProperty])) {
                if (batch.items) {
                    commit('extendPlaylist', {id, tracks: batch.items});
                } else {
                    commit('loadPlaylist', {id, playlist: {...batch, tracks: batch.tracks.items}});
                }
            }
        },
        loadAlbum: async ({dispatch, commit, state}, id) => {
            let retrieval = () => state.api.getAlbum(id);
            let nextProperty = r => r.tracks.next;
            for await(let batch of await dispatch('retrieveSpotifyArray', [retrieval, nextProperty])) {
                if (batch.items) {
                    batch.items.forEach(i => i.album = state.album[id]);
                    commit('extendAlbum', {id, tracks: batch.items});
                } else {
                    let album = {...batch};
                    album.tracks.items.forEach(i => i.album = album);
                    album.tracks = album.tracks.items;
                    commit('loadAlbum', {id, album});
                }
            }
        },
        loadArtist: async ({dispatch, commit, state}, id) => {
            let artist = await state.api.getArtist(id);
            commit('loadArtist', {id, artist});
            state.api.getArtistRelatedArtists(id).then(related => {
                commit('loadArtistRelated', {id, related: related.artists});
            });

            state.api.getArtistTopTracks(id, 'from_token').then(tracks => {
                commit('loadArtistTracks', {id, tracks: tracks.tracks});
            });

            let retrieval = () => state.api.getArtistAlbums(id);
            let albums = []
            for await(let batch of await dispatch('retrieveSpotifyArray', [retrieval])) {
                albums.push(...batch.items);
            }
            commit('loadArtistAlbums', {id, albums});
        },
    },
    modules: {platform, media}
})
