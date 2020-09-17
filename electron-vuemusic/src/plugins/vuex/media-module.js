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

        ...(localStorage.getItem('mediaStateCache') === null ? {} : JSON.parse(localStorage.mediaStateCache)),
    },
    mutations: {
        local: (state, local) => state.local = local,
        trackLoading: (state, trackLoading) => state.trackLoading = trackLoading,
        volume: (state, volume) => state.volume = volume,
        seekTo: (state, percentage) => state.audio.currentTime = state.audio.duration * percentage,
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

        cacheAllMedia: state => {
            let cachedFields = ["recentlyPlayed", "track", "queue", "shuffledQueue", "contextItem", "shuffle", "repeat", "volume"];
            let cache = {};
            for (let field of cachedFields)
                cache[field] = state[field];
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
            return Utils.secondsToHms(state.track.duration_ms / 1000);
        },
        currentTimeHms: state => {
            return Utils.secondsToHms(state.currentTime);
        },
        progress: (state) => {
            if (!state.track.duration_ms)
                return 0;
            return state.currentTime / (state.track.duration_ms / 1000);
        },
    },
    actions: {
        async setTrack({dispatch, state, commit}, track) {
            dispatch('setMetadata', track);
            commit('trackLoading', true);
            state.audio.src = '';
            for await(let {url, local} of await dispatch('getTrackUrls', track)) {
                commit('local', local);

                let success = await dispatch('setTrackUrl', url);
                if (success) {
                    commit('trackLoading', false);
                    if (!local)
                        await dispatch('downloadTrackByUrl', {track, url});
                    break;
                }
            }
        },
        async setTrackUrl({dispatch, state, commit}, url) {
            return new Promise((resolve, reject) => {
                let playAfterLoad = state.playAfterLoad;
                commit('playAfterLoad', false);

                console.log('state.audio.src', url);
                state.audio.src = url;
                let loadTimeout = setTimeout(() => {
                    //if url doesn't load in time, go next url
                    console.warn("can't play");
                    resolve(false);
                }, 3500);
                state.audio.onloadedmetadata = () => {
                    commit('duration', state.audio.duration);
                };
                state.audio.onended = () => dispatch('skip', 1);
                state.audio.onplay = () => {
                    // navigator.mediaSession.playbackState = 'playing';
                    // this.win.setThumbarButtons(this.playingIcons);
                    commit('playing', true);
                };
                state.audio.onpause = () => {
                    // navigator.mediaSession.playbackState = 'paused';
                    // this.win.setThumbarButtons(this.pausedIcons);
                    commit('playing', false);
                };
                state.audio.oncanplay = async () => {
                    clearTimeout(loadTimeout);
                    if (playAfterLoad)
                        await dispatch('play');
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
            document.title = 'VueMusic ' + track.name + ' - ' + artistsString;

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
                console.log('Warning! The "stop" media session action is not supported.');
            }

            try {
                navigator.mediaSession.setActionHandler('seekto', (event) => {
                    commit('seekTo', event.seekTime / state.duration);
                });
            } catch (error) {
                console.log('Warning! The "seekto" media session action is not supported.');
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