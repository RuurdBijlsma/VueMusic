<template>
    <div class="media-info">
        <v-card outlined class="media-card">
            <div class="media-album"
                 :style="{
                            backgroundImage: `url(${$store.getters.itemImage($store.state.media.track)})`,
                            webkitAppRegion: 'drag',
                         }"/>
            <div class="white-part">
                <div class="media-text-info">
                    <img v-if="!$store.getters.isTrackSet"
                         class="media-info-logo" src="../assets/logo-small-v.png"
                         alt="vm5 logo">
                    <div v-else class="media-title-artists">
                        <span :title="$store.state.media.track.name"
                              class="track-title">
                            {{$store.state.media.track.name}}
                        </span>
                        <artists-span :style="{maxWidth: smallArtists?`calc(100% - 56px)`:''}"
                                      grey class="track-artists"
                                      :artists="$store.state.media.track.artists"></artists-span>
                    </div>
                </div>
            </div>
            <media-controls class="controls"></media-controls>
        </v-card>
    </div>
</template>

<script>
    import MediaControls from "./MediaControls";
    import ArtistsSpan from "./ArtistsSpan";

    export default {
        name: "MediaInfo",
        components: {ArtistsSpan, MediaControls},
        props: {
            drag: {
                type: Boolean,
                default: false,
            },
            smallArtists: {
                type: Boolean,
                default: false,
            }
        },
    }
</script>

<style scoped>
    .media-info {
        width: 100%;
        display: inline-flex;
        min-width: 100px;
    }

    .media-card {
        display: flex;
        width: 100%;
        min-width: 100px;
    }

    .white-part {
        display: flex;
        height: 50px;
        width: calc(100% - 50px);
        min-width: 100px;
    }

    .media-album {
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        min-width: 50px;
        height: 50px;
        width: 50px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .media-text-info {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: start;
    }

    .media-info-logo {
        height: 20px;
        opacity: 0.5;
    }

    .media-title-artists {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: calc(100% - 10px);
        margin-top: 3px;
        font-size: 13px;
        min-width: 100px;
        max-width: 100%;
    }

    .track-title {
        margin-bottom: -4px;
        font-weight: bold;
        max-width: calc(100% - 25px);
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }


    .controls {
        display: none !important;
        justify-content: center;
        align-items: center;
    }

    @media (max-width: 870px) {
        .controls {
            display: flex !important;
        }
    }

    @media (max-width: 680px) {
        .controls {
            display: none !important;
        }
    }

    .media-info >>> a {
        text-decoration: none;
    }

    .media-info >>> a:hover {
        text-decoration: underline;
    }
</style>