<template>
    <div class="container">
        <div class="left-content">
            <div class="title">{{songList[index].title}}</div>
            <div class="singer">{{songList[index].singer}}</div>
            <div class="progress-wrapper">
                <div ref="bar" @click="changePos" class="volume-bar">
                    <div :style="{width: volBtnPos + 'px'}" class="current-bar"></div>
                    <div ref="volumeController" @click.stop="stopPass" @mousedown.stop="dragController" :style="{left: volBtnPos + 'px'}" class="controller"></div>
                </div>
                <div class="left">
                    <div class="time">
                        <span class="currTime">{{getTime(currLen)}}</span>
                        <span class="totalTime"> / {{getTime(totalLen)}}</span>
                    </div>
                    <span class="volume-btn"><i :class="volumeClass" aria-hidden="true"></i></span>
                </div>
                <div class="right">
                    <span class="sm-icon">
                        <i class="fa fa-list" aria-hidden="true"></i>
                    </span>
                    <span class="sm-icon">
                        <i class="fa fa-download" aria-hidden="true"></i>
                    </span>
                    <span class="sm-icon">
                        <i class="fa fa-plus" aria-hidden="true"></i>
                    </span>
                    <span class="sm-icon">
                        <i class="fa fa-share-alt" aria-hidden="true"></i>
                    </span>
                </div>
                <div @click="changeProgress" ref="progressBar" class="progress_bar">
                    <div :style="{width: progress_barLength}" class="current-progress"></div>
                    <audio autoplay ref="audio" :src="songList[index].location"></audio>
                </div>
            </div>
            <div class="controller-wrapper">
                <div class="left">
                    <span class="bg-icon"><i class="fa fa-heart" aria-hidden="true"></i></span>
                    <span class="bg-icon"><i class="fa fa-trash-o" aria-hidden="true"></i></span>
                </div>
                <div class="right">
                    <span class="bg-icon" @click="switchState"><i :class="controlClass" aria-hidden="true"></i></span>
                    <span @click="nextSong()" class="bg-icon"><i class="fa fa-step-forward" aria-hidden="true"></i></span>
                </div>
            </div>
        </div>
        <div class="right-content">
            <div class="cover">
                <img class="img" :src="cover">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            songList: [{
                'album': 'STEINS;GATE Original Soundtrack+Radio CD(仮)',
                'album_pic': 'http://img.xiami.net/images/album/img74/94174/4371591424151634_2.jpg',
                'singer': '阿保剛',
                'album_pic_m': 'http://img.xiami.net/images/album/img74/94174/4371591424151634_1.jpg',
                'lyric': '',
                'location': 'http://om5.alicdn.com/174/94174/437159/1770163789_2249535_l.mp3?auth_key=fb4327a6903bc75200e99170dac12f10-1490151600-0-null',
                'title': 'GATE OF STEINER -Piano-',
                'album_pic_l': 'http://img.xiami.net/images/album/img74/94174/4371591424151634.jpg'
            }, {
                'album': 'Brit Awards 2015',
                'album_pic': 'http://img.xiami.net/images/album/img58/23258/2250921901425092190_2.jpg',
                'singer': 'First Aid Kit',
                'album_pic_m': 'http://img.xiami.net/images/album/img58/23258/2250921901425092190_1.jpg',
                'lyric': '',
                'location': 'http://om5.alicdn.com/258/23258/225092190/1774024646_16366085_l.mp3?auth_key=30b7aec140d489a6194f12cc12b10cc8-1490151600-0-null',
                'title': 'My Silver Lining',
                'album_pic_l': 'http://img.xiami.net/images/album/img58/23258/2250921901425092190.jpg'
            }, {
                'album': '蔡琴经典(壹)',
                'album_pic': 'http://img.xiami.net/images/album/img48/1348/69421384850954_2.jpg',
                'singer': '蔡琴',
                'album_pic_m': 'http://img.xiami.net/images/album/img48/1348/69421384850954_1.jpg',
                'lyric': '',
                'location': 'http://om5.alicdn.com/348/1348/6942/84764_2113348_l.mp3?auth_key=d4d61a2ce447efc110e8104c2bbe2c2f-1490151600-0-null',
                'title': '被遗忘的时光',
                'album_pic_l': 'http://img.xiami.net/images/album/img48/1348/69421384850954.jpg'
            }, {
                'album': 'WHITE ALBUM2 ORIGINAL SOUNDTRACK～kazusa～',
                'album_pic': 'http://img.xiami.net/images/album/img24/176/58b3d5fc6e425_8832024_1488180732_2.jpg',
                'singer': '生天目仁美',
                'album_pic_m': 'http://img.xiami.net/images/album/img24/176/58b3d5fc6e425_8832024_1488180732_1.jpg',
                'lyric': '',
                'location': 'http://om5.alicdn.com/826/75826/2102674458/1795430948_1483092419161.mp3?auth_key=f8d5c0d6594170569545ab09b865dab7-1489892400-0-null',
                'title': 'WHITE ALBUM',
                'album_pic_l': 'http://img.xiami.net/images/album/img24/176/58b3d5fc6e425_8832024_1488180732.jpg'
            }],
            index: 0,
            defaultCover: 'http://s4.music.126.net/style/web2/img/default/default_album.jpg',
            cover: '',
            playState: true,
            maxPos: 113,
            volBtnPos: 113,
            totalLen: 0,
            currLen: 0
        };
    },
    methods: {
        coverImage() { // 专辑封面预加载
            let _self = this;
            this.cover = this.defaultCover;
            let img = new Image();
            img.src = this.songList[this.index].album_pic;
            img.onload = function() {
                _self.cover = img.src;
            };
        },
        switchState() { // 切换播放与暂停
            this.playState = !this.playState; // 改变状态

            if (this.playState) {
                this.$refs.audio.play();
            } else {
                this.$refs.audio.pause();
            }
        },
        dragController(e) { // 拖动音量条
            let self = this;
            let posData = {
                mouseStartX: e.pageX,
                btnStartX: this.volBtnPos
            };

            let callback = function(event) {
                self._dragCallback(event, posData);
            }

            // 拖拽时触发回调
            this.$refs.volumeController.addEventListener('mousemove', callback);
            // 松开鼠标取消事件监听
            this.$refs.volumeController.onmouseout = function() {
                self.$refs.volumeController.removeEventListener('mousemove', callback);
            };
            document.body.onmouseup = function() {
                self.$refs.volumeController.removeEventListener('mousemove', callback);
            };
        },
        _dragCallback(e, data) { // 拖拽时触发回调
            (this._throttleV2(() => {
                this.moveBtn(e, data);
                this.setVolume();
            }, 10, 15))();
        },
        moveBtn(e, data) { // 移动按钮函数
            let distanceX = e.pageX - data.mouseStartX;
            this.volBtnPos = data.btnStartX + distanceX;
            if (this.volBtnPos < 0) {
                this.volBtnPos = 0;
            }
            if (this.volBtnPos > this.maxPos) {
                this.volBtnPos = this.maxPos;
            }
        },
        // 用于函数节流，防止短时间多次调用函数
        _throttleV2(fn, delay, mustRunDelay) {
            let timer = null;
            let tStart;
            return function() {
                let context = this; // 保存当前引用
                let args = arguments;
                let tCurr = +new Date();
                clearTimeout(timer); // 清除上一次的定时器
                if (!tStart) {
                    tStart = tCurr;
                }
                if (tCurr - tStart >= mustRunDelay) {
                    fn.apply(context, args);
                    tStart = tCurr;
                } else {
                    timer = setTimeout(function() {
                        fn.apply(context, args);
                    }, delay);
                }
            };
        },
        setVolume() { // 设置音量(0-1)
            this.$refs.audio.volume = (this.volBtnPos / this.maxPos).toFixed(2);
        },
        changePos(e) { // 通过点击设置条位置
            this.volBtnPos = e.offsetX;
            this.setVolume();
        },
        stopPass() { // 阻止按钮事件向下传递,否则会触发changePos
            return;
        },
        _setMusicLength() { // 获得音乐的总时长并获得当前播放时长(以秒计)
            this.$refs.audio.addEventListener('loadedmetadata', () => { // 要在这个事件触发之后才能获得音乐的时长
                this.totalLen = this.$refs.audio.duration;
            })
            let intervalId = setInterval(() => {
                if (this.$refs.audio.ended) { // 如果播放结束,切换到下首歌
                    this.nextSong();
                    return;
                }

                this.currLen = this.$refs.audio.currentTime; // 设置当前长度
            }, 500);
        },
        getTime(seconds) { // 将秒coverImage转换为 01:13 的格式
            let m = Math.floor(seconds / 60);
            if (m < 10) {
                m = '0' + m;
            }
            let s = Math.floor(seconds % 60);
            if (s < 10) {
                s = '0' + s;
            }
            return m + ':' + s;
        },
        changeProgress(e) { // 改变进度条
            let length = e.offsetX;
            this.$refs.audio.currentTime = ((length / this.$refs.progressBar.clientWidth) * this.totalLen).toFixed(2);
            this.currLen = this.$refs.audio.currentTime;
        },
        nextSong() {
            if (this.index === this.songList.length - 1) {
                this.index = 0;
            } else {
                ++this.index;
            }
            this.coverImage();
        }
    },
    created() {
        this.coverImage(); // 预加载头图
    },
    computed: {
        controlClass() { // 播放&暂停键的样式切换
            const className = {
                play: 'fa fa-play',
                pause: 'fa fa-pause'
            };

            if (this.playState) {
                return className['pause'];
            }
            return className['play'];
        },
        volumeClass() { // 静音&开启声音的样式切换
            const className = {
                volumeOff: 'fa fa-volume-off',
                volumeOn: 'fa fa-volume-up'
            };

            if (this.volBtnPos === 0) {
                return className['volumeOff'];
            }
            return className['volumeOn'];
        },
        progress_barLength() {
            return (this.currLen / this.totalLen).toFixed(4) * 100 + '%';
        }
    },
    mounted: function() {
        this._setMusicLength();
    }
}
</script>

<style lang="scss">
$background: #FBFBFB;
$black: #696769;
$dark: #828282;
$grey: #C1C1C1;
$lightGrey: #E1E1E1;
$darkGreen: #0AAA46;
$green: #00C84B;
$white: #FFF;
.container {
    display: flex;
    width: 1000px;
    height: 250px;
    background: $background;
    .left-content {
        flex: 1;
        padding: 30px 15px;
        .title {
            font-size: 26px;
            color: $black;
            margin-bottom: 10px;
        }
        .singer {
            color: $dark;
            font-size: 20px;
        }
        .progress-wrapper {
            position: relative;
            height: 25px;
            line-height: 25px;
            margin-top: 13px;
            color: $grey;
            .volume-bar {
                position: absolute;
                top: 10px;
                left: 119px;
                display: inline-block;
                width: 113px;
                height: 3px;
                background: $grey;
                border-radius: 2px;
                cursor: pointer;
                .current-bar {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 3px;
                    background: $darkGreen;
                    border-radius: 2px;
                }
                .controller {
                    position: absolute;
                    top: 0;
                    margin-left: -7px;
                    margin-top: -6px;
                    width: 14px;
                    height: 14px;
                    background: $white;
                    border: 1px solid $lightGrey;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .controller:hover {
                    border: 1px solid $green;
                }
            }
            .left,
            .right {
                display: inline-block;
            }
            .left {
                float: left;
                display: flex;
                width: 109px;
                justify-content: space-between;
                font-size: 14px;
                .time {
                    display: inline-block;
                }
                .volume-btn {
                    width: 14px;
                    text-align: center;
                }
            }
            .right {
                float: right;
                display: flex;
                width: 157px;
                justify-content: space-between;
                font-size: 20px
            }
            .sm-icon:hover {
                color: $dark;
                cursor: pointer;
            }
            .progress_bar {
                position: absolute;
                bottom: -5px;
                width: 100%;
                height: 3px;
                border-top: 1px solid $grey;
                cursor: pointer;
                overflow: hidden;
                .current-progress {
                    position: absolute;
                    height: 3px;
                    background: $green;
                }
            }
        }
        .controller-wrapper {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            color: $black;
            font-size: 26px;
            line-height: 30px;
            .left,
            .right {
                display: flex;
                justify-content: space-between;
            }
            .left {
                width: 85px;
            }
            .right {
                width: 106px;
            }
            .bg-icon {
                cursor: pointer;
            }
        }
    }
    .right-content {
        display: flex;
        width: 280px;
        align-items: center;
        .cover {
            width: 210px;
            height: 210px;
            border-radius: 3px;
            overflow: hidden;
            margin-left: 35px;
            .img {
                width: 210px;
                height: 210px;
            }
        }
    }
}
</style>
