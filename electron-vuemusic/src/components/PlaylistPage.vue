<template>
    <div class="playlist" v-if="playlist !== null">
        <glow-image class="art-section" :url="image" :size="imageSize"
                    v-if="$store.state.windowWidth > 1030"></glow-image>
        <track-section :show-art="$store.state.windowWidth <= 1030"
                       :fg-legible="fgLegible"
                       :playlist="playlist"></track-section>
    </div>
</template>

<script>
    import Utils from "../js/Utils";
    import TrackSection from "../components/TrackSection";
    import GlowImage from "./GlowImage";

    export default {
        name: "PlaylistPage",
        components: {GlowImage, TrackSection},
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
            checkForThemeColorChange() {
                if (this.playlist && this.playlist.primary_color) {
                    let {bgLegible, fgLegible} = Utils.isLegible(this.playlist.primary_color, this.$vuetify.theme);
                    if (!bgLegible) {
                        this.revertThemeColor();
                        return;
                    }
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
            revertThemeColor() {
                this.fgLegible = true;
                if (this.previousColors !== null) {
                    this.$vuetify.theme.themes.dark.primary = this.previousColors.primaryDark;
                    this.$vuetify.theme.themes.light.primary = this.previousColors.primaryLight;
                    this.$vuetify.theme.themes.light.primarySeek = this.previousColors.primarySeekLight;
                }
            },
        },
        watch: {
            playlist() {
                this.checkForThemeColorChange();
            },
            '$vuetify.theme.dark'() {
                this.checkForThemeColorChange();
            }
        },
        computed: {
            image() {
                if (this.playlist.images.length > 0)
                    return this.playlist.images[0].url;
                return this.$store.getters.notFoundImage;
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
    .playlist {
        display: flex;
        padding: 0 0 0 30px;
        max-width: 1500px;
    }

    @media (max-width: 680px) {
        .playlist {
            padding: 0 0 0 10px;
        }
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
    }
</style>