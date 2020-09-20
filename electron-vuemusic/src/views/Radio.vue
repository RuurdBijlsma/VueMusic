<template>
    <div class="radio">
        <div class="page-title-container">
            <h1 class="page-title">Radio</h1>
            <v-divider class="divider"></v-divider>
            <div class="buttons">
                <v-btn small color="primary" @click="$store.dispatch('playItem', {item: context})">
                    <v-icon small class="mr-2">mdi-play</v-icon>
                    Play
                </v-btn>
                <v-btn small v-if="tracks.length > 1" color="primary"
                       @click="$store.dispatch('playItem', {item: context, shuffle: true})">
                    <v-icon small class="mr-2">mdi-shuffle</v-icon>
                    Shuffle
                </v-btn>
            </div>
            <div class="sub-caption">
                <span v-if="loading" class="loading-indicator">
                    <v-progress-circular class="spinner" indeterminate size="10" width="1"></v-progress-circular>
                    <span>Creating radio</span>
                </span>
                <span v-else>
                <span>{{tracks.length}} tracks</span>
                <span class="dot">•</span>
                <span>{{fullDuration}}</span>
                </span>
            </div>
        </div>
        <div v-for="track in tracks" :key="track.id">
            <v-divider class="mr-1 ml-1"></v-divider>
            <track-row :context-item="context"
                       :track="track"></track-row>
        </div>
    </div>
</template>

<script>
    import TrackRow from "../components/TrackRow";
    import Utils from "../js/Utils";

    export default {
        name: "Radio",
        components: {TrackRow},
        data: () => ({
            tracks: [],
            loading: false,
            id: Math.random(),
        }),
        async mounted() {
            await this.loadRadio();
        },
        methods: {
            async loadRadio() {
                this.loading = true;
                let options = this.$route.query;
                for (let key in options) {
                    if (!options.hasOwnProperty(key))
                        continue;
                    if (!isNaN(+options[key])) {
                        options[key] = +options[key];
                    }
                }

                this.tracks = await this.$store.dispatch('getRadioTracks', options);
                this.loading = false;
            },
        },
        computed: {
            context() {
                return {
                    type: 'radio',
                    name: 'Radio tracks',
                    path: this.$route.fullPath,
                    id: 'radio' + this.id,
                    tracks: this.tracks
                }
            },
            fullDuration() {
                if (this.tracks.length === 0)
                    return Utils.secondsToHms(0);
                return Utils.secondsToHms(this.tracks.map(t => t.duration_ms / 1000).reduce((a, b) => a + b));
            },
        },
        watch: {
            async '$route.query'() {
                await this.loadRadio();
            }
        }
    }
</script>

<style scoped>
    .radio {
        padding: 30px;
    }

    @media (max-width: 680px) {
        .radio {
            padding: 10px;
        }
    }

    .divider {
        margin-bottom: 15px;
    }

    .buttons {
        display: flex;
    }

    .buttons > *:first-child {
        margin-right: 15px;
    }

    .sub-caption {
        margin: 15px 0 10px;
        text-transform: uppercase;
        font-size: 12px;
        font-weight: bolder;
        opacity: 0.7;
    }

    .dot {
        margin: 0 10px;
    }

    .loading-indicator {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: top;
    }

    .spinner {
        margin-right: 5px;
    }
</style>