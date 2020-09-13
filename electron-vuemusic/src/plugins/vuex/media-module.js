import Utils from "../../js/Utils";

export default {
    state: {
        track: null,
        currentTime: 0,
        queue: [],
        shuffledQueue: [],
        contextItem: null,
        shuffle: localStorage.getItem('shuffle') === null ? false : localStorage.shuffle,
        repeat: localStorage.getItem('repeat') === null ? true : localStorage.repeat,

    },
    mutations: {
        shuffle: (state, shuffle) => state.shuffle = shuffle,
        repeat: (state, repeat) => state.repeat = repeat,
        track: (state, track) => state.track = track,
        queue: (state, queue) => {
            state.queue = queue
            state.shuffledQueue = Utils.shuffleArray([...queue]);
        },
    },
    getters: {
        isTrackSet: state => {
            return state.track!==null;
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