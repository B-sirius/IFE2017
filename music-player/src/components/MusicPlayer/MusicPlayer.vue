<template>
    <div class="container">
        <div class="left-content">
            <div class="title">{{songData.title}}</div>
            <div class="singer">{{songData.singer}}</div>
            <div class="progress_bar-wrapper">
                <div ref="bar" @click="changePos" class="volume-bar">
                    <div :style="{width: volBtnPos + 'px'}" class="current-bar"></div>
                    <div ref="controller" @click.stop="stopPass" @mousedown.stop="dragController" :style="{left: volBtnPos + 'px'}" class="controller"></div>
                </div>
                <div class="left">
                    <span class="time">2:23</span>
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
                <div class="progress_bar">
                    <audio autoplay ref="audio" :src="songData.location"></audio>
                </div>
            </div>
            <div class="controller-wrapper">
                <div class="left">
                    <span class="bg-icon"><i class="fa fa-heart" aria-hidden="true"></i></span>
                    <span class="bg-icon"><i class="fa fa-trash-o" aria-hidden="true"></i></span>
                </div>
                <div class="right">
                    <span class="bg-icon" @click="switchState"><i :class="controlClass" aria-hidden="true"></i></span>
                    <span class="bg-icon"><i class="fa fa-step-forward" aria-hidden="true"></i></span>
                </div>
            </div>
        </div>
        <div class="right-content">
            <div class="cover">
                <img class="img" :src="defaultCover">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            songData: {
                'album': 'WHITE ALBUM2 ORIGINAL SOUNDTRACK～kazusa～',
                'album_pic': 'http://img.xiami.net/images/album/img24/176/58b3d5fc6e425_8832024_1488180732_2.jpg',
                'singer': '生天目仁美',
                'album_pic_m': 'http://img.xiami.net/images/album/img24/176/58b3d5fc6e425_8832024_1488180732_1.jpg',
                'lyric': '',
                'location': 'http://om5.alicdn.com/826/75826/2102674458/1795430948_1483092419161.mp3?auth_key=f8d5c0d6594170569545ab09b865dab7-1489892400-0-null',
                'title': 'WHITE ALBUM',
                'album_pic_l': 'http://img.xiami.net/images/album/img24/176/58b3d5fc6e425_8832024_1488180732.jpg'
            },
            defaultCover: 'http://s4.music.126.net/style/web2/img/default/default_album.jpg',
            playState: true,
            maxPos: 113,
            volBtnPos: 113
        };
    },
    methods: {
        _coverImage() { // 专辑封面预加载
            let _self = this;
            let img = new Image();
            img.src = this.songData.album_pic;
            img.onload = function() {
                _self.defaultCover = img.src;
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
            this.$refs.controller.addEventListener('mousemove', callback);
            // 松开鼠标取消事件监听
            document.body.onmouseup = function() {
                self.$refs.controller.removeEventListener('mousemove', callback);
            }
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
        setVolume() {
            this.$refs.audio.volume = (this.volBtnPos / this.maxPos).toFixed(2);
        },
        changePos(e) { // 通过点击设置条位置
            this.volBtnPos = e.offsetX;
            this.setVolume();
        },
        stopPass() { // 阻止按钮事件向下传递,否则会触发changePos
            return;
        }
    },
    created() {
        this._coverImage(); // 预加载头图
    },
    computed: {
        controlClass() {
            const className = {
                play: 'fa fa-play',
                pause: 'fa fa-pause'
            };

            if (this.playState) {
                return className['pause'];
            }
            return className['play'];
        },
        volumeClass() {
            const className = {
                volumeOff: 'fa fa-volume-off',
                volumeOn: 'fa fa-volume-up'
            };

            if (this.volBtnPos === 0) {
                return className['volumeOff'];
            }
            return className['volumeOn'];
        }
    }
}
</script>

<style lang="scss">
$background: #FBFBFB;
$black: #696769;
$dark: #828282;
$grey: #C1C1C1;
$lightGrey: #E1E1E1;
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
        .progress_bar-wrapper {
            position: relative;
            height: 25px;
            line-height: 25px;
            margin-top: 13px;
            color: $grey;
            .volume-bar {
                position: absolute;
                top: 10px;
                left: 79px;
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
                    background: $green;
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
                width: 64px;
                justify-content: space-between;
                font-size: 14px;
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
                bottom: -3px;
                width: 100%;
                height: 1px;
                background: $grey;
            }
            .progress_bar:after {
                content: '';
                position: absolute;
                width: 50%;
                height: 1px;
                background: $green;
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
        width: 340px;
        align-items: center;
        .cover {
            width: 240px;
            height: 240px;
            border-radius: 50%;
            overflow: hidden;
            margin-left: 25px;
            .img {
                width: 240px;
                height: 240px;
            }
        }
    }
}
</style>
