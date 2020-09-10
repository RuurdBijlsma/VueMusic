<template>
    <div class="artists">
        <h1 class="page-title">Artists</h1>
        <div v-for="(artist, i) in $store.state.library.artists" :key="artist.id">
            <v-divider v-if="i === 0"></v-divider>
            <div class="artist">
                <album-square small :album="artist" type="artist" no-title></album-square>
                <router-link tag="span" :to="`/artist/${artist.name}/${artist.id}`" class="artist-title">
                    {{artist.name}}
                </router-link>
                <div class="icons">
                    <follow-button :item="artist"></follow-button>
                    <v-menu>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn icon v-on="on">
                                <v-icon>mdi-dots-horizontal</v-icon>
                            </v-btn>
                        </template>
                        <v-list dense>
                            <share-menu-item :item="artist"></share-menu-item>
                            <follow-menu-item :item="artist"></follow-menu-item>
                        </v-list>
                    </v-menu>
                </div>
            </div>
            <v-divider></v-divider>
        </div>
    </div>
</template>

<script>
    import AlbumSquare from "../components/AlbumSquare";
    import ShareMenuItem from "../components/ShareMenuItem";
    import FollowMenuItem from "../components/FollowMenuItem";
    import FollowButton from "../components/FollowButton";

    export default {
        name: "Artists",
        components: {FollowButton, FollowMenuItem, ShareMenuItem, AlbumSquare},
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