<template>
    <div class="lyrics-container">
        <div class="lyrics-text" ref="lyricText" v-show="false" v-html="lyricText"></div>
        <div class="cover">
            <img class="img" :src="cover">
        </div>
        <div class="lyrics-content-wrapper">
            <ul class="lyrics-content" ref="lyricsContent">
                <li v-for="lyric in lyricList.list" :class="{on: lyric.on}">
                    {{lyric.text}}
                </li>
            </ul>
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
            lyricList: {
                scrollAble: false,
                list: []
            }
        }
    },
    methods: {
        coverImage() { // 专辑封面预加载
            let self = this;
            this.cover = this.defaultCover;
            let img = new Image();
            img.src = this.song.albumpic_big;
            img.onload = function() {
                self.cover = img.src;
            };
        },
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

            if (lyrics[0][0] === '[') { // 有时间轴
                this.lyricList.scrollAble = true;

                lyrics.forEach((val, index) => {
                    if (index > 4) { // 之所以大于4,参照返回的数据格式
                        let obj = {};
                        obj.min = ~~(val.substring(1, 3));
                        obj.sec = ~~(val.substring(4, 6));
                        obj.ms = ~~(val.substring(7, 9));
                        obj.text = val.substring(10);
                        obj.totalTime = obj.min * 60 + obj.sec + obj.ms / 100;
                        obj.on = false;
                        if (obj.text !== '') {
                            lyricObjs.push(obj);
                        }
                    }
                });
            } else {
                this.lyricList.scrollAble = false;

                lyrics.forEach((val, index) => {
                    let obj = {};
                    obj.text = val;
                    obj.on = false;
                    if (obj.text !== '') {
                        lyricObjs.push(obj);
                    }
                });
            }

            this.lyricList.list = lyricObjs;
        },
        clearLyricHighlight() {
            for (let i = 0; i < this.lyricList.list.length; i++) {
                this.lyricList.list[i].on = false;
            }
        },
        setLyricHighlight(index) {
            this.lyricList.list[index].on = true; // 设置高亮

            if (index > 2) { // 第四句歌词才开始滚动
                this.$refs.lyricsContent.style.transform = `translate3d(0, -${(index - 2) * 34}px, 0)`;
            }
        },
        checkLyric(time) {
            if (!this.lyricList.scrollAble) { // 不可滚动歌词，不做处理
                return;
            }

            this.clearLyricHighlight();

            let length = this.lyricList.list.length;

            for (let i = 0; i < length; i++) {
                let val = this.lyricList.list[i];

                if (val.totalTime > time) {
                    let index = i - 1;

                    index = index > 0 ? index : 0;

                    this.setLyricHighlight(index);

                    break;
                }
                if (time > this.lyricList.list[length - 1].totalTime) { // 如果是最后一句歌词
                    this.setLyricHighlight(length - 1);
                }
            }
        }
    }
}
</script>
<style lang="scss">
$textColor: rgba(225, 225, 225, .8);
$onColor: #31c27c;
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
    .lyrics-content-wrapper {
        position: absolute;
        width: 100%;
        top: 216px;
        bottom: 20px;
        font-size: 14px;
        line-height: 34px;
        overflow: hidden;
        .lyrics-content {
            transition: 0.3s;
            .on {
                color: $onColor;
            }
        }
    }
}
</style>
