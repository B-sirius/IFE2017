'use strict';
// 选择器构造器，传入的分别是选择器的初始值，最低值，最高值，精度，上按钮dom，下按钮dom，输入框dom
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

// 选择器实例
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

let panelCanvas = document.getElementById('panel');
let panelCtx = panelCanvas.getContext('2d');

let panelGradient = panelCtx.createLinearGradient(0, 0, 400, 400);

panelGradient.addColorStop(0, 'hsl(120, 100%, 100%)');
panelGradient.addColorStop(0.5, 'hsl(120, 100%, 50%)');
panelGradient.addColorStop(1, 'hsl(120, 100%, 0%)');

panelCtx.fillStyle = panelGradient;
panelCtx.fillRect(0, 0, 400, 400);
