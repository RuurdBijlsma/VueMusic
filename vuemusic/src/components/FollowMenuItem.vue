<template>
    <v-list-item v-if="isFollowed" @click="unfollow">
        <v-list-item-icon>
            <v-progress-circular size="20" indeterminate width="1" v-if="loading"></v-progress-circular>
            <v-icon color="primary" v-else>mdi-heart</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Remove from library</v-list-item-title>
    </v-list-item>
    <v-list-item v-else dense @click="follow">
        <v-list-item-icon>
            <v-progress-circular size="20" indeterminate width="1" v-if="loading"></v-progress-circular>
            <v-icon v-else>mdi-heart-outline</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Add to library</v-list-item-title>
    </v-list-item>
</template>

<script>
    export default {
        name: "FollowMenuItem",
        props: {
            item: {
                type: Object,
                default: null,
            },
        },
        data: () => ({
            loading: false,
        }),
        methods: {
            async follow() {
                this.loading = true;
                await this.$store.dispatch('follow' + this.typeCapitalized, this.item);
                this.loading = false;
            },
            async unfollow() {
                this.loading = true;
                await this.$store.dispatch('unfollow' + this.typeCapitalized, this.item);
                this.loading = false;
            },
        },
        computed: {
            typeCapitalized() {
                return this.item.type.substring(0, 1).toUpperCase() + this.item.type.substring(1);
            },
            isFollowed() {
                return this.$store.getters[`is${this.typeCapitalized}Followed`](this.item);
            }
        }
    }
</script>

<style scoped>
</style>