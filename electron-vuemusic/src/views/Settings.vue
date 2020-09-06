<template>
    <div class="settings">
        <h1>Settings</h1>
        <v-divider></v-divider>
        <div class="secrets" v-if="$store.state.platform.shouldSetKey">
            <h2>Secrets</h2>
            <p class="caption">These values must be set before using the application. Order: Spotify id, Spotify secret,
                Youtube API key</p>
            <div class="secret-textarea">
                <div class="secret-help">
                    <p>Spotify Client ID</p>
                    <p>Spotify Client Secret</p>
                    <p>Youtube API Key</p>
                </div>
                <v-textarea no-resize spellcheck="false" :rules="secretRules" outlined auto-grow row-height="4"
                            v-model="secrets"></v-textarea>
            </div>
            <p class="key-saved" v-if="$store.getters.isKeySet">
                <v-icon color="success">mdi-check</v-icon>
                <span>Keys saved!</span>
            </p>
            <p v-else class="key-saved">
                <v-icon color="error">mdi-close</v-icon>
                <span>One ore more keys not valid</span>
            </p>
        </div>
        <div>
            <h2>Account</h2>
            <div class="login" v-if="$store.getters.isKeySet">
                <div v-if="!$store.getters.isLoggedIn">
                    <p>Click the button below to log in to your Spotify™ account!</p>
                    <v-btn outlined color="success" @click="login" :loading="loginLoading">
                        <v-icon>mdi-spotify</v-icon>
                        Login
                    </v-btn>
                    <v-btn icon color="warning" @click="resetLogin" v-if="loginLoading">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </div>
            <div v-if="$store.getters.isLoggedIn">
                <div class="account-info">
                    <v-avatar>
                        <img class="avatar" :src="$store.state.userInfo.avatar" alt="user profile image"/>
                    </v-avatar>
                    <div>
                        <h3>{{$store.state.userInfo.name}}</h3>
                        <p class="caption">{{$store.state.userInfo.mail}}</p>
                    </div>
                </div>
                <v-btn color="primary" outlined @click="$store.dispatch('spotifyLogout')">Log out</v-btn>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Settings",
        data: () => ({
            secrets: "",
            loginLoading: false,
            secretRules: [
                v => v.split('\n').length === 3 || 'There must be three lines',
            ],
        }),
        mounted() {
            this.secrets = this.$store.state.platform.spotifyId + '\n' + this.$store.state.platform.spotifySecret + '\n' + this.$store.state.platform.youtubeKey;
        },
        methods: {
            async resetLogin() {
                await this.$store.dispatch('resetSpotifyLogin');
                this.loginLoading = false;
            },
            async login() {
                this.loginLoading = true;
                await this.$store.dispatch('spotifyLogin');
                this.loginLoading = false;
            }
        },
        watch: {
            secrets() {
                let splitSecret = this.secrets.split('\n');
                if (splitSecret.length === 3) {
                    let [spotifyId, spotifySecret, youtubeKey] = splitSecret;
                    this.$store.commit('spotifyId', spotifyId);
                    this.$store.commit('spotifySecret', spotifySecret);
                    this.$store.commit('youtubeKey', youtubeKey);
                }
            },
        }
    }
</script>

<style scoped>
    .settings {
        padding: 20px;
        max-width: 800px;
    }

    .secret-help {
        margin-top: 3px;
        text-align: right;
        font-weight: 500;
    }

    @media (max-width: 800px) {
        .secret-help {
            display: none;
        }
    }

    .secret-help > p {
        margin: 7px;
    }

    .secret-textarea {
        display: flex;
    }

    .key-saved {
        text-align: right;
    }

    .account-info {
        display: flex;
    }

    .account-info > *:first-child {
        margin-right: 10px;
    }
</style>