<template>
    <v-app class="app">
        <v-navigation-drawer
                v-if="$store.state.windowWidth > 645"
                v-model="drawer"
                :expand-on-hover="false"
                :right="false"
                :permanent="true"
                app
                absolute>
            <nav-bar></nav-bar>
        </v-navigation-drawer>

        <v-app-bar v-if="$store.state.windowWidth > 645" app class="toolbar" elevation="1">
            <tool-bar></tool-bar>
        </v-app-bar>

        <v-main>
            <router-view></router-view>
        </v-main>

        <v-card flat class="bottom-media-control" v-if="$store.state.windowWidth <= 645" color="primaryLight">
            <media-info></media-info>
            <div class="full-controls">
                <media-controls :full="$store.state.windowWidth > 430"></media-controls>
                <media-seek class="seeker"></media-seek>
                <v-btn icon v-if="$store.state.windowWidth > 400">
                    <v-icon>mdi-heart</v-icon>
                </v-btn>
            </div>
        </v-card>

        <v-bottom-navigation
                color="primary"
                grow
                :shift="$store.state.windowWidth <= 430"
                v-if="$store.state.windowWidth <= 645"
                app>
            <v-btn value="now" to="/" exact>
                <span>Listen Now</span>
                <v-icon>mdi-play-circle-outline</v-icon>
            </v-btn>
            <v-btn value="browse" to="/browse" exact>
                <span>Browse</span>
                <v-icon>mdi-grid-large</v-icon>
            </v-btn>
            <v-btn value="library" to="/library" exact>
                <span>Library</span>
                <v-icon>mdi-record-circle-outline</v-icon>
            </v-btn>
            <v-btn value="account" to="/settings" exact>
                <span>Account</span>
                <v-icon>mdi-account-circle-outline</v-icon>
            </v-btn>
        </v-bottom-navigation>
    </v-app>
</template>

<script>
    import ToolBar from "@/components/ToolBar";
    import NavBar from "@/components/NavBar";
    import MediaInfo from "./components/MediaInfo";
    import MediaControls from "./components/MediaControls";
    import MediaSeek from "./components/MediaSeek";

    export default {
        name: 'App',
        components: {MediaSeek, MediaControls, MediaInfo, NavBar, ToolBar},
        data: () => ({
            drawer: true,
        }),
        async mounted() {
            window.addEventListener('resize', () => this.$store.commit('windowWidth', window.innerWidth));

            console.log(this.$store);
            await this.$store.dispatch('initialize');
            if (!this.$store.getters.isKeySet) {
                if (this.$store.state.shouldSetKey && this.$route.name !== 'Settings') {
                    await this.$router.push('/settings');
                }
            } else if (!this.$store.getters.isLoggedIn && this.$route.name !== 'Settings') {
                await this.$router.push('/settings');
            }
        }
    };
</script>
<style>
    @import url('https://fonts.googleapis.com/css?family=Roboto:400,400i,500,600,700,800,900&display=swap');
    @import url('https://cdn.materialdesignicons.com/5.0.45/css/materialdesignicons.min.css');

    html, body {
        overflow-y: auto;
    }

    .app {
        user-select: none;
        font-family: Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;
    }

    .toolbar {
        display: flex;
        justify-content: left;
        align-items: center;
        padding: 0;
    }

    .bottom-media-control {
        width: 100%;
        padding: 5px;
        bottom: 56px;
        position: relative;
    }

    .full-controls {
        height: 55px;
        display: flex;
        align-items: center;
        justify-content: space-around;
    }

    .seeker {
        margin: 0 20px;
    }
</style>
