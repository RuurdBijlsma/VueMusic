<template>
    <v-card :width="500" outlined v-if="download !== null" :loading="!done">
        <div class="d-flex flex-no-wrap justify-space-between">
            <div>
                <v-card-title>{{download.track.name}}</v-card-title>
                <v-card-subtitle>
                    <artists-span :artists="download.track.artists" grey></artists-span>
                </v-card-subtitle>
            </div>
            <v-avatar class="ma-3"
                      size="125"
                      tile>
                <v-img :src="$store.getters.itemImage(download.track)"></v-img>
            </v-avatar>
        </div>
        <v-card-actions class="card-actions" v-if="done">
            <v-btn text>
                <v-icon color="error" v-if="download.state === 'Failed'">mdi-alert-circle-outline</v-icon>
                <v-icon color="success" v-else>mdi-check</v-icon>
                {{download.state}}
            </v-btn>
            <v-btn @click="dismiss" color="primary" text>Dismiss</v-btn>
        </v-card-actions>
        <v-card-actions class="card-actions" v-else>
            <v-btn disabled text>{{download.state}}...</v-btn>
            <v-btn @click="abort" color="error" text>Cancel</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";

    export default {
        name: "DownloadCard",
        components: {ArtistsSpan},
        props: {
            download: {
                type: Object,
                default: null,
            }
        },
        methods: {
            abort() {
                this.download.abortController.abort();
                this.dismiss();
            },
            dismiss() {
                this.$store.commit('removeDownload', this.download.track);
            },
        },
        computed: {
            done() {
                return ['Downloaded', 'Cancelled', 'Failed'].includes(this.download.state);
            }
        }
    }
</script>

<style scoped>
    .card-actions {
        display: flex;
        justify-content: space-between;
    }
</style>