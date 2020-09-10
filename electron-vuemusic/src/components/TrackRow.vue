<template>
    <div class="track-row" v-if="track!==null">
        <track-item :track="track" :album-list="albumList"></track-item>
        <div v-if="!noAlbum" class="track-album" :title="track.album.name">
            <router-link class="album-link" tag="span"
                         :to="`/album/${$store.getters.urlName(track.album.name)}/${track.album.id}`">
                {{track.album.name}}
            </router-link>
        </div>
        <div class="track-right">
            <div v-if="!compactMenu" class="track-duration">{{duration}}</div>
            <v-menu>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-on="on">
                        <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <share-menu-item :item="track"></share-menu-item>
                    <follow-menu-item :item="track"></follow-menu-item>
                </v-list>
            </v-menu>
        </div>
    </div>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";
    import Utils from "../js/Utils";
    import TrackItem from "./TrackItem";
    import FollowButton from "./FollowButton";
    import ShareMenuItem from "./ShareMenuItem";
    import FollowMenuItem from "./FollowMenuItem";

    export default {
        name: "TrackRow",
        components: {FollowMenuItem, ShareMenuItem, FollowButton, TrackItem, ArtistsSpan},
        props: {
            track: {
                type: Object,
                default: null,
            },
            noAlbum: {
                type: Boolean,
                default: false,
            },
            compactMenu: {
                type: Boolean,
                default: false,
            },
            albumList: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            duration() {
                return Utils.secondsToHms(this.track.duration_ms / 1000);
            }
        }
    }
</script>

<style scoped>
    .track-row {
        display: flex;
        padding: 5px;
        font-size: 14px;
        justify-content: space-between;
        align-items: center;
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