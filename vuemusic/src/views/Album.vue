<template>
    <playlist-page :highlight-id="$route.params.trackId" type="album" :id="id" :playlist="playlist"
                   ref="playlistPage"></playlist-page>
</template>

<script>
    import TrackSection from "../components/TrackSection";
    import PlaylistPage from "../components/PlaylistPage";

    export default {
        name: "Album",
        components: {PlaylistPage, TrackSection},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch('loadAlbum', this.id);
            if (this.$route.params.trackId !== undefined) {
                console.log(this.$route.params);
                let trackId = this.$route.params.trackId;
                if (this.$store.getters.isTrackSet && trackId === this.$store.state.media.track.id) {
                    return this.$store.dispatch('play');
                }
                let track = this.playlist.tracks.find(t => t.id === trackId);
                this.$store.commit('playAfterLoad', true);
                this.$store.commit('track', {
                    track,
                    contextItem: this.playlist
                });
            }
        },
        computed: {
            id() {
                return this.$route.params.id;
            },
            playlist() {
                console.log('Album', this.$store.state.album[this.id]);
                return this.$store.state.album[this.id]
            },
        },
        watch: {
            async '$route.params.id'() {
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