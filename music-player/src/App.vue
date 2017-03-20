<template>
    <div id="app">
        <div class="list-wrapper">
            <MusicList></MusicList>
        </div>
        <div class="player-wrapper">
            <MusicPlayer></MusicPlayer>
        </div>
    </div>
</template>

<script>
import MusicPlayer from 'components/MusicPlayer/MusicPlayer';
import MusicList from 'components/MusicList/MusicList';

export default {
    name: 'app',
    components: {
        MusicPlayer,
        MusicList
    }
}
</script>

<style lang="scss">
$lightYellow: #FBFBFB;
$black: #696769;
$dark: #828282;
$grey: #C1C1C1;
$lightGrey: #E1E1E1;
$darkGreen: #0AAA46;
$green: #00C84B;
$white: #FFF;

.player-wrapper {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    background: $lightYellow;
}
</style>
