<template>
    <div v-if="playlist" class="track-section">
        <recycle-scroller
                class="scroller"
                :items="tracks"
                key-field="id"
                size-field="size"
                v-slot="{item, index}"
        >
            <playlist-meta class="playlist-meta" v-if="index===0" :playlist="playlist"
                           :fg-legible="fgLegible"></playlist-meta>
            <div class="scroll-item" v-else>
                <track-item
                        :no-album="hideAlbum || isAlbum"
                        :compact-menu="$store.state.windowWidth < 740"
                        :album-list="isAlbum"
                        :key="item.id"
                        :track="item"></track-item>
                <v-divider></v-divider>
            </div>
        </recycle-scroller>
    </div>
</template>

<script>
    import TrackList from "./TrackList";
    import PlaylistMeta from "./PlaylistMeta";
    import TrackItem from "./TrackItem";

    export default {
        name: "TrackSection",
        components: {PlaylistMeta, TrackList, TrackItem},
        props: {
            fgLegible: {
                type: Boolean,
                default: true,
            },
            playlist: {
                type: Object,
                default: null,
            },
        },
        computed: {
            hideAlbum() {
                let width = this.$store.state.windowWidth;
                return width < 960 || (width >= 1030 && width < 1237);
            },
            isAlbum() {
                return this.playlist.type === 'album';
            },
            tracks() {
                let tracks = this.isAlbum ?
                    this.playlist.tracks.map(t => ({...t, size: 51})) :
                    this.playlist.tracks.map(t => ({...t.track, size: 51}));
                console.log(tracks);
                return [{id: '0', size: 230}, ...tracks];
            },
        }
    }
</script>

<style scoped>
    .track-section {
        height: 100%;
        width: 100%;
    }

    .scroller {
        height: 100%;
    }

    .playlist-meta {
        padding-top: 30px;
        height: 200px;
    }


    .scroll-item {
        height: 51px;
    }

    .track-list {
        margin-top: 20px;
    }
</style>