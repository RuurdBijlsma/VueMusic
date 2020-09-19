<template>
    <div class="controls" :style="{minWidth: full? '156px':'96px'}" v-if="$store.getters.isTrackSet">
        <v-btn :color="$store.state.media.shuffle ? 'primary' : 'default'"
               @click="$store.commit('toggleShuffle')"
               icon
               small
               v-if="full">
            <v-icon small>mdi-shuffle</v-icon>
        </v-btn>
        <v-btn icon
               small
               @click="$store.dispatch('skip', -1)">
            <v-icon>mdi-rewind</v-icon>
        </v-btn>
        <v-btn :loading="$store.state.media.trackLoading"
               icon
               large
               @click="$store.dispatch(playing ? 'pause' : 'play')">
            <v-icon v-if="playing">mdi-pause</v-icon>
            <v-icon v-else>mdi-play</v-icon>
        </v-btn>
        <v-btn icon
               small
               @click="$store.dispatch('skip', 1)">
            <v-icon>mdi-fast-forward</v-icon>
        </v-btn>
        <v-btn :color="$store.state.media.repeat ? 'primary' : 'default'"
               @click="$store.commit('toggleRepeat')"
               icon
               small
               v-if="full">
            <v-icon small>mdi-repeat</v-icon>
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
            }
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
</style>