<template>
    <v-list v-if="contextItem !== null" class="queue-list" ref="list" :style="{
        height: height,
    }">
        <h5 class="context">{{context.name}}</h5>
        <recycle-scroller
                ref="scroller"
                class="scroller"
                :items="queue"
                :item-size="51"
                :style="{
                    height: scrollerHeight + 'px',
                }"
                v-slot="{item, index}">
            <div class="scroll-item">
                <v-divider></v-divider>
                <track-row
                        queue-track
                        :context-item="contextItem"
                        :key="item.id"
                        :track="item"></track-row>
            </div>
        </recycle-scroller>
        <div class="bottom-buttons">
            <v-btn v-if="context.to !== null" :disabled="$route.fullPath === context.to" color="primary" text
                   class="view-more" small :to="context.to"
                   :title="'Visit ' + contextItem.name">Go to {{contextItem.type}}
            </v-btn>
            <v-btn small text class="view-more" @click="$store.commit('clearQueue')">Clear queue</v-btn>
        </div>
    </v-list>
</template>

<script>
    import TrackRow from "./TrackRow";

    export default {
        name: "QueueList",
        components: {TrackRow},
        props: {
            height: {
                type: [Number, String],
                default: '90vh',
            },
        },
        data: () => ({
            scrollerHeight: window.innerHeight - 110 - 150,
        }),
        mounted() {
            this.calculateHeight();
            window.addEventListener('resize', this.calculateHeight);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.calculateHeight);
        },
        methods: {
            calculateHeight() {
                if (!this.$refs.list)
                    return;
                let {height} = this.$refs.list.$el.getBoundingClientRect();
                this.scrollerHeight = height - 110;
            },
            scrollToItem() {
                setTimeout(() => {
                    this.calculateHeight();
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
    .queue-list {
        overflow-y: auto;
    }

    .context {
        padding: 15px 20px;
    }

    .view-more {
        margin: 13px 15px 2px;
    }

    .scroller {
        height: 51px;
        padding: 0 15px;
    }

    .bottom-buttons {
        display: flex;
    }
</style>