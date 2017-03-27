
<template>
    <div class="lyrics-container">
        <div class="lyrics-text" ref="lyricText" v-show="false" v-html="lyricText"></div>
        <div class="cover">
            <img class="img" :src="cover">
        </div>
        <div class="lyrics-content">
            thats good
        </div>
    </div>
</template>
<script>
export default {
    props: {
        song: {
            type: Object
        }
    },
    data() {
        return {
            defaultCover: 'http://s4.music.126.net/style/web2/img/default/default_album.jpg', // 默认专辑封面url
            cover: 'http://s4.music.126.net/style/web2/img/default/default_album.jpg', // 当前歌曲专辑url
            urlDetail: 'https://route.showapi.com/213-2?showapi_appid=26601&showapi_sign=adc05e2062a5402b81c563a3ced09208&musicid=', // 歌曲id搜索
            lyricText: '',
            lyricList: []
        }
    },
    methods: {
        renderLyrics() {
            this.coverImage(); // 加载头图

            this.$http.get(this.urlDetail + this.song.songid).then((response) => {
                response = response.data.showapi_res_body;

                this.lyricText = response.lyric; // 将会被渲染到html中，原本lyric中的html code也会被解析好
                this.$nextTick(() => {
                    this.getLyricList();
                });
            });
        },
        getLyricList() { // 获得解析好的歌词列表
            let lyrics = this.$refs.lyricText.innerHTML; // 待渲染完成后，获得的innerHTML就是解析好的文本
            lyrics = lyrics.split('\n'); // 切割成数组
            let lyricObjs = [];
            // 提取时间轴
            lyrics.forEach((val, index) => {
                if (index > 4) { // 之所以大于4,参照返回的数据格式
                    val = val.replace(/(^\s*)|(\s*$)/g, ''); // 两边去空格
                    let obj = {};
                    obj.min = ~~(val.substring(1, 3));
                    obj.sec = ~~(val.substring(4, 6));
                    obj.ms = ~~(val.substring(7, 9));
                    obj.text = val.substring(10).replace(/(^\s*)|(\s*$)/g, '');
                    obj.dis = false;
                    obj.totalTime = obj.min * 60 + obj.sec + obj.ms / 100;
                    if (obj.text !== '') {
                        lyricObjs.push(obj);
                    }
                }
            });

            this.lyricList = lyricObjs;
        },
        coverImage() { // 专辑封面预加载
            let self = this;
            this.cover = this.defaultCover;
            let img = new Image();
            img.src = this.song.albumpic_big;
            img.onload = function() {
                self.cover = img.src;
            };
        }
    }
}
</script>
<style lang="scss">
$textColor: rgba(225, 225, 225, .8);
.lyrics-container {
    position: relative;
    height: 100%;
    color: $textColor;
    text-align: center;
    .cover {
        img {
            width: 186px;
            height: 186px;
        }
    }
    .lyrics-content {
        position: absolute;
        width: 100%;
        top: 216px;
        bottom: 0;
        font-size: 14px;
        line-height: 34px;
    }
}
</style>
