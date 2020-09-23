import NodeMusicDownloader from '../../js/music-downloader/NodeMusicDownloader'
import electron, {remote} from 'electron'
import http from "http";
import Directories from "../../js/Directories";
import path from "path";

const express = window.require('express')
Directories.importLSFile();

export default {
    state: {
        type: 'electron',
        server: null,
        downloader: new NodeMusicDownloader(Directories.music, Directories.files, Directories.temp),
        downloads: [],
        playingIcons: [],
        pausedIcons: [],
    },
    mutations: {
        playIcons: (state, {playIcon, pauseIcon, prevIcon, nextIcon}) => {
            state.playingIcons = [prevIcon, pauseIcon, nextIcon];
            state.pausedIcons = [prevIcon, playIcon, nextIcon];
        },
    },
    getters: {},
    actions: {
        initializePlatform: async ({state, commit, dispatch, getters, rootState}) => {
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
            if (regResult)
                console.log("Registered global shortcut ✔")
            else
                console.log("Failed to register global shortcut ❌")


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

        exportCache: ({}) => {
            Directories.exportLSToFile();
        },

        resetSpotifyLogin({state, commit}) {
            if (state.server !== null) {
                state.server.close();
                commit('server', null);
            }
        },
        firstLogin: async ({rootState, getters, state, commit, dispatch}) => {
            return new Promise(async resolve => {
                if (!getters.isKeySet) {
                    console.warn("Can't log in, keys are not set");
                    return;
                }
                const port = 38900;
                const redirectUrl = 'http://localhost:' + port;
                const url = `${rootState.authUrl}authorize?client_id=${rootState.keys.spotifyId}&response_type=code&redirect_uri=${redirectUrl}&scope=${encodeURIComponent(rootState.requestedScopes)}`;
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
    },
}