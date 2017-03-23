<template>
    <div class="app" id="app">
        <div :style="backgroundObj" class="backImg"></div>
        <div class="mask"></div>
        <div class="main-content">
            <div id="listWrapper" class="list-wrapper">
                <MusicList :songList="songList" :currentSong="currentSong" :playing="playing" :currIndex="index" :page="page" :allPages="allPages" @initScroll="initScroll" @playControl="playControl" @loadMore="loadMore"></MusicList>
            </div>
        </div>
        <div class="player-wrapper">
            <MusicPlayer ref="player" :playing="playing" :song="currentSong" @nextSong="nextSong" @switchState="switchState"></MusicPlayer>
        </div>
    </div>
</template>
<script>
import MusicPlayer from 'components/MusicPlayer/MusicPlayer';
import MusicList from 'components/MusicList/MusicList';
import IScroll from 'iscroll';
import 'rgbaster.js';

export default {
    name: 'app',
    components: {
        MusicPlayer,
        MusicList
    },
    data() {
        return {
            urlSearch: 'https://route.showapi.com/213-1?showapi_appid=26601&showapi_sign=adc05e2062a5402b81c563a3ced09208&keyword=', // 关键词搜索
            urlDetail: 'https://route.showapi.com/213-2?showapi_appid=26601&showapi_sign=adc05e2062a5402b81c563a3ced09208&musicid=', // 歌曲id搜索
            searchText: '星际牛仔', // 记录上次搜索的关键词
            songList: [], // 目前的歌曲列表
            currentSong: {}, // 当前播放歌曲
            index: 0, // 当前播放歌曲序号
            page: 1, // 当前搜索页
            allPages: 1, // 总搜索页
            playing: false, // 是否正在播放
            listScroll: null, // 列表滚动条
            scrollPos: 0 // 滚动条位置信息
        }
    },
    methods: {
        default() {  // 初始化设置
            this.search((data) => {
                this.updateSongData(data);
                this.currentSong = this.songList[this.index];
                this.$nextTick(() => {
                    this.initScroll();
                });
            });
        },
        search(callback) {  // 进行搜索
            let self = this;
            this.$http.get(this.urlSearch + this.searchText + '&page=' + this.page).then(response => {
                let data = response.body.showapi_res_body.pagebean;
                callback.call(self, data);
            });
        },
        updateSongData(data) { // 更新歌曲列表
            this.page = data.currentPage;
            this.allPages = data.allPages;
            this.songList = this.songList.concat(data.contentlist);
        },
        initScroll() { // 初始化列表滚动条
            if (this.listScroll === null) {
                this.listScroll = new IScroll('#listWrapper', {
                    mouseWheel: true,
                    scrollbars: 'custom',
                    startY: this.scrollPos
                });
            }
        },
        reInitScroll() { // 重新初始化滚动条
            this.scrollPos = this.listScroll.y;
            if (this.listScroll !== null) {
                this.listScroll.destroy();
                this.listScroll = null;
            }
            this.initScroll();
        },
        playControl(index) { // 点击列表触发换歌
            if (this.songList[index].songid === this.currentSong.songid) { // 如果是同一首歌，则进行播放&暂停切换
                this.switchState();
                return;
            }
            // 不是同一首歌，直接播放
            this.index = index;

            this.playing = true;
            this.currentSong = this.songList[index];
        },
        nextSong() {
            this.currentSong = this.songList[++this.index];
        },
        switchState() { // 改变播放状态
            this.playing = !this.playing;
        },
        loadMore() { // 加载更多歌曲
            if (this.page >= this.allPages) {
                return;
            }
            ++this.page;

            this.search((data) => {
                this.updateSongData(data);
                this.$nextTick(() => {
                    this.reInitScroll();
                });
            });
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
        this.default();
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
