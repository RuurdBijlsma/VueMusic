<template>
    <div class="album-square">
        <router-link tag="span" :to="`/${type}${album.hasOwnProperty('id')?`?id=${album.id}`:''}`">
            <div :class="{image: true, big}"
                 :style="{backgroundImage: `url(${image})`}"></div>
            <div class="text" :class="{big}">
                <p class="preview-title">{{album.name}}</p>
                <p
                        :title="album.description"
                        v-if="album.hasOwnProperty('description')"
                        class="preview-description"
                        v-html="album.description"/>
            </div>
        </router-link>
    </div>
</template>

<script>
    export default {
        name: "AlbumSquare",
        props: {
            big: {
                type: Boolean,
                default: false,
            },
            album: Object,
            type: {
                type: String,
                default: 'album',
            },
        },
        computed: {
            image() {
                if (this.type === 'category') {
                    if (this.album.icons.length > 0)
                        return this.album.icons[0].url;
                    else
                        return 'img/notfound.png';
                } else {
                    if (this.album.images.length > 0)
                        return this.album.images[0].url;
                    else
                        return 'img/notfound.png';
                }
            }
        }
    }
</script>

<style scoped>
    .album-square {
        cursor: pointer;
        display: inline-flex;
    }

    .image {
        width: 180px;
        height: 180px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 5px;
    }

    .image.big {
        height: 240px !important;
        width: 240px !important;
    }

    .text {
        max-width: 180px;
        padding: 5px;
        max-height: 40px;
    }

    .text.big {
        max-width: 240px;
        line-height: 14px;
    }

    .preview-title {
        font-weight: bold;
        font-size: 14px;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .preview-description {
        font-size: 14px;
        opacity: 0.7;
        font-weight: normal;
        margin-top: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

</style>