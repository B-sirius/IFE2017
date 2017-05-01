'use strict';

const DURATION_INITIAL = 1000, // 默认动画执行时间
    EASING_INITIAL = Math.tween.Quad.easeInOut, // 默认缓动效果
    FrameTime = 17, // 每一帧的时间，单位ms
    STATE_INITIAL = 0,
    STATE_START = 1,
    STATE_STOP = 2;

/**
 * 动画类
 * @param  {dom} el       进行动画的dom对象
 */
let Rush = function(el) {
    this.el = el;
    this.state = STATE_INITIAL; // 动画状态
    this.taskQuque = []; // 任务队列
    this.index = 0; // 任务标识
}

/**
 * 添加动画任务
 * @param  {object} props     css属性键值对对象，不需要单位，只支持px，且不支持 margin: 10px 20px 30px 40px 这样的属性缩写，是的就是这么辣鸡
 * @param  {number} duration  动画持续时间，单位ms
 * @param {object} options 定制选项，支持的参数：
 * {
 *     before: function() {} // 此动画任务开始前触发的函数（如果有delay，在delay结束后才触发）
 *     after: function() {} // 此动画任务结束后立即触发的函数
 *     delay: 200 // 此动画任务开始前的延时
 *     easing: Math.tween.Quad.easeInOut 缓动函数
 * }
 */
Rush.prototype.add = function(props, duration, options) {
    let task = {
        props: props,
        duration: duration,
        startTime: null, // 动画开始的绝对时间
        currTime: null, // 动画进行到的绝对时间
        lastTime: 0, // 动画持续到的时间
        options: options || {},
        rushId: null, // 记录requestAnimationFrame
        timeoutId: null // 记录setTimeout
    }
    this.taskQuque.push(task);

    return this; // 链式调用
}

/**
 * 开始执行动画队列
 */
Rush.prototype.start = function() {
    if (this.state === STATE_START) {
        return;
    }
    if (!this.taskQuque.length) {
        return;
    }
    this.state = STATE_START;

    this._runTask();
}

/**
 * 设置执行动画队列次数
 * @param {number} n 重复执行的次数，如果不传入则不断重复
 */
Rush.prototype.setLoop = function(n) {
    // 传入参数
    if (n) {
        if ((n | 0) === n && n > 0) {
            this.loop = n;
        } else {
            throw new Error('循环次数必须是大于等于0的整数!');
        }
        // 不传入参数
    } else {
        this.loop = -1;
    }


    return this;
}

/**
 * 设置无限循环动画队列，一个更友好的接口
 */
Rush.prototype.setLoopForever = function(n) {
    this.setLoop();
    return this;
}

/**
 * 暂停动画
 */
Rush.prototype.pause = function() {
    if (this.state !== STATE_START) {
        return;
    }
    this.state = STATE_STOP;
    let task = this.taskQuque[this.index];

    if (task.rushId !== null) {
        cancelAnimationFrame(task.rushId);
        task.rushId = null;
    }
    if (task.timeoutId !== null) {
        clearTimeout(task.timeoutId);
        task.timeoutId = null;
    }

    return this;
}

/**
 * 继续动画
 */
Rush.prototype.play = function() {
    if (this.state !== STATE_STOP) {
        return;
    }
    this.state = STATE_START;
    let task = this.taskQuque[this.index];

    if (task.rushId === null) {
        this._renderFrame(task);
    }
    return this;
}

/**
 * 执行单个动画任务
 */
Rush.prototype._runTask = function() {
    let task = this.taskQuque[this.index];

    // 无任务，则动画执行完毕
    if (task === undefined) {
        this._done();
        return;
    }

    this._handleProps(task);

    let self = this;
    // 是否需要延迟
    task.options.delay ? task.timeoutId = setTimeout(function() {
        // 有before回调函数则执行
        if (task.options.before) {
            task.options.before();
        }
        self._renderFrame(task);
    }, task.options.delay) : (() => {
        if (task.options.before) {
            task.options.before();
        }
        this._renderFrame(task);
    })();
}

/**
 * 对porps属性值处理，获得渲染时所需的数据
 */
Rush.prototype._handleProps = (function() {
    // transform 的属性需要特别处理
    const transformProperties = ["translateX", "translateY", "translateZ", "scale", "scaleX", "scaleY", "scaleZ", "skewX", "skewY", "rotateX", "rotateY", "rotateZ"];

    // color 的属性需要特别处理
    const colorProperties = ["color", "background-color", "border-color", "outline-color"];

    let propertyHandler = {};

    // 普通属性的处理方法
    propertyHandler['default'] = function(task, key) {
        let el = this.el;

        let begin; // 初始属性值和单位
        let end = propertyValueHandler(key, task.props[key]); // 末属性数值和单位

        let realPropertyName = key; // 真正的属性名
        let styleLogic = 'default';

        let beginValue = getComputedStyle(el, null).getPropertyValue(realPropertyName); // 获得初始属性值(带单位)

        begin = propertyValueHandler(key, beginValue); // 获得属性数值和单位

        realPropertyName = transferStyleName(realPropertyName); // 将连字符格式转换为驼峰式

        // 为task新增属性
        task.newProps[key] = {
            begin,
            end,
            realPropertyName,
            styleLogic
        }
    }

    // transform属性的处理方法
    for (let propertyName of transformProperties) {
        propertyHandler[propertyName] = function(task, key) {
            let el = this.el;

            let begin; // 初始属性值和单位
            let end = propertyValueHandler(key, task.props[key]); // 末属性数值和单位

            let realPropertyName = 'transform';
            let styleLogic = 'transform';

            let beginValue; // 初始属性值（带单位）

            // 如果已经缓存了transform属性
            if (el.transformCache) {
                if (el.transformCache[key]) {
                    beginValue = el.transformCache[key].value;
                } else {
                    beginValue = 0;
                    el.transformCache[key] = {
                        value: beginValue,
                        unitType: end.unitType
                    };
                }
            } else {
                // 只有在元素没有在style中定义任何transform属性时才会调用
                beginValue = 0;

                // 给这个元素添加transfromCache属性，用于保存transfrom的各个属性
                // 因为如果style中的transform被设置了多个值，读取到的将是"rotate(30deg) translateX(10px)"这样的值，将无法处理
                el.transformCache = {};
                el.transformCache[key] = {
                    value: beginValue,
                    unitType: end.unitType
                };
            }

            begin = propertyValueHandler(key, beginValue); // 获得属性数值和单位

            // 为task新增属性
            task.newProps[key] = {
                begin,
                end,
                realPropertyName,
                styleLogic
            }
        }
    }

    // color属性的处理方法，统一转换为rgba来处理
    for (let propertyName of colorProperties) {
        propertyHandler[propertyName] = function(task, key) {
            let el = this.el;

            let begin;
            let end = normalize2rgba(task.props[key]);

            let realPropertyName = key;

            let beginValue = getComputedStyle(el, null).getPropertyValue(realPropertyName); // e.g. rgba(255, 255, 255, 1);
            begin = normalize2rgba(beginValue); // 返回的是转换后的rgba对象

            let styleLogic = 'rgba';

            realPropertyName = transferStyleName(realPropertyName); // 将连字符格式转换为驼峰式


            task.newProps[key] = {
                begin,
                end,
                realPropertyName,
                styleLogic
            }
        }
    }

    return function(task) {
        let el = this.el;

        task.newProps = {}; // 保存渲染动画时所需的数据

        for (let key in task.props) {
            if (propertyHandler[key]) { // 特殊属性
                propertyHandler[key].call(this, task, key);
            } else { // 普通属性
                propertyHandler['default'].call(this, task, key);
            }
        }
    }
})();

Rush.prototype.styleHandler = (function() {
    let t = {
        'transform': function(task, key, newValue) {
            this.el.transformCache[key].value = newValue; // 更新缓存值

            let propertyValue = '',
                propertyName = task.newProps[key].realPropertyName;

            // e.g transform: rotateZ(100deg) translateX(50px)
            for (let key in this.el.transformCache) {
                let name = key, // e.g rotateZ
                    val = this.el.transformCache[key].value, // e.g 100
                    unitType = this.el.transformCache[key].unitType; // e.g deg

                propertyValue += `${name}(${val}${unitType})`; // e.g rotate(100deg)
            }

            this.el.style[propertyName] = propertyValue;
        },

        'rgba': function(task, key, newArr) {
            let text = 'rgba(';

            for (let i = 0; i < newArr.length - 1; i++) {
                text += (newArr[i]).toFixed() + ', ';
            }
            text += newArr[newArr.length - 1].toFixed(2) + ')';

            this.el.style[task.newProps[key].realPropertyName] = text;
        },

        'default': function(task, key, newValue) {
            this.el.style[task.newProps[key].realPropertyName] = `${newValue}${task.newProps[key].end.unitType}`;
        }
    };

    return function(task, key, newValue) {
        let styleLogic = task.newProps[key].styleLogic;

        t[styleLogic].call(this, task, key, newValue);
    };
})();

/**
 * 具体渲染过程
 * @param  {object} task 任务对象
 */
Rush.prototype._renderFrame = function(task) {
    task.startTime = (new Date()).getTime(); // 开始任务的时间

    let self = this;

    let duration = task.duration;

    task.rushId = function() {
        if (self.state !== STATE_START) {
            return;
        }
        task.currTime = (new Date()).getTime(); // 记录当前运行时间
        task.lastTime = (task.currTime - task.startTime);

        let easing = task.options.easing ? task.options.easing : EASING_INITIAL; // 设置缓动函数

        for (let key in task.newProps) {
            if (typeof task.newProps[key].begin.num !== 'number') {
                let beginArr = task.newProps[key].begin.num;
                let endArr = task.newProps[key].end.num;

                let newArr = [];
                for (let i = 0; i < beginArr.length; i++) {
                    let beginValue = beginArr[i],
                        changeValue = endArr[i] - beginValue,
                        newValue = easing(task.lastTime, beginValue, changeValue, duration); // 根据缓动函数计算新的位置
                    newArr.push(newValue);
                };

                self.styleHandler(task, key, newArr);
            } else {
                let beginValue = task.newProps[key].begin.num, // 初始位置
                    changeValue = task.newProps[key].end.num - beginValue; // 位置改变量

                let newValue = easing(task.lastTime, beginValue, changeValue, duration); // 根据缓动函数计算新的位置

                // 更新style
                self.styleHandler(task, key, newValue);
            }
        }

        if (task.lastTime >= task.duration) {
            // 直接定位到末状态
            for (let key in task.newProps) {
                self.styleHandler(task, key, task.newProps[key].end.num);
            }

            // 有after回调函数则执行
            if (task.options.after) {
                task.options.after();
            }

            // 执行下一个任务
            self._next();
        } else {
            requestAnimationFrame(task.rushId);
        }
    };

    requestAnimationFrame(task.rushId);
}

/**
 * 切换到下一个任务
 */
Rush.prototype._next = function() {
    ++this.index;
    this._runTask();
}

/**
 * 对动画队列进行复位，还原到用add方法添加完任务但还没有用start执行的状态
 */
Rush.prototype._reset = function() {
    this.state = STATE_INITIAL;
    this.index = 0;

    for (let i = 0, task; task = this.taskQuque[i++];) {
        task.startTime = null;
        task.currTime = null;
        task.lastTime = 0;
        task.rushId = null;
        task.timeoutId = null;
    }
}

/**
 * 动画队列结束
 */
Rush.prototype._done = function() {
    this._reset();

    while (this.loop === -1) {
        this.start();
        return this;
    }

    if (this.loop && --this.loop) {
        this.start();
    }

    return this;
}

/**
 * 将连字符的style名转换为驼峰格式
 * @param {string} style 连字符形式的属性名
 * e.g max-width
 */
let transferStyleName = function(style) {
    if (typeof style !== 'string') {
        throw new Error(`属性${style}不是字符串`);
    }

    let arr = style.split('-');
    if (arr.length > 1) {
        let newStyle = arr[0];
        for (let i = 1, name = arr[i]; arr[i++];) {
            name = name.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase()); // 首字母大写
            newStyle += name;
        }

        return newStyle;
    } else {
        return style;
    }
}

/**
 * 对不同的属性进行处理
 */
let propertyValueHandler = (function() {
    /**
     * 获得属性值的数值
     * @param  {[type]} propertyName  传入的参数 e.g rotateZ
     * @param  {[type]} propertyValue 传入的属性值 e.g 100deg
     * @param  {[type]} valueObject   属性值对象 e.g {num: 100, unitType: deg}
     */
    let _getValueNum = function(propertyName, propertyValue, valueObject) {
        valueObject.num = propertyValue.toString().replace(/[%A-z]+$/, function(match) {
            valueObject.unitType = match; // match即是匹配到的结果

            return ''; // 匹配到的结果将被替换的值
        });

        valueObject.num = parseFloat(valueObject.num);


    }

    /**
     * 依据属性名称来确定属性值单位，允许不写单位进行默认设置
     * @param  {[type]} propertyName 属性名
     * @param  {[type]} valueObject  属性值对象
     */
    let _getUnitType = function(propertyName, valueObject) {
        if (/^(rotate|skew)/i.test(propertyName)) {
            valueObject.unitType = 'deg'; // 单位是deg的属性
        } else if (/(^(scale|scaleX|scaleY|scaleZ|opacity|alpha|fillOpacity|flexGrow|flexHeight|zIndex|fontWeight)$)/i.test(propertyName)) {
            valueObject.unitType = ''; // 无单位属性
        } else {
            valueObject.unitType = 'px'; // 默认就用px
        }
    }

    return function(propertyName, propertyValue) {
        let valueObject = {
            num: 0,
            unitType: ''
        }

        _getValueNum(propertyName, propertyValue, valueObject);

        // 如果没有获取到单位，可能无单位，也可能是省略了单位
        if (valueObject.unitType === '') {
            _getUnitType(propertyName, valueObject);
        }

        return valueObject;
    }
})();

/**
 * 将各种颜色值都转换成rgba，暂不考虑十六进制色
 * @param {string} color 颜色字符串 e.g. rgb(1, 2, 3)
 */
let normalize2rgba = (function() {

    let colorHandler = {
        'rgb': function(color) {
            let result = /rgb\(([0-9]+), ?([0-9]+), ?([0-9]+)\)/.exec(color);

            let valueArr = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), 1];

            return {
                type: 'rgba',
                num: valueArr
            };
        },

        'hsl': function(color) {

        },

        'rgba': function(color) {
            let result = /rgba\(([0-9]+), ?([0-9]+), ?([0-9]+), ?(0\.[0-9]+)\)/.exec(color);

            let valueArr = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4])];

            return {
                type: 'rgba',
                num: valueArr
            };
        }
    }

    return function(color) {
        let colorType = /([a-z])+/.exec(color)[0];

        if (colorHandler[colorType]) {
            return colorHandler[colorType](color);
        } else {
            throw new Error(color + '不是支持的颜色类型！');
        }
    }
})();

//======================测试========================
let block1 = document.getElementById('test1');

let rushBlock1 = new Rush(block1).add({
    'width': 600,
    'translateX': 200,
    'background-color': 'rgb(181, 79, 232)'
}, 1000).add({
    'rotateZ': 240
}, 800).add({
    'width': 150,
    'rotateZ': 0,
    'translateX': 0,
    'background-color': 'rgb(255, 150, 69)'
}, 500);

rushBlock1.setLoopForever();
rushBlock1.start();

let stopBtn = document.getElementById('stop');

stopBtn.onclick = function() {
    rushBlock1.pause();
}

let moveBtn = document.getElementById('move');

moveBtn.onclick = function() {
    rushBlock1.play();
}
