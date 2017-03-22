<template>
    <div class="list-container">
        <ul ref="list" class="song-list">
            <li class="item title">
                <div class="song_num-wrapper inline-block">
                </div>
                <div class="song_name-wrapper inline-block">
                    <span>歌曲</span>
                </div>
                <div class="singer-wrapper inline-block">
                    <span>歌手</span>
                </div>
                <div class="ablum-wrapper inline-block">
                    <span>专辑</span>
                </div>
            </li>
            <li v-show="noData" class="item text-center">未搜索到相关歌曲</li>
            <li class="item" :class="{playing: isPlaying(index)}" v-for="(song, index) in songData.contentlist" @click="play(index)">
                <div class="song_num-wrapper inline-block">
                    <span>{{index + 1}}</span>
                </div>
                <div class="song_name-wrapper inline-block">
                    <span>{{song.songname}}</span>
                </div>
                <div class="singer-wrapper inline-block">
                    <span>{{song.singername}}</span>
                </div>
                <div class="ablum-wrapper inline-block">
                    <span>{{song.albumname}}</span>
                </div>
            </li>
            <li v-show="morePages" class="item text-center" @click="loadMore">加载更多</li>
        </ul>
    </div>
</template>
<script>
export default {
    props: {
        songData: {
            type: Object
        },
        currentSong: {
            type: Object
        },
        playing: {
            type: Boolean
        },
        currIndex: {
            type: Number
        },
        page: {
            type: Number
        },
        allPages: {
            type: Number
        }
    },
    data() {
        return {
            song: this.currentSong
        }
    },
    methods: {
        play(index) {
            this.$emit('changeSong', index);
        },
        isPlaying(index) {
            return this.playing && this.currIndex === index;
        },
        loadMore() {

        }
    },
    updated() {
        this.$emit('initScroll'); // 子组件加载完成，触发父组件绑定滚动条
    },
    computed: {
        morePages: function() {
            if (this.page < this.allPages) {
                return true;
            }
            return false;
        },
        noData: function() {
            if (this.allPages === 0) {
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
            &.playing {
                color: $playingTextColor;
                .song_num-wrapper {
                    font-size: 0;
                    background: url($waveGif) 25px 18px no-repeat;
                }
            }
            &.text-center {
                text-align: center;
            }
            &:hover {
                background: $hoverColor;
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
                width: 354px;
                padding-left: 10px;
                box-sizing: border-box;
            }
            .singer-wrapper {
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
