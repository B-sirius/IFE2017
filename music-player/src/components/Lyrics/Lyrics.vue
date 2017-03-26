<template>
    <div class="lyrics-container">
        <div class="cover">
            <img class="img" :src="cover">
        </div>
        thats good
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
            urlDetail: 'https://route.showapi.com/213-2?showapi_appid=26601&showapi_sign=adc05e2062a5402b81c563a3ced09208&musicid=' // 歌曲id搜索
        }
    },
    methods: {
        renderLyrics() {
            this.coverImage();
            this.$http.get(this.urlDetail + this.song.songid).then((response) => {
                console.log(response);
            });
        },
        coverImage() { // 专辑封面预加载
            let self = this;
            this.cover = this.defaultCover;
            let img = new Image();
            console.log(this.song);
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
    font-size: 14px;
    color: $textColor;
    text-align: center;
    .cover {
        img {
            width: 186px;
            height: 186px;
        }
    }
}
</style>
