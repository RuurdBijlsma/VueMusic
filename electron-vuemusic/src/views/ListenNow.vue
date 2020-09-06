<template>
    <div class="listen-now">
        <div class="padded">
            <h1 class="page-title">Listen Now</h1>
            <v-divider></v-divider>
            <h2>{{$store.state.homePage.featured.title}}</h2>
        </div>
        <album-row class="album-row"
                   :albums="$store.state.homePage.featured.playlists"
                   type="playlist"
                   big
        ></album-row>

        <h2 class="padded">Made for you</h2>
        <album-row class="album-row"
                   :albums="$store.state.homePage.personalized"
                   type="playlist"
        ></album-row>

        <h2 class="padded">New releases</h2>
        <album-row class="album-row"
                   :albums="$store.state.homePage.newReleases"
                   type="album"
                   :rows="2"
                   big
        ></album-row>
    </div>
</template>

<script>
    import AlbumSquare from "../components/AlbumSquare";
    import AlbumRow from "../components/AlbumRow";

    export default {
        name: 'ListenNow',
        components: {AlbumRow, AlbumSquare},
        mounted() {
            this.$store.dispatch('refreshHomePage');
        }
    }
</script>
<style scoped>
    .listen-now {
        padding: 0px;
        padding-top: 20px;
        padding-bottom: 30px;
    }

    .padded {
        padding: 10px 30px;
    }

    .page-title {
        font-size: 2.4rem;
    }

    .album-row {

    }
</style>