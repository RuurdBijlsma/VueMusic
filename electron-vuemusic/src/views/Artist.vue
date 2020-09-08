<template>
    <div class="artist" v-if="$store.state.artist[id]">
        <div class="banner">
            <div class="banner-background" :style="{
                backgroundImage: `url(${artist.images[0].url})`,
                opacity: $vuetify.theme.dark ? 0.1 : 0.3,
            }"></div>
            <div class="artist-center">
                <div class="artist-holder">
                    <div class="artist-image artist-image-background"
                         :style="{backgroundImage: `url(${artist.images[0].url})`}"></div>
                    <div class="artist-image real-artist"
                         :style="{backgroundImage: `url(${artist.images[0].url})`}"></div>
                </div>
            </div>
            <div class="banner-content">
                <div class="buttons">
                    <div class="left-banner-content">
                        <v-btn small color="primary" fab v-if="topTracks.length > 0">
                            <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <h1>{{artist.name}}</h1>
                    </div>
                    <v-btn color="primary" icon>
                        <v-icon>mdi-dots-horizontal</v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
        <v-card flat class="content">
            <div class="sub-caption">
                <span>{{artist.followers.total}} followers</span>
                <span v-if="artist.genres.length>0">
                <span class="dot">•</span>
                <span>{{artist.genres.join(" / ")}}</span>
                </span>
            </div>
            <v-divider class="divider"></v-divider>
            <div class="release-flex">
                <div class="latest-release" v-if="albums.length > 0">
                    <h3>Latest release</h3>
                    <album-square :album="albums[0]"></album-square>
                </div>
                <div class="tracks-container" v-if="topTracks.length > 0">
                    <h3>Top tracks</h3>
                    <div class="top-tracks">
                        <track-item v-for="track in topTracks" :key="track.id" :track="track"
                                    :album-list="false"></track-item>
                    </div>
                </div>
            </div>
            <v-divider class="divider"></v-divider>
            <div v-if="albums.length > 1">
                <h3>Albums</h3>
                <album-row :albums="albums" show-year class="album-row"></album-row>
            </div>
            <div v-if="singles.length > 0">
                <h3>Singles</h3>
                <album-row :albums="singles" show-year class="album-row"></album-row>
            </div>
            <div v-if="appearsOn.length > 0">
                <h3>Appears on</h3>
                <album-row :albums="appearsOn" show-year class="album-row"></album-row>
            </div>
            <div v-if="related.length > 0">
                <h3>Related artists</h3>
                <album-row :albums="related" type="artist" class="album-row"></album-row>
            </div>
        </v-card>
    </div>
</template>

<script>

    import TrackItem from "../components/TrackItem";
    import AlbumRow from "../components/AlbumRow";
    import AlbumSquare from "../components/AlbumSquare";

    export default {
        name: "Artist",
        components: {AlbumSquare, AlbumRow, TrackItem},
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
        },
        watch: {
            async '$route.query'() {
                // this.$refs.playlistPage.revertThemeColor();
                await this.$store.dispatch('loadArtist', this.id);
            },
        },
        beforeRouteLeave(to, from, next) {
            // this.$refs.playlistPage.revertThemeColor();
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

    .artist-image {
        position: relative;
        width: 250px;
        height: 250px;
        border-radius: 50%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        top: -125px;
    }

    .real-artist {
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.05);
    }

    .artist-image-background {
        position: relative;
        filter: blur(30px);
        opacity: 0.6;
        top: 135px;
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

    .top-tracks {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 17px;
        flex-grow: 1;
    }

    .album-row {
        margin-left: -30px;
        width: calc(100% + 60px);
    }
</style>