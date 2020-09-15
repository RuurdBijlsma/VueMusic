<template>
    <div class="toolbar">
        <logo class="logo" v-if="mobile"></logo>
        <media-controls full class="controls" v-if="!mobile"></media-controls>
        <div class="media-container" v-if="!mobile && $store.getters.isTrackSet">
            <div class="media-info">
                <media-seek class="top-seeker" no-background small-time></media-seek>
                <media-info small-artists drag class="top-info"></media-info>
            </div>
            <follow-button class="favorite-button" hide-tooltip :item="$store.state.media.track"></follow-button>
            <queue-button class="queue-button"></queue-button>
        </div>
        <div class="volume" v-if="!mobile">
            <v-slider
                    ref="volume"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    v-model="volume"
                    :prepend-icon="volumeIcon"
                    @click:prepend="toggleMute"
            ></v-slider>
        </div>
        <div class="buttons">
            <v-menu offset-y :close-on-content-click="true">
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
                    <v-list-item two-line
                                 v-if="$store.getters.isLoggedIn">
                        <router-link class="list-link"
                                     tag="div"
                                     :to="`/user/${$store.getters.urlName($store.state.userInfo.name)}/${$store.state.userInfo.id}`">
                            <v-list-item-avatar>
                                <img :src="$store.state.userInfo.avatar" alt="User Avatar">
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{$store.state.userInfo.name}}</v-list-item-title>
                                <v-list-item-subtitle>{{$store.state.userInfo.mail}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </router-link>
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
                    <v-list-item color="primary">
                        <v-list-item-icon>
                            <v-icon>mdi-brightness-6</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title class="theme-switch">
                                <span>Dark theme</span>
                            </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-switch v-model="$vuetify.theme.dark"></v-switch>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn v-if="$store.state.platform.type==='electron'" icon
                   class="minimize-button"
                   @click="$store.dispatch('minimizeWindow')">
                <v-icon>mdi-minus</v-icon>
            </v-btn>
            <v-btn v-if="$store.state.platform.type==='electron'" icon @click="$store.dispatch('closeWindow')">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
    import MediaInfo from "./MediaInfo";
    import MediaControls from "./MediaControls";
    import MediaSeek from "./MediaSeek";
    import Logo from "./Logo";
    import FollowButton from "./FollowButton";
    import QueueButton from "./QueueButton";

    export default {
        name: "ToolBar",
        components: {QueueButton, FollowButton, Logo, MediaSeek, MediaControls, MediaInfo},
        data: () => ({
            volume: 1,
            prevVolume: 1,
        }),
        props: {
            mobile: {
                type: Boolean,
                default: false,
            },
        },
        mounted() {
            this.mountVolumeListener();
        },
        beforeDestroy() {
            this.removeVolumeListener();
        },
        methods: {
            mountVolumeListener() {
                if (this.$refs.volume)
                    this.$refs.volume.$el.addEventListener('wheel', this.volumeScroll, true);
            },
            removeVolumeListener() {
                if (this.$refs.volume)
                    this.$refs.volume.$el.removeEventListener('wheel', this.volumeScroll);
            },
            toggleMute() {
                if (this.volume > 0) {
                    this.prevVolume = this.volume;
                    this.volume = 0;
                } else {
                    this.volume = this.prevVolume;
                }
            },
            volumeScroll(e) {
                let changeAmount = e.deltaY * -0.00025;
                this.volume = Math.min(1, Math.max(0, this.volume + changeAmount));
            },
        },
        watch: {
            '$vuetify.theme.dark'() {
                localStorage.darkTheme = this.$vuetify.theme.dark;
            },
            mobile() {
                if (!this.mobile) {
                    setTimeout(() => {
                        this.mountVolumeListener();
                    }, 100);
                } else {
                    this.removeVolumeListener();
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
        height: calc(100% + 2px);
        margin: -2px -16px;
        align-items: center;
    }

    .controls {
        -webkit-app-region: no-drag;
        margin-left: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
    }

    .controls > * {
        -webkit-app-region: no-drag;
    }

    .media-container {
        display: flex;
        max-width: 550px;
        flex: 1 0 0;
        align-items: center;
        min-width: 100px;
    }

    .media-info {
        -webkit-app-region: no-drag;
        width: 100%;
        min-width: 100px;
        margin-bottom: -5px;
    }

    .top-seeker {
        width: calc(100% - 51px);
        margin-left: 51px;
        position: relative;
        top: 40px;
        z-index: 5;
    }

    .top-info {
        margin-top: -20px;
    }

    .volume {
        -webkit-app-region: no-drag;
        max-width: 110px;
        height: 32px;
        flex-grow: 1;
        margin-left: 10px;
    }

    .buttons {
        margin: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .buttons > * {
        -webkit-app-region: no-drag;
    }

    .favorite-button {
        -webkit-app-region: no-drag;
        margin: 0 5px;
    }

    .queue-button {
        -webkit-app-region: no-drag;
    }

    .list-link {
        display: inline-flex;
        cursor: pointer;
    }

    .theme-switch {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    @media (max-width: 1000px) {
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
            margin-right: 0;
        }

        .top-seeker {
            margin-left: 51px;
            width: calc(100% - 51px);
        }
    }

    @media (max-width: 800px) {
        .favorite-button {
            display: none;
        }

        .minimize-button {
            display: none;
        }
    }

    @media (max-width: 710px) {
        .queue-button {
            display: none;
        }
    }

    @media (max-width: 680px) {
        .minimize-button {
            display: inline-flex !important;
        }
    }

    @media (max-width: 352px) {
        .logo {
            width: 0;
            overflow: hidden;
            padding: 0;
        }
    }
</style>