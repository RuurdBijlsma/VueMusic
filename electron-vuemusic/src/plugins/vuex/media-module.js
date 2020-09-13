import Utils from "../../js/Utils";

export default {
    state: {
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
        shuffle: (state, shuffle) => state.shuffle = shuffle,
        repeat: (state, repeat) => state.repeat = repeat,
        track: (state, {track, contextItem}) => {
            state.track = track;
            if (state.contextItem === null || (
                state.contextItem.id !== contextItem.id &&
                state.contextItem.type !== contextItem.type
            )) {
                state.contextItem = contextItem;
                state.queue = contextItem.tracks;
                state.shuffledQueue = Utils.shuffleArray([...contextItem.tracks]);
            }
        },

        cacheAllMedia: state => {
            let cachedFields = ["track", "queue", "shuffledQueue", "contextItem", "shuffle", "repeat"];
            let cache = {};
            for (let field of cachedFields)
                cache[field] = state[field];
            localStorage.mediaStateCache = JSON.stringify(cache);

            console.log("Media state cache complete");
        },
    },
    getters: {
        isTrackSet: state => {
            return state.track !== null;
        },
        durationHms: state => {
            return Utils.secondsToHms(state.track.duration_ms / 1000);
        },
        currentTimeHms: state => {
            return Utils.secondsToHms(state.currentTime);
        },
        progress: state => {
            if (!state.track.duration_ms)
                return 0;
            return state.currentTime / (state.track.duration_ms / 1000);
        }
    },
    actions: {}
}