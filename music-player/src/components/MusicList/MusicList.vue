<template>
    <div class="list-container">
        <ul class="song-list">
            <li class="item title">
                <div class="song_num-wrapper inline-block">
                </div>
                <div class="song_name-wrapper inline-block">
                    <span>歌曲</span>
                </div>
                <div class="play_btn-wrapper inline-block"></div>
                <div class="singer-wrapper inline-block">
                    <span>歌手</span>
                </div>
                <div class="ablum-wrapper inline-block">
                    <span>专辑</span>
                </div>
            </li>
            <li v-show="noData" class="item text-center">未搜索到相关歌曲</li>
            <li class="item" :class="{playing: isPlaying(index)}" v-for="(song, index) in songList">
                <div class="song_num-wrapper inline-block">
                    <span>{{index + 1}}</span>
                </div>
                <div class="song_name-wrapper inline-block">
                    <span>{{song.songname}}</span>
                </div>
                <div class="play_btn-wrapper inline-block">
                    <i class="play-btn" @click="playControl(index)"></i>
                </div>
                <div class="singer-wrapper inline-block">
                    <span>{{song.singername || '未知'}}</span>
                </div>
                <div class="ablum-wrapper inline-block">
                    <span>{{song.albumname || '未知'}}</span>
                </div>
            </li>
            <li v-show="loading" class="item text-center loading">加载中...</li>
            <li v-show="morePages" class="item text-center load-more" @click="loadMore">加载更多</li>
        </ul>
    </div>
</template>
<script>
export default {
    props: {
        songList: {
            type: Array
        },
        currentSong: {
            type: Object
        },
        playing: {
            type: Boolean
        },
        loading: {
            type: Boolean
        },
        currIndex: {
            type: Number
        },
        page: {
            type: Number
        },
        allNum: {
            type: Number
        }
    },
    data() {
        return {
            song: this.currentSong
        }
    },
    methods: {
        playControl(index) {
            this.$emit('playControl', index);
        },
        isPlaying(index) {
            return this.playing && this.currIndex === index;
        },
        loadMore() {
            this.$emit('loadMore');
        }
    },
    computed: {
        morePages: function() {
            if (this.songList.length < this.allNum && !this.loading) {
                return true;
            }
            return false;
        },
        noData: function() {
            if (this.allNum === 0) {
                return true;
            }
        }
    }
}
</script>
<style lang="scss">
$textColor: rgba(225, 225, 225, .8);
$playingTextColor: #fff;
$background: #FBFBFB;
$borderColor: rgba(225, 225, 225, .1);
$hoverColor: rgba(225, 225, 225, .1);
$waveGif: 'https://y.gtimg.cn/mediastyle/yqq/img/wave.gif';
$icon: 'https://y.gtimg.cn/mediastyle/yqq/img/icon_list_menu.png?max_age=2592000&v=873fb6560497db4abbe63767018022eb';

.list-container {
    color: $textColor;
    .song-list {
        font-size: 14px;
        .item {
            height: 50px;
            line-height: 50px;
            box-sizing: border-box;
            border-bottom: 1px solid $borderColor;
            cursor: default;
            overflow: hidden;
            &.playing {
                color: $playingTextColor;
                .song_num-wrapper {
                    font-size: 0;
                    background: url($waveGif) 25px 18px no-repeat;
                }
            }
            &.playing:hover .play_btn-wrapper .play-btn{
                background-position: 0px -200px;
            }
            &.playing .play_btn-wrapper .play-btn:hover{
                background-position: -120px -200px;
            }
            &.text-center {
                text-align: center;
            }
            &.load-more {
                cursor: pointer;
            }
            &:hover {
                background: $hoverColor;
            }
            &:hover .play_btn-wrapper .play-btn {
                background-position: 0 0px;
            }
            &:first-child:hover {
                background: transparent;
            }
            .inline-block {
                vertical-align: top;
                display: inline-block;
                height: 50px;
                line-height: 50px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .song_num-wrapper {
                width: 36px;
                text-align: right;
            }
            .song_name-wrapper {
                width: 304px;
                padding-left: 10px;
                box-sizing: border-box;
            }
            .play_btn-wrapper {
                width: 50px;
                .play-btn {
                    display: inline-block;
                    vertical-align: middle;
                    width: 36px;
                    height: 36px;
                    background: url($icon) no-repeat;
                    background-position: 40px 0px;
                    cursor: pointer;
                }
                .play-btn:hover {
                    background-position: -120px 0;
                }
            }
            .singer-wrapper {
                position: relative;
                width: 80px;
            }
            .ablum-wrapper {
                width: 150px;
                margin-left: 50px;
            }
        }
    }
}
</style>
