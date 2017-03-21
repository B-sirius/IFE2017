<template>
    <div class="list-container">
        <ul ref="list" class="song-list">
            <li class="item title">
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
            <li class="item" v-for="song in songData.contentlist">
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
        </ul>
    </div>
</template>
<script>
export default {
    props: {
        songData: {
            type: Object
        }
    },
    data() {
        return {
            
        }
    },
    created() {
        
    },
    computed: {

    },
    updated() {
        this.$emit('initScroll'); // 子组件加载完成，触发父组件绑定滚动条
    }
}
</script>
<style lang="scss">
$textColor: rgba(225, 225, 225, .8);
$background: #FBFBFB;
$borderColor: rgba(225,225,225, .1);
$hoverColor: rgba(225,225,225, .1);

$iconUrl: 'https://y.gtimg.cn/mediastyle/yqq/img/player.png?max_age=2592000&v=749f8d7b865b29877500567512879e12';

.list-container {
    color: $textColor;
    .song-list {
        font-size: 14px;
        .item {
            height: 50px;
            box-sizing: border-box;
            border-bottom: 1px solid $borderColor;
            padding: 0 10px;
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
                white-space:nowrap; 
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .song_name-wrapper {
                width: 390px;
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
