<template>
    <div class="queue-button" v-if="$store.getters.isTrackSet">
        <v-menu offset-y :close-on-content-click="false" :close-on-click="true">
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-playlist-play</v-icon>
                </v-btn>
            </template>
            <v-list class="track-list">
                <h5 class="context">{{context.name}}</h5>
                <v-list-item v-for="track in queue" :key="track.id">
                    <track-row class="track-row" :context-item="$store.state.media.contextItem"
                               :track="track"></track-row>
                </v-list-item>
                <v-btn v-if="context.to !== null" :disabled="$route.fullPath === context.to" color="primary" text
                       class="view-more" small :to="context.to">View all tracks
                </v-btn>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
    import TrackRow from "./TrackRow";
    import ArtistsSpan from "./ArtistsSpan";

    export default {
        name: "QueueButton",
        components: {ArtistsSpan, TrackRow},
        computed: {
            contextItem() {
                return this.$store.state.media.contextItem;
            },
            context() {
                let name, to;
                switch (this.contextItem.type) {
                    case 'liked':
                        name = 'Liked tracks';
                        to = '/library/tracks';
                        break;
                    case 'search':
                        name = `Tracks from search term "${this.contextItem.term}"`;
                        to = this.contextItem.to;
                        break;
                    case 'radio':
                        name = `Radio tracks`;
                        to = null;
                        break;
                    default:
                        name = this.contextItem.name;
                        to = this.$store.getters.relativeItemUrl(this.contextItem);
                }
                return {name, to};
            },
            queue() {
                let queueLength = 8;
                let tracksAbove = Math.floor(queueLength / 2 - 1);
                let startIndex = this.$store.state.media.trackIndex - tracksAbove;
                startIndex = Math.max(0, startIndex);

                let tracksBelow = queueLength - (this.$store.state.media.trackIndex - startIndex);
                let endIndex = this.$store.state.media.trackIndex + tracksBelow;

                let fullQueue = this.$store.state.media.queue;
                endIndex = Math.min(fullQueue.length - 1, endIndex);

                return fullQueue.slice(startIndex, endIndex);
            }
        },
    }
</script>

<style scoped>
    .context {
        padding: 15px 20px;
    }

    .view-more {
        margin: 15px;
        margin-bottom: 5px;
    }

    .track-list {
        max-height: calc(100vh - 100px);
        overflow-y: auto;
        max-width: 400px;
    }

    .track-row {
        width: 100%;
    }
</style>