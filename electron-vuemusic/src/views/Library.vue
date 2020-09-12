<template>
    <div class="library">
        <h1 class="page-title">Library</h1>
        <v-divider class="divider"></v-divider>
        <div class="link-grid">
            <v-card rounded outlined class="link" v-for="item in items" :key="item.to" :to="item.to">
                <v-icon x-large>{{item.icon}}</v-icon>
                <p class="link-name">{{item.name}}</p>
            </v-card>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Library",
        data: () => ({
            items: [
                {
                    to: '/tracks',
                    icon: 'mdi-music-note',
                    name: 'Tracks',
                },
                {
                    to: '/albums',
                    icon: 'mdi-record-circle-outline',
                    name: 'Albums',
                },
                {
                    to: '/artists',
                    icon: 'mdi-microphone-variant',
                    name: 'Artists',
                },
                {
                    to: '/playlists',
                    icon: 'mdi-playlist-music',
                    name: 'Playlists',
                },
            ]
        }),
    }
</script>

<style scoped>
    .library {
        padding: 30px;
    }

    .divider {
        margin-bottom: 20px;
    }

    .link-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        justify-items: center;
    }

    .link {
        display: inline-flex;
        flex-direction: column;
        width: 150px;
        height: 150px;
        justify-content: center;
        align-items: center;
    }

    .link p {
        margin: 0;
    }

    .link:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
</style>