<template>
    <div class="playlist-meta">
        <div class="art-section art-center" v-if="showArt">
            <div class="album-art album-background"
                 :style="{
                    backgroundImage: `url(${image})`,
                    opacity: $vuetify.theme.dark ? 0.4 : 0.7,
                 }"></div>
            <div class="album-art album-normal" :style="{backgroundImage: `url(${image})`}"></div>
        </div>
        <h2 class="name">{{playlist.name}}</h2>
        <p class="sub-caption">
            <span v-if="isAlbum">
                <span title="Year of release">{{releaseYear}}</span>
                <span class="dot">•</span>
            </span>
            <span v-if="isAlbum && playlist.genres.length>0">
                <span>{{playlist.genres.join('/')}}</span>
                <span class="dot">•</span>
            </span>
            <span v-else-if="!isAlbum">
                <span>
                    Created by <span class="primary--text">{{playlist.owner.display_name}}</span>
                </span>
                <span class="dot">•</span>
            </span>
            <span>{{playlist.tracks.length}} tracks</span>
            <span class="dot">•</span>
            <span>{{fullDuration}}</span>
        </p>
        <div class="buttons">
            <div>
                <v-btn class="play-button" small :color="fgLegible ? 'primary' : 'default'">
                    <v-icon>mdi-play</v-icon>
                    Play
                </v-btn>
                <v-btn v-if="playlist.tracks.length > 1" small :color="fgLegible ? 'primary' : 'default'">
                    <v-icon small>mdi-shuffle</v-icon>
                    Shuffle
                </v-btn>
            </div>
            <div class="right-buttons">
                <follow-button :item="playlist"></follow-button>
                <item-menu :item="playlist"></item-menu>
            </div>
        </div>
        <p v-if="!isAlbum" class="description" v-html="playlist.description"></p>
    </div>
</template>

<script>
    import Utils from "../js/Utils";
    import ShareMenuItem from "./ShareMenuItem";
    import FollowButton from "./FollowButton";
    import FollowMenuItem from "./FollowMenuItem";
    import ItemMenu from "./ItemMenu";

    export default {
        name: "PlaylistMeta",
        components: {ItemMenu, FollowMenuItem, FollowButton, ShareMenuItem},
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
        data: () => ({}),
        async mounted() {
        },
        methods: {
            async sharePlaylist() {
                let url = 'https://whaturlshouldthisbe.com/spotify?or=vuemusic';
                await this.$store.dispatch('share', {url, copy: this.$copyText});
            },
            deletePlaylist() {

            },
        },
        computed: {
            releaseYear() {
                if (this.isAlbum) {
                    return new Date(this.playlist.release_date).getFullYear();
                }
                return 0;
            },
            tracks() {
                return this.isAlbum ? this.playlist.tracks : this.playlist.tracks.map(t => t.track)
            },
            isAlbum() {
                return this.playlist.type === 'album';
            },
            fullDuration() {
                if (this.tracks.length === 0)
                    return Utils.secondsToHms(0);
                return Utils.secondsToHms(this.tracks.map(t => t.duration_ms / 1000).reduce((a, b) => a + b));
            },
            image() {
                if (this.playlist.images.length > 0)
                    return this.playlist.images[0].url;
                return this.$store.getters.notFoundImage;
            }
        }
    }
</script>

<style scoped>
    .art-section {
        margin-top: 30px;
        width: 350px;
        margin-right: 30px;
        display: flex;
        justify-content: center;
    }

    .art-center {
        margin-bottom: 30px;
        width: 100% !important;
    }

    .album-art {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        min-width: 350px;
        height: 350px;
        border-radius: 5px;
    }

    .album-background {
        filter: blur(20px);
        transform: scale(0.95);
        position: relative;
        right: -175px;
        top: 20px;
    }

    .album-normal {
        position: relative;
        left: -175px;
    }

    .name {
        font-weight: bold;
    }

    .sub-caption {
        text-transform: uppercase;
        font-size: 12px;
        font-weight: bolder;
        opacity: 0.7;
    }

    .dot {
        margin: 0 10px;
    }

    .buttons {
        align-items: center;
        display: flex;
        justify-content: space-between;
    }

    .play-button {
        margin-right: 10px;
    }

    .right-buttons {
        display: flex;
    }

    .description {
        font-size: 14px;
        max-width: 500px;
        margin: 20px 0;
        margin-bottom: 0px;
    }

    .track-list {
        margin-top: 20px;
    }
</style>