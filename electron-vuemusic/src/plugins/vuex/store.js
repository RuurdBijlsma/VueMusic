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
        snackbars: [],

        api: new SpotifyWebApi(),
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
        userInfo: {
            id: '',
            name: '',
            mail: '',
            country: '',
            followers: 0,
            avatar: 'img/no-user.jpg',
        },
        library: localStorage.getItem('library') === null ? {
            isRefreshing: {
                playlists: false,
                albums: false,
                artists: false,
                tracks: false,
            },
            playlists: [],
            artists: [],
            albums: [],
            tracks: [],
        } : JSON.parse(localStorage.library),
        playlist: {},
        album: {},
        artist: {},
    },
    mutations: {
        addSnackObject: (state, snack) => state.snackbars.push(snack),
        removeSnack: (state, snack) => state.snackbars.splice(state.snackbars.indexOf(snack), 1),

        loadPlaylist: (state, {id, playlist}) => Vue.set(state.playlist, id, playlist),
        extendPlaylist: (state, {id, tracks}) => state.playlist[id].tracks.push(...tracks),
        loadAlbum: (state, {id, album}) => Vue.set(state.album, id, album),
        extendAlbum: (state, {id, tracks}) => state.album[id].tracks.push(...tracks),
        loadInitialArtist: (state, {id, artist}) => Vue.set(state.artist, id, {
            artist,
            related: [],
            tracks: [],
            albums: {},
        }),
        loadArtist: (state, {id, artist}) => state.artist[id].artist = artist,
        loadArtistRelated: (state, {id, related}) => state.artist[id].related = related,
        loadArtistTracks: (state, {id, tracks}) => state.artist[id].tracks = tracks,
        loadArtistAlbums: (state, {id, albums}) => state.artist[id].albums = albums,

        browseCategories: (state, categories) => state.browse.categories = categories,
        browseGenres: (state, genres) => state.browse.genres = genres,

        homeFeatured: (state, featured) => state.homePage.featured = featured,
        homeRecent: (state, recent) => state.homePage.recent = recent,
        homeNew: (state, newReleases) => state.homePage.newReleases = newReleases,
        homePersonalized: (state, personalized) => state.homePage.personalized = personalized,

        isRefreshing: (state, {type, value}) => state.library.isRefreshing[type] = value,
        addUserPlaylist: (state, playlist) => state.library.playlists.push(playlist),
        userPlaylists: (state, playlists) => state.library.playlists = playlists,

        addToLibrary: (state, {type, item}) => state.library[type + 's'].push(item),
        removeFromLibrary: (state, {type, id}) => {
            let index = state.library[type + 's'].findIndex(i => i.id === id)
            if (index !== -1)
                state.library[type + 's'].splice(index, 1)
        },
        setLibrary: (state, {type, items}) => state.library[type + 's'] = items,
        userInfo: (state, userInfo) => state.userInfo = userInfo,

        timeout: (state, id) => state.timeout = id,
        windowWidth: (state, windowWidth) => state.windowWidth = windowWidth,
        server: (state, server) => state.server = server,
        auth: (state, auth) => {
            localStorage.auth = JSON.stringify(auth);
            state.auth = auth
        },
    },
    getters: {
        notFoundImage: () => {
            let i = Math.floor(Math.random() * 7) + 1;
            return `img/notfound/${i}.png`;
        },
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
        },
        shareUrl: () => (item) => {
            return 'https://idk.com/' + item.type + '/' + item.name;
        },
        isArtistFollowed: state => artist => state.library.artists.find(a => a.id === artist.id),
        isTrackFollowed: state => track => state.library.tracks.find(a => a.id === track.id),
        isPlaylistFollowed: state => playlist => state.library.playlists.find(a => a.id === playlist.id),
        isAlbumFollowed: state => album => state.library.albums.find(a => a.id === album.id),
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
        loginByRefreshToken: async ({state, dispatch}) => {
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
        addSnack: async ({state, commit}, {text, timeout = 3000}) => {
            let snack = {text, open: true, timeout};
            commit('addSnackObject', snack);
            return new Promise(resolve => {
                setTimeout(() => {
                    commit('removeSnack', snack);
                    resolve();
                }, timeout + 500);
            });
        },
        share: async ({dispatch}, {url, copy}) => {
            if (navigator.share instanceof Function) {
                await navigator.share({
                    name: this.playlist.name,
                    text: this.playlist.description || '',
                    url: url,
                });
            } else {
                await copy(url);
                await dispatch('addSnack', {text: 'Share URL copied to clipboard!'});
            }
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
        async * retrieveSpotifyArray({state}, [apiFunction, pageObject = r => r]) {
            let getData = () => apiFunction()

            while (true) {
                let result = await getData();

                if (result !== null)
                    yield result;

                if (result === null || pageObject(result).next === null)
                    break;

                let nextUrl = pageObject(result).next;
                if (nextUrl === undefined)
                    console.warn("next url is undefined");

                getData = () => state.api.getGeneric(nextUrl);
                pageObject = r => r;
            }
        },
        initializeSpotify: async ({state, commit, dispatch}) => {
            await dispatch('refreshUserInfo');
            let doneCount = 0;
            let checkDone = () => {
                if (++doneCount === 4) {
                    localStorage.library = JSON.stringify(state.library);
                }
            }
            dispatch('refreshUserData').then(checkDone);
            dispatch('refreshUserData', 'artist').then(checkDone);
            dispatch('refreshUserData', 'album').then(checkDone);
            if (state.library.tracks.length === 0) {
                dispatch('refreshUserData', 'track').then(checkDone);
            }
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
        refreshUserData: async ({commit, state, dispatch}, type = 'playlist') => {
            if (!['playlist', 'album', 'track', 'artist'].includes(type))
                console.warn("Wrong type set for refreshUserData!");

            if (state.library.isRefreshing[type]) {
                await dispatch('waitFor', 'refreshed' + type);
                return;
            }
            commit('isRefreshing', {type, value: true});

            let isInitial = state.library[type + 's'].length === 0;

            if (state.userInfo.id === '')
                await dispatch('refreshUserInfo');

            let retrieval, page = r => r;
            switch (type) {
                case 'playlist':
                    retrieval = () => state.api.getUserPlaylists(state.userInfo.id);
                    break;
                case 'album':
                    retrieval = () => state.api.getMySavedAlbums();
                    break;
                case 'artist':
                    retrieval = () => state.api.getFollowedArtists();
                    page = r => r.artists;
                    break;
                case 'track':
                    retrieval = () => state.api.getMySavedTracks();
                    page = r => r;
                    break;
            }

            let items = [];
            let addToLib = item => {
                if (isInitial)
                    commit('addToLibrary', {type, item});
                else items.push(item);
            }

            for await(let batch of await dispatch('retrieveSpotifyArray', [retrieval, page])) {
                for (let item of page(batch).items) {
                    if (type === 'track')
                        addToLib(item.track);
                    else if (type === 'album')
                        addToLib(item.album);
                    else
                        addToLib(item);
                }
            }
            if (!isInitial)
                commit('setLibrary', {type, items});

            state.events.emit('refreshed' + type);
            commit('isRefreshing', {type, value: false});
        },
        refreshHomePage: async ({commit, state, dispatch}) => {
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
                    await dispatch('refreshUserData');
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
            let pageObject = r => r.tracks;
            for await(let batch of await dispatch('retrieveSpotifyArray', [retrieval, pageObject])) {
                if (batch.items) {
                    commit('extendPlaylist', {id, tracks: batch.items});
                } else {
                    commit('loadPlaylist', {id, playlist: {...batch, tracks: batch.tracks.items}});
                }
            }
        },
        loadAlbum: async ({dispatch, commit, state}, id) => {
            let retrieval = () => state.api.getAlbum(id);
            let pageObject = r => r.tracks;
            for await(let batch of await dispatch('retrieveSpotifyArray', [retrieval, pageObject])) {
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
            let isInitial = !state.artist.hasOwnProperty(id);

            let artist = await state.api.getArtist(id);
            if (isInitial)
                commit('loadInitialArtist', {id, artist});
            else
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
        followPlaylist: async ({state, dispatch}, playlist) => {
            await state.api.followPlaylist(playlist.id);
            await dispatch('refreshUserData');
        },
        unfollowPlaylist: async ({state, dispatch}, playlist) => {
            await state.api.unfollowPlaylist(playlist.id);
            await dispatch('refreshUserData');
        },
        followArtist: async ({state, dispatch}, artist) => {
            await state.api.followArtists([artist.id]);
            await dispatch('refreshUserData', 'artist');
        },
        unfollowArtist: async ({state, dispatch}, artist) => {
            await state.api.unfollowArtists([artist.id]);
            await dispatch('refreshUserData', 'artist');
        },
        followAlbum: async ({state, dispatch}, album) => {
            await state.api.addToMySavedAlbums([album.id]);
            await dispatch('refreshUserData', 'album');
        },
        unfollowAlbum: async ({state, dispatch}, album) => {
            await state.api.removeFromMySavedAlbums([album.id]);
            await dispatch('refreshUserData', 'album');
        },
        followTrack: async ({state, dispatch, commit}, track) => {
            await state.api.addToMySavedTracks([track.id]);
            commit('addToLibrary', {type: 'track', item: track});
        },
        unfollowTrack: async ({state, dispatch, commit}, track) => {
            await state.api.removeFromMySavedTracks([track.id]);
            commit('removeFromLibrary', {type: 'track', id: track.id});
        },
    },
    modules: {platform, media}
})
