<template>
    <div class="artist" v-if="$store.state.artist[id]">
        <div class="banner">
            <div class="banner-background" :style="{
                backgroundImage: `url(${$store.getters.itemImage(artist)})`,
                opacity: $vuetify.theme.dark ? 0.1 : 0.3,
            }"></div>
            <div class="artist-center">
                <glow-image rounded :url="$store.getters.itemImage(artist)" :size="250"></glow-image>
            </div>
            <div class="banner-content">
                <div class="buttons">
                    <div class="left-banner-content">
                        <v-btn small color="primary" fab v-if="topTracks.length > 0"
                               @click="$store.dispatch('playItem', {item: {...artist, tracks: topTracks}})">
                            <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <h1>{{artist.name}}</h1>
                    </div>
                    <item-menu :item="artist" color="primary"></item-menu>
                </div>
            </div>
        </div>
        <v-card tile flat class="content">
            <div class="sub-caption">
                <span>{{artist.followers.total}} followers</span>
                <span v-if="artist.genres.length>0">
                <span class="dot">•</span>
                <span>{{artist.genres.join(" / ")}}</span>
                </span>
            </div>
            <v-divider class="divider"></v-divider>
            <div class="release-flex">
                <div class="latest-release" v-if="latestRelease !== null">
                    <h3>Latest release</h3>
                    <item-square :item="latestRelease"></item-square>
                </div>
                <div class="tracks-container" v-if="topTracks.length > 0">
                    <h3>Top tracks</h3>
                    <track-grid :tracks="topTracks" :context-item="{...artist, tracks: topTracks}"></track-grid>
                </div>
            </div>
            <v-divider class="divider" v-if="topTracks.length > 0"></v-divider>
            <div v-if="albums.length > 0">
                <h3>Albums</h3>
                <item-row :items="albums" show-year class="item-row"></item-row>
            </div>
            <div v-if="singles.length > 0">
                <h3>Singles</h3>
                <item-row :items="singles" show-year class="item-row"></item-row>
            </div>
            <div v-if="appearsOn.length > 0">
                <h3>Appears on</h3>
                <item-row :items="appearsOn" show-year class="item-row"></item-row>
            </div>
            <div v-if="related.length > 0">
                <h3>Related artists</h3>
                <item-row :items="related" class="item-row"></item-row>
            </div>
        </v-card>
    </div>
</template>

<script>

    import TrackItem from "../components/TrackItem";
    import ItemRow from "../components/ItemRow";
    import ItemSquare from "../components/ItemSquare";
    import ShareMenuItem from "../components/ShareMenuItem";
    import FollowMenuItem from "../components/FollowMenuItem";
    import ItemMenu from "../components/ItemMenu";
    import GlowImage from "../components/GlowImage";
    import TrackGrid from "../components/TrackGrid";

    export default {
        name: "Artist",
        components: {TrackGrid, GlowImage, ItemMenu, FollowMenuItem, ShareMenuItem, ItemSquare, ItemRow, TrackItem},
        data: () => ({}),
        async mounted() {
            await this.$store.dispatch('loadArtist', this.id);
        },
        computed: {
            id() {
                return this.$route.params.id;
            },
            data() {
                console.log('Artist', this.$store.state.artist[this.id]);
                return this.$store.state.artist[this.id];
            },
            artist() {
                return this.data.artist;
            },
            related() {
                return this.data.related;
            },
            topTracks() {
                return this.data.tracks;
            },
            albums() {
                if (Array.isArray(this.data.albums))
                    return this.data.albums.filter(a => a.album_group === 'album').slice(0, 50);
                return [];
            },
            singles() {
                if (Array.isArray(this.data.albums))
                    return this.data.albums.filter(a => a.album_group === 'single').slice(0, 50);
                return [];
            },
            appearsOn() {
                if (Array.isArray(this.data.albums))
                    return this.data.albums.filter(a => a.album_group === 'appears_on').slice(0, 50);
                return [];
            },
            latestRelease() {
                if (this.albums.length === 0 && this.singles.length > 0)
                    return this.singles[0];
                if (this.albums.length > 0 && this.singles.length === 0)
                    return this.albums[0];
                if (this.albums.length === 0 && this.singles.length === 0)
                    return null;
                let latestAlbum = new Date(this.albums[0].release_date);
                let latestSingle = new Date(this.singles[0].release_date);
                if (latestAlbum > latestSingle)
                    return this.albums[0];
                return this.singles[0];
            },
        },
        watch: {
            async '$route.query'() {
                await this.$store.dispatch('loadArtist', this.id);
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


    .artist-center {
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
        margin-left: 20px;
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

    .dot {
        margin: 0 10px;
    }

    .divider {
        margin: 15px 0;
    }

    .release-flex {
        display: flex;
    }

    @media (max-width: 800px) {
        .release-flex {
            flex-direction: column;
        }
    }

    .latest-release {
        margin-right: 30px;
    }

    .tracks-container {
        width: 100%;
    }

    .item-row {
        margin-left: -30px;
        width: calc(100% + 60px);
    }
</style>