<template>
    <div class="user" v-if="$store.state.user[id]">
        <div class="banner">
            <div class="banner-background" :style="{
                backgroundImage: `url(${image})`,
                opacity: $vuetify.theme.dark ? 0.1 : 0.3,
            }"></div>
            <div class="user-center">
                <glow-image rounded :url="image" :size="250"></glow-image>
            </div>
            <div class="banner-content">
                <div class="buttons">
                    <div class="left-banner-content">
                        <h1>{{user.display_name}}</h1>
                    </div>
                    <item-menu :item="user" color="primary"></item-menu>
                </div>
            </div>
        </div>
        <v-card tile flat class="content">
            <div class="sub-caption">
                <span>{{user.followers.total}} followers</span>
            </div>
            <v-divider class="divider"></v-divider>
            <h2 class="playlists-title" v-if="user.playlists.length > 0">User playlists</h2>
            <div class="playlists-grid">
                <album-square v-for="playlist in user.playlists" :key="playlist.id" :album="playlist"></album-square>
            </div>
        </v-card>
    </div>
</template>

<script>

    import TrackItem from "../components/TrackItem";
    import AlbumRow from "../components/AlbumRow";
    import AlbumSquare from "../components/AlbumSquare";
    import ShareMenuItem from "../components/ShareMenuItem";
    import FollowMenuItem from "../components/FollowMenuItem";
    import ItemMenu from "../components/ItemMenu";
    import GlowImage from "../components/GlowImage";

    export default {
        name: "User",
        components: {GlowImage, ItemMenu, FollowMenuItem, ShareMenuItem, AlbumSquare, AlbumRow, TrackItem},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch('loadUser', this.id);
        },
        computed: {
            id() {
                return this.$route.params.id;
            },
            user() {
                console.log('User', this.$store.state.user[this.id]);
                return this.$store.state.user[this.id];
            },
            image() {
                if (this.user.images.length === 0)
                    return this.$store.getters.notFoundImage;
                return this.user.images[0].url
            },
        },
        watch: {
            async '$route.query'() {
                await this.$store.dispatch('loadUser', this.id);
            },
        },
        beforeRouteLeave(to, from, next) {
            next();
        },
    }
</script>

<style scoped>
    .banner {
        width: 100%;
        height: 30vw;
        min-height: 400px;
    }

    .banner-background {
        width: 100%;
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        filter: blur(30px);
        opacity: 0.1;
    }


    .user-center {
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: relative;
        top: -100%;
        align-items: center;
    }

    .banner-content {
        width: 100%;
        height: 100%;
        position: relative;
        top: -200%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
        padding: 10px 30px;
        width: 100%;
        align-items: center;
    }

    .left-banner-content {
        display: flex;
        align-items: center;
        font-weight: bold;
    }

    .left-banner-content > *:last-child {
    }

    .content {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 30px;
        padding-top: 20px;
    }

    .content h3 {
        margin-bottom: 10px;
    }

    .sub-caption {
        text-transform: uppercase;
        font-size: 12px;
        font-weight: bolder;
        opacity: 0.7;
    }

    .divider {
        margin: 15px 0;
    }

    .playlists-title {
        margin-top: 0px;
        margin-bottom: 15px;
    }

    .playlists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        min-width: 186px;
        gap: 20px;
        justify-items: center;
    }
</style>