<template>
    <div id="app">
        <div class="music-wrapper">
            <MusicPlayer></MusicPlayer>
        </div>
    </div>
</template>

<script>
import MusicPlayer from 'components/MusicPlayer/MusicPlayer';

export default {
    name: 'app',
    components: {
        MusicPlayer
    }
}
</script>

<style>
.music-wrapper {
    display: flex;
    justify-content: center;
}
</style>
