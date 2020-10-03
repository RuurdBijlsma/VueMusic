<template>
    <v-form @submit.prevent="pushSearchTerm">
        <v-text-field
                clearable
                v-model="$store.state.search.liveTerm"
                outlined
                label="Search"
                prepend-inner-icon="mdi-magnify"
                dense
                @click:clear="$store.state.search.liveTerm=''"
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
                if (this.term !== null && this.term !== '')
                    term = `?term=${encodeURIComponent(this.term)}`;
                await this.$router.push(`/search${term}`)
            },
        },
        watch: {
            async term() {
                //https://open.spotify.com/track/7AVjkh7mhpeNa3iu3R9oyp?si=BGamcimjRt-WYX5weeaYhw
                if (this.term && this.term.includes('open.spotify.com/')) {
                    let term = this.term.split('spotify.com/')[1].split('?')[0];
                    let [type, id] = term.split('/');
                    await this.$router.push(this.$store.getters.relativeItemUrl({type, id, name: type[0],}));
                    this.$store.dispatch('addSnack', {text: 'Navigated to Spotify™ link'}).then();
                    this.$store.commit('liveTerm', '');
                }
            },
        },
        computed: {
            term() {
                return this.$store.state.search.liveTerm;
            },
        },
    }
</script>

<style scoped>
</style>