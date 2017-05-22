'use strict';

var openImg = (function() {
    var imgInput = document.getElementById('imgInput');

    imgInput.onchange = function() {
        openImg.call(this);
    };

    return function() {
        var fileList = this.files;

        var imgNode = document.createElement('img');
        imgNode.src = window.URL.createObjectURL(fileList[0]);

        imgNode.onload = function() {
            console.log(Canvas);
            Canvas.drawImage(this, 0, 0);
        }
    }
})();

var Canvas = (function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var drawImage = function(img, dx, dy) {
        ctx.drawImage(img, dx, dy);
    }

    return {
        drawImage: drawImage
    };
})();