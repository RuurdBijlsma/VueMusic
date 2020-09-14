<template>
    <div class="playlist-meta">
        <glow-image :size="imageSize" v-if="showArt" :url="$store.getters.itemImage(playlist)"
                    class="art-section"></glow-image>
        <h2 class="name">{{playlist.name}}</h2>
        <h2 class="album-artist" v-if="isAlbum"
            :title="playlist.artists.map(t=>t.name).join(', ')">
            <span v-for="(artist, index) in playlist.artists" :key="artist.id">
            <router-link class="artist-link"
                         :to="$store.getters.relativeItemUrl(artist)">{{artist.name}}</router-link><span
                    v-if="index < playlist.artists.length - 1">, </span>
            </span>
        </h2>
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
                    <span>Created by </span><router-link class="user-link"
                                                         :to="$store.getters.relativeItemUrl(playlist.owner)"
                >{{playlist.owner.display_name}}</router-link>
                </span>
                <span class="dot">•</span>
            </span>
            <span>{{playlist.tracks.length}} tracks</span>
            <span class="dot">•</span>
            <span>{{fullDuration}}</span>
            <span v-if="playlist.followers">
                <span class="dot">•</span>
                <span>{{playlist.followers.total}} followers</span>
            </span>
        </p>
        <div class="buttons">
            <div>
                <v-btn class="play-button" small :color="fgLegible ? 'primary' : 'default'"
                       @click="$store.dispatch('playItem', {item: playlist})">
                    <v-icon small class="mr-2">mdi-play</v-icon>
                    Play
                </v-btn>
                <v-btn v-if="playlist.tracks.length > 1" small :color="fgLegible ? 'primary' : 'default'"
                       @click="$store.dispatch('playItem', {item: playlist, shuffle: true})">
                    <v-icon small class="mr-2">mdi-shuffle</v-icon>
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
    import GlowImage from "./GlowImage";

    export default {
        name: "PlaylistMeta",
        components: {GlowImage, ItemMenu, FollowMenuItem, FollowButton, ShareMenuItem},
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
        methods: {},
        computed: {
            releaseYear() {
                if (this.isAlbum) {
                    return new Date(this.playlist.release_date).getFullYear();
                }
                return 0;
            },
            tracks() {
                return this.playlist.tracks;
            },
            isAlbum() {
                return this.playlist.type === 'album';
            },
            fullDuration() {
                if (this.tracks.length === 0)
                    return Utils.secondsToHms(0);
                return Utils.secondsToHms(this.tracks.map(t => t.duration_ms / 1000).reduce((a, b) => a + b));
            },
            imageSize() {
                let width = this.$store.state.windowWidth;
                if (width < 1030)
                    return 350;
                if (width < 1287)
                    return 250;
                if (width < 1450)
                    return 300;
                return 350;
            },
        }
    }
</script>

<style scoped>
    .art-section {
        margin-top: 30px;
        margin-right: 30px;
        margin-bottom: 30px;
        width: 100% !important;
    }

    .name {
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .album-artist {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .artist-link {
        text-decoration: none;
        font-weight: 400;
    }

    .artist-link:hover {
        text-decoration: underline;
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

    .user-link {
        text-decoration: none;
    }

    .user-link:hover {
        text-decoration: underline;
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
</style>