<template>
    <div class="seek"
         @mousedown="seekDown"
         @touchstart="touchDown">
        <span class="time" :class="smallTime ? 'smallTime':''">{{$store.getters.currentTimeHms}}</span>
        <v-sheet flat
                 class="seek-background"
                 :color="noBackground ? 'transparent' : 'default'"
                 ref="seekBar"
                 :style="{margin: smallTime ? '0 -50px' : '0 5px'}">
            <v-sheet color="primarySeek" class="seek-progress"
                     :style="{width: Math.round($store.getters.progress * 10000)/100+'%'}"
            ></v-sheet>
            <v-sheet color="primarySeek" class="seek-thumb"
                     :style="{left:'calc('+ Math.round($store.getters.progress * 10000)/100+'% - 5px)'}"
            ></v-sheet>
        </v-sheet>
        <span class="time" :class="smallTime ? 'smallTime':''">{{$store.getters.durationHms}}</span>
    </div>
</template>

<script>
    export default {
        name: "MediaSeek",
        props: {
            smallTime: {
                type: Boolean,
                default: false,
            },
            noBackground: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            seeking: false,
        }),
        mounted() {
            document.addEventListener('mousemove', this.seekMove);
            document.addEventListener('mouseup', this.seekUp);
            document.addEventListener('touchmove', this.touchMove);
            document.addEventListener('touchend', this.touchEnd);
        },
        beforeDestroy() {
            document.removeEventListener('mousemove', this.seekMove);
            document.removeEventListener('mouseup', this.seekUp);
            document.removeEventListener('touchmove', this.touchMove);
            document.removeEventListener('touchend', this.touchEnd);
        },
        methods: {
            touchDown(e) {
                this.seekDown(e.touches[0]);
            },
            touchMove(e) {
                this.seekMove(e.touches[0]);
            },
            touchEnd(e) {
                this.seekUp(e.touches[0]);
            },
            seekDown(e) {
                this.seeking = true;
                this.seekByEvent(e);
            },
            seekMove(e) {
                if (this.seeking) {
                    this.seekByEvent(e);
                }
            },
            seekByEvent(e) {
                let {left, width} = this.$refs.seekBar.$el.getBoundingClientRect();
                let x = e.pageX - left;
                let percentage = Math.max(Math.min(1, x / width), 0);
                console.log(percentage);
            },
            seekUp(e) {
                this.seeking = false;
            }
        }
    }
</script>

<style scoped>
    .seek {
        -webkit-app-region: no-drag;
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 20px;
        cursor: grab;
    }

    .seek:active {
        cursor: grabbing;
    }

    .seek > * {
        pointer-events: none;
    }

    .time {
        min-width: 40px;
        font-size: 13px;
        opacity: 0.6;
        font-weight: 500;
    }

    .time:last-child {
        text-align: right;
    }

    .smallTime {
        opacity: 0.5;
        font-size: 12px;
        margin: -15px 5px 0;
        min-width: 40px !important;
    }

    .seek-background {
        flex-grow: 1;
        height: 3px;
        border-radius: 2px;
    }

    .seek-progress {
        height: 100%;
        border-radius: 2px;
    }

    .seek-thumb {
        height: 7px;
        width: 7px;
        top: -5px;
        position: relative;
        border-radius: 50%;
    }
</style>