<template>
    <div class="app" id="app">
        <div class="backImg"></div>
        <div class="mask"></div>
        <div class="main-content">
            <div id="listWrapper" class="list-wrapper">
                <MusicList :songData="songData" @initScroll="initScroll()"></MusicList>
            </div>
        </div>
        <div class="player-wrapper">
            <MusicPlayer></MusicPlayer>
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
            songData: {},
            page: 1,
            allPages: 0
        }
    },
    methods: {
        defaultList() {
            this.search('星际牛仔');
        },
        search(text) {
            this.$http.get(this.urlSearch + text + '&page=' + this.page).then(response => {
                this.songData = response.body.showapi_res_body.pagebean;
            });
        },
        initScroll() {
            let listScroll = new IScroll('#listWrapper', {
                mouseWheel: true,
                scrollbars: 'custom'
            });
        }
    },
    created() {
        this.defaultList();
    }
}
</script>
<style lang="scss">
$bodyBack: #292a2b;
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
        bottom: 2px;
        top: 2px;
        left: 730px;
        overflow: hidden;
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
            background: url('http://img.xiami.net/images/album/img74/94174/4371591424151634_2.jpg') no-repeat;
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
                display: inline-block;
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
