<template>
    <v-menu :close-on-content-click="true" :close-on-click="true">
        <template v-slot:activator="{ on, attrs }">
            <v-btn :color="color" :fab="fab" :icon="!fab" :small="fab" v-on="on">
                <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
        </template>
        <v-list dense>
            <share-menu-item :item="item"></share-menu-item>
            <follow-menu-item v-if="type!=='category' && type!=='user' && type !== 'liked'"
                              :item="item"></follow-menu-item>
            <v-list-item v-if="type === 'track' || type === 'artist'" exact :to="`/radio?seed_${type}s=${item.id}`">
                <v-list-item-icon>
                    <v-icon>mdi-radio-tower</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Go to {{type}} radio</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="!queueTrack && type !== 'category' && type !== 'liked' && type !== 'user'" @click="playNext(item)">
                <v-list-item-icon>
                    <v-progress-circular size="20" indeterminate width="1"
                                         v-if="nextQueueLoading"></v-progress-circular>
                    <v-icon v-else>mdi-play-circle-outline</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Play next</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="!queueTrack && type !== 'category' && type !== 'liked' && type !== 'user'" @click="addToQueue(item)">
                <v-list-item-icon>
                    <v-progress-circular size="20" indeterminate width="1"
                                         v-if="addQueueLoading"></v-progress-circular>
                    <v-icon v-else>mdi-plus</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Add to queue</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="editablePlaylist" @click="remove(item, contextItem)">
                <v-list-item-icon>
                    <v-progress-circular size="20" indeterminate width="1" v-if="removeLoading"></v-progress-circular>
                    <v-icon v-else>mdi-playlist-minus</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Remove from <span class="font-weight-bold">{{contextItem.name}}</span>
                </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="type === 'track' && queueTrack && $store.getters.isTrackSet && item.id !== $store.state.media.track.id"
                         @click="$store.commit('removeFromQueue', item)">
                <v-list-item-icon>
                    <v-icon>mdi-playlist-minus</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Remove from queue</v-list-item-title>
            </v-list-item>
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-list-item v-if="item.type === 'track'" v-on="on" v-bind="attrs">
                        <v-list-item-icon>
                            <v-icon>mdi-playlist-plus</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Add to playlist</v-list-item-title>
                    </v-list-item>
                </template>
                <v-list dense class="playlist-menu">
                    <v-list-item @click="add(item, playlist)" v-for="playlist of myPlaylists" :key="playlist.id">
                        <v-list-item-icon>
                            <v-progress-circular size="20" indeterminate width="1"
                                                 v-if="addLoading[playlist.id]"></v-progress-circular>
                            <v-icon v-else>mdi-playlist-music</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{playlist.name}}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-list>
    </v-menu>
</template>

<script>
    import ShareMenuItem from "./ShareMenuItem";
    import FollowMenuItem from "./FollowMenuItem";
    import Vue from 'vue';

    export default {
        name: "ItemMenu",
        components: {FollowMenuItem, ShareMenuItem},
        props: {
            item: {
                type: Object,
                default: null,
            },
            fab: {
                type: Boolean,
                default: false,
            },
            color: {
                type: String,
                default: 'default',
            },
            contextItem: {
                type: Object,
                default: null,
            },
            queueTrack: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            addLoading: {},
            removeLoading: false,
            addQueueLoading: false,
            nextQueueLoading: false,
        }),
        methods: {
            async add(track, playlist) {
                Vue.set(this.addLoading, playlist.id, true);
                await this.$store.dispatch('addToPlaylist', {track, playlist});
                Vue.set(this.addLoading, playlist.id, false);
            },
            async remove(track, playlist) {
                this.removeLoading = true;
                await this.$store.dispatch('removeFromPlaylist', {track, playlist});
                this.removeLoading = false;
            },
            async playNext(item) {
                let context = await this.$store.dispatch('getContextItem', item);
                this.$store.commit('playNext', context.tracks);
            },
            async addToQueue(item) {
                let context = await this.$store.dispatch('getContextItem', item);
                this.$store.commit('addToQueue', context.tracks);
            },
        },
        computed: {
            editablePlaylist() {
                if (this.contextItem === null || this.contextItem.type !== 'playlist')
                    return false;
                return this.contextItem.collaborative || this.contextItem.owner.id === this.$store.state.userInfo.id;
            },
            myPlaylists() {
                return this.$store.state.library.playlists.filter(p =>
                    p.owner.id === this.$store.state.userInfo.id ||
                    p.collaborative
                );
            },
            type() {
                if (!this.item.type)
                    return 'category';
                return this.item.type;
            }
        }
    }
</script>

<style scoped>
    .playlist-menu {
        max-height: 90vh;
        overflow-y: auto;
    }
</style>