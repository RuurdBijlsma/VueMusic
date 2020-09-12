<template>
    <div v-if="result" class="search-result">
        <div class="padded start-pad">
            <h3 v-if="result.artists.length > 0">Artists</h3>
        </div>
        <album-row v-if="result.artists.length > 0" :albums="result.artists"></album-row>
        <div class="padded">
            <v-divider v-if="result.artists.length > 0"></v-divider>
            <h3 v-if="result.albums.length > 0">Albums</h3>
        </div>
        <album-row v-if="result.albums.length > 0" :albums="result.albums"></album-row>
        <div class="padded">
            <v-divider v-if="result.albums.length > 0"></v-divider>
            <h3 v-if="result.tracks.length > 0">Tracks</h3>
            <tracks-grid v-if="result.tracks.length > 0" :tracks="result.tracks" class="end-pad"></tracks-grid>
            <v-divider v-if="result.tracks.length > 0"></v-divider>
            <h3 v-if="result.playlists.length > 0">Playlists</h3>
        </div>
        <album-row v-if="result.playlists.length > 0" :albums="result.playlists"></album-row>
    </div>
</template>

<script>
    import AlbumRow from "./AlbumRow";
    import TracksGrid from "./TracksGrid";

    export default {
        name: "SearchResults",
        components: {TracksGrid, AlbumRow},
        props: {
            result: {
                type: Object,
                default: null,
            }
        },
        methods: {},
        computed: {
            compact(){
                return this.$store.state.windowWidth <= 680;
            },
            term() {
                return this.results.term;
            },
        },
        watch: {
            result() {
                console.log("Search result", this.result);
            },
        },
    }
</script>

<style scoped>
    .search-result h3 {
        margin: 5px 0;
    }

    .padded {
        padding: 0 30px;
    }

    .end-pad {
        padding-bottom: 30px;
    }

    .start-pad {
        padding-top: 15px;
    }
</style>