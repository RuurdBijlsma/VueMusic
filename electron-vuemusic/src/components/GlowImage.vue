<template>
    <div class="glow-image" :style="{width: size+'px'}">
        <div class="album-art album-background"
             :style="{
                    backgroundImage: `url(${image})`,
                    opacity: $vuetify.theme.dark ? 0.4 : 0.7,
                    minWidth: size + 'px',
                    height: size + 'px',
                    right: (-size / 2) + 'px',
                    borderRadius: rounded ? '50%' : '5px',
                    top: (size / 16) + 'px',
                    filter: `blur(${size / 16}px)`,
                 }"></div>
        <div class="album-art album-normal" :style="{
            backgroundImage: `url(${image})`,
            minWidth: size+'px',
            height: size+'px',
            left: (-size/2)+'px',
            borderRadius: rounded ? '50%' : '5px',
        }"></div>
    </div>
</template>

<script>
    export default {
        name: "GlowImage",
        props: {
            url: {
                type: String,
                default: undefined,
            },
            size: {
                type: Number,
                default: 300,
            },
            rounded: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            image() {
                if (!this.url)
                    return this.$store.getters.notFoundImage;
                return this.url;
            }
        }
    }
</script>

<style scoped>
    .glow-image {
        display: inline-flex;
        justify-content: center;
    }

    .album-art {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
    }

    .album-background {
        transform: scale(0.95);
    }
</style>