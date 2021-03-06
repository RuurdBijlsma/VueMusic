import Vue from 'vue'
import Vuex from 'vuex'
import SpotifyWebApi from 'spotify-web-api-js';
import media from './media-module';
import search from './search-module';
import theme from './theme-module';
import EventEmitter from 'events';
import Utils from "../../js/Utils";
import {get, keys, set, clear} from "idb-keyval";

let isElectron = window && window.process !== undefined && window.process.type !== undefined;
console.log("is electron?", isElectron);
const platform = require(isElectron ? './electron-module' : './web-module').default;

if (document.querySelectorAll(`head link[rel='manifest']`).length === 0) {
    let manifestLink = document.createElement('link');
    manifestLink.setAttribute('rel', 'manifest');
    manifestLink.setAttribute('href', './manifest.json');
    document.querySelector('head').appendChild(manifestLink);
}

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        keys: {
            spotifyId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            spotifySecret: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            youtube: 'cccccccccccc-dddddddddddddddddddddddddd',
        },
        requestedScopes: "ugc-image-upload user-read-email user-read-private playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private user-library-modify user-library-read user-top-read user-read-recently-played user-follow-read user-follow-modify",
        authUrl: 'https://accounts.spotify.com/',

        isTouch: Utils.isTouchDevice(),
        dontCache: false,
        events: new EventEmitter(),
        windowWidth: window.innerWidth,
        timeout: -1,
        snackbars: [],
        api: new SpotifyWebApi(),
        isRefreshing: {
            playlist: false,
            album: false,
            artist: false,
            track: false,
        },
        auth: {
            code: null,
            token: null,
            refresh: null,
            expiryDate: null,
        },
        homePage: {
            featured: {title: '', playlists: []},
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
        library: {
            playlists: [],
            artists: [],
            albums: [],
            tracks: [],
        },
        playlist: {},
        album: {},
        artist: {},
        category: {},
        user: {},
    },
    mutations: {
        setStateValue: (state, {key, value}) => Vue.set(state, key, value),

        spotifyId: (state, id) => {
            state.keys.spotifyId = id
        },
        spotifySecret: (state, secret) => {
            state.keys.spotifySecret = secret
        },
        youtubeKey: (state, key) => {
            state.keys.youtube = key;
            state.platform.downloader.apiKey = key;
        },

        dontCache: state => state.dontCache = true,
        addSnackObject: (state, snack) => state.snackbars.push(snack),
        removeSnack: (state, snack) => state.snackbars.splice(state.snackbars.indexOf(snack), 1),

        loadCategory: (state, {id, category}) => Vue.set(state.category, id, category),
        extendCategory: (state, {id, playlists}) => state.category[id].playlists.push(...playlists),
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
        loadUser: (state, {id, user}) => Vue.set(state.user, id, user),
        extendUser: (state, {id, playlists}) => state.user[id].playlists.push(...playlists),

        browseCategories: (state, categories) => state.browse.categories = categories,
        browseGenres: (state, genres) => state.browse.genres = genres,

        homeFeatured: (state, featured) => state.homePage.featured = featured,
        homeRecent: (state, recent) => state.homePage.recent = recent,
        homeNew: (state, newReleases) => state.homePage.newReleases = newReleases,
        homePersonalized: (state, personalized) => state.homePage.personalized = personalized,

        isRefreshing: (state, {type, value}) => state.isRefreshing[type] = value,
        addUserPlaylist: (state, playlist) => state.library.playlists.push(playlist),
        userPlaylists: (state, playlists) => state.library.playlists = playlists,

        addToLibrary: (state, {type, item, addAtStart = false}) => state.library[type + 's'][addAtStart ? 'unshift' : 'push'](item),
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
        auth: (state, auth) => state.auth = auth,
    },
    getters: {
        isValidKeySet: () => ({spotifyId, spotifySecret, youtube}) =>
            spotifyId !== "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" &&
            spotifySecret !== "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" &&
            youtube !== "cccccccccccc-dddddddddddddddddddddddddd" &&
            spotifyId.length === 32 &&
            spotifySecret.length === 32 &&
            youtube.length === 39 &&
            youtube.indexOf('-') === 12,
        isKeySet: (state, getters) => getters.isValidKeySet({...state.keys}),

        notFoundUser: () => {
            let i = Math.floor(Math.random() * 7) + 1;
            return `img/user/${i}.png`;
        },
        notFoundImage: () => {
            let i = Math.floor(Math.random() * 7) + 1;
            return `img/notfound/${i}.png`;
        },
        likedImage: () => {
            let i = Math.floor(Math.random() * 7) + 1;
            return `img/liked/${i}.png`;
        },
        itemImage: (state, getters) => item => {
            if (!item)
                return getters.notFoundImage;
            let type = item.type || 'category';
            if (type === 'category') {
                if (item.icons.length > 0)
                    return item.icons[0].url;
                else
                    return getters.notFoundImage;
            } else if (type === 'track') {
                if (item.album && item.album.images && item.album.images.length > 0)
                    return item.album.images[0].url;
                else
                    return getters.notFoundImage;
            } else if (type === 'search') {
                console.warn("Tried getting image for search");
                return '';
            } else if (type === 'radio') {
                console.warn("Tried getting image for radio");
                return '';
            } else if (type === 'liked') {
                return getters.likedImage;
            } else {
                if (item.images.length > 0)
                    return item.images[0].url;
                else
                    return type === 'user' ? getters.notFoundUser : getters.notFoundImage;
            }
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
            return encodeURIComponent(name.toLowerCase().replace(/ /gi, '-').slice(0, 36));
        },
        relativeItemUrl: (state, getters) => item => {
            let type = item.type || 'category';
            let name = type === 'user' ? item.display_name : item.name;
            if (type === 'category')
                return `${type}/${item.id}`;
            if (type === 'radio')
                return null;
            if (type === 'search')
                return item.to;
            if (type === 'liked')
                return '/library/tracks';
            return `/${type}/${getters.urlName(name)}/${item.id}`;
        },
        shareUrl: (state, getters) => item => {
            let baseUrl = state.platform.type === 'web' ?
                `${location.origin}${location.pathname}` :
                'https://ruurd.dev/vuemusic/';
            return `${baseUrl}#${getters.relativeItemUrl(item)}`;
        },
        spotifyShareUrl: (state, getters) => item => {
            let type = item.type || 'category';
            let baseUrl = 'https://open.spotify.com/';
            return `${baseUrl}${type}/${item.id}`;
        },
        isArtistFollowed: state => artist => state.library.artists.find(a => a.id === artist.id),
        isTrackFollowed: state => track => state.library.tracks.find(a => a.id === track.id),
        isPlaylistFollowed: state => playlist => state.library.playlists.find(a => a.id === playlist.id),
        isAlbumFollowed: state => album => state.library.albums.find(a => a.id === album.id),
    },
    actions: {
        initialize: async ({commit, state, dispatch}) => {
            let lsKeys = await keys();
            let getKvPair = async lsKey => {
                let value = await get(lsKey);
                let stateKey = lsKey.substring('state.'.length);
                return {key: stateKey, value};
            }
            let kvPairs = await Promise.all(lsKeys.filter(key => key.startsWith('state.')).map(getKvPair));
            kvPairs.forEach(({key, value}) => commit('setStateValue', {key, value}));

            state.platform.downloader.apiKey = state.keys.youtube;
            await dispatch('processAuth');
            await dispatch('initializeMedia');
            await dispatch('initializePlatform');
        },

        cacheAll: async ({commit, dispatch}) => {
            await Promise.all([
                dispatch('cacheState'),
                dispatch('cacheMedia'),
            ]);
        },
        cacheState: async ({state}) => {
            let cachedFields = ["auth", "homePage", "browse", "userInfo", "library", "playlist",
                "album", "artist", "category", "user", "keys"];

            await Promise.all(cachedFields.map(field => set('state.' + field, state[field])));
            console.log("State cache complete");
        },

        clearCache: async ({state, commit}) => {
            commit('dontCache');
            localStorage.clear();
            await clear();
            location.reload();
        },

        getAuthByRefreshToken: async ({state}, refreshToken) => {
            console.log('Refresh using refreshToken', refreshToken);
            let result = await (await fetch('https://accounts.spotify.com/api/token', {
                method: 'post',
                body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${state.keys.spotifyId}&client_secret=${state.keys.spotifySecret}`,
                headers: {'Content-Type': 'application/x-www-form-urlencoded',}
            })).text();
            try {
                return JSON.parse(result);
            } catch (e) {
                console.log("Error", e.message, "result = ", result);
            }
        },
        getAuthByCode: async ({state}, {redirectUrl, code}) => {
            console.log('Getting auth using code', {redirectUrl, code});
            let result = await (await fetch(`${state.authUrl}api/token`, {
                method: 'post',
                body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUrl}&client_id=` +
                    `${state.keys.spotifyId}&client_secret=${state.keys.spotifySecret}`,
                headers: {'Content-Type': 'application/x-www-form-urlencoded',}
            })).text();
            try {
                console.log(result);
                return JSON.parse(result);
            } catch (e) {
                console.log("Error", e.message, "t = ", result);
            }
        },

        spotifyLogin: async ({dispatch, commit}) => {
            let auth = await dispatch('firstLogin');
            console.log("Auth result from 'firstLogin'", auth);
            commit('auth', auth);
            await dispatch('cacheState');
            await dispatch('processAuth');
        },
        loginByRefreshToken: async ({state, dispatch, commit}) => {
            if (!state.auth.refresh) {
                console.warn("Couldn't get new token, refresh token isn't set", state.auth);
                return;
            }
            let {access_token, expires_in} = await dispatch('getAuthByRefreshToken', state.auth.refresh);
            let auth = {...state.auth};
            auth.token = access_token;
            auth.expiryDate = (+new Date) + expires_in * 1000;
            commit('auth', auth);
            await dispatch('cacheState');
            await dispatch('processAuth');
        },
        spotifyLogout: async ({state, commit, dispatch}) => {
            commit('auth', {
                code: null,
                token: null,
                refresh: null,
                expiryDate: null,
            });
            commit('userInfo', {
                id: '',
                name: '',
                mail: '',
                country: '',
                followers: 0,
                avatar: 'img/no-user.jpg',
            });
            await dispatch('cacheState');
            clearTimeout(state.timeout);
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
        share: async ({dispatch, getters}, {item, copy, urlType = 'vuemusic'}) => {
            let url = urlType === 'spotify' ? getters.spotifyShareUrl(item) : getters.shareUrl(item);
            if (navigator.share instanceof Function) {
                let type = item.type ?? 'category';
                try {
                    await navigator.share({
                        title: type.substr(0, 1).toUpperCase() + type.substr(1),
                        text: item.name ?? item.display_name,
                        url,
                    });
                } catch (e) {
                    console.warn(e)
                }
            } else {
                await copy(url);
                await dispatch('addSnack', {text: 'Share URL copied to clipboard!'});
            }
        },
        processAuth: async ({dispatch, commit, state}) => {
            let now = new Date();
            if (state.auth.expiryDate > now) {
                state.api.setAccessToken(state.auth.token);
                state.events.emit('accessToken');

                let msUntilExpire = state.auth.expiryDate - now;
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
        findPagination: ({}, object) => {
            if (object === null)
                return false;

            let getKeyPath;
            getKeyPath = ({keys: keyPath = [], o}) => {
                if (o !== null && o.hasOwnProperty('next') && o.hasOwnProperty('items'))
                    return [true, keyPath];
                if (typeof o !== 'object' || o === null)
                    return [false, keyPath.slice(0, -1)];

                for (let key in o) {
                    if (!o.hasOwnProperty(key))
                        continue;
                    let result;
                    [result, keyPath] = getKeyPath({keys: keyPath.concat(key), o: o[key]});
                    if (result)
                        return [true, keyPath];
                }
                return [false, keyPath.slice(0, -1)];
            }

            let [success, keyPath] = getKeyPath({o: object});

            if (!success)
                return false;
            return r => {
                for (let key of keyPath)
                    r = r[key];
                return r;
            }
        },
        async * retrieveSpotifyArray({state, dispatch}, apiFunction) {
            let getData = () => apiFunction()

            while (true) {
                let result = await getData();
                let pageObject = await dispatch('findPagination', result);

                if (result !== null)
                    yield result;

                if (result === null || pageObject === false || pageObject(result).next === null)
                    break;

                let nextUrl = pageObject(result).next;
                if (nextUrl === undefined)
                    console.warn("next url is undefined");

                getData = () => state.api.getGeneric(nextUrl);
            }
        },
        initializeSpotify: async ({state, commit, dispatch}) => {
            await dispatch('refreshUserInfo');
            let doneCount = 0;
            let libLoaded = state.library.tracks.length !== 0;
            let checkDone = async () => {
                doneCount++;
                if (doneCount === (libLoaded ? 3 : 4)) {
                    await dispatch('cacheState');
                }
            }
            dispatch('refreshUserData').then(checkDone);
            dispatch('refreshUserData', 'artist').then(checkDone);
            dispatch('refreshUserData', 'album').then(checkDone);
            if (!libLoaded) {
                dispatch('refreshUserData', 'track').then(checkDone);
            }
        },
        refreshUserInfo: async ({commit, state, getters}) => {
            let me = await state.api.getMe();
            commit('userInfo', {
                id: me.id,
                name: me.display_name,
                mail: me.email,
                country: me.country,
                followers: me.followers,
                avatar: me.images.length === 0 ? getters.notFoundUser : me.images[0].url,
            });
        },
        refreshUserData: async ({commit, state, dispatch}, type = 'playlist') => {
            if (!['playlist', 'album', 'track', 'artist'].includes(type))
                console.warn("Wrong type set for refreshUserData!");

            if (state.isRefreshing[type]) {
                console.info("This library type is already refreshing, waiting for that to finish");
                await dispatch('waitFor', 'refreshed' + type);
                return;
            }
            await dispatch('awaitAuth');
            commit('isRefreshing', {type, value: true});

            let isInitial = state.library[type + 's'].length === 0;

            if (state.userInfo.id === '')
                await dispatch('refreshUserInfo');

            let retrieval, page = r => r;
            switch (type) {
                case 'playlist':
                    retrieval = () => state.api.getUserPlaylists(state.userInfo.id, {limit: 50});
                    break;
                case 'album':
                    retrieval = () => state.api.getMySavedAlbums();
                    break;
                case 'artist':
                    retrieval = () => state.api.getFollowedArtists();
                    page = r => r.artists;
                    break;
                case 'track':
                    retrieval = () => state.api.getMySavedTracks({limit: 50});
                    break;
            }

            let items = [];
            let addToLib = item => {
                if (isInitial)
                    commit('addToLibrary', {type, item});
                else items.push(item);
            }

            for await(let batch of await dispatch('retrieveSpotifyArray', retrieval)) {
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
                commit('homePersonalized', personalized);
            }

            //New releases
            let newReleases = await state.api.getNewReleases({limit: 50});
            commit('homeNew', newReleases.albums.items);

            //Recently played playlists or albums
            if (localStorage.getItem('recentlyPlayed') !== null)
                commit('homeRecent', JSON.parse(localStorage.recentlyPlayed));
        },
        refreshBrowsePage: async ({dispatch, commit, state}) => {
            await dispatch('awaitAuth');

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
            await dispatch('awaitAuth');

            let retrieval = () => state.api.getPlaylist(id);
            for await(let batch of await dispatch('retrieveSpotifyArray', retrieval)) {
                if (batch.items) {
                    commit('extendPlaylist', {
                        id, tracks: batch.items
                            .map(t => t.track)
                            .filter(t => t !== null)
                    });
                } else {
                    commit('loadPlaylist', {
                        id, playlist: {
                            ...batch, tracks: batch.tracks.items
                                .map(t => t.track)
                                .filter(t => t !== null)
                        }
                    });
                }
            }
        },
        loadAlbum: async ({dispatch, commit, state}, id) => {
            await dispatch('awaitAuth');
            let retrieval = () => state.api.getAlbum(id);
            for await(let batch of await dispatch('retrieveSpotifyArray', retrieval)) {
                if (batch.items) {
                    batch.items.forEach(i => i.album = {
                        images: state.album[id].images,
                        name: state.album[id].name,
                        id: state.album[id].id,
                    });
                    commit('extendAlbum', {id, tracks: batch.items});
                } else {
                    let album = {...batch};
                    album.tracks = album.tracks.items;
                    album.tracks.forEach(i => i.album = {
                        images: album.images,
                        name: album.name,
                        id: album.id,
                    });
                    commit('loadAlbum', {id, album});
                }
            }
        },
        loadCategory: async ({state, commit, dispatch}, id) => {
            await dispatch('awaitAuth');
            if (!state.category.hasOwnProperty(id)) {
                let category = {playlists: [], ...(await state.api.getCategory(id))};
                commit('loadCategory', {id, category});
            }

            let retrieval = () => state.api.getCategoryPlaylists(id);
            for await(let batch of await dispatch('retrieveSpotifyArray', retrieval)) {
                if (batch.playlists) {
                    commit('extendCategory', {id, playlists: batch.playlists.items});
                } else {
                    commit('extendCategory', {id, playlists: batch.items});
                }
            }
        },
        loadArtist: async ({dispatch, commit, state}, id) => {
            await dispatch('awaitAuth');
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
            for await(let batch of await dispatch('retrieveSpotifyArray', retrieval)) {
                albums.push(...batch.items);
            }
            commit('loadArtistAlbums', {id, albums});
        },
        loadUser: async ({dispatch, commit, state}, id) => {
            await dispatch('awaitAuth');
            let isInitial = state.user[id] === undefined;
            let user = await state.api.getUser(id);

            if (isInitial)
                commit('loadUser', {id, user: {...user, playlists: []}});
            let playlists = (await state.api.getUserPlaylists(id, {limit: 50})).items;
            if (isInitial)
                commit('extendUser', {id, playlists});
            else
                commit('loadUser', {id, user: {...user, playlists}});
        },
        loadTrack: async ({state, dispatch}, id) => {
            await dispatch('awaitAuth');
            return await state.api.getTrack(id);
        },
        followPlaylist: async ({state, dispatch}, playlist) => {
            await state.api.followPlaylist(playlist.id);
            await dispatch('refreshUserData', 'playlist');
        },
        unfollowPlaylist: async ({state, dispatch}, playlist) => {
            await state.api.unfollowPlaylist(playlist.id);
            await dispatch('refreshUserData', 'playlist');
            await dispatch('loadUser', state.userInfo.id);
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
        toggleFollowCurrentTrack: async ({state, dispatch}) => {
            let track = state.media.track;
            if (track === null) return;

            let [saved] = await state.api.containsMySavedTracks([track.id]);
            if (saved)
                await dispatch('unfollowTrack', track);
            else
                await dispatch('followTrack', track);
            return !saved;
        },
        followTrack: async ({state, dispatch, commit}, track) => {
            await state.api.addToMySavedTracks([track.id]);
            commit('addToLibrary', {type: 'track', item: track, addAtStart: true});
        },
        unfollowTrack: async ({state, dispatch, commit}, track) => {
            await state.api.removeFromMySavedTracks([track.id]);
            commit('removeFromLibrary', {type: 'track', id: track.id});
        },
        addToPlaylist: async ({state, dispatch}, {track, playlist}) => {
            await dispatch('loadPlaylist', playlist.id);
            let existingTracks = state.playlist[playlist.id].tracks;

            if (existingTracks.findIndex(t => t.id === track.id) !== -1) {
                dispatch('addSnack', {text: 'Track is already in playlist'}).then();
                return;
            }
            try {
                await state.api.addTracksToPlaylist(playlist.id, [track.uri]);
                await dispatch('loadPlaylist', playlist.id);
                dispatch('addSnack', {text: 'Added to playlist!'}).then();
            } catch (e) {
                console.warn(e);
                dispatch('addSnack', {text: 'Could not add track to this playlist'}).then();
            }
        },
        removeFromPlaylist: async ({state, dispatch}, {track, playlist}) => {
            try {
                await state.api.removeTracksFromPlaylist(playlist.id, [track.uri]);
                await dispatch('loadPlaylist', playlist.id);
            } catch (e) {
                console.warn(e);
                dispatch('addSnack', {text: 'Could not remove track from this playlist'}).then();
            }
        },
        createPlaylist: async ({state, dispatch, commit}, name) => {
            let playlist = await state.api.createPlaylist(state.userInfo.id, {name});
            await dispatch('loadPlaylist', playlist.id);
            await dispatch('refreshUserData', 'playlist');
            return state.playlist[playlist.id];
        },
        getRadioTracks: async ({state, dispatch}, options) => {
            let firstTrack = null;
            let keys = Object.keys(options);
            if (keys.length === 1 && keys[0] === 'seed_tracks') {
                let tracks = options['seed_tracks'].split(',');
                if (tracks.length === 1)
                    firstTrack = await dispatch('loadTrack', tracks[0]);
            }
            options.limit = firstTrack ? 99 : 100;
            let radioTracks = (await state.api.getRecommendations(options)).tracks;
            if (firstTrack)
                return [firstTrack, ...radioTracks];
            return radioTracks;
        },
        getItem: async ({state, dispatch}, item) => {
            let type = item.type || 'category';
            if (item.tracks && item.tracks.length > 0)
                return item;
            if (!state[type][item.id]) {
                await dispatch('load' + type[0].toUpperCase() + type.slice(1), item.id);
            }
            return state[type][item.id];
        },
        getContextItem: async ({state, dispatch}, item) => {
            if (item.type === 'track') {
                return {...item, tracks: [item]};
            }
            if (item.tracks && item.tracks.length > 0)
                return item;
            let completeItem = await dispatch('getItem', item);
            let type = item.type || 'category';
            if (type === 'category') {
                let randomPlaylist = completeItem.playlists[Math.floor(Math.random() * completeItem.playlists.length)];
                return await dispatch('getContextItem', randomPlaylist);
            }
            if (type === 'artist') {
                return {...completeItem.artist, tracks: completeItem.tracks};
            }
            return completeItem;
        },
    },
    modules: {platform, media, search, theme}
})
