<template>
    <div class="track-item" v-if="track!==null">
        <div class="track-content">
            <div class="left-square">
                <div v-if="!albumList" class="album-art"
                     :style="{backgroundImage: `url(${$store.getters.itemImage(track)})`}"></div>
                <div v-else class="album-number">{{track.track_number}}</div>
                <v-card v-if="albumList" class="play-button" flat>
                    <v-btn icon @click="play">
                        <v-icon>mdi-play</v-icon>
                    </v-btn>
                </v-card>
                <div v-else class="play-button art-button">
                    <v-btn @click="play" icon color="white">
                        <v-icon>mdi-play</v-icon>
                    </v-btn>
                </div>
            </div>
            <div class="track-info">
                <div class="track-title" :title="track.name">
                    {{track.name}}
                </div>
                <div class="track-artist">
                    <artists-span grey class="artists-span" :artists="track.artists"></artists-span>
                </div>
            </div>
        </div>
        <div class="icons" v-if="menu">
            <follow-button :item="track"></follow-button>
            <item-menu :context-item="contextItem" :item="track"></item-menu>
        </div>
    </div>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";
    import ShareMenuItem from "./ShareMenuItem";
    import FollowMenuItem from "./FollowMenuItem";
    import FollowButton from "./FollowButton";
    import ItemMenu from "./ItemMenu";

    export default {
        name: "TrackItem",
        components: {ItemMenu, FollowButton, FollowMenuItem, ShareMenuItem, ArtistsSpan},
        props: {
            track: {
                type: Object,
                default: null,
            },
            albumList: {
                type: Boolean,
                default: false,
            },
            menu: {
                type: Boolean,
                default: false,
            },
            contextItem: {
                type: Object,
                default: null,
            },
        },
        methods: {
            play() {
                this.$store.commit('track', {
                    track: this.track,
                    contextItem: this.contextItem
                });
            }
        },
    }
</script>

<style scoped>
    .track-item {
        display: flex;
        justify-content: space-between;
    }

    .track-content {
        display: flex;
        flex-grow: 10;
        align-items: center;
        width: 100%;
        overflow: hidden;
    }

    .left-square {
        min-width: 40px;
        height: 40px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .album-art {
        min-height: 40px;
        min-width: 40px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 5px;
        pointer-events: none;
        transition: opacity 0.2s;
    }

    .album-number {
        height: 40px;
        text-align: center;
        line-height: 40px;
        vertical-align: center;
        font-weight: bold;
        font-size: 14px;
        opacity: 0.5;
        pointer-events: none;
        transition: opacity 0.2s;
    }

    .play-button:hover {
        opacity: 1;
    }

    .play-button {
        border-radius: 5px;
        min-width: 40px;
        min-height: 40px;
        position: relative;
        top: -40px;
        transition: opacity 0.2s;
        opacity: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .art-button {
        background-color: rgba(0, 0, 0, 0.3);
    }

    .track-info {
        margin-left: 15px;
        line-height: 17px;
        width: 100%;
        overflow: hidden;
    }

    .track-title {
        font-weight: bold;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
    }

    .icons {
        display: inline-flex;
    }
</style>