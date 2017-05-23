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
            Canvas.setImage(this);
            Canvas.drawImage(0, 0);
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

    var canvasImg,
        offsetX = 0,
        offsetY = 0; // 保存当前的画布状态

    var startX, startY; // 保存拖动画布时的起始位置

    // 屏蔽右键菜单
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    canvas.addEventListener('mousedown', function(e) {
        // 只监听右键
        if (e.button === 2) {
            startX = e.offsetX,
            startY = e.offsetY;

            canvas.addEventListener('mousemove', mouseMove);
            document.body.addEventListener('mouseup', rightMouseUp);
        }
    }, false);

    var mouseMove = function(e) {
        var throttleMoveCanvas = throttle(mediator.moveCanvas, 16);
        throttleMoveCanvas(e, startX, startY);
    }

    var rightMouseUp = function(e) {
        if (e.button === 2) {
            offsetX += e.offsetX - startX;
            offsetY += e.offsetY - startY;

            canvas.removeEventListener('mousemove', mouseMove);
        }
    }

    var setImage = function(img) {
        canvasImg = img;
    }

    var drawImage = function(dx, dy) {
        _clearCanvas();
        ctx.drawImage(canvasImg, offsetX + dx, offsetY + dy);
    }

    var scale = function(dx, dy) {
        _clearCanvas();
        ctx.scale(dx, dy);
        ctx.drawImage(canvasImg, offsetX, offsetY);
    }

    var getCanvas = function() {
        return canvas;
    }

    var _clearCanvas = function() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return {
        setImage: setImage,
        drawImage: drawImage,
        scale: scale,
        getCanvas: getCanvas
    };
})();

// 节流函数工厂
var throttle = function(fn, delay) {
    var timer = null;
    return function() {
        if (timer) {
            return false;
        }
        var self = this;
        var args = arguments;

        timer = setTimeout(function() {
            clearTimeout(timer);
            timer = null;

            fn.apply(self, args);
        }, delay);
    }
}

// 中介者
var mediator = (function() {
    var moveCanvas = function() {
        var args = [].slice.apply(arguments);

        var e = args.shift();

        var startX = args[0],
            startY = args[1];

        var dx = e.offsetX - startX,
            dy = e.offsetY - startY;

        Canvas.drawImage(dx, dy);
    }

    return {
        moveCanvas: moveCanvas
    }
})();
