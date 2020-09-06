<template>
    <div class="toolbar">
        <div></div>
        <media-controls full class="controls"></media-controls>
        <div class="media-info">
            <media-seek class="top-seeker" no-background small-time></media-seek>
            <media-info class="top-info"></media-info>
        </div>
        <div class="volume">
            <v-slider
                    :min="0"
                    :max="1"
                    :step="0.01"
                    v-model="volume"
                    :prepend-icon="volumeIcon"
                    @click:prepend="toggleMute"
            ></v-slider>
        </div>
        <div class="buttons">
            <v-btn icon>
                <v-icon>mdi-heart-outline</v-icon>
            </v-btn>
            <v-btn icon>
                <v-icon>mdi-format-list-bulleted</v-icon>
            </v-btn>
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                            color="primary"
                            icon
                            v-bind="attrs"
                            v-on="on">
                        <v-icon>mdi-account-circle</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item two-line v-if="$store.getters.isLoggedIn">
                        <v-list-item-avatar>
                            <img :src="$store.state.userInfo.avatar" alt="User Avatar">
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-title>{{$store.state.userInfo.name}}</v-list-item-title>
                            <v-list-item-subtitle>{{$store.state.userInfo.mail}}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item to="/settings">
                        <v-list-item-icon>
                            <v-icon>mdi-cog-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>Settings</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item @click="$store.dispatch('spotifyLogout')" color="primary"
                                 v-if="$store.getters.isLoggedIn">
                        <v-list-item-icon>
                            <v-icon>mdi-logout</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>Logout</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item @click="$store.dispatch('spotifyLogin')" color="primary"
                                 v-else-if="$store.getters.isKeySet">
                        <v-list-item-icon>
                            <v-icon>mdi-login</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>Login</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>
    </div>
</template>

<script>
    import MediaInfo from "./MediaInfo";
    import MediaControls from "./MediaControls";
    import MediaSeek from "./MediaSeek";

    export default {
        name: "ToolBar",
        components: {MediaSeek, MediaControls, MediaInfo},
        data: () => ({
            volume: 1,
            prevVolume: 1,
        }),
        methods: {
            toggleMute() {
                if (this.volume > 0) {
                    this.prevVolume = this.volume;
                    this.volume = 0;
                } else {
                    this.volume = this.prevVolume;
                }
            },
        },
        computed: {
            volumeIcon() {
                if (this.volume === 0) {
                    return 'mdi-volume-mute';
                } else if (this.volume < 0.5) {
                    return 'mdi-volume-medium';
                } else {
                    return 'mdi-volume-high';
                }
            },
            adjustedVolume() {
                return this.volume ** 2;
            }
        }
    }
</script>

<style scoped>
    .toolbar {
        -webkit-app-region: drag;
        display: flex;
        justify-content: space-between;
        width: calc(100% + 32px);
        height: calc(100% + 8px);
        margin: -8px -16px;
        align-items: center;
    }

    .controls {
        margin-left: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .controls > * {
        -webkit-app-region: no-drag;
    }

    .media-info {
        -webkit-app-region: no-drag;
        flex-grow: 10;
        margin: 0 10px;
        max-width: 500px;
    }

    .top-seeker {
        width: calc(100% - 68px);
        margin-left: 58px;
        position: relative;
        top: 39px;
        z-index: 5;
    }

    .top-info {
        margin-top: -20px;
    }

    .volume {
        -webkit-app-region: no-drag;
        min-width: 100px;
        max-width: 160px;
        height: 32px;
        flex-grow: 1;
    }

    .buttons {
        margin: 0 5px;
    }

    .buttons > * {
        -webkit-app-region: no-drag;
    }

    @media (max-width: 959px) {
        .volume {
            display: none;
        }
    }

    @media (max-width: 870px) {
        .controls {
            display: none !important;
        }

        .media-info {
            margin-left: 3px;
            margin-right: 0px;
        }

        .top-seeker {
            margin-left: 51px;
            width: calc(100% - 61px);
        }
    }
</style>