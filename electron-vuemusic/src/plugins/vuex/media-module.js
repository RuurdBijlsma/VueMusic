import Utils from "../../js/Utils";

export default {
    state: {
        track: {
            name: 'Lefty',
            artists: [{id: 'ad89', name: 'XYLO'}, {id: '89d0', name: 'K.Flay'}],
            duration: 100,
            progressSeconds: 35.32,
            favorite: false,
            offline: true,
        },
        queueTracks: [],
        shuffle: localStorage.getItem('shuffle') === null ? false : localStorage.shuffle,
        repeat: localStorage.getItem('shuffle') === null ? true : localStorage.shuffle,

    },
    mutations: {
        shuffle: (state, shuffle) => state.shuffle = shuffle,
        repeat: (state, repeat) => state.repeat = repeat,
        track: (state, track) => state.track = track,
        queueTracks: (state, queueTracks) => state.queueTracks = queueTracks,
    },
    getters: {
        isTrackSet: state => {
            return state.track.name !== '';
        },
        durationHms: state => {
            return Utils.secondsToHms(state.track.duration);
        },
        progressHms: state => {
            return Utils.secondsToHms(state.track.progressSeconds);
        },
        progress: state => {
            if (!state.track.duration)
                return 0;
            if (state.track.progressSeconds === null || state.track.progressSeconds === undefined)
                return 0;
            return state.track.progressSeconds / state.track.duration;
        }
    },
    actions: {}
}