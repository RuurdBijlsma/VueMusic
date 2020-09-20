<template>
    <div v-if="playlist" class="track-section">
        <recycle-scroller
                ref="scroller"
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
                <v-divider class="mr-1 ml-1"></v-divider>
                <track-row
                        :context-item="playlist"
                        :no-album="hideAlbum || isAlbum"
                        :compact-menu="compactMenu"
                        :album-list="isAlbum"
                        :key="item.id"
                        :track="item"></track-row>
            </div>
        </recycle-scroller>
    </div>
</template>

<script>
    import PlaylistMeta from "./PlaylistMeta";
    import TrackRow from "./TrackRow";

    export default {
        name: "TrackSection",
        components: {TrackRow, PlaylistMeta},
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
            highlightId: {
                type: String,
                default: undefined,
            },
        },
        data: () => ({
            hasHighlighted: false,
        }),
        mounted() {
            this.highlight();
        },
        methods: {
            async highlight() {
                if (this.highlightId !== undefined && this.playlist && this.playlist.tracks) {
                    let index = this.playlist.tracks.findIndex(t => t.id === this.highlightId)
                    if (index !== -1 && this.hasHighlighted === false) {
                        this.hasHighlighted = true;
                        this.$refs.scroller.scrollToItem(index + 1);
                    }
                }
            },
        },
        watch: {
            'playlist.tracks'() {
                this.highlight();
            },
        },
        computed: {
            compactMenu() {
                return (this.$store.state.windowWidth < 759 && this.$store.state.windowWidth > 680) || this.$store.state.windowWidth < 430;
            },
            hideAlbum() {
                let width = this.$store.state.windowWidth;
                return width < 960 || (width >= 1030 && width < 1237);
            },
            isAlbum() {
                return this.playlist.type === 'album';
            },
            tracks() {
                let tracks = this.playlist.tracks.map(t => ({...t, size: 51}));
                let artHeight = this.showArt ? 380 : 0;
                let descriptionHeight = this.isAlbum || this.playlist.description.length === 0 ? 0 : 80;
                let metaHeight = 150;
                let artistHeight = this.isAlbum ? 36 : 0;
                let dividerHeight = 1;
                return [{
                    id: '0',
                    size: artHeight + descriptionHeight + metaHeight + artistHeight + dividerHeight
                }, ...tracks];
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
            padding-right: 10px;
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