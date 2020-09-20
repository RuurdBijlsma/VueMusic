import BrowserMusicDownloader from "../../js/music-downloader/BrowserMusicDownloader";

export default {
    state: {
        type: 'web',
        channel: null,
        downloads: [],
        playingIcons: [],
        pausedIcons: [],
        downloader: new BrowserMusicDownloader(),
    },
    mutations: {
        channel: (state, channel) => state.channel = channel,
    },
    getters: {},
    actions: {
        exportCache() {
            //Not needed
        },

        initializePlatform: async ({state, commit, dispatch, getters, rootState}) => {
        },
        setPlatformPlaying: ({state}, playing) => {
        },

        resetSpotifyLogin({state, commit}) {
            if (state.channel !== null) {
                state.channel.close();
                commit('server', null);
            }
        },
        firstLogin: async ({rootState, getters, state, commit, dispatch}) => {
            return new Promise(async resolve => {
                if (!getters.isKeySet) {
                    console.warn("Can't log in, keys are not set");
                    return;
                }
                let redirectUrl = location.origin + (location.pathname + (location.pathname.endsWith('/') ? '' : '/') + '#/login').replace(/\/\//gi, '/');
                console.log("REDIRECT URL:", redirectUrl);
                redirectUrl = encodeURIComponent(redirectUrl);
                const url = `${rootState.authUrl}authorize?client_id=${rootState.spotifyId}&response_type=code&redirect_uri=${redirectUrl}&scope=${encodeURIComponent(rootState.requestedScopes)}`;
                window.open(url);

                if (state.channel)
                    state.channel.close();
                let channel = new BroadcastChannel('loginCode');
                commit('channel', channel);
                channel.onmessage = msg => {
                    channel.close();
                    commit('channel', null);

                    dispatch('getAuthByCode', {redirectUrl, code: msg.data}).then(auth => {
                        resolve({
                            code: msg.data,
                            token: auth.access_token,
                            refresh: auth.refresh_token,
                            expiryDate: (+new Date) + auth.expires_in * 1000,
                        });
                    });
                }
            });
        },
    },
}