'use strict';
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

var getPosVal = function(string) {
    return parseFloat(string.split('px')[0]);
}

var zoomLevel = 1;
var ratio;

var openImg = (function() {
    var imgInput = document.getElementById('imgInput');

    var allowedType = ["image/png", "image/jpeg", "image/gif", "image/svg+xml"];

    imgInput.onchange = function() {
        openImg.call(this);
    };

    var _isImg = function(file) {
        for (var key in allowedType) {
            if (allowedType[key] === file.type) {
                return true;
            }
        }
        alert('不支持的图片格式！');
        return false;
    }

    return function() {
        var fileList = this.files;
        if (_isImg(fileList[0])) {
            var imgNode = document.createElement('img');
            imgNode.src = window.URL.createObjectURL(fileList[0]);

            Mask.show();
            Mask.setText('加载中...');

            ZoomTool.disableZoomIn();
            ZoomTool.disableZoomOut();

            imgNode.onload = function() {
                Mask.hide();
                ZoomTool.enableZoomIn();
                ZoomTool.enableZoomOut();
                Thumbnail.reset();
                Thumbnail.setImg(imgNode.src);
                Thumbnail.setSelected();
                Canvas.reset();
                Canvas.setImage(this);
                Canvas.drawImage(0, 0);
            }
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
        Thumbnail.setPos(dx * ratio, dy * ratio);
    }

    var moveSelectedBox = function() {
        var args = [].slice.apply(arguments);

        var e = args.shift();

        var startX = args[0],
            startY = args[1];

        var dx = e.pageX - startX,
            dy = e.pageY - startY;

        Canvas.drawImage(-dx / ratio, -dy / ratio);
        Thumbnail.setPos(-dx, -dy);
    }

    var setOffset = {
        'canvas': function() {
            var args = [].slice.apply(arguments);

            var e = args.shift();

            var startX = args[0],
                startY = args[1];

            var dx = e.offsetX - startX,
                dy = e.offsetY - startY;

            Canvas.setOffset(dx, dy);
            Thumbnail.setOffset();
        },

        'selectedBox': function() {
            var args = [].slice.apply(arguments);

            var e = args.shift();

            var startX = args[0],
                startY = args[1];

            var dx = e.pageX - startX,
                dy = e.pageY - startY;

            Canvas.setOffset(-dx / ratio, -dy / ratio);
            Thumbnail.setOffset();
        }
    }

    var zoom = function() {
        ZoomTool.setZoomLevelVal(zoomLevel);
        Canvas.drawImage();
        Thumbnail.setSelected();
        Thumbnail.setPos();
    }

    return {
        moveCanvas: moveCanvas,
        moveSelectedBox: moveSelectedBox,
        setOffset: setOffset,
        zoom: zoom
    }
})();

var Thumbnail = (function() {
    var thumbnailImg = document.getElementById('thumbnail');
    var selectedBox = document.getElementById('selected');

    var offsetX = 0,
        offsetY = 0;

    var startX, startY;

    selectedBox.addEventListener('mousedown', function(e) {
        e.preventDefault();

        startX = e.pageX;
        startY = e.pageY;

        selectedBox.addEventListener('mousemove', dragSelectedBox);
        document.body.addEventListener('mouseup', releaseSelectedBox);
    })

    var throttleMoveSelectedBox = throttle(mediator.moveSelectedBox, 16);

    var dragSelectedBox = function(e) {
        e.preventDefault();
        throttleMoveSelectedBox(e, startX, startY);
    }

    var releaseSelectedBox = function(e) {
        document.body.removeEventListener('mouseup', releaseSelectedBox);
        mediator.setOffset['selectedBox'](e, startX, startY);
        selectedBox.removeEventListener('mousemove', dragSelectedBox);
    }

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

        var x = limit(-disX + offsetX, 0, thumbnailImg.offsetWidth - selectedBox.offsetWidth);
        var y = limit(-disY + offsetY, 0, thumbnailImg.offsetHeight - selectedBox.offsetHeight);

        selectedBox.style.left = x + 'px';
        selectedBox.style.top = y + 'px';
    }

    var setOffset = function() {
        offsetX = getPosVal(selectedBox.style.left);
        offsetY = getPosVal(selectedBox.style.top);

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
            startX = e.offsetX;
            startY = e.offsetY;

            canvas.addEventListener('mousemove', dragCanvas);
            document.body.addEventListener('mouseup', releaseCanvas);
        }
    }, false);

    var throttleDragCanvas = throttle(mediator.moveCanvas, 16);

    var dragCanvas = function(e) {
        throttleDragCanvas(e, startX, startY);
    }

    var releaseCanvas = function(e) {
        if (e.button === 2) {
            document.body.removeEventListener('mouseup', releaseCanvas);
            mediator.setOffset['canvas'](e, startX, startY);
            canvas.removeEventListener('mousemove', dragCanvas);
        }
    }

    var setOffset = function(dx, dy) {
        console.log(dx, dy);

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

    var disableZoomIn = function() {
        zoomInBtn.disabled = true;
        zoomInBtn.classList.add('disable');
    }

    var enableZoomIn = function() {
        zoomInBtn.disabled = false;
        zoomInBtn.classList.remove('disable');
    }

    var disableZoomOut = function() {
        zoomOutBtn.disabled = true;
        zoomOutBtn.classList.add('disable');
    }

    var enableZoomOut = function() {
        zoomOutBtn.disabled = false;
        zoomOutBtn.classList.remove('disable');
    }

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
        setZoomLevelVal: setZoomLevelVal,
        enableZoomIn: enableZoomIn,
        disableZoomIn: disableZoomIn,
        enableZoomOut: enableZoomOut,
        disableZoomOut: disableZoomOut
    }
})();
