<template>
    <div v-if="playlist" class="track-section">
        <recycle-scroller
                class="scroller"
                :items="tracks.filter(t=>!t.is_local)"
                key-field="id"
                size-field="size"
                v-slot="{item, index}"
        >
            <playlist-meta :style="{paddingTop: showArt?'0':'30px'}" class="playlist-meta" :show-art="showArt"
                           v-if="index===0" :playlist="playlist"
                           :fg-legible="fgLegible"></playlist-meta>
            <!--            <v-divider></v-divider>-->
            <div class="scroll-item" v-if="index>0">
                <track-row
                        :no-album="hideAlbum || isAlbum"
                        :compact-menu="compactMenu"
                        :album-list="isAlbum"
                        :key="item.id"
                        :track="item"></track-row>
                <v-divider></v-divider>
            </div>
        </recycle-scroller>
    </div>
</template>

<script>
    import TrackList from "./TrackList";
    import PlaylistMeta from "./PlaylistMeta";
    import TrackRow from "./TrackRow";

    export default {
        name: "TrackSection",
        components: {TrackRow, PlaylistMeta, TrackList},
        props: {
            fgLegible: {
                type: Boolean,
                default: true,
            },
            playlist: {
                type: Object,
                default: null,
            },
            showArt: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            compactMenu() {
                return (this.$store.state.windowWidth < 759 && this.$store.state.windowWidth > 680) || this.$store.state.windowWidth < 455;
            },
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
                let artHeight = this.showArt ? 380 : 0;
                let descriptionHeight = this.isAlbum || this.playlist.description.length === 0 ? 0 : 80;
                let metaHeight = 150;
                let dividerHeight = 1;
                return [{id: '0', size: artHeight + descriptionHeight + metaHeight + dividerHeight}, ...tracks];
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
        padding-right: 30px;
    }

    @media (max-width: 680px) {
        .scroller {
            padding-right: 5px;
        }
    }

    .playlist-meta {
        /*height: 230px;*/
    }


    .scroll-item {
        height: 51px;
    }

    @media (max-width: 1030px) {
        .track-section {
            margin-top: 0;
        }

        /*.playlist-meta {*/
        /*    height: 100px;*/
        /*}*/
    }
</style>