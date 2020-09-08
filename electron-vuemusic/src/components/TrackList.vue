<template>
    <div>
        <div v-for="(track, i) in tracks">
            <v-divider v-if="i===0"></v-divider>
            <track-item
                    :no-album="noAlbum || albumList"
                    :key="track.id"
                    :compact-menu="compactMenu"
                    :album-list="albumList"
                    :track="track"></track-item>
            <v-divider></v-divider>
        </div>
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
            },
            noAlbum: {
                type: Boolean,
                default: false,
            },
            compactMenu: {
                type: Boolean,
                default: false,
            },
            albumList: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({}),
        mounted() {

        }
    }
</script>

<style scoped>

</style>