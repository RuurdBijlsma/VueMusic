<template>
    <v-app class="app">
        <v-navigation-drawer
                v-model="drawer"
                :expand-on-hover="false"
                :right="false"
                :permanent="true"
                app
                absolute>
            <nav-bar></nav-bar>
        </v-navigation-drawer>

        <v-app-bar app class="toolbar" elevation="1">
            <tool-bar></tool-bar>
        </v-app-bar>
        <v-main>
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script>
    //make design in photoshop :)
    import ToolBar from "@/components/ToolBar";
    import NavBar from "@/components/NavBar";

    export default {
        name: 'App',
        components: {NavBar, ToolBar},
        data: () => ({
            drawer: true,
        }),
    };
</script>
<style>
    @import url('https://fonts.googleapis.com/css?family=Roboto:400,400i,500,600,700,800,900&display=swap');
    @import url('https://cdn.materialdesignicons.com/5.0.45/css/materialdesignicons.min.css');

    .app {
        user-select: none;
        font-family: Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;
    }

    .toolbar .drag-region {
        display: flex;
        justify-content: left;
        align-items: center;
        padding: 10px 20px;
    }
</style>
