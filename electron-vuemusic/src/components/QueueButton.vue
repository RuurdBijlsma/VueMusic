<template>
    <div class="queue-button" v-if="$store.getters.isTrackSet">
        <v-menu @input="scrollToItem" offset-y :close-on-content-click="false" :close-on-click="true">
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-playlist-play</v-icon>
                </v-btn>
            </template>
            <v-list class="track-list">
                <h5 class="context">{{context.name}}</h5>
                <recycle-scroller
                        ref="scroller"
                        class="scroller"
                        :items="queue"
                        :item-size="51"
                        v-slot="{item, index}">
                    <div class="scroll-item">
                        <v-divider></v-divider>
                        <track-row
                                queue-track
                                :context-item="$store.state.media.contextItem"
                                :key="item.id"
                                :track="item"></track-row>
                    </div>
                </recycle-scroller>
                <div class="bottom-buttons">
                    <v-btn v-if="context.to !== null" :disabled="$route.fullPath === context.to" color="primary" text
                           class="view-more" small :to="context.to" :title="'Visit ' + $store.state.media.contextItem.name">View more
                    </v-btn>
                    <v-btn small text class="view-more" @click="$store.commit('clearQueue')">Clear queue</v-btn>
                </div>
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
        methods: {
            scrollToItem() {
                setTimeout(() => {
                    if (this.$refs.scroller)
                        this.$refs.scroller.scrollToItem(this.$store.getters.trackIndex);
                }, 100);
            },
        },
        computed: {
            contextItem() {
                return this.$store.state.media.contextItem;
            },
            context() {
                return {
                    name: this.contextItem.name,
                    to: this.$store.getters.relativeItemUrl(this.contextItem)
                };
            },
            queue() {
                return this.$store.getters.currentQueue;
            }
        },
        watch: {
            '$store.getters.trackIndex'() {
                if (this.$refs.scroller)
                    this.$refs.scroller.scrollToItem(this.$store.getters.trackIndex);
            },
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
        height: calc(100vh - 100px);
        overflow-y: auto;
        max-width: 500px;
        min-width: 400px;
    }

    .scroller {
        height: calc(100vh - 100px - 36px - 49px - 28px);
        padding: 0 15px;
    }

    .bottom-buttons {
        display: flex;
    }
</style>