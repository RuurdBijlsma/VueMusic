<template>
    <span>
        <span v-for="(artist, i) in artists" :key="artist.id">
            <router-link class="artist" :to="artist.id">{{artist.name}}</router-link>
            <span v-if="i!==artists.length - 1">, </span>
        </span>
    </span>
</template>

<script>
    export default {
        name: "ArtistsSpan",
        props: {
            artists: {
                type: Array,
                default: () => [],
            }
        }
    }
</script>

<style scoped>
    .artist * {
        text-decoration: none !important;
    }

    .artist:hover {
        text-decoration: underline;
    }
</style>