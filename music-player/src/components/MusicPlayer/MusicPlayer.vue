<template>
    <div class="container">
        <audio ref="audio" :src="songList[index].location"></audio>
        <div class="left-content">
            <div class="title">{{songList[index].title}}</div>
            <div class="singer">{{songList[index].singer}}</div>
            <div class="progress-wrapper">
                <div ref="bar" @click="changeVolPos" class="volume-bar">
                    <div :style="{width: volPos.btn + 'px'}" class="current-bar"></div>
                    <div ref="volumeController" @click.stop="stopPass" @mousedown.stop="drag($event, 'volPos')" :style="{left: volPos.btn + 'px'}" class="controller"></div>
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
                <div class="progress_bar-wrapper">
                    <div @click="changeProgress" ref="progressBar" class="progress_bar">
                        <div :style="{width: progressPos.btn + 'px'}" class="current-progress"></div>
                    </div>
                    <div @click.stop="stopPass" @mousedown.stop="drag($event, 'progressPos')" :style="{left: progressPos.btn + 'px'}" class="progress-btn">
                    </div>
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
            songList: [{ // 歌曲列表
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
            index: 0, // 当前播放的歌曲index
            defaultCover: 'http://s4.music.126.net/style/web2/img/default/default_album.jpg', // 默认专辑封面url
            cover: '', // 当前歌曲专辑url
            play: false, // 歌曲的播放状态
            volPos: { // 音量条的最大位置和当前位置,单位像素
                max: 113,
                btn: 113
            },
            progressPos: { // 进度条的最大位置和当前位置,单位像素
                max: 690,
                btn: 0
            },
            posData: { // 记录拖拽发生时的相关数据
                mouseStartX: '',
                btnStartX: ''
            },
            btnType: '', // 记录被拖拽的按钮类型
            totalLen: 0, // 音频总时长,秒为单位
            currLen: 0, // 当前播放位置,秒为单位
            intervalId: '' // setProgress中的intervalId
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
            this.play = !this.play; // 改变状态

            if (this.play) {
                this.$refs.audio.play();
            } else {
                this.$refs.audio.pause();
            }
        },
        drag(e, type) { // 拖动各种进度条
            e.preventDefault(); // 用于阻止在拖拽时选中文字之类

            this.posData.mouseStartX = e.pageX;
            this.posData.btnStartX = this[type].btn;
            this.btnType = type;

            this.btnDownManager(); // 按钮被按下的操作

            // 监听鼠标移动
            window.addEventListener('mousemove', this._mousemoveCallback);
            // 监听松开鼠标
            window.addEventListener('mouseup', this._mouseupCallback);
        },
        _mousemoveCallback(e) { // 移动鼠标时触发回调
            (this._throttleV2(() => {
                this.moveBtn(e);
                this.btnMoveManager();
            }, 10, 15))();
        },
        _mouseupCallback(e) { // 释放鼠标时触发回调
            window.removeEventListener('mousemove', this._mousemoveCallback);
            window.removeEventListener('mouseup', this._mouseupCallback);
            this.btnUpManager();
        },
        moveBtn(e) { // 移动按钮
            let distanceX = e.pageX - this.posData.mouseStartX;
            this[this.btnType].btn = this.posData.btnStartX + distanceX;
            if (this[this.btnType].btn < 0) {
                this[this.btnType].btn = 0;
            }
            if (this[this.btnType].btn > this[this.btnType].max) {
                this[this.btnType].btn = this[this.btnType].max;
            }
        },
        _throttleV2(fn, delay, mustRunDelay) { // 用于函数节流，防止短时间多次调用函数
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
        btnDownManager() { // 管理按钮被按下的操作
            let self = this;
            let t = {
                'volPos': function() {
                    return;
                },
                'progressPos': function() { // 按下进度条按钮时,取消播放条与歌曲进度的关联
                    clearInterval(self.intervalId);
                }
            };

            t[this.btnType]();
        },
        btnMoveManager(type) { // 管理按钮被移动的操作
            let self = this;
            let t = {
                'volPos': function() { // 移动音量按钮时,实时改变音量
                    self.setVolume();
                },
                'progressPos': function() {
                    self.currLen = ((self.progressPos.btn / self.progressPos.max) * self.totalLen).toFixed(4)
                }
            };

            t[this.btnType]();
        },
        btnUpManager(type) { // 管理按钮被释放的操作
            let self = this;
            let t = {
                'volPos': function() {
                    return;
                },
                'progressPos': function() {
                    self.$refs.audio.currentTime = ((self.progressPos.btn / self.progressPos.max) * self.$refs.audio.duration).toFixed(4); // 设置音乐位置
                    self.setProgress(); // 释放进度条按钮时,再设置播放进度
                }
            };

            t[this.btnType]();
        },
        setVolume() { // 设置音量(0-1)
            this.$refs.audio.volume = (this.volPos.btn / this.volPos.max).toFixed(2);
        },
        setProgress() { // 设置进度
            this.intervalId = setInterval(() => {
                if (this.$refs.audio.ended) { // 如果播放结束,切换到下首歌
                    this.currLen = 0; // 防止进度条溢出
                    this.nextSong();
                    return;
                }

                this.currLen = this.$refs.audio.currentTime; // 设置当前长度
                this.progressPos.btn = parseFloat(((this.currLen / this.totalLen) * this.progressPos.max).toFixed(2));
            }, 300);
        },
        changeVolPos(e) { // 点击设置音量条位置
            this.volPos.btn = e.offsetX;
            this.setVolume();
        },
        stopPass() { // 阻止按钮事件向下传递,否则会触发changePos
            return;
        },
        initMusic() { // 初始化音乐
            this.$refs.audio.addEventListener('loadedmetadata', () => { // 要在这个事件触发之后才能获得音乐的相关数据
                this.totalLen = this.$refs.audio.duration; // 设置音乐时长
                if (this.play) { // 是否播放音乐
                    this.$refs.audio.play();
                }
            });
            this.setProgress();
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
        changeProgress(e) { // 点击设置进度条位置
            let length = e.offsetX;
            this.$refs.audio.currentTime = ((length / this.$refs.progressBar.clientWidth) * this.totalLen).toFixed(2);
            this.currLen = this.$refs.audio.currentTime;
        },
        nextSong() { // 切换到下一首歌曲
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

            if (this.play) {
                return className['pause'];
            }
            return className['play'];
        },
        volumeClass() { // 静音&开启声音的样式切换
            const className = {
                volumeOff: 'fa fa-volume-off',
                volumeOn: 'fa fa-volume-up'
            };

            if (this.volPos.btn === 0) {
                return className['volumeOff'];
            }
            return className['volumeOn'];
        }
    },
    mounted: function() {
        this.initMusic(); // 初始化音乐信息
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
                    border: 1px solid $grey;
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
            .progress_bar-wrapper {
                position: absolute;
                bottom: -15px;
                width: 100%;
                .progress_bar {
                    position: relative;
                    height: 5px;
                    background: $grey;
                    border-radius: 5px;
                    cursor: pointer;
                    overflow: hidden;
                    .current-progress {
                        position: absolute;
                        height: 5px;
                        background: $green;
                    }
                }
                .progress-btn {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    background: $white;
                    border-radius: 50%;
                    border: 1px solid $grey;
                    margin-top: -11px;
                    margin-left: -8px;
                    cursor: pointer;
                }
                .progress-btn:after {
                    content: '';
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    left: 5px;
                    top: 5px;
                    background: $darkGreen;
                    border-radius: 50%;
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
