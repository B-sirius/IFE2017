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

        Mask.show();
        Mask.setText('加载中...');

        imgNode.onload = function() {
            Mask.hide();
            Thumbnail.setImg(imgNode.src);
            Thumbnail.setSelected();
            Canvas.drawImage(this, 0, 0);
        }
    }
})();

var Mask = (function() {
    var mask = document.getElementById('mask');
    var maskText = mask.getElementsByClassName('mask-text')[0];

    var hide = function() {
        mask.classList.add('hide');
    }

    var show = function() {
        mask.classList.remove('hide');
    }

    var setText = function(text) {
        maskText.textContent = text;
    }

    return {
        hide: hide,
        show: show,
        setText: setText
    }
})();

var Thumbnail = (function() {
    var thumbnailImg = document.getElementById('thumbnail');
    var selectedBox = document.getElementById('selected');

    var setImg = function(src) {
        thumbnailImg.src = src;
    };

    var setSelected = function() {
        var BenchmarkWidth = thumbnail.offsetWidth;
        var naturalWidth = thumbnail.naturalWidth;
        var canvas = Canvas.getCanvas();

        var selectedBoxWidth = (BenchmarkWidth / naturalWidth * canvas.width).toFixed(2);
        var selectedBoxHeight = (BenchmarkWidth / naturalWidth * canvas.height).toFixed(2);

        selectedBox.style.width = selectedBoxWidth + 'px';
        selectedBox.style.height = selectedBoxHeight + 'px';
    };

    return {
        setImg: setImg,
        setSelected: setSelected
    };
})();

var Canvas = (function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var canvasImg, offsetX, offSetY;

    var drawImage = function(img, dx, dy) {
        canvasImg = img;
        offsetX = dx;
        offSetY = dy;

        _clearCanvas();
        ctx.drawImage(img, dx, dy);
    }

    var scale = function(dx, dy) {
        _clearCanvas();
        ctx.scale(dx, dy);
        ctx.drawImage(canvasImg, offsetX, offSetY);
    }

    var getCanvas = function() {
        return canvas;
    }

    var _clearCanvas = function() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return {
        drawImage: drawImage,
        scale: scale,
        getCanvas: getCanvas
    };
})();

var Controller = (function() {
    
})();