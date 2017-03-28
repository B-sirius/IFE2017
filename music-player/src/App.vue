<template>
    <div class="app" id="app">
        <div :style="backgroundObj" class="backImg"></div>
        <div class="mask"></div>
        <div class="main-content">
            <div class="search-container">
                <div class="search-wrapper">
                    <input ref="searchInput" type="text" class="search" placeholder="搜索关键字" @keyup="handleInput">
                    <button class="search-btn" @click="searchKeyword">
                        <i class="search-icon"></i>
                    </button>
                </div>
            </div>
            <div id="listWrapper" class="list-wrapper">
                <MusicList :songList="songList" :currentSong="currentSong" :playing="playing" :currIndex="index" :page="page" :allNum="allNum" :loading="listLoading" @initScroll="initScroll" @playControl="playControl" @loadMore="loadMore"></MusicList>
            </div>
            <div class="lyrics-wrapper">
                <Lyrics ref="lyrics" :song="currentSong"></Lyrics>
            </div>
        </div>
        <div class="player-wrapper">
            <MusicPlayer ref="player" :playMode="playMode" :playing="playing" :song="currentSong" @nextSong="nextSong" @prevSong="prevSong" @switchState="switchState" @changeMode="changeMode" @renderLyrics="renderLyrics" @checkLyric="checkLyric"></MusicPlayer>
        </div>
    </div>
</template>
<script>
import MusicPlayer from 'components/MusicPlayer/MusicPlayer';
import MusicList from 'components/MusicList/MusicList';
import Lyrics from 'components/Lyrics/Lyrics';

import IScroll from 'iscroll';
import 'rgbaster.js';

export default {
    name: 'app',
    components: {
        MusicPlayer,
        MusicList,
        Lyrics
    },
    data() {
        return {
            urlSearch: 'https://route.showapi.com/213-1?showapi_appid=34565&showapi_sign=c38a8f85afc24a429be423d2fc465ecc&keyword=', // 关键词搜索
            searchText: '星际牛仔', // 记录上次搜索的关键词
            songList: [], // 目前的歌曲列表
            playedList: [], // 播放过的队列
            currentSong: {}, // 当前播放歌曲
            index: 0, // 当前播放歌曲序号
            page: 1, // 当前搜索页
            allNum: 1, // 当前关键词返回的所有歌曲数
            playing: false, // 是否正在播放
            playMode: 'order', // 播放模式
            listScroll: null, // 列表滚动条
            scrollPos: 0, // 滚动条位置信息
            listLoading: false // 列表是否在加载状态
        }
    },
    methods: {
        default () { // 初始化设置
            this.search((data) => {
                this.updateSongData(data);
                this.currentSong = this.songList[this.index];
                this.$nextTick(() => {
                    this.initScroll();
                });
            });
        },
        resetList() {
            this.page = 1; // 初始化搜索页
            this.index = 0; // 初始化序号
            this.playedList = []; // 初始化播放过的歌曲
        },
        handleInput(e) {
            if (e.keyCode === 13) {
                this.searchKeyword();
            }
        },
        searchKeyword() { // 通过关键词搜索歌曲
            let text = this.$refs.searchInput.value;
            if (text.trim() === '') { // 输入内容不能为空
                return;
            }

            this.songList = [];
            this.listLoading = true;

            let array = text.split(' ');
            text = '';
            for (let i = 0; i < array.length; i++) {
                if (array[i] === '') {
                    array.splice(i, 1);
                    --i;
                    continue;
                }
                text += array[i] + '+';
            }
            this.searchText = text;

            this.search((data) => {
                this.resetSongData(data);
                this.resetList();
                this.currentSong = this.songList[this.index];
                this.$nextTick(() => {
                    this.reInitScroll();
                });
            });
        },
        loadMore() { // 加载更多歌曲
            if (this.songList.length >= this.allNum) {
                return;
            }
            ++this.page;

            this.search((data) => {
                this.updateSongData(data);
                this.$nextTick(() => {
                    this.reInitScroll();
                });
            });
        },
        search(callback) { // 进行搜索
            let self = this;
            this.listLoading = true;
            this.$http.get(this.urlSearch + this.searchText + '&page=' + this.page).then((response) => {
                let data = response.body.showapi_res_body.pagebean;
                callback.call(self, data);
            });
        },
        resetSongData(data) {
            this.listLoading = false;
            this.page = data.currentPage;
            this.allNum = data.allNum;
            this.songList = data.contentlist;
        },
        updateSongData(data) { // 更新歌曲列表
            this.listLoading = false;
            this.page = data.currentPage;
            this.allNum = data.allNum;
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
        addPlayedList() { // 将歌曲添加到播放过的列表里
            let data = {
                song: this.currentSong,
                index: this.index
            };
            this.playedList.push(data); // 将要被切换的歌曲信息压入playedList
        },
        playControl(index) { // 点击列表触发换歌
            if (this.songList[index].songid === this.currentSong.songid) { // 如果是同一首歌，则进行播放&暂停切换
                this.switchState();
                return;
            }

            this.addPlayedList();

            this.index = index;

            this.playing = true;

            this.currentSong = this.songList[index];
        },
        prevSong() {
            if (this.playedList.length !== 0) {
                let data = this.playedList.pop();
                this.currentSong = data.song;
                this.index = data.index;

                return;
            }
            this.prevHandler();
        },
        nextSong() {
            this.addPlayedList();

            this.nextHandler();
        },
        prevHandler() {
            let t = {
                'order': function() {
                    if (this.index === 0) {
                        this.index = this.songList.length - 1;
                    } else {
                        --this.index;
                    }
                },
                'random': function() {
                    this.index = Math.floor((this.songList.length) * Math.random());
                },
                'cycle': function() {
                    if (this.index === 0) {
                        this.index = this.songList.length - 1;
                    } else {
                        --this.index;
                    }
                }
            };

            t[this.playMode].call(this);

            this.currentSong = this.songList[this.index];
        },
        nextHandler() {
            let t = {
                'order': function() {
                    if (this.index === this.songList.length - 1) {
                        this.index = 0;
                    } else {
                        ++this.index;
                    }
                },
                'random': function() {
                    this.index = Math.floor((this.songList.length) * Math.random());
                },
                'cycle': function() {
                    if (this.index === this.songList.length - 1) {
                        this.index = 0;
                    } else {
                        ++this.index;
                    }
                }
            }

            t[this.playMode].call(this);

            this.currentSong = this.songList[this.index];
        },
        switchState() { // 改变播放状态
            this.playing = !this.playing;
        },
        changeMode() {
            let nextMode = {
                'order': 'random',
                'random': 'cycle',
                'cycle': 'order'
            }
            this.playMode = nextMode[this.playMode];
        },
        renderLyrics() {
            this.$refs.lyrics.renderLyrics();
        },
        checkLyric(time) {
            this.$refs.lyrics.checkLyric(time);
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
$searchColor: rgba(255, 255, 255, .07);
$searchBtnHoverColor: rgba(255, 255, 255, .1);
$textColor: rgba(225, 225, 225, .8);
$icon: 'https://y.gtimg.cn/mediastyle/yqq/img/icon_sprite.png?max_age=2592000&v=cfc9e963685e5ce3f9fcef4a4449cddb';
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
            top: 80px;
            bottom: 165px;
            left: 0;
            right: 0;
            padding-top: 100px;
            width: 1100px;
            margin: auto;
            font-size: 0;
            .search-container {
                position: absolute;
                width: 100%;
                margin-top: -100px;
                text-align: center;
                height: 70px;
                .search-wrapper {
                    position: relative;
                    display: inline-block;
                    box-sizing: border-box;
                    height: 50px;
                    width: 700px;
                    padding-left: 10px;
                    padding-right: 50px;
                    background: $searchColor;
                    transition: 0.15s;
                    .search {
                        width: 100%;
                        height: 100%;
                        color: $textColor;
                        font-size: 16px;
                        background: transparent;
                        border: none;
                        outline: none;
                        &::-moz-placeholder {
                            color: $textColor;
                        }
                        &::-webkit-input-placeholder {
                            color: $textColor;
                        }
                        &:-ms-input-placeholder {
                            color: $textColor;
                        }
                    }
                    .search-btn {
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 50px;
                        height: 50px;
                        background: transparent;
                        border: none;
                        padding: 0;
                        cursor: pointer;
                        outline: none;
                        &:hover {
                            background: $searchBtnHoverColor;
                        }
                        .search-icon {
                            display: inline-block;
                            width: 16px;
                            height: 16px;
                            background: url($icon);
                            background-position: 0 -40px;
                        }
                    }
                }
            }
            .list-wrapper {
                position: relative;
                display: inline-block;
                padding-right: 25px;
                width: 700px;
                height: 100%;
                overflow: hidden;
            }
            .lyrics-wrapper {
                vertical-align: top;
                margin-left: 35px;
                width: 340px;
                display: inline-block;
                height: 100%;
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
