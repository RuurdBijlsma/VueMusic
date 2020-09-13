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
                <v-btn @click="showPlaylistInput=true" v-if="!showPlaylistInput" icon small title="Create new playlist"
                       class="add-playlist">
                    <v-icon x-small>mdi-plus</v-icon>
                </v-btn>
                <v-btn @click="showPlaylistInput=false" small text v-else>Cancel</v-btn>
            </div>
            <v-form v-if="showPlaylistInput" @submit.prevent="createPlaylist"
                    class="create-playlist">
                <v-text-field autofocus :rules="playlistRules" label="Playlist name" outlined dense
                              v-model="playlistName"></v-text-field>
                <v-btn icon type="submit" :loading="createLoading">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-form>

            <v-list-item v-for="playlist in $store.state.library.playlists" :key="playlist.id"
                         :to="$store.getters.relativeItemUrl(playlist)" exact>
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
        data: () => ({
            showPlaylistInput: false,
            playlistRules: [
                v => v.length > 0 || "Name can't be empty",
            ],
            playlistName: '',
            createLoading: false,
        }),
        mounted() {
        },
        methods: {
            async createPlaylist() {
                this.createLoading = true;
                let playlist = await this.$store.dispatch('createPlaylist', this.playlistName);
                this.createLoading = false;
                this.showPlaylistInput = false;
                this.playlistName = '';
                await this.$router.push($store.getters.relativeItemUrl(playlist));
            }
        },
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

    .create-playlist {
        display: flex;
    }

    .create-playlist > *:last-child {
        margin-top: 2px;
    }
</style>