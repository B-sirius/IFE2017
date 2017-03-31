'use strict';
// 数字选择器构造器，传入的分别是选择器的初始值，最低值，最高值，精度，上按钮dom，下按钮dom，输入框dom
let Selector = function(defaultVal, min, max, precision, input, upBtn, downBtn) {
    this.val = defaultVal;
    this.min = min;
    this.max = max;
    this.precision = precision;
    this.input = input;
    this.upBtn = upBtn;
    this.downBtn = downBtn;
    this.input.self = this;
    this.input.value = this.val;
    this.upBtn.self = this;
    this.downBtn.self = this;
}

Selector.prototype.isLegal = function(newVal) { // 合法性检查
    if ((newVal / this.precision) % 1 === 0) { // 如果是整数
        if (newVal >= this.min && newVal <= this.max) {
            return true;
        }
    }
    return false;
}

Selector.prototype.setVal = function(newVal) {
    this.val = newVal;
    this.input.value = this.val;
}

Selector.prototype.enter = function(e) {
    let key = e.key;
    if (isNaN(parseFloat(key)) && key !== 'Backspace' && key !== '.') { // 如果不是数字键且不是退格且不是小数点
        return;
    }
}

Selector.prototype.afterEnter = function(callback) {
    if (this.input.value === '') {
        this.input.value = 0;
    }
    let newVal = this.input.value;
    if (!this.isLegal(newVal)) {
        this.input.value = this.val;
        return;
    }
    this.val = parseFloat(newVal);
    console.log(this.val);

    let fn = callback || function() {};
    fn();
}

Selector.prototype.up = function(callback) {
    this.val = parseFloat((this.val + this.precision).toFixed(2));
    if (this.val > this.max) {
        this.val = this.max;
    }
    this.input.value = this.val;

    let fn = callback || function() {};
    fn(this);
}

Selector.prototype.down = function(callback) {
    this.val = parseFloat((this.val - this.precision).toFixed(2));
    if (this.val < this.min) {
        this.val = this.min;
    }
    this.input.value = this.val;

    let fn = callback || function() {};
    fn(this);
}

// 数字选择器实例
let selectors = (function() {
    let t = {
        rgb: {},
        hsl: {}
    }; // 用于最后返回

    let rgbSelectorElements = document.getElementById('rgbWrapper').getElementsByClassName('selector-wrapper');

    let hslSelectorElements = document.getElementById('hslWrapper').getElementsByClassName('selector-wrapper');

    for (let selector of rgbSelectorElements) { // 初始化rgb选择器
        let type = selector.getElementsByClassName('text')[0].innerHTML;
        let input = selector.getElementsByClassName('selector')[0];
        let upBtn = selector.getElementsByClassName('up')[0];
        let downBtn = selector.getElementsByClassName('down')[0];

        t.rgb[type] = new Selector(255, 0, 255, 1, input, upBtn, downBtn);

        // 事件检测
        input.onkeydown = ((e) => {
            input.self.enter(e);
        });
        input.onkeyup = (() => {
            input.self.afterEnter();
        });
        upBtn.onclick = (() => {
            upBtn.self.up();
        });
        downBtn.onclick = (() => {
            downBtn.self.down();
        });
    }

    for (let selector of hslSelectorElements) { // 初始化hsl选择器
        let type = selector.getElementsByClassName('text')[0].innerHTML;
        let input = selector.getElementsByClassName('selector')[0];
        let upBtn = selector.getElementsByClassName('up')[0];
        let downBtn = selector.getElementsByClassName('down')[0];

        if (type === 'H') {
            t.hsl[type] = new Selector(360, 0, 360, 1, input, upBtn, downBtn);
        } else {
            t.hsl[type] = new Selector(0, 0, 1, 0.01, input, upBtn, downBtn);
        }


        // 事件检测
        input.onkeydown = ((e) => {
            input.self.enter(e);
        });
        input.onkeyup = (() => {
            input.self.afterEnter();
        });
        upBtn.onclick = (() => {
            upBtn.self.up();
        });
        downBtn.onclick = (() => {
            downBtn.self.down();
        });
    }

    return t;
})();

// 条形选择器构造器，传入的分别是颜色初始值(hsv)数组，初始位置，最大位置，颜色条和按钮的dom
let BarSelector = function(defaultColor, defaultPos, maxpos, bar, btn) {
    this.color = defaultColor;
    this.btnPos = defaultPos;
    this.maxPos = maxpos;
    this.bar = bar;
    this.bar.self = this;
    this.btn = btn;
    this.btn.self = this;
}

BarSelector.prototype.pick = function() {
    let h = parseFloat(((this.btnPos / this.maxPos) * 360).toFixed());
    let s = 1;
    let v = 1;

    this.color = [h, s, v];

    let rgbArr = hsv2rgb(h, s, v); // 获得rgb颜色

    let color = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
    this.btn.style.background = color; // 设置按钮颜色

    colorPanel.render(color); // 渲染取色板

    panelSelector.pick(); // 取色板取色
}

BarSelector.prototype.changePos = function() {
    this.btn.style.top = this.btnPos + 'px';

    this.pick();
}

// 条行选择器实例 
let barSelector = (function() {
    let defaultColor = [360, 1, 1]; // hsv

    let bar = document.getElementById('bar');
    let btn = document.getElementById('barBtn');

    bar.onclick = function(e) {
        bar.self.btnPos = e.offsetY;
        bar.self.changePos();
    }

    return new BarSelector(defaultColor, 0, 400, bar, btn);
})();

// 面板选择器构造器，传入的是按钮实例
let PanelSelector = function(defaultX, defaultY, maxX, maxY, btn, canvas) {
    this.color = [];
    this.x = defaultX;
    this.y = defaultY;
    this.maxX = maxX;
    this.maxY = maxY;
    this.btn = btn;
    this.btn.self = this;
    this.panel = panel;
    this.panel.self = this;
}

PanelSelector.prototype.pick = function() {
    let h = barSelector.color[0];
    let s = (this.x / this.maxX).toFixed(2);
    let v = (1 - this.y / this.maxY).toFixed(2);

    this.color = [h, s, v];

    let rgbArr = hsv2rgb(h, s, v);

    this.btn.style.background = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;

    selectors.rgb.R.setVal(parseFloat(rgbArr[0]));
    selectors.rgb.G.setVal(parseFloat(rgbArr[1]));
    selectors.rgb.B.setVal(parseFloat(rgbArr[2]));
}

PanelSelector.prototype.changePos = function() {
    this.btn.style.left = this.x + 'px';
    this.btn.style.top = this.y + 'px';

    this.pick();
}

let panelSelector = (function() {
    let btn = document.getElementById('panelBtn');

    let panel = document.getElementById('panel');

    panel.onclick = function(e) {
        panel.self.x = e.offsetX;
        panel.self.y = e.offsetY;

        panel.self.changePos();
    }

    return new PanelSelector(400, 0, 400, 400, btn, panel);
})();

// 鼠标点击后获得的颜色都是以hsv来计算，然后转换成rgb和hsl
let colorPanel = (function() {
    let canvas = document.getElementById('panel');
    let ctx = canvas.getContext('2d');

    let lightGradient = ctx.createLinearGradient(0, 0, 0, 400); // 亮度渲染

    lightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    lightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    return {
        render: function(color) { // 需要渲染两次
            ctx.clearRect(0, 0, 400, 400) // 清除画布

            let colorGradient = ctx.createLinearGradient(0, 0, 400, 0); // 颜色渲染

            colorGradient.addColorStop(0, 'rgb(255, 255, 255)');
            colorGradient.addColorStop(1, color);

            ctx.fillStyle = colorGradient;
            ctx.fillRect(0, 0, 400, 400);

            ctx.fillStyle = lightGradient;
            ctx.fillRect(0, 0, 400, 400);
        }
    }
})();

let init = (() => {
    barSelector.pick();
})();
