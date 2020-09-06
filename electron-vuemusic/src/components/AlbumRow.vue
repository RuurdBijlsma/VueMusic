<template>
    <perfect-scrollbar class="album-container">
        <div class="column" v-for="(albumGroup, i) in albumGroups"
             :class="{last: i===albums.length-1}">
            <album-square v-for="album in albumGroup"
                          :big="big"
                          :type="type"
                          class="single-album"
                          :album="album"></album-square>
        </div>
    </perfect-scrollbar>
</template>

<script>
    import AlbumSquare from "./AlbumSquare";

    export default {
        name: "AlbumRow",
        components: {AlbumSquare},
        props: {
            albums: {
                type: Array,
                default: () => [],
            },
            big: {
                type: Boolean,
                default: false,
            },
            type: {
                type: String,
                default: 'album',
            },
            rows: {
                type: Number,
                default: 1,
            }
        },
        computed: {
            albumGroups() {
                let groups = [];
                for (let i = 0; i < this.albums.length; i += this.rows) {
                    groups.push(this.albums.slice(i, i + this.rows));
                }
                return groups;
            }
        }
    }
</script>

<style scoped>
    .album-container {
        position: relative;
        width: 100%;
        display: flex;
        padding: 0 15px;
        padding-bottom: 15px;
    }

    .single-album {
        display: inline-block;
        margin: 5px 15px;
    }

    .single-album.last {
        padding-right: 30px;
    }

</style>