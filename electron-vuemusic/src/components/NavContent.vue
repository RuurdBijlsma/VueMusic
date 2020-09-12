<template>
    <perfect-scrollbar class="nav-bar">
        <div class="nav-top">
            <logo></logo>
            <search-input class="search-input"></search-input>
        </div>

        <v-list dense nav class="py-0">
            <v-list-item to="/" exact>
                <v-list-item-icon>
                    <v-icon color="primary">mdi-play-circle-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Listen Now</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item to="/browse" exact>
                <v-list-item-icon>
                    <v-icon color="primary">mdi-grid-large</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Browse</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-subheader>Library</v-subheader>
            <v-list-item to="/artists">
                <v-list-item-icon>
                    <v-icon color="primary">mdi-microphone-variant</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Artists</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item to="/albums">
                <v-list-item-icon>
                    <v-icon color="primary">mdi-record-circle-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Albums</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item to="/tracks">
                <v-list-item-icon>
                    <v-icon color="primary">mdi-music-note</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Tracks</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <div class="playlist-header" v-if="$store.state.library.playlists.length > 0">
                <v-subheader>Playlists</v-subheader>
                <v-btn icon small title="Create new playlist" class="add-playlist">
                    <v-icon small>mdi-plus</v-icon>
                </v-btn>
            </div>
            <v-list-item v-for="playlist in $store.state.library.playlists" :key="playlist.id"
                         :to="`/playlist/${$store.getters.urlName(playlist.name)}/${playlist.id}`" exact>
                <v-list-item-icon>
                    <v-icon>mdi-playlist-music</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{playlist.name}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </perfect-scrollbar>
</template>

<script>
    import Logo from "./Logo";
    import SearchInput from "./SearchInput";

    export default {
        name: "NavContent",
        components: {SearchInput, Logo},
        data: () => ({}),
        mounted() {
        },
        methods: {},
        watch: {},
    }
</script>

<style scoped>
    .nav-bar {
        height: 100%;
        width: 100%;
    }

    .playlist-header {
        display: flex;
        /*justify-content: space-between;*/
        align-items: center;
    }

    .search-input {
        margin: 15px !important;
        margin-bottom: 0 !important;
    }

    .add-playlist {
        opacity: 0.7;
    }
</style>