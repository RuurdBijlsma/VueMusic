<template>
    <div class="now-playing" ref="nowPlaying">
        <div class="left" v-if="track">
            <div class="blur-background" :style="{backgroundImage: `url(${image})`}"></div>
            <div class="media">
                <div class="fsb-container">
                    <v-btn title="Toggle fullscreen" @click="toggleFullScreen" icon small class="fullscreen-button">
                        <v-icon>mdi-fullscreen</v-icon>
                    </v-btn>
                    <v-btn title="Close queue list" v-if="!hideQueue" @click="hideQueue = true" icon small class="fullscreen-button">
                        <v-icon>mdi-menu-right</v-icon>
                    </v-btn>
                    <v-btn title="Open queue list" v-else @click="hideQueue = false" icon small class="fullscreen-button">
                        <v-icon>mdi-menu-left</v-icon>
                    </v-btn>
                </div>
                <div class="media-container">
                    <div class="media-center">
                        <glow-image :size="$store.state.windowWidth < 400 ? 200 : 300" class="album-image"
                                    :url="image"></glow-image>
                        <div class="track-info">
                            <span class="track-title">{{track.name}}</span>
                            <artists-span class="track-artists" :artists="track.artists" grey></artists-span>
                        </div>
                        <media-seek class="seek"></media-seek>
                        <media-controls :fg-legible="fgLegible" class="controls" full large></media-controls>
                    </div>
                </div>
            </div>
        </div>
        <queue-list ref="list" class="queue" v-if="$store.state.windowWidth >= 1080" v-show="!hideQueue"
                    :height="'100%'"></queue-list>
    </div>
</template>

<script>
    import QueueList from "../components/QueueList";
    import GlowImage from "../components/GlowImage";
    import MediaControls from "../components/MediaControls";
    import ArtistsSpan from "../components/ArtistsSpan";
    import MediaSeek from "../components/MediaSeek";
    import Utils from "../js/Utils";

    export default {
        name: "NowPlaying",
        components: {MediaSeek, ArtistsSpan, MediaControls, GlowImage, QueueList},
        data: () => ({
            previousColors: null,
            fgLegible: true,
            color: null,
            hideQueue: localStorage.getItem('hideNPQueue') === null ? false : JSON.parse(localStorage.hideNPQueue),
        }),
        mounted() {
            this.processImage();
        },
        methods: {
            toggleFullScreen() {
                if (!document.fullscreenElement) {
                    this.$refs.nowPlaying.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            },
            async processImage() {
                let imgUrl = this.$store.getters.itemImage(this.track);
                this.color = await this.getImageColor(imgUrl);
                this.applyThemeColor(this.color);
            },
            getImageColor(imgUrl) {
                return new Promise(resolve => {
                    let img = document.createElement('img');
                    img.src = imgUrl;
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');
                    img.onload = () => {
                        let width = 20;
                        let height = 20;
                        canvas.width = width;
                        canvas.height = height;
                        context.drawImage(img, 0, 0, width, height);
                        let bins = {};
                        let imageData = context.getImageData(0, 0, width, height);
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            let color = imageData.data.slice(i, i + 3);
                            let rgb = color.map(c => Math.floor(c / 20))
                            let [h, s, l] = this.rgbToHsl(...rgb);
                            let binKey = rgb.join(',');
                            if (bins[binKey] === undefined)
                                bins[binKey] = {n: 0, color};
                            // console.log(hsl);
                            bins[binKey].n += 1 + s * 255;
                        }
                        let values = Object.values(bins);
                        const indexOfMaxValue = values.map(e => e.n).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
                        let [r, g, b] = values[indexOfMaxValue].color;
                        let toHex = c => c.toString(16).padStart(2, '0');
                        resolve('#' + toHex(r) + toHex(g) + toHex(b));
                    };
                });
            },
            rgbToHsl(r, g, b) {
                r /= 255, g /= 255, b /= 255;
                let max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;
                if (max === min) {
                    h = s = 0; // achromatic
                } else {
                    let d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r:
                            h = (g - b) / d + (g < b ? 6 : 0);
                            break;
                        case g:
                            h = (b - r) / d + 2;
                            break;
                        case b:
                            h = (r - g) / d + 4;
                            break;
                    }
                    h /= 6;
                }
                return [h, s, l];
            },
            applyThemeColor(color) {
                let {bgLegible, fgLegible} = Utils.isLegible(color, this.$vuetify.theme);
                if (!bgLegible) {
                    console.log("Theme color", color, "not legible on background, reverting back to", this.previousColors?.primaryDark);
                    this.revertThemeColor();
                    return;
                }
                console.log("Applying theme color 🎨", color);
                this.fgLegible = fgLegible;

                if (this.previousColors === null)
                    this.previousColors = {
                        primaryDark: this.$vuetify.theme.themes.dark.primary,
                        primaryLight: this.$vuetify.theme.themes.light.primary,
                        primarySeekLight: this.$vuetify.theme.themes.light.primarySeek,
                    }

                this.$vuetify.theme.themes.dark.primary = color;
                this.$vuetify.theme.themes.light.primary = color;
                this.$vuetify.theme.themes.light.primarySeek = color;
            },
            revertThemeColor() {
                this.fgLegible = true;
                if (this.previousColors !== null) {
                    this.$vuetify.theme.themes.dark.primary = this.previousColors.primaryDark;
                    this.$vuetify.theme.themes.light.primary = this.previousColors.primaryLight;
                    this.$vuetify.theme.themes.light.primarySeek = this.previousColors.primarySeekLight;
                }
            },
            scrollToItem() {
                this.intervals.push(setInterval(() => {
                    if (this.$refs.list) {
                        this.$refs.list.scrollToItem();
                        this.clearIntervals();
                    }
                }, 50));
            },
        },
        watch: {
            hideQueue() {
                localStorage.hideNPQueue = this.hideQueue;
                if(this.hideQueue===false){
                    this.$refs.list.scrollToItem();
                }
            },
            '$vuetify.theme.dark'() {
                if (this.color !== null)
                    this.applyThemeColor(this.color);
            },
            track() {
                this.processImage();
            },
        },
        computed: {
            track() {
                return this.$store.state.media.track;
            },
            image() {
                return this.$store.getters.itemImage(this.track);
            },
        },
        beforeRouteLeave(to, from, next) {
            this.revertThemeColor();
            next();
        },
    }
</script>

<style scoped>
    .now-playing {
        height: 100%;
        display: flex;
        justify-content: space-between;
    }

    .left {
        flex-grow: 1;
    }

    .blur-background {
        width: 100%;
        height: 100%;
        position: relative;

        background-position: center 0;
        background-repeat: no-repeat;
        background-size: 120%;
        filter: blur(30px);
        mask-image: linear-gradient(to top, transparent 10%, black 95%);
    }

    .media {
        width: 100%;
        height: 100%;
        position: relative;
        top: calc(-100% - 10px);
    }

    @media (max-height: 705px) {
        .media {
            align-items: flex-start;
        }

        .album-image {
            margin-top: 15px !important;
        }

        .controls {
            margin-bottom: 15px !important;
        }
    }

    .media-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        margin-top: -38px;
        overflow-y: auto;
    }

    .fsb-container {
        width: calc(100% - 20px);
        margin: 10px;
        display: flex;
        top: 10px;
        justify-content: flex-end;
        position: relative;
    }

    .fullscreen-button {
        opacity: 0.4;
        z-index: 3;
    }

    .fullscreen-button:hover {
        opacity: 0.8;
    }

    .media-center {
        max-width: 700px;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 15px;
    }

    .album-image {
        margin: 0 0 20px;
        box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.7);
    }

    .track-info {
        text-align: center;
        margin: 20px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .seek {
        width: 350px;
    }

    @media (max-width: 400px) {
        .seek {
            width: 270px;
        }
    }

    .track-title {
        font-size: 28px;
        font-weight: 400;
    }

    .controls {
        margin: 20px 0 0;
    }

    .queue {
        min-width: 400px;
        max-width: 400px;
    }
</style>