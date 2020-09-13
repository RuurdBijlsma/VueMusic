<template>
    <v-lazy class="item-square" :width="(big ? 240 : small ? 80 : 180)" :min-height="big ? 240 : small ? 80 : 180">
        <router-link tag="span" :to="$store.getters.relativeItemUrl(item)">
            <div class="image" :class="{big, small}"
                 :style="{
                    backgroundImage: `url(${$store.getters.itemImage(item)})`,
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
                <item-menu color="white" :fab="type==='artist'" v-if="!hideMenu" :item="item"></item-menu>
            </div>
            <div class="text" v-if="!noTitle" :class="{big,small}"
                 :style="{textAlign: type==='artist'?'center':'left'}">
                <p class="preview-title">{{item.name}}</p>
                <p
                        :title="item.description"
                        v-if="item.hasOwnProperty('description')"
                        class="preview-description"
                        v-html="item.description"/>
                <p class="preview-year" v-if="showYear">{{new Date(item.release_date).getFullYear()}}</p>
            </div>
        </router-link>
    </v-lazy>
</template>

<script>
    import ShareMenuItem from "./ShareMenuItem";
    import FollowMenuItem from "./FollowMenuItem";
    import ItemMenu from "./ItemMenu";

    export default {
        name: "ItemSquare",
        components: {ItemMenu, FollowMenuItem, ShareMenuItem},
        props: {
            big: {
                type: Boolean,
                default: false,
            },
            small: {
                type: Boolean,
                default: false,
            },
            item: {
                type: Object,
                default: null,
            },
            showYear: {
                type: Boolean,
                default: false,
            },
            noTitle: {
                type: Boolean,
                default: false,
            },
            hideMenu: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            playLoading: false,
        }),
        methods: {
            play(e) {
                this.playLoading = true;
                e.stopPropagation();
                console.log("Play")
            },
        },
        computed: {
            type() {
                if (!this.item.type)
                    return 'category';
                return this.item.type;
            },
        }
    }
</script>

<style scoped>
    .item-square {
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
        justify-content: space-between;
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