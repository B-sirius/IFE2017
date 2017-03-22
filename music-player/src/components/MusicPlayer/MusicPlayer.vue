<template>
    <div class="player-container">
        <audio ref="audio" :src="song.m4a"></audio>
        <div class="left-content">
            <span class="bg-icon prev"></span>
            <span class="bg-icon" :class="controlClass" @click="switchState"></span>
            <span @click="nextSong()" class="bg-icon next"></span>
        </div>
        <div class="center-content">
            <div class="intro">
                <span class="title">{{song.songname}}</span>
                <span class="singer">{{song.singername}}</span>
            </div>
            <div class="progress-wrapper">
                <div class="time">
                    <span class="currTime">{{getTime(currLen)}}</span>
                    <span class="totalTime"> / {{getTime(totalLen)}}</span>
                </div>
                <span class="volume-btn" :class="volumeClass"></span>
                <div ref="bar" @click="changeVolPos" class="volume-bar">
                    <div :style="{width: volPos.btn + 'px'}" class="current-bar"></div>
                    <div ref="volumeController" @click.stop="stopPass" @mousedown.stop="drag($event, 'volPos')" :style="{left: volPos.btn + 'px'}" class="controller"></div>
                </div>
                <div class="progress_bar-wrapper">
                    <div @click="changeProgress" ref="progressBar" class="progress_bar">
                        <div :style="{width: progressPos.btn + 'px'}" class="current-progress"></div>
                    </div>
                    <div @click.stop="stopPass" @mousedown.stop="drag($event, 'progressPos')" :style="{left: progressPos.btn + 'px'}" class="progress-btn">
                    </div>
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
    props: {
        song: {
            type: Object
        }
    },
    watch: {
        song: function() { // 歌曲改变时，要将清除原先的定时器
            clearInterval(this.intervalId);
        }
    },
    data() {
            return {
                defaultCover: 'http://s4.music.126.net/style/web2/img/default/default_album.jpg', // 默认专辑封面url
                cover: 'http://s4.music.126.net/style/web2/img/default/default_album.jpg', // 当前歌曲专辑url
                play: false, // 歌曲的播放状态
                volPos: { // 音量条的最大位置和当前位置,单位像素
                    max: 80,
                    btn: 80
                },
                progressPos: { // 进度条的最大位置和当前位置,单位像素
                    max: 0,
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
                img.src = this.song.albumpic_small;
                img.onload = function() {
                    _self.cover = img.src;
                };
            },
            switchState() { // 切换播放与暂停
                this.play = !this.play; // 改变状态
                this.$emit('switchState', this.play);

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
                    this.coverImage(); // 预加载头图
                    this.setProgress();
                });
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
                this.$emit('nextSong');
            }
        },
        computed: {
            controlClass() { // 播放&暂停键的样式切换
                const className = {
                    play: 'play',
                    pause: 'pause'
                };

                if (this.play) {
                    return className['pause'];
                }
                return className['play'];
            },
            volumeClass() { // 静音&开启声音的样式切换
                const className = {
                    volumeOff: 'volume-off',
                    volumeOn: 'volume-on'
                };

                if (this.volPos.btn === 0) {
                    return className['volumeOff'];
                }
                return className['volumeOn'];
            }
        },
        mounted: function() {
            this.initMusic(); // 初始化音乐信息
            this.progressPos.max = this.$refs.progressBar.clientWidth;
        }
}
</script>
<style lang="scss">
$textColor: rgba(225, 225, 225, .8);
$progressColor: rgba(225, 225, 225, .2);
$currentProgressColor: rgba(225, 225, 225, .7);
$volumeColor: rgba(225, 225, 225, .1);
$currentVolumeColor: rgba(225, 225, 225, .7);
$btnColor: rgba(225, 225, 225, .9);
$icon: 'https://y.gtimg.cn/mediastyle/yqq/img/player.png?max_age=2592000&v=749f8d7b865b29877500567512879e12';
.player-container {
    width: 1100px;
    height: 115px;
    .left-content {
        display: inline-block;
        text-align: center;
        vertical-align: top;
        width: 200px;
        height: 100%;
        line-height: 115px;
        font-size: 0;
        .bg-icon {
            vertical-align: middle;
            display: inline-block;
            opacity: 0.8;
            cursor: pointer;
            background-image: url($icon);
        }
        .bg-icon:hover {
            opacity: 1
        }
        .bg-icon.prev {
            width: 19px;
            height: 20px;
            margin-right: 65px;
            background-position: 0 -30px;
        }
        .bg-icon.play {
            width: 21px;
            height: 29px;
            margin-right: 60px;
            background-position: 0 0;
        }
        .bg-icon.pause {
            width: 21px;
            height: 29px;
            margin-right: 60px;
            background-position: -30px 0;
        }
        .bg-icon.next {
            width: 19px;
            height: 20px;
            background-position: 0 -52px;
        }
    }
    .center-content {
        display: inline-block;
        vertical-align: top;
        width: 720px;
        height: 100%;
        margin-left: 50px;
        .intro {
            margin-top: 20px;
            font-size: 20px;
            .title {
                color: $textColor;
            }
            .singer {
                margin-left: 10px;
                color: $textColor;
                font-size: 20px;
            }
        }
        .progress-wrapper {
            position: relative;
            height: 25px;
            line-height: 25px;
            margin-top: 13px;
            color: $textColor;
            .time {
                display: inline-block;
                vertical-align: top;
            }
            .volume-btn {
                display: inline-block;
                width: 26px;
                height: 21px;
                margin-top: 1px;
                margin-left: 16px;
                background: url($icon);
                opacity: 0.8;
            }
            .volume-on {
                background-position: 0 -144px;
            }
            .volume-off {
                background-position: 0 -182px;
            }
            .volume-btn:hover {
                opacity: 1;
            }
            .volume-bar {
                position: absolute;
                display: inline-block;
                margin-top: 10px;
                margin-left: 10px;
                width: 80px;
                height: 2px;
                background: $volumeColor;
                cursor: pointer;
                .current-bar {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 2px;
                    background: $currentVolumeColor;
                }
                .controller {
                    position: absolute;
                    top: 0;
                    margin-left: -5px;
                    margin-top: -4px;
                    width: 10px;
                    height: 10px;
                    background: $btnColor;
                    border-radius: 50%;
                    cursor: pointer;
                }
            }
            .progress_bar-wrapper {
                position: absolute;
                bottom: -15px;
                width: 100%;
                .progress_bar {
                    position: relative;
                    height: 2px;
                    background: $progressColor;
                    cursor: pointer;
                    overflow: hidden;
                    .current-progress {
                        position: absolute;
                        height: 2px;
                        background: $currentProgressColor;
                    }
                }
                .progress-btn {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: $btnColor;
                    border-radius: 50%;
                    margin-top: -6px;
                    margin-left: -5px;
                    cursor: pointer;
                }
            }
        }
    }
    .right-content {
        display: inline-block;
        width: 90px;
        margin-left: 30px;
        line-height: 115px;
        .cover {
            display: inline-block;
            vertical-align: middle;
            width: 90px;
            height: 90px;
            overflow: hidden;
            .img {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
