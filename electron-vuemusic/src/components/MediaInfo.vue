<template>
    <div class="media-info">
        <v-card outlined class="media-card">
            <div v-if="false" class="media-album"/>
            <div class="empty-album">
                <v-icon class="empty-album-icon">mdi-music</v-icon>
            </div>
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
                        <artists-span grey class="track-artists" :artists="$store.state.media.track.artists"></artists-span>
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
        components: {ArtistsSpan, MediaControls}
    }
</script>

<style scoped>
    .media-card {
        display: flex;
    }

    .white-part {
        display: flex;
        height: 50px;
        flex-grow: 1;
    }

    .media-album {
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        min-width: 48px;
        width: 48px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        background-image: url("../assets/notfound.png");
    }

    .empty-album {
        border-top-left-radius: 2px !important;
        border-bottom-left-radius: 2px;
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.1);
    }

    .empty-album-icon {
        opacity: 0.2;
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

    @media (max-width: 670px) {
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