<template>
    <div class="top-tracks">
        <div class="track-grid-item" v-for="track in tracks" :key="track.id">
            <v-divider class="divider"></v-divider>
            <track-item :context-item="contextItem" :track="track" :album-list="false" menu></track-item>
        </div>
    </div>
</template>

<script>
    import TrackItem from "./TrackItem";

    export default {
        name: "TrackGrid",
        components: {TrackItem},
        props: {
            tracks: {
                type: Array,
                default: () => [],
            },
            contextItem: {
                type: Object,
                default: null,
            },
        }
    }
</script>

<style scoped>
    .top-tracks {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 6px 17px;
        flex-grow: 1;
    }

    .divider {
        margin-bottom: 6px;
    }
</style>