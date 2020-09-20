<template>
    <v-sheet :color=" activeTrack ? '#c12238' : 'transparent'"
             :dark="activeTrack"
             rounded
             @dblclick="play"
             ref="trackRow" class="track-row" v-if="track !== null" :class="rowClass">
        <track-item ref="trackItem" :context-item="contextItem" class="track-left" :track="track"
                    :album-list="albumList"></track-item>
        <div class="track-middle" :title="track.album.name" v-if="!albumList">
            <router-link class="album-link" tag="span"
                         :to="$store.getters.relativeItemUrl(track.album)">
                {{track.album.name}}
            </router-link>
        </div>
        <div class="track-right">
            <div class="track-duration">{{duration}}</div>
            <item-menu :queue-track="queueTrack" :context-item="contextItem" :item="track"></item-menu>
        </div>
    </v-sheet>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";
    import Utils from "../js/Utils";
    import TrackItem from "./TrackItem";
    import FollowButton from "./FollowButton";
    import ShareMenuItem from "./ShareMenuItem";
    import FollowMenuItem from "./FollowMenuItem";
    import ItemMenu from "./ItemMenu";

    export default {
        name: "TrackRow",
        components: {ItemMenu, FollowMenuItem, ShareMenuItem, FollowButton, TrackItem, ArtistsSpan},
        props: {
            track: {
                type: Object,
                default: null,
            },
            albumList: {
                type: Boolean,
                default: false,
            },
            contextItem: {
                type: Object,
                default: null,
                required: true,
            },
            queueTrack: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            rowWidth: 0,
        }),
        mounted() {
            this.windowResize();
            window.addEventListener('resize', this.windowResize);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.windowResize);
        },
        methods: {
            windowResize() {
                this.rowWidth = this.$refs.trackRow.$el.getBoundingClientRect().width;
            },
            play() {
                this.$refs.trackItem.play();
            },
        },
        computed: {
            rowClass() {
                if (this.rowWidth > 623) {
                    return 'big';
                }
                return 'small';
            },
            duration() {
                return Utils.secondsToHms(this.track.duration_ms / 1000);
            },
            activeTrack() {
                return this.$store.state.media.track.id === this.track.id;
            },
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

    .track-left {
        min-width: calc(50% - 47px + 50px);
    }

    .small .track-left {
        min-width: calc(100% - 94px);
    }

    .track-middle {
        opacity: 0.7;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        font-weight: 500;
        padding-left: 10px;
        min-width: calc(50% - 47px - 50px);
    }

    .small .track-middle {
        display: none;
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
        justify-content: flex-end;
        min-width: 94px;
    }

    .track-duration {
        margin-right: 15px;
    }
</style>