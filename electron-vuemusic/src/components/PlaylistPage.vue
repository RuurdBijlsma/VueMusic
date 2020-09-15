<template>
    <div class="playlist" v-if="playlist">
        <glow-image class="art-section" :url="$store.getters.itemImage(playlist)" :size="imageSize"
                    v-if="$store.state.windowWidth > 1030"></glow-image>
        <track-section :highlight-id="highlightId"
                       :show-art="$store.state.windowWidth <= 1030"
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
            highlightId: {
                type: String,
                default: undefined,
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
                    console.log("Applying theme color", this.playlist.primary_color);
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
    }

    @media (max-width: 1287px) {
        .art-section {
            width: 250px;
        }
    }

    @media (max-width: 1030px) {
        .art-section {
            width: 350px;
            margin-top: 0;
        }
    }
</style>