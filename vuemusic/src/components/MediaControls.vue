<template>
    <div class="controls" :class="large ? 'large' : ''" :style="{minWidth: full? '156px':'96px'}"
         v-if="$store.getters.isTrackSet">
        <v-btn :color="$store.state.media.shuffle ? 'primary' : 'default'"
               @click="$store.commit('toggleShuffle')"
               icon
               :small="!large"
               v-if="full">
            <v-icon :small="!large">mdi-shuffle</v-icon>
        </v-btn>
        <v-btn icon
               :small="!large"
               :large="large"
               @click="$store.dispatch('skip', -1)">
            <v-icon>mdi-rewind</v-icon>
        </v-btn>
        <v-btn :loading="$store.state.media.trackLoading"
               :icon="!large"
               :fab="large"
               :color="(large && fgLegible) ? 'primary' : 'default'"
               large
               @click="$store.dispatch(playing ? 'pause' : 'play')">
            <v-icon :large="large" v-if="playing">mdi-pause</v-icon>
            <v-icon :large="large" v-else>mdi-play</v-icon>
        </v-btn>
        <v-btn icon
               :small="!large"
               :large="large"
               @click="$store.dispatch('skip', 1)">
            <v-icon>mdi-fast-forward</v-icon>
        </v-btn>
        <v-btn :color="$store.state.media.repeat ? 'primary' : 'default'"
               @click="$store.commit('toggleRepeat')"
               icon
               :small="!large"
               v-if="full">
            <v-icon :small="!large">mdi-repeat</v-icon>
        </v-btn>
    </div>
</template>

<script>
    export default {
        name: "MediaControls",
        props: {
            full: {
                type: Boolean,
                default: false,
            },
            large: {
                type: Boolean,
                default: false,
            },
            fgLegible: {
                type: Boolean,
                default: true,
            },
        },
        computed: {
            playing() {
                return this.$store.state.media.playing;
            }
        }
    }
</script>

<style scoped>
    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .large > * {
        margin: 0 6px;
    }
</style>