<template>
    <v-app class="app">
        <v-navigation-drawer
                color="navBackground"
                class="navBar"
                v-if="$store.state.windowWidth > 680"
                v-model="drawer"
                :permanent="true"
                app
                absolute>
            <nav-content></nav-content>
        </v-navigation-drawer>

        <v-app-bar app class="toolbar" elevation="1">
            <tool-bar :mobile="$store.state.windowWidth <= 680"></tool-bar>
        </v-app-bar>

        <v-main class="scroll-container">
            <perfect-scrollbar class="perfect-scroller">
                <router-view class="router-view"></router-view>
            </perfect-scrollbar>
        </v-main>

        <v-card flat class="bottom-media-control" v-if="$store.state.windowWidth <= 680" color="primaryLight">
            <div class="info-pane">
                <media-info class="media-info"></media-info>
                <v-btn class="favorite-heart" icon>
                    <v-icon>mdi-heart-outline</v-icon>
                </v-btn>
            </div>
            <div class="full-controls">
                <media-controls :full="$store.state.windowWidth > 430"></media-controls>
                <media-seek class="seeker"></media-seek>
            </div>
        </v-card>
        <v-snackbar v-for="snack in $store.state.snackbars" app v-model="snack.open" :timeout="snack.timeout"
                    :outlined="!$vuetify.theme.dark" color="primary">
            {{ snack.text }}
            <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" :color="$vuetify.theme.dark ? 'default' : 'primary'"
                       @click="snack.open = false">
                    Dismiss
                </v-btn>
            </template>
        </v-snackbar>

        <v-bottom-navigation
                color="primary"
                grow
                :shift="$store.state.windowWidth <= 430"
                v-if="$store.state.windowWidth <= 680"
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
            <v-btn value="search" to="/search" exact>
                <span>Search</span>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
        </v-bottom-navigation>
    </v-app>
</template>

<script>
    import ToolBar from "@/components/ToolBar";
    import MediaInfo from "./components/MediaInfo";
    import MediaControls from "./components/MediaControls";
    import MediaSeek from "./components/MediaSeek";
    import NavContent from "./components/NavContent";

    //TOOD:
    //user page (is in api, for "created by" click)
    //Search
    //Radio page
    //Tune page (from browse)

    //After that, add functionality xd


    export default {
        name: 'App',
        components: {NavContent, MediaSeek, MediaControls, MediaInfo, ToolBar},
        data: () => ({
            drawer: true,
            cacheInterval: -1,
        }),
        async mounted() {
            await this.$store.dispatch('initialize');

            document.addEventListener('keypress', this.devListener);
            window.addEventListener('resize', this.resizeListener);

            window.onbeforeunload = e => {
                this.$store.commit('cacheAll');
                delete e['returnValue'];
            };
            let ipc = window.require('electron').ipcRenderer;
            ipc.on('before-quit', () => {
                this.$store.commit('cacheAll');
            });
            this.cacheInterval = setInterval(() => {
                this.$store.commit('cacheAll');
            }, 1000 * 60 * 5);//Cache every 5 minutes

            console.log(this.$store);
            if (!this.$store.getters.isKeySet) {
                if (this.$store.state.shouldSetKey && this.$route.name !== 'Settings') {
                    await this.$router.push('/settings');
                }
            } else if (!this.$store.getters.isLoggedIn && this.$route.name !== 'Settings') {
                await this.$router.push('/settings');
            }
        },
        beforeDestroy() {
            clearInterval(this.cacheInterval);
            document.removeEventListener('keypress', this.devListener);
            window.removeEventListener('resize', this.resizeListener);
        },
        methods: {
            resizeListener() {
                this.$store.commit('windowWidth', window.innerWidth);
            },
            devListener(e) {
                console.log(e.key);
                if (e.key === '`')
                    this.$store.dispatch('openDevTools');
                if (e.key === 'r' && e.ctrlKey)
                    location.reload();
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

    .router-view {
        /*position: absolute;*/
        width: 100%;
        height: 100%;
        position: absolute;
    }

    .perfect-scroller {

        height: 100%;
        overflow-y: auto;
    }

    .navBar {
        /*position: fixed;*/
    }

    .bottom-media-control {
        width: 100%;
        padding: 5px;
        bottom: 56px;
        position: relative;
    }

    .info-pane {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .info-pane > .media-info {
        flex-grow: 1;
    }

    .favorite-heart {
        min-width: 50px;
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
