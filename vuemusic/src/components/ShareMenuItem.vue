<template>
    <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
            <v-list-item
                    v-bind="attrs"
                    v-on="on">
                <v-list-item-icon>
                    <v-icon>mdi-share</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Share</v-list-item-title>
            </v-list-item>
        </template>
        <v-list>
            <v-list-item @click="share">
                <v-list-item-icon>
                    <v-progress-circular size="20" indeterminate width="1" v-if="loading"></v-progress-circular>
                    <v-icon v-else>mdi-share</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Share Vue Music link</v-list-item-title>
            </v-list-item>
            <v-list-item @click="shareSpotify" v-if="item.type !== undefined && item.type !== 'category'">
                <v-list-item-icon>
                    <v-progress-circular size="20" indeterminate width="1" v-if="loadingSpotify"></v-progress-circular>
                    <v-icon v-else>mdi-spotify</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Share Spotify™ link</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    export default {
        name: "ShareMenuItem",
        props: {
            item: {
                type: Object,
                default: null,
            }
        },
        data: () => ({
            loading: false,
            loadingSpotify: false,
        }),
        methods: {
            async share() {
                this.$emit('action');
                // this.$refs.shareParent.isActive=false;
                this.loading = true;
                await this.$store.dispatch('share', {
                    item: this.item,
                    copy: this.$copyText,
                });
                this.loading = false;
            },
            async shareSpotify() {
                this.$emit('action');
                this.loadingSpotify = true;
                await this.$store.dispatch('share', {
                    item: this.item,
                    copy: this.$copyText,
                    urlType: 'spotify',
                });
                this.loadingSpotify = false;
            },
        }
    }
</script>

<style scoped>

</style>