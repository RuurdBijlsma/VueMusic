<template>
    <div class="media-info" v-if="$store.state.media.track">
        <v-card outlined class="media-card">
            <div class="media-album"
                 @click="$router.push('/nowplaying')"
                 v-ripple
                 :style="{
                            backgroundImage: `url(${$store.getters.itemImage($store.state.media.track)})`,
                         }"/>
            <div class="white-part">
                <div class="media-text-info">
                    <div class="media-title-artists">
                        <span :title="$store.state.media.track.name"
                              class="track-title">
                            {{$store.state.media.track.name}}
                        </span>
                        <artists-span :style="{maxWidth: smallArtists?`calc(100% - 56px)`:''}"
                                      grey class="track-artists"
                                      :artists="$store.state.media.track.artists"></artists-span>
                    </div>
                </div>
                <div class="local-icon">
                    <v-icon :small="$store.state.windowWidth >= 1000" v-if="$store.state.media.local">
                        mdi-cloud-download-outline
                    </v-icon>
                    <v-icon :small="$store.state.windowWidth >= 1000" v-else>mdi-radio-tower</v-icon>
                </div>
            </div>
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
        cursor: pointer;
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
        width: calc(100% - 24px);
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    @media (max-width: 1000px) {
        .media-text-info {
            width: calc(100% - 36px);
        }

        .local-icon {
            width: 36px !important;
            padding-top: 12px !important;
            opacity: 0.8 !important;
        }
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

    .media-info >>> a {
        text-decoration: none;
    }

    .media-info >>> a:hover {
        text-decoration: underline;
    }

    .local-icon {
        width: 24px;
        height: 100%;
        padding-top: 10px;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        opacity: 0.6;
    }
</style>