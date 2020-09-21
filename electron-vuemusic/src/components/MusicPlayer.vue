<template>
    <div>
    </div>
</template>

<script>
    export default {
        name: "MusicPlayer",
        data: () => ({
            timeInterval: -1,
        }),
        async mounted() {
            this.timeInterval = setInterval(() => {
                let audio = this.$store.state.media.audio;

                if (!this.$store.state.media.trackLoading)
                    this.$store.commit('currentTime', audio.currentTime);
                if (audio.duration && navigator.mediaSession.hasOwnProperty('setPositionState')) {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        playbackRate: 1,
                        position: audio.currentTime,
                    });
                }
            }, 1000 / 30);

            this.handleVolume();
            if (this.$store.getters.isTrackSet)
                await this.$store.dispatch('setTrack', this.$store.state.media.track);
        },
        beforeDestroy() {
            clearInterval(this.timeInterval);
        },
        methods: {
            handleVolume() {
                let audio = this.$store.state.media.audio;
                audio.volume = this.$store.state.media.volume;
            }
        },
        watch: {
            async '$store.state.media.track'() {
                await this.$store.dispatch('setTrack', this.$store.state.media.track);
            },
            '$store.state.media.volume'() {
                this.handleVolume();
            },
        }
    }
</script>

<style scoped>

</style>