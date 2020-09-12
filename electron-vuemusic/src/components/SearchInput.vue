<template>
    <v-form @submit.prevent="pushSearchTerm">
        <v-text-field
                v-model="$store.state.search.liveTerm"
                outlined
                label="Search"
                prepend-inner-icon="mdi-magnify"
                dense
                @click="goSearch"
        ></v-text-field>
    </v-form>
</template>

<script>
    export default {
        name: "SearchInput",
        methods: {
            async goSearch() {
                if (this.$route.name !== 'Search') {
                    await this.pushSearchTerm();
                }
            },
            async pushSearchTerm() {
                let term = '';
                if (this.$store.state.search.liveTerm !== '')
                    term = `?term=${encodeURIComponent(this.$store.state.search.liveTerm)}`;
                await this.$router.push(`/search${term}`)
            },
        },
    }
</script>

<style scoped>
</style>