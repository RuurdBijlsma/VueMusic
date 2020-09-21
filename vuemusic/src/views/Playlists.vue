<template>
    <div class="playlists">
        <h1 class="page-title">Playlists</h1>
        <v-divider class="divider"></v-divider>
        <div class="playlist-grid">
            <item-square v-for="playlist in $store.state.library.playlists" :key="playlist.id"
                         :item="playlist"></item-square>
        </div>
    </div>
</template>

<script>
    import FollowButton from "../components/FollowButton";
    import FollowMenuItem from "../components/FollowMenuItem";
    import ShareMenuItem from "../components/ShareMenuItem";
    import ItemSquare from "../components/ItemSquare";

    export default {
        name: "Playlists",
        components: {ItemSquare, FollowButton, FollowMenuItem, ShareMenuItem},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch("refreshUserData", 'playlist');
        },
        methods: {}
    }
</script>

<style scoped>
    .playlists {
        padding: 30px;
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