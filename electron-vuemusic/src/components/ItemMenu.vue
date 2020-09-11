<template>
    <v-menu>
        <template v-slot:activator="{ on, attrs }">
            <v-btn :color="color" :fab="fab" :icon="!fab" :small="fab" v-on="on">
                <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
        </template>
        <v-list dense>
            <share-menu-item :item="item"></share-menu-item>
            <follow-menu-item v-if="type!=='category' && type!=='user'" :item="item"></follow-menu-item>
        </v-list>
    </v-menu>
</template>

<script>
    import ShareMenuItem from "./ShareMenuItem";
    import FollowMenuItem from "./FollowMenuItem";

    export default {
        name: "ItemMenu",
        components: {FollowMenuItem, ShareMenuItem},
        props: {
            item: {
                type: Object,
                default: null,
            },
            fab: {
                type: Boolean,
                default: false,
            },
            color: {
                type: String,
                default: 'default',
            },
        },
        computed: {
            type() {
                if (!this.item.type)
                    return 'category';
                return this.item.type;
            }
        }
    }
</script>

<style scoped>

</style>