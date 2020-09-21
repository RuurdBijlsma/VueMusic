<template>
    <div class="logo">
        <img class="logo-image"
             :src="$vuetify.theme.dark ? 'img/full-white-medium.png':'img/full-black-medium.png' "
             alt="logo image"/>
        <span>
                    Vue Music
                </span>
    </div>
</template>

<script>
    export default {
        name: "Logo"
    }
</script>

<style scoped>
    .logo {
        margin-top: 2px;
        margin-left: 2px;
        padding: 15px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        -webkit-app-region: drag;
    }

    .logo-image {
        height: 20px;
        margin-right: 10px;
        pointer-events: none;
    }
</style>