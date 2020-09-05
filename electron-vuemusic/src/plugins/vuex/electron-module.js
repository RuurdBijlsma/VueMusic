export default {
    state: {
        type: 'electron',
        shouldSetKey: true,
        spotifyId: localStorage.getItem('spotifyId') === null ? 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' : localStorage.spotifyId,
        spotifySecret: localStorage.getItem('spotifySecret') === null ? 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' : localStorage.spotifySecret,
        youtubeKey: localStorage.getItem('youtubeKey') === null ? 'cccccccccccc-dddddddddddddddddddddddddd' : localStorage.youtubeKey,
        requestedScopes: "ugc-image-upload user-read-email user-read-private playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private user-library-modify user-library-read user-top-read user-read-recently-played user-follow-read user-follow-modify",
        server: null,
    },
    mutations: {
        spotifyId: (state, id) => {
            console.log("setting spotify id to", id);
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
        _initialize: async ({commit}) => {
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
                let {shell} = window.require('electron');
                await shell.openExternal(url);

                if (state.server !== null)
                    state.server.close();

                const app = window.require('express')();
                const http = window.require('http').createServer(app);

                app.get('/', async (req, res) => {
                    if (req.query.hasOwnProperty('code')) {
                        http.close()
                        commit('server', null);
                        console.log("Stopped listening on *:" + port);
                        dispatch('getAuthByCode', {redirectUrl, code: req.query.code}).then(auth => {
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
                http.listen(port, () => {
                    console.log('listening on *:' + port);
                });
            })
        },
        getAuthByRefreshToken: async ({state}, refreshToken) => {
            console.log('refresh');
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
            console.log({redirectUrl, code});
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