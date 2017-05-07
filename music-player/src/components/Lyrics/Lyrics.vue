<template>
    <div class="lyrics-container">
        <div class="lyrics-text" ref="lyricText" v-show="false" v-html="lyricText"></div>
        <div class="cover">
            <img class="img" :src="cover">
        </div>
        <div id="lyricList" class="lyrics-content-wrapper">
            <ul v-show="!loading" class="lyrics-content" ref="lyricsContent">
                <li v-for="lyric in lyricList.list" :class="{on: lyric.on}">
                    {{lyric.text}}
                </li>
            </ul>
            <div v-show="loading" class="loading">
                正在加载......
            </div>
        </div>
    </div>
</template>
<script>
import IScroll from 'iscroll';

export default {
    props: {
        song: {
            type: Object
        }
    },
    data() {
        return {
            defaultCover: 'http://7xrkxs.com1.z0.glb.clouddn.com/music/default_album.jpg', // 默认专辑封面url
            cover: 'http://7xrkxs.com1.z0.glb.clouddn.com/music/default_album.jpg', // 当前歌曲专辑url
            urlDetail: 'https://route.showapi.com/213-2?showapi_appid=34565&showapi_sign=c38a8f85afc24a429be423d2fc465ecc&musicid=', // 歌曲id搜索
            lyricText: '',
            lyricList: {
                autoScrollAble: false,
                list: []
            },
            lyricScroll: null,
            loading: false
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
        renderLyrics() { // 对歌词模块进行渲染
            this.loading = true; // 显示加载字样

            this.coverImage(); // 加载头图

            this.$http.get(this.urlDetail + this.song.songid).then((response) => {
                response = response.data.showapi_res_body;

                this.lyricText = response.lyric; // 将会被渲染到html中，原本lyric中的html code也会被解析好
                this.$nextTick(() => {
                    this.lyricList.list = this.getLyricList();

                    this.setListScroll();

                    this.loading = false;
                });
            });
        },
        getLyricList() { // 获得解析好的歌词列表
            let lyrics = this.$refs.lyricText.innerHTML; // 待渲染完成后，获得的innerHTML就是解析好的文本
            lyrics = lyrics.split('\n'); // 切割成数组
            let lyricObjs = [];

            if (lyrics[0][0] === '[') { // 有时间轴
                this.lyricList.autoScrollAble = true;
                if (lyrics[0] === '[00:00:00]此歌曲为没有填词的纯音乐，请您欣赏') {
                    let obj = {};
                    obj.min = 0;
                    obj.sec = 0;
                    obj.ms = 0;
                    obj.text = '此歌曲为没有填词的纯音乐，请您欣赏';
                    obj.totalTime = 0;
                    lyricObjs.push(obj);
                    return lyricObjs;
                }

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
            } else { // 无时间轴
                this.lyricList.autoScrollAble = false;

                lyrics.forEach((val, index) => {
                    let obj = {};
                    obj.text = val;
                    obj.on = false;
                    if (obj.text !== '') {
                        lyricObjs.push(obj);
                    }
                });

                if (lyricObjs.length === 0) {
                    let obj = {
                        text: '* 此歌曲暂无歌词 *',
                        on: false
                    }
                    lyricObjs.push(obj);
                } else {
                    let obj = {
                        text: '* 此歌词暂不支持自动滚动 *',
                        on: false
                    }
                    lyricObjs.unshift(obj);
                }
            }

            return lyricObjs; // 返回歌词列表
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
            if (!this.lyricList.autoScrollAble) { // 不可滚动歌词，不做处理
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
        },
        setListScroll() { // 设置歌词列表手动滚动
            if (this.lyricScroll !== null) { // 如果创建过手动滚动，需销毁
                this.lyricScroll.destroy();
                this.$refs.lyricsContent.style.transform = 'translate3d(0, 0, 0)';
                this.$refs.lyricsContent.style.transitionDuration = '0.5s';
                this.lyricScroll = null;
            }

            if (!this.lyricList.autoScrollAble) { // 如果是不支持自动滚动的歌词，绑定触摸滚动
                this.$nextTick(() => {
                    this.lyricScroll = new IScroll('#lyricList');
                });
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
        font-size: 16px;
        line-height: 34px;
        overflow: hidden;
        .lyrics-content {
            cursor: default;
            .on {
                color: $onColor;
            }
        }
        .loading {
            position: absolute;
            top: 0px;
            bottom: 0px;
            width: 100%;
            height: 100%;
            font-size: 16px;
        }
    }
}
</style>
