import Utils from "../../js/Utils";

export default {
    state: {
        recentlyPlayed: [],
        track: null,
        local: false,
        currentTime: 0,
        duration: 1,
        playing: false,
        queue: [],
        shuffledQueue: [],
        contextItem: null,
        shuffle: false,
        repeat: true,
        downloads: [],
        playAfterLoad: false,
        volume: 1,
        trackLoading: true,
        shouldDownload: true,
        audio: document.createElement('audio'),
        backupAudio: document.createElement('audio'),

        ...(localStorage.getItem('mediaStateCache') === null ? {} : JSON.parse(localStorage.mediaStateCache)),
    },
    mutations: {
        swapAudios: (state) => [state.audio, state.backupAudio] = [state.backupAudio, state.audio],
        local: (state, local) => state.local = local,
        trackLoading: (state, trackLoading) => state.trackLoading = trackLoading,
        volume: (state, volume) => state.volume = volume,
        seekTo: (state, percentage) => {
            if (state.audio.duration)
                state.audio.currentTime = state.audio.duration * percentage;
        },
        duration: (state, duration) => state.duration = duration || 0,
        currentTime: (state, currentTime) => state.currentTime = currentTime || 0,
        playing: (state, playing) => state.playing = playing,
        audioElement: (state, audio) => state.audio = audio,

        addDownload: (state, download) => {
            let existing = state.downloads.findIndex(d => d.track.id === download.track.id);
            if (existing !== -1)
                state.downloads[existing] = download;
            else
                state.downloads.push(download)
        },
        downloadProgress: (state, {track, progress}) => state.downloads.find(t => t.track.id === track.id).state = progress,
        removeDownload: (state, track) => {
            let index = state.downloads.findIndex(t => t.track.id === track.id);
            if (index !== -1)
                state.downloads.splice(index, 1);
        },

        toggleShuffle: state => state.shuffle = !state.shuffle,
        toggleRepeat: state => state.repeat = !state.repeat,
        shuffle: (state, shuffle) => state.shuffle = shuffle,
        repeat: (state, repeat) => state.repeat = repeat,
        playAfterLoad: (state, playAfterLoad) => state.playAfterLoad = playAfterLoad,
        track: (state, {track, contextItem}) => {
            state.track = track;
            if (contextItem === undefined)
                return;
            // Replace contextItem when
            if (state.contextItem === null || //No context item is set
                state.contextItem.id !== contextItem.id || //The ID of the new context is different
                state.contextItem.type !== contextItem.type || //The type of the new context is different
                state.queue.findIndex(t => t.id === track) === -1 //The new track is not in the current queue
            ) {
                if (contextItem.type !== 'radio' && contextItem.type !== 'search') {
                    let index = state.recentlyPlayed.findIndex(i => i.id === contextItem.id);
                    if (index !== -1)
                        state.recentlyPlayed.splice(index, 1);
                    state.recentlyPlayed.unshift(contextItem);
                    state.recentlyPlayed = state.recentlyPlayed.slice(0, 10);
                }

                state.contextItem = contextItem;
                state.queue = contextItem.tracks;
                state.shuffledQueue = Utils.shuffleArray([...contextItem.tracks]);
            }
        },
        playNext: (state, tracks) => {
            let queues = [state.queue, state.shuffledQueue];
            //Add tracks as "Play next" to both queues, remove duplicate tracks
            for (let queue of queues) {
                let currentIndex = queue.findIndex(t => t.id === state.track.id);
                for (let track of tracks) {
                    let index = queue.findIndex(t => t.id === track.id);
                    if (index === currentIndex)
                        continue;
                    if (index !== -1)
                        queue.splice(index, 1);
                    queue.splice(currentIndex + 1, 0, track);
                }
            }
        },
        addToQueue: (state, tracks) => {
            let queues = [state.queue, state.shuffledQueue];
            //Add tracks as "Play next" to both queues, remove duplicate tracks
            for (let queue of queues) {
                let currentIndex = queue.findIndex(t => t.id === state.track.id);
                for (let track of tracks) {
                    let index = queue.findIndex(t => t.id === track.id);
                    if (index === currentIndex)
                        continue;
                    if (index !== -1)
                        queue.splice(index, 1);
                    queue.push(track);
                }
            }
        },
        removeFromQueue: (state, track) => {
            if (track.id === state.track.id)
                return;
            let index = state.queue.findIndex(t => t.id === track.id);
            let indexShuffle = state.shuffledQueue.findIndex(t => t.id === track.id);
            if (index !== -1)
                state.queue.splice(index, 1);
            if (indexShuffle !== -1)
                state.shuffledQueue.splice(indexShuffle, 1);
        },
        clearQueue: (state) => {
            state.queue = [state.track];
            state.shuffledQueue = [state.track];
        },

        cacheMedia: state => {
            let cachedFields = ["shouldDownload", "recentlyPlayed", "track", "queue",
                "shuffledQueue", "contextItem", "shuffle", "repeat", "volume"];
            let cache = {};
            for (let field of cachedFields) {
                if (field === 'library') {
                    let lib = state[field];
                    lib.tracks = lib.tracks.map(Utils.reduceTrackSize);
                    cache[field] = lib;
                } else {
                    cache[field] = state[field];
                }
            }
            localStorage.mediaStateCache = JSON.stringify(cache);
            console.log("Media state cache complete");
        },
    },
    getters: {
        trackIndex: (state, getters) => {
            return getters.isTrackSet ? getters.currentQueue.findIndex(t => t.id === state.track.id) : -1
        },
        currentQueue: state => {
            return state.shuffle ? state.shuffledQueue : state.queue;
        },
        isTrackSet: state => {
            return state.track !== null;
        },
        durationHms: (state) => {
            return Utils.secondsToHms(state.duration);
        },
        currentTimeHms: state => {
            return Utils.secondsToHms(state.currentTime);
        },
        progress: (state) => {
            if (!state.duration)
                return 0;
            return state.currentTime / state.duration;
        },
    },
    actions: {
        initializeMedia: ({state, dispatch}) => {
            dispatch('initAudios');
        },

        isTrackAvailableOffline: async ({rootState}, track) => {
            return await rootState.platform.downloader.isTrackOffline(track);
        },
        removeCached: async ({rootState, commit}, track) => {
            await rootState.platform.downloader.removeCached(track);
        },
        downloadTrackByUrl: async ({rootState, state, commit}, {track, url}) => {
            if (!state.shouldDownload)
                return;

            let abortController = new AbortController();
            commit('addDownload', {track, state: 'Preparing', abortController: abortController})
            await rootState.platform.downloader.downloadTrack(url, track,
                progress => commit('downloadProgress', {track, progress}),
                abortController.signal,
            );
        },
        getTrackUrls({rootState}, track) {
            return rootState.platform.downloader.getTrackUrls(track);
        },

        async setTrack({dispatch, state, commit}, track) {
            dispatch('setMetadata', track);
            commit('trackLoading', true);
            commit('currentTime', 0);
            await dispatch('pause');
            for await(let {url, local} of await dispatch('getTrackUrls', track)) {
                if (state.track.id !== track.id)
                    return; // Don't set src when track has been skipped while loading

                commit('local', local);
                let success = await dispatch('setTrackUrl', url);
                if (success) {
                    commit('trackLoading', false);
                    if (!local)
                        await dispatch('downloadTrackByUrl', {track, url});
                    return;
                } else {
                    if (local) {
                        await dispatch('removeCached', track);
                    }
                }
            }
            // Failed to load track
            await dispatch('skip', 1);
        },
        initAudios({state, commit, dispatch}) {
            for (let audio of [state.audio, state.backupAudio]) {
                audio.onloadedmetadata = () => {
                    if (audio === state.audio)
                        commit('duration', audio.duration);
                };
                audio.onended = () => {
                    if (audio === state.audio)
                        dispatch('skip', 1);
                }
                audio.onplay = () => {
                    if (audio === state.audio) {
                        navigator.mediaSession.playbackState = 'playing';
                        dispatch('setPlatformPlaying', true);
                        commit('playing', true);
                    }
                };
                audio.onpause = () => {
                    if (audio === state.audio) {
                        navigator.mediaSession.playbackState = 'paused';
                        dispatch('setPlatformPlaying', false);
                        commit('playing', false);
                    }
                };
            }
        },
        async setTrackUrl({dispatch, state, commit}, url) {
            return new Promise((resolve, reject) => {
                let playAfterLoad = state.playAfterLoad;
                commit('playAfterLoad', false);

                console.log("🎵 Now playing 🎵", url)
                commit('swapAudios');
                console.log("Commit currenttime to ", 0);
                state.backupAudio.pause();
                state.audio.src = url;
                if (playAfterLoad)
                    state.audio.play();

                let loadTimeout = setTimeout(() => {
                    //if url doesn't load in time, go next url
                    console.warn("can't play");
                    resolve(false);
                }, 3500);
                let canplayFired = false;
                state.backupAudio.oncanplay = () => 0;
                state.audio.oncanplay = async () => {
                    if (canplayFired)
                        return;
                    canplayFired = true; //Don't run this when seeking through a track, which also fires oncanplay

                    clearTimeout(loadTimeout);
                    resolve(true);
                }
            });
        },
        async play({state}) {
            if (state.audio.paused)
                await state.audio.play();
        },
        async pause({state}) {
            if (!state.audio.paused)
                await state.audio.pause();
        },
        async skip({state, getters, commit, dispatch}, n) {
            if (n === -1 && state.currentTime > 5) {
                state.audio.currentTime = 0;
                return;
            }

            let newIndex = getters.trackIndex + n;
            if (newIndex >= state.queue.length)
                if (state.repeat)
                    newIndex -= state.queue.length;
                else
                    return await dispatch('pause');
            if (newIndex < 0)
                if (state.repeat)
                    newIndex += state.queue.length;
                else
                    return await dispatch('pause');

            commit('playAfterLoad', true);
            commit('track', {track: getters.currentQueue[newIndex]});
        },
        setMetadata({dispatch, getters, state, commit}, track) {
            let artistsString = track.artists.map(a => a.name).join(', ');
            document.title = 'Vue Music • ' + track.name + ' - ' + artistsString;

            if (!('mediaSession' in navigator))
                return;

            let artwork = [{
                src: getters.notFoundImage,
                type: 'image/png',
                sizes: '512x512',
            }];
            if (track.album.images.length > 0)
                artwork = track.album.images.map(i => ({
                    src: i.url,
                    type: 'image/png',
                    sizes: `${i.width}x${i.height}`,
                }));

            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.name,
                artist: artistsString,
                album: track.album.name,
                artwork
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                dispatch('skip', -1);
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                dispatch('skip', 1);
            });

            let defaultSkipTime = 10;
            navigator.mediaSession.setActionHandler('seekbackward', (event) => {
                const skipTime = event.seekOffset || defaultSkipTime;
                state.audio.currentTime = Math.max(state.audio.currentTime - skipTime, 0);
            });

            navigator.mediaSession.setActionHandler('seekforward', (event) => {
                const skipTime = event.seekOffset || defaultSkipTime;
                state.audio.currentTime = Math.min(state.audio.currentTime + skipTime, state.audio.duration);
            });

            navigator.mediaSession.setActionHandler('play', () => {
                dispatch('play');
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                dispatch('pause');
            });

            try {
                navigator.mediaSession.setActionHandler('stop', () => {
                    dispatch('pause');
                });
            } catch (error) {
                console.warn('Warning! The "stop" media session action is not supported.');
            }

            try {
                navigator.mediaSession.setActionHandler('seekto', (event) => {
                    commit('seekTo', event.seekTime / state.duration);
                });
            } catch (error) {
                console.warn('Warning! The "seekto" media session action is not supported.');
            }
        },

        playItem: async ({state, commit, dispatch}, {item, shuffle = false}) => {
            let context = await dispatch('getContextItem', item);
            if (!context.tracks || context.tracks.length === 0) {
                return dispatch("addSnack", {text: "This item has no tracks"});
            }
            let startTrack;
            if (shuffle)
                startTrack = context.tracks[Math.floor(Math.random() * context.tracks.length)];
            else
                startTrack = context.tracks[0];
            if (item.type === 'track')
                console.warn("Setting track item as context item, this should probably not happen");

            commit('playAfterLoad', true);
            commit('track', {contextItem: context, track: startTrack});
            commit('shuffle', shuffle);
        },
    },
}