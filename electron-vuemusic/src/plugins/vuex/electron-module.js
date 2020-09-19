import MusicDownloader from '../../js/MusicDownloader.js'
import electron, {remote} from 'electron'
import http from "http";
import Directories from "../../js/Directories";
import path from "path";

const express = window.require('express')
Directories.importLSFile();

export default {
    state: {
        type: 'electron',
        shouldSetKey: true,
        spotifyId: localStorage.getItem('spotifyId') === null ? 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' : localStorage.spotifyId,
        spotifySecret: localStorage.getItem('spotifySecret') === null ? 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' : localStorage.spotifySecret,
        youtubeKey: localStorage.getItem('youtubeKey') === null ? 'cccccccccccc-dddddddddddddddddddddddddd' : localStorage.youtubeKey,
        requestedScopes: "ugc-image-upload user-read-email user-read-private playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private user-library-modify user-library-read user-top-read user-read-recently-played user-follow-read user-follow-modify",
        server: null,
        downloader: new MusicDownloader,
        downloads: [],
        playingIcons: [],
        pausedIcons: [],
    },
    mutations: {
        playIcons: (state, {playIcon, pauseIcon, prevIcon, nextIcon}) => {
            state.playingIcons = [prevIcon, pauseIcon, nextIcon];
            state.pausedIcons = [prevIcon, playIcon, nextIcon];
        },

        downloaderKey: (state, key) => state.downloader.apiKey = key,
        spotifyId: (state, id) => {
            localStorage.spotifyId = id;
            state.spotifyId = id
        },
        spotifySecret: (state, secret) => {
            localStorage.spotifySecret = secret;
            state.spotifySecret = secret
        },
        youtubeKey: (state, key) => {
            localStorage.youtubeKey = key;
            state.youtubeKey = key
            state.downloader.apiKey = key;
        },
    },
    getters: {
        isValidKeySet: () => ({spotifyId, spotifySecret, youtubeKey}) =>
            spotifyId !== "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" &&
            spotifySecret !== "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" &&
            youtubeKey !== "cccccccccccc-dddddddddddddddddddddddddd" &&
            spotifyId.length === 32 &&
            spotifySecret.length === 32 &&
            youtubeKey.length === 39 &&
            youtubeKey.indexOf('-') === 12,
        isKeySet: (state, getters) => getters.isValidKeySet({...state})

    },
    actions: {
        _initialize: async ({state, commit, dispatch, getters, rootState}) => {
            commit('downloaderKey', state.youtubeKey);

            const likeShortcut = 'Shift+Alt+L';
            if (remote.globalShortcut.isRegistered(likeShortcut))
                remote.globalShortcut.unregister(likeShortcut);
            let regResult = remote.globalShortcut.register(likeShortcut, async () => {
                let added = await dispatch('toggleFollowCurrentTrack');
                let speech = added ? 'Added to favorites' : 'Removed from favorites';
                let voices = speechSynthesis.getVoices();
                let voice = voices[Math.floor(Math.random() * voices.length)];
                let utterance = new SpeechSynthesisUtterance(speech);
                utterance.voice = voice;
                speechSynthesis.speak(utterance);
            });


            let playIcon = {
                tooltip: 'Play',
                icon: path.join(__static, '/img/playicon.png'),
                click: () => dispatch('play'),
            };
            let pauseIcon = {
                tooltip: 'Play',
                icon: path.join(__static, '/img/pauseicon.png'),
                click: () => dispatch('pause'),
            };
            let prevIcon = {
                tooltip: 'Previous Song',
                icon: path.join(__static, '/img/previcon.png'),
                click: () => dispatch('skip', -1),
            };
            let nextIcon = {
                tooltip: 'Next Song',
                icon: path.join(__static, '/img/nexticon.png'),
                click: () => dispatch('skip', 1),
            };
            commit('playIcons', {playIcon, pauseIcon, prevIcon, nextIcon});
        },
        setPlatformPlaying: ({state}, playing) => {
            const win = remote.getCurrentWindow();
            let thumbAdded = win.setThumbarButtons(playing ? state.playingIcons : state.pausedIcons);
        },
        openDevTools: async ({}) => {
            remote.getCurrentWindow().openDevTools();
        },
        closeWindow: async ({}) => {
            remote.getCurrentWindow().close();
        },
        minimizeWindow: async ({}) => {
            remote.getCurrentWindow().minimize();
        },

        isTrackAvailableOffline: async ({state}, track) => {
            return await state.downloader.isTrackOffline(track);
        },
        downloadTrackByUrl: async ({state, commit}, {track, url}) => {
            let abortController = new AbortController();
            commit('addDownload', {track, state: 'Preparing', abortController: abortController})
            await state.downloader.downloadTrack(url, track,
                progress => commit('downloadProgress', {track, progress}),
                abortController.signal,
            );
        },
        getTrackUrls({state}, track) {
            return state.downloader.getTrackUrls(track);
        },

        resetSpotifyLogin({state, commit}) {
            if (state.server !== null) {
                state.server.close();
                commit('server', null);
            }
        },
        firstLogin: async ({getters, state, commit, dispatch}) => {
            return new Promise(async resolve => {
                if (!getters.isKeySet) {
                    console.warn("Can't log in, keys are not set");
                    return;
                }
                const port = 38900;
                const authUrl = 'https://accounts.spotify.com/';
                const redirectUrl = 'http://localhost:' + port;
                const url = `${authUrl}authorize?client_id=${state.spotifyId}&response_type=code&redirect_uri=${redirectUrl}&scope=${encodeURIComponent(state.requestedScopes)}`;
                let {shell} = electron;
                await shell.openExternal(url);

                if (state.server !== null)
                    state.server.close();

                const app = express();
                const server = http.createServer(app);

                app.get('/', async (req, res) => {
                    if (req.query.hasOwnProperty('code')) {
                        server.close()
                        commit('server', null);
                        console.log("Stopped listening on *:" + port);
                        dispatch('getAuthByCode', {redirectUrl, code: req.query.code}).then(auth => {
                            remote.getCurrentWindow().focus();
                            resolve({
                                code: req.query.code,
                                token: auth.access_token,
                                refresh: auth.refresh_token,
                                expiryDate: (+new Date) + auth.expires_in * 1000,
                            });
                        });
                    }
                    res.send(`
                        <html lang="en">
                            <head><title>Logging in...</title></head>
                            <body>
                                <script>
                                    window.close();
                                </script>
                            </body>
                        </html>
                    `);
                });

                commit('server', http);
                server.listen(port, () => {
                    console.log('listening on *:' + port);
                });
            })
        },
        getAuthByRefreshToken: async ({state}, refreshToken) => {
            console.log('Refresh using refreshToken', refreshToken);
            let result = await (await fetch('https://accounts.spotify.com/api/token', {
                method: 'post',
                body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${state.spotifyId}&client_secret=${state.spotifySecret}`,
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
            let result = await (await fetch('https://accounts.spotify.com/api/token', {
                method: 'post',
                body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUrl}&client_id=` +
                    `${state.spotifyId}&client_secret=${state.spotifySecret}`,
                headers: {'Content-Type': 'application/x-www-form-urlencoded',}
            })).text();
            try {
                return JSON.parse(result);
            } catch (e) {
                console.log("Error", e.message, "t = ", result);
            }
        }
    }
    ,
}