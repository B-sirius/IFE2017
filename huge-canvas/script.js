'use strict';

var zoomLevel = 1;

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
            Thumbnail.reset();
            Thumbnail.setImg(imgNode.src);
            Thumbnail.setSelected();
            Canvas.reset();
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

    var ratio;
    var offsetX = 0,
        offsetY = 0;

    var setImg = function(src) {
        thumbnailImg.src = src;
    };

    var setSelected = function() {
        var BenchmarkWidth = thumbnail.offsetWidth;
        var naturalWidth = thumbnail.naturalWidth;
        var canvas = Canvas.getCanvas();

        ratio = BenchmarkWidth / naturalWidth;

        var selectedBoxWidth = (ratio * canvas.width / zoomLevel).toFixed(2);
        var selectedBoxHeight = (ratio * canvas.height / zoomLevel).toFixed(2);

        selectedBox.style.width = selectedBoxWidth + 'px';
        selectedBox.style.height = selectedBoxHeight + 'px';

        setPos(0, 0);
    };

    var setPos = function(dx, dy) {
        var disX = dx || 0;
        var disY = dy || 0;

        var x = limit(-disX * ratio + offsetX, 0, thumbnailImg.offsetWidth - selectedBox.offsetWidth);
        var y = limit(-disY * ratio + offsetY, 0, thumbnailImg.offsetHeight - selectedBox.offsetHeight);

        selectedBox.style.left = x + 'px';
        selectedBox.style.top = y + 'px';
    }

    var setOffset = function(dx, dy) {
        offsetX += -dx * ratio;
        offsetY += -dy * ratio;

        offsetX = limit(offsetX, 0, thumbnailImg.offsetWidth - selectedBox.offsetWidth);
        offsetY = limit(offsetY, 0, thumbnailImg.offsetHeight - selectedBox.offsetHeight);
    }

    var reset = function() {
        offsetX = 0;
        offsetY = 0;
    }

    return {
        setImg: setImg,
        setSelected: setSelected,
        setPos: setPos,
        setOffset: setOffset,
        reset: reset
    };
})();

var Canvas = (function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var canvasImg,
        offsetX = 0,
        offsetY = 0;

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
            document.body.addEventListener('mouseup', mouseUp);
        }
    }, false);

    var mouseMove = function(e) {
        var throttleMoveCanvas = throttle(mediator.moveCanvas, 16);
        throttleMoveCanvas(e, startX, startY);
    }

    var mouseUp = function(e) {
        if (e.button === 2) {
            mediator.setOffset(e, startX, startY);

            canvas.removeEventListener('mousemove', mouseMove);
        }
    }

    var setOffset = function(dx, dy) {
        offsetX += dx;
        offsetY += dy;

        offsetX = -limit(-offsetX * zoomLevel, 0, canvasImg.naturalWidth * zoomLevel - canvas.width) / zoomLevel;
        offsetY = -limit(-offsetY * zoomLevel, 0, canvasImg.naturalHeight * zoomLevel - canvas.height) / zoomLevel;
    }

    var setImage = function(img) {
        canvasImg = img;
    }

    var drawImage = function(dx, dy) {
        _clearCanvas();

        var disX = dx || 0;
        var disY = dy || 0;

        var x, y;

        x = -limit(-(offsetX + disX) * zoomLevel, 0, canvasImg.naturalWidth * zoomLevel - canvas.width) / zoomLevel;
        y = -limit(-(offsetY + disY) * zoomLevel, 0, canvasImg.naturalHeight * zoomLevel - canvas.height) / zoomLevel;

        console.log(-(offsetX + disX), canvasImg.naturalWidth * zoomLevel - canvas.width);

        ctx.drawImage(canvasImg, x, y);
    }

    var getCanvas = function() {
        return canvas;
    }

    var reset = function() {
        offsetX = 0;
        offsetY = 0;
    }

    var _clearCanvas = function() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(zoomLevel, zoomLevel);
    }

    return {
        setImage: setImage,
        drawImage: drawImage,
        getCanvas: getCanvas,
        reset: reset,
        setOffset: setOffset
    };
})();

var ZoomTool = (function() {
    var zoomInBtn = document.getElementById('zoomIn');
    var zoomOutBtn = document.getElementById('zoomOut');
    var zoomLevelVal = document.getElementById('zoomLevel');

    var zoomIn = function() {
        zoomLevel += 0.2;
        zoomLevel = zoomLevel.toFixed(1);
        zoomLevel = parseFloat(zoomLevel);
        mediator.zoom();
    }

    var zoomOut = function() {
        zoomLevel -= 0.2;
        zoomLevel = zoomLevel.toFixed(1);
        zoomLevel = parseFloat(zoomLevel);
        mediator.zoom();
    }

    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);

    var setZoomLevelVal = function(val) {
        zoomLevelVal.textContent = val;
    }

    return {
        setZoomLevelVal: setZoomLevelVal
    }
})();

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
        Thumbnail.setPos(dx, dy);
    }

    var setOffset = function() {
        var args = [].slice.apply(arguments);

        var e = args.shift();

        var startX = args[0],
            startY = args[1];

        var dx = e.offsetX - startX,
            dy = e.offsetY - startY;

        Canvas.setOffset(dx, dy);
        Thumbnail.setOffset(dx, dy);
    }

    var zoom = function() {
        ZoomTool.setZoomLevelVal(zoomLevel);
        Canvas.drawImage();
        Thumbnail.setSelected();
        Thumbnail.setPos();
    }

    return {
        moveCanvas: moveCanvas,
        setOffset: setOffset,
        zoom: zoom
    }
})();

// 节流函数工厂
var throttle = function(fn, delay) {
    var timer;
    var firstTime = true;

    return function() {
        var self = this;
        var args = arguments;

        if (firstTime) {
            fn.apply(self, arguments);
            return firstTime = false;
        }

        if (timer) {
            return false;
        }

        timer = setTimeout(function() {
            clearTimeout(timer);
            timer = null;
            fn.apply(self, args);
        }, delay || 100);
    }
}

var limit = function(val, bottom, top) {
    if (val < bottom) {
        val = bottom;
    } else if (val > top) {
        val = top;
    }

    return val;
}
