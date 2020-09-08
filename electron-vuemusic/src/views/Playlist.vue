<template>
    <playlist-page :id="id" :playlist="playlist" ref="playlistPage"></playlist-page>
</template>

<script>
    import TrackList from "../components/TrackList";
    import TrackSection from "../components/TrackSection";
    import PlaylistPage from "../components/PlaylistPage";

    export default {
        name: "Playlist",
        components: {PlaylistPage, TrackSection, TrackList},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch('loadPlaylist', this.id);
        },
        computed: {
            id() {
                return this.$route.query.id;
            },
            playlist() {
                console.log('Playlist', this.$store.state.playlist[this.id]);
                return this.$store.state.playlist[this.id]
            },
        },
        beforeRouteLeave(to, from, next) {
            this.$refs.playlistPage.revertThemeColor();
            next();
        },
    }
</script>