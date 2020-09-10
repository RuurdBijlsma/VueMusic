<template>
    <div class="albums">
        <h1 class="page-title">Albums</h1>
        <v-divider class="divider"></v-divider>
        <div class="album-grid">
            <album-square show-year v-for="album in $store.state.library.albums" :key="album.id" :album="album"></album-square>
        </div>
    </div>
</template>

<script>
    import FollowButton from "../components/FollowButton";
    import FollowMenuItem from "../components/FollowMenuItem";
    import ShareMenuItem from "../components/ShareMenuItem";
    import AlbumSquare from "../components/AlbumSquare";

    export default {
        name: "Albums",
        components: {FollowButton, FollowMenuItem, ShareMenuItem, AlbumSquare},
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

    .page-title {
        font-size: 2.4rem;
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