<template>
    <div class="playlist">
        <div class="art-section">
            <div class="album-art"></div>
        </div>
        <div class="tracks-section">
            <h2>track-title</h2>
            <p class="caption">last edited 2 days ago</p>
            <v-btn color="primary"><v-icon>mdi-shuffle</v-icon> Shuffle</v-btn>
        </div>

    </div>
</template>

<script>
    export default {
        name: "Playlist"
    }
</script>

<style scoped>
    .playlist {
        display: flex;
    }
    .art-section{
        max-width: 350px;
        flex-grow: 1;
    }
    .album-art{
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
    .tracks-section{

    }
</style>