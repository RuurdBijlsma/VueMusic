<template>
    <div class="downloads">
        <div class="wide">
            <h1 class="page-title">Downloads</h1>
            <v-divider class="divider"></v-divider>
            <h3 v-if="$store.state.media.downloads.length === 0">No active downloads</h3>
            <download-card class="card" v-for="download in $store.state.media.downloads" :key="download.track.id"
                           :download="download"></download-card>
        </div>
    </div>
</template>

<script>
    import ArtistsSpan from "@/components/ArtistsSpan";
    import DownloadCard from "@/components/DownloadCard";

    export default {
        name: "Downloads",
        components: {DownloadCard, ArtistsSpan},
        data: () => ({}),
        async mounted() {
        },
        methods: {},
        watch: {}
    }
</script>

<style scoped>
    .wide {
        padding: 30px;
        max-width: 800px;
        display: block;
        margin: 0 auto;
    }

    .divider {
        margin-bottom: 20px;
    }

    .card {
        /*max-width: 400px;*/
        margin-bottom: 15px;
    }

    .card:last-child {
        margin-bottom: 0;
    }
</style>