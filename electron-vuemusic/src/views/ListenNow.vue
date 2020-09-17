<template>
    <div class="listen-now">
        <div class="padded">
            <h2>{{$store.state.homePage.featured.title.replace(/\\/gi,'')}}</h2>
        </div>

        <item-row class="item-row"
                  :items="$store.state.homePage.featured.playlists"
                  big
        ></item-row>

        <h2 class="padded" v-if="$store.state.media.recentlyPlayed.length > 0">Recently played</h2>
        <item-row class="item-row"
                  v-if="$store.state.media.recentlyPlayed.length > 0"
                  :items="$store.state.media.recentlyPlayed"
        ></item-row>

        <h2 class="padded">Made for you</h2>
        <item-row class="item-row"
                  :items="$store.state.homePage.personalized"
                  type="playlist"
        ></item-row>

        <h2 class="padded">New releases</h2>
        <item-row class="item-row"
                  :items="$store.state.homePage.newReleases"
                  type="album"
                  :rows="2"
                  big
        ></item-row>
    </div>
</template>

<script>
    import ItemSquare from "../components/ItemSquare";
    import ItemRow from "../components/ItemRow";

    export default {
        name: 'ListenNow',
        components: {ItemRow, ItemSquare},
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

    .item-row {

    }
</style>