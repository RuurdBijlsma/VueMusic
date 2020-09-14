import Utils from "../../js/Utils";

export default {
    state: {
        trackIndex: -1,
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
        track: (state, {trackIndex, contextItem}) => {
            state.trackIndex = trackIndex;
            if (contextItem === undefined)
                return;
            if (state.contextItem === null ||
                state.contextItem.id !== contextItem.id ||
                state.contextItem.type !== contextItem.type
            ) {
                state.contextItem = contextItem;
                state.queue = contextItem.tracks;
                state.shuffledQueue = Utils.shuffleArray([...contextItem.tracks]);
            }
        },

        cacheAllMedia: state => {
            let cachedFields = ["trackIndex", "queue", "shuffledQueue", "contextItem", "shuffle", "repeat"];
            let cache = {};
            for (let field of cachedFields)
                cache[field] = state[field];
            localStorage.mediaStateCache = JSON.stringify(cache);

            console.log("Media state cache complete");
        },
    },
    getters: {
        track: state => {
            if (state.trackIndex === -1)
                return null;
            return state.queue[state.trackIndex];
        },
        isTrackSet: state => {
            return state.trackIndex !== -1;
        },
        durationHms: (state, getters) => {
            return Utils.secondsToHms(getters.track.duration_ms / 1000);
        },
        currentTimeHms: state => {
            return Utils.secondsToHms(state.currentTime);
        },
        progress: (state, getters) => {
            if (!getters.track.duration_ms)
                return 0;
            return state.currentTime / (getters.track.duration_ms / 1000);
        }
    },
    actions: {}
}