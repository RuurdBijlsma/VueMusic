<template>
    <div class="browse">
        <div class="dual-container">
            <div class="categories">
                <h2>Curated lists</h2>
                <div class="category-grid">
                    <item-square
                            type="category"
                            :item="category"
                            class="category"
                            v-for="category in $store.state.browse.categories"></item-square>
                </div>
            </div>
            <div class="genres">
                <div class="centerer">
                    <h2>Genres</h2>
                    <v-btn outlined class="custom-radio-button" to="/tune">Generate Custom Radio</v-btn>
                </div>
                <div class="genre-grid">
                    <v-chip
                            class="genre"
                            :to="`/radio?seed_genres=${genre.replace(/ /gi, '-').toLowerCase()}`"
                            v-for="genre in $store.state.browse.genres"
                    >{{genre}}
                    </v-chip>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ItemSquare from "../components/ItemSquare";

    export default {
        name: "Browse",
        components: {ItemSquare},
        mounted() {
            this.$store.dispatch('refreshBrowsePage');
        }
    }
</script>

<style scoped>
    .browse {
        padding: 30px;
    }

    .dual-container {
        display: flex;
    }

    .categories {
        flex-grow: 1;
    }

    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
        min-width: 186px;
        justify-items: center;
        margin-top: 10px;
    }

    .category {
        margin-bottom: 15px;
        /*filter: brightness(2);*/
    }

    .genres {
        flex-grow: 20;
        max-width: 400px;
        margin-left: 30px;
    }

    .centerer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 20px;
    }

    .centerer > h2 {
        margin: 0;
        padding: 0;
    }

    .genre-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 17px;
    }

    @media (max-width: 1090px) {
        .dual-container {
            flex-direction: column;
        }

        .genres {
            margin-left: 0;
            max-width: 100%;
        }
    }

</style>