<template>
    <div class="albums">
        <h1 class="page-title">Albums</h1>
        <v-divider class="divider"></v-divider>
        <div class="album-grid">
            <item-square show-year v-for="album in $store.state.library.albums" :key="album.id" :item="album"></item-square>
        </div>
    </div>
</template>

<script>
    import FollowButton from "../components/FollowButton";
    import FollowMenuItem from "../components/FollowMenuItem";
    import ShareMenuItem from "../components/ShareMenuItem";
    import ItemSquare from "../components/ItemSquare";

    export default {
        name: "Albums",
        components: {FollowButton, FollowMenuItem, ShareMenuItem, ItemSquare},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch("refreshUserData", 'album');
        },
        methods: {}
    }
</script>

<style scoped>
    .albums {
        padding: 30px;
    }

    .divider {
        margin-bottom: 20px;
    }

    .album-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        min-width: 186px;
        gap: 20px;
        justify-items: center;
    }
</style>