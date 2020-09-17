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
            <div class="perfect-scroller">
                <router-view class="router-view"></router-view>
            </div>
        </v-main>

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

        <v-card flat class="bottom-media-control"
                v-if="$store.state.windowWidth <= 680 && $store.getters.isTrackSet" color="primaryLight">
            <div class="info-pane">
                <media-info class="media-info"></media-info>
                <follow-button class="button" :item="$store.state.media.track"></follow-button>
                <queue-button class="button"></queue-button>
            </div>
            <div class="full-controls">
                <media-controls :full="$store.state.windowWidth > 430"></media-controls>
                <media-seek class="seeker"></media-seek>
            </div>
        </v-card>

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
            <v-btn value="library" to="/library">
                <span>Library</span>
                <v-icon>mdi-record-circle-outline</v-icon>
            </v-btn>
            <v-btn value="search" to="/search">
                <span>Search</span>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
        </v-bottom-navigation>

        <music-player></music-player>
    </v-app>
</template>

<script>
    import ToolBar from "./components/ToolBar";
    import MediaInfo from "./components/MediaInfo";
    import MediaControls from "./components/MediaControls";
    import MediaSeek from "./components/MediaSeek";
    import NavContent from "./components/NavContent";
    import FollowButton from "./components/FollowButton";
    import QueueButton from "./components/QueueButton";
    import MusicPlayer from "./components/MusicPlayer";

    //TOOD:
    //maybe remove spotify stuff from store.js into spotify-module.js (probably not needed until more stuff starts to clutter base store.js)
    //Delete cache every week or so to prevent massive cache causing lag (see first if lag actually happens)
    //check shuffle button size maybe
    //maybe add play/shuffle to track grid/ search results and artist tracks

    //like dislike global keyboard shortcut
    //click media notification -> open app
    //media controls in windows taskbar preview
    //icon to show if current track is local
    //first load loads playlists in reverse order
    //start on page where you quit the application
    //fix toolbar icons when song is null
    //express not found in build
    //remove all windows.require
    //holding seek down to the right of the seek bar skips next very often


    export default {
        name: 'App',
        components: {MusicPlayer, QueueButton, FollowButton, NavContent, MediaSeek, MediaControls, MediaInfo, ToolBar},
        data: () => ({
            drawer: true,
            cacheInterval: -1,
        }),
        async mounted() {
            await this.$store.dispatch('initialize');

            document.addEventListener('keypress', this.devListener);
            window.addEventListener('resize', this.resizeListener);

            window.onbeforeunload = e => {
                if (!this.$store.state.dontCache) {
                    this.$store.commit('cacheAll');
                    this.$store.commit('cacheAllMedia');
                }
                delete e['returnValue'];
            };

            if (this.$store.state.platform.type === 'electron') {
                window.require('electron').ipcRenderer.on('before-quit', () => {
                    this.$store.commit('cacheAll');
                });
            }
            this.cacheInterval = setInterval(() => {
                this.$store.commit('cacheAll');
                this.$store.commit('cacheAllMedia');
            }, 1000 * 60 * 5);//Cache every 5 minutes.

            console.log(this.$store);
            if (!this.$store.getters.isKeySet) {
                if (this.$store.state.platform.shouldSetKey && this.$route.name !== 'Settings') {
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

    h1 {
        font-size: 1.8rem;
    }

    h1, h2, h3, h4, h5 {
        font-weight: bold;
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
        overflow-y: auto;
    }

    .perfect-scroller {

        height: 100%;
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

    .button {
        min-width: 50px;
        display: flex;
        justify-content: center;
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
