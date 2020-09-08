<template>
    <div class="playlist" v-if="playlist !== null"
         :style="{paddingTop:$store.state.windowWidth >= 1030?'0':'30px'}">
        <div class="art-section" v-if="$store.state.windowWidth >= 1030">
            <div class="album-art album-background"
                 :style="{
                    backgroundImage: `url(${playlist.images[0].url})`,
                    opacity: $vuetify.theme.dark ? 0.4 : 0.7,
                 }"></div>
            <div class="album-art album-normal" :style="{backgroundImage: `url(${playlist.images[0].url})`}"></div>
        </div>
        <perfect-scrollbar class="tracks-section" v-if="$store.state.windowWidth >= 1030">
            <track-section :fg-legible="fgLegible" :playlist="playlist"></track-section>
        </perfect-scrollbar>
        <div v-else class="tracks-section">
            <div class="art-section art-center" v-if="$store.state.windowWidth < 1030">
                <div class="album-art album-background"
                     :style="{
                    backgroundImage: `url(${playlist.images[0].url})`,
                    opacity: $vuetify.theme.dark ? 0.4 : 0.7,
                 }"></div>
                <div class="album-art album-normal" :style="{backgroundImage: `url(${playlist.images[0].url})`}"></div>
            </div>
            <track-section :fg-legible="fgLegible" :playlist="playlist"></track-section>
        </div>
    </div>
</template>

<script>
    import Utils from "../js/Utils";
    import TrackList from "../components/TrackList";
    import TrackSection from "../components/TrackSection";

    export default {
        name: "PlaylistPage",
        components: {TrackSection, TrackList},
        data: () => ({
            previousColors: null,
            fgLegible: true,
        }),
        props: {
            type: {
                type: String,
                default: 'playlist',
            },
            id: {
                type: String,
                default: 'playlist',
            },
            playlist: {
                type: Object,
                default: null,
            },
        },
        methods: {
            revertThemeColor() {
                if (this.previousColors !== null) {
                    this.$vuetify.theme.themes.dark.primary = this.previousColors.primaryDark;
                    this.$vuetify.theme.themes.light.primary = this.previousColors.primaryLight;
                    this.$vuetify.theme.themes.light.primarySeek = this.previousColors.primarySeekLight;
                }
            }
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
            },
        },
    }
</script>

<style scoped>
    .playlist {
        display: flex;
        padding: 30px 20px 0 30px;
        max-width: 1500px;
        /*height: 100%;*/
    }

    @media (min-width: 1760px) {
        .playlist {
            left: calc(50% - 750px);
        }
    }

    .art-section {
        margin-top: 30px;
        width: 350px;
        margin-right: 30px;
        display: flex;
        justify-content: center;
        /*align-items: center;*/
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

    .tracks-section {
        flex-grow: 1;
        padding-right: 10px;
        padding-bottom: 30px;
        width: 100%;
        margin-top: 30px;
    }

    @media (max-width: 1450px) {
        .art-section {
            width: 300px;
        }

        .album-art {
            min-width: 300px;
            height: 300px;
            right: -150px;
        }

        .album-normal {
            left: -150px;
            /*top: -300px;*/
        }
    }

    @media (max-width: 1287px) {
        .art-section {
            width: 250px;
        }

        .album-art {
            min-width: 250px;
            height: 250px;
            right: -125px;
        }

        .album-normal {
            left: -125px;
            /*top: -250px;*/
        }
    }

    @media (max-width: 1030px) {
        .art-section {
            width: 350px;
            margin-top: 0;
        }

        .album-art {
            min-width: 350px;
            height: 350px;
            right: -175px;
        }

        .album-normal {
            left: -175px;
        }

        .tracks-section {
            margin-top: 0;
        }
    }

    @media (max-width: 1030px) {

    }
</style>