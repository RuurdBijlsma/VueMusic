<template>
    <div v-if="playlist">
        <playlist-meta :playlist="playlist" :fg-legible="fgLegible"></playlist-meta>
        <div class="track-list">
            <track-list :compact-menu="$store.state.windowWidth < 740"
                        :no-album="hideAlbum"
                        :album-list="isAlbum"
                        :tracks="tracks"></track-list>
        </div>
    </div>
</template>

<script>
    import TrackList from "./TrackList";
    import PlaylistMeta from "./PlaylistMeta";

    export default {
        name: "TrackSection",
        components: {PlaylistMeta, TrackList},
        props: {
            fgLegible: {
                type: Boolean,
                default: true,
            },
            playlist: {
                type: Object,
                default: null,
            },
        },
        computed: {
            hideAlbum() {
                let width = this.$store.state.windowWidth;
                return width < 960 || (width >= 1030 && width < 1237);
            },
            isAlbum() {
                return this.playlist.type === 'album';
            },
            tracks() {
                return this.isAlbum ? this.playlist.tracks : this.playlist.tracks.map(t => t.track)
            },
        }
    }
</script>

<style scoped>
    .track-list {
        margin-top: 20px;
    }
</style>