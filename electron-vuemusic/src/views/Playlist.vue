<template>
    <div class="playlist" v-if="$store.state.playlist[id]">
        <div class="art-section">
            <div class="album-art album-background"
                 :style="{
                    backgroundImage: `url(${playlist.images[0].url})`,
                    opacity: $vuetify.theme.dark ? 0.4 : 0.7,
                 }"></div>
            <div class="album-art album-normal" :style="{backgroundImage: `url(${playlist.images[0].url})`}"></div>
        </div>
        <perfect-scrollbar class="tracks-section">
            <h2 class="name">{{playlist.name}}</h2>
            <p class="sub-caption">
                <span>Created by <span class="primary--text">{{playlist.owner.display_name}}</span>
                </span>
                <span class="dot">•</span>
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
            <p class="description" v-html="playlist.description"></p>
            <div class="track-list">
                <track-list :tracks="playlist.tracks"></track-list>
            </div>
        </perfect-scrollbar>

    </div>
</template>

<script>
    import Utils from "../js/Utils";
    import TrackList from "../components/TrackList";

    export default {
        name: "Playlist",
        components: {TrackList},
        data: () => ({
            previousColors: null,
            fgLegible: true,
        }),
        async mounted() {
            await this.$store.dispatch('loadPlaylist', this.id);
        },
        watch: {
            playlist() {
                if (this.playlist && this.playlist.primary_color) {
                    let {bgLegible, fgLegible} = Utils.isLegible(this.playlist.primary_color, this.$vuetify.theme);
                    if (!bgLegible)
                        return;
                    this.fgLegible = fgLegible;

                    this.previousColors = {
                        primaryDark: this.$vuetify.theme.themes.dark.primary,
                        primaryLight: this.$vuetify.theme.themes.light.primary,
                        primarySeekLight: this.$vuetify.theme.themes.light.primarySeek,
                    }

                    this.$vuetify.theme.themes.dark.primary = this.playlist.primary_color;
                    this.$vuetify.theme.themes.light.primary = this.playlist.primary_color;
                    this.$vuetify.theme.themes.light.primarySeek = this.playlist.primary_color;
                }
            }
        },
        computed: {
            id() {
                return this.$route.query.id;
            },
            playlist() {
                console.log(this.$store.state.playlist[this.id]);
                return this.$store.state.playlist[this.id]
            },
            fullDuration() {
                return Utils.secondsToHms(this.playlist.tracks.map(t => t.track.duration_ms / 1000).reduce((a, b) => a + b));
            },
        },
        beforeRouteLeave(to, from, next) {
            if (this.previousColors !== null) {
                this.$vuetify.theme.themes.dark.primary = this.previousColors.primaryDark;
                this.$vuetify.theme.themes.light.primary = this.previousColors.primaryLight;
                this.$vuetify.theme.themes.light.primarySeek = this.previousColors.primarySeekLight;
            }
            next()
        },
    }
</script>

<style scoped>
    .playlist {
        display: flex;
        padding: 30px 20px 0 30px;
        height: 100%;
    }

    .art-section {
        margin-right: 30px;
    }

    .album-art {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        width: 350px;
        height: 350px;
        border-radius: 5px;
        z-index: 5;
    }

    .album-background {
        filter: blur(20px);
        z-index: 1;
        position: relative;
        top: 25px;
        transform: scale(0.95);
    }

    .album-normal {
        position: relative;
        top: -350px;
    }

    .tracks-section {
        flex-grow: 1;
        padding-right: 10px;
        padding-bottom: 30px;
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

    .right-buttons {
        display: flex;
    }

    .description {
        font-size: 14px;
        max-width: 500px;
        margin: 20px 0;
    }
</style>