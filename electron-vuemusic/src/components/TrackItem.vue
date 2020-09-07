<template>
    <div class="track-item" v-if="track!==null">
        <div class="track-left">
            <div class="album-art" :style="{backgroundImage: `url(${image})`}"></div>
            <div class="track-info">
                <div class="track-title" :title="track.name">{{track.name}}</div>
                <div class="track-artist">
                    <artists-span grey class="artists-span" :artists="track.artists"></artists-span>
                </div>
            </div>
        </div>
        <div v-if="!noAlbum" class="track-album" :title="track.album.name">
            <router-link class="album-link" tag="span" :to="`/album?id=${track.album.id}`">{{track.album.name}}
            </router-link>
        </div>
        <div class="track-right">
            <div class="track-duration">{{duration}}</div>
            <v-btn icon>
                <v-icon>mdi-heart-outline</v-icon>
            </v-btn>
            <v-btn icon>
                <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";
    import Utils from "../js/Utils";

    export default {
        name: "TrackItem",
        components: {ArtistsSpan},
        props: {
            track: {
                type: Object,
                default: null,
            },
            noAlbum: {
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
            duration() {
                return Utils.secondsToHms(this.track.duration_ms / 1000);
            }
        }
    }
</script>

<style scoped>
    .track-item {
        display: flex;
        padding: 5px;
        font-size: 14px;
        justify-content: space-between;
        align-items: center;
    }

    .track-left {
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
        max-width: 250px;
    }

    .artists-span >>> a {
        text-decoration: none;
        opacity: 0.7;
    }

    .track-album {
        flex-grow: 1;
        width: 100%;
        opacity: 0.7;
        max-width: 200px;
        margin-right: 15px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        font-weight: 500;
    }

    .album-link {
        cursor: pointer;
    }

    .album-link:hover {
        text-decoration: underline;
    }

    .track-right {
        display: flex;
        align-items: center;
    }

    .track-duration {
        margin-right: 15px;
    }
</style>