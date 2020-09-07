<template>
    <div>
        <track-item v-for="track in tracks" :key="track.id" :track="track.track"></track-item>
    </div>
</template>

<script>
    import TrackItem from "./TrackItem";

    export default {
        name: "TrackList",
        components: {TrackItem},
        props: {
            tracks: {
                type: Array,
                default: () => [],
            }
        },
        data: () => ({}),
        mounted() {
            console.log("Tracks", this.tracks);
        }
    }
</script>

<style scoped>

</style>