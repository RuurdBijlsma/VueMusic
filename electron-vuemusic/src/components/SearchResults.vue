<template>
    <div v-if="result" class="search-result">
        <div class="padded start-pad">
            <h3 v-if="result.artists.length > 0">Artists</h3>
        </div>
        <item-row v-if="result.artists.length > 0" :items="result.artists"></item-row>
        <div class="padded">
            <v-divider v-if="result.artists.length > 0"></v-divider>
            <h3 v-if="result.albums.length > 0">Albums</h3>
        </div>
        <item-row v-if="result.albums.length > 0" :items="result.albums"></item-row>
        <div class="padded">
            <v-divider v-if="result.albums.length > 0"></v-divider>
            <h3 v-if="result.tracks.length > 0">Tracks</h3>
            <track-grid v-if="result.tracks.length > 0" :tracks="result.tracks" class="end-pad"
                        :context-item="context"></track-grid>
            <v-divider v-if="result.tracks.length > 0"></v-divider>
            <h3 v-if="result.playlists.length > 0">Playlists</h3>
        </div>
        <item-row v-if="result.playlists.length > 0" :items="result.playlists"></item-row>
    </div>
</template>

<script>
    import ItemRow from "./ItemRow";
    import TrackGrid from "./TrackGrid";

    export default {
        name: "SearchResults",
        components: {TrackGrid, ItemRow},
        props: {
            result: {
                type: Object,
                default: null,
            }
        },
        data: () => ({
            id: Math.random(),
        }),
        methods: {},
        computed: {
            term() {
                return this.result.term;
            },
            context() {
                return {
                    type: "search",
                    name: `Tracks from search term "${this.term}"`,
                    id: "search" + this.id,
                    term: this.term,
                    to: this.$route.fullPath,
                    tracks: this.result.tracks
                };
            }
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