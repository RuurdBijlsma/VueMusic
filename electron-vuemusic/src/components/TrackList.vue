<template>
    <div class="track-list" ref="trackList">
        <v-divider></v-divider>
        <recycle-scroller
                class="scroller"
                :items="tracks"
                :item-size="51"
                :buffer="300"
                key-field="id"
                v-slot="{item}"
        >
            <div class="scroll-item">
                <track-item
                        :no-album="noAlbum || albumList"
                        :compact-menu="compactMenu"
                        :album-list="albumList"
                        :key="item.id"
                        :track="item"></track-item>
                <v-divider></v-divider>
                <!--                {{item.name}}-->
            </div>
        </recycle-scroller>
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
            console.log(this.$refs.trackList);
        },
    }
</script>

<style scoped>
    .scroller {
        height: 100%;
        position: relative;
        display: block;
    }

    .scroll-item {
        display: block;
        height: 51px;
    }
</style>