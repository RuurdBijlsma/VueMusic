<template>
    <div class="album-square">
        <router-link tag="span" :to="`/${type}/${$store.getters.urlName(album.name)}/${album.id}`">
            <div class="image" :class="{big, small}"
                 :style="{
                    backgroundImage: `url(${image})`,
                    borderRadius: type === 'artist' ? '50%' : '5px',
                 }">
            </div>
            <div class="play-button" :class="{big, small}"
                 :style="{
                    borderRadius: type === 'artist' ? '50%' : '5px',
                 }">
                <v-btn :loading="playLoading" fab small color="primary" @click="play">
                    <v-icon color="white">mdi-play</v-icon>
                </v-btn>
            </div>
            <div class="text" v-if="!noTitle" :class="{big,small}">
                <p class="preview-title">{{album.name}}</p>
                <p
                        :title="album.description"
                        v-if="album.hasOwnProperty('description')"
                        class="preview-description"
                        v-html="album.description"/>
                <p class="preview-year" v-if="showYear">{{new Date(album.release_date).getFullYear()}}</p>
            </div>
        </router-link>
    </div>
</template>

<script>
    import Utils from "../js/Utils";

    export default {
        name: "AlbumSquare",
        props: {
            big: {
                type: Boolean,
                default: false,
            },
            small: {
                type: Boolean,
                default: false,
            },
            album: Object,
            type: {
                type: String,
                default: 'album',
            },
            showYear: {
                type: Boolean,
                default: false,
            },
            noTitle: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            playLoading: false,
        }),
        methods: {
            urlName(artist) {
                return Utils.urlName(artist);
            },
            play(e) {
                this.playLoading = true;
                e.stopPropagation();
                console.log("Play")
            },
        },
        computed: {
            image() {
                if (this.type === 'category') {
                    if (this.album.icons.length > 0)
                        return this.album.icons[0].url;
                    else
                        return this.$store.getters.notFoundImage;
                } else {
                    if (this.album.images.length > 0)
                        return this.album.images[0].url;
                    else
                        return this.$store.getters.notFoundImage;
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
        box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .image.big {
        height: 240px !important;
        width: 240px !important;
    }

    .image.small {
        height: 80px !important;
        width: 80px !important;
    }

    .play-button:hover {
        opacity: 1;
    }

    .play-button {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        opacity: 0;
        width: 180px;
        height: 180px;
        margin-top: -180px;
        display: flex;
        justify-content: start;
        align-items: flex-end;
        transition: opacity 0.2s;
        padding: 15px;
    }

    .play-button.small {
        height: 80px !important;
        width: 80px !important;
        margin-top: -80px;
        justify-content: center;
        align-items: center;
    }

    .play-button.big {
        height: 240px !important;
        width: 240px !important;
        margin-top: -240px;
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

    .text.small {
        max-width: 80px;
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
        margin-bottom: 0px;
    }

    .preview-year {
        font-size: 14px;
        opacity: 0.7;
        font-weight: normal;
        margin-top: 3px;
        margin-bottom: 0px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

</style>