<template>
    <div class="now-playing" ref="nowPlaying">
        <v-sheet class="left" v-if="track">
            <div class="blur-background" :style="{backgroundImage: `url(${image})`}"></div>
            <div class="media">
                <div class="media-container">
                    <div class="media-center">
                        <glow-image :size="$store.state.windowWidth < 400 ? 200 : 300" class="album-image"
                                    :url="image"></glow-image>
                        <div class="track-info">
                            <span class="track-title">{{track.name}}</span>
                            <artists-span class="track-artists" :artists="track.artists" grey></artists-span>
                        </div>
                        <media-seek class="seek"></media-seek>
                        <media-controls :fg-legible="$store.state.theme.fgLegible"
                                        class="controls" full
                                        large></media-controls>
                    </div>
                </div>
                <div class="fsb-container">
                    <v-btn title="Toggle fullscreen" @click="toggleFullScreen" icon small class="fullscreen-button">
                        <v-icon>mdi-fullscreen</v-icon>
                    </v-btn>
                    <v-btn title="Close queue list" v-if="mountQueue && !hideQueue" @click="hideQueue = true" icon small
                           class="fullscreen-button">
                        <v-icon>mdi-menu-right</v-icon>
                    </v-btn>
                    <v-btn title="Open queue list" v-else-if="mountQueue" @click="hideQueue = false" icon small
                           class="fullscreen-button">
                        <v-icon>mdi-menu-left</v-icon>
                    </v-btn>
                </div>
            </div>
        </v-sheet>
        <queue-list ref="list" class="queue" v-if="mountQueue" v-show="!hideQueue"
                    :height="'100%'"></queue-list>
    </div>
</template>

<script>
    import QueueList from "../components/QueueList";
    import GlowImage from "../components/GlowImage";
    import MediaControls from "../components/MediaControls";
    import ArtistsSpan from "../components/ArtistsSpan";
    import MediaSeek from "../components/MediaSeek";
    import Utils from "../js/Utils";

    export default {
        name: "NowPlaying",
        components: {MediaSeek, ArtistsSpan, MediaControls, GlowImage, QueueList},
        data: () => ({
            hideQueue: localStorage.getItem('hideNPQueue') === null ? false : JSON.parse(localStorage.hideNPQueue),
        }),
        mounted() {
            this.$store.dispatch('setThemeToItem', this.track);
        },
        methods: {
            toggleFullScreen() {
                if (!document.fullscreenElement) {
                    this.$refs.nowPlaying.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            },
            scrollToItem() {
                this.intervals.push(setInterval(() => {
                    if (this.$refs.list) {
                        this.$refs.list.scrollToItem();
                        this.clearIntervals();
                    }
                }, 50));
            },
        },
        watch: {
            hideQueue() {
                localStorage.hideNPQueue = this.hideQueue;
                if (this.hideQueue === false) {
                    this.$refs.list.scrollToItem();
                }
            },
            track() {
                this.$store.dispatch('setThemeToItem', this.track);
            },
        },
        computed: {
            mountQueue() {
                return this.$store.state.windowWidth >= 1080;
            },
            track() {
                return this.$store.state.media.track;
            },
            image() {
                return this.$store.getters.itemImage(this.track);
            },
        },
        beforeRouteLeave(to, from, next) {
            this.$store.dispatch('leavePage');
            next();
        },
    }
</script>

<style scoped>
    .now-playing {
        height: 100%;
        display: flex;
        justify-content: space-between;
    }

    .left {
        flex-grow: 1;
    }

    .blur-background {
        width: 100%;
        height: 100%;
        position: relative;

        background-position: center 0;
        background-repeat: no-repeat;
        background-size: 120%;
        filter: blur(30px);
        mask-image: linear-gradient(to top, transparent 10%, black 95%);
    }

    .media {
        width: 100%;
        height: 100%;
        position: relative;
        top: -100%;
    }

    .media-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        overflow-y: auto;
    }

    @media (max-height: 705px) {
        .media-container {
            justify-content: flex-start !important;
        }

        .album-image {
            margin-top: 15px !important;
        }

        .controls {
            margin-bottom: 15px !important;
        }
    }

    .fsb-container {
        width: calc(100% - 5px);
        display: flex;
        justify-content: flex-end;
        height: 0;
        margin-top: -38px;
    }

    .fullscreen-button {
        opacity: 0.4;
        z-index: 3;
    }

    .fullscreen-button:hover {
        opacity: 0.8;
    }

    .media-center {
        max-width: 700px;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 15px;
    }

    .album-image {
        margin: 0 0 20px;
        box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.7);
    }

    .track-info {
        text-align: center;
        margin: 20px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .seek {
        width: 350px;
    }

    @media (max-width: 400px) {
        .seek {
            width: 270px;
        }
    }

    .track-title {
        font-size: 28px;
        font-weight: 400;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 450px;
    }

    @media (max-width: 500px) {
        .track-title {
            max-width: 450px;
        }
    }

    @media (max-width: 400px) {
        .track-title {
            max-width: 350px;
        }
    }

    @media (max-width: 300px) {
        .track-title {
            max-width: 250px;
        }
    }

    .controls {
        margin: 20px 0 0;
    }

    .queue {
        min-width: 400px;
        max-width: 400px;
    }
</style>