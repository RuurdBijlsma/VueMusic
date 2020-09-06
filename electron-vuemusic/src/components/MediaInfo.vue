<template>
    <div class="media-info">
        <v-card outlined class="media-card">
            <div v-if="false" class="media-album"/>
            <div class="empty-album">
                <v-icon class="empty-album-icon">mdi-music</v-icon>
            </div>
            <div class="white-part">
                <div class="media-text-info">
                    <img class="media-info-logo" src="../assets/logo-small-v.png" alt="vm5 logo">
                </div>
            </div>
            <media-controls class="controls"></media-controls>
        </v-card>
    </div>
</template>

<script>
    import MediaControls from "./MediaControls";

    export default {
        name: "MediaInfo",
        components: {MediaControls}
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
        align-items: center;
    }

    .media-info-logo {
        height: 20px;
        opacity: 0.5;
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

    @media (max-width: 645px) {
        .controls {
            display: none !important;
        }
    }
</style>