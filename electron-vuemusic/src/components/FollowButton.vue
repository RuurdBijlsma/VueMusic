<template>
    <div class="follow-button" v-if="item !== null">
        <v-tooltip top v-if="!hideTooltip">
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
        <div v-else>
            <v-btn :loading="loading" icon v-if="isFollowed" @click="unfollow" color="primary">
                <v-icon>mdi-heart-outline</v-icon>
            </v-btn>
            <v-btn :loading="loading" icon v-else @click="follow">
                <v-icon>mdi-heart-outline</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
    export default {
        name: "FollowButton",
        props: {
            item: {
                type: Object,
                default: null,
            },
            hideTooltip: {
                type: Boolean,
                default: false,
            }
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
    .follow-button {

    }
</style>