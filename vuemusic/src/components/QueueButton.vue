<template>
    <div class="queue-button" v-if="$store.getters.isTrackSet">
        <v-menu @input="scrollToItem" offset-y :close-on-content-click="false" :close-on-click="true">
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-playlist-play</v-icon>
                </v-btn>
            </template>
            <queue-list class="track-list" ref="list"></queue-list>
        </v-menu>
    </div>
</template>

<script>
    import TrackRow from "./TrackRow";
    import QueueList from "./QueueList";

    export default {
        name: "QueueButton",
        components: {QueueList, TrackRow},
        data: () => ({
            intervals: [],
        }),
        beforeDestroy() {
            this.clearIntervals();
        },
        methods: {
            clearIntervals() {
                let intervals = this.intervals;
                this.intervals = [];
                for (let i of intervals)
                    clearInterval(i);
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
        computed: {},
        watch: {},
    }
</script>

<style scoped>
    .track-list {
        max-height: calc(100vh - 150px);
        max-width: 100%;
        width: 420px;
    }
</style>