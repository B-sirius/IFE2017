<template>
    <div class="app" id="app">
        <div :style="backgroundObj" class="backImg"></div>
        <div class="mask"></div>
        <div class="main-content">
            <div id="listWrapper" class="list-wrapper">
                <MusicList :songData="songData" :currentSong="currentSong" :playing="playing" :currIndex="index" :page="page" :allPages="allPages" @initScroll="initScroll" @changeSong="changeSong"></MusicList>
            </div>
        </div>
        <div class="player-wrapper">
            <MusicPlayer :song="currentSong" @nextSong="nextSong" @switchState="switchState"></MusicPlayer>
        </div>
    </div>
</template>
<script>
import MusicPlayer from 'components/MusicPlayer/MusicPlayer';
import MusicList from 'components/MusicList/MusicList';
import IScroll from 'iscroll';

export default {
    name: 'app',
    components: {
        MusicPlayer,
        MusicList
    },
    data() {
        return {
            urlSearch: 'https://route.showapi.com/213-1?showapi_appid=26601&showapi_sign=adc05e2062a5402b81c563a3ced09208&keyword=',
            urlDetail: 'https://route.showapi.com/213-2?showapi_appid=26601&showapi_sign=adc05e2062a5402b81c563a3ced09208&musicid=',
            searchText: '星际牛仔',
            songData: {},
            currentSong: {},
            page: 1,
            allPages: 0,
            index: 0,
            playing: false,
            listScroll: null
        }
    },
    methods: {
        defaultList() {
            this.$http.get(this.urlSearch + this.searchText + '&page=' + this.page).then(response => {
                this.songData = response.body.showapi_res_body.pagebean;

                this.allPages = this.songData.allPages;
                this.currentSong = this.songData.contentlist[this.index];
            });
        },
        search() {
            this.$http.get(this.urlSearch + this.searchText + '&page=' + this.page).then(response => {
                this.songData = response.body.showapi_res_body.pagebean;
            });
        },
        initScroll() { // 初始化列表滚动条
            if (this.listScroll === null) {
                this.listScroll = new IScroll('#listWrapper', {
                    mouseWheel: true,
                    scrollbars: 'custom',
                    bounce: false,
                    disableMouse: true,
                    disablePointer: true,
                    interactiveScrollbars: true
                });
            }
        },
        changeSong(index) { // 点击列表触发换歌
            if (this.songData.contentlist[index] === this.currentSong.songid) { // 如果是同一首歌，则不操作
                return;
            }

            this.index = index;

            this.currentSong = this.songData.contentlist[index];
        },
        nextSong() {
            this.currentSong = this.songData.contentlist[++this.index];
        },
        switchState(play) {
            this.playing = play;
        }
    },
    computed: {
        backgroundObj() {
            return {
                backgroundImage: `url(${this.currentSong.albumpic_big})`
            }
        }
    },
    created() {
        this.defaultList();
    }
}
</script>
<style lang="scss">
$bodyBack: #42474C;
$maskBack: rgba(0, 0, 0, .35);
$scrollColor: rgba(255, 255, 255, .1);
$scrollWrapperColor: rgba(255, 255, 255, .1);
body,
html {
    height: 100%;
    overflow: hidden;
    background: $bodyBack;
    .iScrollVerticalScrollbar {
        position: absolute;
        z-index: 9999;
        width: 7px;
        bottom: 10px;
        top: 10px;
        right: 0px;
        pointer-events: none;
        background: $scrollWrapperColor;
        .iScrollIndicator {
            box-sizing: border-box;
            position: absolute;
            border-radius: 3px;
            width: 100%;
            transition-duration: 0ms;
            display: block;
            transform: translate(0px, 0px) translateZ(0px);
            transition-timing-function: cubic-bezier(0.1, 0.57, 0.1, 1);
            background: $scrollColor;
        }
    }
    .app {
        height: 100%;
        .backImg {
            position: absolute;
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-position: 50%;
            background-size: cover;
            filter: blur(90px);
            opacity: 0.6
        }
        .mask {
            position: absolute;
            width: 100%;
            height: 100%;
            background: $maskBack;
        }
        .main-content {
            position: absolute;
            top: 100px;
            bottom: 155px;
            left: 0;
            right: 0;
            width: 1100px;
            margin: auto;
            .list-wrapper {
                position: relative;
                display: inline-block;
                padding-right: 25px;
                width: 700px;
                height: 100%;
                overflow: hidden;
            }
        }
        .player-wrapper {
            position: fixed;
            bottom: 20px;
            width: 100%;
            display: flex;
            justify-content: center;
        }
    }
}
</style>
