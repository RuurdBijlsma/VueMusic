<template>
    <div v-if="playlist">
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
                <v-btn small :color="fgLegible ? 'primary' : 'default'">
                    <v-icon>mdi-play</v-icon>
                    Shuffle
                </v-btn>
            </div>
            <div class="right-buttons">
                <v-btn icon>
                    <v-icon>mdi-heart-outline</v-icon>
                </v-btn>
                <v-btn icon>
                    <v-icon>mdi-dots-horizontal</v-icon>
                    <!--                        Make menu to share playlist-->
                </v-btn>
            </div>
        </div>
        <p v-if="!isAlbum" class="description" v-html="playlist.description"></p>
        <div class="track-list">
            <track-list :compact-menu="$store.state.windowWidth < 740"
                        :no-album="hideAlbum"
                        :album-list="isAlbum"
                        :tracks="tracks"></track-list>
        </div>
    </div>
</template>

<script>
    import Utils from "../js/Utils";
    import TrackList from "./TrackList";

    export default {
        name: "TrackSection",
        components: {TrackList},
        props: {
            fgLegible: {
                type: Boolean,
                default: true,
            },
            playlist: {
                type: Object,
                default: null,
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
            hideAlbum() {
                let width = this.$store.state.windowWidth;
                return width < 960 || (width >= 1030 && width < 1237);
            },
            fullDuration() {
                return Utils.secondsToHms(this.tracks.map(t => t.duration_ms / 1000).reduce((a, b) => a + b));
            },
        }
    }
</script>

<style scoped>

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