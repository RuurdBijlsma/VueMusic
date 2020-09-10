<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
            <v-btn :loading="loading" icon v-if="isFollowed" @click="unfollow" color="primary"
                   v-bind="attrs"
                   v-on="on">
                <v-icon>mdi-heart-outline</v-icon>
            </v-btn>
            <v-btn :loading="loading" icon v-else @click="follow"
                   v-bind="attrs"
                   v-on="on">
                <v-icon>mdi-heart-outline</v-icon>
            </v-btn>
        </template>
        <span v-if="isFollowed">Remove from library</span>
        <span v-else>Add to library</span>
    </v-tooltip>
</template>

<script>
    export default {
        name: "FollowButton",
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