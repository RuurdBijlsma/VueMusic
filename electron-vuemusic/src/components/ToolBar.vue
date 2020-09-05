<template>
    <div class="toolbar">
        <div></div>
        <div class="controls">
            <v-btn icon small>
                <v-icon small>mdi-shuffle</v-icon>
            </v-btn>
            <v-btn icon small>
                <v-icon>mdi-skip-previous</v-icon>
            </v-btn>
            <v-btn icon large>
                <v-icon large>mdi-play</v-icon>
            </v-btn>
            <v-btn icon small>
                <v-icon>mdi-skip-next</v-icon>
            </v-btn>
            <v-btn icon small>
                <v-icon small>mdi-repeat</v-icon>
            </v-btn>
        </div>
        <div class="media-info">
            <v-card outlined class="media-card">
                <div v-if="false" class="media-album"/>
                <div class="empty-album">
                    <v-icon class="empty-album-icon">mdi-music</v-icon>
                </div>
                <div class="media-text-info">
                    <img class="media-info-logo" src="../assets/logo-small-v.png" alt="vm5 logo">
                </div>
            </v-card>
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
                    <v-list-item @click="logout()" color="primary" v-if="$store.getters.isLoggedIn">
                        <v-list-item-icon>
                            <v-icon>mdi-logout</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>Logout</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item to="/login" color="primary" v-else-if="$store.getters.isKeySet">
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
    export default {
        name: "ToolBar",
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
            logout() {
                alert("NOOOO");
            }
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

    .controls > * {
        -webkit-app-region: no-drag;
    }

    .media-info {
        -webkit-app-region: no-drag;
    }

    .media-card {
        display: flex;
        height: 50px;
    }

    .media-album {
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        height: 48px;
        width: 48px;
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        background-image: url("../assets/notfound.png");
    }

    .empty-album {
        border-top-left-radius: 2px !important;
        border-bottom-left-radius: 2px;
        height: 48px;
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.1);
    }

    .empty-album-icon {
        opacity: 0.2;
    }

    .media-text-info {
        min-width: 150px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .media-info-logo {
        height: 20px;
        opacity: 0.5;
    }

    .volume {
        -webkit-app-region: no-drag;
        width: 150px;
        height: 32px;
    }

    .buttons > * {
        -webkit-app-region: no-drag;
    }
</style>