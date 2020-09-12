<template>
    <div>
        <search-input class="search-input" v-if="$store.state.windowWidth <= 680"></search-input>
        <search-results v-if="result" :result="result"></search-results>
        <div class="padded" v-else-if="$store.state.search.recent.length > 0"
             :style="{paddingTop:$store.state.windowWidth <= 680?'0':'30px'}">
            <h3>Recent searches</h3>
            <v-list rounded class="recent-list">
                <v-list-item v-for="searchTerm in $store.state.search.recent" :key="searchTerm"
                             @click="$router.push(`/search?term=${encodeURIComponent(searchTerm)}`)">
                    <v-list-item-icon>
                        <v-icon>mdi-magnify</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{searchTerm}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </div>
    </div>
</template>

<script>
    import SearchResults from "../components/SearchResults";
    import SearchInput from "../components/SearchInput";

    export default {
        name: "Search",
        components: {SearchInput, SearchResults},
        data: () => ({}),
        mounted() {
            this.performSearch();
        },
        methods: {
            performSearch() {
                if (this.$route.query.hasOwnProperty('term')) {
                    if (this.$store.state.search.liveTerm !== this.$route.query.term) {
                        this.$store.commit('liveTerm', this.$route.query.term);
                    }
                    this.$store.dispatch('search', this.$route.query.term);
                }
            }
        },
        watch: {
            '$route.query.term'() {
                this.performSearch();
            },
        },
        computed: {
            result() {
                return this.$store.state.search.results[this.$route.query.term];
            },
        },
    }
</script>

<style scoped>
    .search-input {
        margin: 30px 30px 0;
    }

    .padded {
        margin: 30px;
        margin-top: 0px;
    }

    .recent-list {
        margin-top: 10px;
    }
</style>