<template>
    <div>
        <audio ref="audio"></audio>
    </div>
</template>

<script>
    export default {
        name: "MusicPlayer",
        data: () => ({
            timeInterval: -1,
        }),
        async mounted() {
            this.$store.commit('audioElement', this.$refs.audio);

            this.timeInterval = setInterval(() => {
                this.$store.commit('currentTime', this.$refs.audio.currentTime);
                if (this.$refs.audio.duration && navigator.mediaSession.hasOwnProperty('setPositionState')) {
                    navigator.mediaSession.setPositionState({
                        duration: this.$refs.audio.duration,
                        playbackRate: 1,
                        position: this.$refs.audio.currentTime,
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
                this.$refs.audio.volume = this.$store.state.media.volume;
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