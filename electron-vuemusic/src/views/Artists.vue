<template>
    <div class="artists">
        <h1 class="page-title">Artists</h1>
        <div v-for="(artist, i) in $store.state.library.artists" :key="artist.id">
            <v-divider v-if="i === 0"></v-divider>
            <div class="artist">
                <item-square hide-menu small :item="artist" no-title></item-square>
                <router-link tag="span" :to="`/artist/${artist.name}/${artist.id}`" class="artist-title">
                    {{artist.name}}
                </router-link>
                <div class="icons">
                    <follow-button :item="artist"></follow-button>
                    <item-menu :item="artist"></item-menu>
                </div>
            </div>
            <v-divider></v-divider>
        </div>
    </div>
</template>

<script>
    import ItemSquare from "../components/ItemSquare";
    import ShareMenuItem from "../components/ShareMenuItem";
    import FollowMenuItem from "../components/FollowMenuItem";
    import FollowButton from "../components/FollowButton";
    import ItemMenu from "../components/ItemMenu";

    export default {
        name: "Artists",
        components: {ItemMenu, FollowButton, FollowMenuItem, ShareMenuItem, ItemSquare},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch("refreshUserData", 'artist');
            console.log(this.$store.state.library)
        },
        methods: {}
    }
</script>

<style scoped>
    .artists {
        padding: 30px;
    }

    .page-title {
        font-size: 2.4rem;
    }

    .artist {
        display: flex;
        margin: 15px 0;
        align-items: center;
    }

    .artist-title {
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        margin-left: 30px;
        flex-grow: 1;
        display: block;
        height: 80px;
        line-height: 80px;
    }

    .artist-title:hover {
        text-decoration: underline;
    }

    .icons {
        display: flex;
    }
</style>