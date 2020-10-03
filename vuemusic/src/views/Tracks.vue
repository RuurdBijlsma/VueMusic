<template>
    <div class="tracks">
        <recycle-scroller
                class="scroller"
                :items="scrollItems"
                key-field="id"
                size-field="size"
                v-slot="{item, index}">
            <div v-if="index===0" class="page-title-container">
                <v-form @submit.prevent="filter" class="title-container">
                    <h1 class="page-title">Tracks</h1>
                    <v-text-field ref="filterInput" outlined rounded dense v-model="liveFilter" label="Filter tracks"
                                  class="filter-term" clearable
                                  @click:clear="clearFilter"></v-text-field>
                </v-form>
                <v-divider class="divider"></v-divider>
                <div class="buttons">
                    <v-btn small color="primary" @click="$store.dispatch('playItem', {item: context})">
                        <v-icon small class="mr-2">mdi-play</v-icon>
                        Play
                    </v-btn>
                    <v-btn small v-if="tracks.length > 1" color="primary"
                           @click="$store.dispatch('playItem', {item: context, shuffle:true})">
                        <v-icon small class="mr-2">mdi-shuffle</v-icon>
                        Shuffle
                    </v-btn>
                </div>
                <div class="sub-caption">
                    <span>{{tracks.length}} tracks</span>
                    <span class="dot">•</span>
                    <span>{{fullDuration}}</span>
                    <span v-if="loading" class="loading-indicator">
                        <span class="dot">•</span>
                        <v-progress-circular class="spinner" indeterminate size="10" width="1"></v-progress-circular>
                        <span>Refreshing</span>
                    </span>
                </div>
                <v-divider class="mr-1 ml-1"></v-divider>
            </div>
            <div class="scroll-item" v-if="index>0">
                <track-row
                        :no-album="hideAlbum"
                        :compact-menu="compactMenu"
                        :context-item="context"
                        :album-list="false"
                        :key="item.id"
                        :track="item"></track-row>
                <v-divider class="mr-1 ml-1"></v-divider>
            </div>
        </recycle-scroller>
    </div>
</template>

<script>
    import TrackRow from "../components/TrackRow";
    import Utils from "../js/Utils";

    export default {
        name: "Tracks",
        components: {TrackRow},
        data: () => ({
            liveFilter: '',
            filterTerm: '',
            focusInterval: -1,
        }),
        async mounted() {
            await this.$store.dispatch('refreshUserData', 'track');
        },
        beforeDestroy() {
            clearInterval(this.focusInterval);
        },
        methods: {
            clearFilter() {
                this.liveFilter = '';
                this.filter(false);
            },
            filter(focus = true) {
                this.filterTerm = this.liveFilter;
                if (!focus)
                    return;

                // 🍝 Input element is destroyed due to recycle scroller being rebuild
                // so input focus is sometimes lost which is unexpected.
                // This restores focus
                let hasSwitched = false;
                let timeout = 800;
                let intervalSpeed = 10;
                let i = 0;
                clearInterval(this.focusInterval);
                this.focusInterval = setInterval(() => {
                    let inputEl = this.$refs.filterInput.$el.querySelector("input");
                    if (inputEl !== document.activeElement) {
                        hasSwitched = true;
                        this.$refs.filterInput.focus();
                        clearInterval(this.focusInterval);
                        console.log("Stop due to focus called");
                    }
                    if (i++ > timeout / intervalSpeed) {
                        clearInterval(this.focusInterval);
                        console.log("Stop due to timeout");
                    }
                }, intervalSpeed);
            }
        },
        computed: {
            lowerFilterTerm() {
                return this.filterTerm.toLowerCase();
            },
            context() {
                return {type: 'liked', id: 'liked', name: 'Liked tracks', tracks: this.tracks}
            },
            loading() {
                return this.$store.state.isRefreshing.track;
            },
            compactMenu() {
                let width = this.$store.state.windowWidth;
                return width < 735 && (width > 680 || width < 436);
            },
            hideAlbum() {
                let width = this.$store.state.windowWidth;
                return width < 950;
            },
            scrollItems() {
                let tracks = this.tracks.map(t => ({...t, size: 51}));
                let titleHeight = 142;
                return [{id: '0', size: titleHeight}, ...tracks];
            },
            tracks() {
                if (this.filterTerm === '')
                    return this.$store.state.library.tracks.filter(t => !t.is_local);
                return this.$store.state.library.tracks.filter(t =>
                    !t.is_local &&
                    t.name.toLowerCase().includes(this.lowerFilterTerm) ||
                    t.artists.map(a => a.name).join(' ').toLowerCase().includes(this.lowerFilterTerm)
                );
            },
            fullDuration() {
                if (this.tracks.length === 0)
                    return Utils.secondsToHms(0);
                return Utils.secondsToHms(this.tracks.map(t => t.duration_ms / 1000).reduce((a, b) => a + b));
            },
        }
    }
</script>

<style scoped>
    .tracks {
        height: 100%;
        width: 100%;
    }

    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
    }

    .filter-term {
        margin-bottom: -20px;
        max-width: 250px;
        margin-right: 5px;
        margin-top: 4px;
    }

    .scroller {
        height: 100%;
        padding: 30px;
        padding-top: 20px;
    }

    @media (max-width: 680px) {
        .scroller {
            padding: 10px;
        }
    }

    .divider {
        margin-bottom: 15px;
    }

    .buttons {
        display: flex;
    }

    .buttons > *:not(:last-child) {
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