<template>
    <v-list-item @click="share">
        <v-list-item-icon>
            <v-progress-circular size="20" indeterminate width="1" v-if="loading"></v-progress-circular>
            <v-icon v-else>mdi-share</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Share</v-list-item-title>
    </v-list-item>
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
        }),
        methods: {
            async share() {
                this.loading = true;
                await this.$store.dispatch('share', {
                    item: this.item,
                    copy: this.$copyText,
                });
                this.loading = false;
            }
        }
    }
</script>

<style scoped>

</style>