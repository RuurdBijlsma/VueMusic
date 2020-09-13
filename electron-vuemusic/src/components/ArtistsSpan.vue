<template>
    <span class="artists" :title="artists.map(a=>a.name).join(', ')">
        <span v-for="(artist, i) in artists" :key="artist.id">
            <router-link
                    :tag="grey ? 'span' : 'a'"
                    :style="{opacity: grey ? 0.7 : 1}"
                    class="artist"
                    :to="$store.getters.relativeItemUrl(artist)">{{artist.name}}</router-link>
            <span v-if="i!==artists.length - 1">, </span>
        </span>
    </span>
</template>

<script>
    export default {
        name: "ArtistsSpan",
        props: {
            grey: {
                type: Boolean,
                default: false,
            },
            artists: {
                type: Array,
                default: () => [],
            },
        },
    }
</script>

<style scoped>
    .artists {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        display: block;
    }

    .artist {
        font-weight: 500 !important;
        cursor: pointer;
    }

    .artist * {
        text-decoration: none !important;
    }

    .artist:hover {
        text-decoration: underline;
    }
</style>