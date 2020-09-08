<template>
    <div class="track-item" v-if="track!==null">
        <div v-if="!albumList" class="album-art" :style="{backgroundImage: `url(${image})`}"></div>
        <div v-else class="album-number">{{track.track_number}}</div>
        <div class="track-info">
            <div class="track-title" :title="track.name">{{track.name}}</div>
            <div class="track-artist">
                <artists-span grey class="artists-span" :artists="track.artists"></artists-span>
            </div>
        </div>
    </div>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";

    export default {
        name: "TrackItem",
        components: {ArtistsSpan},
        props: {
            track: {
                type: Object,
                default: null,
            },
            albumList: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            image() {
                if (this.track.hasOwnProperty('album') && this.track.album.images.length > 0) {
                    return this.track.album.images[0].url;
                }
                return 'img/notfound.png';
            },
        }
    }
</script>

<style scoped>
    .track-item {
        display: flex;
        flex-grow: 10;
        align-items: center;
        max-width: 300px;
    }

    .album-art {
        min-width: 40px;
        height: 40px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 5px;
    }

    .album-number {
        height: 40px;
        text-align: center;
        line-height: 40px;
        vertical-align: center;
        font-weight: bold;
        font-size: 14px;
        opacity: 0.5;
    }

    .track-info {
        margin-left: 15px;
        line-height: 17px;
    }

    .track-title {
        font-weight: bold;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        max-width: 245px;
    }
</style>