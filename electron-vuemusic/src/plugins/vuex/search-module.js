import Vue from 'vue'

export default {
    state: {
        liveTerm: '',
        term: '',
        results: {},
        recent: localStorage.getItem('recentSearch') === null ?
            [] : JSON.parse(localStorage.recentSearch),
    },
    mutations: {
        searchTerm: (state, searchResult) => {
            state.term = searchResult.term;
            if (state.recent.includes(state.term))
                state.recent.splice(state.recent.indexOf(state.term), 1);
            state.recent = [state.term, ...state.recent.slice(0, 5)];
            localStorage.recentSearch = JSON.stringify(state.recent);
            Vue.set(state.results, searchResult.term, searchResult);
        },
        liveTerm: (state, liveTerm) => state.liveTerm = liveTerm,
    },
    getters: {},
    actions: {
        search: async ({state, commit, rootState}, term) => {
            let result = await rootState.api.search(term, ['album', 'artist', 'playlist', 'track']);
            commit('searchTerm', {
                term,
                albums: result.albums.items,
                artists: result.artists.items,
                playlists: result.playlists.items,
                tracks: result.tracks.items,
            });
        },
    }
}