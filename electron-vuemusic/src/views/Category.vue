<template>
    <div class="category" v-if="category">
        <h1 class="page-title">{{category.name}}</h1>
        <v-divider class="divider"></v-divider>
        <div class="playlist-grid">
            <item-square v-for="playlist in category.playlists" :item="playlist"></item-square>
        </div>
    </div>
</template>

<script>
    import ItemSquare from "../components/ItemSquare";

    export default {
        name: "Playlist",
        components: {ItemSquare},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch('loadCategory', this.id);
        },
        computed: {
            id() {
                return this.$route.params.id;
            },
            category() {
                console.log('Category', this.$store.state.category[this.id]);
                return this.$store.state.category[this.id]
            },
        },
        watch: {
            async '$route.params.id'() {
                await this.$store.dispatch('loadCategory', this.id);
            },
        },
        beforeRouteLeave(to, from, next) {
            next();
        },
    }
</script>
<style scoped>
    .category {
        padding: 30px;
    }

    .page-title {
        font-size: 2.4rem;
    }

    .divider {
        margin-bottom: 20px;
    }

    .playlist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        min-width: 186px;
        gap: 20px;
        justify-items: center;
    }
</style>