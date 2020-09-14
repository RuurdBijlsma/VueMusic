import Utils from "../../js/Utils";

export default {
    state: {
        recentlyPlayed: [],
        track: null,
        currentTime: 0,
        queue: [],
        shuffledQueue: [],
        contextItem: null,
        shuffle: false,
        repeat: true,

        ...(localStorage.getItem('mediaStateCache') === null ? {} : JSON.parse(localStorage.mediaStateCache)),
    },
    mutations: {
        toggleShuffle: state => state.shuffle = !state.shuffle,
        toggleRepeat: state => state.repeat = !state.repeat,
        shuffle: (state, shuffle) => state.shuffle = shuffle,
        repeat: (state, repeat) => state.repeat = repeat,
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
                    if (index !== -1) {
                        console.log("Removing index", index, 'from', state.recentlyPlayed);
                        state.recentlyPlayed.splice(index, 1);
                    }
                    console.log('adding recently played item', contextItem, state.recentlyPlayed.length);
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

        cacheAllMedia: state => {
            let cachedFields = ["recentlyPlayed", "track", "queue", "shuffledQueue", "contextItem", "shuffle", "repeat"];
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
            commit('track', {track: startTrack, contextItem: context});
            commit('shuffle', shuffle);
        },
    },
}