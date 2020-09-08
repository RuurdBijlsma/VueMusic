<template>
    <playlist-page type="album" :id="id" :playlist="playlist" ref="playlistPage"></playlist-page>
</template>

<script>
    import TrackList from "../components/TrackList";
    import TrackSection from "../components/TrackSection";
    import PlaylistPage from "../components/PlaylistPage";

    export default {
        name: "Album",
        components: {PlaylistPage, TrackSection, TrackList},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch('loadAlbum', this.id);
        },
        computed: {
            id() {
                return this.$route.query.id;
            },
            playlist() {
                console.log('Album', this.$store.state.album[this.id]);
                return this.$store.state.album[this.id]
            },
        },
        watch: {
            async '$route.query'() {
                this.$refs.playlistPage.revertThemeColor();
                await this.$store.dispatch('loadAlbum', this.id);
            },
        },
        beforeRouteLeave(to, from, next) {
            this.$refs.playlistPage.revertThemeColor();
            next();
        },
    }
</script>