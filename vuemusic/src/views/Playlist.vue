<template>
    <playlist-page :id="id" :playlist="playlist" ref="playlistPage"></playlist-page>
</template>

<script>
    import PlaylistPage from "../components/PlaylistPage";

    export default {
        name: "Playlist",
        components: {PlaylistPage},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch('loadPlaylist', this.id);
        },
        computed: {
            id() {
                return this.$route.params.id;
            },
            playlist() {
                console.log('Playlist', this.$store.state.playlist[this.id]);
                return this.$store.state.playlist[this.id]
            },
        },
        watch: {
            async '$route.params.id'() {
                await this.$store.dispatch('leavePage');
                await this.$store.dispatch('loadPlaylist', this.id);
            },
        },
        beforeRouteLeave(to, from, next) {
            this.$store.dispatch('leavePage');
            next();
        },
    }
</script>