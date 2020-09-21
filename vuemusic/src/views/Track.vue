<template>
    <div>
        <p v-if="!this.$route.params.id">No track id specified</p>
    </div>
</template>

<script>
    export default {
        name: "Track",
        async mounted() {
            if (this.$route.params.id) {
                let track = await this.$store.dispatch('loadTrack', this.$route.params.id);
                let albumUrl = this.$store.getters.relativeItemUrl(track.album);
                await this.$router.push(`${albumUrl}/${track.id}`);
            }
        }
    }
</script>

<style scoped>

</style>