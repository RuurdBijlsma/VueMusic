<template>
    <vue-custom-scrollbar class="nav-bar">
        <div class="nav-top">
            <div class="logo">
                <img class="logo-image" src="../assets/full-black-medium.png" alt="logo image"/>
                <span>
                    Vue Music
                </span>
            </div>
            <v-text-field
                    outlined
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    dense
                    class="search-input"
            ></v-text-field>
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
            <v-list-item to="browse" exact>
                <v-list-item-icon>
                    <v-icon color="primary">mdi-grid-large</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Browse</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-subheader>Library</v-subheader>
            <v-list-item to="artists">
                <v-list-item-icon>
                    <v-icon color="primary">mdi-microphone-variant</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Artists</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item to="albums">
                <v-list-item-icon>
                    <v-icon color="primary">mdi-record-circle-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Albums</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item to="songs">
                <v-list-item-icon>
                    <v-icon color="primary">mdi-music-note</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Songs</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-subheader v-if="$store.state.library.playlists.length > 0">Playlists</v-subheader>
            <v-list-item v-for="playlist in $store.state.library.playlists" :key="playlist.id"
                         :to="`/playlist?id=${playlist.id}`" exact>
                <v-list-item-icon>
                    <v-icon>mdi-playlist-music</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{playlist.name}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </vue-custom-scrollbar>
</template>

<script>
    import vueCustomScrollbar from 'vue-custom-scrollbar'

    export default {
        name: "NavBar",
        components: {vueCustomScrollbar},
        data: () => ({
            userPlaylists: ['360 Dance', 'Housewerk', 'Rock This']//zet dit in vuex
        })
    }
</script>

<style scoped>
    .nav-bar {
        height:100%;
    }

    .nav-top {
    }

    .logo {
        margin-top: 2px;
        margin-left: 2px;
        padding: 15px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        -webkit-app-region: drag;
    }

    .logo-image {
        height: 20px;
        margin-right: 10px;
        pointer-events: none;
    }

    .search-input {
        margin: 15px !important;
        margin-bottom: 0 !important;
    }
</style>